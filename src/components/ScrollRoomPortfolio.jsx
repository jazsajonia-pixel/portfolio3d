'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, RoundedBox, Text } from '@react-three/drei';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Envelope, GithubLogo, LinkedinLogo, Mouse, Sparkle } from 'phosphor-react';
import * as THREE from 'three';

const projects = [
  { title: 'Retext', type: 'Android image editor', stack: 'Flutter · OCR · pixel-safe repair', description: 'Change text inside images while preserving untouched pixels.', color: '#ff8b55', href: '/projects#retext', github: 'https://github.com/jazsajonia-pixel/retext', preview: '/projects/retext-demo.gif' },
  { title: 'Chrono', type: 'AI coding workspace', stack: 'React · TypeScript · GitHub', description: 'Connect GitHub, review changes, and preview an app with an AI coding assistant.', color: '#9b8cff', href: '/projects#chrono', github: 'https://github.com/jazsajonia-pixel/mobdevai', live: 'https://chrono-tau.vercel.app/', preview: '/projects/mobdevai-demo.gif' },
  { title: 'Petalbound', type: 'Pixel-art adventure', stack: 'Godot 4 · GDScript · Android', description: 'An offline action adventure with quests, guardian fights, crafting, and touch controls.', color: '#6fe0b1', href: '/projects#petalbound', github: 'https://github.com/jazsajonia-pixel/petalbound-godot', preview: '/projects/petalbound-demo.gif' },
  { title: 'FlowPilot AI', type: 'Workflow automation', stack: 'React · AI providers · graph editor', description: 'A visual builder for triggers, AI steps, conditions, and actions.', color: '#69c8ff', href: '/projects#flowpilot', github: 'https://github.com/jazsajonia-pixel/flowpilot', live: 'https://flowpilot-sage-delta.vercel.app/', preview: '/projects/flowpilot-demo.gif' },
  { title: 'MarketHub', type: 'Marketplace platform', stack: 'React · Prisma · PostgreSQL', description: 'Buyer, seller, and admin flows in a marketplace prototype.', color: '#ffca62', href: '/projects#markethub', github: 'https://github.com/jazsajonia-pixel/markethub', live: 'https://markethub-pi.vercel.app/', preview: '/projects/markethub-demo.gif' },
];

const skills = ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Next.js', 'Three.js', 'Node.js', 'Vite', 'Flutter', 'Kotlin', 'Godot 4', 'Git', 'GitHub'];
const scenes = [
  { label: 'INTRO', title: 'A small world of things I built.', body: 'Scroll to move through the room. Each stop turns a real project into a physical object.', accent: '#ff8b55' },
  { label: 'SKILLS', title: 'The tools behind the builds.', body: 'The stack is a workbench: web, mobile, AI-assisted tooling, and games, learned one project at a time.', accent: '#6dbdff' },
  { label: 'PROJECTS', title: 'The work is on the screen.', body: 'The monitor is the project archive. Use the arrows to move through selected builds.', accent: '#b89cff' },
  { label: 'CONTACT', title: 'Let’s make the next room.', body: 'Find me through the shelf links or open the complete project archive.', accent: '#83e2b3' },
];

function CameraPath({ progress }) {
  const { camera } = useThree();
  const current = useRef(new THREE.Vector3(0, 1.2, 10));
  const look = useRef(new THREE.Vector3(0, 1, 0));
  const targets = useMemo(() => [
    { position: new THREE.Vector3(0, 1.5, 11), look: new THREE.Vector3(0, 1, 0) },
    { position: new THREE.Vector3(-3.4, 2.2, 7.2), look: new THREE.Vector3(-1.6, 1.3, -1.2) },
    { position: new THREE.Vector3(3.4, 1.7, 5.5), look: new THREE.Vector3(1.2, 1.2, -1.1) },
    { position: new THREE.Vector3(0, 3.4, 6.1), look: new THREE.Vector3(0, 2.5, -1.4) },
  ], []);
  useFrame((_, delta) => {
    const scaled = Math.min(progress, 0.999) * (targets.length - 1);
    const index = Math.floor(scaled);
    const next = Math.min(index + 1, targets.length - 1);
    const blend = scaled - index;
    const destination = targets[index].position.clone().lerp(targets[next].position, blend);
    const destinationLook = targets[index].look.clone().lerp(targets[next].look, blend);
    current.current.lerp(destination, 1 - Math.pow(0.0008, delta));
    look.current.lerp(destinationLook, 1 - Math.pow(0.0008, delta));
    camera.position.copy(current.current);
    camera.lookAt(look.current);
  });
  return null;
}

