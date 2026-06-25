import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Cylinder, Torus } from '@react-three/drei';
import * as THREE from 'three';

interface VintageRadioProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  autoRotate?: boolean;
}

export function VintageRadio({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, autoRotate = false }: VintageRadioProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += 0.005;
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      {/* Main Body (Wood/Metal casing) */}
      <Box args={[3, 2, 1.5]} position={[0, 0, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#8B4513" roughness={0.8} />
      </Box>

      {/* Front Panel (Dark) */}
      <Box args={[2.8, 1.8, 0.1]} position={[0, 0, 0.76]}>
        <meshStandardMaterial color="#1A1A1A" roughness={0.9} />
      </Box>

      {/* Speaker Grill */}
      <Box args={[1.2, 1.4, 0.05]} position={[-0.6, 0, 0.8]}>
        <meshStandardMaterial color="#2A2A2A" wireframe />
      </Box>

      {/* Dial Screen (Amber glow) */}
      <Box args={[1.2, 0.6, 0.05]} position={[0.6, 0.4, 0.8]}>
        <meshStandardMaterial color="#FFAA00" emissive="#FFAA00" emissiveIntensity={0.5} />
      </Box>

      {/* Dial Scale (Line inside screen) */}
      <Box args={[1.0, 0.02, 0.02]} position={[0.6, 0.4, 0.83]}>
        <meshStandardMaterial color="#000" />
      </Box>

      {/* Tuning Knob */}
      <Cylinder args={[0.2, 0.2, 0.1, 32]} position={[0.8, -0.4, 0.8]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#444" metalness={0.8} roughness={0.2} />
      </Cylinder>

      {/* Volume Knob */}
      <Cylinder args={[0.15, 0.15, 0.1, 32]} position={[0.3, -0.4, 0.8]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#444" metalness={0.8} roughness={0.2} />
      </Cylinder>

      {/* Small Dial ring */}
      <Torus args={[0.15, 0.02, 16, 32]} position={[0.8, -0.4, 0.86]}>
        <meshStandardMaterial color="#FFAA00" emissive="#FFAA00" />
      </Torus>
      
      {/* Antenna */}
      <Cylinder args={[0.02, 0.02, 2, 8]} position={[-1.2, 2, -0.5]} rotation={[0, 0, Math.PI / 8]}>
        <meshStandardMaterial color="#888" metalness={0.9} />
      </Cylinder>
    </group>
  );
}
