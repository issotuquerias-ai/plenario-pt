// Estado global do jogo (G) e definições. Exportado como "live binding".
import { loadSettings, saveSettings } from './save.js';

export let G = null;
export function setG(g) { G = g; }

export let SETTINGS = loadSettings();
export function updateSettings(patch) {
  SETTINGS = { ...SETTINGS, ...patch, ai: { ...SETTINGS.ai, ...(patch.ai || {}) } };
  saveSettings(SETTINGS);
  return SETTINGS;
}

// Helpers de acesso
export const party = id => G?.parties?.[id];
export const person = id => G?.people?.[id];
export const playerParty = () => G?.parties?.[G.playerPartyId];
export const leaderOf = pid => G?.people?.[G?.parties?.[pid]?.leaderId];
export function realParties() { return Object.values(G.parties).filter(p => !p.pseudo); }
export function addNews(headline, opts = {}) {
  if (!G) return;
  G.news.unshift({ date: G.date, headline, tone: opts.tone || 'neutral', area: opts.area || null, source: opts.source || null });
  if (G.news.length > 120) G.news.length = 120;
}
export function addLog(text, type = 'info') {
  if (!G) return;
  G.log.unshift({ date: G.date, text, type });
  if (G.log.length > 300) G.log.length = 300;
}
