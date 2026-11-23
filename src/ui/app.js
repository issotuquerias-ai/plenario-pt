// Gestor de ecrãs, HUD comum e menus globais.
import { Engine } from '../three/engine.js';
import { G, setG, SETTINGS, updateSettings } from '../core/state.js';
import { saveGame, loadGame, listSaves, exportSave, importSave, deleteSave } from '../core/save.js';
import { uiRoot, bindActions } from './dom.js';
import { openModal, toast, confirmBox, logoImg } from './components.js';
import { ollamaStatus } from '../ai/ollama.js';
import { setVolume, stopAmbience, sfx } from '../audio/sfx.js';
import { CREDITS } from '../data/assets.js';
import * as cal from '../core/calendar.js';
import { esc, fmtNum } from '../core/util.js';

const screens = {};
let current = null, currentName = null, unbind = null;
export function registerScreen(name, mod) { screens[name] = mod; }
export const screenName = () => currentName;

export function go(name, params = {}) {
  try { current?.leave?.(); } catch (e) { console.error(e); }
  if (unbind) { unbind(); unbind = null; }
  document.getElementById('modal-root').innerHTML = '';
  document.getElementById('tooltip').classList.add('hidden');
  stopAmbience();
  const mod = screens[name];
  if (!mod) { console.error('Ecrã inexistente', name); return; }
  current = mod; currentName = name;
  if (!mod.uses3D) Engine.setScene(null);
  uiRoot().innerHTML = '';
  uiRoot().dataset.anim = 'on';
  clearTimeout(go._t); go._t = setTimeout(() => { uiRoot().dataset.anim = 'off'; }, 450);
  mod.enter(params);
}
export function refresh() { current?.refresh?.(); }
export function setUnbind(fn) { if (unbind) unbind(); unbind = fn; }

export function autosave() { if (G && SETTINGS.autosave) saveGame('auto', G); }

// ---------- HUD ----------
export function hudHTML(chips = [], extra = '') {
  const p = G?.parties[G.playerPartyId];
  return `<header class="hud">
    <div class="brand" data-act="menu">PLENÁRIO<span>PT</span></div>
    ${p ? `<div class="row">${logoImg(p, 34)}<div><b>${esc(p.short)}</b><div class="tiny muted">${esc(G.people[p.leaderId]?.name || '')}</div></div></div>` : ''}
    <div class="chip"><b>${G ? cal.mediumDate(G.date) : ''}</b><small>${esc(phaseLabel())}</small></div>
    ${chips.map(c => `<div class="chip" ${c.tip ? `title="${esc(c.tip)}"` : ''}><b class="${c.cls || ''}">${c.v}</b><small>${c.k}</small></div>`).join('')}
    <div class="spacer"></div>${extra}
    <button class="btn sm ghost" data-act="save" title="Gravar">💾</button>
    <button class="btn sm ghost" data-act="settings" title="Definições">⚙️</button>
    <button class="btn sm ghost" data-act="menu" title="Menu">☰</button>
  </header>`;
}
export function phaseLabel() {
  if (!G) return '';
  return { campaign: !G.campaign || G.campaign.turn >= G.campaign.turns.length ? 'Noite eleitoral' : G.campaign.turns[G.campaign.turn]?.kind === 'oficial' ? 'Campanha oficial' : 'Pré-campanha', formacao: 'Formação de Governo', governing: 'Legislatura', regime: 'Regime de exceção', ended: 'Fim' }[G.phase] || G.phase;
}
export const hudHandlers = () => ({
  menu: () => gameMenu(),
  save: () => saveMenu(),
  settings: () => settingsMenu(),
});

export function newsTicker() {
  const items = (G?.news || []).slice(0, 12).map(n => `<span>${esc(n.headline)}</span>`).join('');
  return `<footer class="ticker"><div class="lbl">ÚLTIMA HORA</div><div class="grow" style="overflow:hidden"><div class="track">${items || '<span>Bem-vindo ao PLENÁRIO PT</span>'}</div></div></footer>`;
}

export function gameMenu() {
  const m = openModal({
    title: 'Menu', icon: '☰', body: `<div class="menu" style="width:100%">
      <button class="btn" data-m="save">💾 Gravar / Carregar</button>
      <button class="btn" data-m="settings">⚙️ Definições</button>
      <button class="btn" data-m="export">📤 Exportar jogo para ficheiro</button>
      <button class="btn" data-m="help">❓ Como jogar</button>
      <button class="btn danger" data-m="quit">🚪 Sair para o menu principal</button></div>`,
  });
  m.el.addEventListener('click', async e => {
    const b = e.target.closest('[data-m]'); if (!b) return;
    const k = b.dataset.m; m.close();
    if (k === 'save') saveMenu(); if (k === 'settings') settingsMenu(); if (k === 'export') exportSave(G); if (k === 'help') helpMenu();
    if (k === 'quit' && await confirmBox('Sair para o menu principal?', 'O progresso desde a última gravação automática será perdido.', 'Sair')) { autosave(); go('title'); }
  });
}

