// Quartel-general de campanha
import { G, addNews } from '../../core/state.js';
import { DISTRICTS, DISTRICT_BY_ID } from '../../data/districts.js';
import { MINISTRIES } from '../../data/ministries.js';
import * as CAMP from '../../data/campaign.js';
import { ACTIONS, VENUES, canDo, useAction, gaffeCheck, resolveVisita, resolveFundraising, internalPoll, endCampaignTurn, pendingDebates, debateAvailable, isOfficial, localBoost, awarenessBoost, valenceBoost, spend, currentTurn } from '../../sim/campaign.js';
import { nationalShares } from '../../sim/electorate.js';
import { projectSeats } from '../../sim/election.js';
import { pollAverage } from '../../sim/polls.js';
import { checkParity, createPerson, listSize, enforceParity } from '../../sim/candidates.js';
import { applyEffects } from '../../sim/effects.js';
import { campaignEvents } from '../../ai/eventgen.js';
import { uiRoot, $ } from '../dom.js';
import { go, hudHTML, newsTicker, bindScreen, autosave } from '../app.js';
import { renderMap } from '../map.js';
import { logoImg, portrait, pchip, bar, lineChart, hemicycleSVG, seatsLegend, openModal, toast, alertBox, confirmBox, effectTags, ideologyBars } from '../components.js';
import { showEvents } from '../eventsui.js';
import * as cal from '../../core/calendar.js';
import { esc, fmtPct, fmtEur, fmtNum, clamp, withAlpha } from '../../core/util.js';
import { rng } from '../../core/rng.js';
import { sfx } from '../../audio/sfx.js';

let tab = 'polls', mapMode = 'proj', sel = null;

export function enter(params = {}) {
  sel = G.campaign.lastDistrict || G.people[G.parties[G.playerPartyId].leaderId]?.home || 'lisboa';
  render();
  if (params.intro) intro();
  if (params.after) toast(params.after, 'good');
}
export function refresh() { render(); }

function intro() {
  const p = G.parties[G.playerPartyId];
  const L = G.people[p.leaderId];
  openModal({
    title: `Bem-vindo à campanha, ${esc(L.name)}`, icon: '🗳️', cls: 'wide', body: `<div class="row" style="gap:16px;align-items:flex-start">${portrait(L, 90, p.color)}<div>
    <p>${esc(G.news[G.news.length - 1]?.headline || '')}</p>
    <p>Tem <b>${G.campaign.turns.length} turnos</b> até ao dia das eleições (${cal.longDate(G.electionDate)}): semanas de pré-campanha e, nas duas últimas semanas, a <b>campanha oficial</b> em blocos de dois dias.</p>
    <ul class="small"><li>Cada turno tem <b>ações</b> limitadas e a energia do líder é finita.</li><li>Os <b>debates televisivos</b> estão agendados — prepare-se.</li><li>Entregue as <b>listas de candidatos</b> até ${cal.mediumDate(G.campaign.listsDeadline)} (Lei da Paridade).</li><li>Selecione um círculo no mapa para ações locais.</li></ul>
    ${p.isCustom ? '<p class="warn small">O seu partido é desconhecido: a <b>notoriedade</b> é o seu maior inimigo. Debates, cartazes e redes sociais são essenciais.</p>' : `<p class="small muted">Ponto de partida: ${fmtPct(p.pct2025)} e ${p.seats} deputados em 2025.</p>`}</div></div>`,
    actions: [{ label: 'Vamos a isso!', cls: 'primary' }],
  });
}

function stats() {
  const { shares, byDistrict } = nationalShares(G);
  const proj = projectSeats(G);
  return { shares, byDistrict, seats: proj.seats };
}

