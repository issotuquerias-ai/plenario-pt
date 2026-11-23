// Assembleia da República: composição, votações, Mesa, comissões, moções.
import { DISTRICTS, MAJORITY, TWO_THIRDS } from '../data/districts.js';
import { COMMITTEES } from '../data/ministries.js';
import { dist, ndist } from './ideology.js';
import { dhondt } from './election.js';
import { createPerson } from './candidates.js';
import { rng } from '../core/rng.js';
import { clamp, romanize } from '../core/util.js';

// Constrói o parlamento a partir de um resultado eleitoral (ou, no início, dos resultados de 2025)
export function buildParliament(G, { result = null, initial = false } = {}) {
  const deputies = [];
  const perDistrict = {};
  if (result) {
    for (const did in result.byDistrict) perDistrict[did] = result.byDistrict[did].seats;
  } else {
    for (const d of DISTRICTS) {
      const votes = {}; for (const pid in d.results2025) votes[pid] = d.results2025[pid];
      perDistrict[d.id] = dhondt(votes, d.seats).seats;
    }
  }
  for (const did in perDistrict) {
    const r = perDistrict[did];
    for (const pid in r) {
      if (!G.parties[pid]) continue;
      const list = G.lists[pid]?.[did] || [];
      for (let i = 0; i < r[pid]; i++) {
        let personId = list[i];
        if (!personId || G.people[personId]?.role === 'presidente') personId = createPerson(G, { partyId: pid, home: did, role: 'deputado' });
        deputies.push({ personId, partyId: pid, district: did, listPos: i + 1, active: true });
      }
    }
  }
  const seats = {};
  for (const d of deputies) seats[d.partyId] = (seats[d.partyId] || 0) + 1;
  for (const pid in G.parties) G.parties[pid].seats = seats[pid] || 0;
  const groups = {};
  for (const pid in seats) {
    const leaderPerson = Object.values(G.people).find(x => x.partyId === pid && x.role === 'lider_parlamentar');
    groups[pid] = { seats: seats[pid], isGroup: seats[pid] >= 2, leader: leaderPerson?.id || G.parties[pid].leaderId };
  }
  const P = {
    legislature: G.legislature, numeral: romanize(G.legislature), seats, deputies, groups,
    par: initial ? { personId: 'aguiarbranco', partyId: 'ad', votes: 0 } : null,
    vps: [], committees: {}, installed: initial, log: [], sessionDay: 0,
  };
  P.order = seatOrderIndex(G, P);
  return P;
}

// Índices dos deputados ordenados da esquerda para a direita (para o hemiciclo 3D)
export function seatOrderIndex(G, P) {
  return P.deputies.map((d, i) => i).sort((a, b) => {
    const da = P.deputies[a], db = P.deputies[b];
    const oa = G.parties[da.partyId]?.seatOrder ?? 500, ob = G.parties[db.partyId]?.seatOrder ?? 500;
    if (oa !== ob) return oa - ob;
    return da.listPos - db.listPos;
  });
}

// Dados dos lugares para o hemiciclo (cores, nomes)
export function seatData(G) {
  const P = G.parliament; if (!P) return [];
  return P.order.map(i => {
    const d = P.deputies[i]; const p = G.parties[d.partyId]; const person = G.people[d.personId];
    return { partyId: d.partyId, color: p?.color || '#888', personName: person?.name || '', district: DISTRICTS.find(x => x.id === d.district)?.name || '', label: `${person?.name || ''} (${p?.short || ''})` };
  });
}

export const seatsOf = (G, pids) => pids.reduce((s, pid) => s + (G.parliament?.seats?.[pid] || 0), 0);
export const majorityOf = (G, pids) => seatsOf(G, pids) >= MAJORITY;

function govInfo(G, pid) {
  const gov = G.government;
  if (!gov || gov.caretaker || G.phase === 'campaign') return { inGov: false, supports: false };
  return { inGov: gov.coalition.includes(pid), supports: (gov.support || []).includes(pid), pm: gov.pmPartyId };
}

