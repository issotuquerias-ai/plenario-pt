// Constituição da República Portuguesa: consulta, revisão, nova Lei Fundamental (regime)
import { G, addNews } from '../../core/state.js';
import { CRP_ARTICLES, LIMITS_288, AMENDMENT_PRESETS, REGIME_PRINCIPLES } from '../../data/constitution.js';
import { createBill, popularityOf } from '../../sim/legislation.js';
import { predictVote } from '../../sim/parliament.js';
import { isPlayerInGov } from '../../sim/government.js';
import { applyEffects } from '../../sim/effects.js';
import { analyzeText, checkConstitution } from '../../ai/analyzer.js';
import { regimeConstitution } from '../../ai/index.js';
import { uiRoot, $ } from '../dom.js';
import { go, hudHTML, bindScreen, autosave } from '../app.js';
import { pchip, effectTags, openModal, toast, alertBox, confirmBox } from '../components.js';
import { esc } from '../../core/util.js';
import * as cal from '../../core/calendar.js';
import { sfx } from '../../audio/sfx.js';

let sel = 1, q = '', view = 'artigos', picked = new Set();
const regime = () => !!G.regime?.active;

export function enter() { sel = CRP_ARTICLES[0]?.n || 1; render(); }

function articleText(a) { const ch = G.constitution.changed[a.n]; return ch ? ch.text : a.text; }

function predict2_3(spec) {
  return predictVote(G, { ideology: spec.ideology || { econ: 0, social: 0, sistema: 0 }, authorParty: G.playerPartyId, byGov: false, partySupport: spec.partySupport || {}, popularity: spec.popularity ?? popularityOf(spec.effects || {}), constitutional: spec.constitutional || null, type: 'revisao' }, 'final');
}

function render() {
  const parts = [...new Set(CRP_ARTICLES.map(a => a.part))];
  const list = CRP_ARTICLES.filter(a => !q || (a.n + ' ' + a.title + ' ' + a.text).toLowerCase().includes(q.toLowerCase()));
  const a = CRP_ARTICLES.find(x => x.n === sel) || CRP_ARTICLES[0];
  const root = uiRoot();
  root.innerHTML = `<div class="screen bg">${hudHTML([{ k: 'Revisões', v: `${G.constitution.revisions}.ª` }, { k: 'Capital político', v: `${G.politicalCapital} PC`, cls: 'gold' }], '<button class="btn" data-act="back">← Voltar</button>')}
    <div class="tabs" style="background:rgba(5,10,20,.6)">${[['artigos', '📖 Articulado'], ['propostas', '📝 Propostas de revisão'], ['nova', regime() ? '📘 Nova Lei Fundamental' : '📘 Nova Constituição?']].map(([k, l]) => `<button class="tab ${view === k ? 'on' : ''}" data-act="view" data-k="${k}">${l}</button>`).join('')}</div>
    ${view === 'artigos' ? `<main class="layout" style="grid-template-columns:380px 1fr">
      <div class="panel col" style="min-height:0"><div class="panel-b"><input class="input" placeholder="Pesquisar artigos…" value="${esc(q)}" data-act="q" data-on="input"></div><div class="panel-b scroll" style="padding-top:0">${parts.map(pt => { const arts = list.filter(x => x.part === pt); if (!arts.length) return ''; return `<h4 class="tiny muted" style="margin:10px 0 4px">${esc(pt.toUpperCase())}</h4>${arts.map(x => `<div class="card click ${x.n === sel ? 'sel' : ''}" style="padding:7px 10px;margin-bottom:4px" data-act="sel" data-n="${x.n}"><b class="small">Artigo ${x.n}.º</b> <span class="small">${esc(x.title)}</span>${G.constitution.changed[x.n] ? ' <span class="tag gold">alterado</span>' : ''}${x.limit288 ? ' <span class="tag">288.º</span>' : ''}</div>`).join('')}`; }).join('')}</div></div>
      <div class="panel col" style="min-height:0"><div class="panel-b scroll">${a ? `<div class="law-text"><h4>CONSTITUIÇÃO DA REPÚBLICA PORTUGUESA</h4><b>Artigo ${a.n}.º — ${esc(a.title)}</b>\n\n${esc(articleText(a))}${G.constitution.changed[a.n] ? `\n\n(Redação dada pela ${esc(G.constitution.changed[a.n].title)}, ${cal.mediumDate(G.constitution.changed[a.n].date)})` : ''}</div>
        ${a.limit288 ? `<div class="card" style="margin-top:10px"><b class="warn">🔒 Limite material de revisão — art. 288.º, alínea ${a.limit288})</b><div class="small muted">${esc(LIMITS_288.find(l => l.letter === a.limit288)?.text || '')}. As leis de revisão têm de respeitar este princípio.</div></div>` : ''}
        <div class="sep"></div><h3 class="title-serif">Propor alteração</h3><textarea class="input" id="newText" style="min-height:120px">${esc(articleText(a))}</textarea>
        <div class="row" style="margin-top:8px"><button class="btn" data-act="analyzeAm">🔍 Analisar</button><span class="small muted">Revisão constitucional: exige <b>2/3 dos deputados (154)</b>; o Presidente não pode vetar.</span></div><div id="amRes"></div>` : ''}</div></div></main>`
    : view === 'propostas' ? `<div class="scroll" style="flex:1;padding:14px"><div style="max-width:1100px;margin:auto" class="party-grid">${AMENDMENT_PRESETS.map(p => { const pr = predict2_3(p); return `<div class="card col" style="gap:6px"><div class="row between"><b>${esc(p.title)}</b><span class="tag">Art. ${p.article}.º</span></div><div class="small muted">${esc(p.rationale || '')}</div>${p.violates288 ? `<span class="tag bad">Viola o art. 288.º, ${esc(p.violates288)})</span>` : ''}${effectTags(p.effects)}<div class="small">Previsão: <b class="${pr.tally.favor >= 154 ? 'good' : 'bad'}">${pr.tally.favor} votos a favor</b> (precisa de 154)</div><button class="btn sm ${regime() ? 'danger' : 'primary'}" data-act="preset" data-id="${p.id}">${regime() ? 'Impor por decreto' : 'Apresentar (2 PC)'}</button></div>`; }).join('')}</div></div>`
    : novaHTML()}
  </div>`;
  bindScreen(root, handlers);
}