function render() {
  const C = G.campaign, p = G.parties[G.playerPartyId];
  const S = stats();
  const avg = pollAverage(G, 3);
  const daysLeft = cal.diffDays(G.date, G.electionDate);
  const t = currentTurn(G);
  const debates = pendingDebates(G);
  const root = uiRoot();
  root.innerHTML = `<div class="screen bg">${hudHTML([
    { k: 'Faltam', v: `${daysLeft} dias` },
    { k: t.kind === 'oficial' ? 'Campanha oficial' : 'Pré-campanha', v: `Turno ${C.turn + 1}/${C.turns.length}` },
    { k: 'Fundos', v: fmtEur(C.money), cls: C.money < 5000 ? 'bad' : '' },
    { k: 'Ações', v: `<span class="dots">${Array.from({ length: C.apMax }, (_, i) => `<i class="${i < C.ap ? 'on' : ''}"></i>`).join('')}</span>` },
    { k: 'Energia', v: `${Math.round(C.energy)}%`, cls: C.energy < 30 ? 'bad' : '' },
    { k: 'Sondagens', v: fmtPct(avg[p.id] || 0) },
    { k: 'Projeção', v: `${S.seats[p.id] || 0} dep.` },
    ...(p.isCustom ? [{ k: 'Notoriedade', v: fmtPct((p.awareness || 0) * 100, 0) }] : []),
  ])}
  <main class="layout">
    <div class="colp">
      <div class="panel col grow" style="min-height:0"><div class="panel-h"><h3>Mapa eleitoral</h3><div class="row">${[['proj', 'Projeção'], ['apoio', 'O meu apoio'], ['camp', 'Campanha'], ...(C.internalPoll ? [['interna', 'Sond. interna']] : [])].map(([k, l]) => `<button class="tab ${mapMode === k ? 'on' : ''}" data-act="mapMode" data-k="${k}">${l}</button>`).join('')}</div></div>
        <div id="map" class="grow" style="min-height:0;padding:6px"></div></div>
      <div class="panel">${districtPanel(S)}</div>
    </div>
    <div class="colp">
      ${debates.length ? `<div class="panel" style="border-color:var(--gold)"><div class="panel-b row"><span style="font-size:30px">📺</span><div class="grow"><b>${esc(debates[0].title)}</b><div class="small muted">Debate agendado para este turno. A ausência é muito penalizada.</div></div><button class="btn gold pulse" data-act="debate" data-id="${debates[0].id}">Entrar no estúdio</button></div></div>` : ''}
      <div class="panel col grow" style="min-height:0"><div class="panel-h"><h3>Agenda de campanha</h3><span class="small muted">${cal.longDate(G.date)}</span></div>
        <div class="panel-b scroll grow"><div class="actions-grid">${ACTIONS.map(a => { const c = canDo(G, a); return `<div class="action ${c.ok ? '' : 'off'}" data-act="action" data-id="${a.id}" title="${esc(c.ok ? a.desc : c.why)}"><span class="ic">${a.icon}</span><b>${a.label}</b><span>${a.district ? '📍 ' + esc(DISTRICT_BY_ID[sel].name) + ' · ' : ''}${a.cost ? fmtEur(a.cost) + ' · ' : ''}${a.ap ? a.ap + ' ação' : 'grátis'}</span></div>`; }).join('')}</div>
        ${C.prep ? `<div class="small gold" style="margin-top:8px">📚 Preparação para debate: nível ${C.prep}</div>` : ''}</div>
        <div class="panel-b" style="border-top:1px solid var(--line)"><button class="btn primary lg block" data-act="endTurn">${C.turn === C.turns.length - 1 ? 'Terminar campanha → Dia de reflexão' : t.kind === 'oficial' ? 'Terminar estes dois dias ⏭' : 'Terminar a semana ⏭'}</button></div>
      </div>
    </div>
    <div class="colp"><div class="panel col grow" style="min-height:0">
      <div class="tabs">${[['polls', '📊 Sondagens'], ['news', '📰 Notícias'], ['lists', '📋 Listas'], ['shadow', '🏛️ Governo-sombra'], ['debates', '📺 Debates']].map(([k, l]) => `<button class="tab ${tab === k ? 'on' : ''}" data-act="tab" data-k="${k}">${l}</button>`).join('')}</div>
      <div class="panel-b scroll grow">${tabHTML(S)}</div></div></div>
  </main>${newsTicker()}</div>`;
  drawMap(S);
  bindScreen(root, handlers);
}

