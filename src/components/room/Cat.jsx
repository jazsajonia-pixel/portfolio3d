'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { Interactive, actors, useRoom } from './core';
import { MODEL } from './models';
import { CAT_SPOT } from './Bedroom';
import { buildCat } from './catRig';

const SCALE = 1.45;
const YAW = -0.35; // faces the room, slightly toward the desk
const AWAKE = 22;
const NAP = 32;

// A short, soft purr: low-passed noise amplitude-modulated at ~25 Hz. Generated, so there is no audio file.
let audio = null;
function purr(duration = 1.8) {
  if (typeof window === 'undefined') return;
  try {
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    const ctx = audio;
    if (ctx.state === 'suspended') ctx.resume();
    const length = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < length; i += 1) {
      last = (last + 0.04 * (Math.random() * 2 - 1)) / 1.04; // brown-ish noise
      const t = i / ctx.sampleRate;
      const flutter = 0.55 + 0.45 * Math.sin(2 * Math.PI * 25 * t);
      const breath = Math.sin(Math.PI * ((t / 0.9) % 1)); // in/out
      data[i] = last * 3.2 * flutter * (0.35 + 0.65 * breath);
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 380;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.15);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);
    source.connect(filter).connect(gain).connect(ctx.destination);
    source.start();
  } catch {
    // Audio is a nice-to-have.
  }
}

const tmpLocal = new THREE.Vector3();

