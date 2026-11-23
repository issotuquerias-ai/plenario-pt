// Texturas procedimentais (canvas) partilhadas pelas cenas 3D.
// As texturas "cached" são partilhadas e NÃO devem ser libertadas pelos controladores.
import * as THREE from 'three';
import { rng, hashString, initials as mkInitials } from './util3d.js';

export const FONT = '"Segoe UI", Arial, sans-serif';
const cache = new Map();
const imgCache = new Map();

export function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(w));
  c.height = Math.max(1, Math.round(h));
  return c;
}

export function toTexture(c, { repeat = false, srgb = true, aniso = 8, mipmaps = true } = {}) {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  if (repeat) { t.wrapS = THREE.RepeatWrapping; t.wrapT = THREE.RepeatWrapping; }
  t.anisotropy = aniso;
  if (!mipmaps) { t.generateMipmaps = false; t.minFilter = THREE.LinearFilter; }
  return t;
}

function cached(key, make) {
  let t = cache.get(key);
  if (!t) { t = make(); t.userData.cached = true; cache.set(key, t); }
  return t;
}

export function disposeTextureCache() {
  for (const t of cache.values()) t.dispose();
  cache.clear();
}

/** Carrega (com cache) uma imagem a partir de um dataURL. cb(img) é chamado quando pronta. */
export function loadImage(src, cb) {
  if (!src) return null;
  const key = hashString(src);
  let rec = imgCache.get(key);
  if (!rec) {
    const img = new Image();
    rec = { img, ready: false, cbs: [] };
    imgCache.set(key, rec);
    img.onload = () => { rec.ready = true; for (const f of rec.cbs) { try { f(img); } catch (e) { console.error(e); } } rec.cbs = []; };
    img.onerror = () => { rec.failed = true; rec.cbs = []; };
    img.src = src;
  }
  if (rec.ready) { if (cb) cb(rec.img); } else if (cb && !rec.failed) rec.cbs.push(cb);
  return rec.img;
}

/** Desenha uma imagem num retângulo com ajuste contain/cover. */
export function drawFit(g, img, x, y, w, h, fit = 'contain') {
  const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
  if (!iw || !ih) return;
  const s = fit === 'cover' ? Math.max(w / iw, h / ih) : Math.min(w / iw, h / ih);
  const dw = iw * s, dh = ih * s;
  g.save();
  if (fit === 'cover') { g.beginPath(); g.rect(x, y, w, h); g.clip(); }
  g.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
  g.restore();
}