function drawMap(S) {
  const pid = G.playerPartyId, p = G.parties[pid];
  const winner = d => { const s = S.byDistrict[d.id]; return Object.keys(s).filter(x => x !== 'out').sort((a, b) => s[b] - s[a])[0]; };
  renderMap($('#map'), {
    selected: sel,
    color: d => {
      if (mapMode === 'proj') return G.parties[winner(d)]?.color || '#334155';
      return p.color;
    },
    opacity: d => {
      if (mapMode === 'proj') { const s = S.byDistrict[d.id]; const o = Object.values(s).sort((a, b) => b - a); return clamp(0.45 + (o[0] - o[1]) * 4, 0.45, 1); }
      if (mapMode === 'apoio') return clamp((S.byDistrict[d.id][pid] || 0) * 2.6, 0.06, 1);
      if (mapMode === 'camp') return clamp((G.districts[d.id].camp[pid] || 0) * 3 + 0.05, 0.05, 1);
      if (mapMode === 'interna') return clamp((G.campaign.internalPoll.byDistrict[d.id][pid] || 0) / 38, 0.06, 1);
      return 1;
    },
    label: d => (d.abroad ? '' : String(d.seats)),
    tip: d => { const s = S.byDistrict[d.id]; const top = Object.keys(s).filter(x => x !== 'out').sort((a, b) => s[b] - s[a]).slice(0, 4); return `<b>${esc(d.name)}</b> · ${d.seats} mandatos<br>${top.map(x => `${esc(G.parties[x].short)}: ${fmtPct(s[x] * 100)}`).join('<br>')}<br><span class="muted">O seu partido: ${fmtPct((s[pid] || 0) * 100)}</span>`; },
    onClick: did => { sel = did; G.campaign.lastDistrict = did; sfx.click(); render(); },
  });
}

function districtPanel(S) {
  const d = DISTRICT_BY_ID[sel]; const s = S.byDistrict[sel]; const pid = G.playerPartyId;
  const top = Object.keys(s).filter(x => x !== 'out').sort((a, b) => s[b] - s[a]).slice(0, 5);
  const head = G.lists[pid]?.[sel]?.[0] ? G.people[G.lists[pid][sel][0]] : null;
  return `<div class="panel-h"><h3>📍 ${esc(d.name)} — ${d.seats} mandatos</h3><span class="small muted">${fmtNum(d.registered)} eleitores</span></div>
    <div class="panel-b"><div class="grid2"><div>${top.map(x => `<div class="meter-row">${pchip(G.parties[x])}${bar(s[x] * 100, 45, G.parties[x].color)}<span style="width:46px" class="right small">${fmtPct(s[x] * 100)}</span></div>`).join('')}</div>
    <div class="small"><div class="muted tiny">TEMAS LOCAIS</div>${d.issues.map(i => `<span class="tag" style="margin:2px">${esc(i)}</span>`).join('')}<div class="muted tiny" style="margin-top:8px">CABEÇA DE LISTA</div>${head ? `<div class="row">${portrait(head, 28, G.parties[pid].color)}<b>${esc(head.name)}</b></div>` : '<span class="bad">Sem lista</span>'}
    <div class="muted tiny" style="margin-top:8px">O SEU APOIO · 2025</div><b>${fmtPct((s[pid] || 0) * 100)}</b> <span class="muted">· ${fmtPct(d.results2025[pid] || 0)}</span></div></div></div>`;
}

