// Motor dos debates televisivos: rondas, abordagens, pontuação, reações e efeitos eleitorais.
import * as C from '../data/campaign.js';
import { familyOf } from './ideology.js';
import { valenceBoost, awarenessBoost } from './campaign.js';
import { rng } from '../core/rng.js';
import { clamp, fillTemplate } from '../core/util.js';
import { addNews } from '../core/state.js';
import { DISTRICTS } from '../data/districts.js';

const FALLBACK_CHANNEL = { id: 'radio', name: 'Rádio', color: '#1f2937', color2: '#dc2626', moderators: ['Helena Vasconcelos', 'Ricardo Matos'] };
export const APPROACHES = C.APPROACHES || [
  { id: 'proposta', label: 'Proposta concreta' }, { id: 'ataque', label: 'Atacar o adversário' }, { id: 'emocao', label: 'Apelo emocional' },
  { id: 'factcheck', label: 'Desmentir' }, { id: 'soundbite', label: 'Frase de efeito' }, { id: 'esquiva', label: 'Contornar a pergunta' },
];

const leaderOfP = (G, pid) => G.people[G.parties[pid].leaderId] || { name: G.parties[pid].short, traits: { carisma: 50, debate: 50, gestao: 50, experiencia: 50 } };

function pickTopics(G, n, parts) {
  const topics = (C.DEBATE_TOPICS || []).slice();
  const weights = topics.map(t => {
    let w = 1;
    if (G.campaign?.topic && t.area === G.campaign.topic) w += 2.5;
    for (const pid of parts) if ((G.parties[pid].priorities || []).includes(t.area)) w += 0.6;
    if (['saude', 'habitacao', 'economia', 'imigracao'].includes(t.area)) w += 0.8;
    return w;
  });
  const out = [];
  while (out.length < n && topics.length) {
    const t = rng.pickW(topics, weights);
    const i = topics.indexOf(t); topics.splice(i, 1); weights.splice(i, 1); out.push(t);
  }
  return out;
}

export function createDebate(G, debate) {
  const parts = debate.participants.filter(pid => G.parties[pid]);
  const channel = (C.TV_CHANNELS || []).find(c => c.id === debate.channel) || FALLBACK_CHANNEL;
  const nRounds = debate.kind === 'frente' ? 4 : 3;
  return {
    id: debate.id, kind: debate.kind, title: debate.title, channel, moderator: rng.pick(channel.moderators || FALLBACK_CHANNEL.moderators),
    participants: parts, topics: pickTopics(G, nRounds, parts), round: 0, scores: Object.fromEntries(parts.map(p => [p, 0])),
    history: [], lastMove: {}, used: Object.fromEntries(parts.map(p => [p, {}])), prep: G.campaign?.prep || 0, finished: false,
  };
}

export function currentQuestion(G, S) {
  const topic = S.topics[S.round];
  const pid = G.playerPartyId;
  const vars = { lider: leaderOfP(G, pid).name, partido: G.parties[pid].short, adversario: leaderOfP(G, mainRival(G, S)).name };
  const q = fillTemplate(rng.pick(topic.questions || ['Qual é a sua proposta para {tema}?']), { ...vars, tema: topic.tema || topic.name.toLowerCase() });
  return { topic, question: q };
}

export function mainRival(G, S) {
  const others = S.participants.filter(p => p !== G.playerPartyId);
  if (S.kind === 'frente') return others[0];
  // o rival que mais atacou o jogador, senão o maior partido
  const attacker = S.history.slice().reverse().find(h => h.target === G.playerPartyId && h.pid !== G.playerPartyId);
  if (attacker) return attacker.pid;
  return others.sort((a, b) => (G.parties[b].seats || 0) - (G.parties[a].seats || 0))[0];
}

