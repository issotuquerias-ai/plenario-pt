// Estúdio de televisão para debates eleitorais.
import * as THREE from 'three';
import { Reflector } from 'three/addons/objects/Reflector.js';
import { Engine } from './engine.js';
import { Bag, hashString, inferGender, initials, mergeGeos, place, lerp, easeInOut } from './util3d.js';
import * as TX from './materials.js';
import { makePerson, animatePerson, randomLook, sharedGeometries } from './people.js';

const WALL_R = 15, WALL_CZ = 8, WALL_SPAN = 1.25, WALL_H = 7.2;

export function createStudio(opts = {}) {
  const bag = new Bag();
  const channel = Object.assign({ id: 'rtp', name: 'RTP', color: '#0b3d91', color2: '#e30613' }, opts.channel || {});
  const title = opts.title || 'DEBATE LEGISLATIVAS';
  const parts = (opts.participants || []).slice(0, 8);
  const N = parts.length;
  const moderator = Object.assign({ name: 'Moderador' }, opts.moderator || {});
  const quality = Engine.quality;
  const shadowsOn = quality !== 'low';

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#04060b');
  scene.fog = new THREE.Fog('#04060b', 20, 46);
  scene.environmentIntensity = 0.45;
  const camera = new THREE.PerspectiveCamera(36, 16 / 9, 0.1, 120);
  const chA = new THREE.Color(channel.color), chB = new THREE.Color(channel.color2);

  const addMesh = (geo, material, { cast = false, receive = false, parent = scene } = {}) => {
    bag.geo(geo); const m = new THREE.Mesh(geo, material);
    m.castShadow = cast && shadowsOn; m.receiveShadow = receive && shadowsOn; parent.add(m); return m;
  };

  // ---------------- chão espelhado
  let reflector = null;
  if (quality !== 'low') {
    const rgeo = bag.geo(new THREE.PlaneGeometry(44, 44));
    reflector = new Reflector(rgeo, { clipBias: 0.003, textureWidth: 1024, textureHeight: 1024, color: 0x8a96a8 });
    reflector.rotation.x = -Math.PI / 2; reflector.position.y = -0.001;
    scene.add(reflector);
  }
  {
    const c = TX.makeCanvas(512, 512), g = c.getContext('2d');
    g.fillStyle = '#0b0f17'; g.fillRect(0, 0, 512, 512);
    g.strokeStyle = 'rgba(120,140,170,0.18)'; g.lineWidth = 2;
    for (let i = 0; i <= 512; i += 128) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 512); g.moveTo(0, i); g.lineTo(512, i); g.stroke(); }
    const tex = bag.tex(TX.toTexture(c, { repeat: true })); tex.repeat.set(11, 11);
    const fm = bag.mat(new THREE.MeshStandardMaterial({ map: tex, roughness: 0.32, metalness: 0.35, transparent: !!reflector, opacity: reflector ? 0.84 : 1 }));
    const fg = new THREE.PlaneGeometry(44, 44); fg.rotateX(-Math.PI / 2);
    addMesh(fg, fm, { receive: true });
    const ring = new THREE.RingGeometry(5.6, 5.78, 96); ring.rotateX(-Math.PI / 2); ring.translate(0, 0.01, 1.2);
    addMesh(ring, bag.mat(new THREE.MeshBasicMaterial({ color: chA.clone().multiplyScalar(1.6), toneMapped: false })));
    const ring2 = new THREE.RingGeometry(6.3, 6.36, 96); ring2.rotateX(-Math.PI / 2); ring2.translate(0, 0.01, 1.2);
    addMesh(ring2, bag.mat(new THREE.MeshBasicMaterial({ color: chB.clone().multiplyScalar(1.4), toneMapped: false })));
  }

  // ---------------- parede LED
  const WW = 2048, WH = 768;
  const wallCanvas = TX.makeCanvas(WW, WH), wg = wallCanvas.getContext('2d');
  const wallTex = bag.tex(TX.toTexture(wallCanvas, { mipmaps: false }));
  {
    const geo = new THREE.CylinderGeometry(WALL_R, WALL_R, WALL_H, 64, 1, true, Math.PI - WALL_SPAN / 2, WALL_SPAN);
    const uv = geo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setX(i, 1 - uv.getX(i));
    geo.translate(0, WALL_H / 2 + 0.15, WALL_CZ);
    addMesh(geo, bag.mat(new THREE.MeshBasicMaterial({ map: wallTex, side: THREE.BackSide, toneMapped: false })));
    // moldura/base da parede
    const base = new THREE.CylinderGeometry(WALL_R - 0.05, WALL_R - 0.05, 0.15, 64, 1, true, Math.PI - WALL_SPAN / 2, WALL_SPAN);
    base.translate(0, 0.075, WALL_CZ);
    addMesh(base, bag.mat(new THREE.MeshStandardMaterial({ color: '#111', roughness: 0.4, side: THREE.DoubleSide })));
  }
  const imgs = parts.map(p => ({ photo: p.photo ? TX.loadImage(p.photo, () => { wallDirty = true; }) : null, logo: p.logo ? TX.loadImage(p.logo, () => { wallDirty = true; }) : null }));
  let tickerText = opts.screenText || title;
  let wallDirty = true, wallAcc = 1;

  function drawPanel(i, x, y, w, h) {
    const p = parts[i], im = imgs[i];
    const col = p.color || '#666';
    wg.save();
    wg.shadowColor = 'rgba(0,0,0,0.5)'; wg.shadowBlur = 24;
    wg.fillStyle = 'rgba(8,12,20,0.88)'; TX.roundRect(wg, x, y, w, h, 18); wg.fill();
    wg.restore();
    wg.save(); TX.roundRect(wg, x + 8, y + 8, w - 16, h - 70, 12); wg.clip();
    const ph = im.photo;
    if (ph && ph.complete && ph.naturalWidth) TX.drawFit(wg, ph, x + 8, y + 8, w - 16, h - 70, 'cover');
    else {
      const grd = wg.createLinearGradient(0, y, 0, y + h); grd.addColorStop(0, col); grd.addColorStop(1, '#0b0f17');
      wg.fillStyle = grd; wg.fillRect(x + 8, y + 8, w - 16, h - 70);
      wg.fillStyle = 'rgba(255,255,255,0.92)'; wg.font = `800 ${Math.round(h * 0.28)}px ${TX.FONT}`; wg.textAlign = 'center'; wg.textBaseline = 'middle';
      wg.fillText(initials(p.name), x + w / 2, y + (h - 62) / 2);
    }
    wg.restore();
    wg.fillStyle = col; wg.fillRect(x + 8, y + h - 62, w - 16, 8);
    wg.fillStyle = '#fff'; wg.font = `700 ${Math.round(Math.min(34, w * 0.09))}px ${TX.FONT}`; wg.textAlign = 'left'; wg.textBaseline = 'middle';
    wg.fillText(p.name || '', x + 18, y + h - 28, w - 110);
    const lg = im.logo;
    const ls = 70;
    wg.fillStyle = '#fff'; TX.roundRect(wg, x + w - ls - 14, y + h - ls - 12, ls, ls, 10); wg.fill();
    if (lg && lg.complete && lg.naturalWidth) TX.drawFit(wg, lg, x + w - ls - 9, y + h - ls - 7, ls - 10, ls - 10, 'contain');
    else { wg.fillStyle = col; wg.font = `900 ${p.partyShort && p.partyShort.length > 3 ? 18 : 26}px ${TX.FONT}`; wg.textAlign = 'center'; wg.fillText(p.partyShort || '', x + w - ls / 2 - 14, y + h - ls / 2 - 12); }
  }

  function drawWall(t) {
    const g = wg;
    const bg = g.createLinearGradient(0, 0, WW, WH);
    bg.addColorStop(0, '#' + chA.clone().multiplyScalar(0.55).getHexString());
    bg.addColorStop(0.55, '#' + chA.clone().multiplyScalar(0.25).getHexString());
    bg.addColorStop(1, '#' + chB.clone().multiplyScalar(0.45).getHexString());
    g.fillStyle = bg; g.fillRect(0, 0, WW, WH);
    // faixas diagonais animadas
    g.save(); g.globalCompositeOperation = 'lighter';
    for (let k = 0; k < 7; k++) {
      const off = ((t * 90 + k * 380) % (WW + 800)) - 400;
      const grd = g.createLinearGradient(off, 0, off + 260, 0);
      grd.addColorStop(0, 'rgba(255,255,255,0)'); grd.addColorStop(0.5, 'rgba(255,255,255,0.07)'); grd.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = grd; g.beginPath(); g.moveTo(off, 0); g.lineTo(off + 260, 0); g.lineTo(off + 60, WH); g.lineTo(off - 200, WH); g.closePath(); g.fill();
    }
    g.restore();
    // grelha de pontos LED
    g.fillStyle = 'rgba(0,0,0,0.18)';
    for (let y = 0; y < WH; y += 6) g.fillRect(0, y, WW, 2);
    // título
    g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = `900 92px ${TX.FONT}`;
    g.shadowColor = 'rgba(0,0,0,0.45)'; g.shadowBlur = 20;
    g.fillText(title.toUpperCase(), WW / 2, 120, WW - 500);
    g.shadowBlur = 0;
    g.fillStyle = '#' + chB.getHexString(); g.fillRect(WW / 2 - 160, 180, 320, 8);
    // canal
    g.fillStyle = '#fff'; TX.roundRect(g, 60, 44, 230, 86, 14); g.fill();
    g.fillStyle = '#' + chA.getHexString(); g.font = `900 58px ${TX.FONT}`; g.fillText(channel.name, 175, 89, 210);
    g.fillStyle = '#e11d2a'; TX.roundRect(g, WW - 300, 54, 220, 64, 32); g.fill();
    g.fillStyle = '#fff'; g.font = `800 32px ${TX.FONT}`; g.fillText((Math.floor(t * 1.2) % 2 ? '● ' : '○ ') + 'EM DIRETO', WW - 190, 87);
    // painéis
    if (N === 2) {
      drawPanel(0, 250, 230, 560, 420); drawPanel(1, WW - 810, 230, 560, 420);
      g.fillStyle = '#fff'; g.font = `900 120px ${TX.FONT}`; g.textAlign = 'center'; g.fillText('VS', WW / 2, 440);
    } else if (N > 2) {
      const w = Math.min(320, (WW - 240) / N - 20), h = w * 1.18;
      const total = N * w + (N - 1) * 20;
      for (let i = 0; i < N; i++) drawPanel(i, (WW - total) / 2 + i * (w + 20), 250, w, h);
    }
    // rodapé / ticker
    g.fillStyle = 'rgba(5,8,14,0.92)'; g.fillRect(0, WH - 92, WW, 92);
    g.fillStyle = '#' + chB.getHexString(); g.fillRect(0, WH - 92, 300, 92);
    g.fillStyle = '#fff'; g.font = `900 34px ${TX.FONT}`; g.textAlign = 'center'; g.fillText('DEBATE', 150, WH - 46);
    g.save(); g.beginPath(); g.rect(310, WH - 92, WW - 320, 92); g.clip();
    g.font = `700 40px ${TX.FONT}`; g.textAlign = 'left';
    const tw = g.measureText(tickerText).width + 200;
    const span = Math.max(tw, WW - 320);
    const x = 330 + (WW - 320) - ((t * 140) % (span + WW - 320));
    g.fillStyle = '#fff'; g.fillText(tickerText, x, WH - 46); g.fillText(tickerText, x + span + 200, WH - 46);
    g.restore();
    wallTex.needsUpdate = true;
  }

  // ---------------- púlpitos e participantes
  const darkGloss = bag.mat(new THREE.MeshStandardMaterial({ color: '#141821', roughness: 0.22, metalness: 0.55 }));
  const lecternGeo = (() => {
    const s = new THREE.Shape();
    s.moveTo(-0.28, 0); s.lineTo(0.28, 0); s.lineTo(0.28, 0.98); s.lineTo(-0.28, 1.07); s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.9, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015, bevelSegments: 2 });
    g.translate(0, 0, -0.45); g.rotateY(-Math.PI / 2);
    return bag.geo(g);
  })();
  const plateGeo = bag.geo(new THREE.PlaneGeometry(0.8, 0.8));
  const stripGeo = bag.geo(new THREE.BoxGeometry(0.9, 0.025, 0.025));
  const lecterns = [];

  function facing(x, z, tx, tz) { return Math.atan2(tx - x, tz - z); }
  const positions = [];
  if (N === 2) { positions.push([-2.5, 0.35], [2.5, 0.35]); }
  else if (N > 2) {
    const R = 5.6, cz = 3.6, spread = Math.min(1.95, 0.34 * (N - 1));
    for (let i = 0; i < N; i++) { const th = -spread / 2 + (spread * i) / (N - 1); positions.push([Math.sin(th) * R, cz - Math.cos(th) * R]); }
  } else if (N === 1) positions.push([0, 0]);

  parts.forEach((p, i) => {
    const [x, z] = positions[i];
    const grp = new THREE.Group();
    grp.position.set(x, 0, z);
    grp.rotation.y = N === 2 ? facing(x, z, 0, 4.2) : facing(x, z, 0, 5.5);
    scene.add(grp);
    const body = new THREE.Mesh(lecternGeo, darkGloss); body.castShadow = shadowsOn; body.receiveShadow = shadowsOn; grp.add(body);
    const logoTex = TX.logoPlate(p.logo || null, p.partyShort || '?', p.color || '#555', { w: 512, h: 552 });
    const pm = bag.mat(new THREE.MeshStandardMaterial({ map: logoTex, emissiveMap: logoTex, emissive: '#ffffff', emissiveIntensity: 0.55, roughness: 0.4 }));
    const plate = new THREE.Mesh(plateGeo, pm); plate.position.set(0, 0.52, 0.297); grp.add(plate);
    const sm = bag.mat(new THREE.MeshBasicMaterial({ color: new THREE.Color(p.color || '#888').multiplyScalar(1.5), toneMapped: false }));
    for (const y of [0.995, 0.06]) { const st = new THREE.Mesh(stripGeo, sm); st.position.set(0, y, 0.3); grp.add(st); }
    const look = randomLook(hashString(p.name || 'p' + i), { gender: inferGender(p.name), formal: true, oldRatio: 0.25 });
    const person = makePerson({ ...look, tie: p.color || '#888', detail: 'high', phase: i * 2.3 });
    person.position.set(0, 0, -0.52); grp.add(person);
    person.traverse((o) => { if (o.isMesh) o.castShadow = shadowsOn; });
    lecterns.push({ grp, person, stripMat: sm, base: new THREE.Color(p.color || '#888').multiplyScalar(1.5), react: null, reactUntil: 0 });
  });

  // moderador
  const modGrp = new THREE.Group();
  {
    const mx = 0, mz = N === 2 ? -1.6 : (N > 2 ? 2.7 : -1.6);
    modGrp.position.set(mx, 0, mz);
    modGrp.rotation.y = N > 2 ? Math.PI : 0;
    scene.add(modGrp);
    const desk = mergeGeos([place(new THREE.BoxGeometry(1.5, 1.02, 0.55), { y: 0.51 }), place(new THREE.BoxGeometry(1.62, 0.05, 0.68), { y: 1.045 })]);
    addMesh(desk, darkGloss, { cast: true, receive: true, parent: modGrp }).position.z = 0.32;
    const front = new THREE.PlaneGeometry(1.48, 0.9);
    const ft = bag.tex(TX.textTexture([channel.name], { w: 512, h: 300, bg: '#' + chA.getHexString(), fg: '#ffffff' }));
    addMesh(front, bag.mat(new THREE.MeshStandardMaterial({ map: ft, emissiveMap: ft, emissive: '#fff', emissiveIntensity: 0.6 })), { parent: modGrp }).position.set(0, 0.52, 0.598);
    const tablet = new THREE.BoxGeometry(0.3, 0.012, 0.22); tablet.translate(0.3, 1.08, 0.3);
    addMesh(tablet, bag.mat(new THREE.MeshStandardMaterial({ color: '#0d0f14', roughness: 0.2, metalness: 0.5 })), { parent: modGrp });
  }
  const modPerson = makePerson({ ...randomLook(hashString(moderator.name), { gender: inferGender(moderator.name), formal: true, oldRatio: 0.15 }), tie: channel.color, detail: 'high' });
  modPerson.position.set(0, 0, -0.1); modGrp.add(modPerson);
  modPerson.traverse((o) => { if (o.isMesh) o.castShadow = shadowsOn; });

  // ---------------- estrutura de luzes (truss), cones e câmaras
  const metal = bag.mat(new THREE.MeshStandardMaterial({ color: '#2b2f37', roughness: 0.45, metalness: 0.8 }));
  {
    const beams = [];
    const y = 6.6, x0 = -8, x1 = 8, z0 = -3.5, z1 = 6;
    for (const z of [z0, z1, (z0 + z1) / 2]) beams.push(place(new THREE.BoxGeometry(x1 - x0, 0.22, 0.22), { y, z }));
    for (const x of [x0, x1, 0]) beams.push(place(new THREE.BoxGeometry(0.22, 0.22, z1 - z0), { x, y, z: (z0 + z1) / 2 }));
    addMesh(mergeGeos(beams), metal);
  }
  const coneMat = bag.mat(new THREE.MeshBasicMaterial({ color: '#cfe0ff', map: TX.coneGradient(), transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false }));
  const coneMats = [];
  const fixtureGeo = bag.geo(mergeGeos([place(new THREE.CylinderGeometry(0.16, 0.2, 0.42, 14), {}), place(new THREE.CylinderGeometry(0.19, 0.19, 0.03, 14), { y: -0.21 })]));
  const glowMat = bag.mat(new THREE.MeshBasicMaterial({ color: '#ffffff', toneMapped: false }));
  const addCone = (from, to, color, radius = 1.2) => {
    const dir = new THREE.Vector3().subVectors(from, to); const len = dir.length(); dir.normalize();
    const geo = bag.geo(new THREE.ConeGeometry(radius, len, 28, 1, true));
    const m = color ? bag.mat(coneMat.clone()) : coneMat;
    if (color) { m.color.set(color); }
    const cone = new THREE.Mesh(geo, m);
    cone.position.copy(from).add(to).multiplyScalar(0.5);
    cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    cone.renderOrder = 5;
    scene.add(cone); coneMats.push(m);
    const fx = new THREE.Mesh(fixtureGeo, metal); fx.position.copy(from); fx.quaternion.copy(cone.quaternion); scene.add(fx);
    const lens = new THREE.Mesh(bag.geo(new THREE.CircleGeometry(0.16, 16)), glowMat); lens.position.copy(from).addScaledVector(dir, -0.22); lens.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir.clone().negate()); scene.add(lens);
  };
  lecterns.forEach((L) => {
    const p = L.grp.position;
    addCone(new THREE.Vector3(p.x * 0.85, 6.4, p.z + 1.0), new THREE.Vector3(p.x, 0, p.z - 0.2), null, 1.05);
  });
  addCone(new THREE.Vector3(modGrp.position.x, 6.4, modGrp.position.z + (N > 2 ? -1 : 1)), new THREE.Vector3(modGrp.position.x, 0, modGrp.position.z), null, 0.95);
  addCone(new THREE.Vector3(-7, 6.4, -2.5), new THREE.Vector3(-3.5, 0, 2), channel.color, 1.6);
  addCone(new THREE.Vector3(7, 6.4, -2.5), new THREE.Vector3(3.5, 0, 2), channel.color2, 1.6);

  {
    const camGeo = mergeGeos([
      place(new THREE.CylinderGeometry(0.42, 0.42, 0.08, 16), { y: 0.04 }),
      place(new THREE.CylinderGeometry(0.06, 0.07, 1.25, 10), { y: 0.68 }),
      place(new THREE.BoxGeometry(0.38, 0.36, 0.62), { y: 1.45 }),
      place(new THREE.CylinderGeometry(0.11, 0.13, 0.36, 14), { y: 1.45, z: 0.48, rx: Math.PI / 2 }),
      place(new THREE.BoxGeometry(0.22, 0.16, 0.12), { y: 1.7, z: -0.25 }),
      place(new THREE.BoxGeometry(0.9, 0.04, 0.04), { y: 1.25, z: -0.5, rx: 0.4 }),
    ]);
    const cm = bag.mat(new THREE.MeshStandardMaterial({ color: '#3a3f48', roughness: 0.4, metalness: 0.6 }));
    for (const [x, z] of [[-7.2, 6.5], [7.2, 6.5], [-9.5, 1.5], [9.5, 1.5]]) {
      const m = new THREE.Mesh(camGeo, cm); m.position.set(x, 0, z); m.rotation.y = facing(x, z, 0, 0); m.castShadow = shadowsOn; scene.add(m);
    }
    bag.geo(camGeo);
    // pilares LED laterais
    const pill = bag.geo(new THREE.BoxGeometry(0.3, 6.2, 0.3));
    const pm1 = bag.mat(new THREE.MeshBasicMaterial({ color: chA.clone().multiplyScalar(1.3), toneMapped: false }));
    const pm2 = bag.mat(new THREE.MeshBasicMaterial({ color: chB.clone().multiplyScalar(1.3), toneMapped: false }));
    for (const [x, z, m] of [[-10.5, -2, pm1], [10.5, -2, pm2], [-12, 2.5, pm2], [12, 2.5, pm1]]) { const p = new THREE.Mesh(pill, m); p.position.set(x, 3.1, z); scene.add(p); }
  }

  // ---------------- luzes
  scene.add(new THREE.HemisphereLight('#a9b8d6', '#0b0d12', 0.45));
  const key = new THREE.SpotLight('#fff3e2', 140, 30, 0.75, 0.6, 1.2);
  key.position.set(-3, 7.5, 7); key.target.position.set(0, 1, 0.3);
  key.castShadow = shadowsOn; key.shadow.mapSize.set(1024, 1024); key.shadow.bias = -0.0005;
  scene.add(key, key.target);
  const key2 = new THREE.SpotLight('#e8f0ff', 100, 30, 0.75, 0.6, 1.2);
  key2.position.set(3.5, 7.5, 7); key2.target.position.set(0, 1, 0.3); scene.add(key2, key2.target);
  const fill = new THREE.DirectionalLight('#ffffff', 0.7); fill.position.set(0, 3, 12); fill.target.position.set(0, 1.4, 0); scene.add(fill, fill.target);
  const rimA = new THREE.PointLight(channel.color, 30, 14, 1.5); rimA.position.set(-5, 3.5, -3.5); scene.add(rimA);
  const rimB = new THREE.PointLight(channel.color2, 30, 14, 1.5); rimB.position.set(5, 3.5, -3.5); scene.add(rimB);

  // ---------------- planos de câmara
  const shotState = { from: new THREE.Vector3(), to: new THREE.Vector3(), target: new THREE.Vector3(), t: 0, dur: 9, glide: null };
  const v = new THREE.Vector3();
  function closeup(grp, back) {
    const head = grp.localToWorld(v.set(0, 1.6, back).clone());
    const fwd = new THREE.Vector3(Math.sin(grp.rotation.y), 0, Math.cos(grp.rotation.y));
    const side = new THREE.Vector3(fwd.z, 0, -fwd.x);
    const from = head.clone().addScaledVector(fwd, 2.7).addScaledVector(side, 0.45).add(new THREE.Vector3(0, 0.1, 0));
    const to = head.clone().addScaledVector(fwd, 2.15).addScaledVector(side, 0.35).add(new THREE.Vector3(0, 0.08, 0));
    return { from, to, target: head.clone().add(new THREE.Vector3(0, -0.07, 0)) };
  }
  function shotDef(target) {
    if (target === 'moderator') return closeup(modGrp, -0.1);
    if (typeof target === 'number' && lecterns[target]) return closeup(lecterns[target].grp, -0.52);
    if (target === 'two' && N === 2) return { from: new THREE.Vector3(0, 2.0, 7.0), to: new THREE.Vector3(0, 1.95, 6.2), target: new THREE.Vector3(0, 1.4, 0) };
    if (N > 2) return { from: new THREE.Vector3(0, 4.6, 15.5), to: new THREE.Vector3(0, 4.3, 14.3), target: new THREE.Vector3(0, 2.4, -1) };
    return { from: new THREE.Vector3(0, 3.3, 12.5), to: new THREE.Vector3(0, 3.1, 11.4), target: new THREE.Vector3(0, 2.25, -1.2) };
  }
  let currentShot = 'wide';
  function shot(target = 'wide', animate = false) {
    const d = shotDef(target);
    currentShot = target;
    if (animate) shotState.glide = { fromPos: camera.position.clone(), fromTarget: shotState.target.clone(), t: 0 };
    else shotState.glide = null;
    shotState.from.copy(d.from); shotState.to.copy(d.to); shotState.target.copy(d.target); shotState.t = 0;
    if (!animate) { camera.position.copy(d.from); camera.lookAt(d.target); }
  }
  shot('wide');

  let talking = null;
  function personPose(i, t) {
    const L = lecterns[i];
    if (L.react && t < L.reactUntil) return L.react;
    return talking === i ? 'podiumTalk' : 'podium';
  }

  const ctrl = {
    scene, camera,
    update(dt, t) {
      // câmara
      shotState.t += dt;
      const k = easeInOut(Math.min(1, shotState.t / shotState.dur));
      const base = v.copy(shotState.from).lerp(shotState.to, k);
      if (shotState.glide) {
        const gl = shotState.glide; gl.t += dt;
        const gk = easeInOut(Math.min(1, gl.t / 1.2));
        camera.position.copy(gl.fromPos).lerp(base, gk);
        const tg = gl.fromTarget.clone().lerp(shotState.target, gk);
        camera.lookAt(tg);
        if (gk >= 1) shotState.glide = null;
      } else { camera.position.copy(base); camera.lookAt(shotState.target); }
      // parede LED (20 fps)
      wallAcc += dt;
      if (wallAcc > 0.05 || wallDirty) { wallAcc = 0; wallDirty = false; drawWall(t); }
      // participantes
      lecterns.forEach((L, i) => {
        animatePerson(L.person, personPose(i, t), t, 1 - Math.exp(-dt * 9));
        const pulse = talking === i ? 1.0 + Math.sin(t * 8) * 0.45 : 0.75;
        L.stripMat.color.copy(L.base).multiplyScalar(pulse);
      });
      animatePerson(modPerson, talking === 'moderator' ? 'podiumTalk' : 'podium', t + 4, 1 - Math.exp(-dt * 9));
      coneMats.forEach((m, i) => { m.opacity = 0.14 + Math.sin(t * 1.3 + i) * 0.015; });
    },
    shot,
    setTalking(who) { talking = who; },
    react(index, kind) {
      const L = lecterns[index]; if (!L) return;
      const map = { nod: 'nod', shake: 'headshake', laugh: 'laugh', angry: 'angryPodium' };
      L.react = map[kind] || 'nod';
      L.reactUntil = performance.now() / 1000 + 1e9; // marcado; ajustado no próximo update
      L._pending = 1.5;
    },
    setScreenText(text) { tickerText = String(text || ''); wallDirty = true; },
    get currentShot() { return currentShot; },
    dispose() {
      reflector?.dispose();
      bag.dispose();
    },
  };
  // ajuste dos tempos de reação no relógio do motor
  const baseUpdate = ctrl.update;
  ctrl.update = (dt, t) => {
    for (const L of lecterns) if (L._pending) { L.reactUntil = t + L._pending; L._pending = 0; }
    baseUpdate(dt, t);
  };
  return ctrl;
}
