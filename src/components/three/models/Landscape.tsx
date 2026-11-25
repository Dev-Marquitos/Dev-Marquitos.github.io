import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame, type ThreeElements } from '@react-three/fiber';
import * as THREE from 'three';

/* ------------------------------ utilidades ------------------------------ */

function beam(a: THREE.Vector3, b: THREE.Vector3, thickness: number) {
  const dir = new THREE.Vector3().subVectors(b, a);
  const len = dir.length();
  const mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  return { mid, q, len, thickness };
}

type Beam = ReturnType<typeof beam>;

function Beams({ beams, material }: { beams: Beam[]; material: THREE.Material }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    if (!ref.current) return;
    const m = new THREE.Matrix4();
    beams.forEach((b, i) => {
      m.compose(b.mid, b.q, new THREE.Vector3(b.thickness, b.len, b.thickness));
      ref.current!.setMatrixAt(i, m);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  }, [beams]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, beams.length]} material={material}>
      <boxGeometry args={[1, 1, 1]} />
    </instancedMesh>
  );
}

/* --------------------------- castillo minero --------------------------- */

type G = ThreeElements['group'];

export function Headframe({ color = '#0d0c0b', ...props }: G & { color?: string }) {
  const wheel = useRef<THREE.Group>(null);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color, roughness: 0.9, metalness: 0.2 }), [color]);
  const beams = useMemo(() => {
    const out: Beam[] = [];
    const H = 7, base = 1.6, top = 0.6;
    const corners = (y: number) => {
      const w = base + (top - base) * (y / H);
      return [
        new THREE.Vector3(-w, y, -w),
        new THREE.Vector3(w, y, -w),
        new THREE.Vector3(w, y, w),
        new THREE.Vector3(-w, y, w),
      ];
    };
    const levels = [0, 1.4, 2.8, 4.2, 5.6, 7];
    for (let l = 0; l < levels.length - 1; l++) {
      const a = corners(levels[l]);
      const b = corners(levels[l + 1]);
      for (let i = 0; i < 4; i++) {
        out.push(beam(a[i], b[i], 0.12));
        out.push(beam(b[i], b[(i + 1) % 4], 0.08));
        out.push(beam(a[i], b[(i + 1) % 4], 0.05));
        out.push(beam(a[(i + 1) % 4], b[i], 0.05));
      }
    }
    // patas traseras inclinadas (tornapuntas)
    out.push(beam(new THREE.Vector3(-0.6, 7, -0.6), new THREE.Vector3(-1.2, 0, -5), 0.14));
    out.push(beam(new THREE.Vector3(0.6, 7, -0.6), new THREE.Vector3(1.2, 0, -5), 0.14));
    out.push(beam(new THREE.Vector3(-0.9, 3.5, -2.8), new THREE.Vector3(0.9, 3.5, -2.8), 0.07));
    return out;
  }, []);
  useFrame((_, d) => {
    if (wheel.current) wheel.current.rotation.z -= d * 0.35;
  });
  return (
    <group {...props}>
      <Beams beams={beams} material={mat} />
      <mesh position={[0, 7.1, 0]} material={mat}>
        <boxGeometry args={[1.6, 0.12, 1.6]} />
      </mesh>
      {/* rueda de la polea (vista de frente) */}
      <group ref={wheel} position={[0, 7.95, 0.2]}>
        <mesh material={mat}>
          <torusGeometry args={[0.85, 0.07, 8, 40]} />
        </mesh>
        <mesh material={mat}>
          <cylinderGeometry args={[0.12, 0.12, 0.2, 12]} />
        </mesh>
        {Array.from({ length: 6 }).map((_, i) => (
          <mesh key={i} rotation={[0, 0, (i / 6) * Math.PI]} material={mat}>
            <boxGeometry args={[1.7, 0.05, 0.05]} />
          </mesh>
        ))}
      </group>
      {/* cables de la jaula bajando al pique */}
      <mesh position={[-0.85, 4, 0.2]} material={mat}>
        <boxGeometry args={[0.02, 7.9, 0.02]} />
      </mesh>
    </group>
  );
}

/* --------------------------- torre de antena --------------------------- */

export function AntennaTower({ height = 12, ...props }: G & { height?: number }) {
  const beacon = useRef<THREE.MeshBasicMaterial>(null);
  const light = useRef<THREE.PointLight>(null);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#0e0d0c', roughness: 0.9 }), []);
  const beams = useMemo(() => {
    const out: Beam[] = [];
    const r = (y: number) => 0.55 - (y / height) * 0.35;
    const pts = (y: number) => [0, 1, 2].map((i) => new THREE.Vector3(Math.cos((i / 3) * Math.PI * 2) * r(y), y, Math.sin((i / 3) * Math.PI * 2) * r(y)));
    const step = 0.9;
    for (let y = 0; y < height - 0.01; y += step) {
      const a = pts(y);
      const b = pts(Math.min(height, y + step));
      for (let i = 0; i < 3; i++) {
        out.push(beam(a[i], b[i], 0.06));
        out.push(beam(a[i], b[(i + 1) % 3], 0.025));
        out.push(beam(b[i], b[(i + 1) % 3], 0.03));
      }
    }
    return out;
  }, [height]);
  useFrame((state) => {
    const on = Math.sin(state.clock.elapsedTime * 2.2) > 0.2;
    if (beacon.current) beacon.current.color.set(on ? '#ff3b26' : '#3a0905');
    if (light.current) light.current.intensity = on ? 6 : 0.2;
  });
  return (
    <group {...props}>
      <Beams beams={beams} material={mat} />
      <mesh position={[0, height + 0.15, 0]}>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshBasicMaterial ref={beacon} color="#ff3b26" toneMapped={false} />
      </mesh>
      <pointLight ref={light} position={[0, height + 0.15, 0]} color="#ff3b26" distance={6} intensity={6} />
    </group>
  );
}

