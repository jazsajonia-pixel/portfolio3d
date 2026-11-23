'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { Interactive, Mug, actors, angleLerp, clamp01, smooth, useRoom } from './core';
import { MODEL } from './models';
import { BED_SIT, CAT_SPOT } from './Bedroom';
import { RIG_MASK_ARM_L, createHumanRig } from './humanRig';

// The desk and the things the person touches (room space; the desk group sits at DESK_ORIGIN).
export const DESK_TOP = 0.76;
export const DESK_ORIGIN = new THREE.Vector3(-2.58, 0, -0.3);
export const MOUSE_HOME = [0.32, 0.992, -0.46];
export const MUG_HOME = [0.36, 0.99, 0.42];

export const DESK_SIT = new THREE.Vector3(-1.78, 0, -0.36);
const DESK_STAND = new THREE.Vector3(-1.45, 0, -0.36);
const DESK_YAW = -Math.PI / 2;
const BED_APPROACH = new THREE.Vector3(BED_SIT.x, 0, -0.42);
const WINDOW_SPOT = new THREE.Vector3(-2.2, 0, 1.85);
const HUB = new THREE.Vector3(-1.25, 0, 0.32);
const SPOKES = {
  desk: [DESK_STAND],
  bed: [BED_APPROACH, new THREE.Vector3(-0.2, 0, 0.12)],
  window: [WINDOW_SPOT, new THREE.Vector3(-1.62, 0, 1.25)],
};
const routeBetween = (from, to) => [...SPOKES[from], HUB, ...[...SPOKES[to]].reverse()];

const WALK_SPEED = 0.78; // m/s
const WALK_CYCLE = 1.25; // metres covered by one loop of the walk clip

const LINES = {
  desk: ['Shipping one more Qline fix.', 'Tests first, then the merge.', 'Hi. Scroll on to see my work.'],
  bed: ['Break time with the cat.', 'She approves this build.'],
  window: ['Coffee break while you look at my projects.', 'The screen is all yours.'],
  walk: ['Be right back.'],
};

const ACTIVITIES = [['type', 7], ['mouse', 6], ['type', 4], ['drink', 6], ['mouse', 7], ['stretch', 3.6], ['type', 5], ['think', 4], ['mouse', 5]];

const V = () => new THREE.Vector3();
function makePose() {
  return {
    pelvis: V(), lean: 0, twist: 0, hipYaw: 0, headYaw: 0, headPitch: 0, headRoll: 0,
    handL: V(), handR: V(), footL: V(), footR: V(), poleArmL: V().set(0.6, -1, -0.3), poleArmR: V().set(-0.6, -1, -0.3),
    palmL: V().set(-1, 0, 0), palmR: V().set(1, 0, 0), wristL: [0, 0, 0], wristR: [0, 0, 0], curlL: 0.3, curlR: 0.3, toeL: 0, toeR: 0,
  };
}
function setStanding(t) {
  t.pelvis.set(0, 0.955, 0);
  t.lean = 0.02; t.twist = 0; t.hipYaw = 0; t.headYaw = 0; t.headPitch = 0; t.headRoll = 0;
  t.footL.set(0.11, 0.05, 0.02); t.footR.set(-0.11, 0.05, -0.01);
  t.handL.set(0.21, 0.86, 0.02); t.handR.set(-0.21, 0.86, 0.02);
  t.palmL.set(-1, 0, 0.1); t.palmR.set(1, 0, 0.1);
  t.poleArmL.set(0.4, -1, -0.6); t.poleArmR.set(-0.4, -1, -0.6);
  t.wristL = [0, 0, 0]; t.wristR = [0, 0, 0]; t.curlL = 0.35; t.curlR = 0.35;
}
function setSeated(t, seatY) {
  t.pelvis.set(0, seatY, -0.02);
  t.lean = 0.12; t.twist = 0; t.hipYaw = 0; t.headRoll = 0;
  t.footL.set(0.16, 0.05, 0.42); t.footR.set(-0.14, 0.05, 0.45);
  t.handL.set(0.2, seatY + 0.05, 0.3); t.handR.set(-0.2, seatY + 0.05, 0.3);
  t.palmL.set(0.1, -1, 0); t.palmR.set(-0.1, -1, 0);
  t.poleArmL.set(0.6, -1, -0.3); t.poleArmR.set(-0.6, -1, -0.3);
  t.wristL = [-0.15, 0, 0]; t.wristR = [-0.15, 0, 0]; t.curlL = 0.35; t.curlR = 0.35;
}
// Blend every field of `pose` toward `target`.
function lerpPose(pose, target, k) {
  ['pelvis', 'handL', 'handR', 'footL', 'footR', 'poleArmL', 'poleArmR', 'palmL', 'palmR'].forEach((key) => pose[key].lerp(target[key], k));
  ['lean', 'twist', 'hipYaw', 'headYaw', 'headPitch', 'headRoll', 'curlL', 'curlR', 'toeL', 'toeR'].forEach((key) => { pose[key] += (target[key] - pose[key]) * k; });
  ['wristL', 'wristR'].forEach((key) => { for (let i = 0; i < 3; i += 1) pose[key][i] += (target[key][i] - pose[key][i]) * k; });
}