/**
 * Intenção de voto de um partido sobre uma iniciativa.
 * item: { ideology, authorParty, byGov, partySupport, popularity, constitutional, concessions, deals, type }
 */
export function voteIntention(G, pid, item, opts = {}) {
  const p = G.parties[pid];
  if (item.deals && item.deals[pid]) return { vote: item.deals[pid], score: item.deals[pid] === 'favor' ? 3 : item.deals[pid] === 'contra' ? -3 : 0, reasons: ['Acordo negociado'] };
  const reasons = [];
  const d = dist(p.ideology, item.ideology || { econ: 0, social: 0, sistema: 0 });
  let score = 2.4 - d * 0.3;
  if (d < 5) reasons.push('Próximo das suas posições'); else if (d > 11) reasons.push('Longe das suas posições');
  if (item.partySupport && item.partySupport[pid]) { score += item.partySupport[pid] * 0.9; if (item.partySupport[pid] > 1) reasons.push('Bandeira do partido'); if (item.partySupport[pid] < -1) reasons.push('Opõe-se frontalmente'); }
  const gi = govInfo(G, pid);
  if (item.authorParty === pid) { score += 6; reasons.push('Iniciativa própria'); }
  else if (item.byGov) {
    if (gi.inGov) { score += 3.8; reasons.push('Partido do Governo'); }
    else if (gi.supports) { score += 1.6; reasons.push('Acordo de apoio ao Governo'); }
    else { const rel = p.relations?.[G.government?.pmPartyId] ?? 0; score += rel / 70 - 0.8 * (p.personality?.aggression ?? 0.5); if (rel < -40) reasons.push('Hostil ao Governo'); }
  } else if (item.authorParty) {
    const rel = p.relations?.[item.authorParty] ?? 0;
    score += rel / 55;
    if (rel > 30) reasons.push('Boa relação com o proponente'); else if (rel < -40) reasons.push('Má relação com o proponente');
    if (gi.inGov && item.authorParty !== G.government.pmPartyId && !G.government.coalition.includes(item.authorParty)) score -= 0.7;
  }
  if (item.popularity) score += item.popularity * 1.1;
  if (item.constitutional) {
    const sev = item.constitutional.severity === 'grave' ? 1 : 0.5;
    const pen = sev * (p.ideology.sistema < 3 ? 3.2 : 0.4);
    score -= pen; if (pen > 1) reasons.push('Dúvidas de constitucionalidade');
  }
  if (item.concessions && item.concessions[pid]) { score += item.concessions[pid]; reasons.push('Concessões negociadas'); }
  if (item.cost && item.cost > 800 && p.ideology.econ > 2) { score -= Math.min(1.5, item.cost / 1500); reasons.push('Custo orçamental elevado'); }
  if (!opts.noNoise) score += rng.gauss(0, 0.25);
  const vote = score > 0.9 ? 'favor' : score < -0.9 ? 'contra' : 'abstencao';
  return { vote, score, reasons };
}

export function requiredFor(type, stage) {
  if (stage === 'final' || stage === 'unica') {
    if (type === 'lei_organica') return { kind: 'absoluta', n: MAJORITY, label: 'maioria absoluta (116)' };
    if (type === 'revisao') return { kind: 'dois_tercos', n: TWO_THIRDS, label: 'maioria de dois terços (154)' };
  }
  if (type === 'censura' || type === 'rejeicao') return { kind: 'absoluta', n: MAJORITY, label: 'maioria absoluta (116)' };
  if (type === 'confirmacao') return { kind: 'absoluta', n: MAJORITY, label: 'maioria absoluta (116)' };
  if (type === 'confirmacao_organica') return { kind: 'dois_tercos', n: TWO_THIRDS, label: 'dois terços (154)' };
  return { kind: 'simples', n: 0, label: 'maioria simples' };
}

