// Pós-eleições: novo parlamento, audiências em Belém, indigitação, programa do Governo e moções de rejeição.
import { buildParliament, voteMotion } from './parliament.js';
import { aiCoalitionPlan } from './negotiation.js';
import { formGovernment, defaultCabinetFor } from './government.js';
import { lapseAll } from './legislation.js';
import { buildCampaign } from './campaign.js';
import { generateLists } from './candidates.js';
import { dist } from './ideology.js';
import { canDissolve } from './president.js';
import { MAJORITY } from '../data/districts.js';
import * as cal from '../core/calendar.js';
import { clamp } from '../core/util.js';
import { addNews } from '../core/state.js';

export function postElection(G, result) {
  G.lastResult = result;
  const me = G.playerPartyId;
  G.history.elections.push({
    date: G.electionDate, seats: { ...result.national.seats }, pct: { ...result.national.pct }, turnout: result.turnout,
    playerSeats: result.national.seats[me] || 0, playerPct: result.national.pct[me] || 0, winner: result.mostSeats,
  });
  G.legislature += 1;
  lapseAll(G);
  G.parliament = buildParliament(G, { result });
  G.date = cal.addDays(G.electionDate, 1);
  G.phase = 'formacao';
  G.formation = { step: 'resultados', hearings: null, designated: null, attempts: 0, agreements: {}, tried: [], playerStance: null, programVote: null };
  if (G.government) G.government.caretaker = true;
  for (const pid in G.parties) { const p = G.parties[pid]; p.camp = 0; }
  for (const did in G.districts) G.districts[did].camp = {};
  G.campaign = null;
  G.events.pending = [];
}

export function seatRanking(G) {
  const s = G.parliament.seats;
  return Object.keys(s).filter(p => s[p] > 0).sort((a, b) => s[b] - s[a] || (G.lastResult?.national.votes[b] || 0) - (G.lastResult?.national.votes[a] || 0));
}

// Posições dos partidos nas audiências em Belém (do mais pequeno para o maior)
export function computeHearings(G) {
  const seats = G.parliament.seats;
  const rank = seatRanking(G);
  const largest = rank[0];
  const order = rank.slice().reverse();
  return order.map(pid => {
    if (pid === G.playerPartyId) return { pid, player: true };
    const P = G.parties[pid];
    if (pid === largest) return { pid, position: 'proprio', target: pid, text: 'Reivindica a formação de Governo enquanto partido mais votado e pede estabilidade.' };
    const big = rank.filter(x => x !== pid && seats[x] >= 15);
    let best = null, bs = -99;
    for (const c of big) {
      const s = 2 - dist(P.ideology, G.parties[c].ideology) * 0.25 + (P.relations?.[c] || 0) / 40 - ((P.redLines?.noAgreement || []).includes(c) ? 5 : 0) + (c === largest ? 0.5 : 0);
      if (s > bs) { bs = s; best = c; }
    }
    if (best && bs > 0.9) return { pid, position: 'apoia', target: best, text: `Disponível para viabilizar um Governo liderado pelo ${G.parties[best].short}.` };
    if (bs > -0.4) return { pid, position: 'abstencao', target: largest, text: `Não inviabilizará à partida um Governo do ${G.parties[largest].short}, mas será oposição.` };
    return { pid, position: 'contra', target: largest, text: `Anuncia que votará contra qualquer Governo do ${G.parties[largest].short}.` };
  });
}

// Indigitação pelo Presidente da República
export function designate(G) {
  const F = G.formation;
  const rank = seatRanking(G).filter(p => !F.tried.includes(p));
  const me = G.playerPartyId;
  // maioria alternativa com acordos escritos do jogador
  const agreed = Object.keys(F.agreements).filter(p => F.agreements[p]);
  const playerBloc = (G.parliament.seats[me] || 0) + agreed.reduce((s, p) => s + (G.parliament.seats[p] || 0), 0);
  if (!F.tried.includes(me) && F.playerStance === 'governar' && (rank[0] === me || playerBloc >= MAJORITY)) { F.designated = me; return me; }
  let pick = rank[0];
  if (pick === me && F.playerStance !== 'governar') pick = rank[1];
  F.designated = pick || rank[0];
  return F.designated;
}

