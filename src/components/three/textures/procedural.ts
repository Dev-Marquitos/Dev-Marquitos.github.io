import * as THREE from 'three';

/* ----------------------------- ruido de valor ----------------------------- */

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeNoise(seed = 1) {
  const rand = mulberry32(seed);
  const size = 256;
  const perm = new Uint8Array(size * 2);
  const vals = new Float32Array(size);
  for (let i = 0; i < size; i++) {
    perm[i] = i;
    vals[i] = rand();
  }
  for (let i = size - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [perm[i], perm[j]] = [perm[j], perm[i]];
  }
  for (let i = 0; i < size; i++) perm[size + i] = perm[i];
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const smooth = (t: number) => t * t * (3 - 2 * t);
  const v = (x: number, y: number) => vals[perm[(perm[x & 255] + y) & 511] & 255];
  const noise = (x: number, y: number) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = smooth(x - xi);
    const yf = smooth(y - yi);
    return lerp(lerp(v(xi, yi), v(xi + 1, yi), xf), lerp(v(xi, yi + 1), v(xi + 1, yi + 1), xf), yf);
  };
  const fbm = (x: number, y: number, oct = 4) => {
    let a = 0.5, f = 1, s = 0;
    for (let i = 0; i < oct; i++) {
      s += a * noise(x * f, y * f);
      f *= 2;
      a *= 0.5;
    }
    return s;
  };
  return { noise, fbm };
}

const cache = new Map<string, THREE.Texture>();

function memo<T extends THREE.Texture>(key: string, make: () => T): T {
  const hit = cache.get(key);
  if (hit) return hit as T;
  const t = make();
  cache.set(key, t);
  return t;
}

function canvas(w: number, h: number) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;
  return { c, ctx };
}

function finish(c: HTMLCanvasElement, opts: { srgb?: boolean; repeat?: [number, number]; aniso?: number } = {}) {
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = opts.srgb === false ? THREE.NoColorSpace : THREE.SRGBColorSpace;
  tex.anisotropy = opts.aniso ?? 8;
  if (opts.repeat) {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(...opts.repeat);
  }
  tex.needsUpdate = true;
  return tex;
}

const MONO = '"JetBrains Mono Variable", "JetBrains Mono", monospace';
const SERIF = '"Fraunces Variable", Georgia, serif';

/* --------------------------------- madera -------------------------------- */

