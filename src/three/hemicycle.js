// Sala das Sessões da Assembleia da República (Palácio de São Bento) — estilizada.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Engine } from './engine.js';
import { Bag, rng, hashString, clamp, lerp, easeInOut, easeOutBack, mergeGeos, place, inferGender, CameraTween, wait, damp } from './util3d.js';
import * as TX from './materials.js';
import { makePerson, animatePerson, sharedGeometries, sharedFaceTexture, randomLook, Crowd } from './people.js';

const R0 = 6.9, ROW_D = 1.18, ROWS = 8, RISER = 0.34, Y0 = 0.42;
const AISLE_W = 1.0, AISLES = 5;
const BACK_Z = -8.8;
const WALL_R = 15.85, GAL_R = 19.4, GAL1_Y = 5.0, GAL2_Y = 8.6, CEIL_Y = 12.6;
const CRIMSON = new THREE.Color('#8e1b24');
const EMPTY = new THREE.Color('#5d5452');
const GOV_BLUE = new THREE.Color('#4b5d78');

// ------------------------------------------------------------------ disposição dos lugares
function layoutSeats(N) {
  if (N <= 0) return [];
  const rows = [];
  let total = 0;
  for (let k = 0; k < ROWS; k++) {
    const r = R0 + k * ROW_D;
    const avail = r * Math.PI - AISLES * AISLE_W - 0.7;
    rows.push({ k, r, avail }); total += avail;
  }
  const counts = rows.map(row => { const ex = N * row.avail / total; return { c: Math.floor(ex), f: ex - Math.floor(ex) }; });
  let rem = N - counts.reduce((a, b) => a + b.c, 0);
  const order = counts.map((_, i) => i).sort((a, b) => counts[b].f - counts[a].f);
  for (let i = 0; rem > 0; i = (i + 1) % order.length, rem--) counts[order[i]].c++;
  const seats = [];
  const sec = AISLES + 1;
  for (const row of rows) {
    const n = counts[row.k].c; if (!n) continue;
    const halfA = (AISLE_W / 2) / row.r, endM = 0.35 / row.r;
    const ranges = [];
    for (let s = 0; s < sec; s++) ranges.push([s * Math.PI / sec + (s === 0 ? endM : halfA), (s + 1) * Math.PI / sec - (s === sec - 1 ? endM : halfA)]);
    const lens = ranges.map(([a, b]) => b - a), lsum = lens.reduce((a, b) => a + b, 0);
    const ss = lens.map(l => Math.floor(n * l / lsum));
    let left = n - ss.reduce((a, b) => a + b, 0);
    const ord = lens.map((_, i) => i).sort((a, b) => (n * lens[b] / lsum - ss[b]) - (n * lens[a] / lsum - ss[a]));
    for (let i = 0; left > 0; i = (i + 1) % ord.length, left--) ss[ord[i]]++;
    ranges.forEach(([a0, a1], s) => {
      const m = ss[s];
      for (let j = 0; j < m; j++) {
        const phi = a0 + (a1 - a0) * (j + 0.5) / m;
        seats.push({ phi, r: row.r, row: row.k, y: Y0 + row.k * RISER, spacing: (a1 - a0) * row.r / m });
      }
    });
  }
  seats.sort((a, b) => (a.phi - b.phi) || (a.r - b.r));
  for (const s of seats) {
    s.x = s.r * Math.cos(s.phi); s.z = s.r * Math.sin(s.phi);
    s.rot = Math.atan2(-s.x, -s.z);
  }
  return seats;
}

function sectorRanges(r) {
  const sec = AISLES + 1, halfA = (AISLE_W / 2) / r, endM = 0.2 / r, out = [];
  for (let s = 0; s < sec; s++) out.push([s * Math.PI / sec + (s === 0 ? endM : halfA), (s + 1) * Math.PI / sec - (s === sec - 1 ? endM : halfA)]);
  return out;
}

// anel horizontal (vista de cima) entre phi0..phi1
function ringSeg(r0, r1, phi0, phi1, y, seg = 24) {
  const g = new THREE.RingGeometry(r0, r1, Math.max(3, seg), 1, -phi1, phi1 - phi0);
  g.rotateX(-Math.PI / 2); g.translate(0, y, 0);
  return g;
}
// painel vertical curvo (cilindro aberto)
function arcPanel(r, phi0, phi1, y0, y1, seg = 24) {
  const g = new THREE.CylinderGeometry(r, r, y1 - y0, Math.max(3, seg), 1, true, Math.PI / 2 - phi1, phi1 - phi0);
  g.translate(0, (y0 + y1) / 2, 0);
  return g;
}

// ------------------------------------------------------------------ texturas específicas
function paintingTexture() {
  const W = 1024, H = 560, c = TX.makeCanvas(W, H), g = c.getContext('2d');
  const r = rng(1821);
  const bg = g.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#3a2b1d'); bg.addColorStop(0.45, '#7a5a35'); bg.addColorStop(1, '#4a3420');
  g.fillStyle = bg; g.fillRect(0, 0, W, H);
  // arquitetura ao fundo
  for (let i = 0; i < 9; i++) {
    const x = 60 + i * 115;
    g.fillStyle = `rgba(${200 + r() * 30},${170 + r() * 20},${120 + r() * 20},0.35)`;
    g.fillRect(x, 40, 34, 260);
    g.fillStyle = 'rgba(60,40,25,0.35)';
    g.beginPath(); g.arc(x + 75, 120, 40, Math.PI, 0); g.lineTo(x + 115, 300); g.lineTo(x + 35, 300); g.closePath(); g.fill();
  }
  // luz vinda da esquerda
  const ray = g.createLinearGradient(0, 0, W * 0.7, H);
  ray.addColorStop(0, 'rgba(255,230,170,0.35)'); ray.addColorStop(0.5, 'rgba(255,220,160,0.08)'); ray.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = ray; g.fillRect(0, 0, W, H);
  // estrado central com mesa vermelha
  g.fillStyle = '#5a1a14'; g.fillRect(W * 0.38, H * 0.42, W * 0.24, H * 0.1);
  g.fillStyle = '#8f2a1e'; g.fillRect(W * 0.36, H * 0.38, W * 0.28, H * 0.06);
  // figuras em semicírculo
  for (let row = 0; row < 7; row++) {
    const y = H * (0.5 + row * 0.07);
    const n = 18 + row * 6;
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      const x = W * (0.04 + t * 0.92);
      const yy = y - Math.sin(t * Math.PI) * H * 0.08 + (r() - 0.5) * 6;
      const s = 7 + row * 1.6;
      const coat = r() < 0.12 ? '#7a1f18' : r() < 0.1 ? '#2a3a5a' : `rgb(${20 + r() * 25},${16 + r() * 18},${14 + r() * 14})`;
      g.fillStyle = coat; g.beginPath(); g.ellipse(x, yy + s * 1.2, s * 0.8, s * 1.5, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = `rgb(${200 + r() * 40},${160 + r() * 30},${120 + r() * 25})`; g.beginPath(); g.arc(x, yy - s * 0.4, s * 0.5, 0, Math.PI * 2); g.fill();
      if (r() < 0.25) { g.fillStyle = '#f2ede0'; g.fillRect(x - s * 0.3, yy + s * 0.2, s * 0.6, s * 0.3); }
    }
  }
  // figura central de pé
  g.fillStyle = '#1b1410'; g.beginPath(); g.ellipse(W * 0.5, H * 0.33, 14, 34, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#e1b98f'; g.beginPath(); g.arc(W * 0.5, H * 0.26, 10, 0, Math.PI * 2); g.fill();
  // verniz e pinceladas
  for (let i = 0; i < 2500; i++) {
    g.fillStyle = `rgba(${150 + r() * 100},${110 + r() * 80},${60 + r() * 50},${0.04 + r() * 0.05})`;
    g.fillRect(r() * W, r() * H, 2 + r() * 10, 1 + r() * 3);
  }
  const vig = g.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, W * 0.65);
  vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(1, 'rgba(20,10,0,0.55)');
  g.fillStyle = vig; g.fillRect(0, 0, W, H);
  g.fillStyle = 'rgba(255,200,90,0.08)'; g.fillRect(0, 0, W, H);
  return TX.toTexture(c);
}

