// Assembleia da República (hemiciclo 3D)
import { G, addNews } from '../../core/state.js';
import { Engine } from '../../three/engine.js';
import { createHemicycle } from '../../three/hemicycle.js';
import { COMMITTEES, MINISTRIES } from '../../data/ministries.js';
import { MAJORITY } from '../../data/districts.js';
import { seatData, electOfficer, predictOfficer, vpProposers, committeeDraft, aiCommitteePick, committeeMembership, voteMotion } from '../../sim/parliament.js';
import { pendingVotes, predictBill, resolveVote, STAGE_LABEL, TYPE_LABEL, DONE_STAGES } from '../../sim/legislation.js';
import { billDealOptions, applyBillDeal } from '../../sim/negotiation.js';
import { resolvePendingMotion } from '../../sim/turn.js';
import { uiRoot, $ } from '../dom.js';
import { go, bindScreen, autosave } from '../app.js';
import { logoImg, portrait, pchip, bar, openModal, toast, showTip, hideTip, alertBox, ideologyBars } from '../components.js';
import { esc, fmtNum, romanize, clamp, sleep } from '../../core/util.js';
import * as cal from '../../core/calendar.js';
import { rng } from '../../core/rng.js';
import { sfx } from '../../audio/sfx.js';

export const uses3D = true;
let hemi = null, mode = 'normal', tab = 'agenda', caption = '', busy = false, inst = null, draft = null, selBill = null;

const VOTE_LABEL = { favor: 'A favor', contra: 'Contra', abstencao: 'Abstenção' };

function govList() {
  const g = G.government; if (!g || !g.ministers) return [];
  const pm = G.people[g.pm];
  const list = [{ name: pm?.name || 'PM', color: G.parties[g.pmPartyId]?.color || '#888' }];
  for (const m of MINISTRIES) { const pid = g.ministers[m.id]; const p = G.people[pid]; if (p) list.push({ name: p.name, color: G.parties[p.partyId]?.color || '#94a3b8' }); }
  return list.slice(0, 18);
}

export function enter(params = {}) {
  mode = params.mode || 'normal';
  tab = params.tab || 'agenda';
  caption = ''; busy = false; selBill = params.billId || null;
  if (mode === 'instalacao') inst = { step: 'par', round: 1, cand: null, result: null, vps: null };
  const seats = seatData(G);
  try {
    hemi = createHemicycle({
      seats, government: mode === 'instalacao' ? [] : govList(), interactive: true,
      onHover: (i, x, y) => { if (i == null) { hideTip(); return; } const s = seats[i]; if (s) showTip(`<b>${esc(s.personName)}</b><br>${esc(G.parties[s.partyId]?.short || '')} · ${esc(s.district)}`, x, y); },
      onClick: () => { },
    });
    Engine.setScene(hemi);
    hemi.setCamera('overview', false);
  } catch (e) { console.error(e); hemi = null; }
  render();
}
export function refresh() { render(); }

function render() {
  const P = G.parliament; const par = P.par ? G.people[P.par.personId] : null;
  const root = uiRoot();
  root.innerHTML = `<div class="screen overlay3d">
    <div class="ov-top panel" style="top:10px"><span style="font-size:20px">🏛️</span><div><b>Assembleia da República</b><div class="tiny muted">${romanize(G.legislature)} Legislatura · ${cal.mediumDate(G.date)}</div></div>
      <span class="tag">${par ? 'PAR: ' + esc(par.name) : 'Presidente por eleger'}</span>
      <div class="row">${['overview', 'mesa', 'tribuna', 'galeria', 'bancadas'].map(c => `<button class="btn sm ghost" data-act="cam" data-c="${c}" title="${c}">${{ overview: '🔭', mesa: '🪑', tribuna: '🎙️', galeria: '👥', bancadas: '💺' }[c]}</button>`).join('')}</div>
      ${mode !== 'instalacao' ? '<button class="btn sm" data-act="back">← Sair</button>' : ''}</div>
    <div class="ov-left panel" style="top:78px;max-height:calc(100% - 92px);width:380px">${mode === 'instalacao' ? installHTML() : mainHTML()}</div>
    <div class="ov-right panel" style="top:78px;width:300px"><div class="panel-h"><h3>Composição</h3><span class="small">${Object.values(P.seats).reduce((s, x) => s + x, 0)} deputados</span></div><div class="panel-b scroll" style="max-height:60vh">${Object.keys(P.seats).filter(p => P.seats[p] > 0).sort((a, b) => P.seats[b] - P.seats[a]).map(pid => { const p = G.parties[pid]; const inGov = G.government && !G.government.caretaker && G.government.coalition.includes(pid); return `<div class="row interactive" style="margin-bottom:7px;cursor:pointer" data-act="hl" data-p="${pid}">${logoImg(p, 28)}<div class="grow"><b class="small">${esc(p.short)}</b> ${inGov ? '<span class="tag gold">Governo</span>' : ''}${pid === G.playerPartyId ? '<span class="tag blue">Você</span>' : ''}${bar(P.seats[pid], 120, p.color)}</div><b>${P.seats[pid]}</b></div>`; }).join('')}<div class="tiny muted">Maioria absoluta: ${MAJORITY} · Dois terços: 154</div></div></div>
    ${caption ? `<div class="ov-center"><div class="caption panel" style="pointer-events:none">${caption}</div></div>` : ''}
  </div>`;
  bindScreen(root, handlers);
}

