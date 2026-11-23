// Aplicação genérica de efeitos (eventos, leis, decisões).
import { applyEconEffects, applyAnnualCost, applyGroupEffects } from './economy.js';
import { localBoost, awarenessBoost, valenceBoost } from './campaign.js';
import { changePresidentRelation } from './president.js';
import { rng } from '../core/rng.js';
import { clamp } from '../core/util.js';
import { addNews } from '../core/state.js';
import { DISTRICTS } from '../data/districts.js';

export function govPartyIds(G) {
  const g = G.government; if (!g) return [];
  return [...new Set([g.pmPartyId, ...(g.coalition || [])])];
}

export function applyEffects(G, eff = {}, opts = {}) {
  if (!eff) return;
  const longRun = opts.longRun ?? false;
  if (eff.approval && G.government) G.government.approval = clamp(G.government.approval + eff.approval, 3, 97);
  if (eff.valence) for (const k in eff.valence) {
    const v = eff.valence[k];
    if (k === 'gov') govPartyIds(G).forEach(pid => valenceBoost(G, pid, v));
    else if (k === 'player') valenceBoost(G, G.playerPartyId, v);
    else if (G.parties[k]) valenceBoost(G, k, v);
  }
  if (eff.awareness?.player) awarenessBoost(G, G.playerPartyId, eff.awareness.player);
  if (eff.econ) applyEconEffects(G, eff.econ, longRun);
  if (eff.budget) G.economy.balance -= eff.budget / (G.economy.gdp * 1000) * 100;
  if (eff.annualCost) applyAnnualCost(G, eff.annualCost);
  if (eff.groups) applyGroupEffects(G, eff.groups);
  if (eff.relations) for (const pid in eff.relations) {
    const me = G.parties[G.playerPartyId], o = G.parties[pid]; if (!o || !me) continue;
    me.relations[pid] = clamp((me.relations[pid] || 0) + eff.relations[pid], -100, 100);
    o.relations[G.playerPartyId] = clamp((o.relations[G.playerPartyId] || 0) + eff.relations[pid], -100, 100);
  }
  if (eff.president) changePresidentRelation(G, eff.president);
  if (eff.unrest) G.unrest = clamp((G.unrest ?? 25) + eff.unrest, 0, 100);
  if (eff.eu) G.euRelations = clamp((G.euRelations ?? 70) + eff.eu, 0, 100);
  if (eff.media) G.media = clamp((G.media ?? 50) + eff.media, 0, 100);
  if (eff.stability && G.government) G.government.stability = clamp((G.government.stability ?? 50) + eff.stability, 0, 100);
  if (eff.regime && G.regime) for (const k in eff.regime) if (G.regime[k] != null) G.regime[k] = clamp(G.regime[k] + eff.regime[k], 0, 100);
  // efeitos de campanha
  if (G.campaign && G.phase === 'campaign') {
    if (eff.money) G.campaign.money += eff.money;
    if (eff.energy) G.campaign.energy = clamp(G.campaign.energy + eff.energy, 0, 100);
    if (eff.localSupport) {
      const ls = eff.localSupport;
      let did = ls.district;
      if (did === 'current') did = G.campaign.lastDistrict || 'lisboa';
      if (did === 'random' || !G.districts[did]) did = rng.pick(DISTRICTS).id;
      localBoost(G, G.playerPartyId, did, ls.value || 0);
    }
    if (eff.topic) G.campaign.topic = eff.topic;
  }
  if (eff.news) addNews(eff.news, { tone: opts.tone || 'neutral' });
}

// Resumo legível dos efeitos (para pré-visualização nas escolhas)
export function describeEffects(eff = {}) {
  const out = [];
  const sign = v => (v > 0 ? '▲' : '▼');
  if (eff.approval) out.push({ k: 'Aprovação', v: eff.approval, good: eff.approval > 0 });
  if (eff.econ) {
    const map = { gdp: ['PIB', 1], unemployment: ['Desemprego', -1], inflation: ['Inflação', -1], deficit: ['Défice', -1], debt: ['Dívida', -1], housing: ['Preço das casas', -1], waiting: ['Listas de espera', -1], crime: ['Criminalidade', -1], emigration: ['Emigração', -1] };
    for (const k in eff.econ) if (map[k] && eff.econ[k]) out.push({ k: map[k][0], v: eff.econ[k], good: eff.econ[k] * map[k][1] > 0 });
  }
  if (eff.budget) out.push({ k: 'Custo', v: -eff.budget, good: eff.budget < 0, unit: 'M€' });
  if (eff.groups) for (const g in eff.groups) if (eff.groups[g]) out.push({ k: g, v: eff.groups[g], good: eff.groups[g] > 0, group: true });
  if (eff.unrest) out.push({ k: 'Tensão social', v: eff.unrest, good: eff.unrest < 0 });
  if (eff.eu) out.push({ k: 'Relação com a UE', v: eff.eu, good: eff.eu > 0 });
  if (eff.president) out.push({ k: 'Relação com o PR', v: eff.president, good: eff.president > 0 });
  if (eff.stability) out.push({ k: 'Estabilidade', v: eff.stability, good: eff.stability > 0 });
  void sign;
  return out;
}