function RoomShell() {
  return (
    <>
      <mesh position={[0, -2.45, -1.4]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[17, 14]} /><meshStandardMaterial color="#0a1022" roughness={0.9} metalness={0.18} /></mesh>
      <mesh position={[0, 3.2, -3.6]}><boxGeometry args={[17, 11, 0.25]} /><meshStandardMaterial color="#111a34" roughness={0.82} metalness={0.12} /></mesh>
      <mesh position={[-7.5, 0.4, -1.2]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[13, 11]} /><meshStandardMaterial color="#0d1831" roughness={1} /></mesh>
      <mesh position={[7.5, 0.4, -1.2]} rotation={[0, -Math.PI / 2, 0]}><planeGeometry args={[13, 11]} /><meshStandardMaterial color="#15152f" roughness={1} /></mesh>
      <gridHelper args={[16, 32, '#36c8f0', '#26365f']} position={[0, -2.42, -1.4]} />
      <pointLight position={[-3, 5, 1]} intensity={13} distance={15} color="#46d9ff" />
      <pointLight position={[4, 2, -2]} intensity={11} distance={12} color="#8a69ff" />
    </>
  );
}

function IntroCube({ progress }) {
  const ref = useRef();
  useFrame((_, delta) => { if (ref.current) { ref.current.rotation.x += delta * 0.25; ref.current.rotation.y += delta * 0.5; ref.current.scale.lerp(new THREE.Vector3(Math.max(0.01, 1 - progress * 5), Math.max(0.01, 1 - progress * 5), Math.max(0.01, 1 - progress * 5)), 0.08); } });
  return <group ref={ref} position={[0, 0.55, -1.8]}><RoundedBox args={[2.2, 2.2, 2.2]} radius={0.18} smoothness={4}><meshStandardMaterial color="#7a5cff" emissive="#563dff" emissiveIntensity={0.85} roughness={0.2} metalness={0.45} /></RoundedBox><Text position={[0, 0, 1.13]} fontSize={0.36} color="#ecfbff" anchorX="center" anchorY="middle">JS</Text></group>;
}

function DeskAndSkills({ progress }) {
  const reveal = Math.min(1, Math.max(0, (progress - 0.12) * 5));
  return <group position={[-1.7, 0, -1.4]} scale={[reveal, reveal, reveal]}>
    <mesh position={[0, -1.1, 0]}><boxGeometry args={[4.4, 0.3, 2]} /><meshStandardMaterial color="#ad5a39" roughness={0.65} /></mesh>
    <mesh position={[-1.5, -0.35, 0]}><boxGeometry args={[0.25, 1.5, 1.55]} /><meshStandardMaterial color="#ba6740" /></mesh>
    <mesh position={[1.5, -0.35, 0]}><boxGeometry args={[0.25, 1.5, 1.55]} /><meshStandardMaterial color="#ba6740" /></mesh>
    <Float speed={1} rotationIntensity={0.08} floatIntensity={0.12}><group position={[-0.1, -0.72, 0.03]} rotation={[-0.1, 0.14, 0]}><boxGeometry args={[1.85, 0.14, 1.25]} /><meshStandardMaterial color="#17294f" emissive="#087da8" emissiveIntensity={0.25} /><Text position={[0, 0.1, 0.65]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.22} color="#eef7ff" anchorX="center" anchorY="middle">MY SKILLS</Text></group></Float>
    <Text position={[0, 0.5, 0]} fontSize={0.23} color="#2a3b70" anchorX="center" anchorY="middle" rotation={[0, 0.05, 0]}>WORKBENCH</Text>
  </group>;
}

