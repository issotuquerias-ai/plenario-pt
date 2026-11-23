// "IA offline" — geração procedimental de texto em português europeu.
import { MEASURES, AREA_LABELS } from '../data/laws.js';
import * as CAMP from '../data/campaign.js';
import { analyzeText, detectAreas, checkConstitution } from './analyzer.js';
import { familyOf } from '../sim/ideology.js';
import { rng, RNG } from '../core/rng.js';
import { clamp, capitalize, normalizeText } from '../core/util.js';

// ---------- Nomes de partidos ----------
const NOUNS = [
  ['Movimento', 'm'], ['Aliança', 'f'], ['Partido', 'm'], ['União', 'f'], ['Frente', 'f'], ['Iniciativa', 'f'], ['Plataforma', 'f'],
  ['Ação', 'f'], ['Renovação', 'f'], ['Liga', 'f'], ['Convergência', 'f'], ['Força', 'f'], ['Bloco', 'm'], ['Pacto', 'm'], ['Compromisso', 'm'],
  ['Rumo', 'm'], ['Centro', 'm'], ['Assembleia', 'f'], ['Nova Via', 'f'], ['Coligação', 'f'],
];
// adjetivos [masculino, feminino]
const ADJ = {
  socialdemocrata: [['Social', 'Social'], ['Democrático', 'Democrática'], ['Progressista', 'Progressista'], ['Solidário', 'Solidária'], ['Republicano', 'Republicana']],
  socialista: [['Socialista', 'Socialista'], ['Popular', 'Popular'], ['Igualitário', 'Igualitária'], ['Trabalhista', 'Trabalhista']],
  comunista: [['Comunista', 'Comunista'], ['Operário', 'Operária'], ['Revolucionário', 'Revolucionária'], ['Proletário', 'Proletária']],
  ecologista: [['Verde', 'Verde'], ['Ecologista', 'Ecologista'], ['Sustentável', 'Sustentável'], ['Ecológico', 'Ecológica']],
  animalista: [['Animalista', 'Animalista'], ['Ecológico', 'Ecológica'], ['Verde', 'Verde']],
  centrista: [['Moderado', 'Moderada'], ['Cívico', 'Cívica'], ['Democrático', 'Democrática'], ['Reformista', 'Reformista'], ['Republicano', 'Republicana']],
  liberal: [['Liberal', 'Liberal'], ['Livre', 'Livre'], ['Reformista', 'Reformista'], ['Empreendedor', 'Empreendedora']],
  democrata_cristao: [['Democrata-Cristão', 'Democrata-Cristã'], ['Humanista', 'Humanista'], ['Personalista', 'Personalista']],
  conservador: [['Conservador', 'Conservadora'], ['Nacional', 'Nacional'], ['Tradicionalista', 'Tradicionalista'], ['Patriótico', 'Patriótica']],
  populista_direita: [['Nacional', 'Nacional'], ['Patriótico', 'Patriótica'], ['Soberanista', 'Soberanista'], ['Popular', 'Popular']],
  populista_esquerda: [['Popular', 'Popular'], ['Insubmisso', 'Insubmissa'], ['Indignado', 'Indignada'], ['Solidário', 'Solidária']],
  antissistema: [['Cidadão', 'Cidadã'], ['Independente', 'Independente'], ['Indignado', 'Indignada'], ['Livre', 'Livre']],
  regionalista: [['Regional', 'Regional'], ['Municipalista', 'Municipalista'], ['Interior', 'Interior'], ['Descentralizador', 'Descentralizadora']],
  tecnocrata: [['Reformista', 'Reformista'], ['Moderno', 'Moderna'], ['Inovador', 'Inovadora'], ['Digital', 'Digital']],
  monarquico: [['Monárquico', 'Monárquica'], ['Real', 'Real'], ['Tradicionalista', 'Tradicionalista']],
};
const IDEALS = {
  socialdemocrata: ['Progresso', 'Solidariedade', 'Futuro', 'Justiça Social'], socialista: ['Igualdade', 'Justiça Social', 'Trabalho', 'Dignidade'],
  comunista: ['Trabalhadores', 'Povo', 'Socialismo', 'Abril'], ecologista: ['Terra', 'Clima', 'Natureza', 'Futuro Verde'], animalista: ['Animais', 'Natureza', 'Vida'],
  centrista: ['Bom Senso', 'Consenso', 'Cidadania', 'Portugal'], liberal: ['Liberdade', 'Mérito', 'Prosperidade', 'Iniciativa'],
  democrata_cristao: ['Família', 'Pessoa', 'Bem Comum'], conservador: ['Ordem', 'Família', 'Tradição', 'Pátria'], populista_direita: ['Portugal Primeiro', 'Soberania', 'Ordem', 'Pátria'],
  populista_esquerda: ['Povo', 'Dignidade', 'Justiça'], antissistema: ['Mudança', 'Cidadãos', 'Basta', 'Transparência'], regionalista: ['Interior', 'Território', 'Regiões', 'Raízes'],
  tecnocrata: ['Futuro', 'Inovação', 'Ciência', 'Reforma'], monarquico: ['Coroa', 'Tradição', 'Portugal Real'],
};
const FEM_IDEALS = ['Solidariedade','Justiça Social','Igualdade','Dignidade','Terra','Natureza','Vida','Cidadania','Liberdade','Prosperidade','Iniciativa','Família','Pessoa','Ordem','Tradição','Pátria','Soberania','Justiça','Mudança','Transparência','Inovação','Ciência','Reforma','Coroa'];
const PLURAL = { 'Trabalhadores': 'mp', 'Animais': 'mp', 'Cidadãos': 'mp', 'Regiões': 'fp', 'Raízes': 'fp' };
function idealGender(i) { if (PLURAL[i]) return PLURAL[i]; if (/^(Portugal|Abril|Interior)/.test(i)) return 'x'; return FEM_IDEALS.includes(i) ? 'f' : 'm'; }
const STOP = new Set(['de', 'do', 'da', 'dos', 'das', 'e', 'pela', 'pelo', 'para', 'a', 'o', 'por', 'em']);

