// Personagens estilizadas (low-poly) e multidões instanciadas.
import * as THREE from 'three';
import { rng, inferGender } from './util3d.js';
import { makeCanvas, toTexture } from './materials.js';

export const SKINS = ['#f3d2b6', '#eec3a0', '#e3b08a', '#d39b72', '#c2885e', '#a8704a', '#8a5638', '#6a3f27', '#f6dcc6'];
export const HAIRS = ['#1d1612', '#2a1d16', '#3d2a1e', '#5a3d27', '#7a5534', '#9c7448', '#c9a46c', '#8f8f8f', '#c9c9c9', '#e6e1d8', '#2b1a12'];
export const SUITS = ['#1b2230', '#22262e', '#2e3440', '#1d2a3b', '#383d46', '#141922', '#2b2f36', '#262a33'];
export const SUITS_F = ['#1b2230', '#5c1f2b', '#21434a', '#d9cdb8', '#2e3440', '#f1efe9', '#3b2f4a', '#1d2a3b', '#7a6a55'];
export const SHIRTS = ['#f4f4f2', '#e9eef5', '#dfe8f3', '#f6f1e6', '#ffffff'];
export const CASUAL = ['#d9483b', '#3b82c4', '#f2c14e', '#4f9d69', '#e8e4da', '#7c5cbf', '#1f2933', '#f08a4b', '#8fb8de', '#c94f7c', '#5b6b7a', '#b5a27a', '#2f6f73', '#9e2a2b'];
export const PANTS = ['#1c1f26', '#2a3140', '#3b3f45', '#4a5a74', '#5b4a3a', '#2f3b52', '#6b6b6b', '#24324a'];

// ---------------------------------------------------------------- recursos partilhados (nunca libertados)
let G = null;
const matCache = new Map();
let faceTex = null;

function faceTexture() {
  if (faceTex) return faceTex;
  const W = 512, H = 256, c = makeCanvas(W, H), g = c.getContext('2d');
  g.fillStyle = '#ffffff'; g.fillRect(0, 0, W, H);
  const fx = W * 0.25;
  // rubor
  for (const s of [-1, 1]) {
    const grd = g.createRadialGradient(fx + s * 40, 146, 0, fx + s * 40, 146, 26);
    grd.addColorStop(0, 'rgba(255,150,140,0.22)'); grd.addColorStop(1, 'rgba(255,150,140,0)');
    g.fillStyle = grd; g.fillRect(fx + s * 40 - 30, 116, 60, 60);
  }
  // olhos
  for (const s of [-1, 1]) {
    const ex = fx + s * 27, ey = 121;
    g.fillStyle = '#ffffff'; g.beginPath(); g.ellipse(ex, ey, 9, 7.5, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#2a1c15'; g.beginPath(); g.ellipse(ex, ey + 0.5, 5.5, 7, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.9)'; g.beginPath(); g.arc(ex - 1.8, ey - 2.2, 1.8, 0, Math.PI * 2); g.fill();
    // sobrancelhas
    g.strokeStyle = 'rgba(55,38,28,0.85)'; g.lineWidth = 3.4; g.lineCap = 'round';
    g.beginPath(); g.moveTo(ex - 10, ey - 14 + s * 1.2); g.quadraticCurveTo(ex, ey - 19, ex + 10, ey - 14 - s * 1.2); g.stroke();
  }
  // nariz
  const ng = g.createLinearGradient(fx - 6, 0, fx + 6, 0);
  ng.addColorStop(0, 'rgba(150,100,80,0)'); ng.addColorStop(0.5, 'rgba(150,100,80,0.28)'); ng.addColorStop(1, 'rgba(150,100,80,0)');
  g.fillStyle = ng; g.fillRect(fx - 6, 124, 12, 22);
  g.fillStyle = 'rgba(140,90,70,0.35)'; g.beginPath(); g.ellipse(fx, 146, 6, 2.5, 0, 0, Math.PI * 2); g.fill();
  // boca
  g.strokeStyle = 'rgba(140,70,62,0.9)'; g.lineWidth = 3;
  g.beginPath(); g.moveTo(fx - 13, 160); g.quadraticCurveTo(fx, 167, fx + 13, 160); g.stroke();
  faceTex = toTexture(c);
  return faceTex;
}

export function mat(colorHex, o = {}) {
  const key = colorHex + '|' + (o.rough ?? 0.75) + '|' + (o.metal ?? 0) + '|' + (o.map ? 'face' : '') + '|' + (o.side ?? 0) + '|' + (o.emissive || '');
  let m = matCache.get(key);
  if (!m) {
    m = new THREE.MeshStandardMaterial({ color: colorHex, roughness: o.rough ?? 0.75, metalness: o.metal ?? 0, map: o.map ? faceTexture() : null, side: o.side ?? THREE.FrontSide });
    if (o.emissive) { m.emissive = new THREE.Color(o.emissive); m.emissiveIntensity = o.emissiveIntensity ?? 0.6; }
    m.userData.shared = true;
    matCache.set(key, m);
  }
  return m;
}

function torsoGeo(female) {
  const pts = female
    ? [[0.001, 0], [0.15, 0.02], [0.162, 0.12], [0.142, 0.27], [0.155, 0.42], [0.166, 0.52], [0.152, 0.6], [0.09, 0.652], [0.04, 0.666], [0.001, 0.668]]
    : [[0.001, 0], [0.138, 0.02], [0.152, 0.12], [0.158, 0.26], [0.178, 0.42], [0.192, 0.52], [0.172, 0.6], [0.1, 0.655], [0.04, 0.67], [0.001, 0.672]];
  const g = new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), 16);
  g.scale(1, 1, 0.62);
  return g;
}

