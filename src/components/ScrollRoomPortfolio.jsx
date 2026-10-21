'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, RoundedBox, Text } from '@react-three/drei';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Envelope, GithubLogo, LinkedinLogo, Mouse, Sparkle, X } from 'phosphor-react';
import * as THREE from 'three';

const projects = [
  { title: 'Retext', type: 'Android image editor', stack: 'Flutter · OCR · pixel-safe repair', description: 'Change text inside images while preserving untouched pixels.', color: '#ff8b55', href: '/projects#retext', github: 'https://github.com/jazsajonia-pixel/retext' },
  { title: 'Chrono', type: 'AI coding workspace', stack: 'React · TypeScript · GitHub', description: 'Connect GitHub, review changes, and preview an app with an AI coding assistant.', color: '#9b8cff', href: '/projects#chrono', github: 'https://github.com/jazsajonia-pixel/mobdevai', live: 'https://chrono-tau.vercel.app/' },
  { title: 'Petalbound', type: 'Pixel-art adventure', stack: 'Godot 4 · GDScript · Android', description: 'An offline action adventure with quests, guardian fights, crafting, and touch controls.', color: '#6fe0b1', href: '/projects#petalbound', github: 'https://github.com/jazsajonia-pixel/petalbound-godot' },
  { title: 'FlowPilot AI', type: 'Workflow automation', stack: 'React · AI providers · graph editor', description: 'A visual builder for triggers, AI steps, conditions, and actions.', color: '#69c8ff', href: '/projects#flowpilot', github: 'https://github.com/jazsajonia-pixel/flowpilot', live: 'https://flowpilot-sage-delta.vercel.app/' },
  { title: 'MarketHub', type: 'Marketplace platform', stack: 'React · Prisma · PostgreSQL', description: 'Buyer, seller, and admin flows in a marketplace prototype.', color: '#ffca62', href: '/projects#markethub', github: 'https://github.com/jazsajonia-pixel/markethub' },
];

const skills = ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Next.js', 'Three.js', 'Node.js', 'Vite', 'Flutter', 'Kotlin', 'Godot 4', 'Git', 'GitHub'];

const clamp01 = (value) => Math.min(1, Math.max(0, value));
const range = (value, start, end) => clamp01((value - start) / (end - start));
const ease = (value) => value * value * (3 - 2 * value);

function CameraTour({ progress }) {
  const { camera } = useThree();
  const position = useRef(new THREE.Vector3(7.5, 4.2, 9.5));
  const look = useRef(new THREE.Vector3(0, 0.2, 0));
  const reducedMotion = useRef(false);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => { reducedMotion.current = media.matches; };
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  const stops = useMemo(() => [
    { at: 0.00, position: [7.5, 4.2, 9.5], look: [0, 0.2, 0] },
    { at: 0.18, position: [8.8, 3.2, 8.2], look: [0, 0.1, 0] },
    { at: 0.34, position: [5.8, 2.2, 6.8], look: [0, 0, -0.8] },
    { at: 0.48, position: [0.2, 0.9, 4.4], look: [0, 0.6, -5.8] },
    { at: 0.62, position: [-4.6, 1.1, 1.4], look: [-5.8, 1.1, -2.2] },
    { at: 0.76, position: [0.9, 0.9, 1.1], look: [-1.6, 0.45, -4.7] },
    { at: 0.90, position: [2.8, 1.7, 2.4], look: [2.4, 0.55, -3.2] },
    { at: 1.00, position: [0.2, 2.8, 5.4], look: [0, 0.1, -1.2] },
  ], []);
  useFrame((_, delta) => {
    const p = clamp01(progress);
    let a = stops[0];
    let b = stops[stops.length - 1];
    for (let index = 0; index < stops.length - 1; index += 1) {
      if (p >= stops[index].at && p <= stops[index + 1].at) {
        a = stops[index];
        b = stops[index + 1];
        break;
      }
    }
    const blend = ease(range(p, a.at, b.at));
    const destination = new THREE.Vector3(...a.position).lerp(new THREE.Vector3(...b.position), blend);
    const destinationLook = new THREE.Vector3(...a.look).lerp(new THREE.Vector3(...b.look), blend);
    if (reducedMotion.current) {
      position.current.copy(destination);
      look.current.copy(destinationLook);
    } else {
      position.current.lerp(destination, 1 - Math.pow(0.0008, delta));
      look.current.lerp(destinationLook, 1 - Math.pow(0.0008, delta));
    }
    camera.position.copy(position.current);
    camera.lookAt(look.current);
  });
  return null;
}

