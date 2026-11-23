'use client';

import { Canvas, createPortal, useFrame, useThree } from '@react-three/fiber';
import { Billboard, Environment, Html, Instance, Instances, Lightformer, PerformanceMonitor, RoundedBox, Text, Trail, useTexture } from '@react-three/drei';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, ArrowUpRight, Browser, Envelope, GithubLogo, HandGrabbing, Lightbulb, LinkedinLogo, MapPin, Moon, Pause, Phone, Sun } from 'phosphor-react';
import * as THREE from 'three';
import { getLofi } from '@/lib/lofi';
import {
  palette, seeded, makeCanvasTexture, woodAlong, woodAcross, shingleMap, brickMap, plasterMap, fabricMap,
  Block, Book, RoomContext, useRoom, Interactive, Mug, angleLerp, actors,
} from './room/core';
import { Model } from './room/models';
import Cat from './room/Cat';
import Human, { DESK_TOP, MOUSE_HOME, MUG_HOME } from './room/Human';
import { EDITOR_SIZE, createEditorState, drawEditor, stepEditor } from './room/vscode';
import { Bed, Nightstand, PbrSurfaces, Posters, ReadingCorner, Rug, ClaudePlush } from './room/Bedroom';
import { MAIN_PORTFOLIO, projects as allProjects, roomProjects as projects } from '@/data/projects';

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

// Project content lives in src/data/projects.js (shared with the /projects archive).

const skillGroups = [
  { title: 'Web development', items: ['TypeScript', 'React', 'Next.js', 'Vite', 'Tailwind CSS', 'Node.js', 'Express', 'Hono', 'PHP', 'REST APIs'] },
  { title: 'Databases and mobile', items: ['PostgreSQL', 'MySQL', 'Neon', 'Prisma', 'Drizzle', 'Flutter', 'Kotlin', 'Jetpack Compose', 'React Native (Expo)'] },
  { title: 'AI and automation', items: ['Make.com', 'Webhooks', 'Airtable', 'Google Sheets', 'Gmail', 'OpenAI', 'Gemini', 'Claude', 'Structured outputs', 'AI agents'] },
  { title: 'DevOps', items: ['Git', 'GitHub', 'GitHub Actions CI/CD', 'Vercel', 'Automated testing'] },
];

const journey = [
  { role: 'Encoder', place: 'HPG Apopong, General Santos City', period: 'Sep 2026 – present', detail: 'Official records, daily DPAR and PICE reports, memoranda and confidential files.' },
  { role: 'Farm Accounting Staff', place: 'Abdeo Farm, General Santos City', period: 'Jul – Aug 2026', detail: 'Daily transactions, check postings, payroll, delivery and inventory records.' },
  { role: 'BS Information Technology', place: 'South East Asian Institute of Technology', period: '2022 – 2026', detail: 'Graduated; capstone and side projects in web, Android and AI automation.' },
  { role: 'HR Office Intern', place: 'SEAIT, Tupi', period: 'Jul – Nov 2025', detail: 'Employee and student records, documents and correspondence, front-desk support.' },
];

const aiLab = [
  { slug: 'qline', title: 'Qline', text: 'Personal AI operating system: L0–L4 risk policy, approval cards, memory and a hash-chained audit log.' },
  { slug: 'unified-connector', title: 'Unified Connector', text: 'One MCP address for AI apps, with OAuth 2.1 + PKCE and per-app read-only tools.' },
  { slug: 'cortex', title: 'Cortex', text: 'On-device Android agent running open models with llama.cpp, plus a 3D knowledge graph.' },
  { slug: 'chrauto-ai', title: 'Chrauto AI', text: 'Android agent that reads the screen, plans with AI, validates locally and waits for approval.' },
];

const buildSteps = [
  ['01', 'Map the workflow and the data'],
  ['02', 'Build it with AI as an implementation aid'],
  ['03', 'Validate, handle errors, and test'],
  ['04', 'Keep a human approval step, then deploy'],
];

const practiceAreas = [
  { title: 'AI workflow automation', items: 'Make.com routers, filters, iterators, aggregators, error handlers' },
  { title: 'AI integrations', items: 'OpenAI · Gemini · Claude APIs with structured JSON outputs' },
  { title: 'CRM and business tools', items: 'Webhooks · Airtable · Google Sheets · Gmail' },
  { title: 'Full-stack web apps', items: 'React / Next.js · Node.js / Hono · PostgreSQL' },
  { title: 'Android apps', items: 'Kotlin / Compose · Flutter · on-device AI' },
];

const FONT = '/fonts/space-grotesk-700.woff';
const FONT_MEDIUM = '/fonts/space-grotesk-500.woff';

/* ------------------------------------------------------------------ */
/* Scroll timeline (scroll progress 0 → 1 is the single source of truth) */
/* ------------------------------------------------------------------ */

const TIMELINE = {
  growStart: 0.03, growEnd: 0.16,
  turnStart: 0.03, turnEnd: 0.18,
  openStart: 0.17, openEnd: 0.27,
  panelFadeStart: 0.25, panelFadeEnd: 0.31,
};

// The tour is a sequence of stops. One scroll gesture, swipe or key press moves exactly one stop, so a card can
// never be skipped by scrolling too far. `hold` is the progress range where the camera is at rest for that stop;
// travelling between stops animates progress from the end of one hold to the start of the next.
const STEPS = [
  { id: 'intro', label: 'Welcome', hold: [0, 0], focus: 0 },
  { id: 'overview', label: 'The room', hold: [0.32, 0.36], focus: 0.34 },
  { id: 'display', label: 'About and tools', hold: [0.42, 0.48], focus: 0.45 },
  { id: 'journey', label: 'Experience', hold: [0.54, 0.6], focus: 0.57 },
  { id: 'computer', label: 'Projects', hold: [0.66, 0.72], focus: 0.69 },
  { id: 'ai', label: 'AI lab', hold: [0.78, 0.84], focus: 0.81 },
  { id: 'notes', label: 'How I build', hold: [0.89, 0.93], focus: 0.91 },
  { id: 'contact', label: 'Contact', hold: [0.97, 1], focus: 1 },
];
const LAST_STEP = STEPS.length - 1;
// Seconds to travel from step i to step i + 1 (the first leg opens the box, so it gets more time).
const LEG_DURATION = [2.6, 1.5, 1.3, 1.4, 1.5, 1.5, 1.5];

// Fractional step position → scroll-timeline progress used by the box and camera.
function progressAt(value) {
  const position = Math.max(0, Math.min(LAST_STEP, value));
  const index = Math.floor(position);
  const t = position - index;
  if (index >= LAST_STEP) return STEPS[LAST_STEP].focus;
  if (t < 0.0001) return STEPS[index].focus;
  return STEPS[index].hold[1] + (STEPS[index + 1].hold[0] - STEPS[index].hold[1]) * t;
}

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
  box: { look: new THREE.Vector3(0, 0.55, 0), dir: new THREE.Vector3(0, 0.36, 1).normalize(), w: 11.5, h: 10.4, wp: 10.2, hp: 10.6, card: 'none', lift: 0.07 },
  overview: { look: new THREE.Vector3(0, -0.15, 0), dir: new THREE.Vector3(0, 0.52, 1).normalize(), w: 9.4, h: 7.2, wp: 9.8, hp: 7.2, card: 'none', lift: 0 },
  display: { look: toWorld([1.0, 1.75, -3]), dir: dirToWorld([0.1, 0.16, 1]), w: 4.0, h: 2.7, wp: 2.5, hp: 2.7, card: 'left', lift: 0, lookPortrait: toWorld([0.25, 2.1, -3]) },
  computer: { look: toWorld([-2.95, 1.12, -0.05]), dir: dirToWorld([1, 0.2, 0.04]), w: 3.1, h: 1.95, wp: 2.55, hp: 2.3, card: 'right', lift: 0, lookPortrait: toWorld([-3, 1.55, -0.3]) },
  journey: { look: toWorld([-2.1, 2.2, -3]), dir: dirToWorld([0.15, 0.08, 1]), w: 2.0, h: 1.45, wp: 1.75, hp: 1.6, card: 'left', lift: 0 },
  ai: { look: toWorld([2.25, 1.5, 1.8]), dir: dirToWorld([0.25, 0.16, 1]), w: 2.4, h: 3.4, wp: 1.9, hp: 3.2, card: 'left', lift: 0 },
  outro: { look: new THREE.Vector3(0, -0.35, 0), dir: new THREE.Vector3(0.12, 0.5, 1).normalize(), w: 8.6, h: 6.6, wp: 9.6, hp: 7.4, card: 'left', lift: 0 },
  notes: { look: toWorld([0.75, 0.5, 0.85]), dir: dirToWorld([0.55, 0.95, 0.75]), w: 2.5, h: 1.8, wp: 2.25, hp: 1.9, card: 'left', lift: 0 },
};

// The camera reaches each stop a little before its card appears and leaves only after the card has gone,
// so a card never fades in while the view is still moving.
const KEYFRAMES = [
  { at: 0, stop: 'box' },
  { at: 0.18, stop: 'box' },
  ...STEPS.slice(1).flatMap((item) => {
    const stop = item.id === 'contact' ? 'outro' : item.id;
    return [{ at: item.hold[0], stop }, { at: item.hold[1], stop }];
  }),
];

const FOV = 38;
const TAN = Math.tan(THREE.MathUtils.degToRad(FOV / 2));

const makeFrame = () => ({ position: new THREE.Vector3(), look: new THREE.Vector3(), shiftX: 0, shiftY: 0 });

// Writes the camera framing for `stop` into `out` (no allocation: this runs every frame).
function frameStop(stop, width, height, out = makeFrame()) {
  const aspect = width / height;
  const portrait = aspect < 0.95;
  // Fraction of the screen left free next to (or above) the information card.
  let freeW = 1;
  let freeH = 1;
  let shiftX = 0;
  let shiftY = stop.lift;
  if (stop.card !== 'none') {
    if (portrait) {
      freeH = 0.52;
      shiftY = 0.24;
    } else {
      freeW = 0.6;
      shiftX = stop.card === 'left' ? 0.2 : -0.2;
    }
  }
  const w = portrait ? stop.wp : stop.w;
  const h = portrait ? stop.hp : stop.h;
  const distance = Math.max(w / (2 * TAN * aspect * freeW), h / (2 * TAN * freeH));
  const look = portrait && stop.lookPortrait ? stop.lookPortrait : stop.look;
  out.position.copy(look).addScaledVector(stop.dir, distance);
  out.look.copy(look);
  out.shiftX = shiftX;
  out.shiftY = shiftY;
  return out;
}

// Is the tour resting at a stop (not the welcome screen, not travelling)?
function atRest(p) {
  return STEPS.some((item, index) => index > 0 && p >= item.hold[0] - 0.002 && p <= item.hold[1] + 0.002);
}

// Limited look-around: at a stop, dragging orbits the camera a little around the subject (±25° sideways,
// ±12° up and down). It springs back when the tour moves on, so the cards always stay readable.
const LOOK_YAW = THREE.MathUtils.degToRad(25);
const LOOK_PITCH = THREE.MathUtils.degToRad(12);

