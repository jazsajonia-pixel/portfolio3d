'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, Instance, Instances, RoundedBox, Text } from '@react-three/drei';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, CaretDown, Envelope, GithubLogo, LinkedinLogo } from 'phosphor-react';
import * as THREE from 'three';

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

const projects = [
  { title: 'Retext', type: 'Android image editor', stack: 'Flutter · OCR · pixel-safe repair', description: 'Change text inside images while preserving untouched pixels.', color: '#ff8b55', href: '/projects#retext', github: 'https://github.com/jazsajonia-pixel/retext' },
  { title: 'Chrono', type: 'AI coding workspace', stack: 'React · TypeScript · GitHub', description: 'Connect GitHub, review changes, and preview an app with an AI coding assistant.', color: '#9b8cff', href: '/projects#chrono', github: 'https://github.com/jazsajonia-pixel/mobdevai', live: 'https://chrono-tau.vercel.app/' },
  { title: 'Petalbound', type: 'Pixel-art adventure', stack: 'Godot 4 · GDScript · Android', description: 'An offline action adventure with quests, guardian fights, crafting, and touch controls.', color: '#6fe0b1', href: '/projects#petalbound', github: 'https://github.com/jazsajonia-pixel/petalbound-godot' },
  { title: 'FlowPilot AI', type: 'Workflow automation', stack: 'React · AI providers · graph editor', description: 'A visual builder for triggers, AI steps, conditions, and actions.', color: '#69c8ff', href: '/projects#flowpilot', github: 'https://github.com/jazsajonia-pixel/flowpilot', live: 'https://flowpilot-sage-delta.vercel.app/' },
  { title: 'MarketHub', type: 'Marketplace platform', stack: 'React · Prisma · PostgreSQL', description: 'Buyer, seller, and admin flows in a marketplace prototype.', color: '#ffca62', href: '/projects#markethub', github: 'https://github.com/jazsajonia-pixel/markethub' },
];

const skills = ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Next.js', 'Three.js', 'Node.js', 'Vite', 'Flutter', 'Kotlin', 'Godot 4', 'Git', 'GitHub'];

const FONT = '/fonts/space-grotesk-700.woff';
const FONT_MEDIUM = '/fonts/space-grotesk-500.woff';

/* ------------------------------------------------------------------ */
/* Scroll timeline (scroll progress 0 → 1 is the single source of truth) */
/* ------------------------------------------------------------------ */

const TIMELINE = {
  welcomeEnd: 0.035,
  growStart: 0.03, growEnd: 0.19,
  turnStart: 0.03, turnEnd: 0.21,
  openStart: 0.2, openEnd: 0.32,
  panelFadeStart: 0.3, panelFadeEnd: 0.36,
};

// Hold windows where a context card is shown. `focus` is the scroll point used by the step navigation.
const SECTIONS = [
  { id: 'intro', label: 'Welcome', start: 0, end: TIMELINE.welcomeEnd, focus: 0 },
  { id: 'display', label: 'About and tools', start: 0.515, end: 0.625, focus: 0.57 },
  { id: 'computer', label: 'Projects', start: 0.685, end: 0.815, focus: 0.75 },
  { id: 'notes', label: 'Notes and contact', start: 0.885, end: 1.01, focus: 1 },
];

const clamp01 = (value) => Math.min(1, Math.max(0, value));
const range = (value, start, end) => clamp01((value - start) / (end - start));
const smooth = (value) => value * value * (3 - 2 * value);
const easeInOut = (value) => (value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2);

/* ------------------------------------------------------------------ */
/* Room dimensions (local units; floor top is y = 0)                    */
/* ------------------------------------------------------------------ */

const S = 3; // half width of the inner room
const H = 3.5; // wall height
const T = 0.16; // wall thickness
const BASE = 0.5; // visible floor thickness
const ROOM_CENTER_Y = H / 2;
const FINAL_YAW = -Math.PI / 4; // the open corner faces the viewer
const START_YAW = 0.42;
const Y_AXIS = new THREE.Vector3(0, 1, 0);

const palette = {
  plaster: '#f6e7d2',
  plasterShade: '#efdcc2',
  timber: '#c98a52',
  timberDark: '#a86c3a',
  floorA: '#d9a066',
  floorB: '#cf9459',
  base: '#f3e4cf',
  lid: '#e98f45',
  rug: '#f4c15d',
  ink: '#3b2a1e',
};

// Convert a room-local point into world space for the opened box.
function toWorld([x, y, z]) {
  return new THREE.Vector3(x, y - ROOM_CENTER_Y, z).applyAxisAngle(Y_AXIS, FINAL_YAW);
}
function dirToWorld([x, y, z]) {
  return new THREE.Vector3(x, y, z).normalize().applyAxisAngle(Y_AXIS, FINAL_YAW);
}

/* ------------------------------------------------------------------ */
/* Camera tour                                                          */
/* ------------------------------------------------------------------ */

// Each stop: a look target, the direction the camera sits in from that target, the subject size that must fit,
// and where the information card sits (so the subject is framed in the free part of the screen).
const STOPS = {
  box: { look: new THREE.Vector3(0, 0.1, 0), dir: new THREE.Vector3(0, 0.36, 1).normalize(), w: 11.5, h: 9.2, wp: 10.2, hp: 9.2, card: 'none', lift: 0.07 },
  overview: { look: new THREE.Vector3(0, -0.15, 0), dir: new THREE.Vector3(0, 0.52, 1).normalize(), w: 9.4, h: 7.2, wp: 9.8, hp: 7.2, card: 'none', lift: 0 },
  display: { look: toWorld([0.75, 1.95, -3]), dir: dirToWorld([0.16, 0.1, 1]), w: 4.3, h: 2.9, wp: 2.5, hp: 2.7, card: 'left', lift: 0, lookPortrait: toWorld([0.25, 2.1, -3]) },
  computer: { look: toWorld([-3, 1.55, -0.3]), dir: dirToWorld([1, 0.2, 0.12]), w: 3.3, h: 2.2, wp: 2.55, hp: 2.3, card: 'right', lift: 0 },
  notes: { look: toWorld([0.75, 0.5, 0.85]), dir: dirToWorld([0.55, 0.95, 0.75]), w: 2.5, h: 1.8, wp: 2.25, hp: 1.9, card: 'left', lift: 0 },
};

const KEYFRAMES = [
  { at: 0, stop: 'box' },
  { at: 0.21, stop: 'box' },
  { at: 0.38, stop: 'overview' },
  { at: 0.43, stop: 'overview' },
  { at: 0.53, stop: 'display' },
  { at: 0.61, stop: 'display' },
  { at: 0.7, stop: 'computer' },
  { at: 0.8, stop: 'computer' },
  { at: 0.9, stop: 'notes' },
  { at: 1, stop: 'notes' },
];