/* ------------------------- cerros en capas ------------------------- */

function ridgeShape(width: number, base: number, peak: number, seed: number, rough = 1) {
  const shape = new THREE.Shape();
  shape.moveTo(-width / 2, -base);
  const steps = 90;
  let s = seed;
  const rand = () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
  const phases = [rand() * 10, rand() * 10, rand() * 10];
  for (let i = 0; i <= steps; i++) {
    const x = -width / 2 + (width * i) / steps;
    const u = i / steps;
    const h =
      peak * (0.55 + 0.3 * Math.sin(u * 5.1 + phases[0]) + 0.18 * Math.sin(u * 13.7 + phases[1]) * rough + 0.08 * Math.sin(u * 37 + phases[2]) * rough) +
      (rand() - 0.5) * 0.25 * rough;
    shape.lineTo(x, Math.max(0.2, h));
  }
  shape.lineTo(width / 2, -base);
  shape.closePath();
  return new THREE.ShapeGeometry(shape);
}

export function Mountains(props: G) {
  const layers = useMemo(
    () => [
      { z: -70, y: -2, w: 220, peak: 16, color: '#1a2233', seed: 11, rough: 0.6 },
      { z: -48, y: -2.5, w: 170, peak: 11, color: '#141a26', seed: 23, rough: 0.9 },
      { z: -30, y: -3, w: 120, peak: 7, color: '#0e121a', seed: 37, rough: 1.1 },
      { z: -18, y: -3.4, w: 80, peak: 3.6, color: '#0a0c11', seed: 51, rough: 1.3 },
    ],
    [],
  );
  return (
    <group {...props}>
      {layers.map((l) => (
        <mesh key={l.seed} position={[0, l.y, l.z]} geometry={ridgeShape(l.w, 20, l.peak, l.seed, l.rough)}>
          <meshBasicMaterial color={l.color} fog />
        </mesh>
      ))}
    </group>
  );
}

/* --------------------------- luces del campamento --------------------------- */

export function CampLights({ count = 140, spread = 46, z = -22, y = -2.4, ...props }: G & { count?: number; spread?: number; z?: number; y?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const seeds = useMemo(() => Array.from({ length: count }, () => Math.random() * 100), [count]);
  const base = useMemo(
    () =>
      Array.from({ length: count }, () => {
        // concentradas en el "pueblo" con caserío disperso
        const cluster = Math.random() < 0.7;
        const x = cluster ? (Math.random() - 0.5) * spread * 0.35 + 6 : (Math.random() - 0.5) * spread;
        const yy = y + Math.random() * (cluster ? 1.6 : 2.6);
        return new THREE.Vector3(x, yy, z + (Math.random() - 0.5) * 6);
      }),
    [count, spread, y, z],
  );
  const color = useMemo(() => new THREE.Color(), []);
  useLayoutEffect(() => {
    if (!ref.current) return;
    const m = new THREE.Matrix4();
    base.forEach((p, i) => {
      const s = 0.04 + Math.random() * 0.06;
      m.makeScale(s, s, s).setPosition(p);
      ref.current!.setMatrixAt(i, m);
      ref.current!.setColorAt(i, color.set(Math.random() < 0.85 ? '#ffb85c' : '#e8f0ff'));
    });
    ref.current.instanceMatrix.needsUpdate = true;
    if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true;
  }, [base, color]);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    // parpadeo ocasional de algunas luces
    for (let k = 0; k < 4; k++) {
      const i = Math.floor((t * 7 + seeds[k] * 13 + k * 31) % count);
      const on = Math.sin(t * 3 + seeds[i]) > -0.6;
      ref.current.setColorAt(i, color.set(on ? '#ffb85c' : '#3a2410'));
    }
    if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true;
  });
  return (
    <group {...props}>
      <instancedMesh ref={ref} args={[undefined, undefined, count]}>
        <sphereGeometry args={[1, 6, 6]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
    </group>
  );
}

/* --------------------------------- luna --------------------------------- */

export function Moon(props: G) {
  const glow = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const ctx = c.getContext('2d')!;
    const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, 'rgba(230,236,255,0.9)');
    g.addColorStop(0.18, 'rgba(210,222,255,0.45)');
    g.addColorStop(1, 'rgba(120,140,200,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  return (
    <group {...props}>
      <mesh>
        <sphereGeometry args={[1.6, 32, 32]} />
        <meshBasicMaterial color="#f1f0e6" toneMapped={false} />
      </mesh>
      <sprite scale={[14, 14, 1]}>
        <spriteMaterial map={glow} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
    </group>
  );
}
