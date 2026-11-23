// Campanha eleitoral: calendário, debates, ações do jogador, campanha da IA, avanço de turnos.
import { DISTRICTS, DISTRICT_BY_ID, NATIONAL_2025 } from '../data/districts.js';
import { nationalShares } from './electorate.js';
import { makePoll } from './polls.js';
import { listStrength } from './candidates.js';
import * as cal from '../core/calendar.js';
import { rng } from '../core/rng.js';
import { clamp, fmtPct } from '../core/util.js';
import { addNews, addLog } from '../core/state.js';

export const ACTIONS = [
  { id: 'arruada', label: 'Arruada', icon: '🚶', ap: 1, energy: 12, cost: 3000, district: true, scene: true, desc: 'Percorra as ruas de uma cidade com a comitiva: cumprimente eleitores, converta indecisos e evite confrontos.' },
  { id: 'comicio', label: 'Comício', icon: '🎤', ap: 1, energy: 16, cost: 0, district: true, scene: true, desc: 'Discurso perante os apoiantes. Escolha bem a dimensão do recinto: um pavilhão meio vazio é notícia.' },
  { id: 'cartazes', label: 'Cartazes e outdoors', icon: '🪧', ap: 1, energy: 3, cost: 0, district: true, scene: true, desc: 'Escolha os melhores locais (rotundas, avenidas) e o design do cartaz.' },
  { id: 'visita', label: 'Visita temática', icon: '🏥', ap: 1, energy: 8, cost: 1500, district: true, desc: 'Hospital, escola, fábrica, feira, lar… Mostre proximidade a um grupo social.' },
  { id: 'entrevista', label: 'Entrevista', icon: '🎙️', ap: 1, energy: 8, cost: 0, desc: 'Entrevista em direto: perguntas difíceis, respostas que contam.' },
  { id: 'redes', label: 'Redes sociais', icon: '📱', ap: 1, energy: 3, cost: 0, desc: 'Vídeos, diretos e anúncios segmentados. Chega aos jovens, mas cuidado com as polémicas.' },
  { id: 'angariacao', label: 'Angariação de fundos', icon: '💶', ap: 1, energy: 8, cost: 0, desc: 'Jantares de apoiantes, quotas e donativos — dentro dos limites da lei do financiamento.' },
  { id: 'preparar', label: 'Preparar debate', icon: '📚', ap: 1, energy: 6, cost: 0, desc: 'Ensaios com a equipa e dossiês temáticos: bónus no próximo debate.' },
  { id: 'programa', label: 'Apresentar o programa', icon: '📘', ap: 1, energy: 6, cost: 5000, once: true, desc: 'Sessão pública de apresentação do programa eleitoral.' },
  { id: 'mobilizar', label: 'Mobilização do voto', icon: '🗳️', ap: 1, energy: 10, cost: 12000, district: true, official: true, desc: 'Porta a porta e transporte de eleitores: aumenta a participação dos seus apoiantes.' },
  { id: 'sondagem', label: 'Sondagem interna', icon: '📊', ap: 0, energy: 0, cost: 15000, desc: 'Estimativas por círculo (com margem de erro). Não gasta ações.' },
  { id: 'descanso', label: 'Descansar', icon: '☕', ap: 1, energy: -35, cost: 0, desc: 'Recupere energia. Um líder exausto comete gaffes.' },
];

export const VENUES = [
  { id: 'praca', label: 'Praça central (ao ar livre)', capacity: 1500, cost: 6000 },
  { id: 'pavilhao', label: 'Pavilhão municipal', capacity: 4000, cost: 22000 },
  { id: 'coliseu', label: 'Coliseu / grande pavilhão', capacity: 9000, cost: 60000 },
];

const CHANNELS = ['rtp', 'sic', 'tvi', 'cnn'];

function parliamentaryParties(G) {
  return G.partyIds.filter(id => !G.parties[id].pseudo && (NATIONAL_2025[id]?.seats || 0) > 0);
}

