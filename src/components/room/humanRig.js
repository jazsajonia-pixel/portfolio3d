import * as THREE from 'three';

// Procedural posing for a Mixamo-style skinned character.
//
// The person's behaviour is described as a small "pose" in the character's own space (pelvis point, hand and
// foot targets, spine lean/twist, head yaw/pitch). `apply` turns that into bone rotations with two-bone IK for
// the limbs, so the same behaviour code can drive any humanoid rig with these bone names.

const FINGERS = ['Index', 'Middle', 'Ring', 'Pinky'];
const SIDES = ['Left', 'Right'];

const _a = new THREE.Vector3();
const _b = new THREE.Vector3();
const _c = new THREE.Vector3();
const _d = new THREE.Vector3();
const _q = new THREE.Quaternion();
const _q2 = new THREE.Quaternion();
const _q3 = new THREE.Quaternion();
const _e = new THREE.Euler(0, 0, 0, 'YXZ');
const _m = new THREE.Matrix4();

function worldPos(object, out) {
  return out.setFromMatrixPosition(object.matrixWorld);
}

// Rotate `bone` so that the direction from it to `child` points at `target` (all world space), with the smallest
// possible rotation. Keeps the bone's twist roughly where it was.
function aim(bone, child, target) {
  const origin = worldPos(bone, _a);
  const current = worldPos(child, _b).sub(origin).normalize();
  const desired = _c.copy(target).sub(origin).normalize();
  _q.setFromUnitVectors(current, desired);
  bone.getWorldQuaternion(_q2);
  _q2.premultiply(_q);
  bone.parent.getWorldQuaternion(_q3).invert();
  bone.quaternion.copy(_q3.multiply(_q2));
  bone.updateWorldMatrix(false, true);
}

// Spin a bone around its own length (bone → child) without moving the child.
function twistAlong(bone, child, angle) {
  if (!angle) return;
  _b.subVectors(worldPos(child, _b), worldPos(bone, _a)).normalize();
  _q.setFromAxisAngle(_b, angle);
  bone.getWorldQuaternion(_q2).premultiply(_q);
  bone.parent.getWorldQuaternion(_q3).invert();
  bone.quaternion.copy(_q3.multiply(_q2));
  bone.updateWorldMatrix(false, true);
}

// Signed angle that would turn the palm normal onto `desired` around the forearm axis.
const _n = new THREE.Vector3();
const _f = new THREE.Vector3();
function palmResidual(side, fore, hand, desired) {
  const bones = hand.userData.palm;
  const axis = _a.subVectors(worldPos(hand, _a), worldPos(fore, _b)).normalize();
  const wrist = worldPos(hand, _b);
  _f.subVectors(worldPos(bones.middle, _c), wrist);
  const across = _d.subVectors(worldPos(bones.index, _d), worldPos(bones.pinky, _n));
  if (side === 'Left') _n.crossVectors(_f, across); else _n.crossVectors(across, _f);
  _n.addScaledVector(axis, -_n.dot(axis)).normalize();
  _f.copy(desired).addScaledVector(axis, -desired.dot(axis));
  if (_f.lengthSq() < 1e-6) return 0;
  _f.normalize();
  return Math.atan2(_c.crossVectors(_n, _f).dot(axis), _n.dot(_f));
}

// Apply a rotation given in the character root's frame to a bone (on top of its current pose).
function rotateInRoot(bone, rootQuat, localDelta, weight = 1) {
  _q.copy(localDelta);
  if (weight !== 1) _q.slerp(_q3.identity(), 1 - weight);
  // world delta = R * d * R^-1
  _q2.copy(rootQuat).multiply(_q).multiply(_q3.copy(rootQuat).invert());
  bone.getWorldQuaternion(_q);
  _q.premultiply(_q2);
  bone.parent.getWorldQuaternion(_q3).invert();
  bone.quaternion.copy(_q3.multiply(_q));
  bone.updateWorldMatrix(false, true);
}

// Two-bone IK in world space: returns the joint position bending toward `pole`.
function solve(root, target, l1, l2, pole, joint, end) {
  const dir = _d.subVectors(target, root);
  let distance = dir.length() || 0.0001;
  dir.divideScalar(distance);
  distance = THREE.MathUtils.clamp(distance, Math.abs(l1 - l2) + 0.01, (l1 + l2) * 0.999);
  const along = (l1 * l1 - l2 * l2 + distance * distance) / (2 * distance);
  const height = Math.sqrt(Math.max(0, l1 * l1 - along * along));
  const bend = _c.copy(pole).addScaledVector(dir, -pole.dot(dir)).normalize();
  joint.copy(root).addScaledVector(dir, along).addScaledVector(bend, height);
  end.copy(root).addScaledVector(dir, distance);
}