function wallPanelTexture() {
  const W = 1024, H = 512, c = TX.makeCanvas(W, H), g = c.getContext('2d');
  g.fillStyle = '#efe6d2'; g.fillRect(0, 0, W, H);
  const r = rng(77);
  for (let i = 0; i < 4000; i++) { g.fillStyle = `rgba(0,0,0,${0.02 * r()})`; g.fillRect(r() * W, r() * H, 2, 2); }
  // arcos/janelas cegas
  for (let i = 0; i < 4; i++) {
    const x = 64 + i * 256, w = 128, top = 120, bottom = 470;
    g.fillStyle = '#e4d8bf';
    g.beginPath(); g.moveTo(x, bottom); g.lineTo(x, top + w / 2); g.arc(x + w / 2, top + w / 2, w / 2, Math.PI, 0); g.lineTo(x + w, bottom); g.closePath(); g.fill();
    g.strokeStyle = '#c9a24a'; g.lineWidth = 6; g.stroke();
    const glass = g.createLinearGradient(0, top, 0, bottom);
    glass.addColorStop(0, '#fbf3df'); glass.addColorStop(1, '#d9c9a6');
    g.fillStyle = glass;
    g.beginPath(); g.moveTo(x + 14, bottom - 14); g.lineTo(x + 14, top + w / 2); g.arc(x + w / 2, top + w / 2, w / 2 - 14, Math.PI, 0); g.lineTo(x + w - 14, bottom - 14); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(160,130,80,0.6)'; g.lineWidth = 3;
    g.beginPath(); g.moveTo(x + w / 2, top + 14); g.lineTo(x + w / 2, bottom - 14); g.moveTo(x + 14, 330); g.lineTo(x + w - 14, 330); g.stroke();
  }
  g.fillStyle = '#c9a24a'; g.fillRect(0, 0, W, 10); g.fillRect(0, H - 14, W, 14);
  return TX.toTexture(c, { repeat: true });
}

function ceilingTexture() {
  const S = 512, c = TX.makeCanvas(S, S), g = c.getContext('2d');
  g.fillStyle = '#efe6d3'; g.fillRect(0, 0, S, S);
  const n = 4, s = S / n;
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    const x = i * s, y = j * s;
    g.fillStyle = '#e3d6bb'; g.fillRect(x + 10, y + 10, s - 20, s - 20);
    g.strokeStyle = '#c9a24a'; g.lineWidth = 4; g.strokeRect(x + 10, y + 10, s - 20, s - 20);
    g.fillStyle = '#d6c49f'; g.fillRect(x + 26, y + 26, s - 52, s - 52);
    g.fillStyle = '#c9a24a'; g.beginPath(); g.arc(x + s / 2, y + s / 2, 9, 0, Math.PI * 2); g.fill();
  }
  return TX.toTexture(c, { repeat: true });
}

function skylightTexture() {
  const S = 512, c = TX.makeCanvas(S, S), g = c.getContext('2d');
  const grd = g.createRadialGradient(S / 2, S / 2, 20, S / 2, S / 2, S / 2);
  grd.addColorStop(0, '#ffffff'); grd.addColorStop(1, '#f3e7c8');
  g.fillStyle = grd; g.fillRect(0, 0, S, S);
  g.strokeStyle = '#9d8a63'; g.lineWidth = 6;
  for (let k = 1; k < 5; k++) { g.beginPath(); g.arc(S / 2, S / 2, (S / 2) * k / 5, 0, Math.PI * 2); g.stroke(); }
  for (let k = 0; k < 16; k++) { const a = k * Math.PI / 8; g.beginPath(); g.moveTo(S / 2, S / 2); g.lineTo(S / 2 + Math.cos(a) * S / 2, S / 2 + Math.sin(a) * S / 2); g.stroke(); }
  return TX.toTexture(c);
}