function BoxRoom({ progress, activeProject }) {
  const open = ease(range(progress, 0.14, 0.34));
  const reveal = ease(range(progress, 0.30, 0.44));
  const groupRotation = -0.72 * ease(range(progress, 0.04, 0.24));
  return (
    <group position={[0, -0.4, 0]} rotation={[0, groupRotation, 0]}>
      <mesh position={[0, -2.15, 0]} receiveShadow>
        <boxGeometry args={[7.4, 0.34, 7.4]} />
        <meshStandardMaterial color="#8b5a2b" roughness={0.85} />
      </mesh>
      <mesh position={[0, -1.94, 0]} receiveShadow>
        <boxGeometry args={[7.05, 0.1, 7.05]} />
        <meshStandardMaterial color="#e7bd85" roughness={0.78} />
      </mesh>
      {Array.from({ length: 9 }, (_, index) => (
        <mesh key={index} receiveShadow position={[-3.15 + index * 0.79, -1.88, 0]}>
          <boxGeometry args={[0.72, 0.025, 6.85]} />
          <meshStandardMaterial color={index % 2 ? '#d9a468' : '#c89157'} roughness={0.86} />
        </mesh>
      ))}
      <mesh position={[0, 0.95, -3.55]} castShadow receiveShadow>
        <boxGeometry args={[7.05, 4.75, 0.22]} />
        <meshStandardMaterial color="#fff1de" roughness={0.96} />
      </mesh>
      <mesh position={[-3.55, 0.95, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.22, 4.75, 7.05]} />
        <meshStandardMaterial color="#f7e6cf" roughness={0.95} />
      </mesh>
      <mesh position={[3.55, 0.95, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.22, 4.75, 7.05]} />
        <meshStandardMaterial color="#faebd7" roughness={0.95} />
      </mesh>
      <mesh position={[0, 3.28, -3.55]} castShadow>
        <boxGeometry args={[7.35, 0.28, 0.5]} />
        <meshStandardMaterial color="#a76f3d" roughness={0.75} />
      </mesh>
      {[-3.55, 3.55].map((x) => (
        <mesh key={x} position={[x, 3.28, 0]} castShadow>
          <boxGeometry args={[0.5, 0.28, 7.35]} />
          <meshStandardMaterial color="#b57c46" roughness={0.75} />
        </mesh>
      ))}
      <group position={[0, 3.42, 3.42]} rotation={[-open * 1.85, 0, 0]}>
        <mesh castShadow receiveShadow position={[0, 0.1, -1.75]}>
          <boxGeometry args={[7.35, 0.16, 3.6]} />
          <meshStandardMaterial color="#c98d54" roughness={0.8} />
        </mesh>
      </group>
      <group position={[-3.62, 0.95, 3.42]} rotation={[0, open * 1.7, 0]}>
        <mesh castShadow receiveShadow position={[1.75, 0, 0]}>
          <boxGeometry args={[3.6, 4.75, 0.16]} />
          <meshStandardMaterial color="#f7e6cf" roughness={0.94} />
        </mesh>
      </group>
      <group position={[3.62, 0.95, 3.42]} rotation={[0, -open * 1.7, 0]}>
        <mesh castShadow receiveShadow position={[-1.75, 0, 0]}>
          <boxGeometry args={[3.6, 4.75, 0.16]} />
          <meshStandardMaterial color="#faebd7" roughness={0.94} />
        </mesh>
      </group>
      <group position={[0, 0.75, -3.4]}>
        <mesh>
          <boxGeometry args={[2.1, 2.5, 0.12]} />
          <meshStandardMaterial color="#a76f3d" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0, 0.08]}>
          <boxGeometry args={[1.8, 2.2, 0.04]} />
          <meshStandardMaterial color="#cfe8f4" emissive="#9dcde5" emissiveIntensity={0.22} roughness={0.3} />
        </mesh>
      </group>
      <group position={[2.5, 2.5, -3.38]}>
        <RoundedBox args={[2.5, 0.55, 0.1]} radius={0.07} smoothness={3}>
          <meshStandardMaterial color="#fff8ef" roughness={0.55} />
        </RoundedBox>
        <Text position={[0, 0.03, 0.07]} fontSize={0.21} color="#8a5a33" anchorX="center" anchorY="middle" letterSpacing={0.04}>
          JAZZ SAJONIA
        </Text>
      </group>
      <group position={[-2.55, 1.35, -3.38]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[2.4, 0.11, 0.45]} />
          <meshStandardMaterial color="#c58b55" roughness={0.75} />
        </mesh>
        <mesh position={[0, -0.85, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.4, 0.11, 0.45]} />
          <meshStandardMaterial color="#c58b55" roughness={0.75} />
        </mesh>
        {[
          [-0.85, 0.32, '#c6a2d6'], [-0.62, 0.27, '#f0c8a5'], [-0.39, 0.35, '#94b9a0'],
          [0.42, -0.62, '#e9b0c7'], [0.65, -0.58, '#c6a2d6'], [0.88, -0.63, '#d7ad75']
        ].map(([x, y, color], index) => (
          <mesh key={index} position={[x, y, 0.02]} rotation={[0, 0, index % 2 ? 0.04 : -0.03]} castShadow>
            <boxGeometry args={[0.15, 0.45, 0.22]} />
            <meshStandardMaterial color={color} roughness={0.82} />
          </mesh>
        ))}
        <Text position={[0, -0.38, 0.25]} fontSize={0.12} color="#6d4526" anchorX="center" anchorY="middle" letterSpacing={0.08}>
          MAKE · LEARN · BUILD
        </Text>
      </group>
      <group position={[-1.6, 0, -2.9]} scale={[reveal, reveal, reveal]}>
        <mesh castShadow receiveShadow position={[0, -0.85, 0]}>
          <boxGeometry args={[3.5, 0.15, 1.7]} />
          <meshStandardMaterial color="#d49a61" roughness={0.72} />
        </mesh>
        {[-1.5, 1.5].map((x) => (
          <mesh key={x} position={[x, -1.4, 0]} castShadow>
            <boxGeometry args={[0.16, 1.05, 1.45]} />
            <meshStandardMaterial color="#f6e5cf" roughness={0.8} />
          </mesh>
        ))}
        <group position={[0, 0.35, -0.25]}>
          <mesh castShadow receiveShadow>
            <RoundedBox args={[2.45, 1.6, 0.15]} radius={0.08} smoothness={4}>
              <meshStandardMaterial color="#e8d8c8" roughness={0.46} metalness={0.1} />
            </RoundedBox>
          </mesh>
          <mesh position={[0, 0, 0.09]}>
            <planeGeometry args={[2.22, 1.38]} />
            <meshBasicMaterial color="#2c3a52" />
          </mesh>
          <Text position={[0, 0.34, 0.11]} fontSize={0.18} color="#fff4e6" anchorX="center" anchorY="middle" maxWidth={2.05}>
            {activeProject.title}
          </Text>
          <Text position={[0, 0.04, 0.11]} fontSize={0.08} color="#cbd8e9" anchorX="center" anchorY="middle" maxWidth={2.1}>
            {activeProject.type}
          </Text>
          <mesh position={[0, -0.22, 0.11]}>
            <boxGeometry args={[0.7, 0.04, 0.02]} />
            <meshBasicMaterial color={activeProject.color} />
          </mesh>
        </group>
        <mesh position={[0, -0.5, -0.25]} castShadow>
          <boxGeometry args={[0.16, 0.6, 0.15]} />
          <meshStandardMaterial color="#d7b58e" roughness={0.5} />
        </mesh>
        <mesh position={[0, -0.78, -0.2]} castShadow>
          <boxGeometry args={[0.9, 0.1, 0.55]} />
          <meshStandardMaterial color="#d7b58e" roughness={0.5} />
        </mesh>
        <mesh position={[-0.1, -0.73, 0.35]} castShadow>
          <boxGeometry args={[1.05, 0.05, 0.32]} />
          <meshStandardMaterial color="#f7f1e9" roughness={0.5} />
        </mesh>
        {Array.from({ length: 3 }, (_, row) =>
          Array.from({ length: 10 }, (_, column) => (
            <mesh key={`key-${row}-${column}`} position={[-0.52 + column * 0.085, -0.7, 0.24 + row * 0.085]} castShadow>
              <boxGeometry args={[0.06, 0.016, 0.05]} />
              <meshStandardMaterial color={(row === 0 && column === 0) || (row === 2 && column === 9) ? '#e8a16e' : '#d8c9b8'} roughness={0.58} />
            </mesh>
          ))
        )}
        <mesh position={[0.62, -0.72, 0.35]} rotation={[0.08, 0, 0]} castShadow>
          <capsuleGeometry args={[0.07, 0.12, 4, 8]} />
          <meshStandardMaterial color="#f7f1e9" roughness={0.42} />
        </mesh>
        <group position={[-1.45, -0.55, -0.45]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.04, 0.06, 0.7, 10]} />
            <meshStandardMaterial color="#6d5a4b" roughness={0.6} />
          </mesh>
          <mesh position={[0.15, 0.26, 0]} rotation={[0, 0, -0.7]} castShadow>
            <coneGeometry args={[0.13, 0.24, 14]} />
            <meshStandardMaterial color="#f2c078" emissive="#ffcf8a" emissiveIntensity={0.35} roughness={0.5} />
          </mesh>
        </group>
        <group position={[1.35, -0.6, -0.5]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.15, 0.18, 0.27, 12]} />
            <meshStandardMaterial color="#d88c7e" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.25, 0]} scale={[0.22, 0.27, 0.13]}>
            <sphereGeometry args={[1, 12, 10]} />
            <meshStandardMaterial color="#72a981" roughness={0.9} />
          </mesh>
        </group>
        <group position={[0.15, -1.15, 1.35]}>
          <mesh castShadow receiveShadow position={[0, 0.35, 0]}>
            <boxGeometry args={[1.05, 0.12, 0.95]} />
            <meshStandardMaterial color="#c6a2d6" roughness={0.76} />
          </mesh>
          <mesh position={[0, -0.15, 0]} castShadow>
            <boxGeometry args={[0.14, 0.7, 0.14]} />
            <meshStandardMaterial color="#8a6f9c" roughness={0.6} />
          </mesh>
        </group>
      </group>
      <group position={[2.55, 0, -1.1]} scale={[reveal, reveal, reveal]}>
        <mesh castShadow receiveShadow position={[0, -0.55, 0]}>
          <cylinderGeometry args={[1.05, 1.15, 0.12, 20]} />
          <meshStandardMaterial color="#c98d54" roughness={0.78} />
        </mesh>
        <mesh position={[0, -1.05, 0]} castShadow>
          <cylinderGeometry args={[0.16, 0.22, 1, 12]} />
          <meshStandardMaterial color="#8a6f9c" roughness={0.6} />
        </mesh>
        {[
          [-0.45, 0.15, -0.15, '#fff8ef'], [0.15, 0.18, 0.1, '#f2d4b3'], [0.45, 0.12, -0.2, '#e9b0c7']
        ].map(([x, y, z, color], index) => (
          <mesh key={index} position={[x, y, z]} rotation={[0, index * 0.5, 0]} castShadow>
            <boxGeometry args={[0.42, 0.03, 0.3]} />
            <meshStandardMaterial color={color} roughness={0.75} />
          </mesh>
        ))}
        <Text position={[0, 0.32, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.12} color="#6d4526" anchorX="center" anchorY="middle">
          NOTES & IDEAS
        </Text>
      </group>
      <hemisphereLight args={['#fff6e9', '#a06f47', 1.05]} />
      <directionalLight castShadow position={[-4, 7, 6]} intensity={2} color="#fff0d8" shadow-mapSize-width={1024} shadow-mapSize-height={1024} shadow-camera-near={0.5} shadow-camera-far={22} shadow-bias={-0.00015} />
      <pointLight position={[-2, 2, -2]} intensity={5} distance={9} color="#ffd9a8" />
      <pointLight position={[2.5, 1.8, -2.5]} intensity={3} distance={8} color="#cbbcff" />
    </group>
  );
}

