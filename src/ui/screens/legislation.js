// Legislar: catálogo, IA, texto próprio, decretos-lei, diplomas em curso.
import { G, addNews } from '../../core/state.js';
import { LAWS, AREA_LABELS } from '../../data/laws.js';
import { createBill, popularityOf, activeBills, STAGE_LABEL, TYPE_LABEL, DONE_STAGES, handleVeto } from '../../sim/legislation.js';
import { predictVote } from '../../sim/parliament.js';
import { isPlayerInGov, isPlayerPM } from '../../sim/government.js';
import { regimeDecree } from '../../sim/regime.js';
import { lawSpec } from '../../sim/turn.js';
import { lawFromRequest, playerLaw, aiLabel } from '../../ai/index.js';
import { decreeText } from '../../ai/textgen.js';
import { spectrumLabel } from '../../sim/ideology.js';
import { uiRoot, $ } from '../dom.js';
import { go, hudHTML, bindScreen, autosave } from '../app.js';
import { logoImg, pchip, bar, effectTags, ideologyBars, openModal, toast, areaLabel } from '../components.js';
import { esc, fmtMEur, fmtNum } from '../../core/util.js';
import * as cal from '../../core/calendar.js';
import { sfx } from '../../audio/sfx.js';

let tab = 'catalogo', area = 'todas', draft = null, busy = false, search = '';
const regime = () => !!G.regime?.active;

export function enter(params = {}) { tab = params.tab || (regime() ? 'ia' : 'catalogo'); draft = null; render(); }

function itemFor(spec, asDecree = false) {
  return { ideology: spec.ideology, authorParty: G.playerPartyId, byGov: isPlayerInGov(G), partySupport: spec.partySupport || {}, popularity: popularityOf(spec.effects || {}), constitutional: spec.constitutional, type: spec.type || 'lei', cost: spec.annualCost, asDecree };
}

function analysisHTML(spec) {
  const pred = G.parliament ? predictVote(G, itemFor(spec), 'generalidade') : null;
  const c = spec.constitutional;
  return `<div class="grid2"><div><h4 class="small muted">POSICIONAMENTO — ${esc(spectrumLabel(spec.ideology))}</h4>${ideologyBars(spec.ideology)}
    <h4 class="small muted">IMPACTO PREVISTO</h4>${effectTags(spec.effects) || '<span class="muted small">Impacto reduzido</span>'}<div class="small" style="margin-top:6px">Custo anual: <b>${spec.annualCost >= 0 ? fmtMEur(spec.annualCost) : 'receita de ' + fmtMEur(-spec.annualCost)}</b> · Área: ${esc(areaLabel(spec.area))}</div>
    ${c ? `<div class="card" style="border-color:var(--red);margin-top:8px"><b class="bad">⚖️ ${c.severity === 'grave' ? 'Inconstitucionalidade grave' : 'Dúvidas de constitucionalidade'}</b><div class="small">${esc(c.issue)}</div><div class="tiny muted">Artigos: ${esc((c.articles || []).join(', '))}${c.limit288 ? ' · Limite material da revisão (art. 288.º)' : ''}</div></div>` : '<div class="small good" style="margin-top:8px">✓ Sem problemas constitucionais detetados</div>'}</div>
    <div>${pred && !regime() ? `<h4 class="small muted">PREVISÃO DE VOTAÇÃO (GENERALIDADE)</h4><div class="small">Exige ${esc(pred.required.label)} · <b class="${pred.passed ? 'good' : 'bad'}">${pred.passed ? 'Seria aprovada' : 'Seria rejeitada'}</b> (${pred.tally.favor}–${pred.tally.contra}–${pred.tally.abstencao})</div>
      <table class="t"><tbody>${Object.keys(pred.votes).sort((a, b) => G.parliament.seats[b] - G.parliament.seats[a]).map(pid => `<tr><td>${pchip(G.parties[pid])}</td><td><span class="tag ${pred.votes[pid] === 'favor' ? 'good' : pred.votes[pid] === 'contra' ? 'bad' : 'warn'}">${{ favor: 'A favor', contra: 'Contra', abstencao: 'Abstenção' }[pred.votes[pid]]}</span></td></tr>`).join('')}</tbody></table>` : regime() ? '<p class="small warn">Regime de exceção: o decreto entra em vigor de imediato, sem votação nem promulgação.</p>' : ''}</div></div>`;
}