// ---------------- Sessão de instalação ----------------
function defaultCandidate(pid) {
  const pref = { ad: 'aguiarbranco', ps: 'assis', ch: 'pachecoamorim', il: 'rocha', livre: 'isabelmendeslopes', cdu: 'antoniofilipe' }[pid];
  if (pref && G.people[pref]) return pref;
  const deps = G.parliament.deputies.filter(d => d.partyId === pid).map(d => G.people[d.personId]).filter(Boolean);
  return (deps.find(x => !x.generated && x.id !== G.parties[pid].leaderId) || deps[1] || deps[0])?.id;
}

function installHTML() {
  const P = G.parliament; const me = G.playerPartyId;
  const largest = Object.keys(P.seats).sort((a, b) => P.seats[b] - P.seats[a])[0];
  if (inst.step === 'par') {
    if (!inst.cand) inst.cand = { personId: defaultCandidate(largest), partyId: largest, consensual: inst.round >= 2 };
    const c = inst.cand; const person = G.people[c.personId];
    const pred = predictOfficer(G, c, inst.deals || {});
    const myDeps = P.deputies.filter(d => d.partyId === me).map(d => G.people[d.personId]).filter(Boolean);
    return `<div class="panel-h"><h3>Sessão de instalação</h3><span class="tag">Escrutínio ${inst.round}</span></div><div class="panel-b scroll">
      <p class="small muted">A primeira reunião da nova Assembleia elege o <b>Presidente da Assembleia da República</b> — a segunda figura do Estado. É preciso a maioria absoluta dos deputados em funções (<b>116 votos</b>), em voto secreto.</p>
      <div class="card"><div class="row">${portrait(person, 48, G.parties[c.partyId].color)}<div class="grow"><b>${esc(person?.name)}</b><div class="small muted">Candidato proposto pelo ${esc(G.parties[c.partyId].short)}</div></div></div>
      <div class="small" style="margin-top:8px">Previsão: <b class="${pred.expected >= MAJORITY ? 'good' : 'bad'}">~${pred.expected} votos</b></div>
      ${Object.entries(pred.byParty).sort((a, b) => P.seats[b[0]] - P.seats[a[0]]).map(([pid, pr]) => `<div class="meter-row">${pchip(G.parties[pid])}${bar(pr * 100, 100, G.parties[pid].color)}<span class="tiny" style="width:36px">${Math.round(pr * 100)}%</span></div>`).join('')}</div>
      ${P.seats[me] ? `<div class="field" style="margin-top:10px"><label>Voto do seu grupo parlamentar</label><select class="input" id="myVote"><option value="favor">A favor</option><option value="contra">Contra / branco</option></select></div>` : ''}
      ${P.seats[me] && c.partyId !== me ? `<details class="small"><summary style="cursor:pointer" class="muted">Apresentar candidato próprio</summary><div class="col" style="margin-top:6px">${myDeps.slice(0, 8).map(d => `<button class="btn sm" data-act="ownCand" data-id="${d.id}">${esc(d.name)}</button>`).join('')}</div></details>` : ''}
      ${c.partyId === me ? '<button class="btn sm ghost" data-act="negPar">🤝 Negociar apoios (rotatividade / vice-presidências)</button>' : ''}
      <button class="btn primary block" style="margin-top:12px" data-act="votePar">🗳️ Proceder à votação</button>
      ${inst.result ? `<div class="sep"></div><div class="${inst.result.elected ? 'good' : 'bad'} small"><b>${inst.result.votes} votos</b> a favor · ${inst.result.blank} brancos/nulos/contra — ${inst.result.elected ? 'eleito!' : 'não atingiu os 116 votos.'}</div>` : ''}
    </div>`;
  }
  if (inst.step === 'vps') {
    if (!inst.vps) inst.vps = vpProposers(G).map(pid => ({ pid, personId: defaultCandidate(pid) === P.par?.personId ? null : defaultCandidate(pid), vote: pid === me ? 'favor' : 'favor', result: null }));
    inst.vps.forEach(v => { if (!v.personId) { const deps = P.deputies.filter(d => d.partyId === v.pid).map(d => d.personId).filter(id => id !== P.par?.personId); v.personId = deps[1] || deps[0]; } });
    return `<div class="panel-h"><h3>Vice-presidentes da Assembleia</h3></div><div class="panel-b scroll">
      <p class="small muted">Os quatro maiores grupos parlamentares propõem um vice-presidente cada. Cada um precisa de 116 votos — e nem sempre são eleitos.</p>
      ${inst.vps.map((v, i) => { const p = G.parties[v.pid]; const pr = predictOfficer(G, { personId: v.personId, partyId: v.pid }); return `<div class="card" style="margin-bottom:8px"><div class="row">${logoImg(p, 30)}<div class="grow"><b class="small">${esc(G.people[v.personId]?.name || '')}</b><div class="tiny muted">${esc(p.short)} · previsão ~${pr.expected} votos</div></div>
        ${v.result ? `<span class="tag ${v.result.elected ? 'good' : 'bad'}">${v.result.votes} votos</span>` : (P.seats[me] && v.pid !== me ? `<select class="input" style="width:110px;padding:4px" data-vp="${i}"><option value="favor">A favor</option><option value="contra">Contra</option></select>` : '')}</div></div>`; }).join('')}
      ${inst.vps.every(v => v.result) ? '<button class="btn gold block" data-act="endInstall">Concluir sessão → Audiências em Belém</button>' : '<button class="btn primary block" data-act="voteVps">🗳️ Votar os vice-presidentes</button>'}
    </div>`;
  }
  return '';
}

