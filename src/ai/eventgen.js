// "IA offline" — geração de acontecimentos (governação, oposição, campanha, regime).
import * as EV from '../data/events.js';
import * as CAMP from '../data/campaign.js';
import { DISTRICTS } from '../data/districts.js';
import { MINISTRIES, AREA_TO_MINISTRY } from '../data/ministries.js';
import { applyEffects } from '../sim/effects.js';
import { rng } from '../core/rng.js';
import { fillTemplate, uid, clamp } from '../core/util.js';
import { addNews } from '../core/state.js';
import * as cal from '../core/calendar.js';

const REGIONS = ['Norte', 'Centro', 'Alentejo', 'Algarve', 'Área Metropolitana de Lisboa', 'Área Metropolitana do Porto', 'Madeira', 'Açores', 'interior do país'];
const UNIONS = ['CGTP', 'UGT', 'FENPROF', 'FNE', 'Sindicato Independente dos Médicos', 'Sindicato dos Enfermeiros Portugueses', 'STOP', 'Sindicato dos Maquinistas'];

function ctxVars(G, area) {
  const gov = G.government;
  const pm = gov ? G.people[gov.pm] : null;
  const mid = AREA_TO_MINISTRY[area] || 'presidencia';
  const minister = gov?.ministers?.[mid] ? G.people[gov.ministers[mid]] : null;
  const me = G.parties[G.playerPartyId];
  const oppLeader = (() => {
    if (!gov || !G.parliament) return '';
    const opp = Object.keys(G.parliament.seats).filter(p => !gov.coalition.includes(p) && G.parliament.seats[p] > 0).sort((a, b) => G.parliament.seats[b] - G.parliament.seats[a])[0];
    return opp ? G.people[G.parties[opp].leaderId]?.name || G.parties[opp].short : '';
  })();
  const d = rng.pick(DISTRICTS.filter(x => !x.abroad));
  return {
    pm: pm?.name || 'o Primeiro-Ministro', ministro: minister?.name || `o ministro da tutela`, partido_gov: gov ? G.parties[gov.pmPartyId]?.short : '',
    partido_jogador: me?.short, lider_jogador: G.people[me?.leaderId]?.name, lider_oposicao: oppLeader, presidente: G.people[G.president.id]?.name || 'o Presidente da República',
    cidade: rng.pick(d.towns), distrito: d.name, regiao: rng.pick(REGIONS), numero: String(rng.pick([3, 5, 8, 12, 15, 20, 25, 40, 50, 120, 200, 300])),
    ano: String(cal.year(G.date)), sindicato: rng.pick(UNIONS),
  };
}

function eligible(G, t) {
  const w = t.when || {};
  const m = cal.month(G.date);
  if (w.months && !w.months.includes(m)) return false;
  const appr = G.government?.approval ?? 50;
  if (w.minApproval != null && appr < w.minApproval) return false;
  if (w.maxApproval != null && appr > w.maxApproval) return false;
  if (w.needsFlag && !G.flags[w.needsFlag]) return false;
  if (w.notFlag && G.flags[w.notFlag]) return false;
  if (w.regimeOnly && !G.regime?.active) return false;
  if (!w.regimeOnly && G.regime?.active && t.__pool !== 'regime') return false;
  return true;
}

export function instantiate(G, t) {
  const vars = { ...ctxVars(G, t.area) };
  for (const k in (t.vars || {})) vars[k] = rng.pick(t.vars[k]);
  const f = s => fillTemplate(fillTemplate(s, vars), vars);
  const fe = eff => { if (!eff) return eff; const o = JSON.parse(JSON.stringify(eff)); if (typeof o.news === 'string') o.news = f(o.news); return o; };
  return {
    id: uid('ev'), tplId: t.id, area: t.area, severity: t.severity || 1, date: G.date, title: f(t.title), text: f(t.text),
    options: (t.options || []).map(o => ({ ...o, effects: fe(o.effects), label: f(o.label), desc: f(o.desc || ''), chance: o.chance ? { ...o.chance, success: fe(o.chance.success), failure: fe(o.chance.failure), successText: f(o.chance.successText || ''), failureText: f(o.chance.failureText || '') } : null })),
  };
}

function pickFrom(G, pool, n, tag) {
  const seen = G.events.seen || (G.events.seen = {});
  const cands = (pool || []).map(t => ({ ...t, __pool: tag })).filter(t => eligible(G, t));
  const out = [];
  for (let i = 0; i < n && cands.length; i++) {
    const weights = cands.map(t => { const last = seen[t.id]; const recent = last ? Math.max(0, 12 - Math.abs(cal.monthsBetween(last, G.date))) : 0; return (t.weight || 1) * (recent ? 0.08 : 1); });
    const t = rng.pickW(cands, weights);
    cands.splice(cands.indexOf(t), 1);
    seen[t.id] = G.date;
    out.push(instantiate(G, t));
  }
  return out;
}

