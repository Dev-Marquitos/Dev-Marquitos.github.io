import { useMemo, useRef } from 'react';
import { useFrame, type ThreeElements } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Modelos fotogramétricos de Poly Haven (licencia CC0) usados como utilería.
 * Se sirven desde /public/models para que el sitio funcione sin conexión.
 */
import { PROP_URLS } from './propUrls';

type G = ThreeElements['group'];

function useCloned(url: string, shadows = true) {
  const { scene } = useGLTF(url);
  return useMemo(() => {
    const c = scene.clone(true);
    c.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) {
        m.castShadow = shadows;
        m.receiveShadow = true;
      }
    });
    return c;
  }, [scene, shadows]);
}

export function GltfProp({ url, ...props }: G & { url: string }) {
  const obj = useCloned(url);
  return (
    <group {...props}>
      <primitive object={obj} />
    </group>
  );
}

/** Farol de queroseno con llama viva. */
export function Lantern({ lit = true, intensity = 2.4, distance = 1.6, ...props }: G & { lit?: boolean; intensity?: number; distance?: number }) {
  const obj = useCloned(PROP_URLS.lantern);
  const light = useRef<THREE.PointLight>(null);
  const flame = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const f = 1 + Math.sin(t * 11) * 0.06 + Math.sin(t * 23 + 2) * 0.05 + (Math.random() - 0.5) * 0.06;
    if (light.current) light.current.intensity = intensity * f;
    if (flame.current) flame.current.scale.set(1, f, 1);
  });
  return (
    <group {...props}>
      <primitive object={obj} />
      {lit && (
        <>
          <mesh ref={flame} position={[0, 0.125, 0]}>
            <coneGeometry args={[0.009, 0.035, 10]} />
            <meshBasicMaterial color="#ffcf7a" toneMapped={false} />
          </mesh>
          <pointLight ref={light} position={[0, 0.14, 0]} color="#ffb060" intensity={intensity} distance={distance} decay={2} castShadow={false} />
        </>
      )}
    </group>
  );
}

useGLTF.preload(PROP_URLS.lantern);