function lineFor(G, S, pid, approach, topic, targetPid) {
  const p = G.parties[pid]; const fam = familyOf(p.ideology, p.isCustom ? null : pid);
  const pool = (C.DEBATE_LINES?.[approach]?.[fam]) || (C.DEBATE_LINES?.[approach]?.generico) || ['{partido} tem propostas claras sobre {tema}.'];
  const props = C.TOPIC_PROPOSALS?.[topic.id]?.[fam] || C.TOPIC_PROPOSALS?.[topic.id]?.centro_esquerda || ['um plano concreto'];
  const atks = C.TOPIC_ATTACKS?.[topic.id] || ['o {partido_adv} falhou nesta matéria'];
  const t = targetPid ? G.parties[targetPid] : null;
  const vars = {
    tema: topic.tema || topic.name.toLowerCase(), partido: p.short, partido_adv: t?.short || 'os outros partidos', adversario: t ? leaderOfP(G, targetPid).name : 'os meus adversários',
    numero: String(rng.pick([2, 3, 5, 10, 15, 20, 30, 40, 50, 100, 300, 500])), cidade: rng.pick(DISTRICTS.filter(d => !d.abroad)).capital,
  };
  vars.proposta = rng.pick(props);
  vars.ataque = fillTemplate(rng.pick(atks), vars);
  return fillTemplate(fillTemplate(rng.pick(pool), vars), vars);
}

function scoreMove(G, S, pid, approach, topic, targetPid) {
  const L = leaderOfP(G, pid); const t = L.traits || {}; const p = G.parties[pid];
  const pri = (p.priorities || []).includes(topic.area) ? 1 : 0;
  const isPlayer = pid === G.playerPartyId;
  const prep = isPlayer ? S.prep * 0.55 : 0.6;
  const energyPen = isPlayer && (G.campaign?.energy ?? 100) < 30 ? -1 : 0;
  const flags = {};
  let s = 0;
  const used = S.used[pid][approach] || 0;
  switch (approach) {
    case 'proposta': s = 2 + ((t.gestao ?? 50) - 50) / 14 + pri * 1.2 + prep; break;
    case 'ataque': {
      const govBonus = G.government && !G.government.caretaker && G.government.coalition.includes(targetPid) ? 1.0 : (targetPid === 'ad' ? 0.8 : 0);
      s = 1.7 + ((t.debate ?? 50) - 50) / 12 + govBonus + prep * 0.5;
      if (rng.chance(0.2 - ((t.debate ?? 50) - 50) / 400 + used * 0.06)) { s -= 2.6; flags.backlash = true; }
      break;
    }
    case 'emocao': s = 1.4 + ((t.carisma ?? 50) - 50) / 12 + (['saude', 'social', 'habitacao', 'educacao'].includes(topic.area) ? 1 : 0) - used * 0.4; break;
    case 'factcheck': {
      const lm = targetPid ? S.lastMove[targetPid] : null;
      if (lm && lm.exaggerated) { s = 3.4 + ((t.debate ?? 50) - 50) / 15; flags.caught = true; }
      else { s = -1.3; flags.misfire = true; }
      break;
    }
    case 'soundbite': {
      s = 1 + ((t.carisma ?? 50) - 50) / 10;
      const r = rng.next();
      if (r < 0.27) { s += 3; flags.viral = true; } else if (r > 0.86) { s -= 3; flags.gaffe = true; }
      break;
    }
    case 'esquiva': s = 0.7 - used * 1.3; if (used) flags.evasive = true; break;
    default: s = 1;
  }
  s += energyPen + rng.gauss(0, 0.45);
  flags.exaggerated = (approach === 'soundbite' || approach === 'ataque') && rng.chance(0.45);
  return { s, flags };
}

function aiApproach(G, S, pid, targetPid) {
  const per = G.parties[pid].personality || { aggression: 0.5, pragmatism: 0.5 };
  const lm = targetPid ? S.lastMove[targetPid] : null;
  const opts = [
    ['proposta', 1 + per.pragmatism * 2], ['ataque', 0.6 + per.aggression * 2.4], ['emocao', 0.9], ['soundbite', 0.4 + per.aggression * 1.2],
    ['factcheck', lm && (lm.approach === 'soundbite' || lm.approach === 'ataque') ? 1.6 : 0.1], ['esquiva', 0.25],
  ];
  return rng.pickW(opts.map(o => o[0]), opts.map(o => o[1]));
}

