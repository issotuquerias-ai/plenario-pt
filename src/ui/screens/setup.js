// Novo jogo: escolher partido real ou fundar um partido novo.
import { PARTY_DEFS } from '../../data/parties.js';
import { REAL_PEOPLE } from '../../data/figures.js';
import { NATIONAL_2025, DISTRICTS } from '../../data/districts.js';
import { PROFESSIONS } from '../../data/names.js';
import { AREA_LABELS } from '../../data/laws.js';
import { FAMILY_PRESETS, spectrumLabel, AXIS_INFO } from '../../sim/ideology.js';
import { createGame, SCENARIOS } from '../../sim/setup.js';
import { setG } from '../../core/state.js';
import { partyIdentity, aiLabel } from '../../ai/index.js';
import { generatePartyNames, generateSlogans, generateProgram, acronym } from '../../ai/textgen.js';
import { logoSVG, suggestLogos, LOGO_SYMBOLS, LOGO_LAYOUTS, LOGO_FONTS, svgToDataURL, rasterizeSVG } from '../../ai/logogen.js';
import { uiRoot, bindActions, $ } from '../dom.js';
import { go, setUnbind } from '../app.js';
import { logoImg, portrait, photoSrc, toast, openModal, ideologyBars } from '../components.js';
import { esc, clamp, fmtPct, readFileAsDataURL, resizeImage } from '../../core/util.js';
import { sfx } from '../../audio/sfx.js';

let view = 'mode', W = null, cfg = { scenarioId: SCENARIOS[0].id, campaignWeeks: 9, difficulty: 'normal' }, picked = null;
const PALETTE = ['#e11d48', '#db2777', '#9333ea', '#7c3aed', '#4f46e5', '#2563eb', '#0284c7', '#0891b2', '#0d9488', '#059669', '#16a34a', '#65a30d', '#ca8a04', '#ea580c', '#dc2626', '#1e293b', '#0f172a', '#78350f', '#f59e0b', '#ffffff'];
const people = Object.fromEntries(REAL_PEOPLE.map(p => [p.id, p]));

function newWizard() {
  return { step: 0, family: 'centrista', ideology: { econ: 0.5, social: 0, sistema: -4 }, name: '', short: '', color: '#7c3aed', color2: '#f59e0b', slogan: '', logo: { symbol: 'farol', layout: 'empilhado', font: 'black' }, logoOptions: [], logoUpload: null,
    leader: { name: '', gender: 'm', age: 45, home: 'lisboa', profession: 'jurista', photo: null, traits: { carisma: 60, debate: 60, gestao: 60, experiencia: 40 } }, program: [], priorities: [], nameSug: [], sloganSug: [], busy: false };
}

export function enter() { view = 'mode'; W = null; picked = null; render(); }

function render() {
  const root = uiRoot();
  if (view === 'mode') root.innerHTML = modeView();
  else if (view === 'pick') root.innerHTML = pickView();
  else root.innerHTML = wizardView();
  setUnbind(bindActions(root, handlers, ['click', 'input', 'change']));
  if (view === 'wizard') afterWizardRender();
}

function header(title) {
  return `<header class="hud"><div class="brand" data-act="back">PLENÁRIO<span>PT</span></div><div class="chip"><b>${title}</b><small>Novo jogo</small></div><div class="spacer"></div><button class="btn sm" data-act="back">← Voltar</button></header>`;
}

