'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { BallCollider, CuboidCollider, CylinderCollider, Physics, RigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { Interactive, actors, makeCanvasTexture, useRoom } from './core';
import { BED, PLUSH_HOME, ClaudePlushMesh } from './Bedroom';
import { DESK_ORIGIN, DESK_TOP } from './Human';

// Loaded lazily once the room is open: Rapier (WASM) costs nothing on the welcome screen.
// Fixed colliders approximate the furniture; three toys are real rigid bodies.

const BED_CENTER_Z = (BED.z0 + BED.z1) / 2;
const BED_TOP = BED.mattressTop + 0.09;
const TABLE = { x: 0.75, z: 0.85, top: 0.53, radius: 0.72 };
const BALL_HOME = new THREE.Vector3(-0.35, 0.16, 2.15);
const DICE_HOME = [new THREE.Vector3(1.08, TABLE.top + 0.04, 1.08), new THREE.Vector3(1.2, TABLE.top + 0.04, 0.9)];

// Rapier works in world space; the room is yawed and offset inside the scene. `frame` is an empty group in the room's
// own space, used to convert between the two for anything we position by hand.
const frame = { current: null };
const toWorld = (v, out) => (frame.current ? frame.current.localToWorld(out.copy(v)) : out.copy(v));
const toRoom = (v, out) => (frame.current ? frame.current.worldToLocal(out.set(v.x, v.y, v.z)) : out.set(v.x, v.y, v.z));
const scratchA = new THREE.Vector3();
const scratchB = new THREE.Vector3();

const random = (amount) => (Math.random() * 2 - 1) * amount;
const outside = (p) => p.y < -0.5 || Math.abs(p.x) > 3.1 || Math.abs(p.z) > 3.1;

function RoomColliders() {
  return (
    <RigidBody type="fixed" colliders={false}>
      <CuboidCollider args={[3.2, 0.05, 3.2]} position={[0, -0.05, 0]} />
      {/* Walls (back, left) and invisible glass at the open sides so toys stay in the room */}
      <CuboidCollider args={[3.2, 2, 0.05]} position={[0, 2, -3.05]} />
      <CuboidCollider args={[0.05, 2, 3.2]} position={[-3.05, 2, 0]} />
      <CuboidCollider args={[3.2, 1, 0.05]} position={[0, 1, 3.05]} />
      <CuboidCollider args={[0.05, 1, 3.2]} position={[3.05, 1, 0]} />
      {/* Bed, notes table, desk top, nightstand, credenza */}
      <CuboidCollider args={[BED.width / 2, BED_TOP / 2, (BED.z1 - BED.z0) / 2]} position={[BED.x, BED_TOP / 2, BED_CENTER_Z]} friction={1.2} />
      <CuboidCollider args={[BED.width / 2, 0.6, 0.05]} position={[BED.x, 0.6, BED.z0 + 0.02]} />
      <CylinderCollider args={[0.03, TABLE.radius]} position={[TABLE.x, TABLE.top - 0.03, TABLE.z]} />
      <CuboidCollider args={[0.43, 0.02, 1.25]} position={[DESK_ORIGIN.x, DESK_TOP - 0.02, DESK_ORIGIN.z]} />
      <CuboidCollider args={[0.25, 0.3, 0.25]} position={[2.22, 0.3, -2.72]} />
      <CuboidCollider args={[0.8, 0.35, 0.25]} position={[-0.86, 0.35, -2.72]} />
    </RigidBody>
  );
}

// He and the robot push toys out of the way as they move around.
function ActorPushers() {
  const human = useRef();
  const robot = useRef();
  const target = useMemo(() => new THREE.Vector3(), []);
  useFrame(() => {
    if (human.current) {
      target.set(actors.human.head.x, 0.35, actors.human.head.z);
      human.current.setNextKinematicTranslation(toWorld(target, scratchA));
    }
    if (robot.current) robot.current.setNextKinematicTranslation(toWorld(actors.robot.position, scratchA));
  });
  return (
    <>
      <RigidBody ref={human} type="kinematicPosition" colliders={false} position={[-1.8, 0.35, -0.36]}>
        <BallCollider args={[0.2]} />
      </RigidBody>
      <RigidBody ref={robot} type="kinematicPosition" colliders={false} position={[2.25, 0.5, 1.8]}>
        <BallCollider args={[0.18]} />
      </RigidBody>
    </>
  );
}