async function votePar() {
  const P = G.parliament; const me = G.playerPartyId;
  const deals = { ...(inst.deals || {}) };
  const sel = $('#myVote'); if (sel && P.seats[me]) deals[me] = sel.value;
  caption = 'Escrutínio secreto em curso…'; render(); sfx.bell();
  hemi?.setCamera('overview');
  await sleep(1800);
  const r = electOfficer(G, inst.cand, deals);
  inst.result = r;
  if (r.elected) {
    P.par = { personId: inst.cand.personId, partyId: inst.cand.partyId, votes: r.votes, date: G.date };
    caption = `${esc(G.people[inst.cand.personId].name)} eleito Presidente da Assembleia da República com ${r.votes} votos`;
    addNews(`${G.people[inst.cand.personId].name} (${G.parties[inst.cand.partyId].short}) eleito Presidente da Assembleia da República com ${r.votes} votos.`, { tone: 'neutral' });
    sfx.applause(2.4, 0.8); hemi?.standUp('all'); render();
    await sleep(2600); hemi?.standUp('none'); caption = ''; inst.step = 'vps'; render();
  } else {
    caption = `Sem maioria: ${r.votes} votos. Nova votação.`; sfx.gavel(); render();
    addNews(`Impasse na eleição do Presidente da AR: candidato do ${G.parties[inst.cand.partyId].short} falha com ${r.votes} votos.`, { tone: 'bad' });
    await sleep(2200); caption = '';
    inst.round++;
    if (inst.round === 3 && inst.cand.partyId !== me) {
      const P2 = Object.keys(P.seats).sort((a, b) => P.seats[b] - P.seats[a]);
      inst.cand = { personId: defaultCandidate(P2[0]), partyId: P2[0], consensual: true };
      inst.deals = { [P2[1]]: 'favor' };
      toast(`Acordo de rotatividade entre ${G.parties[P2[0]].short} e ${G.parties[P2[1]].short} para a presidência da AR.`, '');
    } else inst.cand = { ...inst.cand, consensual: true };
    if (inst.round > 5) { inst.cand.consensual = true; inst.deals = Object.fromEntries(Object.keys(P.seats).map(p => [p, 'favor'])); }
    render();
  }
}

