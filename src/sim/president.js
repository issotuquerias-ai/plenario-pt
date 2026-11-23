// Presidente da República: promulgação, vetos, Tribunal Constitucional, dissolução da Assembleia.
import { dist } from './ideology.js';
import { rng } from '../core/rng.js';
import { monthsBetween } from '../core/calendar.js';
import { clamp } from '../core/util.js';

const VETO_REASONS = [
  'O diploma não reúne o consenso social e político que a matéria exige.',
  'Subsistem dúvidas sobre o impacto orçamental e a sustentabilidade da medida.',
  'O diploma foi aprovado à pressa, sem a necessária audição dos parceiros sociais.',
  'A solução encontrada pode agravar desigualdades e merece ponderação adicional.',
  'O diploma suscita reservas quanto à proteção da confiança dos cidadãos.',
];

export function presidentName(G) { return G.people[G.president.id]?.name || G.president.name; }

// Decide sobre um diploma aprovado na AR (ou decreto do Governo).
export function presidentReview(G, bill) {
  const P = G.president;
  if (bill.type === 'revisao') return { decision: 'promulgar', reason: 'A Constituição obriga à promulgação das leis de revisão constitucional (art. 286.º, n.º 3).' };
  if (bill.type === 'orcamento') return rng.chance(0.03) ? { decision: 'tc', reason: 'Dúvidas sobre normas orçamentais concretas.' } : { decision: 'promulgar', reason: 'O país precisa de um Orçamento em vigor.' };
  if (bill.constitutional) {
    if (bill.constitutional.severity === 'grave' || rng.chance(0.6)) return { decision: 'tc', reason: `Fiscalização preventiva da constitucionalidade (${(bill.constitutional.articles || []).map(a => 'art. ' + a).join(', ') || 'normas em causa'}).` };
  }
  const d = dist(P.ideology, bill.ideology || { econ: 0, social: 0, sistema: 0 });
  const last = bill.votes?.[bill.votes.length - 1];
  const narrow = last ? (last.tally.favor - last.tally.contra) < 12 : false;
  let p = 0.03 + Math.max(0, d - 7) * 0.028 + (narrow ? 0.07 : 0) + (bill.salience || 0.3) * 0.04 - (P.relation - 50) / 600;
  if (bill.decree) p += 0.06;
  if (bill.confirmed) p = 0; // após confirmação o PR é obrigado a promulgar
  if (rng.chance(clamp(p, 0, 0.6))) return { decision: 'veto', reason: rng.pick(VETO_REASONS) };
  return { decision: 'promulgar', reason: '' };
}

export function tcRuling(G, bill) {
  if (!bill.constitutional) return rng.chance(0.06) ? 'inconstitucional' : 'constitucional';
  const p = bill.constitutional.severity === 'grave' ? 0.93 : 0.5;
  return rng.chance(p) ? 'inconstitucional' : 'constitucional';
}

// Pode o Presidente dissolver a Assembleia? (art. 172.º)
export function canDissolve(G) {
  if (G.regime?.active) return { ok: false, why: 'A ordem constitucional está suspensa.' };
  const last = G.history.elections[G.history.elections.length - 1];
  if (last && monthsBetween(last.date, G.date) < 6) return { ok: false, why: 'A Assembleia não pode ser dissolvida nos seis meses posteriores à sua eleição.' };
  if (monthsBetween(G.date, G.president.termEnds) < 6) return { ok: false, why: 'O Presidente não pode dissolver a Assembleia no último semestre do seu mandato.' };
  return { ok: true };
}

// Reação a uma crise política (governo demitido, orçamento chumbado…)
export function crisisDecision(G, kind) {
  const can = canDissolve(G);
  if (!can.ok) return { dissolve: false, why: can.why };
  const p = kind === 'governo_caiu' ? 0.85 : kind === 'orcamento' ? 0.7 : 0.4;
  return { dissolve: rng.chance(p), why: '' };
}

export function changePresidentRelation(G, v) { G.president.relation = clamp(G.president.relation + v, 0, 100); }