function render() {
  const me = G.playerPartyId; const inGov = isPlayerInGov(G);
  const tabs = regime() ? [['ia', '🤖 Pedir à IA'], ['escrever', '✍️ Escrever decreto'], ['catalogo', '📚 Catálogo'], ['decretos', '📜 Decretos publicados']]
    : [['catalogo', '📚 Catálogo de medidas'], ['ia', '🤖 Pedir à IA'], ['escrever', '✍️ Escrever lei'], ['curso', `📂 Em curso (${activeBills(G).length})`], ['leis', '📗 Leis aprovadas']];
  const root = uiRoot();
  root.innerHTML = `<div class="screen bg">${hudHTML([{ k: 'Capital político', v: `${G.politicalCapital} PC`, cls: 'gold' }, { k: 'Iniciativa', v: regime() ? 'Decreto' : inGov ? 'Proposta de lei' : 'Projeto de lei' }], '<button class="btn" data-act="back">← Voltar</button>')}
    <div class="tabs" style="background:rgba(5,10,20,.6)">${tabs.map(([k, l]) => `<button class="tab ${tab === k ? 'on' : ''}" data-act="tab" data-k="${k}">${l}</button>`).join('')}</div>
    <div class="scroll" style="flex:1;padding:14px"><div style="max-width:1200px;margin:auto">${body()}</div></div></div>`;
  bindScreen(root, handlers);
}

function body() {
  const me = G.playerPartyId;
  if (tab === 'catalogo') {
    const inProg = new Set(G.bills.filter(b => !DONE_STAGES.includes(b.stage)).map(b => b.catalogId));
    const enacted = new Set(G.laws.map(l => l.catalogId));
    const obl = G.obligations || [];
    let list = LAWS.filter(l => area === 'todas' || l.area === area);
    if (search) list = list.filter(l => (l.title + ' ' + l.summary).toLowerCase().includes(search.toLowerCase()));
    return `<div class="row wrap" style="margin-bottom:12px"><input class="input" style="max-width:280px" placeholder="Pesquisar…" value="${esc(search)}" data-act="search" data-on="change"><button class="btn sm ${area === 'todas' ? 'gold' : ''}" data-act="area" data-k="todas">Todas</button>${Object.entries(AREA_LABELS).map(([k, v]) => `<button class="btn sm ${area === k ? 'gold' : ''}" data-act="area" data-k="${k}">${esc(v)}</button>`).join('')}</div>
      <div class="party-grid" style="grid-template-columns:repeat(auto-fill,minmax(340px,1fr))">${list.map(l => { const o = obl.find(x => x.lawId === l.id); return `<div class="card col" style="gap:6px"><div class="row between"><b>${esc(l.title)}</b><span class="tag">${esc(areaLabel(l.area))}</span></div><div class="small muted">${esc(l.summary)}</div>
        <div class="row wrap">${l.type === 'lei_organica' ? '<span class="tag warn">Lei orgânica (116)</span>' : ''}${l.referendum ? '<span class="tag warn">Exige referendo</span>' : ''}${l.constitutional ? `<span class="tag bad">⚖️ ${l.constitutional.severity === 'grave' ? 'Inconstitucional' : 'Duvidosa'}</span>` : ''}${l.decree ? '<span class="tag blue">Pode ser decreto-lei</span>' : ''}${o ? `<span class="tag gold">Compromisso com ${esc(G.parties[o.party]?.short)}</span>` : ''}<span class="tag">${esc(spectrumLabel(l.ideology))}</span></div>
        ${effectTags(l.effects)}
        <div class="row" style="margin-top:4px">${enacted.has(l.id) ? '<span class="tag good">Em vigor</span>' : inProg.has(l.id) ? '<span class="tag gold">Em curso</span>' : `<button class="btn sm" data-act="view" data-id="${l.id}">Ver e analisar</button>`}</div></div>`; }).join('')}</div>`;
  }
  if (tab === 'ia') {
    return `<div class="panel"><div class="panel-b"><h2 class="title-serif">${regime() ? 'Decretos por pedido' : 'Pedir à IA uma proposta de lei'}</h2><p class="small muted">Descreva o que pretende em linguagem simples. A ${esc(aiLabel())} redige uma proposta coerente com a orientação do seu partido, com articulado, efeitos estimados e análise constitucional.</p>
      <textarea class="input" id="req" placeholder="Ex.: Quero baixar o preço das casas para os jovens. / Reforçar o SNS no interior. / Acabar com as portagens nas ex-SCUT.">${esc(draft?.request || '')}</textarea>
      <div class="row wrap" style="margin-top:8px">${['Baixar o preço da habitação para os jovens', 'Reforçar o SNS e reduzir as listas de espera', 'Descer o IRS da classe média', 'Aumentar os salários e o salário mínimo', 'Controlar melhor a imigração', 'Combater a corrupção', 'Proteger o ambiente e as florestas'].map(s => `<button class="btn sm ghost" data-act="sugg" data-s="${esc(s)}">${esc(s)}</button>`).join('')}</div>
      <button class="btn gold" style="margin-top:10px" data-act="genAI" ${busy ? 'disabled' : ''}>✨ ${busy ? 'A redigir…' : 'Gerar proposta'}</button></div></div>${draft?.spec ? draftHTML() : ''}`;
  }
  if (tab === 'escrever') {
    return `<div class="panel"><div class="panel-b"><h2 class="title-serif">${regime() ? 'Escrever decreto' : 'Escrever a sua própria lei'}</h2><p class="small muted">Escreva o título e o articulado (um artigo por linha). O analisador semântico deteta a área, a posição ideológica, os efeitos prováveis e eventuais inconstitucionalidades.</p>
      <div class="field"><label>Título</label><input class="input" id="lt" value="${esc(draft?.title || '')}" placeholder="Ex.: Lei da Habitação Jovem"></div>
      <div class="field"><label>Articulado</label><textarea class="input" id="lb" style="min-height:160px" placeholder="Os jovens até aos 35 anos ficam isentos de IMT na compra da primeira casa.&#10;O Estado constrói 20 mil casas públicas para arrendamento acessível.">${esc(draft?.body || '')}</textarea></div>
      <button class="btn primary" data-act="analyze">🔍 Analisar</button></div></div>${draft?.spec ? draftHTML() : ''}`;
  }
  if (tab === 'curso') {
    const list = activeBills(G);
    if (!list.length) return '<p class="muted">Não há diplomas em curso.</p>';
    return list.map(b => `<div class="card" style="margin-bottom:10px"><div class="row">${logoImg(G.parties[b.authorParty], 30)}<div class="grow"><b>${esc(b.title)}</b><div class="tiny muted">${TYPE_LABEL[b.type] || ''} · ${b.byGov ? 'Governo' : 'Projeto de ' + esc(G.parties[b.authorParty]?.short)} · entrada em ${cal.shortDate(b.created)}</div></div><span class="tag gold">${esc(STAGE_LABEL[b.stage] || b.stage)}</span></div>
      <div class="stage-line" style="margin-top:8px">${stageLine(b)}</div><div class="small muted" style="margin-top:6px">${b.history.slice(-3).map(h => `${cal.shortDate(h.date)} — ${esc(h.text)}`).join('<br>')}</div>
      ${b.stage === 'veto' && b.authorParty === me ? `<div class="row" style="margin-top:8px"><button class="btn sm primary" data-act="veto" data-id="${b.id}" data-c="confirmar">Confirmar (116)</button><button class="btn sm" data-act="veto" data-id="${b.id}" data-c="reformular">Reformular</button><button class="btn sm ghost" data-act="veto" data-id="${b.id}" data-c="desistir">Desistir</button></div>` : ''}
      ${b.pendingVote ? `<button class="btn sm" style="margin-top:8px" data-act="toVote" data-id="${b.id}">Ir à votação →</button>` : ''}</div>`).join('');
  }
  if (tab === 'leis') return G.laws.length ? `<table class="t"><thead><tr><th>N.º</th><th>Diploma</th><th>Proponente</th><th>Data</th></tr></thead><tbody>${G.laws.slice().reverse().map(l => `<tr><td>${l.number}</td><td>${esc(l.title)}</td><td>${l.authorParty ? pchip(G.parties[l.authorParty]) : ''}</td><td class="small">${cal.shortDate(l.date)}</td></tr>`).join('')}</tbody></table>` : '<p class="muted">Ainda não foram publicadas leis nesta legislatura.</p>';
  if (tab === 'decretos') return (G.regime?.decrees || []).slice().reverse().map(d => `<div class="law-text" style="margin-bottom:10px"><h4>DECRETO N.º ${d.number}/${String(d.date).slice(0, 4)}</h4><b>${esc(d.title)}</b>\n${d.articles.map(esc).join('\n')}</div>`).join('') || '<p class="muted">Sem decretos.</p>';
  return '';
}

