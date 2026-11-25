import { useMemo, useRef } from 'react';
import { useFrame, type ThreeElements } from '@react-three/fiber';
import * as THREE from 'three';
import { paintedMetalTexture } from '../textures/procedural';

type Props = ThreeElements['group'] & { lit?: boolean };

/** Guardatojo (casco minero) con lámpara de carburo encendida. */
export function MinerHelmet({ lit = true, ...props }: Props) {
  const flame = useRef<THREE.Mesh>(null);
  const light = useRef<THREE.PointLight>(null);

  const mats = useMemo(
    () => ({
      shell: new THREE.MeshPhysicalMaterial({ map: paintedMetalTexture('#e2d8bd', 41, 0.13), roughness: 0.42, clearcoat: 0.7, clearcoatRoughness: 0.35 }),
      band: new THREE.MeshStandardMaterial({ color: '#2a1f16', roughness: 0.8 }),
      brass: new THREE.MeshStandardMaterial({ color: '#c39a4f', metalness: 1, roughness: 0.3 }),
      reflector: new THREE.MeshStandardMaterial({ color: '#d9c08a', metalness: 0.9, roughness: 0.45, side: THREE.DoubleSide }),
      flame: new THREE.MeshBasicMaterial({ color: '#ffd27a', transparent: true, opacity: 0.95, toneMapped: false }),
      flameCore: new THREE.MeshBasicMaterial({ color: '#7fc8ff', transparent: true, opacity: 0.8, toneMapped: false }),
    }),
    [],
  );

  const shellGeo = useMemo(() => {
    const pts = [
      [0, 0.66], [0.14, 0.65], [0.3, 0.6], [0.42, 0.5], [0.5, 0.38], [0.55, 0.24], [0.57, 0.12], [0.6, 0.07], [0.72, 0.03], [0.76, 0.0], [0.75, -0.03], [0.7, -0.02], [0.56, 0.02], [0.52, 0.02],
    ].map(([x, y]) => new THREE.Vector2(x, y));
    const g = new THREE.LatheGeometry(pts, 64);
    g.scale(1, 1, 1.15);
    return g;
  }, []);

  const reflectorGeo = useMemo(() => {
    const pts: THREE.Vector2[] = [];
    for (let i = 0; i <= 12; i++) {
      const r = (i / 12) * 0.115;
      pts.push(new THREE.Vector2(r, r * r * 3.2));
    }
    const g = new THREE.LatheGeometry(pts, 40);
    g.rotateX(Math.PI / 2);
    return g;
  }, []);

  useFrame((state) => {
    if (!lit) return;
    const t = state.clock.elapsedTime;
    const f = 1 + Math.sin(t * 17) * 0.08 + Math.sin(t * 29 + 1.3) * 0.06 + (Math.random() - 0.5) * 0.08;
    if (flame.current) {
      flame.current.scale.set(1, f, 1);
      flame.current.rotation.z = Math.sin(t * 5) * 0.08;
    }
    if (light.current) light.current.intensity = 1.8 * f;
  });

  return (
    <group {...props}>
      <mesh geometry={shellGeo} material={mats.shell} castShadow receiveShadow />
      {/* Cresta central */}
      <mesh position={[0, 0.6, 0]} rotation={[0, 0, 0]} material={mats.shell} castShadow>
        <boxGeometry args={[0.07, 0.08, 1.05]} />
      </mesh>
      {/* Banda */}
      <mesh position={[0, 0.07, 0]} scale={[1, 1, 1.15]} material={mats.band}>
        <cylinderGeometry args={[0.575, 0.585, 0.06, 64, 1, true]} />
      </mesh>
      {/* Soporte de la lámpara */}
      <mesh position={[0, 0.3, 0.6]} rotation={[-0.35, 0, 0]} material={mats.band}>
        <boxGeometry args={[0.16, 0.22, 0.05]} />
      </mesh>

      {/* Lámpara de carburo */}
      <group position={[0, 0.34, 0.72]}>
        <mesh geometry={reflectorGeo} material={mats.reflector} />
        <mesh position={[0, 0, 0.02]} rotation={[Math.PI / 2, 0, 0]} material={mats.brass}>
          <cylinderGeometry args={[0.02, 0.025, 0.06, 12]} />
        </mesh>
        {/* Depósito de agua / carburo colgando */}
        <mesh position={[0, -0.2, -0.02]} material={mats.brass} castShadow>
          <cylinderGeometry args={[0.055, 0.06, 0.22, 24]} />
        </mesh>
        <mesh position={[0, -0.08, -0.02]} material={mats.brass}>
          <cylinderGeometry args={[0.04, 0.06, 0.05, 16]} />
        </mesh>
        <mesh position={[0, -0.31, -0.02]} material={mats.brass}>
          <sphereGeometry args={[0.06, 20, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
        </mesh>
        {lit && (
          <group position={[0, 0.0, 0.07]}>
            <mesh ref={flame} position={[0, 0.045, 0]} material={mats.flame}>
              <coneGeometry args={[0.018, 0.09, 12]} />
            </mesh>
            <mesh position={[0, 0.012, 0.001]} material={mats.flameCore}>
              <sphereGeometry args={[0.01, 8, 8]} />
            </mesh>
            <pointLight ref={light} position={[0, 0.06, 0.3]} color="#ffb35c" distance={4} decay={2} intensity={1.8} castShadow={false} />
          </group>
        )}
      </group>
    </group>
  );
}
