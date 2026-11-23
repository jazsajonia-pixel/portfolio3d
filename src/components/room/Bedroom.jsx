'use client';

// The bedroom half of the room: bed with layered bedding, the Claude plush, framed posters, nightstand,
// reading corner and PBR floor/walls. Furniture GLBs are Poly Haven (CC0); soft goods are generated here so
// they can drape over the exact bed size.
import { RoundedBox, useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Suspense, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Block, Interactive, palette, S, seeded, useRoom, actors } from './core';
import { Model, usePbr } from './models';

/* ---------------------------------------------------------------- */
/* Layout (room-local metres; floor top y = 0, back wall z = -3)      */
/* ---------------------------------------------------------------- */

export const BED = { x: 1.1, z0: -2.94, z1: -0.92, width: 1.5, mattressTop: 0.56 };
export const BED_CENTER_Z = (BED.z0 + BED.z1) / 2;
export const BED_SIT = new THREE.Vector3(0.78, 0, -1.02); // human sits on the bed's front-left edge, facing +z
export const BED_APPROACH = new THREE.Vector3(0.62, 0, -0.42);
export const CAT_SPOT = new THREE.Vector3(1.26, BED.mattressTop + 0.085, -1.4);
export const PLUSH_HOME = new THREE.Vector3(1.47, BED.mattressTop + 0.2, -2.42);
export const POSTERS = [
  { src: '/room/poster-gensan.webp', x: 0.46, y: 1.98, w: 0.5, h: 0.67, tilt: 0 },
  { src: '/room/poster-ship.webp', x: 1.1, y: 2.02, w: 0.56, h: 0.75, tilt: 0 },
  { src: '/room/poster-lofi.webp', x: 1.74, y: 1.98, w: 0.5, h: 0.67, tilt: 0 },
];

/* ---------------------------------------------------------------- */
/* Soft-goods geometry                                                 */
/* ---------------------------------------------------------------- */

// Unfolded distance `s` from the centre line → position on a surface that wraps over a rounded edge and hangs.
function wrap(s, half, radius, top) {
  const flat = half - radius;
  const abs = Math.abs(s);
  const sign = Math.sign(s) || 1;
  if (abs <= flat) return [s, top, 0];
  const arcLength = (Math.PI / 2) * radius;
  if (abs <= flat + arcLength) {
    const phi = (abs - flat) / radius;
    return [sign * (flat + Math.sin(phi) * radius), top - (1 - Math.cos(phi)) * radius, phi / (Math.PI / 2)];
  }
  const hang = abs - flat - arcLength;
  return [sign * (half + hang * 0.06), top - radius - hang, 1];
}

// A blanket draped over a box: covers `width` across (x), runs from z = 0 toward +z for `length`, wraps over the
// two long sides and the far end. Small folds and a puffy top make it read as fabric rather than a slab.
function drapeGeometry({ width, length, top, drop, footDrop = drop, radius = 0.05, puff = 0.03, folds = 0.012, seed = 1, segX = 64, segZ = 48, head = false }) {
  const random = seeded(seed);
  const phase = Array.from({ length: 6 }, () => random() * Math.PI * 2);
  const totalX = width + 2 * (drop + radius * 0.6);
  const totalZ = length + footDrop + radius * 0.6;
  const geometry = new THREE.PlaneGeometry(totalX, totalZ, segX, segZ);
  geometry.rotateX(-Math.PI / 2);
  const position = geometry.attributes.position;
  for (let i = 0; i < position.count; i += 1) {
    const u = position.getX(i); // −totalX/2 … +totalX/2
    const v = position.getZ(i) + totalZ / 2; // 0 … totalZ
    const [x, yAcross, bendX] = wrap(u, width / 2, radius, top);
    // Along z: flat until `length - radius`, then wrap over the foot end.
    let z = v;
    let y = yAcross;
    let bendZ = 0;
    if (v > length - radius) {
      const [zz, yy, b] = wrap(v - (length - radius), radius, radius, 0);
      z = length - radius + zz;
      bendZ = b;
      y = yAcross + yy;
    }
    // Puffy top, flattening toward the edges.
    const edge = Math.max(bendX, bendZ);
    const centre = 1 - Math.min(1, Math.abs(x) / (width / 2)) ** 4;
    y += puff * centre * (1 - edge);
    // Soft folds: low-frequency on top, vertical drapes on the hanging parts.
    y += folds * (Math.sin(x * 7 + phase[0]) * Math.sin(z * 5 + phase[1]) + 0.5 * Math.sin(x * 13 + z * 9 + phase[2])) * (1 - edge);
    const sway = folds * 1.6 * (Math.sin(z * 14 + phase[3]) + 0.4 * Math.sin(z * 31 + phase[4]));
    const hangX = Math.max(0, bendX - 0.5) * 2;
    const hangZ = Math.max(0, bendZ - 0.5) * 2;
    const xOut = x + Math.sign(x) * sway * hangX;
    const zOut = z + Math.sin(x * 16 + phase[5]) * folds * 1.6 * hangZ;
    position.setXYZ(i, xOut, y, head ? -zOut : zOut);
  }
  geometry.computeVertexNormals();
  return geometry;
}

