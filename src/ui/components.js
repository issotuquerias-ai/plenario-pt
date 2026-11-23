// Componentes de interface reutilizáveis.
import { LOGOS, PHOTOS } from '../data/assets.js';
import { GROUPS } from '../data/ministries.js';
import { AREA_LABELS } from '../data/laws.js';
import { esc, initials, fmtNum, fmtPct, contrastText, withAlpha, clamp, fmtSigned } from '../core/util.js';
import { describeEffects } from '../sim/effects.js';
import { svgToDataURL } from '../ai/logogen.js';
import { sfx } from '../audio/sfx.js';
import { h } from './dom.js';

export function logoSrc(p) {
  if (!p) return null;
  if (p.logoData) return p.logoData;
  if (p.logoSvg) return svgToDataURL(p.logoSvg);
  if (p.logo && LOGOS[p.logo]) return LOGOS[p.logo];
  return null;
}
export function logoImg(p, size = 36, extra = '') {
  const src = logoSrc(p);
  if (!src) return `<span class="plogo txt" style="width:${size}px;height:${size}px;background:${p?.color || '#555'};color:${contrastText(p?.color || '#555')}" ${extra}>${esc((p?.short || '?').slice(0, 4))}</span>`;
  return `<span class="plogo" style="width:${size}px;height:${size}px" ${extra}><img src="${src}" alt="${esc(p.short)}"></span>`;
}
export function photoSrc(person) { if (!person) return null; return person.photoData || (person.photo && PHOTOS[person.photo]) || null; }
export function portrait(person, size = 44, color = '#334155') {
  const src = photoSrc(person);
  if (src) return `<span class="portrait" style="width:${size}px;height:${size}px"><img src="${src}" alt=""></span>`;
  return `<span class="portrait" style="width:${size}px;height:${size}px;background:${color};font-size:${Math.round(size * 0.36)}px">${esc(initials(person?.name || '?'))}</span>`;
}
export const pchip = p => `<span class="pchip"><i style="background:${p?.color || '#888'}"></i>${esc(p?.short || '?')}</span>`;
export const areaLabel = a => AREA_LABELS?.[a] || a;
export const groupName = id => GROUPS.find(g => g.id === id)?.name || id;

export function bar(v, max = 100, color = 'var(--gold)', cls = '') {
  return `<div class="bar ${cls}"><i style="width:${clamp((v / max) * 100, 0, 100)}%;background:${color}"></i></div>`;
}

export function effectTags(eff) {
  const list = describeEffects(eff || {});
  if (!list.length) return '';
  return `<div class="effects">${list.slice(0, 8).map(x => `<span class="tag ${x.good ? 'good' : 'bad'}">${esc(x.group ? groupName(x.k) : x.k)} ${x.v > 0 ? '▲' : '▼'}${x.unit ? ' ' + fmtNum(Math.abs(x.v)) + ' ' + x.unit : ''}</span>`).join('')}</div>`;
}

// Hemiciclo 2D (SVG) a partir de { partyId: lugares }
export function hemicycleSVG(G, seats, { width = 420, majority = true, highlight = null, total = 230 } = {}) {
  const order = Object.keys(seats).filter(p => seats[p] > 0).sort((a, b) => (G.parties[a]?.seatOrder ?? 500) - (G.parties[b]?.seatOrder ?? 500));
  const n = total; const rows = 8; const R = 100, r0 = 38;
  const pts = [];
  const radii = Array.from({ length: rows }, (_, i) => r0 + (R - r0) * (i / (rows - 1)));
  const totalLen = radii.reduce((s, r) => s + r, 0);
  let assigned = 0;
  radii.forEach((r, i) => {
    let k = i === rows - 1 ? n - assigned : Math.round(n * r / totalLen);
    assigned += k;
    for (let j = 0; j < k; j++) { const a = Math.PI - (Math.PI * (j + 0.5)) / k; pts.push({ x: 110 + r * Math.cos(a), y: 108 - r * Math.sin(a), a }); }
  });
  pts.sort((p, q) => q.a - p.a);
  const colors = []; for (const pid of order) for (let i = 0; i < seats[pid]; i++) colors.push(pid);
  const dots = pts.map((p, i) => { const pid = colors[i]; const c = pid ? G.parties[pid]?.color || '#888' : 'rgba(148,163,184,.18)'; const op = highlight && pid && !highlight.includes(pid) ? 0.25 : 1; return `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3.6" fill="${c}" opacity="${op}"/>`; }).join('');
  const sum = Object.values(seats).reduce((s, x) => s + x, 0);
  return `<svg viewBox="0 0 220 116" width="100%" style="max-width:${width}px;display:block;margin:auto">${dots}${majority ? `<line x1="110" y1="2" x2="110" y2="20" stroke="#d4af37" stroke-width="1" stroke-dasharray="2 2"/><text x="110" y="104" text-anchor="middle" font-size="15" font-weight="800" fill="#e8edf6">${sum}</text><text x="110" y="114" text-anchor="middle" font-size="6.5" fill="#93a1ba">maioria: 116</text>` : ''}</svg>`;
}

export function seatsLegend(G, seats) {
  const order = Object.keys(seats).filter(p => seats[p] > 0).sort((a, b) => seats[b] - seats[a]);
  return `<div class="legend">${order.map(p => `<span>${pchip(G.parties[p])} <b>${seats[p]}</b></span>`).join('')}</div>`;
}

