// Mapa interativo de Portugal (círculos eleitorais) em SVG.
import MAP from '../data/mapa.json';
import { DISTRICTS, DISTRICT_BY_ID } from '../data/districts.js';
import { esc } from '../core/util.js';
import { showTip, hideTip } from './components.js';

export function renderMap(container, { color = () => '#334155', label = d => d.name, tip = null, onClick = null, selected = null, opacity = () => 1 } = {}) {
  const parts = [];
  parts.push(`<svg viewBox="${MAP.viewBox}" preserveAspectRatio="xMidYMid meet">`);
  for (const ins of MAP.insets) parts.push(`<rect class="inset" x="${ins.x}" y="${ins.y}" width="${ins.w}" height="${ins.h}" rx="10"/><text x="${ins.x + 10}" y="${ins.y + 18}" font-size="12" fill="#93a1ba" font-weight="700">${ins.label}</text>`);
  for (const d of DISTRICTS) {
    const reg = MAP.regions[d.id];
    if (!reg) continue;
    parts.push(`<path class="d ${selected === d.id ? 'sel' : ''}" data-d="${d.id}" d="${reg.d}" fill="${color(d)}" fill-opacity="${opacity(d)}"/>`);
  }
  // círculos da emigração (caixas)
  const abroad = [{ id: 'europa', x: 24, y: 470, label: 'Europa' }, { id: 'fora', x: 150, y: 470, label: 'Fora da Europa' }];
  for (const a of abroad) parts.push(`<rect class="abroad ${selected === a.id ? 'sel' : ''}" data-d="${a.id}" x="${a.x}" y="${a.y}" width="118" height="54" rx="10" fill="${color(DISTRICT_BY_ID[a.id])}" fill-opacity="${opacity(DISTRICT_BY_ID[a.id])}" ${selected === a.id ? 'stroke="#d4af37" stroke-width="2.6"' : ''}/><text class="lbl" x="${a.x + 59}" y="${a.y + 24}">${a.label}</text><text class="lbl" x="${a.x + 59}" y="${a.y + 40}" style="font-size:9px">${esc(label(DISTRICT_BY_ID[a.id]) === DISTRICT_BY_ID[a.id].name ? 'Emigração' : label(DISTRICT_BY_ID[a.id]))}</text>`);
  for (const d of DISTRICTS) {
    const reg = MAP.regions[d.id]; if (!reg) continue;
    const l = label(d); if (!l) continue;
    parts.push(`<text class="lbl" x="${reg.cx}" y="${reg.cy}">${esc(l)}</text>`);
  }
  parts.push('</svg>');
  container.innerHTML = `<div class="map-wrap">${parts.join('')}</div>`;
  const svg = container.querySelector('svg');
  svg.addEventListener('click', e => { const el = e.target.closest('[data-d]'); if (el && onClick) onClick(el.dataset.d); });
  if (tip) {
    svg.addEventListener('mousemove', e => { const el = e.target.closest('[data-d]'); if (el) showTip(tip(DISTRICT_BY_ID[el.dataset.d]), e.clientX, e.clientY); else hideTip(); });
    svg.addEventListener('mouseleave', hideTip);
  }
}
