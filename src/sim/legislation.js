// Processo legislativo: projetos/propostas de lei, decretos-lei, revisão constitucional, orçamento, referendo.
import { GROUPS } from '../data/ministries.js';
import { plenaryVote, predictVote } from './parliament.js';
import { presidentReview, tcRuling, presidentName } from './president.js';
import { applyEffects, govPartyIds } from './effects.js';
import { valenceBoost } from './campaign.js';
import { rng } from '../core/rng.js';
import { clamp, uid } from '../core/util.js';
import { addNews, addLog } from '../core/state.js';

export const STAGE_LABEL = {
  admissao: 'Admitida', generalidade: 'Votação na generalidade', especialidade: 'Especialidade (comissão)', final: 'Votação final global',
  presidente: 'Em Belém — decisão do Presidente', tc: 'Tribunal Constitucional', veto: 'Vetada pelo Presidente', confirmacao: 'Reapreciação após veto',
  referendo: 'Referendo', promulgada: 'Promulgada', rejeitada: 'Rejeitada', inconstitucional: 'Inconstitucional', retirada: 'Retirada',
  cerc: 'Comissão Eventual de Revisão Constitucional', caducada: 'Caducada', vetada_def: 'Vetada (definitivo)', aprovada: 'Aprovada',
};
export const DONE_STAGES = ['promulgada', 'rejeitada', 'inconstitucional', 'retirada', 'caducada', 'vetada_def', 'aprovada'];
export const TYPE_LABEL = { lei: 'Lei', lei_organica: 'Lei orgânica', resolucao: 'Resolução', revisao: 'Revisão constitucional', orcamento: 'Orçamento do Estado', decreto: 'Decreto-lei' };

export function popularityOf(effects = {}) {
  let p = 0;
  for (const g of GROUPS) p += ((effects.groups || {})[g.id] || 0) * (g.weight || 0.01) / 5;
  p += (effects.approval || 0) / 6 - (effects.unrest || 0) / 20;
  return clamp(p, -1.5, 1.5);
}

export function createBill(G, spec) {
  const byGov = !!spec.byGov;
  const isDecree = !!spec.asDecree;
  const bill = {
    id: uid('b'), title: spec.title, summary: spec.summary || '', articles: spec.articles || [], area: spec.area || 'instituicoes',
    type: isDecree ? 'decreto' : (spec.type || 'lei'), ideology: spec.ideology || { econ: 0, social: 0, sistema: 0 }, effects: spec.effects || {},
    annualCost: spec.annualCost || 0, constitutional: spec.constitutional || null, referendum: !!spec.referendum, partySupport: spec.partySupport || {},
    salience: spec.salience ?? 0.4, source: spec.source || 'catalogo', catalogId: spec.catalogId || null, authorParty: spec.authorParty, byGov,
    decree: isDecree, created: G.date, stageDate: G.date, votes: [], concessions: {}, deals: {}, history: [], tags: spec.tags || [],
    amendment: spec.amendment || null,
  };
  bill.popularity = popularityOf(bill.effects);
  if (isDecree) { bill.stage = 'presidente'; bill.history.push({ date: G.date, text: 'Aprovado em Conselho de Ministros e enviado para promulgação.' }); }
  else if (bill.type === 'revisao') { bill.stage = 'cerc'; bill.history.push({ date: G.date, text: 'Projeto de revisão constitucional admitido; constituída a Comissão Eventual.' }); }
  else { bill.stage = 'generalidade'; bill.pendingVote = 'generalidade'; bill.history.push({ date: G.date, text: byGov ? 'Proposta de lei do Governo admitida.' : 'Projeto de lei admitido e agendado.' }); }
  G.bills.push(bill);
  return bill;
}

export function voteItem(bill) {
  return { ideology: bill.ideology, authorParty: bill.authorParty, byGov: bill.byGov, partySupport: bill.partySupport, popularity: bill.popularity, constitutional: bill.constitutional, concessions: bill.concessions, deals: bill.deals, type: bill.type, cost: bill.annualCost };
}

export const pendingVotes = G => G.bills.filter(b => b.pendingVote && !DONE_STAGES.includes(b.stage));
export const activeBills = G => G.bills.filter(b => !DONE_STAGES.includes(b.stage));
export const predictBill = (G, bill, overrides = {}) => predictVote(G, voteItem(bill), bill.pendingVote === 'final' || bill.pendingVote === 'confirmacao' ? 'final' : 'generalidade', overrides);

