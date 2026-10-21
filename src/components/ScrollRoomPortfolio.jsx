'use client';

import { Canvas, createPortal, useFrame, useThree } from '@react-three/fiber';
import { Html, Instance, Instances, RoundedBox, Text, Trail } from '@react-three/drei';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Envelope, GithubLogo, Lightbulb, LinkedinLogo, MapPin, Moon, Phone, Sun } from 'phosphor-react';
import * as THREE from 'three';

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

// Content mirrors the main Portfolio repo (src/app/page.jsx, about, services, contact), checked 2026-10-21.
const projects = [
  { title: 'Retext', type: 'Local-first Android image editing', stack: ['Flutter', 'Dart', 'Android'], description: 'I built a non-destructive Android editor for changing text in images while preserving every untouched pixel.', color: '#ff8b55', href: '/projects#retext', github: 'https://github.com/jazsajonia-pixel/retext' },
  { title: 'Petalbound', type: 'Offline pixel-art action adventure', stack: ['Godot 4', 'GDScript', 'Android'], description: 'I built a landscape Godot adventure with exploration, quests, guardian fights, crafting, and touch controls.', color: '#6fe0b1', href: '/projects#petalbound', github: 'https://github.com/jazsajonia-pixel/petalbound-godot' },
  { title: 'Chrono', type: 'AI-assisted developer tooling', stack: ['React', 'TypeScript', 'GitHub'], description: 'I built a mobile-first workspace for connecting GitHub, reviewing code changes, and previewing an app with an AI coding assistant.', color: '#9b8cff', href: '/projects#chrono', github: 'https://github.com/jazsajonia-pixel/mobdevai', live: 'https://chrono-tau.vercel.app/' },
  { title: 'MarketHub', type: 'Full-stack marketplace prototype', stack: ['React', 'TypeScript', 'PostgreSQL'], description: 'I built a marketplace prototype with seeded data and buyer, seller, and admin flows. Checkout is simulated; it does not process real payments.', color: '#ffca62', href: '/projects#markethub', github: 'https://github.com/jazsajonia-pixel/markethub', live: 'https://markethub-pi.vercel.app/' },
  { title: 'Chrauto AI', type: 'Android accessibility assistant', stack: ['Kotlin', 'Jetpack Compose', 'Android'], description: 'I built a native Android assistant prototype for bounded accessibility actions. Consequential actions pause for approval.', color: '#e48bd8', href: '/projects#chrauto-ai', github: 'https://github.com/jazsajonia-pixel/Chrauto-AI' },
  { title: 'SpeedSight', type: 'Computer vision / traffic analytics', stack: ['React', 'TypeScript', 'TensorFlow.js'], description: 'I built a browser-based traffic monitoring dashboard for vehicle detection, tracking, estimated speeds, and session analytics. Speed estimates are not certified for enforcement.', color: '#69a8ff', href: '/projects#speedsight', github: 'https://github.com/jazsajonia-pixel/Project-2-SpeedSight2', live: 'https://project-2-speed-sight2.vercel.app/' },
  { title: 'igit', type: 'Android Git client', stack: ['Kotlin', 'Jetpack Compose', 'Git'], description: 'I built a local-first Git client for Android, with repository browsing, branch and commit workflows, sync, and conflict handling.', color: '#f5a35c', href: '/projects#igit', github: 'https://github.com/jazsajonia-pixel/igit' },
  { title: 'FlowPilot AI', type: 'Visual workflow automation', stack: ['React', 'TypeScript', 'Workflow automation'], description: 'I built a visual workflow builder for connecting triggers, AI steps, conditions, and actions, with run history for reviewing executions.', color: '#4fd1c5', href: '/projects#flowpilot', github: 'https://github.com/jazsajonia-pixel/flowpilot', live: 'https://flowpilot-sage-delta.vercel.app/' },
];

const skillGroups = [
  { title: 'Used in my projects', items: ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Next.js', 'Tailwind CSS', 'PHP', 'MySQL', 'PostgreSQL', 'Prisma', 'Git', 'GitHub', 'Vercel'] },
  { title: 'Mobile and games', items: ['Flutter', 'Dart', 'Kotlin', 'Jetpack Compose', 'Android', 'Godot 4', 'GDScript'] },
  { title: 'Currently developing', items: ['Node.js', 'Express', 'Laravel', 'Hono', 'API design', 'AI integrations', 'Make.com'] },
];

const buildSteps = [
  ['01', 'Plan the feature and user flow'],
  ['02', 'Use AI as an implementation aid'],
  ['03', 'Review, adjust, debug, and test'],
  ['04', 'Integrate and deploy the result'],
];

const practiceAreas = [
  { title: 'Web app features', items: 'React / Next.js · TypeScript · responsive flows' },
  { title: 'APIs and data', items: 'REST / JSON · MySQL / PostgreSQL · Prisma' },
  { title: 'Interface implementation', items: 'Tailwind CSS · accessible controls · layouts' },
  { title: 'AI API experiments', items: 'OpenAI · Gemini · Claude APIs (still learning)' },
  { title: 'Workflow automation', items: 'Make.com triggers, routers, webhooks' },
];

const FONT = '/fonts/space-grotesk-700.woff';
const FONT_MEDIUM = '/fonts/space-grotesk-500.woff';

/* ------------------------------------------------------------------ */
/* Scroll timeline (scroll progress 0 → 1 is the single source of truth) */
/* ------------------------------------------------------------------ */

const TIMELINE = {
  welcomeEnd: 0.035,
  growStart: 0.03, growEnd: 0.16,
  turnStart: 0.03, turnEnd: 0.18,
  openStart: 0.17, openEnd: 0.27,
  panelFadeStart: 0.25, panelFadeEnd: 0.31,
};

// Hold windows where a context card is shown. `focus` is the scroll point used by the step navigation.
const SECTIONS = [
  { id: 'intro', label: 'Welcome', start: 0, end: TIMELINE.welcomeEnd, focus: 0 },
  { id: 'overview', label: 'The room', start: 0.3, end: 0.4, focus: 0.35, hidden: true },
  { id: 'display', label: 'About and tools', start: 0.46, end: 0.535, focus: 0.4975 },
  { id: 'computer', label: 'Projects', start: 0.64, end: 0.71, focus: 0.675 },
  { id: 'notes', label: 'How I build', start: 0.815, end: 0.87, focus: 0.8425 },
  { id: 'contact', label: 'Contact', start: 0.965, end: 1.01, focus: 1 },
];

const clamp01 = (value) => Math.min(1, Math.max(0, value));
const range = (value, start, end) => clamp01((value - start) / (end - start));
const easeOutBack = (value) => 1 + 2.4 * Math.pow(value - 1, 3) + 1.4 * Math.pow(value - 1, 2);
const INTRO_BOX_DELAY = 1.35; // seconds after the greeting starts
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
  computer: { look: toWorld([-3, 1.3, 0.2]), dir: dirToWorld([1, 0.22, 0.05]), w: 4.1, h: 2.5, wp: 2.55, hp: 2.3, card: 'right', lift: 0, lookPortrait: toWorld([-3, 1.55, -0.3]) },
  outro: { look: new THREE.Vector3(0, -0.35, 0), dir: new THREE.Vector3(0.12, 0.5, 1).normalize(), w: 8.6, h: 6.6, wp: 9.6, hp: 7.4, card: 'left', lift: 0 },
  notes: { look: toWorld([0.75, 0.5, 0.85]), dir: dirToWorld([0.55, 0.95, 0.75]), w: 2.5, h: 1.8, wp: 2.25, hp: 1.9, card: 'left', lift: 0 },
};

