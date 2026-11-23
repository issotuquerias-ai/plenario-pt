// Ligação opcional a um modelo de linguagem local via Ollama (https://ollama.com) — 100% offline.
// Se não estiver disponível, o jogo usa sempre o gerador procedimental.
import { SETTINGS } from '../core/state.js';

export async function ollamaStatus(url = SETTINGS.ai.url) {
  try {
    const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 2500);
    const r = await fetch(url.replace(/\/$/, '') + '/api/tags', { signal: ctl.signal });
    clearTimeout(t);
    if (!r.ok) return { ok: false, error: 'HTTP ' + r.status };
    const j = await r.json();
    return { ok: true, models: (j.models || []).map(m => m.name) };
  } catch (e) { return { ok: false, error: e.name === 'AbortError' ? 'Sem resposta' : 'Não foi possível ligar (verifique se o Ollama está a correr e OLLAMA_ORIGINS)' }; }
}

const SYSTEM = 'És o motor narrativo de um simulador político realista de Portugal. Escreves sempre em português europeu (pt-PT), com rigor institucional (Assembleia da República, Presidente da República, Tribunal Constitucional, Constituição de 1976). Nunca atribuis crimes ou citações inventadas a pessoas reais. Respondes apenas com JSON válido quando pedido.';

export async function ollamaJSON(prompt, { timeout, temperature = 0.8 } = {}) {
  const S = SETTINGS.ai;
  if (!S.enabled) throw new Error('IA local desativada');
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), (timeout || S.timeout || 45) * 1000);
  try {
    const r = await fetch(S.url.replace(/\/$/, '') + '/api/generate', {
      method: 'POST', signal: ctl.signal, headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: S.model, system: SYSTEM, prompt, stream: false, format: 'json', options: { temperature } }),
    });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const j = await r.json();
    return JSON.parse(j.response);
  } finally { clearTimeout(t); }
}
