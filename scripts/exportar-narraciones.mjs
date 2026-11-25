/**
 * Exporta todas las frases narrables del museo a scripts/narraciones.json.
 * Usa Vite para cargar el catálogo en TypeScript tal como lo usa el sitio.
 *
 *   node scripts/exportar-narraciones.mjs
 */
import { createServer } from 'vite';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const out = fileURLToPath(new URL('./narraciones.json', import.meta.url));
const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
try {
  const { allVoiceLines } = await vite.ssrLoadModule('/src/lib/narrationCatalog.ts');
  const lines = allVoiceLines();
  writeFileSync(out, JSON.stringify(lines, null, 1), 'utf-8');
  const chars = lines.reduce((s, l) => s + l.speech.length, 0);
  console.log(`${lines.length} frases únicas · ${chars} caracteres → ${out}`);
} finally {
  await vite.close();
}
