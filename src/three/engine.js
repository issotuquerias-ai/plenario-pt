// Motor 3D único (um só WebGLRenderer partilhado por todas as cenas).
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

let renderer = null;
let container = null;
let current = null;
let quality = 'high';
let envTex = null;
let ro = null;
let lastTime = 0;
let elapsed = 0;
let running = false;
const raycaster = new THREE.Raycaster();
const tmpV2 = new THREE.Vector2();

function pixelRatioFor(q) {
  const dpr = window.devicePixelRatio || 1;
  if (q === 'high') return Math.min(dpr, 2);
  if (q === 'medium') return Math.min(dpr, 1.25);
  return 1;
}

function size() {
  if (!container) return { w: 1, h: 1 };
  const w = Math.max(1, container.clientWidth || window.innerWidth);
  const h = Math.max(1, container.clientHeight || window.innerHeight);
  return { w, h };
}

function applyResize() {
  if (!renderer) return;
  const { w, h } = size();
  renderer.setSize(w, h, false);
  if (current && current.camera) {
    if (current.camera.isPerspectiveCamera) {
      current.camera.aspect = w / h;
      current.camera.updateProjectionMatrix();
    }
    try { current.onResize?.(w, h); } catch (e) { console.error(e); }
  }
}

function forward(type, e) {
  if (!current || !current.onPointer) return;
  const rect = renderer.domElement.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;
  const y = -((e.clientY - rect.top) / Math.max(1, rect.height)) * 2 + 1;
  try {
    current.onPointer(type, { x, y, clientX: e.clientX, clientY: e.clientY, button: e.button, originalEvent: e });
  } catch (err) { console.error(err); }
}

function loop(now) {
  requestAnimationFrame(loop);
  const t = now / 1000;
  let dt = lastTime ? t - lastTime : 0.016;
  lastTime = t;
  dt = Math.min(Math.max(dt, 0), 0.1);
  if (!current || !renderer) return;
  elapsed += dt;
  try {
    current.update?.(dt, elapsed);
    renderer.render(current.scene, current.camera);
  } catch (err) {
    console.error('[Engine] erro na cena:', err);
  }
}

export const Engine = {
  init(el) {
    if (renderer) {
      if (el && container !== el) {
        el.appendChild(renderer.domElement);
        container = el;
        if (ro) { ro.disconnect(); ro.observe(el); }
        applyResize();
      }
      return;
    }
    container = el || document.body;
    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance', alpha: false });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.shadowMap.enabled = quality !== 'low';
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setPixelRatio(pixelRatioFor(quality));
    const c = renderer.domElement;
    Object.assign(c.style, { position: 'absolute', inset: '0', width: '100%', height: '100%', display: 'block', visibility: 'hidden', outline: 'none' });
    c.setAttribute('tabindex', '-1');
    container.appendChild(c);
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => applyResize());
      ro.observe(container);
    }
    window.addEventListener('resize', applyResize);
    applyResize();
    for (const type of ['pointermove', 'pointerdown', 'pointerup', 'click', 'wheel']) {
      c.addEventListener(type, (e) => forward(type, e), { passive: true });
    }
    c.addEventListener('contextmenu', (e) => e.preventDefault());
    if (!running) { running = true; requestAnimationFrame(loop); }
  },

  setScene(controller) {
    const prev = current;
    current = null;
    if (prev && prev !== controller) {
      try { prev.dispose?.(); } catch (e) { console.error('[Engine] dispose falhou:', e); }
    }
    if (!renderer) { current = controller || null; return; }
    if (!controller) {
      renderer.domElement.style.visibility = 'hidden';
      renderer.domElement.style.cursor = '';
      return;
    }
    current = controller;
    if (controller.scene && !controller.scene.environment && controller.useEnvironment !== false) {
      controller.scene.environment = Engine.envTexture();
    }
    try { controller.onAttach?.(renderer); } catch (e) { console.error(e); }
    applyResize();
    renderer.domElement.style.visibility = 'visible';
    renderer.domElement.style.cursor = '';
  },

  get current() { return current; },
  get renderer() { return renderer; },
  get quality() { return quality; },
  get canvas() { return renderer ? renderer.domElement : null; },

  setQuality(q) {
    if (!['low', 'medium', 'high'].includes(q)) return;
    quality = q;
    if (!renderer) return;
    renderer.setPixelRatio(pixelRatioFor(q));
    const shadows = q !== 'low';
    if (renderer.shadowMap.enabled !== shadows) {
      renderer.shadowMap.enabled = shadows;
      if (current && current.scene) {
        current.scene.traverse((o) => {
          const m = o.material;
          if (Array.isArray(m)) m.forEach(x => { x.needsUpdate = true; });
          else if (m) m.needsUpdate = true;
        });
      }
    }
    applyResize();
    try { current?.onQuality?.(q); } catch (e) { console.error(e); }
  },

  envTexture() {
    if (envTex) return envTex;
    if (!renderer) return null;
    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    envTex = pmrem.fromScene(room, 0.04).texture;
    pmrem.dispose();
    room.traverse((o) => { o.geometry?.dispose?.(); o.material?.dispose?.(); });
    return envTex;
  },

  raycast(camera, ndc, objects, recursive = true) {
    tmpV2.set(ndc.x, ndc.y);
    raycaster.setFromCamera(tmpV2, camera);
    return raycaster.intersectObjects(objects, recursive);
  },

  /** Raio a partir da câmara (útil para interseções com planos). */
  ray(camera, ndc) {
    tmpV2.set(ndc.x, ndc.y);
    raycaster.setFromCamera(tmpV2, camera);
    return raycaster.ray;
  },

  setCursor(c) { if (renderer) renderer.domElement.style.cursor = c || ''; },
};

export default Engine;
