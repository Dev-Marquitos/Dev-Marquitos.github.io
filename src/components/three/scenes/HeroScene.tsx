import { Suspense, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer, PerformanceMonitor, RoundedBox, Sparkles, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { TubeRadio, type RadioDrive } from '../models/TubeRadio';
import { StudioMic } from '../models/StudioMic';
import { MinerHelmet } from '../models/MinerHelmet';
import { AntennaTower, CampLights, Headframe, Moon, Mountains } from '../models/Landscape';
import { Effects } from '../Effects';
import { Lantern } from '../models/Props';
import { plasterTexture, scriptPaperTexture, woodTexture } from '../textures/procedural';
import { audio, type Tuner } from '../../../lib/audio/engine';
import { useExperience } from '../../../stores/useExperience';

/* Trayectoria de cámara controlada por el scroll */
// El texto ocupa la mitad izquierda: la cámara mira a la izquierda de la radio
const CAM_POS = new THREE.CatmullRomCurve3([
  new THREE.Vector3(-1.55, 0.8, 8.2),
  new THREE.Vector3(-0.95, 0.45, 3.9),
  new THREE.Vector3(-1.1, 0.6, 3.0),
  new THREE.Vector3(-2.2, 1.0, 3.6),
  new THREE.Vector3(-1.2, 2.0, 7.2),
]);
const CAM_TARGET = new THREE.CatmullRomCurve3([
  new THREE.Vector3(-1.75, 0.4, 0),
  new THREE.Vector3(-1.3, 0.32, 0.6),
  new THREE.Vector3(1.6, 1.2, -3),
  new THREE.Vector3(2.4, 1.6, -6),
  new THREE.Vector3(-1.5, 0.2, 0),
]);

const STATION = 0.33;

function needleFor(p: number) {
  // barrido inicial → bloqueo en la emisora → recorrido por el dial → retorno
  if (p < 0.08) return THREE.MathUtils.lerp(0.06, 0.12, p / 0.08);
  if (p < 0.3) return THREE.MathUtils.lerp(0.12, STATION, THREE.MathUtils.smoothstep(p, 0.08, 0.3));
  if (p < 0.62) return STATION;
  if (p < 0.8) return THREE.MathUtils.lerp(STATION, 0.72, THREE.MathUtils.smoothstep(p, 0.62, 0.8));
  return THREE.MathUtils.lerp(0.72, STATION, THREE.MathUtils.smoothstep(p, 0.8, 0.98));
}

function Rig({ progress }: { progress: RefObject<number> }) {
  const { camera, pointer } = useThree();
  const pos = useMemo(() => new THREE.Vector3(), []);
  const tgt = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(-1.75, 0.4, 0), []);
  const smooth = useRef(0);
  const par = useRef(new THREE.Vector2());
  useFrame((_, dt) => {
    const p = THREE.MathUtils.clamp(progress.current ?? 0, 0, 1);
    smooth.current = THREE.MathUtils.damp(smooth.current, p, 4, dt);
    CAM_POS.getPoint(smooth.current, pos);
    CAM_TARGET.getPoint(smooth.current, tgt);
    par.current.x = THREE.MathUtils.damp(par.current.x, pointer.x, 2.5, dt);
    par.current.y = THREE.MathUtils.damp(par.current.y, pointer.y, 2.5, dt);
    pos.x += par.current.x * 0.35;
    pos.y += par.current.y * 0.18;
    camera.position.copy(pos);
    look.lerp(tgt, 1 - Math.exp(-dt * 6));
    camera.lookAt(look);
  });
  return null;
}

