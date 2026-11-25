import { useMemo, useRef } from 'react';
import { useFrame, type ThreeElements } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { vinylTexture, woodTexture } from '../textures/procedural';

type Props = ThreeElements['group'];

/** Tocadiscos de estudio con disco de pasta de 78 r.p.m. */
export function Turntable(props: Props) {
  const record = useRef<THREE.Group>(null);

  const mats = useMemo(() => {
    const vinyl = vinylTexture();
    return {
      wood: new THREE.MeshPhysicalMaterial({ map: woodTexture('oak'), roughness: 0.45, clearcoat: 0.7 }),
      plate: new THREE.MeshStandardMaterial({ color: '#2b2926', metalness: 0.8, roughness: 0.35 }),
      mat: new THREE.MeshStandardMaterial({ color: '#141312', roughness: 0.95 }),
      vinylTop: new THREE.MeshPhysicalMaterial({ map: vinyl, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.15 }),
      vinylSide: new THREE.MeshStandardMaterial({ color: '#090909', roughness: 0.4 }),
      chrome: new THREE.MeshStandardMaterial({ color: '#e2e0da', metalness: 1, roughness: 0.15 }),
      black: new THREE.MeshPhysicalMaterial({ color: '#151311', roughness: 0.35, clearcoat: 1 }),
    };
  }, []);

  const armGeo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(-0.1, 0, 0.25),
      new THREE.Vector3(-0.18, 0, 0.55),
      new THREE.Vector3(-0.3, -0.02, 0.78),
    ]);
    return new THREE.TubeGeometry(curve, 40, 0.016, 10, false);
  }, []);

  useFrame((_, delta) => {
    if (record.current) record.current.rotation.y -= delta * 4.2;
  });

  return (
    <group {...props}>
      <RoundedBox args={[1.7, 0.26, 1.35]} radius={0.04} smoothness={3} material={mats.wood} castShadow receiveShadow />
      {/* Plato */}
      <group position={[-0.15, 0.15, 0]}>
        <mesh material={mats.plate} castShadow>
          <cylinderGeometry args={[0.56, 0.56, 0.05, 64]} />
        </mesh>
        <group ref={record} position={[0, 0.035, 0]}>
          <mesh position={[0, 0.002, 0]} material={mats.mat}>
            <cylinderGeometry args={[0.54, 0.54, 0.008, 64]} />
          </mesh>
          <mesh position={[0, 0.012, 0]} material={[mats.vinylSide, mats.vinylTop, mats.vinylSide]} castShadow>
            <cylinderGeometry args={[0.52, 0.52, 0.012, 96]} />
          </mesh>
          <mesh position={[0, 0.04, 0]} material={mats.chrome}>
            <cylinderGeometry args={[0.012, 0.012, 0.06, 12]} />
          </mesh>
        </group>
      </group>

      {/* Brazo fonocaptor */}
      <group position={[0.6, 0.16, -0.45]}>
        <mesh material={mats.black}>
          <cylinderGeometry args={[0.07, 0.08, 0.06, 24]} />
        </mesh>
        <mesh position={[0, 0.08, 0]} material={mats.chrome}>
          <cylinderGeometry args={[0.025, 0.025, 0.12, 12]} />
        </mesh>
        <group position={[0, 0.13, 0]} rotation={[0, -0.25, 0]}>
          <mesh geometry={armGeo} material={mats.chrome} castShadow />
          <mesh position={[0, 0, -0.12]} rotation={[Math.PI / 2, 0, 0]} material={mats.black}>
            <cylinderGeometry args={[0.04, 0.04, 0.08, 16]} />
          </mesh>
          <mesh position={[-0.31, -0.03, 0.82]} rotation={[0, 0.4, 0]} material={mats.black}>
            <boxGeometry args={[0.07, 0.03, 0.12]} />
          </mesh>
        </group>
      </group>

      {/* Selector de velocidad */}
      <mesh position={[0.6, 0.15, 0.45]} material={mats.black}>
        <cylinderGeometry args={[0.07, 0.07, 0.05, 24]} />
      </mesh>
      <mesh position={[0.6, 0.18, 0.45]} material={mats.chrome}>
        <boxGeometry args={[0.012, 0.012, 0.11]} />
      </mesh>
    </group>
  );
}