// Returns a body to its spot once it has left the room or come to rest somewhere silly.
function useHome(body, home, isHome) {
  const away = useRef(0);
  useFrame((_, delta) => {
    const rb = body.current;
    if (!rb) return;
    const p = toRoom(rb.translation(), scratchB);
    away.current = isHome(p) ? 0 : away.current + delta;
    if (outside(p) || (away.current > 14 && rb.isSleeping())) {
      rb.setTranslation(toWorld(home, scratchA), true);
      rb.setLinvel({ x: 0, y: 0, z: 0 }, true);
      rb.setAngvel({ x: 0, y: 0, z: 0 }, true);
      away.current = 0;
    }
  });
}

function PlushBody() {
  const body = useRef();
  const squish = useRef(0);
  const visual = useRef();
  const { reducedMotion } = useRoom();
  useHome(body, PLUSH_HOME, (p) => Math.abs(p.x - BED.x) < BED.width / 2 && p.z > BED.z0 && p.z < BED.z1 && p.y > BED_TOP - 0.05);
  useFrame((_, delta) => {
    squish.current = Math.max(0, squish.current - delta * 1.6);
    if (!visual.current) return;
    const s = reducedMotion ? 0 : Math.sin(squish.current * 14) * squish.current * 0.12;
    visual.current.scale.set(1.2 * (1 + s), 1.2 * (1 - s), 1.2 * (1 + s));
  });
  const toss = () => {
    squish.current = 1;
    const rb = body.current;
    if (!rb || reducedMotion) return;
    const m = rb.mass();
    const dir = scratchA.set(random(0.5) - 0.2, 0, 1).normalize();
    if (frame.current) dir.transformDirection(frame.current.matrixWorld);
    rb.applyImpulse({ x: dir.x * 1.3 * m, y: 3.4 * m, z: dir.z * 1.3 * m }, true);
    rb.applyTorqueImpulse({ x: random(0.02), y: random(0.02), z: random(0.02) }, true);
  };
  return (
    <RigidBody ref={body} colliders={false} position={PLUSH_HOME.toArray()} rotation={[-0.32, 0.12, 0.08]} linearDamping={0.4} angularDamping={0.8} restitution={0.25} friction={1}>
      <CuboidCollider args={[0.2, 0.2, 0.07]} density={60} />
      <Interactive label="Claude plush · toss it" onSelect={toss} labelOffset={[0, 0.35, 0]}>
        <group ref={visual} scale={1.2}>
          <Suspense fallback={null}><ClaudePlushMesh /></Suspense>
        </group>
      </Interactive>
    </RigidBody>
  );
}

function beachBallTexture() {
  return makeCanvasTexture('beachball', 256, 128, (context, w, h) => {
    const colors = ['#f2efe8', '#e0553f', '#f2efe8', '#2f7fd0', '#f2efe8', '#f2c14b'];
    colors.forEach((color, index) => {
      context.fillStyle = color;
      context.fillRect((index / colors.length) * w, 0, w / colors.length + 1, h);
    });
    context.fillStyle = '#f7f4ee';
    context.fillRect(0, 0, w, h * 0.07);
    context.fillRect(0, h * 0.93, w, h * 0.07);
  });
}

