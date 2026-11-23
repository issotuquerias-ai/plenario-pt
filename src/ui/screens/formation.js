// Formação de Governo após as eleições
import { G, addNews } from '../../core/state.js';
import { MINISTRIES } from '../../data/ministries.js';
import { MAJORITY } from '../../data/districts.js';
import { computeHearings, designate, aiFormGovernment, programDebate, governmentFallen, scheduleElection, nextOrdinaryElection, seatRanking } from '../../sim/formation.js';
import { evaluateOffer, demandsFor } from '../../sim/negotiation.js';
import { formGovernment, defaultCabinetFor } from '../../sim/government.js';
import { presidentName } from '../../sim/president.js';
import { createPerson } from '../../sim/candidates.js';
import { uiRoot } from '../dom.js';
import { go, hudHTML, bindScreen, autosave, newsTicker } from '../app.js';
import { logoImg, portrait, pchip, bar, hemicycleSVG, seatsLegend, openModal, toast, alertBox } from '../components.js';
import { esc, fmtPct } from '../../core/util.js';
import { sfx } from '../../audio/sfx.js';

let F;
export function enter() {
  F = G.formation;
  if (!F.hearings) F.hearings = computeHearings(G);
  if (!F.step || F.step === 'resultados') F.step = 'audiencias';
  F.offers = F.offers || {};
  render();
}

function seatsOf(list) { return list.reduce((s, p) => s + (G.parliament.seats[p] || 0), 0); }

