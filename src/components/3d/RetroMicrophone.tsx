import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Cylinder, Torus } from '@react-three/drei';
import * as THREE from 'three';

interface Props {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  autoRotate?: boolean;
}

export function RetroMicrophone({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, autoRotate = false }: Props) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y -= 0.005;
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.2) * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      {/* Base */}
      <Cylinder args={[0.8, 1, 0.2, 32]} position={[0, -2, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#2A2A2A" metalness={0.6} roughness={0.4} />
      </Cylinder>

      {/* Stand Pole */}
      <Cylinder args={[0.1, 0.1, 3, 16]} position={[0, -0.5, 0]} castShadow>
        <meshStandardMaterial color="#666" metalness={0.9} roughness={0.1} />
      </Cylinder>

      {/* Capsule Mounting Ring */}
      <Torus args={[0.6, 0.05, 16, 64]} position={[0, 1.2, 0]} rotation={[0, 0, 0]}>
        <meshStandardMaterial color="#888" metalness={0.8} roughness={0.2} />
      </Torus>

      {/* Microphone Capsule (Pill shape simulated with sphere + cylinder) */}
      <group position={[0, 1.2, 0]}>
        <Cylinder args={[0.4, 0.4, 1.2, 32]} rotation={[0, 0, Math.PI / 2]}>
          <meshStandardMaterial color="#1A1A1A" wireframe />
        </Cylinder>
        <Cylinder args={[0.38, 0.38, 1.18, 32]} rotation={[0, 0, Math.PI / 2]}>
          <meshStandardMaterial color="#E61919" emissive="#E61919" emissiveIntensity={0.2} />
        </Cylinder>
      </group>
    </group>
  );
}