function geos() {
  if (G) return G;
  G = {};
  G.torsoM = torsoGeo(false);
  G.torsoF = torsoGeo(true);
  const v = new THREE.Shape(); v.moveTo(-0.058, 0.07); v.lineTo(0.058, 0.07); v.lineTo(0, -0.11); v.closePath();
  G.shirtV = new THREE.ShapeGeometry(v);
  const tie = new THREE.Shape(); tie.moveTo(0, 0.06); tie.lineTo(0.022, 0.035); tie.lineTo(0.03, -0.17); tie.lineTo(0, -0.215); tie.lineTo(-0.03, -0.17); tie.lineTo(-0.022, 0.035); tie.closePath();
  G.tie = new THREE.ShapeGeometry(tie);
  G.arm = new THREE.CapsuleGeometry(0.052, 0.46, 4, 8); G.arm.translate(0, -0.29, 0);
  G.hand = new THREE.SphereGeometry(0.05, 10, 8); G.hand.translate(0, -0.6, 0);
  G.thigh = new THREE.CapsuleGeometry(0.072, 0.34, 4, 8); G.thigh.translate(0, -0.22, 0);
  G.shin = new THREE.CapsuleGeometry(0.06, 0.33, 4, 8); G.shin.translate(0, -0.21, 0);
  G.shoe = new THREE.BoxGeometry(0.1, 0.07, 0.25); G.shoe.translate(0, -0.42, 0.045);
  G.neck = new THREE.CylinderGeometry(0.045, 0.05, 0.1, 8); G.neck.translate(0, 0.02, 0);
  G.head = new THREE.SphereGeometry(0.112, 22, 16);
  G.mouth = new THREE.BoxGeometry(0.028, 0.008, 0.006);
  G.hairShort = new THREE.SphereGeometry(0.121, 18, 10, 0, Math.PI * 2, 0, Math.PI * 0.5); G.hairShort.rotateX(-0.42); G.hairShort.translate(0, 0.01, -0.006);
  const back = new THREE.SphereGeometry(0.126, 18, 12, Math.PI / 2 + 0.95, Math.PI * 2 - 1.9, 0, Math.PI * 0.8);
  const top = G.hairShort.clone();
  G.hairLong = mergeSimple([top, back]);
  const bun = new THREE.SphereGeometry(0.05, 10, 8); bun.translate(0, 0.07, -0.11);
  G.hairBun = mergeSimple([G.hairShort.clone(), bun]);
  G.hairBald = new THREE.SphereGeometry(0.118, 18, 8, Math.PI / 2 + 1.2, Math.PI * 2 - 2.4, Math.PI * 0.36, Math.PI * 0.2);
  const curls = [G.hairShort.clone()];
  const r = rng(11);
  for (let i = 0; i < 12; i++) {
    const s = new THREE.SphereGeometry(0.036, 7, 5);
    const a = r() * Math.PI * 2, el = 0.2 + r() * 0.9;
    s.translate(Math.cos(a) * Math.sin(el) * 0.115, Math.cos(el) * 0.115 + 0.01, Math.sin(a) * Math.sin(el) * 0.115 - 0.01);
    curls.push(s);
  }
  G.hairCurly = mergeSimple(curls);
  G.skirt = new THREE.CylinderGeometry(0.165, 0.27, 0.52, 16, 1, true); G.skirt.translate(0, -0.2, 0);
  G.legStraight = new THREE.CapsuleGeometry(0.068, 0.72, 4, 8); G.legStraight.translate(0, -0.43, 0);
  G.pole = new THREE.CylinderGeometry(0.012, 0.012, 1.3, 6); G.pole.translate(0, 0.65, 0);
  G.cloth = new THREE.PlaneGeometry(0.62, 0.42, 6, 3); G.cloth.translate(0.31, 0, 0);
  G.cameraBox = new THREE.BoxGeometry(0.16, 0.18, 0.38);
  G.lens = new THREE.CylinderGeometry(0.05, 0.06, 0.14, 12); G.lens.rotateX(Math.PI / 2);
  G.mic = new THREE.CylinderGeometry(0.014, 0.014, 0.2, 8);
  G.micHead = new THREE.SphereGeometry(0.03, 10, 8);
  G.micCube = new THREE.BoxGeometry(0.05, 0.05, 0.05);
  return G;
}

