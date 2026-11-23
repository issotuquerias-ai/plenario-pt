// Avanço mensal durante a legislatura (Governo, oposição ou regime).
import { LAWS } from '../data/laws.js';
import { economyTick, groupsTick } from './economy.js';
import { approvalTick, politicalCapitalTick, isPlayerInGov } from './government.js';
import { advanceBills, pendingVotes, resolveVote, createBill, DONE_STAGES } from './legislation.js';
import { voteIntention, voteMotion } from './parliament.js';
import { topDemands } from './negotiation.js';
import { regimeTick } from './regime.js';
import { makePoll } from './polls.js';
import { applyEffects, govPartyIds } from './effects.js';
import { valenceBoost } from './campaign.js';
import { crisisDecision } from './president.js';
import { monthlyEvents, autoResolveForAI } from '../ai/eventgen.js';
import * as cal from '../core/calendar.js';
import { rng } from '../core/rng.js';
import { clamp } from '../core/util.js';
import { addNews } from '../core/state.js';

export function defaultPlayerVote(G, bill) {
  const me = G.playerPartyId;
  if (!G.parliament.seats[me]) return {};
  if (bill.authorParty === me) return { [me]: 'favor' };
  return { [me]: voteIntention(G, me, { ...bill, cost: bill.annualCost }, { noNoise: true }).vote };
}

function queueVotes(G) {
  for (const b of pendingVotes(G)) if (b.voteStage !== b.pendingVote) { b.voteStage = b.pendingVote; b.voteQueuedAt = G.date; }
}

function lawSpec(law, extra = {}) {
  return { title: law.title, summary: law.summary, articles: law.articles, area: law.area, type: law.type === 'resolucao' ? 'resolucao' : law.type, ideology: { ...law.ideology }, effects: JSON.parse(JSON.stringify(law.effects || {})), annualCost: law.annualCost, constitutional: law.constitutional, referendum: law.referendum, partySupport: law.partySupport, salience: law.salience, catalogId: law.id, tags: law.tags, ...extra };
}

function aiGovernmentMonth(G, R) {
  const gov = G.government; if (!gov || gov.caretaker) return;
  const pm = gov.pmPartyId;
  if (G.monthIndex % 2 === 0) {
    const inProgress = new Set(G.bills.filter(b => !DONE_STAGES.includes(b.stage)).map(b => b.catalogId));
    const law = topDemands(G, pm, 6).find(l => !inProgress.has(l.id));
    if (law) {
      const b = createBill(G, lawSpec(law, { byGov: true, authorParty: pm, source: 'governo_ia' }));
      addNews(`Governo aprova em Conselho de Ministros proposta de lei: ${b.title}.`, { tone: 'neutral' });
      R.notes.push({ type: 'gov_bill', bill: b });
    }
  }
  // o Governo da IA lida com um problema do mês (só notícia + efeitos)
  if (rng.chance(0.6)) { const r = autoResolveForAI(G); if (r) R.notes.push({ type: 'gov_event', text: r }); }
}

function aiOppositionMonth(G, R) {
  const gov = G.government; if (!gov || gov.caretaker) return;
  const opp = Object.keys(G.parliament.seats).filter(p => G.parliament.seats[p] > 0 && !gov.coalition.includes(p) && p !== G.playerPartyId);
  if (opp.length && rng.chance(0.45)) {
    const pid = rng.pick(opp);
    const inProgress = new Set(G.bills.filter(b => !DONE_STAGES.includes(b.stage)).map(b => b.catalogId));
    const law = topDemands(G, pid, 6).find(l => !inProgress.has(l.id) && l.type !== 'lei_organica');
    if (law) { const b = createBill(G, lawSpec(law, { byGov: false, authorParty: pid, source: 'oposicao_ia' })); R.notes.push({ type: 'opp_bill', bill: b }); }
  }
  // moção de censura
  const approval = gov.approval ?? 45;
  if (approval < 36 && !G.pendingMotion && rng.chance(0.16 + (36 - approval) / 100)) {
    const cands = opp.filter(p => (G.parties[p].personality?.aggression ?? 0.5) > 0.55);
    if (cands.length) {
      const author = rng.pick(cands);
      G.pendingMotion = { kind: 'censura', author, date: G.date };
      addNews(`${G.parties[author].short} apresenta moção de censura ao Governo.`, { tone: 'neutral' });
    }
  }
}

