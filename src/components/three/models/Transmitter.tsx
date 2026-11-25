import { useMemo, useRef } from 'react';
import { useFrame, type ThreeElements } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { meterTexture, paintedMetalTexture, plaqueTexture } from '../textures/procedural';

function tubeGeometry() {
  // envolvente de vidrio de una válvula transmisora
  const pts: THREE.Vector2[] = [];
  const profile: [number, number][] = [
    [0, 0], [0.085, 0], [0.09, 0.03], [0.09, 0.1], [0.12, 0.2], [0.13, 0.32], [0.125, 0.45], [0.1, 0.55], [0.05, 0.6], [0.015, 0.64], [0, 0.65],
  ];
  profile.forEach(([x, y]) => pts.push(new THREE.Vector2(x, y)));
  return new THREE.LatheGeometry(pts, 32);
}

type Props = ThreeElements['group'];

export function Transmitter(props: Props) {
  const needleA = useRef<THREE.Group>(null);
  const needleB = useRef<THREE.Group>(null);
  const pilot = useRef<THREE.MeshStandardMaterial>(null);
  const innerLight = useRef<THREE.PointLight>(null);

  const mats = useMemo(
    () => ({
      body: new THREE.MeshStandardMaterial({ map: paintedMetalTexture('#59634f', 11, 0.12), metalness: 0.45, roughness: 0.55 }),
      panel: new THREE.MeshStandardMaterial({ map: paintedMetalTexture('#4b5443', 12, 0.06), metalness: 0.5, roughness: 0.5 }),
      dark: new THREE.MeshStandardMaterial({ color: '#0d0e0c', roughness: 0.9 }),
      chrome: new THREE.MeshStandardMaterial({ color: '#d8d8d2', metalness: 1, roughness: 0.18 }),
      black: new THREE.MeshPhysicalMaterial({ color: '#141210', roughness: 0.3, clearcoat: 1 }),
      glass: new THREE.MeshPhysicalMaterial({ color: '#e8f0ff', transparent: true, opacity: 0.16, roughness: 0.05, metalness: 0.1, clearcoat: 0.6, depthWrite: false, envMapIntensity: 0.3 }),
      plate: new THREE.MeshStandardMaterial({ color: '#6c6c66', metalness: 0.9, roughness: 0.35 }),
      ceramic: new THREE.MeshPhysicalMaterial({ color: '#efe9da', roughness: 0.25, clearcoat: 0.8 }),
      needle: new THREE.MeshBasicMaterial({ color: '#111' }),
      filament: new THREE.MeshStandardMaterial({ color: '#ff7a1a', emissive: '#ff6a10', emissiveIntensity: 2.6, toneMapped: false }),
      warn: new THREE.MeshStandardMaterial({ map: plaqueTexture(['ALTA TENSIÓN', '5 000 V · PELIGRO'], { bg: '#e8b923', fg: '#1a1205' }), roughness: 0.6 }),
      name: new THREE.MeshStandardMaterial({ map: plaqueTexture(['TRANSMISOR', 'ONDA CORTA · 49 m'], { bg: '#bfa16a' }), metalness: 0.6, roughness: 0.35 }),
    }),
    [],
  );
  const meterA = useMemo(() => meterTexture('PLACA'), []);
  const meterB = useMemo(() => meterTexture('ANTENA', false), []);
  const tubeGeo = useMemo(() => tubeGeometry(), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const mod = 0.5 + Math.sin(t * 3.1) * 0.12 + Math.sin(t * 7.7) * 0.08 + (Math.random() - 0.5) * 0.04;
    if (needleA.current) needleA.current.rotation.z = THREE.MathUtils.lerp(0.55, -0.55, mod);
    if (needleB.current) needleB.current.rotation.z = THREE.MathUtils.lerp(0.55, -0.55, 0.62 + Math.sin(t * 0.7) * 0.05);
    const glow = 2.6 + Math.sin(t * 9) * 0.15 + Math.random() * 0.12;
    mats.filament.emissiveIntensity = glow;
    if (innerLight.current) innerLight.current.intensity = glow * 1.3;
    if (pilot.current) pilot.current.emissiveIntensity = Math.sin(t * 2.4) > 0 ? 3 : 0.4;
  });

  return (
    <group {...props}>
      {/* Gabinete: cuerpo trasero + paneles frontales que dejan abierta la ventana de válvulas */}
      <RoundedBox args={[1.5, 2.9, 0.62]} radius={0.04} smoothness={3} position={[0, 0, -0.19]} material={mats.body} castShadow receiveShadow />
      <mesh position={[0, 1.05, 0.31]} material={mats.body} castShadow>
        <boxGeometry args={[1.5, 0.8, 0.38]} />
      </mesh>
      <mesh position={[0, -0.75, 0.31]} material={mats.body} castShadow>
        <boxGeometry args={[1.5, 1.4, 0.38]} />
      </mesh>
      {[-0.655, 0.655].map((x) => (
        <mesh key={x} position={[x, 0.3, 0.31]} material={mats.body}>
          <boxGeometry args={[0.19, 0.7, 0.38]} />
        </mesh>
      ))}

      {/* Divisiones del rack */}
      {[0.72, -0.12, -0.86].map((y) => (
        <mesh key={y} position={[0, y, 0.503]} material={mats.dark}>
          <boxGeometry args={[1.44, 0.018, 0.01]} />
        </mesh>
      ))}

      {/* Instrumentos analógicos */}
      {[
        { x: -0.36, tex: meterA, ref: needleA },
        { x: 0.36, tex: meterB, ref: needleB },
      ].map((m) => (
        <group key={m.x} position={[m.x, 1.08, 0.505]}>
          <mesh material={mats.black}>
            <torusGeometry args={[0.22, 0.03, 12, 48]} />
          </mesh>
          <mesh position={[0, 0, 0.005]}>
            <circleGeometry args={[0.21, 48]} />
            <meshStandardMaterial map={m.tex} emissiveMap={m.tex} emissive="#fff1c8" emissiveIntensity={0.35} roughness={0.7} />
          </mesh>
          <group ref={m.ref} position={[0, -0.12, 0.012]}>
            <mesh position={[0, 0.13, 0]} material={mats.needle}>
              <boxGeometry args={[0.008, 0.26, 0.004]} />
            </mesh>
          </group>
          <mesh position={[0, 0, 0.02]} material={mats.glass}>
            <circleGeometry args={[0.21, 48]} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.83, 0.506]} material={mats.name}>
        <planeGeometry args={[0.6, 0.18]} />
      </mesh>

      {/* Ventana de válvulas */}
      <group position={[0, 0.3, 0.3]}>
        <mesh position={[0, 0, -0.17]} material={mats.dark}>
          <planeGeometry args={[1.12, 0.7]} />
        </mesh>
        {[-0.39, -0.13, 0.13, 0.39].map((x) => (
          <group key={x} position={[x, -0.33, 0]}>
            <mesh geometry={tubeGeo} material={mats.glass} />
            <mesh position={[0, 0.28, 0]} material={mats.plate}>
              <cylinderGeometry args={[0.055, 0.055, 0.3, 16, 1, true]} />
            </mesh>
            <mesh position={[0, 0.28, 0]} material={mats.filament}>
              <cylinderGeometry args={[0.012, 0.012, 0.26, 8]} />
            </mesh>
            <mesh position={[0, 0.02, 0]} material={mats.black}>
              <cylinderGeometry args={[0.1, 0.1, 0.05, 20]} />
            </mesh>
          </group>
        ))}
        <pointLight ref={innerLight} position={[0, 0, 0.2]} color="#ff8030" distance={2.2} decay={2} intensity={3} />
      </group>
      <mesh position={[0, 0.3, 0.505]} material={mats.glass}>
        <planeGeometry args={[1.14, 0.72]} />
      </mesh>

      {/* Mandos */}
      {[-0.45, 0, 0.45].map((x) => (
        <group key={x} position={[x, -0.45, 0.52]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh material={mats.black}>
            <cylinderGeometry args={[0.12, 0.13, 0.09, 32]} />
          </mesh>
          <mesh position={[0, 0.05, 0]} material={mats.chrome}>
            <cylinderGeometry args={[0.06, 0.06, 0.02, 24]} />
          </mesh>
        </group>
      ))}
      {[-0.2, 0.2].map((x) => (
        <group key={x} position={[x, -0.7, 0.51]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} material={mats.chrome}>
            <cylinderGeometry args={[0.03, 0.03, 0.03, 16]} />
          </mesh>
          <mesh position={[0, 0.04, 0.04]} rotation={[0.6, 0, 0]} material={mats.chrome}>
            <cylinderGeometry args={[0.008, 0.012, 0.1, 8]} />
          </mesh>
        </group>
      ))}
      <mesh position={[0.6, -0.7, 0.52]}>
        <sphereGeometry args={[0.035, 16, 16]} />
        <meshStandardMaterial ref={pilot} color="#600" emissive="#ff2a1a" emissiveIntensity={3} toneMapped={false} />
      </mesh>
      <mesh position={[-0.5, -0.7, 0.506]} material={mats.warn}>
        <planeGeometry args={[0.36, 0.12]} />
      </mesh>

      {/* Rejillas de ventilación */}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={i} position={[0, -1.05 - i * 0.045, 0.503]} material={mats.dark}>
          <boxGeometry args={[1.1, 0.018, 0.01]} />
        </mesh>
      ))}

      {/* Aislador de salida de antena */}
      <group position={[0.4, 1.45, 0]}>
        {[0, 0.07, 0.14, 0.21].map((y) => (
          <mesh key={y} position={[0, y + 0.04, 0]} material={mats.ceramic}>
            <cylinderGeometry args={[0.07, 0.085, 0.05, 20]} />
          </mesh>
        ))}
        <mesh position={[0, 0.4, 0]} material={mats.chrome}>
          <cylinderGeometry args={[0.012, 0.012, 0.35, 8]} />
        </mesh>
      </group>
    </group>
  );
}
