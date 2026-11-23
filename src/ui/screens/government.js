// Painel da legislatura: Governo, oposição ou regime
import { G, addNews, SETTINGS } from '../../core/state.js';
import { llmEvent } from '../../ai/index.js';
import { GROUPS, MINISTRIES } from '../../data/ministries.js';
import { DISTRICTS, MAJORITY } from '../../data/districts.js';
import { advanceMonth, playerCensure, confidenceMotion } from '../../sim/turn.js';
import { isPlayerInGov, isPlayerPM, reshuffle } from '../../sim/government.js';
import { createBill, handleVeto, activeBills } from '../../sim/legislation.js';
import { scheduleElection, governmentFallen, computeHearings } from '../../sim/formation.js';
import { canDissolve, presidentName } from '../../sim/president.js';
import { canStartRegime, startRegime, restoreDemocracy } from '../../sim/regime.js';
import { applyEffects } from '../../sim/effects.js';
import { localBoost, valenceBoost } from '../../sim/campaign.js';
import { nationalShares } from '../../sim/electorate.js';
import { projectSeats } from '../../sim/election.js';
import { pollAverage } from '../../sim/polls.js';
import { uiRoot } from '../dom.js';
import { go, hudHTML, newsTicker, bindScreen, autosave } from '../app.js';
import { logoImg, portrait, pchip, bar, lineChart, hemicycleSVG, seatsLegend, openModal, toast, alertBox, confirmBox, groupName } from '../components.js';
import { showEvent } from '../eventsui.js';
import * as cal from '../../core/calendar.js';
import { esc, fmtPct, fmtNum, fmtSigned, clamp, fmtMEur } from '../../core/util.js';
import { rng } from '../../core/rng.js';
import { sfx } from '../../audio/sfx.js';

let tab = 'news';
const modeOf = () => (G.regime?.active ? 'regime' : isPlayerInGov(G) ? 'gov' : 'opp');

export function enter(params = {}) {
  render();
  if (params.welcome) welcome();
  handleVetoesAndMotions();
}
export function refresh() { render(); }

function welcome() {
  const m = modeOf(); const p = G.parties[G.playerPartyId];
  const t = m === 'gov' ? `<p>Parabéns, Primeiro-Ministro. Tem ${G.parliament.seats[p.id]} deputados${G.government.coalition.length > 1 ? ' e uma coligação' : ''}${(G.government.support || []).length ? ' com acordos parlamentares' : ''}. A legislatura termina em ${cal.monthYear(G.nextElection)}.</p><ul class="small"><li>Avance <b>mês a mês</b>; resolva os acontecimentos.</li><li>Use o <b>capital político</b> para legislar, negociar e comunicar.</li><li>Em outubro entregue o <b>Orçamento do Estado</b>.</li><li>Cuidado com moções de censura e vetos do Presidente.</li></ul>` : `<p>O seu partido está na <b>oposição</b>. Fiscalize o Governo, apresente projetos de lei, negoceie o Orçamento e prepare-se para as próximas eleições (${cal.monthYear(G.nextElection)}) — ou para derrubar o Governo antes.</p>`;
  openModal({ title: m === 'gov' ? 'Em funções' : 'Na oposição', icon: m === 'gov' ? '🏛️' : '⚔️', body: t, actions: [{ label: 'Começar', cls: 'primary' }] });
}

function kpi(label, val, sub = '', cls = '') { return `<div class="kpi"><small>${label}</small><b class="${cls}">${val}</b>${sub ? `<span class="d muted">${sub}</span>` : ''}</div>`; }

