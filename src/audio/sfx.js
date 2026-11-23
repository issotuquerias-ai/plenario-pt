// Sons procedimentais com WebAudio (sem ficheiros externos).
import { SETTINGS } from '../core/state.js';

let ctx = null, master = null, ambNode = null, ambGain = null;
function ac() {
  if (!ctx) {
    try { ctx = new (window.AudioContext || window.webkitAudioContext)(); master = ctx.createGain(); master.connect(ctx.destination); } catch { return null; }
  }
  master.gain.value = SETTINGS.sfx ? SETTINGS.volume : 0;
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}
export function setVolume() { if (master) master.gain.value = SETTINGS.sfx ? SETTINGS.volume : 0; if (ambGain) ambGain.gain.value = SETTINGS.ambience ? 0.12 * SETTINGS.volume : 0; }

function noiseBuffer(sec = 2) {
  const c = ac(); const b = c.createBuffer(1, c.sampleRate * sec, c.sampleRate); const d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b;
}
function tone(freq, dur, { type = 'sine', vol = 0.2, attack = 0.005, when = 0, slide = 0 } = {}) {
  const c = ac(); if (!c) return;
  const t = c.currentTime + when; const o = c.createOscillator(); const g = c.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t); if (slide) o.frequency.exponentialRampToValueAtTime(freq * slide, t + dur);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + attack); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.05);
}

export const sfx = {
  click() { tone(880, 0.06, { type: 'triangle', vol: 0.08 }); },
  hover() { tone(1400, 0.03, { type: 'sine', vol: 0.025 }); },
  good() { tone(660, 0.12, { type: 'triangle', vol: 0.12 }); tone(990, 0.18, { type: 'triangle', vol: 0.1, when: 0.09 }); },
  bad() { tone(300, 0.2, { type: 'sawtooth', vol: 0.06, slide: 0.6 }); },
  coin() { tone(1200, 0.08, { type: 'square', vol: 0.05 }); tone(1600, 0.12, { type: 'square', vol: 0.05, when: 0.07 }); },
  notify() { tone(784, 0.1, { vol: 0.1 }); tone(1047, 0.16, { vol: 0.1, when: 0.1 }); },
  bell() { // campainha do Presidente da AR
    const c = ac(); if (!c) return;
    for (let i = 0; i < 3; i++) { [1, 2.76, 5.4].forEach((m, j) => tone(1180 * m, 0.9 - j * 0.2, { vol: 0.08 / (j + 1), when: i * 0.16 })); }
  },
  gavel() { tone(140, 0.15, { type: 'square', vol: 0.12, slide: 0.5 }); },
  jingle() { // genérico de debate televisivo
    const n = [523, 659, 784, 1047, 784, 1047, 1319];
    n.forEach((f, i) => tone(f, 0.28, { type: 'sawtooth', vol: 0.045, when: i * 0.11 }));
    tone(130, 1.2, { type: 'sine', vol: 0.18, when: 0 }); tone(196, 1.0, { type: 'triangle', vol: 0.06, when: 0.55 });
  },
  sting() { [392, 523, 659].forEach((f, i) => tone(f, 0.5, { type: 'triangle', vol: 0.08, when: i * 0.06 })); },
  applause(dur = 2.2, intensity = 1) {
    const c = ac(); if (!c) return;
    const src = c.createBufferSource(); src.buffer = noiseBuffer(dur + 0.5);
    const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2200; bp.Q.value = 0.6;
    const g = c.createGain(); const t = c.currentTime;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.35 * intensity, t + 0.25); g.gain.setValueAtTime(0.35 * intensity, t + dur * 0.6); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    // "palmas" individuais por modulação
    const lfo = c.createOscillator(); lfo.frequency.value = 11; const lg = c.createGain(); lg.gain.value = 0.12 * intensity; lfo.connect(lg); lg.connect(g.gain);
    src.connect(bp); bp.connect(g); g.connect(master); src.start(t); lfo.start(t); src.stop(t + dur + 0.1); lfo.stop(t + dur + 0.1);
  },
  boo() { tone(180, 1.1, { type: 'sawtooth', vol: 0.05, slide: 0.8 }); tone(150, 1.0, { type: 'sawtooth', vol: 0.04, slide: 0.85, when: 0.1 }); },
  type() { tone(2000 + Math.random() * 400, 0.015, { type: 'square', vol: 0.015 }); },
};

// Ambiente contínuo (multidão / sala) com volume controlado
export function ambience(kind) {
  const c = ac(); if (!c) return;
  stopAmbience();
  if (!kind || !SETTINGS.ambience) return;
  const src = c.createBufferSource(); src.buffer = noiseBuffer(4); src.loop = true;
  const f = c.createBiquadFilter(); f.type = kind === 'rua' ? 'bandpass' : 'lowpass'; f.frequency.value = kind === 'rua' ? 900 : kind === 'estudio' ? 300 : 500; f.Q.value = 0.5;
  ambGain = c.createGain(); ambGain.gain.value = (kind === 'estudio' ? 0.04 : 0.12) * SETTINGS.volume;
  src.connect(f); f.connect(ambGain); ambGain.connect(master); src.start();
  ambNode = src;
}
export function stopAmbience() { try { ambNode?.stop(); } catch { } ambNode = null; }