function calendarMonth(G, R) {
  const m = cal.month(G.date), y = cal.year(G.date);
  const gov = G.government; if (!gov || gov.caretaker) return;
  if (m === 10 && !gov.budgets[y + 1]) {
    if (isPlayerInGov(G) && gov.pmPartyId === G.playerPartyId) { G.flags.oeDue = y + 1; R.notes.push({ type: 'oe_due', year: y + 1 }); }
    else if (!G.bills.some(b => b.type === 'orcamento' && b.budgetYear === y + 1)) {
      const P = G.parties[gov.pmPartyId];
      const b = createBill(G, { title: `Orçamento do Estado para ${y + 1}`, type: 'orcamento', area: 'impostos', ideology: { ...P.ideology }, effects: { approval: 1 }, annualCost: 0, byGov: true, authorParty: gov.pmPartyId, salience: 0.9, source: 'governo_ia' });
      b.budgetYear = y + 1;
      addNews(`O Governo entrega na Assembleia a proposta de Orçamento do Estado para ${y + 1}.`, { tone: 'neutral' });
      R.notes.push({ type: 'oe_ai', bill: b });
    }
  }
  if (m === 11 && G.flags.oeDue === y + 1 && !G.bills.some(b => b.type === 'orcamento' && b.budgetYear === y + 1)) {
    // orçamento de continuidade automático
    const P = G.parties[gov.pmPartyId];
    const b = createBill(G, { title: `Orçamento do Estado para ${y + 1}`, type: 'orcamento', area: 'impostos', ideology: { ...P.ideology }, effects: {}, annualCost: 0, byGov: true, authorParty: gov.pmPartyId, salience: 0.9, source: 'governo' });
    b.budgetYear = y + 1; G.flags.oeDue = null;
    addNews('O Ministério das Finanças entrega um orçamento de continuidade.', { tone: 'neutral' });
  }
  if (m === 7) R.notes.push({ type: 'estado_nacao' });
  // orçamento chumbado → crise
  if (G.flags.budgetRejected && !G.flags.budgetCrisisHandled) {
    G.flags.budgetCrisisHandled = true;
    const d = crisisDecision(G, 'orcamento');
    if (d.dissolve) G.pendingCrisis = { kind: 'orcamento', dissolve: true };
    else { addNews('O país entra em regime de duodécimos: o Orçamento anterior mantém-se em vigor.', { tone: 'bad' }); applyEffects(G, { approval: -3, stability: -10 }); }
  }
}

function aiDrift(G) {
  const gov = G.government;
  for (const id of G.partyIds) {
    const p = G.parties[id]; if (p.pseudo) continue;
    if (id !== G.playerPartyId) p.valence = clamp((p.valence || 0) * 0.99 + rng.gauss(0, 0.02), -2, 2);
    else p.valence = (p.valence || 0) * 0.995;
  }
  if (gov && !gov.caretaker) {
    const opp = Object.keys(G.parliament.seats).filter(p => !gov.coalition.includes(p) && G.parliament.seats[p] > 0);
    const shift = (42 - (gov.approval ?? 42)) / 900;
    for (const p of opp) valenceBoost(G, p, shift);
  }
  // partido novo do jogador: notoriedade continua a crescer com presença parlamentar
  const me = G.parties[G.playerPartyId];
  if (me.isCustom) me.awareness = clamp((me.awareness || 0.1) + (G.parliament.seats[me.id] ? 0.008 : 0.002), 0.01, 1);
}

