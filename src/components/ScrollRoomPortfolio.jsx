'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, RoundedBox, Text } from '@react-three/drei';
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
  const current = useRef(new THREE.Vector3(8.2, 3.4, 10.2));
  const look = useRef(new THREE.Vector3(0, 0.1, -1.6));
  const reducedMotion = useRef(false);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => { reducedMotion.current = media.matches; };
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  const targets = useMemo(() => [
    { position: new THREE.Vector3(8.2, 3.4, 10.2), look: new THREE.Vector3(0, 0.1, -1.6) },
    { position: new THREE.Vector3(-0.6, 0.2, 0.6), look: new THREE.Vector3(-1.9, -0.5, -3.6) },
    { position: new THREE.Vector3(0.8, 0.7, -0.2), look: new THREE.Vector3(-1.8, 0.35, -4.6) },
    { position: new THREE.Vector3(3.4, 2.0, 0.4), look: new THREE.Vector3(3.1, 1.5, -5.8) },
  ], []);
  useFrame((_, delta) => {
    const scaled = Math.min(progress, 0.999) * (targets.length - 1);
    const index = Math.floor(scaled);
    const next = Math.min(index + 1, targets.length - 1);
    const blend = scaled - index;
    const destination = targets[index].position.clone().lerp(targets[next].position, blend);
    const destinationLook = targets[index].look.clone().lerp(targets[next].look, blend);
    if (reducedMotion.current) {
      current.current.copy(destination);
      look.current.copy(destinationLook);
    } else {
      current.current.lerp(destination, 1 - Math.pow(0.0008, delta));
      look.current.lerp(destinationLook, 1 - Math.pow(0.0008, delta));
    }
    camera.position.copy(current.current);
    camera.lookAt(look.current);
  });
  return null;
}