function render() {
  const m = modeOf(); const me = G.playerPartyId; const p = G.parties[me]; const gov = G.government; const E = G.economy;
  const avg = pollAverage(G, 3); const proj = projectSeats(G);
  const chips = [
    ...(m !== 'opp' ? [{ k: 'Aprovação', v: fmtPct(gov.approval, 0), cls: gov.approval < 35 ? 'bad' : gov.approval > 50 ? 'good' : '' }, { k: 'Estabilidade', v: Math.round(gov.stability) }] : [{ k: 'Aprovação do Gov.', v: fmtPct(gov?.approval || 0, 0) }]),
    { k: 'Capital político', v: `${G.politicalCapital} PC`, cls: 'gold' },
    { k: 'Sondagens', v: fmtPct(avg[me] || 0) }, { k: 'Projeção', v: `${proj.seats[me] || 0} dep.` },
    { k: 'Próximas eleições', v: G.regime?.active ? 'Suspensas' : G.nextElection ? cal.monthYear(G.nextElection) : '—', cls: G.regime?.active ? 'bad' : '' },
  ];
  const root = uiRoot();
  root.innerHTML = `<div class="screen bg">${hudHTML(chips, `<button class="btn primary" data-act="next">Avançar um mês ⏭</button>`)}
  <main class="layout">
    <div class="colp">
      <div class="panel"><div class="panel-h"><h3>${m === 'regime' ? 'Estado do regime' : m === 'gov' ? `${gov.number}.º Governo Constitucional` : 'Governo em funções'}</h3>${gov ? logoImg(G.parties[gov.pmPartyId], 26) : ''}</div><div class="panel-b">
        ${m === 'regime' ? regimePanel() : gov ? `<div class="row">${portrait(G.people[gov.pm], 54, G.parties[gov.pmPartyId].color)}<div class="grow"><b>${esc(G.people[gov.pm]?.name)}</b><div class="small muted">Primeiro-Ministro · ${gov.coalition.map(x => G.parties[x].short).join(' + ')}${(gov.support || []).length ? ' (+ ' + gov.support.map(x => G.parties[x].short).join(', ') + ')' : ''}</div><div class="small">${gov.coalition.concat(gov.support || []).reduce((s, x) => s + (G.parliament.seats[x] || 0), 0)} deputados de apoio ${gov.coalition.concat(gov.support || []).reduce((s, x) => s + (G.parliament.seats[x] || 0), 0) >= MAJORITY ? '<span class="tag good">maioria</span>' : '<span class="tag warn">minoria</span>'}</div></div></div>
        <div class="sep"></div><div class="row between small"><span>Aprovação do Governo</span><b>${fmtPct(gov.approval, 0)}</b></div>${bar(gov.approval, 100, gov.approval < 35 ? 'var(--bad)' : 'var(--good)')}
        <div class="row between small" style="margin-top:6px"><span>Relação com ${esc(presidentName(G))}</span><b>${Math.round(G.president.relation)}</b></div>${bar(G.president.relation, 100, 'var(--blue)')}` : '<p class="muted">Governo de gestão.</p>'}
      </div></div>
      <div class="panel col grow" style="min-height:0"><div class="panel-h"><h3>Economia e país</h3><span class="small muted">Rating ${E.rating}</span></div><div class="panel-b scroll"><div class="grid3">
        ${kpi('PIB', fmtSigned(E.gdpGrowth, 1, '%'), 'crescimento anual', E.gdpGrowth < 0 ? 'bad' : 'good')}${kpi('Desemprego', fmtPct(E.unemployment), '', E.unemployment > 8 ? 'bad' : '')}${kpi('Inflação', fmtPct(E.inflation), '', E.inflation > 3.5 ? 'bad' : '')}
        ${kpi('Saldo orçamental', fmtSigned(E.balance, 1, '% PIB'), '', E.balance < -3 ? 'bad' : E.balance >= 0 ? 'good' : '')}${kpi('Dívida pública', fmtPct(E.debt, 1), 'do PIB', E.debt > 100 ? 'bad' : '')}${kpi('Juros a 10 anos', fmtPct(E.yield10, 2))}
        ${kpi('Preço das casas', fmtSigned(E.housingGrowth, 1, '%'), 'variação anual', E.housingGrowth > 8 ? 'bad' : '')}${kpi('SNS', Math.round(100 - E.waiting), 'índice de acesso', E.waiting > 60 ? 'bad' : '')}${kpi('Tensão social', Math.round(G.unrest), '', G.unrest > 55 ? 'bad' : '')}
      </div><div class="sep"></div><h4 class="small muted">EVOLUÇÃO (PIB · DESEMPREGO · INFLAÇÃO)</h4>${lineChart([{ color: '#22c55e', points: E.history.slice(-24).map(h => Math.max(0, h.gdp + 3)) }, { color: '#ef4444', points: E.history.slice(-24).map(h => h.unemp) }, { color: '#f59e0b', points: E.history.slice(-24).map(h => h.infl) }], { height: 120 })}
      <div class="tiny muted">Verde: PIB (+3 para escala) · Vermelho: desemprego · Laranja: inflação</div></div></div>
    </div>
    <div class="colp">
      ${G.events.pending.length ? `<div class="panel" style="border-color:var(--warn)"><div class="panel-b row"><span style="font-size:28px">📰</span><div class="grow"><b>${G.events.pending.length} acontecimento(s) por resolver</b><div class="small muted">${esc(G.events.pending[0].title)}</div></div><button class="btn gold pulse" data-act="events">Resolver</button></div></div>` : ''}
      ${G.pendingMotion ? `<div class="panel" style="border-color:var(--red)"><div class="panel-b row"><span style="font-size:28px">⚠️</span><div class="grow"><b>Moção de censura pendente</b><div class="small muted">Apresentada pelo ${esc(G.parties[G.pendingMotion.author].short)}</div></div><button class="btn danger" data-act="parl">Ir ao plenário</button></div></div>` : ''}
      ${G.flags.oeDue && isPlayerPM(G) && !G.bills.some(b => b.type === 'orcamento' && b.budgetYear === G.flags.oeDue) ? `<div class="panel" style="border-color:var(--gold)"><div class="panel-b row"><span style="font-size:28px">💶</span><div class="grow"><b>Orçamento do Estado para ${G.flags.oeDue}</b><div class="small muted">Deve ser entregue na Assembleia até ao fim de outubro.</div></div><button class="btn gold pulse" data-act="budget">Preparar OE</button></div></div>` : ''}
      <div class="panel col grow" style="min-height:0"><div class="panel-h"><h3>${m === 'regime' ? 'Poderes de exceção' : m === 'gov' ? 'Ação governativa' : 'Ação da oposição'}</h3><span class="small gold">${G.politicalCapital} PC disponíveis</span></div>
        <div class="panel-b scroll"><div class="actions-grid">${actionsFor(m).map(a => `<div class="action ${a.off ? 'off' : ''}" data-act="${a.act}" title="${esc(a.desc || '')}"><span class="ic">${a.icon}</span><b>${a.label}</b><span>${a.sub || ''}</span></div>`).join('')}</div></div></div>
    </div>
    <div class="colp"><div class="panel col grow" style="min-height:0">
      <div class="tabs">${[['news', '📰 Notícias'], ['groups', '👥 Grupos sociais'], ['polls', '📊 Sondagens'], ['bills', '📜 Diplomas'], ['gov', '🏛️ Governo']].map(([k, l]) => `<button class="tab ${tab === k ? 'on' : ''}" data-act="tab" data-k="${k}">${l}</button>`).join('')}</div>
      <div class="panel-b scroll grow">${tabHTML()}</div></div></div>
  </main>${newsTicker()}</div>`;
  bindScreen(root, handlers);
}