const FOV = 38;
const TAN = Math.tan(THREE.MathUtils.degToRad(FOV / 2));

function frameStop(stop, width, height) {
  const aspect = width / height;
  const portrait = aspect < 0.95;
  // Fraction of the screen left free next to (or above) the information card.
  let freeW = 1;
  let freeH = 1;
  let shiftX = 0;
  let shiftY = stop.lift;
  if (stop.card !== 'none') {
    if (portrait) {
      freeH = 0.56;
      shiftY = 0.22;
    } else {
      freeW = 0.6;
      shiftX = stop.card === 'left' ? 0.2 : -0.2;
    }
  }
  const w = portrait ? stop.wp : stop.w;
  const h = portrait ? stop.hp : stop.h;
  const distance = Math.max(w / (2 * TAN * aspect * freeW), h / (2 * TAN * freeH));
  const look = portrait && stop.lookPortrait ? stop.lookPortrait : stop.look;
  return {
    position: look.clone().addScaledVector(stop.dir, distance),
    look: look.clone(),
    shiftX,
    shiftY,
  };
}

function CameraTour({ progressRef, reducedMotion }) {
  const { camera, size, gl } = useThree();
  const current = useRef(null);

  useFrame((_, delta) => {
    const p = progressRef.current.smooth;
    let index = 0;
    while (index < KEYFRAMES.length - 2 && p > KEYFRAMES[index + 1].at) index += 1;
    const a = KEYFRAMES[index];
    const b = KEYFRAMES[index + 1];
    const blend = easeInOut(range(p, a.at, b.at));
    const fa = frameStop(STOPS[a.stop], size.width, size.height);
    const fb = a.stop === b.stop ? fa : frameStop(STOPS[b.stop], size.width, size.height);

    const target = {
      position: fa.position.clone().lerp(fb.position, blend),
      look: fa.look.clone().lerp(fb.look, blend),
      shiftX: THREE.MathUtils.lerp(fa.shiftX, fb.shiftX, blend),
      shiftY: THREE.MathUtils.lerp(fa.shiftY, fb.shiftY, blend),
    };

    if (!current.current || reducedMotion) {
      current.current = target;
    } else {
      const k = 1 - Math.pow(0.004, Math.min(delta, 0.1));
      current.current.position.lerp(target.position, k);
      current.current.look.lerp(target.look, k);
      current.current.shiftX = THREE.MathUtils.lerp(current.current.shiftX, target.shiftX, k);
      current.current.shiftY = THREE.MathUtils.lerp(current.current.shiftY, target.shiftY, k);
    }

    camera.position.copy(current.current.position);
    camera.lookAt(current.current.look);
    // Shift the rendered image so the focal subject sits in the space the card leaves free.
    camera.setViewOffset(size.width, size.height, -current.current.shiftX * size.width, current.current.shiftY * size.height, size.width, size.height);
    camera.updateProjectionMatrix();
    if (typeof window !== 'undefined' && window.__tourDebug) window.__tourDebug.info = { calls: gl.info.render.calls, triangles: gl.info.render.triangles };
  });

  return null;
}

/* ------------------------------------------------------------------ */
/* Small helpers                                                       */
/* ------------------------------------------------------------------ */

function Block({ args, color, roughness = 0.82, castShadow = true, receiveShadow = true, ...props }) {
  return (
    <mesh castShadow={castShadow} receiveShadow={receiveShadow} {...props}>
      <boxGeometry args={args} />
      <meshStandardMaterial color={color} roughness={roughness} />
    </mesh>
  );
}

function Plant({ position, scale = 1, pot = '#e7a27c' }) {
  return (
    <group position={position} scale={scale}>
      <mesh castShadow receiveShadow position={[0, 0.13, 0]}>
        <cylinderGeometry args={[0.14, 0.11, 0.26, 16]} />
        <meshStandardMaterial color={pot} roughness={0.85} />
      </mesh>
      {[[0, 0.38, 0, 0.17], [0.09, 0.33, 0.05, 0.12], [-0.08, 0.34, -0.04, 0.13], [0.02, 0.5, -0.03, 0.11]].map(([x, y, z, r], index) => (
        <mesh key={index} castShadow position={[x, y, z]}>
          <icosahedronGeometry args={[r, 1]} />
          <meshStandardMaterial color={index % 2 ? '#7cbf6a' : '#5fa856'} roughness={0.9} flatShading />
        </mesh>
      ))}
    </group>
  );
}

function Book({ position, size = [0.09, 0.42, 0.3], color, tilt = 0 }) {
  return <Block args={size} color={color} roughness={0.78} position={position} rotation={[0, 0, tilt]} />;
}

/* ------------------------------------------------------------------ */
/* Display / shelf wall (back wall, z = -S)                             */
/* ------------------------------------------------------------------ */