// The cat: a CC0 kitten scan (Grab3D) skinned to a tiny procedural rig. It lives on the bed: watches the person and
// your cursor, swishes its tail, naps, and purrs when you (or he) pet it.
export default function Cat() {
  const { reducedMotion } = useRoom();
  const gltf = useGLTF(MODEL('kitten'), false, true);
  const cat = useMemo(() => buildCat(gltf.scene), [gltf]);
  const group = useRef();
  const hearts = useRef();
  const zs = useRef();
  const [bubble, setBubble] = useState(null);
  const bubbleTimer = useRef(0);
  const state = useRef({ mode: 'awake', t: 0, affection: 0, blink: 0 });

  useEffect(() => {
    if (reducedMotion || window.__tourDebug?.catSleep) { state.current.mode = 'nap'; state.current.t = 0; }
    return () => window.clearTimeout(bubbleTimer.current);
  }, [reducedMotion]);
  useEffect(() => () => { cat?.mesh.geometry.dispose(); cat?.mesh.material.dispose(); }, [cat]);

  const onPet = useCallback(() => {
    const s = state.current;
    const line = s.mode === 'nap' ? 'mrrp?' : ['purr…', 'mrrrow', 'prrrt'][Math.floor(Math.random() * 3)];
    if (s.mode === 'nap' && !reducedMotion) { s.mode = 'awake'; s.t = AWAKE - 8; }
    s.affection = 2.4;
    purr();
    setBubble(line);
    window.clearTimeout(bubbleTimer.current);
    bubbleTimer.current = window.setTimeout(() => setBubble(null), 2200);
  }, [reducedMotion]);

  useFrame(({ clock, pointer }, rawDelta) => {
    if (!cat || !group.current) return;
    const delta = Math.min(rawDelta, 0.1);
    const s = state.current;
    const time = clock.elapsedTime;
    const { head, tail, chest } = cat.bones;
    s.t += delta;
    if (!reducedMotion) {
      if (s.mode === 'awake' && s.t > AWAKE && !actors.cat.petting) { s.mode = 'nap'; s.t = 0; }
      else if (s.mode === 'nap' && s.t > NAP && !actors.cat.petting) { s.mode = 'awake'; s.t = 0; }
    }
    s.affection = Math.max(0, s.affection - delta);
    const napping = s.mode === 'nap';
    const petted = actors.cat.petting || s.affection > 0;

    // Head: watch the person (or your cursor when he is far away); droop when napping; lean into the hand when petted.
    let yaw = 0;
    let pitch = 0;
    let roll = 0;
    if (napping) {
      pitch = 0.55 + Math.sin(time * 0.6) * 0.02;
      yaw = -0.35;
      roll = 0.12;
    } else {
      group.current.worldToLocal(tmpLocal.copy(actors.human.head));
      const toHuman = Math.atan2(tmpLocal.x, tmpLocal.z);
      const humanNear = Math.abs(toHuman) < 1.4;
      yaw = humanNear ? toHuman * 0.7 : pointer.x * 0.5;
      pitch = humanNear ? -0.15 : -pointer.y * 0.25;
      // Occasional curious head tilt.
      roll = Math.sin(time * 0.35) > 0.85 ? 0.22 : 0;
    }
    if (petted) {
      pitch = napping ? 0.35 : -0.25;
      roll = 0.18 + Math.sin(time * 2.2) * 0.06;
    }
    const k = 1 - Math.pow(0.02, delta);
    head.rotation.x += (THREE.MathUtils.clamp(pitch, -0.4, 0.6) - head.rotation.x) * k;
    head.rotation.y += (THREE.MathUtils.clamp(yaw, -0.7, 0.7) - head.rotation.y) * k;
    head.rotation.z += (roll - head.rotation.z) * k;

    // Tail: lazy swish awake, slow twitch asleep, happy flick when petted.
    const swish = reducedMotion ? 0 : napping ? Math.sin(time * 0.5) * 0.08 : Math.sin(time * (petted ? 3.2 : 1.4)) * (petted ? 0.3 : 0.22);
    tail.rotation.y = swish;
    tail.rotation.x = napping ? 0 : Math.max(0, Math.sin(time * 0.7)) * -0.06;

    // Breathing (slower and deeper asleep).
    const breath = reducedMotion ? 0 : Math.sin(time * (napping ? 1.5 : 2.6)) * (napping ? 0.022 : 0.012);
    chest.scale.set(1 + breath, 1 + breath * 0.5, 1 + breath);

    cat.mesh.skeleton.bones.forEach((bone) => bone.updateMatrixWorld(true));

    actors.cat.sleeping = napping;
    actors.cat.napLeft = napping ? NAP - s.t : 0;
    actors.cat.position.copy(CAT_SPOT);

    if (hearts.current) {
      hearts.current.visible = petted && !reducedMotion;
      if (hearts.current.visible) {
        hearts.current.children.forEach((heart, index) => {
          const phase = (time * 0.55 + index / 3) % 1;
          heart.position.set(Math.sin(phase * 5 + index) * 0.06, 0.42 + phase * 0.35, 0);
          heart.material.opacity = Math.sin(phase * Math.PI) * 0.9;
          heart.scale.setScalar(0.6 + phase * 0.5);
        });
      }
    }
    if (zs.current) {
      zs.current.visible = napping && !petted && !reducedMotion;
      if (zs.current.visible) {
        zs.current.children.forEach((z, index) => {
          const phase = (time * 0.3 + index / 3) % 1;
          z.position.set(0.05 + phase * 0.12, 0.34 + phase * 0.28, 0.06);
          z.material.opacity = Math.sin(phase * Math.PI) * 0.8;
          z.scale.setScalar(0.5 + phase * 0.7);
        });
      }
    }
    if (typeof window !== 'undefined' && window.__tourDebug) window.__tourDebug.cat = { mode: s.mode, petted };
  });

  const heartShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, -0.03);
    shape.bezierCurveTo(-0.05, 0.0, -0.035, 0.045, 0, 0.022);
    shape.bezierCurveTo(0.035, 0.045, 0.05, 0.0, 0, -0.03);
    return shape;
  }, []);
  const zTexture = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const context = canvas.getContext('2d');
    context.fillStyle = '#ffffff';
    context.font = '700 48px system-ui, sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('z', 32, 34);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, []);

  if (!cat) return null;
  return (
    <group ref={group} position={CAT_SPOT.toArray()} rotation={[0, YAW, 0]}>
      <Interactive label="Pet the cat" onSelect={onPet} labelOffset={[0, 0.55, 0]}>
        <primitive object={cat.mesh} scale={SCALE} />
        <mesh position={[0, 0.17, 0]}>
          <sphereGeometry args={[0.2, 10, 8]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
        </mesh>
      </Interactive>
      <group ref={hearts} visible={false}>
        {[0, 1, 2].map((index) => (
          <mesh key={index}>
            <shapeGeometry args={[heartShape]} />
            <meshBasicMaterial color="#e0607e" transparent opacity={0} side={THREE.DoubleSide} depthWrite={false} toneMapped={false} />
          </mesh>
        ))}
      </group>
      <group ref={zs} visible={false}>
        {[0, 1, 2].map((index) => (
          <sprite key={index}>
            <spriteMaterial map={zTexture} color="#9fb4d8" transparent opacity={0} depthWrite={false} />
          </sprite>
        ))}
      </group>
      {bubble && (
        <Html position={[0, 0.62, 0]} center zIndexRange={[26, 0]} wrapperClass="box-tour-html">
          <span className="box-tour-cat-bubble" role="status">{bubble}</span>
        </Html>
      )}
    </group>
  );
}