function render() {
  const me = G.playerPartyId; const P = G.parliament;
  const pres = G.people[G.president.id];
  let main = '';
  if (F.step === 'audiencias') {
    const mySeats = P.seats[me] || 0;
    main = `<div class="panel-h"><h3>Audiências no Palácio de Belém</h3></div><div class="panel-b scroll">
      <div class="row" style="margin-bottom:12px">${portrait(pres, 56)}<div><b>${esc(presidentName(G))}</b><div class="small muted">Presidente da República — ouve os partidos com representação parlamentar antes de indigitar o Primeiro-Ministro (art. 187.º da Constituição).</div></div></div>
      ${F.hearings.map(h => { const p = G.parties[h.pid]; return `<div class="card" style="margin-bottom:8px"><div class="row">${logoImg(p, 34)}<div class="grow"><b>${esc(p.short)}</b> <span class="tiny muted">${P.seats[h.pid]} deputados</span><div class="small">${h.player ? '<span class="gold">A sua vez de ser recebido.</span>' : esc(h.text)}</div></div></div></div>`; }).join('')}
      <div class="sep"></div>
      ${mySeats ? `<h3 class="title-serif">O que diz ao Presidente?</h3>
        <button class="option" data-act="stance" data-s="governar"><b>🏛️ Reivindicar a formação de Governo</b><small>${seatRanking(G)[0] === me ? 'É o partido mais votado.' : 'Precisará de demonstrar uma maioria alternativa com acordos escritos (116 deputados).'}</small></button>
        ${seatRanking(G)[0] !== me ? `<button class="option" data-act="stance" data-s="apoiar"><b>🤝 Disponível para viabilizar um Governo do ${esc(G.parties[seatRanking(G)[0]].short)}</b><small>Em troca de medidas do seu programa. Melhora a relação e a estabilidade.</small></button>` : ''}
        <button class="option" data-act="stance" data-s="oposicao"><b>⚔️ Ir para a oposição</b><small>Não viabiliza ninguém à partida. Liberdade total para fiscalizar o Governo.</small></button>`
        : `<p class="muted">O seu partido não elegeu deputados. Continuará como força extraparlamentar, a preparar as próximas eleições.</p><button class="btn primary" data-act="stance" data-s="oposicao">Continuar</button>`}
    </div>`;
  } else if (F.step === 'negociacao') {
    const partners = Object.keys(F.agreements).filter(p => F.agreements[p]);
    const total = (P.seats[me] || 0) + seatsOf(partners);
    const others = Object.keys(P.seats).filter(p => p !== me && P.seats[p] > 0).sort((a, b) => P.seats[b] - P.seats[a]);
    main = `<div class="panel-h"><h3>Negociações para formar Governo</h3><span class="tag ${total >= MAJORITY ? 'good' : 'warn'}">${total} / ${MAJORITY}</span></div><div class="panel-b scroll">
      <p class="small muted">O Presidente indigitou-o como Primeiro-Ministro. Pode governar em minoria, procurar <b>coligações</b> (pastas no Governo) ou <b>acordos de incidência parlamentar</b> (apoio em troca de medidas). Cada partido avalia a proposta segundo a distância ideológica, a relação, as suas linhas vermelhas e o calculismo eleitoral.</p>
      ${others.map(pid => { const p = G.parties[pid]; const st = F.agreements[pid]; const d = demandsFor(G, pid); const last = F.offers[pid]; return `<div class="card" style="margin-bottom:8px"><div class="row">${logoImg(p, 36)}<div class="grow"><b>${esc(p.short)}</b> <span class="tiny muted">${P.seats[pid]} deputados</span>${st ? `<span class="tag good" style="margin-left:6px">${st === 'coalicao' ? 'Coligação' : 'Acordo parlamentar'} ✓</span>` : ''}<div class="tiny muted">Exige: ${d.laws.map(l => esc(l.title)).join(' · ') || '—'}</div></div>
        ${st ? `<button class="btn sm ghost" data-act="cancelDeal" data-p="${pid}">Desfazer</button>` : `<button class="btn sm" data-act="offer" data-p="${pid}" data-t="coalicao">Coligação</button><button class="btn sm" data-act="offer" data-p="${pid}" data-t="acordo">Acordo</button>`}</div>
        ${last ? `<div class="small ${last.accept ? 'good' : 'bad'}" style="margin-top:6px">${last.accept ? '✓ Aceitou' : '✗ Recusou'}: ${esc(last.reasons.slice(0, 3).join(' · '))}</div>` : ''}</div>`; }).join('')}
      <div class="sep"></div><button class="btn primary block lg" data-act="toCabinet">Formar Governo ${total >= MAJORITY ? '(maioria)' : '(minoria)'} →</button>
    </div>`;
  } else if (F.step === 'governo') {
    const coal = [me, ...Object.keys(F.agreements).filter(p => F.agreements[p] === 'coalicao')];
    F.cabinet = F.cabinet || (() => { const c = defaultCabinetFor(G, me); const partnerMins = ['agricultura', 'cultura', 'ambiente', 'justica', 'educacao', 'economia']; coal.slice(1).forEach((pid, i) => { (F.partnerMinistries?.[pid] || [partnerMins[i]]).forEach(mid => { const fig = Object.values(G.people).find(x => x.partyId === pid && !x.generated && x.role !== 'lider' && !Object.values(c).includes(x.id)); if (fig) c[mid] = fig.id; }); }); return c; })();
    const pool = Object.values(G.people).filter(x => (coal.includes(x.partyId) && !x.generated && x.role !== 'lider' && x.role !== 'par' && x.role !== 'presidente') || x.independent);
    main = `<div class="panel-h"><h3>Composição do ${G.history.governments.length + 25}.º Governo Constitucional</h3></div><div class="panel-b scroll">
      <div class="row" style="margin-bottom:10px">${portrait(G.people[G.parties[me].leaderId], 50, G.parties[me].color)}<div><b>${esc(G.people[G.parties[me].leaderId].name)}</b><div class="small muted">Primeiro-Ministro</div></div></div>
      <table class="t"><tbody>${MINISTRIES.map(m => { const cur = G.people[F.cabinet[m.id]]; return `<tr><td class="small">${esc(m.name)}</td><td><select class="input" style="padding:4px 6px" data-act="setMin" data-on="change" data-m="${m.id}"><option value="">— Independente a convidar —</option>${pool.map(x => `<option value="${x.id}" ${F.cabinet[m.id] === x.id ? 'selected' : ''}>${esc(x.name)}${x.partyId ? ' (' + esc(G.parties[x.partyId]?.short || '') + ')' : ' (ind.)'}${x.expertise === m.id ? ' ⭐' : ''}</option>`).join('')}</select></td></tr>`; }).join('')}</tbody></table>
      <button class="btn gold block lg" style="margin-top:12px" data-act="sworn">Tomada de posse no Palácio da Ajuda →</button></div>`;
  } else if (F.step === 'ai_gov') {
    const gov = G.government; const pm = G.parties[gov.pmPartyId];
    const inParl = (P.seats[me] || 0) > 0 && !gov.coalition.includes(me) && !(gov.support || []).includes(me);
    main = `<div class="panel-h"><h3>Novo Governo</h3></div><div class="panel-b scroll">
      <div class="row">${logoImg(pm, 54)}<div><h2 class="title-serif">${esc(G.people[gov.pm]?.name)} indigitado Primeiro-Ministro</h2><div class="small muted">${gov.coalition.length > 1 ? 'Coligação: ' + gov.coalition.map(p => G.parties[p].short).join(' + ') : 'Governo minoritário do ' + esc(pm.short)}${gov.support?.length ? ' · com acordo de ' + gov.support.map(p => G.parties[p].short).join(', ') : ''} — ${seatsOf(gov.coalition.concat(gov.support || []))} deputados</div></div></div>
      <div class="sep"></div><p>O programa do Governo vai ser debatido na Assembleia. Qualquer grupo parlamentar pode apresentar uma <b>moção de rejeição</b>; se for aprovada por maioria absoluta (116), o Governo cai.</p>
      ${inParl ? `<h3 class="title-serif">Posição do seu grupo parlamentar</h3>
        <button class="option" data-act="program" data-v="apresentar"><b>⚔️ Apresentar moção de rejeição</b><small>Tenta derrubar o Governo à nascença.</small></button>
        <button class="option" data-act="program" data-v="abstencao"><b>😐 Abster-se</b><small>Deixa o Governo passar sem o apoiar.</small></button>
        <button class="option" data-act="program" data-v="contra"><b>🤝 Votar contra a rejeição (viabilizar)</b><small>Dá estabilidade e melhora a relação com o Governo.</small></button>`
        : '<button class="btn primary" data-act="program" data-v="">Acompanhar o debate do programa</button>'}
    </div>`;
  } else if (F.step === 'programa_res') {
    const r = F.programVote;
    main = `<div class="panel-h"><h3>Debate do programa do Governo</h3></div><div class="panel-b">${r.none ? '<p class="good">Nenhuma moção de rejeição foi apresentada. O Governo entra em plenitude de funções.</p>' : `<p>Moção de rejeição apresentada por: ${r.presenters.map(p => pchip(G.parties[p])).join(' ')}</p><div class="grid3"><div class="kpi"><small>A favor</small><b>${r.tally.favor}</b></div><div class="kpi"><small>Contra</small><b>${r.tally.contra}</b></div><div class="kpi"><small>Abstenção</small><b>${r.tally.abstencao}</b></div></div><h2 class="title-serif ${r.passed ? 'bad' : 'good'}" style="margin-top:12px">${r.passed ? 'Moção aprovada — o Governo cai.' : 'Moção rejeitada — o Governo está em funções.'}</h2>`}
      <button class="btn primary lg" data-act="afterProgram">Continuar →</button></div>`;
  }
  const root = uiRoot();
  root.innerHTML = `<div class="screen bg">${hudHTML([{ k: 'Deputados', v: P.seats[me] || 0 }, { k: 'Legislatura', v: G.legislature }])}
    <main class="layout" style="grid-template-columns:1fr 1.5fr"><div class="panel col" style="min-height:0"><div class="panel-h"><h3>Novo Parlamento</h3></div><div class="panel-b scroll">${hemicycleSVG(G, P.seats, { width: 420, highlight: F.step === 'negociacao' ? [me, ...Object.keys(F.agreements).filter(p => F.agreements[p])] : null })}${seatsLegend(G, P.seats)}
      <div class="sep"></div><h4 class="small muted">RESULTADOS</h4>${seatRanking(G).map(pid => `<div class="meter-row">${pchip(G.parties[pid])}${bar(G.lastResult?.national.pct[pid] || 0, 40, G.parties[pid].color)}<span class="small" style="width:120px">${fmtPct(G.lastResult?.national.pct[pid] || 0)} · <b>${P.seats[pid]}</b></span></div>`).join('')}</div></div>
    <div class="panel col" style="min-height:0">${main}</div></main>${newsTicker()}</div>`;
  bindScreen(root, handlers);
}