function tabHTML(S) {
  const pid = G.playerPartyId;
  if (tab === 'polls') {
    const recent = G.polls.slice(-12);
    const top = Object.keys(S.shares).filter(x => x !== 'out').sort((a, b) => S.shares[b] - S.shares[a]).slice(0, 7);
    if (!top.includes(pid)) top.push(pid);
    const last = G.polls[G.polls.length - 1];
    return `<h4 class="small muted">EVOLUÇÃO DAS SONDAGENS</h4>${lineChart(top.map(x => ({ color: G.parties[x].color, bold: x === pid, points: recent.map(p => p.results[x] || 0) })), { labels: [cal.shortDate(recent[0].date), cal.shortDate(recent[recent.length - 1].date)] })}
      <div class="legend">${top.map(x => pchip(G.parties[x])).join('')}</div><div class="sep"></div>
      <h4 class="small muted">ÚLTIMA SONDAGEM — ${esc(last.pollster)} (n=${last.n}, ±${last.moe}%)</h4>
      <table class="t"><tbody>${Object.keys(last.results).filter(x => x !== 'out').sort((a, b) => last.results[b] - last.results[a]).slice(0, 10).map(x => `<tr class="${x === pid ? 'hl' : ''}"><td>${pchip(G.parties[x])}</td><td>${bar(last.results[x], 40, G.parties[x].color)}</td><td class="right"><b>${fmtPct(last.results[x])}</b></td></tr>`).join('')}</tbody></table>
      <div class="sep"></div><h4 class="small muted">PROJEÇÃO DE MANDATOS (MÉTODO DE D'HONDT)</h4>${hemicycleSVG(G, S.seats, { width: 320 })}${seatsLegend(G, S.seats)}`;
  }
  if (tab === 'news') return G.news.slice(0, 40).map(n => `<div class="news-item ${n.tone}"><div class="d">${cal.shortDate(n.date)}</div><b>${esc(n.headline)}</b></div>`).join('');
  if (tab === 'lists') {
    const C = G.campaign; const lists = G.lists[pid] || {};
    return `<div class="row between"><div><b>Listas de candidatos</b><div class="small muted">Prazo: ${cal.mediumDate(C.listsDeadline)} ${C.listsSubmitted ? '<span class="tag good">Entregues</span>' : ''}</div></div>${!C.listsSubmitted ? '<button class="btn sm gold" data-act="submitLists">Entregar nos tribunais</button>' : ''}</div><div class="sep"></div>
      <table class="t"><thead><tr><th>Círculo</th><th>Cabeça de lista</th><th>Paridade</th><th></th></tr></thead><tbody>${DISTRICTS.filter(d => lists[d.id]).map(d => { const l = lists[d.id]; const chk = checkParity(G, l, d.seats); const h0 = G.people[l[0]]; return `<tr><td>${esc(d.name)} <span class="tiny muted">(${d.seats})</span></td><td class="small">${esc(h0?.name || '—')}</td><td>${chk.ok ? '<span class="tag good">OK</span>' : '<span class="tag bad">!</span>'}</td><td><button class="btn sm" data-act="editList" data-d="${d.id}" ${C.listsSubmitted ? 'disabled' : ''}>Editar</button></td></tr>`; }).join('')}</tbody></table>`;
  }
  if (tab === 'shadow') {
    const p = G.parties[pid]; const sc = p.shadowCabinet || (p.shadowCabinet = {});
    return `<p class="small muted">Anuncie a equipa que levará para o Governo. Figuras credíveis reforçam a imagem de competência.</p>
      <div class="row">${portrait(G.people[p.leaderId], 40, p.color)}<div><b>${esc(G.people[p.leaderId].name)}</b><div class="tiny muted">Candidato a Primeiro-Ministro</div></div></div><div class="sep"></div>
      ${MINISTRIES.map(m => { const cur = sc[m.id] ? G.people[sc[m.id]] : null; return `<div class="row" style="margin-bottom:6px"><span class="small grow">${esc(m.name)}</span><span class="small ${cur ? '' : 'muted'}">${esc(cur?.name || '— por definir —')}</span><button class="btn sm ghost" data-act="pickMinister" data-m="${m.id}">✎</button></div>`; }).join('')}`;
  }
  if (tab === 'debates') {
    return G.campaign.debates.map(d => { const t = G.campaign.turns[d.turn]; const avail = debateAvailable(G, d); return `<div class="card" style="margin-bottom:8px"><div class="row between"><b class="small">${esc(d.title)}</b><span class="tag">${cal.shortDate(t.date)}</span></div>
      <div class="small muted">${d.participants.map(x => esc(G.parties[x]?.short)).join(' · ')}</div>
      ${d.done ? (d.result?.absent ? '<span class="tag bad">Faltou</span>' : d.result?.notInvited ? '<span class="tag">Sem convite</span>' : `<span class="tag ${d.result.winner === pid ? 'good' : 'warn'}">Vencedor: ${esc(G.parties[d.result.winner].short)}</span>`) : d.conditional ? `<span class="tag ${avail ? 'good' : 'warn'}">${avail ? 'Convite garantido' : `Convite se ≥ ${d.conditional.minPoll}% nas sondagens`}</span>` : '<span class="tag blue">Agendado</span>'}</div>`; }).join('');
  }
  return '';
}

