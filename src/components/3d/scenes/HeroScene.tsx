import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Sparkles } from '@react-three/drei';
import { VintageRadio } from '../VintageRadio';

export function HeroScene() {
  return (
    <div className="absolute inset-0 z-0" style={{ width: '100%', height: '100%' }}>
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{ position: [0, 1, 6], fov: 45 }}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={['#1A1A1A']} />

        {/* Lighting — brighter to make the radio pop */}
        <ambientLight intensity={1.5} color="#FFF5E0" />
        <directionalLight position={[0, 5, 5]} intensity={1.2} color="#FFFFFF" />
        <spotLight
          position={[5, 8, 5]}
          angle={0.4}
          penumbra={0.8}
          intensity={4}
          castShadow
          color="#FFCC66"
        />
        <spotLight position={[-4, 6, -3]} angle={0.5} penumbra={0.8} intensity={2} color="#FF6666" />
        <pointLight position={[0, 0, 4]} intensity={1} color="#FFFFFF" />

        <Suspense fallback={null}>
          <VintageRadio position={[0, -0.3, 0]} scale={0.9} autoRotate />
        </Suspense>

        <ContactShadows position={[0, -1.6, 0]} opacity={0.5} scale={10} blur={2.5} far={4} />

        {/* Floating dust particles */}
        <Sparkles count={80} scale={12} size={3} speed={0.3} opacity={0.15} color="#FFAA00" />
        <Sparkles count={40} scale={8} size={1.5} speed={0.1} opacity={0.08} color="#E61919" />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI / 2 + 0.1}
          minPolarAngle={Math.PI / 4}
        />
      </Canvas>
    </div>
  );
}