function DisplayWall() {
  return (
    <group>
      {/* Name sign */}
      <group position={[0.1, 2.88, -S + 0.06]}>
        <RoundedBox args={[1.9, 0.62, 0.08]} radius={0.06} smoothness={3} castShadow>
          <meshStandardMaterial color="#fff8ee" roughness={0.6} />
        </RoundedBox>
        <Text font={FONT} position={[0, 0.06, 0.05]} fontSize={0.27} color="#e2703a" anchorX="center" anchorY="middle" letterSpacing={0.06}>
          JAZZ
        </Text>
        <Text font={FONT_MEDIUM} position={[0, -0.17, 0.05]} fontSize={0.075} color={palette.ink} anchorX="center" anchorY="middle" letterSpacing={0.14}>
          SOFTWARE BUILDER
        </Text>
      </group>

      {/* Picture frames */}
      {[
        [1.62, 1.95, 0.5, 0.62, '#b9d7e8'],
        [2.24, 2.06, 0.5, 0.4, '#f3c7b0'],
        [2.24, 1.6, 0.5, 0.36, '#c9e3c4'],
        [1.62, 1.38, 0.5, 0.36, '#e6d1f0'],
      ].map(([x, y, w, h, art], index) => (
        <group key={index} position={[x, y, -S + 0.04]}>
          <Block args={[w, h, 0.05]} color={palette.timberDark} />
          <mesh position={[0, 0, 0.03]}>
            <planeGeometry args={[w - 0.09, h - 0.09]} />
            <meshStandardMaterial color={art} roughness={0.9} />
          </mesh>
          <mesh position={[0.02, -0.02, 0.031]} rotation={[0, 0, index * 0.7]}>
            <circleGeometry args={[Math.min(w, h) * 0.18, 16]} />
            <meshStandardMaterial color="#fff6e6" roughness={0.9} />
          </mesh>
        </group>
      ))}

      {/* Wall clock */}
      <group position={[-1.55, 2.62, -S + 0.05]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.22, 0.22, 0.05, 28]} />
          <meshStandardMaterial color={palette.timber} roughness={0.7} />
        </mesh>
        <mesh position={[0, 0, 0.03]}>
          <circleGeometry args={[0.18, 28]} />
          <meshStandardMaterial color="#fffaf1" roughness={0.8} />
        </mesh>
        <Block args={[0.015, 0.12, 0.01]} color={palette.ink} position={[0, 0.05, 0.04]} castShadow={false} />
        <Block args={[0.09, 0.015, 0.01]} color={palette.ink} position={[0.04, 0, 0.04]} castShadow={false} />
      </group>

      {/* Floating shelves with labelled tool groups */}
      {[
        { y: 2.15, label: 'WEB' },
        { y: 1.5, label: 'MOBILE · GAMES' },
      ].map(({ y, label }) => (
        <group key={label} position={[0.1, y, -S + 0.2]}>
          <Block args={[2.0, 0.07, 0.38]} color={palette.timber} />
          <Block args={[0.62, 0.11, 0.015]} color="#fff8ee" position={[0, -0.005, 0.2]} castShadow={false} />
          <Text font={FONT} position={[0, -0.005, 0.21]} fontSize={0.05} color={palette.ink} anchorX="center" anchorY="middle" letterSpacing={0.12}>
            {label}
          </Text>
        </group>
      ))}
      {/* Upper shelf: web tools as books and blocks */}
      <group position={[0.1, 2.19, -S + 0.2]}>
        <Book position={[-0.82, 0.21, 0]} color="#e98f6d" />
        <Book position={[-0.72, 0.19, 0]} size={[0.08, 0.38, 0.28]} color="#8fb8de" />
        <Book position={[-0.62, 0.2, 0]} size={[0.09, 0.4, 0.29]} color="#f2c86b" />
        <Book position={[-0.5, 0.18, 0]} size={[0.08, 0.36, 0.27]} color="#b49ad8" tilt={-0.22} />
        <RoundedBox args={[0.26, 0.26, 0.26]} radius={0.04} position={[0.1, 0.13, 0]} castShadow>
          <meshStandardMaterial color="#61c3e8" roughness={0.6} />
        </RoundedBox>
        <RoundedBox args={[0.2, 0.2, 0.2]} radius={0.03} position={[0.42, 0.1, 0.02]} rotation={[0, 0.5, 0]} castShadow>
          <meshStandardMaterial color="#f5d36a" roughness={0.6} />
        </RoundedBox>
        <Plant position={[0.78, 0, 0]} scale={0.62} pot="#f2b38f" />
      </group>
      {/* Lower shelf: a phone, a game controller and a trophy */}
      <group position={[0.1, 1.54, -S + 0.2]}>
        <RoundedBox args={[0.2, 0.36, 0.035]} radius={0.02} position={[-0.68, 0.19, -0.06]} rotation={[-0.18, 0.2, 0]} castShadow>
          <meshStandardMaterial color="#2f3446" roughness={0.45} />
        </RoundedBox>
        <mesh position={[-0.68, 0.2, -0.035]} rotation={[-0.18, 0.2, 0]}>
          <planeGeometry args={[0.16, 0.29]} />
          <meshStandardMaterial color="#7ad3c0" emissive="#7ad3c0" emissiveIntensity={0.35} />
        </mesh>
        <group position={[-0.12, 0.07, 0.02]}>
          <RoundedBox args={[0.42, 0.11, 0.2]} radius={0.05} castShadow>
            <meshStandardMaterial color="#f07f62" roughness={0.55} />
          </RoundedBox>
          {[-0.13, 0.13].map((x) => (
            <mesh key={x} position={[x, 0.065, 0]} castShadow>
              <cylinderGeometry args={[0.035, 0.035, 0.03, 12]} />
              <meshStandardMaterial color="#fff3e2" roughness={0.5} />
            </mesh>
          ))}
        </group>
        <group position={[0.45, 0, 0]}>
          <Block args={[0.18, 0.06, 0.14]} color={palette.timberDark} position={[0, 0.03, 0]} />
          <mesh position={[0, 0.19, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.045, 0.22, 16]} />
            <meshStandardMaterial color="#e9b949" roughness={0.35} metalness={0.4} />
          </mesh>
        </group>
        <Book position={[0.78, 0.17, 0]} size={[0.09, 0.34, 0.27]} color="#9cc59a" />
        <Book position={[0.88, 0.16, 0]} size={[0.08, 0.32, 0.26]} color="#e7b0c4" />
      </group>

      {/* Low cabinet under the shelves */}
      <group position={[0.1, 0, -S + 0.34]}>
        <Block args={[2.1, 0.7, 0.62]} color="#f4e2c8" position={[0, 0.35, 0]} />
        <Block args={[2.18, 0.06, 0.68]} color={palette.timber} position={[0, 0.73, 0]} />
        {[-0.52, 0.52].map((x) => (
          <group key={x} position={[x, 0.36, 0.315]}>
            <Block args={[0.96, 0.54, 0.02]} color="#f9ecd8" castShadow={false} />
            <Block args={[0.2, 0.035, 0.03]} color={palette.timberDark} position={[0, 0.15, 0.02]} castShadow={false} />
          </group>
        ))}
        {/* Lava lamp and a record */}
        <group position={[0.75, 0.76, 0]}>
          <mesh castShadow position={[0, 0.06, 0]}>
            <cylinderGeometry args={[0.06, 0.08, 0.12, 14]} />
            <meshStandardMaterial color="#c9a07a" roughness={0.5} metalness={0.2} />
          </mesh>
          <mesh position={[0, 0.25, 0]}>
            <cylinderGeometry args={[0.035, 0.06, 0.26, 14]} />
            <meshStandardMaterial color="#ff8c5a" emissive="#ff7a45" emissiveIntensity={0.9} roughness={0.3} />
          </mesh>
        </group>
        <mesh position={[-0.35, 0.765, 0]} castShadow>
          <cylinderGeometry args={[0.26, 0.26, 0.012, 32]} />
          <meshStandardMaterial color="#2b2522" roughness={0.4} />
        </mesh>
        <mesh position={[-0.35, 0.773, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.004, 20]} />
          <meshStandardMaterial color="#f2c86b" roughness={0.6} />
        </mesh>
      </group>

      {/* Tall floor plant in the right corner */}
      <Plant position={[2.55, 0, -2.45]} scale={1.55} pot="#d9896a" />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Computer / workstation wall (left wall, x = -S)                      */
/* ------------------------------------------------------------------ */

function drawMonitorScreen(canvas, project, index, total) {
  const context = canvas.getContext('2d');
  const { width, height } = canvas;
  const gradient = context.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#1f2638');
  gradient.addColorStop(1, '#2d3550');
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);

  // Window chrome
  context.fillStyle = 'rgba(255,255,255,0.08)';
  context.fillRect(0, 0, width, 54);
  ['#ff7b6b', '#ffcb5c', '#62d58e'].forEach((color, dot) => {
    context.fillStyle = color;
    context.beginPath();
    context.arc(36 + dot * 34, 27, 10, 0, Math.PI * 2);
    context.fill();
  });
  context.fillStyle = 'rgba(255,255,255,0.55)';
  context.font = '500 22px "Space Grotesk", system-ui, sans-serif';
  context.textAlign = 'right';
  context.fillText(`${index + 1} / ${total}`, width - 32, 35);

  // Accent artwork
  context.fillStyle = project.color;
  context.globalAlpha = 0.9;
  context.beginPath();
  context.arc(width - 170, height - 150, 120, 0, Math.PI * 2);
  context.fill();
  context.globalAlpha = 0.35;
  context.beginPath();
  context.arc(width - 300, height - 70, 80, 0, Math.PI * 2);
  context.fill();
  context.globalAlpha = 1;

  // Text
  context.textAlign = 'left';
  context.fillStyle = project.color;
  context.font = '500 26px "Space Grotesk", system-ui, sans-serif';
  context.fillText(project.type.toUpperCase(), 56, 140);
  context.fillStyle = '#fff6ea';
  context.font = '700 92px "Space Grotesk", system-ui, sans-serif';
  context.fillText(project.title, 52, 240);
  context.fillStyle = 'rgba(255,246,234,0.7)';
  context.font = '500 26px "Space Grotesk", system-ui, sans-serif';
  context.fillText(project.stack, 56, 300);

  // Fake UI rows
  context.fillStyle = 'rgba(255,255,255,0.12)';
  [380, 430, 480].forEach((y, row) => {
    context.fillRect(56, y, 420 - row * 90, 22);
  });
  context.fillStyle = project.color;
  context.fillRect(56, 540, 160, 40);
}