// ---------- Ações ----------
async function doAction(a) {
  const C = G.campaign; const did = sel; const d = DISTRICT_BY_ID[did];
  const chk = canDo(G, a);
  if (!chk.ok) { toast(chk.why, 'bad'); return; }
  const pid = G.playerPartyId, p = G.parties[pid];
  switch (a.id) {
    case 'arruada': {
      const town = await choose(`Arruada — ${d.name}`, d.towns.map(t => ({ label: t, value: t })), 'Escolha a cidade');
      if (!town) return;
      useAction(G, a); C.lastDistrict = did;
      go('arruada', { did, town }); return;
    }
    case 'comicio': {
      const r = await rallyDialog(d); if (!r) return;
      useAction(G, a); spend(G, r.venue.cost); C.lastDistrict = did;
      go('comicio', { did, venue: r.venue, themes: r.themes }); return;
    }
    case 'cartazes': useAction(G, a); C.lastDistrict = did; go('cartazes', { did }); return;
    case 'visita': {
      const types = CAMP.VISIT_TYPES || [];
      const v = await choose(`Visita em ${d.name}`, types.map(t => ({ label: `${t.icon || ''} ${t.label}`, value: t, desc: t.place })), 'Escolha o local da visita');
      if (!v) return;
      useAction(G, a); resolveVisita(G, did, v); toast(`Visita: ${esc(v.label)} em ${esc(d.capital)}.`, 'good'); break;
    }
    case 'entrevista': { const ok = await interview(); if (!ok) return; useAction(G, a); break; }
    case 'redes': {
      const opts = CAMP.SOCIAL_CONTENT || [];
      const c = await choose('Campanha digital', opts.map(o => ({ label: `${o.label} — ${fmtEur(o.cost)}`, value: o, desc: o.desc })), 'O que publicar?');
      if (!c) return;
      if (c.cost > C.money) { toast('Fundos insuficientes.', 'bad'); return; }
      useAction(G, a); spend(G, c.cost);
      awarenessBoost(G, pid, 0.02 + (c.youth || 0.5) * 0.03); valenceBoost(G, pid, 0.01);
      if (rng.chance(c.risk || 0.1)) { valenceBoost(G, pid, -0.06); addNews(`Publicação do ${p.short} nas redes gera polémica.`, { tone: 'bad' }); toast('A publicação gerou polémica nas redes.', 'bad'); }
      else { if (rng.chance(0.2)) { awarenessBoost(G, pid, 0.03); toast('Vídeo viral! Milhões de visualizações.', 'good'); } else toast('Campanha digital lançada.', 'good'); }
      break;
    }
    case 'angariacao': { useAction(G, a); const v = resolveFundraising(G); toast(`Angariados ${fmtEur(v)}.`, 'good'); sfx.coin(); break; }
    case 'preparar': useAction(G, a); C.prep = Math.min(3, C.prep + 1); toast('A equipa preparou dossiês e ensaios para o debate.', 'good'); break;
    case 'programa': useAction(G, a); C.programPublished = true; valenceBoost(G, pid, 0.06); awarenessBoost(G, pid, 0.04); addNews(`${p.short} apresenta programa eleitoral com ${p.program?.length || 'várias'} medidas-bandeira.`, { tone: 'good' }); toast('Programa apresentado com boa cobertura mediática.', 'good'); break;
    case 'mobilizar': useAction(G, a); C.mobilization[did] = (C.mobilization[did] || 0) + 0.8; localBoost(G, pid, did, 0.05); toast(`Máquina de mobilização no terreno em ${esc(d.name)}.`, 'good'); break;
    case 'sondagem': useAction(G, a); internalPoll(G); mapMode = 'interna'; toast('Sondagem interna recebida. Veja o mapa.', 'good'); break;
    case 'descanso': useAction(G, a); toast('O líder recuperou energias.', 'good'); break;
  }
  if (a.id !== 'descanso' && a.id !== 'sondagem') gaffeCheck(G);
  render();
}