export function acronym(name) {
  const words = name.replace(/[–—-]/g, ' ').split(/\s+/).filter(w => w && !STOP.has(w.toLowerCase()));
  let a = words.map(w => w[0]).join('').toUpperCase();
  if (a.length < 2 && words[0]) a = words[0].slice(0, 3).toUpperCase();
  return a.normalize('NFD').replace(/[̀-ͯ]/g, '').slice(0, 5);
}

export function presetKey(family, ideology) {
  if (family && ADJ[family]) return family;
  const f = familyOf(ideology);
  return { esquerda: 'socialista', centro_esquerda: 'socialdemocrata', centro_direita: 'centrista', direita_liberal: 'liberal', direita_populista: 'populista_direita', ecologista: 'ecologista' }[f] || 'centrista';
}

export function generatePartyNames(ideology, family, n = 6, seed) {
  const r = seed ? new RNG(seed) : rng;
  const key = presetKey(family, ideology);
  const adjs = ADJ[key] || ADJ.centrista, ideals = IDEALS[key] || IDEALS.centrista;
  const out = new Set();
  let guard = 0;
  while (out.size < n && guard++ < 80) {
    const [noun, g] = r.pick(NOUNS);
    const adj = r.pick(adjs)[g === 'f' ? 1 : 0];
    const ideal = r.pick(ideals);
    const pattern = r.int(0, 5);
    const ig = idealGender(ideal);
    let name;
    switch (pattern) {
      case 0: name = `${noun} ${adj}`; break;
      case 1: name = `${noun} ${adj} ${g === 'f' ? 'Portuguesa' : 'Português'}`; break;
      case 2: name = `${noun} ${{ m: 'pelo', f: 'pela', mp: 'pelos', fp: 'pelas' }[ig]} ${ideal}`; break;
      case 3: name = ig === 'f' ? `Nova ${ideal}` : ig === 'm' ? `Novo ${ideal}` : `${noun} ${adj}`; break;
      case 4: name = `Portugal ${r.pick(['Maior', 'Livre', 'Justo', 'Novo', 'Primeiro', 'Inteiro', 'Unido', 'Vivo', 'Forte', 'Verde'])}`; break;
      default: { const i2 = r.pick(ideals.filter(i => i !== ideal)) || 'Futuro'; name = `${ideal} e ${i2}`; }
    }
    name = name.replace(/\s+/g, ' ').trim();
    out.add(name);
  }
  return [...out].map(name => ({ name, short: acronym(name) }));
}

