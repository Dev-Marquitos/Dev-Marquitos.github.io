import { useGLTF } from '@react-three/drei';

const BASE = import.meta.env.BASE_URL;

/** Modelos CC0 de Poly Haven servidos desde /public/models. */
export const PROP_URLS = {
  lantern: `${BASE}models/Lantern_01/Lantern_01_1k.gltf`,
  pickaxe: `${BASE}models/picke_dirty_01/picke_dirty_01_1k.gltf`,
  crate: `${BASE}models/old_military_crate/old_military_crate_1k.gltf`,
  barrel: `${BASE}models/Barrel_01/Barrel_01_1k.gltf`,
};

/** Descarga y decodifica por adelantado toda la utilería (se llama en segundo plano). */
export function preloadProps() {
  Object.values(PROP_URLS).forEach((u) => useGLTF.preload(u));
}