function scheduleDebates(G, turns) {
  const pid = G.playerPartyId; const p = G.parties[pid];
  const pre = turns.map((t, i) => ({ t, i })).filter(x => x.t.kind === 'pre');
  const off = turns.map((t, i) => ({ t, i })).filter(x => x.t.kind === 'oficial');
  const debates = [];
  const parl = parliamentaryParties(G);
  const top8 = (extra) => { const base = parl.slice().sort((a, b) => (NATIONAL_2025[b]?.seats || 0) - (NATIONAL_2025[a]?.seats || 0)); const arr = extra && !base.includes(extra) ? [extra, ...base] : base; return [...new Set([pid, ...arr])].slice(0, 8); };
  if (p.isCustom || !parl.includes(pid)) {
    const small = [pid, 'adn', 'volt', 'rir', 'nd', 'mrpp'].filter(id => G.parties[id]);
    debates.push({ id: 'd_pequenos', kind: 'pequenos', turn: pre[Math.min(2, pre.length - 1)].i, channel: 'rtp', participants: small, title: 'Debate dos partidos sem representação parlamentar (RTP3)' });
    const nearest = parl.slice().sort((a, b) => dist2(G.parties[a].ideology, p.ideology) - dist2(G.parties[b].ideology, p.ideology))[0];
    debates.push({ id: 'd_ff_conv', kind: 'frente', turn: pre[pre.length - 1].i, channel: 'sic', participants: [pid, nearest], conditional: { minPoll: 5 }, title: `Frente-a-frente com ${G.parties[nearest].short} (convite da SIC)` });
    debates.push({ id: 'd_todos', kind: 'todos', turn: off[0].i, channel: 'rtp', participants: top8(), conditional: { minPoll: 2.5 }, title: 'Debate com todos os líderes (RTP1)' });
  } else {
    const rivals = parl.filter(x => x !== pid).sort((a, b) => (NATIONAL_2025[b]?.seats || 0) - (NATIONAL_2025[a]?.seats || 0)).slice(0, 5);
    rivals.forEach((r, k) => debates.push({ id: 'd_ff_' + r, kind: 'frente', turn: pre[Math.min(pre.length - 1, 1 + k)].i, channel: CHANNELS[k % 4], participants: [pid, r], title: `Frente-a-frente ${p.short} × ${G.parties[r].short}` }));
    debates.push({ id: 'd_todos', kind: 'todos', turn: off[0].i, channel: 'rtp', participants: top8(), title: 'Debate com todos os líderes (RTP1)' });
    debates.push({ id: 'd_radio', kind: 'radio', turn: off[Math.min(3, off.length - 1)].i, channel: 'radio', participants: top8().slice(0, 6), title: 'Debate nas rádios (Antena 1, Renascença, TSF)' });
  }
  debates.forEach(d => { d.done = false; d.result = null; });
  return debates;
}
function dist2(a, b) { return (a.econ - b.econ) ** 2 + (a.social - b.social) ** 2 + (a.sistema - b.sistema) ** 2; }

export function buildCampaign(G, weeks) {
  const E = G.electionDate;
  const campStart = cal.addDays(E, -14);
  const turns = [];
  let d = G.startDate;
  while (cal.isBefore(d, campStart)) { turns.push({ date: d, kind: 'pre', days: 7 }); d = cal.addDays(d, 7); }
  for (let k = 14; k >= 2; k -= 2) turns.push({ date: cal.addDays(E, -k), kind: 'oficial', days: 2 });
  const p = G.parties[G.playerPartyId];
  return {
    turn: 0, turns, weeks, apMax: 4, ap: 4, energy: 100, money: p.funds, spent: 0, raised: 0,
    spendingLimit: p.isCustom ? 1200000 : 4200000,
    listsDeadline: cal.addDays(E, -41), listsSubmitted: false,
    debates: scheduleDebates(G, turns), mobilization: {}, prep: 0, topic: null, internalPoll: null,
    done: {}, actionsTaken: [], pendingEvents: [], programPublished: false, visited: {},
  };
}

