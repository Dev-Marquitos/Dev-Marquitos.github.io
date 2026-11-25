import { useMemo, useRef } from 'react';
import { useFrame, type ThreeElements } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { paperWrapTexture } from '../textures/procedural';

type Props = ThreeElements['group'] & { lights?: boolean; particles?: boolean };

/** Cartuchos de dinamita atados: herramienta de trabajo y símbolo de protesta minera. */
export function Dynamite({ lights = true, particles = true, ...props }: Props) {
  const spark = useRef<THREE.PointLight>(null);
  const tip = useRef<THREE.Mesh>(null);

  const mats = useMemo(
    () => ({
      paper: new THREE.MeshStandardMaterial({ map: paperWrapTexture(), roughness: 0.85 }),
      cap: new THREE.MeshStandardMaterial({ color: '#7d2416', roughness: 0.9 }),
      string: new THREE.MeshStandardMaterial({ color: '#b89a6a', roughness: 1 }),
      fuse: new THREE.MeshStandardMaterial({ color: '#2b2622', roughness: 0.9 }),
      ember: new THREE.MeshBasicMaterial({ color: '#ffb347', toneMapped: false }),
    }),
    [],
  );

  const sticks = useMemo(() => {
    const r = 0.19;
    const out: [number, number][] = [[0, 0]];
    for (let i = 0; i < 6; i++) out.push([Math.cos((i / 6) * Math.PI * 2) * r, Math.sin((i / 6) * Math.PI * 2) * r]);
    return out;
  }, []);

  const fuseGeo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.45, 0),
      new THREE.Vector3(0.02, 0.65, 0.02),
      new THREE.Vector3(0.18, 0.82, 0.08),
      new THREE.Vector3(0.36, 0.86, 0.06),
    ]);
    return new THREE.TubeGeometry(curve, 40, 0.012, 8, false);
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const f = 0.7 + Math.random() * 0.6;
    if (spark.current) spark.current.intensity = 1.6 * f;
    if (tip.current) tip.current.scale.setScalar(0.8 + Math.sin(t * 40) * 0.2 + Math.random() * 0.2);
  });

  return (
    <group {...props}>
      {sticks.map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh material={[mats.paper, mats.cap, mats.cap]} castShadow receiveShadow>
            <cylinderGeometry args={[0.09, 0.09, 0.86, 28]} />
          </mesh>
        </group>
      ))}
      {[-0.22, 0.22].map((y) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]} material={mats.string}>
          <torusGeometry args={[0.285, 0.014, 8, 48]} />
        </mesh>
      ))}
      <mesh geometry={fuseGeo} material={mats.fuse} />
      <group position={[0.36, 0.86, 0.06]}>
        <mesh ref={tip} material={mats.ember}>
          <sphereGeometry args={[0.022, 10, 10]} />
        </mesh>
        {lights && <pointLight ref={spark} color="#ff9a3c" distance={2.5} decay={2} intensity={1.6} />}
        {particles && <Sparkles count={16} scale={0.25} size={2.2} speed={2.5} color="#ffc070" noise={1} />}
      </group>
    </group>
  );
}