async function voteVps() {
  const P = G.parliament; const me = G.playerPartyId;
  document.querySelectorAll('[data-vp]').forEach(s => { inst.vps[+s.dataset.vp].vote = s.value; });
  caption = 'Eleição dos vice-presidentes…'; render(); sfx.bell(); await sleep(1500);
  P.vps = [];
  for (const v of inst.vps) {
    const deals = P.seats[me] ? { [me]: v.pid === me ? 'favor' : v.vote } : {};
    v.result = electOfficer(G, { personId: v.personId, partyId: v.pid }, deals);
    if (v.result.elected) P.vps.push({ personId: v.personId, partyId: v.pid });
    else addNews(`Candidato do ${G.parties[v.pid].short} a vice-presidente da AR chumbado (${v.result.votes} votos).`, { tone: 'bad' });
  }
  caption = ''; render();
}

// ---------------- Modo normal ----------------
function mainHTML() {
  const tabs = [['agenda', '📋 Ordem do dia'], ['bills', '📜 Diplomas'], ['comissoes', '👥 Comissões'], ['grupos', '🏷️ Grupos'], ['mesa', '🪑 Mesa']];
  return `<div class="tabs">${tabs.map(([k, l]) => `<button class="tab ${tab === k ? 'on' : ''}" data-act="tab" data-k="${k}">${l}</button>`).join('')}</div><div class="panel-b scroll" style="min-height:0">${tabBody()}</div>`;
}

