// Ecrã de título
import { Engine } from '../../three/engine.js';
import { createHemicycle } from '../../three/hemicycle.js';
import { PARTY_DEFS } from '../../data/parties.js';
import { NATIONAL_2025 } from '../../data/districts.js';
import { setG } from '../../core/state.js';
import { listSaves, loadGame } from '../../core/save.js';
import { uiRoot, bindActions } from '../dom.js';
import { go, setUnbind, saveMenu, settingsMenu, helpMenu, resumeGame, creditsHTML } from '../app.js';
import { openModal } from '../components.js';
import { sfx } from '../../audio/sfx.js';

export const uses3D = true;

export function defaultSeats() {
  const out = [];
  PARTY_DEFS.slice().sort((a, b) => a.seatOrder - b.seatOrder).forEach(p => { for (let i = 0; i < (NATIONAL_2025[p.id]?.seats || 0); i++) out.push({ partyId: p.id, color: p.color, personName: '', district: '' }); });
  return out;
}

export function enter() {
  setG(null);
  try { Engine.setScene(createHemicycle({ seats: defaultSeats(), cinematic: true, interactive: false })); } catch (e) { console.error('3D indisponível', e); }
  const hasAuto = !listSaves().find(s => s.slot === 'auto')?.empty;
  const root = uiRoot();
  root.innerHTML = `<div class="screen title-screen">
    <div class="title-box">
      <div class="title-logo">PLENÁRIO<span>PORTUGAL</span></div>
      <div class="flagline"></div>
      <div class="title-tag">Conquiste o voto. Forme Governo. Mude o país.</div>
      <div class="menu">
        ${hasAuto ? '<button class="btn gold lg" data-act="cont">▶ Continuar</button>' : ''}
        <button class="btn primary lg" data-act="new">Novo jogo</button>
        <button class="btn" data-act="load">Carregar jogo</button>
        <button class="btn" data-act="help">Como jogar</button>
        <button class="btn" data-act="settings">Definições</button>
        <button class="btn ghost" data-act="credits">Créditos</button>
      </div>
    </div>
    <div class="title-foot">Dados reais das legislativas de 2025 · 230 deputados · 22 círculos · Método de D'Hondt · IA offline</div>
  </div>`;
  setUnbind(bindActions(root, {
    new: () => { sfx.click(); go('setup'); },
    cont: () => { const g = loadGame('auto'); if (g) { setG(g); resumeGame(); } },
    load: () => saveMenu(), settings: () => settingsMenu(), help: () => helpMenu(),
    credits: () => openModal({ title: 'Créditos', icon: '🏛️', cls: 'wide', body: `<p><b>PLENÁRIO PT</b> — simulador político das legislativas portuguesas. Feito com Three.js e muito respeito pela democracia portuguesa.</p><p class="small muted">Jogo de simulação e ficção. Os partidos e figuras reais aparecem com fins de realismo; os acontecimentos, citações e cenários do jogo são fictícios e não representam posições reais.</p><div class="tiny muted">${creditsHTML()}</div>`, actions: [{ label: 'Fechar', cls: 'primary' }] }),
  }));
}
export function leave() { }