function regimePanel() {
  const R = G.regime;
  const row = (l, v, good, tip) => `<div class="regime-meter" title="${esc(tip)}"><div class="row between"><span>${l}</span><b>${Math.round(v)}</b></div>${bar(v, 100, good ? (v > 50 ? 'var(--good)' : 'var(--bad)') : (v > 50 ? 'var(--bad)' : 'var(--good)'))}</div>`;
  return `<div class="small muted" style="margin-bottom:8px">Há ${R.months} meses no poder por via de exceção.</div>${row('Legitimidade popular', R.legitimacy, true, 'Apoio da população ao regime')}${row('Lealdade das Forças Armadas', R.military, true, 'Abaixo de 18: golpe militar')}${row('Relações internacionais', R.international, true, 'UE, NATO, EUA')}${row('Repressão', R.repression, false, 'Contém a oposição, mas gera resistência e isolamento')}${row('Resistência', R.resistance, false, 'Acima de ~70 com militares hesitantes: revolução')}${row('Liberdade de imprensa', R.press, true, '')}`;
}

function actionsFor(m) {
  const pc = G.politicalCapital;
  if (m === 'regime') return [
    { act: 'legislate', icon: '📜', label: 'Decretar', sub: 'Leis por decreto' },
    { act: 'constitution', icon: '📘', label: 'Lei Fundamental', sub: 'Nova ordem constitucional' },
    { act: 'propaganda', icon: '📢', label: 'Propaganda', sub: '1 PC', off: pc < 1 },
    { act: 'repress', icon: '🚔', label: 'Reprimir protestos', sub: '1 PC', off: pc < 1 },
    { act: 'concede', icon: '🕊️', label: 'Concessões', sub: '1 PC', off: pc < 1 },
    { act: 'military', icon: '🎖️', label: 'Benesses militares', sub: '1 PC · 300 M€', off: pc < 1 },
    { act: 'parl', icon: '🏛️', label: 'Assembleia', sub: 'Câmara sem poderes' },
    { act: 'restore', icon: '🗳️', label: 'Restaurar a democracia', sub: 'Eleições livres' },
  ];
  if (m === 'gov') return [
    { act: 'legislate', icon: '📜', label: 'Legislar', sub: 'Propostas, decretos, IA' },
    { act: 'parl', icon: '🏛️', label: 'Assembleia', sub: 'Votações e comissões' },
    { act: 'budget', icon: '💶', label: 'Orçamento do Estado', sub: G.flags.oeDue ? 'Por entregar!' : 'Em outubro', off: !G.flags.oeDue || !isPlayerPM(G) },
    { act: 'constitution', icon: '⚖️', label: 'Constituição', sub: 'Revisão (2/3)' },
    { act: 'reshuffle', icon: '🔄', label: 'Remodelação', sub: '1 PC', off: pc < 1 || !isPlayerPM(G) },
    { act: 'address', icon: '📺', label: 'Comunicação ao país', sub: '1 PC', off: pc < 1 },
    { act: 'meet', icon: '🤝', label: 'Reunir com partidos', sub: '1 PC', off: pc < 1 },
    { act: 'europe', icon: '🇪🇺', label: 'Cimeira europeia', sub: '1 PC', off: pc < 1 },
    { act: 'confidence', icon: '✋', label: 'Moção de confiança', sub: 'Arriscado', off: !isPlayerPM(G) },
    { act: 'resign', icon: '🚪', label: 'Demissão / eleições', sub: 'Pedir dissolução', off: !isPlayerPM(G) },
    ...(canStartRegime(G).ok ? [{ act: 'rupture', icon: '⚠️', label: 'Rutura institucional', sub: 'Maioria absoluta' }] : []),
  ];
  const seats = G.parliament.seats[G.playerPartyId] || 0;
  return [
    { act: 'legislate', icon: '📜', label: 'Projetos de lei', sub: seats ? 'Apresentar iniciativas' : 'Sem deputados', off: !seats },
    { act: 'parl', icon: '🏛️', label: 'Assembleia', sub: 'Votações' },
    { act: 'censure', icon: '⚔️', label: 'Moção de censura', sub: '2 PC', off: pc < 2 || !seats || !G.government || G.government.caretaker },
    { act: 'inquiry', icon: '🔍', label: 'Comissão de inquérito', sub: '2 PC', off: pc < 2 || !seats },
    { act: 'question', icon: '🎙️', label: 'Debate com o PM', sub: '1 PC', off: pc < 1 || !seats },
    { act: 'field', icon: '🚶', label: 'Ação no terreno', sub: '1 PC', off: pc < 1 },
    { act: 'meet', icon: '🤝', label: 'Reunir com partidos', sub: '1 PC', off: pc < 1 },
    { act: 'constitution', icon: '⚖️', label: 'Constituição', sub: 'Consultar / propor' },
  ];
}

