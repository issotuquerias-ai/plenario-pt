// Ruas e praças portuguesas para os mini-jogos de campanha: arruada, cartazes, comício e protesto.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Engine } from './engine.js';
import { Bag, rng, hashString, clamp, lerp, damp, dampAngle, easeInOut, mergeGeos, colorize, place, inferGender } from './util3d.js';
import * as TX from './materials.js';
import { makePerson, animatePerson, randomLook, Crowd, CASUAL } from './people.js';

const STYLES = {
  lisboa: { atlas: 'lisboa', roof: 'tile', roofColor: '#b65a36', ground: 'calcada', tree: 'round', lamp: 'lisboa', end: 'arch', sky: ['#4f86c6', '#a8c8e6', '#eef2f2'], sun: ['#fff1d6', 2.6], tram: true },
  porto: { atlas: 'porto', roof: 'tile', roofColor: '#a54a2e', ground: 'granite', tree: 'round', lamp: 'classic', end: 'church', churchTiles: true, sky: ['#6a8fb8', '#b9cde0', '#e8ecee'], sun: ['#fff0dc', 2.3] },
  norte: { atlas: 'norte', roof: 'tile', roofColor: '#9e4a30', ground: 'granite', tree: 'round', lamp: 'classic', end: 'church', pelourinho: true, sky: ['#5a88bf', '#aecbe5', '#eef1f0'], sun: ['#fff2dc', 2.4] },
  interior_norte: { atlas: 'interior_norte', roof: 'tile', roofColor: '#8f4630', ground: 'granite', tree: 'round', lamp: 'classic', end: 'church', pelourinho: true, sky: ['#5b8ac4', '#b2d0ea', '#f0f2ef'], sun: ['#fff2dc', 2.5] },
  centro: { atlas: 'centro', roof: 'tile', roofColor: '#b0532f', ground: 'calcada', tree: 'round', lamp: 'classic', end: 'church', fountain: true, sky: ['#4f86c6', '#a9cbe8', '#eef2f2'], sun: ['#fff1d6', 2.5] },
  interior_centro: { atlas: 'interior_centro', roof: 'tile', roofColor: '#a14d30', ground: 'granite', tree: 'round', lamp: 'classic', end: 'church', fountain: true, sky: ['#5389c6', '#adcde9', '#f0f2ef'], sun: ['#fff2da', 2.6] },
  alentejo: { atlas: 'alentejo', roof: 'tile', roofColor: '#b8613a', ground: 'calcada', tree: 'olive', lamp: 'classic', end: 'church', chimney: 'alentejo', sky: ['#3f7fcf', '#9cc4ea', '#f3efe4'], sun: ['#fff4dc', 3.1] },
  algarve: { atlas: 'algarve', roof: 'flat', roofColor: '#c26a3e', ground: 'calcada', tree: 'palm', lamp: 'modern', end: 'sea', chimney: 'algarve', sky: ['#3a7fd0', '#9ccaf0', '#f2f4f2'], sun: ['#fff5e0', 3.0] },
  ribatejo: { atlas: 'ribatejo', roof: 'tile', roofColor: '#ad5634', ground: 'calcada', tree: 'round', lamp: 'classic', end: 'church', sky: ['#5389c6', '#aecbe5', '#eef1f0'], sun: ['#fff1d6', 2.6] },
  setubal: { atlas: 'setubal', roof: 'tile', roofColor: '#ad5634', ground: 'calcada', tree: 'round', lamp: 'lisboa', end: 'fountain', sky: ['#4f86c6', '#a9c9e6', '#eef2f2'], sun: ['#fff1d6', 2.6] },
  ilhas: { atlas: 'ilhas', roof: 'tile', roofColor: '#9c4a32', ground: 'calcada', tree: 'hydrangea', lamp: 'classic', end: 'sea', sky: ['#5c8cc0', '#b5cfe4', '#eceff0'], sun: ['#fff0dc', 2.3] },
  emigracao: { atlas: 'emigracao', roof: 'mansard', roofColor: '#5d636b', ground: 'paving', tree: 'round', lamp: 'modern', end: 'fountain', sky: ['#6d90b8', '#bccfe0', '#eaedef'], sun: ['#fff2e0', 2.2] },
};
const STREET_NAMES = ['RUA DIREITA', 'RUA DO COMÉRCIO', 'RUA 25 DE ABRIL', 'RUA DA REPÚBLICA', 'RUA DE SANTO ANTÓNIO', 'RUA DA LIBERDADE', 'RUA DOS MERCADORES', 'RUA NOVA'];