export function woodTexture(tone: 'walnut' | 'oak' | 'dark' = 'walnut') {
  return memo('wood-' + tone, () => {
    const W = 1024, H = 512;
    const { c, ctx } = canvas(W, H);
    const img = ctx.createImageData(W, H);
    const { fbm } = makeNoise(tone === 'oak' ? 7 : tone === 'dark' ? 13 : 3);
    const palette = {
      walnut: [[58, 30, 14], [112, 62, 30], [150, 92, 48]],
      oak: [[96, 62, 32], [150, 104, 60], [190, 140, 88]],
      dark: [[30, 18, 10], [62, 36, 20], [92, 56, 30]],
    }[tone];
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const n = fbm(x / 180, y / 26, 5);
        const grain = Math.sin((y / H) * 80 + n * 9 + Math.sin(x / 140) * 1.5);
        const fine = fbm(x / 6, y / 1.2, 2);
        let t = 0.5 + 0.35 * grain + 0.25 * (fine - 0.5);
        t = Math.max(0, Math.min(1, t));
        const a = t < 0.5 ? palette[0] : palette[1];
        const b = t < 0.5 ? palette[1] : palette[2];
        const k = t < 0.5 ? t * 2 : (t - 0.5) * 2;
        const i = (y * W + x) * 4;
        img.data[i] = a[0] + (b[0] - a[0]) * k;
        img.data[i + 1] = a[1] + (b[1] - a[1]) * k;
        img.data[i + 2] = a[2] + (b[2] - a[2]) * k;
        img.data[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    return finish(c);
  });
}

/* ------------------------- tela del parlante (rejilla) ------------------------- */

export function fabricTexture() {
  return memo('fabric', () => {
    const S = 512;
    const { c, ctx } = canvas(S, S);
    ctx.fillStyle = '#6e5634';
    ctx.fillRect(0, 0, S, S);
    for (let y = 0; y < S; y += 4) {
      for (let x = 0; x < S; x += 4) {
        const odd = ((x + y) / 4) % 2 === 0;
        const v = 120 + Math.random() * 40;
        ctx.fillStyle = odd ? `rgb(${v + 50},${v + 20},${v - 40})` : `rgb(${v - 10},${v - 30},${v - 70})`;
        ctx.fillRect(x, y, 4, 2);
        ctx.fillRect(x + (odd ? 2 : 0), y + 2, 2, 2);
      }
    }
    // hilos dorados (lurex) típicos de los años 50
    ctx.globalAlpha = 0.25;
    for (let i = 0; i < 90; i++) {
      ctx.strokeStyle = i % 2 ? '#e8c77c' : '#3b2a14';
      ctx.lineWidth = 1;
      const y = Math.random() * S;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(S, y + (Math.random() - 0.5) * 4);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    return finish(c, { repeat: [3, 3] });
  });
}

/* ------------------------------ carátula del dial ------------------------------ */

export function dialTexture() {
  return memo('dial', () => {
    const W = 1024, H = 360;
    const { c, ctx } = canvas(W, H);
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#5a3108');
    g.addColorStop(0.5, '#f6c66d');
    g.addColorStop(1, '#5a3108');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    const rg = ctx.createRadialGradient(W / 2, H / 2, 40, W / 2, H / 2, W * 0.6);
    rg.addColorStop(0, 'rgba(255,240,200,0.55)');
    rg.addColorStop(1, 'rgba(60,25,0,0.5)');
    ctx.fillStyle = rg;
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = 'rgba(40,18,2,0.9)';
    ctx.fillStyle = 'rgba(40,18,2,0.92)';
    const x0 = 70, x1 = W - 70;
    const bands = [
      { y: 92, label: 'ONDA MEDIA  kc', marks: ['55', '60', '70', '80', '100', '120', '140', '160'] },
      { y: 188, label: 'ONDA CORTA  Mc', marks: ['4.8', '5.2', '5.9', '6.2', '7.2', '9.5', '11.8', '15.2'] },
      { y: 284, label: 'ONDA CORTA 2', marks: ['17.8', '19', '21.5', '24', '25.8', '28'] },
    ];
    bands.forEach((b) => {
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x0, b.y);
      ctx.lineTo(x1, b.y);
      ctx.stroke();
      for (let i = 0; i <= 60; i++) {
        const x = x0 + ((x1 - x0) * i) / 60;
        const big = i % 5 === 0;
        ctx.lineWidth = big ? 2 : 1;
        ctx.beginPath();
        ctx.moveTo(x, b.y - (big ? 14 : 7));
        ctx.lineTo(x, b.y);
        ctx.stroke();
      }
      ctx.font = `700 26px ${MONO}`;
      ctx.textAlign = 'center';
      b.marks.forEach((m, i) => {
        const x = x0 + ((x1 - x0) * i) / (b.marks.length - 1);
        ctx.fillText(m, x, b.y - 22);
      });
      ctx.font = `600 15px ${MONO}`;
      ctx.textAlign = 'left';
      ctx.fillText(b.label, x0, b.y + 26);
    });
    // ciudades a lo largo del dial, como en los receptores de época
    ctx.font = `italic 600 22px ${SERIF}`;
    ctx.textAlign = 'center';
    const cities = ['La Paz', 'Oruro', 'Catavi', 'Potosí', 'Sucre', 'Cochabamba', 'Lima'];
    cities.forEach((name, i) => {
      const x = x0 + 40 + ((x1 - x0 - 80) * i) / (cities.length - 1);
      ctx.fillText(name, x, 140);
    });
    // marcador de la emisora
    const px = x0 + (x1 - x0) * 0.33;
    ctx.fillStyle = '#9c1d0a';
    ctx.beginPath();
    ctx.moveTo(px, 196);
    ctx.lineTo(px - 10, 222);
    ctx.lineTo(px + 10, 222);
    ctx.closePath();
    ctx.fill();
    ctx.font = `800 24px ${SERIF}`;
    ctx.fillText('PÍO XII', px, 248);
    ctx.font = `600 14px ${MONO}`;
    ctx.fillStyle = 'rgba(40,18,2,0.85)';
    ctx.fillText('SIGLO XX · LLALLAGUA', W / 2, H - 14);
    return finish(c);
  });
}

/* --------------------------- carátula de instrumento --------------------------- */

export function meterTexture(label: string, red = true) {
  return memo('meter-' + label, () => {
    const S = 512;
    const { c, ctx } = canvas(S, S);
    const g = ctx.createRadialGradient(S / 2, S * 0.7, 20, S / 2, S * 0.6, S * 0.7);
    g.addColorStop(0, '#fbf3dc');
    g.addColorStop(1, '#d9caa2');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, S, S);
    const cx = S / 2, cy = S * 0.78, r = S * 0.52;
    const a0 = Math.PI * 1.2, a1 = Math.PI * 1.8;
    ctx.strokeStyle = '#2a1e10';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(cx, cy, r, a0, a1);
    ctx.stroke();
    if (red) {
      ctx.strokeStyle = '#b3260f';
      ctx.lineWidth = 12;
      ctx.beginPath();
      ctx.arc(cx, cy, r - 10, a0 + (a1 - a0) * 0.8, a1);
      ctx.stroke();
    }
    ctx.fillStyle = '#2a1e10';
    ctx.font = `700 30px ${MONO}`;
    ctx.textAlign = 'center';
    for (let i = 0; i <= 50; i++) {
      const a = a0 + ((a1 - a0) * i) / 50;
      const big = i % 10 === 0;
      const r0 = r - (big ? 34 : i % 5 === 0 ? 24 : 14);
      ctx.lineWidth = big ? 4 : 2;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
      ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      ctx.stroke();
      if (big) ctx.fillText(String(i / 5), cx + Math.cos(a) * (r - 62), cy + Math.sin(a) * (r - 62) + 10);
    }
    ctx.font = `800 34px ${SERIF}`;
    ctx.fillText(label, cx, cy - 70);
    ctx.font = `600 18px ${MONO}`;
    ctx.fillText('mA', cx, cy - 36);
    return finish(c);
  });
}

