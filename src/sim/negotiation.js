// Negociações: coligações, acordos de incidência parlamentar e apoio a diplomas.
import { LAWS } from '../data/laws.js';
import { MINISTRIES } from '../data/ministries.js';
import { dist, ndist } from './ideology.js';
import { rng } from '../core/rng.js';
import { clamp } from '../core/util.js';

const MIN_W = Object.fromEntries(MINISTRIES.map(m => [m.id, m.weight]));

// Medidas do catálogo que o partido mais deseja (ainda não aprovadas)
export function topDemands(G, pid, n = 4) {
  const p = G.parties[pid];
  const enacted = new Set(G.laws.map(l => l.catalogId).filter(Boolean));
  return LAWS.filter(l => !enacted.has(l.id) && !l.constitutional)
    .map(l => ({ l, s: (l.partySupport?.[pid] || 0) * 2.2 + (5 - dist(p.ideology, l.ideology) * 0.5) + ((p.priorities || []).includes(l.area) ? 1.5 : 0) + (l.salience || 0) }))
    .sort((a, b) => b.s - a.s).slice(0, n).map(x => x.l);
}

export function policyValue(G, pid, lawId) {
  const l = LAWS.find(x => x.id === lawId); if (!l) return 0;
  const p = G.parties[pid];
  return clamp((l.partySupport?.[pid] || 0) * 0.45 + (1 - ndist(p.ideology, l.ideology)) * 1.1 - 0.5 + ((p.priorities || []).includes(l.area) ? 0.3 : 0), -1.5, 1.6);
}

/**
 * Avalia uma proposta de coligação/acordo.
 * offer = { type: 'coalicao' | 'acordo' | 'pontual', ministries: [ids], policies: [lawIds] }
 */
export function evaluateOffer(G, pmPid, partnerPid, offer) {
  const P = G.parties[partnerPid], PM = G.parties[pmPid];
  const reasons = [];
  const red = P.redLines || {};
  if (offer.type === 'coalicao' && (red.noCoalition || []).includes(pmPid)) return { accept: false, score: -9, reasons: [`Linha vermelha: o ${P.short} recusa entrar num governo com o ${PM.short}.`] };
  if (offer.type === 'acordo' && (red.noAgreement || []).includes(pmPid)) return { accept: false, score: -9, reasons: [`Linha vermelha: o ${P.short} recusa qualquer acordo escrito com o ${PM.short}.`] };
  const d = dist(P.ideology, PM.ideology);
  let s = 2.3 - d * 0.27;
  reasons.push(d < 6 ? 'Programas próximos' : d < 11 ? 'Diferenças programáticas relevantes' : 'Programas muito distantes');
  const rel = P.relations?.[pmPid] ?? 0;
  s += rel / 45;
  if (rel > 30) reasons.push('Boa relação entre as direções'); else if (rel < -30) reasons.push('Desconfiança entre as direções');
  if (offer.type === 'coalicao') {
    const mw = (offer.ministries || []).reduce((a, m) => a + (MIN_W[m] || 4), 0);
    s += (mw / 9) * (0.6 + (P.personality?.officeSeeking ?? 0.5)) - 1.1;
    if (mw === 0) reasons.push('Nenhuma pasta oferecida'); else reasons.push(`${offer.ministries.length} pasta(s) no Governo`);
    reasons.push('Risco eleitoral de ser parceiro júnior');
  } else if (offer.type === 'acordo') { s += 0.25; }
  else { s += 0.6; }
  const pol = (offer.policies || []).reduce((a, id) => a + policyValue(G, partnerPid, id), 0);
  s += pol;
  if (pol > 0.8) reasons.push('Medidas do seu programa incluídas');
  // calculismo: partidos a subir preferem eleições
  s -= (P.momentum || 0) * 1.4;
  if ((P.momentum || 0) > 0.3) reasons.push('Está a subir nas sondagens e não teme eleições');
  s += rng.gauss(0, 0.2);
  return { accept: s > 1.0, score: s, reasons };
}

// O que um partido pede para viabilizar um governo ou diploma
export function demandsFor(G, pid) {
  const P = G.parties[pid];
  const laws = topDemands(G, pid, 3);
  const wantMin = MINISTRIES.filter(m => m.areas.some(a => (P.priorities || []).includes(a))).slice(0, 2).map(m => m.id);
  return { laws, ministries: wantMin };
}

