// Debate televisivo (estúdio 3D + mecânica de rondas)
import { G, SETTINGS } from '../../core/state.js';
import { Engine } from '../../three/engine.js';
import { createStudio } from '../../three/studio.js';
import { createDebate, currentQuestion, playRound, finishDebate, APPROACHES, MODERATOR, mainRival, modLine } from '../../sim/debate.js';
import { uiRoot, $, typewriter } from '../dom.js';
import { go, bindScreen, autosave } from '../app.js';
import { logoSrc, photoSrc, logoImg, portrait, bar, openModal, toast } from '../components.js';
import { esc, fmtPct, sleep, clamp, contrastText } from '../../core/util.js';
import { rng } from '../../core/rng.js';
import { sfx, ambience } from '../../audio/sfx.js';

export const uses3D = true;
let S = null, debate = null, studio = null, timerId = null, busy = false, onParl = false;

const APPROACH_DESC = { proposta: 'Apresente uma medida concreta. Depende da gestão do líder.', ataque: 'Exponha as falhas do adversário. Arriscado se exagerar.', emocao: 'Fale de pessoas reais. Depende do carisma.', factcheck: 'Desminta o adversário — só resulta se ele exagerou.', soundbite: 'Uma frase que pode tornar-se viral… ou numa gaffe.', esquiva: 'Seguro mas fraco; repetir é penalizado.' };

export function enter(params) {
  debate = G.campaign.debates.find(d => d.id === params.debateId);
  S = createDebate(G, debate);
  const parts = S.participants.map(pid => { const p = G.parties[pid]; const L = G.people[p.leaderId]; return { name: L?.name || p.short, partyShort: p.short, color: p.color, logo: logoSrc(p), photo: photoSrc(L) }; });
  try {
    studio = createStudio({ channel: S.channel, title: `${S.kind === 'pequenos' ? 'DEBATE' : 'DEBATE'} LEGISLATIVAS ${String(G.electionDate).slice(0, 4)}`, participants: parts, moderator: { name: S.moderator } });
    Engine.setScene(studio); studio.shot('wide', false);
  } catch (e) { console.error(e); studio = null; }
  ambience('estudio');
  render();
  run();
}

function render() {
  const root = uiRoot();
  root.innerHTML = `<div class="screen overlay3d">
    <div class="ov-top panel"><span class="tag" style="background:${S.channel.color};color:#fff">${esc(S.channel.name)}</span><b>${esc(S.title)}</b><span class="tag" id="roundTag">Ronda 1/${S.topics.length}</span></div>
    <div class="ov-right panel"><div class="panel-h"><h3>Perceção do público</h3></div><div class="panel-b" id="meters">${meters()}</div></div>
    <div class="ov-bottom"><div class="lower-third" id="lt"><div class="who" id="who" style="background:${S.channel.color}"></div><div class="what" id="what"></div></div>
      <div id="choices"></div></div>
  </div>`;
  bindScreen(root, {});
  root.addEventListener('click', e => { const el = $('#what'); if (el?._skip && !e.target.closest('.approach')) el._skip(); });
}

function meters() {
  const vals = S.participants.map(p => S.scores[p]);
  const mn = Math.min(...vals, 0), mx = Math.max(...vals, 1);
  return S.participants.map(pid => { const p = G.parties[pid]; const v = (S.scores[pid] - mn) / (mx - mn || 1) * 100; return `<div class="meter-row">${logoImg(p, 24)}<span style="width:46px" class="small"><b>${esc(p.short)}</b></span>${bar(clamp(v, 4, 100), 100, p.color)}</div>`; }).join('');
}

function setWho(kind, pid) {
  const who = $('#who'); if (!who) return;
  if (kind === 'mod') { who.style.background = S.channel.color; who.innerHTML = `<span style="font-size:24px">🎙️</span><div><b>${esc(S.moderator)}</b><div class="tiny">Moderador(a) · ${esc(S.channel.name)}</div></div>`; return; }
  const p = G.parties[pid]; const L = G.people[p.leaderId];
  who.style.background = p.color; who.style.color = contrastText(p.color);
  who.innerHTML = `${portrait(L, 42, p.color)}<div><b>${esc(L?.name || p.short)}</b><div class="tiny">${esc(p.short)}</div></div>`;
}

async function say(kind, pid, text) {
  setWho(kind, pid);
  const idx = kind === 'mod' ? 'moderator' : S.participants.indexOf(pid);
  try { studio?.shot(kind === 'mod' ? 'moderator' : idx); studio?.setTalking(idx); } catch { }
  await typewriter($('#what'), text, 14, () => sfx.type());
  await sleep(700);
  try { studio?.setTalking(null); } catch { }
}