export function roundRect(g, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

function shade(hex, f) {
  const c = new THREE.Color(hex);
  const hsl = {}; c.getHSL(hsl);
  c.setHSL(hsl.h, hsl.s, Math.max(0, Math.min(1, hsl.l * f)));
  return '#' + c.getHexString();
}
export { shade };

function speckle(g, w, h, r, n, alpha, light = true) {
  for (let i = 0; i < n; i++) {
    const v = light ? 255 : 0;
    g.fillStyle = `rgba(${v},${v},${v},${alpha * r()})`;
    const s = 1 + r() * 2.5;
    g.fillRect(r() * w, r() * h, s, s);
  }
}

// ---------------------------------------------------------------- materiais base

export function marble(base = '#ece6da', vein = '#a99c88') {
  return cached('marble|' + base + vein, () => {
    const S = 512, c = makeCanvas(S, S), g = c.getContext('2d');
    const r = rng(hashString(base + vein));
    g.fillStyle = base; g.fillRect(0, 0, S, S);
    for (let i = 0; i < 70; i++) {
      const x = r() * S, y = r() * S, rad = 30 + r() * 140;
      const light = r() > 0.45;
      const grd = g.createRadialGradient(x, y, 0, x, y, rad);
      grd.addColorStop(0, light ? 'rgba(255,255,255,0.10)' : 'rgba(110,95,80,0.06)');
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = grd;
      for (const ox of [-S, 0, S]) for (const oy of [-S, 0, S]) g.fillRect(x - rad + ox, y - rad + oy, rad * 2, rad * 2);
    }
    g.strokeStyle = vein; g.lineCap = 'round';
    for (let v = 0; v < 16; v++) {
      const alpha = 0.12 + r() * 0.35, lw = 0.5 + r() * 2.2;
      let x = r() * S, y = r() * S, a = r() * Math.PI * 2;
      const pts = [[x, y]];
      for (let s = 0; s < 70; s++) { a += (r() - 0.5) * 0.7; x += Math.cos(a) * 7; y += Math.sin(a) * 7; pts.push([x, y]); }
      for (const ox of [-S, 0, S]) for (const oy of [-S, 0, S]) {
        g.globalAlpha = alpha; g.lineWidth = lw; g.beginPath();
        pts.forEach(([px, py], i) => i ? g.lineTo(px + ox, py + oy) : g.moveTo(px + ox, py + oy));
        g.stroke();
      }
    }
    g.globalAlpha = 1;
    speckle(g, S, S, r, 1400, 0.05, true);
    return toTexture(c, { repeat: true });
  });
}

const WOOD = { oak: ['#c79a66', '#a87a4a'], mahogany: ['#7a3424', '#5a2318'], walnut: ['#6b4428', '#4d2f1b'], light: ['#d9b688', '#bf9566'], dark: ['#4a2c1a', '#33200f'] };

export function wood(tone = 'oak') {
  return cached('wood|' + tone, () => {
    const [a, b] = WOOD[tone] || [tone, shade(tone, 0.75)];
    const W = 512, H = 512, c = makeCanvas(W, H), g = c.getContext('2d');
    const r = rng(hashString(tone));
    g.fillStyle = a; g.fillRect(0, 0, W, H);
    for (let y = 0; y < H; y += 1) {
      const wob = Math.sin(y * 0.05) * 0.5 + Math.sin(y * 0.013 + 1.3) * 0.5;
      g.globalAlpha = 0.06 + Math.abs(wob) * 0.12 * r();
      g.fillStyle = r() > 0.5 ? b : shade(a, 1.12);
      g.fillRect(0, y, W, 1);
    }
    g.globalAlpha = 1;
    g.strokeStyle = b;
    for (let i = 0; i < 90; i++) {
      const y0 = r() * H, amp = 2 + r() * 8, fr = 0.004 + r() * 0.01, ph = r() * 6;
      g.globalAlpha = 0.1 + r() * 0.25; g.lineWidth = 0.6 + r() * 1.6;
      g.beginPath();
      for (let x = 0; x <= W; x += 8) { const y = y0 + Math.sin(x * fr * Math.PI * 2 / 1 + ph) * amp; x ? g.lineTo(x, y) : g.moveTo(x, y); }
      g.stroke();
    }
    for (let k = 0; k < 4; k++) {
      const x = r() * W, y = r() * H;
      g.globalAlpha = 0.35; g.strokeStyle = b;
      for (let rr = 2; rr < 18; rr += 3) { g.beginPath(); g.ellipse(x, y, rr * 2.2, rr * 0.7, 0, 0, Math.PI * 2); g.stroke(); }
    }
    g.globalAlpha = 1;
    return toTexture(c, { repeat: true });
  });
}

export function fabric(colorHex = '#ffffff') {
  return cached('fabric|' + colorHex, () => {
    const S = 128, c = makeCanvas(S, S), g = c.getContext('2d');
    const r = rng(hashString(colorHex));
    g.fillStyle = colorHex; g.fillRect(0, 0, S, S);
    for (let i = 0; i < S; i += 2) {
      g.fillStyle = 'rgba(0,0,0,0.06)'; g.fillRect(i, 0, 1, S);
      g.fillStyle = 'rgba(255,255,255,0.05)'; g.fillRect(0, i, S, 1);
    }
    speckle(g, S, S, r, 500, 0.08, false);
    speckle(g, S, S, r, 300, 0.06, true);
    return toTexture(c, { repeat: true });
  });
}

export function carpet(colorHex = '#6d1620', border = '#c9a24a', round = false) {
  return cached('carpet|' + colorHex + border + round, () => {
    const S = 1024, c = makeCanvas(S, S), g = c.getContext('2d');
    const r = rng(7);
    g.fillStyle = colorHex; g.fillRect(0, 0, S, S);
    speckle(g, S, S, r, 9000, 0.06, false);
    speckle(g, S, S, r, 5000, 0.05, true);
    if (round) {
      g.strokeStyle = border;
      for (const [rad, lw] of [[500, 14], [470, 4], [300, 3], [120, 6]]) { g.lineWidth = lw; g.beginPath(); g.arc(S / 2, S / 2, rad, 0, Math.PI * 2); g.stroke(); }
      g.save(); g.translate(S / 2, S / 2);
      for (let i = 0; i < 36; i++) {
        g.rotate(Math.PI * 2 / 36);
        g.fillStyle = border; g.beginPath(); g.ellipse(0, -385, 10, 34, 0, 0, Math.PI * 2); g.fill();
      }
      g.restore();
    }
    return toTexture(c, { repeat: !round });
  });
}

export function plaster(colorHex = '#efe7d6') {
  return cached('plaster|' + colorHex, () => {
    const S = 256, c = makeCanvas(S, S), g = c.getContext('2d');
    const r = rng(hashString(colorHex) + 3);
    g.fillStyle = colorHex; g.fillRect(0, 0, S, S);
    speckle(g, S, S, r, 2500, 0.05, false);
    speckle(g, S, S, r, 2000, 0.06, true);
    return toTexture(c, { repeat: true });
  });
}

/** Calçada portuguesa: pedra branca com ondas de basalto negro (padrão "mar largo"). */
export function calcada(variant = 'ondas') {
  return cached('calcada|' + variant, () => {
    const S = 1024, c = makeCanvas(S, S), g = c.getContext('2d');
    const r = rng(42 + variant.length);
    g.fillStyle = '#857d70'; g.fillRect(0, 0, S, S);
    const cell = 16, n = S / cell;
    for (let j = 0; j < n; j++) {
      for (let i = 0; i < n; i++) {
        const cx = (i + 0.5) * cell, cy = (j + 0.5) * cell;
        let dark = false;
        if (variant === 'ondas') {
          const f = Math.sin((cy / S) * Math.PI * 2 * 3 + Math.sin((cx / S) * Math.PI * 2 * 2) * 1.6);
          dark = f > 0.62;
        } else if (variant === 'xadrez') {
          dark = ((Math.floor(i / 8) + Math.floor(j / 8)) % 2) === 0 && ((i + j) % 2 === 0);
        }
        const base = dark ? 40 + r() * 22 : 212 + r() * 30;
        const tint = dark ? 0 : r() * 10;
        g.fillStyle = `rgb(${base + tint},${base + tint * 0.7},${base - tint * 0.4})`;
        const j1 = cell * 0.12, s = cell * 0.43;
        g.beginPath();
        g.moveTo(cx - s + (r() - 0.5) * j1, cy - s + (r() - 0.5) * j1);
        g.lineTo(cx + s + (r() - 0.5) * j1, cy - s + (r() - 0.5) * j1);
        g.lineTo(cx + s + (r() - 0.5) * j1, cy + s + (r() - 0.5) * j1);
        g.lineTo(cx - s + (r() - 0.5) * j1, cy + s + (r() - 0.5) * j1);
        g.closePath(); g.fill();
        g.fillStyle = 'rgba(255,255,255,0.10)';
        g.fillRect(cx - s * 0.6, cy - s * 0.7, s * 0.8, s * 0.35);
      }
    }
    return toTexture(c, { repeat: true });
  });
}

export function stoneBlocks(colorHex = '#9b978e', variant = 'granite') {
  return cached('stone|' + colorHex + variant, () => {
    const S = 512, c = makeCanvas(S, S), g = c.getContext('2d');
    const r = rng(hashString(colorHex + variant));
    g.fillStyle = shade(colorHex, 0.7); g.fillRect(0, 0, S, S);
    const rows = variant === 'paving' ? 16 : 8;
    const bh = S / rows;
    for (let j = 0; j < rows; j++) {
      let x = (j % 2) * -bh * 0.8;
      while (x < S) {
        const bw = bh * (1.2 + r() * 1.3);
        g.fillStyle = shade(colorHex, 0.88 + r() * 0.24);
        g.fillRect(x + 2, j * bh + 2, bw - 4, bh - 4);
        speckle({ fillRect: (a, b, cc, d) => g.fillRect(x + 2 + a * (bw - 4) / S, j * bh + 2 + b * (bh - 4) / S, cc, d), set fillStyle(v) { g.fillStyle = v; } }, S, S, r, 30, 0.12, r() > 0.5);
        x += bw;
      }
    }
    return toTexture(c, { repeat: true });
  });
}

export function asphalt() {
  return cached('asphalt', () => {
    const S = 512, c = makeCanvas(S, S), g = c.getContext('2d');
    const r = rng(99);
    g.fillStyle = '#3d3f43'; g.fillRect(0, 0, S, S);
    speckle(g, S, S, r, 14000, 0.10, true);
    speckle(g, S, S, r, 9000, 0.12, false);
    return toTexture(c, { repeat: true });
  });
}

export function grass() {
  return cached('grass', () => {
    const S = 512, c = makeCanvas(S, S), g = c.getContext('2d');
    const r = rng(5);
    g.fillStyle = '#4f7a35'; g.fillRect(0, 0, S, S);
    for (let i = 0; i < 16000; i++) {
      const v = r();
      g.fillStyle = v > 0.66 ? 'rgba(120,170,70,0.35)' : v > 0.33 ? 'rgba(40,80,25,0.35)' : 'rgba(150,160,80,0.25)';
      g.fillRect(r() * S, r() * S, 1 + r() * 2, 2 + r() * 4);
    }
    return toTexture(c, { repeat: true });
  });
}

export function roofTiles(colorHex = '#b5502f') {
  return cached('roof|' + colorHex, () => {
    const S = 256, c = makeCanvas(S, S), g = c.getContext('2d');
    const r = rng(hashString(colorHex));
    g.fillStyle = shade(colorHex, 0.8); g.fillRect(0, 0, S, S);
    const rows = 10, cols = 8, rh = S / rows, cw = S / cols;
    for (let j = 0; j < rows; j++) {
      for (let i = -1; i <= cols; i++) {
        const x = i * cw + (j % 2) * cw / 2;
        const grd = g.createLinearGradient(x, 0, x + cw, 0);
        const base = shade(colorHex, 0.9 + r() * 0.25);
        grd.addColorStop(0, shade(base, 0.75)); grd.addColorStop(0.5, shade(base, 1.15)); grd.addColorStop(1, shade(base, 0.7));
        g.fillStyle = grd;
        g.beginPath(); g.ellipse(x + cw / 2, j * rh + rh * 0.55, cw * 0.48, rh * 0.62, 0, 0, Math.PI * 2); g.fill();
      }
    }
    return toTexture(c, { repeat: true });
  });
}

// ---------------------------------------------------------------- azulejos

function drawTileMotif(g, x, y, s, a, b, pattern) {
  g.fillStyle = b; g.fillRect(x, y, s, s);
  g.strokeStyle = a; g.fillStyle = a;
  const cx = x + s / 2, cy = y + s / 2;
  if (pattern === 0) {
    g.lineWidth = s * 0.05;
    for (let k = 0; k < 4; k++) {
      const ang = k * Math.PI / 2;
      g.beginPath(); g.ellipse(cx + Math.cos(ang) * s * 0.17, cy + Math.sin(ang) * s * 0.17, s * 0.15, s * 0.07, ang, 0, Math.PI * 2); g.fill();
    }
    g.beginPath(); g.arc(cx, cy, s * 0.06, 0, Math.PI * 2); g.fillStyle = b; g.fill(); g.fillStyle = a;
    for (const [qx, qy, st] of [[x, y, 0], [x + s, y, Math.PI / 2], [x + s, y + s, Math.PI], [x, y + s, Math.PI * 1.5]]) {
      g.beginPath(); g.arc(qx, qy, s * 0.3, st, st + Math.PI / 2); g.stroke();
      g.beginPath(); g.arc(qx, qy, s * 0.14, st, st + Math.PI / 2); g.lineTo(qx, qy); g.fill();
    }
  } else if (pattern === 1) {
    g.beginPath(); g.moveTo(cx, y + s * 0.08); g.lineTo(x + s * 0.92, cy); g.lineTo(cx, y + s * 0.92); g.lineTo(x + s * 0.08, cy); g.closePath(); g.fill();
    g.fillStyle = b; g.beginPath(); g.moveTo(cx, y + s * 0.26); g.lineTo(x + s * 0.74, cy); g.lineTo(cx, y + s * 0.74); g.lineTo(x + s * 0.26, cy); g.closePath(); g.fill();
    g.fillStyle = a; g.beginPath(); g.arc(cx, cy, s * 0.1, 0, Math.PI * 2); g.fill();
  } else if (pattern === 2) {
    g.beginPath();
    for (let k = 0; k < 16; k++) {
      const ang = k * Math.PI / 8, rr = k % 2 ? s * 0.18 : s * 0.42;
      const px = cx + Math.cos(ang) * rr, py = cy + Math.sin(ang) * rr;
      k ? g.lineTo(px, py) : g.moveTo(px, py);
    }
    g.closePath(); g.fill();
    g.fillStyle = b; g.beginPath(); g.arc(cx, cy, s * 0.09, 0, Math.PI * 2); g.fill();
  } else {
    g.lineWidth = s * 0.08;
    for (let k = -1; k < 3; k++) { g.beginPath(); g.moveTo(x + k * s / 2, y + s); g.lineTo(x + k * s / 2 + s / 2, y); g.stroke(); }
  }
  const gl = g.createRadialGradient(x + s * 0.3, y + s * 0.3, 0, x + s * 0.3, y + s * 0.3, s * 0.8);
  gl.addColorStop(0, 'rgba(255,255,255,0.18)'); gl.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gl; g.fillRect(x, y, s, s);
  g.strokeStyle = 'rgba(160,160,160,0.6)'; g.lineWidth = Math.max(1, s * 0.02); g.strokeRect(x + 0.5, y + 0.5, s - 1, s - 1);
}

export function azulejo(colorA = '#1f4fa0', colorB = '#f4f1e8', pattern = 0) {
  return cached('azulejo|' + colorA + colorB + pattern, () => {
    const S = 256, c = makeCanvas(S, S), g = c.getContext('2d');
    const t = S / 2;
    for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) drawTileMotif(g, i * t, j * t, t, colorA, colorB, pattern);
    return toTexture(c, { repeat: true });
  });
}

