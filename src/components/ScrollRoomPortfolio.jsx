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
  const current = useRef(new THREE.Vector3(0, 1.2, 10));
  const look = useRef(new THREE.Vector3(0, 1, 0));
  const reducedMotion = useRef(false);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => { reducedMotion.current = media.matches; };
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  const targets = useMemo(() => [
    { position: new THREE.Vector3(0, 1.5, 11), look: new THREE.Vector3(0, 1, 0) },
    { position: new THREE.Vector3(-3.7, 1.35, 4.9), look: new THREE.Vector3(-1.8, -0.35, -1.65) },
    { position: new THREE.Vector3(0.9, 0.95, 3.85), look: new THREE.Vector3(-1.65, -0.1, -2.0) },
    { position: new THREE.Vector3(1.15, 2.15, 3.55), look: new THREE.Vector3(1.35, 1.35, -5.1) },
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
  const floorBoards = Array.from({ length: 15 }, (_, index) => -5.1 + index * 0.73);
  return (
    <>
      {/* A small open-front diorama: warm wood, cream plaster, and soft pastel details. */}
      <mesh position={[0, -2.67, -1.45]}>
        <boxGeometry args={[11.7, 0.42, 9.3]} />
        <meshStandardMaterial color="#d5a16c" roughness={0.82} />
      </mesh>
      <mesh receiveShadow position={[0, -2.43, -1.45]}>
        <boxGeometry args={[11.45, 0.12, 9.05]} />
        <meshStandardMaterial color="#f0d2a4" roughness={0.78} />
      </mesh>
      {floorBoards.map((x, index) => (
        <mesh key={index} receiveShadow position={[x, -2.355, -1.45]}>
          <boxGeometry args={[0.68, 0.035, 8.85]} />
          <meshStandardMaterial color={index % 2 ? '#c9905c' : '#d9a873'} roughness={0.88} />
        </mesh>
      ))}
      {/* Back wall and short side walls leave the room open to the camera. */}
      <mesh position={[0, 0.48, -5.78]}>
        <boxGeometry args={[11.4, 5.85, 0.25]} />
        <meshStandardMaterial color="#fff4e6" roughness={0.96} />
      </mesh>
      <mesh receiveShadow position={[-5.56, 0.48, -1.55]}>
        <boxGeometry args={[0.24, 5.85, 8.55]} />
        <meshStandardMaterial color="#f4e5d3" roughness={0.95} />
      </mesh>
      <mesh position={[5.56, 0.48, -1.55]}>
        <boxGeometry args={[0.24, 5.85, 8.55]} />
        <meshStandardMaterial color="#f7eadb" roughness={0.95} />
      </mesh>
      {/* Timber frame and skirting make the room feel like a crafted miniature. */}
      <mesh position={[0, 3.48, -5.77]}>
        <boxGeometry args={[11.75, 0.38, 0.48]} />
        <meshStandardMaterial color="#b77a48" roughness={0.76} />
      </mesh>
      <mesh position={[-5.52, 3.48, -1.55]}>
        <boxGeometry args={[0.42, 0.38, 8.9]} />
        <meshStandardMaterial color="#c18a55" roughness={0.76} />
      </mesh>
      <mesh position={[5.52, 3.48, -1.55]}>
        <boxGeometry args={[0.42, 0.38, 8.9]} />
        <meshStandardMaterial color="#c18a55" roughness={0.76} />
      </mesh>
      <mesh position={[0, -2.21, -5.61]}>
        <boxGeometry args={[11.4, 0.3, 0.18]} />
        <meshStandardMaterial color="#b77a48" roughness={0.8} />
      </mesh>
      {/* Window with a pale blue pane on the right side of the back wall. */}
      <mesh position={[3.72, 1.02, -5.62]}>
        <boxGeometry args={[1.65, 2.35, 0.12]} />
        <meshStandardMaterial color="#c18a55" roughness={0.72} />
      </mesh>
      <mesh position={[3.72, 1.02, -5.535]}>
        <boxGeometry args={[1.42, 2.12, 0.045]} />
        <meshStandardMaterial color="#cfe8f4" emissive="#9dcde5" emissiveIntensity={0.16} roughness={0.35} />
      </mesh>
      <mesh position={[3.72, 1.02, -5.49]}>
        <boxGeometry args={[0.075, 2.12, 0.05]} />
        <meshStandardMaterial color="#fff4e6" />
      </mesh>
      <mesh position={[3.72, 1.02, -5.49]}>
        <boxGeometry args={[1.42, 0.075, 0.05]} />
        <meshStandardMaterial color="#fff4e6" />
      </mesh>
      {/* Wall art adds a few readable, intentional focal points without clutter. */}
      <mesh position={[-3.8, 1.7, -5.59]}>
        <boxGeometry args={[1.35, 1.6, 0.12]} />
        <meshStandardMaterial color="#c18a55" roughness={0.65} />
      </mesh>
      <mesh position={[-3.8, 1.7, -5.51]}>
        <boxGeometry args={[1.12, 1.36, 0.035]} />
        <meshStandardMaterial color="#f4d8e7" roughness={0.8} />
      </mesh>
      <mesh position={[-3.8, 1.68, -5.48]}>
        <boxGeometry args={[0.72, 0.12, 0.03]} />
        <meshStandardMaterial color="#c48cbb" />
      </mesh>
      <mesh position={[-3.8, 1.42, -5.48]}>
        <boxGeometry args={[0.46, 0.08, 0.03]} />
        <meshStandardMaterial color="#9ebda4" />
      </mesh>
      <hemisphereLight args={['#fff6e9', '#9a684b', 1.25]} />
      <directionalLight castShadow position={[-4, 7, 5]} intensity={1.8} color="#fff0d8" shadow-mapSize-width={1024} shadow-mapSize-height={1024} shadow-camera-near={0.5} shadow-camera-far={22} shadow-bias={-0.00015} />
      <pointLight position={[-3.5, 2.8, -1.8]} intensity={5.5} distance={10} color="#ffd5a1" />
      <pointLight position={[3.5, 2.2, -2.5]} intensity={3.8} distance={8} color="#c7c2ff" />
    </>
  );
}

function IntroCube() {
  return (
    <group position={[0, 2.63, -5.47]}>
      <RoundedBox args={[3.7, 0.72, 0.16]} radius={0.09} smoothness={4}>
        <meshStandardMaterial color="#fff8ef" roughness={0.55} metalness={0.08} />
      </RoundedBox>
      <Text position={[0, 0.05, 0.1]} fontSize={0.31} color="#a16dc0" anchorX="center" anchorY="middle" letterSpacing={0.035}>
        JAZZ SAJONIA
      </Text>
      <Text position={[0, -0.22, 0.1]} fontSize={0.105} color="#9a7e6b" anchorX="center" anchorY="middle" letterSpacing={0.13}>
        CREATIVE STUDIO
      </Text>
    </group>
  );
}

function DeskAndSkills() {
  return (
    <group position={[-1.65, 0, -1.7]}>
      {/* Wooden work table */}
      <mesh castShadow receiveShadow position={[0, -1.12, 0]}>
        <boxGeometry args={[3.75, 0.18, 1.75]} />
        <meshStandardMaterial color="#d49a61" roughness={0.76} />
      </mesh>
      <mesh position={[-1.55, -1.72, -0.05]}>
        <boxGeometry args={[0.16, 1.18, 1.42]} />
        <meshStandardMaterial color="#f6e5cf" roughness={0.8} />
      </mesh>
      <mesh position={[1.55, -1.72, -0.05]}>
        <boxGeometry args={[0.16, 1.18, 1.42]} />
        <meshStandardMaterial color="#f6e5cf" roughness={0.8} />
      </mesh>
      {/* Keyboard and a small stack of books */}
      <mesh position={[0.2, -0.99, 0.42]}>
        <boxGeometry args={[1.12, 0.055, 0.34]} />
        <meshStandardMaterial color="#f7f1e9" roughness={0.5} />
      </mesh>
      {/* Individual keycaps make the input area read as a keyboard at room scale. */}
      {Array.from({ length: 3 }, (_, row) =>
        Array.from({ length: 10 }, (_, column) => (
          <mesh key={`key-${row}-${column}`} position={[-0.29 + column * 0.105, -0.953, 0.30 + row * 0.105]}>
            <boxGeometry args={[0.078, 0.018, 0.065]} />
            <meshStandardMaterial color={(row === 0 && column === 0) || (row === 2 && column === 9) ? '#e8a16e' : '#d8c9b8'} roughness={0.58} />
          </mesh>
        ))
      )}
      <mesh position={[0.99, -0.955, 0.42]} rotation={[0.08, 0, 0]}>
        <capsuleGeometry args={[0.09, 0.14, 4, 8]} />
        <meshStandardMaterial color="#f7f1e9" roughness={0.42} />
      </mesh>
      <mesh position={[0.99, -0.86, 0.42]}>
        <boxGeometry args={[0.012, 0.045, 0.012]} />
        <meshBasicMaterial color="#b77a48" />
      </mesh>
      {/* Shallow drawer fronts and pulls give the workbench a crafted silhouette. */}
      {[-0.68, 0.68].map((x) => (
        <group key={x} position={[x, -1.31, 0.81]}>
          <RoundedBox args={[0.82, 0.31, 0.07]} radius={0.035} smoothness={3}>
            <meshStandardMaterial color="#bd804b" roughness={0.76} />
          </RoundedBox>
          <mesh position={[0, 0.015, 0.043]}>
            <boxGeometry args={[0.19, 0.035, 0.025]} />
            <meshStandardMaterial color="#e8c69d" metalness={0.22} roughness={0.4} />
          </mesh>
        </group>
      ))}
      {/* Compact speakers sit at either side of the monitor base. */}
      {[-1.48, 1.48].map((x) => (
        <group key={x} position={[x, -0.77, -0.47]}>
          <RoundedBox args={[0.3, 0.46, 0.28]} radius={0.045} smoothness={3}>
            <meshStandardMaterial color="#b9a5c9" roughness={0.68} />
          </RoundedBox>
          <mesh position={[0, 0.055, 0.146]}>
            <circleGeometry args={[0.075, 16]} />
            <meshStandardMaterial color="#6e5d7c" roughness={0.62} />
          </mesh>
          <mesh position={[0, -0.085, 0.146]}>
            <circleGeometry args={[0.035, 16]} />
            <meshStandardMaterial color="#e5d8ec" roughness={0.58} />
          </mesh>
        </group>
      ))}
      <mesh position={[-1.2, -0.99, 0.3]} rotation={[0, 0.08, 0]}>
        <boxGeometry args={[0.56, 0.12, 0.42]} />
        <meshStandardMaterial color="#c6a2d6" roughness={0.82} />
      </mesh>
      <mesh position={[-1.2, -0.87, 0.3]} rotation={[0, -0.04, 0]}>
        <boxGeometry args={[0.56, 0.1, 0.42]} />
        <meshStandardMaterial color="#f2d4b3" roughness={0.82} />
      </mesh>
      {/* Potted desk plant */}
      <mesh position={[1.35, -0.82, -0.38]}>
        <cylinderGeometry args={[0.17, 0.22, 0.34, 12]} />
        <meshStandardMaterial color="#d88c7e" roughness={0.8} />
      </mesh>
      <mesh position={[1.35, -0.52, -0.38]}>
        <sphereGeometry args={[0.25, 12, 10]} />
        <meshStandardMaterial color="#72a981" roughness={0.9} />
      </mesh>
      <mesh position={[1.2, -0.4, -0.42]} scale={[0.18, 0.34, 0.12]} rotation={[0, 0, -0.45]}>
        <sphereGeometry args={[1, 12, 10]} />
        <meshStandardMaterial color="#8fc69a" roughness={0.9} />
      </mesh>
      <mesh position={[1.49, -0.36, -0.36]} scale={[0.16, 0.3, 0.11]} rotation={[0, 0, 0.4]}>
        <sphereGeometry args={[1, 12, 10]} />
        <meshStandardMaterial color="#5f9a78" roughness={0.9} />      </mesh>
      <RoundedBox position={[0, -0.88, -0.61]} args={[1.42, 0.32, 0.06]} radius={0.06} smoothness={3}>
        <meshBasicMaterial color="#49372f" />
      </RoundedBox>
      <Text position={[0, -0.88, -0.565]} fontSize={0.15} color="#fff4e6" anchorX="center" anchorY="middle" letterSpacing={0.025}>
        WORKBENCH
      </Text>
      {/* A compact stool tucked beneath the table */}
      <mesh position={[0, -1.82, 1.3]}>
        <cylinderGeometry args={[0.55, 0.58, 0.18, 16]} />
        <meshStandardMaterial color="#c6a2d6" roughness={0.76} />
      </mesh>
      <mesh position={[0, -2.08, 1.3]}>
        <cylinderGeometry args={[0.11, 0.14, 0.48, 10]} />
        <meshStandardMaterial color="#f4e5d3" roughness={0.8} />
      </mesh>
    </group>
  );
}

function Monitor({ activeProject }) {
  return (
    <group position={[-1.65, 0.28, -2.12]}>
      <mesh position={[0, -1.05, 0]}>
        <boxGeometry args={[0.18, 0.66, 0.16]} />
        <meshStandardMaterial color="#d7b58e" metalness={0.18} roughness={0.5} />
      </mesh>
      <mesh position={[0, -1.37, 0.08]}>
        <boxGeometry args={[1.05, 0.12, 0.6]} />
        <meshStandardMaterial color="#d7b58e" roughness={0.5} />
      </mesh>
      <RoundedBox castShadow receiveShadow position={[0, 0.05, 0]} args={[2.72, 1.82, 0.18]} radius={0.09} smoothness={4}>
        <meshStandardMaterial color="#e8d8c8" roughness={0.48} metalness={0.12} />
      </RoundedBox>
      {/* A tiny webcam and lens detail break up the monitor's simple top edge. */}
      <group position={[0, 0.99, 0.11]}>
        <RoundedBox args={[0.34, 0.12, 0.12]} radius={0.045} smoothness={3}>
          <meshStandardMaterial color="#594c4a" roughness={0.42} />
        </RoundedBox>
        <mesh position={[0, 0, 0.067]}>
          <circleGeometry args={[0.032, 16]} />
          <meshStandardMaterial color="#8ec8d5" emissive="#4c9cae" emissiveIntensity={0.28} />
        </mesh>
      </group>
      <mesh position={[0, 0.05, 0.105]}>
        <planeGeometry args={[2.48, 1.57]} />
        <meshBasicMaterial color="#29364d" />
      </mesh>
      <mesh position={[0, 0.67, 0.12]}>
        <boxGeometry args={[0.65, 0.055, 0.025]} />
        <meshBasicMaterial color="#e8a5c7" />
      </mesh>
      <Text position={[0, 0.27, 0.13]} fontSize={0.21} color="#fff4e6" anchorX="center" anchorY="middle" maxWidth={2.2}>
        {activeProject.title}
      </Text>      <Text position={[0, -0.1, 0.13]} fontSize={0.09} color="#cbd8e9" anchorX="center" anchorY="middle" maxWidth={2.25}>
        {activeProject.type}
      </Text>
      <mesh position={[0, -0.48, 0.13]}>
        <boxGeometry args={[0.8, 0.045, 0.025]} />
        <meshBasicMaterial color={activeProject.color} />
      </mesh>
      <Text position={[0, -0.69, 0.13]} fontSize={0.085} color="#b7c9de" anchorX="center" anchorY="middle" maxWidth={2.25}>
        SELECT A PROJECT BELOW
      </Text>
    </group>
  );
}

function ContactShelf() {
  return (
    <group position={[1.35, 2.0, -5.38]}>
      <mesh castShadow receiveShadow position={[0, 0.1, 0]}>
        <boxGeometry args={[3.35, 0.14, 0.48]} />
        <meshStandardMaterial color="#c58b55" roughness={0.75} />
      </mesh>
      <mesh position={[0, -1.18, 0]}>
        <boxGeometry args={[3.35, 0.14, 0.48]} />
        <meshStandardMaterial color="#c58b55" roughness={0.75} />
      </mesh>
      {/* Books */}
      {[
        [-1.2, 0.42, '#c6a2d6'], [-0.94, 0.35, '#f0c8a5'], [-0.69, 0.46, '#94b9a0'],
        [0.28, -0.82, '#e9b0c7'], [0.54, -0.78, '#c6a2d6'], [0.8, -0.83, '#d7ad75']
      ].map(([x, y, color], index) => (
        <mesh key={index} position={[x, y, 0.02]} rotation={[0, 0, index % 2 ? 0.04 : -0.03]}>
          <boxGeometry args={[0.19, 0.56, 0.24]} />
          <meshStandardMaterial color={color} roughness={0.82} />
        </mesh>
      ))}
      {/* Tiny keepsakes and plant pots */}
      <mesh position={[1.14, 0.43, 0.02]}>
        <cylinderGeometry args={[0.16, 0.2, 0.28, 12]} />
        <meshStandardMaterial color="#f0c8a5" roughness={0.82} />
      </mesh>
      <mesh position={[1.14, 0.68, 0.02]} scale={[0.22, 0.28, 0.13]}>
        <sphereGeometry args={[1, 12, 10]} />
        <meshStandardMaterial color="#75a985" roughness={0.9} />
      </mesh>
      <mesh position={[-1.5, -0.84, 0.02]}>
        <boxGeometry args={[0.42, 0.42, 0.28]} />
        <meshStandardMaterial color="#e9b0c7" roughness={0.7} />
      </mesh>
      <Text position={[0, -0.49, 0.27]} fontSize={0.16} color="#49372f" anchorX="center" anchorY="middle" letterSpacing={0.07}>
        MAKE · LEARN · BUILD
      </Text>
    </group>
  );
}

function RoomScene({ progress, activeProject }) {
  return (
    <Canvas className="scroll-room-canvas" camera={{ position: [0, 1.5, 11], fov: 44 }} dpr={[1, 1.25]} shadows gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}>
      <mesh position={[0, 0, -9]}>
        <planeGeometry args={[200, 200]} />
        <shaderMaterial
          vertexShader={`varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`}
          fragmentShader={`varying vec2 vUv; void main() { vec3 top = vec3(0.97, 0.62, 0.29); vec3 bottom = vec3(1.0, 0.82, 0.51); float blend = smoothstep(0.0, 1.0, vUv.y); gl_FragColor = vec4(mix(bottom, top, blend), 1.0); }`}
          depthWrite={false}
        />
      </mesh>
      <fog attach="fog" args={['#f8b15f', 19, 38]} />
      <ambientLight intensity={0.65} />
      <ContactShadows position={[0, -2.36, -1.45]} opacity={0.24} scale={10} blur={2.4} far={5} resolution={256} color="#68452d" />
      <RoomShell />
      <IntroCube />
      <DeskAndSkills />
      <Monitor activeProject={activeProject} />
      <ContactShelf />
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