function tabBody() {
  const P = G.parliament; const me = G.playerPartyId;
  if (tab === 'agenda') {
    const pv = pendingVotes(G);
    let s = '';
    if (G.pendingMotion) { const M = G.pendingMotion; s += `<div class="card" style="border-color:var(--red);margin-bottom:10px"><b>⚠ Moção de ${M.kind === 'censura' ? 'censura' : M.kind} ao Governo</b><div class="small muted">Apresentada pelo ${esc(G.parties[M.author].short)}. Aprovação exige 116 votos.</div>${P.seats[me] && M.author !== me && !(G.government?.coalition || []).includes(me) ? `<select class="input" id="motionVote" style="margin-top:6px"><option value="favor">Votar a favor</option><option value="contra">Votar contra</option><option value="abstencao">Abster-se</option></select>` : ''}<button class="btn danger block" style="margin-top:8px" data-act="voteMotion">Votar a moção</button></div>`; }
    if (!pv.length && !G.pendingMotion) return s + '<p class="muted small">Não há votações agendadas. Apresente iniciativas no menu Legislar ou avance no tempo.</p>';
    if (selBill && !pv.find(b => b.id === selBill)) selBill = null;
    if (!selBill && pv.length) selBill = pv[0].id;
    s += pv.map(b => `<div class="card click ${b.id === selBill ? 'sel' : ''}" style="margin-bottom:6px" data-act="selBill" data-id="${b.id}"><div class="row between"><b class="small">${esc(b.title)}</b>${logoImg(G.parties[b.authorParty], 22)}</div><div class="tiny muted">${TYPE_LABEL[b.type] || ''} · ${b.pendingVote === 'generalidade' ? 'Generalidade' : b.pendingVote === 'final' ? 'Votação final global' : 'Reapreciação após veto'}${b.byGov ? ' · Governo' : ''}</div></div>`).join('');
    const b = pv.find(x => x.id === selBill);
    if (b) {
      const pred = predictBill(G, b);
      s += `<div class="sep"></div><b>${esc(b.title)}</b><p class="small muted">${esc(b.summary || '')}</p><div class="small">Exige: <b>${esc(pred.required.label)}</b> · Previsão: <b class="${pred.passed ? 'good' : 'bad'}">${pred.passed ? 'aprovação' : 'chumbo'}</b> (${pred.tally.favor}–${pred.tally.contra}–${pred.tally.abstencao})</div>
      <table class="t" style="margin-top:6px"><tbody>${Object.keys(pred.votes).sort((a, c) => P.seats[c] - P.seats[a]).map(pid => `<tr><td>${pchip(G.parties[pid])} <span class="tiny muted">${P.seats[pid]}</span></td><td><span class="tag ${pred.votes[pid] === 'favor' ? 'good' : pred.votes[pid] === 'contra' ? 'bad' : 'warn'}">${VOTE_LABEL[pred.votes[pid]]}</span></td><td class="tiny muted">${esc((pred.details[pid]?.reasons || []).slice(0, 2).join(' · '))}</td></tr>`).join('')}</tbody></table>
      ${P.seats[me] ? `<div class="field" style="margin-top:8px"><label>Voto do seu grupo</label><select class="input" id="myBillVote">${['favor', 'contra', 'abstencao'].map(v => `<option value="${v}" ${pred.votes[me] === v ? 'selected' : ''}>${VOTE_LABEL[v]}</option>`).join('')}</select></div>` : ''}
      ${(b.authorParty === me) ? '<button class="btn block" data-act="negotiate">🤝 Negociar votos</button>' : ''}
      <button class="btn primary block" style="margin-top:8px" data-act="voteBill">🗳️ Votar em plenário</button>`;
    }
    return s;
  }
  if (tab === 'bills') {
    const list = G.bills.slice().reverse().slice(0, 40);
    if (!list.length) return '<p class="muted small">Ainda não há diplomas nesta legislatura.</p>';
    return list.map(b => `<div class="card" style="margin-bottom:6px"><div class="row between"><b class="small">${esc(b.title)}</b>${logoImg(G.parties[b.authorParty], 20)}</div><div class="tiny"><span class="tag ${b.stage === 'promulgada' || b.stage === 'aprovada' ? 'good' : DONE_STAGES.includes(b.stage) ? 'bad' : 'gold'}">${esc(STAGE_LABEL[b.stage] || b.stage)}</span> <span class="muted">${esc(b.history[b.history.length - 1]?.text || '')}</span></div></div>`).join('');
  }
  if (tab === 'comissoes') {
    if (!Object.keys(P.committees).length) {
      if (!draft) return `<p class="small muted">As presidências das ${COMMITTEES.length} comissões permanentes são distribuídas pelos grupos parlamentares segundo o método de D'Hondt, escolhendo cada grupo à vez.</p><button class="btn primary block" data-act="startDraft">Distribuir presidências</button>`;
      const turn = draft.order[draft.i];
      const avail = COMMITTEES.filter(c => !draft.taken[c.id]);
      return `<p class="small">Escolha ${draft.i + 1}/${draft.order.length}: <b>${esc(G.parties[turn].short)}</b></p>${turn === me ? avail.map(c => `<button class="option" data-act="pickCom" data-id="${c.id}"><b class="small">${esc(c.name)}</b><small>${c.short} · relevância ${'★'.repeat(Math.round(c.prestige / 2))}</small></button>`).join('') : '<p class="muted small">A aguardar…</p>'}
        <div class="sep"></div>${Object.entries(draft.taken).map(([cid, pid]) => `<div class="small">${pchip(G.parties[pid])} ${esc(COMMITTEES.find(c => c.id === cid).name)}</div>`).join('')}`;
    }
    return `<table class="t"><thead><tr><th>Comissão</th><th>Presidência</th></tr></thead><tbody>${COMMITTEES.map(c => { const x = P.committees[c.id]; return `<tr><td class="small">${esc(c.name)}</td><td>${x ? pchip(G.parties[x.chairParty]) : '—'}</td></tr>`; }).join('')}</tbody></table><p class="tiny muted">Composição de cada comissão: ${Object.entries(committeeMembership(G)).filter(([, n]) => n).map(([p, n]) => `${G.parties[p].short} ${n}`).join(' · ')} (21 membros)</p>`;
  }
  if (tab === 'grupos') {
    return Object.keys(P.seats).filter(p => P.seats[p] > 0).sort((a, b) => P.seats[b] - P.seats[a]).map(pid => { const p = G.parties[pid]; const g = P.groups[pid]; const L = G.people[g?.leader] || G.people[p.leaderId]; const rel = pid === me ? null : (G.parties[me].relations?.[pid] ?? 0); return `<div class="card" style="margin-bottom:8px"><div class="row">${logoImg(p, 36)}<div class="grow"><b>${esc(p.name)}</b><div class="tiny muted">${P.seats[pid]} deputados · ${P.seats[pid] >= 2 ? 'Grupo parlamentar' : 'Deputado único representante de partido'}</div></div></div><div class="row small" style="margin-top:6px">${portrait(L, 26, p.color)}<span>${esc(L?.name || '')}</span>${rel != null ? `<span class="tag ${rel > 20 ? 'good' : rel < -20 ? 'bad' : ''}" style="margin-left:auto">Relação: ${rel > 0 ? '+' : ''}${Math.round(rel)}</span>` : ''}</div></div>`; }).join('');
  }
  if (tab === 'mesa') {
    const par = P.par ? G.people[P.par.personId] : null;
    return `<h4 class="small muted">PRESIDENTE DA ASSEMBLEIA</h4>${par ? `<div class="row">${portrait(par, 50, G.parties[P.par.partyId]?.color)}<div><b>${esc(par.name)}</b><div class="small muted">${esc(G.parties[P.par.partyId]?.short || '')}${P.par.votes ? ' · ' + P.par.votes + ' votos' : ''}</div></div></div>` : '<p class="muted">Por eleger</p>'}
      <div class="sep"></div><h4 class="small muted">VICE-PRESIDENTES</h4>${(P.vps || []).map(v => `<div class="row small" style="margin-bottom:6px">${portrait(G.people[v.personId], 28, G.parties[v.partyId].color)}${esc(G.people[v.personId]?.name || '')} ${pchip(G.parties[v.partyId])}</div>`).join('') || '<p class="muted small">—</p>'}`;
  }
  return '';
}

