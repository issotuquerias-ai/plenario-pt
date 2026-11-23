// Governo: formação, ministros, aprovação, capital político.
import { MINISTRIES, AREA_TO_MINISTRY, DEFAULT_CABINETS } from '../data/ministries.js';
import { suspendDeputy } from './parliament.js';
import { createPerson } from './candidates.js';
import { groupsAverage } from './economy.js';
import { valenceBoost } from './campaign.js';
import { govPartyIds } from './effects.js';
import { rng } from '../core/rng.js';
import { clamp } from '../core/util.js';
import { addNews } from '../core/state.js';

export const isPlayerInGov = G => !!G.government && !G.government.caretaker && G.government.coalition.includes(G.playerPartyId);
export const isPlayerPM = G => !!G.government && !G.government.caretaker && G.government.pmPartyId === G.playerPartyId;
export { govPartyIds };

export function ministerFor(G, area) {
  const mid = AREA_TO_MINISTRY[area] || 'presidencia';
  const pid = G.government?.ministers?.[mid];
  return pid ? G.people[pid] : null;
}

// Preenche ministérios em falta com figuras do(s) partido(s) ou independentes
export function completeCabinet(G, ministers, parties) {
  const out = { ...ministers };
  const used = new Set(Object.values(out));
  for (const m of MINISTRIES) {
    if (out[m.id]) continue;
    const pool = Object.values(G.people).filter(x => parties.includes(x.partyId) && !used.has(x.id) && !x.generated && x.role !== 'lider' && x.role !== 'par' && x.role !== 'presidente' && (x.expertise === m.id));
    let pick = pool[0];
    if (!pick) {
      const any = Object.values(G.people).filter(x => parties.includes(x.partyId) && !used.has(x.id) && !x.generated && ['figura', 'lider_parlamentar'].includes(x.role));
      pick = any.length && rng.chance(0.6) ? any[0] : null;
    }
    const id = pick ? pick.id : createPerson(G, { partyId: rng.chance(0.4) ? null : parties[0], role: 'independente' });
    if (!pick) G.people[id].independent = true;
    out[m.id] = id; used.add(id);
  }
  return out;
}

export function formGovernment(G, { pmPartyId, coalition, support = [], ministers = {}, pm }) {
  const parties = [...new Set([pmPartyId, ...coalition])];
  const full = completeCabinet(G, ministers, parties);
  const prevNumber = G.government?.number || 25;
  G.government = {
    pmPartyId, pm: pm || G.parties[pmPartyId].leaderId, coalition: parties, support, ministers: full, startDate: G.date, caretaker: false,
    approval: 50, stability: clamp(45 + (parties.reduce((s, p) => s + (G.parliament.seats[p] || 0), 0) + support.reduce((s, p) => s + (G.parliament.seats[p] || 0), 0) - 100) * 0.6, 15, 90),
    honeymoon: 6, programApproved: false, budgets: {}, number: prevNumber + 1, reshuffles: 0,
  };
  // ministros que eram deputados suspendem o mandato
  for (const pid of Object.values(full)) { if (G.people[pid]) G.people[pid].role = G.people[pid].role === 'lider' ? 'lider' : 'ministro'; suspendDeputy(G, pid); }
  suspendDeputy(G, G.government.pm);
  G.history.governments.push({ number: G.government.number, pm: G.government.pm, pmPartyId, coalition: parties, start: G.date });
  return G.government;
}

export function defaultCabinetFor(G, pid) {
  const p = G.parties[pid];
  return { ...(p.shadowCabinet || DEFAULT_CABINETS[pid] || {}) };
}

// Aprovação mensal do Governo
export function approvalTick(G) {
  const gov = G.government; if (!gov || gov.caretaker) return;
  const ga = groupsAverage(G);
  const E = G.economy;
  let target = ga * 0.9 + (E.gdpGrowth - 1.8) * 2 - (E.unemployment - 6.4) * 1.2 - Math.max(0, E.inflation - 2.5) * 1.5 - ((G.unrest ?? 25) - 25) * 0.15 + (gov.honeymoon > 0 ? 6 : 0);
  target = clamp(target, 5, 85);
  gov.approval = clamp(gov.approval + (target - gov.approval) * 0.2 + rng.gauss(0, 0.8), 3, 95);
  if (gov.honeymoon > 0) gov.honeymoon--;
  // ligação às intenções de voto: partidos do governo ganham/perdem valência
  const dv = (gov.approval - 42) / 42 * 0.04;
  for (const pid of govPartyIds(G)) valenceBoost(G, pid, dv);
  // a estabilidade depende da aritmética parlamentar e da aprovação
  const seats = govPartyIds(G).concat(gov.support || []).reduce((s, p) => s + (G.parliament.seats[p] || 0), 0);
  const stTarget = clamp(30 + (seats - 100) * 0.9 + (gov.approval - 40) * 0.4, 5, 95);
  gov.stability = clamp(gov.stability + (stTarget - gov.stability) * 0.15, 0, 100);
}

// Capital político mensal (pontos para iniciativas)
export function politicalCapitalTick(G) {
  const inGov = !!G.government && !G.government.caretaker && G.government.coalition.includes(G.playerPartyId);
  const seats = G.parliament?.seats?.[G.playerPartyId] || 0;
  const gain = inGov ? 3 + Math.round((G.government.approval - 30) / 15) : 2 + Math.round(seats / 40);
  G.politicalCapital = clamp((G.politicalCapital || 0) + Math.max(1, gain), 0, 12);
}

export function reshuffle(G, ministryId, personId) {
  const old = G.government.ministers[ministryId];
  if (old && G.people[old]?.role === 'ministro') G.people[old].role = 'figura';
  G.government.ministers[ministryId] = personId;
  if (G.people[personId]) G.people[personId].role = 'ministro';
  suspendDeputy(G, personId);
  G.government.reshuffles = (G.government.reshuffles || 0) + 1;
  const m = MINISTRIES.find(x => x.id === ministryId);
  addNews(`Remodelação: ${G.people[personId]?.name} é o novo titular da pasta ${m ? 'da ' + m.name : ''}.`, { tone: 'neutral' });
}