function stageLine(b) {
  const steps = b.decree ? ['presidente', 'promulgada'] : b.type === 'revisao' ? ['cerc', 'final', 'promulgada'] : ['generalidade', 'especialidade', 'final', 'presidente', 'promulgada'];
  const cur = b.pendingVote || b.stage;
  const idx = steps.indexOf(cur === 'tc' || cur === 'veto' || cur === 'confirmacao' ? 'presidente' : cur);
  return steps.map((s, i) => `<span class="${i < idx ? 'done' : i === idx ? 'cur' : ''}">${{ generalidade: 'Generalidade', especialidade: 'Especialidade', final: 'Votação final', presidente: 'Belém', promulgada: 'Diário da República', cerc: 'Comissão eventual' }[s]}</span>`).join('');
}

function draftHTML() {
  const s = draft.spec; const inGov = isPlayerInGov(G);
  return `<div class="grid2" style="margin-top:14px;align-items:start"><div class="law-text"><h4>${regime() ? 'DECRETO' : inGov ? 'PROPOSTA DE LEI' : 'PROJETO DE LEI'}</h4><b>${esc(s.title)}</b>\n\n${esc(s.summary || '')}\n\n${s.articles.map(esc).join('\n')}</div>
    <div class="panel"><div class="panel-b">${analysisHTML(s)}<div class="sep"></div>
    ${regime() ? '<button class="btn danger block" data-act="decree">Decretar (entra em vigor de imediato)</button>' : `<div class="row"><button class="btn primary grow" data-act="submit" ${G.politicalCapital < 1 ? 'disabled' : ''}>Apresentar na Assembleia (1 PC)</button>${inGov && isPlayerPM(G) && !s.constitutional ? '<button class="btn" data-act="submitDecree">Decreto-lei (1 PC)</button>' : ''}</div>
    <p class="tiny muted">O decreto-lei é aprovado em Conselho de Ministros sem passar pelo Parlamento, mas o veto do Presidente é absoluto e só é possível em matérias que não sejam da reserva da Assembleia.</p>`}</div></div></div>`;
}