export function helpMenu() {
  openModal({
    title: 'Como jogar', icon: '❓', cls: 'wide', body: `
    <h3>1. Campanha</h3><p>Cada turno (semana na pré-campanha, dois dias na campanha oficial) tem <b>ações</b> limitadas. Faça arruadas (cena 3D: clique no chão para andar, clique nos eleitores para os cumprimentar), comícios, cartazes nas rotundas, visitas, entrevistas e campanhas digitais. Participe nos <b>debates televisivos</b> escolhendo a abordagem certa a cada pergunta. Entregue as listas de candidatos (Lei da Paridade!) antes do prazo.</p>
    <h3>2. Eleições</h3><p>Os votos são convertidos em mandatos pelo <b>método de D'Hondt</b> em 22 círculos. A maioria absoluta exige <b>116 deputados</b>.</p>
    <h3>3. Formação de Governo</h3><p>Instalação da Assembleia (eleição do Presidente da AR e vice-presidentes), audiências em Belém, indigitação, negociação de coligações ou acordos e votação do programa (moções de rejeição).</p>
    <h3>4. Legislatura</h3><p>Avance mês a mês. Resolva acontecimentos, proponha leis (catálogo, pedido à IA ou texto próprio), negoceie votos, aprove o Orçamento do Estado, enfrente vetos do Presidente e o Tribunal Constitucional, reveja a Constituição (2/3). Na oposição: projetos de lei, moções de censura, comissões de inquérito.</p>
    <h3>5. Rutura</h3><p>Com maioria absoluta do seu partido pode tentar um caminho autoritário — com consequências realistas: resistência popular, Forças Armadas, sanções europeias.</p>`, actions: [{ label: 'Fechar', cls: 'primary' }],
  });
}

export function saveMenu() {
  const render = () => listSaves().map(s => `<div class="card row" style="margin-bottom:8px">
      <div class="grow"><b>${s.slot === 'auto' ? 'Gravação automática' : 'Espaço ' + s.slot}</b>
      <div class="small muted">${s.empty ? 'Vazio' : `${esc(s.party)} · ${esc(s.leader || '')} · ${cal.mediumDate(s.date)} · ${new Date(s.savedAt).toLocaleString('pt-PT')}`}</div></div>
      ${G && s.slot !== 'auto' ? `<button class="btn sm" data-s="save" data-slot="${s.slot}">Gravar aqui</button>` : ''}
      ${!s.empty ? `<button class="btn sm primary" data-s="load" data-slot="${s.slot}">Carregar</button><button class="btn sm ghost" data-s="del" data-slot="${s.slot}">🗑</button>` : ''}</div>`).join('');
  const m = openModal({ title: 'Gravar / Carregar', icon: '💾', cls: 'wide', body: `<div id="slots">${render()}</div><div class="sep"></div><label class="btn sm">📥 Importar ficheiro <input type="file" accept=".json" id="imp" class="hidden"></label>` });
  m.el.addEventListener('click', async e => {
    const b = e.target.closest('[data-s]'); if (!b) return;
    const slot = b.dataset.slot;
    if (b.dataset.s === 'save') { if (saveGame(slot, G)) toast('Jogo gravado.', 'good'); else toast('Não foi possível gravar (espaço insuficiente?).', 'bad'); }
    if (b.dataset.s === 'load') { const g = loadGame(slot); if (g) { setG(g); m.close(); resumeGame(); } }
    if (b.dataset.s === 'del' && await confirmBox('Apagar gravação?', 'Esta ação não pode ser desfeita.', 'Apagar')) deleteSave(slot);
    m.el.querySelector('#slots').innerHTML = render();
  });
  m.el.querySelector('#imp').addEventListener('change', async e => { try { const g = await importSave(e.target.files[0]); setG(g); m.close(); resumeGame(); } catch (err) { toast('Ficheiro inválido: ' + err.message, 'bad'); } });
}

export function resumeGame() {
  const ph = G.phase;
  if (ph === 'campaign') go('campaign');
  else if (ph === 'formacao') go('formation');
  else if (ph === 'ended') go('endgame');
  else go('government');
}

