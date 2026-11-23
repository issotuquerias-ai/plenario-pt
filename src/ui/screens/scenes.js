// Cenas de campanha em 3D: arruada, cartazes e comício.
import { G } from '../../core/state.js';
import { Engine } from '../../three/engine.js';
import { createStreet } from '../../three/street.js';
import { DISTRICT_BY_ID } from '../../data/districts.js';
import { nationalShares } from '../../sim/electorate.js';
import { resolveArruada, resolveCartazes, resolveComicio, spend, localBoost, valenceBoost } from '../../sim/campaign.js';
import { speech, generateSlogans } from '../../ai/textgen.js';
import { uiRoot, $, typewriter } from '../dom.js';
import { go, bindScreen, autosave } from '../app.js';
import { logoSrc, photoSrc, logoImg, openModal, toast, bar } from '../components.js';
import { esc, fmtEur, fmtNum, clamp, sleep, contrastText } from '../../core/util.js';
import * as cal from '../../core/calendar.js';
import { rng } from '../../core/rng.js';
import { sfx, ambience } from '../../audio/sfx.js';

function partySpec() {
  const p = G.parties[G.playerPartyId]; const L = G.people[p.leaderId];
  return { id: p.id, short: p.short, color: p.color, color2: p.color2 || '#ffffff', logo: logoSrc(p), leaderName: L?.name || p.short, leaderPhoto: photoSrc(L) };
}
function rivalsIn(did, n = 4) {
  const s = nationalShares(G).byDistrict[did];
  return Object.keys(s).filter(x => x !== 'out' && x !== G.playerPartyId).sort((a, b) => s[b] - s[a]).slice(0, n).map(pid => {
    const p = G.parties[pid]; return { id: pid, short: p.short, color: p.color, logo: logoSrc(p), slogan: generateSlogans(p.ideology, null, p.short, 1, pid.length * 97 + 13)[0] };
  });
}