function Monitor({ progress, activeProject }) {
  const reveal = Math.min(1, Math.max(0, (progress - 0.38) * 5));
  return <group position={[2, 0.15, -1.5]} scale={[reveal, reveal, reveal]}>
    <mesh position={[0, -0.7, 0]}><boxGeometry args={[0.22, 1.4, 0.22]} /><meshStandardMaterial color="#40547e" emissive="#1f9bbd" emissiveIntensity={0.12} /></mesh>
    <mesh position={[0, -1.45, 0]}><boxGeometry args={[2.7, 0.18, 1.05]} /><meshStandardMaterial color="#dbe5ec" /></mesh>
    <mesh position={[0, 0.65, 0]}><boxGeometry args={[4.2, 2.6, 0.28]} /><meshStandardMaterial color="#182344" roughness={0.3} metalness={0.35} /></mesh>
    <mesh position={[0, 0.65, 0.18]}><planeGeometry args={[3.72, 2.12]} /><meshBasicMaterial color="#0d1730" /></mesh>
    <Text position={[0, 0.95, 0.34]} fontSize={0.3} color="#f3f7ff" anchorX="center" anchorY="middle">{activeProject.title}</Text>
    <Text position={[0, 0.5, 0.34]} fontSize={0.12} color="#8bdcf6" anchorX="center" anchorY="middle">{activeProject.type}</Text>
    <Text position={[0, 0.1, 0.34]} fontSize={0.09} color="#aab8d9" anchorX="center" anchorY="middle">SELECT A PROJECT BELOW</Text>
    <mesh position={[0.7, -1.44, 0.36]}><boxGeometry args={[0.75, 0.04, 0.32]} /><meshStandardMaterial color="#8d5af0" emissive="#8d5af0" emissiveIntensity={0.8} /></mesh>
  </group>;
}

function ContactShelf({ progress }) {
  const reveal = Math.min(1, Math.max(0, (progress - 0.68) * 4));
  return <group position={[0, 2.05, -1.8]} scale={[reveal, reveal, reveal]}>
    <mesh position={[0, 0, 0]}><boxGeometry args={[6.5, 0.18, 1.05]} /><meshStandardMaterial color="#1b2948" metalness={0.3} roughness={0.55} /></mesh>
    <mesh position={[0, -1.8, 0]}><boxGeometry args={[6.5, 0.18, 1.05]} /><meshStandardMaterial color="#a55b3c" /></mesh>
    <Text position={[-2.45, -0.55, 0.35]} fontSize={0.28} color="#ffffff" anchorX="center" anchorY="middle">ABOUT</Text>
    <Text position={[-0.8, -0.55, 0.35]} fontSize={0.28} color="#ffffff" anchorX="center" anchorY="middle">EMAIL</Text>
    <Text position={[0.85, -0.55, 0.35]} fontSize={0.28} color="#ffffff" anchorX="center" anchorY="middle">GITHUB</Text>
    <Text position={[2.45, -0.55, 0.35]} fontSize={0.28} color="#ffffff" anchorX="center" anchorY="middle">LINKEDIN</Text>
    <mesh position={[-2.45, -1.1, 0.15]}><boxGeometry args={[0.45, 0.45, 0.45]} /><meshStandardMaterial color="#83e2b3" emissive="#83e2b3" emissiveIntensity={0.3} /></mesh>
    <mesh position={[-0.8, -1.1, 0.15]}><boxGeometry args={[0.45, 0.45, 0.45]} /><meshStandardMaterial color="#ff8b55" emissive="#ff8b55" emissiveIntensity={0.3} /></mesh>
    <mesh position={[0.85, -1.1, 0.15]}><boxGeometry args={[0.45, 0.45, 0.45]} /><meshStandardMaterial color="#b89cff" emissive="#b89cff" emissiveIntensity={0.3} /></mesh>
    <mesh position={[2.45, -1.1, 0.15]}><boxGeometry args={[0.45, 0.45, 0.45]} /><meshStandardMaterial color="#69c8ff" emissive="#69c8ff" emissiveIntensity={0.3} /></mesh>
  </group>;
}

function RoomScene({ progress, activeProject }) {
  return <Canvas className="scroll-room-canvas" camera={{ position: [0, 1.5, 11], fov: 44 }} dpr={[1, 1.25]} gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}>
    <color attach="background" args={['#080d1c']} /><fog attach="fog" args={['#080d1c', 8, 19]} />
    <ambientLight intensity={1.15} /><RoomShell /><IntroCube progress={progress} /><DeskAndSkills progress={progress} /><Monitor progress={progress} activeProject={activeProject} /><ContactShelf progress={progress} /><CameraPath progress={progress} />
  </Canvas>;
}