function novaHTML() {
  if (!regime()) return `<div class="scroll" style="flex:1;padding:24px"><div class="panel" style="max-width:820px;margin:auto"><div class="panel-b"><h2 class="title-serif">Uma nova Constituição?</h2>
    <p>A Constituição de 1976 <b>não prevê a sua própria substituição</b>. Só pode ser alterada através de <b>revisão constitucional</b> (arts. 284.º a 289.º): aprovada por <b>dois terços</b> dos deputados, ordinariamente de cinco em cinco anos (a última revisão ordinária foi em 2005, pelo que há poderes de revisão), e sempre dentro dos <b>limites materiais do art. 288.º</b> — independência nacional, forma republicana, separação Igreja–Estado, direitos e liberdades, sufrágio universal, pluralismo, separação de poderes, independência dos tribunais, autonomia regional, entre outros.</p>
    <p>Pode, por isso, propor uma <b>revisão extensa</b>, artigo a artigo, desde que reúna 154 votos. Uma "nova Constituição" que rompa com esses limites só seria possível fora da ordem democrática.</p>
    <h4 class="small muted">LIMITES MATERIAIS (ART. 288.º)</h4><ol type="a" class="small">${LIMITS_288.map(l => `<li>${esc(l.text)}</li>`).join('')}</ol>
    <button class="btn" data-act="view" data-k="propostas">Ver propostas de revisão →</button></div></div></div>`;
  return `<div class="scroll" style="flex:1;padding:24px"><div class="panel" style="max-width:900px;margin:auto"><div class="panel-b"><h2 class="title-serif">Nova Lei Fundamental</h2><p class="small bad">O regime vai substituir a Constituição de 1976. Cada princípio tem consequências internas e internacionais.</p>
    ${REGIME_PRINCIPLES.map(p => `<label class="option check" style="display:flex;align-items:flex-start"><input type="checkbox" value="${p.id}" data-act="pp" data-on="change" ${picked.has(p.id) ? 'checked' : ''}><span class="grow"><b>${esc(p.label)}</b><br><small>${esc(p.article)}</small>${effectTags(p.effects)}</span></label>`).join('')}
    <div class="field" style="margin-top:10px"><label>Artigo adicional (escrito por si)</label><textarea class="input" id="extraArt" placeholder="Opcional"></textarea></div>
    <button class="btn danger lg" data-act="promulgate" ${picked.size ? '' : 'disabled'}>Promulgar a nova Lei Fundamental</button></div></div></div>`;
}

function amendmentSpec(article, newText, title) {
  const an = analyzeText(newText);
  const c = checkConstitution(newText);
  const art = CRP_ARTICLES.find(a => a.n === article);
  const viol = art?.limit288 && c && c.severity === 'grave' ? art.limit288 : (c?.limit288 ? 'd' : null);
  return { title: title || `Lei de revisão constitucional — artigo ${article}.º`, summary: `Altera o artigo ${article}.º (${art?.title || ''}).`, articles: [`Artigo 1.º — O artigo ${article}.º da Constituição passa a ter a seguinte redação: «${newText}»`], area: an.primaryArea, ideology: an.ideology, effects: an.effects, type: 'revisao', amendment: { article, newText }, violates288: viol, constitutional: null };
}