function tabHTML() {
  const me = G.playerPartyId;
  if (tab === 'news') return G.news.slice(0, 40).map(n => `<div class="news-item ${n.tone}"><div class="d">${cal.shortDate(n.date)}</div><b>${esc(n.headline)}</b></div>`).join('');
  if (tab === 'groups') return GROUPS.map(g => { const s = G.groups[g.id]?.sat ?? 50; return `<div class="meter-row"><span style="width:24px">${g.icon}</span><span style="width:170px" class="small">${esc(g.name)}</span>${bar(s, 100, s < 35 ? 'var(--bad)' : s > 55 ? 'var(--good)' : 'var(--warn)')}<b style="width:30px" class="right small">${Math.round(s)}</b></div>`; }).join('') + '<p class="tiny muted">Satisfação de cada grupo (0–100). Influencia a aprovação do Governo e o voto.</p>';
  if (tab === 'polls') {
    const S = nationalShares(G).shares; const top = Object.keys(S).filter(x => x !== 'out').sort((a, b) => S[b] - S[a]).slice(0, 7); if (!top.includes(me)) top.push(me);
    const recent = G.polls.slice(-18); const proj = projectSeats(G);
    return `${lineChart(top.map(x => ({ color: G.parties[x].color, bold: x === me, points: recent.map(p => p.results[x] || 0) })))}<div class="legend">${top.map(x => pchip(G.parties[x])).join('')}</div><div class="sep"></div><h4 class="small muted">SE AS ELEIÇÕES FOSSEM HOJE</h4>${hemicycleSVG(G, proj.seats, { width: 300 })}${seatsLegend(G, proj.seats)}`;
  }
  if (tab === 'bills') { const list = activeBills(G); return list.length ? list.map(b => `<div class="card" style="margin-bottom:6px"><div class="row between"><b class="small">${esc(b.title)}</b>${logoImg(G.parties[b.authorParty], 20)}</div><div class="tiny muted">${esc(b.history[b.history.length - 1]?.text || '')}</div></div>`).join('') : '<p class="muted small">Sem diplomas em curso.</p>'; }
  if (tab === 'gov') {
    const gov = G.government; if (!gov) return '';
    return MINISTRIES.map(mm => { const x = G.people[gov.ministers[mm.id]]; return `<div class="row small" style="margin-bottom:6px">${portrait(x, 26, G.parties[x?.partyId]?.color || '#475569')}<div class="grow"><b>${esc(x?.name || '—')}</b><div class="tiny muted">${esc(mm.name)}${x?.independent ? ' · independente' : x?.partyId ? ' · ' + esc(G.parties[x.partyId]?.short) : ''}</div></div></div>`; }).join('');
  }
  return '';
}

// ---------- Mês seguinte ----------
async function nextMonth() {
  if (G.events.pending.length) { toast('Resolva primeiro os acontecimentos pendentes.', 'bad'); await resolveEvents(); return; }
  if (G.pendingMotion && G.parliament.seats[G.playerPartyId]) { toast('Há uma moção de censura por votar no plenário.', 'bad'); go('parliament', { tab: 'agenda' }); return; }
  const prevApproval = G.government?.approval || 0;
  const R = advanceMonth(G);
  autosave();
  sfx.sting();
  if (R.end) { go('endgame'); return; }
  if (SETTINGS.ai?.enabled && modeOf() === 'gov' && rng.chance(0.5)) {
    toast('🤖 A IA local está a gerar um acontecimento…', '');
    const E = G.economy;
    const ctx = `Governo de ${G.parties[G.government.pmPartyId].name}, aprovação ${Math.round(G.government.approval)}%, desemprego ${E.unemployment.toFixed(1)}%, inflação ${E.inflation.toFixed(1)}%, preço das casas +${E.housingGrowth.toFixed(1)}%, tensão social ${Math.round(G.unrest)}/100`;
    const ev = await llmEvent(G, ctx); if (ev) G.events.pending.push(ev);
  }
  render();
  await monthReport(R, prevApproval);
  await resolveEvents();
  if (R.crisis) { await handleCrisis(R.crisis); return; }
  handleVetoesAndMotions();
}