function mergeSimple(list) {
  // todos indexados (SphereGeometry/Capsule): junta posição/normal/uv
  const pos = [], nor = [], uv = [], idx = [];
  let off = 0;
  for (const g of list) {
    const p = g.attributes.position, n = g.attributes.normal, u = g.attributes.uv;
    for (let i = 0; i < p.count; i++) { pos.push(p.getX(i), p.getY(i), p.getZ(i)); nor.push(n.getX(i), n.getY(i), n.getZ(i)); uv.push(u.getX(i), u.getY(i)); }
    if (g.index) for (let i = 0; i < g.index.count; i++) idx.push(g.index.getX(i) + off);
    else for (let i = 0; i < p.count; i++) idx.push(i + off);
    off += p.count;
    g.dispose();
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  out.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  out.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  out.setIndex(idx);
  return out;
}

export function sharedGeometries() { return geos(); }
export function sharedFaceTexture() { return faceTexture(); }

function mesh(geo, material, shadow = true) {
  const m = new THREE.Mesh(geo, material);
  m.castShadow = shadow; m.receiveShadow = false;
  return m;
}

/** Aparência aleatória coerente a partir de uma semente. */
export function randomLook(seed, o = {}) {
  const r = rng(seed);
  const gender = o.gender || (r() < (o.femaleRatio ?? 0.45) ? 'f' : 'm');
  const old = r() < (o.oldRatio ?? 0.25);
  const skin = SKINS[Math.floor(Math.pow(r(), 1.8) * SKINS.length)];
  const hair = old ? (r() < 0.6 ? HAIRS[8] : HAIRS[7]) : HAIRS[Math.floor(r() * 7)];
  const styles = gender === 'f' ? ['long', 'long', 'bun', 'short', 'curly'] : (old ? ['bald', 'short', 'short'] : ['short', 'short', 'curly', 'short', 'bald']);
  const formal = o.formal ?? true;
  const look = {
    gender, skin, hair, hairStyle: styles[Math.floor(r() * styles.length)],
    shirt: formal ? SHIRTS[Math.floor(r() * SHIRTS.length)] : CASUAL[Math.floor(r() * CASUAL.length)],
    jacket: formal ? (gender === 'f' ? SUITS_F[Math.floor(r() * SUITS_F.length)] : SUITS[Math.floor(r() * SUITS.length)]) : (r() < 0.25 ? CASUAL[Math.floor(r() * CASUAL.length)] : null),
    pants: formal ? SUITS[Math.floor(r() * 4)] : PANTS[Math.floor(r() * PANTS.length)],
    skirt: gender === 'f' && r() < (formal ? 0.45 : 0.3),
    old, scale: (gender === 'f' ? 0.95 : 1.0) * (0.95 + r() * 0.08) * (old ? 0.97 : 1),
  };
  return Object.assign(look, o.override || {});
}

/**
 * Cria uma personagem. Origem nos pés, de frente para +Z.
 * opts: { skin, hair, hairStyle, shirt, jacket, pants, tie, gender, scale, detail:'high'|'low', skirt, prop:'camera'|'mic'|null, name }
 */
export function makePerson(o = {}) {
  geos();
  const female = (o.gender || (o.name ? inferGender(o.name) : 'm')) === 'f';
  const skin = o.skin || SKINS[1];
  const hair = o.hair || HAIRS[1];
  const shirt = o.shirt || '#f2f2f2';
  const jacket = o.jacket === undefined ? '#1d2430' : o.jacket;
  const pants = o.pants || '#1c1f26';
  const upper = jacket || shirt;
  const root = new THREE.Group();
  root.name = 'person';

  const hips = new THREE.Group(); hips.position.y = 0.88; root.add(hips);
  const mkLeg = (side) => {
    const thigh = new THREE.Group(); thigh.position.set(side * 0.092, 0, 0); hips.add(thigh);
    thigh.add(mesh(G.thigh, mat(pants)));
    const knee = new THREE.Group(); knee.position.y = -0.44; thigh.add(knee);
    knee.add(mesh(G.shin, mat(o.skirt && female ? skin : pants)));
    knee.add(mesh(G.shoe, mat('#17181b', { rough: 0.35 })));
    return { thigh, knee };
  };
  const L = mkLeg(1), R = mkLeg(-1);
  if (o.skirt && female) { const sk = mesh(G.skirt, mat(o.skirtColor || jacket || pants, { side: THREE.DoubleSide })); hips.add(sk); }

  const torso = new THREE.Group(); hips.add(torso);
  torso.add(mesh(female ? G.torsoF : G.torsoM, mat(upper, { rough: jacket ? 0.68 : 0.85 })));
  if (jacket) {
    const sv = mesh(G.shirtV, mat(shirt, { rough: 0.85 }), false); sv.position.set(0, 0.585, female ? 0.108 : 0.117); sv.rotation.x = -0.12; torso.add(sv);
    if (o.tie && !female) { const t = mesh(G.tie, mat(o.tie, { rough: 0.5 }), false); t.position.set(0, 0.6, 0.123); t.rotation.x = -0.1; torso.add(t); }
    if (o.tie && female) { const t = mesh(G.shirtV, mat(o.tie, { rough: 0.6 }), false); t.scale.set(1.05, 0.7, 1); t.position.set(0, 0.605, 0.111); t.rotation.x = -0.12; torso.add(t); }
  } else if (o.tie) {
    // t-shirt com faixa/cor de partido: pequeno emblema no peito
    const t = mesh(new THREE.CircleGeometry(0.045, 12), mat(o.tie, { rough: 0.6 }), false); t.position.set(-0.07, 0.46, 0.112); torso.add(t);
    root.userData.ownGeos = [t.geometry];
  }

  const mkArm = (side) => {
    const a = new THREE.Group(); a.position.set(side * (female ? 0.2 : 0.215), 0.555, 0); torso.add(a);
    a.add(mesh(G.arm, mat(upper, { rough: jacket ? 0.68 : 0.85 })));
    a.add(mesh(G.hand, mat(skin, { rough: 0.6 })));
    return a;
  };
  const armL = mkArm(1), armR = mkArm(-1);

  const head = new THREE.Group(); head.position.y = 0.665; torso.add(head);
  head.add(mesh(G.neck, mat(skin, { rough: 0.6 })));
  const skull = mesh(G.head, mat(skin, { rough: 0.55, map: true })); skull.position.y = 0.115; head.add(skull);
  let mouth = null;
  if (o.detail === 'high') {
    mouth = mesh(G.mouth, mat('#3a1512', { rough: 0.6 }), false);
    mouth.position.set(0, 0.115 - 0.05, 0.104); mouth.scale.y = 0.4; head.add(mouth);
  }
  const hs = o.hairStyle || (female ? 'long' : 'short');
  const hairGeo = hs === 'long' ? G.hairLong : hs === 'bun' ? G.hairBun : hs === 'bald' ? G.hairBald : hs === 'curly' ? G.hairCurly : G.hairShort;
  if (hs !== 'none') { const h = mesh(hairGeo, mat(hair, { rough: 0.9, side: hs === 'long' || hs === 'bald' ? THREE.DoubleSide : THREE.FrontSide })); h.position.y = 0.115; head.add(h); }

  if (o.prop === 'camera') {
    const cam = new THREE.Group();
    cam.add(mesh(G.cameraBox, mat('#202227', { rough: 0.4, metal: 0.3 })));
    const lens = mesh(G.lens, mat('#0d0e10', { rough: 0.2, metal: 0.5 })); lens.position.z = 0.24; cam.add(lens);
    cam.position.set(-0.17, 0.66, 0.02); torso.add(cam);
  } else if (o.prop === 'mic') {
    const mic = new THREE.Group();
    mic.add(mesh(G.mic, mat('#1a1a1a', { rough: 0.4 })));
    const mh = mesh(G.micHead, mat('#2d2d2d', { rough: 0.5 })); mh.position.y = 0.12; mic.add(mh);
    const mc = mesh(G.micCube, mat(o.micColor || '#d4202b', { rough: 0.5 })); mc.position.y = 0.05; mic.add(mc);
    mic.position.set(0, -0.62, 0.02); armR.add(mic);
  }

  root.userData.parts = { hips, torso, head, armL, armR, thighL: L.thigh, kneeL: L.knee, thighR: R.thigh, kneeR: R.knee, mouth, skull };
  root.userData.phase = (o.phase ?? Math.random() * 10);
  root.userData.anim = null;
  if (o.scale) root.scale.setScalar(o.scale);
  animatePerson(root, 'idle', 0, 1);
  return root;
}

const BASE = { hipsY: 0.88, hipsZ: 0, bob: 0, torsoX: 0, torsoY: 0, headX: 0, headY: 0, headZ: 0, armLx: 0, armLz: 0.09, armRx: 0, armRz: -0.09, thighL: 0, thighR: 0, kneeL: 0, kneeR: 0, mouth: 0.15 };

export function poseTarget(pose, t) {
  const p = Object.assign({}, BASE);
  const S = Math.sin;
  switch (pose) {
    case 'walk': {
      const s = S(t * 7.2);
      p.thighL = s * 0.5; p.thighR = -s * 0.5;
      p.kneeL = Math.max(0, s) * 0.75 + 0.05; p.kneeR = Math.max(0, -s) * 0.75 + 0.05;
      p.armLx = -s * 0.45; p.armRx = s * 0.45; p.bob = Math.abs(Math.cos(t * 7.2)) * 0.03; p.torsoY = s * 0.05; break;
    }
    case 'run': {
      const s = S(t * 11);
      p.thighL = s * 0.8; p.thighR = -s * 0.8; p.kneeL = Math.max(0, s) * 1.2 + 0.2; p.kneeR = Math.max(0, -s) * 1.2 + 0.2;
      p.armLx = -s * 0.8; p.armRx = s * 0.8; p.armLz = 0.2; p.armRz = -0.2; p.bob = Math.abs(Math.cos(t * 11)) * 0.06; p.torsoX = 0.15; break;
    }
    case 'wave': p.armRz = -2.75 + S(t * 9) * 0.28; p.armRx = -0.15; p.headY = 0.1; p.torsoY = 0.05; break;
    case 'clap': { const c = S(t * 15) * 0.5 + 0.5; p.armLx = p.armRx = -1.25; p.armLz = -0.22 - c * 0.22; p.armRz = 0.22 + c * 0.22; break; }
    case 'talk': p.armRx = -0.6 + S(t * 3.1) * 0.3; p.armRz = -0.25 + S(t * 2.3) * 0.15; p.armLx = -0.3 + S(t * 2.7 + 1) * 0.18; p.armLz = 0.15; p.headX = S(t * 4.2) * 0.06; p.headY = S(t * 1.6) * 0.15; p.mouth = 0.35 + Math.abs(S(t * 12)) * 1.6; p.torsoY = S(t * 1.3) * 0.06; break;
    case 'cheer': p.armLz = 2.65 + S(t * 8) * 0.2; p.armRz = -2.65 - S(t * 8 + 1) * 0.2; p.bob = Math.abs(S(t * 6)) * 0.12; p.headX = -0.15; p.mouth = 1.8; break;
    case 'sit': p.hipsY = 0.47; p.hipsZ = -0.03; p.thighL = p.thighR = -1.5; p.kneeL = p.kneeR = 1.5; p.armLx = p.armRx = -0.85; p.armLz = 0.05; p.armRz = -0.05; p.headY = S(t * 0.4) * 0.15; p.headX = 0.05; break;
    case 'angry': p.armRx = -2.4 + S(t * 13) * 0.3; p.armRz = -0.1; p.armLz = 0.45; p.armLx = -0.2; p.headY = S(t * 9) * 0.12; p.torsoX = 0.08; p.mouth = 1.5; break;
    case 'happy': p.bob = Math.abs(S(t * 6)) * 0.09; p.armLz = 0.8 + S(t * 6) * 0.2; p.armRz = -0.8 - S(t * 6) * 0.2; p.headX = -0.12; p.mouth = 1.4; break;
    case 'hug': p.armLx = p.armRx = -1.35; p.armLz = -0.38; p.armRz = 0.38; p.torsoX = 0.12; p.headX = 0.1; break;
    case 'shake': p.armRx = -1.2 + S(t * 12) * 0.09; p.armRz = 0.06; p.torsoX = 0.06; p.mouth = 0.9; break;
    case 'podium': p.armLx = p.armRx = -0.72; p.armLz = -0.06; p.armRz = 0.06; p.headY = S(t * 0.5) * 0.12; p.headX = S(t * 0.33) * 0.03; break;
    case 'podiumTalk': p.armLx = -0.72; p.armLz = -0.06; p.armRx = -0.95 + S(t * 3) * 0.32; p.armRz = -0.32 + S(t * 2.2) * 0.2; p.headX = S(t * 4) * 0.05; p.headY = S(t * 1.5) * 0.18; p.mouth = 0.35 + Math.abs(S(t * 12)) * 1.6; p.torsoY = S(t * 1.2) * 0.05; break;
    case 'nod': p.armLx = p.armRx = -0.72; p.armLz = -0.06; p.armRz = 0.06; p.headX = 0.1 + S(t * 7) * 0.2; break;
    case 'headshake': p.armLx = p.armRx = -0.72; p.armLz = -0.06; p.armRz = 0.06; p.headY = S(t * 9) * 0.32; break;
    case 'laugh': p.armLx = p.armRx = -0.72; p.armLz = -0.06; p.armRz = 0.06; p.torsoX = -0.06 + S(t * 13) * 0.04; p.headX = -0.28; p.mouth = 1.9; p.bob = Math.abs(S(t * 13)) * 0.01; break;
    case 'angryPodium': p.armLx = -0.72; p.armLz = -0.06; p.armRx = -1.35 + S(t * 10) * 0.25; p.armRz = -0.1; p.headY = S(t * 8) * 0.1; p.torsoX = 0.07; p.mouth = 1.4; break;
    case 'stand': p.headY = S(t * 0.4) * 0.05; break;
    default: // idle
      p.bob = S(t * 1.7) * 0.006; p.armLz = 0.09 + S(t * 1.1) * 0.015; p.armRz = -0.09 - S(t * 1.1 + 0.5) * 0.015;
      p.headY = S(t * 0.45) * 0.12; p.headX = S(t * 0.7) * 0.03;
  }
  return p;
}

function applyPose(P, A) {
  P.hips.position.y = A.hipsY + A.bob;
  P.hips.position.z = A.hipsZ;
  P.torso.rotation.set(A.torsoX, A.torsoY, 0);
  P.head.rotation.set(A.headX, A.headY, A.headZ);
  P.armL.rotation.set(A.armLx, 0, A.armLz);
  P.armR.rotation.set(A.armRx, 0, A.armRz);
  P.thighL.rotation.x = A.thighL; P.thighR.rotation.x = A.thighR;
  P.kneeL.rotation.x = A.kneeL; P.kneeR.rotation.x = A.kneeR;
  if (P.mouth) P.mouth.scale.y = A.mouth;
}

/** Anima uma personagem. blend<1 suaviza a transição (ex.: 1-exp(-dt*10)). */
export function animatePerson(group, pose = 'idle', t = 0, blend = 1) {
  const P = group.userData.parts;
  if (!P) return;
  const T = poseTarget(pose, t + (group.userData.phase || 0));
  let A = group.userData.anim;
  if (!A || blend >= 1) { A = group.userData.anim = Object.assign({}, T); }
  else { for (const k in T) A[k] += (T[k] - A[k]) * blend; }
  applyPose(P, A);
}

export function disposePerson(group) {
  for (const g of group.userData.ownGeos || []) g.dispose();
}

// ---------------------------------------------------------------- multidão instanciada

const POSE_CODE = { idle: 0, cheer: 1, walk: 2, sit: 3, stand: 4, clap: 5, wave: 6 };
let crowdMats = null;
function crowdMaterials() {
  if (crowdMats) return crowdMats;
  crowdMats = {
    body: new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.82 }),
    skin: new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.6 }),
    face: new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.55, map: faceTexture() }),
    hair: new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.9 }),
    pole: new THREE.MeshStandardMaterial({ color: '#d8d8d8', roughness: 0.4, metalness: 0.6 }),
  };
  for (const m of Object.values(crowdMats)) m.userData.shared = true;
  return crowdMats;
}

