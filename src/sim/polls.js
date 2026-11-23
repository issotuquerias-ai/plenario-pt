// Sondagens publicadas (empresas reais de estudos de opinião, valores do jogo).
import { nationalShares } from './electorate.js';
import { rng } from '../core/rng.js';
import { clamp } from '../core/util.js';

export const DEFAULT_POLLSTERS = [
  { id: 'aximage', name: 'Aximage', houseEffects: { ch: 0.8, ps: -0.4 } },
  { id: 'catolica', name: 'CESOP–Católica', houseEffects: { ad: 0.6, ch: -0.6 } },
  { id: 'intercampus', name: 'Intercampus', houseEffects: { ps: 0.5, il: -0.3 } },
  { id: 'pitagorica', name: 'Pitagórica', houseEffects: { ad: 0.4, livre: 0.3 } },
  { id: 'ics', name: 'ICS/ISCTE', houseEffects: { ps: 0.4, ch: 0.3 } },
];

let POLLSTERS = DEFAULT_POLLSTERS;
export function setPollsters(list) { if (Array.isArray(list) && list.length) POLLSTERS = list; }
export const pollsters = () => POLLSTERS;

// Gera uma sondagem nacional a partir do estado atual
export function makePoll(G, pollsterId) {
  const pol = POLLSTERS.find(p => p.id === pollsterId) || rng.pick(POLLSTERS);
  const { shares } = nationalShares(G);
  const n = rng.int(600, 1400);
  const res = {}; let tot = 0;
  for (const pid in shares) {
    const p = shares[pid];
    const sd = Math.sqrt(Math.max(p * (1 - p), 0.0004) / n) * 1.6; // efeito de desenho
    let v = (p + rng.gauss(0, sd)) * 100 + ((pol.houseEffects || {})[pid] || 0) * (p > 0.02 ? 1 : 0.2);
    v = clamp(v, 0, 100);
    res[pid] = v; tot += v;
  }
  for (const pid in res) res[pid] = Math.round((res[pid] / tot) * 1000) / 10;
  return { date: G.date, pollster: pol.name, pollsterId: pol.id, n, moe: Math.round(98 / Math.sqrt(n) * 10) / 10, results: res };
}

// Média móvel das últimas k sondagens (para o "agregador")
export function pollAverage(G, k = 4) {
  const recent = G.polls.slice(-k);
  if (!recent.length) return {};
  const acc = {};
  for (const p of recent) for (const pid in p.results) acc[pid] = (acc[pid] || 0) + p.results[pid];
  for (const pid in acc) acc[pid] /= recent.length;
  return acc;
}
