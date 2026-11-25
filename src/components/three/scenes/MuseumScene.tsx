import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { CameraControls, Environment, Html, Lightformer, MeshReflectorMaterial, PerformanceMonitor, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { TubeRadio } from '../models/TubeRadio';
import { Transmitter } from '../models/Transmitter';
import { StudioMic } from '../models/StudioMic';
import { Turntable } from '../models/Turntable';
import { MinerHelmet } from '../models/MinerHelmet';
import { MineCart } from '../models/MineCart';
import { Dynamite } from '../models/Dynamite';
import { Effects } from '../Effects';
import { GltfProp, Lantern } from '../models/Props';
import { PROP_URLS } from '../models/propUrls';
import { plaqueTexture, plasterTexture } from '../textures/procedural';
import { MUSEUM_PIECES, type MuseumPiece } from '../../../data/museum';
import { useMuseumStore } from '../../../stores/useMuseumStore';
import { sfx } from '../../../stores/useExperience';
import { qualityParams, useQuality } from '../../../stores/useQuality';

const R = 7.6;
const SPREAD = THREE.MathUtils.degToRad(150);

/** Ajustes de presentación por pieza: escala, altura sobre el pedestal, foco de cámara */
const LAYOUT: Record<MuseumPiece['id'], { scale: number; y: number; focus: number; dist: number; rot?: number }> = {
  radio: { scale: 0.62, y: 1.61, focus: 1.65, dist: 3.6 },
  transmitter: { scale: 0.62, y: 1.85, focus: 1.9, dist: 4.4 },
  mic: { scale: 0.78, y: 0.95, focus: 2.3, dist: 3.9 },
  turntable: { scale: 0.85, y: 1.05, focus: 1.3, dist: 3.4, rot: 0.4 },
  helmet: { scale: 0.95, y: 0.98, focus: 1.3, dist: 3.1, rot: 0 },
  cart: { scale: 0.7, y: 1.28, focus: 1.55, dist: 4.1, rot: Math.PI / 2.4 },
  dynamite: { scale: 0.9, y: 1.35, focus: 1.4, dist: 3.0 },
};

function pieceTransform(i: number, n: number) {
  const theta = -SPREAD / 2 + (SPREAD * i) / (n - 1);
  const pos = new THREE.Vector3(Math.sin(theta) * R, 0, -Math.cos(theta) * R + 1.2);
  return { theta, pos };
}

function Model({ id, lights, particles }: { id: MuseumPiece['id']; lights: boolean; particles: boolean }) {
  switch (id) {
    case 'radio':
      return <TubeRadio dim lights={lights} />;
    case 'transmitter':
      return <Transmitter lights={lights} />;
    case 'mic':
      return <StudioMic />;
    case 'turntable':
      return <Turntable />;
    case 'helmet':
      return <MinerHelmet lights={lights} />;
    case 'cart':
      return <MineCart />;
    case 'dynamite':
      return <Dynamite lights={lights} particles={particles} />;
  }
}

/* Cono de luz volumétrico falso (aditivo, se desvanece hacia abajo) */
function LightCone({ color = '#ffd9a0', height = 6.5, radius = 1.6, opacity = 0.11 }: { color?: string; height?: number; radius?: number; opacity?: number }) {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        uniforms: { uColor: { value: new THREE.Color(color) }, uOpacity: { value: opacity } },
        vertexShader: /* glsl */ `
          varying float vY; varying vec3 vN; varying vec3 vV;
          void main(){
            vY = uv.y;
            vec4 mv = modelViewMatrix * vec4(position,1.0);
            vN = normalize(normalMatrix * normal);
            vV = normalize(-mv.xyz);
            gl_Position = projectionMatrix * mv;
          }`,
        fragmentShader: /* glsl */ `
          uniform vec3 uColor; uniform float uOpacity;
          varying float vY; varying vec3 vN; varying vec3 vV;
          void main(){
            // normalizar tras la interpolación y acotar: evita pow(negativo) = NaN,
            // que el bloom propagaría a toda la imagen
            float facing = clamp(abs(dot(normalize(vN), normalize(vV))), 0.0, 1.0);
            float edge = pow(1.0 - facing, 1.6);
            float fade = smoothstep(0.0, 0.9, vY);
            float a = clamp(uOpacity * fade * (1.0 - edge * 0.85), 0.0, 1.0);
            gl_FragColor = vec4(uColor, a);
          }`,
      }),
    [color, opacity],
  );
  return (
    <mesh position={[0, height / 2, 0]} material={mat}>
      <cylinderGeometry args={[0.12, radius, height, 40, 1, true]} />
    </mesh>
  );
}