// Pillow: a subdivided box squeezed into a lens shape (thin seams at the edges, full in the middle).
function pillowGeometry(w, h, d, seed = 1) {
  const random = seeded(seed);
  const geometry = new THREE.BoxGeometry(w, h, d, 24, 6, 16);
  const position = geometry.attributes.position;
  const sag = random() * 0.25;
  for (let i = 0; i < position.count; i += 1) {
    const x = position.getX(i) / (w / 2);
    const y = position.getY(i) / (h / 2);
    const z = position.getZ(i) / (d / 2);
    const fill = Math.max(0.08, (1 - x ** 4) * (1 - z ** 4)) ** 0.55;
    const dent = 1 - sag * Math.exp(-(x * x + z * z) * 3) * (y > 0 ? 1 : 0);
    position.setXYZ(i, x * (w / 2) * (1 - 0.04 * (1 - fill)), y * (h / 2) * fill * dent, z * (d / 2) * (1 - 0.06 * (1 - fill)));
  }
  geometry.computeVertexNormals();
  return geometry;
}

// The Claude spark as a stuffed toy: an irregular radial burst, extruded with a deep bevel so it looks stuffed.
export function claudeShape(seed = 7) {
  const random = seeded(seed);
  const rays = 11;
  const shape = new THREE.Shape();
  const inner = 0.055;
  for (let i = 0; i < rays; i += 1) {
    const a = (i / rays) * Math.PI * 2 + (random() - 0.5) * 0.16 + Math.PI / 2;
    const length = 0.15 + random() * 0.05;
    const halfWidth = 0.026 + random() * 0.008;
    const dir = [Math.cos(a), Math.sin(a)];
    const perp = [-dir[1], dir[0]];
    const valleyA = a - Math.PI / rays;
    const valley = [Math.cos(valleyA) * inner, Math.sin(valleyA) * inner];
    const left = [dir[0] * (length - halfWidth) - perp[0] * halfWidth, dir[1] * (length - halfWidth) - perp[1] * halfWidth];
    const right = [dir[0] * (length - halfWidth) + perp[0] * halfWidth, dir[1] * (length - halfWidth) + perp[1] * halfWidth];
    const tip = [dir[0] * (length + halfWidth * 0.9), dir[1] * (length + halfWidth * 0.9)];
    if (i === 0) shape.moveTo(valley[0], valley[1]);
    else shape.lineTo(valley[0], valley[1]);
    shape.quadraticCurveTo(dir[0] * length * 0.45 - perp[0] * halfWidth * 0.7, dir[1] * length * 0.45 - perp[1] * halfWidth * 0.7, left[0], left[1]);
    shape.quadraticCurveTo(tip[0] - perp[0] * halfWidth, tip[1] - perp[1] * halfWidth, tip[0], tip[1]);
    shape.quadraticCurveTo(tip[0] + perp[0] * halfWidth, tip[1] + perp[1] * halfWidth, right[0], right[1]);
    const nextValleyA = a + Math.PI / rays;
    shape.quadraticCurveTo(dir[0] * length * 0.45 + perp[0] * halfWidth * 0.7, dir[1] * length * 0.45 + perp[1] * halfWidth * 0.7, Math.cos(nextValleyA) * inner, Math.sin(nextValleyA) * inner);
  }
  shape.closePath();
  return shape;
}

export function useClaudeGeometry() {
  return useMemo(() => {
    const geometry = new THREE.ExtrudeGeometry(claudeShape(), {
      depth: 0.03, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.024, bevelSegments: 6, curveSegments: 10,
    });
    geometry.center();
    geometry.computeVertexNormals();
    return geometry;
  }, []);
}

export function ClaudePlushMesh(props) {
  const geometry = useClaudeGeometry();
  const fleece = usePbr('curly_teddy_natural', { repeat: [9, 9] });
  return (
    <mesh geometry={geometry} castShadow receiveShadow {...props}>
      <meshPhysicalMaterial color="#d97757" roughness={0.92} normalMap={fleece.normalMap} normalScale={[0.6, 0.6]} sheen={1} sheenRoughness={0.55} sheenColor="#ffd0b8" />
    </mesh>
  );
}

