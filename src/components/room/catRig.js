import * as THREE from 'three';

// The kitten scan is a single static mesh. To make it feel alive we skin it to four procedural bones:
// root, chest (breathing), head (look-around, nap) and tail (swish). Weights come from simple spatial regions,
// blended smoothly so the fur never tears at the seams. Model space: +z forward, y up, 0.25 m tall.
const NECK = new THREE.Vector3(-0.045, 0.15, 0.0);
const TAIL = new THREE.Vector3(0.02, 0.03, -0.08);
const CHEST = new THREE.Vector3(0, 0.08, 0.0);

const ramp = (a, b, x) => THREE.MathUtils.clamp((x - a) / (b - a), 0, 1);
const soft = (a, b, x) => { const t = ramp(a, b, x); return t * t * (3 - 2 * t); };

function toFloat(attribute) {
  const out = new Float32Array(attribute.count * attribute.itemSize);
  for (let i = 0; i < attribute.count; i += 1) {
    for (let k = 0; k < attribute.itemSize; k += 1) out[i * attribute.itemSize + k] = attribute.getComponent(i, k);
  }
  return new THREE.BufferAttribute(out, attribute.itemSize);
}

export function buildCat(scene) {
  scene.updateMatrixWorld(true);
  let source = null;
  scene.traverse((object) => { if (object.isMesh && !source) source = object; });
  if (!source) return null;
  const geometry = source.geometry.clone();
  // Quantized (meshopt) attributes must be expanded before baking the node transform into the vertices.
  ['position', 'normal'].forEach((name) => {
    const attribute = geometry.getAttribute(name);
    if (attribute && (attribute.normalized || !(attribute.array instanceof Float32Array) || attribute.isInterleavedBufferAttribute)) {
      geometry.setAttribute(name, toFloat(attribute));
    }
  });
  geometry.applyMatrix4(source.matrixWorld);

  const position = geometry.getAttribute('position');
  const count = position.count;
  const indices = new Uint16Array(count * 4);
  const weights = new Float32Array(count * 4);
  const v = new THREE.Vector3();
  for (let i = 0; i < count; i += 1) {
    v.fromBufferAttribute(position, i);
    // Head: everything above the collar at the front of the body.
    const head = soft(0.128, 0.152, v.y) * soft(-0.06, -0.015, v.z);
    // Tail: the curl on the floor behind the body, weighted more toward the tip.
    const inTail = soft(0.02, 0.045, v.x) * soft(-0.02, -0.05, v.z) * soft(0.07, 0.045, v.y);
    const tail = inTail * ramp(0.01, 0.09, v.distanceTo(TAIL));
    // Chest: the torso, so it can breathe.
    const chest = (1 - head - tail) * soft(0.03, 0.07, v.y) * soft(0.16, 0.12, v.y) * 0.8;
    const root = Math.max(0, 1 - head - tail - chest);
    const o = i * 4;
    indices[o] = 0; indices[o + 1] = 1; indices[o + 2] = 2; indices[o + 3] = 3;
    const sum = root + chest + head + tail || 1;
    weights[o] = root / sum; weights[o + 1] = chest / sum; weights[o + 2] = head / sum; weights[o + 3] = tail / sum;
  }
  geometry.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(indices, 4));
  geometry.setAttribute('skinWeight', new THREE.Float32BufferAttribute(weights, 4));

  const root = new THREE.Bone();
  const chest = new THREE.Bone();
  chest.position.copy(CHEST);
  const head = new THREE.Bone();
  head.position.copy(NECK).sub(CHEST);
  const tail = new THREE.Bone();
  tail.position.copy(TAIL);
  root.add(chest, tail);
  chest.add(head);

  const material = source.material.clone();
  const mesh = new THREE.SkinnedMesh(geometry, material);
  mesh.add(root);
  mesh.updateMatrixWorld(true);
  mesh.bind(new THREE.Skeleton([root, chest, head, tail]));
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.frustumCulled = false;
  return { mesh, bones: { root, chest, head, tail } };
}