// Opções para conquistar o apoio de um partido a um diploma concreto
export function billDealOptions(G, bill, pid) {
  const P = G.parties[pid];
  const dem = topDemands(G, pid, 2);
  const opts = [
    { id: 'emenda', label: 'Aceitar as propostas de alteração do partido', desc: 'O diploma aproxima-se das posições do partido (efeitos atenuados).', pc: 1 },
    { id: 'orcamento', label: `Reforço orçamental de 150 M€ numa prioridade do ${P.short}`, desc: 'Custo anual adicional de 150 M€.', pc: 1, cost: 150 },
  ];
  if (dem[0]) opts.push({ id: 'contrapartida', lawId: dem[0].id, label: `Compromisso: viabilizar "${dem[0].title}"`, desc: 'Fica obrigado a apresentar/aprovar esta medida.', pc: 2 });
  opts.push({ id: 'cargo', label: 'Apoio a uma presidência de comissão / cargo', desc: 'Concessão institucional.', pc: 1 });
  return opts;
}

export function applyBillDeal(G, bill, pid, optIds) {
  const P = G.parties[pid];
  let bonus = 0;
  for (const id of optIds) {
    if (id === 'emenda') {
      for (const k of ['econ', 'social', 'sistema']) bill.ideology[k] = bill.ideology[k] + (P.ideology[k] - bill.ideology[k]) * 0.35;
      for (const g in bill.effects.groups || {}) bill.effects.groups[g] *= 0.8;
      bonus += 0.9;
    }
    if (id === 'orcamento') { bill.annualCost = (bill.annualCost || 0) + 150; bonus += 1.0; }
    if (id === 'contrapartida') { bonus += 1.6; G.obligations = G.obligations || []; const lawId = billDealOptions(G, bill, pid).find(o => o.id === 'contrapartida')?.lawId; if (lawId) G.obligations.push({ party: pid, lawId, since: G.date }); }
    if (id === 'cargo') bonus += 0.6;
  }
  bill.concessions[pid] = (bill.concessions[pid] || 0) + bonus;
  return bonus;
}

// Coligação mais provável para um partido da IA que foi indigitado
export function aiCoalitionPlan(G, pmPid) {
  const seats = G.parliament.seats;
  let bloc = [pmPid], support = [];
  let total = seats[pmPid] || 0;
  if (total >= 116) return { coalition: bloc, support, total };
  const PMr = G.parties[pmPid].redLines || {};
  const cands = Object.keys(seats).filter(pid => pid !== pmPid && seats[pid] > 0 && pid !== G.playerPartyId && !G.parties[pid].pseudo && !(PMr.noCoalition || []).includes(pid))
    .map(pid => ({ pid, ev: evaluateOffer(G, pmPid, pid, { type: 'coalicao', ministries: ['agricultura', 'cultura'], policies: topDemands(G, pid, 1).map(l => l.id) }) }))
    .filter(x => x.ev.accept).sort((a, b) => b.ev.score - a.ev.score);
  const okWith = (pid, list, key) => list.every(m => !((G.parties[pid].redLines?.[key] || []).includes(m)) && !((G.parties[m].redLines?.[key] || []).includes(pid)));
  for (const c of cands) { if (total >= 116) break; if (!okWith(c.pid, bloc, 'noCoalition')) continue; bloc.push(c.pid); total += seats[c.pid]; }
  if (total < 116) {
    const sup = Object.keys(seats).filter(pid => !bloc.includes(pid) && pid !== G.playerPartyId && seats[pid] > 0 && !G.parties[pid].pseudo && !(PMr.noAgreement || []).includes(pid))
      .map(pid => ({ pid, ev: evaluateOffer(G, pmPid, pid, { type: 'acordo', policies: topDemands(G, pid, 2).map(l => l.id) }) }))
      .filter(x => x.ev.accept).sort((a, b) => b.ev.score - a.ev.score);
    for (const c of sup) { if (total >= 116) break; if (!okWith(c.pid, bloc.concat(support), 'noAgreement')) continue; support.push(c.pid); total += seats[c.pid]; }
  }
  return { coalition: bloc, support, total };
}
