// Utilitários partilhados pelos módulos 3D do PLENÁRIO PT.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export function rng(seed = 1) {
  let a = (seed >>> 0) || 1;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashString(s) {
  s = String(s ?? '');
  let h = 2166136261 >>> 0;
  // para strings enormes (dataURLs) amostramos para não pesar
  const step = s.length > 20000 ? Math.floor(s.length / 20000) : 1;
  for (let i = 0; i < s.length; i += step) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  h ^= s.length;
  return h >>> 0;
}

export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const smoothstep = (t) => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
export const easeInOut = (t) => { t = clamp(t, 0, 1); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
export const easeOutBack = (t) => { const c1 = 1.70158, c3 = c1 + 1; t = clamp(t, 0, 1); return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
export function damp(current, target, lambda, dt) { return lerp(current, target, 1 - Math.exp(-lambda * dt)); }
export function dampAngle(current, target, lambda, dt) {
  let d = target - current;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return current + d * (1 - Math.exp(-lambda * dt));
}
export const pick = (r, arr) => arr[Math.floor(r() * arr.length) % arr.length];

/** Saco de recursos descartáveis (geometrias, materiais, texturas, render targets). */
export class Bag {
  constructor() { this.items = new Set(); }
  add(x) { if (x && typeof x.dispose === 'function') this.items.add(x); return x; }
  geo(g) { return this.add(g); }
  mat(m) { return this.add(m); }
  tex(t) { return this.add(t); }
  dispose() {
    for (const x of this.items) { try { x.dispose(); } catch (e) { /* ignora */ } }
    this.items.clear();
  }
}

const FEMALE = new Set(['ines', 'inês', 'isabel', 'raquel', 'beatriz', 'leonor', 'carmo', 'rosario', 'rosário', 'lurdes',
  'ester', 'rute', 'ruth', 'alice', 'irene', 'denise', 'adelaide', 'simone', 'elisabete', 'dulce', 'clarisse', 'judite',
  'conceicao', 'conceição', 'assuncao', 'assunção', 'luz', 'mercedes', 'carmen', 'miriam', 'noemi', 'noémia', 'ingrid',
  'aline', 'michele', 'liliane', 'marisol', 'ivone', 'yolanda', 'iolanda', 'jaqueline', 'filipe_x']);
const MALE_A = new Set(['luca', 'andrea_x', 'nikita', 'joshua', 'costa', 'garcia']);

/** Heurística de género a partir do primeiro nome (português). */
export function inferGender(name) {
  const first = String(name || '').trim().split(/\s+/)[0]?.toLowerCase() || '';
  if (!first) return 'm';
  if (FEMALE.has(first)) return 'f';
  if (/a$/.test(first) && !MALE_A.has(first)) return 'f';
  return 'm';
}

export function initials(name) {
  const w = String(name || '?').trim().split(/\s+/).filter(Boolean);
  if (!w.length) return '?';
  if (w.length === 1) return w[0].slice(0, 2).toUpperCase();
  return (w[0][0] + w[w.length - 1][0]).toUpperCase();
}

export function color(c) { return c instanceof THREE.Color ? c.clone() : new THREE.Color(c ?? '#888888'); }
export function mixColor(a, b, t) { return color(a).lerp(color(b), t); }

/** Adiciona um atributo de cor (linear) a uma geometria. */
export function colorize(geo, c) {
  const col = color(c);
  const n = geo.attributes.position.count;
  const arr = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { arr[i * 3] = col.r; arr[i * 3 + 1] = col.g; arr[i * 3 + 2] = col.b; }
  geo.setAttribute('color', new THREE.BufferAttribute(arr, 3));
  return geo;
}

/** Junta geometrias heterogéneas de forma robusta (indexadas/não indexadas, com/sem cor). */
export function mergeGeos(list, { keepInputs = false } = {}) {
  const geos = list.filter(Boolean);
  if (!geos.length) return new THREE.BufferGeometry();
  const anyNonIndexed = geos.some(g => !g.index);
  const anyColor = geos.some(g => g.attributes.color);
  const prepared = geos.map(g => {
    let x = anyNonIndexed && g.index ? g.toNonIndexed() : g;
    if (anyColor && !x.attributes.color) { if (x === g) x = g.clone(); colorize(x, '#ffffff'); }
    if (!x.attributes.uv) {
      if (x === g) x = g.clone();
      x.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(x.attributes.position.count * 2), 2));
    }
    if (!x.attributes.normal) { if (x === g) x = g.clone(); x.computeVertexNormals(); }
    for (const k of Object.keys(x.attributes)) {
      if (!['position', 'normal', 'uv', 'color'].includes(k)) { if (x === g) x = g.clone(); x.deleteAttribute(k); }
    }
    x.morphAttributes = {};
    return x;
  });
  const merged = mergeGeometries(prepared, false);
  if (!keepInputs) {
    for (const g of geos) g.dispose();
    for (const p of prepared) if (!geos.includes(p)) p.dispose();
  }
  return merged || new THREE.BufferGeometry();
}

/** Aplica uma matriz (posição/rotação/escala) a uma geometria e devolve-a. */
export function place(geo, { x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1 } = {}) {
  const m = new THREE.Matrix4();
  m.compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)), new THREE.Vector3(sx, sy, sz));
  geo.applyMatrix4(m);
  return geo;
}

export function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

/** Pequeno tweener de câmara (posição + alvo). */
export class CameraTween {
  constructor(camera) { this.camera = camera; this.active = false; this.target = new THREE.Vector3(); }
  start(toPos, toTarget, dur = 1.4, fromTarget = null) {
    this.fromPos = this.camera.position.clone();
    this.fromTarget = (fromTarget || this.target).clone();
    this.toPos = toPos.clone(); this.toTarget = toTarget.clone();
    this.t = 0; this.dur = Math.max(0.0001, dur); this.active = true;
  }
  jump(toPos, toTarget) {
    this.camera.position.copy(toPos); this.target.copy(toTarget); this.camera.lookAt(this.target); this.active = false;
  }
  update(dt) {
    if (!this.active) return false;
    this.t += dt;
    const k = easeInOut(this.t / this.dur);
    this.camera.position.lerpVectors(this.fromPos, this.toPos, k);
    this.target.lerpVectors(this.fromTarget, this.toTarget, k);
    this.camera.lookAt(this.target);
    if (this.t >= this.dur) this.active = false;
    return true;
  }
}