// ---------------------------------------------------------------- fachadas

export const FACADE_STYLES = {
  lisboa: { cell: 'tall', bays: [3, 4], palette: ['#e9c46a', '#e7aaa0', '#f2d47e', '#a9c6d7', '#efe2c6', '#c7d4a9', '#e6b07c', '#ddd6c6'], trim: '#efe9de', balcony: 'first', tiles: 0.3, tileColors: [['#1f4f9e', '#f4f1e8'], ['#2f7a5a', '#f2efe6'], ['#c8962b', '#f5efe0']], corner: 'stone', cornice: true, window: 'tall', ground: 'shop', shutter: null },
  porto: { cell: 'tall', bays: [2, 3], palette: ['#d9d2c4', '#efe5cf', '#c96f4b', '#e7c16d', '#b9c7c9'], trim: '#ece6d9', balcony: 'all', tiles: 0.75, tileColors: [['#1d4e9a', '#f5f2ea'], ['#2d7c63', '#f2efe6'], ['#b8402c', '#f3eee4'], ['#d9a72e', '#f6f1e2'], ['#1d4e9a', '#e9f0f5']], base: 'granite', corner: 'granite', cornice: true, window: 'tall', ground: 'shop', shutter: null },
  norte: { cell: 'medium', bays: [3, 4], palette: ['#a29d93', '#958f85', '#aaa497'], wall: 'granite', trim: '#d8d2c6', shutter: ['#3e5f3a', '#6b3f26', '#2f4a63'], window: 'square', ground: 'door', corner: null, cornice: true },
  interior_norte: { cell: 'medium', bays: [3, 4], palette: ['#8f8a80', '#9d978b', '#f1ede4'], wall: 'granite', trim: '#cfc8bb', shutter: ['#5b3a22', '#3e5f3a', '#6b2b22'], window: 'square', ground: 'door', corner: 'granite', cornice: false },
  centro: { cell: 'medium', bays: [3, 4], palette: ['#f4f1ea', '#f6f2e9', '#efe9dc', '#f1e3c4'], trim: '#a9a398', shutter: ['#3e5f3a', '#7a2e22', '#6b4a2b'], corner: 'granite', window: 'square', ground: 'door', cornice: true, tiles: 0.1, tileColors: [['#1f4f9e', '#f4f1e8']] },
  interior_centro: { cell: 'medium', bays: [3, 4], palette: ['#f2efe8', '#ebe5d8', '#a59f94'], trim: '#9c968b', shutter: ['#6b4a2b', '#3e5f3a'], corner: 'granite', window: 'square', ground: 'door', cornice: false },
  alentejo: { cell: 'low', bays: [3, 4, 5], palette: ['#fbfaf6', '#f8f6f0'], barra: ['#2a5db0', '#e3b21e', '#2a5db0'], window: 'small', ground: 'door', cornice: false },
  algarve: { cell: 'low', bays: [3, 4, 5], palette: ['#fbfaf7', '#f7f4ee', '#f6efe2'], trimColors: ['#2a6fb5', '#c98a2b', '#3d8f5a', '#2a6fb5'], window: 'small', ground: 'door', terrace: true, cornice: false },
  ribatejo: { cell: 'medium', bays: [3, 4], palette: ['#f4efe4', '#efd9a6', '#e8c4a8', '#f3f0e9', '#e9d39a'], trim: '#c8b9a0', shutter: ['#6b3f26', '#3e5f3a'], window: 'square', ground: 'shop', tiles: 0.15, tileColors: [['#1f4f9e', '#f4f1e8'], ['#2f7a5a', '#f2efe6']], cornice: true },
  setubal: { cell: 'tall', bays: [3, 4], palette: ['#efe2c6', '#e9c46a', '#f3f0e9', '#d9b8a0', '#a9c6d7'], trim: '#e8e2d6', tiles: 0.3, tileColors: [['#1f4f9e', '#f4f1e8'], ['#2f7a5a', '#f2efe6']], window: 'tall', ground: 'shop', balcony: 'first', cornice: true },
  ilhas: { cell: 'medium', bays: [3, 4], palette: ['#fbfaf6', '#f6f3ec'], trim: '#2b2b2d', corner: 'basalt', shutter: ['#2f6b3f', '#8a2a22', '#2c4f7a'], window: 'square', ground: 'door', cornice: true },
  emigracao: { cell: 'tall', bays: [3, 4], palette: ['#e2d3b5', '#e8dcc2', '#d9c8a6', '#ddd2bf'], wall: 'limestone', trim: '#efe6d2', balcony: 'all', window: 'tall', ground: 'shop', cornice: true },
};