// ---------- Slogans ----------
const SLOGAN_FALLBACK = {
  esquerda: ['Quem trabalha merece mais', 'Salários dignos, já!', 'Um país para a maioria', 'Abril de novo'],
  centro_esquerda: ['Portugal em frente', 'Juntos, mais justos', 'Cuidar de quem precisa', 'Um país que não deixa ninguém para trás'],
  centro_direita: ['Fazer Portugal crescer', 'Confiança para o futuro', 'Menos impostos, mais país', 'Trabalho e mérito'],
  direita_liberal: ['Liberdade para crescer', 'Menos Estado, melhor Estado', 'Acelerar Portugal', 'O teu dinheiro, a tua escolha'],
  direita_populista: ['Portugal primeiro', 'Basta de corrupção', 'Devolver Portugal aos portugueses', 'Ordem e justiça'],
  ecologista: ['O futuro é verde', 'Um planeta, um país, uma escolha', 'Viver melhor, poluir menos', 'Clima de mudança'],
};
export function generateSlogans(ideology, family, partyShort, n = 5, seed) {
  const r = seed ? new RNG(seed) : rng;
  const fam = familyOf(ideology);
  const ready = (CAMP.SLOGAN_PARTS?.byFamily?.[fam]) || SLOGAN_FALLBACK[fam] || SLOGAN_FALLBACK.centro_esquerda;
  const out = new Set(r.sample(ready, Math.min(n - 1, ready.length)));
  const sp = CAMP.SLOGAN_PARTS;
  if (sp?.verbs?.length && sp?.nouns?.length) {
    let guard = 0;
    while (out.size < n && guard++ < 20) out.add(`${capitalize(r.pick(sp.verbs))} ${r.pick(sp.nouns)}`);
  }
  out.add(`${partyShort}: ${r.pick(['a força da mudança', 'por um Portugal melhor', 'é agora', 'contigo', 'sem medo'])}`);
  return [...out].slice(0, n);
}

// ---------- Programa ----------
export function bucketFor(ideology, area) {
  const e = ideology.econ, s = ideology.social;
  if (['costumes', 'imigracao', 'seguranca', 'justica'].includes(area)) { if (s >= 3) return 'conservador'; if (s <= -3) return 'progressista'; }
  if (e <= -2) return 'esquerda';
  if (e >= 2) return 'direita';
  if (s >= 4) return 'conservador';
  if (s <= -4) return 'progressista';
  return 'neutro';
}
export function measuresFor(area, bucket) {
  const m = MEASURES?.[area]; if (!m) return [];
  return m[bucket]?.length ? m[bucket] : (m.neutro?.length ? m.neutro : Object.values(m).flat());
}
export function generateProgram(ideology, priorities = [], n = 6, seed) {
  const r = seed ? new RNG(seed) : rng;
  const areas = [...new Set([...priorities, ...r.shuffle(Object.keys(MEASURES || {}))])].slice(0, n + 2);
  const out = [];
  for (const a of areas) {
    const ms = measuresFor(a, bucketFor(ideology, a));
    if (ms.length) { const m = r.pick(ms); out.push({ area: a, title: m.title, text: m.text }); }
    if (out.length >= n) break;
  }
  return out;
}