const tmpA = new THREE.Vector3();
const tmpB = new THREE.Vector3();
const tmpC = new THREE.Vector3();
const mouseWorld = new THREE.Vector3();
const mugWorld = new THREE.Vector3();

function roomToLocal(point, position, yaw, out) {
  return out.subVectors(point, position).applyAxisAngle(THREE.Object3D.DEFAULT_UP, -yaw);
}

// A rigged, textured person (CC0 character from Grab3D). Behaviour is a small state machine; the body is posed with
// two-bone IK every frame and cross-faded with the model's own walk cycle while moving between spots.
export default function Human({ Chair }) {
  const { reducedMotion, phaseRef } = useRoom();
  const gltf = useGLTF(MODEL('man'), false, true);
  const { model, rig, mixer, walk, hipsRest } = useMemo(() => {
    const scene = cloneSkinned(gltf.scene);
    scene.traverse((object) => {
      if (object.isMesh) {
        object.castShadow = true;
        object.receiveShadow = true;
        object.frustumCulled = false; // the armature is scaled, so the skinned bounds are unreliable
      }
    });
    const created = createHumanRig(scene);
    const animationMixer = new THREE.AnimationMixer(scene);
    const clip = gltf.animations.find((item) => item.name === 'walk') ?? gltf.animations[0];
    const action = clip ? animationMixer.clipAction(clip) : null;
    action?.play();
    return { model: scene, rig: created, mixer: animationMixer, walk: action, hipsRest: created.bones.Hips.position.clone() };
  }, [gltf]);
  const walkBuffer = useMemo(() => rig.snapshot(), [rig]);

  const top = useRef();
  const root = useRef();
  const chair = useRef();
  const mug = useRef();
  const label = useRef();
  const proxy = useRef();
  const [bubble, setBubble] = useState(null);
  const bubbleTimer = useRef(0);
  const pose = useMemo(() => { const value = makePose(); setSeated(value, 0.6); return value; }, []);
  const target = useMemo(() => makePose(), []);
  const scratch = useMemo(() => makePose(), []);
  const state = useRef({
    mode: 'desk', t: 0, activity: 0, activityT: 0, position: DESK_SIT.clone(), yaw: DESK_YAW, route: [], routeIndex: 0,
    destination: 'desk', walkPhase: 0, walkWeight: 0, lastBed: -20, wave: 0, from: new THREE.Vector3(),
  });

  useEffect(() => () => window.clearTimeout(bubbleTimer.current), []);
  useEffect(() => () => mixer.stopAllAction(), [mixer]);

  const onClick = useCallback(() => {
    const s = state.current;
    s.wave = 2.2;
    const key = s.mode === 'bed' ? 'bed' : s.mode === 'window' ? 'window' : s.mode === 'walk' ? 'walk' : 'desk';
    const lines = LINES[key];
    setBubble(lines[Math.floor(Math.random() * lines.length)]);
    window.clearTimeout(bubbleTimer.current);
    bubbleTimer.current = window.setTimeout(() => setBubble(null), 2600);
  }, []);

  useFrame(({ clock }, rawDelta) => {
    if (!root.current || !top.current) return;
    const delta = Math.min(rawDelta, 0.1);
    const s = state.current;
    const time = clock.elapsedTime;
    const t = target;

    // Where should he be? The screen is left free on the Projects stop; the cat gets a visit while it naps.
    const stop = phaseRef.current;
    let goal = 'desk';
    if (!reducedMotion) {
      if (stop === 'computer') goal = 'window';
      else if (s.mode === 'bed' && s.t < 16 && actors.cat.sleeping) goal = 'bed';
      else if (s.mode === 'walk' && s.destination === 'bed' && actors.cat.sleeping) goal = 'bed';
      else if (actors.cat.sleeping && actors.cat.napLeft > 14 && time - s.lastBed > 30 && stop !== 'notes') goal = 'bed';
    }
    const startWalk = (from, to) => {
      s.mode = 'walk';
      s.route = routeBetween(from, to);
      s.routeIndex = 0;
      s.destination = to;
      s.t = 0;
    };

    // QA hook: `window.__tourDebug.humanForce = 'bed' | 'window' | 'drink' | 'mouse' | 'stretch' | 'think'` freezes a pose.
    const force = typeof window !== 'undefined' ? window.__tourDebug?.humanForce : null;
    if (force) {
      const at = ACTIVITIES.findIndex(([name]) => name === force);
      if (force === 'bed') { s.mode = 'bed'; s.position.copy(BED_SIT); s.yaw = 0; goal = 'bed'; s.t = 1; }
      else if (force === 'window') { s.mode = 'window'; s.position.copy(WINDOW_SPOT); s.yaw = DESK_YAW; goal = 'window'; actors.human.mugInHand = true; }
      else if (at >= 0) { s.mode = 'desk'; s.position.copy(DESK_SIT); s.yaw = DESK_YAW; goal = 'desk'; s.activity = at; s.activityT = ACTIVITIES[at][1] * (window.__tourDebug.humanT ?? 0.5) - delta; }
    }
    s.t += delta;
    // ---- state machine ----
    if (s.mode === 'desk') {
      if (goal !== 'desk') { s.mode = 'rise'; s.t = 0; if (goal === 'window') actors.human.mugInHand = true; }
    } else if (s.mode === 'rise') {
      s.position.lerpVectors(DESK_SIT, DESK_STAND, smooth(clamp01((s.t - 0.3) / 0.9)));
      if (s.t > 1.25) startWalk('desk', goal);
    } else if (s.mode === 'walk') {
      const next = s.route[s.routeIndex];
      tmpA.subVectors(next, s.position).setY(0);
      const distance = tmpA.length();
      if (distance < 0.04) {
        s.routeIndex += 1;
        if (s.routeIndex >= s.route.length) {
          s.mode = s.destination === 'bed' ? 'sitBed' : s.destination === 'window' ? 'window' : 'sitDesk';
          s.t = 0;
          s.from.copy(s.position);
        }
      } else {
        const speed = WALK_SPEED * Math.min(1, s.t * 1.6 + 0.2); // ease into the first step
        s.position.addScaledVector(tmpA.normalize(), Math.min(distance, speed * delta));
        s.yaw = angleLerp(s.yaw, Math.atan2(tmpA.x, tmpA.z), 1 - Math.pow(0.0006, delta));
        s.walkPhase += (speed * delta) / WALK_CYCLE;
      }
      if (s.mode === 'walk' && goal !== s.destination && s.routeIndex > 0) {
        s.route = [HUB, ...[...SPOKES[goal]].reverse()];
        s.routeIndex = 0;
        s.destination = goal;
      }
    } else if (s.mode === 'sitBed') {
      s.yaw = angleLerp(s.yaw, 0, 1 - Math.pow(0.0004, delta));
      s.position.lerpVectors(s.from, BED_SIT, smooth(clamp01((s.t - 0.45) / 0.9)));
      if (s.t > 1.5) { s.mode = 'bed'; s.t = 0; }
    } else if (s.mode === 'bed') {
      if (goal !== 'bed') { s.mode = 'riseBed'; s.t = 0; s.lastBed = time; }
    } else if (s.mode === 'riseBed') {
      s.position.lerpVectors(BED_SIT, BED_APPROACH, smooth(clamp01((s.t - 0.2) / 0.9)));
      if (s.t > 1.15) { s.position.copy(BED_APPROACH); startWalk('bed', goal === 'bed' ? 'desk' : goal); }
    } else if (s.mode === 'window') {
      s.yaw = angleLerp(s.yaw, DESK_YAW, 1 - Math.pow(0.002, delta));
      if (goal !== 'window') startWalk('window', goal);
    } else if (s.mode === 'sitDesk') {
      s.yaw = angleLerp(s.yaw, DESK_YAW, 1 - Math.pow(0.0004, delta));
      s.position.lerpVectors(s.from, DESK_SIT, smooth(clamp01((s.t - 0.35) / 0.9)));
      if (s.t > 1.4) { s.mode = 'desk'; s.t = 0; actors.human.mugInHand = false; s.activity = 0; s.activityT = 0; }
    }
    actors.cat.petting = s.mode === 'bed';

    // ---- target pose (character space: +z forward, +x his left) ----
    const lookAt = (point, maxYaw = 1.1) => {
      roomToLocal(point, s.position, s.yaw, tmpC);
      const dx = tmpC.x;
      const dy = tmpC.y - (pose.pelvis.y + 0.66);
      const dz = tmpC.z;
      t.headYaw = THREE.MathUtils.clamp(Math.atan2(dx, dz) - t.twist, -maxYaw, maxYaw);
      t.headPitch = THREE.MathUtils.clamp(-Math.atan2(dy, Math.hypot(dx, dz)), -0.5, 0.55);
    };
    let activity = 'walk';
    if (s.mode === 'desk' || s.mode === 'rise' || s.mode === 'sitDesk') {
      const [name, length] = reducedMotion ? ['type', 1e9] : ACTIVITIES[s.activity % ACTIVITIES.length];
      activity = name;
      if (s.mode === 'desk') {
        s.activityT += delta;
        if (s.activityT > length) { s.activityT = 0; s.activity += 1; }
      }
      const progress = s.activityT / length;
      setSeated(t, 0.6);
      // Typing: both hands on the keys, small alternating finger taps.
      const tap = (offset) => (reducedMotion ? 0 : Math.max(0, Math.sin(time * 14 + offset)) * 0.008);
      t.handL.set(0.13, 0.815 + tap(0), 0.44);
      t.handR.set(-0.13, 0.815 + tap(2.3), 0.44);
      t.palmL.set(0.15, -1, 0); t.palmR.set(-0.15, -1, 0);
      t.wristL = [-0.22, 0, 0.1]; t.wristR = [-0.22, 0, 0.1];
      t.curlL = 0.38 + tap(1) * 8; t.curlR = 0.38 + tap(3) * 8;
      lookAt(tmpC.set(-2.78, 1.27, -0.35), 0.6);
      actors.human.mouse.lerp(tmpB.set(0, 0), 0.1);
      if (s.mode === 'desk' && name === 'mouse') {
        const mx = Math.sin(time * 1.3) * 0.03 + Math.sin(time * 3.1) * 0.01;
        const mz = Math.cos(time * 0.9) * 0.04;
        actors.human.mouse.set(mx, mz);
        mouseWorld.set(DESK_ORIGIN.x + MOUSE_HOME[0] + mx, DESK_TOP + 0.045, DESK_ORIGIN.z + MOUSE_HOME[2] + mz);
        roomToLocal(mouseWorld, s.position, s.yaw, t.handR);
        t.handR.z -= 0.035;
        t.palmR.set(0.05, -1, 0);
        t.wristR = [-0.12, 0, 0];
        t.curlR = 0.25;
        t.handL.set(0.16, 0.81, 0.36);
        t.twist = -0.1;
        t.lean = 0.14;
      } else if (s.mode === 'desk' && name === 'drink') {
        mugWorld.set(DESK_ORIGIN.x + MUG_HOME[0], DESK_TOP + 0.07, DESK_ORIGIN.z + MUG_HOME[2]);
        const mugPoint = roomToLocal(mugWorld, s.position, s.yaw, tmpA);
        mugPoint.x -= 0.02;
        const rest = tmpB.copy(t.handL);
        const mouth = tmpC.set(0.06, 1.16, 0.2);
        const reach = smooth(clamp01(progress / 0.16));
        const lift = smooth(clamp01((progress - 0.18) / 0.16));
        const lower = smooth(clamp01((progress - 0.72) / 0.14));
        const back = smooth(clamp01((progress - 0.88) / 0.12));
        actors.human.mugInHand = progress > 0.16 && progress < 0.88;
        if (progress < 0.18) t.handL.lerpVectors(rest, mugPoint, reach);
        else if (progress < 0.72) t.handL.lerpVectors(mugPoint, mouth, lift);
        else if (progress < 0.88) t.handL.lerpVectors(mouth, mugPoint, lower);
        else t.handL.lerpVectors(mugPoint, rest, back);
        t.palmL.set(-1, 0, 0);
        t.wristL = [0, 0, 0];
        t.curlL = 0.75;
        t.twist = 0.14 * reach * (1 - back);
        t.lean = 0.08;
        const sip = lift * (1 - lower);
        t.headPitch = THREE.MathUtils.lerp(t.headPitch, -0.22, sip);
        t.headYaw *= 1 - sip;
      } else if (s.mode === 'desk' && name === 'stretch') {
        const up = Math.sin(clamp01(progress) * Math.PI);
        t.handL.lerp(tmpA.set(0.14, 1.72, 0.02), up);
        t.handR.lerp(tmpA.set(-0.14, 1.72, 0.02), up);
        t.palmL.lerp(tmpA.set(0, 0, 1), up); t.palmR.lerp(tmpA.set(0, 0, 1), up);
        t.poleArmL.lerp(tmpA.set(1, 0, 0), up); t.poleArmR.lerp(tmpA.set(-1, 0, 0), up);
        t.lean = THREE.MathUtils.lerp(0.12, -0.2, up);
        t.headPitch = -0.35 * up;
      } else if (s.mode === 'desk' && name === 'think') {
        // Chin on the right hand, reading the screen.
        const k = Math.sin(clamp01(progress) * Math.PI);
        t.handR.lerp(tmpA.set(-0.03, 1.16, 0.2), Math.min(1, k * 1.6));
        t.palmR.lerp(tmpA.set(0, 0.3, 1), k);
        t.curlR = THREE.MathUtils.lerp(0.38, 0.8, k);
        t.lean = 0.2;
        t.headRoll = 0.08 * k;
      }
      if (s.mode === 'desk' && actors.robot.helping && name !== 'drink') {
        lookAt(actors.robot.position);
        t.twist = THREE.MathUtils.clamp(t.headYaw * 0.25, -0.3, 0.3);
      }
      if (s.mode === 'rise' || s.mode === 'sitDesk') {
        const k = s.mode === 'rise' ? smooth(clamp01((s.t - 0.2) / 0.9)) : 1 - smooth(clamp01((s.t - 0.3) / 0.95));
        setStanding(scratch);
        lerpPose(t, scratch, k);
        t.lean += Math.sin(k * Math.PI) * 0.4; // lean forward to get up, like people do
        if (actors.human.mugInHand) t.handL.lerp(tmpA.set(0.14, 1.06, 0.26), k);
      }
    } else if (s.mode === 'walk') {
      setStanding(t);
      t.headPitch = 0.06;
    } else if (s.mode === 'window') {
      setStanding(t);
      const sip = (s.t % 6.5) / 6.5;
      const up = sip > 0.55 && sip < 0.85 ? Math.sin(((sip - 0.55) / 0.3) * Math.PI) : 0;
      t.handL.set(0.14, 1.06, 0.26).lerp(tmpA.set(0.07, 1.5, 0.2), up);
      t.palmL.set(-1, 0, 0);
      t.curlL = 0.75;
      t.handR.set(-0.13, 0.98, 0.12); // hand in the jacket pocket area
      t.palmR.set(1, 0, 0);
      t.headYaw = Math.sin(time * 0.3) * 0.3;
      t.headPitch = -0.06 - up * 0.25;
    } else {
      // On the bed: sitting on the edge of the mattress, petting the cat on his left.
      const k = s.mode === 'sitBed' ? smooth(clamp01((s.t - 0.45) / 0.9)) : s.mode === 'riseBed' ? 1 - smooth(clamp01((s.t - 0.1) / 0.9)) : 1;
      setStanding(t);
      setSeated(scratch, 0.69);
      scratch.lean = -0.02;
      scratch.footL.set(0.16, 0.05, 0.38); scratch.footR.set(-0.15, 0.05, 0.4);
      scratch.handR.set(-0.2, 0.74, 0.22);
      scratch.handL.set(0.22, 0.74, 0.2);
      scratch.wristL = [0, 0, 0]; scratch.wristR = [0, 0, 0];
      if (s.mode === 'bed') {
        roomToLocal(actors.cat.position.lengthSq() > 0 ? actors.cat.position : CAT_SPOT, s.position, s.yaw, tmpA);
        const stroke = reducedMotion ? 0 : Math.sin(time * 2.2);
        scratch.handL.set(tmpA.x - 0.02 + stroke * 0.06, tmpA.y + 0.2 - Math.abs(stroke) * 0.02, tmpA.z + 0.04);
        scratch.palmL.set(0, -1, 0);
        scratch.curlL = 0.15;
        scratch.twist = 0.45;
        scratch.lean = 0.1;
        scratch.poleArmL.set(1, -0.6, 0);
        tmpB.copy(actors.cat.position).setY(actors.cat.position.y + 0.12);
        lookAt(tmpB);
        scratch.headYaw = t.headYaw;
        scratch.headPitch = t.headPitch;
      }
      lerpPose(t, scratch, k);
      t.lean += Math.sin(k * Math.PI) * 0.3;
    }

    // Wave when clicked (right hand), on top of whatever he is doing.
    if (s.wave > 0) {
      s.wave = Math.max(0, s.wave - delta);
      const w = Math.min(1, s.wave * 2, (2.2 - s.wave) * 3);
      t.handR.lerp(tmpA.set(-0.32 + Math.sin(time * 11) * 0.06, t.pelvis.y + 0.72, 0.16), w);
      t.palmR.lerp(tmpA.set(0, 0, 1), w);
      t.poleArmR.lerp(tmpA.set(-1, -0.4, 0), w);
      t.curlR *= 1 - w * 0.8;
    }

    // Breathing.
    if (!reducedMotion) {
      t.lean += Math.sin(time * 1.6) * 0.012;
      t.pelvis.y += Math.sin(time * 1.6) * 0.002;
    }

    const walking = s.mode === 'walk';
    lerpPose(pose, t, 1 - Math.pow(walking ? 0.0001 : 0.003, delta));
    s.walkWeight += ((walking ? 1 : 0) - s.walkWeight) * (1 - Math.pow(0.002, delta));

    // ---- apply ----
    root.current.position.copy(s.position);
    root.current.rotation.y = s.yaw;
    root.current.updateWorldMatrix(true, false);
    if (walk && s.walkWeight > 0.01) {
      rig.reset();
      walk.time = (s.walkPhase % 1) * walk.getClip().duration;
      mixer.update(0);
      const hips = rig.bones.Hips;
      hips.position.x = hipsRest.x;
      hips.position.z = hipsRest.z; // keep the clip in place; the state machine moves the body
      rig.capture(walkBuffer);
    }
    rig.reset();
    rig.apply(pose);
    if (s.walkWeight > 0.01) {
      rig.blendTo(walkBuffer, s.walkWeight);
      model.updateWorldMatrix(false, true);
      if (actors.human.mugInHand) rig.apply(pose, RIG_MASK_ARM_L); // keep the coffee steady while walking
    }
    model.updateWorldMatrix(false, true);

    // Mug follows the left hand.
    if (mug.current) {
      mug.current.visible = actors.human.mugInHand;
      if (actors.human.mugInHand) {
        rig.boneWorld('LeftHandMiddle1', tmpA);
        rig.boneWorld('LeftHand', tmpB);
        tmpA.lerp(tmpB, 0.35);
        top.current.worldToLocal(tmpA);
        mug.current.position.copy(tmpA).add(tmpC.set(0, -0.045, 0));
        const sipping = pose.handL.y > pose.pelvis.y + 0.5;
        mug.current.rotation.set(0, s.yaw + 1.4, sipping ? 0.45 : 0);
      }
    }

    // Head (room space) for the robot, the label and the speech bubble.
    rig.boneWorld('Head', tmpA);
    top.current.worldToLocal(tmpA);
    actors.human.head.copy(tmpA);
    if (label.current) label.current.position.copy(tmpA).add(tmpB.set(0, 0.42, 0));
    if (proxy.current) proxy.current.position.set(0, pose.pelvis.y + 0.05, pose.pelvis.y < 0.8 ? 0.12 : 0);
    actors.human.atDesk = s.mode === 'desk';
    actors.human.typing = s.mode === 'desk' && activity === 'type';

    // Chair rolls back when he stands up, back in when he sits.
    if (chair.current) {
      const out = s.mode === 'desk' ? 0 : s.mode === 'rise' ? smooth(clamp01(s.t / 0.9)) : s.mode === 'sitDesk' ? 1 - smooth(clamp01((s.t - 0.25) / 1)) : 1;
      chair.current.position.set(DESK_SIT.x + 0.04 + out * 0.32, 0, DESK_SIT.z - out * 0.42);
      chair.current.rotation.y = out * 0.6;
    }
    if (typeof window !== 'undefined' && window.__tourDebug) {
      window.__tourDebug.human = { mode: s.mode, activity, x: +s.position.x.toFixed(2), z: +s.position.z.toFixed(2) };
    }
  });

  return (
    <group ref={top}>
      <group ref={chair} position={[DESK_SIT.x + 0.04, 0, DESK_SIT.z]}>
        <Chair position={[0, 0, 0]} />
      </group>
      <group ref={root} position={DESK_SIT.toArray()} rotation={[0, DESK_YAW, 0]}>
        <primitive object={model} />
        <Interactive label="Say hi" onSelect={onClick} labelOffset={[0, 1.0, 0]}>
          {/* Invisible, simple hit volume: much cheaper to raycast than the skinned mesh */}
          <mesh ref={proxy} position={[0, 0.9, 0]}>
            <capsuleGeometry args={[0.24, 0.7, 4, 8]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
          </mesh>
        </Interactive>
      </group>
      <group ref={label}>
        {bubble && (
          <Html center zIndexRange={[30, 0]} wrapperClass="box-tour-html">
            <span className="box-tour-cat-bubble" role="status">{bubble}</span>
          </Html>
        )}
      </group>
      <group ref={mug} visible={false}>
        <Mug position={[0, 0, 0]} color="#e8e2d8" rotation={0} />
      </group>
    </group>
  );
}

