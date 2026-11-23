'use client';

// Shared room primitives: palette, procedural textures, context, the Interactive wrapper and actor state.
import { Html, RoundedBox, Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export const FONT = '/fonts/space-grotesk-700.woff';
export const FONT_MEDIUM = '/fonts/space-grotesk-500.woff';
export const S = 3; // half width of the inner room
export const H = 3.5; // wall height
export const UP = new THREE.Vector3(0, 1, 0);
export const clamp01 = (value) => Math.min(1, Math.max(0, value));
export const smooth = (value) => value * value * (3 - 2 * value);

// A calm, materials-first palette: warm limewash walls, walnut joinery, oak floor, charcoal metal and a single
// terracotta accent. Colours are chosen so the room still reads as one object from the overview.
const palette = {
  plaster: '#efe8de',
  plasterShade: '#e5ddd1',
  timber: '#8d5d3b',
  timberDark: '#5e3b25',
  floorA: '#c99d70',
  floorB: '#bf9266',
  base: '#e8e0d4',
  lid: '#c4603a',
  rug: '#d8ccb7',
  ink: '#23201d',
  accent: '#c4572e',
  metal: '#2a2a2d',
  steel: '#8e9096',
  brass: '#b88d4e',
  linen: '#f6f1e8',
  sage: '#7f8b70',
};


// Procedural surface textures (generated once, shared). They are near-white so the material colour still
// sets the hue; the texture only adds grain and a little tonal variation, like a real finish would.
const textureCache = {};
function seeded(seed) {
  let value = seed;
  return () => { value = (value * 16807) % 2147483647; return value / 2147483647; };
}
function makeCanvasTexture(key, width, height, paint, { repeat = [1, 1], rotate = false } = {}) {
  if (typeof document === 'undefined') return null;
  if (textureCache[key]) return textureCache[key];
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  paint(canvas.getContext('2d'), width, height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(...repeat);
  texture.anisotropy = 4;
  if (rotate) { texture.center.set(0.5, 0.5); texture.rotation = Math.PI / 2; }
  textureCache[key] = texture;
  return texture;
}
function paintWood(context, width, height, seed = 3) {
  const random = seeded(seed);
  context.fillStyle = '#f4ede4';
  context.fillRect(0, 0, width, height);
  // Long grain lines running along the board (vertical in texture space).
  for (let line = 0; line < 70; line += 1) {
    const x = random() * width;
    const tone = 200 + Math.floor(random() * 40);
    context.strokeStyle = `rgba(${tone - 70}, ${tone - 105}, ${tone - 140}, ${0.05 + random() * 0.12})`;
    context.lineWidth = 0.6 + random() * 2.2;
    context.beginPath();
    context.moveTo(x, 0);
    for (let y = 0; y <= height; y += 16) context.lineTo(x + Math.sin(y * 0.012 + line) * (3 + random() * 4), y);
    context.stroke();
  }
  // A couple of soft knots.
  for (let knot = 0; knot < 2; knot += 1) {
    const gradient = context.createRadialGradient(random() * width, random() * height, 1, width * 0.5, height * 0.5, 40);
    gradient.addColorStop(0, 'rgba(120, 80, 50, 0.08)');
    gradient.addColorStop(1, 'rgba(120, 80, 50, 0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);
  }
}
function paintPlaster(context, width, height) {
  const random = seeded(11);
  context.fillStyle = '#f7f4ef';
  context.fillRect(0, 0, width, height);
  for (let blot = 0; blot < 220; blot += 1) {
    const x = random() * width;
    const y = random() * height;
    const r = 8 + random() * 40;
    const gradient = context.createRadialGradient(x, y, 0, x, y, r);
    const dark = random() > 0.5;
    gradient.addColorStop(0, dark ? 'rgba(150, 130, 110, 0.035)' : 'rgba(255, 255, 255, 0.05)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    context.fillStyle = gradient;
    context.fillRect(x - r, y - r, r * 2, r * 2);
  }
}
function paintFabric(context, width, height) {
  context.fillStyle = '#f2efea';
  context.fillRect(0, 0, width, height);
  for (let y = 0; y < height; y += 2) {
    context.fillStyle = `rgba(90, 80, 70, ${y % 4 ? 0.05 : 0.09})`;
    context.fillRect(0, y, width, 1);
  }
  for (let x = 0; x < width; x += 2) {
    context.fillStyle = `rgba(90, 80, 70, ${x % 4 ? 0.03 : 0.07})`;
    context.fillRect(x, 0, 1, height);
  }
}
const woodAlong = () => makeCanvasTexture('wood-v', 256, 512, (c, w, h) => paintWood(c, w, h, 3));
const woodAcross = () => makeCanvasTexture('wood-h', 256, 512, (c, w, h) => paintWood(c, w, h, 5), { rotate: true });
function paintShingles(context, width, height) {
  const random = seeded(11);
  context.fillStyle = '#efe6dc';
  context.fillRect(0, 0, width, height);
  const rows = 8;
  const rowH = height / rows;
  for (let row = 0; row < rows; row += 1) {
    const tiles = 6;
    const tileW = width / tiles;
    const shift = row % 2 ? tileW / 2 : 0;
    for (let tile = -1; tile <= tiles; tile += 1) {
      const x = tile * tileW + shift;
      const shade = 215 + Math.floor(random() * 40);
      context.fillStyle = `rgb(${shade}, ${shade - 8}, ${shade - 14})`;
      context.beginPath();
      context.roundRect(x + 2, row * rowH + 1, tileW - 4, rowH - 2, [0, 0, 10, 10]);
      context.fill();
    }
    context.fillStyle = 'rgba(60, 30, 20, 0.35)';
    context.fillRect(0, row * rowH + rowH - 3, width, 3);
  }
}
function paintBrick(context, width, height) {
  const random = seeded(5);
  context.fillStyle = '#d9cfc6';
  context.fillRect(0, 0, width, height);
  const rows = 8;
  const rowH = height / rows;
  for (let row = 0; row < rows; row += 1) {
    const shift = row % 2 ? width / 8 : 0;
    for (let brick = -1; brick < 4; brick += 1) {
      const shade = 200 + Math.floor(random() * 55);
      context.fillStyle = `rgb(${shade}, ${shade - 20}, ${shade - 30})`;
      context.fillRect(brick * (width / 4) + shift + 2, row * rowH + 2, width / 4 - 4, rowH - 4);
    }
  }
}
const shingleMap = () => makeCanvasTexture('shingles', 256, 256, paintShingles, { repeat: [3.5, 2.6] });
const brickMap = () => makeCanvasTexture('brick', 128, 128, paintBrick, { repeat: [1, 1.6] });
const plasterMap = () => makeCanvasTexture('plaster', 512, 512, paintPlaster, { repeat: [1.5, 1.5] });
const fabricMap = () => makeCanvasTexture('fabric', 128, 128, paintFabric, { repeat: [4, 4] });

function Block({ args, color, roughness = 0.82, metalness = 0, map, castShadow = true, receiveShadow = true, ...props }) {
  return (
    <mesh castShadow={castShadow} receiveShadow={receiveShadow} {...props}>
      <boxGeometry args={args} />
      <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} map={map ?? null} />
    </mesh>
  );
}

// Cloth-bound book with a printed spine label.
function Book({ position, size = [0.09, 0.42, 0.3], color, tilt = 0, title }) {
  return (
    <group position={position} rotation={[0, 0, tilt]}>
      <RoundedBox args={size} radius={0.008} smoothness={2} castShadow receiveShadow>
        <meshStandardMaterial color={color} roughness={0.7} />
      </RoundedBox>
      {/* Page block visible at the top */}
      <Block args={[size[0] - 0.012, 0.004, size[2] - 0.02]} color="#efe6d4" position={[0, size[1] / 2 + 0.001, 0.004]} castShadow={false} />
      <Block args={[size[0] + 0.001, 0.012, 0.004]} color={palette.brass} metalness={0.6} roughness={0.35} position={[0, size[1] * 0.36, size[2] / 2 + 0.001]} castShadow={false} />
      {title && (
        <Text font={FONT} position={[0, -0.02, size[2] / 2 + 0.003]} rotation={[0, 0, Math.PI / 2]} fontSize={Math.min(0.034, size[0] * 0.42)} color="#f3ead9" anchorX="center" anchorY="middle" letterSpacing={0.08} maxWidth={size[1] * 0.8}>
          {title}
        </Text>
      )}
    </group>
  );
}

// R3F does not forward React context into the Canvas, so the scene gets its own provider.
const RoomContext = createContext(null);
const useRoom = () => useContext(RoomContext);

// Wraps a room object: lifts slightly on hover, shows a small label, runs `onSelect` on click/tap.
function Interactive({ label, onSelect, labelOffset = [0, 0.4, 0], children, ...props }) {
  const group = useRef();
  const [hovered, setHovered] = useState(false);
  const { reducedMotion } = useRoom();
  useFrame((_, delta) => {
    if (!group.current) return;
    const target = hovered && !reducedMotion ? 0.035 : 0;
    group.current.position.y += (target - group.current.position.y) * (1 - Math.pow(0.001, delta));
  });
  useEffect(() => () => { document.body.style.cursor = ''; }, []);
  return (
    <group {...props}>
      <group
        ref={group}
        onPointerOver={(event) => { event.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = ''; }}
        onClick={(event) => { event.stopPropagation(); if (event.delta > 6) return; onSelect?.(); }}
      >
        {children}
      </group>
      {hovered && (
        <Html position={labelOffset} center zIndexRange={[25, 0]} wrapperClass="box-tour-html">
          <span className="box-tour-object-label">{label}</span>
        </Html>
      )}
    </group>
  );
}

function Mug({ position, color = palette.accent, rotation = 0 }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.05, 0.046, 0.11, 24]} />
        <meshStandardMaterial color={color} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.052, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.044, 20]} />
        <meshStandardMaterial color="#3b2416" roughness={0.2} />
      </mesh>
      <mesh position={[0.058, 0, 0]} castShadow>
        <torusGeometry args={[0.028, 0.008, 8, 16]} />
        <meshStandardMaterial color={color} roughness={0.35} />
      </mesh>
    </group>
  );
}

const angleLerp = (from, to, t) => {
  let delta = (to - from) % (Math.PI * 2);
  if (delta > Math.PI) delta -= Math.PI * 2;
  if (delta < -Math.PI) delta += Math.PI * 2;
  return from + delta * t;
};

// Shared, frame-by-frame state. Each actor writes its own entry in useFrame and reads the others, so the
// person, the robot, the cat and the desk props can react to each other without React re-renders.
const actors = {
  cat: { sleeping: false, napLeft: 0, petting: false, position: new THREE.Vector3() },
  human: { mugInHand: false, mouse: new THREE.Vector2(), atDesk: true, head: new THREE.Vector3(-1.82, 1.7, -0.47) },
  robot: { position: new THREE.Vector3(0.6, 1.5, 1.6), helping: false },
};

export {
  palette, seeded, makeCanvasTexture, woodAlong, woodAcross, shingleMap, brickMap, plasterMap, fabricMap,
  Block, Book, RoomContext, useRoom, Interactive, Mug, angleLerp, actors,
};
