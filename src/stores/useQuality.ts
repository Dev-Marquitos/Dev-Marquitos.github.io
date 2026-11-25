import { create } from 'zustand';

/**
 * Niveles de calidad gráfica.
 *  - high: postprocesado con MSAA, reflejos, sombras, luces por pieza y partículas.
 *  - medium: postprocesado sin MSAA, sombras de 1024, sin reflejos en tiempo real.
 *  - low: sin postprocesado ni sombras, iluminación mínima y resolución reducida.
 * Se elige automáticamente según la GPU detectada y se rebaja si los FPS caen.
 */
export type Tier = 'high' | 'medium' | 'low';

const ORDER: Tier[] = ['low', 'medium', 'high'];
const KEY = 'pio12-calidad';

function detectGpu(): string {
  try {
    const c = document.createElement('canvas');
    const gl = (c.getContext('webgl2') ?? c.getContext('webgl')) as WebGLRenderingContext | null;
    if (!gl) return 'sin WebGL';
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const name = String(ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return name;
  } catch {
    return 'desconocida';
  }
}

function guessTier(gpu: string): Tier {
  const g = gpu.toLowerCase();
  const weak = /(gt\s?(6|7)\d\d|gt\s?1030|geforce\s?(8|9)\d\d\b|intel.*(hd|uhd)|hd graphics|uhd graphics|mali|adreno\s?[1-5]\d\d|powervr|swiftshader|llvmpipe|basic render|radeon\s?(r5|r7)\b)/;
  const mid = /(gtx\s?(7|9)\d\d|gtx\s?10[1-5]0|mx\s?\d{3}|iris|vega\s?(3|6|8)|adreno|apple gpu|radeon\s?(rx\s?(4|5)\d\d)?\s*graphics)/;
  let tier: Tier = weak.test(g) ? 'low' : mid.test(g) ? 'medium' : 'high';
  const coarse = window.matchMedia?.('(pointer: coarse)').matches;
  if (coarse && tier === 'high') tier = 'medium';
  if ((navigator.hardwareConcurrency ?? 8) <= 2) tier = 'low';
  return tier;
}

interface QualityState {
  tier: Tier;
  auto: boolean;
  gpu: string;
  setTier: (t: Tier) => void;
  setAuto: () => void;
  downgrade: () => void;
}

function initial(): { tier: Tier; auto: boolean; gpu: string } {
  if (typeof window === 'undefined') return { tier: 'high', auto: true, gpu: '' };
  const gpu = detectGpu();
  const forced = new URLSearchParams(window.location.search).get('q') as Tier | null;
  if (forced && ORDER.includes(forced)) return { tier: forced, auto: false, gpu };
  const saved = localStorage.getItem(KEY) as Tier | null;
  if (saved && ORDER.includes(saved)) return { tier: saved, auto: false, gpu };
  return { tier: guessTier(gpu), auto: true, gpu };
}

export const useQuality = create<QualityState>((set, get) => ({
  ...initial(),
  setTier: (tier) => {
    localStorage.setItem(KEY, tier);
    set({ tier, auto: false });
  },
  setAuto: () => {
    localStorage.removeItem(KEY);
    set({ tier: guessTier(get().gpu), auto: true });
  },
  /** Rebaja un nivel si el modo es automático (lo llama PerformanceMonitor). */
  downgrade: () => {
    const { tier, auto } = get();
    if (!auto) return;
    const i = ORDER.indexOf(tier);
    if (i > 0) set({ tier: ORDER[i - 1] });
  },
}));

/** Parámetros de render derivados del nivel. */
export function qualityParams(tier: Tier) {
  return {
    dpr: tier === 'high' ? ([1, 1.75] as [number, number]) : tier === 'medium' ? 1.1 : 0.85,
    effects: tier !== 'low',
    msaa: tier === 'high' ? 4 : 0,
    shadows: tier !== 'low',
    shadowMap: tier === 'high' ? 2048 : 1024,
    reflections: tier === 'high',
    pieceLights: tier === 'high',
    particles: tier !== 'low',
    cones: true,
    stars: tier === 'low' ? 900 : 2600,
  };
}
