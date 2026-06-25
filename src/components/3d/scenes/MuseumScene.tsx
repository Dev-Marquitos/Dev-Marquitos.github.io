import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Float } from '@react-three/drei';
import { VintageRadio } from '../VintageRadio';
import { RetroMicrophone } from '../RetroMicrophone';
import { MinerHelmet } from '../MinerHelmet';
import { useMuseumStore } from '../../../stores/useMuseumStore';

function Label({ position, text }: { position: [number, number, number]; text: string }) {
  return (
    <mesh position={position}>
      <planeGeometry args={[2, 0.4]} />
      <meshBasicMaterial color="#1A1A1A" transparent opacity={0.9} />
    </mesh>
  );
}

function ClickablePedestal({ position, onClick }: { position: [number, number, number]; onClick: () => void }) {
  return (
    <mesh
      position={position}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onPointerOver={() => (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = 'auto')}
    >
      <cylinderGeometry args={[1.4, 1.6, 0.5, 6]} />
      <meshStandardMaterial color="#1A1A1A" metalness={0.3} roughness={0.7} />
    </mesh>
  );
}

export function MuseumScene() {
  const { selectObject } = useMuseumStore();

  return (
    <div className="absolute inset-0 w-full h-full" style={{ width: '100%', height: '100%' }}>
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{ position: [0, 3, 10], fov: 50 }}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={['#1F1F1F']} />
        <fog attach="fog" args={['#1F1F1F', 15, 40]} />

        {/* Museum lighting: Much brighter ambient and directional fill */}
        <ambientLight intensity={1.5} color="#FFF5E0" />
        <directionalLight position={[0, 5, 10]} intensity={1.5} color="#FFFFFF" />
        
        {/* Spotlight per object */}
        <spotLight position={[-4, 8, 5]} angle={0.5} penumbra={0.5} intensity={5} castShadow color="#FFCC66" target-position={[-4, 0, 0]} />
        <spotLight position={[0, 8, 5]} angle={0.5} penumbra={0.5} intensity={5} castShadow color="#FFFFFF" />
        <spotLight position={[4, 8, 5]} angle={0.5} penumbra={0.5} intensity={5} castShadow color="#FF6666" />
        <pointLight position={[0, 2, 8]} intensity={0.8} color="#FFFFFF" />

        {/* Floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.2, 0]} receiveShadow>
          <planeGeometry args={[60, 60]} />
          <meshStandardMaterial color="#222222" roughness={0.8} />
        </mesh>

        <gridHelper args={[60, 60, '#222222', '#181818']} position={[0, -2.19, 0]} />

        <Suspense fallback={null}>
          {/* Object 1: Radio — LEFT */}
          <group position={[-4, 0, 0]}>
            <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
              <VintageRadio scale={0.8} autoRotate />
            </Float>
            <ClickablePedestal position={[0, -1.9, 0]} onClick={() => selectObject('radio')} />
            {/* Glowing ring on pedestal */}
            <mesh position={[0, -1.64, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <torusGeometry args={[1.5, 0.03, 16, 64]} />
              <meshBasicMaterial color="#FFAA00" />
            </mesh>
          </group>

          {/* Object 2: Microphone — CENTER */}
          <group position={[0, 0, 0]}>
            <Float speed={2} rotationIntensity={0.15} floatIntensity={0.25}>
              <RetroMicrophone scale={0.7} autoRotate />
            </Float>
            <ClickablePedestal position={[0, -1.9, 0]} onClick={() => selectObject('mic')} />
            <mesh position={[0, -1.64, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <torusGeometry args={[1.5, 0.03, 16, 64]} />
              <meshBasicMaterial color="#E61919" />
            </mesh>
          </group>

          {/* Object 3: Miner Helmet — RIGHT */}
          <group position={[4, 0, 0]}>
            <Float speed={1.8} rotationIntensity={0.25} floatIntensity={0.35}>
              <MinerHelmet scale={0.9} autoRotate />
            </Float>
            <ClickablePedestal position={[0, -1.9, 0]} onClick={() => selectObject('helmet')} />
            <mesh position={[0, -1.64, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <torusGeometry args={[1.5, 0.03, 16, 64]} />
              <meshBasicMaterial color="#4AF626" />
            </mesh>
          </group>
        </Suspense>

        <ContactShadows position={[0, -2.15, 0]} opacity={0.6} scale={30} blur={2} far={5} />

        <OrbitControls
          makeDefault
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.2}
          minDistance={5}
          maxDistance={18}
          autoRotate
          autoRotateSpeed={0.3}
        />
      </Canvas>
    </div>
  );
}