function emblemTexture() {
  const S = 256, c = TX.makeCanvas(S, S), g = c.getContext('2d');
  g.clearRect(0, 0, S, S);
  g.fillStyle = '#c9a24a'; g.beginPath(); g.arc(S / 2, S / 2, 110, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#8a6a26'; g.lineWidth = 6;
  for (const [rx, ry, rot] of [[80, 80, 0], [80, 30, 0], [30, 80, 0], [80, 30, 0.6]]) { g.beginPath(); g.ellipse(S / 2, S / 2, rx, ry, rot, 0, Math.PI * 2); g.stroke(); }
  g.fillStyle = '#b3261e'; g.beginPath(); g.moveTo(S / 2 - 34, S / 2 - 40); g.lineTo(S / 2 + 34, S / 2 - 40); g.lineTo(S / 2 + 34, S / 2 + 10); g.quadraticCurveTo(S / 2, S / 2 + 56, S / 2 - 34, S / 2 + 10); g.closePath(); g.fill();
  g.fillStyle = '#ffffff'; g.fillRect(S / 2 - 20, S / 2 - 28, 40, 44);
  return TX.toTexture(c);
}

// ------------------------------------------------------------------ pessoas sentadas instanciadas
class SeatedPeople {
  constructor(seats, bag, o = {}) {
    const G = sharedGeometries();
    const n = seats.length;
    this.n = n; this.seats = seats;
    this.group = new THREE.Group();
    const cap = Math.max(1, n);
    const body = bag.mat(new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.7 }));
    const shirt = bag.mat(new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.85, side: THREE.DoubleSide }));
    const skin = bag.mat(new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.6 }));
    const face = bag.mat(new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.55, map: sharedFaceTexture() }));
    const hair = bag.mat(new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.9, side: THREE.DoubleSide }));
    const tieMat = bag.mat(new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.5, side: THREE.DoubleSide }));
    const mk = (geo, m, count) => {
      const im = new THREE.InstancedMesh(geo, m, count);
      im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      im.frustumCulled = false; im.castShadow = true; im.receiveShadow = false;
      im.count = count; this.group.add(im); return im;
    };
    this.torso = mk(G.torsoM, body, cap);
    this.head = mk(G.head, face, cap);
    this.hairS = mk(G.hairShort, hair, cap);
    this.hairL = mk(G.hairLong, hair, cap);
    this.shirt = mk(G.shirtV, shirt, cap);
    this.tie = mk(G.tie, tieMat, cap);
    this.scarf = mk(G.shirtV, tieMat, cap);
    this.arms = mk(G.arm, body, cap * 2);
    this.hands = mk(G.hand, skin, cap * 2);
    this.thighs = mk(G.thigh, body, cap * 2);
    this.shins = mk(G.shin, body, cap * 2);
    for (const im of this.group.children) { im.castShadow = true; }
    this.torso.userData.raycast = true;
    this.state = seats.map((s, i) => ({ stand: 0, standT: 0, pop: 1, popT: 1, delay: 0, look: null, phase: (i * 1.37) % 10, tie: new THREE.Color('#888'), tieT: new THREE.Color('#888'), dim: 1, dimT: 1 }));
    this.d = {
      root: new THREE.Object3D(), hips: new THREE.Object3D(), torso: new THREE.Object3D(), head: new THREE.Object3D(), skull: new THREE.Object3D(),
      armL: new THREE.Object3D(), armR: new THREE.Object3D(), thL: new THREE.Object3D(), thR: new THREE.Object3D(), knL: new THREE.Object3D(), knR: new THREE.Object3D(),
      shirt: new THREE.Object3D(), tie: new THREE.Object3D(), scarf: new THREE.Object3D(),
    };
    const d = this.d;
    d.root.add(d.hips); d.hips.add(d.torso); d.torso.add(d.head); d.head.add(d.skull); d.skull.position.y = 0.115;
    d.torso.add(d.armL); d.torso.add(d.armR); d.hips.add(d.thL); d.hips.add(d.thR); d.thL.add(d.knL); d.thR.add(d.knR);
    d.knL.position.y = -0.44; d.knR.position.y = -0.44; d.thL.position.x = 0.092; d.thR.position.x = -0.092;
    d.torso.add(d.shirt); d.shirt.position.set(0, 0.585, 0.117); d.shirt.rotation.x = -0.12;
    d.torso.add(d.tie); d.tie.position.set(0, 0.6, 0.123); d.tie.rotation.x = -0.1;
    d.torso.add(d.scarf); d.scarf.position.set(0, 0.605, 0.111); d.scarf.rotation.x = -0.12; d.scarf.scale.set(1.05, 0.7, 1);
    this.zero = new THREE.Matrix4().makeScale(0, 0, 0);
    this.tmpC = new THREE.Color();
    this.dirty = true; this.acc = 0;
  }

  setLook(i, look, tieColor) {
    const st = this.state[i]; if (!st) return;
    st.look = look;
    const c = this.tmpC;
    c.set(look.jacket || look.shirt); this.torso.setColorAt(i, c); this.arms.setColorAt(i * 2, c); this.arms.setColorAt(i * 2 + 1, c);
    c.set(look.pants || '#1c1f26'); this.thighs.setColorAt(i * 2, c); this.thighs.setColorAt(i * 2 + 1, c); this.shins.setColorAt(i * 2, c); this.shins.setColorAt(i * 2 + 1, c);
    c.set(look.skin); this.head.setColorAt(i, c); this.hands.setColorAt(i * 2, c); this.hands.setColorAt(i * 2 + 1, c);
    c.set(look.hair); this.hairS.setColorAt(i, c); this.hairL.setColorAt(i, c);
    c.set(look.shirt); this.shirt.setColorAt(i, c);
    st.tieT.set(tieColor); if (!st.tieInit) { st.tie.copy(st.tieT); st.tieInit = true; }
    this.applyTie(i);
    this.colorsDirty = true; this.dirty = true;
  }

  applyTie(i) {
    const st = this.state[i];
    this.tmpC.copy(st.tie).multiplyScalar(st.dim);
    this.tie.setColorAt(i, this.tmpC); this.scarf.setColorAt(i, this.tmpC);
  }

  update(dt, t, force = false) {
    // transições de cor da gravata / escurecimento
    let colorAnim = false;
    for (let i = 0; i < this.n; i++) {
      const st = this.state[i];
      const dd = Math.abs(st.dim - st.dimT);
      if (dd > 0.002 || Math.abs(st.tie.r - st.tieT.r) + Math.abs(st.tie.g - st.tieT.g) + Math.abs(st.tie.b - st.tieT.b) > 0.003) {
        st.tie.lerp(st.tieT, 1 - Math.exp(-dt * 7)); st.dim = damp(st.dim, st.dimT, 7, dt);
        this.applyTie(i); colorAnim = true;
      }
    }
    if (colorAnim || this.colorsDirty) {
      for (const im of this.group.children) if (im.instanceColor) im.instanceColor.needsUpdate = true;
      this.colorsDirty = false;
    }
    let animating = false;
    for (let i = 0; i < this.n; i++) {
      const st = this.state[i];
      if (Math.abs(st.stand - st.standT) > 0.001) { st.stand = damp(st.stand, st.standT, 9, dt); if (Math.abs(st.stand - st.standT) < 0.002) st.stand = st.standT; animating = true; }
      if (st.pop !== st.popT) {
        if (st.delay > 0) { st.delay -= dt; animating = true; }
        else { const dir = Math.sign(st.popT - st.pop); st.popRaw = clamp((st.popRaw ?? st.pop) + dir * dt * 2.6, 0, 1); st.pop = dir > 0 ? (st.popRaw >= 1 ? 1 : st.popRaw) : st.popRaw; animating = true; }
      }
    }
    this.acc += dt;
    if (!animating && !force && !this.dirty && this.acc < 1 / 15) return;
    this.acc = 0; this.dirty = false;
    const d = this.d;
    for (let i = 0; i < this.n; i++) {
      const s = this.seats[i], st = this.state[i], look = st.look;
      if (!look) { this.writeZero(i); continue; }
      const popV = st.popT > 0 && st.pop >= 1 ? 1 : (st.popT > 0 ? easeOutBack(st.popRaw ?? st.pop) : (st.popRaw ?? st.pop));
      if (popV <= 0.001) { this.writeZero(i); continue; }
      const k = easeInOut(st.stand);
      const tt = t + st.phase;
      d.root.position.set(s.x, s.y, s.z);
      d.root.rotation.set(0, s.rot, 0);
      d.root.scale.setScalar(look.scale * popV);
      d.hips.position.set(0, lerp(0.47, 0.88, k), lerp(-0.04, 0.16, k));
      d.torso.rotation.set(lerp(0.06, 0, k), 0, 0);
      d.torso.scale.set(look.gender === 'f' ? 0.93 : 1, 1, 1);
      d.head.position.set(0, 0.665, 0);
      d.head.rotation.set(Math.sin(tt * 0.7) * 0.04 + lerp(0.04, -0.03, k), Math.sin(tt * 0.31) * 0.32, 0);
      const sh = look.gender === 'f' ? 0.2 : 0.215;
      d.armL.position.set(sh, 0.555, 0); d.armR.position.set(-sh, 0.555, 0);
      d.armL.rotation.set(lerp(-0.95, 0, k), 0, lerp(-0.05, 0.1, k));
      d.armR.rotation.set(lerp(-0.95, 0, k) + (k > 0.5 ? 0 : Math.sin(tt * 0.9) * 0.05), 0, lerp(0.05, -0.1, k));
      d.thL.rotation.set(lerp(-1.5, 0, k), 0, 0); d.thR.rotation.set(lerp(-1.5, 0, k), 0, 0);
      d.knL.rotation.set(lerp(1.5, 0, k), 0, 0); d.knR.rotation.set(lerp(1.5, 0, k), 0, 0);
      d.root.updateMatrixWorld(true);
      this.torso.setMatrixAt(i, d.torso.matrixWorld);
      this.head.setMatrixAt(i, d.skull.matrixWorld);
      const longH = look.hairStyle === 'long' || look.hairStyle === 'bun';
      this.hairS.setMatrixAt(i, longH ? this.zero : d.skull.matrixWorld);
      this.hairL.setMatrixAt(i, longH ? d.skull.matrixWorld : this.zero);
      this.shirt.setMatrixAt(i, d.shirt.matrixWorld);
      if (look.gender === 'f') { this.tie.setMatrixAt(i, this.zero); this.scarf.setMatrixAt(i, d.scarf.matrixWorld); }
      else { this.tie.setMatrixAt(i, d.tie.matrixWorld); this.scarf.setMatrixAt(i, this.zero); }
      this.arms.setMatrixAt(i * 2, d.armL.matrixWorld); this.arms.setMatrixAt(i * 2 + 1, d.armR.matrixWorld);
      this.hands.setMatrixAt(i * 2, d.armL.matrixWorld); this.hands.setMatrixAt(i * 2 + 1, d.armR.matrixWorld);
      this.thighs.setMatrixAt(i * 2, d.thL.matrixWorld); this.thighs.setMatrixAt(i * 2 + 1, d.thR.matrixWorld);
      this.shins.setMatrixAt(i * 2, d.knL.matrixWorld); this.shins.setMatrixAt(i * 2 + 1, d.knR.matrixWorld);
    }
    for (const im of this.group.children) im.instanceMatrix.needsUpdate = true;
  }

  writeZero(i) {
    for (const im of [this.torso, this.head, this.hairS, this.hairL, this.shirt, this.tie, this.scarf]) im.setMatrixAt(i, this.zero);
    for (const im of [this.arms, this.hands, this.thighs, this.shins]) { im.setMatrixAt(i * 2, this.zero); im.setMatrixAt(i * 2 + 1, this.zero); }
  }

  dispose() { for (const im of this.group.children) im.dispose(); this.group.removeFromParent(); }
}

function lookFor(seat, i, female) {
  const seed = hashString((seat.personName || '') + '|' + i);
  const gender = seat.personName ? inferGender(seat.personName) : (female ?? (rng(seed)() < 0.4 ? 'f' : 'm'));
  return randomLook(seed, { gender, formal: true, oldRatio: 0.28 });
}