export function createHumanRig(root) {
  const bones = {};
  root.traverse((object) => { if (object.isBone) bones[object.name] = object; });
  const list = Object.values(bones);
  const rest = new Map(list.map((bone) => [bone, { q: bone.quaternion.clone(), p: bone.position.clone() }]));
  root.updateWorldMatrix(true, true);

  SIDES.forEach((side) => {
    bones[`${side}Hand`].userData.palm = { middle: bones[`${side}HandMiddle1`], index: bones[`${side}HandIndex1`], pinky: bones[`${side}HandPinky1`] };
  });
  const rootQuat = new THREE.Quaternion();
  const rootInv = new THREE.Matrix4();
  const toLocal = (object, out) => {
    rootInv.copy(root.matrixWorld).invert();
    return worldPos(object, out).applyMatrix4(rootInv);
  };
  const p = (name) => toLocal(bones[name], new THREE.Vector3());
  const measure = {
    upper: p('LeftArm').distanceTo(p('LeftForeArm')),
    fore: p('LeftForeArm').distanceTo(p('LeftHand')),
    thigh: p('LeftUpLeg').distanceTo(p('LeftLeg')),
    shin: p('LeftLeg').distanceTo(p('LeftFoot')),
    hipsY: p('Hips').y,
    ankleY: p('LeftFoot').y,
    shoulderY: p('LeftArm').y,
    headY: p('Head').y,
  };
  // Feet keep their rest orientation relative to the character (flat on the floor).
  root.getWorldQuaternion(rootQuat);
  const footRest = {};
  SIDES.forEach((side) => {
    const q = new THREE.Quaternion();
    bones[`${side}Foot`].getWorldQuaternion(q);
    footRest[side] = q.premultiply(rootQuat.clone().invert());
  });

  const tmp = { shoulder: new THREE.Vector3(), elbow: new THREE.Vector3(), wrist: new THREE.Vector3(), target: new THREE.Vector3(), pole: new THREE.Vector3() };

  function reset() {
    list.forEach((bone) => {
      const value = rest.get(bone);
      bone.quaternion.copy(value.q);
      bone.position.copy(value.p);
    });
  }

  // Snapshot / blend helpers for cross-fading with an AnimationMixer clip.
  const snapshot = () => list.map((bone) => [bone.quaternion.clone(), bone.position.clone()]);
  function capture(buffer) {
    list.forEach((bone, index) => { buffer[index][0].copy(bone.quaternion); buffer[index][1].copy(bone.position); });
  }
  function blendTo(buffer, weight) {
    list.forEach((bone, index) => {
      bone.quaternion.slerp(buffer[index][0], weight);
      bone.position.lerp(buffer[index][1], weight);
    });
  }

  function curl(side, amount, thumb = amount * 0.6) {
    FINGERS.forEach((finger, index) => {
      for (let joint = 1; joint <= 3; joint += 1) {
        const bone = bones[`${side}Hand${finger}${joint}`];
        if (!bone) continue;
        const spread = (index - 1.5) * 0.04 * (side === 'Left' ? 1 : -1);
        _e.set(-amount * (joint === 1 ? 0.9 : 1.1), 0, joint === 1 ? spread : 0, 'XYZ');
        bone.quaternion.copy(rest.get(bone).q).multiply(_q.setFromEuler(_e));
      }
    });
    for (let joint = 1; joint <= 3; joint += 1) {
      const bone = bones[`${side}HandThumb${joint}`];
      if (!bone) continue;
      _e.set(-thumb * 0.4, 0, 0, 'XYZ');
      bone.quaternion.copy(rest.get(bone).q).multiply(_q.setFromEuler(_e));
    }
  }

  // pose: { pelvis: V3, lean, twist, headYaw, headPitch, handL, handR, footL, footR, poleArmL/R?, standing,
  //         forearmTwistL/R, wristL/R, curlL/R, toeL/R }
  // mask: which parts to drive ({ body, armL, armR, legs })
  function apply(pose, mask = ALL) {
    root.updateWorldMatrix(true, false);
    root.getWorldQuaternion(rootQuat);

    if (mask.body) {
      // Pelvis
      const hips = bones.Hips;
      _a.copy(pose.pelvis).applyMatrix4(root.matrixWorld);
      hips.parent.updateWorldMatrix(true, false);
      hips.position.copy(hips.parent.worldToLocal(_a));
      hips.updateWorldMatrix(false, true);
      if (pose.hipYaw) rotateInRoot(hips, rootQuat, _q2.setFromAxisAngle(_b.set(0, 1, 0), pose.hipYaw));
      // Spine: lean forward (+) / back (-), then twist.
      _e.set(pose.lean, pose.twist, 0, 'YXZ');
      const spineDelta = new THREE.Quaternion().setFromEuler(_e);
      [['Spine02', 0.3], ['Spine01', 0.35], ['Spine', 0.35]].forEach(([name, weight]) => rotateInRoot(bones[name], rootQuat, spineDelta, weight));
      // Head relative to the torso.
      _e.set(pose.headPitch, pose.headYaw + pose.twist * 0.2, pose.headRoll || 0, 'YXZ');
      const headDelta = new THREE.Quaternion().setFromEuler(_e);
      // Undo part of the spine lean so the head stays more upright, like a real neck does.
      _e.set(-pose.lean * 0.55, -pose.twist, 0, 'YXZ');
      headDelta.premultiply(new THREE.Quaternion().setFromEuler(_e));
      rotateInRoot(bones.neck, rootQuat, headDelta, 0.4);
      rotateInRoot(bones.Head, rootQuat, headDelta, 0.6);
    }

    // Arms
    SIDES.forEach((side) => {
      const key = side === 'Left' ? 'L' : 'R';
      if (!mask[`arm${key}`]) return;
      const arm = bones[`${side}Arm`];
      const fore = bones[`${side}ForeArm`];
      const hand = bones[`${side}Hand`];
      worldPos(arm, tmp.shoulder);
      tmp.target.copy(pose[`hand${key}`]).applyMatrix4(root.matrixWorld);
      const pole = pose[`poleArm${key}`] || (side === 'Left' ? DEFAULT_POLE_L : DEFAULT_POLE_R);
      tmp.pole.copy(pole).applyQuaternion(rootQuat).normalize();
      solve(tmp.shoulder, tmp.target, measure.upper, measure.fore, tmp.pole, tmp.elbow, tmp.wrist);
      aim(arm, fore, tmp.elbow);
      aim(fore, hand, tmp.wrist);
      const palm = pose[`palm${key}`];
      if (palm) {
        // Turn the palm toward `palm` (root space): half from the upper arm, the rest from the forearm.
        tmp.target.copy(palm).applyQuaternion(rootQuat).normalize();
        const residual = palmResidual(side, fore, hand, tmp.target);
        twistAlong(arm, fore, residual * 0.45);
        aim(fore, hand, tmp.wrist);
        twistAlong(fore, hand, palmResidual(side, fore, hand, tmp.target));
      }
      const wrist = pose[`wrist${key}`];
      if (wrist) {
        _e.set(wrist[0], wrist[1], wrist[2] * (side === 'Left' ? 1 : -1), 'XYZ');
        hand.quaternion.copy(rest.get(hand).q).multiply(_q.setFromEuler(_e));
        hand.updateWorldMatrix(false, true);
      }
      curl(side, pose[`curl${key}`] ?? 0.3);
    });

    // Legs
    if (mask.legs) {
      SIDES.forEach((side) => {
        const key = side === 'Left' ? 'L' : 'R';
        const up = bones[`${side}UpLeg`];
        const leg = bones[`${side}Leg`];
        const foot = bones[`${side}Foot`];
        worldPos(up, tmp.shoulder);
        tmp.target.copy(pose[`foot${key}`]);
        tmp.target.y += measure.ankleY - 0.05;
        tmp.target.applyMatrix4(root.matrixWorld);
        tmp.pole.set(side === 'Left' ? 0.08 : -0.08, 0.1, 1).applyQuaternion(rootQuat).normalize();
        solve(tmp.shoulder, tmp.target, measure.thigh, measure.shin, tmp.pole, tmp.elbow, tmp.wrist);
        aim(up, leg, tmp.elbow);
        aim(leg, foot, tmp.wrist);
        // Keep the foot flat (plus optional toe pitch for walking).
        _q.copy(rootQuat).multiply(footRest[side]);
        const toe = pose[`toe${key}`] || 0;
        if (toe) _q.premultiply(_q2.setFromAxisAngle(_b.set(1, 0, 0).applyQuaternion(rootQuat), toe));
        foot.parent.getWorldQuaternion(_q3).invert();
        foot.quaternion.copy(_q3.multiply(_q));
        foot.updateWorldMatrix(false, true);
      });
    }
  }

  // Where a bone is in root space (e.g. to attach the mug to the left hand).
  function boneWorld(name, out) {
    return worldPos(bones[name], out);
  }

  return { bones, measure, reset, apply, snapshot, capture, blendTo, boneWorld, list };
}

const ALL = { body: true, armL: true, armR: true, legs: true };
const DEFAULT_POLE_L = new THREE.Vector3(0.6, -1, -0.3);
const DEFAULT_POLE_R = new THREE.Vector3(-0.6, -1, -0.3);
export const RIG_MASK_ALL = ALL;
export const RIG_MASK_ARM_L = { armL: true };
// Matrix kept for callers that want to reuse it.
export const rigScratch = _m;