function Pedestal({ piece, index, total, q }: { piece: MuseumPiece; index: number; total: number; q: ReturnType<typeof qualityParams> }) {
  const selected = useMuseumStore((s) => s.selected);
  const hovered = useMuseumStore((s) => s.hovered);
  const select = useMuseumStore((s) => s.select);
  const hover = useMuseumStore((s) => s.hover);
  const ring = useRef<THREE.MeshBasicMaterial>(null);
  const spin = useRef<THREE.Group>(null);
  const { theta, pos } = useMemo(() => pieceTransform(index, total), [index, total]);
  const lay = LAYOUT[piece.id];
  const isSel = selected === piece.id;
  const isHov = hovered === piece.id;
  const inspect = useMuseumStore((s) => s.inspect);

  const mats = useMemo(
    () => ({
      stone: new THREE.MeshStandardMaterial({ color: '#1c1916', roughness: 0.55, metalness: 0.15 }),
      top: new THREE.MeshStandardMaterial({ color: '#2a2520', roughness: 0.35, metalness: 0.3 }),
      brass: new THREE.MeshStandardMaterial({ color: '#b8904c', metalness: 1, roughness: 0.3 }),
      plaque: new THREE.MeshStandardMaterial({ map: plaqueTexture([piece.number, piece.title.toUpperCase()], { bg: '#1a1612', fg: '#e9dcc0', w: 768, h: 220 }), roughness: 0.5 }),
    }),
    [piece.number, piece.title],
  );

  useFrame((state, dt) => {
    const target = isSel ? 1 : isHov ? 0.75 : 0.25;
    if (ring.current) ring.current.opacity = THREE.MathUtils.damp(ring.current.opacity, target, 6, dt);
    if (spin.current) {
      if (isSel && inspect) spin.current.rotation.y += dt * 0.6;
      else spin.current.rotation.y = THREE.MathUtils.damp(spin.current.rotation.y, (lay.rot ?? 0) + Math.sin(state.clock.elapsedTime * 0.3 + index) * 0.12, 2, dt);
    }
  });

  return (
    <group position={pos} rotation={[0, -theta, 0]}>
      {/* pedestal */}
      <mesh position={[0, 0.45, 0]} material={mats.stone} castShadow receiveShadow>
        <cylinderGeometry args={[1.15, 1.3, 0.9, 6]} />
      </mesh>
      <mesh position={[0, 0.92, 0]} material={mats.top} receiveShadow>
        <cylinderGeometry args={[1.2, 1.2, 0.05, 6]} />
      </mesh>
      <mesh position={[0, 0.95, 0]} rotation={[Math.PI / 2, 0, Math.PI / 6]} material={mats.brass}>
        <torusGeometry args={[1.2, 0.015, 6, 6]} />
      </mesh>
      {/* placa */}
      <mesh position={[0, 0.5, 1.2]} rotation={[-0.35, 0, 0]} material={mats.plaque}>
        <planeGeometry args={[1.05, 0.3]} />
      </mesh>
      {/* aro de luz en el piso */}
      <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.45, 1.55, 64]} />
        <meshBasicMaterial ref={ring} color={piece.accent} transparent opacity={0.25} toneMapped={false} />
      </mesh>

      {/* pieza */}
      <group
        position={[0, lay.y, 0]}
        onClick={(e) => {
          e.stopPropagation();
          sfx.click();
          select(isSel ? null : piece.id);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          hover(piece.id);
          sfx.tick();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          hover(null);
          document.body.style.cursor = '';
        }}
      >
        <group ref={spin} scale={lay.scale}>
          <Model id={piece.id} lights={q.pieceLights} particles={q.particles} />
        </group>
      </group>

      {/* luz cenital */}
      {q.cones && <LightCone />}
      {q.particles && <Sparkles count={18} scale={[2, 4, 2]} position={[0, 3, 0]} size={1.4} speed={0.2} opacity={0.4} color="#ffe0b0" />}

      {isHov && !selected && (
        <Html position={[0, lay.focus + 1.35, 0]} center distanceFactor={9} zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
          <div className="whitespace-nowrap rounded-full bg-black/70 border border-white/15 px-4 py-1.5 font-mono text-[13px] tracking-[0.2em] uppercase text-bone backdrop-blur">
            <span className="text-amber mr-2">{piece.number}</span>
            {piece.title}
          </div>
        </Html>
      )}
    </group>
  );
}

