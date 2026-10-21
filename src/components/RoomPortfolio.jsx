'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, OrbitControls, RoundedBox, Text } from '@react-three/drei';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';
import { ArrowRight, ArrowSquareOut, GithubLogo, Mouse, Sparkle, X } from 'phosphor-react';
import * as THREE from 'three';

const projects = [
  { slug: 'retext', title: 'Retext', type: 'Android image editor', stack: 'Flutter · OCR · pixel-safe repair', description: 'A local-first editor for changing text inside images without rewriting untouched pixels.', color: '#ffb86b', preview: '/projects/retext-demo.gif', github: 'https://github.com/jazsajonia-pixel/retext' },
  { slug: 'petalbound', title: 'Petalbound', type: 'Pixel-art adventure', stack: 'Godot 4 · GDScript · Android', description: 'An offline action adventure with exploration, quests, guardian fights, crafting, and touch controls.', color: '#72e6b2', preview: '/projects/petalbound-demo.gif', github: 'https://github.com/jazsajonia-pixel/petalbound-godot' },
  { slug: 'chrono', title: 'Chrono', type: 'AI coding workspace', stack: 'React · TypeScript · GitHub', description: 'A mobile-first workspace for connecting GitHub, reviewing changes, and previewing an app with an AI coding assistant.', color: '#ff7b9d', preview: '/projects/mobdevai-demo.gif', github: 'https://github.com/jazsajonia-pixel/mobdevai', live: 'https://chrono-tau.vercel.app/' },
  { slug: 'markethub', title: 'MarketHub', type: 'Marketplace platform', stack: 'React · Prisma · PostgreSQL', description: 'A marketplace prototype with buyer, seller, and admin flows. Checkout is simulated.', color: '#66ddff', preview: '/projects/markethub-demo.gif', github: 'https://github.com/jazsajonia-pixel/markethub', live: 'https://markethub-pi.vercel.app/' },
  { slug: 'flowpilot', title: 'FlowPilot AI', type: 'Workflow automation', stack: 'React · AI providers · graph editor', description: 'A visual builder for triggers, AI steps, conditions, actions, and execution history.', color: '#b18cff', preview: '/projects/flowpilot-demo.gif', github: 'https://github.com/jazsajonia-pixel/flowpilot', live: 'https://flowpilot-sage-delta.vercel.app/' },
  { slug: 'chrauto-ai', title: 'Chrauto AI', type: 'Bounded Android agent', stack: 'Kotlin · Compose · Accessibility', description: 'A screen-aware assistant that validates actions and pauses before consequential steps.', color: '#df9bff', preview: '/projects/chrauto-ai-demo.gif', github: 'https://github.com/jazsajonia-pixel/Chrauto-AI' },
  { slug: 'speedsight', title: 'SpeedSight', type: 'Traffic analytics', stack: 'React · TensorFlow.js · computer vision', description: 'Browser-based vehicle detection, tracking, estimated speeds, and session analytics.', color: '#80a9ff', preview: '/projects/speedsight-demo.gif', github: 'https://github.com/jazsajonia-pixel/Project-2-SpeedSight2', live: 'https://project-2-speed-sight2.vercel.app/' },
  { slug: 'igit', title: 'igit', type: 'Mobile Git client', stack: 'Kotlin · Compose · Git', description: 'A local-first Git client for repository browsing, branches, sync, and conflict handling.', color: '#80e1ff', preview: '/projects/igit-demo.gif', github: 'https://github.com/jazsajonia-pixel/igit' },
  { slug: 'sapphire', title: 'Sapphire', type: 'Knowledge graph app', stack: 'Flutter · Markdown · GitHub sync', description: 'A local-first Markdown knowledge base with search, links, graph views, and two-way sync.', color: '#91a1ff', github: 'https://github.com/jazsajonia-pixel/sapphire' },
  { slug: 'taskflow', title: 'TaskFlow', type: 'Team workspace', stack: 'React · Hono · PostgreSQL', description: 'A collaborative workspace with role-based projects, realtime updates, and analytics.', color: '#ff9b58', github: 'https://github.com/jazsajonia-pixel/Project-1-TaskFlow' },
];