export default function ScrollRoomPortfolio() {
  const [progress, setProgress] = useState(0);
  const [projectIndex, setProjectIndex] = useState(0);
  const [ready, setReady] = useState(false);
  const activeProject = projects[projectIndex];
  const sceneIndex = Math.min(3, Math.floor(progress * 4.01));
  useEffect(() => {
    const update = () => { const max = document.documentElement.scrollHeight - window.innerHeight; setProgress(max ? window.scrollY / max : 0); setReady(true); };
    update(); window.addEventListener('scroll', update, { passive: true }); window.addEventListener('resize', update); return () => { window.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, []);
  return <div className="scroll-room-page">
    <div className="scroll-room-stage"><RoomScene progress={progress} activeProject={activeProject} /></div>
    <header className="scroll-room-header"><Link href="/" className="scroll-room-logo"><span>JS</span><strong>Jazz Sajonia</strong></Link><div className="scroll-room-progress"><span style={{ width: `${progress * 100}%` }} /><small>{scenes[sceneIndex].label}</small></div><a href="mailto:jaz.sajonia@gmail.com" className="scroll-room-contact">Say hello <ArrowUpRight size={15} /></a></header>
    <section className="scroll-room-intro scroll-room-overlay"><div className="scroll-room-kicker"><Sparkle size={14} weight="fill" /> CREATIVE DEVELOPER · INTERACTIVE PORTFOLIO</div><h1>Hi, I’m Jazz.<br /><em>I build digital worlds.</em></h1><p>Software, experiments, and interactive experiences — explore the work behind the screen.</p><div className="scroll-room-scroll-hint"><Mouse size={17} /> Keep scrolling <ArrowRight size={16} /></div></section>
    <section className="scroll-room-copy scroll-room-skills-copy"><div className="scroll-room-kicker">01 / SKILLS</div><h2>Tools on the workbench.</h2><p>The stack I reach for while turning ideas into tested, useful software.</p><div className="scroll-room-skill-list">{skills.map((skill) => <span key={skill}>{skill}</span>)}</div></section>
    <section className="scroll-room-copy scroll-room-project-copy"><div className="scroll-room-kicker">02 / PROJECTS</div><h2>Built, shipped, and still learning.</h2><div className="scroll-room-project-card"><div className="scroll-room-project-top"><span style={{ background: activeProject.color }} /> <small>{String(projectIndex + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}</small></div><h3>{activeProject.title}</h3><div className="scroll-room-project-type">{activeProject.type}</div><p>{activeProject.description}</p><div className="scroll-room-project-stack">{activeProject.stack}</div><div className="scroll-room-project-actions"><Link href={activeProject.href}>View case study <ArrowUpRight size={15} /></Link>{activeProject.github && <a href={activeProject.github} target="_blank" rel="noreferrer"><GithubLogo size={16} /> GitHub</a>}{activeProject.live && <a href={activeProject.live} target="_blank" rel="noreferrer">Live <ArrowUpRight size={15} /></a>}</div></div><div className="scroll-room-project-nav"><button type="button" onClick={() => setProjectIndex((current) => (current - 1 + projects.length) % projects.length)} aria-label="Previous project"><ArrowLeft size={20} /></button><button type="button" onClick={() => setProjectIndex((current) => (current + 1) % projects.length)} aria-label="Next project"><ArrowRight size={20} /></button></div></section>
    <section className="scroll-room-copy scroll-room-contact-copy"><div className="scroll-room-kicker">03 / CONTACT</div><h2>Let’s build a better little world.</h2><p>Want to talk about a project, collaboration, or a useful idea? The shelf is open.</p><div className="scroll-room-contact-links"><a href="mailto:jaz.sajonia@gmail.com"><Envelope size={18} /> Email</a><a href="https://github.com/jazsajonia-pixel" target="_blank" rel="noreferrer"><GithubLogo size={18} /> GitHub</a><a href="https://www.linkedin.com" target="_blank" rel="noreferrer"><LinkedinLogo size={18} /> LinkedIn</a></div><Link href="/projects" className="scroll-room-archive-link">Open the complete archive <ArrowUpRight size={16} /></Link></section>
    {!ready && <div className="scroll-room-loading">Loading the room…</div>}
  </div>;
}