function Banner({ position, rotation, lines }: { position: [number, number, number]; rotation: number; lines: string[] }) {
  const tex = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 1400;
    const ctx = c.getContext('2d')!;
    const g = ctx.createLinearGradient(0, 0, 0, c.height);
    g.addColorStop(0, '#2a1d12');
    g.addColorStop(1, '#140e09');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.strokeStyle = 'rgba(242,165,65,0.6)';
    ctx.lineWidth = 6;
    ctx.strokeRect(30, 30, c.width - 60, c.height - 60);
    ctx.fillStyle = '#f2a541';
    ctx.textAlign = 'center';
    ctx.font = '800 150px "Fraunces Variable", Georgia, serif';
    ctx.fillText(lines[0], c.width / 2, 300);
    ctx.fillStyle = '#ede5d3';
    ctx.font = '600 44px "JetBrains Mono Variable", monospace';
    lines.slice(1).forEach((l, i) => ctx.fillText(l, c.width / 2, 470 + i * 70));
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, [lines]);
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh>
        <planeGeometry args={[1.5, 4.1]} />
        <meshStandardMaterial map={tex} roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 2.1, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, 1.7, 8]} />
        <meshStandardMaterial color="#b8904c" metalness={1} roughness={0.3} />
      </mesh>
    </group>
  );
}

function Hall({ reflections, lights }: { reflections: boolean; lights: boolean }) {
  const wall = useMemo(() => {
    const t = plasterTexture().clone();
    t.repeat.set(10, 2);
    t.needsUpdate = true;
    return new THREE.MeshStandardMaterial({ map: t, color: '#6f6152', roughness: 0.95, side: THREE.BackSide });
  }, []);
  return (
    <group>
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[16, 96]} />
        {reflections ? (
          <MeshReflectorMaterial
            blur={[400, 120]}
            resolution={1024}
            mixBlur={1}
            mixStrength={28}
            roughness={0.9}
            depthScale={1.1}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.3}
            color="#0d0b09"
            metalness={0.55}
            mirror={0.6}
          />
        ) : (
          <meshStandardMaterial color="#0f0d0b" roughness={0.6} metalness={0.3} />
        )}
      </mesh>
      <mesh position={[0, 5, 0]} material={wall}>
        <cylinderGeometry args={[14, 14, 10, 96, 1, true]} />
      </mesh>
      <mesh position={[0, 9.99, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[14, 64]} />
        <meshStandardMaterial color="#070605" roughness={1} />
      </mesh>
      <Banner position={[-5.4, 4.6, -10.5]} rotation={0.45} lines={['1959', 'FUNDACIÓN', 'SIGLO XX']} />
      <Props lights={lights} />
      <Banner position={[0, 4.9, -12.2]} rotation={0} lines={['XII', 'RADIO PÍO', 'LA VOZ', 'DE LA MINA']} />
      <Banner position={[5.4, 4.6, -10.5]} rotation={-0.45} lines={['HOY', 'SIGUE', 'AL AIRE']} />
    </group>
  );
}