export const currentTurn = G => G.campaign.turns[G.campaign.turn];
export const isOfficial = G => currentTurn(G)?.kind === 'oficial';
export const turnsLeft = G => G.campaign.turns.length - G.campaign.turn;

export function canDo(G, action) {
  const C = G.campaign;
  if (action.ap > C.ap) return { ok: false, why: 'Sem ações disponíveis neste turno.' };
  if (action.cost && action.cost > C.money) return { ok: false, why: 'Fundos insuficientes.' };
  if (action.once && C.done[action.id]) return { ok: false, why: 'Já realizado.' };
  if (action.official && !isOfficial(G)) return { ok: false, why: 'Só durante a campanha oficial.' };
  if (action.id !== 'descanso' && action.energy > 0 && C.energy < 8) return { ok: false, why: 'O líder está exausto. Descanse.' };
  return { ok: true };
}

export function spend(G, amount) {
  const C = G.campaign; C.money -= amount; C.spent += amount;
  if (C.spent > C.spendingLimit && !G.flags.overLimit) { G.flags.overLimit = true; addNews('ECFP alerta: despesas de campanha ultrapassam o limite legal.', { tone: 'bad' }); G.parties[G.playerPartyId].valence -= 0.08; }
}

export function useAction(G, action) {
  const C = G.campaign;
  C.ap -= action.ap; C.energy = clamp(C.energy - action.energy, 0, 100);
  if (action.cost) spend(G, action.cost);
  C.done[action.id] = (C.done[action.id] || 0) + 1;
  C.actionsTaken.push({ turn: C.turn, id: action.id });
}

// Efeito local de campanha (utilidade) e efeito de notoriedade
export function localBoost(G, pid, did, value) {
  const st = G.districts[did]; st.camp[pid] = clamp((st.camp[pid] || 0) + value, -1, 1.5);
}
export function awarenessBoost(G, pid, value) {
  const p = G.parties[pid]; if (!p.isCustom) return;
  const a = p.awareness ?? 1;
  p.awareness = clamp(a + value * (1 - a * 0.7), 0.01, 1);
}
export function valenceBoost(G, pid, value) { const p = G.parties[pid]; p.valence = clamp((p.valence || 0) + value, -2.5, 2.5); }

// Risco de gaffe quando o líder está cansado
export function gaffeCheck(G) {
  const C = G.campaign;
  const risk = C.energy < 20 ? 0.35 : C.energy < 35 ? 0.15 : 0.03;
  if (rng.chance(risk)) {
    valenceBoost(G, G.playerPartyId, -0.08);
    const lines = ['Líder confunde números do desemprego em direto', 'Microfone apanha desabafo do líder sobre os jornalistas', 'Líder troca o nome da cidade durante o discurso', 'Resposta atrapalhada sobre impostos torna-se viral'];
    addNews(rng.pick(lines) + ` (${G.parties[G.playerPartyId].short}).`, { tone: 'bad' });
    return true;
  }
  return false;
}

// ---- Resolução das ações "rápidas" (as cenas 3D chamam as funções de resultado) ----
export function resolveArruada(G, did, score) {
  const pid = G.playerPartyId;
  const v = clamp(0.03 + score.converted * 0.009 + score.followers * 0.004 + score.greeted * 0.002 - score.incidents * 0.025 + listStrength(G, pid, did) * 0.05, -0.08, 0.32);
  localBoost(G, pid, did, v);
  awarenessBoost(G, pid, 0.006 + score.press * 0.003);
  valenceBoost(G, pid, score.incidents > 2 ? -0.03 : 0.005);
  const town = score.town || DISTRICT_BY_ID[did].capital;
  addNews(score.incidents > 2 ? `Arruada do ${G.parties[pid].short} em ${town} marcada por momentos de tensão.` : `Arruada do ${G.parties[pid].short} em ${town} junta ${score.followers + 20} apoiantes.`, { tone: score.incidents > 2 ? 'bad' : 'good' });
  return v;
}

