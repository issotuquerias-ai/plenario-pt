// Criação de um novo jogo: partidos, pessoas, eleitorado calibrado, calendário da campanha.
import { PARTY_DEFS, OUTROS, RELATION_OVERRIDES } from '../data/parties.js';
import { REAL_PEOPLE, PRESIDENT } from '../data/figures.js';
import { DISTRICTS, NATIONAL_2025 } from '../data/districts.js';
import { DEFAULT_CABINETS } from '../data/ministries.js';
import { calibrate, initCustomPartyBonus } from './electorate.js';
import { dist, spectrumScore } from './ideology.js';
import { makePoll } from './polls.js';
import { generateLists } from './candidates.js';
import { initEconomy, initGroups } from './economy.js';
import { buildParliament } from './parliament.js';
import { buildCampaign } from './campaign.js';
import * as cal from '../core/calendar.js';
import { rng } from '../core/rng.js';
import { clamp, deepClone } from '../core/util.js';

export const SCENARIOS = [
  { id: 'antecipadas2027', name: 'Legislativas antecipadas 2027', electionDate: '2027-05-16', desc: 'Após o chumbo de uma moção de confiança, o Presidente da República dissolveu a Assembleia e convocou eleições antecipadas.' },
  { id: 'fimlegislatura2029', name: 'Fim da legislatura — 2029', electionDate: '2029-10-07', desc: 'A legislatura chega ao fim. Eleições legislativas ordinárias no outono de 2029.' },
];

function makeParty(def) {
  const p = deepClone(def);
  return Object.assign(p, {
    valence: 0, awareness: 1, momentum: 0, relations: {}, isCustom: false,
    seats: NATIONAL_2025[def.id]?.seats || 0, pct2025: NATIONAL_2025[def.id]?.pct || 0,
  });
}

function initRelations(G) {
  const ids = G.partyIds.filter(id => !G.parties[id].pseudo);
  for (const a of ids) for (const b of ids) {
    if (a === b) continue;
    const key = [a, b].sort().join('|');
    let r = 45 - dist(G.parties[a].ideology, G.parties[b].ideology) * 6.5;
    const ov = RELATION_OVERRIDES[`${a}|${b}`] ?? RELATION_OVERRIDES[`${b}|${a}`];
    if (ov != null) r = ov;
    G.parties[a].relations[b] = Math.round(clamp(r, -95, 85));
    void key;
  }
}

export function seatOrderFor(G, ideology) {
  // posição no hemiciclo interpolada entre partidos existentes
  const s = spectrumScore(ideology);
  const ref = G.partyIds.map(id => G.parties[id]).filter(p => !p.pseudo && !p.isCustom).map(p => ({ s: spectrumScore(p.ideology), o: p.seatOrder })).sort((a, b) => a.s - b.s);
  if (s <= ref[0].s) return ref[0].o - 3;
  for (let i = 0; i < ref.length - 1; i++) if (s >= ref[i].s && s <= ref[i + 1].s) return (ref[i].o + ref[i + 1].o) / 2 + 0.5;
  return ref[ref.length - 1].o + 3;
}

/**
 * cfg = { partyId (real) | custom: {...}, scenarioId, campaignWeeks, difficulty, seed }
 */