const SHOPS = ['CAFÉ', 'PASTELARIA', 'FARMÁCIA', 'MERCEARIA', 'BARBEARIA', 'SAPATARIA', 'PADARIA', 'TABACARIA', 'PAPELARIA', 'TASCA', 'FLORISTA', 'RETROSARIA', 'ÓTICA', 'TALHO', 'LIVRARIA', 'BOUTIQUE'];

function drawWindow(g, x, y, w, h, spec, r, opts = {}) {
  const trim = opts.trim || spec.trim || '#efe9de';
  const ft = Math.max(2, w * 0.1);
  if (opts.arch) {
    g.fillStyle = trim; g.beginPath(); g.moveTo(x - ft, y + h + ft); g.lineTo(x - ft, y + w / 2); g.arc(x + w / 2, y + w / 2, w / 2 + ft, Math.PI, 0); g.lineTo(x + w + ft, y + h + ft); g.closePath(); g.fill();
  } else {
    g.fillStyle = trim; g.fillRect(x - ft, y - ft, w + ft * 2, h + ft * 2);
  }
  const grd = g.createLinearGradient(x, y, x + w, y + h);
  const lit = r() < 0.12;
  grd.addColorStop(0, lit ? '#f3d9a0' : '#3b4b5e');
  grd.addColorStop(0.55, lit ? '#d9b46e' : '#1f2a37');
  grd.addColorStop(1, lit ? '#b98d4c' : '#2e3c4c');
  g.fillStyle = grd;
  if (opts.arch) { g.beginPath(); g.moveTo(x, y + h); g.lineTo(x, y + w / 2); g.arc(x + w / 2, y + w / 2, w / 2, Math.PI, 0); g.lineTo(x + w, y + h); g.closePath(); g.fill(); }
  else g.fillRect(x, y, w, h);
  // cortina
  if (!lit && r() < 0.5) { g.fillStyle = 'rgba(235,228,210,0.55)'; g.fillRect(x + 1, y + 1, w * (0.25 + r() * 0.2), h - 2); }
  // reflexo
  g.fillStyle = 'rgba(255,255,255,0.10)';
  g.beginPath(); g.moveTo(x, y + h * 0.65); g.lineTo(x + w * 0.6, y); g.lineTo(x + w * 0.85, y); g.lineTo(x, y + h * 0.95); g.closePath(); g.fill();
  // caixilhos
  g.fillStyle = opts.mullion || '#f2f0ea';
  const mw = Math.max(1.5, w * 0.06);
  g.fillRect(x + w / 2 - mw / 2, y, mw, h);
  const rows = opts.panes || (h > w * 1.6 ? 3 : 2);
  for (let k = 1; k < rows; k++) g.fillRect(x, y + (h * k) / rows - mw / 2, w, mw);
  // portadas
  if (opts.shutter) {
    g.fillStyle = opts.shutter;
    const sw = w * 0.5;
    for (const sx of [x - ft - sw - 1, x + w + ft + 1]) {
      g.fillRect(sx, y - ft * 0.5, sw, h + ft);
      g.fillStyle = 'rgba(0,0,0,0.25)';
      for (let k = 0; k < 8; k++) g.fillRect(sx + 1, y + (h * k) / 8, sw - 2, 1.5);
      g.fillStyle = opts.shutter;
    }
  }
  // peitoril
  g.fillStyle = shade(trim, 0.85); g.fillRect(x - ft * 1.6, y + h + ft * 0.8, w + ft * 3.2, ft * 1.1);
}

function drawBalcony(g, x, y, w, h) {
  g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(x, y + h, w, h * 0.12);
  g.strokeStyle = '#1d1f22'; g.lineWidth = Math.max(1.5, h * 0.06);
  g.strokeRect(x, y, w, h);
  g.lineWidth = Math.max(1, h * 0.035);
  const n = Math.max(4, Math.round(w / (h * 0.22)));
  for (let k = 1; k < n; k++) { const bx = x + (w * k) / n; g.beginPath(); g.moveTo(bx, y); g.lineTo(bx, y + h); g.stroke(); }
  g.beginPath(); for (let k = 0; k < n; k++) { const bx = x + (w * (k + 0.5)) / n; g.moveTo(bx + h * 0.12, y + h * 0.5); g.arc(bx, y + h * 0.5, h * 0.12, 0, Math.PI * 2); } g.stroke();
}