function RoomScene({ progress, activeProject }) {
  return (
    <Canvas className="scroll-room-canvas" camera={{ position: [7.5, 4.2, 9.5], fov: 42 }} dpr={[1, 1.25]} shadows gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}>
      <mesh position={[0, 0, -18]}>
        <planeGeometry args={[240, 240]} />
        <shaderMaterial
          vertexShader={`varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`}
          fragmentShader={`varying vec2 vUv; void main() { vec3 top = vec3(0.98, 0.64, 0.31); vec3 bottom = vec3(1.0, 0.84, 0.55); float blend = smoothstep(0.0, 1.0, vUv.y); gl_FragColor = vec4(mix(bottom, top, blend), 1.0); }`}
          depthWrite={false}
        />
      </mesh>
      <fog attach="fog" args={['#f8b15f', 20, 38]} />
      <ambientLight intensity={0.45} />
      <ContactShadows position={[0, -2.32, 0]} opacity={0.3} scale={11} blur={2.6} far={5} resolution={256} color="#5f3f26" />
      <BoxRoom progress={progress} activeProject={activeProject} />
      <CameraTour progress={progress} />
    </Canvas>
  );
}

export default function ScrollRoomPortfolio() {
  const [progress, setProgress] = useState(0);
  const [projectIndex, setProjectIndex] = useState(0);
  const [ready, setReady] = useState(false);
  const activeProject = projects[projectIndex];
  const welcomeVisible = progress < 0.1;
  const revealVisible = progress >= 0.3 && progress < 0.48;
  const displayVisible = progress >= 0.52 && progress < 0.68;
  const computerVisible = progress >= 0.68 && progress < 0.84;
  const notesVisible = progress >= 0.84;
  useEffect(() => {
    let frame = 0;
    const update = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setProgress(max ? window.scrollY / max : 0);
        setReady(true);
      });
    };
    update(); window.addEventListener('scroll', update, { passive: true }); window.addEventListener('resize', update);
    return () => { if (frame) window.cancelAnimationFrame(frame); window.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, []);
  return <div className="scroll-room-page">
    <div className="scroll-room-stage"><RoomScene progress={progress} activeProject={activeProject} /></div>
    <AnimatePresence>
      {welcomeVisible && <motion.section key="welcome" className="scroll-room-intro scroll-room-overlay" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }} transition={{ duration: 0.45 }}>
        <div className="scroll-room-kicker"><Sparkle size={14} weight="fill" /> CREATIVE DEVELOPER · INTERACTIVE PORTFOLIO</div>
        <h1>Hi, I’m Jazz.<br /><em>Open the box.</em></h1>
        <p>A small room of software, experiments, and interactive work.</p>
        <div className="scroll-room-scroll-hint"><Mouse size={17} /> Keep scrolling <ArrowRight size={16} /></div>
      </motion.section>}
    </AnimatePresence>
    <AnimatePresence>
      {revealVisible && <motion.section key="reveal" className="scroll-room-context scroll-room-context-left" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} transition={{ duration: 0.32 }}>
        <div className="scroll-room-context-card">
          <div className="scroll-room-kicker">THE ROOM</div>
          <h2>A miniature world of builds.</h2>
          <p>Each wall holds a different part of the work: tools, projects, and ideas.</p>
        </div>
      </motion.section>}
    </AnimatePresence>
    <AnimatePresence>
      {displayVisible && <motion.section key="display" className="scroll-room-context scroll-room-context-left" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} transition={{ duration: 0.32 }}>
        <div className="scroll-room-context-card">
          <div className="scroll-room-kicker">01 / SKILLS</div>
          <h2>Tools on the shelves.</h2>
          <div className="scroll-room-skill-list">{skills.map((skill) => <span key={skill}>{skill}</span>)}</div>
        </div>
      </motion.section>}
    </AnimatePresence>
    <AnimatePresence>
      {computerVisible && <motion.section key="computer" className="scroll-room-context scroll-room-context-right" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} transition={{ duration: 0.32 }}>
        <div className="scroll-room-context-card">
          <div className="scroll-room-kicker">02 / PROJECTS</div>
          <h2>{activeProject.title}</h2>
          <div className="scroll-room-project-type">{activeProject.type}</div>
          <p>{activeProject.description}</p>
          <div className="scroll-room-project-stack">{activeProject.stack}</div>
          <div className="scroll-room-project-actions">
            <Link href={activeProject.href}>Case study <ArrowUpRight size={15} /></Link>
            {activeProject.github && <a href={activeProject.github} target="_blank" rel="noreferrer"><GithubLogo size={16} /> GitHub</a>}
            {activeProject.live && <a href={activeProject.live} target="_blank" rel="noreferrer">Live <ArrowUpRight size={15} /></a>}
          </div>
          <div className="scroll-room-project-nav">
            <button type="button" onClick={() => setProjectIndex((current) => (current - 1 + projects.length) % projects.length)} aria-label="Previous project"><ArrowLeft size={20} /></button>
            <button type="button" onClick={() => setProjectIndex((current) => (current + 1) % projects.length)} aria-label="Next project"><ArrowRight size={20} /></button>
          </div>
        </div>
      </motion.section>}
    </AnimatePresence>
    <AnimatePresence>
      {notesVisible && <motion.section key="notes" className="scroll-room-context scroll-room-context-center" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} transition={{ duration: 0.32 }}>
        <div className="scroll-room-context-card">
          <div className="scroll-room-kicker">03 / CONTACT</div>
          <h2>Let’s build the next room.</h2>
          <div className="scroll-room-contact-links">
            <a href="mailto:jaz.sajonia@gmail.com"><Envelope size={18} /> Email</a>
            <a href="https://github.com/jazsajonia-pixel" target="_blank" rel="noreferrer"><GithubLogo size={18} /> GitHub</a>
            <a href="https://www.linkedin.com" target="_blank" rel="noreferrer"><LinkedinLogo size={18} /> LinkedIn</a>
          </div>
          <Link href="/projects" className="scroll-room-archive-link">Open the complete archive <ArrowUpRight size={16} /></Link>
        </div>
      </motion.section>}
    </AnimatePresence>
    {!ready && <div className="scroll-room-loading">Opening the room…</div>}
  </div>;
}