/* ---------------------------------------------------------------- */
/* Bed                                                                  */
/* ---------------------------------------------------------------- */

function Bedding() {
  const linen = usePbr('rough_linen', { repeat: [3, 3] });
  const knit = usePbr('knitted_fleece', { repeat: [5, 2] });
  const cord = usePbr('ribbed_corduroy', { repeat: [3, 2] });
  const length = BED.z1 - BED.z0;
  const duvet = useMemo(() => drapeGeometry({ width: 1.46, length: 1.42, top: BED.mattressTop + 0.02, drop: 0.24, footDrop: 0.26, radius: 0.07, puff: 0.06, folds: 0.006, seed: 4 }), []);
  const throwBlanket = useMemo(() => drapeGeometry({ width: 1.52, length: 0.5, top: BED.mattressTop + 0.085, drop: 0.3, footDrop: 0.32, radius: 0.06, puff: 0.012, folds: 0.007, seed: 9, segZ: 24 }), []);
  const pillows = useMemo(() => [pillowGeometry(0.62, 0.15, 0.42, 2), pillowGeometry(0.62, 0.15, 0.42, 5)], []);
  return (
    <group position={[BED.x, 0, 0]}>
      {/* Walnut platform on short legs */}
      <RoundedBox args={[BED.width + 0.06, 0.26, length + 0.04]} radius={0.025} smoothness={3} position={[0, 0.19, (BED.z0 + BED.z1) / 2]} castShadow receiveShadow>
        <meshStandardMaterial color={palette.timberDark} roughness={0.55} />
      </RoundedBox>
      {[[-1, 1], [1, 1], [-1, -1], [1, -1]].map(([sx, sz]) => (
        <mesh key={`${sx}${sz}`} position={[sx * (BED.width / 2 - 0.05), 0.03, (BED.z0 + BED.z1) / 2 + sz * (length / 2 - 0.06)]} castShadow>
          <cylinderGeometry args={[0.025, 0.02, 0.06, 10]} />
          <meshStandardMaterial color="#2a1c12" roughness={0.5} />
        </mesh>
      ))}
      {/* Upholstered corduroy headboard */}
      <RoundedBox args={[BED.width + 0.14, 1.02, 0.1]} radius={0.04} smoothness={4} position={[0, 0.83, BED.z0 + 0.02]} castShadow receiveShadow>
        <meshStandardMaterial color="#8a9478" roughness={0.95} normalMap={cord.normalMap} />
      </RoundedBox>
      {/* Mattress */}
      <RoundedBox args={[BED.width - 0.04, 0.24, length - 0.1]} radius={0.06} smoothness={4} position={[0, BED.mattressTop - 0.12, BED.z0 + 0.08 + (length - 0.1) / 2]} castShadow receiveShadow>
        <meshStandardMaterial color="#f4f0e8" roughness={0.95} normalMap={linen.normalMap} />
      </RoundedBox>
      {/* Duvet (folded back at the head) and a knitted throw across the foot */}
      <mesh geometry={duvet} position={[0, 0, -2.36]} castShadow receiveShadow>
        <meshStandardMaterial color="#e8e1d4" roughness={0.96} normalMap={linen.normalMap} normalScale={[0.8, 0.8]} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, BED.mattressTop + 0.06, -2.36]} rotation={[0, 0, Math.PI / 2]} scale={[0.75, 1, 1]} castShadow>
        <capsuleGeometry args={[0.045, 1.42, 6, 16]} />
        <meshStandardMaterial color="#efe9de" roughness={0.96} normalMap={linen.normalMap} />
      </mesh>
      <mesh geometry={throwBlanket} position={[0, 0, -1.46]} castShadow receiveShadow>
        <meshStandardMaterial color="#c9824f" roughness={0.98} normalMap={knit.normalMap} side={THREE.DoubleSide} />
      </mesh>
      {/* Sleeping pillows */}
      {pillows.map((geometry, index) => (
        <mesh key={index} geometry={geometry} position={[(index ? 0.34 : -0.34), BED.mattressTop + 0.1, BED.z0 + 0.36]} rotation={[-0.5, index ? -0.06 : 0.05, 0]} castShadow receiveShadow>
          <meshStandardMaterial color="#f7f4ee" roughness={0.95} normalMap={linen.normalMap} />
        </mesh>
      ))}
    </group>
  );
}