function monthReport(R, prevApproval) {
  const items = [];
  for (const a of R.autoVotes) items.push(`🗳️ <b>${esc(a.bill.title)}</b>: ${a.res.passed ? '<span class="good">aprovada</span>' : '<span class="bad">rejeitada</span>'} (${a.res.tally.favor}–${a.res.tally.contra}–${a.res.tally.abstencao})`);
  for (const n of R.notes) {
    if (n.type === 'promulgada') items.push(`✅ Promulgada: <b>${esc(n.bill.title)}</b>`);
    if (n.type === 'veto') items.push(`⛔ Vetada pelo Presidente: <b>${esc(n.bill.title)}</b> — ${esc(n.reason)}`);
    if (n.type === 'tc') items.push(`⚖️ Enviada ao Tribunal Constitucional: <b>${esc(n.bill.title)}</b>`);
    if (n.type === 'inconstitucional') items.push(`❌ Inconstitucional: <b>${esc(n.bill.title)}</b>`);
    if (n.type === 'gov_bill') items.push(`📜 O Governo apresentou: <b>${esc(n.bill.title)}</b> (votação agendada)`);
    if (n.type === 'opp_bill') items.push(`📄 ${esc(G.parties[n.bill.authorParty].short)} apresentou: <b>${esc(n.bill.title)}</b>`);
    if (n.type === 'oe_due') items.push(`💶 É altura de preparar o <b>Orçamento do Estado para ${n.year}</b>.`);
    if (n.type === 'oe_ai') items.push(`💶 O Governo entregou o <b>Orçamento do Estado</b>. Votação na generalidade agendada.`);
    if (n.type === 'estado_nacao') items.push('🏛️ Realizou-se o debate do <b>Estado da Nação</b>.');
    if (n.type === 'referendo') items.push(`🗳️ Referendo: <b>${esc(n.bill.title)}</b>`);
    if (n.type === 'gov_event') items.push(`📰 ${esc(n.text)}`);
  }
  const gov = G.government;
  return new Promise(res => openModal({
    title: `Balanço de ${cal.monthYear(G.date)}`, icon: '🗓️', cls: 'wide', onClose: res,
    body: `<div class="grid4">${gov ? kpi('Aprovação do Governo', fmtPct(gov.approval, 0), fmtSigned(gov.approval - prevApproval, 1, ' p.p.')) : ''}${kpi('PIB', fmtSigned(G.economy.gdpGrowth, 1, '%'))}${kpi('Desemprego', fmtPct(G.economy.unemployment))}${kpi('Capital político', G.politicalCapital + ' PC')}</div>
      <div class="sep"></div>${items.length ? items.map(x => `<div class="news-item">${x}</div>`).join('') : '<p class="muted">Um mês relativamente calmo na política nacional.</p>'}
      ${G.economy.ratingChange ? `<p class="${G.economy.ratingChange < 0 ? 'good' : 'bad'}">Agência de rating ${G.economy.ratingChange < 0 ? 'melhora' : 'corta'} a notação da República para ${G.economy.rating}.</p>` : ''}`,
    actions: [{ label: 'Continuar', cls: 'primary' }],
  }));
}

async function resolveEvents() { while (G.events.pending.length) { await showEvent(G, G.events.pending[0]); render(); } autosave(); }

async function handleCrisis(c) {
  G.pendingCrisis = null;
  if (c.kind === 'fim_legislatura') { await alertBox('Fim da legislatura', 'A legislatura chegou ao fim. O Presidente da República marca eleições legislativas.', '🗳️'); scheduleElection(G, { days: 50 }); autosave(); go('campaign', { intro: true }); return; }
  if (c.dissolve) { await alertBox('Dissolução da Assembleia', `${esc(presidentName(G))} dissolve a Assembleia da República e convoca eleições antecipadas.`, '⚖️'); scheduleElection(G); autosave(); go('campaign', { intro: true }); return; }
  await alertBox('Novo Governo', `${esc(presidentName(G))} decide não dissolver o Parlamento ${c.why ? '(' + esc(c.why) + ')' : ''} e vai ouvir os partidos para uma nova solução governativa.`, '🏛️');
  governmentFallen(G);
  G.phase = 'formacao';
  G.formation = { step: 'audiencias', hearings: null, designated: null, attempts: 0, agreements: {}, tried: G.formation?.tried || [G.government.pmPartyId], offers: {} };
  G.formation.hearings = computeHearings(G);
  autosave(); go('formation');
}

async function handleVetoesAndMotions() {
  const me = G.playerPartyId;
  for (const b of G.bills.filter(x => x.stage === 'veto' && x.authorParty === me && !x.vetoHandled)) {
    b.vetoHandled = true;
    const v = await new Promise(res => openModal({ title: `Veto: ${esc(b.title)}`, icon: '⛔', closable: false, body: `<p>${esc(b.history[b.history.length - 1]?.text || '')}</p><p class="small muted">A Assembleia pode confirmar o diploma por maioria absoluta (116), obrigando o Presidente a promulgar; ou reformulá-lo.</p>`, actions: [{ label: 'Desistir', value: 'desistir' }, { label: 'Reformular', value: 'reformular' }, { label: 'Confirmar (116 votos)', cls: 'primary', value: 'confirmar' }], onClose: res }));
    handleVeto(G, b, v || 'desistir');
  }
  if (G.pendingMotion && G.parliament.seats[me] && !G.flags.motionNotified) { G.flags.motionNotified = true; toast('Foi apresentada uma moção de censura. Vá ao plenário votar.', 'bad'); }
  render();
}

