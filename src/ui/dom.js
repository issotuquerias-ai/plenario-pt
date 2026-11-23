// Utilitários de DOM
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export function h(html) { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; }
export const uiRoot = () => document.getElementById('ui-root');

// Liga ações declaradas com data-act="nome" (delegação de eventos). Devolve função para desligar.
export function bindActions(root, handlers, events = ['click']) {
  const fns = events.map(type => {
    const fn = ev => {
      const el = ev.target.closest('[data-act]');
      if (!el || !root.contains(el)) return;
      const name = el.dataset.act;
      const want = el.dataset.on || 'click';
      if (handlers[name] && want === type) handlers[name](el, ev);
    };
    root.addEventListener(type, fn);
    return [type, fn];
  });
  return () => fns.forEach(([t, f]) => root.removeEventListener(t, f));
}

export function typewriter(el, text, speed = 16, onTick) {
  return new Promise(res => {
    let i = 0; el.textContent = '';
    const t = setInterval(() => {
      i += Math.max(1, Math.round(text.length / 220));
      el.textContent = text.slice(0, i);
      if (onTick && i % 3 === 0) onTick();
      if (i >= text.length) { clearInterval(t); res(); }
    }, speed);
    el._skip = () => { clearInterval(t); el.textContent = text; res(); };
  });
}