function modeView() {
  return `<div class="screen bg">${header('Escolha o seu caminho')}
  <div class="scroll" style="flex:1;padding:24px"><div style="max-width:1100px;margin:auto">
    <div class="grid2" style="gap:18px">
      <div class="card click" data-act="mode" data-mode="pick" style="padding:26px"><div style="font-size:42px">🏛️</div><h2 class="title-serif">Jogar com um partido existente</h2><p class="muted">Lidere um dos partidos reais, com os resultados de 2025, as suas figuras e a sua estrutura. Do Governo da AD à oposição, do Chega ao Livre.</p><div class="row wrap">${PARTY_DEFS.filter(p => !p.minor).map(p => logoImg(p, 34)).join('')}</div></div>
      <div class="card click" data-act="mode" data-mode="wizard" style="padding:26px"><div style="font-size:42px">✨</div><h2 class="title-serif">Fundar um novo partido</h2><p class="muted">Crie de raiz: ideologia, nome, sigla, cores e logótipo (com ajuda da IA offline), líder com a sua própria foto, programa. Recolha 7.500 assinaturas e parta à conquista do Parlamento.</p><span class="tag gold">Desafio máximo</span></div>
    </div>
    <div class="panel" style="margin-top:18px"><div class="panel-h"><h3>Cenário</h3></div><div class="panel-b grid3">
      <div class="field"><label>Eleições</label><select class="input" data-act="cfg" data-on="change" data-k="scenarioId">${SCENARIOS.map(s => `<option value="${s.id}" ${cfg.scenarioId === s.id ? 'selected' : ''}>${s.name}</option>`).join('')}</select><span class="tiny muted">${esc(SCENARIOS.find(s => s.id === cfg.scenarioId).desc)}</span></div>
      <div class="field"><label>Duração da campanha</label><select class="input" data-act="cfg" data-on="change" data-k="campaignWeeks">${[6, 9, 12].map(w => `<option value="${w}" ${cfg.campaignWeeks === w ? 'selected' : ''}>${w} semanas</option>`).join('')}</select></div>
      <div class="field"><label>Dificuldade</label><select class="input" data-act="cfg" data-on="change" data-k="difficulty">${[['facil', 'Fácil'], ['normal', 'Normal'], ['dificil', 'Difícil']].map(([v, l]) => `<option value="${v}" ${cfg.difficulty === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
    </div></div>
  </div></div></div>`;
}

function pickView() {
  const list = PARTY_DEFS.slice().sort((a, b) => (NATIONAL_2025[b.id]?.pct || 0) - (NATIONAL_2025[a.id]?.pct || 0));
  const sel = picked ? PARTY_DEFS.find(p => p.id === picked) : null;
  return `<div class="screen bg">${header('Escolha o partido')}
  <div style="flex:1;display:grid;grid-template-columns:1fr 400px;gap:14px;padding:14px;min-height:0">
    <div class="scroll"><div class="party-grid">${list.map(p => {
      const L = people[p.leaderId]; const n = NATIONAL_2025[p.id] || {};
      return `<div class="card click party-card ${picked === p.id ? 'sel' : ''}" data-act="pick" data-id="${p.id}">
        <div class="head">${logoImg(p, 56)}<div class="grow"><b>${esc(p.name)}</b><div class="small muted">${esc(spectrumLabel(p.ideology))}</div></div></div>
        <div class="row">${portrait(L, 38, p.color)}<div class="grow small"><b>${esc(L?.name || '')}</b><div class="tiny muted">Líder</div></div><div class="right"><b>${fmtPct(n.pct || 0)}</b><div class="tiny muted">${n.seats || 0} deputados</div></div></div>
        ${p.minor ? '<span class="tag warn">Sem representação parlamentar</span>' : p.id === 'ad' ? '<span class="tag gold">Governo em funções</span>' : ''}
      </div>`;
    }).join('')}</div></div>
    <div class="panel col" style="min-height:0">${sel ? (() => { const L = people[sel.leaderId]; const n = NATIONAL_2025[sel.id] || {}; return `
      <div class="panel-b col scroll">
        <div class="row">${logoImg(sel, 84)}<div><h2 class="title-serif">${esc(sel.name)}</h2><div class="muted small">Fundado em ${sel.founded} · ${esc(spectrumLabel(sel.ideology))}</div></div></div>
        <p class="small">${esc(sel.desc)}</p>
        <div class="row">${portrait(L, 64, sel.color)}<div><b>${esc(L?.name)}</b><div class="small muted">Líder · Carisma ${L?.traits?.carisma} · Debate ${L?.traits?.debate}</div></div></div>
        <div class="grid3"><div class="kpi"><small>Votos 2025</small><b>${fmtPct(n.pct || 0)}</b></div><div class="kpi"><small>Deputados</small><b>${n.seats || 0}</b></div><div class="kpi"><small>Fundos</small><b>${Math.round(sel.funds / 1000)} mil €</b></div></div>
        <div><h4 class="small muted">POSICIONAMENTO</h4>${ideologyBars(sel.ideology)}</div>
        <div><h4 class="small muted">PRINCIPAIS BANDEIRAS</h4><ul class="small" style="margin:0;padding-left:18px">${sel.program.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>
      </div><div class="panel-b"><button class="btn primary lg block" data-act="startReal">Liderar o ${esc(sel.short)} →</button></div>`; })() : '<div class="panel-b muted center" style="margin:auto">Selecione um partido para ver os detalhes.</div>'}
    </div></div></div>`;
}

// ---------------- Assistente ----------------
const STEPS = ['Ideologia', 'Identidade', 'Logótipo', 'Líder', 'Programa', 'Fundação'];

function wizardView() {
  return `<div class="screen bg">${header('Fundar um partido')}
  <div class="wizard">
    <div class="panel steps">${STEPS.map((s, i) => `<div class="step ${i === W.step ? 'on' : ''} ${i < W.step ? 'done' : ''}" data-act="goStep" data-i="${i}"><span class="n">${i < W.step ? '✓' : i + 1}</span>${s}</div>`).join('')}
      <div class="sep"></div><div class="tiny muted">Assistente: <b>${esc(aiLabel())}</b></div></div>
    <div class="panel col" style="min-height:0"><div class="panel-b scroll grow" id="wstep">${stepHTML()}</div>
      <div class="panel-b row between" style="border-top:1px solid var(--line)"><button class="btn" data-act="prev" ${W.step === 0 ? 'disabled' : ''}>← Anterior</button>${W.step < 5 ? '<button class="btn primary" data-act="next">Seguinte →</button>' : ''}</div></div>
    <div class="panel col scroll" id="wprev">${previewHTML()}</div>
  </div></div>`;
}

function curLogoSVG() { return logoSVG({ short: W.short || 'NP', name: W.name, color: W.color, color2: W.color2, ...W.logo }); }
function logoPreview(size = 120) {
  const src = W.logoUpload || svgToDataURL(curLogoSVG());
  return `<div class="logo-opt" style="width:${size}px;height:${size}px;cursor:default;margin:auto"><img src="${src}"></div>`;
}

function previewHTML() {
  const L = W.leader;
  return `<div class="panel-b preview-card">${logoPreview(140)}
    <h2 class="title-serif" style="margin-top:12px">${esc(W.name || 'Novo partido')}</h2>
    <div class="row" style="justify-content:center"><span class="tag" style="background:${W.color};color:#fff">${esc(W.short || 'SIGLA')}</span><span class="tag">${esc(spectrumLabel(W.ideology))}</span></div>
    ${W.slogan ? `<p class="gold title-serif" style="font-size:17px">“${esc(W.slogan)}”</p>` : ''}
    <div class="sep"></div><div class="row" style="justify-content:center">${portrait({ name: L.name || '?', photoData: L.photo }, 70, W.color)}<div style="text-align:left"><b>${esc(L.name || 'Líder por definir')}</b><div class="small muted">${esc(PROFESSIONS.find(p => p.id === L.profession)?.label || '')} · ${L.age} anos</div><div class="tiny muted">${esc(DISTRICTS.find(d => d.id === L.home)?.name || '')}</div></div></div>
    <div class="sep"></div>${ideoPlot()}
  </div>`;
}

function ideoPlot() {
  const pos = i => ({ x: 50 + i.econ * 4.6, y: 50 + i.social * 4.4 });
  const dots = PARTY_DEFS.filter(p => !p.minor).map(p => { const q = pos(p.ideology); return `<div class="dot" title="${esc(p.short)}" style="left:${q.x}%;top:${q.y}%">${logoImg(p, 26).replace('class="plogo"', 'class="plogo" style="width:26px;height:26px;background:transparent"')}</div>`; }).join('');
  const me = pos(W.ideology);
  return `<div class="ideo-plot"><span class="ax" style="left:6px;top:50%">◀ Esquerda</span><span class="ax" style="right:6px;top:50%">Direita ▶</span><span class="ax" style="top:4px;left:50%;transform:translateX(-50%)">Progressista</span><span class="ax" style="bottom:4px;left:50%;transform:translateX(-50%)">Conservador</span>${dots}<div class="dot me" style="left:${me.x}%;top:${me.y}%;background:${W.color}"><img src="${W.logoUpload || svgToDataURL(curLogoSVG())}"></div></div>`;
}

function stepHTML() {
  switch (W.step) {
    case 0: return `<h2 class="title-serif">Que partido quer fundar?</h2><p class="muted small">Escolha uma família política como ponto de partida e afine a posição nos três eixos. A posição determina que eleitores pode conquistar — e a quem vai roubar votos.</p>
      <div class="grid3">${FAMILY_PRESETS.map(f => `<div class="preset ${W.family === f.id ? 'sel' : ''}" data-act="family" data-id="${f.id}"><div style="font-size:20px">${f.icon}</div><b class="small">${f.label}</b><div class="tiny muted">${f.desc}</div></div>`).join('')}</div>
      <div class="sep"></div>${['econ', 'social', 'sistema'].map(k => `<div class="field"><label>${AXIS_INFO[k].name}: <span class="gold">${W.ideology[k].toFixed(1)}</span></label><div class="row small muted"><span style="width:150px">${AXIS_INFO[k].left}</span><input type="range" min="-10" max="10" step="0.5" value="${W.ideology[k]}" data-act="axis" data-on="input" data-k="${k}"><span style="width:150px;text-align:right">${AXIS_INFO[k].right}</span></div></div>`).join('')}`;
    case 1: return `<h2 class="title-serif">Identidade</h2>
      <div class="grid2"><div class="field"><label>Nome do partido</label><input class="input" data-act="name" data-on="input" value="${esc(W.name)}" maxlength="60" placeholder="Ex.: Movimento Nova Esperança"></div>
      <div class="field"><label>Sigla</label><input class="input" data-act="short" data-on="input" value="${esc(W.short)}" maxlength="6" placeholder="Ex.: MNE"></div></div>
      <button class="btn gold" data-act="aiNames" ${W.busy ? 'disabled' : ''}>✨ ${W.busy ? 'A pensar…' : 'Sugerir nomes com IA'}</button>
      <div class="row wrap" style="margin:10px 0">${W.nameSug.map((n, i) => `<button class="btn sm" data-act="useName" data-i="${i}">${esc(n.name)} <span class="tag">${esc(n.short)}</span></button>`).join('')}</div>
      <div class="sep"></div><div class="grid2"><div class="field"><label>Cor principal</label><div class="row wrap"><input type="color" value="${W.color}" data-act="color" data-on="input" data-k="color">${PALETTE.map(c => `<span class="swatch" style="background:${c}" data-act="swatch" data-c="${c}" data-k="color"></span>`).join('')}</div></div>
      <div class="field"><label>Cor secundária</label><div class="row wrap"><input type="color" value="${W.color2}" data-act="color" data-on="input" data-k="color2">${PALETTE.map(c => `<span class="swatch" style="background:${c}" data-act="swatch" data-c="${c}" data-k="color2"></span>`).join('')}</div></div></div>
      <div class="sep"></div><div class="field"><label>Slogan</label><input class="input" data-act="slogan" data-on="input" value="${esc(W.slogan)}" maxlength="70"></div>
      <button class="btn sm" data-act="aiSlogans">✨ Sugerir slogans</button><div class="row wrap" style="margin-top:8px">${W.sloganSug.map((s, i) => `<button class="btn sm ghost" data-act="useSlogan" data-i="${i}">“${esc(s)}”</button>`).join('')}</div>`;
    case 2: return `<h2 class="title-serif">Logótipo</h2><p class="small muted">A IA offline desenha propostas vetoriais coerentes com a sua ideologia e cores. Pode afinar o símbolo, o formato e o tipo de letra — ou carregar uma imagem sua.</p>
      <div class="row wrap"><button class="btn gold" data-act="aiLogos">✨ Gerar logótipos</button><label class="btn">📁 Carregar imagem <input type="file" accept="image/*" class="hidden" data-act="upLogo" data-on="change"></label>${W.logoUpload ? '<button class="btn ghost" data-act="clearLogo">Remover imagem</button>' : ''}</div>
      <div class="grid4" style="margin:14px 0">${W.logoOptions.map((o, i) => `<div class="logo-opt ${W.logo.symbol === o.symbol && W.logo.layout === o.layout && W.logo.font === o.font && !W.logoUpload ? 'sel' : ''}" data-act="pickLogo" data-i="${i}"><img src="${svgToDataURL(logoSVG({ ...o, short: W.short || 'NP', color: W.color, color2: W.color2 }))}"></div>`).join('')}</div>
      <div class="grid3"><div class="field"><label>Símbolo</label><select class="input" data-act="logoK" data-on="change" data-k="symbol">${LOGO_SYMBOLS.map(s => `<option value="${s.id}" ${W.logo.symbol === s.id ? 'selected' : ''}>${s.label}</option>`).join('')}</select></div>
      <div class="field"><label>Formato</label><select class="input" data-act="logoK" data-on="change" data-k="layout">${LOGO_LAYOUTS.map(s => `<option value="${s.id}" ${W.logo.layout === s.id ? 'selected' : ''}>${s.label}</option>`).join('')}</select></div>
      <div class="field"><label>Letra</label><select class="input" data-act="logoK" data-on="change" data-k="font">${LOGO_FONTS.map(s => `<option value="${s.id}" ${W.logo.font === s.id ? 'selected' : ''}>${s.label}</option>`).join('')}</select></div></div>
      ${logoPreview(200)}`;
    case 3: { const L = W.leader; const used = Object.values(L.traits).reduce((s, x) => s + x, 0); const left = 240 - used;
      return `<h2 class="title-serif">O líder</h2>
      <div class="row" style="align-items:flex-start;gap:18px"><div class="center">${portrait({ name: L.name || '?', photoData: L.photo }, 120, W.color)}<br><label class="btn sm" style="margin-top:8px">📷 Foto do representante <input type="file" accept="image/*" class="hidden" data-act="upPhoto" data-on="change"></label>${L.photo ? '<br><button class="btn sm ghost" data-act="clearPhoto">Remover</button>' : ''}</div>
      <div class="grow"><div class="grid2"><div class="field"><label>Nome</label><input class="input" data-act="leaderK" data-on="input" data-k="name" value="${esc(L.name)}" placeholder="Nome do líder"></div>
      <div class="field"><label>Género</label><select class="input" data-act="leaderK" data-on="change" data-k="gender"><option value="m" ${L.gender === 'm' ? 'selected' : ''}>Masculino</option><option value="f" ${L.gender === 'f' ? 'selected' : ''}>Feminino</option></select></div>
      <div class="field"><label>Idade</label><input type="number" min="25" max="85" class="input" data-act="leaderK" data-on="change" data-k="age" value="${L.age}"></div>
      <div class="field"><label>Profissão</label><select class="input" data-act="leaderK" data-on="change" data-k="profession">${PROFESSIONS.map(p => `<option value="${p.id}" ${L.profession === p.id ? 'selected' : ''}>${p.label}</option>`).join('')}</select></div>
      <div class="field" style="grid-column:span 2"><label>Círculo de origem (cabeça de lista)</label><select class="input" data-act="leaderK" data-on="change" data-k="home">${DISTRICTS.map(d => `<option value="${d.id}" ${L.home === d.id ? 'selected' : ''}>${d.name}</option>`).join('')}</select></div></div></div></div>
      <div class="sep"></div><h3 class="small muted">CARACTERÍSTICAS — pontos por distribuir: <span class="${left < 0 ? 'bad' : 'gold'}">${left}</span></h3>
      ${[['carisma', 'Carisma', 'Comícios, arruadas, apelo emocional'], ['debate', 'Debate', 'Ataques, desmentidos e frases de efeito'], ['gestao', 'Gestão', 'Propostas concretas e credibilidade governativa'], ['experiencia', 'Experiência', 'Notoriedade inicial e negociação']].map(([k, l, d]) => `<div class="field"><label>${l}: <span class="gold">${L.traits[k]}</span> <span class="tiny muted" style="text-transform:none;letter-spacing:0">— ${d}</span></label><input type="range" min="20" max="90" value="${L.traits[k]}" data-act="trait" data-on="input" data-k="${k}"></div>`).join('')}`; }
    case 4: return `<h2 class="title-serif">Programa eleitoral</h2><p class="small muted">Escolha até 3 áreas prioritárias e defina as propostas-bandeira. A IA propõe medidas coerentes com a sua ideologia.</p>
      <div class="row wrap">${Object.entries(AREA_LABELS).map(([k, v]) => `<button class="btn sm ${W.priorities.includes(k) ? 'gold' : ''}" data-act="prio" data-k="${k}">${esc(v)}</button>`).join('')}</div>
      <div class="sep"></div><button class="btn gold" data-act="aiProgram">✨ Gerar programa</button>
      <div class="col" style="margin-top:10px">${W.program.map((m, i) => `<div class="card row"><div class="grow"><b class="small">${esc(m.title)}</b><div class="tiny muted">${esc(m.text || '')}</div></div><button class="btn sm ghost" data-act="delProg" data-i="${i}">✕</button></div>`).join('')}</div>
      <div class="row" style="margin-top:10px"><input class="input" id="newProg" placeholder="Escreva uma proposta sua…"><button class="btn" data-act="addProg">Adicionar</button></div>`;
    case 5: return `<h2 class="title-serif">Fundação legal</h2>
      <p class="small">Para se constituir, um partido precisa de <b>7.500 assinaturas</b> de cidadãos eleitores e da inscrição no registo próprio do <b>Tribunal Constitucional</b> (Lei dos Partidos Políticos).</p>
      <div class="card"><div class="row between small"><span>Assinaturas recolhidas</span><b id="sigN">${W.signatures || 0} / 7 500</b></div><div class="sigbar" style="margin-top:8px"><i id="sigBar" style="width:${(W.signatures || 0) / 75}%"></i></div><div id="sigLog" class="small muted" style="margin-top:10px;min-height:110px">${(W.sigLog || []).map(x => `<div>${x}</div>`).join('')}</div></div>
      ${W.registered ? `<div class="card" style="margin-top:12px;border-color:var(--green)"><b class="good">✅ ${esc(W.name)} inscrito no registo de partidos do Tribunal Constitucional.</b><div class="small muted">Começa com ~0,6% nas sondagens e quase ninguém o conhece. A campanha vai decidir tudo.</div></div><button class="btn gold lg block" style="margin-top:14px" data-act="startCustom">Começar a campanha →</button>` : `<button class="btn primary lg" style="margin-top:14px" data-act="collect" ${W.collecting ? 'disabled' : ''}>✍️ Iniciar recolha de assinaturas</button>`}
      <div class="sep"></div><h3 class="small muted">Resumo</h3>${validate().map(x => `<div class="small bad">⚠ ${x}</div>`).join('') || '<div class="small good">Tudo pronto.</div>'}`;
  }
  return '';
}

function validate() {
  const e = [];
  if (!W.name.trim()) e.push('Falta o nome do partido.');
  if (!W.short.trim()) e.push('Falta a sigla.');
  if (!W.leader.name.trim()) e.push('Falta o nome do líder.');
  if (240 - Object.values(W.leader.traits).reduce((s, x) => s + x, 0) < 0) e.push('Distribuiu pontos a mais nas características do líder.');
  if (W.short && PARTY_DEFS.some(p => p.short.toLowerCase() === W.short.trim().toLowerCase())) e.push('Essa sigla já pertence a outro partido registado.');
  return e;
}

function updatePreview() { const p = $('#wprev'); if (p) p.innerHTML = previewHTML(); }
function rerenderStep() { const s = $('#wstep'); if (s) s.innerHTML = stepHTML(); updatePreview(); }
function afterWizardRender() { }

async function collectSignatures() {
  W.collecting = true; W.signatures = 0; W.sigLog = []; rerenderStep();
  const msgs = ['Bancas de recolha na Baixa de Lisboa e na Avenida dos Aliados', 'Voluntários percorrem feiras e mercados do interior', 'Formulários validados com número de eleitor', 'Apoio de uma figura conhecida dá visibilidade à recolha', 'Últimas assinaturas recolhidas em Braga e Coimbra', 'Processo entregue no Tribunal Constitucional', 'O Tribunal verifica as assinaturas…'];
  for (let i = 0; i < msgs.length; i++) {
    await new Promise(r => setTimeout(r, 520));
    W.signatures = Math.min(7500, Math.round(7500 * (i + 1) / (msgs.length - 1)) + Math.floor(Math.random() * 300));
    if (i >= msgs.length - 2) W.signatures = 8210;
    W.sigLog.push(msgs[i]); sfx.type();
    rerenderStep();
  }
  await new Promise(r => setTimeout(r, 700));
  W.registered = true; W.collecting = false; sfx.good(); rerenderStep();
}

async function startCustom() {
  const errs = validate();
  if (errs.length) { toast(errs[0], 'bad'); return; }
  let logoData = W.logoUpload, logoSvg = null;
  if (!logoData) { logoSvg = curLogoSVG(); try { logoData = await rasterizeSVG(logoSvg, 256); } catch { logoData = null; } }
  const custom = {
    name: W.name.trim(), short: W.short.trim().toUpperCase(), color: W.color, color2: W.color2, ideology: { ...W.ideology }, family: W.family, slogan: W.slogan,
    logo: logoData, logoSvg, program: W.program.map(p => p.title), priorities: W.priorities,
    leader: { ...W.leader, name: W.leader.name.trim() },
  };
  const G = createGame({ custom, ...cfg });
  setG(G);
  go('campaign', { intro: true });
}

const handlers = {
  back: () => { if (view === 'mode') go('title'); else { view = 'mode'; render(); } },
  cfg: el => { const k = el.dataset.k; cfg[k] = k === 'campaignWeeks' ? +el.value : el.value; render(); },
  mode: el => { view = el.dataset.mode; if (view === 'wizard') { W = newWizard(); W.logoOptions = suggestLogos({ family: W.family }, 8); } render(); },
  pick: el => { picked = el.dataset.id; sfx.click(); render(); },
  startReal: () => { const G = createGame({ partyId: picked, ...cfg }); setG(G); go('campaign', { intro: true }); },
  goStep: el => { W.step = +el.dataset.i; render(); },
  prev: () => { W.step = Math.max(0, W.step - 1); render(); },
  next: () => { if (W.step === 1 && (!W.name || !W.short)) { toast('Defina o nome e a sigla (ou use a IA).', 'bad'); return; } if (W.step === 3 && !W.leader.name) { toast('Dê um nome ao líder.', 'bad'); return; } W.step = Math.min(5, W.step + 1); if (W.step === 2 && !W.logoOptions.length) W.logoOptions = suggestLogos({ family: W.family }, 8); if (W.step === 4 && !W.program.length) W.program = generateProgram(W.ideology, W.priorities, 5); render(); },
  family: el => { const f = FAMILY_PRESETS.find(x => x.id === el.dataset.id); W.family = f.id; W.ideology = { ...f.ideology }; rerenderStep(); },
  axis: el => { W.ideology[el.dataset.k] = +el.value; el.closest('.field').querySelector('.gold').textContent = (+el.value).toFixed(1); updatePreview(); },
  name: el => { W.name = el.value; if (!W.shortTouched) { W.short = acronym(W.name); const s = $('[data-act="short"]'); if (s) s.value = W.short; } updatePreview(); },
  short: el => { W.short = el.value.toUpperCase(); W.shortTouched = true; updatePreview(); },
  aiNames: async () => { W.busy = true; rerenderStep(); const r = await partyIdentity({ ideology: W.ideology, family: W.family }); W.nameSug = r.names; W.sloganSug = r.slogans; if (!W.program.length) W.program = r.program; W.busy = false; rerenderStep(); },
  useName: el => { const n = W.nameSug[+el.dataset.i]; W.name = n.name; W.short = n.short; W.shortTouched = false; rerenderStep(); },
  color: el => { W[el.dataset.k] = el.value; updatePreview(); },
  swatch: el => { W[el.dataset.k] = el.dataset.c; rerenderStep(); },
  slogan: el => { W.slogan = el.value; updatePreview(); },
  aiSlogans: () => { W.sloganSug = generateSlogans(W.ideology, W.family, W.short || 'NP', 6, Date.now()); rerenderStep(); },
  useSlogan: el => { W.slogan = W.sloganSug[+el.dataset.i]; rerenderStep(); },
  aiLogos: () => { W.logoOptions = suggestLogos({ family: W.family }, 8, Date.now()); rerenderStep(); },
  pickLogo: el => { const o = W.logoOptions[+el.dataset.i]; W.logo = { symbol: o.symbol, layout: o.layout, font: o.font }; W.logoUpload = null; rerenderStep(); },
  logoK: el => { W.logo[el.dataset.k] = el.value; W.logoUpload = null; rerenderStep(); },
  upLogo: async el => { const f = el.files[0]; if (!f) return; const d = await readFileAsDataURL(f); W.logoUpload = await resizeImage(d, 256, 256, 'image/png', 0.92); rerenderStep(); },
  clearLogo: () => { W.logoUpload = null; rerenderStep(); },
  upPhoto: async el => { const f = el.files[0]; if (!f) return; const d = await readFileAsDataURL(f); W.leader.photo = await resizeImage(d, 240, 320, 'image/jpeg', 0.86, true); rerenderStep(); },
  clearPhoto: () => { W.leader.photo = null; rerenderStep(); },
  leaderK: el => { const k = el.dataset.k; W.leader[k] = k === 'age' ? clamp(+el.value || 45, 25, 85) : el.value; if (el.tagName === 'SELECT') rerenderStep(); else updatePreview(); },
  trait: el => { W.leader.traits[el.dataset.k] = +el.value; rerenderStep(); },
  prio: el => { const k = el.dataset.k; if (W.priorities.includes(k)) W.priorities = W.priorities.filter(x => x !== k); else if (W.priorities.length < 3) W.priorities.push(k); else toast('Máximo de 3 prioridades.'); rerenderStep(); },
  aiProgram: () => { W.program = generateProgram(W.ideology, W.priorities, 6, Date.now()); rerenderStep(); },
  delProg: el => { W.program.splice(+el.dataset.i, 1); rerenderStep(); },
  addProg: () => { const i = $('#newProg'); if (i.value.trim()) { W.program.push({ title: i.value.trim(), text: '' }); rerenderStep(); } },
  collect: () => { const e = validate(); if (e.length) { toast(e[0], 'bad'); return; } collectSignatures(); },
  startCustom: () => startCustom(),
};

export function leave() { }
export { photoSrc, openModal, generatePartyNames };
