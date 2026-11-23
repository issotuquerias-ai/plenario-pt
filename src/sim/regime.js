// Rutura institucional / regime autoritário (só com maioria absoluta do partido do jogador).
// Simulação com consequências: resistência popular, Forças Armadas, pressão internacional, economia.
import { MAJORITY } from '../data/districts.js';
import { applyEffects } from './effects.js';
import { applyEconEffects } from './economy.js';
import { rng } from '../core/rng.js';
import { clamp, uid } from '../core/util.js';
import { addNews } from '../core/state.js';

export function canStartRegime(G) {
  const gov = G.government;
  if (!gov || gov.caretaker || gov.pmPartyId !== G.playerPartyId) return { ok: false, why: 'Só o Primeiro-Ministro pode tentar.' };
  if ((G.parliament.seats[G.playerPartyId] || 0) < MAJORITY) return { ok: false, why: 'Exige maioria absoluta do seu partido (116 deputados).' };
  if (G.regime?.active) return { ok: false, why: 'Já em curso.' };
  return { ok: true };
}

export function startRegime(G, method) {
  G.regime = {
    active: true, since: G.date, method, months: 0, stage: 1,
    legitimacy: clamp(G.government.approval * 0.8, 10, 70), military: 62, international: 45, repression: 25, resistance: 30, press: 45,
    decrees: [], ended: null,
  };
  G.phase = 'regime';
  G.government.stability = 70;
  applyEffects(G, { eu: -35, media: -25, president: -60, unrest: 25 });
  applyEconEffects(G, { gdp: -0.8, inflation: 0.6, debt: 2 }, false);
  const txt = {
    emergencia: 'O Governo declara um "estado de emergência nacional" e governa por decreto.',
    suspensao: 'A maioria parlamentar aprova a suspensão das eleições "até à normalização do país".',
    constituinte: 'O Governo anuncia uma "Assembleia Constituinte" para substituir a Constituição de 1976.',
  }[method] || 'Rutura da ordem constitucional.';
  addNews(txt + ' Oposição denuncia "golpe de Estado".', { tone: 'bad' });
  addNews('Bruxelas convoca reunião de urgência; Presidente da República fala ao país.', { tone: 'bad' });
}

// Decreto do regime: aplicação imediata
export function regimeDecree(G, spec) {
  const d = { id: uid('dec'), number: (G.regime.decrees.length + 1), date: G.date, title: spec.title, articles: spec.articles || [], effects: spec.effects || {}, area: spec.area };
  G.regime.decrees.push(d);
  applyEffects(G, d.effects, { longRun: true });
  const harsh = (spec.effects?.regime?.repression || 0) > 5;
  G.regime.international = clamp(G.regime.international - (harsh ? 6 : 2), 0, 100);
  addNews(`Decreto n.º ${d.number}/${String(G.date).slice(0, 4)}: ${spec.title}.`, { tone: harsh ? 'bad' : 'neutral' });
  return d;
}

// Evolução mensal; devolve um fim de jogo se ocorrer
export function regimeTick(G) {
  const R = G.regime; if (!R?.active) return null;
  R.months++;
  const E = G.economy;
  R.international = clamp(R.international - 1.8 + rng.gauss(0, 1), 0, 100);
  if (R.international < 30) applyEconEffects(G, { gdp: -0.15 }, false);
  R.resistance = clamp(R.resistance + 1.6 + (R.repression - 30) * 0.04 - (R.legitimacy - 40) * 0.04 + (E.unemployment - 7) * 0.3 + rng.gauss(0, 1.5), 0, 100);
  R.legitimacy = clamp(R.legitimacy - 0.8 - Math.max(0, R.repression - 40) * 0.03 + (E.gdpGrowth - 1) * 0.6 + rng.gauss(0, 1), 0, 100);
  R.military = clamp(R.military - 0.6 - (R.international < 30 ? 0.8 : 0) - (E.gdpGrowth < 0 ? 0.8 : 0) + rng.gauss(0, 0.8), 0, 100);
  R.press = clamp(R.press - R.repression * 0.01, 0, 100);
  const visible = R.resistance - R.repression * 0.3;
  if (R.military < 18) return end(G, 'golpe');
  if (visible > 68 && R.military < 58) return end(G, 'revolucao');
  if (R.months >= 36 && R.resistance < 35 && R.military > 55) return end(G, 'consolidado');
  if (R.months % 6 === 0) addNews(`Regime completa ${R.months} meses. Relatórios internacionais denunciam deterioração das liberdades.`, { tone: 'bad' });
  return null;
}

function end(G, kind) {
  G.regime.active = false; G.regime.ended = { kind, date: G.date };
  G.phase = 'ended';
  G.ended = { kind, date: G.date };
  const t = {
    revolucao: 'Multidões enchem as ruas; militares recusam reprimir. O regime cai e é restaurada a democracia.',
    golpe: 'Um movimento de oficiais toma os pontos estratégicos de Lisboa. O Governo é deposto.',
    consolidado: 'O regime consolidou-se. Portugal está isolado na Europa e as liberdades suspensas.',
  }[kind];
  addNews(t, { tone: 'bad' });
  return { kind, text: t };
}

export function restoreDemocracy(G) {
  G.regime.active = false; G.regime.ended = { kind: 'transicao', date: G.date };
  applyEffects(G, { eu: 20, media: 15, unrest: -20, president: 20 });
  for (const pid of [G.playerPartyId]) G.parties[pid].valence -= 0.8;
  addNews('O Governo anuncia a restauração plena da Constituição e a convocação de eleições livres.', { tone: 'good' });
}