// ---------- Leis a partir de um pedido em linguagem natural ----------
const TITLE_PREFIX = ['Lei', 'Regime jurídico', 'Programa nacional', 'Lei de bases', 'Medidas extraordinárias'];
export function composeLaw(request, ideology, opts = {}) {
  const r = opts.seed ? new RNG(opts.seed) : rng;
  const areas = detectAreas(request);
  const area = areas[0]?.area || opts.area || 'instituicoes';
  const req = normalizeText(request);
  let bucket = bucketFor(ideology, area);
  if (/(baixar|reduzir|descer|cortar|isentar|menos) (os |o )?(impostos?|irs|irc|iva)/.test(req)) bucket = 'direita';
  if (/(proibir|restringir|limitar|travar|expulsar|agravar)/.test(req) && ['imigracao', 'seguranca', 'justica', 'costumes'].includes(area)) bucket = 'conservador';
  if (/(legalizar|despenalizar|direitos|igualdade|integrar)/.test(req) && ['costumes', 'imigracao'].includes(area)) bucket = 'progressista';
  if (/(publico|nacionalizar|teto|congelar|gratuit)/.test(req)) bucket = 'esquerda';
  if (['saude', 'educacao', 'transportes', 'social'].includes(area) && /(reforcar|reforco|investir|contratar|aumentar|melhorar|reduzir as listas|mais medicos|sns|escola publica)/.test(req)) bucket = ideology.econ <= 1 ? 'esquerda' : 'neutro';
  const pool = measuresFor(area, bucket);
  const second = areas[1]?.area;
  const pool2 = second ? measuresFor(second, bucketFor(ideology, second)) : [];
  const chosen = r.sample(pool, Math.min(3, pool.length));
  if (pool2.length && chosen.length < 4) { const extra = r.pick(pool2); if (!chosen.includes(extra)) chosen.push(extra); }
  const label = (AREA_LABELS?.[area] || capitalize(area)).toLowerCase();
  const cleanReq = request.trim().replace(/^(eu )?(quero|queria|gostaria de|preciso de)\s+/i, '').replace(/^(criar |fazer )?(uma )?lei (para|que)\s+/i, '').replace(/[.!?]+$/, '');
  const title = chosen[0] ? `${r.pick(TITLE_PREFIX)} — ${chosen[0].title}` : `Lei sobre ${label}`;
  const articles = [`Artigo 1.º — Objeto: A presente lei visa ${cleanReq ? cleanReq.charAt(0).toLowerCase() + cleanReq.slice(1) : 'estabelecer medidas no domínio da ' + label}.`];
  chosen.forEach((m, i) => articles.push(`Artigo ${i + 2}.º — ${m.title}: ${m.text}`));
  articles.push(`Artigo ${chosen.length + 2}.º — Regulamentação: O Governo regulamenta a presente lei no prazo de 90 dias.`);
  articles.push(`Artigo ${chosen.length + 3}.º — Entrada em vigor: A presente lei entra em vigor no primeiro dia do mês seguinte ao da sua publicação.`);
  const ideo = { econ: 0, social: 0, sistema: 0 }; const effects = { groups: {}, econ: {} }; let cost = 0;
  for (const m of chosen) {
    for (const k in ideo) ideo[k] += (m.ideology?.[k] || 0) / chosen.length;
    for (const g in m.effects?.groups || {}) effects.groups[g] = (effects.groups[g] || 0) + m.effects.groups[g];
    for (const e in m.effects?.econ || {}) effects.econ[e] = (effects.econ[e] || 0) + m.effects.econ[e];
    for (const k of ['approval', 'unrest', 'eu', 'media', 'president']) if (m.effects?.[k]) effects[k] = (effects[k] || 0) + m.effects[k];
    cost += m.annualCost || 0;
  }
  for (const g in effects.groups) effects.groups[g] = clamp(Math.round(effects.groups[g]), -15, 15);
  if (!chosen.length) { const an = analyzeText(request); Object.assign(ideo, an.ideology); Object.assign(effects, an.effects); cost = an.annualCost; }
  const constitutional = checkConstitution(request + ' ' + articles.join(' '));
  return {
    title, summary: chosen.length ? `Proposta que prevê: ${chosen.map(m => m.title.toLowerCase()).join('; ')}.` : `Proposta na área da ${label}.`,
    articles, area, ideology: ideo, effects, annualCost: Math.round(cost), constitutional, source: 'ia',
  };
}

// Analisa uma lei escrita pelo jogador e devolve uma especificação jogável
export function lawFromPlayerText(title, body) {
  const an = analyzeText(title + '. ' + body);
  const lines = body.split(/\n+/).map(s => s.trim()).filter(Boolean);
  const articles = lines.length > 1 ? lines.map((l, i) => (/^artigo/i.test(l) ? l : `Artigo ${i + 1}.º — ${l}`)) : [`Artigo 1.º — ${body.trim()}`, 'Artigo 2.º — Entrada em vigor: A presente lei entra em vigor no dia seguinte ao da sua publicação.'];
  return { title: title.trim() || 'Lei sem título', summary: body.trim().slice(0, 220), articles, area: an.primaryArea, ideology: an.ideology, effects: an.effects, annualCost: an.annualCost, constitutional: an.constitutional, analysis: an, source: 'jogador' };
}

// ---------- Discursos ----------
const OPEN = ['Amigas e amigos,', 'Portuguesas e portugueses,', 'Caros companheiros,', 'Boa noite a todos!'];
const CLOSE = ['Viva Portugal!', 'Contamos convosco no dia das eleições!', 'Juntos, vamos vencer!', 'O futuro começa agora!'];
export function speech(themes, ideology, partyShort, town) {
  const fam = familyOf(ideology);
  const parts = [rng.pick(OPEN), `É uma honra estar aqui em ${town}.`];
  for (const t of themes) {
    const props = CAMP.TOPIC_PROPOSALS?.[t.topic || t.id]?.[fam] || CAMP.TOPIC_PROPOSALS?.[t.area]?.[fam];
    const prop = props ? rng.pick(props) : null;
    parts.push(prop ? `Sobre ${t.label.toLowerCase()}, o ${partyShort} tem uma proposta clara: ${prop}.` : `${t.label}: é aqui que se joga o futuro das nossas famílias, e nós não vamos desistir.`);
  }
  parts.push(rng.pick(CLOSE));
  return parts.join(' ');
}

export function decreeText(title, articles, year) {
  return [`DECRETO-LEI N.º __/${year}`, '', title.toUpperCase(), '', 'Ao abrigo dos poderes excecionais assumidos pelo Governo, decreta-se o seguinte:', '', ...articles, '', 'Publique-se e cumpra-se.'].join('\n');
}