const posterPositions = [
  [-4.3, 2.25, -1.8, 0.12], [-1.95, 2.45, -2.15, -0.08], [0.55, 2.15, -2.1, 0.04], [3.1, 2.42, -1.75, -0.12],
  [-3.85, 0.05, -2.3, 0.1], [-1.35, -0.15, -2.35, -0.06], [1.3, -0.04, -2.3, 0.06], [3.8, 0.08, -2.1, -0.1],
  [-2.45, -2.2, -1.75, 0.1], [0.4, -2.18, -1.8, -0.08],
];

function CameraRig({ targetPosition }) {
  const { camera } = useThree();
  const target = useMemo(() => new THREE.Vector3(), []);
  const lookAt = useMemo(() => new THREE.Vector3(0, 0.15, -2), []);
  useFrame((_, delta) => {
    target.set(...targetPosition);
    camera.position.lerp(target, 1 - Math.pow(0.001, delta));
    camera.lookAt(lookAt);
  });
  return null;
}

function Poster({ project, position, active, onSelect }) {
  return (
    <Float speed={active ? 1.8 : 0.9} rotationIntensity={active ? 0.08 : 0.025} floatIntensity={active ? 0.22 : 0.1}>
      <group position={position.slice(0, 3)} rotation={[0, position[3], 0]} onClick={(event) => { event.stopPropagation(); onSelect(project); }}>
        <RoundedBox args={[1.9, 1.22, 0.12]} radius={0.1} smoothness={4}>
          <meshStandardMaterial color={active ? '#172340' : '#0d1730'} emissive={project.color} emissiveIntensity={active ? 0.45 : 0.11} roughness={0.28} metalness={0.5} />
        </RoundedBox>
        <mesh position={[0, 0.34, 0.09]}>
          <planeGeometry args={[1.48, 0.05]} />
          <meshBasicMaterial color={project.color} />
        </mesh>
        <Text position={[-0.72, 0.07, 0.09]} fontSize={0.16} maxWidth={1.45} anchorX="left" anchorY="middle" color="#f8fbff" outlineColor="#091126" outlineWidth={0.015}>
          {project.title}
        </Text>
        <Text position={[-0.72, -0.2, 0.09]} fontSize={0.075} maxWidth={1.45} anchorX="left" anchorY="middle" color="#9bb0d0">
          {project.type}
        </Text>
        <mesh position={[0.68, -0.36, 0.1]}>
          <sphereGeometry args={[0.055, 16, 16]} />
          <meshBasicMaterial color={project.color} />
        </mesh>
      </group>
    </Float>
  );
}

