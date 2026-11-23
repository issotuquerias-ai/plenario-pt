// Utilitários gerais (formatação pt-PT, cores, texto)
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const round = (n, d = 0) => { const k = Math.pow(10, d); return Math.round(n * k) / k; };
export const sum = (arr, f = x => x) => arr.reduce((s, x) => s + (f(x) || 0), 0);
export const sleep = ms => new Promise(r => setTimeout(r, ms));
export const deepClone = o => JSON.parse(JSON.stringify(o));
export const byId = (arr, id) => arr.find(x => x.id === id);
let _uid = 0;
export const uid = (p = 'id') => `${p}_${Date.now().toString(36)}_${(_uid++).toString(36)}${Math.floor(Math.random() * 1e4).toString(36)}`;

export function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

const nf = {};
function numFmt(d) { return nf[d] || (nf[d] = new Intl.NumberFormat('pt-PT', { minimumFractionDigits: d, maximumFractionDigits: d })); }
export const fmtNum = (n, d = 0) => numFmt(d).format(Number.isFinite(n) ? n : 0);
export const fmtPct = (n, d = 1) => fmtNum(n, d) + '%';
export const fmtSigned = (n, d = 1, suffix = '') => (n > 0 ? '+' : n < 0 ? '−' : '±') + fmtNum(Math.abs(n), d) + suffix;
export function fmtEur(n, compact = true) {
  const a = Math.abs(n), s = n < 0 ? '−' : '';
  if (compact) {
    if (a >= 1e9) return s + fmtNum(a / 1e9, 1) + ' mil M€';
    if (a >= 1e6) return s + fmtNum(a / 1e6, a >= 1e7 ? 0 : 1) + ' M€';
    if (a >= 1e4) return s + fmtNum(a / 1e3, 0) + ' mil €';
  }
  return s + fmtNum(a, 0) + ' €';
}
// Valores em milhões de euros (M€)
export const fmtMEur = n => (Math.abs(n) >= 1000 ? fmtNum(n / 1000, 1) + ' mil M€' : fmtNum(n, 0) + ' M€');

export function initials(name) {
  const parts = String(name || '?').replace(/\b(de|da|do|dos|das|e)\b/gi, ' ').trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
export const plural = (n, s, p) => `${fmtNum(n)} ${n === 1 ? s : p}`;
export function normalizeText(s) {
  return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}
export function fillTemplate(str, vars = {}) {
  return String(str || '').replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? vars[k] : m));
}
export function capitalize(s) { s = String(s || ''); return s.charAt(0).toUpperCase() + s.slice(1); }
export function slugify(s) { return normalizeText(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
export function truncate(s, n) { s = String(s || ''); return s.length > n ? s.slice(0, n - 1) + '…' : s; }
export function romanize(num) {
  const map = [['M', 1000], ['CM', 900], ['D', 500], ['CD', 400], ['C', 100], ['XC', 90], ['L', 50], ['XL', 40], ['X', 10], ['IX', 9], ['V', 5], ['IV', 4], ['I', 1]];
  let r = ''; for (const [l, v] of map) while (num >= v) { r += l; num -= v; } return r;
}

// ---- Cores ----
export function hexToRgb(hex) {
  let h = String(hex || '#888').replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const n = parseInt(h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
export function rgbToHex({ r, g, b }) { return '#' + [r, g, b].map(v => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join(''); }
export function mixColor(a, b, t) { const A = hexToRgb(a), B = hexToRgb(b); return rgbToHex({ r: lerp(A.r, B.r, t), g: lerp(A.g, B.g, t), b: lerp(A.b, B.b, t) }); }
export function luminance(hex) { const { r, g, b } = hexToRgb(hex); return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255; }
export const contrastText = hex => (luminance(hex) > 0.6 ? '#111827' : '#ffffff');
export function withAlpha(hex, a) { const { r, g, b } = hexToRgb(hex); return `rgba(${r},${g},${b},${a})`; }

// Redimensiona uma imagem (dataURL) para caber em maxW×maxH; devolve dataURL JPEG/PNG.
export function resizeImage(dataURL, maxW = 256, maxH = 256, type = 'image/jpeg', quality = 0.86, cover = false) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let sx = 0, sy = 0, sw = img.width, sh = img.height;
      let w, h;
      if (cover) {
        const ar = maxW / maxH;
        if (sw / sh > ar) { const nw = sh * ar; sx = (sw - nw) / 2; sw = nw; } else { const nh = sw / ar; sy = 0; sh = nh; }
        w = maxW; h = maxH;
      } else {
        const s = Math.min(1, maxW / sw, maxH / sh); w = Math.round(sw * s); h = Math.round(sh * s);
      }
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      const g = c.getContext('2d'); g.imageSmoothingQuality = 'high';
      g.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
      resolve(c.toDataURL(type, quality));
    };
    img.onerror = reject;
    img.src = dataURL;
  });
}
export function readFileAsDataURL(file) {
  return new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.onerror = rej; fr.readAsDataURL(file); });
}