function drawTilesArea(g, x, y, w, h, a, b, r, pattern) {
  const t = Math.max(8, Math.round(w / 14));
  for (let yy = y; yy < y + h; yy += t) for (let xx = x; xx < x + w; xx += t) {
    g.fillStyle = b; g.fillRect(xx, yy, t, t);
    g.fillStyle = a;
    if (pattern === 0) { g.beginPath(); g.arc(xx + t / 2, yy + t / 2, t * 0.22, 0, Math.PI * 2); g.fill(); g.fillRect(xx, yy, t * 0.18, t * 0.18); }
    else if (pattern === 1) { g.beginPath(); g.moveTo(xx + t / 2, yy + t * 0.1); g.lineTo(xx + t * 0.9, yy + t / 2); g.lineTo(xx + t / 2, yy + t * 0.9); g.lineTo(xx + t * 0.1, yy + t / 2); g.closePath(); g.fill(); }
    else { g.fillRect(xx + t * 0.15, yy + t * 0.42, t * 0.7, t * 0.16); g.fillRect(xx + t * 0.42, yy + t * 0.15, t * 0.16, t * 0.7); }
    g.fillStyle = 'rgba(255,255,255,0.12)'; g.fillRect(xx + 1, yy + 1, t * 0.4, t * 0.3);
    g.strokeStyle = 'rgba(120,120,120,0.35)'; g.lineWidth = 1; g.strokeRect(xx + 0.5, yy + 0.5, t - 1, t - 1);
  }
}

function drawGranite(g, x, y, w, h, base, r) {
  g.fillStyle = shade(base, 0.72); g.fillRect(x, y, w, h);
  const bh = Math.max(6, w / 18);
  for (let yy = y, row = 0; yy < y + h; yy += bh, row++) {
    let xx = x - (row % 2) * bh;
    while (xx < x + w) {
      const bw = bh * (1.4 + r() * 1.6);
      g.fillStyle = shade(base, 0.85 + r() * 0.28);
      g.fillRect(Math.max(x, xx + 1), yy + 1, Math.min(bw - 2, x + w - xx - 1), bh - 2);
      xx += bw;
    }
  }
}