// The camera reaches each stop a little before its card appears and leaves only after the card has gone,
// so a card never fades in while the view is still moving.
const KEYFRAMES = [
  { at: 0, stop: 'box' },
  { at: 0.18, stop: 'box' },
  { at: 0.32, stop: 'overview' },
  { at: 0.37, stop: 'overview' },
  { at: 0.445, stop: 'display' },
  { at: 0.55, stop: 'display' },
  { at: 0.625, stop: 'computer' },
  { at: 0.725, stop: 'computer' },
  { at: 0.8, stop: 'notes' },
  { at: 0.885, stop: 'notes' },
  { at: 0.955, stop: 'outro' },
  { at: 1, stop: 'outro' },
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
  const { camera, size, gl, pointer } = useThree();
  const current = useRef(null);
  const parallax = useRef({ x: 0, y: 0 });
  const right = useMemo(() => new THREE.Vector3(), []);
  const finePointer = useRef(false);
  useEffect(() => {
    const media = window.matchMedia('(hover: hover) and (pointer: fine)');
    const update = () => { finePointer.current = media.matches; };
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

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

    // Gentle pointer parallax on devices with a mouse.
    if (!reducedMotion && finePointer.current) {
      parallax.current.x += (pointer.x - parallax.current.x) * Math.min(1, delta * 3);
      parallax.current.y += (pointer.y - parallax.current.y) * Math.min(1, delta * 3);
    }
    const distance = current.current.position.distanceTo(current.current.look);
    const amount = Math.min(0.06 * distance, 0.5);
    right.subVectors(current.current.look, current.current.position).cross(camera.up).normalize();
    camera.position.copy(current.current.position)
      .addScaledVector(right, parallax.current.x * amount)
      .addScaledVector(camera.up, parallax.current.y * amount * 0.6);
    camera.lookAt(current.current.look);
    // Shift the rendered image so the focal subject sits in the space the card leaves free.
    camera.setViewOffset(size.width, size.height, -current.current.shiftX * size.width, current.current.shiftY * size.height, size.width, size.height);
    camera.updateProjectionMatrix();
    if (typeof window !== 'undefined' && window.__tourDebug) window.__tourDebug.info = { calls: gl.info.render.calls, triangles: gl.info.render.triangles, camera: camera.position.toArray(), shiftX: current.current.shiftX };
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
/* Interactivity                                                        */
/* ------------------------------------------------------------------ */

// R3F does not forward React context into the Canvas, so the scene gets its own provider.
const RoomContext = createContext(null);
const useRoom = () => useContext(RoomContext);

export const RGB_MODES = ['wave', 'sunset', 'off'];
const RGB_LABELS = { wave: 'Wave', sunset: 'Sunset', off: 'Off' };
const RGB_THEME = ['#ff8b55', '#f7a8b8', '#b79cff', '#ffca62'];

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
        onClick={(event) => { event.stopPropagation(); onSelect?.(); }}
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

function ClockHands() {
  const hour = useRef();
  const minute = useRef();
  const second = useRef();
  useFrame(() => {
    const now = new Date();
    const seconds = now.getSeconds() + now.getMilliseconds() / 1000;
    const minutes = now.getMinutes() + seconds / 60;
    const hours = (now.getHours() % 12) + minutes / 60;
    if (second.current) second.current.rotation.z = -(seconds / 60) * Math.PI * 2;
    if (minute.current) minute.current.rotation.z = -(minutes / 60) * Math.PI * 2;
    if (hour.current) hour.current.rotation.z = -(hours / 12) * Math.PI * 2;
  });
  return (
    <group position={[0, 0, 0.04]}>
      <group ref={hour}><Block args={[0.018, 0.09, 0.01]} color={palette.ink} position={[0, 0.04, 0]} castShadow={false} /></group>
      <group ref={minute}><Block args={[0.012, 0.13, 0.01]} color={palette.ink} position={[0, 0.06, 0.005]} castShadow={false} /></group>
      <group ref={second}><Block args={[0.006, 0.14, 0.01]} color="#e2703a" position={[0, 0.06, 0.01]} castShadow={false} /></group>
    </group>
  );
}

function Fan({ position, speed = 9, ringRef }) {
  const blades = useRef();
  const { rgbMode, reducedMotion } = useRoom();
  useFrame((_, delta) => {
    if (blades.current && !reducedMotion) blades.current.rotation.x += delta * (rgbMode === 'off' ? speed * 0.45 : speed);
  });
  return (
    <group position={position}>
      <mesh rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.105, 0.014, 8, 28]} />
        <meshStandardMaterial ref={ringRef} color="#2a2228" emissive="#ff8b55" emissiveIntensity={1.6} roughness={0.4} toneMapped={false} />
      </mesh>
      <group ref={blades}>
        {Array.from({ length: 7 }, (_, blade) => (
          <group key={blade} rotation={[(blade / 7) * Math.PI * 2, 0, 0]}>
            <mesh position={[0.004, 0.055, 0]} rotation={[0, 0.5, 0]}>
              <boxGeometry args={[0.008, 0.07, 0.04]} />
              <meshStandardMaterial color="#efe4d6" roughness={0.5} />
            </mesh>
          </group>
        ))}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.026, 0.026, 0.02, 14]} />
          <meshStandardMaterial color="#3a2f35" roughness={0.5} />
        </mesh>
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Display / shelf wall (back wall, z = -S)                             */
/* ------------------------------------------------------------------ */

function SpinningRecord() {
  const record = useRef();
  const [playing, setPlaying] = useState(true);
  const { reducedMotion } = useRoom();
  useFrame((_, delta) => {
    if (record.current && playing && !reducedMotion) record.current.rotation.y += delta * 3.5;
  });
  return (
    <Interactive label={playing ? 'Pause the record' : 'Play the record'} onSelect={() => setPlaying((value) => !value)} position={[-0.35, 0.765, 0]} labelOffset={[0, 0.3, 0]}>
      <group ref={record}>
        <mesh castShadow>
          <cylinderGeometry args={[0.26, 0.26, 0.012, 32]} />
          <meshStandardMaterial color="#2b2522" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.008, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.004, 20]} />
          <meshStandardMaterial color="#f2c86b" roughness={0.6} />
        </mesh>
        <mesh position={[0.05, 0.011, 0]}>
          <boxGeometry args={[0.03, 0.002, 0.01]} />
          <meshStandardMaterial color="#e2703a" />
        </mesh>
      </group>
    </Interactive>
  );
}

function WigglePlant(props) {
  const group = useRef();
  const wiggle = useRef(0);
  const { reducedMotion } = useRoom();
  useFrame(({ clock }, delta) => {
    wiggle.current = Math.max(0, wiggle.current - delta);
    if (group.current) group.current.rotation.z = reducedMotion ? 0 : Math.sin(clock.elapsedTime * 18) * 0.12 * wiggle.current;
  });
  return (
    <Interactive label="Say hi to the plant" onSelect={() => { wiggle.current = 1.2; }} position={props.position} labelOffset={[0, 1.1, 0]}>
      <group ref={group}><Plant position={[0, 0, 0]} scale={props.scale} pot={props.pot} /></group>
    </Interactive>
  );
}