function RoomShell() {
  const boards = Array.from({ length: 16 }, (_, index) => -5.85 + index * 0.78);
  return (
    <>
      <mesh position={[0, -3.08, -1.5]}>
        <boxGeometry args={[13.4, 0.55, 10.6]} />
        <meshStandardMaterial color="#8b5a2b" roughness={0.86} />
      </mesh>
      <mesh position={[0, -2.63, -1.5]}>
        <boxGeometry args={[12.8, 0.36, 10]} />
        <meshStandardMaterial color="#c98d54" roughness={0.82} />
      </mesh>
      <mesh receiveShadow position={[0, -2.42, -1.5]}>
        <boxGeometry args={[12.5, 0.09, 9.7]} />
        <meshStandardMaterial color="#e7bd85" roughness={0.78} />
      </mesh>
      {boards.map((x, index) => (
        <mesh key={index} receiveShadow position={[x, -2.365, -1.5]}>
          <boxGeometry args={[0.72, 0.025, 9.5]} />
          <meshStandardMaterial color={index % 2 ? '#d9a468' : '#c89157'} roughness={0.86} />
        </mesh>
      ))}
      <mesh position={[0, 0.7, -6.35]}>
        <boxGeometry args={[12.5, 6.2, 0.3]} />
        <meshStandardMaterial color="#fff1de" roughness={0.96} />
      </mesh>
      <mesh receiveShadow position={[-6.25, 0.7, -1.5]}>
        <boxGeometry args={[0.3, 6.2, 9.7]} />
        <meshStandardMaterial color="#f7e6cf" roughness={0.95} />
      </mesh>
      <mesh position={[6.25, 0.7, -1.5]}>
        <boxGeometry args={[0.3, 6.2, 9.7]} />
        <meshStandardMaterial color="#faebd7" roughness={0.95} />
      </mesh>
      <mesh position={[0, 3.78, -6.32]}>
        <boxGeometry args={[12.9, 0.36, 0.5]} />
        <meshStandardMaterial color="#a76f3d" roughness={0.76} />
      </mesh>
      {[-6.22, 6.22].map((x) => (
        <mesh key={`side-rail-${x}`} position={[x, 3.78, -1.5]}>
          <boxGeometry args={[0.44, 0.36, 10.1]} />
          <meshStandardMaterial color="#b57c46" roughness={0.76} />
        </mesh>
      ))}
      {[-6.25, 6.25].map((x) => (
        <mesh key={`front-post-${x}`} position={[x, 0.7, 3.32]}>
          <boxGeometry args={[0.38, 6.3, 0.38]} />
          <meshStandardMaterial color="#a76f3d" roughness={0.74} />
        </mesh>
      ))}
      <mesh position={[0, 3.78, 3.32]}>
        <boxGeometry args={[12.55, 0.34, 0.38]} />
        <meshStandardMaterial color="#b57c46" roughness={0.74} />
      </mesh>
      <mesh position={[0, -2.24, -6.16]}>
        <boxGeometry args={[12.5, 0.26, 0.16]} />
        <meshStandardMaterial color="#a76f3d" roughness={0.8} />
      </mesh>
      <group position={[-3.8, 1.35, -6.14]}>
        <mesh>
          <boxGeometry args={[1.9, 2.5, 0.16]} />
          <meshStandardMaterial color="#a76f3d" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0, 0.1]}>
          <boxGeometry args={[1.62, 2.22, 0.05]} />
          <meshStandardMaterial color="#cfe8f4" emissive="#9dcde5" emissiveIntensity={0.22} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0, 0.14]}>
          <boxGeometry args={[0.08, 2.22, 0.05]} />
          <meshStandardMaterial color="#fff1de" />
        </mesh>
        <mesh position={[0, 0, 0.14]}>
          <boxGeometry args={[1.62, 0.08, 0.05]} />
          <meshStandardMaterial color="#fff1de" />
        </mesh>
      </group>
      <group position={[0.35, 2.35, -6.12]}>
        <RoundedBox args={[3.1, 0.74, 0.14]} radius={0.08} smoothness={3}>
          <meshStandardMaterial color="#fff8ef" roughness={0.55} />
        </RoundedBox>
        <Text position={[0, 0.04, 0.09]} fontSize={0.3} color="#8a5a33" anchorX="center" anchorY="middle" letterSpacing={0.04}>
          JAZZ SAJONIA
        </Text>
        <Text position={[0, -0.22, 0.09]} fontSize={0.1} color="#a1795c" anchorX="center" anchorY="middle" letterSpacing={0.14}>
          CREATIVE STUDIO
        </Text>
      </group>
      <group position={[4.1, 1.65, -6.05]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[3.4, 0.13, 0.55]} />
          <meshStandardMaterial color="#c58b55" roughness={0.75} />
        </mesh>
        <mesh position={[0, -1.15, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.4, 0.13, 0.55]} />
          <meshStandardMaterial color="#c58b55" roughness={0.75} />
        </mesh>
        {[
          [-1.25, 0.42, '#c6a2d6'], [-1.0, 0.36, '#f0c8a5'], [-0.75, 0.45, '#94b9a0'],
          [0.35, -0.8, '#e9b0c7'], [0.6, -0.76, '#c6a2d6'], [0.85, -0.81, '#d7ad75']
        ].map(([x, y, color], index) => (
          <mesh key={index} position={[x, y, 0.03]} rotation={[0, 0, index % 2 ? 0.04 : -0.03]} castShadow>
            <boxGeometry args={[0.18, 0.55, 0.26]} />
            <meshStandardMaterial color={color} roughness={0.82} />
          </mesh>
        ))}
        <mesh position={[1.35, 0.42, 0.03]} castShadow>
          <cylinderGeometry args={[0.16, 0.2, 0.28, 12]} />
          <meshStandardMaterial color="#f0c8a5" roughness={0.82} />
        </mesh>
        <mesh position={[1.35, 0.68, 0.03]} scale={[0.22, 0.28, 0.13]}>
          <sphereGeometry args={[1, 12, 10]} />
          <meshStandardMaterial color="#75a985" roughness={0.9} />
        </mesh>
        <Text position={[0, -0.5, 0.3]} fontSize={0.15} color="#6d4526" anchorX="center" anchorY="middle" letterSpacing={0.08}>
          MAKE · LEARN · BUILD
        </Text>
      </group>
      <hemisphereLight args={['#fff6e9', '#a06f47', 1.1]} />
      <directionalLight castShadow position={[-5, 8, 6]} intensity={2.1} color="#fff0d8" shadow-mapSize-width={1024} shadow-mapSize-height={1024} shadow-camera-near={0.5} shadow-camera-far={24} shadow-bias={-0.00015} />
      <pointLight position={[-2.5, 2.4, -2.2]} intensity={6} distance={10} color="#ffd9a8" />
      <pointLight position={[4, 2.2, -3]} intensity={3.4} distance={8} color="#cbbcff" />
    </>
  );
}

