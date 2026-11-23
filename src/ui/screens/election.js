// Noite eleitoral
import { G, addNews } from '../../core/state.js';
import { DISTRICTS, DISTRICT_BY_ID } from '../../data/districts.js';
import { simulateElection, exitPoll } from '../../sim/election.js';
import { postElection } from '../../sim/formation.js';
import { valenceBoost } from '../../sim/campaign.js';
import { uiRoot, $ } from '../dom.js';
import { go, hudHTML, bindScreen, autosave } from '../app.js';
import { renderMap } from '../map.js';
import { logoImg, hemicycleSVG, seatsLegend, resultBars, openModal, pchip } from '../components.js';
import * as cal from '../../core/calendar.js';
import { esc, fmtPct, fmtNum, clamp, sleep } from '../../core/util.js';
import { rng } from '../../core/rng.js';
import { sfx } from '../../audio/sfx.js';

let stage, R, counted, order, timer, fast;

export function enter() {
  if (!G.electionResult) G.electionResult = simulateElection(G);
  R = G.electionResult;
  stage = 'reflexao'; counted = []; fast = false;
  order = DISTRICTS.filter(d => !d.abroad).map(d => ({ d, k: d.registered * rng.range(0.6, 1.4) })).sort((a, b) => a.k - b.k).map(x => x.d.id);
  render();
}

function tally(ids) {
  const votes = {}, seats = {}; let voters = 0, reg = 0;
  for (const id of ids) { const r = R.byDistrict[id]; voters += r.voters; reg += r.registered; for (const p in r.votes) votes[p] = (votes[p] || 0) + r.votes[p]; for (const p in r.seats) seats[p] = (seats[p] || 0) + r.seats[p]; }
  const pct = {}; for (const p in votes) pct[p] = voters ? votes[p] / voters * 100 : 0;
  return { votes, seats, pct, voters, reg };
}

function render() {
  const root = uiRoot();
  const me = G.playerPartyId;
  let body = '';
  if (stage === 'reflexao') {
    body = `<div class="ending panel" style="margin-top:8vh"><div style="font-size:54px">🗳️</div><h1 class="title-serif">Dia de reflexão</h1><p class="muted">${cal.longDate(cal.addDays(G.electionDate, -1))}. A campanha terminou à meia-noite. Amanhã, ${fmtNum(R.registered)} eleitores são chamados às urnas para eleger os 230 deputados à Assembleia da República.</p><button class="btn gold lg" data-act="vote">Avançar para a noite eleitoral →</button></div>`;
  } else {
    const t = tally(counted);
    const pctCounted = counted.length / order.length * 100;
    const ep = stage === 'boca' ? exitPoll(R) : null;
    const hour = stage === 'boca' ? '20:00' : (() => { const mins = 20 * 60 + 15 + Math.round(pctCounted * 3.2); return `${String(Math.floor(mins / 60) % 24).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`; })();
    body = `<div class="tv-banner"><span class="live">EM DIRETO</span><b class="title-serif" style="font-size:20px">NOITE ELEITORAL — LEGISLATIVAS ${String(G.electionDate).slice(0, 4)}</b><div class="spacer" style="flex:1"></div><span class="bigclock">${stage === 'emigracao' ? cal.shortDate(cal.addDays(G.electionDate, 10)) : hour}</span></div>
    <main class="layout" style="grid-template-columns:1fr 1.1fr 1fr">
      <div class="panel col" style="min-height:0"><div class="panel-h"><h3>Apuramento por círculo</h3><span class="small">${fmtPct(pctCounted, 0)} apurado</span></div><div id="emap" class="grow" style="min-height:0;padding:6px"></div></div>
      <div class="panel col" style="min-height:0"><div class="panel-h"><h3>${stage === 'boca' ? 'Sondagens à boca das urnas' : 'Resultados nacionais'}</h3>${stage !== 'boca' ? `<span class="small muted">Participação: ${fmtPct(t.reg ? t.voters / t.reg * 100 : 0)}</span>` : ''}</div>
        <div class="panel-b scroll grow">${stage === 'boca' ? exitHTML(ep) : resultBars(G, t.pct, t.seats)}</div>
        <div class="panel-b" style="border-top:1px solid var(--line)">${stage === 'boca' ? '<button class="btn primary block" data-act="count">Começar o apuramento</button>' : stage === 'contagem' ? `<button class="btn block" data-act="fast">⏩ Acelerar</button>` : stage === 'final' ? '<div class="small warn">Faltam apurar os 4 mandatos dos círculos da emigração (votos por correspondência).</div><button class="btn primary block" style="margin-top:8px" data-act="abroad">Avançar 10 dias — apuramento da emigração</button>' : '<button class="btn gold block lg" data-act="speech">Reagir aos resultados →</button>'}</div></div>
      <div class="panel col" style="min-height:0"><div class="panel-h"><h3>Composição do Parlamento</h3><span class="small">${Object.values(t.seats).reduce((s, x) => s + x, 0)} / 230</span></div><div class="panel-b scroll">${hemicycleSVG(G, stage === 'boca' ? {} : t.seats, { width: 380 })}${stage !== 'boca' ? seatsLegend(G, t.seats) : ''}
        ${stage !== 'boca' ? `<div class="sep"></div><div class="card" style="border-color:${G.parties[me].color}"><div class="row">${logoImg(G.parties[me], 40)}<div class="grow"><b>${esc(G.parties[me].short)}</b><div class="small muted">O seu partido</div></div><div class="right"><b class="big">${t.seats[me] || 0}</b><div class="small">${fmtPct(t.pct[me] || 0)}</div></div></div></div>` : ''}</div></div>
    </main>`;
  }
  root.innerHTML = `<div class="screen bg">${hudHTML([])}${body}</div>`;
  if (stage !== 'reflexao') drawMap();
  bindScreen(root, handlers);
}