// Crise procedimental (combinatória) para variedade
function proceduralCrisis(G) {
  const GC = EV.GENERIC_CRISIS;
  if (!GC?.sectors?.length || !GC?.problems?.length) return null;
  const sector = rng.pick(GC.sectors), problem = rng.pick(GC.problems);
  const coastal = ['Peniche', 'Matosinhos', 'Sesimbra', 'Olhão', 'Viana do Castelo', 'Aveiro', 'Figueira da Foz', 'Portimão', 'Nazaré', 'Póvoa de Varzim', 'Setúbal', 'Vila Real de Santo António'];
  const place = /pesca|porto|mar|praia|costa/i.test(String(sector.label || sector.id || '')) ? rng.pick(coastal) : rng.pick(GC.places || DISTRICTS.map(d => d.capital));
  const subject = fillTemplate(String(sector.label || sector.name || sector), { cidade: place, distrito: place, regiao: place });
  const pred = String(problem.text || problem.label || problem);
  const area = sector.area || 'economia';
  const sev = problem.severity || rng.int(1, 3);
  const grp = sector.group || 'trabalhadores';
  const k = [0.6, 1, 1.6][sev - 1] || 1;
  const scale = e => { const o = JSON.parse(JSON.stringify(e || {})); for (const key of ['budget', 'approval', 'unrest', 'media']) if (o[key]) o[key] = Math.round(o[key] * k * 10) / 10; if (o.groups) for (const g in o.groups) o.groups[g] = Math.round(o.groups[g] * k); return o; };
  const opts = (GC.responses?.length ? GC.responses : [
    { label: 'Reforçar meios de imediato', desc: 'Custo orçamental.', effects: { budget: 60, approval: 1 } },
    { label: 'Negociar e criar um grupo de trabalho', desc: 'Ganha tempo.', effects: { approval: 0 } },
    { label: 'Manter a linha orçamental', desc: 'Contas certas, desgaste político.', effects: { approval: -2 } },
  ]).map(o => { const e = scale(o.effects); if (e.groups == null && (e.approval || 0) > 0) e.groups = { [grp]: Math.round(4 * k) }; return { ...o, effects: e, chance: o.chance ? { ...o.chance, success: scale(o.chance.success), failure: scale(o.chance.failure) } : null }; });
  const title = subject.charAt(0).toUpperCase() + subject.slice(1) + ' ' + pred;
  return {
    id: uid('ev'), tplId: 'proc_' + (sector.id || area), area, severity: sev, date: G.date, procedural: true,
    title, text: `${title}. As associações do setor exigem uma resposta rápida e a oposição acusa o Governo de inação. As televisões abrem os noticiários com o caso.`,
    options: opts,
  };
}

// Eventos do mês consoante a situação do jogador
export function monthlyEvents(G) {
  if (G.phase === 'regime' || G.regime?.active) return pickFrom(G, EV.REGIME_EVENTS, rng.int(1, 2), 'regime');
  const gov = G.government;
  const inGov = gov && !gov.caretaker && gov.coalition.includes(G.playerPartyId);
  if (inGov) {
    const n = rng.chance(0.35) ? 2 : 1;
    const evs = pickFrom(G, EV.GOV_EVENTS, n, 'gov');
    if (rng.chance(0.22)) { const p = proceduralCrisis(G); if (p) evs.push(p); }
    return evs;
  }
  return rng.chance(0.75) ? pickFrom(G, EV.OPPOSITION_EVENTS, 1, 'opp') : [];
}

export function campaignEvents(G) {
  if (!rng.chance(0.7)) return [];
  return pickFrom(G, CAMP.CAMPAIGN_EVENTS, 1, 'camp');
}

// Resolve a escolha do jogador
export function resolveEvent(G, ev, optIndex) {
  const o = ev.options[optIndex];
  let text = o.desc || '';
  let effects = o.effects || {};
  let success = null;
  if (o.chance) {
    success = rng.chance(o.chance.p);
    effects = success ? o.chance.success : o.chance.failure;
    text = success ? o.chance.successText : o.chance.failureText;
  }
  applyEffects(G, effects, { longRun: false, tone: success === false ? 'bad' : 'neutral' });
  if (o.setFlag) G.flags[o.setFlag] = G.date;
  G.events.pending = G.events.pending.filter(e => e.id !== ev.id);
  G.events.history.unshift({ date: G.date, title: ev.title, choice: o.label, result: text, success });
  if (G.events.history.length > 80) G.events.history.length = 80;
  G.stats.eventsResolved++;
  addNews(`${ev.title}: ${o.label.charAt(0).toLowerCase() + o.label.slice(1)}.`, { tone: success === false ? 'bad' : 'neutral', area: ev.area });
  return { text, effects, success };
}

// Governo da IA resolve um problema (escolhe a opção com melhor efeito na aprovação)
export function autoResolveForAI(G) {
  const pool = (EV.GOV_EVENTS || []).filter(t => eligible(G, t));
  if (!pool.length) return null;
  const ev = instantiate(G, rng.pick(pool));
  let best = 0, bs = -99;
  ev.options.forEach((o, i) => { const e = o.effects || o.chance?.success || {}; const s = (e.approval || 0) - (e.budget || 0) / 300; if (s > bs) { bs = s; best = i; } });
  const o = ev.options[best];
  applyEffects(G, o.effects || (rng.chance(o.chance?.p || 0.5) ? o.chance?.success : o.chance?.failure) || {}, { longRun: false });
  addNews(`${ev.title} — o Governo decide: ${o.label.charAt(0).toLowerCase() + o.label.slice(1)}.`, { tone: 'neutral', area: ev.area });
  return ev.title;
}

export function ministryName(id) { return MINISTRIES.find(m => m.id === id)?.name || id; }
export { clamp };