// Executa a votação pendente de um diploma.
export function resolveVote(G, bill, overrides = {}) {
  const stage = bill.pendingVote;
  const item = voteItem(bill);
  if (stage === 'confirmacao') item.type = bill.type === 'lei_organica' ? 'confirmacao_organica' : 'confirmacao';
  const res = plenaryVote(G, item, stage === 'generalidade' ? 'generalidade' : 'final', overrides);
  res.stageKey = stage;
  bill.votes.push({ votes: res.votes, tally: res.tally, passed: res.passed, stageKey: stage, date: res.date });
  bill.pendingVote = null;
  const label = stage === 'generalidade' ? 'na generalidade' : stage === 'final' ? 'em votação final global' : 'na reapreciação';
  if (res.passed) {
    bill.history.push({ date: G.date, text: `Aprovada ${label} (${res.tally.favor} a favor, ${res.tally.contra} contra, ${res.tally.abstencao} abstenções).` });
    if (stage === 'generalidade') {
      if (bill.type === 'resolucao') { bill.stage = 'aprovada'; enactResolution(G, bill); }
      else { bill.stage = 'especialidade'; bill.stageDate = G.date; }
    } else if (stage === 'final') {
      if (bill.type === 'revisao') { bill.stage = 'promulgada'; enact(G, bill); }
      else if (bill.referendum) { bill.stage = 'referendo'; bill.stageDate = G.date; }
      else { bill.stage = 'presidente'; bill.stageDate = G.date; }
    } else if (stage === 'confirmacao') { bill.confirmed = true; bill.stage = 'presidente'; bill.stageDate = G.date; }
  } else {
    bill.history.push({ date: G.date, text: `Rejeitada ${label} (${res.tally.favor} a favor, ${res.tally.contra} contra, ${res.tally.abstencao} abstenções).` });
    bill.stage = stage === 'confirmacao' ? 'vetada_def' : 'rejeitada';
    G.stats.lawsFailed++;
    if (bill.type === 'orcamento') budgetRejected(G, bill);
  }
  addLog(`${bill.title}: ${res.passed ? 'aprovada' : 'rejeitada'} ${label}.`, res.passed ? 'good' : 'bad');
  return res;
}

function enactResolution(G, bill) {
  G.stats.lawsPassed++;
  applyEffects(G, { approval: (bill.effects.approval || 0) * 0.3, groups: Object.fromEntries(Object.entries(bill.effects.groups || {}).map(([k, v]) => [k, v * 0.3])) });
  addNews(`Parlamento aprova resolução: ${bill.title}.`, { tone: 'neutral' });
}

// Entrada em vigor: aplica efeitos
export function enact(G, bill) {
  G.stats.lawsPassed++;
  const e = bill.effects || {};
  applyEffects(G, { ...e, annualCost: bill.annualCost }, { longRun: true, tone: 'good' });
  // crédito político para o autor
  if (bill.authorParty && G.parties[bill.authorParty]) valenceBoost(G, bill.authorParty, clamp(bill.popularity * 0.05, -0.08, 0.1));
  if (bill.byGov) govPartyIds(G).forEach(pid => valenceBoost(G, pid, clamp(bill.popularity * 0.04, -0.08, 0.08)));
  if (bill.type === 'orcamento' && bill.budgetYear && G.government) { G.government.budgets[bill.budgetYear] = true; if (bill.budgetParams) Object.assign(G.economy.taxes, bill.budgetParams.taxes || {}); if (G.flags.oeDue === bill.budgetYear) G.flags.oeDue = null; }
  G.laws.push({ id: bill.id, title: bill.title, date: G.date, type: bill.type, catalogId: bill.catalogId, authorParty: bill.authorParty, area: bill.area, number: G.laws.length + 1 });
  if (bill.type === 'revisao' && bill.amendment) {
    G.constitution.changed[bill.amendment.article] = { text: bill.amendment.newText, date: G.date, title: bill.title };
    G.constitution.revisions++;
  }
  const kind = bill.type === 'revisao' ? 'Lei Constitucional' : bill.type === 'decreto' ? 'Decreto-Lei' : bill.type === 'orcamento' ? 'Lei do Orçamento do Estado' : 'Lei';
  addNews(`Publicada em Diário da República: ${kind} — ${bill.title}.`, { tone: 'good' });
}

function budgetRejected(G, bill) {
  G.flags.budgetRejected = G.date;
  addNews('Orçamento do Estado chumbado na Assembleia da República. Abre-se uma crise política.', { tone: 'bad' });
  if (G.government) G.government.stability = clamp(G.government.stability - 30, 0, 100);
  void bill;
}