export function createStreet(opts = {}) {
  const bag = new Bag();
  const styleKey = STYLES[opts.style] ? opts.style : 'lisboa';
  const ST = STYLES[styleKey];
  const mode = opts.mode || 'arruada';
  const seed = opts.seed ?? 1234;
  const r = rng(seed);
  const party = Object.assign({ id: 'p', short: 'P', color: '#2563eb', color2: '#ffffff', leaderName: 'Líder' }, opts.party || {});
  const rivals = opts.rivals || [];
  const quality = Engine.quality;
  const shadowsOn = quality !== 'low';
  const dusk = mode === 'comicio';

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 16 / 9, 0.1, 600);
  scene.environmentIntensity = dusk ? 0.25 : 0.5;
  const skyCols = dusk ? ['#1d2552', '#9a4f6a', '#f2a65a'] : ST.sky;
  scene.fog = new THREE.Fog(skyCols[2], dusk ? 60 : 90, dusk ? 220 : 320);
  scene.background = new THREE.Color(skyCols[1]);

  const addMesh = (geo, material, { cast = false, receive = true, parent = scene } = {}) => {
    bag.geo(geo); const m = new THREE.Mesh(geo, material);
    m.castShadow = cast && shadowsOn; m.receiveShadow = receive && shadowsOn; parent.add(m); return m;
  };

  // ---------------------------------------------------------------- céu e luz
  {
    const sky = new THREE.SphereGeometry(400, 32, 16);
    addMesh(sky, bag.mat(new THREE.MeshBasicMaterial({ map: TX.skyTexture(...skyCols), side: THREE.BackSide, fog: false, depthWrite: false })), { receive: false }).renderOrder = -10;
  }
  scene.add(new THREE.HemisphereLight(dusk ? '#8a7bb0' : '#dfeeff', dusk ? '#3a2a20' : '#b49a7a', dusk ? 0.55 : 0.85));
  const sun = new THREE.DirectionalLight(dusk ? '#ff9d5c' : ST.sun[0], dusk ? 1.3 : ST.sun[1]);
  const sunOffset = dusk ? new THREE.Vector3(-40, 14, -30) : new THREE.Vector3(-30, 48, 22);
  sun.position.copy(sunOffset); sun.target.position.set(0, 0, 0);
  sun.castShadow = shadowsOn;
  sun.shadow.mapSize.set(quality === 'high' ? 2048 : 1024, quality === 'high' ? 2048 : 1024);
  Object.assign(sun.shadow.camera, { left: -38, right: 38, top: 38, bottom: -38, near: 1, far: 160 });
  sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.04;
  scene.add(sun, sun.target);

  // ---------------------------------------------------------------- materiais
  const atlas = TX.facadeAtlas(ST.atlas, (seed % 3) + 1, quality === 'high' ? 2048 : 1024);
  const M = {
    body: bag.mat(new THREE.MeshStandardMaterial({ vertexColors: true, map: TX.plaster('#ffffff'), roughness: 0.92 })),
    facade: bag.mat(new THREE.MeshStandardMaterial({ map: atlas.texture, roughness: 0.82 })),
    roof: bag.mat(new THREE.MeshStandardMaterial({ map: TX.roofTiles(ST.roofColor), roughness: 0.8, vertexColors: true })),
    trim: bag.mat(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.65, metalness: 0.05 })),
    calcada: bag.mat(new THREE.MeshStandardMaterial({ map: TX.calcada('ondas'), roughness: 0.75 })),
    granite: bag.mat(new THREE.MeshStandardMaterial({ map: TX.stoneBlocks('#a19c92', 'paving'), roughness: 0.85 })),
    asphalt: bag.mat(new THREE.MeshStandardMaterial({ map: TX.asphalt(), roughness: 0.9 })),
    grass: bag.mat(new THREE.MeshStandardMaterial({ map: TX.grass(), roughness: 0.95 })),
    stone: bag.mat(new THREE.MeshStandardMaterial({ map: TX.marble('#e7e1d4', '#b7ad9c'), roughness: 0.55 })),
    metal: bag.mat(new THREE.MeshStandardMaterial({ color: '#23282c', roughness: 0.45, metalness: 0.7 })),
    white: bag.mat(new THREE.MeshStandardMaterial({ color: '#f1f1ee', roughness: 0.6 })),
    glass: bag.mat(new THREE.MeshStandardMaterial({ color: '#202a35', roughness: 0.1, metalness: 0.6 })),
    lampGlass: bag.mat(new THREE.MeshStandardMaterial({ color: '#fff4d0', emissive: '#ffd98a', emissiveIntensity: dusk ? 2.2 : 0.3, roughness: 0.3 })),
    inst: bag.mat(new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.8 })),
    foliage: bag.mat(new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.9, flatShading: true })),
    bark: bag.mat(new THREE.MeshStandardMaterial({ color: '#5b4330', roughness: 0.95 })),
    water: bag.mat(new THREE.MeshStandardMaterial({ color: '#2d6f9a', roughness: 0.12, metalness: 0.2 })),
  };
  const groundMat = ST.ground === 'granite' ? M.granite : ST.ground === 'paving' ? M.granite : M.calcada;

  function plane(w, d, x, z, mat, rep = 4, y = 0) {
    const g = new THREE.PlaneGeometry(w, d); g.rotateX(-Math.PI / 2); g.translate(x, y, z);
    const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w / rep, uv.getY(i) * d / rep);
    return addMesh(g, mat);
  }

  // ---------------------------------------------------------------- edifícios (geometria fundida)
  const B = { bodies: [], facades: [], roofs: [], trims: [] };
  const mtx = new THREE.Matrix4(), q = new THREE.Quaternion(), vS = new THREE.Vector3(1, 1, 1), vP = new THREE.Vector3();
  function roofPrism(W, D, h, overhang = 0.35) {
    const A = [-W / 2 - 0.15, 0, overhang], Bv = [W / 2 + 0.15, 0, overhang], R1 = [-W / 2 - 0.15, h, -D / 2], R2 = [W / 2 + 0.15, h, -D / 2], C = [-W / 2 - 0.15, 0, -D - overhang], Dv = [W / 2 + 0.15, 0, -D - overhang];
    const tris = [[A, Bv, R2], [A, R2, R1], [Dv, C, R1], [Dv, R1, R2], [A, R1, C], [Bv, Dv, R2]];
    const pos = [], uv = [];
    const sl = Math.hypot(h, D / 2 + overhang);
    for (const t of tris) for (const p of t) { pos.push(...p); uv.push(p[0] / 2, (p[1] / h) * sl / 1.5); }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.computeVertexNormals();
    return g;
  }
  /** Fila de edifícios ao longo do segmento p0→p1, com fachada virada para `n` (normal XZ). */
  function buildingRow(x0, z0, x1, z1, nx, nz, o = {}) {
    const len = Math.hypot(x1 - x0, z1 - z0);
    const dx = (x1 - x0) / len, dz = (z1 - z0) / len;
    const rot = Math.atan2(nx, nz);
    let s = 0;
    while (s < len - 2) {
      const cell = atlas.cells[Math.floor(r() * atlas.cells.length)];
      let W = cell.w, H = cell.h;
      if (s + W > len + 1) { W = len - s; if (W < 3) break; }
      const D = o.depth || 10;
      const cx = x0 + dx * (s + W / 2), cz = z0 + dz * (s + W / 2);
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rot);
      mtx.compose(vP.set(cx, 0, cz), q, vS);
      const body = new THREE.BoxGeometry(W, H, D); body.translate(0, H / 2, -D / 2); colorize(body, cell.wall); body.applyMatrix4(mtx); B.bodies.push(body);
      const f = new THREE.PlaneGeometry(W, H); f.translate(0, H / 2, 0.03);
      const uv = f.attributes.uv; const uw = (cell.u1 - cell.u0) * Math.min(1, W / cell.w);
      for (let i = 0; i < uv.count; i++) uv.setXY(i, cell.u0 + uv.getX(i) * uw, cell.v0 + uv.getY(i) * (cell.v1 - cell.v0));
      f.applyMatrix4(mtx); B.facades.push(f);
      if (ST.roof === 'tile' || ST.roof === 'mansard') {
        const rh = ST.roof === 'mansard' ? 2.6 : Math.min(2.6, D * 0.25);
        const rf = roofPrism(W, D, rh, ST.roof === 'mansard' ? 0.1 : 0.4); rf.translate(0, H, 0);
        colorize(rf, ST.roof === 'mansard' ? '#7a8088' : TX.shade('#ffffff', 0.85 + r() * 0.15)); rf.applyMatrix4(mtx); B.roofs.push(rf);
      } else {
        const sl = new THREE.BoxGeometry(W + 0.1, 0.3, D + 0.1); sl.translate(0, H + 0.15, -D / 2); colorize(sl, cell.wall); sl.applyMatrix4(mtx); B.trims.push(sl);
      }
      if (ST.chimney === 'alentejo' && r() < 0.8) {
        const ch = new THREE.BoxGeometry(1.0, 1.8, 0.7); ch.translate((r() - 0.5) * W * 0.6, H + 1.6, -D * 0.4); colorize(ch, '#fbfaf6'); ch.applyMatrix4(mtx); B.trims.push(ch);
      } else if (ST.chimney === 'algarve' && r() < 0.7) {
        const ox = (r() - 0.5) * W * 0.6;
        const ch = new THREE.BoxGeometry(0.6, 1.1, 0.6); ch.translate(ox, H + 0.85, -D * 0.5); colorize(ch, '#ffffff'); ch.applyMatrix4(mtx); B.trims.push(ch);
        const pyr = new THREE.ConeGeometry(0.45, 0.6, 4); pyr.rotateY(Math.PI / 4); pyr.translate(ox, H + 1.7, -D * 0.5); colorize(pyr, '#f3f3f0'); pyr.applyMatrix4(mtx); B.trims.push(pyr);
      }
      if (o.awnings && r() < 0.35 && H > 6) {
        const aw = new THREE.BoxGeometry(W * 0.75, 0.08, 1.3); aw.rotateX(0.32); aw.translate(0, 3.25, 0.62);
        colorize(aw, ['#9e2a2b', '#2f6b3f', '#2c4f7a', '#c98a2b', '#5b3a6b'][Math.floor(r() * 5)]); aw.applyMatrix4(mtx); B.trims.push(aw);
      }
      s += W;
    }
  }
  function flushBuildings() {
    if (B.bodies.length) addMesh(mergeGeos(B.bodies), M.body, { cast: true });
    if (B.facades.length) addMesh(mergeGeos(B.facades), M.facade, { cast: false });
    if (B.roofs.length) addMesh(mergeGeos(B.roofs), M.roof, { cast: true });
    if (B.trims.length) addMesh(mergeGeos(B.trims), M.trim, { cast: true });
    B.bodies = []; B.facades = []; B.roofs = []; B.trims = [];
  }

  // ---------------------------------------------------------------- adereços instanciados
  const props = { lamps: [], trees: [], benches: [], tables: [], umbrellas: [], cars: [] };
  function flushProps() {
    const m4 = new THREE.Matrix4(), qq = new THREE.Quaternion(), c = new THREE.Color();
    const mkInst = (geo, mat, list, colorFn, cast = true) => {
      if (!list.length) return null;
      bag.geo(geo);
      const im = new THREE.InstancedMesh(geo, mat, list.length);
      list.forEach((p, i) => {
        qq.setFromAxisAngle(new THREE.Vector3(0, 1, 0), p.rot || 0);
        m4.compose(new THREE.Vector3(p.x, p.y || 0, p.z), qq, new THREE.Vector3(p.s || 1, p.sy || p.s || 1, p.s || 1));
        im.setMatrixAt(i, m4);
        if (colorFn) { c.set(colorFn(p, i)); im.setColorAt(i, c); }
      });
      im.castShadow = cast && shadowsOn; im.receiveShadow = shadowsOn;
      scene.add(im); return im;
    };
    // candeeiros
    const lisbon = ST.lamp === 'lisboa';
    const lampGeo = mergeGeos([
      place(new THREE.CylinderGeometry(0.07, 0.12, 4.2, 8), { y: 2.1 }),
      place(new THREE.CylinderGeometry(0.2, 0.25, 0.4, 8), { y: 0.2 }),
      place(new THREE.BoxGeometry(0.06, 0.06, lisbon ? 0.9 : 1.2), { y: 4.15, z: lisbon ? 0.4 : 0.55 }),
      place(new THREE.ConeGeometry(lisbon ? 0.32 : 0.28, 0.3, lisbon ? 6 : 12), { y: 4.15, z: lisbon ? 0.85 : 1.15 }),
    ]);
    const glassGeo = lisbon ? place(new THREE.CylinderGeometry(0.22, 0.14, 0.45, 6), { y: 3.78, z: 0.85 }) : place(new THREE.CylinderGeometry(0.16, 0.16, 0.12, 12), { y: 3.95, z: 1.15 });
    mkInst(lampGeo, M.metal, props.lamps);
    mkInst(glassGeo, M.lampGlass, props.lamps, null, false);
    // árvores
    const byType = {};
    for (const t of props.trees) (byType[t.type] = byType[t.type] || []).push(t);
    for (const [type, list] of Object.entries(byType)) {
      if (type === 'palm') {
        mkInst(mergeGeos([place(new THREE.CylinderGeometry(0.16, 0.26, 6.5, 8), { y: 3.25, rz: 0.04 })]), M.bark, list);
        const fronds = [];
        for (let k = 0; k < 9; k++) { const a = k * Math.PI * 2 / 9; fronds.push(place(new THREE.BoxGeometry(0.5, 0.05, 3.0), { x: Math.sin(a) * 1.3, y: 6.3, z: Math.cos(a) * 1.3, ry: a, rx: 0.45 })); }
        mkInst(mergeGeos(fronds), M.foliage, list, () => '#3f7a35');
      } else if (type === 'hydrangea') {
        const bush = []; for (let k = 0; k < 6; k++) bush.push(place(new THREE.IcosahedronGeometry(0.55, 1), { x: Math.cos(k) * 0.6, y: 0.55 + (k % 2) * 0.3, z: Math.sin(k * 1.7) * 0.5 }));
        mkInst(mergeGeos(bush), M.foliage, list, (p, i) => i % 2 ? '#6b8fd6' : '#d77fb3');
      } else {
        const olive = type === 'olive';
        mkInst(place(new THREE.CylinderGeometry(olive ? 0.22 : 0.17, olive ? 0.32 : 0.24, olive ? 2.0 : 3.0, 7), { y: olive ? 1.0 : 1.5 }), M.bark, list);
        const blobs = [];
        const n = olive ? 5 : 4;
        for (let k = 0; k < n; k++) blobs.push(place(new THREE.IcosahedronGeometry(olive ? 1.2 : 1.5, 1), { x: Math.cos(k * 2.3) * 0.9, y: (olive ? 2.5 : 3.8) + (k % 2) * 0.6, z: Math.sin(k * 2.3) * 0.9 }));
        mkInst(mergeGeos(blobs), M.foliage, list, (p, i) => olive ? (i % 2 ? '#7d8c5a' : '#8a9866') : (i % 3 === 0 ? '#4c7d37' : i % 3 === 1 ? '#5a8a3e' : '#3f6e30'));
      }
    }
    // bancos
    mkInst(mergeGeos([place(new THREE.BoxGeometry(1.8, 0.08, 0.5), { y: 0.45 }), place(new THREE.BoxGeometry(1.8, 0.45, 0.06), { y: 0.72, z: -0.24, rx: -0.15 }), place(new THREE.BoxGeometry(0.08, 0.45, 0.5), { x: -0.8, y: 0.22 }), place(new THREE.BoxGeometry(0.08, 0.45, 0.5), { x: 0.8, y: 0.22 })]), M.inst, props.benches, () => '#6b4a2f');
    // esplanadas
    mkInst(mergeGeos([place(new THREE.CylinderGeometry(0.42, 0.42, 0.04, 14), { y: 0.74 }), place(new THREE.CylinderGeometry(0.04, 0.04, 0.72, 6), { y: 0.37 }), place(new THREE.CylinderGeometry(0.25, 0.25, 0.03, 10), { y: 0.015 }),
      place(new THREE.BoxGeometry(0.42, 0.05, 0.42), { x: 0.7, y: 0.45 }), place(new THREE.BoxGeometry(0.42, 0.45, 0.04), { x: 0.9, y: 0.7, ry: Math.PI / 2 }), place(new THREE.BoxGeometry(0.42, 0.05, 0.42), { x: -0.7, y: 0.45 }), place(new THREE.BoxGeometry(0.42, 0.45, 0.04), { x: -0.9, y: 0.7, ry: Math.PI / 2 })]), M.inst, props.tables, () => '#d9d9d6');
    mkInst(mergeGeos([place(new THREE.ConeGeometry(1.45, 0.55, 8, 1, true), { y: 2.45 }), place(new THREE.CylinderGeometry(0.03, 0.03, 2.4, 6), { y: 1.2 })]), bag.mat(new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.8, side: THREE.DoubleSide })), props.umbrellas, (p) => p.color);
    // carros
    if (props.cars.length) {
      mkInst(mergeGeos([place(new THREE.BoxGeometry(1.8, 0.62, 4.2), { y: 0.55 }), place(new THREE.BoxGeometry(1.7, 0.2, 1.0), { y: 0.95, z: 1.45 })]), M.inst, props.cars, (p) => p.color);
      mkInst(place(new THREE.BoxGeometry(1.62, 0.55, 2.2), { y: 1.13, z: -0.25 }), M.glass, props.cars);
      const wheels = []; for (const [x, z] of [[-0.85, 1.35], [0.85, 1.35], [-0.85, -1.35], [0.85, -1.35]]) wheels.push(place(new THREE.CylinderGeometry(0.33, 0.33, 0.24, 12), { x, y: 0.33, z, rz: Math.PI / 2 }));
      mkInst(mergeGeos(wheels), M.metal, props.cars);
    }
  }
  const carColors = ['#c0392b', '#ecf0f1', '#2c3e50', '#7f8c8d', '#2980b9', '#1e1e1e', '#d35400', '#bdc3c7', '#16a085'];

  // ---------------------------------------------------------------- peças finais (igreja, arco, chafariz, mar)
  function church(x, z, rotY = 0, tiles = false) {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rotY; scene.add(g);
    const wallC = '#f5f2ea';
    const parts = [];
    const add = (geo, color) => { colorize(geo, color); parts.push(geo); };
    add(place(new THREE.BoxGeometry(12, 13, 16), { y: 6.5, z: -8 }), wallC);
    add(place(new THREE.BoxGeometry(0.9, 13.4, 0.9), { x: -5.6, y: 6.7, z: 0.1 }), '#b9b1a3');
    add(place(new THREE.BoxGeometry(0.9, 13.4, 0.9), { x: 5.6, y: 6.7, z: 0.1 }), '#b9b1a3');
    const ped = new THREE.BufferGeometry();
    ped.setAttribute('position', new THREE.Float32BufferAttribute([-6.3, 13, 0.2, 6.3, 13, 0.2, 0, 17, 0.2, 6.3, 13, 0.2, 6.3, 13, -16, 0, 17, -16, 0, 17, -16, 0, 17, 0.2, 6.3, 13, 0.2, -6.3, 13, 0.2, 0, 17, 0.2, 0, 17, -16, -6.3, 13, 0.2, 0, 17, -16, -6.3, 13, -16], 3));
    ped.setAttribute('uv', new THREE.Float32BufferAttribute(new Array(15 * 2).fill(0), 2)); ped.computeVertexNormals();
    add(ped, '#b55a36');
    for (const sx of [-1, 1]) {
      add(place(new THREE.BoxGeometry(3.4, 20, 3.4), { x: sx * 7.2, y: 10, z: -1 }), wallC);
      add(place(new THREE.BoxGeometry(3.7, 0.4, 3.7), { x: sx * 7.2, y: 20, z: -1 }), '#b9b1a3');
      add(place(new THREE.ConeGeometry(2.4, 3.4, 4), { x: sx * 7.2, y: 21.9, z: -1, ry: Math.PI / 4 }), '#b55a36');
      add(place(new THREE.BoxGeometry(1.2, 2.2, 0.2), { x: sx * 7.2, y: 17, z: 0.75 }), '#2a2420');
    }
    add(place(new THREE.BoxGeometry(2.6, 4.4, 0.3), { y: 2.2, z: 0.12 }), '#5a3420');
    add(place(new THREE.BoxGeometry(3.4, 0.5, 0.5), { y: 4.6, z: 0.2 }), '#b9b1a3');
    add(place(new THREE.CylinderGeometry(1.2, 1.2, 0.2, 24), { y: 9.0, z: 0.1, rx: Math.PI / 2 }), '#2b3240');
    add(place(new THREE.BoxGeometry(0.25, 1.6, 0.25), { y: 17.6, z: 0.2 }), '#9a9286');
    add(place(new THREE.BoxGeometry(0.9, 0.22, 0.25), { y: 17.9, z: 0.2 }), '#9a9286');
    for (let k = 0; k < 3; k++) add(place(new THREE.BoxGeometry(5 + k * 1.2, 0.2, 0.6), { y: 0.1 + k * 0.0, z: 0.6 + k * 0.6 }), '#bdb5a8');
    addMesh(mergeGeos(parts), M.trim, { cast: true, parent: g });
    if (tiles) {
      const tex = TX.azulejo('#1d4e9a', '#f5f2ea', 0); const tm = bag.mat(new THREE.MeshStandardMaterial({ map: tex, roughness: 0.35 }));
      const p = new THREE.PlaneGeometry(10.2, 8); const uv = p.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 12, uv.getY(i) * 9);
      p.translate(0, 8.6, 0.06); addMesh(p, tm, { parent: g });
    }
    return g;
  }
  function arch(x, z) {
    const s = new THREE.Shape(); s.moveTo(-9, 0); s.lineTo(9, 0); s.lineTo(9, 18); s.lineTo(-9, 18); s.closePath();
    const h = new THREE.Path(); h.moveTo(-3.6, 0); h.lineTo(3.6, 0); h.lineTo(3.6, 9); h.absarc(0, 9, 3.6, 0, Math.PI, false); h.lineTo(-3.6, 0); s.holes.push(h);
    const g = new THREE.ExtrudeGeometry(s, { depth: 5, bevelEnabled: false, curveSegments: 20 }); g.translate(x, 0, z - 2.5);
    const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 0.15, uv.getY(i) * 0.15);
    addMesh(g, M.stone, { cast: true });
    const top = mergeGeos([place(new THREE.BoxGeometry(19, 0.8, 5.6), { y: 18.4 }), place(new THREE.BoxGeometry(12, 3.2, 4.4), { y: 20.4 }), place(new THREE.BoxGeometry(6, 2, 3.4), { y: 22.9 })]);
    top.translate(x, 0, z); addMesh(top, M.stone, { cast: true });
    for (const sx of [-6.2, 6.2]) { const c = new THREE.CylinderGeometry(0.55, 0.6, 16, 16); c.translate(x + sx, 8.6, z + 2.8); addMesh(c, M.stone, { cast: true }); }
    const st = new THREE.Group(); st.position.set(x, 23.9, z); scene.add(st);
    for (const sx of [-1.6, 0, 1.6]) { const p = makePerson({ skin: '#d9cfb8', hair: '#cfc6af', shirt: '#d9cfb8', jacket: '#d9cfb8', pants: '#d9cfb8', scale: 1.6, hairStyle: 'short' }); p.position.x = sx; st.add(p); if (sx === 0) animatePerson(p, 'wave', 0, 1); }
  }
  function fountain(x, z) {
    const parts = [];
    const ring = new THREE.CylinderGeometry(3.2, 3.4, 0.7, 32, 1, true); ring.translate(x, 0.35, z); parts.push(ring);
    const rim = new THREE.TorusGeometry(3.3, 0.18, 8, 40); rim.rotateX(Math.PI / 2); rim.translate(x, 0.72, z); parts.push(rim);
    const col = new THREE.CylinderGeometry(0.35, 0.5, 2.6, 16); col.translate(x, 1.3, z); parts.push(col);
    const bowl = new THREE.CylinderGeometry(1.3, 0.4, 0.5, 24); bowl.translate(x, 2.7, z); parts.push(bowl);
    const top = new THREE.SphereGeometry(0.35, 12, 10); top.translate(x, 3.3, z); parts.push(top);
    addMesh(mergeGeos(parts), M.stone, { cast: true });
    const w = new THREE.CircleGeometry(3.2, 32); w.rotateX(-Math.PI / 2); w.translate(x, 0.5, z); addMesh(w, M.water);
  }
  function pelourinho(x, z) {
    const parts = [];
    for (let k = 0; k < 3; k++) { const s = new THREE.CylinderGeometry(2 - k * 0.5, 2 - k * 0.5, 0.35, 8); s.translate(x, 0.17 + k * 0.35, z); parts.push(s); }
    const col = new THREE.CylinderGeometry(0.25, 0.3, 5, 10); col.translate(x, 3.5, z); parts.push(col);
    const cap = new THREE.SphereGeometry(0.55, 10, 8); cap.translate(x, 6.3, z); parts.push(cap);
    const cr = new THREE.BoxGeometry(0.15, 0.9, 0.15); cr.translate(x, 7.1, z); parts.push(cr);
    addMesh(mergeGeos(parts), M.granite, { cast: true });
  }
  let seaGeo = null;
  function sea(z) {
    seaGeo = new THREE.PlaneGeometry(600, 300, 60, 30); seaGeo.rotateX(-Math.PI / 2); seaGeo.translate(0, -0.6, z - 150);
    seaGeo.userData.base = seaGeo.attributes.position.array.slice();
    addMesh(seaGeo, M.water, { receive: false });
    const rail = []; for (let x = -24; x <= 24; x += 1.5) rail.push(place(new THREE.CylinderGeometry(0.05, 0.05, 1.0, 6), { x, y: 0.5, z }));
    rail.push(place(new THREE.BoxGeometry(48, 0.08, 0.1), { y: 1.0, z }));
    addMesh(mergeGeos(rail), M.metal);
  }

  // ---------------------------------------------------------------- placa toponímica (azulejo)
  function streetPlate(x, y, z, rotY, line1, line2) {
    const c = TX.makeCanvas(512, 256), g = c.getContext('2d');
    g.fillStyle = '#f7f5ee'; g.fillRect(0, 0, 512, 256);
    g.strokeStyle = '#1d4e9a'; g.lineWidth = 14; g.strokeRect(14, 14, 484, 228);
    g.lineWidth = 3; g.strokeRect(32, 32, 448, 192);
    g.strokeStyle = 'rgba(120,120,120,0.35)'; g.lineWidth = 1.5;
    for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(i * 128, 0); g.lineTo(i * 128, 256); g.stroke(); }
    g.beginPath(); g.moveTo(0, 128); g.lineTo(512, 128); g.stroke();
    g.fillStyle = '#1d4e9a'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = `800 50px ${TX.FONT}`; g.fillText(line1, 256, 104, 430);
    g.font = `600 34px ${TX.FONT}`; g.fillText(line2, 256, 170, 430);
    const tex = bag.tex(TX.toTexture(c));
    const p = new THREE.PlaneGeometry(1.6, 0.8); const m = addMesh(p, bag.mat(new THREE.MeshStandardMaterial({ map: tex, roughness: 0.3 })), { receive: false });
    m.position.set(x, y, z); m.rotation.y = rotY;
  }

  // ---------------------------------------------------------------- bandeiras e crachás
  const logoTex = TX.logoPlate(party.logo || null, party.short, party.color, { w: 384, h: 256 });
  const flagMat = bag.mat(new THREE.MeshStandardMaterial({ map: logoTex, roughness: 0.8, side: THREE.DoubleSide }));
  const flagGeo = bag.geo(new THREE.PlaneGeometry(0.75, 0.5, 8, 4)); flagGeo.translate(0.375, 0, 0);
  const poleGeo = bag.geo(new THREE.CylinderGeometry(0.014, 0.014, 1.5, 6)); poleGeo.translate(0, -0.75, 0);
  function giveFlag(person) {
    const P = person.userData.parts;
    const holder = new THREE.Group(); holder.position.y = -0.6; P.armR.add(holder);
    const pole = new THREE.Mesh(poleGeo, M.white); holder.add(pole);
    const cloth = new THREE.Mesh(flagGeo, flagMat); cloth.position.set(0, -1.25, 0); cloth.rotation.set(Math.PI, 0, 0); holder.add(cloth);
    person.userData.flag = cloth;
  }
  function makeSprite(tex, sx, sy) {
    const m = bag.mat(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
    const s = new THREE.Sprite(m); s.scale.set(sx, sy, 1); return s;
  }

  // ---------------------------------------------------------------- estado comum
  const ctrl = { scene, camera };
  let controls = null;
  const updaters = [];
  const disposers = [];
  let downAt = null;

  // =================================================================================== ARRUADA
  if (mode === 'arruada') {
    const Z0 = 14, ZC0 = -50.5, ZC1 = -59.5, ZE = -105;
    plane(14, Z0 - ZE + 2, 0, (Z0 + ZE) / 2, groundMat, 4);
    plane(140, 9, 0, (ZC0 + ZC1) / 2, M.asphalt, 6, 0.005);
    plane(46, 34, 0, ZE - 15, groundMat, 4, 0.002);
    plane(800, 800, 0, 0, ST.end === 'sea' ? M.calcada : M.asphalt, 8, -0.02);
    // passadeiras
    const zebra = []; for (let x = -6; x <= 6; x += 1.2) zebra.push(place(new THREE.BoxGeometry(0.6, 0.02, 3.2), { x, y: 0.02, z: ZC0 - 1.8 })), zebra.push(place(new THREE.BoxGeometry(0.6, 0.02, 3.2), { x, y: 0.02, z: ZC1 + 1.8 }));
    addMesh(mergeGeos(zebra), M.white);
    // passeios laterais da rua transversal
    for (const sx of [-1, 1]) {
      buildingRow(sx * 7, sx > 0 ? ZC0 : Z0 + 2, sx * 7, sx > 0 ? Z0 + 2 : ZC0, -sx, 0, { awnings: true });
      buildingRow(sx * 7, sx > 0 ? ZE : ZC1, sx * 7, sx > 0 ? ZC1 : ZE, -sx, 0, { awnings: true });
      buildingRow(sx * 70, ZC0, sx * 7.2, ZC0, 0, -1);
      buildingRow(sx * 7.2, ZC1, sx * 70, ZC1, 0, 1);
    }
    // praça final
    const PZ = ZE - 30;
    if (ST.end !== 'sea') {
      buildingRow(-23, PZ, -9, PZ, 0, 1); buildingRow(9, PZ, 23, PZ, 0, 1);
    }
    buildingRow(-23, ZE - 0.5, -23, PZ, 1, 0);
    buildingRow(23, PZ, 23, ZE - 0.5, -1, 0);
    buildingRow(-23, ZE, -7.2, ZE, 0, -1); buildingRow(7.2, ZE, 23, ZE, 0, -1);
    flushBuildings();
    if (ST.end === 'church') church(0, PZ + 1, 0, ST.churchTiles);
    else if (ST.end === 'arch') arch(0, PZ + 2);
    else if (ST.end === 'fountain') { church(0, PZ + 1); }
    else if (ST.end === 'sea') sea(PZ + 4);
    if (ST.fountain || ST.end === 'fountain') fountain(0, ZE - 13);
    if (ST.pelourinho) pelourinho(-8, ZE - 12);
    // adereços
    for (let z = Z0 - 4; z > ZE; z -= 12) { if (z < ZC0 + 3 && z > ZC1 - 3) continue; props.lamps.push({ x: -6.3, z, rot: Math.PI / 2 }, { x: 6.3, z: z - 6, rot: -Math.PI / 2 }); }
    const treeType = ST.tree;
    for (let z = Z0 - 10; z > ZE + 5; z -= 16) { if (z < ZC0 + 4 && z > ZC1 - 4) continue; props.trees.push({ x: -5.2, z, type: treeType, s: 0.8 + r() * 0.3 }, { x: 5.2, z: z - 8, type: treeType, s: 0.8 + r() * 0.3 }); }
    for (const [x, z] of [[-14, ZE - 6], [14, ZE - 6], [-16, ZE - 22], [16, ZE - 22]]) props.trees.push({ x, z, type: treeType === 'hydrangea' ? 'round' : treeType, s: 1.1 });
    for (let z = Z0 - 16; z > ZE; z -= 24) { if (z < ZC0 + 3 && z > ZC1 - 3) continue; props.benches.push({ x: -5.8, z, rot: Math.PI / 2 }, { x: 5.8, z: z - 12, rot: -Math.PI / 2 }); }
    const umbC = ['#9e2a2b', '#f0f0ea', '#2f6b3f', '#2c4f7a', '#c98a2b'];
    const cafes = [];
    for (const [x0, z0] of [[4.6, -14], [-4.6, -78]]) for (let k = 0; k < 4; k++) { const t = { x: x0, z: z0 - k * 3.2, rot: Math.PI / 2 }; props.tables.push(t); props.umbrellas.push({ x: x0, z: z0 - k * 3.2, color: umbC[(k + (x0 > 0 ? 0 : 2)) % umbC.length] }); cafes.push(t); }
    for (let x = -60; x <= 60; x += 6.5) { if (Math.abs(x) < 10) continue; if (r() < 0.75) props.cars.push({ x, z: ZC0 - 1.3 - (r() < 0.5 ? 0 : 6.4), rot: Math.PI / 2 + (r() < 0.5 ? 0 : Math.PI), color: carColors[Math.floor(r() * carColors.length)] }); }
    flushProps();
    streetPlate(-6.95, 3.4, Z0 - 2, Math.PI / 2, STREET_NAMES[seed % STREET_NAMES.length], (opts.town || '').toUpperCase());
    // elétrico de Lisboa
    let tram = null;
    if (ST.tram) {
      tram = new THREE.Group();
      const tc = TX.makeCanvas(512, 128), tg = tc.getContext('2d');
      tg.fillStyle = '#f2c230'; tg.fillRect(0, 0, 512, 128); tg.fillStyle = '#f4f1e6'; tg.fillRect(0, 0, 512, 50);
      for (let i = 0; i < 7; i++) { tg.fillStyle = '#26303a'; tg.fillRect(24 + i * 68, 12, 52, 34); }
      tg.fillStyle = '#c0392b'; tg.font = `800 22px ${TX.FONT}`; tg.fillText('28 PRAZERES', 180, 90);
      const tt = bag.tex(TX.toTexture(tc));
      const tm = bag.mat(new THREE.MeshStandardMaterial({ map: tt, roughness: 0.5 }));
      const body = new THREE.Mesh(bag.geo(new THREE.BoxGeometry(8.5, 2.6, 2.3)), [tm, tm, M.white, M.metal, tm, tm]); body.position.y = 1.7; body.castShadow = shadowsOn; tram.add(body);
      const roofT = new THREE.Mesh(bag.geo(new THREE.BoxGeometry(8.0, 0.25, 2.1)), M.metal); roofT.position.y = 3.1; tram.add(roofT);
      const pole = new THREE.Mesh(bag.geo(new THREE.CylinderGeometry(0.03, 0.03, 2.5, 5)), M.metal); pole.position.set(-1, 4.1, 0); pole.rotation.z = 0.7; tram.add(pole);
      tram.rotation.y = Math.PI / 2; tram.position.set(-70, 0, ZC0 - 4.5); scene.add(tram);
      const rails = []; for (const dz of [-0.7, 0.7]) rails.push(place(new THREE.BoxGeometry(140, 0.04, 0.1), { y: 0.02, z: ZC0 - 4.5 + dz }));
      addMesh(mergeGeos(rails), M.metal);
    }

    // --- líder e comitiva
    const leaderLook = randomLook(hashString(party.leaderName), { gender: inferGender(party.leaderName), formal: true, oldRatio: 0.1 });
    const leader = makePerson({ ...leaderLook, tie: party.color, detail: 'high' });
    leader.position.set(0, 0, Z0 - 3); leader.rotation.y = Math.PI;
    leader.traverse(o => { if (o.isMesh) o.castShadow = shadowsOn; });
    scene.add(leader);
    const badge = makeSprite(bag.tex(TX.badgeTexture(party.leaderPhoto || null, party.leaderName, party.color)), 1.25, 1.56);
    badge.position.set(0, 2.75, 0); leader.add(badge);
    let leaderTarget = null;
    const followers = [];
    const tshirt = party.color;
    function addFollowerAt(x, z) {
      const lk = randomLook(Math.floor(r() * 1e9), { formal: false });
      const p = makePerson({ ...lk, shirt: tshirt, jacket: null, tie: party.color2 || '#ffffff' });
      p.position.set(x, 0, z); p.rotation.y = Math.PI;
      giveFlag(p); p.traverse(o => { if (o.isMesh) o.castShadow = shadowsOn; });
      scene.add(p);
      followers.push({ p, idx: followers.length, lat: (followers.length % 2 ? 1 : -1) * (0.7 + (followers.length % 3) * 0.45), moving: false });
      return p;
    }
    for (let i = 0; i < 4; i++) addFollowerAt((i % 2 ? 1 : -1) * 1.2, Z0 + 0.5 + i * 0.9);

    // --- cidadãos
    const npcs = [];
    const nCount = opts.npcCount ?? 26;
    const casualPal = CASUAL;
    function spawnNpc(kind, x, z, sit = null) {
      const old = kind === 'elder', young = kind === 'young';
      const lk = randomLook(Math.floor(r() * 1e9), { formal: kind === 'journalist' ? false : r() < 0.3, oldRatio: old ? 1 : 0 });
      if (young) { lk.shirt = casualPal[Math.floor(r() * casualPal.length)]; lk.jacket = r() < 0.3 ? casualPal[Math.floor(r() * casualPal.length)] : null; lk.scale *= 0.96; }
      if (old) { lk.jacket = ['#5b4a3a', '#3b3f45', '#6b6b6b', '#2f3b52'][Math.floor(r() * 4)]; lk.scale *= 0.95; }
      const p = makePerson({ ...lk, prop: kind === 'journalist' ? (r() < 0.5 ? 'camera' : 'mic') : null, micColor: '#d4202b' });
      p.position.set(x, 0, z); p.rotation.y = r() * Math.PI * 2;
      p.traverse(o => { if (o.isMesh) o.castShadow = shadowsOn; });
      scene.add(p);
      const id = 'npc' + npcs.length;
      p.userData.npcId = id;
      const npc = { id, kind, p, state: sit ? 'sit' : 'idle', timer: r() * 3, target: null, speed: old ? 0.7 : young ? 1.3 : 1.0, marker: null, markerKind: null, sit };
      if (sit) { p.position.set(sit.x, 0, sit.z); p.rotation.y = sit.rot; }
      npcs.push(npc);
      return npc;
    }
    for (let i = 0; i < nCount; i++) {
      const kind = r() < 0.28 ? 'elder' : r() < 0.35 ? 'young' : 'citizen';
      const side = r() < 0.5 ? -1 : 1;
      spawnNpc(kind, side * (3 + r() * 2.6), Z0 - 8 - r() * (Z0 - ZE - 12));
    }
    cafes.slice(0, 5).forEach((t, k) => spawnNpc(k % 2 ? 'elder' : 'citizen', 0, 0, { x: t.x + (k % 2 ? 0.7 : -0.7) * 0, z: t.z + (k % 2 ? 0.7 : -0.7), rot: k % 2 ? Math.PI : 0 }));
    const journalists = [spawnNpc('journalist', 2.5, Z0 - 7), spawnNpc('journalist', -2.5, Z0 - 8)];
    journalists.forEach((j, k) => { j.state = 'follow'; j.side = k ? -1 : 1; j.speed = 2.2; });
    const npcById = Object.fromEntries(npcs.map(n => [n.id, n]));

    // --- textos flutuantes
    const flashes = [];
    function flash(text, color = '#ffffff') {
      const tex = TX.textTexture([String(text)], { w: 512, h: 128, fg: color, shadow: 'rgba(0,0,0,0.65)', weight: '900' });
      bag.tex(tex);
      const sp = makeSprite(tex, 2.4, 0.6);
      sp.position.copy(leader.position).add(new THREE.Vector3(0, 3.4, 0));
      scene.add(sp); flashes.push({ sp, t: 0 });
    }

    // --- interações
    let greetState = null;
    const walkMin = -5.4, walkMax = 5.4;
    function clampWalk(x, z) {
      z = clamp(z, ZE - 22, Z0);
      const wide = z < ZE - 1 || (z < ZC0 && z > ZC1);
      x = clamp(x, wide ? -20 : walkMin, wide ? 20 : walkMax);
      return [x, z];
    }
    Object.assign(ctrl, {
      getNpcs: () => npcs.map(n => ({ id: n.id, x: n.p.position.x, z: n.p.position.z, kind: n.kind === 'journalist' ? 'journalist' : n.kind })),
      setNpcMarker(id, marker) {
        const n = npcById[id]; if (!n) return;
        if (n.marker) { n.p.remove(n.marker); n.marker.material.dispose(); n.marker = null; }
        n.markerKind = marker || null;
        if (marker) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: TX.markerTexture(marker), transparent: true, depthWrite: false })); sp.scale.set(0.55, 0.55, 1); sp.position.y = 2.25; n.p.add(sp); n.marker = sp; }
      },
      moveLeaderTo(x, z) { const [cx, cz] = clampWalk(x, z); leaderTarget = new THREE.Vector3(cx, 0, cz); },
      leaderPosition: () => ({ x: leader.position.x, z: leader.position.z }),
      distanceToNpc(id) { const n = npcById[id]; return n ? Math.hypot(n.p.position.x - leader.position.x, n.p.position.z - leader.position.z) : Infinity; },
      greet(id, outcome = 'handshake') {
        const n = npcById[id]; if (!n) return Promise.resolve();
        if (greetState) greetState.res();
        leaderTarget = null;
        return new Promise((res) => { greetState = { n, outcome, t: 0, phase: 'approach', res, prevState: n.state }; n.state = 'greet'; });
      },
      addFollower() { const lp = leader.position; addFollowerAt(lp.x + (r() - 0.5) * 2, lp.z + 2 + r()); },
      flash,
      get followerCount() { return followers.length; },
    });

    camera.position.set(0, 14, Z0 + 18); camera.lookAt(0, 1, Z0 - 10);
    const camTarget = new THREE.Vector3(0, 1, Z0 - 8);
    const tmpV = new THREE.Vector3();

    ctrl.onPointer = (type, p) => {
      if (type === 'pointerdown') downAt = { x: p.clientX, y: p.clientY };
      const pick = () => {
        const hits = Engine.raycast(camera, p, npcs.map(n => n.p), true);
        for (const h of hits) { let o = h.object; while (o && !o.userData.npcId) o = o.parent; if (o) return o.userData.npcId; }
        return null;
      };
      if (type === 'pointermove') Engine.setCursor(pick() ? 'pointer' : '');
      if (type === 'click') {
        if (downAt && Math.hypot(p.clientX - downAt.x, p.clientY - downAt.y) > 6) return;
        const id = pick();
        if (id) { opts.onNpcClick?.(id); return; }
        const ray = Engine.ray(camera, p);
        const hit = ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), tmpV);
        if (hit) opts.onGroundClick?.({ x: hit.x, z: hit.z });
      }
    };

    let tramX = -70;
    updaters.push((dt, t) => {
      const blend = 1 - Math.exp(-dt * 10);
      // líder
      let leaderPose = 'idle';
      if (greetState) {
        const g = greetState, n = g.n;
        const np = n.p.position, lp = leader.position;
        const dist = Math.hypot(np.x - lp.x, np.z - lp.z);
        const ang = Math.atan2(np.x - lp.x, np.z - lp.z);
        if (g.phase === 'approach') {
          g.t += dt;
          if (dist > 1.25 && g.t < 4) {
            leader.rotation.y = dampAngle(leader.rotation.y, ang, 10, dt);
            const sp = Math.min(dist - 1.15, 2.0 * dt);
            lp.x += Math.sin(ang) * sp; lp.z += Math.cos(ang) * sp; leaderPose = 'walk';
          } else { g.phase = 'act'; g.t = 0; }
        } else {
          g.t += dt;
          leader.rotation.y = dampAngle(leader.rotation.y, ang, 10, dt);
          n.p.rotation.y = dampAngle(n.p.rotation.y, (g.outcome === 'reject' && g.t > 0.4) ? ang : ang + Math.PI, 8, dt);
          const o = g.outcome;
          leaderPose = o === 'hug' ? 'hug' : o === 'handshake' ? 'shake' : o === 'reject' ? 'wave' : 'idle';
          n.pose = o === 'hug' ? (g.t < 0.7 ? 'hug' : 'happy') : o === 'handshake' ? (g.t < 0.8 ? 'shake' : 'happy') : o === 'heckle' ? 'angry' : (g.t < 0.4 ? 'idle' : 'walk');
          if (o === 'reject' && g.t > 0.4) { np.x -= Math.sin(ang) * dt * 1.2 * -1; np.z -= Math.cos(ang) * dt * 1.2 * -1; }
          if (g.t > 1.25) {
            n.state = n.sit ? 'sit' : (o === 'reject' || o === 'heckle') ? 'flee' : 'idle';
            if (n.state === 'flee') { n.timer = 2.5; n.target = new THREE.Vector3(np.x + Math.sin(ang) * 6, 0, np.z + Math.cos(ang) * 6); }
            n.timer = n.state === 'idle' ? 1.5 : n.timer;
            greetState = null; g.res();
          }
        }
      } else if (leaderTarget) {
        const lp = leader.position;
        const dx = leaderTarget.x - lp.x, dz = leaderTarget.z - lp.z, d = Math.hypot(dx, dz);
        if (d < 0.08) leaderTarget = null;
        else {
          const sp = Math.min(d, 1.9 * dt);
          lp.x += dx / d * sp; lp.z += dz / d * sp;
          leader.rotation.y = dampAngle(leader.rotation.y, Math.atan2(dx, dz), 10, dt);
          leaderPose = 'walk';
        }
      }
      animatePerson(leader, leaderPose, t, blend);
      // comitiva
      const lp = leader.position;
      const fwd = new THREE.Vector3(Math.sin(leader.rotation.y), 0, Math.cos(leader.rotation.y));
      const side = new THREE.Vector3(fwd.z, 0, -fwd.x);
      followers.forEach((f, i) => {
        const row = Math.floor(i / 2);
        const tx = lp.x - fwd.x * (1.6 + row * 0.95) + side.x * f.lat, tz = lp.z - fwd.z * (1.6 + row * 0.95) + side.z * f.lat;
        const dx = tx - f.p.position.x, dz = tz - f.p.position.z, d = Math.hypot(dx, dz);
        let pose = 'idle';
        if (d > 0.25) { const sp = Math.min(d, (d > 2 ? 2.6 : 1.9) * dt); f.p.position.x += dx / d * sp; f.p.position.z += dz / d * sp; f.p.rotation.y = dampAngle(f.p.rotation.y, Math.atan2(dx, dz), 8, dt); pose = 'walk'; }
        else f.p.rotation.y = dampAngle(f.p.rotation.y, leader.rotation.y, 4, dt);
        animatePerson(f.p, pose, t + i, blend);
        f.p.userData.parts.armR.rotation.x = -2.75 + Math.sin(t * 2 + i) * 0.12;
        f.p.userData.parts.armR.rotation.z = -0.15;
        if (f.p.userData.flag) f.p.userData.flag.rotation.y = Math.sin(t * 3 + i) * 0.35;
      });
      // cidadãos
      for (const n of npcs) {
        const p = n.p.position;
        if (n.state === 'greet') { animatePerson(n.p, n.pose || 'idle', t, blend); continue; }
        if (n.state === 'sit') { animatePerson(n.p, 'sit', t, blend); continue; }
        if (n.state === 'follow') {
          const tx = lp.x + fwd.x * 3.6 + side.x * n.side * 2.2, tz = lp.z + fwd.z * 3.6 + side.z * n.side * 2.2;
          const dx = tx - p.x, dz = tz - p.z, d = Math.hypot(dx, dz);
          let pose = 'idle';
          if (d > 0.4) { const sp = Math.min(d, n.speed * dt * (d > 3 ? 1.4 : 1)); p.x += dx / d * sp; p.z += dz / d * sp; pose = 'walk'; }
          n.p.rotation.y = dampAngle(n.p.rotation.y, Math.atan2(lp.x - p.x, lp.z - p.z), 6, dt);
          animatePerson(n.p, pose, t, blend);
          continue;
        }
        n.timer -= dt;
        if (n.state === 'idle' && n.timer <= 0) {
          const sideX = (p.x < 0 ? -1 : 1) * (2.8 + r() * 2.8);
          const [tx, tz] = clampWalk(r() < 0.15 ? -sideX : sideX, p.z + (r() - 0.5) * 16);
          n.target = new THREE.Vector3(tx, 0, tz); n.state = 'walk';
        }
        let pose = 'idle';
        if ((n.state === 'walk' || n.state === 'flee') && n.target) {
          const dx = n.target.x - p.x, dz = n.target.z - p.z, d = Math.hypot(dx, dz);
          if (d < 0.2 || (n.state === 'flee' && n.timer <= 0)) { n.state = 'idle'; n.timer = 1 + r() * 4; }
          else {
            const sp = Math.min(d, n.speed * (n.state === 'flee' ? 1.6 : 1) * dt);
            p.x += dx / d * sp; p.z += dz / d * sp; n.p.rotation.y = dampAngle(n.p.rotation.y, Math.atan2(dx, dz), 6, dt); pose = 'walk';
          }
        }
        // afastar-se ligeiramente do líder
        const ldx = p.x - lp.x, ldz = p.z - lp.z, ld = Math.hypot(ldx, ldz);
        if (ld < 0.9 && ld > 0.001) { p.x += ldx / ld * dt * 0.8; p.z += ldz / ld * dt * 0.8; }
        animatePerson(n.p, pose, t, blend);
        if (n.marker) n.marker.position.y = 2.25 + Math.sin(t * 3 + p.x) * 0.06;
      }
      // textos
      for (let i = flashes.length - 1; i >= 0; i--) {
        const f = flashes[i]; f.t += dt;
        f.sp.position.y += dt * 0.8; f.sp.material.opacity = 1 - Math.max(0, (f.t - 0.6) / 0.9);
        if (f.t > 1.5) { scene.remove(f.sp); f.sp.material.map.dispose(); f.sp.material.dispose(); flashes.splice(i, 1); }
      }
      // elétrico
      if (tram) { tramX += dt * 6; if (tramX > 75) tramX = -75 - r() * 60; tram.position.x = tramX; }
      // câmara
      const desired = tmpV.set(lp.x * 0.55, 7.2, lp.z + 10.5);
      camera.position.x = damp(camera.position.x, desired.x, 3, dt);
      camera.position.y = damp(camera.position.y, desired.y, 2, dt);
      camera.position.z = damp(camera.position.z, desired.z, 3, dt);
      camTarget.x = damp(camTarget.x, lp.x * 0.75, 4, dt); camTarget.z = damp(camTarget.z, lp.z - 5, 4, dt); camTarget.y = 1.2;
      camera.lookAt(camTarget);
      sun.position.copy(lp).add(sunOffset); sun.target.position.copy(lp);
    });
  }

  // =================================================================================== CARTAZES
  const slots = [];
  if (mode === 'cartazes') {
    plane(900, 900, 0, 0, M.grass, 6, -0.03);
    // rotunda
    const ringRoad = new THREE.RingGeometry(8, 15.5, 72, 1); ringRoad.rotateX(-Math.PI / 2); ringRoad.translate(0, 0.01, 0);
    const ru = ringRoad.attributes.uv; for (let i = 0; i < ru.count; i++) ru.setXY(i, ru.getX(i) * 8, ru.getY(i) * 8);
    addMesh(ringRoad, M.asphalt);
    const side = new THREE.RingGeometry(15.5, 18.2, 72, 1); side.rotateX(-Math.PI / 2); side.translate(0, 0.03, 0);
    const su = side.attributes.uv; for (let i = 0; i < su.count; i++) su.setXY(i, su.getX(i) * 9, su.getY(i) * 9);
    addMesh(side, groundMat);
    const island = new THREE.CircleGeometry(8, 64); island.rotateX(-Math.PI / 2); island.translate(0, 0.15, 0);
    const iu = island.attributes.uv; for (let i = 0; i < iu.count; i++) iu.setXY(i, iu.getX(i) * 4, iu.getY(i) * 4);
    addMesh(island, M.grass);
    const curb = new THREE.CylinderGeometry(8.05, 8.05, 0.3, 64, 1, true); curb.translate(0, 0.05, 0); addMesh(curb, M.white);
    const dashes = []; for (let k = 0; k < 40; k++) { const a = k * Math.PI * 2 / 40; dashes.push(place(new THREE.BoxGeometry(0.15, 0.02, 1.4), { x: Math.cos(a) * 11.8, y: 0.03, z: Math.sin(a) * 11.8, ry: -a })); }
    addMesh(mergeGeos(dashes), M.white);
    // monumento: esfera armilar
    {
      const ped = mergeGeos([place(new THREE.BoxGeometry(2.6, 3.2, 2.6), { y: 1.6 }), place(new THREE.BoxGeometry(3.2, 0.4, 3.2), { y: 0.2 })]);
      addMesh(ped, M.stone, { cast: true });
      const bronze = bag.mat(new THREE.MeshStandardMaterial({ color: '#b08d57', roughness: 0.35, metalness: 0.85 }));
      const sph = [];
      for (const [rx, ry] of [[0, 0], [Math.PI / 2, 0], [Math.PI / 2, Math.PI / 2], [0.4, 0.9], [Math.PI / 2 + 0.41, 0]]) sph.push(place(new THREE.TorusGeometry(2.1, 0.09, 8, 48), { y: 5.6, rx, ry }));
      sph.push(place(new THREE.CylinderGeometry(0.06, 0.06, 5.2, 6), { y: 5.6, rz: 0.41 }));
      addMesh(mergeGeos(sph), bronze, { cast: true });
      const flowers = []; for (let k = 0; k < 28; k++) { const a = k * Math.PI * 2 / 28; flowers.push(place(new THREE.IcosahedronGeometry(0.45, 0), { x: Math.cos(a) * 6.3, y: 0.4, z: Math.sin(a) * 6.3 })); }
      const fl = mergeGeos(flowers); addMesh(fl, bag.mat(new THREE.MeshStandardMaterial({ color: '#d0466a', roughness: 0.8, flatShading: true })));
    }
    // avenidas
    for (let k = 0; k < 4; k++) {
      const a = k * Math.PI / 2; const dirX = Math.cos(a), dirZ = Math.sin(a);
      const road = new THREE.PlaneGeometry(10, 90); road.rotateX(-Math.PI / 2); road.translate(0, 0.008, -(15.5 + 45)); road.rotateY(-a + Math.PI / 2);
      const uv = road.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 2, uv.getY(i) * 18);
      addMesh(road, M.asphalt);
      for (const sd of [-1, 1]) {
        const sw = new THREE.PlaneGeometry(4, 88); sw.rotateX(-Math.PI / 2); sw.translate(sd * 7, 0.03, -(17 + 44)); sw.rotateY(-a + Math.PI / 2);
        const sv = sw.attributes.uv; for (let i = 0; i < sv.count; i++) sv.setXY(i, sv.getX(i), sv.getY(i) * 22);
        addMesh(sw, groundMat);
        // edifícios ao longo da avenida
        const px = -dirZ * sd, pz = dirX * sd; // perpendicular
        const ax = dirX, az = dirZ;
        const x0 = ax * 32 + px * 9, z0 = az * 32 + pz * 9, x1 = ax * 100 + px * 9, z1 = az * 100 + pz * 9;
        if (sd > 0) buildingRow(x1, z1, x0, z0, -px, -pz, { awnings: true }); else buildingRow(x0, z0, x1, z1, -px, -pz, { awnings: true });
        for (let d = 24; d < 100; d += 14) props.lamps.push({ x: ax * d + px * 5.6, z: az * d + pz * 5.6, rot: Math.atan2(-px, -pz) });
        for (let d = 30; d < 100; d += 12) props.trees.push({ x: ax * d + px * 7.5, z: az * d + pz * 7.5, type: ST.tree === 'hydrangea' ? 'round' : ST.tree, s: 0.8 });
      }
      // zebra
      const zb = []; for (let x = -4.4; x <= 4.4; x += 1.1) zb.push(place(new THREE.BoxGeometry(0.55, 0.02, 3), { x, y: 0.03, z: -20 }));
      const zg = mergeGeos(zb); zg.rotateY(-a + Math.PI / 2); addMesh(zg, M.white);
    }
    flushBuildings();
    for (let k = 0; k < 4; k++) { const a = Math.PI / 4 + k * Math.PI / 2; for (const rr of [27, 34]) props.trees.push({ x: Math.cos(a + 0.25) * rr, z: Math.sin(a + 0.25) * rr, type: ST.tree === 'hydrangea' ? 'round' : ST.tree, s: 1 }); }
    // carros a circular
    const movingCars = [];
    const carGeo = bag.geo(mergeGeos([place(new THREE.BoxGeometry(1.8, 0.62, 4.2), { y: 0.55 }), place(new THREE.BoxGeometry(1.62, 0.55, 2.2), { y: 1.13, z: -0.25 })]));
    for (let i = 0; i < 6; i++) {
      const m = new THREE.Mesh(carGeo, bag.mat(new THREE.MeshStandardMaterial({ color: carColors[i % carColors.length], roughness: 0.35, metalness: 0.4 })));
      m.castShadow = shadowsOn; scene.add(m);
      movingCars.push({ m, a: i * Math.PI / 3, rr: i % 2 ? 10.3 : 13.3, sp: 0.18 + (i % 3) * 0.04 });
    }
    // espaços publicitários
    const SL = [];
    const outLabels = ['Outdoor da rotunda — entrada norte', 'Outdoor da rotunda — entrada sul', 'Outdoor junto ao supermercado', 'Outdoor da saída para a autoestrada'];
    const mupiLabels = ['Mupi da Avenida da República', 'Mupi junto à escola', 'Mupi da paragem de autocarro', 'Mupi do mercado municipal'];
    const posteLabels = ['Poste da passadeira', 'Poste da paragem', 'Poste junto ao café', 'Poste da farmácia'];
    const outVis = [5, 5, 4, 4], outCost = [3500, 3200, 2400, 1800];
    for (let k = 0; k < 4; k++) { const a = Math.PI / 4 + k * Math.PI / 2; SL.push({ kind: 'outdoor', x: Math.cos(a) * 23, z: Math.sin(a) * 23, face: Math.atan2(-Math.cos(a), -Math.sin(a)), label: outLabels[k], visibility: outVis[k], cost: outCost[k] }); }
    const mupiVis = [3, 3, 2, 2], mupiCost = [700, 600, 420, 300];
    for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2; const dirX = Math.cos(a), dirZ = Math.sin(a); const px = -dirZ, pz = dirX; SL.push({ kind: 'mupi', x: dirX * 26 + px * 6.2, z: dirZ * 26 + pz * 6.2, face: Math.atan2(dirX, dirZ), label: mupiLabels[k], visibility: mupiVis[k], cost: mupiCost[k] }); }
    const posteVis = [2, 2, 1, 1], posteCost = [120, 90, 60, 40];
    for (let k = 0; k < 4; k++) { const a = 0.35 + k * Math.PI / 2; SL.push({ kind: 'poste', x: Math.cos(a) * 17.2, z: Math.sin(a) * 17.2, face: Math.atan2(Math.cos(a), Math.sin(a)), label: posteLabels[k], visibility: posteVis[k], cost: posteCost[k] }); props.lamps.push({ x: Math.cos(a) * 17.2, z: Math.sin(a) * 17.2, rot: Math.atan2(-Math.cos(a), -Math.sin(a)) }); }
    flushProps();
    const frameMat = bag.mat(new THREE.MeshStandardMaterial({ color: '#2a2e33', roughness: 0.5, metalness: 0.5 }));
    const occupiedIdx = new Set();
    if (rivals.length) { const pool = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].sort(() => r() - 0.5); pool.slice(0, 5).forEach(i => occupiedIdx.add(i)); }
    let rivalK = 0;
    SL.forEach((s, i) => {
      const g = new THREE.Group(); g.position.set(s.x, 0, s.z); g.rotation.y = s.face; scene.add(g);
      let w, h, y, cw, ch;
      if (s.kind === 'outdoor') {
        w = 8; h = 8 / 3; y = 5.2; cw = 1536; ch = 512;
        const st = mergeGeos([place(new THREE.CylinderGeometry(0.16, 0.2, 5.4, 10), { x: -2.4, y: 2.7, z: -0.25 }), place(new THREE.CylinderGeometry(0.16, 0.2, 5.4, 10), { x: 2.4, y: 2.7, z: -0.25 }),
          place(new THREE.BoxGeometry(w + 0.4, h + 0.4, 0.3), { y, z: -0.18 }), place(new THREE.BoxGeometry(w + 0.2, 0.1, 0.8), { y: y - h / 2 - 0.25, z: 0.2 })]);
        const sm = addMesh(st, frameMat, { cast: true, parent: g });
        for (const lx of [-2.6, 0, 2.6]) { const lamp = new THREE.Mesh(bag.geo(new THREE.BoxGeometry(0.5, 0.12, 0.25)), M.lampGlass); lamp.position.set(lx, y + h / 2 + 0.35, 0.5); g.add(lamp); }
        void sm;
      } else if (s.kind === 'mupi') {
        w = 1.2; h = 1.8; y = 1.45; cw = 512; ch = 768;
        addMesh(mergeGeos([place(new THREE.BoxGeometry(1.45, 2.3, 0.28), { y: 1.45, z: -0.06 }), place(new THREE.BoxGeometry(0.5, 0.3, 0.4), { y: 0.15 })]), frameMat, { cast: true, parent: g });
      } else {
        w = 0.6; h = 0.9; y = 2.7; cw = 400; ch = 600;
        g.position.add(new THREE.Vector3(Math.sin(s.face) * 0.14, 0, Math.cos(s.face) * 0.14));
      }
      const canvas = TX.makeCanvas(cw, ch);
      const tex = bag.tex(TX.toTexture(canvas));
      const pm = bag.mat(new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6, emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: s.kind === 'mupi' ? 0.35 : 0.05 }));
      const poster = new THREE.Mesh(bag.geo(new THREE.PlaneGeometry(w, h)), pm);
      poster.position.set(0, y, 0.01); poster.castShadow = false; g.add(poster);
      const hl = new THREE.Mesh(bag.geo(new THREE.PlaneGeometry(w + 0.3, h + 0.3)), bag.mat(new THREE.MeshBasicMaterial({ color: '#ffd400', transparent: true, opacity: 0, depthWrite: false, toneMapped: false })));
      hl.position.set(0, y, -0.005); g.add(hl);
      poster.userData.slotId = 'slot' + i;
      const slot = { id: 'slot' + i, kind: s.kind, visibility: s.visibility, cost: s.cost, occupiedBy: null, label: s.label, g, poster, hl, canvas, tex, w, h, y, face: s.face };
      if (occupiedIdx.has(i) && rivals.length) { const rv = rivals[rivalK++ % rivals.length]; slot.occupiedBy = rv.id; drawRivalPoster(slot, rv); }
      else drawFreePoster(slot);
      slots.push(slot);
    });

    function drawFreePoster(slot) {
      const c = slot.canvas, g = c.getContext('2d'), W = c.width, H = c.height;
      g.fillStyle = '#f2f2ef'; g.fillRect(0, 0, W, H);
      g.fillStyle = '#d9d9d4'; for (let y = 0; y < H; y += 24) g.fillRect(0, y, W, 2);
      g.fillStyle = '#1f2933'; g.textAlign = 'center'; g.textBaseline = 'middle';
      const big = Math.min(W, H) * (slot.kind === 'outdoor' ? 0.2 : 0.11);
      g.font = `900 ${big}px ${TX.FONT}`; g.fillText('ESPAÇO DISPONÍVEL', W / 2, H * 0.42, W * 0.9);
      g.font = `600 ${big * 0.45}px ${TX.FONT}`; g.fillStyle = '#c0392b'; g.fillText('ALUGUE ESTE ESPAÇO · 912 000 000', W / 2, H * 0.66, W * 0.9);
      slot.tex.needsUpdate = true;
    }
    function drawRivalPoster(slot, rv) {
      const c = slot.canvas, g = c.getContext('2d'), W = c.width, H = c.height;
      const grd = g.createLinearGradient(0, 0, W, H); grd.addColorStop(0, rv.color || '#555'); grd.addColorStop(1, TX.shade(rv.color || '#555', 0.6));
      g.fillStyle = grd; g.fillRect(0, 0, W, H);
      const wide = W > H;
      const ls = wide ? H * 0.7 : W * 0.6;
      const lx = wide ? W - ls - H * 0.15 : (W - ls) / 2, ly = wide ? (H - ls) / 2 : H * 0.08;
      g.fillStyle = '#fff'; TX.roundRect(g, lx, ly, ls, ls, ls * 0.12); g.fill();
      const drawLogo = (img) => { if (img) TX.drawFit(g, img, lx + ls * 0.08, ly + ls * 0.08, ls * 0.84, ls * 0.84, 'contain'); else { g.fillStyle = rv.color || '#555'; g.font = `900 ${ls * 0.32}px ${TX.FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(rv.short || '', lx + ls / 2, ly + ls / 2); } };
      drawLogo(null);
      if (rv.logo) TX.loadImage(rv.logo, (img) => { g.fillStyle = '#fff'; TX.roundRect(g, lx, ly, ls, ls, ls * 0.12); g.fill(); drawLogo(img); slot.tex.needsUpdate = true; });
      g.fillStyle = '#fff'; g.textAlign = wide ? 'left' : 'center'; g.textBaseline = 'middle';
      const slogan = (rv.slogan || rv.short || '').toUpperCase();
      const fs = wide ? H * 0.16 : W * 0.1;
      g.font = `900 ${fs}px ${TX.FONT}`;
      const words = slogan.split(' '); const lines = []; let cur = '';
      const maxW = wide ? W - ls - H * 0.5 : W * 0.86;
      for (const w of words) { const t = cur ? cur + ' ' + w : w; if (g.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; }
      if (cur) lines.push(cur);
      const x = wide ? H * 0.2 : W / 2; const y0 = wide ? H / 2 - (lines.length - 1) * fs * 0.6 : H * 0.62;
      lines.slice(0, 3).forEach((l, k) => g.fillText(l, x, y0 + k * fs * 1.15, maxW));
      g.font = `800 ${fs * 0.55}px ${TX.FONT}`; g.globalAlpha = 0.85;
      g.fillText(rv.short || '', x, wide ? H * 0.88 : H * 0.92); g.globalAlpha = 1;
      slot.tex.needsUpdate = true;
    }

    camera.position.set(0, 22, 42); camera.lookAt(0, 2, 0);
    let hoverSlot = null;
    let focusTween = null;
    Object.assign(ctrl, {
      getSlots: () => slots.map(s => ({ id: s.id, kind: s.kind, visibility: s.visibility, cost: s.cost, occupiedBy: s.occupiedBy, label: s.label })),
      setPoster(id, dataURL) {
        const s = slots.find(x => x.id === id); if (!s) return;
        if (!dataURL) { s.occupiedBy = null; drawFreePoster(s); return; }
        s.occupiedBy = party.id;
        const g = s.canvas.getContext('2d');
        TX.loadImage(dataURL, (img) => { g.fillStyle = '#fff'; g.fillRect(0, 0, s.canvas.width, s.canvas.height); TX.drawFit(g, img, 0, 0, s.canvas.width, s.canvas.height, 'cover'); s.tex.needsUpdate = true; });
      },
      focusSlot(id) {
        const s = slots.find(x => x.id === id); if (!s) return;
        const dist = s.kind === 'outdoor' ? 15 : s.kind === 'mupi' ? 5.5 : 3.6;
        const wp = s.g.position.clone(); const center = wp.clone().add(new THREE.Vector3(0, s.y, 0));
        const to = center.clone().add(new THREE.Vector3(Math.sin(s.face) * dist, dist * 0.18, Math.cos(s.face) * dist));
        focusTween = { fromP: camera.position.clone(), fromT: controls ? controls.target.clone() : new THREE.Vector3(), toP: to, toT: center, t: 0 };
      },
      vandalize(id) {
        const s = slots.find(x => x.id === id); if (!s) return;
        const g = s.canvas.getContext('2d'), W = s.canvas.width, H = s.canvas.height;
        const rr = rng(hashString(id) + Date.now() % 1000);
        g.lineCap = 'round';
        for (let k = 0; k < 7; k++) {
          g.strokeStyle = k % 3 === 0 ? '#e11d2a' : '#111'; g.lineWidth = Math.min(W, H) * (0.02 + rr() * 0.03); g.globalAlpha = 0.85;
          g.beginPath(); g.moveTo(rr() * W, rr() * H); for (let j = 0; j < 4; j++) g.quadraticCurveTo(rr() * W, rr() * H, rr() * W, rr() * H); g.stroke();
        }
        g.globalAlpha = 1;
        g.fillStyle = '#2b2b2b'; g.beginPath(); g.moveTo(W, 0); g.lineTo(W * 0.72, 0); g.lineTo(W * 0.8, H * 0.18); g.lineTo(W * 0.9, H * 0.12); g.lineTo(W, H * 0.4); g.closePath(); g.fill();
        g.fillStyle = '#e11d2a'; g.font = `900 ${Math.min(W, H) * 0.16}px ${TX.FONT}`; g.textAlign = 'center'; g.save(); g.translate(W * 0.4, H * 0.55); g.rotate(-0.2); g.fillText('MENTIROSOS!', 0, 0); g.restore();
        s.tex.needsUpdate = true;
      },
    });
    ctrl.onAttach = (renderer) => {
      if (controls) return;
      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true; controls.target.set(0, 2, 0); controls.minDistance = 3; controls.maxDistance = 85; controls.maxPolarAngle = 1.38; controls.update();
    };
    ctrl.onPointer = (type, p) => {
      if (type === 'pointerdown') downAt = { x: p.clientX, y: p.clientY };
      const pick = () => { const hits = Engine.raycast(camera, p, slots.map(s => s.poster), false); return hits.length ? hits[0].object.userData.slotId : null; };
      if (type === 'pointermove') { const id = pick(); hoverSlot = id; Engine.setCursor(id ? 'pointer' : ''); }
      if (type === 'click') { if (downAt && Math.hypot(p.clientX - downAt.x, p.clientY - downAt.y) > 6) return; const id = pick(); if (id) opts.onSlotClick?.(id); }
    };
    updaters.push((dt, t) => {
      for (const c of movingCars) { c.a -= c.sp * dt; c.m.position.set(Math.cos(c.a) * c.rr, 0, Math.sin(c.a) * c.rr); c.m.rotation.y = -c.a + Math.PI; }
      for (const s of slots) { const target = s.id === hoverSlot ? 0.85 + Math.sin(t * 6) * 0.15 : 0; s.hl.material.opacity = damp(s.hl.material.opacity, target, 10, dt); }
      if (focusTween) {
        focusTween.t += dt; const k = easeInOut(Math.min(1, focusTween.t / 1.3));
        camera.position.lerpVectors(focusTween.fromP, focusTween.toP, k);
        const tg = focusTween.fromT.clone().lerp(focusTween.toT, k);
        if (controls) controls.target.copy(tg); camera.lookAt(tg);
        if (k >= 1) focusTween = null;
      } else if (controls) controls.update();
    });
  }

  // =================================================================================== COMÍCIO
  let crowd = null;
  if (mode === 'comicio') {
    plane(56, 56, 0, 0, groundMat, 4);
    plane(900, 900, 0, 0, M.asphalt, 8, -0.03);
    buildingRow(-26, 27, 26, 27, 0, -1);
    buildingRow(-27, -27, -27, 27, 1, 0);
    buildingRow(27, 27, 27, -27, -1, 0);
    buildingRow(26, -27, -26, -27, 0, 1);
    flushBuildings();
    for (let z = -20; z <= 24; z += 11) { props.lamps.push({ x: -24, z, rot: Math.PI / 2 }, { x: 24, z, rot: -Math.PI / 2 }); }
    for (const [x, z] of [[-22, 22], [22, 22], [-22, -6], [22, -6]]) props.trees.push({ x, z, type: ST.tree === 'hydrangea' ? 'round' : ST.tree, s: 1 });
    flushProps();
    // palco
    const SZ = -15;
    addMesh(place(new THREE.BoxGeometry(15, 1.5, 8), { y: 0.75, z: SZ }), bag.mat(new THREE.MeshStandardMaterial({ color: '#16181d', roughness: 0.5 })), { cast: true });
    addMesh(place(new THREE.BoxGeometry(15.2, 0.1, 0.2), { y: 1.5, z: SZ + 4 }), bag.mat(new THREE.MeshBasicMaterial({ color: new THREE.Color(party.color).multiplyScalar(1.4), toneMapped: false })));
    const truss = [];
    for (const x of [-7.3, 7.3]) for (const z of [SZ - 3.8, SZ + 3.6]) truss.push(place(new THREE.BoxGeometry(0.35, 9, 0.35), { x, y: 4.5, z }));
    for (const z of [SZ - 3.8, SZ + 3.6]) truss.push(place(new THREE.BoxGeometry(15, 0.35, 0.35), { y: 9, z }));
    for (const x of [-7.3, 7.3]) truss.push(place(new THREE.BoxGeometry(0.35, 0.35, 7.4), { x, y: 9, z: SZ - 0.1 }));
    addMesh(mergeGeos(truss), M.metal, { cast: true });
    // ecrã com logótipo
    const sc = TX.makeCanvas(1600, 900), sg = sc.getContext('2d');
    const scTex = bag.tex(TX.toTexture(sc));
    const drawScreen = (img) => {
      const grd = sg.createLinearGradient(0, 0, 1600, 900); grd.addColorStop(0, party.color); grd.addColorStop(1, TX.shade(party.color, 0.45));
      sg.fillStyle = grd; sg.fillRect(0, 0, 1600, 900);
      sg.fillStyle = 'rgba(255,255,255,0.08)'; for (let k = 0; k < 12; k++) { sg.beginPath(); sg.arc(800, 1300, 300 + k * 90, 0, Math.PI * 2); sg.lineWidth = 18; sg.strokeStyle = 'rgba(255,255,255,0.05)'; sg.stroke(); }
      sg.fillStyle = '#fff'; TX.roundRect(sg, 560, 120, 480, 480, 60); sg.fill();
      if (img) TX.drawFit(sg, img, 600, 160, 400, 400, 'contain');
      else { sg.fillStyle = party.color; sg.font = `900 170px ${TX.FONT}`; sg.textAlign = 'center'; sg.textBaseline = 'middle'; sg.fillText(party.short, 800, 365); }
      sg.fillStyle = '#fff'; sg.font = `900 90px ${TX.FONT}`; sg.textAlign = 'center'; sg.textBaseline = 'middle';
      sg.fillText((opts.slogan || party.leaderName || party.short).toUpperCase(), 800, 730, 1500);
      scTex.needsUpdate = true;
    };
    drawScreen(null); if (party.logo) TX.loadImage(party.logo, drawScreen);
    const screenM = bag.mat(new THREE.MeshBasicMaterial({ map: scTex, toneMapped: false }));
    addMesh(place(new THREE.PlaneGeometry(10, 5.6), { y: 5.4, z: SZ - 3.6 }), screenM, { receive: false });
    addMesh(place(new THREE.BoxGeometry(10.4, 6, 0.2), { y: 5.4, z: SZ - 3.75 }), M.metal);
    // ecrãs laterais com a foto do líder
    const photoTex = bag.tex(TX.imageTexture(party.leaderPhoto || null, { w: 512, h: 640, fit: 'cover', bg: party.color, placeholder: party.leaderPhoto ? null : (party.leaderName || '').split(' ').map(w => w[0]).join('').slice(0, 2) }));
    for (const sx of [-1, 1]) {
      addMesh(place(new THREE.PlaneGeometry(3.2, 4), { x: sx * 9.5, y: 5.2, z: SZ - 1, ry: -sx * 0.3 }), bag.mat(new THREE.MeshBasicMaterial({ map: photoTex, toneMapped: false })), { receive: false });
      addMesh(place(new THREE.BoxGeometry(1.4, 2.6, 1.2), { x: sx * 6.3, y: 2.8, z: SZ + 2.6 }), bag.mat(new THREE.MeshStandardMaterial({ color: '#0d0e10', roughness: 0.6 })), { cast: true });
      addMesh(place(new THREE.BoxGeometry(0.35, 9, 0.35), { x: sx * 9.5, y: 4.5, z: SZ - 1.2 }), M.metal);
    }
    // púlpito
    const lect = mergeGeos([place(new THREE.BoxGeometry(1.0, 1.1, 0.55), { y: 0.55 }), place(new THREE.BoxGeometry(1.1, 0.06, 0.65), { y: 1.12, rx: -0.15 })]);
    addMesh(lect, bag.mat(new THREE.MeshStandardMaterial({ color: '#1b1f26', roughness: 0.3, metalness: 0.4 })), { cast: true }).position.set(0, 1.5, SZ + 3.0);
    addMesh(place(new THREE.PlaneGeometry(0.85, 0.75), { y: 2.05, z: SZ + 3.28 }), bag.mat(new THREE.MeshStandardMaterial({ map: logoTex, emissiveMap: logoTex, emissive: '#fff', emissiveIntensity: 0.4 })));
    const leader = makePerson({ ...randomLook(hashString(party.leaderName), { gender: inferGender(party.leaderName), formal: true }), tie: party.color, detail: 'high' });
    leader.position.set(0, 1.5, SZ + 2.45); leader.traverse(o => { if (o.isMesh) o.castShadow = shadowsOn; });
    scene.add(leader);
    let speaking = false;
    // luzes do palco
    for (const [x, col] of [[-6, party.color], [6, party.color], [0, '#ffffff']]) {
      const sp = new THREE.SpotLight(col, x === 0 ? 300 : 220, 40, 0.42, 0.5, 1.2);
      sp.position.set(x, 9, SZ + 3); sp.target.position.set(x * 0.2, 1.5, SZ + 2); scene.add(sp, sp.target);
    }
    const coneMat = bag.mat(new THREE.MeshBasicMaterial({ color: new THREE.Color(party.color).lerp(new THREE.Color('#ffffff'), 0.4), map: TX.coneGradient(), transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false }));
    for (const x of [-5.5, -2, 2, 5.5]) {
      const from = new THREE.Vector3(x, 8.8, SZ + 3.6), to = new THREE.Vector3(x * 1.6, 0, SZ + 14);
      const dir = from.clone().sub(to); const len = dir.length(); dir.normalize();
      const cone = new THREE.Mesh(bag.geo(new THREE.ConeGeometry(2.2, len, 24, 1, true)), coneMat);
      cone.position.copy(from).add(to).multiplyScalar(0.5); cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir); scene.add(cone);
    }
    // fiadas de luzes
    const bulbs = [];
    for (let k = 0; k < 5; k++) {
      const z = -6 + k * 7;
      for (let i = 0; i <= 26; i++) { const x = -26 + i * 2; const sag = 1.8 * (1 - Math.pow((x) / 26, 2)); bulbs.push(new THREE.Vector3(x, 8.5 - sag, z)); }
    }
    const bulbMesh = new THREE.InstancedMesh(bag.geo(new THREE.SphereGeometry(0.1, 6, 5)), bag.mat(new THREE.MeshBasicMaterial({ color: '#ffd98a', toneMapped: false })), bulbs.length);
    bulbs.forEach((b, i) => { mtx.makeTranslation(b.x, b.y, b.z); bulbMesh.setMatrixAt(i, mtx); });
    scene.add(bulbMesh);
    const warm = new THREE.PointLight('#ffb36b', 60, 40, 1.4); warm.position.set(0, 7, 6); scene.add(warm);
    // multidão
    const MAX = 400;
    crowd = new Crowd(MAX, { seed: seed + 5, flagTexture: logoTex, flagRatio: 0.32, palette: { shirts: [party.color, party.color, party.color, ...CASUAL.slice(0, 8)] } });
    const spots = [];
    for (let i = 0; i < MAX * 1.6; i++) { const x = (r() - 0.5) * 36, z = SZ + 5.5 + r() * 31; spots.push({ x, z, d: Math.hypot(x * 0.6, z - SZ) }); }
    spots.sort((a, b) => a.d - b.d);
    for (let i = 0; i < MAX; i++) { const s = spots[i]; crowd.setTransform(i, s.x, 0, s.z, Math.atan2(-s.x * 0.3, SZ - s.z)); }
    crowd.setCount(Math.round(MAX * 0.5));
    scene.add(crowd.object3d);
    camera.position.set(0, 9.5, 30); camera.lookAt(0, 3.5, SZ);
    Object.assign(ctrl, {
      setCrowd(f) { crowd.setCount(Math.round(MAX * clamp(f, 0, 1))); },
      cheer(intensity = 1) { crowd.cheer(ctrl._t || 0, intensity); },
      setSpeaker(on) { speaking = !!on; },
    });
    ctrl.onAttach = (renderer) => {
      if (controls) return;
      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true; controls.target.set(0, 3.5, SZ + 2); controls.minDistance = 6; controls.maxDistance = 60; controls.maxPolarAngle = 1.45; controls.update();
    };
    updaters.push((dt, t) => {
      ctrl._t = t;
      crowd.update(t);
      animatePerson(leader, speaking ? 'podiumTalk' : 'wave', t, 1 - Math.exp(-dt * 8));
      controls?.update();
    });
  }

  // =================================================================================== PROTESTO
  if (mode === 'protesto') {
    plane(24, 220, 0, -20, M.asphalt, 6);
    for (const sx of [-1, 1]) plane(6, 220, sx * 15, -20, groundMat, 4, 0.02);
    plane(900, 900, 0, 0, M.asphalt, 8, -0.03);
    buildingRow(-18, 80, -18, -120, 1, 0);
    buildingRow(18, -120, 18, 80, -1, 0);
    flushBuildings();
    for (let z = 70; z > -120; z -= 10) props.trees.push({ x: -14.5, z, type: 'round', s: 1.1 }, { x: 14.5, z: z - 5, type: 'round', s: 1.1 });
    for (let z = 75; z > -120; z -= 20) props.lamps.push({ x: -12.5, z, rot: Math.PI / 2 }, { x: 12.5, z: z - 10, rot: -Math.PI / 2 });
    flushProps();
    const MAX = 600;
    crowd = new Crowd(MAX, { seed: seed + 9, flagColors: ['#d71920', '#d71920', '#046a38', '#ffffff', party.color, '#1d4e9a'], flagRatio: 0.22, castShadow: shadowsOn && quality === 'high' });
    const pos = [];
    for (let i = 0; i < MAX; i++) pos.push({ x: (r() - 0.5) * 21, z: -45 + r() * 95, sp: 0.6 + r() * 0.2 });
    pos.sort((a, b) => Math.abs(a.z - 10) - Math.abs(b.z - 10));
    pos.forEach((p, i) => { crowd.setTransform(i, p.x, 0, p.z, Math.PI); crowd.setPose(i, 'walk'); });
    crowd.setCount(Math.round(MAX * 0.6));
    scene.add(crowd.object3d);
    // faixas
    const banners = [];
    const bannerGeo = bag.geo(new THREE.PlaneGeometry(5, 1.2));
    const bpoleGeo = bag.geo(new THREE.CylinderGeometry(0.03, 0.03, 2.6, 5));
    function setBanners(texts) {
      for (const b of banners) { scene.remove(b.g); b.tex.dispose(); b.mat.dispose(); }
      banners.length = 0;
      (texts || []).slice(0, 8).forEach((txt, k) => {
        const tex = TX.textTexture([String(txt).toUpperCase()], { w: 1024, h: 246, bg: k % 2 ? '#f4f1e8' : '#c8102e', fg: k % 2 ? '#c8102e' : '#ffffff', weight: '900' });
        const mat = new THREE.MeshStandardMaterial({ map: tex, side: THREE.DoubleSide, roughness: 0.8 });
        const g = new THREE.Group();
        const b = new THREE.Mesh(bannerGeo, mat); b.position.y = 2.3; g.add(b);
        for (const sx of [-2.5, 2.5]) { const pl = new THREE.Mesh(bpoleGeo, M.white); pl.position.set(sx, 1.4, 0); g.add(pl); }
        for (const sx of [-2.5, 2.5]) { const p = makePerson({ ...randomLook(k * 13 + sx * 7, { formal: false }) }); p.position.set(sx, 0, 0.3); p.rotation.y = Math.PI; g.add(p); p.userData.carrier = true; }
        g.position.set(((k % 3) - 1) * 6.5, 0, -30 + k * 11);
        scene.add(g);
        banners.push({ g, tex, mat });
      });
    }
    setBanners(opts.banners || ['Mais salários, mais direitos', 'Habitação para todos', 'Pela democracia']);
    camera.position.set(0, 14, 44); camera.lookAt(0, 1, 0);
    Object.assign(ctrl, {
      setCrowd(f) { crowd.setCount(Math.round(MAX * clamp(f, 0, 1))); },
      setBanners,
    });
    ctrl.onAttach = (renderer) => {
      if (controls) return;
      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true; controls.target.set(0, 1, 0); controls.minDistance = 8; controls.maxDistance = 90; controls.maxPolarAngle = 1.4;
      controls.update();
    };
    updaters.push((dt, t) => {
      for (let i = 0; i < crowd.drawCount; i++) { const p = pos[i]; p.z -= p.sp * dt; if (p.z < -48) p.z += 98; crowd.setTransform(i, p.x, 0, p.z, Math.PI); }
      crowd.update(t);
      for (const b of banners) {
        b.g.position.z -= 0.65 * dt; if (b.g.position.z < -48) b.g.position.z += 98;
        b.g.children.forEach((c, i) => { if (c.userData.carrier) animatePerson(c, 'walk', t + i, 1); });
      }
      controls?.update();
    });
  }

  // ---------------------------------------------------------------- ciclo e limpeza
  ctrl.update = (dt, t) => {
    for (const u of updaters) u(dt, t);
    if (seaGeo) {
      const p = seaGeo.attributes.position, b = seaGeo.userData.base;
      for (let i = 0; i < p.count; i++) p.setY(i, b[i * 3 + 1] + Math.sin(b[i * 3] * 0.08 + t * 0.9) * 0.18 + Math.sin(b[i * 3 + 2] * 0.11 + t * 0.7) * 0.15);
      p.needsUpdate = true;
    }
  };
  ctrl.dispose = () => {
    controls?.dispose(); controls = null;
    crowd?.dispose();
    for (const d of disposers) d();
    scene.traverse((o) => { if (o.isSprite && o.material && !o.material.userData.shared) o.material.dispose(); if (o.isInstancedMesh) o.dispose(); });
    bag.dispose();
    Engine.setCursor('');
  };
  ctrl.mode = mode;
  return ctrl;
}