function Workstation({ activeProject }) {
  return (
    <group position={[-1.8, 0, -3.3]}>
      <mesh castShadow receiveShadow position={[0, -1.25, 0]}>
        <boxGeometry args={[4.4, 0.18, 2]} />
        <meshStandardMaterial color="#d49a61" roughness={0.72} />
      </mesh>
      {[-1.9, 1.9].map((x) => (
        <mesh key={x} position={[x, -1.85, 0]} castShadow>
          <boxGeometry args={[0.18, 1.2, 1.7]} />
          <meshStandardMaterial color="#f6e5cf" roughness={0.8} />
        </mesh>
      ))}
      {[-0.75, 0.75].map((x) => (
        <group key={x} position={[x, -1.45, 0.86]}>
          <RoundedBox args={[0.9, 0.34, 0.08]} radius={0.035} smoothness={3} castShadow>
            <meshStandardMaterial color="#bd804b" roughness={0.76} />
          </RoundedBox>
          <mesh position={[0, 0.02, 0.05]}>
            <boxGeometry args={[0.2, 0.035, 0.025]} />
            <meshStandardMaterial color="#e8c69d" metalness={0.25} roughness={0.4} />
          </mesh>
        </group>
      ))}
      <group position={[0, 0.42, -0.35]}>
        <mesh castShadow receiveShadow>
          <RoundedBox args={[3.05, 1.95, 0.17]} radius={0.09} smoothness={4}>
            <meshStandardMaterial color="#e8d8c8" roughness={0.46} metalness={0.1} />
          </RoundedBox>
        </mesh>
        <mesh position={[0, 0, 0.1]}>
          <planeGeometry args={[2.78, 1.68]} />
          <meshBasicMaterial color="#2c3a52" />
        </mesh>
        <Text position={[0, 0.42, 0.12]} fontSize={0.22} color="#fff4e6" anchorX="center" anchorY="middle" maxWidth={2.5}>
          {activeProject.title}
        </Text>
        <Text position={[0, 0.05, 0.12]} fontSize={0.095} color="#cbd8e9" anchorX="center" anchorY="middle" maxWidth={2.55}>
          {activeProject.type}
        </Text>
        <mesh position={[0, -0.28, 0.12]}>
          <boxGeometry args={[0.85, 0.05, 0.02]} />
          <meshBasicMaterial color={activeProject.color} />
        </mesh>
        <Text position={[0, -0.52, 0.12]} fontSize={0.08} color="#b7c9de" anchorX="center" anchorY="middle" maxWidth={2.55}>
          SELECT A PROJECT BELOW
        </Text>
        <group position={[0, 1.06, 0.1]}>
          <RoundedBox args={[0.36, 0.12, 0.12]} radius={0.05} smoothness={3}>
            <meshStandardMaterial color="#594c4a" roughness={0.42} />
          </RoundedBox>
          <mesh position={[0, 0, 0.07]}>
            <circleGeometry args={[0.032, 16]} />
            <meshStandardMaterial color="#8ec8d5" emissive="#4c9cae" emissiveIntensity={0.3} />
          </mesh>
        </group>
      </group>
      <mesh position={[0, -0.72, -0.35]} castShadow>
        <boxGeometry args={[0.2, 0.72, 0.18]} />
        <meshStandardMaterial color="#d7b58e" roughness={0.5} />
      </mesh>
      <mesh position={[0, -1.08, -0.28]} castShadow>
        <boxGeometry args={[1.1, 0.12, 0.65]} />
        <meshStandardMaterial color="#d7b58e" roughness={0.5} />
      </mesh>
      <mesh position={[-0.15, -1.11, 0.45]} castShadow>
        <boxGeometry args={[1.25, 0.06, 0.38]} />
        <meshStandardMaterial color="#f7f1e9" roughness={0.5} />
      </mesh>
      {Array.from({ length: 3 }, (_, row) =>
        Array.from({ length: 11 }, (_, column) => (
          <mesh key={`key-${row}-${column}`} position={[-0.62 + column * 0.095, -1.075, 0.33 + row * 0.1]} castShadow>
            <boxGeometry args={[0.07, 0.018, 0.06]} />
            <meshStandardMaterial color={(row === 0 && column === 0) || (row === 2 && column === 10) ? '#e8a16e' : '#d8c9b8'} roughness={0.58} />
          </mesh>
        ))
      )}
      <mesh position={[0.78, -1.08, 0.45]} rotation={[0.08, 0, 0]} castShadow>
        <capsuleGeometry args={[0.09, 0.14, 4, 8]} />
        <meshStandardMaterial color="#f7f1e9" roughness={0.42} />
      </mesh>
      <mesh position={[1.45, -1.05, 0.55]} castShadow>
        <cylinderGeometry args={[0.11, 0.09, 0.22, 14]} />
        <meshStandardMaterial color="#e8a5c7" roughness={0.55} />
      </mesh>
      {[-1.85, 1.85].map((x) => (
        <group key={x} position={[x, -0.82, -0.55]} castShadow>
          <RoundedBox args={[0.32, 0.5, 0.3]} radius={0.05} smoothness={3}>
            <meshStandardMaterial color="#b9a5c9" roughness={0.68} />
          </RoundedBox>
          <mesh position={[0, 0.06, 0.16]}>
            <circleGeometry args={[0.08, 16]} />
            <meshStandardMaterial color="#6e5d7c" roughness={0.62} />
          </mesh>
        </group>
      ))}
      <group position={[-1.75, -0.72, -0.62]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.05, 0.07, 0.85, 10]} />
          <meshStandardMaterial color="#6d5a4b" roughness={0.6} />
        </mesh>
        <mesh position={[0.18, 0.32, 0]} rotation={[0, 0, -0.7]} castShadow>
          <coneGeometry args={[0.16, 0.28, 14]} />
          <meshStandardMaterial color="#f2c078" emissive="#ffcf8a" emissiveIntensity={0.35} roughness={0.5} />
        </mesh>
      </group>
      <group position={[1.55, -0.78, -0.68]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.18, 0.22, 0.32, 12]} />
          <meshStandardMaterial color="#d88c7e" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.3, 0]} scale={[0.26, 0.32, 0.16]}>
          <sphereGeometry args={[1, 12, 10]} />
          <meshStandardMaterial color="#72a981" roughness={0.9} />
        </mesh>
      </group>
      <group position={[0.1, -1.5, 1.75]}>
        <mesh castShadow receiveShadow position={[0, 0.45, 0]}>
          <boxGeometry args={[1.25, 0.14, 1.15]} />
          <meshStandardMaterial color="#c6a2d6" roughness={0.76} />
        </mesh>
        <mesh position={[0, -0.15, 0]} castShadow>
          <boxGeometry args={[0.16, 0.85, 0.16]} />
          <meshStandardMaterial color="#8a6f9c" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.68, 0]} castShadow>
          <boxGeometry args={[1.05, 0.72, 0.12]} />
          <meshStandardMaterial color="#d8b7e8" roughness={0.8} />
        </mesh>
      </group>
      <RoundedBox position={[-0.15, -1.02, -0.92]} args={[1.3, 0.28, 0.06]} radius={0.05} smoothness={3}>
        <meshBasicMaterial color="#49372f" />
      </RoundedBox>
      <Text position={[-0.15, -1.02, -0.88]} fontSize={0.13} color="#fff4e6" anchorX="center" anchorY="middle" letterSpacing={0.03}>
        WORKBENCH
      </Text>
    </group>
  );
}

