import { useMemo } from 'react';
import type { ThreeElements } from '@react-three/fiber';
import * as THREE from 'three';
import { plaqueTexture } from '../textures/procedural';

type Props = ThreeElements['group'];

/** Micrófono de estudio tipo cápsula con "bandera" de la emisora. */
export function StudioMic(props: Props) {
  const mats = useMemo(
    () => ({
      chrome: new THREE.MeshStandardMaterial({ color: '#e4e2dc', metalness: 1, roughness: 0.14 }),
      darkChrome: new THREE.MeshStandardMaterial({ color: '#8d8a84', metalness: 1, roughness: 0.3 }),
      iron: new THREE.MeshStandardMaterial({ color: '#232120', metalness: 0.7, roughness: 0.45 }),
      mesh: new THREE.MeshStandardMaterial({ color: '#141312', metalness: 0.2, roughness: 0.9 }),
      cable: new THREE.MeshStandardMaterial({ color: '#0d0d0d', roughness: 0.6 }),
      flag: new THREE.MeshStandardMaterial({
        map: plaqueTexture(['PÍO XII', 'SIGLO XX'], { bg: '#8f1d12', fg: '#f4e7c9', w: 512, h: 300 }),
        roughness: 0.5,
      }),
      flagTop: new THREE.MeshStandardMaterial({ color: '#7a170e', roughness: 0.5 }),
    }),
    [],
  );

  const baseGeo = useMemo(() => {
    const pts = [
      [0, 0], [0.55, 0], [0.56, 0.03], [0.5, 0.08], [0.32, 0.14], [0.12, 0.2], [0.06, 0.24], [0, 0.25],
    ].map(([x, y]) => new THREE.Vector2(x, y));
    return new THREE.LatheGeometry(pts, 48);
  }, []);

  const cableGeo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 1.9, -0.05),
      new THREE.Vector3(0.05, 1.5, -0.08),
      new THREE.Vector3(0.06, 0.8, -0.08),
      new THREE.Vector3(0.1, 0.25, -0.15),
      new THREE.Vector3(0.45, 0.04, -0.5),
      new THREE.Vector3(1.0, 0.02, -0.7),
    ]);
    return new THREE.TubeGeometry(curve, 80, 0.018, 8, false);
  }, []);

  // anillos de la rejilla siguiendo el perfil de la cápsula
  const rings = useMemo(() => {
    const out: { y: number; r: number }[] = [];
    const half = 0.42;
    for (let i = 0; i <= 20; i++) {
      const y = -half + (i / 20) * half * 2;
      const k = Math.abs(y) / half;
      const r = 0.21 * Math.sqrt(Math.max(0.05, 1 - Math.pow(Math.max(0, k - 0.45) / 0.55, 2)));
      out.push({ y, r });
    }
    return out;
  }, []);

  return (
    <group {...props}>
      {/* Base de hierro fundido */}
      <mesh geometry={baseGeo} material={mats.iron} castShadow receiveShadow />
      {/* Vástago */}
      <mesh position={[0, 1.0, 0]} material={mats.chrome} castShadow>
        <cylinderGeometry args={[0.03, 0.035, 1.8, 20]} />
      </mesh>
      <mesh position={[0, 0.5, 0]} material={mats.darkChrome}>
        <cylinderGeometry args={[0.045, 0.045, 0.08, 20]} />
      </mesh>

      {/* Bandera de la emisora */}
      <group position={[0, 1.55, 0]}>
        <mesh material={[mats.flag, mats.flag, mats.flagTop, mats.flagTop, mats.flag, mats.flag]} castShadow>
          <boxGeometry args={[0.34, 0.2, 0.34]} />
        </mesh>
      </group>

      {/* Horquilla */}
      <group position={[0, 2.22, 0]}>
        <mesh rotation={[0, 0, Math.PI]} position={[0, 0.02, 0]} material={mats.chrome}>
          <torusGeometry args={[0.27, 0.022, 12, 40, Math.PI]} />
        </mesh>
        <mesh position={[0, -0.27, 0]} material={mats.chrome}>
          <cylinderGeometry args={[0.03, 0.03, 0.12, 12]} />
        </mesh>
        {/* Cápsula */}
        <group rotation={[0, 0, 0]}>
          <mesh material={mats.mesh} castShadow>
            <capsuleGeometry args={[0.19, 0.5, 12, 32]} />
          </mesh>
          {rings.map((r, i) => (
            <mesh key={i} position={[0, r.y, 0]} rotation={[Math.PI / 2, 0, 0]} material={i % 5 === 0 ? mats.darkChrome : mats.chrome}>
              <torusGeometry args={[r.r, i % 5 === 0 ? 0.012 : 0.007, 8, 40]} />
            </mesh>
          ))}
          <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={mats.chrome}>
            <cylinderGeometry args={[0.035, 0.035, 0.6, 16]} />
          </mesh>
          <mesh position={[0, 0.47, 0]} material={mats.chrome}>
            <sphereGeometry args={[0.035, 16, 16]} />
          </mesh>
        </group>
      </group>

      <mesh geometry={cableGeo} material={mats.cable} />
    </group>
  );
}