// ------------------------------------------------------------------ cena principal
export function createHemicycle(opts = {}) {
  const bag = new Bag();
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#1c160f');
  scene.fog = new THREE.Fog('#1c160f', 45, 110);
  scene.environmentIntensity = 0.55;
  const camera = new THREE.PerspectiveCamera(45, 16 / 9, 0.1, 220);
  const tween = new CameraTween(camera);
  const quality = Engine.quality;
  const shadowsOn = quality !== 'low';

  // ---------- materiais
  const M = {
    marble: bag.mat(new THREE.MeshStandardMaterial({ map: TX.marble('#ebe4d6', '#a99b86'), roughness: 0.28, metalness: 0.0 })),
    marbleDark: bag.mat(new THREE.MeshStandardMaterial({ map: TX.marble('#d9cfbd', '#8f826e'), roughness: 0.3 })),
    plaster: bag.mat(new THREE.MeshStandardMaterial({ map: TX.plaster('#efe6d3'), roughness: 0.9 })),
    wallPanel: bag.mat(new THREE.MeshStandardMaterial({ map: wallPanelTexture(), roughness: 0.85, side: THREE.DoubleSide })),
    gold: bag.mat(new THREE.MeshStandardMaterial({ color: '#c9a24a', roughness: 0.32, metalness: 0.85 })),
    mahogany: bag.mat(new THREE.MeshStandardMaterial({ map: TX.wood('mahogany'), roughness: 0.42, side: THREE.DoubleSide })),
    oak: bag.mat(new THREE.MeshStandardMaterial({ map: TX.wood('oak'), roughness: 0.38 })),
    carpetTier: bag.mat(new THREE.MeshStandardMaterial({ map: TX.carpet('#4a1a1b', '#c9a24a', false), roughness: 0.95 })),
    carpetAisle: bag.mat(new THREE.MeshStandardMaterial({ map: TX.carpet('#6e2a25', '#c9a24a', false), roughness: 0.95 })),
    carpetRound: bag.mat(new THREE.MeshStandardMaterial({ map: TX.carpet('#6d1620', '#c9a24a', true), roughness: 0.95 })),
    carpetFlat: bag.mat(new THREE.MeshStandardMaterial({ map: TX.carpet('#5e1520', '#c9a24a', false), roughness: 0.95 })),
    chair: bag.mat(new THREE.MeshStandardMaterial({ map: TX.fabric('#ffffff'), roughness: 0.82 })),
    plate: bag.mat(new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.4, emissive: '#ffffff', emissiveIntensity: 0.0 })),
    metalDark: bag.mat(new THREE.MeshStandardMaterial({ color: '#1d1d1f', roughness: 0.35, metalness: 0.6 })),
    velvet: bag.mat(new THREE.MeshStandardMaterial({ map: TX.fabric('#8e1b24'), roughness: 0.85 })),
    ceiling: bag.mat(new THREE.MeshStandardMaterial({ map: ceilingTexture(), roughness: 0.9 })),
    wallOuter: null,
    skylight: bag.mat(new THREE.MeshStandardMaterial({ map: skylightTexture(), emissive: '#fff4dc', emissiveMap: null, emissiveIntensity: 1.25, roughness: 1 })),
  };
  M.skylight.emissiveMap = M.skylight.map;
  M.wallOuter = bag.mat(M.wallPanel.clone()); M.wallOuter.side = THREE.BackSide;
  M.plasterIn = bag.mat(M.plaster.clone()); M.plasterIn.side = THREE.BackSide;
  const ceilingGroup = new THREE.Group(); scene.add(ceilingGroup);
  bag.tex(M.wallPanel.map); bag.tex(M.ceiling.map); bag.tex(M.skylight.map);
  M.wallPanel.map.repeat.set(6, 1);
  M.ceiling.map.repeat.set(8, 8);

  const addMesh = (geo, material, { cast = false, receive = true, parent = scene } = {}) => {
    bag.geo(geo);
    const m = new THREE.Mesh(geo, material);
    m.castShadow = cast && shadowsOn; m.receiveShadow = receive && shadowsOn;
    parent.add(m); return m;
  };

  // ---------- chão
  {
    const floor = new THREE.PlaneGeometry(60, 50); floor.rotateX(-Math.PI / 2); floor.translate(0, 0, 4);
    const uv = floor.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 12, uv.getY(i) * 10);
    addMesh(floor, M.marble);
    const carpet = new THREE.CircleGeometry(5.3, 72, Math.PI, Math.PI); carpet.rotateX(-Math.PI / 2); carpet.translate(0, 0.012, 0);
    addMesh(carpet, M.carpetRound);
    const front = new THREE.PlaneGeometry(12.4, 5.0); front.rotateX(-Math.PI / 2); front.translate(0, 0.01, -2.6);
    const fu = front.attributes.uv; for (let i = 0; i < fu.count; i++) fu.setXY(i, fu.getX(i) * 4, fu.getY(i) * 1.6);
    addMesh(front, M.carpetFlat);
  }

  // ---------- bancadas (degraus, secretárias)
  {
    const tiers = [], risers = [], aisles = [], deskTops = [], deskFronts = [];
    for (let k = 0; k < ROWS; k++) {
      const r = R0 + k * ROW_D, y = Y0 + k * RISER, yPrev = k === 0 ? 0 : Y0 + (k - 1) * RISER;
      const inner = r - 0.68, outer = r + 0.5;
      const tg = ringSeg(inner, outer, 0, Math.PI, y, 96);
      // UV repetidas para a alcatifa
      const u = tg.attributes.uv; for (let i = 0; i < u.count; i++) u.setXY(i, u.getX(i) * 18, u.getY(i) * 18);
      tiers.push(tg);
      risers.push(arcPanel(inner, 0, Math.PI, yPrev, y, 96));
      const sr = sectorRanges(r);
      for (let s = 0; s < sr.length - 1; s++) {
        const a0 = sr[s][1], a1 = sr[s + 1][0];
        aisles.push(ringSeg(inner + 0.01, outer - 0.01, a0, a1, y + 0.006, 4));
      }
      for (const [a0, a1] of sr) {
        deskTops.push(ringSeg(r - 0.64, r - 0.28, a0, a1, y + 0.76, 24));
        deskFronts.push(arcPanel(r - 0.64, a0, a1, y, y + 0.76, 24));
        // rebordo de topo
        deskFronts.push(arcPanel(r - 0.28, a0, a1, y + 0.7, y + 0.76, 24));
      }
    }
    addMesh(mergeGeos(tiers), M.carpetTier);
    addMesh(mergeGeos(risers), M.mahogany);
    addMesh(mergeGeos(aisles), M.carpetAisle);
    addMesh(mergeGeos(deskTops), M.oak, { cast: true });
    addMesh(mergeGeos(deskFronts), M.mahogany, { cast: true });
    // parede atrás da última fila (lambril de madeira + estuque)
    addMesh(arcPanel(WALL_R, 0, Math.PI, 0, 3.4, 96), M.mahogany);
    const wp = arcPanel(WALL_R, 0, Math.PI, 3.4, GAL1_Y, 96);
    addMesh(wp, M.plasterIn);
    addMesh(ringSeg(R0 + (ROWS - 1) * ROW_D + 0.5, WALL_R, 0, Math.PI, Y0 + (ROWS - 1) * RISER, 96), M.carpetTier);
  }

  // ---------- galerias, colunas, paredes, teto
  {
    const goldBits = [];
    // galeria 1
    addMesh(ringSeg(WALL_R, GAL_R, 0, Math.PI, GAL1_Y, 96), M.carpetFlat);
    goldBits.push(arcPanel(WALL_R, 0, Math.PI, GAL1_Y - 0.35, GAL1_Y, 96));
    const bal1 = arcPanel(WALL_R + 0.05, 0, Math.PI, GAL1_Y, GAL1_Y + 0.95, 96);
    addMesh(bal1, M.plaster);
    goldBits.push(arcPanel(WALL_R + 0.02, 0, Math.PI, GAL1_Y + 0.92, GAL1_Y + 1.02, 96));
    // galeria 2
    const G2R = 17.3;
    addMesh(ringSeg(G2R, GAL_R, 0, Math.PI, GAL2_Y, 96), M.carpetFlat);
    const g2under = ringSeg(G2R, GAL_R, 0, Math.PI, GAL2_Y - 0.3, 96); g2under.rotateX(Math.PI); g2under.translate(0, 2 * (GAL2_Y - 0.3), 0);
    addMesh(g2under, M.plaster);
    goldBits.push(arcPanel(G2R, 0, Math.PI, GAL2_Y - 0.3, GAL2_Y, 96));
    addMesh(arcPanel(G2R + 0.05, 0, Math.PI, GAL2_Y, GAL2_Y + 0.95, 96), M.plaster);
    goldBits.push(arcPanel(G2R + 0.02, 0, Math.PI, GAL2_Y + 0.92, GAL2_Y + 1.02, 96));
    // parede exterior com arcos
    const ow = arcPanel(GAL_R, 0, Math.PI, GAL1_Y, CEIL_Y, 96);
    addMesh(ow, M.wallOuter);
    // cornija do teto
    goldBits.push(arcPanel(GAL_R - 0.05, 0, Math.PI, CEIL_Y - 0.5, CEIL_Y - 0.2, 96));
    addMesh(mergeGeos(goldBits), M.gold);
    // colunas das galerias (instanciadas)
    const colGeo = mergeGeos([
      place(new THREE.CylinderGeometry(0.26, 0.3, 3.0, 16), { y: 1.7 }),
      place(new THREE.BoxGeometry(0.75, 0.2, 0.75), { y: 0.1 }),
      place(new THREE.CylinderGeometry(0.34, 0.3, 0.12, 16), { y: 0.26 }),
      place(new THREE.BoxGeometry(0.8, 0.22, 0.8), { y: 3.38 }),
      place(new THREE.CylinderGeometry(0.4, 0.27, 0.2, 16), { y: 3.2 }),
    ]);
    bag.geo(colGeo);
    const placesC = [];
    for (let k = 0; k <= 12; k++) { const a = k * Math.PI / 12; placesC.push({ r: WALL_R + 0.45, a, y: GAL1_Y + 1.0, h: (GAL2_Y - GAL1_Y - 1.0) / 3.5 }); placesC.push({ r: G2R + 0.4, a, y: GAL2_Y + 1.0, h: (CEIL_Y - 0.5 - GAL2_Y - 1.0) / 3.5 }); }
    const cols = new THREE.InstancedMesh(colGeo, M.marble, placesC.length);
    const mtx = new THREE.Matrix4();
    placesC.forEach((p, i) => { mtx.compose(new THREE.Vector3(p.r * Math.cos(p.a), p.y, p.r * Math.sin(p.a)), new THREE.Quaternion(), new THREE.Vector3(1, p.h, 1)); cols.setMatrixAt(i, mtx); });
    cols.castShadow = shadowsOn; cols.receiveShadow = shadowsOn;
    scene.add(cols);
    // balaústres
    const balGeo = mergeGeos([place(new THREE.CylinderGeometry(0.035, 0.05, 0.75, 8), { y: 0.45 }), place(new THREE.SphereGeometry(0.065, 8, 6), { y: 0.5 })]);
    bag.geo(balGeo);
    const balPlaces = [];
    for (const [rr, yy] of [[WALL_R + 0.05, GAL1_Y], [G2R + 0.05, GAL2_Y]]) {
      const n = Math.floor(rr * Math.PI / 0.3);
      for (let i = 0; i <= n; i++) balPlaces.push([rr, (i / n) * Math.PI, yy]);
    }
    const bals = new THREE.InstancedMesh(balGeo, M.plaster, balPlaces.length);
    balPlaces.forEach(([rr, a, yy], i) => { mtx.makeTranslation(rr * Math.cos(a), yy, rr * Math.sin(a)); bals.setMatrixAt(i, mtx); });
    scene.add(bals);
    // parede de fundo (atrás da Mesa)
    const back = new THREE.PlaneGeometry(GAL_R * 2, CEIL_Y); back.translate(0, CEIL_Y / 2, BACK_Z);
    const bu = back.attributes.uv; for (let i = 0; i < bu.count; i++) bu.setXY(i, bu.getX(i) * 6, bu.getY(i) * 2);
    addMesh(back, M.plaster);
    for (const s of [-1, 1]) {
      const side = new THREE.PlaneGeometry(-BACK_Z, CEIL_Y); side.rotateY(-s * Math.PI / 2); side.translate(s * GAL_R, CEIL_Y / 2, BACK_Z / 2);
      addMesh(side, M.wallPanel);
    }
    // teto
    const ceil = new THREE.CircleGeometry(GAL_R, 96, 0, Math.PI); ceil.rotateX(Math.PI / 2); ceil.translate(0, CEIL_Y, 0);
    const cu = ceil.attributes.uv; for (let i = 0; i < cu.count; i++) cu.setXY(i, cu.getX(i), cu.getY(i));
    addMesh(ceil, M.ceiling, { parent: ceilingGroup });
    const ceil2 = new THREE.PlaneGeometry(GAL_R * 2, -BACK_Z); ceil2.rotateX(Math.PI / 2); ceil2.translate(0, CEIL_Y, BACK_Z / 2);
    addMesh(ceil2, M.ceiling, { parent: ceilingGroup });
    const sky = new THREE.CircleGeometry(9.5, 72); sky.rotateX(Math.PI / 2); sky.translate(0, CEIL_Y - 0.05, 2.5);
    addMesh(sky, M.skylight, { receive: false, parent: ceilingGroup });
    const ring = new THREE.TorusGeometry(9.6, 0.18, 8, 96); ring.rotateX(Math.PI / 2); ring.translate(0, CEIL_Y - 0.1, 2.5);
    addMesh(ring, M.gold, { receive: false, parent: ceilingGroup });
  }

  // ---------- presidência: estrado, Mesa, tribuna, quadro, colunas, estátuas, bandeira
  const platformH = 1.65;
  {
    const plat = new THREE.BoxGeometry(14.2, platformH, -BACK_Z - 5.2);
    plat.translate(0, platformH / 2, (BACK_Z - 5.2) / 2);
    addMesh(plat, M.mahogany, { cast: true });
    const trim = new THREE.BoxGeometry(14.3, 0.08, 0.1); trim.translate(0, platformH, -5.2);
    addMesh(trim, M.gold);
    // degraus laterais
    for (const s of [-1, 1]) {
      for (let k = 0; k < 4; k++) {
        const st = new THREE.BoxGeometry(1.4, platformH * (k + 1) / 4, 0.45);
        st.translate(s * 7.8, platformH * (k + 1) / 8, -5.45 - 0.45 * k);
        addMesh(st, M.marbleDark, { cast: true });
      }
    }
    // Mesa da Presidência
    const desk = new THREE.BoxGeometry(10.5, 0.8, 1.05); desk.translate(0, platformH + 0.4, -6.0);
    addMesh(desk, M.mahogany, { cast: true });
    const top = new THREE.BoxGeometry(10.8, 0.06, 1.25); top.translate(0, platformH + 0.82, -6.05);
    addMesh(top, M.oak, { cast: true });
    for (const x of [-4.5, -2.25, 0, 2.25, 4.5]) {
      const pan = new THREE.BoxGeometry(1.6, 0.45, 0.02); pan.translate(x, platformH + 0.4, -5.465);
      addMesh(pan, M.oak);
    }
    const emb = new THREE.CircleGeometry(0.28, 32); emb.translate(0, platformH + 0.42, -5.44);
    const embMat = bag.mat(new THREE.MeshStandardMaterial({ map: bag.tex(emblemTexture()), transparent: true, roughness: 0.35, metalness: 0.6 }));
    addMesh(emb, embMat);
    // cadeira do Presidente (espaldar alto)
    const parChair = mergeGeos([
      place(new THREE.BoxGeometry(0.75, 0.12, 0.65), { y: 0.5 }),
      place(new THREE.BoxGeometry(0.8, 1.45, 0.14), { y: 1.15, z: -0.3 }),
      place(new THREE.BoxGeometry(0.1, 0.55, 0.6), { x: 0.38, y: 0.7 }),
      place(new THREE.BoxGeometry(0.1, 0.55, 0.6), { x: -0.38, y: 0.7 }),
    ]);
    const pc = addMesh(parChair, M.velvet, { cast: true }); pc.position.set(0, platformH, -6.85);
    const crest = new THREE.BoxGeometry(0.9, 0.12, 0.18); crest.translate(0, platformH + 1.92, -7.15);
    addMesh(crest, M.gold);
    for (const x of [-3.4, -1.7, 1.7, 3.4]) {
      const ch = mergeGeos([place(new THREE.BoxGeometry(0.55, 0.1, 0.5), { y: 0.48 }), place(new THREE.BoxGeometry(0.55, 0.7, 0.1), { y: 0.85, z: -0.22 })]);
      const c = addMesh(ch, M.velvet, { cast: true }); c.position.set(x, platformH, -6.75);
    }
    // tribuna dos oradores
    const tp = new THREE.BoxGeometry(2.6, 0.32, 1.7); tp.translate(0, 0.16, -3.9);
    addMesh(tp, M.marbleDark, { cast: true });
    const ros = mergeGeos([place(new THREE.BoxGeometry(1.15, 1.12, 0.62), { y: 0.88 }), place(new THREE.BoxGeometry(1.25, 0.06, 0.78), { y: 1.47, rx: -0.18, z: 0.02 })]);
    addMesh(ros, M.mahogany, { cast: true }).position.set(0, 0, -3.55);
    const re = new THREE.CircleGeometry(0.26, 32); re.translate(0, 0.9, -3.235);
    addMesh(re, embMat);
    const mic = mergeGeos([place(new THREE.CylinderGeometry(0.008, 0.008, 0.42, 6), { y: 0.2, rx: 0.5 }), place(new THREE.SphereGeometry(0.025, 8, 6), { y: 0.38, z: 0.12 })]);
    for (const x of [-0.12, 0.12]) addMesh(mic.clone(), M.metalDark).position.set(x, 1.48, -3.5);
    bag.geo(mic);
    // quadro com moldura dourada
    const pw = 10.2, ph = 5.6, py = 7.0;
    const painting = new THREE.PlaneGeometry(pw, ph); painting.translate(0, py, BACK_Z + 0.06);
    const pMat = bag.mat(new THREE.MeshStandardMaterial({ map: bag.tex(paintingTexture()), roughness: 0.75 }));
    addMesh(painting, pMat);
    const fr = 0.32;
    const frame = mergeGeos([
      place(new THREE.BoxGeometry(pw + fr * 2, fr, 0.22), { y: py + ph / 2 + fr / 2, z: BACK_Z + 0.1 }),
      place(new THREE.BoxGeometry(pw + fr * 2, fr, 0.22), { y: py - ph / 2 - fr / 2, z: BACK_Z + 0.1 }),
      place(new THREE.BoxGeometry(fr, ph, 0.22), { x: pw / 2 + fr / 2, y: py, z: BACK_Z + 0.1 }),
      place(new THREE.BoxGeometry(fr, ph, 0.22), { x: -pw / 2 - fr / 2, y: py, z: BACK_Z + 0.1 }),
    ]);
    addMesh(frame, M.gold, { cast: true });
    // colunas monumentais
    const bigCol = mergeGeos([
      place(new THREE.CylinderGeometry(0.42, 0.48, 9.2, 24), { y: 4.9 }),
      place(new THREE.BoxGeometry(1.15, 0.3, 1.15), { y: 0.15 }),
      place(new THREE.CylinderGeometry(0.55, 0.5, 0.2, 24), { y: 0.4 }),
      place(new THREE.CylinderGeometry(0.62, 0.42, 0.35, 24), { y: 9.65 }),
      place(new THREE.BoxGeometry(1.25, 0.32, 1.25), { y: 9.98 }),
    ]);
    bag.geo(bigCol);
    for (const x of [-12.6, -6.6, 6.6, 12.6]) {
      const m = new THREE.Mesh(bigCol, M.marble); m.position.set(x, 0, BACK_Z + 0.9);
      m.castShadow = shadowsOn; m.receiveShadow = shadowsOn; scene.add(m);
    }
    const ent = new THREE.BoxGeometry(GAL_R * 2, 0.6, 1.2); ent.translate(0, 10.45, BACK_Z + 0.6);
    addMesh(ent, M.plaster, { cast: true });
    const entG = new THREE.BoxGeometry(GAL_R * 2, 0.1, 1.25); entG.translate(0, 10.15, BACK_Z + 0.62);
    addMesh(entG, M.gold);
    // estátuas
    const statue = mergeGeos([
      place(new THREE.BoxGeometry(1.3, 1.7, 1.3), { y: 0.85 }),
      place(new THREE.BoxGeometry(1.45, 0.15, 1.45), { y: 1.75 }),
      place(new THREE.CylinderGeometry(0.28, 0.55, 1.9, 14), { y: 2.78 }),
      place(new THREE.SphereGeometry(0.34, 14, 10), { y: 3.72, sy: 0.9 }),
      place(new THREE.SphereGeometry(0.21, 14, 10), { y: 4.05 }),
      place(new THREE.CylinderGeometry(0.07, 0.08, 0.95, 8), { x: 0.42, y: 3.95, rz: -0.35 }),
      place(new THREE.SphereGeometry(0.1, 8, 6), { x: 0.6, y: 4.45 }),
    ]);
    bag.geo(statue);
    for (const s of [-1, 1]) {
      const st = new THREE.Mesh(statue, M.marble); st.position.set(s * 9.6, 0, BACK_Z + 1.0); st.scale.x = s;
      st.castShadow = shadowsOn; st.receiveShadow = shadowsOn; scene.add(st);
    }
  }

  // bandeira nacional
  const flag = new THREE.Group();
  let flagGeo;
  {
    const pole = new THREE.CylinderGeometry(0.035, 0.04, 4.6, 10); pole.translate(0, 2.3, 0);
    addMesh(pole, M.gold, { cast: true, parent: flag });
    const fin = new THREE.SphereGeometry(0.09, 12, 10); fin.translate(0, 4.65, 0);
    addMesh(fin, M.gold, { parent: flag });
    flagGeo = new THREE.PlaneGeometry(1.8, 1.2, 24, 12); flagGeo.translate(0.9, 0, 0);
    flagGeo.userData.base = flagGeo.attributes.position.array.slice();
    const cloth = addMesh(flagGeo, bag.mat(new THREE.MeshStandardMaterial({ map: TX.flagPortugal(), roughness: 0.8, side: THREE.DoubleSide })), { cast: true, parent: flag });
    cloth.position.set(0.02, 3.8, 0);
    flag.position.set(5.8, platformH, -7.6);
    flag.rotation.y = -0.5;
    scene.add(flag);
  }

  // ---------- figuras da Mesa
  const mesaPeople = [];
  {
    const par = makePerson({ ...randomLook(1974, { gender: 'm', formal: true, oldRatio: 1 }), tie: '#8e1b24', detail: 'high' });
    par.position.set(0, platformH, -6.8); scene.add(par); mesaPeople.push(par);
    let idx = 0;
    for (const x of [-3.4, -1.7, 1.7, 3.4]) {
      const p = makePerson({ ...randomLook(500 + idx++, { formal: true }), tie: '#2b2f3a' });
      p.position.set(x, platformH, -6.7); scene.add(p); mesaPeople.push(p);
    }
    // mesa dos taquígrafos
    const st = mergeGeos([place(new THREE.BoxGeometry(2.6, 0.75, 0.9), { y: 0.375 }), place(new THREE.BoxGeometry(2.7, 0.05, 1.0), { y: 0.77 })]);
    addMesh(st, M.mahogany, { cast: true }).position.set(0, 0, 1.4);
    mesaPeople.forEach((p) => animatePerson(p, 'sit', 0, 1));
    mesaPeople.forEach((p) => p.traverse((o) => { if (o.isMesh) o.castShadow = shadowsOn; }));
  }

  // orador na tribuna
  const speaker = makePerson({ ...randomLook(2024, { formal: true, gender: 'f' }), tie: '#2563eb', detail: 'high' });
  speaker.position.set(0, 0.32, -4.25);
  const speakerTieMat = bag.mat(new THREE.MeshStandardMaterial({ color: '#2563eb', roughness: 0.55, side: THREE.DoubleSide }));
  speaker.userData.parts.torso.children.forEach((c) => { if (c.isMesh && (c.geometry === sharedGeometries().tie || (c.geometry === sharedGeometries().shirtV && c.scale.y < 1))) c.material = speakerTieMat; });
  speaker.visible = false;
  scene.add(speaker);
  let speakerOn = false;

  // ---------- luzes
  const hemi = new THREE.HemisphereLight('#fff4e2', '#4a3424', 0.75); scene.add(hemi);
  const sun = new THREE.DirectionalLight('#fff1da', 2.4);
  sun.position.set(6, 34, 10); sun.target.position.set(0, 0, 3);
  sun.castShadow = shadowsOn;
  sun.shadow.mapSize.set(quality === 'high' ? 2048 : 1024, quality === 'high' ? 2048 : 1024);
  Object.assign(sun.shadow.camera, { left: -22, right: 22, top: 22, bottom: -22, near: 5, far: 70 });
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03;
  scene.add(sun, sun.target);
  const fill = new THREE.DirectionalLight('#ffe9cc', 0.55); fill.position.set(0, 9, -6); fill.target.position.set(0, 2, 8); scene.add(fill, fill.target);
  const front = new THREE.DirectionalLight('#fff', 0.45); front.position.set(0, 8, 22); front.target.position.set(0, 2, -6); scene.add(front, front.target);
  const spot = new THREE.SpotLight('#ffdcaa', 220, 30, 0.55, 0.6, 1.4); spot.position.set(0, 11.5, 2); spot.target.position.set(0, 6.5, BACK_Z); scene.add(spot, spot.target);
  const spot2 = new THREE.SpotLight('#fff0d0', 90, 20, 0.5, 0.7, 1.4); spot2.position.set(0, 9, 3); spot2.target.position.set(0, 1.2, -4); scene.add(spot2, spot2.target);

  // ---------- público nas galerias
  {
    const benches = [];
    for (const [rr, yy] of [[17.2, GAL1_Y], [18.4, GAL1_Y + 0.35], [18.3, GAL2_Y]]) {
      benches.push(ringSeg(rr - 0.25, rr + 0.25, 0.04, Math.PI - 0.04, yy + 0.45, 72));
      benches.push(arcPanel(rr - 0.25, 0.04, Math.PI - 0.04, yy, yy + 0.45, 72));
    }
    const bmesh = addMesh(mergeGeos(benches), M.velvet);
    // degrau da segunda fila
    addMesh(ringSeg(17.8, GAL_R, 0, Math.PI, GAL1_Y + 0.35, 72), M.carpetFlat);
    addMesh(arcPanel(17.8, 0, Math.PI, GAL1_Y, GAL1_Y + 0.35, 72), M.mahogany);
    void bmesh;
  }
  const gallery = [];
  {
    const r = rng(33);
    const spots = [];
    for (const [rr, yy, n] of [[17.15, GAL1_Y, 70], [18.35, GAL1_Y + 0.35, 60], [18.25, GAL2_Y, 50]]) {
      for (let i = 0; i < n; i++) { if (r() < 0.35) continue; const a = 0.08 + (i / n) * (Math.PI - 0.16) + (r() - 0.5) * 0.01; spots.push([rr, a, yy]); }
    }
    gallery.push(...spots);
  }
  let galleryCrowd = null;

  // ---------- lugares, deputados e cadeiras
  const G = sharedGeometries();
  void G;
  const chairGeo = bag.geo(mergeGeos([
    place(new THREE.BoxGeometry(0.5, 0.11, 0.46), { y: 0.42 }),
    place(new THREE.BoxGeometry(0.52, 0.66, 0.1), { y: 0.78, z: -0.24, rx: -0.08 }),
    place(new THREE.CylinderGeometry(0.06, 0.12, 0.38, 10), { y: 0.19 }),
  ]));
  const plateGeo = bag.geo(new THREE.BoxGeometry(0.46, 0.05, 0.05));
  const micGeo = bag.geo(mergeGeos([place(new THREE.CylinderGeometry(0.007, 0.007, 0.3, 5), { y: 0.15, rx: 0.45 }), place(new THREE.SphereGeometry(0.018, 6, 5), { y: 0.28, z: 0.13 })]));

  let seatData = [];
  let layout = [];
  let chairs = null, plates = null, mics = null, deputies = null;
  const seatGroup = new THREE.Group(); scene.add(seatGroup);
  const chairCur = [], chairTgt = [], plateCur = [], plateTgt = [];
  let visibleN = Infinity;
  let highlightParty = null;
  let hoverIndex = null;
  const tmpM = new THREE.Matrix4(), tmpQ = new THREE.Quaternion(), tmpS = new THREE.Vector3(1, 1, 1), tmpP = new THREE.Vector3(), tmpC = new THREE.Color();

  function buildSeats(seats) {
    if (chairs) { chairs.dispose(); plates.dispose(); mics.dispose(); seatGroup.remove(chairs, plates, mics); }
    if (deputies) deputies.dispose();
    seatData = seats.slice();
    layout = layoutSeats(seatData.length);
    const n = layout.length, cap = Math.max(1, n);
    chairs = new THREE.InstancedMesh(chairGeo, M.chair, cap); chairs.count = n;
    plates = new THREE.InstancedMesh(plateGeo, M.plate, cap); plates.count = n;
    mics = new THREE.InstancedMesh(micGeo, M.metalDark, cap); mics.count = n;
    chairs.castShadow = shadowsOn; chairs.receiveShadow = shadowsOn;
    chairCur.length = chairTgt.length = plateCur.length = plateTgt.length = 0;
    layout.forEach((s, i) => {
      const sc = Math.min(1, s.spacing / 0.62);
      tmpQ.setFromAxisAngle(new THREE.Vector3(0, 1, 0), s.rot);
      tmpM.compose(tmpP.set(s.x, s.y, s.z), tmpQ, tmpS.set(sc, 1, 1)); chairs.setMatrixAt(i, tmpM);
      const fx = -Math.cos(s.phi), fz = -Math.sin(s.phi);
      tmpM.compose(tmpP.set(s.x + fx * 0.62, s.y + 0.79, s.z + fz * 0.62), tmpQ, tmpS.set(1, 1, 1)); plates.setMatrixAt(i, tmpM);
      tmpM.compose(tmpP.set(s.x + fx * 0.42 + Math.cos(s.phi + Math.PI / 2) * 0.16, s.y + 0.78, s.z + fz * 0.42 + Math.sin(s.phi + Math.PI / 2) * 0.16), tmpQ, tmpS.set(1, 1, 1)); mics.setMatrixAt(i, tmpM);
      chairCur.push(new THREE.Color()); chairTgt.push(new THREE.Color()); plateCur.push(new THREE.Color()); plateTgt.push(new THREE.Color());
    });
    seatGroup.add(chairs, plates, mics);
    if (opts.showDeputies !== false) {
      deputies = new SeatedPeople(layout, bag);
      seatGroup.add(deputies.group);
      layout.forEach((s, i) => { const lk = lookFor(seatData[i] || {}, i); lk.__name = seatData[i]?.personName || null; deputies.setLook(i, lk, seatData[i]?.color || '#888'); });
    } else deputies = null;
    refreshTargets(true);
  }

  function seatColorTargets(i) {
    const sd = seatData[i] || {};
    const occupied = i < visibleN;
    const pc = tmpC.set(sd.color || '#888888');
    const dim = highlightParty && sd.partyId !== highlightParty ? 0.32 : 1;
    if (occupied) {
      chairTgt[i].copy(CRIMSON).lerp(pc, 0.55).multiplyScalar(dim);
      plateTgt[i].set(sd.color || '#888888').multiplyScalar(dim);
    } else {
      chairTgt[i].copy(EMPTY).multiplyScalar(dim);
      plateTgt[i].set('#4a4a4a');
    }
    if (hoverIndex === i) { chairTgt[i].offsetHSL(0, 0, 0.18); plateTgt[i].offsetHSL(0, 0, 0.25); }
  }

  let colorAnim = 0;
  function refreshTargets(immediate = false) {
    for (let i = 0; i < layout.length; i++) {
      seatColorTargets(i);
      if (immediate) { chairCur[i].copy(chairTgt[i]); plateCur[i].copy(plateTgt[i]); chairs.setColorAt(i, chairCur[i]); plates.setColorAt(i, plateCur[i]); }
      if (deputies) {
        const st = deputies.state[i];
        st.tieT.set(seatData[i]?.color || '#888'); st.dimT = highlightParty && seatData[i]?.partyId !== highlightParty ? 0.35 : 1;
        if (immediate) { st.tie.copy(st.tieT); st.dim = st.dimT; deputies.applyTie(i); }
      }
    }
    if (immediate && layout.length) { chairs.instanceColor.needsUpdate = true; plates.instanceColor.needsUpdate = true; }
    colorAnim = 1;
  }

  buildSeats(opts.seats || []);

  // ---------- bancada do Governo
  let govPeople = null, govChairs = null, govDesk = null;
  function buildGovernment(list) {
    if (govPeople) { govPeople.dispose(); govPeople = null; }
    if (govChairs) { govChairs.dispose(); govChairs.removeFromParent(); govChairs = null; }
    const n = Math.min(20, (list || []).length);
    const slots = [];
    const rr = 5.65;
    const total = 20;
    for (let i = 0; i < total; i++) {
      const row = i < 11 ? 0 : 1;
      const k = row === 0 ? i : i - 11;
      const cnt = row === 0 ? 11 : 9;
      const r2 = rr + row * 0.0;
      const phi = Math.PI * (0.965 - (k / (cnt - 1)) * 0.27) - row * 0.012;
      const radius = row === 0 ? r2 - 0.0 : r2 - 1.0;
      const x = radius * Math.cos(phi), z = radius * Math.sin(phi);
      slots.push({ phi, r: radius, x, z, y: 0, rot: Math.atan2(-x, -z), spacing: 0.7 });
    }
    // secretária curva da bancada
    if (!govDesk) {
      const dg = mergeGeos([ringSeg(rr - 0.62, rr - 0.3, Math.PI * 0.68, Math.PI * 0.985, 0.76, 24), arcPanel(rr - 0.62, Math.PI * 0.68, Math.PI * 0.985, 0, 0.76, 24),
        ringSeg(rr - 1.62, rr - 1.3, Math.PI * 0.7, Math.PI * 0.975, 0.76, 24), arcPanel(rr - 1.62, Math.PI * 0.7, Math.PI * 0.975, 0, 0.76, 24)]);
      govDesk = addMesh(dg, M.mahogany, { cast: true });
    }
    govChairs = new THREE.InstancedMesh(chairGeo, M.chair, total);
    slots.forEach((s, i) => { tmpQ.setFromAxisAngle(new THREE.Vector3(0, 1, 0), s.rot); tmpM.compose(tmpP.set(s.x, 0, s.z), tmpQ, tmpS.set(1, 1, 1)); govChairs.setMatrixAt(i, tmpM); govChairs.setColorAt(i, GOV_BLUE); });
    govChairs.castShadow = shadowsOn;
    scene.add(govChairs);
    if (n > 0) {
      const used = slots.slice(0, n);
      govPeople = new SeatedPeople(used, bag);
      scene.add(govPeople.group);
      used.forEach((s, i) => govPeople.setLook(i, randomLook(hashString(list[i].name || 'g' + i), { gender: inferGender(list[i].name), formal: true, oldRatio: 0.3 }), list[i].color || '#334155'));
      govPeople.update(0, 0, true);
    }
  }
  buildGovernment(opts.government || []);

  // ---------- público (multidão sentada)
  {
    galleryCrowd = new Crowd(gallery.length, { seed: 12, castShadow: false, palette: { shirts: ['#1f2933', '#3b4a5a', '#7a6a55', '#e8e4da', '#8a2a2b', '#2f4a63', '#5b6b7a', '#d9cdb8'] } });
    gallery.forEach(([rr, a, yy], i) => { const x = rr * Math.cos(a), z = rr * Math.sin(a); galleryCrowd.setTransform(i, x, yy, z, Math.atan2(-x, -z)); galleryCrowd.setPose(i, 'sit'); });
    galleryCrowd.update(0);
    scene.add(galleryCrowd.object3d);
  }

  // ---------- câmara
  const PRESETS = {
    overview: [new THREE.Vector3(0, 21, -9.6), new THREE.Vector3(0, 0.2, 6.2)],
    mesa: [new THREE.Vector3(0, 6.2, 15.5), new THREE.Vector3(0, 4.2, -6.5)],
    tribuna: [new THREE.Vector3(0.6, 2.4, 0.4), new THREE.Vector3(0, 1.9, -4.2)],
    galeria: [new THREE.Vector3(-14.5, 9.5, 12.5), new THREE.Vector3(0, 1.8, -1.5)],
    bancadas: [new THREE.Vector3(13.5, 4.2, 1.2), new THREE.Vector3(-3.5, 1.8, 8.5)],
  };
  let controls = null;
  const cinematic = !!opts.cinematic;
  const cineCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 10.4, 17.2), new THREE.Vector3(12.5, 8.2, 11), new THREE.Vector3(9.5, 4.2, -1.2),
    new THREE.Vector3(0, 8.2, -6.6), new THREE.Vector3(-9.5, 4.2, -1.2), new THREE.Vector3(-12.5, 8.2, 11),
  ], true, 'centripetal');
  const cineTarget = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 3, -4), new THREE.Vector3(0, 2.5, -2), new THREE.Vector3(-5, 2.2, 6),
    new THREE.Vector3(0, 1.5, 9), new THREE.Vector3(5, 2.2, 6), new THREE.Vector3(0, 2.5, -2),
  ], true, 'centripetal');
  const p0 = PRESETS.overview;
  if (cinematic) { camera.position.copy(cineCurve.getPoint(0)); tween.target.copy(cineTarget.getPoint(0)); camera.lookAt(tween.target); }
  else { camera.position.copy(p0[0]); tween.target.copy(p0[1]); camera.lookAt(p0[1]); }

  // ---------- interação
  let downAt = null;
  function pickSeat(p) {
    if (!chairs || !layout.length) return null;
    const objs = [chairs];
    if (deputies) objs.push(deputies.torso, deputies.head);
    const hits = Engine.raycast(camera, p, objs, false);
    for (const h of hits) {
      if (h.instanceId == null) continue;
      if (h.instanceId < layout.length) return h.instanceId;
    }
    return null;
  }

  function setHover(idx) {
    if (idx === hoverIndex) return;
    const prev = hoverIndex; hoverIndex = idx;
    if (prev != null && prev < layout.length) seatColorTargets(prev);
    if (idx != null) seatColorTargets(idx);
    colorAnim = 1;
  }

  // ---------- controlador
  let voteToken = 0;
  let flagT = 0;
  const ctrl = {
    scene, camera,
    onAttach(renderer) {
      if (!cinematic && !controls) {
        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true; controls.dampingFactor = 0.08;
        controls.target.copy(tween.target);
        controls.minDistance = 4; controls.maxDistance = 42;
        controls.maxPolarAngle = Math.PI * 0.47; controls.minPolarAngle = 0.12;
        controls.enablePan = true; controls.panSpeed = 0.6; controls.rotateSpeed = 0.55;
        controls.update();
      }
    },
    update(dt, t) {
      // câmara
      if (cinematic) {
        const u = (t * 0.012) % 1;
        camera.position.copy(cineCurve.getPoint(u));
        tween.target.copy(cineTarget.getPoint(u));
        camera.lookAt(tween.target);
      } else if (tween.active) {
        tween.update(dt);
        if (controls) { controls.target.copy(tween.target); if (!tween.active) controls.enabled = true; }
      } else if (controls) {
        controls.update();
      }
      ceilingGroup.visible = camera.position.y < CEIL_Y - 0.15;
      // cores dos lugares
      if (colorAnim > 0 && layout.length) {
        const k = 1 - Math.exp(-dt * 8);
        let still = false;
        for (let i = 0; i < layout.length; i++) {
          const a = chairCur[i], b = chairTgt[i];
          if (Math.abs(a.r - b.r) + Math.abs(a.g - b.g) + Math.abs(a.b - b.b) > 0.002) { a.lerp(b, k); still = true; } else a.copy(b);
          chairs.setColorAt(i, a);
          const pa = plateCur[i], pb = plateTgt[i];
          if (Math.abs(pa.r - pb.r) + Math.abs(pa.g - pb.g) + Math.abs(pa.b - pb.b) > 0.002) { pa.lerp(pb, k); still = true; } else pa.copy(pb);
          plates.setColorAt(i, pa);
        }
        chairs.instanceColor.needsUpdate = true; plates.instanceColor.needsUpdate = true;
        if (!still) colorAnim = 0;
      }
      if (deputies) deputies.update(dt, t);
      if (govPeople) govPeople.update(dt, t);
      // pessoas da Mesa
      for (let i = 0; i < mesaPeople.length; i++) animatePerson(mesaPeople[i], 'sit', t + i * 3.1, 1);
      if (speakerOn) animatePerson(speaker, 'podiumTalk', t, 1 - Math.exp(-dt * 8));
      // bandeira (ondulação suave)
      flagT += dt;
      const pos = flagGeo.attributes.position, base = flagGeo.userData.base;
      for (let i = 0; i < pos.count; i++) {
        const bx = base[i * 3], by = base[i * 3 + 1];
        const w = bx / 1.8;
        pos.setZ(i, Math.sin(bx * 3.2 - flagT * 1.6) * 0.09 * w + Math.sin(by * 4 + flagT) * 0.02 * w);
        pos.setY(i, by - w * w * 0.25);
      }
      pos.needsUpdate = true; flagGeo.computeVertexNormals();
      if (galleryCrowd) galleryCrowd.update(t);
    },
    onPointer(type, p) {
      if (cinematic) return;
      if (type === 'pointerdown') downAt = { x: p.clientX, y: p.clientY };
      if (type === 'pointermove') {
        if (!opts.interactive) return;
        const idx = pickSeat(p);
        setHover(idx);
        Engine.setCursor(idx != null ? 'pointer' : '');
        opts.onHover?.(idx, p.clientX, p.clientY);
      }
      if (type === 'click') {
        if (downAt && Math.hypot(p.clientX - downAt.x, p.clientY - downAt.y) > 6) return;
        if (!opts.interactive) return;
        const idx = pickSeat(p);
        if (idx != null) opts.onClick?.(idx);
      }
    },
    setSeats(seats) {
      seats = seats || [];
      if (seats.length !== seatData.length) { buildSeats(seats); return; }
      seatData = seats.slice();
      if (deputies) layout.forEach((s, i) => {
        const prevName = deputies.state[i].look?.__name;
        if (prevName !== (seatData[i]?.personName || null)) { const lk = lookFor(seatData[i] || {}, i); lk.__name = seatData[i]?.personName || null; deputies.setLook(i, lk, seatData[i]?.color || '#888'); }
      });
      refreshTargets(false);
    },
    setSeatsVisible(n) {
      const old = visibleN === Infinity ? layout.length : visibleN;
      visibleN = clamp(Math.round(n), 0, layout.length);
      if (deputies) {
        for (let i = 0; i < layout.length; i++) {
          const st = deputies.state[i];
          const on = i < visibleN;
          if (on && st.popT === 0) { st.popT = 1; st.popRaw = 0; st.pop = 0; st.delay = Math.min(1.2, Math.max(0, i - old) * 0.012); }
          else if (!on) { st.popT = 0; st.pop = 0; st.popRaw = 0; st.delay = 0; }
        }
        deputies.dirty = true;
      }
      refreshTargets(false);
    },
    standUp(partyIds) {
      if (!deputies) return;
      const all = partyIds === 'all', none = partyIds === 'none' || !partyIds;
      const set = new Set(Array.isArray(partyIds) ? partyIds : []);
      layout.forEach((s, i) => { deputies.state[i].standT = all ? 1 : none ? 0 : (set.has(seatData[i]?.partyId) ? 1 : 0); });
    },
    async voteSequence(votes = {}, onPhase) {
      const my = ++voteToken;
      const phases = ['contra', 'abstencao', 'favor'];
      ctrl.standUp('none');
      await wait(350);
      for (const ph of phases) {
        if (my !== voteToken) return;
        const parties = Object.keys(votes).filter(k => votes[k] === ph);
        try { onPhase?.(ph); } catch (e) { console.error(e); }
        if (!parties.length) { await wait(750); continue; }
        ctrl.standUp(parties);
        await wait(1600);
        if (my !== voteToken) return;
        ctrl.standUp('none');
        await wait(450);
      }
      if (my !== voteToken) return;
      try { onPhase?.('done'); } catch (e) { console.error(e); }
    },
    setCamera(preset, animate = true) {
      const p = PRESETS[preset] || PRESETS.overview;
      if (cinematic) return;
      const fromTarget = controls ? controls.target.clone() : tween.target.clone();
      if (animate) { tween.start(p[0], p[1], 1.5, fromTarget); if (controls) controls.enabled = false; }
      else { tween.jump(p[0], p[1]); if (controls) { controls.target.copy(p[1]); controls.update(); } }
    },
    setSpeaker(on, color) {
      speakerOn = !!on; speaker.visible = speakerOn;
      if (color) speakerTieMat.color.set(color);
    },
    highlight(partyId) { highlightParty = partyId || null; refreshTargets(false); },
    setGovernment(list) { buildGovernment(list || []); },
    get seatCount() { return layout.length; },
    seatWorldPosition(i) { const s = layout[i]; return s ? new THREE.Vector3(s.x, s.y + 1.2, s.z) : null; },
    dispose() {
      voteToken++;
      controls?.dispose(); controls = null;
      chairs?.dispose(); plates?.dispose(); mics?.dispose();
      deputies?.dispose(); govPeople?.dispose(); govChairs?.dispose();
      galleryCrowd?.dispose();
      bag.dispose();
      Engine.setCursor('');
    },
  };
  return ctrl;
}