// Jogada do jogador numa ronda; resolve também as respostas da IA.
export function playRound(G, S, approach, opts = {}) {
  const topic = S.topics[S.round];
  const me = G.playerPartyId;
  const rival = mainRival(G, S);
  const results = [];
  const order = S.round % 2 === 0 ? [me, ...S.participants.filter(p => p !== me)] : [...S.participants.filter(p => p !== me), me];
  // em debates com muitos participantes, só 2 adversários respondem por ronda
  const speakers = S.kind === 'frente' ? order : order.filter(p => p === me || p === rival || rng.chance(0.35)).slice(0, 4);
  for (const pid of speakers) {
    const target = pid === me ? rival : (S.kind === 'frente' || rng.chance(0.55) ? me : rng.pick(S.participants.filter(x => x !== pid)));
    const ap = pid === me ? approach : aiApproach(G, S, pid, target);
    const { s, flags } = scoreMove(G, S, pid, ap, topic, target);
    const text = pid === me && opts.customText ? opts.customText : lineFor(G, S, pid, ap, topic, target);
    S.scores[pid] += s;
    if (ap === 'ataque' && !flags.backlash && target) S.scores[target] -= Math.max(0, s) * 0.3;
    if (flags.caught && target) S.scores[target] -= 1.5;
    S.used[pid][ap] = (S.used[pid][ap] || 0) + 1;
    S.lastMove[pid] = { approach: ap, exaggerated: flags.exaggerated };
    const entry = { round: S.round, pid, approach: ap, text, delta: s, flags, target };
    S.history.push(entry); results.push(entry);
  }
  S.round++;
  if (S.round >= S.topics.length) S.finished = true;
  return results;
}

export function modLine(G, S, kind) { const M = MODERATOR(); const me = G.playerPartyId; const riv = mainRival(G, S); const vars = { lider: leaderOfP(G, me).name, adversario: riv ? leaderOfP(G, riv).name : '', partido: G.parties[me].short, partido_adv: riv ? G.parties[riv].short : '', canal: S.channel.name }; return fillTemplate(rng.pick(M[kind] || ['']), vars); }
export const MODERATOR = () => C.MODERATOR_LINES || { intro: ['Boa noite. Começamos o debate.'], transition: ['Passamos ao tema seguinte.'], interrupt: ['Peço-lhe que conclua.'], closing: ['Obrigado a ambos. Boa noite.'] };

// Conclusão: vencedor, sondagem relâmpago e efeitos
export function finishDebate(G, S, debate) {
  const me = G.playerPartyId;
  const others = S.participants.filter(p => p !== me);
  const avg = others.reduce((s, p) => s + S.scores[p], 0) / Math.max(1, others.length);
  const diff = S.scores[me] - avg;
  const ranking = S.participants.slice().sort((a, b) => S.scores[b] - S.scores[a]);
  // sondagem relâmpago "quem ganhou o debate"
  const flash = {};
  const tot = S.participants.reduce((s, p) => s + Math.exp(S.scores[p] / 4), 0);
  for (const p of S.participants) flash[p] = Math.round((Math.exp(S.scores[p] / 4) / tot) * 85);
  flash.empate = 100 - Object.values(flash).reduce((s, x) => s + x, 0);
  const kindAw = { frente: 0.1, todos: 0.07, pequenos: 0.06, radio: 0.03 }[S.kind] || 0.05;
  const vDelta = clamp(diff * 0.022, -0.22, 0.26);
  valenceBoost(G, me, vDelta);
  awarenessBoost(G, me, kindAw + Math.max(0, diff) * 0.004);
  for (const p of others) valenceBoost(G, p, clamp((S.scores[p] - S.scores[me]) * 0.008, -0.12, 0.12) * (S.kind === 'frente' ? 1 : 0.4));
  const winner = ranking[0];
  const wp = G.parties[winner];
  addNews(winner === me ? `Comentadores dão vitória a ${leaderOfP(G, me).name} no debate da ${S.channel.name}.` : `${leaderOfP(G, winner).name} (${wp.short}) considerado vencedor do debate da ${S.channel.name}.`, { tone: winner === me ? 'good' : 'neutral' });
  const result = { winner, ranking, flash, diff, vDelta, scores: { ...S.scores } };
  if (debate) { debate.done = true; debate.result = result; }
  if (G.campaign) G.campaign.prep = 0;
  return result;
}