/** Desenha uma fachada completa dentro de um retângulo do canvas. */
export function drawFacade(g, x0, y0, w, h, spec, wallColor, r, meters) {
  const W = meters.w, H = meters.h; // dimensões reais
  const pxm = w / W;
  const groundH = Math.min(3.8, H * 0.45) * pxm;
  const floorsUp = Math.max(0, Math.round((H - groundH / pxm - 0.5) / 3.0));
  const upperH = h - groundH;
  const floorH = floorsUp > 0 ? (upperH - (spec.cornice ? 0.6 * pxm : 0.2 * pxm)) / floorsUp : 0;
  const bays = meters.bays;
  const bayW = w / bays;
  // parede
  if (spec.wall === 'granite') drawGranite(g, x0, y0, w, h, wallColor, r);
  else {
    g.fillStyle = wallColor; g.fillRect(x0, y0, w, h);
    if (spec.wall === 'limestone') {
      g.fillStyle = 'rgba(0,0,0,0.07)';
      for (let yy = y0 + 0.6 * pxm; yy < y0 + h; yy += 0.6 * pxm) g.fillRect(x0, yy, w, Math.max(1, pxm * 0.04));
    }
    speckle({ fillRect: (a, b, c2, d) => g.fillRect(x0 + (a / 512) * w, y0 + (b / 512) * h, c2, d), set fillStyle(v) { g.fillStyle = v; } }, 512, 512, r, 900, 0.06, false);
  }
  const tiled = spec.tiles && r() < spec.tiles;
  if (tiled) {
    const [ta, tb] = spec.tileColors[Math.floor(r() * spec.tileColors.length)];
    drawTilesArea(g, x0, y0, w, upperH, ta, tb, r, Math.floor(r() * 3));
  }
  // cunhais / pilastras
  const cornerW = 0.45 * pxm;
  if (spec.corner) {
    const cc = spec.corner === 'basalt' ? '#2d2d30' : spec.corner === 'granite' ? '#9d988e' : '#e9e3d8';
    if (spec.corner === 'granite') { drawGranite(g, x0, y0, cornerW, h, '#a39e94', r); drawGranite(g, x0 + w - cornerW, y0, cornerW, h, '#a39e94', r); }
    else { g.fillStyle = cc; g.fillRect(x0, y0, cornerW, h); g.fillRect(x0 + w - cornerW, y0, cornerW, h); }
  }
  // base em granito / barra alentejana
  if (spec.base === 'granite') drawGranite(g, x0, y0 + upperH, w, groundH, '#8f8a82', r);
  let barraColor = null;
  if (spec.barra) {
    barraColor = spec.barra[Math.floor(r() * spec.barra.length)];
    g.fillStyle = barraColor; g.fillRect(x0, y0 + h - 0.9 * pxm, w, 0.9 * pxm);
    g.fillRect(x0, y0, w, 0.25 * pxm);
    g.fillRect(x0, y0, 0.3 * pxm, h); g.fillRect(x0 + w - 0.3 * pxm, y0, 0.3 * pxm, h);
  }
  const trimColor = spec.trimColors ? spec.trimColors[Math.floor(r() * spec.trimColors.length)] : (barraColor || spec.trim);
  // cornija
  if (spec.cornice) {
    g.fillStyle = shade(spec.trim || '#e8e2d6', 0.92); g.fillRect(x0, y0, w, 0.5 * pxm);
    g.fillStyle = 'rgba(0,0,0,0.22)'; g.fillRect(x0, y0 + 0.5 * pxm, w, 0.12 * pxm);
    if (floorsUp > 0) { g.fillStyle = shade(spec.trim || '#e8e2d6', 0.95); g.fillRect(x0, y0 + upperH - 0.18 * pxm, w, 0.18 * pxm); }
  }
  if (spec.terrace) {
    g.fillStyle = shade(wallColor, 0.93); g.fillRect(x0, y0, w, 0.7 * pxm);
    g.fillStyle = trimColor; g.fillRect(x0, y0 + 0.7 * pxm, w, 0.08 * pxm);
  }
  // janelas dos andares
  const shutter = spec.shutter ? spec.shutter[Math.floor(r() * spec.shutter.length)] : null;
  for (let f = 0; f < floorsUp; f++) {
    const fy = y0 + (spec.cornice ? 0.6 * pxm : 0.2 * pxm) + f * floorH;
    for (let b = 0; b < bays; b++) {
      let ww = spec.window === 'small' ? bayW * 0.34 : spec.window === 'square' ? bayW * 0.4 : bayW * 0.42;
      let wh = spec.window === 'small' ? floorH * 0.42 : spec.window === 'square' ? floorH * 0.48 : floorH * 0.62;
      if (shutter) ww *= 0.8;
      const wx = x0 + b * bayW + (bayW - ww) / 2;
      const wy = fy + floorH * (spec.window === 'tall' ? 0.2 : 0.28);
      const door = spec.balcony === 'all' || (spec.balcony === 'first' && f === floorsUp - 1);
      if (door) wh = floorH * 0.72;
      drawWindow(g, wx, wy, ww, wh, spec, r, { trim: trimColor, shutter, arch: spec.window === 'tall' && r() < 0.15 });
      if (door) drawBalcony(g, wx - ww * 0.18, wy + wh * 0.62, ww * 1.36, wh * 0.38);
    }
  }
  // rés-do-chão
  const gy = y0 + upperH;
  if (spec.ground === 'shop' && r() < 0.8) {
    const shopName = SHOPS[Math.floor(r() * SHOPS.length)];
    const signH = groundH * 0.16;
    g.fillStyle = r() < 0.5 ? '#1f2a37' : shade(trimColor || '#555', 0.5);
    g.fillRect(x0 + bayW * 0.2, gy + groundH * 0.08, w - bayW * 0.4, signH);
    g.fillStyle = '#f5ecd2'; g.font = `bold ${Math.round(signH * 0.62)}px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(shopName, x0 + w / 2, gy + groundH * 0.08 + signH / 2);
    if (shopName === 'FARMÁCIA') { g.fillStyle = '#16a34a'; const cx = x0 + bayW * 0.45, cy = gy + groundH * 0.08 + signH / 2, s = signH * 0.35; g.fillRect(cx - s, cy - s / 3, s * 2, s * 2 / 3); g.fillRect(cx - s / 3, cy - s, s * 2 / 3, s * 2); }
    for (let b = 0; b < bays; b++) {
      const dw = bayW * 0.66, dx = x0 + b * bayW + (bayW - dw) / 2, dy = gy + groundH * 0.3, dh = groundH * 0.68;
      g.fillStyle = shade(trimColor || '#e9e3d8', 0.9); g.fillRect(dx - 3, dy - 3, dw + 6, dh + 3);
      const grd = g.createLinearGradient(dx, dy, dx, dy + dh);
      grd.addColorStop(0, '#2a3644'); grd.addColorStop(1, '#4a5868');
      g.fillStyle = grd; g.fillRect(dx, dy, dw, dh);
      g.fillStyle = 'rgba(255,240,200,0.18)'; g.fillRect(dx + dw * 0.1, dy + dh * 0.45, dw * 0.8, dh * 0.4);
      g.fillStyle = 'rgba(255,255,255,0.12)'; g.fillRect(dx, dy, dw * 0.25, dh);
    }
  } else {
    // portas e janelas residenciais
    const doorBay = Math.floor(r() * bays);
    for (let b = 0; b < bays; b++) {
      if (b === doorBay) {
        const dw = bayW * 0.46, dh = groundH * 0.78, dx = x0 + b * bayW + (bayW - dw) / 2, dy = gy + groundH - dh - (spec.barra ? 0 : 0.05 * pxm);
        g.fillStyle = trimColor || '#ddd'; g.fillRect(dx - 3, dy - 3, dw + 6, dh + 3);
        const doorCol = ['#5a3420', '#2f4a63', '#3e5f3a', '#7a2e22', '#3b2a20'][Math.floor(r() * 5)];
        g.fillStyle = doorCol; g.fillRect(dx, dy, dw, dh);
        g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(dx + dw * 0.08, dy + dh * 0.08, dw * 0.36, dh * 0.38); g.fillRect(dx + dw * 0.56, dy + dh * 0.08, dw * 0.36, dh * 0.38);
        g.fillRect(dx + dw * 0.08, dy + dh * 0.54, dw * 0.36, dh * 0.38); g.fillRect(dx + dw * 0.56, dy + dh * 0.54, dw * 0.36, dh * 0.38);
        g.fillStyle = '#c9a24a'; g.beginPath(); g.arc(dx + dw * 0.82, dy + dh * 0.52, Math.max(1.5, dw * 0.04), 0, Math.PI * 2); g.fill();
      } else {
        const ww = bayW * (spec.window === 'small' ? 0.32 : 0.4), wh = groundH * 0.42;
        drawWindow(g, x0 + b * bayW + (bayW - ww) / 2, gy + groundH * 0.25, ww, wh, spec, r, { trim: trimColor, shutter });
      }
    }
  }
  // sujidade / envelhecimento junto ao chão
  const dirt = g.createLinearGradient(0, y0 + h - groundH * 0.4, 0, y0 + h);
  dirt.addColorStop(0, 'rgba(60,50,40,0)'); dirt.addColorStop(1, 'rgba(60,50,40,0.18)');
  g.fillStyle = dirt; g.fillRect(x0, y0 + h - groundH * 0.4, w, groundH * 0.4);
}

const CELL_LAYOUT = { tall: { cols: 4, rows: 2, aspect: 2 }, medium: { cols: 4, rows: 4, aspect: 1 }, low: { cols: 2, rows: 4, aspect: 0.5 } };

/** Atlas de fachadas para um estilo: { texture, cells:[{u0,v0,u1,v1,w,h,bays,wall}] } */
export function facadeAtlas(style = 'lisboa', seed = 1, size = 1024) {
  const key = 'atlas|' + style + '|' + seed + '|' + size;
  if (cache.has(key)) return cache.get(key).userData.atlas;
  const spec = FACADE_STYLES[style] || FACADE_STYLES.lisboa;
  const L = CELL_LAYOUT[spec.cell];
  const c = makeCanvas(size, size), g = c.getContext('2d');
  const r = rng(hashString(style) + seed * 7919);
  const cw = size / L.cols, ch = size / L.rows;
  const cells = [];
  for (let j = 0; j < L.rows; j++) {
    for (let i = 0; i < L.cols; i++) {
      const bays = spec.bays[Math.floor(r() * spec.bays.length)];
      const bayM = spec.cell === 'low' ? 2.4 : spec.cell === 'tall' ? (style === 'porto' ? 2.6 : 2.4) : 2.5;
      const wM = bays * bayM;
      const hM = wM * L.aspect;
      const wall = spec.palette[Math.floor(r() * spec.palette.length)];
      const x0 = i * cw, y0 = j * ch;
      g.save(); g.beginPath(); g.rect(x0, y0, cw, ch); g.clip();
      drawFacade(g, x0 + 1, y0 + 1, cw - 2, ch - 2, spec, wall, r, { w: wM, h: hM, bays });
      g.restore();
      cells.push({ u0: (x0 + 1) / size, u1: (x0 + cw - 1) / size, v0: 1 - (y0 + ch - 1) / size, v1: 1 - (y0 + 1) / size, w: wM, h: hM, bays, wall });
    }
  }
  const tex = toTexture(c, { aniso: 8 });
  tex.userData.cached = true;
  tex.userData.atlas = { texture: tex, cells, spec };
  cache.set(key, tex);
  return tex.userData.atlas;
}

/** Fachada individual (cache): devolve textura. */
export function facade(style = 'lisboa', colorHex = null, seed = 1, opts = {}) {
  const spec = FACADE_STYLES[style] || FACADE_STYLES.lisboa;
  const bays = opts.bays || spec.bays[0];
  const L = CELL_LAYOUT[spec.cell];
  const wM = bays * 2.4, hM = opts.h || wM * L.aspect;
  const wall = colorHex || spec.palette[seed % spec.palette.length];
  return cached(`facade|${style}|${wall}|${seed}|${bays}|${hM}`, () => {
    const pw = 256, ph = Math.round(256 * hM / wM);
    const c = makeCanvas(pw, ph), g = c.getContext('2d');
    drawFacade(g, 0, 0, pw, ph, spec, wall, rng(seed * 31 + 7), { w: wM, h: hM, bays });
    return toTexture(c);
  });
}

// ---------------------------------------------------------------- texto, imagens e logótipos

export function textTexture(lines, o = {}) {
  const w = o.w || 1024, h = o.h || 256;
  const c = makeCanvas(w, h), g = c.getContext('2d');
  if (o.bg) { g.fillStyle = o.bg; g.fillRect(0, 0, w, h); }
  const L = (Array.isArray(lines) ? lines : [String(lines ?? '')]).map(String);
  let size = o.size || Math.floor(h / (L.length * 1.3));
  const weight = o.weight || 'bold';
  const fontOf = (s) => `${weight} ${s}px ${o.font || FONT}`;
  const pad = o.padding ?? w * 0.04;
  g.font = fontOf(size);
  while (size > 8 && L.some(t => g.measureText(t).width > w - pad * 2)) { size -= 2; g.font = fontOf(size); }
  g.textBaseline = 'middle';
  g.textAlign = o.align || 'center';
  const lh = size * (o.lineHeight || 1.18);
  let y = h / 2 - (lh * L.length) / 2 + lh / 2;
  const x = g.textAlign === 'center' ? w / 2 : g.textAlign === 'left' ? pad : w - pad;
  for (const t of L) {
    if (o.shadow) { g.fillStyle = o.shadow; g.fillText(t, x + size * 0.04, y + size * 0.05); }
    g.fillStyle = o.fg || '#ffffff';
    g.fillText(t, x, y);
    y += lh;
  }
  const tex = toTexture(c, { mipmaps: o.mipmaps !== false });
  tex.userData.canvas = c;
  return tex;
}

/** Textura a partir de um dataURL (canvas de tamanho fixo; atualiza quando a imagem carregar). */
export function imageTexture(dataURL, o = {}) {
  const w = o.w || 512, h = o.h || 512;
  const c = makeCanvas(w, h), g = c.getContext('2d');
  const paintBg = () => {
    if (o.bg) { g.fillStyle = o.bg; g.fillRect(0, 0, w, h); } else g.clearRect(0, 0, w, h);
  };
  paintBg();
  if (o.placeholder) { g.fillStyle = 'rgba(255,255,255,0.85)'; g.font = `bold ${Math.round(h * 0.3)}px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(o.placeholder, w / 2, h / 2); }
  const tex = toTexture(c);
  tex.userData.canvas = c;
  if (dataURL) {
    loadImage(dataURL, (img) => {
      paintBg();
      const pad = o.padding || 0;
      drawFit(g, img, pad, pad, w - pad * 2, h - pad * 2, o.fit || 'contain');
      tex.needsUpdate = true;
      o.onLoad?.(tex);
    });
  }
  return tex;
}