// Gráfico de linhas simples (sondagens)
export function lineChart(series, { height = 160, yMax = null, labels = [] } = {}) {
  const W = 400, H = height, pad = 24;
  const all = series.flatMap(s => s.points);
  if (!all.length) return '<div class="muted small">Sem dados.</div>';
  const maxY = yMax || Math.max(10, Math.ceil(Math.max(...all) / 5) * 5);
  const n = Math.max(...series.map(s => s.points.length));
  const x = i => pad + (i / Math.max(1, n - 1)) * (W - pad * 2);
  const y = v => H - pad + 6 - (v / maxY) * (H - pad - 10);
  const grid = [0, 0.25, 0.5, 0.75, 1].map(f => `<line x1="${pad}" x2="${W - 6}" y1="${y(maxY * f)}" y2="${y(maxY * f)}" stroke="rgba(148,163,184,.12)"/><text x="2" y="${y(maxY * f) + 3}" font-size="9" fill="#64748b">${Math.round(maxY * f)}</text>`).join('');
  const lines = series.map(s => `<polyline fill="none" stroke="${s.color}" stroke-width="${s.bold ? 3 : 1.8}" stroke-linejoin="round" points="${s.points.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')}"/>`).join('');
  const lbl = labels.length ? `<text x="${pad}" y="${H - 2}" font-size="9" fill="#64748b">${esc(labels[0])}</text><text x="${W - 6}" y="${H - 2}" font-size="9" fill="#64748b" text-anchor="end">${esc(labels[labels.length - 1])}</text>` : '';
  return `<svg viewBox="0 0 ${W} ${H}" width="100%">${grid}${lines}${lbl}</svg>`;
}

export function resultBars(G, pct, seats = null, { max = null, limit = 9 } = {}) {
  const order = Object.keys(pct).filter(p => p !== 'out' && G.parties[p]).sort((a, b) => pct[b] - pct[a]).slice(0, limit);
  const m = max || Math.max(...order.map(p => pct[p]), 10);
  return order.map(p => { const P = G.parties[p]; return `<div class="result-row">${logoImg(P, 30)}<b>${esc(P.short)}</b>${bar(pct[p], m, P.color, 'thick')}<span class="right">${fmtPct(pct[p])}</span><span class="right">${seats ? `<b>${seats[p] || 0}</b>` : ''}</span></div>`; }).join('');
}

// ---------- Modais ----------
const modalRoot = () => document.getElementById('modal-root');
export function openModal({ title = '', body = '', actions = [], cls = '', icon = '', closable = true, onClose = null } = {}) {
  const el = h(`<div class="modal-back"><div class="modal ${cls}"><div class="modal-h">${icon ? `<span style="font-size:24px">${icon}</span>` : ''}<h2 class="grow">${title}</h2>${closable ? '<button class="btn ghost iconbtn" data-x>✕</button>' : ''}</div><div class="modal-b"></div><div class="modal-f"></div></div></div>`);
  const b = el.querySelector('.modal-b');
  if (typeof body === 'string') b.innerHTML = body; else if (body) b.appendChild(body);
  const f = el.querySelector('.modal-f');
  const close = (v) => { el.remove(); onClose && onClose(v); };
  if (!actions.length) f.remove();
  actions.forEach(a => {
    const btn = h(`<button class="btn ${a.cls || ''}">${a.label}</button>`);
    if (a.disabled) btn.disabled = true;
    btn.onclick = () => { sfx.click(); const r = a.onClick ? a.onClick(close, el) : undefined; if (a.close !== false && r !== false) close(a.value); };
    f.appendChild(btn);
  });
  el.querySelector('[data-x]')?.addEventListener('click', () => close(null));
  if (closable) el.addEventListener('mousedown', e => { if (e.target === el) close(null); });
  modalRoot().appendChild(el);
  return { el, close, body: b };
}

export function ask({ title, body = '', options = [], cls = '', icon = '', closable = false }) {
  return new Promise(res => {
    openModal({ title, body, cls, icon, closable, onClose: v => res(v), actions: options.map(o => ({ label: o.label, cls: o.cls, value: o.value, disabled: o.disabled })) });
  });
}
export const alertBox = (title, body, icon = 'ℹ️', label = 'Continuar') => ask({ title, body, icon, options: [{ label, value: true, cls: 'primary' }] });
export const confirmBox = (title, body, yes = 'Confirmar', no = 'Cancelar', icon = '❓') => ask({ title, body, icon, closable: true, options: [{ label: no, value: false }, { label: yes, value: true, cls: 'primary' }] });

export function toast(text, type = '') {
  const el = h(`<div class="toast ${type}">${text}</div>`);
  document.getElementById('toast-root').appendChild(el);
  setTimeout(() => { el.style.transition = 'opacity .4s'; el.style.opacity = '0'; setTimeout(() => el.remove(), 400); }, 3800);
  if (type === 'good') sfx.good(); else if (type === 'bad') sfx.bad(); else sfx.notify();
}

const tip = () => document.getElementById('tooltip');
export function showTip(html, x, y) { const t = tip(); t.innerHTML = html; t.classList.remove('hidden'); const w = t.offsetWidth, hh = t.offsetHeight; t.style.left = Math.min(window.innerWidth - w - 8, x + 14) + 'px'; t.style.top = Math.min(window.innerHeight - hh - 8, y + 14) + 'px'; }
export function hideTip() { tip().classList.add('hidden'); }

export function ideologyBars(ideo) {
  const row = (l, r, v) => `<div class="small row between muted"><span>${l}</span><span>${r}</span></div><div class="bar" style="margin-bottom:8px"><i style="left:${50 + Math.min(0, v) * 5}%;width:${Math.abs(v) * 5}%;background:${v < 0 ? '#e4002b' : '#3b82f6'}"></i><i style="left:calc(50% - 1px);width:2px;background:#fff;opacity:.5"></i></div>`;
  return row('Esquerda', 'Direita', ideo.econ) + row('Progressista', 'Conservador', ideo.social) + row('Institucional', 'Antissistema', ideo.sistema);
}
export { fmtSigned, withAlpha };
