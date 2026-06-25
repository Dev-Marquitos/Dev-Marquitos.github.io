import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Cylinder, Box } from '@react-three/drei';
import * as THREE from 'three';

interface Props {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  autoRotate?: boolean;
}

export function MinerHelmet({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, autoRotate = false }: Props) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += 0.01;
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.8) * 0.08;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      {/* Helmet Dome */}
      <Sphere args={[1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} position={[0, 0, 0]} castShadow>
        <meshStandardMaterial color="#FFCC00" roughness={0.3} metalness={0.1} />
      </Sphere>

      {/* Helmet Brim */}
      <Cylinder args={[1.1, 1.1, 0.05, 32]} position={[0, 0, 0]} castShadow>
        <meshStandardMaterial color="#FFCC00" roughness={0.3} />
      </Cylinder>

      {/* Lamp Mount */}
      <Box args={[0.4, 0.4, 0.3]} position={[0, 0.4, 0.9]} rotation={[0.2, 0, 0]}>
        <meshStandardMaterial color="#2A2A2A" />
      </Box>

      {/* Lamp Body */}
      <Cylinder args={[0.25, 0.25, 0.2, 16]} position={[0, 0.4, 1.1]} rotation={[Math.PI / 2 + 0.2, 0, 0]}>
        <meshStandardMaterial color="#111" />
      </Cylinder>

      {/* Lamp Glass / Light */}
      <Cylinder args={[0.2, 0.2, 0.05, 16]} position={[0, 0.4, 1.2]} rotation={[Math.PI / 2 + 0.2, 0, 0]}>
        <meshStandardMaterial color="#FFF" emissive="#FFF" emissiveIntensity={2} />
      </Cylinder>

      {/* Pointlight emitting from lamp */}
      <pointLight position={[0, 0.4, 1.3]} distance={5} intensity={2} color="#FFF" />
    </group>
  );
}