function BedSoftFallback() {
  return (
    <group position={[BED.x, 0, 0]}>
      <Block args={[BED.width + 0.06, 0.32, BED.z1 - BED.z0]} color={palette.timberDark} position={[0, 0.16, BED_CENTER_Z]} />
      <Block args={[BED.width - 0.04, 0.24, BED.z1 - BED.z0 - 0.1]} color="#f2ede4" position={[0, BED.mattressTop - 0.12, BED_CENTER_Z + 0.04]} />
      <Block args={[BED.width + 0.14, 1.02, 0.1]} color="#6f7a62" position={[0, 0.83, BED.z0 + 0.02]} />
    </group>
  );
}

export function Bed() {
  return (
    <Suspense fallback={<BedSoftFallback />}>
      <Bedding />
      <Model name="throw_pillows_01" position={[BED.x - 0.12, BED.mattressTop + 0.02, BED.z0 + 0.6]} rotation={[0, 0.08, 0]} scale={0.62} />
    </Suspense>
  );
}

/* ---------------------------------------------------------------- */
/* Posters above the bed                                                */
/* ---------------------------------------------------------------- */

function PosterArt({ src, w, h }) {
  const texture = useTexture(src);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return (
    <mesh position={[0, 0, 0.012]}>
      <planeGeometry args={[w, h]} />
      <meshPhysicalMaterial map={texture} roughness={0.55} clearcoat={0.6} clearcoatRoughness={0.25} />
    </mesh>
  );
}

function PosterFrame({ src, x, y, w, h, tilt }) {
  const bar = 0.022;
  const depth = 0.03;
  const color = '#d8c3a0';
  return (
    <group position={[x, y, -S + 0.02]} rotation={[0, 0, tilt]}>
      <Block args={[w + 2 * bar, bar, depth]} color={color} roughness={0.55} position={[0, h / 2 + bar / 2, 0]} />
      <Block args={[w + 2 * bar, bar, depth]} color={color} roughness={0.55} position={[0, -h / 2 - bar / 2, 0]} />
      <Block args={[bar, h, depth]} color={color} roughness={0.55} position={[-w / 2 - bar / 2, 0, 0]} />
      <Block args={[bar, h, depth]} color={color} roughness={0.55} position={[w / 2 + bar / 2, 0, 0]} />
      <Suspense fallback={<mesh position={[0, 0, 0.01]}><planeGeometry args={[w, h]} /><meshStandardMaterial color="#d9d1c4" /></mesh>}>
        <PosterArt src={src} w={w} h={h} />
      </Suspense>
    </group>
  );
}

export function Posters() {
  const { goTo } = useRoom();
  return (
    <Interactive label="Posters · about me" onSelect={() => goTo('display')} labelOffset={[1.1, 2.55, -2.8]}>
      {POSTERS.map((poster) => <PosterFrame key={poster.src} {...poster} />)}
    </Interactive>
  );
}

/* ---------------------------------------------------------------- */
/* Nightstand, reading corner, plants, rug                              */
/* ---------------------------------------------------------------- */

function BedsideLamp() {
  const { lightRef, nightRef } = useRoom();
  const shade = useRef();
  const glow = useRef();
  useFrame(() => {
    const on = lightRef.current.value;
    if (shade.current) shade.current.emissiveIntensity = 0.08 + on * (0.35 + nightRef.current.value * 0.9);
    if (glow.current) glow.current.intensity = on * (0.15 + nightRef.current.value * 0.9);
  });
  return (
    <group>
      <mesh position={[0, 0.11, 0]} castShadow>
        <sphereGeometry args={[0.085, 24, 18]} />
        <meshStandardMaterial color="#c9b9a2" roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.27, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.13, 0.16, 32, 1, true]} />
        <meshStandardMaterial ref={shade} color="#f4ead8" emissive="#ffcf8f" emissiveIntensity={0.3} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
      <pointLight ref={glow} position={[0, 0.26, 0.05]} intensity={0.3} distance={2.2} decay={2} color="#ffc98a" />
    </group>
  );
}

export function Nightstand() {
  return (
    <group position={[2.22, 0, -2.72]}>
      <Suspense fallback={<Block args={[0.55, 0.55, 0.45]} color="#c79a62" position={[0, 0.275, 0]} />}>
        <Model name="side_table_01" />
        <Model name="alarm_clock_01" position={[0.13, 0.555, 0.08]} rotation={[0, -0.5, 0]} scale={0.8} />
        <Model name="book_encyclopedia_set_01" position={[-0.12, 0.08, -0.06]} rotation={[0, 0, 0]} scale={[0.6, 0.85, 0.7]} />
      </Suspense>
      <group position={[-0.1, 0.555, -0.04]}><BedsideLamp /></group>
    </group>
  );
}