function choose(title, options, subtitle = '') {
  return new Promise(res => {
    const m = openModal({ title, onClose: v => res(v ?? null), body: `${subtitle ? `<p class="muted small">${subtitle}</p>` : ''}${options.map((o, i) => `<button class="option" data-i="${i}"><b>${esc(o.label)}</b>${o.desc ? `<small>${esc(o.desc)}</small>` : ''}</button>`).join('')}` });
    m.el.addEventListener('click', e => { const b = e.target.closest('.option'); if (b) { m.close(options[+b.dataset.i].value); } });
  });
}

function rallyDialog(d) {
  return new Promise(res => {
    const themes = (CAMP.RALLY_THEMES || []).slice();
    let venue = VENUES[0], pickedT = [];
    const body = () => `<h4 class="small muted">RECINTO</h4>${VENUES.map((v, i) => `<label class="check option" style="display:flex"><input type="radio" name="ven" value="${i}" ${v === venue ? 'checked' : ''}> <b class="grow">${v.label}</b><span class="small muted">${fmtNum(v.capacity)} lugares · ${fmtEur(v.cost)}</span></label>`).join('')}
      <h4 class="small muted">TEMAS DO DISCURSO (até 3)</h4><div class="row wrap">${themes.map((t, i) => `<button class="btn sm ${pickedT.includes(t) ? 'gold' : ''}" data-t="${i}">${esc(t.label)}</button>`).join('')}</div>
      <p class="small muted">Temas locais em ${esc(d.name)}: ${d.issues.map(esc).join(', ')}.</p>`;
    const m = openModal({ title: `Comício em ${esc(d.capital)}`, icon: '🎤', body: body(), onClose: v => res(v || null), actions: [{ label: 'Cancelar' }, { label: 'Organizar comício', cls: 'primary', onClick: (close) => { if (venue.cost > G.campaign.money) { toast('Fundos insuficientes.', 'bad'); return false; } if (!pickedT.length) { toast('Escolha pelo menos um tema.', 'bad'); return false; } close({ venue, themes: pickedT }); return false; } }] });
    m.el.addEventListener('click', e => { const t = e.target.closest('[data-t]'); if (t) { const th = themes[+t.dataset.t]; if (pickedT.includes(th)) pickedT = pickedT.filter(x => x !== th); else if (pickedT.length < 3) pickedT.push(th); m.body.innerHTML = body(); } });
    m.el.addEventListener('change', e => { if (e.target.name === 'ven') { venue = VENUES[+e.target.value]; } });
  });
}