export function aiFormGovernment(G, pmPid) {
  const plan = aiCoalitionPlan(G, pmPid);
  const ministers = defaultCabinetFor(G, pmPid);
  // pastas para parceiros de coligação
  const partnerMinistries = ['agricultura', 'cultura', 'ambiente', 'justica', 'educacao'];
  plan.coalition.filter(p => p !== pmPid).forEach((p, i) => { const mid = partnerMinistries[i]; const fig = Object.values(G.people).find(x => x.partyId === p && !x.generated && x.role !== 'lider'); if (fig) ministers[mid] = fig.id; });
  formGovernment(G, { pmPartyId: pmPid, coalition: plan.coalition, support: plan.support, ministers });
  return plan;
}

// Debate do programa do Governo: partidos apresentam (ou não) moções de rejeição
export function programDebate(G, playerVote = null) {
  const gov = G.government;
  const opp = Object.keys(G.parliament.seats).filter(p => G.parliament.seats[p] > 0 && !gov.coalition.includes(p) && !(gov.support || []).includes(p));
  const presenters = opp.filter(p => p !== G.playerPartyId && dist(G.parties[p].ideology, G.parties[gov.pmPartyId].ideology) > 9 && (G.parties[p].relations?.[gov.pmPartyId] ?? 0) < -20);
  if (playerVote === 'apresentar') presenters.unshift(G.playerPartyId);
  if (!presenters.length) { gov.programApproved = true; G.formation.programVote = { none: true }; return { none: true }; }
  const overrides = {};
  if (playerVote && G.parliament.seats[G.playerPartyId] && !gov.coalition.includes(G.playerPartyId)) overrides[G.playerPartyId] = playerVote === 'apresentar' ? 'favor' : playerVote;
  const res = voteMotion(G, 'rejeicao', presenters[0], overrides);
  res.presenters = presenters;
  G.formation.programVote = res;
  if (!res.passed) { gov.programApproved = true; addNews(`Programa do ${gov.number}.º Governo passa no Parlamento: moção de rejeição chumbada.`, { tone: 'good' }); }
  else { addNews(`Moção de rejeição aprovada: o Governo de ${G.people[gov.pm]?.name} cai antes de começar.`, { tone: 'bad' }); }
  return res;
}

// Governo derrubado: tentar alternativa ou eleições
export function governmentFallen(G, kind = 'governo_caiu') {
  const gov = G.government;
  if (gov) { gov.caretaker = true; G.formation = G.formation || { tried: [], agreements: {} }; G.formation.tried = [...(G.formation.tried || []), gov.pmPartyId]; }
  void kind;
}

// Marca eleições antecipadas e prepara nova campanha
export function scheduleElection(G, opts = {}) {
  let date = cal.nextSunday(cal.addDays(G.date, opts.days || 58));
  const last = G.history.elections[G.history.elections.length - 1];
  if (last) { const minDate = cal.addMonths(last.date, 6); if (cal.isBefore(date, minDate)) date = cal.nextSunday(cal.addDays(minDate, 56)); }
  G.electionDate = date;
  const weeks = clamp(Math.floor(cal.diffDays(G.date, date) / 7), 6, 12);
  G.startDate = cal.addDays(date, -weeks * 7 + 1);
  if (cal.isBefore(G.date, G.startDate)) G.date = G.startDate; else G.startDate = G.date;
  G.phase = 'campaign';
  for (const pid in G.parties) { const p = G.parties[pid]; if (!p.pseudo && (p.seats > 0 || pid === G.playerPartyId)) generateLists(G, pid); }
  const pp = G.parties[G.playerPartyId];
  pp.funds = Math.max(pp.funds || 0, 60000) + Math.round((G.lastResult?.national.votes[pp.id] || 0) * 0.5);
  G.campaign = buildCampaign(G, weeks);
  G.campaign.money = pp.funds;
  G.formation = null;
  addNews(`Eleições legislativas marcadas para ${cal.longDate(date)}.`, { tone: 'neutral' });
  return date;
}

export function nextOrdinaryElection(G) {
  const last = G.history.elections[G.history.elections.length - 1];
  return cal.nextSunday(cal.addMonths(last ? last.date : G.date, 48));
}

export { canDissolve };
