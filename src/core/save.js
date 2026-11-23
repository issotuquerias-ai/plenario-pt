// Gravação de jogos (localStorage) + exportação/importação em ficheiro + definições.
import { rng } from './rng.js';

const PREFIX = 'plenario.save.';
const INDEX = 'plenario.saves.index';
const SETTINGS = 'plenario.settings';
export const SLOTS = ['auto', '1', '2', '3', '4', '5'];

function safeGet(k) { try { return localStorage.getItem(k); } catch { return null; } }
function safeSet(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { console.warn('localStorage', e); return false; } }
function safeDel(k) { try { localStorage.removeItem(k); } catch { } }

export function listSaves() {
  let idx = {};
  try { idx = JSON.parse(safeGet(INDEX) || '{}'); } catch { idx = {}; }
  return SLOTS.map(slot => ({ slot, ...(idx[slot] || {}), empty: !idx[slot] }));
}

export function saveGame(slot, G) {
  G.rngState = rng.state;
  G.savedAt = new Date().toISOString();
  const data = JSON.stringify(G);
  if (!safeSet(PREFIX + slot, data)) return false;
  let idx = {};
  try { idx = JSON.parse(safeGet(INDEX) || '{}'); } catch { }
  const p = G.parties?.[G.playerPartyId];
  idx[slot] = { savedAt: G.savedAt, date: G.date, phase: G.phase, party: p ? p.short : '?', partyColor: p?.color, leader: G.people?.[p?.leaderId]?.name || '', size: data.length };
  safeSet(INDEX, JSON.stringify(idx));
  return true;
}

export function loadGame(slot) {
  const raw = safeGet(PREFIX + slot);
  if (!raw) return null;
  try { const G = JSON.parse(raw); if (G.rngState) rng.state = G.rngState; return G; } catch (e) { console.error(e); return null; }
}

export function deleteSave(slot) {
  safeDel(PREFIX + slot);
  let idx = {}; try { idx = JSON.parse(safeGet(INDEX) || '{}'); } catch { }
  delete idx[slot]; safeSet(INDEX, JSON.stringify(idx));
}

export function exportSave(G) {
  G.rngState = rng.state;
  const blob = new Blob([JSON.stringify(G)], { type: 'application/json' });
  const a = document.createElement('a');
  const p = G.parties?.[G.playerPartyId];
  a.href = URL.createObjectURL(blob);
  a.download = `plenario_${(p?.short || 'jogo').replace(/[^\w-]/g, '')}_${G.date}.json`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

export function importSave(file) {
  return new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => { try { const G = JSON.parse(fr.result); if (!G || !G.parties || !G.phase) throw new Error('Ficheiro inválido'); if (G.rngState) rng.state = G.rngState; res(G); } catch (e) { rej(e); } };
    fr.onerror = rej; fr.readAsText(file);
  });
}

export const DEFAULT_SETTINGS = {
  volume: 0.7, sfx: true, ambience: true,
  quality: 'high', debateTimer: true, autosave: true, tutorial: true,
  ai: { enabled: false, url: 'http://localhost:11434', model: 'llama3.2', useInDebates: false, timeout: 45 },
};
export function loadSettings() {
  try { const s = JSON.parse(safeGet(SETTINGS) || '{}'); return { ...DEFAULT_SETTINGS, ...s, ai: { ...DEFAULT_SETTINGS.ai, ...(s.ai || {}) } }; }
  catch { return { ...DEFAULT_SETTINGS }; }
}
export function saveSettings(s) { safeSet(SETTINGS, JSON.stringify(s)); }