export class Crowd {
  /**
   * @param {number} count
   * @param {{palette?:{shirts?:string[],pants?:string[],skins?:string[],hairs?:string[]}, flagColor?:string, flagColors?:string[], flagTexture?:THREE.Texture, flagRatio?:number, seed?:number, castShadow?:boolean}} o
   */
  constructor(count, o = {}) {
    geos();
    this.count = count;
    this.drawCount = count;
    const M = crowdMaterials();
    const r = rng(o.seed ?? 3);
    this.object3d = new THREE.Group();
    this.object3d.name = 'crowd';
    const mk = (geo, material, n = count) => {
      const im = new THREE.InstancedMesh(geo, material, n);
      im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      im.frustumCulled = false;
      im.castShadow = o.castShadow ?? true;
      this.object3d.add(im);
      return im;
    };
    this.torsoM = mk(G.torsoM, M.body);
    this.headM = mk(G.head, M.face);
    this.hairM = mk(G.hairShort, M.hair);
    this.hairLM = mk(G.hairLong, new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.9, side: THREE.DoubleSide }));
    this.ownMats = [this.hairLM.material];
    this.legLM = mk(G.legStraight, M.body);
    this.legRM = mk(G.legStraight, M.body);
    this.armLM = mk(G.arm, M.body);
    this.armRM = mk(G.arm, M.body);
    this.handM = mk(G.hand, M.skin, count * 2);
    this.flagRatio = o.flagColor || o.flagColors || o.flagTexture ? (o.flagRatio ?? 0.3) : 0;
    if (this.flagRatio > 0) {
      this.poleM = mk(G.pole, M.pole);
      const clothMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.8, side: THREE.DoubleSide, map: o.flagTexture || null });
      this.ownMats.push(clothMat);
      this.clothM = mk(G.cloth, clothMat);
    }
    const pal = o.palette || {};
    const shirts = pal.shirts || CASUAL, pants = pal.pants || PANTS, skins = pal.skins || SKINS, hairs = pal.hairs || HAIRS;
    this.data = [];
    const c = new THREE.Color();
    for (let i = 0; i < count; i++) {
      const female = r() < 0.45, old = r() < 0.22;
      const d = {
        x: 0, y: 0, z: 0, rot: 0, pose: 0, phase: r() * 20, visible: true, scale: (female ? 0.94 : 1) * (0.93 + r() * 0.1),
        female, flag: r() < this.flagRatio, amp: 1,
      };
      this.data.push(d);
      const shirt = shirts[Math.floor(r() * shirts.length)];
      c.set(shirt); this.torsoM.setColorAt(i, c); this.armLM.setColorAt(i, c); this.armRM.setColorAt(i, c);
      c.set(pants[Math.floor(r() * pants.length)]); this.legLM.setColorAt(i, c); this.legRM.setColorAt(i, c);
      const skin = skins[Math.floor(Math.pow(r(), 1.7) * skins.length)];
      c.set(skin); this.headM.setColorAt(i, c); this.handM.setColorAt(i * 2, c); this.handM.setColorAt(i * 2 + 1, c);
      c.set(old ? '#bdbdbd' : hairs[Math.floor(r() * Math.min(7, hairs.length))]); this.hairM.setColorAt(i, c); this.hairLM.setColorAt(i, c);
      d.longHair = female && r() < 0.7;
      if (this.clothM) {
        const fc = o.flagColors ? o.flagColors[Math.floor(r() * o.flagColors.length)] : (o.flagTexture ? '#ffffff' : (o.flagColor || '#ffffff'));
        c.set(fc); this.clothM.setColorAt(i, c);
      }
    }
    for (const im of this.object3d.children) if (im.instanceColor) im.instanceColor.needsUpdate = true;
    // hierarquia auxiliar para calcular matrizes
    this._root = new THREE.Object3D();
    this._hips = new THREE.Object3D(); this._root.add(this._hips);
    this._torso = new THREE.Object3D(); this._hips.add(this._torso);
    this._head = new THREE.Object3D(); this._torso.add(this._head);
    this._skull = new THREE.Object3D(); this._skull.position.y = 0.115; this._head.add(this._skull);
    this._armL = new THREE.Object3D(); this._torso.add(this._armL);
    this._armR = new THREE.Object3D(); this._torso.add(this._armR);
    this._handR = new THREE.Object3D(); this._handR.position.y = -0.6; this._armR.add(this._handR);
    this._legL = new THREE.Object3D(); this._legL.position.set(0.092, 0, 0); this._hips.add(this._legL);
    this._legR = new THREE.Object3D(); this._legR.position.set(-0.092, 0, 0); this._hips.add(this._legR);
    this._zero = new THREE.Matrix4().makeScale(0, 0, 0);
    this._m = new THREE.Matrix4();
    this._v = new THREE.Vector3();
    this._q = new THREE.Quaternion();
    this._e = new THREE.Euler();
    this._s = new THREE.Vector3();
    this.cheerUntil = 0; this.cheerAmp = 1;
    this.update(0);
  }

  setTransform(i, x, y, z, rotY) { const d = this.data[i]; if (!d) return; d.x = x; d.y = y; d.z = z; d.rot = rotY; }
  setVisible(i, v) { const d = this.data[i]; if (d) d.visible = !!v; }
  setPose(i, pose, phase) { const d = this.data[i]; if (!d) return; d.pose = POSE_CODE[pose] ?? 0; if (phase !== undefined) d.phase = phase; }
  setAllPose(pose) { for (const d of this.data) d.pose = POSE_CODE[pose] ?? 0; }
  setCount(n) { this.drawCount = Math.max(0, Math.min(this.count, Math.round(n))); for (const im of this.object3d.children) im.count = im === this.handM ? this.drawCount * 2 : this.drawCount; }
  cheer(t, intensity = 1, dur = 2.2) { this.cheerUntil = t + dur; this.cheerAmp = Math.max(0.2, intensity); }

  update(t) {
    const n = this.drawCount;
    const cheering = t < this.cheerUntil;
    for (let i = 0; i < n; i++) {
      const d = this.data[i];
      if (!d.visible) { this._writeZero(i); continue; }
      let pose = d.pose;
      if (cheering && (pose === 0 || pose === 4)) pose = (i % 5 === 0) ? 5 : 1;
      const tt = t + d.phase;
      let bob = 0, armLx = 0, armLz = 0.1, armRx = 0, armRz = -0.1, legL = 0, legR = 0, hipsY = 0.88, headY = 0, headX = 0, hipsZ = 0;
      const amp = cheering ? this.cheerAmp : 1;
      if (pose === 1) { armLz = 2.6 + Math.sin(tt * 8) * 0.25 * amp; armRz = -2.6 - Math.sin(tt * 8 + 1) * 0.25 * amp; bob = Math.abs(Math.sin(tt * 6)) * 0.13 * amp; headX = -0.15; }
      else if (pose === 2) { const s = Math.sin(tt * 6.5); legL = s * 0.42; legR = -s * 0.42; armLx = -s * 0.4; armRx = s * 0.4; bob = Math.abs(Math.cos(tt * 6.5)) * 0.03; }
      else if (pose === 3) { hipsY = 0.47; legL = legR = -1.45; armLx = armRx = -0.5; hipsZ = -0.03; headY = Math.sin(tt * 0.4) * 0.2; }
      else if (pose === 5) { const c = Math.sin(tt * 15) * 0.5 + 0.5; armLx = armRx = -1.25; armLz = -0.22 - c * 0.2; armRz = 0.22 + c * 0.2; }
      else if (pose === 6) { armRz = -2.7 + Math.sin(tt * 9) * 0.3; }
      else { bob = Math.sin(tt * 1.7) * 0.006; headY = Math.sin(tt * 0.45) * 0.25; armLz = 0.1 + Math.sin(tt * 1.1) * 0.02; armRz = -0.1 - Math.sin(tt * 1.3) * 0.02; }
      if (d.flag && pose !== 1 && pose !== 3) { armRx = -0.55; armRz = -0.28; }
      this._root.position.set(d.x, d.y, d.z);
      this._root.rotation.set(0, d.rot, 0);
      this._root.scale.setScalar(d.scale);
      this._hips.position.set(0, hipsY + bob, hipsZ);
      this._torso.rotation.set(0, 0, 0);
      this._head.position.set(0, 0.665, 0);
      this._head.rotation.set(headX, headY, 0);
      this._armL.position.set(d.female ? 0.2 : 0.215, 0.555, 0); this._armL.rotation.set(armLx, 0, armLz);
      this._armR.position.set(d.female ? -0.2 : -0.215, 0.555, 0); this._armR.rotation.set(armRx, 0, armRz);
      this._legL.rotation.set(legL, 0, 0); this._legR.rotation.set(legR, 0, 0);
      this._root.updateMatrixWorld(true);
      this.torsoM.setMatrixAt(i, this._torso.matrixWorld);
      this.headM.setMatrixAt(i, this._skull.matrixWorld);
      if (d.longHair) { this.hairLM.setMatrixAt(i, this._skull.matrixWorld); this.hairM.setMatrixAt(i, this._zero); }
      else { this.hairM.setMatrixAt(i, this._skull.matrixWorld); this.hairLM.setMatrixAt(i, this._zero); }
      this.armLM.setMatrixAt(i, this._armL.matrixWorld);
      this.armRM.setMatrixAt(i, this._armR.matrixWorld);
      this.handM.setMatrixAt(i * 2, this._armL.matrixWorld);
      this.handM.setMatrixAt(i * 2 + 1, this._armR.matrixWorld);
      this.legLM.setMatrixAt(i, this._legL.matrixWorld);
      this.legRM.setMatrixAt(i, this._legR.matrixWorld);
      if (this.clothM) {
        if (d.flag) {
          this._handR.getWorldPosition(this._v);
          const sway = Math.sin(tt * 2.2) * 0.12 * (cheering ? 2 : 1);
          this._e.set(sway * 0.5, d.rot, sway);
          this._q.setFromEuler(this._e);
          this._s.setScalar(d.scale);
          this._m.compose(this._v, this._q, this._s);
          this.poleM.setMatrixAt(i, this._m);
          const top = this._top || (this._top = new THREE.Vector3());
          top.set(0, 1.12 * d.scale, 0).applyQuaternion(this._q).add(this._v);
          this._e.set(0, d.rot + Math.sin(tt * (cheering ? 7 : 3)) * 0.45 + Math.PI * 0.5, 0);
          this._q.setFromEuler(this._e);
          this._m.compose(top, this._q, this._s);
          this.clothM.setMatrixAt(i, this._m);
        } else { this.poleM.setMatrixAt(i, this._zero); this.clothM.setMatrixAt(i, this._zero); }
      }
    }
    for (const im of this.object3d.children) im.instanceMatrix.needsUpdate = true;
  }

  _writeZero(i) {
    for (const im of this.object3d.children) {
      if (im === this.handM) { im.setMatrixAt(i * 2, this._zero); im.setMatrixAt(i * 2 + 1, this._zero); }
      else im.setMatrixAt(i, this._zero);
    }
  }

  dispose() {
    for (const im of this.object3d.children) im.dispose();
    for (const m of this.ownMats) m.dispose();
    this.object3d.removeFromParent();
  }
}