function floatDelta(v, flags) {
  const el = document.createElement('div');
  el.className = 'float-delta';
  const extra = flags.viral ? ' 🔥 VIRAL' : flags.gaffe ? ' 😬 GAFFE' : flags.backlash ? ' 💥 EXCESSO' : flags.caught ? ' ✅ DESMENTIDO' : flags.misfire ? ' ❌' : '';
  el.textContent = (v >= 0 ? '+' : '') + v.toFixed(1) + extra;
  el.style.left = '50%'; el.style.top = '42%'; el.style.color = v >= 0 ? '#4ade80' : '#f87171';
  uiRoot().appendChild(el); setTimeout(() => el.remove(), 1700);
}

function choose() {
  return new Promise(res => {
    const box = $('#choices');
    const total = 20000; let left = total;
    box.innerHTML = `<div class="panel" style="margin-top:10px;padding:12px"><div class="small muted">Escolha a sua abordagem:</div><div class="approaches">${APPROACHES.map(a => `<button class="approach" data-a="${a.id}"><b>${esc(a.label)}</b><small>${esc(a.desc || APPROACH_DESC[a.id] || '')}</small></button>`).join('')}</div>${SETTINGS.debateTimer ? '<div class="timer"><i id="tbar" style="width:100%"></i></div>' : ''}</div>`;
    const done = a => { clearInterval(timerId); box.innerHTML = ''; sfx.click(); res(a); };
    box.querySelectorAll('[data-a]').forEach(b => b.onclick = () => done(b.dataset.a));
    if (SETTINGS.debateTimer) timerId = setInterval(() => { left -= 100; const t = $('#tbar'); if (t) t.style.width = (left / total * 100) + '%'; if (left <= 0) { toast('O moderador interrompe: "O tempo acabou!"', 'bad'); done('esquiva'); } }, 100);
  });
}

async function run() {
  busy = true;
  sfx.jingle();
  await sleep(1200);
  const M = MODERATOR();
  await say('mod', null, modLine(G, S, 'intro') || 'Boa noite.');
  while (!S.finished) {
    $('#roundTag').textContent = `Ronda ${S.round + 1}/${S.topics.length}`;
    const { topic, question } = currentQuestion(G, S);
    try { studio?.setScreenText((topic.name || '').toUpperCase() + (topic.stakes ? ' — ' + topic.stakes : '')); } catch { }
    if (S.round > 0) await say('mod', null, modLine(G, S, 'transition') || 'Mudamos de tema.');
    await say('mod', null, question);
    const approach = await choose();
    const results = playRound(G, S, approach);
    for (const r of results) {
      await say('p', r.pid, r.text);
      floatDelta(r.delta, r.flags);
      if (r.flags.viral || r.delta > 2.5) sfx.applause(1.2, 0.5);
      if (r.flags.gaffe || r.flags.backlash) sfx.boo();
      try { const others = S.participants.map((p, i) => i).filter(i => S.participants[i] !== r.pid); const ri = rng.pick(others); studio?.react(ri, r.delta > 2 ? 'shake' : r.flags.gaffe ? 'laugh' : 'nod'); } catch { }
      $('#meters').innerHTML = meters();
      await sleep(500);
    }
  }
  await say('mod', null, modLine(G, S, 'closing') || 'Boa noite.');
  const res = finishDebate(G, S, debate);
  autosave();
  showResult(res);
}

function showResult(res) {
  const me = G.playerPartyId; const w = G.parties[res.winner];
  sfx.sting();
  openModal({
    title: 'Sondagem relâmpago: quem ganhou o debate?', icon: '📊', closable: false,
    body: `<div class="center" style="margin-bottom:12px">${logoImg(w, 64)}<h2 class="title-serif" style="margin-top:8px">${esc(G.people[w.leaderId]?.name || w.short)} venceu</h2></div>
      ${S.participants.map(pid => { const p = G.parties[pid]; return `<div class="meter-row">${logoImg(p, 26)}<b style="width:60px">${esc(p.short)}</b>${bar(res.flash[pid], 100, p.color, 'thick')}<span style="width:42px" class="right">${res.flash[pid]}%</span></div>`; }).join('')}
      <div class="meter-row"><span style="width:86px" class="muted small">Empate / NS</span>${bar(res.flash.empate, 100, '#64748b', 'thick')}<span style="width:42px" class="right">${res.flash.empate}%</span></div>
      <div class="sep"></div><p class="small ${res.vDelta >= 0 ? 'good' : 'bad'}">${res.vDelta >= 0 ? 'O debate reforçou a sua imagem junto dos eleitores.' : 'O debate prejudicou a sua imagem.'} ${G.parties[me].isCustom ? 'A notoriedade do partido subiu.' : ''}</p>`,
    actions: [{ label: 'Voltar à campanha', cls: 'primary', onClick: () => go('campaign') }],
  });
}

export function leave() { clearInterval(timerId); S = null; studio = null; }
export { fmtPct, mainRival, photoSrc };