export function createGame(cfg) {
  const seed = cfg.seed || (Date.now() & 0x7fffffff);
  rng.seed(seed);
  const sc = SCENARIOS.find(s => s.id === cfg.scenarioId) || SCENARIOS[0];
  const electionDate = sc.electionDate;
  const weeks = cfg.campaignWeeks || 9;
  const start = cal.addDays(electionDate, -weeks * 7 + 1);
  const G = {
    version: 1, seed, phase: 'campaign', date: start, startDate: start, electionDate, scenarioId: sc.id, difficulty: cfg.difficulty || 'normal',
    playerPartyId: null, parties: {}, partyIds: [], people: {}, districts: {}, electorate: {}, polls: [], news: [], log: [], lists: {},
    parliament: null, government: null, economy: initEconomy(), groups: initGroups(), bills: [], laws: [], decrees: [],
    constitution: { amendments: [], changed: {}, revisions: 7 }, events: { pending: [], history: [], seen: {} },
    president: { ...deepClone(PRESIDENT), relation: 50, vetoes: 0, tcRequests: 0 },
    regime: null, flags: {}, history: { elections: [], governments: [] }, stats: { lawsPassed: 0, lawsFailed: 0, vetoes: 0, eventsResolved: 0 },
    legislature: 17, monthIndex: 0, politicalCapital: 2, turnoutShift: 0, ended: null, unrest: 25, euRelations: 70, media: 50,
  };
  // pessoas reais
  for (const p of REAL_PEOPLE) G.people[p.id] = { ...deepClone(p), real: true };
  // partidos
  for (const def of PARTY_DEFS) { G.parties[def.id] = makeParty(def); G.partyIds.push(def.id); }
  G.parties.out = makeParty(OUTROS); G.partyIds.push('out');
  initRelations(G);
  G.districts = Object.fromEntries(DISTRICTS.map(d => [d.id, { camp: {}, posters: {}, visits: {}, events: [] }]));

  // calibração do eleitorado com os resultados de 2025
  calibrate(G);

  // partido do jogador
  if (cfg.custom) {
    const c = cfg.custom;
    const leaderId = 'lider_novo';
    G.people[leaderId] = {
      id: leaderId, name: c.leader.name, gender: c.leader.gender || 'm', partyId: 'novo', role: 'lider', photo: c.leader.photo || null,
      photoData: c.leader.photo || null, home: c.leader.home || 'lisboa', age: c.leader.age || 45, profession: c.leader.profession || 'jurista',
      traits: c.leader.traits || { carisma: 60, debate: 60, gestao: 60, experiencia: 40 }, localFame: 60, custom: true,
    };
    const p = {
      id: 'novo', short: c.short, name: c.name, fullName: c.name, logo: null, logoData: c.logo || null, logoSvg: c.logoSvg || null,
      color: c.color, color2: c.color2 || '#ffffff', leaderId, ideology: { ...c.ideology }, isCustom: true, pseudo: false,
      organization: 22, funds: c.funds || 150000, militants: 600, founded: cal.year(start), family: c.family,
      personality: { aggression: 0.5, pragmatism: 0.6, officeSeeking: 0.6, discipline: 0.8 }, redLines: { noCoalition: [], noAgreement: [] },
      priorities: c.priorities || [], program: c.program || [], slogan: c.slogan || '', desc: c.desc || 'Novo partido político.',
      valence: ((G.people[leaderId].traits.carisma - 55) / 120) + ((G.people[leaderId].traits.experiencia - 50) / 250),
      awareness: 0.035, momentum: 0, relations: {}, seats: 0, pct2025: 0, districts: DISTRICTS.map(d => d.id), regionalFocus: c.regionalFocus || null,
    };
    p.seatOrder = seatOrderFor(G, p.ideology);
    G.parties.novo = p;
    G.partyIds.splice(G.partyIds.length - 1, 0, 'novo');
    for (const id of G.partyIds) {
      if (id === 'novo' || G.parties[id].pseudo) continue;
      const r = Math.round(clamp(25 - dist(p.ideology, G.parties[id].ideology) * 5, -60, 50));
      p.relations[id] = r; G.parties[id].relations.novo = r;
    }
    initCustomPartyBonus(G, p);
    G.playerPartyId = 'novo';
  } else {
    G.playerPartyId = cfg.partyId || 'ad';
  }

  // listas de candidatos (todos os partidos)
  for (const id of G.partyIds) if (!G.parties[id].pseudo && (G.parties[id].seats > 0 || id === G.playerPartyId)) generateLists(G, id);

  // governo cessante (gestão) e parlamento cessante de 2025
  G.parliament = buildParliament(G, { seats: Object.fromEntries(Object.entries(NATIONAL_2025).filter(([, v]) => v.seats > 0).map(([k, v]) => [k, v.seats])), fromLists: true, initial: true });
  G.government = {
    pmPartyId: 'ad', pm: 'montenegro', coalition: ['ad'], support: [], ministers: deepClone(DEFAULT_CABINETS.ad), startDate: '2025-06-05', caretaker: true,
    approval: 41, stability: 45, honeymoon: 0, programApproved: true, budgets: {}, number: 25,
  };

  // governo-sombra do jogador
  const pp = G.parties[G.playerPartyId];
  pp.shadowCabinet = deepClone(DEFAULT_CABINETS[G.playerPartyId] || {});

  // campanha
  G.campaign = buildCampaign(G, weeks);

  // sondagens iniciais
  for (let i = 0; i < 3; i++) { const poll = makePoll(G); poll.date = cal.addDays(start, -21 + i * 7); G.polls.push(poll); }

  G.news.unshift({ date: start, headline: `${sc.desc.split('.')[0]}. Eleições marcadas para ${cal.longDate(electionDate)}.`, tone: 'neutral' });
  return G;
}