/* ------------------------------ metal pintado / óxido ------------------------------ */

export function paintedMetalTexture(base: string, seed = 5, rust = 0.25) {
  return memo(`paint-${base}-${seed}-${rust}`, () => {
    const S = 512;
    const { c, ctx } = canvas(S, S);
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, S, S);
    const img = ctx.getImageData(0, 0, S, S);
    const { fbm } = makeNoise(seed);
    for (let y = 0; y < S; y++) {
      for (let x = 0; x < S; x++) {
        const i = (y * S + x) * 4;
        const n = fbm(x / 60, y / 60, 5);
        const speck = fbm(x / 3, y / 3, 2);
        // martillado
        const shade = 0.88 + (speck - 0.5) * 0.22 + (n - 0.5) * 0.18;
        let r = img.data[i] * shade, g = img.data[i + 1] * shade, b = img.data[i + 2] * shade;
        const rustAmt = Math.max(0, (n - (1 - rust)) * 3.2);
        if (rustAmt > 0) {
          const k = Math.min(1, rustAmt);
          r = r * (1 - k) + (120 + speck * 60) * k;
          g = g * (1 - k) + (52 + speck * 30) * k;
          b = b * (1 - k) + (20 + speck * 10) * k;
        }
        img.data[i] = r;
        img.data[i + 1] = g;
        img.data[i + 2] = b;
      }
    }
    ctx.putImageData(img, 0, 0);
    return finish(c, { repeat: [1, 1] });
  });
}

