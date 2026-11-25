import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Environment, Lightformer, PresentationControls, Float } from '@react-three/drei';
import * as THREE from 'three';
import { TubeRadio, type RadioDrive } from '../models/TubeRadio';
import { Effects } from '../Effects';
import { audio } from '../../../lib/audio/engine';
import { useRadio } from '../../../stores/useRadio';
import { STATIONS } from '../../../data/stations';

const buf = new Uint8Array(2048);

function Driver({ drive }: { drive: React.RefObject<RadioDrive> }) {
  const level = useRef(0);
  useFrame((state, dt) => {
    const r = useRadio.getState();
    const playing = r.status === 'playing';
    const raw = playing && r.analysable ? audio.level('stream', buf) : playing ? 0.35 + Math.sin(state.clock.elapsedTime * 7) * 0.1 : 0;
    level.current = THREE.MathUtils.damp(level.current, raw, 10, dt);
    const d = drive.current;
    const idx = Math.max(0, STATIONS.findIndex((s) => s.id === r.stationId));
    const target = 0.33 + idx * 0.22;
    d.needle = THREE.MathUtils.damp(d.needle, r.status === 'idle' ? 0.1 : target, 3, dt);
    d.tuned = THREE.MathUtils.damp(d.tuned, playing ? 1 : r.status === 'connecting' ? 0.5 : 0.05, 4, dt);
    d.glow = THREE.MathUtils.damp(d.glow, playing ? 0.75 + level.current * 1.6 : r.status === 'connecting' ? 0.55 : 0.28, 8, dt);
  });
  return null;
}

export default function LiveRadioScene() {
  const drive = useRef<RadioDrive>({ needle: 0.1, glow: 0.3, tuned: 0 });
  return (
    <Canvas dpr={[1, 1.75]} camera={{ position: [0, 0.4, 6.4], fov: 34 }} gl={{ antialias: false }} shadows>
      <color attach="background" args={['#0b0907']} />
      <ambientLight intensity={0.2} />
      <spotLight position={[3, 5, 5]} angle={0.5} penumbra={1} intensity={60} distance={20} decay={2} color="#ffe0b8" castShadow />
      <spotLight position={[-5, 2, -3]} angle={0.6} penumbra={1} intensity={30} distance={20} decay={2} color="#8fa6d8" />
      <Suspense fallback={null}>
        <Environment resolution={256} frames={1} environmentIntensity={0.6}>
          <Lightformer form="rect" intensity={1.5} color="#ffd6a0" position={[-3, 3, 4]} scale={[5, 2, 1]} />
          <Lightformer form="rect" intensity={0.8} color="#9fb4e6" position={[4, 1, -3]} scale={[3, 3, 1]} />
        </Environment>
        <PresentationControls global={false} cursor snap rotation={[0.05, -0.35, 0]} polar={[-0.3, 0.3]} azimuth={[-0.9, 0.9]}>
          <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.35}>
            <TubeRadio drive={drive} />
          </Float>
        </PresentationControls>
        <ContactShadows position={[0, -1.25, 0]} opacity={0.65} scale={9} blur={2.6} far={3} />
      </Suspense>
      <Driver drive={drive} />
      <Effects bloom={1.2} threshold={0.75} vignette={0.6} />
    </Canvas>
  );
}