function exitHTML(ep) {
  const order = Object.keys(ep).sort((a, b) => ep[b].pctMax - ep[a].pctMax);
  return `<p class="small muted">Projeções das televisões (RTP/Católica, SIC/ICS-ISCTE, TVI-CNN/Pitagórica) às 20h00, após o fecho das urnas nos Açores.</p>
    <table class="t"><thead><tr><th>Partido</th><th>Votos</th><th>Mandatos</th></tr></thead><tbody>${order.map(p => `<tr class="${p === G.playerPartyId ? 'hl' : ''}"><td>${pchip(G.parties[p])}</td><td><b>${fmtPct(ep[p].pctMin, 1)} – ${fmtPct(ep[p].pctMax, 1)}</b></td><td><b>${ep[p].seatsMin} – ${ep[p].seatsMax}</b></td></tr>`).join('')}</tbody></table>`;
}

function drawMap() {
  const el = $('#emap'); if (!el) return;
  renderMap(el, {
    color: d => { if (!counted.includes(d.id)) return '#1e293b'; const r = R.byDistrict[d.id]; const w = Object.keys(r.votes).filter(x => x !== 'out').sort((a, b) => r.votes[b] - r.votes[a])[0]; return G.parties[w]?.color || '#555'; },
    label: d => (counted.includes(d.id) ? Object.entries(R.byDistrict[d.id].seats).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([p, n]) => `${G.parties[p].short} ${n}`).join(' ') : ''),
    tip: d => { if (!counted.includes(d.id)) return `<b>${esc(d.name)}</b><br>Por apurar`; const r = R.byDistrict[d.id]; return `<b>${esc(d.name)}</b> (${d.seats})<br>` + Object.keys(r.seats).filter(p => r.seats[p] > 0).sort((a, b) => r.seats[b] - r.seats[a]).map(p => `${esc(G.parties[p].short)}: ${fmtPct(r.pct[p])} · ${r.seats[p]} mand.`).join('<br>'); },
  });
}

async function runCount() {
  stage = 'contagem';
  while (counted.length < order.length) {
    counted.push(order[counted.length]);
    render(); sfx.type();
    await sleep(fast ? 60 : 650);
  }
  stage = 'final'; sfx.sting(); render();
}

function speech() {
  const me = G.playerPartyId; const seats = R.national.seats; const p = G.parties[me];
  const won = R.mostSeats === me; const majority = (seats[me] || 0) >= 116;
  const head = majority ? `Maioria absoluta! O ${esc(p.short)} elege ${seats[me]} deputados.` : won ? `O ${esc(p.short)} vence as eleições com ${seats[me]} deputados.` : `O ${esc(G.parties[R.mostSeats].short)} vence. O ${esc(p.short)} elege ${seats[me] || 0} deputados.`;
  openModal({
    title: 'Discurso da noite eleitoral', icon: '🎤', closable: false, cls: 'wide',
    body: `<h2 class="title-serif">${head}</h2><p class="muted">Participação: ${fmtPct(R.turnout)}. A sede do partido aguarda as suas palavras.</p>`,
    actions: [
      { label: won ? '🏆 Discurso de vitória e apelo à estabilidade' : '🤝 Felicitar o vencedor e assumir o resultado', cls: 'primary', onClick: () => finish(won ? 0.03 : 0.02) },
      { label: won ? '🔥 Discurso combativo: "O país pediu mudança"' : '💪 Reivindicar vitória moral', onClick: () => finish(won ? 0.01 : -0.02) },
    ],
  });
}

function finish(v) {
  const me = G.playerPartyId; const p = G.parties[me];
  valenceBoost(G, me, v);
  const R0 = R;
  addNews(`${G.parties[R0.mostSeats].short} vence as legislativas com ${R0.national.seats[R0.mostSeats]} deputados; participação de ${fmtPct(R0.turnout)}.`, { tone: 'neutral' });
  postElection(G, R0);
  G.electionResult = null;
  if (p.isCustom && (R0.national.seats[me] || 0) > 0) addNews(`Estreia histórica: o ${p.short} entra no Parlamento com ${R0.national.seats[me]} deputado(s).`, { tone: 'good' });
  autosave();
  go('parliament', { mode: 'instalacao' });
}

const handlers = {
  vote: () => { stage = 'boca'; sfx.jingle(); render(); },
  count: () => runCount(),
  fast: () => { fast = true; },
  abroad: () => { counted = counted.concat(['europa', 'fora']); stage = 'emigracao'; sfx.bell(); render(); },
  speech: () => speech(),
};
export function leave() { clearTimeout(timer); }
export { DISTRICT_BY_ID, clamp };