/** Mapa de rugosidad genérico (ruido) en espacio lineal. */
export function roughnessNoise(seed = 9, scale = 40) {
  return memo(`rough-${seed}-${scale}`, () => {
    const S = 256;
    const { c, ctx } = canvas(S, S);
    const img = ctx.createImageData(S, S);
    const { fbm } = makeNoise(seed);
    for (let y = 0; y < S; y++) {
      for (let x = 0; x < S; x++) {
        const v = 110 + fbm(x / scale, y / scale, 4) * 140;
        const i = (y * S + x) * 4;
        img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
        img.data[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    return finish(c, { srgb: false, repeat: [2, 2] });
  });
}

/* ------------------------------------ vinilo ------------------------------------ */

export function vinylTexture() {
  return memo('vinyl', () => {
    const S = 1024;
    const { c, ctx } = canvas(S, S);
    ctx.fillStyle = '#0c0b0a';
    ctx.fillRect(0, 0, S, S);
    const cx = S / 2;
    for (let r = S / 2 - 4; r > S * 0.18; r -= 2.2) {
      ctx.strokeStyle = `rgba(${40 + Math.random() * 30},${38 + Math.random() * 25},${36 + Math.random() * 20},0.9)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cx, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    const lg = ctx.createRadialGradient(cx, cx, 0, cx, cx, S * 0.17);
    lg.addColorStop(0, '#d8b65e');
    lg.addColorStop(1, '#a3261a');
    ctx.fillStyle = lg;
    ctx.beginPath();
    ctx.arc(cx, cx, S * 0.17, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f3e6c4';
    ctx.textAlign = 'center';
    ctx.font = `800 40px ${SERIF}`;
    ctx.fillText('DISCOTECA', cx, cx - 50);
    ctx.font = `600 26px ${MONO}`;
    ctx.fillText('78 r.p.m.', cx, cx + 70);
    ctx.font = `italic 600 30px ${SERIF}`;
    ctx.fillText('Huayño · Cueca', cx, cx + 110);
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(cx, cx, 10, 0, Math.PI * 2);
    ctx.fill();
    return finish(c);
  });
}

/* ------------------------------ pared de adobe / revoque ------------------------------ */

export function plasterTexture() {
  return memo('plaster', () => {
    const S = 512;
    const { c, ctx } = canvas(S, S);
    const img = ctx.createImageData(S, S);
    const { fbm } = makeNoise(21);
    for (let y = 0; y < S; y++) {
      for (let x = 0; x < S; x++) {
        const n = fbm(x / 70, y / 70, 5);
        const s = fbm(x / 4, y / 4, 2);
        const v = 0.55 + (n - 0.5) * 0.5 + (s - 0.5) * 0.15;
        const i = (y * S + x) * 4;
        img.data[i] = 70 * v + 18;
        img.data[i + 1] = 58 * v + 14;
        img.data[i + 2] = 46 * v + 10;
        img.data[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    return finish(c, { repeat: [2, 2] });
  });
}

/* ------------------------------ placa / letrero ------------------------------ */

export function plaqueTexture(lines: string[], opts: { bg?: string; fg?: string; w?: number; h?: number } = {}) {
  const key = 'plaque-' + lines.join('|') + (opts.bg ?? '');
  return memo(key, () => {
    const W = opts.w ?? 512, H = opts.h ?? 160;
    const { c, ctx } = canvas(W, H);
    ctx.fillStyle = opts.bg ?? '#c9a35a';
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(0,0,0,0.45)';
    ctx.lineWidth = 6;
    ctx.strokeRect(8, 8, W - 16, H - 16);
    ctx.fillStyle = opts.fg ?? '#2a1a08';
    ctx.textAlign = 'center';
    lines.forEach((l, i) => {
      ctx.font = i === 0 ? `800 ${Math.round(H * 0.32)}px ${SERIF}` : `600 ${Math.round(H * 0.16)}px ${MONO}`;
      ctx.fillText(l, W / 2, H * (lines.length === 1 ? 0.62 : 0.48 + i * 0.3));
    });
    return finish(c);
  });
}

/* ------------------------------ guion mecanografiado ------------------------------ */

export function scriptPaperTexture(title = 'BOLETÍN INFORMATIVO') {
  return memo('script-' + title, () => {
    const W = 512, H = 700;
    const { c, ctx } = canvas(W, H);
    ctx.fillStyle = '#e9dfc6';
    ctx.fillRect(0, 0, W, H);
    const { fbm } = makeNoise(77);
    const img = ctx.getImageData(0, 0, W, H);
    for (let y = 0; y < H; y += 2) {
      for (let x = 0; x < W; x += 2) {
        const n = 0.9 + fbm(x / 50, y / 50, 3) * 0.16;
        for (let dy = 0; dy < 2; dy++) for (let dx = 0; dx < 2; dx++) {
          const i = ((y + dy) * W + (x + dx)) * 4;
          img.data[i] *= n;
          img.data[i + 1] *= n;
          img.data[i + 2] *= n * 0.97;
        }
      }
    }
    ctx.putImageData(img, 0, 0);
    ctx.fillStyle = 'rgba(30,24,18,0.88)';
    ctx.font = `700 26px ${MONO}`;
    ctx.fillText(title, 40, 70);
    ctx.font = `500 15px ${MONO}`;
    ctx.fillText('RADIO PÍO XII — SIGLO XX', 40, 100);
    ctx.fillRect(40, 112, W - 80, 2);
    ctx.font = `400 15px ${MONO}`;
    for (let i = 0; i < 26; i++) {
      const len = 18 + Math.floor(Math.random() * 22);
      const line = Array.from({ length: len }, () => (Math.random() < 0.18 ? ' ' : String.fromCharCode(97 + Math.floor(Math.random() * 26)))).join('');
      ctx.globalAlpha = 0.55 + Math.random() * 0.4;
      ctx.fillText(line, 40, 150 + i * 20);
    }
    ctx.globalAlpha = 1;
    return finish(c);
  });
}

/* ------------------------------ cartuchos de papel ------------------------------ */

export function paperWrapTexture() {
  return memo('paper-wrap', () => {
    const W = 512, H = 256;
    const { c, ctx } = canvas(W, H);
    ctx.fillStyle = '#a3321f';
    ctx.fillRect(0, 0, W, H);
    const { fbm } = makeNoise(31);
    const img = ctx.getImageData(0, 0, W, H);
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 4;
        const n = 0.8 + fbm(x / 20, y / 20, 4) * 0.35;
        img.data[i] *= n;
        img.data[i + 1] *= n;
        img.data[i + 2] *= n;
      }
    }
    ctx.putImageData(img, 0, 0);
    ctx.fillStyle = 'rgba(245,230,200,0.85)';
    ctx.fillRect(0, H * 0.36, W, H * 0.28);
    ctx.fillStyle = '#2a1a0c';
    ctx.font = `800 40px ${MONO}`;
    ctx.textAlign = 'center';
    ctx.fillText('PELIGRO · EXPLOSIVO', W / 2, H * 0.56);
    return finish(c);
  });
}