/** Utilería CC0 (Poly Haven) alrededor de los pedestales */
function Props({ lights }: { lights: boolean }) {
  const at = (i: number, dx: number, dz: number) => {
    const { theta, pos } = pieceTransform(i, MUSEUM_PIECES.length);
    const right = new THREE.Vector3(Math.cos(theta), 0, Math.sin(theta));
    const fwd = new THREE.Vector3(-Math.sin(theta), 0, Math.cos(theta));
    const p = pos.clone().add(right.multiplyScalar(dx)).add(fwd.multiplyScalar(dz));
    return { p: [p.x, 0, p.z] as [number, number, number], r: -theta };
  };
  const crate = at(6, 1.75, -0.4);
  const barrel = at(1, 1.05, -1.65);
  const pick = at(5, 1.55, 0.2);
  const lantern = at(4, -1.55, 0.5);
  return (
    <group>
      <GltfProp url={PROP_URLS.crate} position={crate.p} rotation={[0, crate.r + 0.5, 0]} scale={1.25} />
      <GltfProp url={PROP_URLS.barrel} position={barrel.p} rotation={[0, barrel.r, 0]} scale={1.3} />
      <GltfProp url={PROP_URLS.pickaxe} position={[pick.p[0], 0.62, pick.p[2]]} rotation={[0.05, pick.r + 0.4, -0.42]} scale={1.15} />
      <Lantern position={lantern.p} rotation={[0, lantern.r, 0]} scale={2.2} intensity={6} distance={4} light={lights} />
    </group>
  );
}

const OVERVIEW = { pos: new THREE.Vector3(0, 5.6, 13.2), target: new THREE.Vector3(0, 1.1, -2.4) };

function CameraDirector() {
  const controls = useRef<CameraControls>(null);
  const selected = useMuseumStore((s) => s.selected);
  const { size, camera } = useThree();
  const idle = useRef(0);

  useEffect(() => {
    const c = controls.current;
    if (!c) return;
    const narrow = size.width < 768;
    const portrait = size.width < size.height;
    const cam = camera as THREE.PerspectiveCamera;
    cam.fov = portrait ? 64 : 45;
    cam.updateProjectionMatrix();
    if (!selected) {
      const p = OVERVIEW.pos.clone().multiplyScalar(portrait ? 1.3 : narrow ? 1.2 : 1);
      void c.setLookAt(p.x, p.y, p.z, OVERVIEW.target.x, OVERVIEW.target.y, OVERVIEW.target.z, true);
      c.minDistance = 4;
      c.maxDistance = 16;
      return;
    }
    const i = MUSEUM_PIECES.findIndex((p) => p.id === selected);
    const { theta, pos } = pieceTransform(i, MUSEUM_PIECES.length);
    const lay = LAYOUT[MUSEUM_PIECES[i].id];
    const toCenter = new THREE.Vector3(-Math.sin(theta), 0, Math.cos(theta));
    const dist = lay.dist * (narrow ? 1.35 : 1);
    const camPos = pos.clone().add(toCenter.multiplyScalar(dist)).add(new THREE.Vector3(0, lay.focus + 0.55, 0));
    const tgt = pos.clone().add(new THREE.Vector3(0, lay.focus, 0));
    // en pantallas anchas, desplazar la pieza a la izquierda para dejar espacio al panel
    if (!narrow) {
      const right = new THREE.Vector3(Math.cos(theta), 0, Math.sin(theta)).multiplyScalar(0.9);
      camPos.add(right);
      tgt.add(right);
    }
    c.minDistance = 1.6;
    c.maxDistance = 8;
    void c.setLookAt(camPos.x, camPos.y, camPos.z, tgt.x, tgt.y, tgt.z, true);
  }, [selected, size.width, size.height, camera]);

  useFrame((_, dt) => {
    const c = controls.current;
    if (!c) return;
    idle.current += dt;
    if (!selected && idle.current > 4) c.azimuthAngle += dt * 0.025 * Math.sin(idle.current * 0.1);
  });

  return (
    <CameraControls
      ref={controls}
      makeDefault
      minPolarAngle={0.35}
      maxPolarAngle={Math.PI / 2.05}
      smoothTime={0.6}
      draggingSmoothTime={0.15}
      onStart={() => (idle.current = 0)}
    />
  );
}