async function interview() {
  const qs = rng.sample(CAMP.INTERVIEW_QUESTIONS || [], 2);
  if (!qs.length) return false;
  const channel = rng.pick(CAMP.TV_CHANNELS || [{ name: 'RTP1' }]);
  for (const q of qs) {
    const ans = await new Promise(res => {
      const m = openModal({ title: `Entrevista — ${esc(channel.name)}`, icon: '🎙️', closable: false, body: `<p style="font-size:16px" class="title-serif">“${esc(q.question)}”</p>${q.options.map((o, i) => `<button class="option" data-i="${i}"><b>${esc(o.label)}</b><small>Risco: ${o.risk > 0.5 ? 'alto' : o.risk > 0.2 ? 'médio' : 'baixo'}</small></button>`).join('')}` });
      m.el.addEventListener('click', e => { const b = e.target.closest('.option'); if (b) { m.close(); res(q.options[+b.dataset.i]); } });
    });
    if (rng.chance(ans.risk || 0)) { valenceBoost(G, G.playerPartyId, -0.06); toast('A resposta correu mal e está a ser muito criticada.', 'bad'); }
    else { applyEffects(G, ans.effects || {}); valenceBoost(G, G.playerPartyId, 0.02); toast('Boa resposta.', 'good'); }
  }
  awarenessBoost(G, G.playerPartyId, 0.025);
  addNews(`${G.people[G.parties[G.playerPartyId].leaderId].name} entrevistado na ${channel.name}.`, { tone: 'neutral' });
  return true;
}

function editList(did) {
  const d = DISTRICT_BY_ID[did]; const pid = G.playerPartyId; const p = G.parties[pid];
  let list = G.lists[pid][did].slice();
  const figures = Object.values(G.people).filter(x => x.partyId === pid && !x.generated && !list.includes(x.id));
  const body = () => { const chk = checkParity(G, list, d.seats); return `<p class="small muted">Os primeiros ${d.seats} são candidatos efetivos; os restantes, suplentes. Regra: ≥40% de cada sexo e nunca 3 seguidos do mesmo sexo.</p>
    ${chk.ok ? '<div class="tag good">Lista conforme a Lei da Paridade</div>' : chk.problems.map(x => `<div class="small bad">⚠ ${esc(x)}</div>`).join('')}
    <table class="t" style="margin-top:8px"><tbody>${list.map((id, i) => { const x = G.people[id]; return `<tr class="${i < d.seats ? '' : 'dim'}"><td>${i + 1}.</td><td>${i === d.seats ? '<span class="tag">Suplentes ↓</span> ' : ''}<input class="input" style="padding:4px 8px" data-name="${i}" value="${esc(x.name)}"></td><td><button class="btn sm ghost" data-g="${i}">${x.gender === 'f' ? '♀' : '♂'}</button></td><td><button class="btn sm ghost" data-up="${i}">▲</button><button class="btn sm ghost" data-down="${i}">▼</button></td></tr>`; }).join('')}</tbody></table>
    ${figures.length ? `<div class="sep"></div><div class="small muted">Figuras do partido disponíveis:</div><div class="row wrap">${figures.map(f => `<button class="btn sm" data-fig="${f.id}">+ ${esc(f.name)}</button>`).join('')}</div>` : ''}
    <div class="row" style="margin-top:8px"><button class="btn sm" data-auto>Ordenar automaticamente (paridade)</button></div>`; };
  const m = openModal({ title: `Lista de ${esc(p.short)} — ${esc(d.name)}`, icon: '📋', cls: 'wide', body: body(), actions: [{ label: 'Guardar lista', cls: 'primary', onClick: () => { G.lists[pid][did] = list; render(); } }] });
  m.el.addEventListener('change', e => { const i = e.target.dataset.name; if (i != null) G.people[list[+i]].name = e.target.value.trim() || G.people[list[+i]].name; });
  m.el.addEventListener('click', e => {
    const t = e.target.closest('button'); if (!t) return;
    if (t.dataset.g != null) { const x = G.people[list[+t.dataset.g]]; x.gender = x.gender === 'f' ? 'm' : 'f'; }
    if (t.dataset.up != null) { const i = +t.dataset.up; if (i > 0) [list[i - 1], list[i]] = [list[i], list[i - 1]]; }
    if (t.dataset.down != null) { const i = +t.dataset.down; if (i < list.length - 1) [list[i + 1], list[i]] = [list[i], list[i + 1]]; }
    if (t.dataset.fig) { list.splice(1, 0, t.dataset.fig); list.length = Math.max(listSize(d.seats), list.length - 1); figures.splice(figures.findIndex(f => f.id === t.dataset.fig), 1); }
    if (t.dataset.auto != null) list = enforceParity(G, list);
    m.body.innerHTML = body();
  });
}