function MonitorScreen({ project, index }) {
  const canvas = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const element = document.createElement('canvas');
    element.width = 1024;
    element.height = 640;
    return element;
  }, []);
  const texture = useMemo(() => {
    if (!canvas) return null;
    const value = new THREE.CanvasTexture(canvas);
    value.colorSpace = THREE.SRGBColorSpace;
    value.anisotropy = 4;
    return value;
  }, [canvas]);

  useEffect(() => {
    if (!canvas || !texture) return undefined;
    let cancelled = false;
    const draw = () => {
      if (cancelled) return;
      drawMonitorScreen(canvas, project, index, projects.length);
      texture.needsUpdate = true;
    };
    draw();
    if (document.fonts?.ready) document.fonts.ready.then(draw);
    return () => { cancelled = true; };
  }, [canvas, texture, project, index]);

  useEffect(() => () => texture?.dispose(), [texture]);

  return (
    <mesh position={[0, 0, 0.041]}>
      <planeGeometry args={[1.2, 0.75]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}

function Workstation({ project, projectIndex, controlsVisible, onPrevious, onNext }) {
  const deskX = -S + 0.42; // centre of the desk depth
  return (
    <group>
      {/* Window toward the front of the wall */}
      <group position={[-S + 0.03, 2.05, 1.95]} rotation={[0, Math.PI / 2, 0]}>
        <Block args={[1.3, 1.25, 0.08]} color={palette.timber} />
        <mesh position={[0, 0, 0.045]}>
          <planeGeometry args={[1.12, 1.07]} />
          <meshStandardMaterial color="#ffe3b3" emissive="#ffd59a" emissiveIntensity={0.55} roughness={0.4} />
        </mesh>
        <Block args={[0.05, 1.07, 0.04]} color={palette.timber} position={[0, 0, 0.06]} castShadow={false} />
        <Block args={[1.12, 0.05, 0.04]} color={palette.timber} position={[0, 0, 0.06]} castShadow={false} />
        <Block args={[1.45, 0.07, 0.22]} color={palette.timberDark} position={[0, -0.66, 0.1]} />
        <Plant position={[0.42, -0.62, 0.12]} scale={0.5} pot="#f2b38f" />
      </group>

      {/* Pegboard shelf with a projects plaque */}
      <group position={[-S + 0.05, 2.62, -0.3]} rotation={[0, Math.PI / 2, 0]}>
        <Block args={[2.3, 0.8, 0.04]} color="#efd2ac" />
        <Instances limit={44}>
          <circleGeometry args={[0.018, 8]} />
          <meshBasicMaterial color="#c9a57c" />
          {Array.from({ length: 44 }, (_, hole) => (
            <Instance key={hole} position={[-1.0 + (hole % 11) * 0.2, -0.3 + Math.floor(hole / 11) * 0.2, 0.021]} />
          ))}
        </Instances>
        <RoundedBox args={[0.82, 0.24, 0.04]} radius={0.04} position={[-0.55, 0.12, 0.05]} castShadow>
          <meshStandardMaterial color="#9b7be0" roughness={0.6} />
        </RoundedBox>
        <Text font={FONT} position={[-0.55, 0.12, 0.075]} fontSize={0.1} color="#ffffff" anchorX="center" anchorY="middle" letterSpacing={0.1}>
          PROJECTS
        </Text>
        <Block args={[0.9, 0.05, 0.2]} color={palette.timber} position={[0.55, -0.2, 0.1]} />
        <Book position={[0.25, -0.03, 0.1]} size={[0.07, 0.3, 0.18]} color="#8fb8de" />
        <Book position={[0.33, -0.04, 0.1]} size={[0.07, 0.28, 0.18]} color="#e98f6d" />
        <Book position={[0.41, -0.05, 0.1]} size={[0.06, 0.26, 0.17]} color="#f2c86b" tilt={-0.2} />
        <RoundedBox args={[0.16, 0.16, 0.16]} radius={0.03} position={[0.78, -0.09, 0.1]} castShadow>
          <meshStandardMaterial color="#7cc9a0" roughness={0.6} />
        </RoundedBox>
      </group>

      {/* Desk */}
      <group position={[deskX, 0, -0.3]}>
        <Block args={[0.86, 0.07, 2.5]} color={palette.timber} position={[0, 0.96, 0]} />
        {/* Drawer unit */}
        <group position={[0, 0, 0.82]}>
          <Block args={[0.78, 0.92, 0.72]} color="#f6e8d3" position={[0, 0.46, 0]} />
          {[0.68, 0.24].map((y) => (
            <group key={y} position={[0.395, y, 0]}>
              <Block args={[0.02, 0.36, 0.64]} color="#fbf0de" castShadow={false} />
              <Block args={[0.03, 0.035, 0.2]} color={palette.timberDark} position={[0.02, 0.1, 0]} castShadow={false} />
            </group>
          ))}
        </group>
        {/* Legs */}
        {[[-0.36, -1.18], [0.36, -1.18]].map(([x, z]) => (
          <Block key={`${x}${z}`} args={[0.07, 0.92, 0.07]} color="#f6e8d3" position={[x, 0.46, z]} />
        ))}

        {/* Monitor */}
        <group position={[-0.18, 1.0, -0.05]} rotation={[0, Math.PI / 2, 0]}>
          <Block args={[0.34, 0.03, 0.22]} color="#e9ddcd" position={[0, 0.015, 0]} roughness={0.5} />
          <Block args={[0.08, 0.32, 0.06]} color="#e9ddcd" position={[0, 0.18, -0.02]} roughness={0.5} />
          <group position={[0, 0.66, 0.02]}>
            <RoundedBox args={[1.32, 0.86, 0.07]} radius={0.04} smoothness={3} castShadow>
              <meshStandardMaterial color="#efe4d6" roughness={0.45} />
            </RoundedBox>
            <MonitorScreen project={project} index={projectIndex} />
            {/* Webcam */}
            <mesh position={[0, 0.405, 0.04]}>
              <sphereGeometry args={[0.018, 10, 8]} />
              <meshStandardMaterial color="#29303f" roughness={0.3} />
            </mesh>
          </group>
          {/* Arrow controls anchored beside the monitor */}
          <Html position={[-0.98, 0.66, 0.05]} center zIndexRange={[20, 0]} wrapperClass="box-tour-html">
            <button type="button" className={`box-tour-arrow${controlsVisible ? ' is-visible' : ''}`} onClick={onPrevious} aria-label="Previous project" tabIndex={controlsVisible ? 0 : -1} aria-hidden={!controlsVisible}>
              <ArrowLeft size={22} weight="bold" />
            </button>
          </Html>
          <Html position={[0.98, 0.66, 0.05]} center zIndexRange={[20, 0]} wrapperClass="box-tour-html">
            <button type="button" className={`box-tour-arrow${controlsVisible ? ' is-visible' : ''}`} onClick={onNext} aria-label="Next project" tabIndex={controlsVisible ? 0 : -1} aria-hidden={!controlsVisible}>
              <ArrowRight size={22} weight="bold" />
            </button>
          </Html>
        </group>

        {/* Keyboard */}
        <group position={[0.16, 0.995, -0.05]} rotation={[0, Math.PI / 2, 0]}>
          <Block args={[0.82, 0.03, 0.27]} color="#f7f0e6" roughness={0.55} />
          <Instances limit={48}>
            <boxGeometry args={[0.05, 0.016, 0.045]} />
            <meshStandardMaterial roughness={0.6} />
            {Array.from({ length: 48 }, (_, key) => {
              const row = Math.floor(key / 12);
              const column = key % 12;
              return <Instance key={key} position={[-0.355 + column * 0.0645, 0.022, -0.09 + row * 0.06]} color={(row + column) % 9 === 0 ? '#f0a274' : '#e3d6c6'} />;
            })}
          </Instances>
        </group>
        {/* Mouse and pad */}
        <Block args={[0.32, 0.008, 0.26]} color="#9b7be0" position={[0.14, 0.997, 0.62]} castShadow={false} roughness={0.9} />
        <mesh position={[0.14, 1.025, 0.62]} scale={[0.07, 0.035, 0.1]} castShadow>
          <sphereGeometry args={[1, 16, 12]} />
          <meshStandardMaterial color="#f7f0e6" roughness={0.45} />
        </mesh>
        {/* Speakers */}
        {[-0.85, 0.75].map((z) => (
          <group key={z} position={[-0.2, 1.0, z]}>
            <RoundedBox args={[0.2, 0.32, 0.2]} radius={0.03} position={[0, 0.16, 0]} castShadow>
              <meshStandardMaterial color="#f2b7c4" roughness={0.6} />
            </RoundedBox>
            <mesh position={[0.101, 0.2, 0]} rotation={[0, Math.PI / 2, 0]}>
              <circleGeometry args={[0.06, 18]} />
              <meshStandardMaterial color="#3a2f35" roughness={0.6} />
            </mesh>
            <mesh position={[0.101, 0.07, 0]} rotation={[0, Math.PI / 2, 0]}>
              <circleGeometry args={[0.03, 14]} />
              <meshStandardMaterial color="#3a2f35" roughness={0.6} />
            </mesh>
          </group>
        ))}
        {/* Desk lamp */}
        <group position={[-0.1, 1.0, -1.05]}>
          <mesh castShadow position={[0, 0.02, 0]}>
            <cylinderGeometry args={[0.11, 0.12, 0.04, 18]} />
            <meshStandardMaterial color="#fff3e2" roughness={0.5} />
          </mesh>
          <mesh castShadow position={[0.03, 0.24, 0]} rotation={[0, 0, -0.25]}>
            <cylinderGeometry args={[0.018, 0.018, 0.45, 8]} />
            <meshStandardMaterial color="#fff3e2" roughness={0.5} />
          </mesh>
          <mesh castShadow position={[0.14, 0.44, 0]} rotation={[0, 0, -2.1]}>
            <coneGeometry args={[0.11, 0.18, 18, 1, true]} />
            <meshStandardMaterial color="#fff3e2" roughness={0.5} side={THREE.DoubleSide} />
          </mesh>
          <pointLight position={[0.2, 0.36, 0]} intensity={1.4} distance={2.2} color="#ffd59a" />
        </group>
        {/* Mug */}
        <mesh position={[0.25, 1.05, -0.75]} castShadow>
          <cylinderGeometry args={[0.055, 0.05, 0.11, 14]} />
          <meshStandardMaterial color="#7cc9a0" roughness={0.6} />
        </mesh>
      </group>

      {/* Chair */}
      <group position={[-S + 1.3, 0, -0.3]} rotation={[0, -0.25, 0]}>
        <RoundedBox args={[0.58, 0.1, 0.58]} radius={0.04} position={[0, 0.6, 0]} castShadow>
          <meshStandardMaterial color="#f6c453" roughness={0.75} />
        </RoundedBox>
        <RoundedBox args={[0.1, 0.62, 0.54]} radius={0.04} position={[0.29, 0.98, 0]} rotation={[0, 0, -0.08]} castShadow>
          <meshStandardMaterial color="#f6c453" roughness={0.75} />
        </RoundedBox>
        <Block args={[0.06, 0.5, 0.06]} color="#f2ece4" position={[0, 0.3, 0]} />
        {[0, 1, 2, 3, 4].map((leg) => (
          <Block key={leg} args={[0.32, 0.04, 0.05]} color="#f2ece4" position={[Math.cos((leg / 5) * Math.PI * 2) * 0.15, 0.05, Math.sin((leg / 5) * Math.PI * 2) * 0.15]} rotation={[0, -(leg / 5) * Math.PI * 2, 0]} />
        ))}
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Central notes table                                                  */
/* ------------------------------------------------------------------ */

function NotesTable() {
  return (
    <group position={[0.75, 0, 0.85]}>
      {/* Rug */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]} receiveShadow>
        <circleGeometry args={[1.35, 48]} />
        <meshStandardMaterial color={palette.rug} roughness={0.95} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.014, 0]} receiveShadow>
        <ringGeometry args={[1.18, 1.24, 48]} />
        <meshStandardMaterial color="#fbe3a2" roughness={0.95} />
      </mesh>
      {/* Round low table */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.72, 0.72, 0.07, 40]} />
        <meshStandardMaterial color="#f3dcbb" roughness={0.7} />
      </mesh>
      {[0, 1, 2].map((leg) => {
        const angle = (leg / 3) * Math.PI * 2 + 0.4;
        return (
          <mesh key={leg} position={[Math.cos(angle) * 0.45, 0.24, Math.sin(angle) * 0.45]} rotation={[Math.sin(angle) * 0.12, 0, -Math.cos(angle) * 0.12]} castShadow>
            <cylinderGeometry args={[0.035, 0.03, 0.48, 10]} />
            <meshStandardMaterial color={palette.timber} roughness={0.75} />
          </mesh>
        );
      })}
      {/* Open notebook */}
      <group position={[-0.12, 0.54, 0.12]} rotation={[0, 0.35, 0]}>
        {[-0.17, 0.17].map((x, side) => (
          <group key={x} position={[x, 0, 0]} rotation={[0, 0, side ? -0.05 : 0.05]}>
            <Block args={[0.33, 0.02, 0.44]} color="#fffaf0" roughness={0.9} />
            {[0, 1, 2, 3, 4].map((line) => (
              <Block key={line} args={[0.24, 0.002, 0.008]} color="#c9b8a3" position={[0, 0.012, -0.14 + line * 0.07]} castShadow={false} receiveShadow={false} />
            ))}
          </group>
        ))}
        <Text font={FONT} position={[-0.17, 0.024, -0.03]} rotation={[-Math.PI / 2, 0, 0.05]} fontSize={0.045} color="#e2703a" anchorX="center" anchorY="middle" maxWidth={0.28} textAlign="center">
          IDEAS
        </Text>
      </group>
      {/* Sticky notes */}
      {[
        { position: [0.36, 0.536, -0.2], rotation: -0.25, color: '#8fb8f0', text: 'SAY HI' },
        { position: [0.4, 0.537, 0.26], rotation: 0.3, color: '#f7a8b8', text: "LET'S\nBUILD" },
      ].map((note) => (
        <group key={note.text} position={note.position} rotation={[0, note.rotation, 0]}>
          <Block args={[0.26, 0.006, 0.26]} color={note.color} roughness={0.9} castShadow={false} />
          <Text font={FONT} position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.05} lineHeight={1.05} color={palette.ink} anchorX="center" anchorY="middle" textAlign="center">
            {note.text}
          </Text>
        </group>
      ))}
      {/* Pencil cup */}
      <group position={[-0.4, 0.535, -0.32]}>
        <mesh castShadow position={[0, 0.09, 0]}>
          <cylinderGeometry args={[0.08, 0.07, 0.18, 16]} />
          <meshStandardMaterial color="#e9c99d" roughness={0.75} />
        </mesh>
        {[['#e2703a', 0.02, 0.15], ['#5fa856', -0.03, -0.12], ['#6d8fe0', 0.01, 0.02]].map(([color, x, tilt]) => (
          <mesh key={color} position={[x, 0.24, 0]} rotation={[0, 0, tilt]} castShadow>
            <cylinderGeometry args={[0.012, 0.012, 0.26, 6]} />
            <meshStandardMaterial color={color} roughness={0.6} />
          </mesh>
        ))}
      </group>
      {/* Mug */}
      <mesh position={[0.05, 0.585, -0.42]} castShadow>
        <cylinderGeometry args={[0.06, 0.055, 0.1, 14]} />
        <meshStandardMaterial color="#fff3e2" roughness={0.5} />
      </mesh>
      {/* Floor cushions */}
      {[[0.95, 0.65, 0.4], [-0.8, 0.85, -0.3]].map(([x, z, r]) => (
        <RoundedBox key={x} args={[0.5, 0.12, 0.5]} radius={0.05} position={[x, 0.07, z]} rotation={[0, r, 0]} castShadow>
          <meshStandardMaterial color="#c6b4ef" roughness={0.9} />
        </RoundedBox>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* The box: shell, opening panels and room contents                     */
/* ------------------------------------------------------------------ */

function FadingPanel({ materialRef, color, args }) {
  return (
    <mesh castShadow receiveShadow position={[0, args[1] / 2, 0]}>
      <boxGeometry args={args} />
      <meshStandardMaterial ref={materialRef} color={color} roughness={0.92} transparent />
    </mesh>
  );
}

function GroundShadow() {
  const texture = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const context = canvas.getContext('2d');
    const gradient = context.createRadialGradient(64, 64, 8, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(120, 52, 10, 0.5)');
    gradient.addColorStop(0.55, 'rgba(120, 52, 10, 0.22)');
    gradient.addColorStop(1, 'rgba(120, 52, 10, 0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(canvas);
  }, []);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -BASE - 0.35, 0]}>
      <planeGeometry args={[11, 11]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

function BoxRoom({ progressRef, reducedMotion, project, projectIndex, controlsVisible, onPrevious, onNext }) {
  const outer = useRef();
  const lid = useRef();
  const front = useRef();
  const side = useRef();
  const frontMaterial = useRef();
  const sideMaterial = useRef();
  const lidMaterial = useRef();

  useFrame(({ clock }) => {
    const p = progressRef.current.smooth;
    const grow = smooth(range(p, TIMELINE.growStart, TIMELINE.growEnd));
    const turn = easeInOut(range(p, TIMELINE.turnStart, TIMELINE.turnEnd));
    const open = easeInOut(range(p, TIMELINE.openStart, TIMELINE.openEnd));
    const fade = range(p, TIMELINE.panelFadeStart, TIMELINE.panelFadeEnd);

    const scale = THREE.MathUtils.lerp(0.26, 1, grow);
    const idle = reducedMotion ? 0 : (1 - grow) * Math.sin(clock.elapsedTime * 1.6) * 0.18;
    const idleSpin = reducedMotion ? 0 : (1 - turn) * Math.sin(clock.elapsedTime * 0.7) * 0.12;
    if (outer.current) {
      outer.current.scale.setScalar(scale);
      outer.current.position.y = idle;
      outer.current.rotation.y = THREE.MathUtils.lerp(START_YAW, FINAL_YAW, turn) + idleSpin;
    }
    // Lid hinges on the back edge and swings up and over; the two front panels fold outward to the floor.
    if (lid.current) lid.current.rotation.x = -open * 2.3;
    if (front.current) front.current.rotation.x = open * (Math.PI / 2);
    if (side.current) side.current.rotation.z = -open * (Math.PI / 2);
    const opacity = 1 - fade;
    [frontMaterial, sideMaterial, lidMaterial].forEach((material) => {
      if (material.current) material.current.opacity = opacity;
    });
    const hidden = fade >= 1;
    if (front.current) front.current.visible = !hidden;
    if (side.current) side.current.visible = !hidden;
    if (lid.current) lid.current.visible = !hidden;
  });

  const outerSize = 2 * S + 2 * T;
  return (
    <group ref={outer}>
      <group position={[0, -ROOM_CENTER_Y, 0]}>
        <GroundShadow />
        {/* Floor base with visible thickness and plank floor */}
        <Block args={[outerSize + 0.04, BASE, outerSize + 0.04]} color={palette.base} position={[0, -BASE / 2 - 0.03, 0]} roughness={0.9} />
        <Block args={[outerSize + 0.08, 0.06, outerSize + 0.08]} color={palette.timberDark} position={[0, -0.03, 0]} />
        {Array.from({ length: 10 }, (_, index) => (
          <Block key={index} args={[0.585, 0.03, 2 * S]} color={index % 2 ? palette.floorA : palette.floorB} position={[-S + 0.3 + index * 0.6, 0.012, 0]} roughness={0.85} castShadow={false} />
        ))}

        {/* Permanent walls: back (display wall) and left (computer wall) */}
        <Block args={[2 * S + T, H, T]} color={palette.plaster} position={[T / 2 * -1, H / 2, -S - T / 2]} roughness={0.95} />
        <Block args={[T, H, 2 * S]} color={palette.plasterShade} position={[-S - T / 2, H / 2, 0]} roughness={0.95} />
        {/* Skirting */}
        <Block args={[2 * S, 0.12, 0.03]} color={palette.timber} position={[0, 0.07, -S + 0.015]} castShadow={false} />
        <Block args={[0.03, 0.12, 2 * S]} color={palette.timber} position={[-S + 0.015, 0.07, 0]} castShadow={false} />
        {/* Top rails and corner posts */}
        <Block args={[2 * S + 2 * T + 0.08, 0.2, T + 0.14]} color={palette.timber} position={[0, H + 0.1, -S - T / 2]} />
        <Block args={[T + 0.14, 0.2, 2 * S + 2 * T + 0.08]} color={palette.timber} position={[-S - T / 2, H + 0.1, 0]} />
        {[[-S - T / 2, -S - T / 2], [-S - T / 2, S + T / 2], [S + T / 2, -S - T / 2]].map(([x, z]) => (
          <Block key={`${x}${z}`} args={[0.24, H, 0.24]} color={palette.timberDark} position={[x, H / 2, z]} />
        ))}

        {/* Opening panels */}
        <group ref={front} position={[0, 0, S + T / 2]}>
          <FadingPanel materialRef={frontMaterial} color={palette.plaster} args={[outerSize, H + 0.2, T]} />
        </group>
        <group ref={side} position={[S + T / 2, 0, -T / 2]}>
          <FadingPanel materialRef={sideMaterial} color={palette.plasterShade} args={[T, H + 0.2, 2 * S + T]} />
        </group>
        <group ref={lid} position={[0, H + 0.2, -S - T]}>
          <mesh castShadow position={[0, 0.07, outerSize / 2]}>
            <boxGeometry args={[outerSize + 0.08, 0.14, outerSize + 0.04]} />
            <meshStandardMaterial ref={lidMaterial} color={palette.lid} roughness={0.75} transparent />
          </mesh>
        </group>

        <DisplayWall />
        <Workstation project={project} projectIndex={projectIndex} controlsVisible={controlsVisible} onPrevious={onPrevious} onNext={onNext} />
        <NotesTable />

        {/* Warm interior fill */}
        <pointLight position={[0.5, 2.6, 0.5]} intensity={3.2} distance={8} decay={1.6} color="#ffd6a3" />
      </group>
    </group>
  );
}

function Backdrop() {
  return (
    <mesh position={[0, 0, -40]} scale={[200, 120, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        depthWrite={false}
        vertexShader={'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }'}
        fragmentShader={'varying vec2 vUv; void main() { vec3 top = vec3(1.0, 0.93, 0.74); vec3 bottom = vec3(0.98, 0.55, 0.2); float t = smoothstep(0.2, 0.75, vUv.y); gl_FragColor = vec4(mix(bottom, top, t), 1.0); }'}
      />
    </mesh>
  );
}

function RoomScene(props) {
  return (
    <Canvas
      className="box-tour-canvas"
      camera={{ position: [0, 3, 18], fov: FOV, near: 0.1, far: 120 }}
      dpr={[1, 1.25]}
      shadows={{ type: THREE.PCFShadowMap }}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
    >
      <color attach="background" args={['#f9a54f']} />
      <Backdrop />
      <hemisphereLight args={['#fff4e2', '#d08a52', 1.25]} />
      <ambientLight intensity={0.25} />
      <directionalLight
        castShadow
        position={[6, 10, 7]}
        intensity={1.9}
        color="#fff0d8"
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-camera-near={1}
        shadow-camera-far={30}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />
      <BoxRoom {...props} />
      <CameraTour progressRef={props.progressRef} reducedMotion={props.reducedMotion} />
    </Canvas>
  );
}

/* ------------------------------------------------------------------ */
/* HTML layer: welcome, contextual cards, step navigation               */
/* ------------------------------------------------------------------ */

const cardMotion = {
  initial: { opacity: 0, y: 16, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 10, scale: 0.98 },
  transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
};

function ContextCard({ side, tag, tagColor, children, labelledBy }) {
  return (
    <motion.section className={`box-tour-card box-tour-card-${side}`} aria-labelledby={labelledBy} {...cardMotion}>
      <span className="box-tour-tag" style={{ background: tagColor }}>{tag}</span>
      <span className="box-tour-clip" aria-hidden="true" />
      {children}
    </motion.section>
  );
}

function scrollToProgress(value, reducedMotion) {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  window.scrollTo({ top: Math.round(max * value), behavior: reducedMotion ? 'auto' : 'smooth' });
}

export default function ScrollRoomPortfolio() {
  const progressRef = useRef({ target: 0, smooth: 0 });
  const [phase, setPhase] = useState('intro');
  const [ready, setReady] = useState(false);
  const [projectIndex, setProjectIndex] = useState(0);
  const reducedMotion = useReducedMotion() ?? false;
  const project = projects[projectIndex];

  const previousProject = useCallback(() => setProjectIndex((value) => (value - 1 + projects.length) % projects.length), []);
  const nextProject = useCallback(() => setProjectIndex((value) => (value + 1) % projects.length), []);

  // Scroll progress drives everything; React state only changes when the visible section changes.
  useEffect(() => {
    let frame = 0;
    const read = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const value = max > 0 ? clamp01(window.scrollY / max) : 0;
      progressRef.current.target = value;
      const section = SECTIONS.find((item) => value >= item.start && value < item.end);
      setPhase(section ? section.id : 'travel');
      setReady(true);
    };
    const onScroll = () => { if (!frame) frame = window.requestAnimationFrame(read); };
    read();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  // Smooth the scroll value once per animation frame so the box and camera never jump between wheel steps.
  useEffect(() => {
    let frame = 0;
    let last = performance.now();
    const tick = (now) => {
      const delta = Math.min((now - last) / 1000, 0.1);
      last = now;
      const state = progressRef.current;
      state.smooth = reducedMotion ? state.target : THREE.MathUtils.lerp(state.smooth, state.target, 1 - Math.pow(0.0025, delta));
      if (Math.abs(state.smooth - state.target) < 0.00005) state.smooth = state.target;
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [reducedMotion]);

  // Keyboard project navigation while the computer is in view.
  useEffect(() => {
    if (phase !== 'computer') return undefined;
    const onKey = (event) => {
      if (event.target instanceof HTMLElement && ['INPUT', 'TEXTAREA'].includes(event.target.tagName)) return;
      if (event.key === 'ArrowLeft') { event.preventDefault(); previousProject(); }
      if (event.key === 'ArrowRight') { event.preventDefault(); nextProject(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, previousProject, nextProject]);

  const welcomeWords = 'Hi, nice to meet you! I’m Jazz.'.split(' ');

  return (
    <div className="box-tour-page">
      <div className="box-tour-stage" aria-hidden={phase !== 'computer'}>
        <RoomScene
          progressRef={progressRef}
          reducedMotion={reducedMotion}
          project={project}
          projectIndex={projectIndex}
          controlsVisible={phase === 'computer'}
          onPrevious={previousProject}
          onNext={nextProject}
        />
      </div>

      <nav className="box-tour-nav" aria-label="Room tour">
        <Link href="/projects" className="box-tour-archive">All projects <ArrowUpRight size={14} weight="bold" /></Link>
        <ol>
          {SECTIONS.map((section) => (
            <li key={section.id}>
              <button
                type="button"
                className={phase === section.id ? 'is-active' : ''}
                aria-current={phase === section.id ? 'step' : undefined}
                aria-label={`Go to ${section.label}`}
                onClick={() => scrollToProgress(section.focus, reducedMotion)}
              >
                <span />
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <AnimatePresence>
        {phase === 'intro' && (
          <motion.header key="welcome" className="box-tour-welcome" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.35 }}>
            <h1>
              {welcomeWords.map((word, index) => (
                <motion.span
                  key={`${word}-${index}`}
                  initial={reducedMotion ? false : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + index * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  {word}{' '}
                </motion.span>
              ))}
            </h1>
            <motion.p initial={reducedMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.95, duration: 0.5 }}>
              I build apps, games and small tools. Come inside.
            </motion.p>
            <motion.button
              type="button"
              className="box-tour-scroll-hint"
              onClick={() => scrollToProgress(0.4, reducedMotion)}
              initial={reducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.5 }}
            >
              <span>Scroll to open the box</span>
              <CaretDown size={20} weight="bold" />
            </motion.button>
          </motion.header>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {phase === 'display' && (
          <ContextCard key="display" side="left" tag="About" tagColor="#78c25b" labelledBy="card-about">
            <h2 id="card-about">I learn by building.</h2>
            <p>I’m Jazz Sajonia. I started programming seriously in early 2024, through university coursework, independent study, and projects I build myself. The shelves hold the tools I use most.</p>
            <ul className="box-tour-chips" aria-label="Tools">
              {skills.map((skill) => <li key={skill}>{skill}</li>)}
            </ul>
          </ContextCard>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {phase === 'computer' && (
          <ContextCard key="computer" side="right" tag="Projects" tagColor="#9b7be0" labelledBy="card-project">
            <div className="box-tour-project-meta" aria-live="polite">
              <span>{projectIndex + 1} / {projects.length}</span>
              <span>{project.type}</span>
            </div>
            <h2 id="card-project">{project.title}</h2>
            <p>{project.description}</p>
            <div className="box-tour-stack" style={{ borderColor: project.color }}>{project.stack}</div>
            <div className="box-tour-actions">
              <Link href={project.href}>Case study <ArrowUpRight size={15} weight="bold" /></Link>
              {project.github && <a href={project.github} target="_blank" rel="noreferrer"><GithubLogo size={16} /> GitHub</a>}
              {project.live && <a href={project.live} target="_blank" rel="noreferrer">Live <ArrowUpRight size={15} /></a>}
            </div>
            <p className="box-tour-hint">Use the arrows beside the monitor, or your ← → keys.</p>
          </ContextCard>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {phase === 'notes' && (
          <ContextCard key="notes" side="left" tag="Notes" tagColor="#6d9be8" labelledBy="card-notes">
            <h2 id="card-notes">Let’s build something.</h2>
            <p>The notes on the table are where ideas start. If you have one, I’d like to hear it.</p>
            <div className="box-tour-actions box-tour-contact">
              <a href="mailto:jaz.sajonia@gmail.com"><Envelope size={17} /> Email</a>
              <a href="https://github.com/jazsajonia-pixel" target="_blank" rel="noreferrer"><GithubLogo size={17} /> GitHub</a>
              <a href="https://www.linkedin.com/in/jazzther-bert-shanne-sajonia-a67502439" target="_blank" rel="noreferrer"><LinkedinLogo size={17} /> LinkedIn</a>
            </div>
            <Link href="/projects" className="box-tour-archive-link">Open the complete archive <ArrowUpRight size={15} weight="bold" /></Link>
          </ContextCard>
        )}
      </AnimatePresence>

      {!ready && <div className="box-tour-loading" role="status">Unpacking the room…</div>}
    </div>
  );
}