export function resolveComicio(G, did, venue, themes, speechQuality) {
  const pid = G.playerPartyId; const p = G.parties[pid];
  const sh = nationalShares(G).byDistrict[did][pid] || 0;
  const pop = DISTRICT_BY_ID[did].registered;
  const draw = (sh * pop * 0.006 + p.organization * 18 + (p.isCustom ? 120 : 400)) * rng.range(0.8, 1.2) * (1 + speechQuality * 0.1);
  const attendance = Math.round(clamp(draw, 80, venue.capacity * 1.1));
  const fill = attendance / venue.capacity;
  let v = 0.05 + Math.min(1, fill) * 0.12 + speechQuality * 0.04 + themes.length * 0.01;
  let tone = 'good';
  if (fill < 0.45) { v -= 0.08; valenceBoost(G, pid, -0.05); tone = 'bad'; addNews(`Imagens de um recinto meio vazio no comício do ${p.short} em ${DISTRICT_BY_ID[did].capital}.`, { tone: 'bad' }); }
  else { valenceBoost(G, pid, 0.02 + speechQuality * 0.015); addNews(`Comício do ${p.short} em ${DISTRICT_BY_ID[did].capital} reúne cerca de ${attendance.toLocaleString('pt-PT')} pessoas.`, { tone: 'good' }); }
  localBoost(G, pid, did, v);
  awarenessBoost(G, pid, 0.012);
  return { attendance, fill, v, tone };
}

export function resolveCartazes(G, did, slots) {
  const pid = G.playerPartyId;
  let vis = 0; for (const s of slots) vis += s.visibility * (s.kind === 'outdoor' ? 1.4 : s.kind === 'mupi' ? 0.8 : 0.35);
  const v = clamp(vis * 0.012, 0, 0.25);
  localBoost(G, pid, did, v);
  awarenessBoost(G, pid, vis * 0.0025);
  G.districts[did].posters[pid] = (G.districts[did].posters[pid] || 0) + slots.length;
  return v;
}

export function resolveVisita(G, did, visit) {
  const pid = G.playerPartyId; const d = DISTRICT_BY_ID[did];
  let v = 0.05;
  if (d.issues.some(i => visit.area && i.toLowerCase().includes((visit.keyword || visit.area).slice(0, 5)))) v += 0.03;
  localBoost(G, pid, did, v); awarenessBoost(G, pid, 0.006); valenceBoost(G, pid, 0.008);
  addNews(`${G.people[G.parties[pid].leaderId].name} visita ${visit.place || visit.label} em ${d.capital}.`, { tone: 'neutral' });
  return v;
}

export function resolveFundraising(G) {
  const p = G.parties[G.playerPartyId];
  const sh = (nationalShares(G).shares[G.playerPartyId] || 0) * 100;
  const amount = Math.round((8000 + p.organization * 500 + sh * 2500) * rng.range(0.7, 1.3) / 100) * 100;
  G.campaign.money += amount; G.campaign.raised += amount;
  if (rng.chance(0.08)) { valenceBoost(G, G.playerPartyId, -0.05); addNews(`Entidade das Contas questiona donativo recebido pelo ${p.short}.`, { tone: 'bad' }); }
  return amount;
}

export function internalPoll(G) {
  const { byDistrict, shares } = nationalShares(G);
  const noisy = {};
  for (const did in byDistrict) { noisy[did] = {}; for (const pid in byDistrict[did]) noisy[did][pid] = clamp(byDistrict[did][pid] * 100 + rng.gauss(0, 1.6), 0, 100); }
  G.campaign.internalPoll = { date: G.date, byDistrict: noisy, national: shares };
  return G.campaign.internalPoll;
}

