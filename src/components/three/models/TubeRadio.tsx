import { useMemo, useRef, type RefObject } from 'react';
import { useFrame, type ThreeElements } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { dialTexture, fabricTexture, woodTexture } from '../textures/procedural';

export interface RadioDrive {
  /** posición de la aguja 0..1 */
  needle: number;
  /** brillo del dial 0..1+ */
  glow: number;
  /** sintonía 0..1 (abre el "ojo mágico") */
  tuned: number;
}

type Props = ThreeElements['group'] & {
  drive?: RefObject<RadioDrive>;
  /** animación automática si no se provee `drive` */
  idle?: boolean;
  /** brillo reducido (sala del museo) */
  dim?: boolean;
};

function knobGeometry(radius = 0.12) {
  const pts = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(radius * 1.05, 0),
    new THREE.Vector2(radius * 1.1, radius * 0.15),
    new THREE.Vector2(radius, radius * 0.7),
    new THREE.Vector2(radius * 0.92, radius * 0.95),
    new THREE.Vector2(radius * 0.6, radius * 1.05),
    new THREE.Vector2(0, radius * 1.08),
  ];
  const g = new THREE.LatheGeometry(pts, 40);
  g.rotateX(Math.PI / 2);
  return g;
}

export function TubeRadio({ drive, idle = true, dim = false, ...props }: Props) {
  const needleRef = useRef<THREE.Mesh>(null);
  const dialMat = useRef<THREE.MeshStandardMaterial>(null);
  const eyeWedge = useRef<THREE.Mesh>(null);
  const backLight = useRef<THREE.PointLight>(null);
  const dialLight = useRef<THREE.PointLight>(null);
  const tuneKnob = useRef<THREE.Mesh>(null);

  const mats = useMemo(() => {
    const wood = woodTexture('walnut');
    return {
      cabinet: new THREE.MeshPhysicalMaterial({ map: wood, roughness: 0.42, clearcoat: 0.85, clearcoatRoughness: 0.18, color: '#ffffff' }),
      bezel: new THREE.MeshPhysicalMaterial({ map: woodTexture('dark'), roughness: 0.35, clearcoat: 0.7, clearcoatRoughness: 0.2 }),
      fabric: new THREE.MeshStandardMaterial({ map: fabricTexture(), roughness: 0.95, metalness: 0 }),
      slat: new THREE.MeshPhysicalMaterial({ map: woodTexture('oak'), roughness: 0.4, clearcoat: 0.6 }),
      brass: new THREE.MeshStandardMaterial({ color: '#c9a25a', metalness: 1, roughness: 0.28 }),
      bakelite: new THREE.MeshPhysicalMaterial({ color: '#1d130c', roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.12 }),
      glass: new THREE.MeshPhysicalMaterial({ color: '#ffffff', transparent: true, opacity: 0.1, roughness: 0.08, metalness: 0, clearcoat: 0.4, envMapIntensity: 0.15 }),
      needle: new THREE.MeshStandardMaterial({ color: '#7a0d05', emissive: '#ff2a10', emissiveIntensity: 1.6 }),
      eye: new THREE.MeshStandardMaterial({ color: '#0a2a14', emissive: '#3dff8b', emissiveIntensity: 2.4 }),
      eyeDark: new THREE.MeshBasicMaterial({ color: '#04140a' }),
      foot: new THREE.MeshStandardMaterial({ color: '#111', roughness: 0.8 }),
    };
  }, []);

  const knobGeo = useMemo(() => knobGeometry(0.12), []);
  const smallKnobGeo = useMemo(() => knobGeometry(0.09), []);
  const dialTex = useMemo(() => dialTexture(), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const d = drive?.current ?? {
      needle: idle ? 0.33 + Math.sin(t * 0.25) * 0.02 : 0.33,
      glow: dim ? 0.55 : 1,
      tuned: 0.9 + Math.sin(t * 2.1) * 0.05,
    };
    if (needleRef.current) {
      needleRef.current.position.x = 0.68 + (-0.496 + d.needle * 0.992);
    }
    if (tuneKnob.current) tuneKnob.current.rotation.z = -d.needle * Math.PI * 3;
    const flicker = 1 + Math.sin(t * 13) * 0.015 + Math.sin(t * 31) * 0.01;
    if (dialMat.current) dialMat.current.emissiveIntensity = 0.25 + d.glow * 1.25 * flicker;
    if (dialLight.current) dialLight.current.intensity = d.glow * 2.2 * flicker;
    if (backLight.current) backLight.current.intensity = d.glow * 7 * flicker;
    if (eyeWedge.current) {
      // el sector oscuro se cierra cuando la emisora está sintonizada
      const open = THREE.MathUtils.lerp(Math.PI * 0.9, Math.PI * 0.08, THREE.MathUtils.clamp(d.tuned, 0, 1));
      const geo = eyeWedge.current.geometry as THREE.CircleGeometry;
      if (Math.abs((geo.parameters?.thetaLength ?? 0) - open) > 0.05) {
        geo.dispose();
        eyeWedge.current.geometry = new THREE.CircleGeometry(0.058, 32, Math.PI / 2 - open / 2, open);
      }
    }
  });

  return (
    <group {...props}>
      {/* Gabinete de nogal lacado */}
      <RoundedBox args={[3, 1.9, 1.3]} radius={0.14} smoothness={5} material={mats.cabinet} castShadow receiveShadow />

      {/* Marco frontal */}
      <RoundedBox args={[2.8, 1.7, 0.08]} radius={0.05} smoothness={3} position={[0, 0, 0.62]} material={mats.bezel} />

      {/* Parlante: tela dorada + listones */}
      <mesh position={[-0.68, 0, 0.665]} material={mats.fabric}>
        <planeGeometry args={[1.22, 1.38]} />
      </mesh>
      {[-1.05, -0.83, -0.61, -0.39].map((x) => (
        <RoundedBox key={x} args={[0.07, 1.38, 0.05]} radius={0.02} smoothness={2} position={[x + 0.06, 0, 0.69]} material={mats.slat} castShadow />
      ))}
      <mesh position={[-0.68, 0.7, 0.69]} material={mats.brass}>
        <boxGeometry args={[1.26, 0.025, 0.03]} />
      </mesh>
      <mesh position={[-0.68, -0.7, 0.69]} material={mats.brass}>
        <boxGeometry args={[1.26, 0.025, 0.03]} />
      </mesh>

      {/* Dial iluminado */}
      <RoundedBox args={[1.25, 0.64, 0.05]} radius={0.04} smoothness={3} position={[0.68, 0.33, 0.66]} material={mats.brass} />
      <mesh position={[0.68, 0.33, 0.69]}>
        <planeGeometry args={[1.15, 0.52]} />
        <meshStandardMaterial ref={dialMat} map={dialTex} emissiveMap={dialTex} emissive="#ffb44a" emissiveIntensity={1.4} roughness={0.6} toneMapped={false} />
      </mesh>
      <mesh ref={needleRef} position={[0.68, 0.33, 0.697]} material={mats.needle}>
        <boxGeometry args={[0.012, 0.47, 0.004]} />
      </mesh>
      <mesh position={[0.68, 0.33, 0.705]} material={mats.glass}>
        <planeGeometry args={[1.17, 0.54]} />
      </mesh>
      <pointLight ref={dialLight} position={[0.68, 0.33, 1.05]} color="#ffae45" distance={3.2} decay={2} intensity={2} />

      {/* Ojo mágico (indicador de sintonía) */}
      <group position={[0.68, -0.1, 0.665]}>
        <mesh material={mats.brass}>
          <torusGeometry args={[0.075, 0.014, 12, 40]} />
        </mesh>
        <mesh position={[0, 0, 0.004]} material={mats.eye}>
          <circleGeometry args={[0.064, 40]} />
        </mesh>
        <mesh ref={eyeWedge} position={[0, 0, 0.007]} material={mats.eyeDark}>
          <circleGeometry args={[0.058, 32, Math.PI / 2 - 0.4, 0.8]} />
        </mesh>
        <mesh position={[0, 0, 0.009]} material={mats.eyeDark}>
          <circleGeometry args={[0.018, 20]} />
        </mesh>
      </group>

      {/* Perillas de baquelita */}
      <mesh position={[0.26, -0.5, 0.66]} geometry={smallKnobGeo} material={mats.bakelite} castShadow />
      <mesh ref={tuneKnob} position={[0.68, -0.5, 0.66]} geometry={knobGeo} material={mats.bakelite} castShadow>
        <mesh position={[0, 0.08, 0.13]} material={mats.brass}>
          <boxGeometry args={[0.018, 0.07, 0.01]} />
        </mesh>
      </mesh>
      <mesh position={[1.1, -0.5, 0.66]} geometry={smallKnobGeo} material={mats.bakelite} castShadow />
      {[0.26, 0.68, 1.1].map((x) => (
        <mesh key={x} position={[x, -0.5, 0.665]} material={mats.brass}>
          <torusGeometry args={[x === 0.68 ? 0.14 : 0.105, 0.008, 8, 40]} />
        </mesh>
      ))}

      {/* Patas */}
      {[[-1.25, -0.5], [1.25, -0.5], [-1.25, 0.5], [1.25, 0.5]].map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x, -1.0, z]} material={mats.foot}>
          <cylinderGeometry args={[0.07, 0.09, 0.12, 16]} />
        </mesh>
      ))}

      {/* Resplandor cálido de las válvulas en la parte trasera */}
      <pointLight ref={backLight} position={[0, 0.2, -1.0]} color="#ff8a2a" distance={5} decay={2} intensity={6} />
    </group>
  );
}