export function advanceMonth(G) {
  const R = { notes: [], crisis: null, events: [], autoVotes: [], end: null };
  // votações pendentes há mais de um mês são realizadas automaticamente
  for (const b of pendingVotes(G)) {
    if (b.voteQueuedAt && cal.diffDays(b.voteQueuedAt, G.date) >= 25) { const res = resolveVote(G, b, defaultPlayerVote(G, b)); R.autoVotes.push({ bill: b, res }); }
  }
  G.date = cal.addMonths(G.date, 1);
  G.monthIndex = (G.monthIndex || 0) + 1;
  economyTick(G); groupsTick(G); approvalTick(G); politicalCapitalTick(G); aiDrift(G);
  R.notes.push(...advanceBills(G));
  if (G.phase === 'regime') {
    const end = regimeTick(G);
    if (end) { R.end = end; return R; }
  } else {
    if (!isPlayerInGov(G)) aiGovernmentMonth(G, R);
    aiOppositionMonth(G, R);
    calendarMonth(G, R);
  }
  queueVotes(G);
  R.events = monthlyEvents(G);
  G.events.pending.push(...R.events);
  G.polls.push(makePoll(G));
  if (G.polls.length > 90) G.polls.splice(0, G.polls.length - 90);
  // momentum a partir das duas últimas sondagens
  const [a, b] = G.polls.slice(-2);
  if (a && b) for (const pid in b.results) if (G.parties[pid]) G.parties[pid].momentum = clamp((b.results[pid] - (a.results[pid] || 0)) / 2, -1, 1);
  if (G.phase !== 'regime' && G.nextElection && !cal.isBefore(G.date, G.nextElection)) R.crisis = { kind: 'fim_legislatura' };
  if (G.pendingCrisis) { R.crisis = G.pendingCrisis; }
  return R;
}

// Resolve a moção de censura pendente (o jogador escolhe o voto do seu grupo)
export function resolvePendingMotion(G, playerVote) {
  const M = G.pendingMotion; if (!M) return null;
  const overrides = {};
  if (G.parliament.seats[G.playerPartyId]) overrides[G.playerPartyId] = playerVote || (G.government.coalition.includes(G.playerPartyId) ? 'contra' : 'abstencao');
  const res = voteMotion(G, M.kind, M.author, overrides);
  G.pendingMotion = null;
  if (res.passed) {
    addNews(`Moção de censura aprovada com ${res.tally.favor} votos. O Governo é demitido (art. 195.º da Constituição).`, { tone: 'bad' });
    const d = crisisDecision(G, 'governo_caiu');
    G.pendingCrisis = { kind: 'governo_caiu', dissolve: d.dissolve, why: d.why };
  } else addNews(`Moção de censura do ${G.parties[M.author].short} chumbada (${res.tally.favor} a favor, ${res.tally.contra} contra).`, { tone: 'neutral' });
  return res;
}

// O jogador (na oposição) apresenta uma moção de censura
export function playerCensure(G) {
  G.pendingMotion = { kind: 'censura', author: G.playerPartyId, date: G.date };
  return resolvePendingMotion(G, 'favor');
}

// O Governo do jogador apresenta uma moção de confiança
export function confidenceMotion(G) {
  const res = voteMotion(G, 'confianca', G.playerPartyId, { [G.playerPartyId]: 'favor' });
  if (!res.passed) {
    addNews('A Assembleia rejeita a moção de confiança: o Governo é demitido.', { tone: 'bad' });
    const d = crisisDecision(G, 'governo_caiu');
    G.pendingCrisis = { kind: 'governo_caiu', dissolve: d.dissolve, why: d.why };
  } else { applyEffects(G, { stability: 12, approval: 2 }); addNews('Moção de confiança aprovada: o Governo sai reforçado.', { tone: 'good' }); }
  return res;
}

export { govPartyIds, lawSpec };
