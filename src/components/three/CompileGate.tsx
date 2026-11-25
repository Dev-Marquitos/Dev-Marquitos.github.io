import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';

/**
 * Compila todos los shaders de la escena en paralelo (KHR_parallel_shader_compile
 * mediante `renderer.compileAsync`) antes del primer cuadro. Sin esto, la primera
 * imagen compila decenas de programas de golpe y la página se congela varios
 * segundos en GPU modestas. Debe ir dentro del <Suspense> de la escena para
 * ejecutarse cuando todos los modelos ya cargaron.
 */
export function CompileGate({ onReady }: { onReady: () => void }) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  useEffect(() => {
    let alive = true;
    const t = window.setTimeout(async () => {
      try {
        await gl.compileAsync(scene, camera);
      } catch {
        /* sin soporte: los shaders se compilan al renderizar */
      }
      if (alive) onReady();
    }, 0);
    return () => {
      alive = false;
      window.clearTimeout(t);
    };
  }, [gl, scene, camera, onReady]);
  return null;
}