function RoomScene({ progress, activeProject }) {
  return (
    <Canvas className="scroll-room-canvas" camera={{ position: [8.2, 3.4, 10.2], fov: 42 }} dpr={[1, 1.25]} shadows gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}>
      <mesh position={[0, 0, -16]}>
        <planeGeometry args={[240, 240]} />
        <shaderMaterial
          vertexShader={`varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`}
          fragmentShader={`varying vec2 vUv; void main() { vec3 top = vec3(0.98, 0.64, 0.31); vec3 bottom = vec3(1.0, 0.84, 0.55); float blend = smoothstep(0.0, 1.0, vUv.y); gl_FragColor = vec4(mix(bottom, top, blend), 1.0); }`}
          depthWrite={false}
        />
      </mesh>
      <fog attach="fog" args={['#f8b15f', 22, 42]} />
      <ambientLight intensity={0.5} />
      <ContactShadows position={[0, -2.38, -1.5]} opacity={0.3} scale={12} blur={2.6} far={5} resolution={256} color="#5f3f26" />
      <RoomShell />
      <Workstation activeProject={activeProject} />
      <CameraPath progress={progress} />
    </Canvas>
  );
}

export default function ScrollRoomPortfolio() {
  const [progress, setProgress] = useState(0);
  const [projectIndex, setProjectIndex] = useState(0);
  const [ready, setReady] = useState(false);
  const activeProject = projects[projectIndex];
  const sceneIndex = Math.min(3, Math.floor(progress * 4.01));
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
    <header className="scroll-room-header"><Link href="/" className="scroll-room-logo"><span>JS</span><strong>Jazz Sajonia</strong></Link><div className="scroll-room-progress"><span style={{ width: `${progress * 100}%` }} /><small>{scenes[sceneIndex].label}</small></div><a href="mailto:jaz.sajonia@gmail.com" className="scroll-room-contact">Say hello <ArrowUpRight size={15} /></a></header>
    <section className="scroll-room-intro scroll-room-overlay"><div className="scroll-room-kicker"><Sparkle size={14} weight="fill" /> CREATIVE DEVELOPER · INTERACTIVE PORTFOLIO</div><h1>Hi, I’m Jazz.<br /><em>I build digital worlds.</em></h1><p>Software, experiments, and interactive experiences — explore the work behind the screen.</p><div className="scroll-room-scroll-hint"><Mouse size={17} /> Keep scrolling <ArrowRight size={16} /></div></section>
    <section className="scroll-room-copy scroll-room-skills-copy"><div className="scroll-room-kicker">01 / SKILLS</div><h2>Tools on the workbench.</h2><p>The stack I reach for while turning ideas into tested, useful software.</p><div className="scroll-room-skill-list">{skills.map((skill) => <span key={skill}>{skill}</span>)}</div></section>
    <section className="scroll-room-copy scroll-room-project-copy"><div className="scroll-room-kicker">02 / PROJECTS</div><h2>Built, shipped, and still learning.</h2><div className="scroll-room-project-card"><div className="scroll-room-project-top"><span style={{ background: activeProject.color }} /> <small>{String(projectIndex + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}</small></div><h3>{activeProject.title}</h3><div className="scroll-room-project-type">{activeProject.type}</div><p>{activeProject.description}</p><div className="scroll-room-project-stack">{activeProject.stack}</div><div className="scroll-room-project-actions"><Link href={activeProject.href}>View case study <ArrowUpRight size={15} /></Link>{activeProject.github && <a href={activeProject.github} target="_blank" rel="noreferrer"><GithubLogo size={16} /> GitHub</a>}{activeProject.live && <a href={activeProject.live} target="_blank" rel="noreferrer">Live <ArrowUpRight size={15} /></a>}</div></div><div className="scroll-room-project-nav"><button type="button" onClick={() => setProjectIndex((current) => (current - 1 + projects.length) % projects.length)} aria-label="Previous project"><ArrowLeft size={20} /></button><button type="button" onClick={() => setProjectIndex((current) => (current + 1) % projects.length)} aria-label="Next project"><ArrowRight size={20} /></button></div></section>
    <section className="scroll-room-copy scroll-room-contact-copy"><div className="scroll-room-kicker">03 / CONTACT</div><h2>Let’s build a better little world.</h2><p>Want to talk about a project, collaboration, or a useful idea? The shelf is open.</p><div className="scroll-room-contact-links"><a href="mailto:jaz.sajonia@gmail.com"><Envelope size={18} /> Email</a><a href="https://github.com/jazsajonia-pixel" target="_blank" rel="noreferrer"><GithubLogo size={18} /> GitHub</a><a href="https://www.linkedin.com" target="_blank" rel="noreferrer"><LinkedinLogo size={18} /> LinkedIn</a></div><Link href="/projects" className="scroll-room-archive-link">Open the complete archive <ArrowUpRight size={16} /></Link></section>
    {!ready && <div className="scroll-room-loading">Loading the room…</div>}
  </div>;
}
