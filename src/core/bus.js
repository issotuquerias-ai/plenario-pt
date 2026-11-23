// Barramento de eventos simples para a UI reagir a mudanças do estado.
const handlers = new Map();
export const bus = {
  on(ev, fn) { if (!handlers.has(ev)) handlers.set(ev, new Set()); handlers.get(ev).add(fn); return () => this.off(ev, fn); },
  off(ev, fn) { handlers.get(ev)?.delete(fn); },
  emit(ev, data) { handlers.get(ev)?.forEach(fn => { try { fn(data); } catch (e) { console.error('[bus]', ev, e); } }); },
};