/** Votação em plenário. overrides: { pid: 'favor'|'contra'|'abstencao' } (p.ex. o voto do jogador). */
export function plenaryVote(G, item, stage = 'generalidade', overrides = {}) {
  const P = G.parliament;
  const votes = {}, details = {};
  const tally = { favor: 0, contra: 0, abstencao: 0 };
  for (const pid in P.seats) {
    if (!P.seats[pid]) continue;
    let v;
    if (overrides[pid]) v = { vote: overrides[pid], score: 0, reasons: ['Decisão do jogador'] };
    else v = voteIntention(G, pid, item);
    votes[pid] = v.vote; details[pid] = v;
    tally[v.vote] += P.seats[pid];
  }
  // pequena dissidência/ausências em votações secretas ou renhidas
  const req = requiredFor(item.type, stage);
  let passed;
  if (item.type === 'confianca') passed = !(tally.contra > tally.favor);
  else if (req.kind === 'simples') passed = tally.favor > tally.contra;
  else passed = tally.favor >= req.n;
  return { votes, details, tally, passed, required: req, stage, date: G.date };
}

// Previsão (sem ruído) para mostrar ao jogador
export function predictVote(G, item, stage = 'generalidade', overrides = {}) {
  const P = G.parliament; const votes = {}; const tally = { favor: 0, contra: 0, abstencao: 0 }; const details = {};
  for (const pid in P.seats) {
    if (!P.seats[pid]) continue;
    const v = overrides[pid] ? { vote: overrides[pid], score: 0, reasons: ['Decisão do jogador'] } : voteIntention(G, pid, item, { noNoise: true });
    votes[pid] = v.vote; details[pid] = v; tally[v.vote] += P.seats[pid];
  }
  const req = requiredFor(item.type, stage);
  const passed = item.type === 'confianca' ? !(tally.contra > tally.favor) : req.kind === 'simples' ? tally.favor > tally.contra : tally.favor >= req.n;
  return { votes, details, tally, passed, required: req };
}

// ---------- Mesa da Assembleia ----------
// Apoio de um partido a um candidato (voto secreto)
function supportCandidate(G, pid, cand, deals = {}) {
  if (cand.partyId === pid) return 1;
  if (deals[pid] === 'favor') return 0.97;
  if (deals[pid] === 'contra') return 0.03;
  const p = G.parties[pid];
  const rel = p.relations?.[cand.partyId] ?? 0;
  const close = 1 - ndist(p.ideology, G.parties[cand.partyId].ideology);
  const biggest = Object.entries(G.parliament.seats).sort((a, b) => b[1] - a[1])[0]?.[0];
  let s = rel / 60 + close * 1.6 - 1.0 + (cand.partyId === biggest ? 0.6 : 0) + (cand.consensual ? 0.5 : 0);
  return clamp(0.5 + s * 0.35, 0.02, 0.98);
}

export function electOfficer(G, cand, deals = {}) {
  let votes = 0, blank = 0;
  const byParty = {};
  for (const pid in G.parliament.seats) {
    const n = G.parliament.seats[pid]; if (!n) continue;
    const prob = supportCandidate(G, pid, cand, deals);
    let yes = 0; for (let i = 0; i < n; i++) if (rng.chance(prob)) yes++;
    votes += yes; blank += n - yes; byParty[pid] = prob;
  }
  return { votes, blank, elected: votes >= MAJORITY, byParty };
}

export function predictOfficer(G, cand, deals = {}) {
  let expected = 0; const byParty = {};
  for (const pid in G.parliament.seats) { const n = G.parliament.seats[pid]; if (!n) continue; const pr = supportCandidate(G, pid, cand, deals); byParty[pid] = pr; expected += n * pr; }
  return { expected: Math.round(expected), byParty };
}

// Os 4 maiores grupos propõem vice-presidentes
export function vpProposers(G) {
  return Object.entries(G.parliament.seats).filter(([pid, n]) => n >= 2 && !G.parties[pid].pseudo).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([pid]) => pid);
}