// ---------- Orçamento ----------
function budgetDialog() {
  const year = G.flags.oeDue; const E = G.economy;
  const areas = [['saude', 'Saúde (SNS)', 15800], ['educacao', 'Educação', 8900], ['social', 'Pensões e apoios sociais', 32500], ['habitacao', 'Habitação', 1300], ['defesa', 'Defesa', 3600], ['seguranca', 'Segurança interna', 2900], ['infraestruturas', 'Infraestruturas e transportes', 3200], ['cultura', 'Cultura', 700]];
  const st = { irs: 0, irc: E.taxes.irc, iva: E.taxes.iva, sp: Object.fromEntries(areas.map(a => [a[0], 0])) };
  const calc = () => {
    let cost = 0; for (const [k, , base] of areas) cost += base * st.sp[k] / 100;
    cost += -st.irs * 1800 + (E.taxes.irc - st.irc) * 420 + (E.taxes.iva - st.iva) * 1250;
    const groups = { saude: st.sp.saude / 2, pensionistas: st.sp.social / 2 + st.sp.saude / 5, professores: st.sp.educacao / 2, jovens: st.sp.habitacao / 4 + st.sp.educacao / 5, seguranca: st.sp.seguranca / 2 + st.sp.defesa / 4, classe_media: -st.irs * 3 + (E.taxes.iva - st.iva) * 2, empresarios: (E.taxes.irc - st.irc) * 2.5, trabalhadores: -st.irs * 1.5 + (E.taxes.iva - st.iva), interior: st.sp.infraestruturas / 4 };
    for (const k in groups) groups[k] = clamp(Math.round(groups[k]), -12, 12);
    const econ = Object.values(st.sp).reduce((s, x) => s + x, 0) / 8;
    const ideology = { econ: clamp(-econ / 2.5 + (E.taxes.irc - st.irc) * 0.8 - st.irs * 0.8, -8, 8), social: clamp(st.sp.defesa / 10 + st.sp.seguranca / 10, -5, 5), sistema: -4 };
    const newBalance = E.balance - cost / (E.gdp * 1000) * 100;
    return { cost, groups, ideology, newBalance };
  };
  const body = () => { const r = calc(); return `<div class="grid2"><div><h4 class="small muted">IMPOSTOS</h4>
      <div class="field"><label>IRS (variação média): ${fmtSigned(st.irs, 1, ' p.p.')}</label><input type="range" min="-2" max="2" step="0.5" value="${st.irs}" data-k="irs"></div>
      <div class="field"><label>IRC: ${st.irc}%</label><input type="range" min="14" max="25" step="1" value="${st.irc}" data-k="irc"></div>
      <div class="field"><label>IVA (taxa normal): ${st.iva}%</label><input type="range" min="19" max="25" step="1" value="${st.iva}" data-k="iva"></div></div>
      <div><h4 class="small muted">DESPESA POR ÁREA</h4>${areas.map(([k, l, base]) => `<div class="field" style="margin-bottom:6px"><label style="text-transform:none;letter-spacing:0">${l} (${fmtMEur(base)}): <span class="gold">${fmtSigned(st.sp[k], 0, '%')}</span></label><input type="range" min="-10" max="20" step="1" value="${st.sp[k]}" data-k="sp.${k}"></div>`).join('')}</div></div>
      <div class="sep"></div><div class="grid3">${kpi('Impacto anual', fmtMEur(-r.cost), r.cost > 0 ? 'mais despesa / menos receita' : 'poupança')}${kpi('Saldo previsto', fmtSigned(r.newBalance, 1, '% PIB'), '', r.newBalance < -3 ? 'bad' : 'good')}${kpi('Regra europeia', r.newBalance < -3 ? 'Défice excessivo' : 'Cumpre', '', r.newBalance < -3 ? 'bad' : 'good')}</div>
      <div class="effects">${Object.entries(r.groups).filter(([, v]) => v).map(([g, v]) => `<span class="tag ${v > 0 ? 'good' : 'bad'}">${esc(groupName(g))} ${v > 0 ? '▲' : '▼'}</span>`).join('')}</div>`; };
  const m = openModal({ title: `Orçamento do Estado para ${year}`, icon: '💶', cls: 'wide', body: body(), actions: [{ label: 'Cancelar' }, { label: 'Entregar na Assembleia', cls: 'gold', onClick: () => {
    const r = calc();
    const b = createBill(G, { title: `Orçamento do Estado para ${year}`, type: 'orcamento', area: 'impostos', ideology: r.ideology, effects: { groups: r.groups, approval: clamp(Math.round(Object.values(r.groups).reduce((s, v) => s + v, 0) / 10), -3, 4), eu: r.newBalance < -3 ? -10 : 2 }, annualCost: Math.round(r.cost), byGov: true, authorParty: G.playerPartyId, salience: 0.95, source: 'governo' });
    b.budgetYear = year; b.budgetParams = { taxes: { irsAdj: (E.taxes.irsAdj || 0) + st.irs, irc: st.irc, iva: st.iva } };
    addNews(`Ministro das Finanças entrega a proposta de Orçamento do Estado para ${year} na Assembleia da República.`, { tone: 'neutral' });
    toast('Orçamento entregue. A votação na generalidade está agendada.', 'good'); render();
  } }] });
  m.el.addEventListener('input', e => { const k = e.target.dataset.k; if (!k) return; const v = +e.target.value; if (k.startsWith('sp.')) st.sp[k.slice(3)] = v; else st[k] = v; const sc = m.body.scrollTop; m.body.innerHTML = body(); m.body.scrollTop = sc; });
}