async function submitAmendment(spec, presetEffects) {
  if (spec.violates288 && !regime()) { await alertBox('Limite material da revisão', `Esta alteração viola o art. 288.º, alínea ${esc(spec.violates288)}) da Constituição. Nenhuma maioria — nem de 2/3 — a pode aprovar dentro da ordem democrática. O Tribunal Constitucional e o Presidente da República impedi-la-iam.`, '🔒'); return; }
  if (regime()) {
    G.constitution.changed[spec.amendment.article] = { text: spec.amendment.newText, date: G.date, title: 'Decreto do regime' };
    applyEffects(G, { ...(presetEffects || spec.effects), regime: { international: -4, legitimacy: -1 } }, { longRun: true });
    addNews(`Regime altera por decreto o artigo ${spec.amendment.article}.º da Constituição.`, { tone: 'bad' });
    toast('Alteração imposta por decreto.', ''); autosave(); render(); return;
  }
  if (!G.parliament.seats[G.playerPartyId]) { toast('Precisa de deputados para apresentar um projeto de revisão.', 'bad'); return; }
  if (G.politicalCapital < 2) { toast('Capital político insuficiente (2 PC).', 'bad'); return; }
  G.politicalCapital -= 2;
  const b = createBill(G, { ...spec, byGov: false, authorParty: G.playerPartyId });
  addNews(`${G.parties[G.playerPartyId].short} apresenta projeto de revisão constitucional: ${b.title}.`, { tone: 'neutral' });
  sfx.good(); autosave();
  toast('Projeto de revisão admitido. A Comissão Eventual de Revisão Constitucional inicia os trabalhos.', 'good');
}

const handlers = {
  back: () => go('government'),
  view: el => { view = el.dataset.k; render(); },
  q: el => { q = el.value; const pos = el.selectionStart; render(); const i = $('[data-act="q"]'); if (i) { i.focus(); i.setSelectionRange(pos, pos); } },
  sel: el => { sel = +el.dataset.n; render(); },
  analyzeAm: () => {
    const txt = $('#newText').value.trim(); const a = CRP_ARTICLES.find(x => x.n === sel);
    if (!txt || txt === articleText(a)) { toast('Altere o texto do artigo.', 'bad'); return; }
    const spec = amendmentSpec(sel, txt);
    const pr = predict2_3(spec);
    $('#amRes').innerHTML = `<div class="card" style="margin-top:10px">${spec.violates288 ? `<b class="bad">🔒 Viola os limites materiais (art. 288.º, ${esc(spec.violates288)}))</b>` : '<b class="good">Compatível com os limites materiais</b>'}${effectTags(spec.effects)}<div class="small" style="margin-top:6px">Previsão: <b class="${pr.tally.favor >= 154 ? 'good' : 'bad'}">${pr.tally.favor} votos a favor</b> de 154 necessários.</div><button class="btn ${regime() ? 'danger' : 'primary'}" style="margin-top:8px" data-act="submitAm">${regime() ? 'Impor por decreto' : 'Apresentar projeto de revisão (2 PC)'}</button></div>`;
    handlers._spec = spec;
  },
  submitAm: () => { if (handlers._spec) submitAmendment(handlers._spec); },
  preset: el => { const p = AMENDMENT_PRESETS.find(x => x.id === el.dataset.id); submitAmendment({ title: p.title, summary: p.rationale, articles: [`Artigo 1.º — O artigo ${p.article}.º da Constituição passa a ter a seguinte redação: «${p.newText}»`], area: 'instituicoes', ideology: p.ideology, effects: p.effects, partySupport: p.partySupport, popularity: p.popularity, type: 'revisao', amendment: { article: p.article, newText: p.newText }, violates288: p.violates288 }, p.effects); },
  pp: el => { if (el.checked) picked.add(el.value); else picked.delete(el.value); render(); },
  promulgate: async () => {
    if (!(await confirmBox('Promulgar a nova Lei Fundamental?', 'A Constituição de 1976 deixa de vigorar. Esta decisão será lembrada.', 'Promulgar', 'Cancelar', '📘'))) return;
    const principles = REGIME_PRINCIPLES.filter(p => picked.has(p.id));
    const arts = await regimeConstitution(principles, $('#extraArt')?.value.trim());
    for (const p of principles) applyEffects(G, p.effects || {}, { longRun: true });
    G.constitution.fundamental = { date: G.date, articles: arts };
    addNews('Promulgada a nova "Lei Fundamental". A Constituição de 1976 é revogada pelo regime.', { tone: 'bad' });
    autosave(); sfx.gavel();
    openModal({ title: 'Lei Fundamental', icon: '📘', cls: 'wide', body: `<div class="law-text"><h4>LEI FUNDAMENTAL</h4>${arts.map(esc).join('\n\n')}</div>`, actions: [{ label: 'Fechar', cls: 'primary', onClick: () => go('government') }] });
  },
};
export function leave() { }
export { pchip, isPlayerInGov };
