// Fachada da "IA": usa o modelo local (Ollama) se estiver ativo; caso contrário, o motor procedimental offline.
import { SETTINGS } from '../core/state.js';
import { ollamaJSON } from './ollama.js';
import { generatePartyNames, generateSlogans, generateProgram, composeLaw, lawFromPlayerText, acronym } from './textgen.js';
import { analyzeText, checkConstitution } from './analyzer.js';
import { spectrumLabel } from '../sim/ideology.js';
import { clamp } from '../core/util.js';

const useLLM = () => SETTINGS.ai?.enabled;
export const aiLabel = () => (useLLM() ? `IA local (${SETTINGS.ai.model})` : 'IA offline (motor procedimental)');

export async function partyIdentity({ ideology, family, hint = '' }) {
  const base = { names: generatePartyNames(ideology, family, 6), program: generateProgram(ideology, [], 6) };
  base.slogans = generateSlogans(ideology, family, base.names[0]?.short || 'NP', 5);
  if (!useLLM()) return base;
  try {
    const j = await ollamaJSON(`Cria a identidade de um novo partido político português. Posicionamento: ${spectrumLabel(ideology)} (economia ${ideology.econ}, sociedade ${ideology.social}, antissistema ${ideology.sistema}, escala -10 a 10). Família: ${family}. ${hint ? 'Indicações do fundador: ' + hint : ''}
Responde em JSON: {"nomes":[{"nome":"...","sigla":"..."} x5], "slogans":["..." x5], "programa":[{"titulo":"...","texto":"..."} x6], "descricao":"..."}`);
    return {
      names: (j.nomes || []).filter(x => x.nome).map(x => ({ name: x.nome, short: (x.sigla || acronym(x.nome)).slice(0, 6) })).concat(base.names).slice(0, 6),
      slogans: (j.slogans || []).concat(base.slogans).slice(0, 6),
      program: (j.programa || []).map(p => ({ title: p.titulo, text: p.texto, area: 'instituicoes' })).concat(base.program).slice(0, 6),
      description: j.descricao,
    };
  } catch (e) { console.warn('Ollama falhou, a usar motor offline', e); return base; }
}

// Gera uma lei a partir de um pedido em linguagem natural
export async function lawFromRequest(request, ideology) {
  const proc = composeLaw(request, ideology);
  if (!useLLM()) return proc;
  try {
    const j = await ollamaJSON(`Redige uma proposta de lei portuguesa (estilo Diário da República) que responda a este pedido do Governo: "${request}". Orientação política do proponente: ${spectrumLabel(ideology)}.
Responde em JSON: {"titulo":"...","resumo":"...","artigos":["Artigo 1.º — Objeto: ...","Artigo 2.º — ...", "..."]} com 4 a 7 artigos.`);
    const text = [j.titulo, j.resumo, ...(j.artigos || [])].join(' ');
    const an = analyzeText(request + ' ' + text);
    return { ...proc, title: j.titulo || proc.title, summary: j.resumo || proc.summary, articles: j.artigos?.length ? j.artigos : proc.articles, ideology: blend(proc.ideology, an.ideology), effects: an.effects?.groups && Object.keys(an.effects.groups).length ? an.effects : proc.effects, constitutional: checkConstitution(request + ' ' + text) || proc.constitutional, source: 'ia_local' };
  } catch (e) { console.warn(e); return proc; }
}
function blend(a, b) { return { econ: clamp((a.econ + b.econ) / 2, -10, 10), social: clamp((a.social + b.social) / 2, -10, 10), sistema: clamp((a.sistema + b.sistema) / 2, -10, 10) }; }

export function playerLaw(title, body) { return lawFromPlayerText(title, body); }
export { analyzeText, checkConstitution };

// Acontecimento gerado pelo modelo local (opcional)
export async function llmEvent(G, context) {
  if (!useLLM()) return null;
  try {
    const j = await ollamaJSON(`Situação: ${context}. Data: ${G.date}. Cria UM acontecimento político realista em Portugal que exija decisão do Governo.
JSON: {"titulo":"...","texto":"2-3 frases","area":"saude|habitacao|economia|trabalho|educacao|seguranca|ambiente|imigracao|justica|transportes|social|defesa","opcoes":[{"rotulo":"...","descricao":"...","aprovacao":-5..5,"custo_meur":0..800,"tensao_social":-10..10}] (3 opções)}`);
    if (!j.titulo || !j.opcoes?.length) return null;
    return {
      id: 'llm_' + Date.now(), tplId: 'llm', area: j.area || 'economia', severity: 2, date: G.date, title: j.titulo, text: j.texto, llm: true,
      options: j.opcoes.slice(0, 4).map(o => ({ label: o.rotulo, desc: o.descricao, effects: { approval: clamp(+o.aprovacao || 0, -6, 6), budget: clamp(+o.custo_meur || 0, 0, 1500), unrest: clamp(+o.tensao_social || 0, -10, 10) } })),
    };
  } catch { return null; }
}

// Lei Fundamental do regime a partir de princípios escolhidos/escritos
export async function regimeConstitution(principles, extraText) {
  const arts = principles.map((p, i) => `Artigo ${i + 1}.º — ${p.label}: ${p.article}`);
  if (extraText) arts.push(`Artigo ${arts.length + 1}.º — ${extraText}`);
  return arts;
}