// Avanço mensal dos diplomas que não dependem de votação
export function advanceBills(G) {
  const notes = [];
  for (const b of G.bills) {
    if (DONE_STAGES.includes(b.stage) || b.pendingVote) continue;
    switch (b.stage) {
      case 'especialidade':
        b.pendingVote = 'final'; b.history.push({ date: G.date, text: 'Concluída a especialidade em comissão; agendada a votação final global.' });
        break;
      case 'cerc':
        if (!b.cercMonths) b.cercMonths = 0;
        b.cercMonths++;
        if (b.cercMonths >= 2) { b.pendingVote = 'final'; b.history.push({ date: G.date, text: 'A Comissão Eventual concluiu os trabalhos. Votação em plenário (exige 2/3).' }); }
        break;
      case 'presidente': {
        const r = presidentReview(G, b);
        if (r.decision === 'promulgar') {
          b.stage = 'promulgada'; b.history.push({ date: G.date, text: `Promulgada pelo Presidente da República.` });
          enact(G, b); notes.push({ type: 'promulgada', bill: b });
        } else if (r.decision === 'veto') {
          G.stats.vetoes++; G.president.vetoes++;
          if (b.decree) { b.stage = 'vetada_def'; b.history.push({ date: G.date, text: `Vetado pelo Presidente (veto absoluto sobre decretos do Governo): ${r.reason}` }); }
          else { b.stage = 'veto'; b.history.push({ date: G.date, text: `Veto político do Presidente: ${r.reason}` }); }
          addNews(`${presidentName(G)} veta "${b.title}".`, { tone: 'bad' });
          notes.push({ type: 'veto', bill: b, reason: r.reason });
        } else {
          b.stage = 'tc'; b.stageDate = G.date; G.president.tcRequests++;
          b.history.push({ date: G.date, text: `Enviada para o Tribunal Constitucional: ${r.reason}` });
          addNews(`Presidente envia "${b.title}" para o Tribunal Constitucional.`, { tone: 'neutral' });
          notes.push({ type: 'tc', bill: b });
        }
        break;
      }
      case 'tc': {
        const r = tcRuling(G, b);
        if (r === 'inconstitucional') {
          b.stage = 'inconstitucional'; b.history.push({ date: G.date, text: 'O Tribunal Constitucional pronunciou-se pela inconstitucionalidade. O Presidente veta o diploma.' });
          addNews(`Tribunal Constitucional chumba "${b.title}".`, { tone: 'bad' });
          notes.push({ type: 'inconstitucional', bill: b });
        } else {
          b.stage = 'promulgada'; b.history.push({ date: G.date, text: 'O Tribunal Constitucional não se pronunciou pela inconstitucionalidade. Promulgada.' });
          enact(G, b); notes.push({ type: 'promulgada', bill: b });
        }
        break;
      }
      case 'referendo': {
        const yes = clamp(50 + b.popularity * 14 + rng.gauss(0, 6), 15, 85);
        const turnout = clamp(42 + Math.abs(b.popularity) * 6 + rng.gauss(0, 6), 25, 70);
        b.referendumResult = { yes, turnout, binding: turnout > 50 };
        if (yes > 50 && turnout > 50) { b.stage = 'promulgada'; b.history.push({ date: G.date, text: `Referendo vinculativo: "Sim" com ${yes.toFixed(1)}% (participação ${turnout.toFixed(1)}%).` }); enact(G, b); }
        else if (yes > 50) { b.stage = 'rejeitada'; b.history.push({ date: G.date, text: `Referendo não vinculativo: "Sim" com ${yes.toFixed(1)}% mas participação de apenas ${turnout.toFixed(1)}%.` }); }
        else { b.stage = 'rejeitada'; b.history.push({ date: G.date, text: `Referendo: venceu o "Não" com ${(100 - yes).toFixed(1)}% (participação ${turnout.toFixed(1)}%).` }); }
        addNews(`Referendo sobre "${b.title}": ${yes > 50 ? 'vence o Sim' : 'vence o Não'} (${turnout.toFixed(0)}% de participação).`, { tone: 'neutral' });
        notes.push({ type: 'referendo', bill: b });
        break;
      }
      default: break;
    }
  }
  return notes;
}

// Após um veto: confirmar (116/154 votos), reformular ou desistir
export function handleVeto(G, bill, choice) {
  if (choice === 'confirmar') { bill.pendingVote = 'confirmacao'; bill.stage = 'confirmacao'; bill.history.push({ date: G.date, text: 'A Assembleia vai reapreciar o diploma vetado.' }); }
  else if (choice === 'reformular') { bill.stage = 'especialidade'; bill.history.push({ date: G.date, text: 'Diploma devolvido à comissão para reformulação.' }); bill.ideology = { ...bill.ideology, econ: bill.ideology.econ * 0.8, social: bill.ideology.social * 0.8 }; for (const k in bill.effects.groups || {}) bill.effects.groups[k] *= 0.8; bill.popularity = popularityOf(bill.effects); }
  else { bill.stage = 'retirada'; bill.history.push({ date: G.date, text: 'O proponente desistiu do diploma após o veto.' }); }
}

// Caducidade das iniciativas no fim da legislatura
export function lapseAll(G) { for (const b of G.bills) if (!DONE_STAGES.includes(b.stage)) { b.stage = 'caducada'; b.pendingVote = null; b.history.push({ date: G.date, text: 'Caducou com o fim da legislatura.' }); } }