/** Un único foco que viaja hasta la pieza elegida (en lugar de un foco por pedestal). */
function FocusLight() {
  const selected = useMuseumStore((s) => s.selected);
  const light = useRef<THREE.SpotLight>(null);
  const target = useMemo(() => new THREE.Object3D(), []);
  const goal = useMemo(() => ({ pos: new THREE.Vector3(0, 11, 5), tgt: new THREE.Vector3(0, 1, -3), angle: 0.85, intensity: 260 }), []);
  useEffect(() => {
    const i = MUSEUM_PIECES.findIndex((p) => p.id === selected);
    if (i < 0) {
      goal.pos.set(0, 11, 5);
      goal.tgt.set(0, 1, -3);
      goal.angle = 0.85;
      goal.intensity = 260;
      return;
    }
    const { theta, pos } = pieceTransform(i, MUSEUM_PIECES.length);
    const toCenter = new THREE.Vector3(-Math.sin(theta), 0, Math.cos(theta));
    goal.pos.copy(pos).add(new THREE.Vector3(0, 6.5, 0)).add(toCenter.multiplyScalar(1.4));
    goal.tgt.copy(pos).add(new THREE.Vector3(0, 1.2, 0));
    goal.angle = 0.42;
    goal.intensity = 140;
  }, [selected, goal]);
  useFrame((_, dt) => {
    const l = light.current;
    if (!l) return;
    const k = 1 - Math.exp(-dt * 3);
    l.position.lerp(goal.pos, k);
    target.position.lerp(goal.tgt, k);
    l.angle = THREE.MathUtils.lerp(l.angle, goal.angle, k);
    l.intensity = THREE.MathUtils.lerp(l.intensity, goal.intensity, k);
  });
  return (
    <>
      <primitive object={target} />
      <spotLight ref={light} target={target} position={[0, 11, 5]} angle={0.85} penumbra={0.85} intensity={260} distance={26} decay={2} color="#ffe2b8" />
    </>
  );
}

export function MuseumScene() {
  const tier = useQuality((s) => s.tier);
  const downgrade = useQuality((s) => s.downgrade);
  const q = qualityParams(tier);
  const select = useMuseumStore((s) => s.select);
  return (
    <Canvas
      key={tier}
      shadows={q.shadows}
      dpr={q.dpr}
      camera={{ position: [0, 5.6, 13.2], fov: 45, near: 0.1, far: 80 }}
      gl={{ antialias: tier === 'low', powerPreference: 'high-performance' }}
      onPointerMissed={() => select(null)}
    >
      <PerformanceMonitor onDecline={downgrade} flipflops={3} bounds={() => [28, 55]} />
      <color attach="background" args={['#050403']} />
      <fog attach="fog" args={['#050403', 16, 40]} />
      <ambientLight intensity={0.12} color="#8a7a66" />
      <hemisphereLight args={['#3a3128', '#0a0806', 0.35]} />
      <directionalLight
        position={[3, 12, 6]}
        intensity={0.9}
        color="#ffe9cc"
        castShadow={q.shadows}
        shadow-mapSize={[q.shadowMap, q.shadowMap]}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
        shadow-bias={-0.0004}
      />
      <Suspense fallback={null}>
        <Environment resolution={256} frames={1} environmentIntensity={0.75}>
          <Lightformer form="rect" intensity={2} color="#ffe2b8" position={[0, 8, 0]} rotation-x={Math.PI / 2} scale={[10, 10, 1]} />
          <Lightformer form="rect" intensity={0.8} color="#ffcf9a" position={[-8, 3, -2]} rotation-y={Math.PI / 2} scale={[6, 3, 1]} />
          <Lightformer form="rect" intensity={0.6} color="#9fb4e6" position={[8, 3, 2]} rotation-y={-Math.PI / 2} scale={[6, 3, 1]} />
        </Environment>
        <Hall reflections={q.reflections} lights={q.pieceLights} />
        {MUSEUM_PIECES.map((p, i) => (
          <Pedestal key={p.id} piece={p} index={i} total={MUSEUM_PIECES.length} q={q} />
        ))}
      </Suspense>
      <FocusLight />
      <CameraDirector />
      <Effects enabled={q.effects} msaa={q.msaa} bloom={0.65} threshold={0.88} vignette={0.8} />
    </Canvas>
  );
}

export default MuseumScene;
