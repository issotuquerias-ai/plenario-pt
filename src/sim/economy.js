// Modelo macroeconómico simplificado de Portugal (valores de partida ≈ 2026) e satisfação dos grupos sociais.
import { GROUPS } from '../data/ministries.js';
import { rng } from '../core/rng.js';
import { clamp, lerp } from '../core/util.js';

export function initEconomy() {
  return {
    gdpGrowth: 1.9, unemployment: 6.4, inflation: 2.3, balance: 0.3, debt: 90.2, gdp: 302,
    minWage: 920, avgWage: 1660, housingGrowth: 9.5, waiting: 55, crime: 50, emigration: 50,
    rating: 'A', yield10: 3.1, confidence: 52, revenue: 43.6, spending: 43.3,
    taxes: { irsAdj: 0, irc: 19, iva: 23 },
    spendingAreas: { saude: 15.8, educacao: 8.9, social: 32.5, defesa: 3.6, seguranca: 2.9, habitacao: 1.3, infraestruturas: 3.2, cultura: 0.7, ambiente: 1.1, juros: 6.0, outros: 13.0 }, // mil M€
    structural: { gdp: 0, unemployment: 0, inflation: 0, balance: 0, housing: 0, waiting: 0, crime: 0, emigration: 0 },
    shock: { gdp: 0, unemployment: 0, inflation: 0 },
    prr: 100, // execução/risco dos fundos europeus (100 = em dia)
    history: [],
  };
}

export function initGroups() {
  const base = { pensionistas: 47, jovens: 40, trabalhadores: 45, funcpublicos: 44, empresarios: 52, agricultores: 42, classe_media: 45, professores: 46, saude: 38, seguranca: 41, interior: 39, imigrantes: 40 };
  const g = {};
  for (const gr of GROUPS) g[gr.id] = { sat: base[gr.id] ?? 45, offset: 0 };
  return g;
}

// Aplica efeitos económicos (de leis/eventos). longRun=true → estrutural; caso contrário choque temporário.
export function applyEconEffects(G, econ = {}, longRun = true) {
  const E = G.economy; if (!E || !econ) return;
  const tgt = longRun ? E.structural : E.shock;
  if (econ.gdp) (longRun ? (E.structural.gdp += econ.gdp) : (E.shock.gdp += econ.gdp));
  if (econ.unemployment) (longRun ? (E.structural.unemployment += econ.unemployment) : (E.shock.unemployment += econ.unemployment));
  if (econ.inflation) (longRun ? (E.structural.inflation += econ.inflation) : (E.shock.inflation += econ.inflation));
  if (econ.deficit) E.structural.balance -= econ.deficit;
  if (econ.debt) E.debt = clamp(E.debt + econ.debt, 20, 250);
  if (econ.housing) E.structural.housing += econ.housing;
  if (econ.waiting) E.structural.waiting += econ.waiting;
  if (econ.crime) E.structural.crime += econ.crime;
  if (econ.emigration) E.structural.emigration += econ.emigration;
  void tgt;
}

// Custo anual (M€) → efeito no saldo orçamental (% do PIB)
export function applyAnnualCost(G, meur) {
  if (!meur) return;
  const E = G.economy;
  E.structural.balance -= meur / (E.gdp * 1000) * 100;
}

const RATINGS = ['AAA', 'AA+', 'AA', 'AA-', 'A+', 'A', 'A-', 'BBB+', 'BBB', 'BBB-', 'BB+', 'BB', 'B', 'CCC'];