// =============== ARRUADA ===============
export const arruada = {
  uses3D: true,
  enter(params) {
    const did = params.did, d = DISTRICT_BY_ID[did], pid = G.playerPartyId, p = G.parties[pid];
    const L = G.people[p.leaderId];
    const share = nationalShares(G).byDistrict[did][pid] || 0;
    const st = { did, town: params.town, time: 75, greeted: 0, converted: 0, followers: 0, incidents: 0, press: 0, busy: false, ended: false, npc: {} };
    let scene;
    const onNpcClick = id => interact(id);
    try {
      scene = createStreet({ style: d.style, town: params.town, mode: 'arruada', party: partySpec(), rivals: rivalsIn(did), npcCount: 42, seed: rng.int(1, 1e6), onNpcClick, onGroundClick: pt => { if (!st.ended) scene.moveLeaderTo(pt.x, pt.z); } });
      Engine.setScene(scene);
    } catch (e) { console.error(e); toast('Não foi possível carregar a cena 3D.', 'bad'); go('campaign'); return; }
    const gov = G.government && !G.government.caretaker && G.government.coalition.includes(pid);
    const pSup = clamp(share * 1.5 + 0.06, 0.06, 0.6), pHost = clamp(0.1 + (p.ideology.sistema > 5 ? 0.06 : 0) + (gov ? 0.06 : 0) + Math.abs(p.ideology.social - d.lean.social) * 0.008, 0.05, 0.32);
    for (const n of scene.getNpcs()) {
      const a = n.kind === 'journalist' ? 'press' : rng.chance(pSup) ? 'supporter' : rng.chance(pHost / (1 - pSup)) ? 'hostile' : 'undecided';
      st.npc[n.id] = { att: a, done: false, revealed: false, kind: n.kind };
    }
    ambience('rua');
    const root = uiRoot();
    root.innerHTML = `<div class="screen overlay3d">
      <div class="ov-top panel"><b>🚶 Arruada em ${esc(params.town)}</b><span class="tag">${esc(d.name)}</span><span class="tag gold" id="tm">01:15</span></div>
      <div class="ov-left panel"><div class="panel-h"><h3>Como jogar</h3></div><div class="panel-b small">Clique no <b>chão</b> para caminhar e num <b>eleitor</b> para o cumprimentar.<br>❤️ apoiante · ❔ indeciso · 😠 hostil · 🎥 jornalista<br>Converta indecisos, faça crescer a comitiva e cuidado com os hostis — sobretudo perto das câmaras.</div></div>
      <div class="ov-bottom"><div class="panel" style="padding:10px"><div class="score-board" style="justify-content:center">
        <div class="kpi"><small>Cumprimentos</small><b id="s-g">0</b></div><div class="kpi"><small>Convertidos</small><b id="s-c" class="good">0</b></div><div class="kpi"><small>Comitiva</small><b id="s-f">0</b></div><div class="kpi"><small>Imprensa</small><b id="s-p">0</b></div><div class="kpi"><small>Incidentes</small><b id="s-i" class="bad">0</b></div>
        <button class="btn" data-act="finish" style="align-self:center">Terminar arruada</button></div></div></div></div>`;
    bindScreen(root, { finish: () => finish() });
    const upd = () => { $('#s-g').textContent = st.greeted; $('#s-c').textContent = st.converted; $('#s-f').textContent = st.followers; $('#s-p').textContent = st.press; $('#s-i').textContent = st.incidents; };
    const tick = setInterval(() => {
      if (st.ended) return;
      st.time -= 0.25;
      const m = Math.max(0, Math.ceil(st.time)); const tm = $('#tm'); if (tm) tm.textContent = `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
      for (const id in st.npc) { const n = st.npc[id]; if (!n.revealed && !n.done && scene.distanceToNpc(id) < 9) { n.revealed = true; scene.setNpcMarker(id, n.att === 'press' ? null : n.att); } }
      if (st.time <= 0) finish();
    }, 250);
    const nearPress = () => Object.entries(st.npc).some(([id, n]) => n.att === 'press' && scene.distanceToNpc(id) < 10);
    async function interact(id) {
      const n = st.npc[id]; if (!n || st.busy || st.ended) return;
      if (n.done) { scene.flash('Já falou com esta pessoa', '#94a3b8'); return; }
      st.busy = true;
      const ch = (L?.traits?.carisma ?? 55);
      let outcome, text, color;
      if (n.att === 'press') { outcome = 'handshake'; st.press += 2; text = '+ Declarações à imprensa'; color = '#60a5fa'; }
      else if (n.att === 'supporter') { outcome = 'hug'; st.greeted++; text = '+ Apoiante'; color = '#4ade80'; if (rng.chance(0.55)) { scene.addFollower(); st.followers++; text = '+ Junta-se à comitiva!'; } }
      else if (n.att === 'undecided') { const ok = rng.chance(clamp(0.35 + (ch - 50) / 140 + share, 0.15, 0.85)); st.greeted++; if (ok) { outcome = 'handshake'; st.converted++; if (nearPress()) st.press++; text = '+ Voto conquistado'; color = '#facc15'; } else { outcome = 'reject'; text = 'Não convencido'; color = '#94a3b8'; } }
      else { const ok = rng.chance(clamp(0.22 + (ch - 50) / 200, 0.08, 0.5)); if (ok) { outcome = 'handshake'; st.converted++; st.press += nearPress() ? 2 : 1; text = 'Diálogo conseguido!'; color = '#facc15'; } else { outcome = 'heckle'; st.incidents += nearPress() ? 2 : 1; text = 'Insultos e apupos!'; color = '#f87171'; sfx.boo(); } }
      try { await scene.greet(id, outcome); } catch { }
      n.done = true; scene.setNpcMarker(id, outcome === 'heckle' || outcome === 'reject' ? 'done' : outcome === 'hug' && n.att === 'supporter' ? 'done' : 'converted');
      scene.flash(text, color); if (color === '#4ade80' || color === '#facc15') sfx.good();
      upd(); st.busy = false;
    }
    function finish() {
      if (st.ended) return; st.ended = true; clearInterval(tick);
      const v = resolveArruada(G, did, { ...st, town: params.town });
      autosave();
      openModal({ title: 'Balanço da arruada', icon: '🚶', closable: false, body: `<div class="grid3"><div class="kpi"><small>Cumprimentos</small><b>${st.greeted}</b></div><div class="kpi"><small>Votos conquistados</small><b class="good">${st.converted}</b></div><div class="kpi"><small>Comitiva</small><b>${st.followers}</b></div><div class="kpi"><small>Cobertura mediática</small><b>${st.press}</b></div><div class="kpi"><small>Incidentes</small><b class="bad">${st.incidents}</b></div><div class="kpi"><small>Efeito local</small><b class="${v >= 0 ? 'good' : 'bad'}">${v >= 0 ? '▲' : '▼'} ${(Math.abs(v) * 100).toFixed(0)}</b></div></div>`, actions: [{ label: 'Voltar ao QG', cls: 'primary', onClick: () => go('campaign') }] });
    }
    this._cleanup = () => clearInterval(tick);
  },
  leave() { this._cleanup?.(); },
};

// =============== CARTAZES ===============
async function loadImg(src) { return new Promise(res => { if (!src) return res(null); const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; }); }
async function makePosters(template, slogan) {
  const p = G.parties[G.playerPartyId]; const L = G.people[p.leaderId];
  const [logo, photo] = await Promise.all([loadImg(logoSrc(p)), loadImg(photoSrc(L))]);
  const rivalId = Object.entries(G.parliament?.seats || {}).filter(([k]) => k !== p.id).sort((a, b) => b[1] - a[1])[0]?.[0];
  const rival = G.parties[rivalId];
  const draw = (w, h) => {
    const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d');
    const grd = g.createLinearGradient(0, 0, w, h); grd.addColorStop(0, p.color); grd.addColorStop(1, shade(p.color, -0.35)); g.fillStyle = grd; g.fillRect(0, 0, w, h);
    const fg = contrastText(p.color); const vert = h > w;
    g.fillStyle = withA(p.color2 || '#ffffff', 0.9); g.fillRect(0, h - (vert ? 70 : 60), w, vert ? 70 : 60);
    let textX = vert ? w / 2 : w * 0.62;
    if (template === 'lider' && photo) {
      const ph = vert ? h * 0.55 : h; const pw = ph * 0.75; const px = vert ? (w - pw) / 2 : 30; const py = vert ? 20 : 0;
      g.save(); g.beginPath(); g.rect(px, py, pw, ph - (vert ? 0 : 60)); g.clip(); g.drawImage(photo, px, py, pw, ph); g.restore();
      if (!vert) textX = 30 + pw + (w - pw - 60) / 2;
    }
    g.textAlign = 'center'; g.fillStyle = fg;
    const msg = template === 'ataque' && rival ? `${rival.short}: chega de promessas falhadas` : template === 'proposta' ? (p.program?.[0] || slogan) : slogan;
    const maxW = vert ? w - 40 : (template === 'lider' && photo ? w - textX + (w - textX) - 40 : w - 80);
    let size = vert ? 46 : 64; g.font = `900 ${size}px "Segoe UI", Arial`;
    const words = String(msg).split(' '); const lines = []; let cur = '';
    for (const wd of words) { const t = cur ? cur + ' ' + wd : wd; if (g.measureText(t).width > maxW && cur) { lines.push(cur); cur = wd; } else cur = t; }
    if (cur) lines.push(cur);
    while (lines.length > 3 && size > 26) { size -= 6; g.font = `900 ${size}px "Segoe UI", Arial`; }
    const ty = vert ? (template === 'lider' && photo ? h * 0.62 : h * 0.35) : h / 2 - (lines.length - 1) * size * 0.55 - 20;
    lines.slice(0, 4).forEach((l, i) => g.fillText(l.toUpperCase(), textX, ty + i * size * 1.1));
    if (logo) { const ls = vert ? 90 : 110; g.fillStyle = '#fff'; g.fillRect(w - ls - 24, vert ? h - 70 - ls - 16 : 20, ls, ls); g.drawImage(logo, w - ls - 18, (vert ? h - 70 - ls - 16 : 20) + 6, ls - 12, ls - 12); }
    g.fillStyle = contrastText(p.color2 || '#ffffff'); g.font = `800 ${vert ? 26 : 30}px "Segoe UI", Arial`;
    g.fillText(`VOTA ${p.short} · ${cal.mediumDate(G.electionDate).toUpperCase()}`, w / 2, h - (vert ? 26 : 20));
    return c.toDataURL('image/jpeg', 0.85);
  };
  return { outdoor: draw(1200, 400), vertical: draw(400, 600) };
}
function shade(hex, f) { const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255; r = Math.round(r * (1 + f)); g = Math.round(g * (1 + f)); b = Math.round(b * (1 + f)); return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join(''); }
function withA(hex, a) { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; }

export const cartazes = {
  uses3D: true,
  async enter(params) {
    const did = params.did, d = DISTRICT_BY_ID[did], p = G.parties[G.playerPartyId];
    let scene;
    const st = { sel: new Set(), template: 'lider', slogan: p.slogan || generateSlogans(p.ideology, p.family, p.short, 1)[0], posters: null };
    try {
      scene = createStreet({ style: d.style, town: d.capital, mode: 'cartazes', party: partySpec(), rivals: rivalsIn(did, 5), seed: rng.int(1, 1e6), onSlotClick: id => toggle(id) });
      Engine.setScene(scene);
    } catch (e) { console.error(e); go('campaign'); return; }
    const slots = scene.getSlots();
    const root = uiRoot();
    const total = () => [...st.sel].reduce((s, id) => s + slots.find(x => String(x.id) === String(id)).cost, 0);
    const renderUI = () => {
      root.innerHTML = `<div class="screen overlay3d">
        <div class="ov-top panel"><b>🪧 Cartazes em ${esc(d.capital)}</b><span class="tag">${esc(d.name)}</span><span class="tag gold">Fundos: ${fmtEur(G.campaign.money)}</span></div>
        <div class="ov-left panel"><div class="panel-h"><h3>Design do cartaz</h3></div><div class="panel-b">
          <div class="field"><label>Modelo</label><select class="input" data-act="tpl" data-on="change">${[['lider', 'Líder + slogan'], ['slogan', 'Só slogan'], ['proposta', 'Proposta-bandeira'], ['ataque', 'Cartaz de ataque ⚠']].map(([k, l]) => `<option value="${k}" ${st.template === k ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
          <div class="field"><label>Slogan</label><input class="input" data-act="slogan" data-on="change" value="${esc(st.slogan)}" maxlength="60"></div>
          ${st.posters ? `<img src="${st.posters.outdoor}" style="width:100%;border-radius:8px">` : '<div class="muted small">A gerar…</div>'}
          ${st.template === 'ataque' ? '<p class="tiny warn">Cartazes negativos mobilizam, mas podem ter efeito boomerang.</p>' : ''}</div></div>
        <div class="ov-right panel"><div class="panel-h"><h3>Espaços publicitários</h3></div><div class="panel-b scroll" style="max-height:52vh">${slots.map(s => `<label class="check option interactive" style="display:flex;margin-bottom:6px;${s.occupiedBy ? 'opacity:.5' : ''}"><input type="checkbox" data-act="slot" data-on="change" data-id="${s.id}" ${st.sel.has(s.id) ? 'checked' : ''} ${s.occupiedBy ? 'disabled' : ''}><span class="grow"><b class="small">${esc(s.label)}</b><br><span class="tiny muted">${s.kind === 'outdoor' ? 'Outdoor 8×3 m' : s.kind === 'mupi' ? 'MUPI' : 'Poste'} · visibilidade ${'★'.repeat(s.visibility)}${s.occupiedBy ? ' · ocupado (' + esc(G.parties[s.occupiedBy]?.short || '') + ')' : ''}</span></span><b class="small">${fmtEur(s.cost)}</b></label>`).join('')}</div>
          <div class="panel-b" style="border-top:1px solid var(--line)"><div class="row between"><span>Total</span><b>${fmtEur(total())}</b></div><div class="row" style="margin-top:8px"><button class="btn" data-act="cancel">Cancelar</button><button class="btn primary grow" data-act="buy" ${st.sel.size ? '' : 'disabled'}>Alugar e afixar</button></div></div></div>
      </div>`;
      bindScreen(root, handlers);
    };
    const regen = async () => { st.posters = await makePosters(st.template, st.slogan); for (const id of st.sel) apply(id); renderUI(); };
    const apply = id => { const s = slots.find(x => String(x.id) === String(id)); scene.setPoster(id, s.kind === 'outdoor' ? st.posters?.outdoor : st.posters?.vertical); };
    const toggle = rawId => { const id = slots.find(x => String(x.id) === String(rawId))?.id ?? rawId; const s = slots.find(x => String(x.id) === String(id)); if (!s || s.occupiedBy) { toast('Espaço ocupado por outro partido.', ''); return; } if (st.sel.has(id)) { st.sel.delete(id); scene.setPoster(id, null); } else { st.sel.add(id); apply(id); scene.focusSlot(id); } sfx.click(); renderUI(); };
    const handlers = {
      tpl: el => { st.template = el.value; regen(); },
      slogan: el => { st.slogan = el.value; regen(); },
      slot: el => toggle(el.dataset.id),
      cancel: () => { G.campaign.ap += 1; go('campaign'); },
      buy: async () => {
        const cost = total(); if (cost > G.campaign.money) { toast('Fundos insuficientes.', 'bad'); return; }
        spend(G, cost); sfx.coin();
        const chosen = [...st.sel].map(id => slots.find(x => String(x.id) === String(id)));
        let v = resolveCartazes(G, did, chosen);
        if (st.template === 'ataque') { if (rng.chance(0.3)) { valenceBoost(G, G.playerPartyId, -0.05); toast('O cartaz de ataque está a ser criticado como "baixa política".', 'bad'); } else localBoost(G, G.playerPartyId, did, v * 0.3); }
        let vand = null;
        if (rng.chance(0.18) && chosen.length) { vand = rng.pick(chosen); await sleep(900); scene.vandalize(vand.id); sfx.bad(); }
        autosave();
        openModal({ title: 'Cartazes afixados', icon: '🪧', closable: false, body: `<p>${chosen.length} espaço(s) contratado(s) por ${fmtEur(cost)}.</p>${vand ? `<p class="bad">Um dos cartazes (${esc(vand.label)}) foi vandalizado durante a noite.</p>` : ''}<p class="small muted">Os cartazes aumentam a notoriedade e o apoio local até ao dia das eleições.</p>`, actions: [{ label: 'Voltar ao QG', cls: 'primary', onClick: () => go('campaign') }] });
      },
    };
    renderUI(); regen();
  },
  leave() { },
};

// =============== COMÍCIO ===============
const TONES = [{ id: 'emotivo', label: 'Emotivo', trait: 'carisma' }, { id: 'factual', label: 'Factual', trait: 'gestao' }, { id: 'combativo', label: 'Combativo', trait: 'debate' }];
export const comicio = {
  uses3D: true,
  async enter(params) {
    const did = params.did, d = DISTRICT_BY_ID[did], p = G.parties[G.playerPartyId], L = G.people[p.leaderId];
    let scene;
    try { scene = createStreet({ style: d.style, town: d.capital, mode: 'comicio', party: partySpec(), rivals: [], seed: rng.int(1, 1e6) }); Engine.setScene(scene); } catch (e) { console.error(e); go('campaign'); return; }
    const res = resolveComicio(G, did, params.venue, params.themes, 1);
    scene.setCrowd(clamp(res.fill, 0.08, 1));
    ambience('rua');
    const root = uiRoot();
    root.innerHTML = `<div class="screen overlay3d">
      <div class="ov-top panel"><b>🎤 Comício — ${esc(d.capital)}</b><span class="tag">${esc(params.venue.label)}</span><span class="tag ${res.fill < 0.45 ? 'bad' : 'good'}">${fmtNum(res.attendance)} pessoas (${Math.round(Math.min(1, res.fill) * 100)}%)</span></div>
      <div class="ov-bottom"><div class="lower-third"><div class="who" style="background:${p.color};color:${contrastText(p.color)}"><b>${esc(L.name)}</b></div><div class="what" id="what">A multidão aguarda…</div></div><div id="choices"></div></div></div>`;
    bindScreen(root, {});
    await sleep(1200);
    scene.cheer(0.6); sfx.applause(2, 0.7);
    let quality = 0;
    for (const th of params.themes) {
      const tone = await new Promise(r => { $('#choices').innerHTML = `<div class="panel" style="margin-top:10px;padding:12px"><div class="small muted">Tema: <b>${esc(th.label)}</b> — que tom usar?</div><div class="approaches">${TONES.map(t => `<button class="approach" data-t="${t.id}"><b>${t.label}</b><small>Depende de ${t.trait}</small></button>`).join('')}</div></div>`; $('#choices').querySelectorAll('[data-t]').forEach(b => b.onclick = () => { $('#choices').innerHTML = ''; r(TONES.find(t => t.id === b.dataset.t)); }); });
      const q = clamp(((L.traits?.[tone.trait] ?? 55) - 40) / 40 + rng.gauss(0, 0.25), -0.5, 1.6);
      quality += q;
      scene.setSpeaker(true);
      await typewriter($('#what'), speech([th], p.ideology, p.short, d.capital), 14, () => sfx.type());
      scene.setSpeaker(false);
      scene.cheer(clamp(0.3 + q * 0.5, 0.2, 1)); sfx.applause(1.6 + q, clamp(0.4 + q * 0.4, 0.3, 1));
      await sleep(1300);
    }
    quality /= params.themes.length;
    localBoost(G, G.playerPartyId, did, (quality - 0.5) * 0.05);
    autosave();
    openModal({ title: 'Balanço do comício', icon: '🎤', closable: false, body: `<p><b>${fmtNum(res.attendance)}</b> pessoas num recinto para ${fmtNum(params.venue.capacity)}.</p><p>Qualidade do discurso: ${bar(clamp(quality * 60, 5, 100), 100, quality > 0.7 ? 'var(--good)' : 'var(--warn)', 'thick')}</p>${res.fill < 0.45 ? '<p class="bad">As televisões mostraram um recinto meio vazio.</p>' : '<p class="good">Imagens de entusiasmo abriram os noticiários.</p>'}`, actions: [{ label: 'Voltar ao QG', cls: 'primary', onClick: () => go('campaign') }] });
  },
  leave() { },
};
export { logoImg };