function spendPC(n) { if (G.politicalCapital < n) { toast('Capital político insuficiente.', 'bad'); return false; } G.politicalCapital -= n; return true; }

function choosePartyDialog(title, cb) {
  const parties = Object.keys(G.parliament.seats).filter(p => p !== G.playerPartyId && G.parliament.seats[p] > 0);
  const m = openModal({ title, icon: '🤝', body: parties.map(p => `<button class="option" data-p="${p}"><b>${esc(G.parties[p].name)}</b><small>${G.parliament.seats[p]} deputados · relação ${Math.round(G.parties[G.playerPartyId].relations[p] || 0)}</small></button>`).join('') });
  m.el.addEventListener('click', e => { const b = e.target.closest('[data-p]'); if (b) { m.close(); cb(b.dataset.p); } });
}

const handlers = {
  next: () => nextMonth(),
  events: () => resolveEvents(),
  tab: el => { tab = el.dataset.k; render(); },
  legislate: () => go('legislation'),
  parl: () => go('parliament', { tab: 'agenda' }),
  constitution: () => go('constitution'),
  budget: () => budgetDialog(),
  reshuffle: () => {
    const gov = G.government;
    const m = openModal({ title: 'Remodelação governamental', icon: '🔄', cls: 'wide', body: `<p class="small muted">Escolha a pasta a remodelar (1 PC).</p>${MINISTRIES.map(mm => `<button class="option" data-m="${mm.id}"><b>${esc(mm.name)}</b><small>${esc(G.people[gov.ministers[mm.id]]?.name || '—')}</small></button>`).join('')}` });
    m.el.addEventListener('click', e => { const b = e.target.closest('[data-m]'); if (!b) return; m.close(); const mid = b.dataset.m; const pool = Object.values(G.people).filter(x => (gov.coalition.includes(x.partyId) || x.independent) && !x.generated && !Object.values(gov.ministers).includes(x.id) && x.role !== 'lider' && x.role !== 'par'); const m2 = openModal({ title: 'Novo ministro', body: pool.slice(0, 20).map(x => `<button class="option" data-id="${x.id}"><b>${esc(x.name)}</b><small>${x.expertise === mid ? '⭐ especialista · ' : ''}${esc(G.parties[x.partyId]?.short || 'independente')}</small></button>`).join('') || '<p class="muted">Sem candidatos disponíveis.</p>' }); m2.el.addEventListener('click', ev => { const bb = ev.target.closest('[data-id]'); if (!bb || !spendPC(1)) return; reshuffle(G, mid, bb.dataset.id); applyEffects(G, { approval: rng.range(-1, 2.5) }); m2.close(); render(); }); });
  },
  address: () => { if (!spendPC(1)) return; const d = rng.range(-0.5, 3); applyEffects(G, { approval: d, media: 2 }); addNews(`${G.people[G.government.pm].name} fala ao país em direto das televisões.`, { tone: 'neutral' }); toast(`Comunicação ao país: aprovação ${fmtSigned(d, 1, ' p.p.')}`, d > 0 ? 'good' : 'bad'); render(); },
  meet: () => choosePartyDialog('Reunir com que partido?', pid => { if (!spendPC(1)) return; applyEffects(G, { relations: { [pid]: rng.int(8, 16) } }); toast(`Reunião produtiva com o ${esc(G.parties[pid].short)}.`, 'good'); render(); }),
  europe: () => { if (!spendPC(1)) return; applyEffects(G, { eu: 6, approval: 0.5 }); addNews('Primeiro-Ministro em Bruxelas para o Conselho Europeu.', { tone: 'neutral' }); toast('Cimeira europeia: relações com a UE reforçadas.', 'good'); render(); },
  confidence: async () => { if (!(await confirmBox('Moção de confiança', 'Se a Assembleia a rejeitar (mais votos contra do que a favor), o Governo é demitido. Avançar?', 'Apresentar'))) return; const r = confidenceMotion(G); await alertBox(r.passed ? 'Confiança renovada' : 'Confiança recusada', `${r.tally.favor} a favor · ${r.tally.contra} contra · ${r.tally.abstencao} abstenções.`, r.passed ? '✅' : '❌'); if (G.pendingCrisis) handleCrisis(G.pendingCrisis); else render(); },
  resign: async () => { const c = canDissolve(G); if (!(await confirmBox('Pedir a demissão?', c.ok ? 'O Presidente deverá dissolver a Assembleia e convocar eleições antecipadas.' : `Atenção: ${esc(c.why)} O Presidente terá de procurar outro Governo.`, 'Demitir-me'))) return; addNews(`${G.people[G.government.pm].name} apresenta a demissão ao Presidente da República.`, { tone: 'bad' }); handleCrisis({ kind: 'governo_caiu', dissolve: c.ok }); },
  rupture: () => {
    const m = openModal({ title: 'Rutura institucional', icon: '⚠️', cls: 'wide', body: `<p class="bad"><b>Atenção:</b> está a ponderar sair da ordem constitucional democrática. As consequências serão graves: protestos em massa, isolamento europeu (art. 7.º do TUE, congelamento de fundos), fuga de capitais, oposição do Presidente da República e risco de reação das Forças Armadas.</p>
      <button class="option" data-m="emergencia"><b>Estado de emergência permanente</b><small>Governar por decreto invocando uma "crise nacional".</small></button>
      <button class="option" data-m="suspensao"><b>Suspensão das eleições</b><small>A maioria aprova o adiamento indefinido das eleições.</small></button>
      <button class="option" data-m="constituinte"><b>"Assembleia Constituinte"</b><small>Substituir a Constituição de 1976 por uma nova Lei Fundamental.</small></button>` });
    m.el.addEventListener('click', async e => { const b = e.target.closest('[data-m]'); if (!b) return; m.close(); if (!(await confirmBox('Tem a certeza?', 'Não há caminho fácil de volta.', 'Avançar', 'Recuar', '⚠️'))) return; startRegime(G, b.dataset.m); autosave(); sfx.bad(); render(); });
  },
  propaganda: () => { if (!spendPC(1)) return; applyEffects(G, { regime: { legitimacy: rng.int(4, 8), press: -3, international: -2 } }); toast('Campanha de propaganda nos meios de comunicação.', ''); render(); },
  repress: () => { if (!spendPC(1)) return; applyEffects(G, { regime: { repression: 10, resistance: -8, international: -6, legitimacy: -3 } }); addNews('Forças de segurança dispersam manifestação em Lisboa; dezenas de detidos.', { tone: 'bad' }); render(); },
  concede: () => { if (!spendPC(1)) return; applyEffects(G, { regime: { resistance: -6, legitimacy: 3, repression: -5 } }); toast('Concessões anunciadas: libertação de detidos e diálogo social.', ''); render(); },
  military: () => { if (!spendPC(1)) return; applyEffects(G, { regime: { military: 8 }, budget: 300 }); toast('Aumentos salariais e equipamento para as Forças Armadas.', ''); render(); },
  restore: async () => { if (!(await confirmBox('Restaurar a democracia?', 'Repõe a Constituição e convoca eleições livres. O seu partido será fortemente penalizado.', 'Restaurar'))) return; restoreDemocracy(G); G.phase = 'governing'; scheduleElection(G, { days: 60 }); autosave(); go('campaign', { intro: true }); },
  censure: async () => { if (!spendPC(2)) return; const r = playerCensure(G); await alertBox(r.passed ? 'Moção de censura aprovada!' : 'Moção de censura chumbada', `${r.tally.favor} a favor · ${r.tally.contra} contra · ${r.tally.abstencao} abstenções (eram precisos 116).`, r.passed ? '✅' : '❌'); if (!r.passed) valenceBoost(G, G.playerPartyId, -0.02); if (G.pendingCrisis) handleCrisis(G.pendingCrisis); else render(); },
  inquiry: () => { if (!spendPC(2)) return; const d = rng.range(1.5, 5); applyEffects(G, { approval: -d }); valenceBoost(G, G.playerPartyId, 0.04); addNews(`${G.parties[G.playerPartyId].short} força comissão parlamentar de inquérito à atuação do Governo.`, { tone: 'neutral' }); toast(`Comissão de inquérito: aprovação do Governo −${d.toFixed(1)} p.p.`, 'good'); render(); },
  question: () => { if (!spendPC(1)) return; const ok = rng.chance(0.6 + ((G.people[G.parties[G.playerPartyId].leaderId].traits?.debate ?? 55) - 55) / 100); valenceBoost(G, G.playerPartyId, ok ? 0.05 : -0.02); if (ok) applyEffects(G, { approval: -1 }); toast(ok ? 'Encostou o Primeiro-Ministro às cordas no debate.' : 'O Primeiro-Ministro saiu por cima no debate.', ok ? 'good' : 'bad'); render(); },
  field: () => { const m = openModal({ title: 'Ação no terreno', icon: '🚶', body: DISTRICTS.filter(d => !d.abroad).map(d => `<button class="btn sm" style="margin:3px" data-d="${d.id}">${esc(d.name)}</button>`).join('') }); m.el.addEventListener('click', e => { const b = e.target.closest('[data-d]'); if (!b || !spendPC(1)) return; localBoost(G, G.playerPartyId, b.dataset.d, 0.06); valenceBoost(G, G.playerPartyId, 0.01); m.close(); toast('Presença no terreno reforçada.', 'good'); render(); }); },
};
export function leave() { }
export { fmtNum };
