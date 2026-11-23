// Fim de jogo e legado
import { G } from '../../core/state.js';
import { deleteSave } from '../../core/save.js';
import { uiRoot } from '../dom.js';
import { go, bindScreen } from '../app.js';
import { logoImg, portrait } from '../components.js';
import * as cal from '../../core/calendar.js';
import { esc, fmtPct, fmtSigned } from '../../core/util.js';
import { sfx } from '../../audio/sfx.js';

const ENDINGS = {
  revolucao: { icon: '🌹', title: 'A Revolução', text: 'Tal como em 1974, o povo saiu à rua e os militares recusaram disparar. O regime caiu e a democracia foi restaurada. O seu nome ficará nos livros de História — pelas piores razões.' },
  golpe: { icon: '🎖️', title: 'Golpe militar', text: 'Um movimento de oficiais tomou os pontos estratégicos de Lisboa durante a madrugada. O Governo foi deposto e os seus membros detidos.' },
  consolidado: { icon: '🕳️', title: 'Regime consolidado', text: 'O regime resistiu. Portugal está isolado na Europa, as liberdades suspensas e a economia em declínio. Um "sucesso" que ninguém celebra.' },
};

export function enter() {
  const me = G.playerPartyId; const p = G.parties[me]; const L = G.people[p.leaderId];
  const e = ENDINGS[G.ended?.kind] || { icon: '🏛️', title: 'Fim', text: 'A sua carreira política chegou ao fim.' };
  const el = G.history.elections;
  sfx.sting();
  const root = uiRoot();
  root.innerHTML = `<div class="screen bg"><div class="scroll" style="flex:1"><div class="ending">
    <div style="font-size:64px">${e.icon}</div><h1>${e.title}</h1><p style="font-size:17px">${esc(e.text)}</p>
    <div class="row" style="justify-content:center;margin:20px 0">${logoImg(p, 60)}${portrait(L, 60, p.color)}<div style="text-align:left"><b>${esc(L.name)}</b><div class="muted small">${esc(p.name)}</div></div></div>
    <div class="grid3"><div class="kpi"><small>Leis aprovadas</small><b>${G.stats.lawsPassed}</b></div><div class="kpi"><small>Eleições disputadas</small><b>${el.length}</b></div><div class="kpi"><small>Acontecimentos geridos</small><b>${G.stats.eventsResolved}</b></div>
    <div class="kpi"><small>PIB final</small><b>${fmtSigned(G.economy.gdpGrowth, 1, '%')}</b></div><div class="kpi"><small>Dívida</small><b>${fmtPct(G.economy.debt, 0)}</b></div><div class="kpi"><small>Data</small><b>${cal.shortDate(G.date)}</b></div></div>
    <div class="sep"></div><h3 class="title-serif">Historial eleitoral</h3>${el.map(x => `<div class="small">${cal.mediumDate(x.date)} — ${fmtPct(x.playerPct)} · ${x.playerSeats} deputados · vencedor: ${esc(G.parties[x.winner]?.short || '')}</div>`).join('')}
    <div class="sep"></div><button class="btn gold lg" data-act="menu2">Menu principal</button></div></div></div>`;
  bindScreen(root, { menu2: () => { deleteSave('auto'); go('title'); } });
}
export function leave() { }