// ---- Campanha da IA e avanço do turno ----
function aiCampaign(G) {
  for (const id of G.partyIds) {
    const p = G.parties[id];
    if (p.pseudo || id === G.playerPartyId) continue;
    // deriva aleatória de valência (notícias, desempenho)
    p.valence = clamp((p.valence || 0) + rng.gauss(0, 0.025), -2, 2);
    // campanha local nos círculos mais importantes
    const k = Math.round(1 + p.organization / 30);
    const targets = rng.sample(DISTRICTS.filter(d => d.results2025[id] != null && !d.abroad), k);
    for (const d of targets) localBoost(G, id, d.id, rng.range(0.01, 0.05) * (p.organization / 70));
  }
}

export function decayCampaign(G) {
  for (const did in G.districts) { const c = G.districts[did].camp; for (const pid in c) c[pid] *= 0.92; }
  for (const id of G.partyIds) { const p = G.parties[id]; p.valence = (p.valence || 0) * 0.985; }
}

export function pendingDebates(G) {
  const C = G.campaign;
  return C.debates.filter(d => !d.done && d.turn === C.turn && debateAvailable(G, d));
}
export function debateAvailable(G, d) {
  if (!d.conditional) return true;
  const avg = G.polls.slice(-3).reduce((s, p) => s + (p.results[G.playerPartyId] || 0), 0) / Math.max(1, Math.min(3, G.polls.length));
  return avg >= d.conditional.minPoll;
}

// Termina o turno de campanha. Devolve { finished } quando chega o fim da campanha.
export function endCampaignTurn(G) {
  const C = G.campaign;
  // debates obrigatórios não realizados contam como ausência
  for (const d of C.debates) if (!d.done && d.turn === C.turn) {
    if (debateAvailable(G, d)) { d.done = true; d.result = { absent: true }; valenceBoost(G, G.playerPartyId, -0.12); addNews(`Cadeira vazia: líder do ${G.parties[G.playerPartyId].short} falta ao debate.`, { tone: 'bad' }); }
    else { d.done = true; d.result = { notInvited: true }; }
  }
  decayCampaign(G);
  aiCampaign(G);
  C.energy = clamp(C.energy + 12, 0, 100);
  // partido novo: crescimento orgânico da estrutura
  const p = G.parties[G.playerPartyId];
  if (p.isCustom) { p.organization = clamp(p.organization + 1.2, 0, 70); awarenessBoost(G, p.id, 0.004); }
  const prevShare = (nationalShares(G).shares[p.id] || 0) * 100;
  C.turn++;
  if (C.turn >= C.turns.length) {
    G.date = cal.addDays(G.electionDate, -1);
    return { finished: true };
  }
  const t = C.turns[C.turn];
  G.date = t.date;
  C.apMax = t.kind === 'oficial' ? 3 : 4;
  C.ap = C.apMax;
  // listas de candidatos
  if (!C.listsSubmitted && !cal.isBefore(G.date, C.listsDeadline)) {
    C.listsSubmitted = true;
    addNews(`Terminou o prazo de entrega das listas. O ${p.short} apresentou candidaturas nos ${p.isCustom ? p.districts.length : 'vários'} círculos.`, { tone: 'neutral' });
  }
  // sondagens
  const nPolls = t.kind === 'oficial' ? 1 : rng.int(1, 2);
  for (let i = 0; i < nPolls; i++) G.polls.push(makePoll(G));
  const lastPoll = G.polls[G.polls.length - 1];
  const now = lastPoll.results[p.id] || 0;
  p.momentum = clamp((now - prevShare) / 3, -1, 1);
  if (t.kind === 'oficial' && C.turn === C.turns.findIndex(x => x.kind === 'oficial')) addNews('Arranca a campanha eleitoral oficial: 12 dias até ao fim da campanha.', { tone: 'neutral' });
  addLog(`Sondagem ${lastPoll.pollster}: ${p.short} ${fmtPct(now)}`);
  return { finished: false };
}