export function ReadingCorner() {
  return (
    <group>
      <Suspense fallback={null}>
        {/* Leather lounge chair angled toward the room centre */}
        <Model name="modern_arm_chair_01" position={[2.32, 0, 0.3]} rotation={[0, -Math.PI / 2 - 0.25, 0]} />
        <Model name="potted_plant_02" position={[2.6, 0, -1.92]} rotation={[0, 0.6, 0]} scale={1.05} />
        <Model name="wicker_basket_02" position={[0.1, 0, -2.76]} rotation={[0, 0.3, 0]} scale={0.85} />
      </Suspense>
    </group>
  );
}

export function Rug() {
  const teddy = usePbr('curly_teddy_natural', { repeat: [5, 3.5] });
  const shape = useMemo(() => {
    const value = new THREE.Shape();
    const w = 1.3;
    const d = 0.95;
    const r = 0.18;
    value.moveTo(-w + r, -d);
    value.lineTo(w - r, -d);
    value.quadraticCurveTo(w, -d, w, -d + r);
    value.lineTo(w, d - r);
    value.quadraticCurveTo(w, d, w - r, d);
    value.lineTo(-w + r, d);
    value.quadraticCurveTo(-w, d, -w, d - r);
    value.lineTo(-w, -d + r);
    value.quadraticCurveTo(-w, -d, -w + r, -d);
    return value;
  }, []);
  const geometry = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(shape, { depth: 0.012, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.01, bevelSegments: 2 });
    g.rotateX(-Math.PI / 2);
    // Re-map UVs to 0..1 so the pile texture tiles evenly.
    const uv = g.attributes.uv;
    for (let i = 0; i < uv.count; i += 1) uv.setXY(i, (uv.getX(i) + 1.3) / 2.6, (uv.getY(i) + 0.95) / 1.9);
    return g;
  }, [shape]);
  return (
    <mesh geometry={geometry} position={[0.55, 0.012, 0.75]} receiveShadow>
      <meshStandardMaterial color="#e6dccb" roughness={1} normalMap={teddy.normalMap} normalScale={[1.2, 1.2]} />
    </mesh>
  );
}

/* ---------------------------------------------------------------- */
/* PBR floor and walls                                                  */
/* ---------------------------------------------------------------- */

export function PbrSurfaces() {
  const floor = usePbr('laminate_floor_02', { repeat: [2.4, 2.4], rough: true });
  const back = usePbr('plastered_wall_04', { repeat: [2.2, 1.3] });
  const left = usePbr('plastered_wall_04', { repeat: [2.2, 1.3] });
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.0285, 0]} receiveShadow>
        <planeGeometry args={[2 * S, 2 * S]} />
        <meshStandardMaterial color="#e2c8a8" roughness={1} map={floor.map} normalMap={floor.normalMap} roughnessMap={floor.roughnessMap} envMapIntensity={0.6} />
      </mesh>
      <mesh position={[0, 1.75, -S + 0.002]} receiveShadow>
        <planeGeometry args={[2 * S, 3.5]} />
        <meshStandardMaterial color="#f1e9df" roughness={0.95} normalMap={back.normalMap} normalScale={[0.6, 0.6]} />
      </mesh>
      <mesh position={[-S + 0.002, 1.75, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[2 * S, 3.5]} />
        <meshStandardMaterial color="#e9e0d4" roughness={0.95} normalMap={left.normalMap} normalScale={[0.6, 0.6]} />
      </mesh>
    </group>
  );
}

/* ---------------------------------------------------------------- */
/* The plush (static version; the physics module swaps in a rigid body) */
/* ---------------------------------------------------------------- */

export function ClaudePlush() {
  const group = useRef();
  const squish = useRef(0);
  const { reducedMotion } = useRoom();
  useFrame((_, delta) => {
    squish.current = Math.max(0, squish.current - delta * 1.6);
    if (!group.current) return;
    const s = reducedMotion ? 0 : Math.sin(squish.current * 14) * squish.current * 0.12;
    group.current.scale.set(1.2 * (1 + s), 1.2 * (1 - s), 1.2 * (1 + s));
    actors.plush = group.current;
  });
  return (
    <Interactive label="Claude plush · squeeze" onSelect={() => { squish.current = 1; }} position={PLUSH_HOME.toArray()} labelOffset={[0, 0.35, 0]}>
      <group ref={group} rotation={[-0.32, 0.12, 0.08]} scale={1.2}>
        <Suspense fallback={null}><ClaudePlushMesh /></Suspense>
      </group>
    </Interactive>
  );
}