async function animateVote(votes, title, passed, tally) {
  busy = true;
  hemi?.setCamera('overview');
  sfx.bell();
  const labels = { contra: 'Quem vota contra?', abstencao: 'Quem se abstém?', favor: 'Quem vota a favor?' };
  if (hemi) await hemi.voteSequence(votes, ph => { if (ph !== 'done') { caption = labels[ph]; render(); } });
  else await sleep(1000);
  const by = k => Object.keys(votes).filter(p => votes[p] === k).map(p => G.parties[p].short).join(', ') || '—';
  caption = `${passed ? '✅ Aprovado' : '❌ Rejeitado'}: ${esc(title)}<div style="font-size:15px;font-family:var(--font);font-weight:500;margin-top:8px">A favor: ${esc(by('favor'))} (${tally.favor}) · Contra: ${esc(by('contra'))} (${tally.contra}) · Abstenção: ${esc(by('abstencao'))} (${tally.abstencao})</div>`;
  sfx.gavel(); passed ? sfx.applause(1.5, 0.5) : null;
  render();
  await sleep(3800);
  caption = ''; busy = false; render();
}

function negotiate(b) {
  const P = G.parliament; const me = G.playerPartyId;
  const pred = predictBill(G, b);
  const others = Object.keys(P.seats).filter(p => p !== me && P.seats[p] > 0 && pred.votes[p] !== 'favor').sort((a, c) => P.seats[c] - P.seats[a]);
  const body = () => { const pr = predictBill(G, b); return `<p class="small muted">Capital político disponível: <b>${G.politicalCapital}</b>. Previsão atual: ${pr.tally.favor} a favor · ${pr.tally.contra} contra · ${pr.tally.abstencao} abst. — <b class="${pr.passed ? 'good' : 'bad'}">${pr.passed ? 'aprovação' : 'chumbo'}</b></p>
    ${others.map(pid => { const p = G.parties[pid]; return `<div class="card" style="margin-bottom:8px"><div class="row">${logoImg(p, 30)}<b class="grow">${esc(p.short)} (${P.seats[pid]})</b><span class="tag ${pr.votes[pid] === 'favor' ? 'good' : pr.votes[pid] === 'contra' ? 'bad' : 'warn'}">${VOTE_LABEL[pr.votes[pid]]}</span></div>${b.deals?.[pid] ? '<div class="tiny good">Acordo fechado ✓</div>' : `<div class="row wrap" style="margin-top:6px">${billDealOptions(G, b, pid).map(o => `<button class="btn sm" data-deal="${pid}|${o.id}" title="${esc(o.desc)}">${esc(o.label)} (${o.pc} PC)</button>`).join('')}</div>`}</div>`; }).join('') || '<p class="good">Todos os partidos já votam a favor.</p>'}`; };
  const m = openModal({ title: `Negociar: ${esc(b.title)}`, icon: '🤝', cls: 'wide', body: body(), actions: [{ label: 'Concluir', cls: 'primary', onClick: () => render() }] });
  m.el.addEventListener('click', e => {
    const t = e.target.closest('[data-deal]'); if (!t) return;
    const [pid, opt] = t.dataset.deal.split('|'); const o = billDealOptions(G, b, pid).find(x => x.id === opt);
    if (G.politicalCapital < o.pc) { toast('Capital político insuficiente.', 'bad'); return; }
    G.politicalCapital -= o.pc;
    const before = predictBill(G, b).votes[pid];
    applyBillDeal(G, b, pid, [opt]);
    const after = predictBill(G, b).votes[pid];
    if (after === 'favor' && before !== 'favor') { b.deals[pid] = 'favor'; toast(`${G.parties[pid].short} aceita votar a favor.`, 'good'); }
    else if (after !== before) toast(`${G.parties[pid].short} passa a: ${VOTE_LABEL[after]}.`, '');
    else toast(`${G.parties[pid].short} ainda não está convencido.`, '');
    m.body.innerHTML = body();
  });
}