function DisplayWall() {
  const { goTo } = useRoom();
  return (
    <group>
      {/* Name sign */}
      <Interactive label="About me" onSelect={() => goTo('display')} position={[0.1, 2.88, -S + 0.06]} labelOffset={[0, 0.5, 0.1]}>
        <RoundedBox args={[1.9, 0.62, 0.08]} radius={0.06} smoothness={3} castShadow>
          <meshStandardMaterial color="#fff8ee" roughness={0.6} />
        </RoundedBox>
        <Text font={FONT} position={[0, 0.06, 0.05]} fontSize={0.27} color="#e2703a" anchorX="center" anchorY="middle" letterSpacing={0.06}>
          JAZZ
        </Text>
        <Text font={FONT_MEDIUM} position={[0, -0.17, 0.05]} fontSize={0.075} color={palette.ink} anchorX="center" anchorY="middle" letterSpacing={0.14}>
          SOFTWARE BUILDER
        </Text>
      </Interactive>

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
        <ClockHands />
      </group>

      {/* Floating shelves with labelled tool groups */}
      {[
        { y: 2.15, label: 'WEB · DATA' },
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
        <SpinningRecord />
      </group>

      {/* Tall floor plant in the right corner */}
      <WigglePlant position={[2.55, 0, -2.45]} scale={1.55} pot="#d9896a" />
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
  context.fillText(project.stack.join(' · '), 56, 300);

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
  const { goTo, nightRef } = useRoom();
  const glass = useRef();
  const dayGlass = useMemo(() => new THREE.Color('#ffd59a'), []);
  const nightGlass = useMemo(() => new THREE.Color('#3b4f9a'), []);
  useFrame(() => {
    if (!glass.current) return;
    const night = nightRef.current.value;
    glass.current.emissive.copy(dayGlass).lerp(nightGlass, night);
    glass.current.color.set(night > 0.5 ? '#2a3768' : '#ffe3b3');
    glass.current.emissiveIntensity = THREE.MathUtils.lerp(0.75, 0.6, night);
  });
  const deskX = -S + 0.42; // centre of the desk depth
  return (
    <group>
      {/* Window toward the front of the wall */}
      <group position={[-S + 0.03, 2.05, 1.95]} rotation={[0, Math.PI / 2, 0]}>
        <Block args={[1.3, 1.25, 0.08]} color={palette.timber} />
        <mesh position={[0, 0, 0.045]}>
          <planeGeometry args={[1.12, 1.07]} />
          <meshStandardMaterial ref={glass} color="#ffe3b3" emissive="#ffd59a" emissiveIntensity={0.75} roughness={0.4} />
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
          <Interactive label={controlsVisible ? 'Next project' : 'See my projects'} onSelect={() => (controlsVisible ? onNext() : goTo('computer'))} position={[0, 0.66, 0.02]} labelOffset={[0, 0.6, 0.05]}>
            <RoundedBox args={[1.32, 0.86, 0.07]} radius={0.04} smoothness={3} castShadow>
              <meshStandardMaterial color="#efe4d6" roughness={0.45} />
            </RoundedBox>
            <MonitorScreen project={project} index={projectIndex} />
            {/* Webcam */}
            <mesh position={[0, 0.405, 0.04]}>
              <sphereGeometry args={[0.018, 10, 8]} />
              <meshStandardMaterial color="#29303f" roughness={0.3} />
            </mesh>
          </Interactive>
          {/* Arrow controls anchored beside the monitor */}
          <Html position={[-1.36, 0.66, 0.05]} center zIndexRange={[20, 0]} wrapperClass="box-tour-html">
            <button type="button" className={`box-tour-arrow${controlsVisible ? ' is-visible' : ''}`} onClick={onPrevious} aria-label="Previous project" tabIndex={controlsVisible ? 0 : -1} aria-hidden={!controlsVisible}>
              <ArrowLeft size={22} weight="bold" />
            </button>
          </Html>
          <Html position={[1.44, 0.66, 0.05]} center zIndexRange={[20, 0]} wrapperClass="box-tour-html">
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
        {[0.75].map((z) => (
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
        {/* Front-facing PC where the lamp used to be */}
        <DeskPc />
        {/* Mug */}
        <mesh position={[0.27, 1.05, -0.6]} castShadow>
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
  const { goTo } = useRoom();
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
      <Interactive label="How I build" onSelect={() => goTo('notes')} position={[-0.2, 0.54, -0.02]} rotation={[0, 0.35, 0]} labelOffset={[0, 0.35, 0]}>
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
      </Interactive>
      {/* Sticky notes: how I build */}
      {[
        { position: [0.38, 0.536, -0.22], rotation: -0.25, color: '#8fb8f0', text: '01\nPLAN' },
        { position: [0.47, 0.537, 0.12], rotation: 0.18, color: '#f7a8b8', text: '02\nAI AID' },
        { position: [0.22, 0.538, 0.44], rotation: -0.1, color: '#b9e39b', text: '03\nREVIEW\n+ TEST' },
        { position: [-0.18, 0.539, 0.52], rotation: 0.32, color: '#ffd66e', text: '04\nSHIP' },
      ].map((note) => (
        <group key={note.text} position={note.position} rotation={[0, note.rotation, 0]}>
          <Block args={[0.26, 0.006, 0.26]} color={note.color} roughness={0.9} castShadow={false} />
          <Text font={FONT} position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.045} lineHeight={1.05} color={palette.ink} anchorX="center" anchorY="middle" textAlign="center">
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

function RoomFill() {
  const { lightRef, nightRef } = useRoom();
  const light = useRef();
  useFrame(() => {
    if (light.current) light.current.intensity = lightRef.current.value * THREE.MathUtils.lerp(3.2, 4.2, nightRef.current.value);
  });
  return <pointLight ref={light} position={[0.5, 2.6, 0.5]} intensity={3.2} distance={8} decay={1.6} color="#ffd6a3" />;
}

function BoxRoom({ progressRef, reducedMotion, project, projectIndex, controlsVisible, onPrevious, onNext }) {
  const { theme } = useRoom();
  // Stable elements: changing the visible card re-renders only the workstation, not the whole room.
  const staticRoom = useMemo(() => (
    <>
      <DisplayWall />
      <NotesTable />
      <Couch />
      <Cat />
      <WallLamp />
      <WindowLight />
    </>
  ), []);
  const firefly = useMemo(() => <Firefly />, []);
  const outer = useRef();
  const lid = useRef();
  const front = useRef();
  const side = useRef();
  const frontMaterial = useRef();
  const sideMaterial = useRef();
  const lidMaterial = useRef();
  const introStart = useRef(null);
  const appear = useRef(0);

  useFrame(({ clock }) => {
    const p = progressRef.current.smooth;
    const grow = smooth(range(p, TIMELINE.growStart, TIMELINE.growEnd));
    const turn = easeInOut(range(p, TIMELINE.turnStart, TIMELINE.turnEnd));
    const open = easeInOut(range(p, TIMELINE.openStart, TIMELINE.openEnd));
    const fade = range(p, TIMELINE.panelFadeStart, TIMELINE.panelFadeEnd);

    // The welcome text plays first; the box pops in after it (or immediately once the visitor scrolls).
    const sinceStart = clock.elapsedTime - (introStart.current ?? (introStart.current = clock.elapsedTime));
    const introT = p > 0.004 ? 1 : range(sinceStart, INTRO_BOX_DELAY, INTRO_BOX_DELAY + 0.7);
    appear.current = Math.max(appear.current, reducedMotion ? (introT > 0 ? 1 : 0) : introT);
    const pop = appear.current >= 1 ? 1 : easeOutBack(appear.current);
    const scale = THREE.MathUtils.lerp(0.26, 1, grow) * Math.max(pop, 0.0001);
    const idle = reducedMotion ? 0 : (1 - grow) * Math.sin(clock.elapsedTime * 1.6) * 0.18;
    const idleSpin = reducedMotion ? 0 : (1 - turn) * Math.sin(clock.elapsedTime * 0.7) * 0.12;
    if (outer.current) {
      outer.current.scale.setScalar(scale);
      outer.current.visible = appear.current > 0;
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

        {staticRoom}
        <Workstation project={project} projectIndex={projectIndex} controlsVisible={controlsVisible} onPrevious={onPrevious} onNext={onNext} />
        {theme === 'night' && firefly}

        {/* Warm interior fill (the room light) */}
        <RoomFill />
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Day / night: sky wheel with sun, moon and stars                      */
/* ------------------------------------------------------------------ */

const DAY = {
  hemiSky: new THREE.Color('#fff4e2'), hemiGround: new THREE.Color('#d08a52'), hemi: 1.25,
  key: new THREE.Color('#fff0d8'), keyIntensity: 1.9, ambient: 0.25,
  fill: new THREE.Color('#ffd6a3'), background: new THREE.Color('#f9a54f'),
};
const NIGHT = {
  hemiSky: new THREE.Color('#5a6aa8'), hemiGround: new THREE.Color('#2a2440'), hemi: 0.5,
  key: new THREE.Color('#9fb4ff'), keyIntensity: 0.42, ambient: 0.12,
  fill: new THREE.Color('#ffc983'), background: new THREE.Color('#0d1430'),
};

function radialTexture(stops, size = 128) {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  stops.forEach(([offset, color]) => gradient.addColorStop(offset, color));
  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function moonTexture() {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext('2d');
  context.fillStyle = '#fff6dc';
  context.beginPath();
  context.arc(128, 128, 120, 0, Math.PI * 2);
  context.fill();
  context.globalCompositeOperation = 'destination-out';
  context.beginPath();
  context.arc(178, 96, 112, 0, Math.PI * 2);
  context.fill();
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Eased 0 (day) → 1 (night) and 1 (lights on) → 0 (off), animated once per frame for the whole scene.
function ThemeDriver() {
  const { nightRef, lightRef, reducedMotion } = useRoom();
  useFrame((_, delta) => {
    [[nightRef, 1.7], [lightRef, 0.6]].forEach(([ref, duration]) => {
      const state = ref.current;
      if (reducedMotion) state.raw = state.target;
      else state.raw += Math.sign(state.target - state.raw) * Math.min(Math.abs(state.target - state.raw), delta / duration);
      state.value = smooth(state.raw);
    });
  });
  return null;
}

function SceneLighting() {
  const { nightRef, lightRef } = useRoom();
  const hemi = useRef();
  const ambient = useRef();
  const key = useRef();
  const { scene } = useThree();
  useFrame(() => {
    const night = nightRef.current.value;
    const light = lightRef.current.value;
    if (hemi.current) {
      hemi.current.color.copy(DAY.hemiSky).lerp(NIGHT.hemiSky, night);
      hemi.current.groundColor.copy(DAY.hemiGround).lerp(NIGHT.hemiGround, night);
      // Switching the room light off dims the bounce light as well; more so at night.
      hemi.current.intensity = THREE.MathUtils.lerp(DAY.hemi, NIGHT.hemi, night) * THREE.MathUtils.lerp(1 - 0.25 - 0.45 * night, 1, light);
    }
    if (ambient.current) ambient.current.intensity = THREE.MathUtils.lerp(DAY.ambient, NIGHT.ambient, night) * THREE.MathUtils.lerp(0.7 - 0.45 * night, 1, light);
    if (key.current) {
      key.current.color.copy(DAY.key).lerp(NIGHT.key, night);
      key.current.intensity = THREE.MathUtils.lerp(DAY.keyIntensity, NIGHT.keyIntensity, night) * THREE.MathUtils.lerp(0.78, 1, light);
    }
    if (scene.background?.isColor) scene.background.copy(DAY.background).lerp(NIGHT.background, night);
  });
  return (
    <>
      <hemisphereLight ref={hemi} args={['#fff4e2', '#d08a52', 1.25]} />
      <ambientLight ref={ambient} intensity={0.25} />
      <directionalLight
        ref={key}
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
    </>
  );
}

function Backdrop() {
  const { nightRef } = useRoom();
  const material = useRef();
  const uniforms = useMemo(() => ({ uNight: { value: 0 } }), []);
  useFrame(() => { if (material.current) material.current.uniforms.uNight.value = nightRef.current.value; });
  return (
    <mesh position={[0, 0, -40]} scale={[200, 120, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={material}
        depthWrite={false}
        uniforms={uniforms}
        vertexShader={'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }'}
        fragmentShader={`uniform float uNight; varying vec2 vUv;
          void main() {
            float t = smoothstep(0.2, 0.75, vUv.y);
            vec3 day = mix(vec3(0.98, 0.55, 0.2), vec3(1.0, 0.93, 0.74), t);
            vec3 night = mix(vec3(0.11, 0.16, 0.36), vec3(0.03, 0.05, 0.14), t);
            gl_FragColor = vec4(mix(day, night, uNight), 1.0);
          }`}
      />
    </mesh>
  );
}

const SKY_RADIUS = 13;
const SKY_DEPTH = -16;

// The sun sits in the top-left corner of the overview framing; clicking it turns the sky wheel half a turn
// so the sun sets and the moon rises into the same spot.
function SkyWheel() {
  const { nightRef, toggleTheme, theme } = useRoom();
  const { size } = useThree();
  const wheel = useRef();
  const sunGroup = useRef();
  const moonGroup = useRef();
  const sunMaterials = useRef([]);
  const moonMaterials = useRef([]);
  const starMaterial = useRef();
  const sunHalo = useMemo(() => radialTexture([[0, 'rgba(255,240,190,0.95)'], [0.25, 'rgba(255,214,140,0.55)'], [1, 'rgba(255,190,110,0)']]), []);
  const moonHalo = useMemo(() => radialTexture([[0, 'rgba(210,225,255,0.55)'], [1, 'rgba(160,180,255,0)']]), []);
  const moonMap = useMemo(() => moonTexture(), []);

  const { pivot, sunOffset } = useMemo(() => {
    const frame = frameStop(STOPS.overview, size.width, size.height);
    const aspect = size.width / size.height;
    const camera = new THREE.PerspectiveCamera(FOV, aspect, 0.1, 120);
    camera.position.copy(frame.position);
    camera.lookAt(frame.look);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
    const portrait = aspect < 0.95;
    const screenX = portrait ? 0.18 : 0.12;
    const screenY = portrait ? 0.15 : 0.13;
    const point = new THREE.Vector3(screenX * 2 - 1, 1 - screenY * 2, 0.5).unproject(camera);
    const direction = point.sub(camera.position).normalize();
    const sun = camera.position.clone().addScaledVector(direction, (SKY_DEPTH - camera.position.z) / direction.z);
    const offset = new THREE.Vector3(-Math.SQRT1_2, Math.SQRT1_2, 0).multiplyScalar(SKY_RADIUS);
    return { pivot: sun.clone().sub(offset), sunOffset: offset };
  }, [size.width, size.height]);

  const stars = useMemo(() => {
    const positions = new Float32Array(420 * 3);
    let seed = 7;
    const random = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    for (let index = 0; index < 420; index += 1) {
      const angle = random() * Math.PI * 2;
      const radius = 4 + Math.sqrt(random()) * 34;
      positions[index * 3] = Math.cos(angle) * radius;
      positions[index * 3 + 1] = Math.sin(angle) * radius;
      positions[index * 3 + 2] = -2 - random() * 2;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geometry;
  }, []);

  useFrame(({ clock }) => {
    const night = nightRef.current.value;
    if (wheel.current) wheel.current.rotation.z = night * Math.PI;
    const sunHeight = 1 - night;
    sunMaterials.current.forEach((material) => { if (material) material.opacity = THREE.MathUtils.clamp(sunHeight * 1.6 - 0.3, 0, 1); });
    moonMaterials.current.forEach((material) => { if (material) material.opacity = THREE.MathUtils.clamp(night * 1.6 - 0.3, 0, 1); });
    if (starMaterial.current) starMaterial.current.opacity = THREE.MathUtils.clamp(night * 1.3 - 0.25, 0, 1) * (0.85 + 0.15 * Math.sin(clock.elapsedTime * 2.1));
    if (sunGroup.current) sunGroup.current.rotation.z = -wheel.current.rotation.z + clock.elapsedTime * 0.15;
    if (moonGroup.current) moonGroup.current.rotation.z = -wheel.current.rotation.z;
  });

  return (
    <group ref={wheel} position={pivot}>
      <points geometry={stars}>
        <pointsMaterial ref={starMaterial} color="#fff6dc" size={2.2} sizeAttenuation={false} transparent opacity={0} depthWrite={false} />
      </points>
      <Interactive label={theme === 'day' ? 'Switch to night' : 'Night mode is on'} onSelect={toggleTheme} position={sunOffset} labelOffset={[0, -1.5, 0]}>
        <group ref={sunGroup}>
          <mesh>
            <circleGeometry args={[0.72, 40]} />
            <meshBasicMaterial ref={(material) => { sunMaterials.current[0] = material; }} color="#ffe08a" transparent toneMapped={false} />
          </mesh>
          {Array.from({ length: 10 }, (_, ray) => (
            <mesh key={ray} rotation={[0, 0, (ray / 10) * Math.PI * 2]} position={[Math.cos((ray / 10) * Math.PI * 2) * 1.02, Math.sin((ray / 10) * Math.PI * 2) * 1.02, 0]}>
              <planeGeometry args={[0.34, 0.1]} />
              <meshBasicMaterial ref={(material) => { sunMaterials.current[ray + 2] = material; }} color="#ffd36b" transparent toneMapped={false} />
            </mesh>
          ))}
          <mesh position={[0, 0, -0.05]}>
            <planeGeometry args={[4.4, 4.4]} />
            <meshBasicMaterial ref={(material) => { sunMaterials.current[1] = material; }} map={sunHalo} transparent depthWrite={false} toneMapped={false} />
          </mesh>
        </group>
      </Interactive>
      <Interactive label={theme === 'night' ? 'Switch to day' : 'Day mode is on'} onSelect={toggleTheme} position={sunOffset.clone().negate()} labelOffset={[0, -1.5, 0]}>
        <group ref={moonGroup}>
          <mesh>
            <planeGeometry args={[1.5, 1.5]} />
            <meshBasicMaterial ref={(material) => { moonMaterials.current[0] = material; }} map={moonMap} transparent depthWrite={false} toneMapped={false} />
          </mesh>
          <mesh position={[0, 0, -0.05]}>
            <planeGeometry args={[4, 4]} />
            <meshBasicMaterial ref={(material) => { moonMaterials.current[1] = material; }} map={moonHalo} transparent depthWrite={false} toneMapped={false} />
          </mesh>
        </group>
      </Interactive>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Window light: visible beam, floor patch, dust and a spot light        */
/* ------------------------------------------------------------------ */

const WINDOW = { x: -S + 0.05, y0: 1.515, y1: 2.585, z0: 1.39, z1: 2.51 };
const SUN_DIR = new THREE.Vector3(1, -0.78, -0.3).normalize();

function projectToFloor(x, y, z) {
  const t = y / -SUN_DIR.y;
  return [x + SUN_DIR.x * t, 0.018, z + SUN_DIR.z * t];
}

function WindowLight() {
  const { nightRef, reducedMotion } = useRoom();
  const beam = useRef();
  const patch = useRef();
  const spot = useRef();
  const dust = useRef();
  const target = useMemo(() => new THREE.Object3D(), []);
  const { geometry, patchGeometry, center } = useMemo(() => {
    const top = [[WINDOW.y1, WINDOW.z0], [WINDOW.y1, WINDOW.z1], [WINDOW.y0, WINDOW.z1], [WINDOW.y0, WINDOW.z0]].map(([y, z]) => [WINDOW.x, y, z]);
    const floor = top.map(([x, y, z]) => projectToFloor(x, y, z));
    const positions = [];
    const along = [];
    const across = [];
    for (let side = 0; side < 4; side += 1) {
      const next = (side + 1) % 4;
      const quad = [[top[side], 0, 0], [top[next], 0, 1], [floor[next], 1, 1], [top[side], 0, 0], [floor[next], 1, 1], [floor[side], 1, 0]];
      quad.forEach(([point, t, u]) => { positions.push(...point); along.push(t); across.push(u); });
    }
    const beamGeometry = new THREE.BufferGeometry();
    beamGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    beamGeometry.setAttribute('along', new THREE.Float32BufferAttribute(along, 1));
    beamGeometry.setAttribute('across', new THREE.Float32BufferAttribute(across, 1));
    const patchShape = new THREE.BufferGeometry();
    const p = floor;
    patchShape.setAttribute('position', new THREE.Float32BufferAttribute([...p[0], ...p[1], ...p[2], ...p[0], ...p[2], ...p[3]], 3));
    patchShape.setAttribute('uv', new THREE.Float32BufferAttribute([0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0], 2));
    const middle = new THREE.Vector3();
    p.forEach((point) => middle.add(new THREE.Vector3(...point)));
    middle.multiplyScalar(0.25);
    return { geometry: beamGeometry, patchGeometry: patchShape, center: middle };
  }, []);
  const beamUniforms = useMemo(() => ({ uColor: { value: new THREE.Color('#ffd89a') }, uStrength: { value: 0.3 } }), []);
  const patchUniforms = useMemo(() => ({ uColor: { value: new THREE.Color('#ffe2a8') }, uStrength: { value: 0.5 } }), []);
  const dayColor = useMemo(() => new THREE.Color('#ffd89a'), []);
  const moonColor = useMemo(() => new THREE.Color('#9fb6ff'), []);
  const dust3 = useMemo(() => {
    const count = 40;
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    for (let index = 0; index < count; index += 1) {
      const t = Math.random();
      const y = THREE.MathUtils.lerp(WINDOW.y0, WINDOW.y1, Math.random());
      const z = THREE.MathUtils.lerp(WINDOW.z0, WINDOW.z1, Math.random());
      const floor = projectToFloor(WINDOW.x, y, z);
      positions[index * 3] = THREE.MathUtils.lerp(WINDOW.x, floor[0], t);
      positions[index * 3 + 1] = THREE.MathUtils.lerp(y, floor[1], t);
      positions[index * 3 + 2] = THREE.MathUtils.lerp(z, floor[2], t);
      seeds[index] = Math.random() * 10;
    }
    const geometryDust = new THREE.BufferGeometry();
    geometryDust.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return { geometry: geometryDust, base: positions.slice(), seeds };
  }, []);

  useFrame(({ clock }) => {
    const night = nightRef.current.value;
    const color = dayColor.clone().lerp(moonColor, night);
    beamUniforms.uColor.value.copy(color);
    beamUniforms.uStrength.value = THREE.MathUtils.lerp(0.22, 0.09, night);
    patchUniforms.uColor.value.copy(color);
    patchUniforms.uStrength.value = THREE.MathUtils.lerp(0.55, 0.22, night);
    if (spot.current) {
      spot.current.intensity = THREE.MathUtils.lerp(6, 2.2, night);
      spot.current.color.copy(color);
    }
    if (dust.current) {
      dust.current.material.opacity = THREE.MathUtils.lerp(0.85, 0.25, night);
      if (!reducedMotion) {
        const array = dust3.geometry.attributes.position.array;
        const time = clock.elapsedTime;
        for (let index = 0; index < dust3.seeds.length; index += 1) {
          const seed = dust3.seeds[index];
          array[index * 3] = dust3.base[index * 3] + Math.sin(time * 0.3 + seed) * 0.06;
          array[index * 3 + 1] = dust3.base[index * 3 + 1] + Math.sin(time * 0.22 + seed * 1.7) * 0.08;
          array[index * 3 + 2] = dust3.base[index * 3 + 2] + Math.cos(time * 0.26 + seed) * 0.06;
        }
        dust3.geometry.attributes.position.needsUpdate = true;
      }
    }
  });

  return (
    <group>
      <mesh ref={beam} geometry={geometry} renderOrder={2}>
        <shaderMaterial
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
          uniforms={beamUniforms}
          vertexShader={'attribute float along; attribute float across; varying float vAlong; varying float vAcross; void main() { vAlong = along; vAcross = across; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }'}
          fragmentShader={'uniform vec3 uColor; uniform float uStrength; varying float vAlong; varying float vAcross; void main() { float edge = smoothstep(0.0, 0.22, vAcross) * smoothstep(1.0, 0.78, vAcross); float fall = pow(1.0 - vAlong, 1.3) * 0.75 + 0.25 * (1.0 - vAlong); gl_FragColor = vec4(uColor * uStrength * fall * (0.35 + 0.65 * edge), 1.0); }'}
        />
      </mesh>
      <mesh ref={patch} geometry={patchGeometry} renderOrder={1}>
        <shaderMaterial
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          uniforms={patchUniforms}
          vertexShader={'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }'}
          fragmentShader={'uniform vec3 uColor; uniform float uStrength; varying vec2 vUv; void main() { vec2 d = min(vUv, 1.0 - vUv); float soft = smoothstep(0.0, 0.08, d.x) * smoothstep(0.0, 0.08, d.y); float bars = step(0.035, abs(vUv.x - 0.5)) * step(0.035, abs(vUv.y - 0.5)); gl_FragColor = vec4(uColor * uStrength * soft * mix(0.35, 1.0, bars), 1.0); }'}
        />
      </mesh>
      <points ref={dust} geometry={dust3.geometry}>
        <pointsMaterial color="#fff3cf" size={2.4} sizeAttenuation={false} transparent opacity={0.85} depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
      <primitive object={target} position={center} />
      <spotLight
        ref={spot}
        position={[WINDOW.x - SUN_DIR.x * 2.2, 2.05 - SUN_DIR.y * 2.2, 1.95 - SUN_DIR.z * 2.2]}
        target={target}
        angle={0.55}
        penumbra={0.85}
        intensity={9}
        distance={9}
        decay={1.4}
        color="#ffd89a"
      />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Wall lamp (room light switch)                                        */
/* ------------------------------------------------------------------ */

function WallLamp() {
  const { lightOn, toggleLight, lightRef, nightRef } = useRoom();
  const bulb = useRef();
  const halo = useRef();
  const glow = useRef();
  const haloMap = useMemo(() => radialTexture([[0, 'rgba(255,226,160,0.9)'], [0.3, 'rgba(255,210,140,0.35)'], [1, 'rgba(255,200,120,0)']]), []);
  useFrame(() => {
    const light = lightRef.current.value;
    const night = nightRef.current.value;
    if (bulb.current) bulb.current.emissiveIntensity = 0.15 + light * (1.4 + night * 0.8);
    if (halo.current) halo.current.opacity = light * (0.45 + night * 0.4);
    if (glow.current) glow.current.intensity = light * (0.8 + night * 1.8);
  });
  return (
    <Interactive label={lightOn ? 'Turn the room light off' : 'Turn the room light on'} onSelect={toggleLight} position={[-2.28, 2.42, -S + 0.02]} labelOffset={[0, 0.55, 0.2]}>
      {/* Round wooden wall plate */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.12, 0.02]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.04, 20]} />
        <meshStandardMaterial color={palette.timber} roughness={0.7} />
      </mesh>
      {/* Brass arm */}
      <mesh position={[0, 0.12, 0.13]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.014, 0.014, 0.2, 8]} />
        <meshStandardMaterial color="#d6a65a" roughness={0.35} metalness={0.4} />
      </mesh>
      <mesh position={[0, 0.06, 0.23]}>
        <cylinderGeometry args={[0.012, 0.012, 0.12, 8]} />
        <meshStandardMaterial color="#d6a65a" roughness={0.35} metalness={0.4} />
      </mesh>
      {/* Bell shade, open at the bottom */}
      <mesh position={[0, -0.03, 0.23]} castShadow>
        <cylinderGeometry args={[0.07, 0.17, 0.16, 24, 1, true]} />
        <meshStandardMaterial color="#f7a8b8" roughness={0.6} side={THREE.DoubleSide} />
      </mesh>
      {/* Globe bulb */}
      <mesh position={[0, -0.1, 0.23]}>
        <sphereGeometry args={[0.07, 18, 14]} />
        <meshStandardMaterial ref={bulb} color="#fff3d6" emissive="#ffd38a" emissiveIntensity={1.4} roughness={0.3} toneMapped={false} />
      </mesh>
      <sprite position={[0, -0.12, 0.26]} scale={[0.9, 0.9, 1]}>
        <spriteMaterial ref={halo} map={haloMap} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </sprite>
      <pointLight ref={glow} position={[0, -0.2, 0.35]} intensity={0.8} distance={3.2} decay={1.8} color="#ffd59a" />
    </Interactive>
  );
}

/* ------------------------------------------------------------------ */
/* Desk PC: front-facing case with two front fans and themed RGB         */
/* ------------------------------------------------------------------ */

function useRgbColor() {
  const color = useMemo(() => new THREE.Color(), []);
  const palettes = useMemo(() => RGB_THEME.map((value) => new THREE.Color(value)), []);
  return useCallback((mode, time, offset) => {
    if (mode === 'sunset') return color.copy(palettes[0]).lerp(palettes[3], 0.5 + 0.5 * Math.sin(time * 0.8 + offset));
    const phase = ((((time * 0.35 + offset * 0.18) % 1) + 1) % 1) * palettes.length;
    const index = Math.floor(phase);
    return color.copy(palettes[index]).lerp(palettes[(index + 1) % palettes.length], phase - index);
  }, [color, palettes]);
}

function DeskPc() {
  const { rgbMode, cycleRgb, reducedMotion } = useRoom();
  const rings = [useRef(), useRef()];
  const strips = [useRef(), useRef()];
  const glow = useRef();
  const sample = useRgbColor();
  useFrame(({ clock }) => {
    const time = reducedMotion ? 0 : clock.elapsedTime;
    const on = rgbMode !== 'off';
    rings.forEach((ring, index) => {
      if (!ring.current) return;
      ring.current.emissive.copy(sample(rgbMode, time, index * 1.4));
      ring.current.emissiveIntensity = on ? 1.7 : 0;
    });
    strips.forEach((strip, index) => {
      if (!strip.current) return;
      strip.current.emissive.copy(sample(rgbMode, time, 2.6 + index));
      strip.current.emissiveIntensity = on ? 1.5 : 0;
    });
    if (glow.current) {
      glow.current.color.copy(sample(rgbMode, time, 0.7));
      glow.current.intensity = on ? 1.3 : 0;
    }
  });
  // Desk-local placement: the front (+x) faces into the room.
  const W = 0.34; // case width along the desk (z)
  const D = 0.56; // depth (x)
  const HT = 0.64; // height
  return (
    <Interactive label={`PC lighting: ${RGB_LABELS[rgbMode]} · click to change`} onSelect={cycleRgb} position={[-0.1, 0.995, -1.0]} labelOffset={[0.2, HT + 0.25, 0]}>
      {/* Shell */}
      <RoundedBox args={[D, HT, W]} radius={0.025} smoothness={2} position={[0, HT / 2 + 0.03, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#f4e6d4" roughness={0.55} />
      </RoundedBox>
      {[[-0.2, -0.12], [-0.2, 0.12], [0.2, -0.12], [0.2, 0.12]].map(([x, z]) => (
        <Block key={`${x}${z}`} args={[0.06, 0.03, 0.05]} color={palette.timberDark} position={[x, 0.015, z]} castShadow={false} />
      ))}
      {/* Recessed dark front with mesh look */}
      <Block args={[0.012, HT - 0.07, W - 0.06]} color="#2c2427" position={[D / 2 + 0.002, HT / 2 + 0.03, 0]} castShadow={false} roughness={0.75} />
      {/* Two front fans */}
      <group position={[D / 2 + 0.012, 0, 0]} scale={1.08}>
        <Fan position={[0, (HT * 0.72 + 0.03) / 1.08, 0]} ringRef={rings[0]} />
        <Fan position={[0, (HT * 0.32 + 0.03) / 1.08, 0]} ringRef={rings[1]} speed={11} />
      </group>
      {/* RGB edge strips on the front */}
      {[-1, 1].map((side, index) => (
        <mesh key={side} position={[D / 2 + 0.008, HT / 2 + 0.03, side * (W / 2 - 0.018)]}>
          <boxGeometry args={[0.01, HT - 0.1, 0.012]} />
          <meshStandardMaterial ref={strips[index]} color="#2a2228" emissive="#ff8b55" emissiveIntensity={1.5} toneMapped={false} />
        </mesh>
      ))}
      {/* Power button */}
      <mesh position={[D / 2 - 0.06, HT + 0.031, 0.1]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.018, 14]} />
        <meshBasicMaterial color={rgbMode === 'off' ? '#9a8a7a' : '#7ad3c0'} toneMapped={false} />
      </mesh>
      {/* Top vents */}
      {[-0.15, -0.07, 0.01, 0.09].map((x) => (
        <Block key={x} args={[0.045, 0.004, 0.22]} color="#d9c6ae" position={[x, HT + 0.032, -0.02]} castShadow={false} receiveShadow={false} />
      ))}
      <pointLight ref={glow} position={[D / 2 + 0.35, HT / 2, 0]} intensity={1.3} distance={1.6} decay={2} color="#ff8b55" />
    </Interactive>
  );
}

/* ------------------------------------------------------------------ */
/* Small couch facing the notes table                                   */
/* ------------------------------------------------------------------ */

const COUCH = { position: [-0.35, 0, -0.78], yaw: 0.62, seatY: 0.45 };
const couchToRoom = (x, z) => {
  const cos = Math.cos(COUCH.yaw);
  const sin = Math.sin(COUCH.yaw);
  return [COUCH.position[0] + x * cos + z * sin, COUCH.position[2] - x * sin + z * cos];
};

function Couch() {
  const fabric = '#8ec5b8';
  const fabricDark = '#76b0a3';
  return (
    <group position={COUCH.position} rotation={[0, COUCH.yaw, 0]}>
      {[[-0.52, -0.25], [0.52, -0.25], [-0.52, 0.25], [0.52, 0.25]].map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x, 0.05, z]} castShadow>
          <cylinderGeometry args={[0.03, 0.022, 0.1, 8]} />
          <meshStandardMaterial color={palette.timberDark} roughness={0.7} />
        </mesh>
      ))}
      <RoundedBox args={[1.3, 0.22, 0.72]} radius={0.06} smoothness={2} position={[0, 0.21, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={fabricDark} roughness={0.9} />
      </RoundedBox>
      {[-0.27, 0.27].map((x) => (
        <RoundedBox key={x} args={[0.54, 0.13, 0.58]} radius={0.05} smoothness={2} position={[x, 0.385, 0.05]} castShadow receiveShadow>
          <meshStandardMaterial color={fabric} roughness={0.9} />
        </RoundedBox>
      ))}
      <RoundedBox args={[1.3, 0.46, 0.18]} radius={0.07} smoothness={2} position={[0, 0.52, -0.28]} castShadow receiveShadow>
        <meshStandardMaterial color={fabric} roughness={0.9} />
      </RoundedBox>
      {[-0.6, 0.6].map((x) => (
        <RoundedBox key={x} args={[0.16, 0.36, 0.72]} radius={0.06} smoothness={2} position={[x, 0.4, 0]} castShadow receiveShadow>
          <meshStandardMaterial color={fabricDark} roughness={0.9} />
        </RoundedBox>
      ))}
      {/* Throw pillow and blanket */}
      <RoundedBox args={[0.3, 0.28, 0.1]} radius={0.05} smoothness={2} position={[-0.36, 0.58, -0.14]} rotation={[-0.25, 0.25, 0.12]} castShadow>
        <meshStandardMaterial color="#f6c453" roughness={0.85} />
      </RoundedBox>
      <Block args={[0.42, 0.02, 0.6]} color="#f7a8b8" position={[0.3, 0.462, 0.06]} roughness={0.95} castShadow={false} />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Cat: walks a loop around the room, then naps on the couch             */
/* ------------------------------------------------------------------ */

const CAT_SEAT = (() => { const [x, z] = couchToRoom(0.28, 0.06); return new THREE.Vector3(x, COUCH.seatY + 0.02, z); })();
const CAT_HOP = (() => { const [x, z] = couchToRoom(0.28, 0.66); return new THREE.Vector3(x, 0, z); })();
const CAT_PATH = [
  CAT_HOP,
  new THREE.Vector3(1.0, 0, -1.62),
  new THREE.Vector3(2.3, 0, -0.7),
  new THREE.Vector3(2.42, 0, 1.3),
  new THREE.Vector3(1.6, 0, 2.5),
  new THREE.Vector3(0.0, 0, 2.5),
  new THREE.Vector3(-1.2, 0, 1.6),
  new THREE.Vector3(-1.0, 0, 0.45),
];
const CAT_SPEED = 0.48;
const CAT_LOOPS = 2;
const CAT_NAP = 28;

const angleLerp = (from, to, t) => {
  let delta = (to - from) % (Math.PI * 2);
  if (delta > Math.PI) delta -= Math.PI * 2;
  if (delta < -Math.PI) delta += Math.PI * 2;
  return from + delta * t;
};

function Cat() {
  const { reducedMotion, nightRef, lightRef } = useRoom();
  const root = useRef();
  const body = useRef();
  const head = useRef();
  const tail = useRef();
  const tailSegments = [useRef(), useRef(), useRef(), useRef()];
  const legs = [useRef(), useRef(), useRef(), useRef()];
  const eyesOpen = useRef();
  const eyesClosed = useRef();
  const eyeMaterial = useRef();
  const zs = [useRef(), useRef(), useRef()];
  const [bubble, setBubble] = useState(null);
  const bubbleTimer = useRef(0);
  const state = useRef({ mode: reducedMotion ? 'sleep' : 'walk', segment: 0, along: 0, loops: 0, timer: 0, yaw: 0, from: new THREE.Vector3(), to: new THREE.Vector3() });

  useEffect(() => { if (reducedMotion) state.current.mode = 'sleep'; }, [reducedMotion]);
  useEffect(() => () => window.clearTimeout(bubbleTimer.current), []);

  const say = useCallback((text) => {
    setBubble(text);
    window.clearTimeout(bubbleTimer.current);
    bubbleTimer.current = window.setTimeout(() => setBubble(null), 2200);
  }, []);

  const onPet = useCallback(() => {
    const cat = state.current;
    if (cat.mode === 'sleep') {
      say('mrrp? ♥');
      if (!reducedMotion) { cat.mode = 'stretch'; cat.timer = 0; }
    } else if (cat.mode === 'walk') {
      say('meow ♥');
      cat.mode = 'sit';
      cat.timer = 0;
    } else {
      say('purr…');
    }
  }, [reducedMotion, say]);

  useFrame(({ clock }, rawDelta) => {
    const delta = Math.min(rawDelta, 0.1);
    const cat = state.current;
    const time = clock.elapsedTime;
    if (!root.current) return;
    let position = root.current.position;
    let walking = false;
    let sleeping = false;
    let sitting = false;
    let targetYaw = cat.yaw;
    let lift = 0;

    if (cat.mode === 'walk') {
      walking = true;
      const a = CAT_PATH[cat.segment];
      const b = CAT_PATH[(cat.segment + 1) % CAT_PATH.length];
      const length = a.distanceTo(b);
      cat.along += CAT_SPEED * delta;
      if (cat.along >= length) {
        cat.along -= length;
        cat.segment = (cat.segment + 1) % CAT_PATH.length;
        if (cat.segment === 0) {
          cat.loops += 1;
          if (cat.loops >= (window.__tourDebug?.catLoops ?? CAT_LOOPS)) {
            cat.mode = 'hopUp';
            cat.timer = 0;
            cat.loops = 0;
          }
        }
      }
      const from = CAT_PATH[cat.segment];
      const to = CAT_PATH[(cat.segment + 1) % CAT_PATH.length];
      const t = Math.min(1, cat.along / from.distanceTo(to));
      position.lerpVectors(from, to, t);
      targetYaw = Math.atan2(to.x - from.x, to.z - from.z);
    } else if (cat.mode === 'sit') {
      sitting = true;
      cat.timer += delta;
      if (cat.timer > 2.6) cat.mode = 'walk';
    } else if (cat.mode === 'hopUp' || cat.mode === 'hopDown') {
      cat.timer += delta;
      const up = cat.mode === 'hopUp';
      if (cat.timer < 0.5) {
        // Turn toward the couch (or away from it) before the hop.
        targetYaw = up ? Math.atan2(CAT_SEAT.x - CAT_HOP.x, CAT_SEAT.z - CAT_HOP.z) : Math.atan2(CAT_HOP.x - CAT_SEAT.x, CAT_HOP.z - CAT_SEAT.z);
        sitting = true;
      } else {
        const t = Math.min(1, (cat.timer - 0.5) / 0.55);
        const from = up ? CAT_HOP : CAT_SEAT;
        const to = up ? CAT_SEAT : CAT_HOP;
        position.lerpVectors(from, to, t);
        lift = Math.sin(t * Math.PI) * 0.32;
        if (t >= 1) {
          cat.mode = up ? 'curl' : 'walk';
          cat.timer = 0;
          if (!up) { cat.segment = 0; cat.along = 0; }
        }
      }
    } else if (cat.mode === 'curl') {
      cat.timer += delta;
      targetYaw = COUCH.yaw - Math.PI / 2 + 0.35;
      sitting = cat.timer < 0.6;
      if (cat.timer > 0.9) { cat.mode = 'sleep'; cat.timer = 0; }
    } else if (cat.mode === 'sleep') {
      sleeping = true;
      position.copy(CAT_SEAT);
      targetYaw = COUCH.yaw - Math.PI / 2 + 0.35;
      cat.timer += delta;
      if (!reducedMotion && cat.timer > CAT_NAP) { cat.mode = 'stretch'; cat.timer = 0; }
    } else if (cat.mode === 'stretch') {
      sitting = true;
      position.copy(CAT_SEAT);
      cat.timer += delta;
      if (cat.timer > 1.3) { cat.mode = 'hopDown'; cat.timer = 0; }
    }

    position.y = (cat.mode === 'sleep' || cat.mode === 'curl' || cat.mode === 'stretch' ? CAT_SEAT.y : position.y) + lift;
    if (cat.mode === 'hopUp' && cat.timer < 0.5) position.copy(CAT_HOP);
    if (cat.mode === 'hopDown' && cat.timer < 0.5) position.copy(CAT_SEAT);

    cat.yaw = reducedMotion ? targetYaw : angleLerp(cat.yaw, targetYaw, 1 - Math.pow(0.002, delta));
    root.current.rotation.y = cat.yaw;

    const ease = 1 - Math.pow(0.001, delta);
    const stride = walking ? time * 9 : 0;
    legs.forEach((leg, index) => {
      if (!leg.current) return;
      const swing = walking ? Math.sin(stride + (index % 2 === 0 ? 0 : Math.PI) + (index > 1 ? Math.PI : 0)) * 0.55 : 0;
      leg.current.rotation.x = swing;
      const target = sleeping ? 0.001 : 1;
      leg.current.scale.y += (target - leg.current.scale.y) * ease;
    });
    if (body.current) {
      const bob = walking ? Math.abs(Math.sin(stride)) * 0.012 : 0;
      const breath = sleeping ? Math.sin(time * 1.6) * 0.012 : 0;
      const targetY = sleeping ? 0.1 : sitting ? 0.19 : 0.2;
      body.current.position.y += (targetY + bob - body.current.position.y) * ease;
      body.current.rotation.x += ((sitting && !sleeping ? -0.35 : 0) - body.current.rotation.x) * ease;
      const sx = sleeping ? 1.18 + breath : 1;
      const sy = sleeping ? 0.78 + breath : 1;
      const sz = sleeping ? 0.82 : 1;
      body.current.scale.x += (sx - body.current.scale.x) * ease;
      body.current.scale.y += (sy - body.current.scale.y) * ease;
      body.current.scale.z += (sz - body.current.scale.z) * ease;
    }
    if (head.current) {
      const target = sleeping ? [0.05, 0.15, 0.17] : sitting ? [0, 0.38, 0.16] : [0, 0.31, 0.21];
      head.current.position.x += (target[0] - head.current.position.x) * ease;
      head.current.position.y += (target[1] - head.current.position.y) * ease;
      head.current.position.z += (target[2] - head.current.position.z) * ease;
      const yaw = sleeping ? 0.7 : walking ? Math.sin(time * 1.3) * 0.12 : Math.sin(time * 0.8) * 0.3;
      head.current.rotation.y += (yaw - head.current.rotation.y) * ease;
      head.current.rotation.x += ((sleeping ? 0.25 : 0) - head.current.rotation.x) * ease;
    }
    if (tail.current) {
      const curl = sleeping ? 1 : 0;
      tail.current.rotation.y += ((sleeping ? 1.15 : Math.sin(time * (walking ? 3 : 1.4)) * 0.35) - tail.current.rotation.y) * ease;
      tail.current.position.y += ((sleeping ? 0.08 : 0.24) - tail.current.position.y) * ease;
      tailSegments.forEach((segment, index) => {
        if (!segment.current) return;
        const up = (index === 0 ? -0.9 : -0.25) * (1 - curl);
        const flat = (index === 0 ? -1.45 : 0.05) * curl;
        segment.current.rotation.x += (up + flat - segment.current.rotation.x) * ease;
        segment.current.rotation.y += ((curl ? 0.55 : Math.sin(time * 2 + index) * 0.08) - segment.current.rotation.y) * ease;
      });
    }
    if (eyesOpen.current) eyesOpen.current.visible = !sleeping;
    if (eyesClosed.current) eyesClosed.current.visible = sleeping;
    if (eyeMaterial.current) eyeMaterial.current.emissiveIntensity = nightRef.current.value * (1 - lightRef.current.value) * 2.2 + 0.15;
    if (typeof window !== 'undefined' && window.__tourDebug) {
      const world = root.current.getWorldPosition(new THREE.Vector3());
      window.__tourDebug.cat = { mode: cat.mode, x: +position.x.toFixed(2), z: +position.z.toFixed(2), world: world.toArray().map((v) => +v.toFixed(2)) };
    }
    zs.forEach((z, index) => {
      if (!z.current) return;
      const phase = ((time * 0.45 + index / 3) % 1);
      z.current.visible = sleeping && !reducedMotion;
      z.current.position.set(0.12 + phase * 0.12, 0.32 + phase * 0.35, 0.1);
      z.current.fillOpacity = Math.sin(phase * Math.PI);
      z.current.scale.setScalar(0.6 + phase * 0.6);
    });
  });

  const fur = '#5b5462';
  const cream = '#f3e6d4';
  const pink = '#f2a5b4';
  return (
    <group ref={root} position={reducedMotion ? CAT_SEAT : CAT_PATH[0]} scale={1.3}>
      <Interactive label="Pet the cat" onSelect={onPet} labelOffset={[0, 0.62, 0]}>
        {/* Invisible, generous hit area */}
        <mesh position={[0, 0.24, 0]}>
          <boxGeometry args={[0.36, 0.48, 0.62]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
        </mesh>
        <group ref={body} position={[0, 0.2, 0]}>
          <RoundedBox args={[0.2, 0.17, 0.38]} radius={0.075} smoothness={3} castShadow>
            <meshStandardMaterial color={fur} roughness={0.85} />
          </RoundedBox>
          <RoundedBox args={[0.15, 0.06, 0.26]} radius={0.03} smoothness={2} position={[0, -0.06, 0.02]}>
            <meshStandardMaterial color={cream} roughness={0.9} />
          </RoundedBox>
        </group>
        <group ref={head} position={[0, 0.31, 0.21]}>
          <RoundedBox args={[0.2, 0.17, 0.17]} radius={0.075} smoothness={3} castShadow>
            <meshStandardMaterial color={fur} roughness={0.85} />
          </RoundedBox>
          {[-1, 1].map((side) => (
            <group key={side} position={[side * 0.06, 0.09, -0.01]} rotation={[0, 0, -side * 0.28]}>
              <mesh castShadow>
                <coneGeometry args={[0.045, 0.085, 4]} />
                <meshStandardMaterial color={fur} roughness={0.85} />
              </mesh>
              <mesh position={[0, -0.005, 0.018]} scale={[0.6, 0.65, 0.4]}>
                <coneGeometry args={[0.045, 0.085, 4]} />
                <meshStandardMaterial color={pink} roughness={0.8} />
              </mesh>
            </group>
          ))}
          <mesh position={[0, -0.035, 0.08]} scale={[1, 0.65, 0.6]}>
            <sphereGeometry args={[0.055, 14, 10]} />
            <meshStandardMaterial color={cream} roughness={0.9} />
          </mesh>
          <mesh position={[0, -0.012, 0.112]}>
            <sphereGeometry args={[0.012, 8, 6]} />
            <meshStandardMaterial color={pink} roughness={0.6} />
          </mesh>
          <group ref={eyesOpen}>
            {[-1, 1].map((side) => (
              <mesh key={side} position={[side * 0.048, 0.02, 0.083]}>
                <sphereGeometry args={[0.019, 10, 8]} />
                <meshStandardMaterial ref={side === 1 ? eyeMaterial : undefined} color="#2a2024" emissive="#ffd66e" emissiveIntensity={0.15} roughness={0.3} />
              </mesh>
            ))}
          </group>
          <group ref={eyesClosed} visible={false}>
            {[-1, 1].map((side) => (
              <Block key={side} args={[0.035, 0.007, 0.01]} color="#2a2024" position={[side * 0.048, 0.015, 0.088]} castShadow={false} receiveShadow={false} />
            ))}
          </group>
        </group>
        {[[-0.06, 0.13], [0.06, 0.13], [-0.06, -0.13], [0.06, -0.13]].map(([x, z], index) => (
          <group key={index} ref={legs[index]} position={[x, 0.15, z]}>
            <mesh position={[0, -0.075, 0]} castShadow>
              <cylinderGeometry args={[0.028, 0.026, 0.15, 8]} />
              <meshStandardMaterial color={fur} roughness={0.85} />
            </mesh>
            <mesh position={[0, -0.145, 0.008]} scale={[1, 0.6, 1.25]}>
              <sphereGeometry args={[0.03, 10, 8]} />
              <meshStandardMaterial color={cream} roughness={0.9} />
            </mesh>
          </group>
        ))}
        <group ref={tail} position={[0, 0.24, -0.18]}>
          <group ref={tailSegments[0]}>
            <mesh position={[0, 0, -0.04]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.022, 0.024, 0.09, 8]} />
              <meshStandardMaterial color={fur} roughness={0.85} />
            </mesh>
            <group ref={tailSegments[1]} position={[0, 0, -0.085]}>
              <mesh position={[0, 0, -0.04]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.02, 0.022, 0.09, 8]} />
                <meshStandardMaterial color={fur} roughness={0.85} />
              </mesh>
              <group ref={tailSegments[2]} position={[0, 0, -0.085]}>
                <mesh position={[0, 0, -0.04]} rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.019, 0.02, 0.09, 8]} />
                  <meshStandardMaterial color={fur} roughness={0.85} />
                </mesh>
                <group ref={tailSegments[3]} position={[0, 0, -0.085]}>
                  <mesh position={[0, 0, -0.035]} rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.017, 0.019, 0.08, 8]} />
                    <meshStandardMaterial color={cream} roughness={0.9} />
                  </mesh>
                </group>
              </group>
            </group>
          </group>
        </group>
        {zs.map((z, index) => (
          <Text key={index} ref={z} font={FONT} fontSize={0.07} color="#7b6fd0" anchorX="center" anchorY="middle" visible={false}>
            z
          </Text>
        ))}
      </Interactive>
      {bubble && (
        <Html position={[0, 0.7, 0]} center zIndexRange={[26, 0]} wrapperClass="box-tour-html">
          <span className="box-tour-cat-bubble" role="status">{bubble}</span>
        </Html>
      )}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Firefly (night only) with a fading light trail                       */
/* ------------------------------------------------------------------ */

function Firefly() {
  const { nightRef, reducedMotion } = useRoom();
  const body = useRef();
  const glow = useRef();
  const core = useRef();
  const halo = useRef();
  const zoom = useRef(0);
  const trail = useRef();
  const { scene } = useThree();
  const anchor = useMemo(() => new THREE.Object3D(), []);
  const anchorRef = useRef(anchor);
  const [trailReady, setTrailReady] = useState(false);
  const world = useMemo(() => new THREE.Vector3(), []);
  const haloMap = useMemo(() => radialTexture([[0, 'rgba(240,255,170,1)'], [0.3, 'rgba(210,255,120,0.45)'], [1, 'rgba(190,255,100,0)']], 64), []);
  useFrame(({ clock }, delta) => {
    const time = reducedMotion ? 0 : clock.elapsedTime;
    zoom.current = Math.max(0, zoom.current - delta);
    const speed = 1 + zoom.current * 2.2;
    const t = time * 0.55 * speed + (zoom.current > 0 ? zoom.current * 4 : 0);
    if (body.current) {
      body.current.position.set(
        0.4 + Math.sin(t * 0.71) * 1.9 + Math.sin(t * 1.9) * 0.25,
        1.65 + Math.sin(t * 0.93 + 1.2) * 0.65 + Math.sin(t * 2.7) * 0.08,
        0.3 + Math.sin(t * 0.53 + 2.1) * 1.9 + Math.cos(t * 1.6) * 0.25,
      );
    }
    if (body.current) {
      body.current.getWorldPosition(world);
      anchor.position.copy(world);
      if (!trailReady && !reducedMotion) setTrailReady(true);
    }
    const night = nightRef.current.value;
    const blink = 0.65 + 0.35 * Math.sin(time * 3.1) * Math.sin(time * 1.3 + 0.5);
    const strength = Math.max(0, night * 1.4 - 0.4) * (blink + zoom.current);
    if (glow.current) glow.current.intensity = strength * 0.9;
    if (core.current) core.current.opacity = Math.min(1, strength * 1.3);
    if (halo.current) halo.current.opacity = Math.min(1, strength);
    const material = trail.current?.material;
    if (material) {
      if (!material.transparent) {
        material.transparent = true;
        material.depthWrite = false;
        material.blending = THREE.AdditiveBlending;
        material.needsUpdate = true;
      }
      material.opacity = Math.min(1, strength * 0.8);
    }
  });
  return (
    <>
      {createPortal(<primitive object={anchor} />, scene)}
      {trailReady && (
        <Trail ref={trail} target={anchorRef} width={0.9} length={7} color="#e9ff8a" attenuation={(width) => width * width} decay={1.2} />
      )}
    <group ref={body}>
      <Interactive label="Catch the firefly" onSelect={() => { zoom.current = 1.4; }} labelOffset={[0, 0.25, 0]}>
        <mesh>
          <sphereGeometry args={[0.028, 10, 8]} />
          <meshBasicMaterial ref={core} color="#f4ffb0" transparent toneMapped={false} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.2, 8, 6]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
        </mesh>
      </Interactive>
      <sprite scale={[0.42, 0.42, 1]}>
        <spriteMaterial ref={halo} map={haloMap} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </sprite>
      <pointLight ref={glow} intensity={0.8} distance={1.6} decay={2} color="#d8ff7a" />
    </group>
    </>
  );
}

function RoomScene(props) {
  const sky = useMemo(() => (
    <>
      <ThemeDriver />
      <SceneLighting />
      <Backdrop />
      <SkyWheel />
    </>
  ), []);
  return (
    <Canvas
      className="box-tour-canvas"
      camera={{ position: [0, 3, 18], fov: FOV, near: 0.1, far: 120 }}
      dpr={[1, 1.25]}
      shadows={{ type: THREE.PCFShadowMap }}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
    >
      <color attach="background" args={['#f9a54f']} />
      <RoomContext.Provider value={props.room}>
        {sky}
        <BoxRoom {...props} />
      </RoomContext.Provider>
      <CameraTour progressRef={props.progressRef} reducedMotion={props.reducedMotion} />
    </Canvas>
  );
}

/* ------------------------------------------------------------------ */
/* HTML layer: welcome, contextual cards, step navigation               */
/* ------------------------------------------------------------------ */

// Cards only fade and drift a few pixels; they never scale, so nothing else on screen appears to resize.
const cardMotion = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, delay: 0.12, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: 8, transition: { duration: 0.18, ease: 'easeIn' } },
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

export function scrollToProgress(value, reducedMotion) {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  window.scrollTo({ top: Math.round(max * value), behavior: reducedMotion ? 'auto' : 'smooth' });
}

export default function ScrollRoomPortfolio() {
  const progressRef = useRef({ target: 0, smooth: 0 });
  const [phase, setPhase] = useState('intro');
  const [projectIndex, setProjectIndex] = useState(0);
  const reducedMotion = useReducedMotion() ?? false;
  const project = projects[projectIndex];

  const [theme, setTheme] = useState('day');
  const [lightOn, setLightOn] = useState(true);
  const nightRef = useRef({ raw: 0, value: 0, target: 0 });
  const lightRef = useRef({ raw: 1, value: 1, target: 1 });
  const [rgbMode, setRgbMode] = useState('wave');
  const toggleTheme = useCallback(() => setTheme((value) => (value === 'day' ? 'night' : 'day')), []);
  const toggleLight = useCallback(() => setLightOn((value) => !value), []);

  // Restore the visitor's last sky choice without animating it in.
  useEffect(() => {
    try {
      if (window.localStorage.getItem('box-tour-theme') === 'night') {
        nightRef.current = { raw: 1, value: 1, target: 1 };
        setTheme('night');
      }
    } catch { /* storage unavailable */ }
  }, []);
  useEffect(() => {
    nightRef.current.target = theme === 'night' ? 1 : 0;
    document.documentElement.dataset.theme = theme;
    try { window.localStorage.setItem('box-tour-theme', theme); } catch { /* storage unavailable */ }
  }, [theme]);
  useEffect(() => () => { delete document.documentElement.dataset.theme; }, []);
  useEffect(() => {
    lightRef.current.target = lightOn ? 1 : 0;
    document.documentElement.dataset.roomLight = lightOn ? 'on' : 'off';
  }, [lightOn]);
  const cycleRgb = useCallback(() => setRgbMode((value) => RGB_MODES[(RGB_MODES.indexOf(value) + 1) % RGB_MODES.length]), []);
  const goTo = useCallback((id) => {
    const section = SECTIONS.find((item) => item.id === id);
    if (section) scrollToProgress(section.focus, reducedMotion);
  }, [reducedMotion]);

  const room = useMemo(
    () => ({ goTo, rgbMode, cycleRgb, reducedMotion, theme, toggleTheme, lightOn, toggleLight, nightRef, lightRef }),
    [goTo, rgbMode, cycleRgb, reducedMotion, theme, toggleTheme, lightOn, toggleLight],
  );

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

  return (
    <div className="box-tour-page">
      <div className="box-tour-stage">
        <RoomScene
          progressRef={progressRef}
          reducedMotion={reducedMotion}
          project={project}
          projectIndex={projectIndex}
          controlsVisible={phase === 'computer'}
          onPrevious={previousProject}
          onNext={nextProject}
          room={room}
        />
      </div>

      <nav className="box-tour-nav" aria-label="Room tour">
        <Link href="/projects" className="box-tour-archive" aria-label="All projects"><span>All projects</span> <ArrowUpRight size={14} weight="bold" /></Link>
        <div className="box-tour-quick" role="group" aria-label="Room settings">
          <button type="button" onClick={toggleTheme} aria-pressed={theme === 'night'} aria-label={theme === 'day' ? 'Switch to night mode' : 'Switch to day mode'} title={theme === 'day' ? 'Night mode' : 'Day mode'}>
            {theme === 'day' ? <Moon size={20} weight="fill" /> : <Sun size={20} weight="fill" />}
          </button>
          <button type="button" onClick={toggleLight} aria-pressed={!lightOn} aria-label={lightOn ? 'Turn the room light off' : 'Turn the room light on'} title={lightOn ? 'Light off' : 'Light on'} className={lightOn ? 'is-on' : ''}>
            <Lightbulb size={20} weight={lightOn ? 'fill' : 'regular'} />
          </button>
        </div>
        <ol>
          {SECTIONS.filter((section) => !section.hidden).map((section) => (
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


      <AnimatePresence mode="wait" initial={false}>
        {phase === 'overview' && (
          <motion.p key="tip" className="box-tour-tip" role="status" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.3 }}>
            Tip: hover or tap things in the room. Try the sun, the wall lamp, the PC, the record, and the cat.
          </motion.p>
        )}
        {phase === 'display' && (
          <ContextCard key="display" side="left" tag="About" tagColor="#78c25b" labelledBy="card-about">
            <h2 id="card-about">Full-stack web developer, learning by building.</h2>
            <p>I’m Jazzther Bert Shanne Sajonia. I started programming seriously in early 2024, through university coursework, independent study, and projects I build myself. My focus is React and TypeScript, APIs, and database-backed features; I also experiment with AI-assisted tools and workflow automation.</p>
            <dl className="box-tour-stats">
              <div><dt>2024</dt><dd>Started coding seriously</dd></div>
              <div><dt>{projects.length}</dt><dd>Featured personal builds</dd></div>
              <div><dt>3</dt><dd>University and team projects</dd></div>
            </dl>
            {skillGroups.map((group) => (
              <div key={group.title} className="box-tour-group">
                <h3>{group.title}</h3>
                <ul className="box-tour-chips">
                  {group.items.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
            ))}
          </ContextCard>
        )}
        {phase === 'computer' && (
          <ContextCard key="computer" side="right" tag="Projects" tagColor="#9b7be0" labelledBy="card-project">
            <div className="box-tour-project-meta" aria-live="polite">
              <span>{projectIndex + 1} / {projects.length}</span>
              <span>{project.type}</span>
            </div>
            <div className="box-tour-card-arrows">
              <button type="button" onClick={previousProject} aria-label="Previous project"><ArrowLeft size={18} weight="bold" /></button>
              <button type="button" onClick={nextProject} aria-label="Next project"><ArrowRight size={18} weight="bold" /></button>
            </div>
            <h2 id="card-project">{project.title}</h2>
            <p>{project.description}</p>
            <ul className="box-tour-chips box-tour-tags" aria-label="Built with" style={{ '--tag-accent': project.color }}>
              {project.stack.map((item) => <li key={item}>{item}</li>)}
            </ul>
            <div className="box-tour-actions">
              <Link href={project.href}>Project details <ArrowUpRight size={15} weight="bold" /></Link>
              {project.github && <a href={project.github} target="_blank" rel="noreferrer"><GithubLogo size={16} /> GitHub</a>}
              {project.live && <a href={project.live} target="_blank" rel="noreferrer">Live demo <ArrowUpRight size={15} /></a>}
            </div>
            <div className="box-tour-room-controls">
              <button type="button" onClick={cycleRgb} aria-label={`PC lighting: ${rgbMode}. Change lighting`}>
                <span className={`box-tour-rgb-dot is-${rgbMode}`} aria-hidden="true" /> PC lighting: {RGB_LABELS[rgbMode]}
              </button>
            </div>
            <p className="box-tour-hint">Use the arrows beside the monitor, your left and right arrow keys, or click the screen. University and team projects are in the <Link href="/projects">project archive</Link>.</p>
          </ContextCard>
        )}
        {phase === 'notes' && (
          <ContextCard key="notes" side="left" tag="How I build" tagColor="#6d9be8" labelledBy="card-notes">
            <h2 id="card-notes">Notes from the worktable.</h2>
            <ol className="box-tour-steps">
              {buildSteps.map(([number, label]) => <li key={number}><span>{number}</span>{label}</li>)}
            </ol>
            <p>AI can speed up exploration, but I’m responsible for understanding, reviewing, testing, and integrating the code I use.</p>
            <div className="box-tour-group">
              <h3>Areas I’m practicing</h3>
              <ul className="box-tour-areas">
                {practiceAreas.map((area) => <li key={area.title}><strong>{area.title}</strong><span>{area.items}</span></li>)}
              </ul>
            </div>
            <p className="box-tour-hint">Tools I build with: ChatGPT · Gemini · Claude · Manus · Codex · Copilot</p>
          </ContextCard>
        )}
        {phase === 'contact' && (
          <ContextCard key="contact" side="left" tag="Contact" tagColor="#e2703a" labelledBy="card-contact">
            <h2 id="card-contact">Let’s build something.</h2>
            <p>Have a question about a project or want to discuss a collaboration? I’m most comfortable with a clearly scoped task that matches the work in this room.</p>
            <ul className="box-tour-contact-list">
              <li><Envelope size={17} /><a href="mailto:jaz.sajonia@gmail.com">jaz.sajonia@gmail.com</a></li>
              <li><Phone size={17} /><a href="tel:+639367046410">(+63) 9367046410</a></li>
              <li><MapPin size={17} /><span>General Santos City, Philippines</span></li>
            </ul>
            <div className="box-tour-actions box-tour-contact">
              <Link href="/contact"><Envelope size={16} /> Write a message</Link>
              <a href="https://github.com/jazsajonia-pixel" target="_blank" rel="noreferrer"><GithubLogo size={17} /> GitHub</a>
              <a href="https://www.linkedin.com/in/jazzther-bert-shanne-sajonia-a67502439" target="_blank" rel="noreferrer"><LinkedinLogo size={17} /> LinkedIn</a>
            </div>
            <Link href="/projects" className="box-tour-archive-link">Open the complete archive <ArrowUpRight size={15} weight="bold" /></Link>
          </ContextCard>
        )}
      </AnimatePresence>

    </div>
  );
}