// ---------- Comissões parlamentares (D'Hondt) ----------
export function committeeDraft(G) {
  const groups = {};
  for (const [pid, n] of Object.entries(G.parliament.seats)) if (n >= 2) groups[pid] = n;
  const { quotients } = dhondt(groups, COMMITTEES.length);
  return quotients.map(q => q.party); // ordem de escolha
}

export function aiCommitteePick(G, pid, available) {
  const pr = G.parties[pid].priorities || [];
  let best = null, bs = -1;
  for (const c of available) {
    const s = c.prestige + (c.areas.some(a => pr.includes(a)) ? 6 : 0) + rng.range(0, 1.5);
    if (s > bs) { bs = s; best = c; }
  }
  return best;
}

export function committeeMembership(G, size = 21) {
  const groups = {}; for (const [pid, n] of Object.entries(G.parliament.seats)) if (n >= 1) groups[pid] = n;
  return dhondt(groups, size).seats;
}

// ---------- Moções ----------
// Voto de cada partido numa moção (censura / rejeição do programa / confiança)
export function motionIntention(G, pid, kind, authorParty) {
  const gov = G.government; const p = G.parties[pid];
  if (gov.coalition.includes(pid)) return kind === 'confianca' ? 'favor' : 'contra';
  if (pid === authorParty) return kind === 'confianca' ? 'contra' : 'favor';
  if ((gov.support || []).includes(pid)) return kind === 'confianca' ? 'favor' : 'contra';
  const rel = p.relations?.[gov.pmPartyId] ?? 0;
  const d = dist(p.ideology, G.parties[gov.pmPartyId].ideology);
  const approval = gov.approval ?? 40;
  // calculismo eleitoral: partidos a subir nas sondagens querem eleições
  const momentum = (p.momentum || 0) * 2;
  let s = -rel / 40 + d * 0.12 - 1.1 + (40 - approval) / 25 + momentum;
  if (kind === 'rejeicao') s -= 0.8; // dar o benefício da dúvida ao novo governo
  if (p.personality?.officeSeeking > 0.7 && kind !== 'confianca') s -= 0.3;
  s += rng.gauss(0, 0.3);
  if (kind === 'confianca') return s > 0.6 ? 'contra' : s < -0.6 ? 'favor' : 'abstencao';
  return s > 0.6 ? 'favor' : s < -0.6 ? 'contra' : 'abstencao';
}

export function voteMotion(G, kind, authorParty, overrides = {}) {
  const votes = {}; const tally = { favor: 0, contra: 0, abstencao: 0 };
  for (const pid in G.parliament.seats) {
    const n = G.parliament.seats[pid]; if (!n) continue;
    const v = overrides[pid] || motionIntention(G, pid, kind, authorParty);
    votes[pid] = v; tally[v] += n;
  }
  let passed;
  if (kind === 'confianca') passed = !(tally.contra > tally.favor); // aprovada salvo se rejeitada por maioria simples
  else passed = tally.favor >= MAJORITY;
  return { kind, votes, tally, passed, date: G.date, required: kind === 'confianca' ? 'maioria simples (rejeição)' : 'maioria absoluta (116)' };
}

// Substituição de deputado que vai para o Governo (suspensão de mandato)
export function suspendDeputy(G, personId) {
  const P = G.parliament; if (!P) return;
  const idx = P.deputies.findIndex(d => d.personId === personId && d.active);
  if (idx < 0) return;
  const dep = P.deputies[idx];
  const list = G.lists[dep.partyId]?.[dep.district] || [];
  const usedIds = new Set(P.deputies.map(d => d.personId));
  let sub = list.find(id => !usedIds.has(id) && G.people[id]?.role !== 'ministro');
  if (!sub) sub = createPerson(G, { partyId: dep.partyId, home: dep.district, role: 'deputado' });
  P.deputies[idx] = { ...dep, personId: sub, substituteOf: personId, listPos: list.indexOf(sub) + 1 || dep.listPos + 1 };
}