function RoomScene({ activeProject, onSelect }) {
  const selectedIndex = projects.findIndex((project) => project.slug === activeProject.slug);
  const targetPosition = [selectedIndex % 2 === 0 ? 0.2 : -0.2, 0.2, 8.8];
  return (
    <Canvas camera={{ position: [0, 0.2, 8.8], fov: 48 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}>
      <color attach="background" args={['#070b18']} />
      <fog attach="fog" args={['#070b18', 8, 22]} />
      <ambientLight intensity={1.2} />
      <pointLight position={[0, 4, 2]} intensity={14} distance={16} color="#ffb86b" />
      <pointLight position={[-5, 0, 1]} intensity={10} distance={13} color="#6ddcff" />
      <pointLight position={[5, 1, -3]} intensity={11} distance={13} color="#b18cff" />
      <mesh position={[0, -3.05, -2.4]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[18, 16]} />
        <meshStandardMaterial color="#0b1225" roughness={0.82} metalness={0.12} />
      </mesh>
      <gridHelper args={[18, 18, '#23355c', '#111b35']} position={[0, -3.02, -2.4]} />
      <mesh position={[0, 2.6, -3.25]}>
        <boxGeometry args={[18, 12, 0.18]} />
        <meshStandardMaterial color="#0a1226" roughness={0.7} metalness={0.15} />
      </mesh>
      <mesh position={[-7.8, 0, -1]} rotation={[0, Math.PI / 2.1, 0]}>
        <planeGeometry args={[14, 12]} />
        <meshStandardMaterial color="#080f20" roughness={0.9} />
      </mesh>
      <mesh position={[7.8, 0, -1]} rotation={[0, -Math.PI / 2.1, 0]}>
        <planeGeometry args={[14, 12]} />
        <meshStandardMaterial color="#080f20" roughness={0.9} />
      </mesh>
      <Float speed={0.7} rotationIntensity={0.1} floatIntensity={0.3}>
        <mesh position={[0, 0.3, -2.55]} rotation={[0.2, 0.25, 0]}>
          <icosahedronGeometry args={[1.1, 2]} />
          <meshStandardMaterial color="#111d45" emissive="#3b5cc4" emissiveIntensity={0.6} roughness={0.18} metalness={0.6} wireframe />
        </mesh>
        <Text position={[0, 0.2, -1.35]} fontSize={0.45} anchorX="center" anchorY="middle" color="#ffffff" outlineColor="#071022" outlineWidth={0.02}>JS</Text>
      </Float>
      {projects.map((project, index) => <Poster key={project.slug} project={project} position={posterPositions[index]} active={project.slug === activeProject.slug} onSelect={onSelect} />)}
      <CameraRig targetPosition={targetPosition} />
      <OrbitControls enablePan={false} enableZoom={false} enableDamping dampingFactor={0.08} rotateSpeed={0.4} minPolarAngle={Math.PI / 2.45} maxPolarAngle={Math.PI / 1.7} target={[0, 0.2, -2]} />
    </Canvas>
  );
}

export default function RoomPortfolio() {
  const [activeProject, setActiveProject] = useState(projects[0]);
  const [showArchive, setShowArchive] = useState(false);
  return (
    <main className="room-portfolio">
      <header className="room-header">
        <Link href="/" className="room-brand"><span className="room-brand-mark">JS</span><span><strong>Jazz Sajonia</strong><small>interactive project room</small></span></Link>
        <nav aria-label="Primary navigation"><a href="#room">Room</a><button type="button" onClick={() => setShowArchive(true)}>Archive</button><a href="mailto:jaz.sajonia@gmail.com">Contact</a></nav>
      </header>
      <section className="room-stage" id="room" aria-label="Interactive 3D project room">
        <div className="room-copy">
          <div className="room-kicker"><Sparkle size={14} weight="fill" /> BUILDING IN PUBLIC, ONE PROJECT AT A TIME</div>
          <h1>A portfolio you can <em>walk through.</em></h1>
          <p>Drag the room, tap a project poster, and follow the work from idea to tested build.</p>
          <div className="room-hint"><Mouse size={16} /> Drag to look around · Tap a poster to inspect</div>
        </div>
        <div className="room-canvas"><RoomScene activeProject={activeProject} onSelect={setActiveProject} /></div>
        <div className="room-project-card" aria-live="polite">
          <div className="room-project-index" style={{ color: activeProject.color }}>PROJECT {String(projects.findIndex((project) => project.slug === activeProject.slug) + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}</div>
          <h2>{activeProject.title}</h2><div className="room-project-type">{activeProject.type}</div><p>{activeProject.description}</p>
          <div className="room-project-stack">{activeProject.stack}</div>
          <div className="room-project-actions"><a className="room-primary-action" href={`/projects#${activeProject.slug}`}>Case study <ArrowRight size={15} /></a>{activeProject.github && <a className="room-secondary-action" href={activeProject.github} target="_blank" rel="noreferrer"><GithubLogo size={16} /> GitHub</a>}{activeProject.live && <a className="room-secondary-action" href={activeProject.live} target="_blank" rel="noreferrer"><ArrowSquareOut size={16} /> Live</a>}</div>
        </div>
      </section>
      <section className="room-bottom-bar"><span>10 projects in the room</span><span>React · Three.js · Next.js · Android · Godot</span><button type="button" onClick={() => setShowArchive(true)}>Open complete archive <ArrowRight size={15} /></button></section>
      <AnimatePresence>
        {showArchive && <motion.div className="archive-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><motion.div className="archive-panel" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}><button className="archive-close" type="button" onClick={() => setShowArchive(false)} aria-label="Close project archive"><X size={22} /></button><div className="room-kicker"><Sparkle size={14} weight="fill" /> COMPLETE ARCHIVE</div><h2>Choose a project poster.</h2><div className="archive-grid">{projects.map((project) => <button key={project.slug} type="button" onClick={() => { setActiveProject(project); setShowArchive(false); }}><span style={{ backgroundColor: project.color }} /><strong>{project.title}</strong><small>{project.type}</small></button>)}</div></motion.div></motion.div>}
      </AnimatePresence>
    </main>
  );
}