function RadioDriver({ progress, drive }: { progress: RefObject<number>; drive: RefObject<RadioDrive> }) {
  const tuner = useRef<Tuner | null>(null);
  const last = useRef(0);
  const audioUnlocked = useExperience((s) => s.audioUnlocked);
  useEffect(() => {
    if (!audioUnlocked) return;
    tuner.current = audio.createTuner();
    tuner.current.setSignal(1);
    return () => tuner.current?.dispose();
  }, [audioUnlocked]);
  useFrame((state, dt) => {
    const p = progress.current ?? 0;
    const target = needleFor(p);
    const d = drive.current;
    d.needle = THREE.MathUtils.damp(d.needle, target, 5, dt);
    const dist = Math.abs(d.needle - STATION);
    d.tuned = THREE.MathUtils.clamp(1 - dist * 9, 0, 1);
    const intro = THREE.MathUtils.clamp(state.clock.elapsedTime / 2.5, 0, 1);
    d.glow = intro * (0.75 + d.tuned * 0.45);
    // estática solo mientras la aguja se mueve fuera de la emisora
    const moving = Math.abs(d.needle - last.current) / Math.max(dt, 1e-3);
    last.current = d.needle;
    if (tuner.current) tuner.current.setSignal(moving > 0.02 ? d.tuned : 1);
  });
  return null;
}

function Room() {
  const mats = useMemo(() => {
    const plaster = plasterTexture();
    return {
      wall: new THREE.MeshStandardMaterial({ map: plaster, roughness: 0.95, color: '#d8c7b0' }),
      frame: new THREE.MeshStandardMaterial({ map: woodTexture('dark'), roughness: 0.7 }),
      table: new THREE.MeshPhysicalMaterial({ map: woodTexture('oak'), roughness: 0.5, clearcoat: 0.25, color: '#b9a58e' }),
      paper: new THREE.MeshStandardMaterial({ map: scriptPaperTexture(), roughness: 0.9 }),
      paper2: new THREE.MeshStandardMaterial({ map: scriptPaperTexture('CONVOCATORIA'), roughness: 0.9 }),
    };
  }, []);
  // pared con vano de ventana (x 1.3..3.9, y 0.1..2.5)
  const W = { x0: 1.3, x1: 3.9, y0: 0.1, y1: 2.5 };
  const wallZ = -1.6;
  return (
    <group>
      <mesh position={[(-9 + W.x0) / 2, 1.9, wallZ]} material={mats.wall} receiveShadow castShadow>
        <boxGeometry args={[W.x0 + 9, 6.2, 0.3]} />
      </mesh>
      <mesh position={[(W.x1 + 9) / 2, 1.9, wallZ]} material={mats.wall} receiveShadow castShadow>
        <boxGeometry args={[9 - W.x1, 6.2, 0.3]} />
      </mesh>
      <mesh position={[(W.x0 + W.x1) / 2, (W.y1 + 5) / 2, wallZ]} material={mats.wall} receiveShadow castShadow>
        <boxGeometry args={[W.x1 - W.x0, 5 - W.y1, 0.3]} />
      </mesh>
      <mesh position={[(W.x0 + W.x1) / 2, (W.y0 - 1.2) / 2, wallZ]} material={mats.wall} receiveShadow castShadow>
        <boxGeometry args={[W.x1 - W.x0, W.y0 + 1.2, 0.3]} />
      </mesh>
      {/* marco y cruz de la ventana */}
      {[
        [(W.x0 + W.x1) / 2, W.y1, W.x1 - W.x0 + 0.2, 0.12],
        [(W.x0 + W.x1) / 2, W.y0, W.x1 - W.x0 + 0.2, 0.16],
        [(W.x0 + W.x1) / 2, (W.y0 + W.y1) / 2, W.x1 - W.x0, 0.06],
      ].map(([x, y, w, h], i) => (
        <mesh key={'h' + i} position={[x, y, wallZ + 0.12]} material={mats.frame} castShadow>
          <boxGeometry args={[w, h, 0.14]} />
        </mesh>
      ))}
      {[W.x0, W.x1, (W.x0 + W.x1) / 2].map((x, i) => (
        <mesh key={'v' + i} position={[x, (W.y0 + W.y1) / 2, wallZ + 0.12]} material={mats.frame} castShadow>
          <boxGeometry args={[i === 2 ? 0.06 : 0.12, W.y1 - W.y0, 0.14]} />
        </mesh>
      ))}
      {/* mesa */}
      <RoundedBox args={[10, 0.2, 3.4]} radius={0.04} smoothness={3} position={[0, -1.17, 0.15]} material={mats.table} receiveShadow />
      {/* guiones sobre la mesa */}
      <mesh position={[0.9, -1.064, 1.05]} rotation={[-Math.PI / 2, 0, 0.18]} material={mats.paper} receiveShadow castShadow>
        <planeGeometry args={[0.62, 0.85]} />
      </mesh>
      <mesh position={[1.35, -1.062, 1.2]} rotation={[-Math.PI / 2, 0, -0.12]} material={mats.paper2} receiveShadow>
        <planeGeometry args={[0.62, 0.85]} />
      </mesh>
    </group>
  );
}