// Evolução mensal da economia
export function economyTick(G) {
  const E = G.economy, S = E.structural;
  const instability = (G.government?.stability != null ? (50 - G.government.stability) / 100 : 0) + (G.regime?.active ? 0.6 : 0);
  const cycle = Math.sin((G.monthIndex || 0) / 9) * 0.25;
  const gTarget = 1.8 + S.gdp + E.shock.gdp + cycle - instability * 1.5 + (E.prr - 100) / 200;
  E.gdpGrowth = lerp(E.gdpGrowth, gTarget, 0.18) + rng.gauss(0, 0.06);
  const uTarget = 6.4 + S.unemployment + E.shock.unemployment - 0.35 * (E.gdpGrowth - 1.8);
  E.unemployment = clamp(lerp(E.unemployment, uTarget, 0.12) + rng.gauss(0, 0.04), 2, 30);
  const iTarget = 2.0 + S.inflation + E.shock.inflation + 0.15 * (E.gdpGrowth - 1.8);
  E.inflation = clamp(lerp(E.inflation, iTarget, 0.15) + rng.gauss(0, 0.05), -2, 25);
  const bTarget = 0.3 + S.balance + 0.3 * (E.gdpGrowth - 1.8) - instability * 0.8;
  E.balance = lerp(E.balance, bTarget, 0.1) + rng.gauss(0, 0.03);
  const nominal = E.gdpGrowth + E.inflation;
  E.debt = clamp(E.debt - E.balance / 12 - E.debt * (nominal / 100) / 12, 20, 250);
  E.gdp = E.gdp * (1 + nominal / 100 / 12);
  E.housingGrowth = clamp(lerp(E.housingGrowth, 7 + S.housing + 0.8 * (E.gdpGrowth - 1.8), 0.08) + rng.gauss(0, 0.2), -15, 30);
  E.waiting = clamp(lerp(E.waiting, 55 + S.waiting, 0.1) + rng.gauss(0, 0.4), 0, 100);
  E.crime = clamp(lerp(E.crime, 50 + S.crime + (E.unemployment - 6.4) * 1.2, 0.1) + rng.gauss(0, 0.4), 0, 100);
  E.emigration = clamp(lerp(E.emigration, 50 + S.emigration + (E.housingGrowth - 7) * 0.8 + (E.unemployment - 6.4) * 1.5, 0.08) + rng.gauss(0, 0.4), 0, 100);
  E.avgWage *= 1 + (E.inflation + 0.6 * Math.max(0, E.gdpGrowth)) / 100 / 12;
  // choques temporários decaem
  for (const k in E.shock) E.shock[k] *= 0.85;
  // juros e rating
  const risk = (E.debt - 90) / 40 - E.balance / 3 + instability * 2 + (G.regime?.active ? 3 : 0);
  E.yield10 = clamp(lerp(E.yield10, 3.0 + risk * 0.9, 0.2), 0.5, 18);
  E.confidence = clamp(lerp(E.confidence, 52 + (E.gdpGrowth - 1.8) * 8 - (E.unemployment - 6.4) * 3 - instability * 30, 0.2), 0, 100);
  let idx = RATINGS.indexOf(E.rating); if (idx < 0) idx = 5;
  const ideal = clamp(Math.round(5 + risk * 1.6), 0, RATINGS.length - 1);
  E.ratingChange = 0;
  if ((G.monthIndex || 0) % 4 === 0 && ideal !== idx) { const n = idx + Math.sign(ideal - idx); E.ratingChange = n - idx; E.rating = RATINGS[n]; }
  E.history.push({ date: G.date, gdp: E.gdpGrowth, unemp: E.unemployment, infl: E.inflation, bal: E.balance, debt: E.debt });
  if (E.history.length > 72) E.history.shift();
}

// Equilíbrio de satisfação de cada grupo face à economia
function groupTarget(G, id) {
  const E = G.economy;
  switch (id) {
    case 'pensionistas': return 48 - (E.inflation - 2) * 3.5 - (E.waiting - 55) * 0.25;
    case 'jovens': return 42 - (E.housingGrowth - 7) * 1.1 - (E.emigration - 50) * 0.2 - (E.unemployment - 6.4) * 1.5;
    case 'trabalhadores': return 46 - (E.unemployment - 6.4) * 2.5 - (E.inflation - 2) * 2 + (E.minWage - 920) / 20;
    case 'funcpublicos': return 45 - (E.inflation - 2) * 2.5;
    case 'empresarios': return 52 + (E.gdpGrowth - 1.8) * 4 - (E.taxes.irc - 19) * 1.5 - (E.minWage - 920) / 40;
    case 'agricultores': return 42 + (E.gdpGrowth - 1.8) * 1.5;
    case 'classe_media': return 46 - (E.housingGrowth - 7) * 0.8 - (E.inflation - 2) * 2 - E.taxes.irsAdj * 1.5;
    case 'professores': return 46;
    case 'saude': return 40 - (E.waiting - 55) * 0.3;
    case 'seguranca': return 42 - (E.crime - 50) * 0.2;
    case 'interior': return 40 + (E.gdpGrowth - 1.8);
    case 'imigrantes': return 42;
    default: return 45;
  }
}

export function groupsTick(G) {
  for (const id in G.groups) {
    const gr = G.groups[id];
    const t = clamp(groupTarget(G, id) + gr.offset, 2, 98);
    gr.sat = clamp(lerp(gr.sat, t, 0.15) + rng.gauss(0, 0.5), 0, 100);
    gr.offset *= 0.96; // efeitos de políticas e eventos decaem lentamente
  }
}

export function applyGroupEffects(G, groups = {}) {
  for (const id in groups) if (G.groups[id]) { G.groups[id].offset += groups[id]; G.groups[id].sat = clamp(G.groups[id].sat + groups[id] * 0.5, 0, 100); }
}

// Média ponderada da satisfação (para aprovação do governo)
export function groupsAverage(G) {
  let s = 0, w = 0;
  for (const gr of GROUPS) { if (!gr.weight) continue; s += G.groups[gr.id].sat * gr.weight; w += gr.weight; }
  return s / w;
}