function offerDialog(pid, type) {
  const me = G.playerPartyId; const p = G.parties[pid]; const d = demandsFor(G, pid);
  const mins = MINISTRIES.filter(m => !['financas', 'estrangeiros', 'presidencia'].includes(m.id));
  const body = `${type === 'coalicao' ? `<h4 class="small muted">PASTAS A OFERECER</h4><div class="row wrap">${mins.map(m => `<label class="check" style="margin:3px 8px 3px 0"><input type="checkbox" name="min" value="${m.id}" ${d.ministries.includes(m.id) ? 'checked' : ''}> <span class="small">${esc(m.name)}</span></label>`).join('')}</div><div class="sep"></div>` : ''}
    <h4 class="small muted">MEDIDAS DO ${esc(p.short)} A INCLUIR NO PROGRAMA</h4>${d.laws.map(l => `<label class="check" style="margin-bottom:6px"><input type="checkbox" name="pol" value="${l.id}" checked> <span class="small">${esc(l.title)}</span></label>`).join('')}`;
  openModal({ title: `${type === 'coalicao' ? 'Proposta de coligação' : 'Acordo de incidência parlamentar'} — ${esc(p.short)}`, icon: '🤝', body, actions: [{ label: 'Cancelar' }, { label: 'Apresentar proposta', cls: 'primary', onClick: (close, el) => {
    const ministries = [...el.querySelectorAll('input[name=min]:checked')].map(i => i.value);
    const policies = [...el.querySelectorAll('input[name=pol]:checked')].map(i => i.value);
    const r = evaluateOffer(G, me, pid, { type, ministries, policies });
    F.offers[pid] = r;
    if (r.accept) { F.agreements[pid] = type; F.partnerMinistries = F.partnerMinistries || {}; if (type === 'coalicao') F.partnerMinistries[pid] = ministries.slice(0, 3); F.commitments = (F.commitments || []).concat(policies.map(id => ({ party: pid, lawId: id }))); sfx.good(); addNews(`${G.parties[pid].short} aceita ${type === 'coalicao' ? 'entrar no Governo' : 'um acordo de incidência parlamentar'} com o ${G.parties[me].short}.`, { tone: 'good' }); }
    else { sfx.bad(); const rel = G.parties[pid].relations; rel[me] = (rel[me] || 0) - 3; }
    render();
  } }] });
}