function BeachBall() {
  const body = useRef();
  useHome(body, BALL_HOME, (p) => p.y < 0.3 && Math.abs(p.x) < 2.9 && Math.abs(p.z) < 2.9);
  const map = useMemo(() => beachBallTexture(), []);
  const kick = () => {
    const rb = body.current;
    if (!rb) return;
    const m = rb.mass();
    // Kick it away from the viewer (toward the back of the room), converted from room to world directions.
    const dir = scratchA.set(random(0.8), 0, -(1 + Math.random())).normalize();
    if (frame.current) dir.transformDirection(frame.current.matrixWorld);
    rb.applyImpulse({ x: dir.x * 2.4 * m, y: 2.4 * m, z: dir.z * 2.4 * m }, true);
    rb.applyTorqueImpulse({ x: random(0.01), y: random(0.01), z: random(0.01) }, true);
  };
  return (
    <RigidBody ref={body} colliders={false} position={BALL_HOME.toArray()} restitution={0.72} friction={0.6} linearDamping={0.25} angularDamping={0.35}>
      <BallCollider args={[0.16]} density={18} />
      <Interactive label="Beach ball · kick" onSelect={kick} labelOffset={[0, 0.35, 0]}>
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[0.16, 40, 24]} />
          <meshPhysicalMaterial map={map} roughness={0.35} clearcoat={0.6} clearcoatRoughness={0.25} />
        </mesh>
      </Interactive>
    </RigidBody>
  );
}

// One material per face with the right number of pips (opposite faces add up to seven).
function useDiceMaterials() {
  return useMemo(() => {
    const spots = {
      1: [[0.5, 0.5]], 2: [[0.28, 0.28], [0.72, 0.72]], 3: [[0.26, 0.26], [0.5, 0.5], [0.74, 0.74]],
      4: [[0.28, 0.28], [0.72, 0.28], [0.28, 0.72], [0.72, 0.72]],
      5: [[0.26, 0.26], [0.74, 0.26], [0.5, 0.5], [0.26, 0.74], [0.74, 0.74]],
      6: [[0.28, 0.24], [0.72, 0.24], [0.28, 0.5], [0.72, 0.5], [0.28, 0.76], [0.72, 0.76]],
    };
    // BoxGeometry face order: +x, -x, +y, -y, +z, -z
    return [1, 6, 2, 5, 3, 4].map((value) => new THREE.MeshPhysicalMaterial({
      map: makeCanvasTexture(`die-${value}`, 128, 128, (context, w, h) => {
        context.fillStyle = '#f6f1e7';
        context.fillRect(0, 0, w, h);
        context.fillStyle = value === 1 ? '#c94a3a' : '#1f1f22';
        spots[value].forEach(([x, y]) => { context.beginPath(); context.arc(x * w, y * h, w * (value === 1 ? 0.13 : 0.085), 0, Math.PI * 2); context.fill(); });
      }),
      roughness: 0.3,
      clearcoat: 0.8,
    }));
  }, []);
}

function Die({ home, materials, index }) {
  const body = useRef();
  useHome(body, home, (p) => Math.hypot(p.x - TABLE.x, p.z - TABLE.z) < TABLE.radius && p.y > TABLE.top - 0.05);
  const roll = () => {
    const rb = body.current;
    if (!rb) return;
    const m = rb.mass();
    rb.applyImpulse({ x: random(0.5) * m, y: 1.6 * m, z: random(0.5) * m }, true);
    rb.applyTorqueImpulse({ x: random(0.0004), y: random(0.0004), z: random(0.0004) }, true);
  };
  const geometry = useMemo(() => new THREE.BoxGeometry(0.05, 0.05, 0.05), []);
  return (
    <RigidBody ref={body} colliders={false} position={home.toArray()} rotation={[0, index * 0.7, 0]} restitution={0.35} friction={0.7}>
      <CuboidCollider args={[0.025, 0.025, 0.025]} density={600} />
      <Interactive label="Roll the dice" onSelect={roll} labelOffset={[0, 0.18, 0]}>
        <mesh geometry={geometry} material={materials} castShadow />
      </Interactive>
    </RigidBody>
  );
}

export default function PhysicsToys() {
  const [debug, setDebug] = useState(false);
  const materials = useDiceMaterials();
  useEffect(() => {
    const onDebug = (event) => setDebug(Boolean(event.detail?.physics));
    window.addEventListener('room:debug', onDebug);
    return () => window.removeEventListener('room:debug', onDebug);
  }, []);
  return (
    <Physics gravity={[0, -9.81, 0]} debug={debug} timeStep={1 / 60}>
      <group ref={(node) => { frame.current = node; }} />
      <RoomColliders />
      <ActorPushers />
      <PlushBody />
      <BeachBall />
      {DICE_HOME.map((home, index) => <Die key={index} home={home} index={index} materials={materials} />)}
    </Physics>
  );
}