/** Placa com o logótipo do partido (ou sigla) sobre a cor do partido. */
export function logoPlate(dataURL, fallbackText = '?', colorHex = '#555555', o = {}) {
  const key = 'logo|' + (dataURL ? hashString(dataURL) : '-') + '|' + fallbackText + '|' + colorHex + '|' + (o.w || 512) + 'x' + (o.h || 512);
  return cached(key, () => {
    const w = o.w || 512, h = o.h || 512;
    const c = makeCanvas(w, h), g = c.getContext('2d');
    const base = new THREE.Color(colorHex);
    const paint = (img) => {
      const grd = g.createLinearGradient(0, 0, 0, h);
      grd.addColorStop(0, '#' + base.clone().offsetHSL(0, 0, 0.08).getHexString());
      grd.addColorStop(1, '#' + base.clone().offsetHSL(0, 0, -0.12).getHexString());
      g.fillStyle = grd; g.fillRect(0, 0, w, h);
      if (img) {
        const m = Math.min(w, h) * 0.08;
        g.fillStyle = '#ffffff'; roundRect(g, m, m, w - m * 2, h - m * 2, Math.min(w, h) * 0.08); g.fill();
        drawFit(g, img, m * 1.6, m * 1.6, w - m * 3.2, h - m * 3.2, 'contain');
      } else {
        g.fillStyle = '#ffffff';
        let fs = Math.min(h * 0.42, (w * 0.9) / Math.max(1, fallbackText.length * 0.62));
        g.font = `900 ${Math.round(fs)}px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle';
        g.shadowColor = 'rgba(0,0,0,0.35)'; g.shadowBlur = fs * 0.12; g.shadowOffsetY = fs * 0.04;
        g.fillText(fallbackText, w / 2, h / 2);
        g.shadowColor = 'transparent';
      }
    };
    paint(null);
    const tex = toTexture(c);
    if (dataURL) loadImage(dataURL, (img) => { paint(img); tex.needsUpdate = true; });
    return tex;
  });
}

/** Crachá flutuante: foto circular (ou iniciais) com anel na cor do partido e nome por baixo. */
export function badgeTexture(photo, name, colorHex = '#2563eb', o = {}) {
  const w = 256, h = 320;
  const c = makeCanvas(w, h), g = c.getContext('2d');
  const cx = w / 2, cy = 112, R = 92;
  const paint = (img) => {
    g.clearRect(0, 0, w, h);
    g.save();
    g.shadowColor = 'rgba(0,0,0,0.45)'; g.shadowBlur = 14; g.shadowOffsetY = 4;
    g.fillStyle = colorHex; g.beginPath(); g.arc(cx, cy, R + 12, 0, Math.PI * 2); g.fill();
    g.restore();
    g.fillStyle = '#ffffff'; g.beginPath(); g.arc(cx, cy, R + 3, 0, Math.PI * 2); g.fill();
    g.save(); g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.clip();
    if (img) drawFit(g, img, cx - R, cy - R, R * 2, R * 2, 'cover');
    else {
      const grd = g.createLinearGradient(0, cy - R, 0, cy + R);
      grd.addColorStop(0, '#' + new THREE.Color(colorHex).offsetHSL(0, 0, 0.12).getHexString()); grd.addColorStop(1, colorHex);
      g.fillStyle = grd; g.fillRect(cx - R, cy - R, R * 2, R * 2);
      g.fillStyle = '#fff'; g.font = `800 ${Math.round(R * 0.85)}px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(mkInitials(name), cx, cy + 4);
    }
    g.restore();
    if (name) {
      const label = String(name);
      g.font = `700 26px ${FONT}`;
      const tw = Math.min(w - 8, g.measureText(label).width + 28);
      g.fillStyle = 'rgba(12,16,24,0.85)'; roundRect(g, cx - tw / 2, 236, tw, 40, 20); g.fill();
      g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(label, cx, 257, w - 30);
      g.fillStyle = colorHex; g.fillRect(cx - tw / 2 + 18, 272, tw - 36, 3);
    }
  };
  paint(null);
  const tex = toTexture(c, { mipmaps: true });
  if (photo) loadImage(photo, (img) => { paint(img); tex.needsUpdate = true; });
  return tex;
}

/** Ícones dos marcadores sobre os cidadãos. */
export function markerTexture(kind) {
  return cached('marker|' + kind, () => {
    const S = 128, c = makeCanvas(S, S), g = c.getContext('2d');
    const cx = S / 2, cy = S / 2;
    const disc = (fill) => {
      g.save(); g.shadowColor = 'rgba(0,0,0,0.4)'; g.shadowBlur = 8; g.shadowOffsetY = 3;
      g.fillStyle = fill; g.beginPath(); g.arc(cx, cy, 48, 0, Math.PI * 2); g.fill(); g.restore();
      g.strokeStyle = '#fff'; g.lineWidth = 6; g.beginPath(); g.arc(cx, cy, 48, 0, Math.PI * 2); g.stroke();
    };
    if (kind === 'supporter') {
      disc('#ffffff');
      g.fillStyle = '#e11d48';
      g.beginPath(); g.moveTo(cx, cy + 26);
      g.bezierCurveTo(cx - 44, cy - 4, cx - 22, cy - 40, cx, cy - 16);
      g.bezierCurveTo(cx + 22, cy - 40, cx + 44, cy - 4, cx, cy + 26); g.fill();
    } else if (kind === 'undecided') {
      disc('#6b7280');
      g.fillStyle = '#fff'; g.font = `900 64px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('?', cx, cy + 3);
    } else if (kind === 'hostile') {
      disc('#ea580c');
      g.fillStyle = '#1f1f1f';
      g.beginPath(); g.arc(cx - 15, cy - 4, 6, 0, Math.PI * 2); g.arc(cx + 15, cy - 4, 6, 0, Math.PI * 2); g.fill();
      g.strokeStyle = '#1f1f1f'; g.lineWidth = 6; g.lineCap = 'round';
      g.beginPath(); g.moveTo(cx - 26, cy - 22); g.lineTo(cx - 8, cy - 13); g.moveTo(cx + 26, cy - 22); g.lineTo(cx + 8, cy - 13); g.stroke();
      g.beginPath(); g.arc(cx, cy + 24, 13, Math.PI * 1.15, Math.PI * 1.85); g.stroke();
    } else if (kind === 'converted') {
      disc('#f59e0b');
      g.fillStyle = '#fff'; g.beginPath();
      for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? 14 : 32; const px = cx + Math.cos(a) * rr, py = cy + Math.sin(a) * rr; k ? g.lineTo(px, py) : g.moveTo(px, py); }
      g.closePath(); g.fill();
    } else if (kind === 'done') {
      disc('#16a34a');
      g.strokeStyle = '#fff'; g.lineWidth = 11; g.lineCap = 'round'; g.lineJoin = 'round';
      g.beginPath(); g.moveTo(cx - 22, cy + 2); g.lineTo(cx - 6, cy + 18); g.lineTo(cx + 24, cy - 16); g.stroke();
    } else {
      disc('#3b82f6');
    }
    return toTexture(c);
  });
}

export function glowTexture(colorHex = '#ffffff') {
  return cached('glow|' + colorHex, () => {
    const S = 128, c = makeCanvas(S, S), g = c.getContext('2d');
    const col = new THREE.Color(colorHex);
    const rgb = `${Math.round(col.r * 255)},${Math.round(col.g * 255)},${Math.round(col.b * 255)}`;
    const grd = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
    grd.addColorStop(0, `rgba(${rgb},1)`); grd.addColorStop(0.25, `rgba(${rgb},0.5)`); grd.addColorStop(1, `rgba(${rgb},0)`);
    g.fillStyle = grd; g.fillRect(0, 0, S, S);
    return toTexture(c);
  });
}

/** Gradiente vertical para cones de luz (alpha decrescente). */
export function coneGradient() {
  return cached('cone', () => {
    const c = makeCanvas(4, 256), g = c.getContext('2d');
    const grd = g.createLinearGradient(0, 0, 0, 256);
    grd.addColorStop(0, 'rgba(255,255,255,0.0)');
    grd.addColorStop(0.04, 'rgba(255,255,255,0.9)');
    grd.addColorStop(0.35, 'rgba(255,255,255,0.35)');
    grd.addColorStop(1, 'rgba(255,255,255,0.0)');
    g.fillStyle = grd; g.fillRect(0, 0, 4, 256);
    return toTexture(c, { srgb: false });
  });
}

export function skyTexture(top = '#5b8fd1', mid = '#a9cbe8', bottom = '#e9eef0') {
  return cached('sky|' + top + mid + bottom, () => {
    const c = makeCanvas(8, 512), g = c.getContext('2d');
    const grd = g.createLinearGradient(0, 0, 0, 512);
    grd.addColorStop(0, top); grd.addColorStop(0.42, mid); grd.addColorStop(0.5, bottom); grd.addColorStop(1, shade(bottom, 0.7));
    g.fillStyle = grd; g.fillRect(0, 0, 8, 512);
    return toTexture(c, { mipmaps: false });
  });
}

/** Bandeira de Portugal estilizada (verde/vermelho + esfera armilar). */
export function flagPortugal() {
  return cached('flagPT', () => {
    const W = 600, H = 400, c = makeCanvas(W, H), g = c.getContext('2d');
    g.fillStyle = '#046a38'; g.fillRect(0, 0, W * 0.4, H);
    g.fillStyle = '#da291c'; g.fillRect(W * 0.4, 0, W * 0.6, H);
    const cx = W * 0.4, cy = H / 2, R = H * 0.3;
    g.strokeStyle = '#ffe900'; g.lineWidth = 9;
    g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.stroke();
    g.lineWidth = 6;
    g.beginPath(); g.ellipse(cx, cy, R, R * 0.35, 0, 0, Math.PI * 2); g.stroke();
    g.beginPath(); g.ellipse(cx, cy, R * 0.35, R, 0, 0, Math.PI * 2); g.stroke();
    g.beginPath(); g.ellipse(cx, cy, R, R * 0.35, 0.5, 0, Math.PI * 2); g.stroke();
    g.fillStyle = '#ffffff'; g.strokeStyle = '#da291c'; g.lineWidth = 6;
    g.beginPath(); g.moveTo(cx - R * 0.48, cy - R * 0.55); g.lineTo(cx + R * 0.48, cy - R * 0.55); g.lineTo(cx + R * 0.48, cy + R * 0.15); g.quadraticCurveTo(cx + R * 0.48, cy + R * 0.62, cx, cy + R * 0.7); g.quadraticCurveTo(cx - R * 0.48, cy + R * 0.62, cx - R * 0.48, cy + R * 0.15); g.closePath();
    g.fillStyle = '#da291c'; g.fill();
    g.fillStyle = '#ffffff';
    g.beginPath(); g.moveTo(cx - R * 0.34, cy - R * 0.42); g.lineTo(cx + R * 0.34, cy - R * 0.42); g.lineTo(cx + R * 0.34, cy + R * 0.12); g.quadraticCurveTo(cx + R * 0.34, cy + R * 0.48, cx, cy + R * 0.55); g.quadraticCurveTo(cx - R * 0.34, cy + R * 0.48, cx - R * 0.34, cy + R * 0.12); g.closePath(); g.fill();
    g.fillStyle = '#003399';
    for (const [dx, dy] of [[0, -0.22], [-0.18, 0.02], [0, 0.02], [0.18, 0.02], [0, 0.26]]) { g.fillRect(cx + dx * R - R * 0.06, cy + dy * R - R * 0.09, R * 0.12, R * 0.18); }
    return toTexture(c);
  });
}
