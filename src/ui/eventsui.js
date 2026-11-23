// Janela de acontecimentos com escolhas
import { resolveEvent } from '../ai/eventgen.js';
import { openModal, effectTags, toast, areaLabel } from './components.js';
import { esc, fmtPct } from '../core/util.js';
import { sfx } from '../audio/sfx.js';

const SEV = { 1: ['Menor', '#64748b'], 2: ['Relevante', '#d97706'], 3: ['Grave', '#dc2626'] };

export function showEvent(G, ev) {
  return new Promise(res => {
    sfx.notify();
    const sev = SEV[ev.severity] || SEV[1];
    const m = openModal({
      title: esc(ev.title), icon: ev.llm ? '🤖' : '📰', closable: false, cls: 'wide',
      body: `<div class="row" style="margin-bottom:8px"><span class="sev" style="background:${sev[1]}">${sev[0].toUpperCase()}</span><span class="tag">${esc(areaLabel(ev.area))}</span>${ev.llm ? '<span class="tag blue">Gerado pela IA local</span>' : ''}</div>
        <p style="font-size:15.5px">${esc(ev.text)}</p><div class="sep"></div>
        ${ev.options.map((o, i) => `<button class="option" data-i="${i}"><b>${esc(o.label)}</b><small>${esc(o.desc || '')}${o.chance ? ` · Probabilidade de sucesso: ${fmtPct(o.chance.p * 100, 0)}` : ''}</small>${effectTags(o.effects || o.chance?.success)}</button>`).join('')}`,
    });
    m.el.addEventListener('click', e => {
      const b = e.target.closest('.option'); if (!b) return;
      const r = resolveEvent(G, ev, +b.dataset.i);
      m.close();
      if (r.text) toast(esc(r.text), r.success === false ? 'bad' : r.success ? 'good' : '');
      res(r);
    });
  });
}

export async function showEvents(G, list) { for (const ev of list) await showEvent(G, ev); }