function pickMinister(mid) {
  const pid = G.playerPartyId; const p = G.parties[pid];
  const m0 = MINISTRIES.find(x => x.id === mid);
  const cands = Object.values(G.people).filter(x => x.partyId === pid && x.id !== p.leaderId && !x.generated).concat(Object.values(G.people).filter(x => x.independent));
  const m = openModal({ title: `Ministério: ${esc(m0.name)}`, icon: '🏛️', body: `${cands.map(c => `<button class="option" data-id="${c.id}"><b>${esc(c.name)}</b><small>${c.expertise === mid ? '⭐ Especialista na área · ' : ''}Gestão ${c.traits?.gestao ?? '?'} · Experiência ${c.traits?.experiencia ?? '?'}</small></button>`).join('')}<button class="btn" data-new>➕ Convidar um(a) independente reputado(a)</button>` });
  m.el.addEventListener('click', e => {
    const b = e.target.closest('[data-id]');
    if (b) { p.shadowCabinet[mid] = b.dataset.id; m.close(); render(); return; }
    if (e.target.closest('[data-new]')) { const id = createPerson(G, { partyId: null, role: 'independente', traits: { carisma: 50 + rng.int(0, 20), debate: 50 + rng.int(0, 15), gestao: 65 + rng.int(0, 25), experiencia: 60 + rng.int(0, 30) } }); G.people[id].independent = true; G.people[id].expertise = mid; p.shadowCabinet[mid] = id; valenceBoost(G, pid, 0.01); m.close(); render(); }
  });
}

async function endTurn() {
  const C = G.campaign;
  const debates = pendingDebates(G);
  if (debates.length && !(await confirmBox('Faltar ao debate?', `Tem o debate "${esc(debates[0].title)}" agendado. Faltar é muito penalizador (cadeira vazia).`, 'Faltar mesmo assim', 'Voltar'))) return;
  if (C.ap > 0 && !debates.length && !(await confirmBox('Ainda tem ações', `Restam ${C.ap} ações neste turno. Terminar mesmo assim?`, 'Terminar'))) return;
  const r = endCampaignTurn(G);
  autosave();
  if (r.finished) { go('election'); return; }
  sfx.sting();
  render();
  const evs = campaignEvents(G);
  if (evs.length) { await showEvents(G, evs); render(); }
  const nd = pendingDebates(G);
  if (nd.length) toast(`📺 Hoje: ${esc(nd[0].title)}`, '');
}

const handlers = {
  tab: el => { tab = el.dataset.k; render(); },
  mapMode: el => { mapMode = el.dataset.k; render(); },
  action: el => doAction(ACTIONS.find(a => a.id === el.dataset.id)),
  endTurn: () => endTurn(),
  debate: el => { const d = G.campaign.debates.find(x => x.id === el.dataset.id); go('debate', { debateId: d.id }); },
  editList: el => editList(el.dataset.d),
  submitLists: async () => { const bad = DISTRICTS.filter(d => G.lists[G.playerPartyId][d.id] && !checkParity(G, G.lists[G.playerPartyId][d.id], d.seats).ok); if (bad.length) { await alertBox('Listas irregulares', `O tribunal rejeitaria as listas de: ${bad.map(d => d.name).join(', ')}. Corrija-as (ou use "Ordenar automaticamente").`, '⚖️'); return; } G.campaign.listsSubmitted = true; addNews(`${G.parties[G.playerPartyId].short} entrega listas de candidatos em todos os círculos.`, { tone: 'neutral' }); toast('Listas entregues nos tribunais.', 'good'); render(); },
  pickMinister: el => pickMinister(el.dataset.m),
};
export function leave() { }
export { effectTags, ideologyBars, logoImg, isOfficial, withAlpha };