const handlers = {
  back: () => go(G.phase === 'formacao' ? 'formation' : 'government'),
  cam: el => hemi?.setCamera(el.dataset.c),
  hl: el => { const p = el.dataset.p; hemi?.highlight(hemi._hl === p ? null : p); if (hemi) hemi._hl = hemi._hl === p ? null : p; },
  tab: el => { tab = el.dataset.k; render(); },
  ownCand: el => { inst.cand = { personId: el.dataset.id, partyId: G.playerPartyId, consensual: false }; inst.result = null; render(); },
  negPar: async () => { const P = G.parliament; const second = Object.keys(P.seats).filter(p => p !== G.playerPartyId).sort((a, b) => P.seats[b] - P.seats[a])[0]; if (G.politicalCapital < 0) return; inst.deals = { ...(inst.deals || {}), [second]: 'favor' }; inst.cand.consensual = true; toast(`Acordo de rotatividade com o ${G.parties[second].short}: metade da legislatura para cada.`, 'good'); render(); },
  votePar: () => { if (!busy) votePar(); },
  voteVps: () => { if (!busy) voteVps(); },
  endInstall: () => { G.parliament.installed = true; autosave(); go('formation'); },
  selBill: el => { selBill = el.dataset.id; render(); },
  negotiate: () => { const b = G.bills.find(x => x.id === selBill); if (b) negotiate(b); },
  voteBill: async () => {
    if (busy) return; const b = G.bills.find(x => x.id === selBill); if (!b) return;
    const me = G.playerPartyId; const sel = $('#myBillVote');
    const res = resolveVote(G, b, sel ? { [me]: sel.value } : {});
    autosave();
    await animateVote(res.votes, b.title, res.passed, res.tally);
  },
  voteMotion: async () => {
    if (busy) return; const sel = $('#motionVote');
    const M = G.pendingMotion;
    const res = resolvePendingMotion(G, sel?.value);
    autosave();
    await animateVote(res.votes, `Moção de censura (${G.parties[M.author].short})`, res.passed, res.tally);
    if (res.passed) go('government');
  },
  startDraft: () => { draft = { order: committeeDraft(G), i: 0, taken: {} }; stepDraft(); },
  pickCom: el => { draft.taken[el.dataset.id] = G.playerPartyId; draft.i++; stepDraft(); },
};

function stepDraft() {
  while (draft.i < draft.order.length && draft.order[draft.i] !== G.playerPartyId) {
    const pid = draft.order[draft.i];
    const c = aiCommitteePick(G, pid, COMMITTEES.filter(x => !draft.taken[x.id]));
    if (c) draft.taken[c.id] = pid;
    draft.i++;
  }
  if (draft.i >= draft.order.length) {
    const members = committeeMembership(G);
    for (const [cid, pid] of Object.entries(draft.taken)) G.parliament.committees[cid] = { chairParty: pid, members };
    draft = null; toast('Presidências das comissões distribuídas.', 'good'); autosave();
  }
  render();
}

export function leave() { hideTip(); hemi = null; draft = null; }
export { ideologyBars, alertBox, voteMotion, clamp, rng, fmtNum };
