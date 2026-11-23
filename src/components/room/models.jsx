'use client';

// GLB props (Poly Haven, CC0), compressed with meshopt + WebP. drei's useGLTF has the meshopt decoder built in,
// so no Draco/CDN fetch is needed.
import { useGLTF, useTexture } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';

export const MODEL = (name) => `/models/${name}.glb`;

export const PROP_MODELS = [
  'alarm_clock_01', 'book_encyclopedia_set_01', 'ceramic_vase_01', 'desk_lamp_arm_01', 'modern_arm_chair_01',
  'modern_wooden_cabinet', 'potted_plant_02', 'potted_plant_04', 'rubber_duck_toy', 'side_table_01',
  'standing_picture_frame_01', 'stationery_supplies', 'throw_pillows_01', 'wicker_basket_02',
  'wooden_display_shelves_01', 'drawer_cabinet',
];

export function useModel(name) {
  return useGLTF(MODEL(name), false, true);
}

// A shadow-casting clone of a GLB scene. Geometry and materials stay shared between clones.
export function Model({ name, shadows = true, receive = true, tint, ...props }) {
  const { scene } = useModel(name);
  const object = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => {
      if (!child.isMesh) return;
      child.castShadow = shadows;
      child.receiveShadow = receive;
      if (tint) {
        child.material = child.material.clone();
        child.material.color.multiply(new THREE.Color(tint));
      }
    });
    return clone;
  }, [scene, shadows, receive, tint]);
  return <primitive object={object} {...props} />;
}

const TEXTURE_ROOT = '/textures/';

// PBR texture set (diffuse / normal / optional roughness), tiled, colour-correct.
export function usePbr(name, { repeat = [1, 1], rough = false } = {}) {
  const files = [`${TEXTURE_ROOT}${name}_diff.webp`, `${TEXTURE_ROOT}${name}_nor.webp`];
  if (rough) files.push(`${TEXTURE_ROOT}${name}_rough.webp`);
  const maps = useTexture(files);
  const [rx, ry] = repeat;
  return useMemo(() => {
    // Clone per use: useTexture caches by URL, and each surface needs its own tiling.
    const out = maps.map((source, index) => {
      const map = source.clone();
      map.wrapS = THREE.RepeatWrapping;
      map.wrapT = THREE.RepeatWrapping;
      map.repeat.set(rx, ry);
      map.anisotropy = 8;
      map.colorSpace = index === 0 ? THREE.SRGBColorSpace : THREE.NoColorSpace;
      map.needsUpdate = true;
      return map;
    });
    return { map: out[0], normalMap: out[1], roughnessMap: out[2] ?? null };
  }, [maps, rx, ry]);
}

// Preload at module import time so the room assets stream while the welcome screen plays.
if (typeof window !== 'undefined') {
  PROP_MODELS.forEach((name) => useGLTF.preload(MODEL(name), false, true));
  useGLTF.preload('/models/man.glb', false, true);
  useGLTF.preload('/models/kitten.glb', false, true);
}
