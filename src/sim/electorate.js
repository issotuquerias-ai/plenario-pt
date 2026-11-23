// Modelo de eleitorado: arquétipos de eleitores por círculo + escolha multinomial (logit).
// Na criação do jogo é calibrado (bónus regionais) para reproduzir os resultados de 2025.
import { DISTRICTS, DISTRICT_BY_ID } from '../data/districts.js';
import { invNorm, halton } from '../core/rng.js';
import { clamp } from '../core/util.js';

export const BETA = 0.028;          // sensibilidade ideológica
export const ALPHA_AWARE = 1.0;     // penalização por desconhecimento (partidos novos)
const W = { econ: 1, social: 0.9, sistema: 0.75 };
const N_ARCH = 64, SD = 4.0;

let ARCH = null;
export function archetypes() {
  if (ARCH) return ARCH;
  const Z = [];
  for (let i = 1; i <= N_ARCH; i++) Z.push([invNorm(halton(i, 2)), invNorm(halton(i, 3)), invNorm(halton(i, 5))]);
  ARCH = {};
  for (const d of DISTRICTS) {
    ARCH[d.id] = Z.map(z => ({
      econ: clamp(d.lean.econ + SD * z[0], -10, 10),
      social: clamp(d.lean.social + SD * z[1], -10, 10),
      sistema: clamp(d.lean.sistema + SD * z[2], -10, 10),
    }));
  }
  return ARCH;
}

// Um partido concorre neste círculo?
export function runsIn(G, p, did) {
  if (p.withdrawn) return false;
  if (p.pseudo) return true;
  if (p.isCustom) return !p.districts || p.districts.includes(did);
  if (p.dissolved) return false;
  const d = DISTRICT_BY_ID[did];
  return d.results2025[p.id] != null;
}

export function runningParties(G, did) {
  return G.partyIds.map(id => G.parties[id]).filter(p => runsIn(G, p, did));
}

function awarenessTerm(p) { return p.isCustom ? ALPHA_AWARE * Math.log(clamp(p.awareness ?? 1, 0.01, 1)) : 0; }

// Utilidade "fixa" de um partido num círculo (sem a componente ideológica)
export function baseUtility(G, p, did, opts = {}) {
  if (opts.calib) return G.electorate.bonus[did]?.[p.id] || 0;
  const camp = G.districts[did]?.camp?.[p.id] || 0;
  return (G.electorate.bonus[did]?.[p.id] || 0) + (p.valence || 0) + awarenessTerm(p) + camp + (opts.noise?.[p.id] || 0);
}

// Quotas (0..1) de cada partido no círculo, entre votos válidos.
export function districtShares(G, did, opts = {}) {
  const arch = archetypes()[did];
  const parties = runningParties(G, did);
  const n = parties.length;
  const base = parties.map(p => baseUtility(G, p, did, opts));
  const pos = parties.map(p => p.ideology);
  const acc = new Float64Array(n);
  const u = new Float64Array(n);
  for (const a of arch) {
    let max = -Infinity;
    for (let i = 0; i < n; i++) {
      const q = pos[i];
      const d2 = W.econ * (a.econ - q.econ) ** 2 + W.social * (a.social - q.social) ** 2 + W.sistema * (a.sistema - q.sistema) ** 2;
      u[i] = -BETA * d2 + base[i];
      if (u[i] > max) max = u[i];
    }
    let s = 0;
    for (let i = 0; i < n; i++) { u[i] = Math.exp(u[i] - max); s += u[i]; }
    for (let i = 0; i < n; i++) acc[i] += u[i] / s;
  }
  const out = {};
  for (let i = 0; i < n; i++) out[parties[i].id] = acc[i] / arch.length;
  return out;
}

export function expectedValidVotes(G, d) {
  const t = clamp(d.turnout + (G.turnoutShift || 0), 8, 90);
  return d.registered * t / 100 * (1 - d.blankNull / 100);
}

// Apoio nacional (quotas de votos válidos) + detalhe por círculo
export function nationalShares(G, opts = {}) {
  const tot = {}; let all = 0; const byDistrict = {};
  for (const d of DISTRICTS) {
    const s = districtShares(G, d.id, opts);
    byDistrict[d.id] = s;
    const v = expectedValidVotes(G, d);
    all += v;
    for (const pid in s) tot[pid] = (tot[pid] || 0) + s[pid] * v;
  }
  const shares = {};
  for (const pid in tot) shares[pid] = tot[pid] / all;
  return { shares, byDistrict };
}

// Calibração: ajusta G.electorate.bonus para reproduzir as percentagens de 2025 em cada círculo.
export function calibrate(G) {
  G.electorate = G.electorate || {};
  G.electorate.bonus = {};
  for (const d of DISTRICTS) {
    const parties = runningParties(G, d.id).filter(p => !p.isCustom);
    const tgt = {};
    let tsum = 0;
    for (const p of parties) { const v = d.results2025[p.id] ?? 0.05; tgt[p.id] = Math.max(0.02, v); tsum += tgt[p.id]; }
    for (const k in tgt) tgt[k] /= tsum;
    const b = {}; parties.forEach(p => (b[p.id] = 0));
    G.electorate.bonus[d.id] = b;
    // Excluir temporariamente o partido do jogador (se existir) durante a calibração
    const saved = {};
    for (const id of G.partyIds) { const p = G.parties[id]; if (p.isCustom) { saved[id] = p.withdrawn; p.withdrawn = true; } }
    for (let it = 0; it < 80; it++) {
      const s = districtShares(G, d.id, { calib: true });
      let err = 0;
      for (const pid in tgt) { const delta = Math.log(tgt[pid]) - Math.log(Math.max(1e-7, s[pid])); b[pid] += 0.95 * delta; err = Math.max(err, Math.abs(delta)); }
      if (err < 1e-4) break;
    }
    for (const id in saved) G.parties[id].withdrawn = saved[id];
  }
}

// Bónus inicial de um partido novo: abaixo dos partidos estabelecidos (sem marca nem estrutura).
export function initCustomPartyBonus(G, p) {
  for (const d of DISTRICTS) {
    const b = G.electorate.bonus[d.id];
    const ref = ['ad', 'ps', 'ch'].map(k => b[k]).filter(x => x != null);
    const mean = ref.reduce((s, x) => s + x, 0) / Math.max(1, ref.length);
    const offset = G.difficulty === 'facil' ? -1.45 : G.difficulty === 'dificil' ? -2.1 : -1.75;
    let bonus = mean + offset;
    const leader = G.people[p.leaderId];
    if (leader?.home === d.id) bonus += 0.35;
    if (p.regionalFocus && p.regionalFocus.includes(d.id)) bonus += 0.25;
    b[p.id] = bonus;
  }
}
