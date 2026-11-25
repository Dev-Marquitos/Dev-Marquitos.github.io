import { useLayoutEffect, useMemo, useRef } from 'react';
import type { ThreeElements } from '@react-three/fiber';
import * as THREE from 'three';
import { paintedMetalTexture, woodTexture } from '../textures/procedural';

type Props = ThreeElements['group'];

/** Carro minero (vagoneta) sobre rieles, cargado de mineral de estaño. */
export function MineCart(props: Props) {
  const ore = useRef<THREE.InstancedMesh>(null);
  const rivets = useRef<THREE.InstancedMesh>(null);

  const mats = useMemo(
    () => ({
      body: new THREE.MeshStandardMaterial({ map: paintedMetalTexture('#4d4640', 51, 0.62), metalness: 0.55, roughness: 0.7, side: THREE.DoubleSide }),
      iron: new THREE.MeshStandardMaterial({ color: '#2a2724', metalness: 0.8, roughness: 0.5 }),
      rail: new THREE.MeshStandardMaterial({ color: '#7a756e', metalness: 0.9, roughness: 0.35 }),
      sleeper: new THREE.MeshStandardMaterial({ map: woodTexture('dark'), roughness: 0.9 }),
      ore: new THREE.MeshStandardMaterial({ color: '#3b342d', metalness: 0.35, roughness: 0.55, flatShading: true }),
    }),
    [],
  );

  // tolva trapezoidal: más ancha arriba
  const hopper = useMemo(() => {
    const L = 1.6, Wb = 0.8, Wt = 1.05, H = 0.7;
    const shape = new THREE.Shape();
    shape.moveTo(-Wb / 2, 0);
    shape.lineTo(Wb / 2, 0);
    shape.lineTo(Wt / 2, H);
    shape.lineTo(-Wt / 2, H);
    shape.closePath();
    const end = new THREE.ExtrudeGeometry(shape, { depth: 0.04, bevelEnabled: false });
    return { L, Wb, Wt, H, end };
  }, []);

  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3();
    const p = new THREE.Vector3();
    if (ore.current) {
      for (let i = 0; i < 46; i++) {
        const r = Math.random();
        p.set((Math.random() - 0.5) * 0.9, 0.72 + Math.random() * 0.16 - Math.abs(r - 0.5) * 0.1, (Math.random() - 0.5) * 1.45);
        q.setFromEuler(new THREE.Euler(Math.random() * 3, Math.random() * 3, Math.random() * 3));
        const k = 0.07 + Math.random() * 0.1;
        s.set(k, k * (0.7 + Math.random() * 0.5), k);
        m.compose(p, q, s);
        ore.current.setMatrixAt(i, m);
      }
      ore.current.instanceMatrix.needsUpdate = true;
    }
    if (rivets.current) {
      let i = 0;
      for (const side of [-1, 1]) {
        for (let k = 0; k < 9; k++) {
          const z = -0.72 + k * 0.18;
          for (const y of [0.12, 0.6]) {
            const w = (hopper.Wb + (hopper.Wt - hopper.Wb) * (y / hopper.H)) / 2 + 0.012;
            p.set(side * w, y, z);
            m.compose(p, q.identity(), s.set(1, 1, 1));
            rivets.current.setMatrixAt(i++, m);
          }
        }
      }
      rivets.current.count = i;
      rivets.current.instanceMatrix.needsUpdate = true;
    }
  }, [hopper]);

  const sideAngle = Math.atan2((hopper.Wt - hopper.Wb) / 2, hopper.H);
  const sideLen = Math.hypot((hopper.Wt - hopper.Wb) / 2, hopper.H);

  return (
    <group {...props}>
      {/* Rieles y durmientes */}
      {[-0.42, 0.42].map((x) => (
        <mesh key={x} position={[x, -0.36, 0]} material={mats.rail} receiveShadow>
          <boxGeometry args={[0.06, 0.08, 4.2]} />
        </mesh>
      ))}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={i} position={[0, -0.43, -1.85 + i * 0.53]} material={mats.sleeper} receiveShadow>
          <boxGeometry args={[1.3, 0.07, 0.2]} />
        </mesh>
      ))}

      {/* Ruedas y ejes */}
      {[-0.55, 0.55].map((z) => (
        <group key={z} position={[0, -0.12, z]}>
          <mesh rotation={[0, 0, Math.PI / 2]} material={mats.iron}>
            <cylinderGeometry args={[0.035, 0.035, 1.0, 12]} />
          </mesh>
          {[-0.42, 0.42].map((x) => (
            <group key={x} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <mesh material={mats.iron} castShadow>
                <cylinderGeometry args={[0.2, 0.2, 0.07, 28]} />
              </mesh>
              <mesh position={[0, x > 0 ? -0.04 : 0.04, 0]} material={mats.iron}>
                <cylinderGeometry args={[0.235, 0.235, 0.02, 28]} />
              </mesh>
            </group>
          ))}
        </group>
      ))}

      {/* Chasis */}
      {[-0.3, 0.3].map((x) => (
        <mesh key={x} position={[x, 0.04, 0]} material={mats.iron} castShadow>
          <boxGeometry args={[0.08, 0.1, 1.75]} />
        </mesh>
      ))}

      {/* Tolva */}
      <group position={[0, 0.1, 0]}>
        <mesh position={[0, 0.02, 0]} material={mats.body} castShadow receiveShadow>
          <boxGeometry args={[hopper.Wb, 0.04, hopper.L]} />
        </mesh>
        {[-1, 1].map((side) => (
          <mesh
            key={side}
            position={[side * ((hopper.Wb + hopper.Wt) / 4), hopper.H / 2, 0]}
            rotation={[0, 0, -side * sideAngle]}
            material={mats.body}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[0.04, sideLen, hopper.L]} />
          </mesh>
        ))}
        <mesh position={[0, 0, hopper.L / 2 - 0.04]} geometry={hopper.end} material={mats.body} castShadow />
        <mesh position={[0, 0, -hopper.L / 2]} geometry={hopper.end} material={mats.body} castShadow />
        {/* Borde superior reforzado */}
        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * (hopper.Wt / 2 + 0.01), hopper.H, 0]} material={mats.iron}>
            <boxGeometry args={[0.06, 0.05, hopper.L + 0.04]} />
          </mesh>
        ))}
        <instancedMesh ref={rivets} args={[undefined, undefined, 40]} material={mats.iron}>
          <sphereGeometry args={[0.022, 8, 6]} />
        </instancedMesh>
        <instancedMesh ref={ore} args={[undefined, undefined, 46]} material={mats.ore} castShadow>
          <icosahedronGeometry args={[1, 0]} />
        </instancedMesh>
      </group>

      {/* Enganche */}
      <mesh position={[0, 0.05, 0.98]} rotation={[Math.PI / 2, 0, 0]} material={mats.iron}>
        <torusGeometry args={[0.07, 0.018, 8, 20]} />
      </mesh>
    </group>
  );
}