export function settingsMenu() {
  const S = SETTINGS;
  const m = openModal({
    title: 'Definições', icon: '⚙️', cls: 'wide', body: `<div class="grid2">
    <div><h3>Som e imagem</h3>
      <div class="field"><label>Volume</label><input type="range" min="0" max="1" step="0.05" value="${S.volume}" id="s-vol"></div>
      <label class="check"><input type="checkbox" id="s-sfx" ${S.sfx ? 'checked' : ''}> Efeitos sonoros</label>
      <label class="check"><input type="checkbox" id="s-amb" ${S.ambience ? 'checked' : ''}> Som ambiente</label>
      <div class="field" style="margin-top:10px"><label>Qualidade gráfica 3D</label><select class="input" id="s-q"><option value="high">Alta</option><option value="medium">Média</option><option value="low">Baixa (PC modesto)</option></select></div>
      <label class="check"><input type="checkbox" id="s-timer" ${S.debateTimer ? 'checked' : ''}> Tempo limite nas respostas dos debates</label>
      <label class="check"><input type="checkbox" id="s-auto" ${S.autosave ? 'checked' : ''}> Gravação automática</label>
    </div>
    <div><h3>Inteligência artificial</h3>
      <p class="small muted">O jogo inclui uma <b>IA offline procedimental</b> (sempre ativa). Opcionalmente pode ligar um modelo de linguagem local através do <b>Ollama</b> (100% offline, no seu PC) para textos mais ricos na criação de partidos e de leis.</p>
      <label class="check"><input type="checkbox" id="s-ai" ${S.ai.enabled ? 'checked' : ''}> Usar IA local (Ollama)</label>
      <div class="field" style="margin-top:10px"><label>Endereço</label><input class="input" id="s-url" value="${esc(S.ai.url)}"></div>
      <div class="field"><label>Modelo</label><input class="input" id="s-model" value="${esc(S.ai.model)}" list="s-models"><datalist id="s-models"></datalist></div>
      <button class="btn sm" id="s-test">Testar ligação</button> <span id="s-res" class="small"></span>
      <p class="tiny dim" style="margin-top:8px">Dica: instale o Ollama, execute <kbd>ollama pull llama3.2</kbd> e abra o jogo pelo ficheiro JOGAR.bat (ou defina OLLAMA_ORIGINS=*).</p>
    </div></div>
    <div class="sep"></div><details><summary class="small muted" style="cursor:pointer">Créditos das imagens (Wikimedia Commons)</summary><div class="tiny muted" style="margin-top:8px;max-height:180px;overflow:auto">${creditsHTML()}</div></details>`,
    actions: [{ label: 'Guardar', cls: 'primary', onClick: () => {
      const q = m.el.querySelector('#s-q').value;
      updateSettings({ volume: +m.el.querySelector('#s-vol').value, sfx: m.el.querySelector('#s-sfx').checked, ambience: m.el.querySelector('#s-amb').checked, quality: q, debateTimer: m.el.querySelector('#s-timer').checked, autosave: m.el.querySelector('#s-auto').checked, ai: { enabled: m.el.querySelector('#s-ai').checked, url: m.el.querySelector('#s-url').value.trim(), model: m.el.querySelector('#s-model').value.trim() } });
      Engine.setQuality(q); setVolume(); toast('Definições guardadas.', 'good');
    } }],
  });
  m.el.querySelector('#s-q').value = S.quality;
  m.el.querySelector('#s-test').onclick = async () => {
    const r = m.el.querySelector('#s-res'); r.textContent = 'A testar…';
    const st = await ollamaStatus(m.el.querySelector('#s-url').value.trim());
    if (st.ok) { r.innerHTML = `<span class="good">Ligado ✓ (${st.models.length} modelos)</span>`; m.el.querySelector('#s-models').innerHTML = st.models.map(x => `<option value="${esc(x)}">`).join(''); }
    else r.innerHTML = `<span class="bad">${esc(st.error)}</span>`;
  };
}

export function creditsHTML() {
  const rows = [];
  for (const [k, v] of Object.entries(CREDITS.logos || {})) rows.push(`Logótipo ${k.toUpperCase()}: ${esc(v.artist || '—')} · ${esc(v.license || '')} · ${esc(v.file)}`);
  for (const [k, v] of Object.entries(CREDITS.figuras || {})) rows.push(`Foto ${k}: ${esc(v.artist || '—')} · ${esc(v.license || '')} · ${esc(v.file)}`);
  return rows.join('<br>') + '<br><br>Logótipos e marcas pertencem aos respetivos partidos. Uso não comercial, apenas para fins de simulação. Mapa: Natural Earth (domínio público).';
}

export function bindScreen(root, handlers) { setUnbind(bindActions(root, { ...hudHandlers(), ...handlers }, ['click', 'input', 'change'])); }
export { fmtNum, sfx };
