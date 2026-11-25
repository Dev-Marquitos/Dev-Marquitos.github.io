import { Bloom, EffectComposer, Noise, ToneMapping, Vignette, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction, ToneMappingMode } from 'postprocessing';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useEffect, useMemo } from 'react';

interface Props {
  msaa?: number;
  bloom?: number;
  threshold?: number;
  vignette?: number;
  aberration?: boolean;
  enabled?: boolean;
}

/**
 * Postprocesado cinematográfico compartido por las escenas: bloom en las
 * superficies emisivas (dial, válvulas, llamas), aberración cromática leve,
 * viñeta, grano y mapeo tonal ACES. Si el equipo no rinde, se desactiva y el
 * renderer aplica el mapeo tonal directamente.
 */
export function Effects({ msaa = 4, bloom = 1.1, threshold = 0.82, vignette = 0.72, aberration = true, enabled = true }: Props) {
  const gl = useThree((s) => s.gl);
  const offset = useMemo(() => new THREE.Vector2(0.00035, 0.00025), []);
  const zero = useMemo(() => new THREE.Vector2(0, 0), []);
  useEffect(() => {
    gl.toneMapping = enabled ? THREE.NoToneMapping : THREE.ACESFilmicToneMapping;
  }, [enabled, gl]);
  if (!enabled) return null;
  return (
    <EffectComposer multisampling={msaa}>
      <Bloom mipmapBlur intensity={bloom} luminanceThreshold={threshold} luminanceSmoothing={0.25} radius={0.75} />
      <ChromaticAberration offset={aberration ? offset : zero} radialModulation={false} modulationOffset={0} blendFunction={BlendFunction.NORMAL} />
      <Vignette offset={0.28} darkness={vignette} />
      <Noise premultiply opacity={0.32} blendFunction={BlendFunction.SOFT_LIGHT} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  );
}