function Outdoors() {
  return (
    <group>
      <Stars radius={110} depth={40} count={2600} factor={4.5} saturation={0} fade speed={0.35} />
      <Moon position={[26, 15, -70]} />
      <Mountains />
      <Headframe position={[7.5, -3.6, -20]} scale={0.95} />
      <AntennaTower position={[13, -3.6, -30]} height={14} />
      <CampLights />
    </group>
  );
}

export function HeroScene({ progress, active = true }: { progress: RefObject<number>; active?: boolean }) {
  const drive = useRef<RadioDrive>({ needle: 0.06, glow: 0, tuned: 0 });
  const [dpr, setDpr] = useState(1.5);
  const [fx, setFx] = useState(true);
  return (
    <Canvas
      shadows
      dpr={dpr}
      frameloop={active ? 'always' : 'never'}
      camera={{ position: [-1.55, 0.8, 8.2], fov: 38, near: 0.1, far: 220 }}
      gl={{ antialias: false, powerPreference: 'high-performance' }}
    >
      <PerformanceMonitor
        onIncline={() => setDpr(1.75)}
        onDecline={() => {
          setDpr(1);
          setFx(false);
        }}
        flipflops={2}
      />
      <color attach="background" args={['#04050a']} />
      <fog attach="fog" args={['#05070d', 14, 95]} />
      <ambientLight intensity={0.14} color="#3a4a70" />
      <hemisphereLight args={['#33415f', '#1a120a', 0.25]} />
      {/* luz de luna entrando por la ventana */}
      <directionalLight
        position={[9, 6, -11]}
        intensity={1.1}
        color="#9fb4e6"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-bias={-0.0005}
      />
      <spotLight position={[-1.5, 5, 4]} angle={0.55} penumbra={1} intensity={9} color="#ffcf9a" castShadow shadow-mapSize={[1024, 1024]} distance={14} decay={2} />

      <Suspense fallback={null}>
        <Room />
        <TubeRadio drive={drive} position={[-0.4, 0.02, 0]} />
        <StudioMic position={[-3.6, -1.07, -0.2]} rotation={[0, 0.55, 0]} scale={0.62} />
        <MinerHelmet position={[2.55, -1.04, 0.45]} rotation={[0, -0.75, 0]} scale={0.55} />
        <Lantern position={[-2.05, -1.07, -0.55]} scale={5.2} intensity={5} distance={6} />
        <Environment resolution={256} frames={1} environmentIntensity={0.55}>
          <Lightformer form="rect" intensity={1.4} color="#ffcf9a" position={[-3, 3, 4]} scale={[5, 2, 1]} />
          <Lightformer form="rect" intensity={0.9} color="#8fa6d8" position={[4, 2, -4]} scale={[3, 3, 1]} />
        </Environment>
        <Outdoors />
        <Sparkles count={45} scale={[7, 3.5, 2.5]} position={[0, 0.6, 0]} size={1.1} speed={0.15} opacity={0.3} color="#ffd9a0" />
      </Suspense>

      <Rig progress={progress} />
      <RadioDriver progress={progress} drive={drive} />
      <Effects enabled={fx} bloom={1.15} threshold={0.78} />
    </Canvas>
  );
}

export default HeroScene;