async function finishGovernment(approved) {
  if (approved) {
    G.phase = 'governing';
    G.nextElection = nextOrdinaryElection(G);
    G.formation = null;
    autosave();
    go('government', { welcome: true });
  } else {
    governmentFallen(G);
    F.attempts = (F.attempts || 0) + 1;
    if (F.attempts >= 2) {
      await alertBox('Impasse político', `Sem solução governativa estável, ${esc(presidentName(G))} anuncia a dissolução da Assembleia da República logo que constitucionalmente possível. Até lá, mantém-se um Governo de gestão.`, '⚖️');
      scheduleElection(G);
      autosave();
      go('campaign', { intro: true });
    } else {
      F.step = 'audiencias'; F.hearings = computeHearings(G); F.agreements = {}; F.offers = {}; F.cabinet = null;
      render();
    }
  }
}

const handlers = {
  stance: async el => {
    const s = el.dataset.s; F.playerStance = s;
    const pm = designate(G);
    sfx.bell();
    if (pm === G.playerPartyId) { await alertBox('Indigitação', `${esc(presidentName(G))} indigita ${esc(G.people[G.parties[pm].leaderId].name)} como Primeiro-Ministro e pede-lhe que forme Governo.`, '🏛️'); F.step = 'negociacao'; render(); return; }
    aiFormGovernment(G, pm);
    if (s === 'apoiar' && G.parliament.seats[G.playerPartyId]) { G.government.support = [...new Set([...(G.government.support || []), G.playerPartyId])]; const P = G.parties[G.playerPartyId]; P.relations[pm] = (P.relations[pm] || 0) + 20; G.parties[pm].relations[G.playerPartyId] = (G.parties[pm].relations[G.playerPartyId] || 0) + 20; addNews(`${P.short} assina acordo para viabilizar o Governo do ${G.parties[pm].short}.`, { tone: 'neutral' }); }
    F.step = 'ai_gov'; render();
  },
  offer: el => offerDialog(el.dataset.p, el.dataset.t),
  cancelDeal: el => { delete F.agreements[el.dataset.p]; render(); },
  toCabinet: () => { F.step = 'governo'; render(); },
  setMin: el => { if (el.value) F.cabinet[el.dataset.m] = el.value; else { const id = createPerson(G, { partyId: null, role: 'independente', traits: { carisma: 55, debate: 55, gestao: 72, experiencia: 70 } }); G.people[id].independent = true; G.people[id].expertise = el.dataset.m; F.cabinet[el.dataset.m] = id; render(); } },
  sworn: () => {
    const me = G.playerPartyId;
    const coal = [me, ...Object.keys(F.agreements).filter(p => F.agreements[p] === 'coalicao')];
    const support = Object.keys(F.agreements).filter(p => F.agreements[p] === 'acordo');
    formGovernment(G, { pmPartyId: me, coalition: coal, support, ministers: F.cabinet });
    G.obligations = (G.obligations || []).concat((F.commitments || []).map(c => ({ ...c, since: G.date })));
    addNews(`Tomou posse o ${G.government.number}.º Governo Constitucional, liderado por ${G.people[G.government.pm].name}.`, { tone: 'good' });
    sfx.sting();
    const r = programDebate(G);
    F.step = 'programa_res'; render();
    void r;
  },
  program: el => { programDebate(G, el.dataset.v || null); F.step = 'programa_res'; render(); },
  afterProgram: () => finishGovernment(!F.programVote?.passed),
};
export function leave() { }
export { toast };