function submit(asDecree) {
  if (G.politicalCapital < 1) { toast('Capital político insuficiente.', 'bad'); return; }
  const s = draft.spec; const me = G.playerPartyId;
  G.politicalCapital -= 1;
  const b = createBill(G, { ...s, byGov: isPlayerInGov(G), authorParty: me, asDecree, type: s.type || 'lei' });
  if (G.obligations) G.obligations = G.obligations.filter(o => o.lawId !== s.catalogId);
  addNews(`${asDecree ? 'Governo aprova decreto-lei' : isPlayerInGov(G) ? 'Governo entrega proposta de lei' : G.parties[me].short + ' apresenta projeto de lei'}: ${b.title}.`, { tone: 'neutral' });
  autosave(); sfx.good();
  toast(asDecree ? 'Decreto-lei enviado para promulgação.' : 'Diploma admitido. A votação na generalidade foi agendada.', 'good');
  draft = null; tab = 'curso'; render();
}

const handlers = {
  back: () => go('government'),
  tab: el => { tab = el.dataset.k; render(); },
  area: el => { area = el.dataset.k; render(); },
  search: el => { search = el.value; render(); },
  view: el => { const l = LAWS.find(x => x.id === el.dataset.id); draft = { spec: lawSpec(l, { source: 'catalogo' }) }; const m = openModal({ title: esc(l.title), icon: '📚', cls: 'xwide', body: `<div class="law-text"><b>${esc(l.title)}</b>\n\n${esc(l.summary)}\n\n${l.articles.map(esc).join('\n')}</div><div class="sep"></div>${analysisHTML(draft.spec)}`, actions: regime() ? [{ label: 'Fechar' }, { label: 'Decretar', cls: 'danger', onClick: () => doDecree() }] : [{ label: 'Fechar' }, ...(isPlayerPM(G) && l.decree && !l.constitutional ? [{ label: 'Decreto-lei (1 PC)', onClick: () => submit(true) }] : []), { label: 'Apresentar (1 PC)', cls: 'primary', disabled: G.politicalCapital < 1 || !G.parliament.seats[G.playerPartyId], onClick: () => submit(false) }] }); void m; },
  sugg: el => { $('#req').value = el.dataset.s; },
  genAI: async () => { const req = $('#req').value.trim(); if (!req) { toast('Escreva o pedido.', 'bad'); return; } busy = true; draft = { request: req }; render(); const spec = await lawFromRequest(req, G.parties[G.playerPartyId].ideology); busy = false; draft = { request: req, spec }; render(); },
  analyze: () => { const t = $('#lt').value, b = $('#lb').value; if (!b.trim()) { toast('Escreva o articulado.', 'bad'); return; } draft = { title: t, body: b, spec: playerLaw(t, b) }; render(); },
  submit: () => submit(false),
  submitDecree: () => submit(true),
  decree: () => doDecree(),
  veto: el => { const b = G.bills.find(x => x.id === el.dataset.id); handleVeto(G, b, el.dataset.c); render(); },
  toVote: el => go('parliament', { tab: 'agenda', billId: el.dataset.id }),
};

function doDecree() {
  const s = draft.spec;
  const d = regimeDecree(G, { title: s.title, articles: s.articles, effects: { ...s.effects, regime: { legitimacy: (s.effects?.approval || 0) * 1.5, international: s.constitutional ? -6 : -1, resistance: s.constitutional ? 4 : 0 } }, area: s.area });
  autosave(); sfx.gavel();
  openModal({ title: 'Decreto publicado', icon: '📜', cls: 'wide', body: `<div class="law-text">${esc(decreeText(d.title, d.articles, String(G.date).slice(0, 4)))}</div>`, actions: [{ label: 'Fechar', cls: 'primary' }] });
  draft = null; tab = 'decretos'; render();
}

export function leave() { }
export { bar, fmtNum };