function CameraTour({ progressRef, reducedMotion }) {
  const { camera, size, gl, pointer } = useThree();
  const look = useRef({ yaw: 0, pitch: 0, targetYaw: 0, targetPitch: 0, drag: null, notified: false });
  const offset = useMemo(() => new THREE.Vector3(), []);
  useEffect(() => {
    const element = gl.domElement;
    const state = look.current;
    const onDown = (event) => {
      if (!atRest(progressRef.current.smooth) || (event.pointerType === 'mouse' && event.button !== 0)) return;
      state.drag = { x: event.clientX, y: event.clientY, yaw: state.targetYaw, pitch: state.targetPitch, type: event.pointerType, moved: false };
    };
    const onMove = (event) => {
      const drag = state.drag;
      if (!drag) return;
      const dx = event.clientX - drag.x;
      const dy = event.clientY - drag.y;
      // On touch, vertical swipes move between stops, so only a mostly horizontal drag looks around.
      if (drag.type !== 'mouse' && !drag.moved && Math.abs(dy) > Math.abs(dx)) { state.drag = null; return; }
      if (!drag.moved && Math.hypot(dx, dy) < 6) return;
      drag.moved = true;
      element.classList.add('is-dragging');
      state.targetYaw = THREE.MathUtils.clamp(drag.yaw - (dx / size.width) * 1.6, -LOOK_YAW, LOOK_YAW);
      if (drag.type === 'mouse') state.targetPitch = THREE.MathUtils.clamp(drag.pitch + (dy / size.height) * 1.0, -LOOK_PITCH, LOOK_PITCH);
      if (!state.notified) { state.notified = true; window.dispatchEvent(new CustomEvent('tour:look')); }
    };
    const onUp = () => { state.drag = null; element.classList.remove('is-dragging'); };
    element.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      element.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [gl, size, progressRef]);
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

  const frames = useMemo(() => ({ a: makeFrame(), b: makeFrame(), target: makeFrame() }), []);
  useFrame((_, delta) => {
    const p = progressRef.current.smooth;
    let index = 0;
    while (index < KEYFRAMES.length - 2 && p > KEYFRAMES[index + 1].at) index += 1;
    const a = KEYFRAMES[index];
    const b = KEYFRAMES[index + 1];
    const blend = easeInOut(range(p, a.at, b.at));
    const fa = frameStop(STOPS[a.stop], size.width, size.height, frames.a);
    const fb = a.stop === b.stop ? fa : frameStop(STOPS[b.stop], size.width, size.height, frames.b);
    const target = frames.target;
    target.position.copy(fa.position).lerp(fb.position, blend);
    target.look.copy(fa.look).lerp(fb.look, blend);
    target.shiftX = THREE.MathUtils.lerp(fa.shiftX, fb.shiftX, blend);
    target.shiftY = THREE.MathUtils.lerp(fa.shiftY, fb.shiftY, blend);

    if (!current.current || reducedMotion) {
      current.current = current.current || makeFrame();
      current.current.position.copy(target.position);
      current.current.look.copy(target.look);
      current.current.shiftX = target.shiftX;
      current.current.shiftY = target.shiftY;
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
    // Look-around orbit (springs back to the framed view while travelling).
    const lookState = look.current;
    if (!atRest(p) || reducedMotion) { lookState.targetYaw = 0; lookState.targetPitch = 0; lookState.drag = null; }
    const spring = 1 - Math.pow(lookState.drag ? 0.0001 : 0.02, Math.min(delta, 0.1));
    lookState.yaw += (lookState.targetYaw - lookState.yaw) * spring;
    lookState.pitch += (lookState.targetPitch - lookState.pitch) * spring;
    offset.subVectors(current.current.position, current.current.look)
      .applyAxisAngle(right, -lookState.pitch)
      .applyAxisAngle(camera.up, lookState.yaw);
    camera.position.copy(current.current.look).add(offset)
      .addScaledVector(right, parallax.current.x * amount)
      .addScaledVector(camera.up, parallax.current.y * amount * 0.6);
    camera.lookAt(current.current.look);
    // Shift the rendered image so the focal subject sits in the space the card leaves free.
    camera.setViewOffset(size.width, size.height, -current.current.shiftX * size.width, current.current.shiftY * size.height, size.width, size.height);
    camera.updateProjectionMatrix();
    // QA hook: `__tourDebug.cam = { pos: [x, y, z], look: [x, y, z] }` in room coordinates pins the camera.
    const debugCam = typeof window !== 'undefined' ? window.__tourDebug?.cam : null;
    if (debugCam) {
      camera.position.copy(toWorld(debugCam.pos));
      camera.lookAt(toWorld(debugCam.look));
      camera.clearViewOffset();
      camera.updateProjectionMatrix();
    }
    if (typeof window !== 'undefined' && window.__tourDebug) window.__tourDebug.info = { calls: gl.info.render.calls, triangles: gl.info.render.triangles, camera: camera.position.toArray(), shiftX: current.current.shiftX };
  });

  return null;
}

/* ------------------------------------------------------------------ */
/* Small helpers                                                       */
/* ------------------------------------------------------------------ */


// Glazed ceramic pot with a rim, soil and a leafy plant built from tapered leaves on short stems.
function Plant({ position, scale = 1, pot = '#e9e3da', leaf = '#4f7a4c', kind = 'leafy' }) {
  const leaves = useMemo(() => {
    const random = seeded(kind === 'tall' ? 21 : 9);
    const count = kind === 'tall' ? 16 : 11;
    return Array.from({ length: count }, (_, index) => {
      const angle = (index / count) * Math.PI * 2 + random() * 0.6;
      const height = kind === 'tall' ? 0.42 + random() * 0.6 : 0.32 + random() * 0.18;
      const lean = 0.35 + random() * 0.5;
      return { angle, height, lean, size: (kind === 'tall' ? 0.11 : 0.075) * (0.8 + random() * 0.45), shade: random() };
    });
  }, [kind]);
  const potHeight = kind === 'tall' ? 0.34 : 0.24;
  return (
    <group position={position} scale={scale}>
      <mesh castShadow receiveShadow position={[0, potHeight / 2, 0]}>
        <cylinderGeometry args={[0.14, 0.105, potHeight, 28]} />
        <meshStandardMaterial color={pot} roughness={0.35} />
      </mesh>
      <mesh castShadow position={[0, potHeight - 0.006, 0]}>
        <torusGeometry args={[0.137, 0.012, 8, 28]} />
        <meshStandardMaterial color={pot} roughness={0.35} />
      </mesh>
      <mesh position={[0, potHeight - 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.128, 24]} />
        <meshStandardMaterial color="#4a3426" roughness={1} />
      </mesh>
      {leaves.map(({ angle, height, lean, size, shade }, index) => {
        const reach = Math.sin(lean) * height * 0.5;
        return (
          <group key={index} position={[0, potHeight - 0.02, 0]} rotation={[0, angle, 0]}>
            <mesh position={[reach / 2, height / 2, 0]} rotation={[0, 0, -lean * 0.5]}>
              <cylinderGeometry args={[0.006, 0.008, height, 5]} />
              <meshStandardMaterial color="#5d7a45" roughness={0.8} />
            </mesh>
            <mesh castShadow position={[reach, height, 0]} rotation={[0, 0, -lean]} scale={[size * 0.55, size * 1.25, size * 0.12]}>
              <sphereGeometry args={[1, 12, 10]} />
              <meshStandardMaterial color={shade > 0.5 ? leaf : '#3f6a40'} roughness={0.55} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}


/* ------------------------------------------------------------------ */
/* Interactivity                                                        */
/* ------------------------------------------------------------------ */


export const RGB_MODES = ['wave', 'sunset', 'off'];
const RGB_LABELS = { wave: 'Wave', sunset: 'Sunset', off: 'Off' };
const RGB_THEME = ['#e07a4b', '#d9a65b', '#5fb3a3', '#7c8ce0'];


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
      <group ref={second}><Block args={[0.006, 0.14, 0.01]} color={palette.accent} position={[0, 0.06, 0.01]} castShadow={false} /></group>
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
        <torusGeometry args={[0.105, 0.008, 8, 36]} />
        <meshStandardMaterial ref={ringRef} color="#1b1c1f" emissive="#e07a4b" emissiveIntensity={1.6} roughness={0.4} toneMapped={false} />
      </mesh>
      <group ref={blades}>
        {Array.from({ length: 7 }, (_, blade) => (
          <group key={blade} rotation={[(blade / 7) * Math.PI * 2, 0, 0]}>
            <mesh position={[0.004, 0.055, 0]} rotation={[0, 0.5, 0]}>
              <boxGeometry args={[0.008, 0.07, 0.04]} />
              <meshStandardMaterial color="#2a2b2f" roughness={0.45} metalness={0.2} />
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

// Tracks whether the generated lo-fi track is playing (shared by the record player and the "Now playing" pill).
function useLofiPlaying() {
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    const lofi = getLofi();
    if (!lofi) return undefined;
    setPlaying(lofi.playing);
    return lofi.on(setPlaying);
  }, []);
  return playing;
}

function MusicNotes({ playing }) {
  const group = useRef();
  const { reducedMotion } = useRoom();
  useFrame(({ clock }) => {
    if (!group.current) return;
    group.current.visible = playing && !reducedMotion;
    group.current.children.forEach((note, index) => {
      const phase = (clock.elapsedTime * 0.32 + index / 3) % 1;
      note.position.set(Math.sin(phase * 5 + index * 2) * 0.08 - 0.06, 0.15 + phase * 0.55, 0);
      note.scale.setScalar(Math.max(0.001, Math.sin(phase * Math.PI)));
    });
  });
  return (
    <group ref={group} visible={false}>
      {['♪', '♫', '♪'].map((glyph, index) => (
        <Billboard key={index}>
          <Text font={FONT} fontSize={0.075} color={palette.accent} anchorX="center" anchorY="middle" fillOpacity={1}>
            {glyph}
          </Text>
        </Billboard>
      ))}
    </group>
  );
}

function SpinningRecord({ position = [-0.42, 0.76, 0.02] }) {
  const record = useRef();
  const arm = useRef();
  const playing = useLofiPlaying();
  const { reducedMotion } = useRoom();
  useFrame((_, delta) => {
    if (record.current && playing && !reducedMotion) record.current.rotation.y += delta * 3.5;
    if (arm.current) arm.current.rotation.y += ((playing ? -0.42 : 0.05) - arm.current.rotation.y) * Math.min(1, delta * 4);
  });
  return (
    <Interactive label={playing ? 'Stop the lo-fi' : 'Play some lo-fi'} onSelect={() => getLofi()?.toggle()} position={position} labelOffset={[0, 0.35, 0]}>
      <MusicNotes playing={playing} />
      {/* Walnut plinth with aluminium feet */}
      <RoundedBox args={[0.62, 0.07, 0.46]} radius={0.012} smoothness={2} position={[0, 0.035, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={palette.timber} roughness={0.5} map={woodAcross()} />
      </RoundedBox>
      <Block args={[0.6, 0.004, 0.44]} color="#1d1d1f" roughness={0.6} position={[0, 0.072, 0]} castShadow={false} />
      {/* Platter and record */}
      <mesh position={[-0.06, 0.08, 0]} castShadow>
        <cylinderGeometry args={[0.19, 0.19, 0.014, 40]} />
        <meshStandardMaterial color={palette.steel} roughness={0.3} metalness={0.8} />
      </mesh>
      <group ref={record} position={[-0.06, 0.09, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.18, 0.18, 0.006, 40]} />
          <meshStandardMaterial color="#141414" roughness={0.28} metalness={0.2} />
        </mesh>
        {[0.15, 0.12, 0.09].map((radius) => (
          <mesh key={radius} position={[0, 0.0035, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[radius - 0.002, radius, 40]} />
            <meshStandardMaterial color="#2a2a2a" roughness={0.2} />
          </mesh>
        ))}
        <mesh position={[0, 0.004, 0]}>
          <cylinderGeometry args={[0.055, 0.055, 0.002, 24]} />
          <meshStandardMaterial color={palette.accent} roughness={0.6} />
        </mesh>
      </group>
      {/* Tonearm */}
      <group position={[0.21, 0.08, -0.14]}>
        <mesh castShadow position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.025, 0.03, 0.04, 16]} />
          <meshStandardMaterial color={palette.steel} roughness={0.3} metalness={0.8} />
        </mesh>
        <group ref={arm} position={[0, 0.045, 0]}>
          <mesh position={[0, 0, 0.12]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.005, 0.005, 0.24, 8]} />
            <meshStandardMaterial color="#c9cbd0" roughness={0.25} metalness={0.9} />
          </mesh>
          <Block args={[0.03, 0.012, 0.04]} color="#1d1d1f" position={[0, -0.004, 0.245]} castShadow={false} />
        </group>
      </group>
    </Interactive>
  );
}


// Thin gallery frame with a white mat. `w`/`h` are outside dimensions; children render on the artwork plane.
function GalleryFrame({ w, h, mat = 0.07, color = '#1f1d1b', position, children }) {
  const bar = 0.032;
  return (
    <group position={position}>
      <Block args={[w, bar, 0.045]} color={color} roughness={0.45} position={[0, h / 2 - bar / 2, 0]} />
      <Block args={[w, bar, 0.045]} color={color} roughness={0.45} position={[0, -h / 2 + bar / 2, 0]} />
      <Block args={[bar, h - 2 * bar, 0.045]} color={color} roughness={0.45} position={[-w / 2 + bar / 2, 0, 0]} />
      <Block args={[bar, h - 2 * bar, 0.045]} color={color} roughness={0.45} position={[w / 2 - bar / 2, 0, 0]} />
      <mesh position={[0, 0, 0.004]} receiveShadow>
        <planeGeometry args={[w - 2 * bar, h - 2 * bar]} />
        <meshStandardMaterial color="#f8f6f1" roughness={0.95} />
      </mesh>
      <group position={[0, 0, 0.008]}>{children({ w: w - 2 * bar - 2 * mat, h: h - 2 * bar - 2 * mat })}</group>
    </group>
  );
}

function PortraitPhoto({ w, h }) {
  const texture = useTexture('/room/profile.jpg');
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return (
    <mesh>
      <planeGeometry args={[w, h]} />
      <meshStandardMaterial map={texture} roughness={0.6} />
    </mesh>
  );
}

function QlineMark({ size }) {
  const texture = useTexture('/room/qline-icon.png');
  texture.colorSpace = THREE.SRGBColorSpace;
  return (
    <mesh position={[0, 0.03, 0.002]}>
      <planeGeometry args={[size, size]} />
      <meshBasicMaterial map={texture} transparent toneMapped={false} />
    </mesh>
  );
}

function drawDiploma(context, width, height) {
  context.fillStyle = '#fbf7ee';
  context.fillRect(0, 0, width, height);
  context.strokeStyle = '#b88d4e';
  context.lineWidth = 6;
  context.strokeRect(22, 22, width - 44, height - 44);
  context.lineWidth = 1.5;
  context.strokeRect(36, 36, width - 72, height - 72);
  context.textAlign = 'center';
  context.fillStyle = '#5e3b25';
  context.font = '600 22px "Space Grotesk", system-ui, sans-serif';
  context.fillText('SOUTH EAST ASIAN INSTITUTE OF TECHNOLOGY', width / 2, 104);
  context.fillStyle = '#23201d';
  context.font = '700 44px Georgia, "Times New Roman", serif';
  context.fillText('Bachelor of Science', width / 2, 196);
  context.fillText('in Information Technology', width / 2, 250);
  context.fillStyle = '#6b6058';
  context.font = 'italic 26px Georgia, "Times New Roman", serif';
  context.fillText('Jazzther Bert Shanne O. Sajonia', width / 2, 330);
  context.fillStyle = '#b88d4e';
  context.fillRect(width / 2 - 120, 352, 240, 2);
  context.fillStyle = '#5e3b25';
  context.font = '600 20px "Space Grotesk", system-ui, sans-serif';
  context.fillText('CLASS OF 2026', width / 2, 400);
  // Seal
  context.fillStyle = '#c4572e';
  context.beginPath();
  context.arc(width - 120, height - 104, 42, 0, Math.PI * 2);
  context.fill();
  context.strokeStyle = '#fbf7ee';
  context.lineWidth = 2;
  context.beginPath();
  context.arc(width - 120, height - 104, 32, 0, Math.PI * 2);
  context.stroke();
}

function Diploma({ w, h }) {
  const texture = useMemo(() => makeCanvasTexture('diploma', 768, 520, drawDiploma), []);
  useEffect(() => {
    // Redraw once the web fonts are ready so the certificate text uses Space Grotesk.
    if (!texture || !document.fonts?.ready) return;
    document.fonts.ready.then(() => { drawDiploma(texture.image.getContext('2d'), 768, 520); texture.needsUpdate = true; });
  }, [texture]);
  return (
    <mesh>
      <planeGeometry args={[w, h]} />
      <meshStandardMaterial map={texture} roughness={0.85} />
    </mesh>
  );
}

function WallClock() {
  return (
    <group position={[-1.02, 2.5, -S + 0.04]}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.24, 0.24, 0.05, 48]} />
        <meshStandardMaterial color={palette.metal} roughness={0.4} metalness={0.5} />
      </mesh>
      <mesh position={[0, 0, 0.026]}>
        <circleGeometry args={[0.215, 48]} />
        <meshStandardMaterial color="#f8f6f1" roughness={0.7} />
      </mesh>
      {Array.from({ length: 12 }, (_, tick) => {
        const angle = (tick / 12) * Math.PI * 2;
        const long = tick % 3 === 0;
        return (
          <Block key={tick} args={[long ? 0.012 : 0.006, long ? 0.04 : 0.022, 0.004]} color={palette.ink} castShadow={false} receiveShadow={false}
            position={[Math.sin(angle) * 0.18, Math.cos(angle) * 0.18, 0.029]} rotation={[0, 0, -angle]} />
        );
      })}
      <group position={[0, 0, -0.01]}><ClockHands /></group>
      <mesh position={[0, 0, 0.045]}>
        <cylinderGeometry args={[0.012, 0.012, 0.01, 12]} />
        <meshStandardMaterial color={palette.accent} />
      </mesh>
    </group>
  );
}



// Phone on a small stand, screen showing the Qline icon.
function PhoneOnStand({ position, rotation }) {
  return (
    <group position={position} rotation={rotation}>
      <Block args={[0.14, 0.02, 0.1]} color={palette.steel} metalness={0.7} roughness={0.3} position={[0, 0.01, 0]} />
      <group position={[0, 0.17, -0.01]} rotation={[-0.16, 0, 0]}>
        <RoundedBox args={[0.17, 0.33, 0.016]} radius={0.02} smoothness={3} castShadow>
          <meshStandardMaterial color="#141416" roughness={0.3} metalness={0.4} />
        </RoundedBox>
        <mesh position={[0, 0, 0.0085]}>
          <planeGeometry args={[0.152, 0.31]} />
          <meshBasicMaterial color="#0d1512" toneMapped={false} />
        </mesh>
        <Suspense fallback={null}>
          <group position={[0, 0.02, 0.009]}><QlineMark size={0.11} /></group>
        </Suspense>
        <Text font={FONT} position={[0, -0.09, 0.01]} fontSize={0.022} color="#cfe9df" anchorX="center" anchorY="middle" letterSpacing={0.2}>QLINE</Text>
      </group>
    </group>
  );
}

function GraduationCap({ position, rotation }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow position={[0, 0.045, 0]}>
        <cylinderGeometry args={[0.085, 0.095, 0.09, 24]} />
        <meshStandardMaterial color="#1b1b1d" roughness={0.75} />
      </mesh>
      <Block args={[0.3, 0.012, 0.3]} color="#1b1b1d" roughness={0.75} position={[0, 0.095, 0]} rotation={[0, Math.PI / 4, 0]} />
      <mesh position={[0, 0.104, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.01, 10]} />
        <meshStandardMaterial color={palette.accent} />
      </mesh>
      {/* Tassel in SEAIT orange */}
      <mesh position={[0.1, 0.06, 0.04]} rotation={[0, 0, 0.1]}>
        <cylinderGeometry args={[0.006, 0.012, 0.08, 8]} />
        <meshStandardMaterial color="#e2762f" roughness={0.8} />
      </mesh>
    </group>
  );
}

function GameController({ position, rotation }) {
  return (
    <group position={position} rotation={rotation}>
      <RoundedBox args={[0.3, 0.05, 0.15]} radius={0.024} smoothness={3} position={[0, 0.026, 0]} castShadow>
        <meshStandardMaterial color="#2c2d31" roughness={0.5} />
      </RoundedBox>
      {[-1, 1].map((side) => (
        <mesh key={side} castShadow position={[side * 0.12, 0.024, 0.05]} scale={[1, 0.6, 1.2]}>
          <sphereGeometry args={[0.055, 16, 12]} />
          <meshStandardMaterial color="#2c2d31" roughness={0.5} />
        </mesh>
      ))}
      {[-0.06, 0.06].map((x) => (
        <mesh key={x} position={[x, 0.058, 0.02]}>
          <cylinderGeometry args={[0.018, 0.02, 0.016, 14]} />
          <meshStandardMaterial color="#45474d" roughness={0.6} />
        </mesh>
      ))}
      {[[0.1, -0.02, '#c4572e'], [0.125, 0.0, '#7f8b70'], [0.1, 0.02, '#d2a640'], [0.075, 0.0, '#5b86c9']].map(([x, z, color]) => (
        <mesh key={color} position={[x, 0.054, z]}>
          <sphereGeometry args={[0.008, 8, 6]} />
          <meshStandardMaterial color={color} roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
}

// Compact home server: the backend projects (APIs, MCP server) live here.
function MiniServer({ position }) {
  const { reducedMotion } = useRoom();
  const leds = useRef([]);
  useFrame(({ clock }) => {
    leds.current.forEach((led, index) => {
      if (led) led.emissiveIntensity = reducedMotion ? 1 : 0.6 + 0.8 * (Math.sin(clock.elapsedTime * (2 + index * 1.7) + index) > 0.2 ? 1 : 0);
    });
  });
  return (
    <group position={position}>
      {[0, 1].map((unit) => (
        <group key={unit} position={[0, 0.05 + unit * 0.095, 0]}>
          <RoundedBox args={[0.3, 0.085, 0.24]} radius={0.01} smoothness={2} castShadow receiveShadow>
            <meshStandardMaterial color="#cfd1d4" roughness={0.35} metalness={0.7} />
          </RoundedBox>
          <Block args={[0.2, 0.05, 0.004]} color="#1b1c1f" position={[-0.03, 0, 0.121]} castShadow={false} />
          {[0, 1].map((led) => (
            <mesh key={led} position={[0.1 + led * 0.025, 0, 0.123]}>
              <circleGeometry args={[0.006, 10]} />
              <meshStandardMaterial ref={(material) => { leds.current[unit * 2 + led] = material; }} color="#0b1a12" emissive={led ? '#e8a54b' : '#4fd19b'} emissiveIntensity={1} toneMapped={false} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

// Cube bookshelf (Poly Haven) filled with the tools I use: books are languages, the mini server holds the APIs,
// the phone runs Qline, the controller is for the Godot game.
const SHELF = { x: -2.3, z: -S + 0.19 };
const CELL_X = [-0.36, 0, 0.36];
const CELL_Y = [0.45, 0.82, 1.19, 1.56];

function Bookshelf() {
  return (
    <group position={[SHELF.x, 0, SHELF.z]}>
      <Suspense fallback={<Block args={[1.08, 1.56, 0.37]} color="#d9b98a" position={[0, 0.78, 0]} />}>
        <Model name="wooden_display_shelves_01" rotation={[0, -Math.PI / 2, 0]} />
        <Model name="book_encyclopedia_set_01" position={[CELL_X[0] - 0.15, CELL_Y[0], -0.02]} scale={[0.58, 0.95, 0.85]} />
        <Model name="potted_plant_04" position={[CELL_X[1], CELL_Y[2], 0]} scale={1.05} />
        <Model name="standing_picture_frame_01" position={[CELL_X[2] - 0.05, CELL_Y[3], -0.02]} rotation={[0, -0.25, 0]} scale={0.9} />
        <Model name="ceramic_vase_01" position={[CELL_X[0] + 0.05, CELL_Y[3], 0]} scale={0.55} />
      </Suspense>
      <MiniServer position={[CELL_X[1], CELL_Y[0], -0.02]} />
      <GameController position={[CELL_X[2], CELL_Y[0], 0.02]} rotation={[0, -0.25, 0]} />
      <Book position={[CELL_X[0] - 0.11, CELL_Y[1] + 0.14, 0]} size={[0.06, 0.28, 0.24]} color="#2f3e56" title="TS" />
      <Book position={[CELL_X[0] - 0.045, CELL_Y[1] + 0.135, 0]} size={[0.06, 0.27, 0.23]} color="#7a3b33" title="REACT" />
      <Book position={[CELL_X[0] + 0.02, CELL_Y[1] + 0.14, 0]} size={[0.06, 0.28, 0.24]} color="#3f5a4a" title="NODE" />
      <Book position={[CELL_X[0] + 0.1, CELL_Y[1] + 0.125, 0]} size={[0.06, 0.25, 0.22]} color="#c2ad8b" title="NEXT" tilt={-0.22} />
      <PhoneOnStand position={[CELL_X[1], CELL_Y[1], -0.02]} rotation={[0, 0.12, 0]} />
      <Book position={[CELL_X[2] - 0.1, CELL_Y[1] + 0.13, 0]} size={[0.065, 0.26, 0.24]} color="#556b4f" title="KOTLIN" />
      <Book position={[CELL_X[2] - 0.03, CELL_Y[1] + 0.125, 0]} size={[0.06, 0.25, 0.23]} color="#3d5a80" title="FLUTTER" />
      <Book position={[CELL_X[2] + 0.04, CELL_Y[1] + 0.13, 0]} size={[0.06, 0.26, 0.24]} color="#3a3a3c" title="SQL" />
      <GraduationCap position={[CELL_X[0], CELL_Y[2], 0]} rotation={[0, 0.4, 0]} />
      <Book position={[CELL_X[2], CELL_Y[2] + 0.02, 0]} size={[0.22, 0.04, 0.17]} color="#c4704e" tilt={Math.PI / 2} />
      <Book position={[CELL_X[2], CELL_Y[2] + 0.06, 0]} size={[0.2, 0.035, 0.15]} color="#2f3e56" tilt={Math.PI / 2} />
    </group>
  );
}

function Credenza() {
  return (
    <group position={[-0.86, 0, -S + 0.28]}>
      <Suspense fallback={<Block args={[1.46, 0.68, 0.52]} color={palette.timber} position={[0, 0.34, 0]} />}>
        <Model name="modern_wooden_cabinet" scale={[0.6, 1, 1]} />
        <Model name="potted_plant_04" position={[0.6, 0.68, 0.02]} scale={0.85} />
      </Suspense>
      {/* Bookshelf speaker and a short stack of records */}
      <group position={[0.3, 0.68, -0.04]}>
        <RoundedBox args={[0.2, 0.32, 0.22]} radius={0.012} smoothness={2} position={[0, 0.16, 0]} castShadow>
          <meshStandardMaterial color={palette.timber} roughness={0.5} map={woodAlong()} />
        </RoundedBox>
        <Block args={[0.17, 0.29, 0.004]} color="#2b2a29" roughness={0.95} map={fabricMap()} position={[0, 0.16, 0.111]} castShadow={false} />
      </group>
      <group position={[0.0, 0.68, 0.04]}>
        {[0, 1, 2].map((record) => (
          <Block key={record} args={[0.31, 0.012, 0.31]} color={['#1d1d1f', '#c4572e', '#e8e0d4'][record]} roughness={0.6} position={[0, 0.006 + record * 0.013, 0]} rotation={[0, record * 0.12, 0]} />
        ))}
      </group>
      <SpinningRecord position={[-0.4, 0.68, 0.02]} />
    </group>
  );
}

function DisplayWall() {
  const { goTo } = useRoom();
  return (
    <group>
      {/* Name sign: dimensional lettering above the posters */}
      <Interactive label="About me" onSelect={() => goTo('display')} position={[1.1, 2.92, -S + 0.04]} labelOffset={[0, 0.4, 0.1]}>
        <Text font={FONT} position={[0.01, 0.062, 0.0]} fontSize={0.2} color="#cfc5b6" anchorX="center" anchorY="middle" letterSpacing={0.1}>
          JAZZ SAJONIA
        </Text>
        <Text font={FONT} position={[0, 0.07, 0.02]} fontSize={0.2} color={palette.ink} anchorX="center" anchorY="middle" letterSpacing={0.1}>
          JAZZ SAJONIA
        </Text>
        <Block args={[0.28, 0.01, 0.01]} color={palette.accent} position={[0, -0.075, 0.015]} castShadow={false} />
        <Text font={FONT_MEDIUM} position={[0, -0.145, 0.02]} fontSize={0.052} color="#5a5048" anchorX="center" anchorY="middle" letterSpacing={0.24}>
          SOFTWARE BUILDER · AI & AUTOMATION
        </Text>
        <mesh position={[0, 0, 0.02]}>
          <planeGeometry args={[1.8, 0.45]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </Interactive>

      {/* Gallery above the bookshelf: portrait, degree and the current flagship project */}
      <GalleryFrame w={0.6} h={0.76} position={[-2.56, 2.36, -S + 0.03]}>
        {({ w, h }) => (
          <Suspense fallback={<mesh><planeGeometry args={[w, h]} /><meshStandardMaterial color="#d9d4cc" /></mesh>}>
            <PortraitPhoto w={w} h={h} />
          </Suspense>
        )}
      </GalleryFrame>
      <GalleryFrame w={0.56} h={0.42} mat={0.04} position={[-1.86, 2.52, -S + 0.03]} color={palette.timberDark}>
        {({ w, h }) => <Diploma w={w} h={h} />}
      </GalleryFrame>
      <GalleryFrame w={0.4} h={0.4} mat={0.035} position={[-1.92, 2.02, -S + 0.03]}>
        {({ w, h }) => (
          <group>
            <mesh>
              <planeGeometry args={[w, h]} />
              <meshBasicMaterial color="#0d1512" toneMapped={false} />
            </mesh>
            <Suspense fallback={null}><QlineMark size={w * 0.58} /></Suspense>
            <Text font={FONT} position={[0, -h * 0.38, 0.003]} fontSize={0.026} color="#cfe9df" anchorX="center" anchorY="middle" letterSpacing={0.3}>QLINE · 2026</Text>
          </group>
        )}
      </GalleryFrame>

      <WallClock />
      <Bookshelf />
      <Credenza />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Computer / workstation wall (left wall, x = -S)                      */
/* ------------------------------------------------------------------ */

const screenImages = {};
function loadScreenImage(src, onLoad) {
  if (!src || typeof Image === 'undefined') return null;
  if (!screenImages[src]) {
    const image = new Image();
    image.decoding = 'async';
    image.src = src;
    screenImages[src] = image;
  }
  const image = screenImages[src];
  if (!image.complete) image.addEventListener('load', onLoad, { once: true });
  return image.complete && image.naturalWidth ? image : null;
}


// Preview artwork for the run pane, taken from the shared project data where a screenshot exists.
const previewFor = (slug) => allProjects.find((item) => item.slug === slug)?.image ?? null;

function MonitorScreen({ project, index, progressRef }) {
  const canvas = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const element = document.createElement('canvas');
    element.width = EDITOR_SIZE.width;
    element.height = EDITOR_SIZE.height;
    return element;
  }, []);
  const texture = useMemo(() => {
    if (!canvas) return null;
    const value = new THREE.CanvasTexture(canvas);
    value.colorSpace = THREE.SRGBColorSpace;
    value.anisotropy = 8;
    value.generateMipmaps = false;
    value.minFilter = THREE.LinearFilter;
    return value;
  }, [canvas]);
  const editor = useRef(null);
  const since = useRef(1);
  const image = useRef(null);
  const { reducedMotion } = useRoom();

  useEffect(() => {
    editor.current = createEditorState(project);
    // Start partway through so the code is never empty when the stop is reached.
    editor.current.typed = reducedMotion ? 1e9 : project.summary.length * 0.8;
    image.current = null;
    const src = previewFor(project.slug);
    if (src) image.current = loadScreenImage(src, () => { image.current = loadScreenImage(src); since.current = 1; });
    since.current = 1;
  }, [project, reducedMotion]);

  useFrame((_, delta) => {
    if (!canvas || !texture || !editor.current) return;
    const p = progressRef ? progressRef.current.smooth : 1;
    if (p < 0.2) return; // box still closed: no need to animate the screen
    const dt = Math.min(delta, 0.1);
    if (!reducedMotion) stepEditor(editor.current, dt, actors.human.typing !== false);
    since.current += dt;
    // ~12 fps is plenty for a typing animation and keeps canvas uploads cheap.
    if (since.current < 1 / 12) return;
    since.current = 0;
    drawEditor(canvas, editor.current, { image: image.current, index, total: projects.length });
    texture.needsUpdate = true;
  });

  useEffect(() => () => texture?.dispose(), [texture]);

  return (
    <mesh position={[0, 0.01, 0.036]}>
      <planeGeometry args={[1.22, 0.7625]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}

// Linen pinboard above the desk with index cards for the projects I am shipping now.
const PINNED = [
  { title: 'QLINE', note: 'AI OS · v1.12', color: '#3fbf9b' },
  { title: 'CONNECTOR', note: 'MCP · OAuth 2.1', color: '#c98b4f' },
  { title: 'TASKFLOW', note: 'Teams · realtime', color: '#7c7fd8' },
  { title: 'EDGEFLOW', note: 'Android · sidebar', color: '#2fb5a8' },
  { title: 'FLOWPILOT', note: 'Workflows · AI', color: '#6c8fd6' },
];

function ProjectBoard() {
  const { goTo } = useRoom();
  return (
    <Interactive label="Projects I’m shipping" onSelect={() => goTo('computer')} position={[-S + 0.05, 2.62, -0.3]} rotation={[0, Math.PI / 2, 0]} labelOffset={[0, 0.6, 0.1]}>
      {/* Walnut frame and linen board */}
      <Block args={[2.3, 0.86, 0.04]} color={palette.timber} roughness={0.55} map={woodAcross()} />
      <Block args={[2.2, 0.76, 0.012]} color="#d9d1c3" roughness={0.98} map={fabricMap()} position={[0, 0, 0.022]} castShadow={false} />
      <Text font={FONT} position={[-0.98, 0.29, 0.032]} fontSize={0.05} color={palette.ink} anchorX="left" anchorY="middle" letterSpacing={0.18}>
        NOW SHIPPING
      </Text>
      <Block args={[0.14, 0.008, 0.004]} color={palette.accent} position={[-0.91, 0.25, 0.031]} castShadow={false} />
      {PINNED.map((card, index) => {
        const x = -0.86 + index * 0.43;
        const tilt = [0.04, -0.03, 0.025, -0.04, 0.02][index];
        return (
          <group key={card.title} position={[x, -0.06, 0.032]} rotation={[0, 0, tilt]}>
            <Block args={[0.36, 0.42, 0.004]} color="#fbfaf7" roughness={0.9} castShadow />
            <Block args={[0.36, 0.05, 0.002]} color={card.color} position={[0, 0.185, 0.003]} castShadow={false} />
            <Text font={FONT} position={[-0.15, 0.08, 0.004]} fontSize={0.042} color={palette.ink} anchorX="left" anchorY="middle" letterSpacing={0.04}>
              {card.title}
            </Text>
            <Text font={FONT_MEDIUM} position={[-0.15, 0.02, 0.004]} fontSize={0.026} color="#6b6058" anchorX="left" anchorY="middle">
              {card.note}
            </Text>
            {[0, 1, 2].map((line) => (
              <Block key={line} args={[0.27 - line * 0.06, 0.008, 0.001]} color="#d8d2c8" position={[-0.015 - line * 0.03, -0.05 - line * 0.045, 0.003]} castShadow={false} receiveShadow={false} />
            ))}
            <mesh position={[0, 0.2, 0.012]}>
              <sphereGeometry args={[0.014, 10, 8]} />
              <meshStandardMaterial color={index % 2 ? palette.accent : palette.ink} roughness={0.35} />
            </mesh>
          </group>
        );
      })}
    </Interactive>
  );
}

function OfficeChair({ position = [-S + 1.3, 0, -0.3], yaw = 0 }) {
  const fabric = '#2f3033';
  return (
    <group position={position} rotation={[0, yaw, 0]}>
      {/* Seat */}
      <RoundedBox args={[0.56, 0.09, 0.54]} radius={0.04} smoothness={3} position={[0, 0.435, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={fabric} roughness={0.9} map={fabricMap()} />
      </RoundedBox>
      {/* Mesh back on a curved frame */}
      <group position={[0.27, 0.835, 0]} rotation={[0, 0, -0.1]}>
        <RoundedBox args={[0.06, 0.62, 0.5]} radius={0.03} smoothness={3} castShadow>
          <meshStandardMaterial color="#1f2022" roughness={0.6} />
        </RoundedBox>
        <Block args={[0.012, 0.54, 0.42]} color="#3c3d41" roughness={0.95} map={fabricMap()} position={[-0.03, 0, 0]} castShadow={false} />
      </group>
      <Block args={[0.05, 0.26, 0.08]} color="#1f2022" position={[0.27, 0.545, 0]} />
      {/* Armrests */}
      {[-1, 1].map((side) => (
        <group key={side} position={[0.02, 0, side * 0.29]}>
          <Block args={[0.04, 0.2, 0.04]} color="#1f2022" position={[0.05, 0.575, 0]} />
          <RoundedBox args={[0.3, 0.035, 0.07]} radius={0.015} smoothness={2} position={[0.0, 0.685, 0]} castShadow>
            <meshStandardMaterial color="#1f2022" roughness={0.6} />
          </RoundedBox>
        </group>
      ))}
      {/* Gas lift and five-star base with casters */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.3, 14]} />
        <meshStandardMaterial color="#c9cbd0" roughness={0.2} metalness={0.9} />
      </mesh>
      {[0, 1, 2, 3, 4].map((leg) => {
        const angle = (leg / 5) * Math.PI * 2;
        return (
          <group key={leg} rotation={[0, -angle, 0]}>
            <Block args={[0.32, 0.035, 0.05]} color="#1f2022" roughness={0.5} position={[0.16, 0.08, 0]} />
            <mesh position={[0.31, 0.035, 0]} castShadow>
              <sphereGeometry args={[0.035, 12, 10]} />
              <meshStandardMaterial color="#141416" roughness={0.4} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}


const MONITOR_Y = 0.52; // monitor centre above the desktop props group (screen centre ≈ 1.29 m)

function Workstation({ project, projectIndex, controlsVisible, onPrevious, onNext, progressRef }) {
  const { goTo, nightRef } = useRoom();
  const glass = useRef();
  const dayGlass = useMemo(() => new THREE.Color('#f6e2c2'), []);
  const nightGlass = useMemo(() => new THREE.Color('#33457e'), []);
  useFrame(() => {
    if (!glass.current) return;
    const night = nightRef.current.value;
    glass.current.emissive.copy(dayGlass).lerp(nightGlass, night);
    glass.current.color.set(night > 0.5 ? '#26335e' : '#f8ead4');
    glass.current.emissiveIntensity = THREE.MathUtils.lerp(0.7, 0.6, night);
  });
  const deskX = -S + 0.42; // centre of the desk depth
  return (
    <group>
      {/* Window toward the front of the wall */}
      <group position={[-S + 0.03, 2.05, 1.95]} rotation={[0, Math.PI / 2, 0]}>
        <Block args={[1.3, 1.25, 0.08]} color={palette.timber} roughness={0.55} map={woodAlong()} />
        <mesh position={[0, 0, 0.045]}>
          <planeGeometry args={[1.12, 1.07]} />
          <meshStandardMaterial ref={glass} color="#f8ead4" emissive="#f6e2c2" emissiveIntensity={0.7} roughness={0.4} />
        </mesh>
        <Block args={[0.035, 1.07, 0.04]} color={palette.timberDark} position={[0, 0, 0.06]} castShadow={false} />
        <Block args={[1.12, 0.035, 0.04]} color={palette.timberDark} position={[0, 0, 0.06]} castShadow={false} />
        <Block args={[1.45, 0.06, 0.22]} color={palette.timberDark} roughness={0.5} map={woodAcross()} position={[0, -0.66, 0.1]} />
        <Plant position={[0.42, -0.63, 0.12]} scale={0.48} pot="#e9e3da" />
      </group>

      <ProjectBoard />

      {/* Desk: walnut top (76 cm, a real desk height) on a black steel frame, with a drawer pedestal */}
      <group position={[deskX, 0, -0.3]}>
        <Block args={[0.86, 0.04, 2.5]} color={palette.timber} roughness={0.5} map={woodAlong()} position={[0, DESK_TOP - 0.02, 0]} />
        <group position={[0, 0, 0.82]}>
          <Block args={[0.74, 0.68, 0.62]} color="#e9e4dc" roughness={0.6} position={[0, 0.36, 0]} />
          {[0.56, 0.35, 0.14].map((y) => (
            <group key={y} position={[0.372, y, 0]}>
              <Block args={[0.01, 0.19, 0.58]} color="#f1ede6" roughness={0.6} castShadow={false} />
              <Block args={[0.02, 0.014, 0.2]} color={palette.metal} metalness={0.6} roughness={0.35} position={[0.012, 0.06, 0]} castShadow={false} />
            </group>
          ))}
        </group>
        {/* Steel frame: two legs and a crossbar */}
        {[-1.18].map((z) => (
          <group key={z} position={[0, 0, z]}>
            <Block args={[0.04, DESK_TOP - 0.04, 0.05]} color={palette.metal} metalness={0.5} roughness={0.4} position={[-0.36, (DESK_TOP - 0.04) / 2, 0]} />
            <Block args={[0.04, DESK_TOP - 0.04, 0.05]} color={palette.metal} metalness={0.5} roughness={0.4} position={[0.36, (DESK_TOP - 0.04) / 2, 0]} />
            <Block args={[0.76, 0.04, 0.05]} color={palette.metal} metalness={0.5} roughness={0.4} position={[0, 0.03, 0]} />
          </group>
        ))}
        <Block args={[0.04, 0.05, 1.6]} color={palette.metal} metalness={0.5} roughness={0.4} position={[-0.3, DESK_TOP - 0.065, -0.38]} castShadow={false} />
        {/* Desk props: arm lamp, a rubber duck for debugging, pens */}
        <Suspense fallback={null}>
          <Model name="desk_lamp_arm_01" position={[-0.27, DESK_TOP, 1.02]} rotation={[0, Math.PI, 0]} scale={0.9} />
          <Model name="rubber_duck_toy" position={[-0.27, DESK_TOP, -0.62]} rotation={[0, 1.1, 0]} scale={0.32} />
          <Model name="stationery_supplies" position={[0.12, DESK_TOP, 0.98]} rotation={[0, Math.PI / 2, 0]} scale={0.8} />
        </Suspense>
        {/* Everything on the desktop sits on this group (top surface = DESK_TOP) */}
        <group position={[0, DESK_TOP - 0.99, 0]}>
        {/* Monitor: slim black bezel on an aluminium stand */}
        <group position={[-0.2, 0.99, -0.05]} rotation={[0, Math.PI / 2, 0]}>
          <Block args={[0.3, 0.012, 0.2]} color="#b9bbc0" metalness={0.8} roughness={0.25} position={[0, 0.006, 0]} />
          <Block args={[0.06, 0.26, 0.025]} color="#b9bbc0" metalness={0.8} roughness={0.25} position={[0, 0.14, -0.03]} />
          <Interactive label={controlsVisible ? `More about ${project.title}` : 'See my projects'} onSelect={() => (controlsVisible ? window.open(project.href, '_blank', 'noopener,noreferrer') : goTo('computer'))} position={[0, MONITOR_Y, 0.0]} labelOffset={[0, 0.6, 0.05]}>
            <RoundedBox args={[1.28, 0.82, 0.05]} radius={0.018} smoothness={3} castShadow>
              <meshStandardMaterial color="#17181a" roughness={0.35} metalness={0.3} />
            </RoundedBox>
            <MonitorScreen project={project} index={projectIndex} progressRef={progressRef} />
            <Block args={[0.16, 0.008, 0.006]} color="#2a2b2f" position={[0, -0.395, 0.026]} castShadow={false} />
          </Interactive>
          {/* Arrow controls anchored beside the monitor */}
          <Html position={[-1.32, MONITOR_Y, 0.05]} center zIndexRange={[20, 0]} wrapperClass="box-tour-html">
            <button type="button" className={`box-tour-arrow${controlsVisible ? ' is-visible' : ''}`} onClick={onPrevious} aria-label="Previous project" tabIndex={controlsVisible ? 0 : -1} aria-hidden={!controlsVisible}>
              <ArrowLeft size={22} weight="bold" />
            </button>
          </Html>
          <Html position={[1.4, MONITOR_Y, 0.05]} center zIndexRange={[20, 0]} wrapperClass="box-tour-html">
            <button type="button" className={`box-tour-arrow${controlsVisible ? ' is-visible' : ''}`} onClick={onNext} aria-label="Next project" tabIndex={controlsVisible ? 0 : -1} aria-hidden={!controlsVisible}>
              <ArrowRight size={22} weight="bold" />
            </button>
          </Html>
        </group>

        {/* Keyboard: aluminium case, charcoal keycaps, one accent key */}
        <group position={[0.3, 0.99, 0.0]} rotation={[0, Math.PI / 2, 0]}>
          <RoundedBox args={[0.64, 0.022, 0.25]} radius={0.008} smoothness={2} castShadow receiveShadow>
            <meshStandardMaterial color="#c4c6cb" roughness={0.3} metalness={0.7} />
          </RoundedBox>
          <Instances limit={40}>
            <boxGeometry args={[0.05, 0.014, 0.044]} />
            <meshStandardMaterial roughness={0.55} />
            {Array.from({ length: 40 }, (_, key) => {
              const row = Math.floor(key / 10);
              const column = key % 10;
              return <Instance key={key} position={[-0.27 + column * 0.06, 0.016, -0.084 + row * 0.056]} color={key === 0 ? palette.accent : '#2c2d31'} />;
            })}
          </Instances>
        </group>
        {/* Felt desk mat, mouse */}
        <Block args={[0.4, 0.004, 1.12]} color="#3a3b3e" roughness={0.98} map={fabricMap()} position={[0.28, 0.992, -0.2]} castShadow={false} />
        <DeskMouse />
        {/* Studio monitor speaker */}
        <group position={[-0.22, 0.99, 0.72]}>
          <RoundedBox args={[0.2, 0.3, 0.2]} radius={0.015} smoothness={2} position={[0, 0.15, 0]} castShadow>
            <meshStandardMaterial color="#1f2022" roughness={0.55} />
          </RoundedBox>
          {[[0.19, 0.06], [0.07, 0.03]].map(([y, r]) => (
            <group key={y} position={[0.101, y, 0]} rotation={[0, Math.PI / 2, 0]}>
              <mesh>
                <circleGeometry args={[r, 24]} />
                <meshStandardMaterial color="#121214" roughness={0.7} />
              </mesh>
              <mesh position={[0, 0, 0.001]}>
                <ringGeometry args={[r - 0.008, r, 24]} />
                <meshStandardMaterial color={palette.steel} metalness={0.8} roughness={0.3} />
              </mesh>
            </group>
          ))}
        </group>
        <DeskPc />
        <DeskMug />
        </group>
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
      {/* Round low table */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.72, 0.72, 0.06, 48]} />
        <meshStandardMaterial color="#cfa77c" roughness={0.55} map={woodAcross()} />
      </mesh>
      <mesh position={[0, 0.468, 0]} castShadow>
        <cylinderGeometry args={[0.725, 0.7, 0.02, 48]} />
        <meshStandardMaterial color={palette.timberDark} roughness={0.55} />
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
        <Block args={[0.72, 0.012, 0.47]} color="#6b3f28" roughness={0.75} position={[0, -0.012, 0]} />
        {[-0.17, 0.17].map((x, side) => (
          <group key={x} position={[x, 0, 0]} rotation={[0, 0, side ? -0.05 : 0.05]}>
            <Block args={[0.33, 0.02, 0.44]} color="#fffaf0" roughness={0.9} />
            {[0, 1, 2, 3, 4].map((line) => (
              <Block key={line} args={[0.24, 0.002, 0.008]} color="#c9b8a3" position={[0, 0.012, -0.14 + line * 0.07]} castShadow={false} receiveShadow={false} />
            ))}
          </group>
        ))}
        <Text font={FONT} position={[-0.17, 0.024, -0.03]} rotation={[-Math.PI / 2, 0, 0.05]} fontSize={0.045} color={palette.accent} anchorX="center" anchorY="middle" maxWidth={0.28} textAlign="center">
          BUILD NOTES
        </Text>
      </Interactive>
      {/* Sticky notes: how I build */}
      {[
        { position: [0.38, 0.536, -0.22], rotation: -0.25, color: '#a9c3de', text: '01\nPLAN' },
        { position: [0.47, 0.537, 0.12], rotation: 0.18, color: '#e9b8a8', text: '02\nAI AID' },
        { position: [0.22, 0.538, 0.44], rotation: -0.1, color: '#b9cfa6', text: '03\nREVIEW\n+ TEST' },
        { position: [-0.18, 0.539, 0.52], rotation: 0.32, color: '#f2d27a', text: '04\nSHIP' },
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
          <meshStandardMaterial color="#2e2f33" roughness={0.45} />
        </mesh>
        {[['#d9a65b', 0.02, 0.15], ['#23201d', -0.03, -0.12], ['#c4572e', 0.01, 0.02]].map(([color, x, tilt]) => (
          <mesh key={color} position={[x, 0.24, 0]} rotation={[0, 0, tilt]} castShadow>
            <cylinderGeometry args={[0.012, 0.012, 0.26, 6]} />
            <meshStandardMaterial color={color} roughness={0.6} />
          </mesh>
        ))}
      </group>
      {/* Mug */}
      <Mug position={[0.05, 0.59, -0.42]} color="#c4704e" rotation={-0.8} />
      {/* Floor cushions */}
      {[[0.95, 0.65, '#c9a27e'], [-0.8, 0.85, palette.sage]].map(([x, z, color]) => (
        <group key={x} position={[x, 0, z]}>
          <mesh position={[0, 0.17, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.26, 0.27, 0.32, 32]} />
            <meshStandardMaterial color={color} roughness={0.95} map={fabricMap()} />
          </mesh>
          <mesh position={[0, 0.331, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.22, 0.26, 32]} />
            <meshStandardMaterial color="#00000022" transparent opacity={0.12} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* The box: shell, opening panels and room contents                     */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/* Closed-box dressing: a timber-framed miniature crate wrapped as a gift */
/* ------------------------------------------------------------------ */


// Timber frame around one face of a panel. `w`/`h` are the face size; the frame sits on the panel's outer face.
function PanelFrame({ w, h, depth = 0.05, bar = 0.17, color = palette.timber }) {
  return (
    <group>
      <Block args={[w, bar, depth]} color={color} position={[0, h - bar / 2, 0]} castShadow={false} />
      <Block args={[w, bar, depth]} color={color} position={[0, bar / 2, 0]} castShadow={false} />
      <Block args={[bar, h - 2 * bar, depth]} color={color} position={[-w / 2 + bar / 2, h / 2, 0]} castShadow={false} />
      <Block args={[bar, h - 2 * bar, depth]} color={color} position={[w / 2 - bar / 2, h / 2, 0]} castShadow={false} />
    </group>
  );
}

// Front panel: name plaque, latch and the corner post that completes the box outline.
function FrontPanelDressing({ width, height }) {
  const face = T / 2 + 0.025;
  return (
    <group>
      <group position={[0, 0, face]}>
        <PanelFrame w={width} h={height} />
        {/* Subtle plank seams so the panel reads as a timber crate wall */}
        {[0.25, 0.5, 0.75].map((f) => (
          <Block key={f} args={[width - 0.34, 0.025, 0.01]} color={palette.plasterShade} position={[0, height * f, -0.02]} castShadow={false} receiveShadow={false} />
        ))}
        {/* Name sign, left of the door */}
        <group position={[-1.25, height * 0.6, 0]}>
          <RoundedBox args={[2.3, 0.98, 0.08]} radius={0.06} position={[0, 0, 0.03]} castShadow>
            <meshStandardMaterial color={palette.timberDark} roughness={0.7} transparent />
          </RoundedBox>
          <RoundedBox args={[2.14, 0.82, 0.06]} radius={0.05} position={[0, 0, 0.07]}>
            <meshStandardMaterial color="#fffaf2" roughness={0.85} transparent />
          </RoundedBox>
          <Text font={FONT} position={[0, 0.12, 0.105]} fontSize={0.25} color={palette.ink} anchorX="center" anchorY="middle" letterSpacing={0.04}>
            JAZZ SAJONIA
          </Text>
          <Text font={FONT_MEDIUM} position={[0, -0.22, 0.105]} fontSize={0.1} color={palette.accent} anchorX="center" anchorY="middle" letterSpacing={0.26}>
            PORTFOLIO · OPEN ME
          </Text>
        </group>
        {/* Front door: frame, four raised panels, brass knob, step */}
        <group position={[1.35, 0, 0]}>
          <Block args={[1.22, 2.36, 0.08]} color={palette.linen} roughness={0.6} position={[0, 1.18, 0.02]} />
          <Block args={[1.02, 2.2, 0.06]} color="#5f7a6a" roughness={0.55} position={[0, 1.12, 0.07]} />
          {[[-0.23, 1.62], [0.23, 1.62], [-0.23, 0.62], [0.23, 0.62]].map(([x, y]) => (
            <RoundedBox key={`${x}${y}`} args={[0.36, y > 1 ? 0.78 : 0.82, 0.03]} radius={0.012} position={[x, y, 0.11]}>
              <meshStandardMaterial color="#6c8877" roughness={0.5} transparent />
            </RoundedBox>
          ))}
          <mesh position={[0.4, 1.1, 0.14]}>
            <sphereGeometry args={[0.045, 16, 12]} />
            <meshStandardMaterial color="#d6a65a" roughness={0.3} metalness={0.7} transparent />
          </mesh>
          <Block args={[0.18, 0.05, 0.02]} color="#d6a65a" metalness={0.6} roughness={0.35} position={[0, 1.6, 0.13]} castShadow={false} />
          <Block args={[1.5, 0.08, 0.32]} color="#cfc5b6" roughness={0.8} position={[0, 0.04, 0.16]} />
          {/* Porch lamp */}
          <group position={[0.88, 1.95, 0.08]}>
            <Block args={[0.08, 0.2, 0.06]} color={palette.metal} metalness={0.5} roughness={0.4} castShadow={false} />
            <mesh position={[0, -0.02, 0.12]}>
              <cylinderGeometry args={[0.07, 0.09, 0.22, 6]} />
              <meshStandardMaterial color="#ffe0a8" emissive="#ffc27a" emissiveIntensity={0.9} roughness={0.3} transparent />
            </mesh>
            <mesh position={[0, 0.12, 0.12]}>
              <coneGeometry args={[0.12, 0.08, 6]} />
              <meshStandardMaterial color={palette.metal} roughness={0.4} metalness={0.5} transparent />
            </mesh>
          </group>
        </group>
      </group>
      {/* Front-right corner post (the other three are permanent walls of the room) */}
      <Block args={[0.24, height - 0.2, 0.24]} color={palette.timberDark} position={[width / 2 - 0.12, (height - 0.2) / 2, 0]} />
    </group>
  );
}

// Side panel: frame and a round porthole glowing with the light of the room inside.
function SidePanelDressing({ depth, height }) {
  const { lightRef, nightRef } = useRoom();
  const glow = useRef();
  useFrame(() => {
    if (glow.current) glow.current.emissiveIntensity = 0.25 + lightRef.current.value * (0.55 + nightRef.current.value * 0.5);
  });
  return (
    <group position={[T / 2 + 0.025, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
      <PanelFrame w={depth} h={height} />
      {[0.25, 0.5, 0.75].map((f) => (
        <Block key={f} args={[depth - 0.34, 0.025, 0.01]} color={palette.plaster} position={[0, height * f, -0.02]} castShadow={false} receiveShadow={false} />
      ))}
      <group position={[0, height * 0.58, 0.02]}>
        <mesh>
          <torusGeometry args={[0.62, 0.09, 12, 40]} />
          <meshStandardMaterial color={palette.timberDark} roughness={0.7} transparent />
        </mesh>
        <mesh position={[0, 0, -0.01]}>
          <circleGeometry args={[0.6, 40]} />
          <meshStandardMaterial ref={glow} color="#ffe3b3" emissive="#ffc27a" emissiveIntensity={0.8} roughness={0.4} transparent />
        </mesh>
        <Block args={[1.2, 0.05, 0.03]} color={palette.timberDark} castShadow={false} />
        <Block args={[0.05, 1.2, 0.03]} color={palette.timberDark} castShadow={false} />
      </group>
    </group>
  );
}

// Lid → gable roof, so the closed box reads as a little house. `size` is the lid's square size; `top` is its top
// face height. The ridge runs along x; slopes fall to the front and back edges. Every material can fade, because
// the whole lid fades out with the panels once the room is open.
const ROOF_RISE = 1.55;
const ROOF_OVERHANG = 0.3;
function LidDressing({ size, top, center }) {
  const half = size / 2 + ROOF_OVERHANG;
  const slope = Math.hypot(half, ROOF_RISE);
  const angle = Math.atan2(ROOF_RISE, half);
  const length = size + 0.5;
  const gable = useMemo(() => {
    const shape = new THREE.Shape();
    const h = size / 2;
    shape.moveTo(-h, 0);
    shape.lineTo(h, 0);
    shape.lineTo(0, ROOF_RISE * (h / half));
    shape.closePath();
    return new THREE.ExtrudeGeometry(shape, { depth: 0.1, bevelEnabled: false });
  }, [size, half]);
  const chimneyZ = -0.95;
  const chimneyBase = ROOF_RISE * (1 - Math.abs(chimneyZ) / half);
  return (
    <group position={[0, top, center]}>
      {/* Eaves board along the lid edge */}
      <Block args={[size + 0.16, 0.12, size + 0.12]} color={palette.timberDark} position={[0, -0.06, 0]} castShadow={false} />
      {/* Gable walls (plaster, with a round attic vent on each end) */}
      {[-1, 1].map((side) => (
        <group key={side} position={[side * (size / 2 - 0.06), 0, 0]} rotation={[0, side * Math.PI / 2, 0]}>
          <mesh geometry={gable} position={[0, 0, -0.05]} castShadow receiveShadow>
            <meshStandardMaterial color={palette.plasterShade} roughness={0.92} map={plasterMap()} transparent />
          </mesh>
          <group position={[0, ROOF_RISE * 0.38, 0.06]}>
            <mesh>
              <torusGeometry args={[0.24, 0.05, 10, 32]} />
              <meshStandardMaterial color={palette.timberDark} roughness={0.6} transparent />
            </mesh>
            <mesh position={[0, 0, -0.01]}>
              <circleGeometry args={[0.23, 32]} />
              <meshStandardMaterial color="#ffe3b3" emissive="#ffc27a" emissiveIntensity={0.45} roughness={0.4} transparent />
            </mesh>
            <Block args={[0.46, 0.035, 0.02]} color={palette.timberDark} castShadow={false} />
            <Block args={[0.035, 0.46, 0.02]} color={palette.timberDark} castShadow={false} />
          </group>
        </group>
      ))}
      {/* Two shingled slopes */}
      {[-1, 1].map((side) => (
        <group key={side} position={[0, ROOF_RISE / 2, side * half / 2]} rotation={[side * angle, 0, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[length, 0.09, slope]} />
            <meshStandardMaterial color="#b4573a" roughness={0.78} map={shingleMap()} transparent />
          </mesh>
          {/* Fascia board on the low edge */}
          <Block args={[length + 0.02, 0.16, 0.06]} color={palette.linen} roughness={0.6} position={[0, -0.04, side * (slope / 2)]} castShadow={false} />
          {/* Barge boards on the gable edges */}
          {[-1, 1].map((end) => (
            <Block key={end} args={[0.07, 0.15, slope]} color={palette.linen} roughness={0.6} position={[end * (length / 2), -0.02, 0]} castShadow={false} />
          ))}
        </group>
      ))}
      {/* Ridge cap */}
      <mesh position={[0, ROOF_RISE + 0.04, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.09, 0.09, length + 0.04, 16]} />
        <meshStandardMaterial color="#8f4129" roughness={0.7} transparent />
      </mesh>
      {/* Brick chimney on the back slope */}
      <group position={[-size * 0.26, 0, chimneyZ]}>
        <mesh position={[0, chimneyBase + 0.2, 0]} castShadow>
          <boxGeometry args={[0.46, 1.1, 0.46]} />
          <meshStandardMaterial color="#a65a43" roughness={0.9} map={brickMap()} transparent />
        </mesh>
        <Block args={[0.56, 0.08, 0.56]} color="#6f6a65" roughness={0.7} position={[0, chimneyBase + 0.79, 0]} />
        <mesh position={[0, chimneyBase + 0.86, 0]}>
          <cylinderGeometry args={[0.09, 0.09, 0.12, 14, 1, true]} />
          <meshStandardMaterial color="#4a4744" roughness={0.6} metalness={0.3} side={THREE.DoubleSide} transparent />
        </mesh>
      </group>
    </group>
  );
}

// Outside of the permanent left wall: a real window with shutters and a flower box, so the closed box reads
// as a little house and the sunlight hitting this wall has a reason to be there.
function OutsideWindow() {
  return (
    <group position={[-S - T - 0.005, 2.05, 1.95]} rotation={[0, -Math.PI / 2, 0]}>
      <Block args={[1.36, 1.3, 0.06]} color={palette.timber} />
      <mesh position={[0, 0, 0.035]}>
        <planeGeometry args={[1.12, 1.07]} />
        <meshStandardMaterial color="#ffe3b3" emissive="#ffc27a" emissiveIntensity={0.55} roughness={0.35} />
      </mesh>
      <Block args={[0.05, 1.07, 0.03]} color={palette.timber} position={[0, 0, 0.05]} castShadow={false} />
      <Block args={[1.12, 0.05, 0.03]} color={palette.timber} position={[0, 0, 0.05]} castShadow={false} />
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 0.95, 0, 0.03]}>
          <Block args={[0.48, 1.3, 0.05]} color="#7d8c6a" castShadow={false} />
          {[-0.4, -0.2, 0, 0.2, 0.4].map((y) => (
            <Block key={y} args={[0.38, 0.03, 0.02]} color="#68765a" position={[0, y, 0.03]} castShadow={false} />
          ))}
        </group>
      ))}
      <Block args={[1.5, 0.26, 0.3]} color={palette.timberDark} position={[0, -0.78, 0.15]} />
      <Plant position={[-0.4, -0.66, 0.15]} scale={0.42} pot={palette.timberDark} />
      <Plant position={[0.05, -0.66, 0.15]} scale={0.5} pot={palette.timberDark} />
      <Plant position={[0.45, -0.66, 0.15]} scale={0.4} pot={palette.timberDark} />
    </group>
  );
}

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
    gradient.addColorStop(0, 'rgba(60, 44, 32, 0.45)');
    gradient.addColorStop(0.55, 'rgba(60, 44, 32, 0.2)');
    gradient.addColorStop(1, 'rgba(60, 44, 32, 0)');
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

// Rapier (WASM) loads only once the box has finished turning, and unloads if the visitor scrolls back to the
// closed box (the room moves then, and physics bodies would not follow). Until it is ready the plush is static.
const PhysicsToys = lazy(() => import('./room/Physics'));
function PhysicsGate({ progressRef }) {
  const [ready, setReady] = useState(false);
  useFrame(() => {
    const p = progressRef.current.smooth;
    if (!ready && p > 0.2) setReady(true);
    else if (ready && p < 0.19) setReady(false);
  });
  if (!ready) return <ClaudePlush />;
  return (
    <Suspense fallback={<ClaudePlush />}>
      <PhysicsToys />
    </Suspense>
  );
}

function BoxRoom({ progressRef, reducedMotion, project, projectIndex, controlsVisible, onPrevious, onNext }) {
  const { theme } = useRoom();
  const { size } = useThree();
  // Stable elements: changing the visible card re-renders only the workstation, not the whole room.
  const staticRoom = useMemo(() => (
    <>
      <Suspense fallback={null}><PbrSurfaces /></Suspense>
      <DisplayWall />
      <Bed />
      <Posters />
      <PhysicsGate progressRef={progressRef} />
      <Nightstand />
      <ReadingCorner />
      <Suspense fallback={null}><Rug /></Suspense>
      <NotesTable />
      <WallLamp />
      <WindowLight />
      <WindowCurtains />
      <FloorLamp />
      <Suspense fallback={null}>
        <Human Chair={OfficeChair} />
        <Cat />
      </Suspense>
      <Robot />
    </>
  ), [progressRef]);
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
  const lastOpacity = useRef(-1);

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
    // The closed box starts larger on tall phone screens, where the full-room framing is much wider than the box.
    const startScale = size.width / size.height < 0.95 ? 0.52 : 0.36;
    const scale = THREE.MathUtils.lerp(startScale, 1, grow) * Math.max(pop, 0.0001);
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
    // Fade the panels together with everything mounted on them (frame, plaque, ribbon, bow).
    if (opacity !== lastOpacity.current) {
      lastOpacity.current = opacity;
      [front, side, lid].forEach((group) => group.current?.traverse((child) => {
        if (!child.material) return;
        child.material.transparent = true;
        child.material.opacity = opacity;
        child.material.depthWrite = opacity > 0.98;
      }));
    }
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
          <Block key={index} args={[0.585, 0.03, 2 * S]} color={index % 2 ? palette.floorA : palette.floorB} map={woodAlong()} position={[-S + 0.3 + index * 0.6, 0.012, 0]} roughness={0.7} castShadow={false} />
        ))}

        {/* Permanent walls: back (display wall) and left (computer wall) */}
        <Block args={[2 * S + T, H, T]} color={palette.plaster} map={plasterMap()} position={[T / 2 * -1, H / 2, -S - T / 2]} roughness={0.95} />
        <Block args={[T, H, 2 * S]} color={palette.plasterShade} map={plasterMap()} position={[-S - T / 2, H / 2, 0]} roughness={0.95} />
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
          <FrontPanelDressing width={outerSize} height={H + 0.2} />
        </group>
        <group ref={side} position={[S + T / 2, 0, -T / 2]}>
          <FadingPanel materialRef={sideMaterial} color={palette.plasterShade} args={[T, H + 0.2, 2 * S + T]} />
          <SidePanelDressing depth={2 * S + T} height={H + 0.2} />
        </group>
        <group ref={lid} position={[0, H + 0.2, -S - T]}>
          <mesh castShadow position={[0, 0.07, outerSize / 2]}>
            <boxGeometry args={[outerSize + 0.08, 0.14, outerSize + 0.04]} />
            <meshStandardMaterial ref={lidMaterial} color={palette.lid} roughness={0.75} transparent />
          </mesh>
          <LidDressing size={outerSize} top={0.14} center={outerSize / 2} />
        </group>

        <OutsideWindow />
        {staticRoom}
        <Workstation project={project} projectIndex={projectIndex} controlsVisible={controlsVisible} onPrevious={onPrevious} onNext={onNext} progressRef={progressRef} />
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
  hemiSky: new THREE.Color('#fff4e2'), hemiGround: new THREE.Color('#b89478'), hemi: 1.15,
  key: new THREE.Color('#fff0d8'), keyIntensity: 1.9, ambient: 0.25,
  fill: new THREE.Color('#ffd6a3'), background: new THREE.Color('#e9dccb'),
};
const NIGHT = {
  hemiSky: new THREE.Color('#5a6aa8'), hemiGround: new THREE.Color('#2a2440'), hemi: 0.5,
  key: new THREE.Color('#9fb4ff'), keyIntensity: 0.42, ambient: 0.12,
  fill: new THREE.Color('#ffc983'), background: new THREE.Color('#121828'),
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
    scene.environmentIntensity = THREE.MathUtils.lerp(0.35, 0.06, night) * THREE.MathUtils.lerp(0.6, 1, light);
  });
  return (
    <>
      <hemisphereLight ref={hemi} args={['#fff4e2', '#b89478', 1.15]} />
      <ambientLight ref={ambient} intensity={0.25} />
      <directionalLight
        ref={key}
        castShadow
        position={[6, 10, 7]}
        intensity={1.9}
        color="#fff0d8"
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
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
            vec3 day = mix(vec3(0.89, 0.78, 0.67), vec3(0.97, 0.95, 0.92), t);
            vec3 night = mix(vec3(0.078, 0.102, 0.169), vec3(0.039, 0.055, 0.094), t);
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
    <Interactive label={lightOn ? 'Turn the room light off' : 'Turn the room light on'} onSelect={toggleLight} position={[-0.3, 2.2, -S + 0.02]} labelOffset={[0, 0.55, 0.2]}>
      {/* Round wooden wall plate */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.12, 0.02]} castShadow>
        <cylinderGeometry args={[0.07, 0.07, 0.03, 24]} />
        <meshStandardMaterial color="#1f2022" roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Brass arm */}
      <mesh position={[0, 0.12, 0.13]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.014, 0.014, 0.2, 8]} />
        <meshStandardMaterial color={palette.brass} roughness={0.3} metalness={0.8} />
      </mesh>
      <mesh position={[0, 0.06, 0.23]}>
        <cylinderGeometry args={[0.012, 0.012, 0.12, 8]} />
        <meshStandardMaterial color="#d6a65a" roughness={0.35} metalness={0.4} />
      </mesh>
      {/* Bell shade, open at the bottom */}
      <mesh position={[0, -0.03, 0.23]} castShadow>
        <cylinderGeometry args={[0.06, 0.16, 0.17, 32, 1, true]} />
        <meshStandardMaterial color="#1f2022" roughness={0.38} metalness={0.55} side={THREE.DoubleSide} />
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
      ring.current.emissiveIntensity = on ? 1.2 : 0;
    });
    strips.forEach((strip, index) => {
      if (!strip.current) return;
      strip.current.emissive.copy(sample(rgbMode, time, 2.6 + index));
      strip.current.emissiveIntensity = on ? 1.1 : 0;
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
        <meshStandardMaterial color="#2b2c30" roughness={0.45} metalness={0.3} />
      </RoundedBox>
      {[[-0.2, -0.12], [-0.2, 0.12], [0.2, -0.12], [0.2, 0.12]].map(([x, z]) => (
        <Block key={`${x}${z}`} args={[0.06, 0.03, 0.05]} color={palette.timberDark} position={[x, 0.015, z]} castShadow={false} />
      ))}
      {/* Recessed dark front with mesh look */}
      <Block args={[0.012, HT - 0.07, W - 0.06]} color="#151618" position={[D / 2 + 0.002, HT / 2 + 0.03, 0]} castShadow={false} roughness={0.75} />
      {/* Two front fans */}
      <group position={[D / 2 + 0.012, 0, 0]} scale={1.08}>
        <Fan position={[0, (HT * 0.72 + 0.03) / 1.08, 0]} ringRef={rings[0]} />
        <Fan position={[0, (HT * 0.32 + 0.03) / 1.08, 0]} ringRef={rings[1]} speed={11} />
      </group>
      {/* RGB edge strips on the front */}
      {[-1, 1].map((side, index) => (
        <mesh key={side} position={[D / 2 + 0.008, HT / 2 + 0.03, side * (W / 2 - 0.018)]}>
          <boxGeometry args={[0.01, HT - 0.1, 0.012]} />
          <meshStandardMaterial ref={strips[index]} color="#2a2228" emissive="#e07a4b" emissiveIntensity={1.5} toneMapped={false} />
        </mesh>
      ))}
      {/* Power button */}
      <mesh position={[D / 2 - 0.06, HT + 0.031, 0.1]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.018, 14]} />
        <meshBasicMaterial color={rgbMode === 'off' ? '#9a8a7a' : '#7ad3c0'} toneMapped={false} />
      </mesh>
      {/* Top vents */}
      {[-0.15, -0.07, 0.01, 0.09].map((x) => (
        <Block key={x} args={[0.045, 0.004, 0.22]} color="#1a1b1d" position={[x, HT + 0.032, -0.02]} castShadow={false} receiveShadow={false} />
      ))}
      <pointLight ref={glow} position={[D / 2 + 0.35, HT / 2, 0]} intensity={1.3} distance={1.6} decay={2} color="#e07a4b" />
    </Interactive>
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

/* ------------------------------------------------------------------ */
/* Actors: the person at the desk and the helper robot                   */
/* ------------------------------------------------------------------ */


const UP = new THREE.Vector3(0, 1, 0);
const tmpA = new THREE.Vector3();
const tmpB = new THREE.Vector3();
const tmpC = new THREE.Vector3();

// Desk-local props the person touches (the desk group sits at [-S + 0.42, 0, -0.3]).

function DeskMouse() {
  const ref = useRef();
  const led = useRef();
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const offset = actors.human.mouse;
    ref.current.position.set(MOUSE_HOME[0] + offset.x, MOUSE_HOME[1], MOUSE_HOME[2] + offset.y);
    if (led.current) led.current.emissiveIntensity = 1.2 + Math.sin(clock.elapsedTime * 2) * 0.4;
  });
  return (
    <group ref={ref} position={MOUSE_HOME}>
      {/* Low ergonomic shell, long axis pointing at the monitor */}
      <mesh position={[0, 0.004, 0]} scale={[0.062, 0.03, 0.036]} castShadow>
        <sphereGeometry args={[1, 28, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#232427" roughness={0.42} metalness={0.15} />
      </mesh>
      <mesh position={[0, 0.003, 0]} scale={[0.063, 0.004, 0.037]}>
        <cylinderGeometry args={[1, 1, 1, 28]} />
        <meshStandardMaterial color="#141416" roughness={0.7} />
      </mesh>
      {/* Button split and scroll wheel */}
      <Block args={[0.05, 0.002, 0.0025]} color="#0f0f11" position={[-0.03, 0.03, 0]} castShadow={false} />
      <mesh position={[-0.034, 0.03, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 0.006, 14]} />
        <meshStandardMaterial color="#8e9096" roughness={0.35} metalness={0.6} />
      </mesh>
      <mesh position={[0.04, 0.022, 0]}>
        <sphereGeometry args={[0.003, 8, 6]} />
        <meshStandardMaterial ref={led} color="#5fd6bf" emissive="#5fd6bf" emissiveIntensity={1.2} toneMapped={false} />
      </mesh>
    </group>
  );
}

function DeskMug() {
  const ref = useRef();
  const steam = useRef();
  useFrame(({ clock }) => {
    if (ref.current) ref.current.visible = !actors.human.mugInHand;
    if (steam.current) {
      steam.current.children.forEach((wisp, index) => {
        const t = (clock.elapsedTime * 0.35 + index / 3) % 1;
        wisp.position.set(Math.sin(t * 6 + index) * 0.012, 0.08 + t * 0.16, 0);
        wisp.material.opacity = Math.sin(t * Math.PI) * 0.22;
        wisp.scale.setScalar(0.6 + t * 0.9);
      });
    }
  });
  return (
    <group ref={ref} position={MUG_HOME}>
      <Mug position={[0, 0.055, 0]} color="#e8e2d8" rotation={-1.1} />
      <group ref={steam}>
        {[0, 1, 2].map((index) => (
          <mesh key={index}>
            <sphereGeometry args={[0.018, 10, 8]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0} depthWrite={false} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/* ---------- Knowledge graph hologram ---------- */

const GRAPH_LABELS = ['JAZZ', 'Qline', 'AI agents', 'Automation', 'MCP', 'FlowPilot', 'Cortex', 'Chrauto', 'Web apps', 'Android', 'Make.com', 'Postgres', 'Kotlin', 'React'];

function useGraph(count, radius, seed) {
  return useMemo(() => {
    const random = seeded(seed);
    const nodes = [new THREE.Vector3(0, 0, 0)];
    for (let i = 1; i < count; i += 1) {
      // Fibonacci sphere, jittered, so nodes are spread evenly in a ball.
      const y = 1 - (i / (count - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const theta = i * 2.399963;
      const scale = radius * (0.55 + random() * 0.45);
      nodes.push(new THREE.Vector3(Math.cos(theta) * r * scale, y * scale * 0.8, Math.sin(theta) * r * scale));
    }
    const pairs = [];
    nodes.forEach((node, index) => {
      if (index === 0) return;
      if (index < 9) pairs.push([0, index]);
      const nearest = nodes.map((other, j) => [j, node.distanceTo(other)]).filter(([j]) => j !== index && j !== 0).sort((a, b) => a[1] - b[1]).slice(0, 2);
      nearest.forEach(([j]) => { if (index < j) pairs.push([index, j]); });
    });
    const positions = new Float32Array(pairs.length * 6);
    pairs.forEach(([a, b], k) => {
      nodes[a].toArray(positions, k * 6);
      nodes[b].toArray(positions, k * 6 + 3);
    });
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return { nodes, geometry };
  }, [count, radius, seed]);
}

function KnowledgeGraph({ radius = 0.55, count = 26, labels = true, seed = 7, groupRef, color = '#22b896' }) {
  const { nodes, geometry } = useGraph(count, radius, seed);
  const spin = useRef();
  const pulse = useRef();
  useFrame(({ clock }, delta) => {
    if (spin.current) spin.current.rotation.y += delta * 0.25;
    if (pulse.current) pulse.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 2.4) * 0.12);
  });
  return (
    <group ref={groupRef}>
      <group ref={spin}>
        <lineSegments geometry={geometry}>
          <lineBasicMaterial color={color} transparent opacity={0.7} depthWrite={false} toneMapped={false} />
        </lineSegments>
        <Instances limit={count - 1} castShadow={false} receiveShadow={false}>
          <sphereGeometry args={[1, 10, 8]} />
          <meshBasicMaterial color="#3fe0bb" transparent opacity={0.95} depthWrite={false} toneMapped={false} />
          {nodes.slice(1).map((node, index) => (
            <Instance key={index} position={node} scale={index < 8 ? radius * 0.05 : radius * 0.03} />
          ))}
        </Instances>
        <mesh ref={pulse}>
          <sphereGeometry args={[radius * 0.09, 18, 14]} />
          <meshBasicMaterial color="#ff9a55" transparent opacity={0.95} depthWrite={false} toneMapped={false} />
        </mesh>
        {labels && GRAPH_LABELS.map((label, index) => (
          <Billboard key={label} position={nodes[index].clone().multiplyScalar(index === 0 ? 1 : 1.08).add(new THREE.Vector3(0, index === 0 ? 0.09 : 0.05, 0))}>
            <Text font={FONT_MEDIUM} fontSize={index === 0 ? 0.075 : 0.052} color={index === 0 ? '#7a2e10' : '#0d3f35'} anchorX="center" anchorY="bottom" outlineWidth={0.006} outlineColor="#ffffff" fillOpacity={0.95}>
              {label}
            </Text>
          </Billboard>
        ))}
      </group>
      {/* Faint shell so the graph reads as a projection */}
      <mesh>
        <sphereGeometry args={[radius * 1.18, 32, 20]} />
        <meshBasicMaterial color={color} transparent opacity={0.07} depthWrite={false} side={THREE.BackSide} toneMapped={false} />
      </mesh>
    </group>
  );
}

/* ---------- Robot ---------- */

const ROBOT_DOCK = new THREE.Vector3(2.25, 0, 1.8);
const ROBOT_DOCK_HOVER = new THREE.Vector3(2.25, 0.72, 1.8);
const ROBOT_PATH = [
  new THREE.Vector3(1.5, 1.55, 1.7),
  new THREE.Vector3(2.1, 1.75, -0.6),
  new THREE.Vector3(0.9, 2.0, -1.7),
  new THREE.Vector3(-0.4, 1.7, -0.1),
  'help',
  new THREE.Vector3(-0.9, 1.5, 1.6),
  new THREE.Vector3(0.5, 1.35, 2.2),
  new THREE.Vector3(2.25, 1.1, 1.8),
  'help',
];
const ROBOT_HELP = new THREE.Vector3(-1.92, 1.68, 0.32);
const ROBOT_ACCENT = '#6fe3c8';

function DockPad() {
  const ring = useRef();
  const { phaseRef } = useRoom();
  useFrame(({ clock }) => {
    if (ring.current) ring.current.emissiveIntensity = (phaseRef.current === 'ai' ? 2.2 : 1.1) + Math.sin(clock.elapsedTime * 2) * 0.3;
  });
  return (
    <group position={ROBOT_DOCK.toArray()}>
      <mesh position={[0, 0.03, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.34, 0.37, 0.06, 40]} />
        <meshStandardMaterial color="#e7e5e0" roughness={0.35} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0.062, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.22, 0.25, 48]} />
        <meshStandardMaterial ref={ring} color={ROBOT_ACCENT} emissive={ROBOT_ACCENT} emissiveIntensity={1.2} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.063, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.2, 40]} />
        <meshStandardMaterial color="#2a2c30" roughness={0.4} metalness={0.4} />
      </mesh>
      <Text font={FONT_MEDIUM} position={[0, 0.034, 0.372]} fontSize={0.03} color="#6a645c" anchorX="center" anchorY="middle" letterSpacing={0.25}>
        AI LAB · DOCK
      </Text>
    </group>
  );
}

function Robot() {
  const { reducedMotion, phaseRef, goTo } = useRoom();
  const root = useRef();
  const body = useRef();
  const headRef = useRef();
  const eyes = useRef();
  const antenna = useRef();
  const thruster = useRef();
  const armL = useRef();
  const armR = useRef();
  const bigGraph = useRef();
  const smallGraph = useRef();
  const beam = useRef();
  const shadow = useRef();
  const shadowMap = useMemo(() => radialTexture([[0, 'rgba(40,34,30,0.45)'], [1, 'rgba(40,34,30,0)']]), []);
  const state = useRef({ index: 0, wait: 0, mode: 'roam', helpT: 0, spin: 0, yaw: 0, velocity: new THREE.Vector3(), blink: 0, graph: 0, mini: 0 });

  const onClick = useCallback(() => {
    state.current.spin = 1;
    getLofi()?.beep();
    goTo('ai');
  }, [goTo]);

  useFrame(({ clock }, rawDelta) => {
    const delta = Math.min(rawDelta, 0.1);
    const s = state.current;
    const time = clock.elapsedTime;
    if (!root.current) return;
    const position = root.current.position;
    const stop = phaseRef.current;

    // Pick the current target.
    let target;
    let hold = false;
    if (stop === 'ai' || reducedMotion) {
      s.mode = 'dock';
      target = ROBOT_DOCK_HOVER;
      hold = true;
    } else {
      if (s.mode === 'dock') { s.mode = 'roam'; s.index = 0; }
      const step = ROBOT_PATH[s.index % ROBOT_PATH.length];
      if (step === 'help') {
        if (!actors.human.atDesk) { s.index += 1; target = position; } else { s.mode = 'help'; target = ROBOT_HELP; }
      } else {
        s.mode = 'roam';
        target = step;
      }
    }

    tmpA.subVectors(target, position);
    const distance = tmpA.length();
    const arrived = distance < 0.06;
    if (!hold && arrived) {
      s.wait += delta;
      const pause = s.mode === 'help' ? 7 : 1.2;
      if (s.wait > pause) { s.wait = 0; s.index += 1; }
    }
    // Smooth seek with a speed limit.
    const maxSpeed = s.mode === 'dock' ? 1.1 : 0.55;
    tmpB.copy(tmpA).normalize().multiplyScalar(Math.min(maxSpeed, distance * 1.6));
    s.velocity.lerp(tmpB, 1 - Math.pow(0.02, delta));
    if (reducedMotion) position.copy(target);
    else position.addScaledVector(s.velocity, delta);
    const bob = reducedMotion ? 0 : Math.sin(time * 2.1) * 0.035;

    // Face the direction of travel, or the person while helping, or the viewer at the dock.
    let desiredYaw = s.yaw;
    if (s.velocity.lengthSq() > 0.01) desiredYaw = Math.atan2(s.velocity.x, s.velocity.z);
    if (arrived && s.mode === 'help') desiredYaw = Math.atan2(actors.human.head.x - position.x, actors.human.head.z - position.z);
    if (s.mode === 'dock' && distance < 0.3) desiredYaw = 0.3;
    s.yaw = angleLerp(s.yaw, desiredYaw, 1 - Math.pow(0.02, delta));
    s.spin = Math.max(0, s.spin - delta * 0.9);
    root.current.rotation.y = s.yaw + (s.spin > 0 ? smooth(1 - s.spin) * Math.PI * 2 : 0);
    if (body.current) {
      body.current.position.y = bob;
      // Lean into the motion.
      tmpC.copy(s.velocity).applyAxisAngle(UP, -s.yaw);
      body.current.rotation.x = THREE.MathUtils.clamp(tmpC.z * 0.35, -0.3, 0.3);
      body.current.rotation.z = THREE.MathUtils.clamp(-tmpC.x * 0.35, -0.3, 0.3);
    }
    if (headRef.current) headRef.current.rotation.y = Math.sin(time * 0.7) * 0.25 * (s.mode === 'roam' ? 1 : 0.3);
    // Blink.
    s.blink -= delta;
    if (s.blink < -3.2) s.blink = 0.14;
    if (eyes.current) eyes.current.scale.y = s.blink > 0 ? 0.15 : 1;
    if (antenna.current) antenna.current.emissiveIntensity = 1.5 + Math.sin(time * 4) * 0.8;
    if (thruster.current) {
      thruster.current.scale.set(1, 0.85 + Math.sin(time * 22) * 0.08 + s.velocity.length() * 0.4, 1);
      thruster.current.material.opacity = 0.55 + Math.sin(time * 18) * 0.08;
    }
    const helping = s.mode === 'help' && arrived;
    actors.robot.helping = helping;
    actors.robot.position.copy(position);
    if (armL.current) armL.current.rotation.x = helping ? -1.1 + Math.sin(time * 3) * 0.08 : Math.sin(time * 1.6) * 0.15;
    if (armR.current) armR.current.rotation.x = Math.sin(time * 1.6 + 1) * 0.15;

    // Holograms: a big knowledge graph at the dock, a small one when helping at the desk.
    const docked = s.mode === 'dock' && distance < 0.25;
    s.graph += ((docked ? 1 : 0) - s.graph) * (1 - Math.pow(0.03, delta));
    s.mini += ((helping ? 1 : 0) - s.mini) * (1 - Math.pow(0.02, delta));
    if (bigGraph.current) {
      bigGraph.current.visible = s.graph > 0.02;
      bigGraph.current.scale.setScalar(Math.max(0.001, easeOutBack(Math.min(1, s.graph))));
      bigGraph.current.position.set(position.x, position.y + 1.2 + bob, position.z);
    }
    if (beam.current) {
      beam.current.visible = s.graph > 0.02;
      beam.current.material.opacity = 0.13 * s.graph;
      beam.current.position.set(position.x, position.y + 0.7 + bob, position.z);
      beam.current.scale.set(s.graph, s.graph, s.graph);
    }
    if (smallGraph.current) {
      smallGraph.current.visible = s.mini > 0.02;
      tmpC.subVectors(actors.human.head, position).multiplyScalar(0.45).add(position);
      smallGraph.current.position.set(tmpC.x, position.y + 0.12, tmpC.z);
      smallGraph.current.scale.setScalar(Math.max(0.001, s.mini));
    }
    if (shadow.current) {
      shadow.current.position.set(position.x, 0.02, position.z);
      const height = position.y;
      shadow.current.scale.setScalar(0.5 + height * 0.15);
      shadow.current.material.opacity = THREE.MathUtils.clamp(1.2 - height * 0.35, 0.15, 0.8);
    }
    if (typeof window !== 'undefined' && window.__tourDebug) window.__tourDebug.robot = { mode: s.mode, x: +position.x.toFixed(2), y: +position.y.toFixed(2), z: +position.z.toFixed(2), graph: +s.graph.toFixed(2) };
  });

  const shell = <meshPhysicalMaterial color="#f1f1ee" roughness={0.28} metalness={0.05} clearcoat={0.8} clearcoatRoughness={0.25} />;
  return (
    <group>
      <DockPad />
      <mesh ref={shadow} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={shadowMap} transparent depthWrite={false} toneMapped={false} />
      </mesh>
      <group ref={root} position={ROBOT_PATH[0].toArray()}>
        <Interactive label="Ask the AI assistant" onSelect={onClick} labelOffset={[0, 0.75, 0]}>
          <group ref={body}>
            {/* Capsule body with a glowing waist ring */}
            <mesh castShadow>
              <capsuleGeometry args={[0.13, 0.12, 8, 24]} />
              {shell}
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
              <torusGeometry args={[0.133, 0.011, 10, 40]} />
              <meshStandardMaterial color={ROBOT_ACCENT} emissive={ROBOT_ACCENT} emissiveIntensity={1.6} toneMapped={false} />
            </mesh>
            {/* Chest panel */}
            <mesh position={[0, 0.03, 0.128]} rotation={[0, 0, 0]}>
              <circleGeometry args={[0.035, 24]} />
              <meshStandardMaterial color="#20262a" emissive={ROBOT_ACCENT} emissiveIntensity={0.35} roughness={0.3} />
            </mesh>
            {/* Arms */}
            {[[armL, 1], [armR, -1]].map(([ref, side]) => (
              <group key={side} ref={ref} position={[side * 0.15, 0.06, 0]}>
                <mesh position={[side * 0.02, -0.07, 0.01]} rotation={[0, 0, side * 0.18]} castShadow>
                  <capsuleGeometry args={[0.028, 0.1, 6, 12]} />
                  {shell}
                </mesh>
              </group>
            ))}
            {/* Head with visor face */}
            <group ref={headRef} position={[0, 0.3, 0]}>
              <RoundedBox args={[0.3, 0.21, 0.24]} radius={0.075} smoothness={4} castShadow>
                {shell}
              </RoundedBox>
              <RoundedBox args={[0.25, 0.135, 0.02]} radius={0.05} smoothness={3} position={[0, -0.002, 0.115]}>
                <meshPhysicalMaterial color="#101418" roughness={0.12} metalness={0.4} clearcoat={1} />
              </RoundedBox>
              <group ref={eyes} position={[0, 0.0, 0.127]}>
                {[-0.055, 0.055].map((x) => (
                  <mesh key={x} position={[x, 0, 0]}>
                    <capsuleGeometry args={[0.016, 0.022, 4, 10]} />
                    <meshBasicMaterial color="#9ff7e3" toneMapped={false} />
                  </mesh>
                ))}
              </group>
              {[-1, 1].map((side) => (
                <group key={side} position={[side * 0.152, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <mesh>
                    <cylinderGeometry args={[0.045, 0.045, 0.03, 24]} />
                    <meshStandardMaterial color="#d9dbdc" roughness={0.3} metalness={0.3} />
                  </mesh>
                  <mesh position={[0, side * 0.016, 0]}>
                    <torusGeometry args={[0.03, 0.006, 8, 24]} />
                    <meshStandardMaterial color={ROBOT_ACCENT} emissive={ROBOT_ACCENT} emissiveIntensity={1.2} toneMapped={false} />
                  </mesh>
                </group>
              ))}
              <mesh position={[0.06, 0.15, 0]}>
                <cylinderGeometry args={[0.005, 0.006, 0.1, 8]} />
                <meshStandardMaterial color="#9a9da2" metalness={0.8} roughness={0.3} />
              </mesh>
              <mesh position={[0.06, 0.205, 0]}>
                <sphereGeometry args={[0.018, 14, 10]} />
                <meshStandardMaterial ref={antenna} color="#ffb37a" emissive="#ff9a55" emissiveIntensity={1.5} toneMapped={false} />
              </mesh>
            </group>
            {/* Hover ring and thruster glow */}
            <mesh position={[0, -0.22, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.075, 0.012, 10, 32]} />
              <meshStandardMaterial color="#c9cbcf" metalness={0.7} roughness={0.25} />
            </mesh>
            <mesh ref={thruster} position={[0, -0.3, 0]} rotation={[Math.PI, 0, 0]}>
              <coneGeometry args={[0.06, 0.16, 20, 1, true]} />
              <meshBasicMaterial color={ROBOT_ACCENT} transparent opacity={0.55} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
            </mesh>
            {/* Invisible, generous hit area */}
            <mesh position={[0, 0.1, 0]}>
              <sphereGeometry args={[0.32, 10, 8]} />
              <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>
          </group>
        </Interactive>
      </group>
      {/* Projector beam and holograms live in room space so they don't spin with the robot */}
      <mesh ref={beam} visible={false}>
        <cylinderGeometry args={[0.5, 0.06, 0.95, 32, 1, true]} />
        <meshBasicMaterial color={ROBOT_ACCENT} transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
      <KnowledgeGraph groupRef={bigGraph} radius={0.58} count={28} />
      <KnowledgeGraph groupRef={smallGraph} radius={0.16} count={14} labels={false} seed={3} />
    </group>
  );
}

/* ---------- Extra furnishing for realism ---------- */

function Curtain({ x, width = 0.36, height = 1.55 }) {
  const geometry = useMemo(() => {
    const plane = new THREE.PlaneGeometry(width, height, 28, 1);
    const positions = plane.attributes.position;
    for (let i = 0; i < positions.count; i += 1) {
      const px = positions.getX(i);
      positions.setZ(i, Math.sin((px / width) * Math.PI * 7) * 0.022);
    }
    plane.computeVertexNormals();
    return plane;
  }, [width, height]);
  return (
    <mesh geometry={geometry} position={[x, -0.08, 0.12]} castShadow receiveShadow>
      <meshStandardMaterial color="#efe6d6" roughness={0.95} map={fabricMap()} side={THREE.DoubleSide} />
    </mesh>
  );
}

function WindowCurtains() {
  // Mounted in the window's local frame (see Workstation): x runs along the wall, z points into the room.
  return (
    <group position={[-S + 0.03, 2.05, 1.95]} rotation={[0, Math.PI / 2, 0]}>
      <mesh position={[0, 0.74, 0.14]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.012, 0.012, 1.9, 10]} />
        <meshStandardMaterial color={palette.brass} metalness={0.7} roughness={0.35} />
      </mesh>
      {[-0.96, 0.96].map((x) => (
        <mesh key={x} position={[x, 0.74, 0.14]}>
          <sphereGeometry args={[0.022, 12, 10]} />
          <meshStandardMaterial color={palette.brass} metalness={0.7} roughness={0.35} />
        </mesh>
      ))}
      <Curtain x={-0.8} />
      <Curtain x={0.8} />
    </group>
  );
}

function FloorLamp() {
  const { lightRef, nightRef } = useRoom();
  const shade = useRef();
  const glow = useRef();
  const [x, z] = [2.7, 1.0];
  useFrame(() => {
    const on = lightRef.current.value;
    if (shade.current) shade.current.emissiveIntensity = 0.05 + on * (0.25 + nightRef.current.value * 0.45);
    if (glow.current) glow.current.intensity = on * (0.25 + nightRef.current.value * 1.1);
  });
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.015, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.16, 0.17, 0.03, 32]} />
        <meshStandardMaterial color={palette.metal} metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.8, 0]} castShadow>
        <cylinderGeometry args={[0.012, 0.012, 1.58, 10]} />
        <meshStandardMaterial color={palette.brass} metalness={0.75} roughness={0.3} />
      </mesh>
      <mesh position={[0, 1.66, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.22, 0.26, 32, 1, true]} />
        <meshStandardMaterial ref={shade} color="#f3eadb" emissive="#ffd9a3" emissiveIntensity={0.3} roughness={0.9} side={THREE.DoubleSide} map={fabricMap()} />
      </mesh>
      <pointLight ref={glow} position={[0, 1.6, 0]} intensity={0.4} distance={2.6} decay={2} color="#ffcf94" />
    </group>
  );
}

const DebugPanel = lazy(() => import('./room/DebugPanel'));

function RoomScene(props) {
  const [dpr, setDpr] = useState(() => (typeof window === 'undefined' ? 1 : Math.min(1.25, window.devicePixelRatio || 1)));
  const [debug, setDebug] = useState(false);
  useEffect(() => { setDebug(new URLSearchParams(window.location.search).has('debug')); }, []);
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
      dpr={dpr}
      shadows={{ type: THREE.PCFShadowMap }}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
    >
      <color attach="background" args={['#e9dccb']} />
      <Environment resolution={128} frames={1} environmentIntensity={0.35}>
        <Lightformer form="rect" intensity={2} color="#fff1dc" position={[0, 6, 4]} scale={[10, 4, 1]} />
        <Lightformer form="rect" intensity={0.8} color="#e9dccb" position={[-6, 2, 0]} rotation={[0, Math.PI / 2, 0]} scale={[8, 3, 1]} />
        <Lightformer form="ring" intensity={1.2} color="#ffffff" position={[5, 3, -4]} scale={2} />
      </Environment>
      <RoomContext.Provider value={props.room}>
        {sky}
        <BoxRoom {...props} />
      </RoomContext.Provider>
      <CameraTour progressRef={props.progressRef} reducedMotion={props.reducedMotion} />
      {/* Drop resolution on slow GPUs, raise it again (up to 1.5x) when there is headroom. */}
      <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(Math.min(1.5, window.devicePixelRatio || 1))} flipflops={3} onFallback={() => setDpr(1)} />
      {debug && <Suspense fallback={null}><DebugPanel /></Suspense>}
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
      <span className="box-tour-tag" style={{ '--tag-dot': tagColor }}>{tag}</span>
      {children}
    </motion.section>
  );
}

// Is the event inside the open info card, and can that card still scroll in this direction?
function cardCanScroll(target, direction) {
  const card = target instanceof Element ? target.closest('.box-tour-card') : null;
  if (!card || card.scrollHeight <= card.clientHeight + 1) return false;
  if (direction > 0) return card.scrollTop + card.clientHeight < card.scrollHeight - 1;
  return card.scrollTop > 0;
}

function isTypingTarget(target) {
  return target instanceof HTMLElement && (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable);
}

// Always-visible tour status: where you are, what comes next, and how to get there.
function TourProgress({ step, travel, onStep }) {
  const [coarse, setCoarse] = useState(false);
  useEffect(() => {
    const media = window.matchMedia('(pointer: coarse)');
    const update = () => setCoarse(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  // The welcome text has its own prompt, so the bar appears once the tour starts.
  const visible = step > 0 || Boolean(travel);
  const next = STEPS[step + 1];
  const verb = coarse ? 'Swipe up' : 'Scroll';
  let message;
  if (travel) message = <>Heading to <strong>{STEPS[travel.to].label}</strong></>;
  else if (next) message = <>{verb} for <strong>{next.label}</strong></>;
  else message = <>End of the tour. <strong>{coarse ? 'Swipe down' : 'Scroll up'}</strong> to go back</>;
  return (
    <div className={`box-tour-progress${visible ? ' is-visible' : ''}`} role="group" aria-label="Tour progress" aria-hidden={!visible}>
      <button type="button" className="box-tour-step-btn" onClick={() => onStep(-1)} disabled={step === 0} aria-label="Previous stop" tabIndex={visible ? 0 : -1}>
        <ArrowUp size={18} weight="bold" />
      </button>
      <div className="box-tour-progress-body">
        <div className="box-tour-progress-top">
          <span className="box-tour-progress-count">{String(step + 1).padStart(2, '0')} / {String(STEPS.length).padStart(2, '0')}</span>
          <span className="box-tour-progress-label" aria-live="polite">{message}</span>
        </div>
        <ol className={`box-tour-segments${travel ? ' is-travelling' : ''}`} aria-hidden="true">
          {STEPS.map((item, index) => (
            <li key={item.id} className={index < step ? 'is-done' : index === step ? 'is-current' : ''}>
              {travel && index === travel.to && (
                <span key={travel.id} className="box-tour-segment-fill" style={{ animationDuration: `${Math.max(travel.duration, 0.01)}s` }} />
              )}
            </li>
          ))}
        </ol>
      </div>
      <button type="button" className={`box-tour-step-btn is-next${!travel && next ? ' is-nudge' : ''}`} onClick={() => onStep(1)} disabled={step === LAST_STEP} aria-label={next ? `Next stop: ${next.label}` : 'Last stop'} tabIndex={visible ? 0 : -1}>
        <ArrowDown size={18} weight="bold" />
      </button>
    </div>
  );
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
  // Lets the ?debug panel switch day/night.
  useEffect(() => {
    const onTheme = (event) => { if (event.detail?.theme === 'day' || event.detail?.theme === 'night') setTheme(event.detail.theme); };
    window.addEventListener('tour:theme', onTheme);
    return () => window.removeEventListener('tour:theme', onTheme);
  }, []);
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
  // Step navigation: `step` is where the tour is (or is heading); `travel` describes an active transition.
  const [step, setStep] = useState(0);
  const [travel, setTravel] = useState(null);
  const tourRef = useRef({ position: 0, from: 0, to: 0, start: 0, duration: 0, moving: false });
  const goToStep = useCallback((index) => {
    const tour = tourRef.current;
    const target = Math.max(0, Math.min(LAST_STEP, index));
    if (target === tour.to && (tour.moving || tour.position === target)) return;
    const from = tour.position;
    const low = Math.min(from, target);
    const high = Math.max(from, target);
    let duration = 0;
    for (let leg = Math.floor(low); leg < Math.ceil(high); leg += 1) {
      const covered = Math.min(high, leg + 1) - Math.max(low, leg);
      // Jumps across several stops travel faster per stop so the dots never feel sluggish.
      duration += covered * LEG_DURATION[leg] * (high - low > 1.01 ? 0.6 : 1);
    }
    duration = reducedMotion ? 0 : Math.min(duration, 3.4);
    Object.assign(tour, { from, to: target, start: performance.now(), duration, moving: true });
    setStep(target);
    setPhase('travel');
    setTravel({ to: target, duration, id: performance.now() });
    window.dispatchEvent(new CustomEvent('tour:step', { detail: { index: target, arrived: false } }));
  }, [reducedMotion]);
  const goTo = useCallback((id) => {
    const index = STEPS.findIndex((item) => item.id === id);
    if (index >= 0) goToStep(index);
  }, [goToStep]);
  const stepBy = useCallback((direction) => goToStep(tourRef.current.to + direction), [goToStep]);

  // The stop the tour is at or heading to, readable from inside the 3D scene without re-rendering it.
  const phaseRef = useRef('intro');
  useEffect(() => { phaseRef.current = STEPS[step].id; }, [step]);
  const room = useMemo(
    () => ({ goTo, rgbMode, cycleRgb, reducedMotion, theme, toggleTheme, lightOn, toggleLight, nightRef, lightRef, phaseRef }),
    [goTo, rgbMode, cycleRgb, reducedMotion, theme, toggleTheme, lightOn, toggleLight],
  );

  const previousProject = useCallback(() => setProjectIndex((value) => (value - 1 + projects.length) % projects.length), []);
  const nextProject = useCallback(() => setProjectIndex((value) => (value + 1) % projects.length), []);

  // Animate the tour position once per frame. Progress is derived from it, so the box and camera follow exactly.
  useEffect(() => {
    let frame = 0;
    const tick = (now) => {
      const tour = tourRef.current;
      if (tour.moving) {
        const t = tour.duration > 0 ? clamp01((now - tour.start) / (tour.duration * 1000)) : 1;
        tour.position = tour.from + (tour.to - tour.from) * t;
        if (t >= 1) {
          tour.position = tour.to;
          tour.moving = false;
          tour.arrivedAt = now;
          setPhase(STEPS[tour.to].id);
          setTravel(null);
          window.dispatchEvent(new CustomEvent('tour:step', { detail: { index: tour.to, arrived: true } }));
        }
      }
      const value = progressAt(tour.position);
      progressRef.current.target = value;
      progressRef.current.smooth = value;
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, []);

  // The page itself no longer scrolls: wheel, swipe and keys move one stop at a time.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('box-tour-locked');
    window.scrollTo(0, 0);
    const wheel = { sum: 0, last: 0, lastAbs: 0, tail: false, cardUntil: 0 };
    const onWheel = (event) => {
      const now = performance.now();
      const dy = event.deltaMode === 1 ? event.deltaY * 16 : event.deltaMode === 2 ? event.deltaY * window.innerHeight : event.deltaY;
      if (Math.abs(dy) < Math.abs(event.deltaX)) return;
      // Let a long card scroll first; only move on once it is at its edge and the gesture has paused.
      if (cardCanScroll(event.target, Math.sign(dy))) { wheel.cardUntil = now + 380; wheel.last = now; return; }
      event.preventDefault();
      const gap = now - wheel.last;
      const abs = Math.abs(dy);
      // A pause or a sudden stronger push starts a new gesture; otherwise this is trackpad momentum.
      const fresh = gap > 220 || (abs > wheel.lastAbs * 1.8 && abs > 24 && gap > 60);
      wheel.last = now;
      wheel.lastAbs = abs;
      if (tourRef.current.moving) { wheel.tail = true; wheel.sum = 0; return; }
      if (now < wheel.cardUntil) return;
      // Stay on a stop for a moment after arriving, even if the wheel keeps turning.
      if (now - (tourRef.current.arrivedAt ?? -1e9) < 650) { wheel.tail = true; return; }
      if (wheel.tail && !fresh) return;
      wheel.tail = false;
      if (fresh) wheel.sum = 0;
      wheel.sum += dy;
      if (Math.abs(wheel.sum) >= 28) {
        const direction = Math.sign(wheel.sum);
        wheel.sum = 0;
        wheel.tail = true;
        stepBy(direction);
      }
    };

    const touch = { x: 0, y: 0, active: false, cardTop: null, card: null };
    const onTouchStart = (event) => {
      if (event.touches.length !== 1) { touch.active = false; return; }
      const point = event.touches[0];
      const card = event.target instanceof Element ? event.target.closest('.box-tour-card') : null;
      Object.assign(touch, { x: point.clientX, y: point.clientY, active: true, card, cardTop: card ? card.scrollTop : null });
    };
    const onTouchMove = (event) => {
      if (!touch.active) return;
      const dy = touch.y - event.touches[0].clientY;
      if (touch.card && cardCanScroll(touch.card, Math.sign(dy))) return;
      if (event.cancelable) event.preventDefault();
    };
    const onTouchEnd = (event) => {
      if (!touch.active) return;
      touch.active = false;
      const point = event.changedTouches[0];
      const dx = touch.x - point.clientX;
      const dy = touch.y - point.clientY;
      // A swipe that scrolled the card is not a tour swipe.
      if (touch.card && Math.abs(touch.card.scrollTop - touch.cardTop) > 2) return;
      if (Math.abs(dy) < 48 || Math.abs(dy) < Math.abs(dx) * 1.2) return;
      if (tourRef.current.moving || performance.now() - (tourRef.current.arrivedAt ?? -1e9) < 350) return;
      stepBy(Math.sign(dy));
    };

    const onKey = (event) => {
      if (isTypingTarget(event.target) || event.altKey || event.ctrlKey || event.metaKey) return;
      const onControl = event.target instanceof HTMLElement && event.target.closest('button, a');
      let direction = 0;
      if (event.key === 'ArrowDown' || event.key === 'PageDown' || (event.key === ' ' && !onControl && !event.shiftKey)) direction = 1;
      if (event.key === 'ArrowUp' || event.key === 'PageUp' || (event.key === ' ' && !onControl && event.shiftKey)) direction = -1;
      if (event.key === 'Home') { event.preventDefault(); goToStep(0); return; }
      if (event.key === 'End') { event.preventDefault(); goToStep(LAST_STEP); return; }
      if (!direction) return;
      if (cardCanScroll(document.activeElement, direction)) return;
      event.preventDefault();
      if (!event.repeat) stepBy(direction);
    };
    const onGo = (event) => goToStep(event.detail?.index ?? 1);

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('keydown', onKey);
    window.addEventListener('tour:go', onGo);
    return () => {
      root.classList.remove('box-tour-locked');
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('tour:go', onGo);
    };
  }, [goToStep, stepBy]);

  // Generated lo-fi: M toggles it, and it stops when the tab is hidden or the page is left.
  const musicPlaying = useLofiPlaying();
  useEffect(() => {
    const onKey = (event) => {
      if (isTypingTarget(event.target) || event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === 'm' || event.key === 'M') getLofi()?.toggle();
    };
    const onHidden = () => { if (document.hidden) getLofi()?.stop(); };
    window.addEventListener('keydown', onKey);
    document.addEventListener('visibilitychange', onHidden);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('visibilitychange', onHidden);
      getLofi()?.stop();
    };
  }, []);

  // A one-time hint that the view can be dragged at a stop.
  const [lookHint, setLookHint] = useState(false);
  useEffect(() => {
    if (phase !== 'display' || reducedMotion) return undefined;
    try { if (window.localStorage.getItem('box-tour-look-hint')) return undefined; } catch { /* storage unavailable */ }
    setLookHint(true);
    const done = () => {
      setLookHint(false);
      try { window.localStorage.setItem('box-tour-look-hint', '1'); } catch { /* storage unavailable */ }
    };
    const timer = window.setTimeout(done, 4500);
    window.addEventListener('tour:look', done);
    return () => { window.clearTimeout(timer); window.removeEventListener('tour:look', done); setLookHint(false); };
  }, [phase, reducedMotion]);

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
        <a href={MAIN_PORTFOLIO} className="box-tour-archive" aria-label="Open my classic portfolio (2D site)" title="The classic 2D version of this portfolio"><Browser size={16} weight="bold" /><span>Classic portfolio</span> <ArrowUpRight size={14} weight="bold" /></a>
        <div className="box-tour-quick" role="group" aria-label="Room settings">
          <button type="button" onClick={toggleTheme} aria-pressed={theme === 'night'} aria-label={theme === 'day' ? 'Switch to night mode' : 'Switch to day mode'} title={theme === 'day' ? 'Night mode' : 'Day mode'}>
            {theme === 'day' ? <Moon size={20} weight="fill" /> : <Sun size={20} weight="fill" />}
          </button>
          <button type="button" onClick={toggleLight} aria-pressed={!lightOn} aria-label={lightOn ? 'Turn the room light off' : 'Turn the room light on'} title={lightOn ? 'Light off' : 'Light on'} className={lightOn ? 'is-on' : ''}>
            <Lightbulb size={20} weight={lightOn ? 'fill' : 'regular'} />
          </button>
        </div>
        <ol>
          {STEPS.map((item, index) => (
            <li key={item.id}>
              <button
                type="button"
                className={step === index ? 'is-active' : ''}
                aria-current={step === index ? 'step' : undefined}
                aria-label={`Go to ${item.label}`}
                data-label={item.label}
                onClick={() => goToStep(index)}
              >
                <span />
              </button>
            </li>
          ))}
        </ol>
      </nav>


      <TourProgress step={step} travel={travel} onStep={stepBy} />

      <AnimatePresence>
        {musicPlaying && (
          <motion.div key="music" className="box-tour-music" role="status" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.25 }}>
            <span className="box-tour-eq" aria-hidden="true"><i /><i /><i /></span>
            <span>Now playing <small>lo-fi · generated live</small></span>
            <button type="button" onClick={() => getLofi()?.stop()} aria-label="Stop the music" title="Stop (M)"><Pause size={15} weight="fill" /></button>
          </motion.div>
        )}
        {lookHint && (
          <motion.p key="look" className="box-tour-look-hint" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <HandGrabbing size={16} weight="bold" /> Drag to look around
          </motion.p>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait" initial={false}>
        {phase === 'overview' && (
          <motion.p key="tip" className="box-tour-tip" role="status" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.3 }}>
            Tip: hover or tap things in the room. Say hi to me at the desk, ask the robot, pet the cat, or play the record for some lo-fi. Drag to look around at any stop.
          </motion.p>
        )}
        {phase === 'display' && (
          <ContextCard key="display" side="left" tag="About" tagColor={palette.sage} labelledBy="card-about">
            <h2 id="card-about">Full-stack developer and AI automation specialist.</h2>
            <p>I’m Jazzther Bert Shanne Sajonia, an IT graduate from General Santos City. I build web apps, Android apps, and AI-powered automations that connect webhooks, AI models, Airtable, and Google Workspace with structured outputs, error handling, and human review.</p>
            <dl className="box-tour-stats">
              <div><dt>BS IT</dt><dd>SEAIT graduate, 2022–2026</dd></div>
              <div><dt>{allProjects.length}</dt><dd>Projects built</dd></div>
              <div><dt>3</dt><dd>Jobs in admin and operations</dd></div>
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
          <ContextCard key="computer" side="right" tag="Projects" tagColor={project.color} labelledBy="card-project">
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
              <a href={project.href} target="_blank" rel="noopener noreferrer">More info <ArrowUpRight size={15} weight="bold" /></a>
              {project.github && <a href={project.github} target="_blank" rel="noreferrer"><GithubLogo size={16} /> GitHub</a>}
              {project.live && <a href={project.live} target="_blank" rel="noreferrer">Live demo <ArrowUpRight size={15} /></a>}
            </div>
            <div className="box-tour-room-controls">
              <button type="button" onClick={cycleRgb} aria-label={`PC lighting: ${rgbMode}. Change lighting`}>
                <span className={`box-tour-rgb-dot is-${rgbMode}`} aria-hidden="true" /> PC lighting: {RGB_LABELS[rgbMode]}
              </button>
            </div>
            <p className="box-tour-hint">Use the arrows beside the monitor or your left and right arrow keys. Click the screen or More info for the full write-up on my <a href={MAIN_PORTFOLIO} target="_blank" rel="noopener noreferrer">main portfolio</a>.</p>
          </ContextCard>
        )}
        {phase === 'journey' && (
          <ContextCard key="journey" side="left" tag="Experience" tagColor={palette.brass} labelledBy="card-journey">
            <h2 id="card-journey">From the HR office to shipping AI systems.</h2>
            <p>The gallery wall tells the short version: a degree, real admin and operations work, and the flagship project I built along the way.</p>
            <ol className="box-tour-timeline">
              {journey.map((item) => (
                <li key={item.role}>
                  <span>{item.period}</span>
                  <strong>{item.role}</strong>
                  <em>{item.place}</em>
                  <p>{item.detail}</p>
                </li>
              ))}
            </ol>
            <a className="box-tour-archive-link" href={`${MAIN_PORTFOLIO}/about`} target="_blank" rel="noopener noreferrer">Full background on my main portfolio <ArrowUpRight size={15} weight="bold" /></a>
          </ContextCard>
        )}
        {phase === 'ai' && (
          <ContextCard key="ai" side="left" tag="AI lab" tagColor="#3fbf9b" labelledBy="card-ai">
            <h2 id="card-ai">AI that asks before it acts.</h2>
            <p>The robot is projecting my knowledge graph: how my AI projects and tools connect. Everything I build with agents keeps a person in charge of the important steps.</p>
            <ul className="box-tour-areas">
              {aiLab.map((item) => (
                <li key={item.slug}>
                  <strong><a href={`${MAIN_PORTFOLIO}/projects#${item.slug}`} target="_blank" rel="noopener noreferrer">{item.title} <ArrowUpRight size={13} weight="bold" /></a></strong>
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
            <p className="box-tour-hint">Click the robot any time to come back here. It also flies over to help at the desk.</p>
          </ContextCard>
        )}
        {phase === 'notes' && (
          <ContextCard key="notes" side="left" tag="How I build" tagColor="#5f7fa8" labelledBy="card-notes">
            <h2 id="card-notes">Notes from the worktable.</h2>
            <ol className="box-tour-steps">
              {buildSteps.map(([number, label]) => <li key={number}><span>{number}</span>{label}</li>)}
            </ol>
            <p>AI can speed up exploration, but I’m responsible for understanding, reviewing, testing, and integrating the code I use.</p>
            <div className="box-tour-group">
              <h3>What I do</h3>
              <ul className="box-tour-areas">
                {practiceAreas.map((area) => <li key={area.title}><strong>{area.title}</strong><span>{area.items}</span></li>)}
              </ul>
            </div>
            <p className="box-tour-hint">Tools I build with: ChatGPT · Gemini · Claude · Manus · Codex · Copilot</p>
          </ContextCard>
        )}
        {phase === 'contact' && (
          <ContextCard key="contact" side="left" tag="Contact" tagColor={palette.accent} labelledBy="card-contact">
            <h2 id="card-contact">Let’s build something.</h2>
            <p>Hiring for a full-stack or AI automation role, or have a workflow you want automated? Send me a message.</p>
            <ul className="box-tour-contact-list">
              <li><Envelope size={17} /><a href="mailto:jaz.sajonia@gmail.com">jaz.sajonia@gmail.com</a></li>
              <li><Phone size={17} /><a href="tel:+639367046410">(+63) 9367046410</a></li>
              <li><MapPin size={17} /><span>Lanton, Apopong, General Santos City</span></li>
            </ul>
            <div className="box-tour-actions box-tour-contact">
              <Link href="/contact"><Envelope size={16} /> Write a message</Link>
              <a href="https://github.com/jazsajonia-pixel" target="_blank" rel="noreferrer"><GithubLogo size={17} /> GitHub</a>
              <a href="https://www.linkedin.com/in/jazzther-bert-shanne-sajonia-a67502439" target="_blank" rel="noreferrer"><LinkedinLogo size={17} /> LinkedIn</a>
            </div>
            <a href={`${MAIN_PORTFOLIO}/projects`} className="box-tour-archive-link">See every project on my classic portfolio <ArrowUpRight size={15} weight="bold" /></a>
          </ContextCard>
        )}
      </AnimatePresence>

    </div>
  );
}
