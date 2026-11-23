// "IA offline" — analisador semântico de propostas de lei escritas em português.
// Deteta áreas, direção das medidas, posição ideológica, efeitos prováveis e riscos constitucionais.
import { AREA_KEYWORDS as KW_DATA } from '../data/laws.js';
import { normalizeText, clamp } from '../core/util.js';

const FALLBACK_KW = {
  impostos: ['imposto', 'irs', 'irc', 'iva', 'imi', 'imt', 'taxa', 'fiscal', 'tributa', 'derrama', 'contribuinte'],
  economia: ['empresa', 'economia', 'investimento', 'pme', 'privatiz', 'nacionaliz', 'industria', 'export', 'crescimento', 'tap', 'banco'],
  trabalho: ['salario', 'trabalhador', 'emprego', 'horario', 'greve', 'sindicat', 'despedimento', 'contrato', 'ferias', 'semana de 4', 'laboral'],
  saude: ['saude', 'sns', 'hospital', 'medico', 'enfermeir', 'urgencia', 'centro de saude', 'consulta', 'farmac', 'inem'],
  educacao: ['escola', 'professor', 'ensino', 'propina', 'universidade', 'aluno', 'educacao', 'manuais', 'creche'],
  habitacao: ['renda', 'casa', 'habitacao', 'alojamento local', 'senhorio', 'inquilino', 'arrendamento', 'devolut', 'imobiliari'],
  seguranca: ['policia', 'psp', 'gnr', 'crime', 'seguranca', 'videovigilancia', 'agente', 'esquadra', 'criminalidade'],
  justica: ['tribunal', 'juiz', 'pena', 'prisao', 'corrupcao', 'ministerio publico', 'justica', 'processo', 'cadeia'],
  imigracao: ['imigra', 'estrangeir', 'nacionalidade', 'fronteira', 'asilo', 'refugiad', 'visto', 'aima', 'deport', 'expuls'],
  ambiente: ['ambiente', 'clima', 'carbono', 'emiss', 'floresta', 'incendio', 'poluic', 'reciclag', 'plastico', 'litio', 'agua', 'seca'],
  energia: ['energia', 'eletric', 'renovav', 'solar', 'eolic', 'gas', 'combustive', 'petrole', 'nuclear', 'barragem'],
  transportes: ['transporte', 'comboio', 'ferrovi', 'metro', 'autocarro', 'portage', 'aeroporto', 'tgv', 'passe', 'estrada', 'cp'],
  social: ['pensao', 'pensoes', 'reforma', 'subsidio', 'pobreza', 'idoso', 'apoio social', 'rendimento', 'seguranca social', 'deficiencia'],
  defesa: ['militar', 'forcas armadas', 'defesa', 'nato', 'exercito', 'marinha', 'servico militar', 'armamento'],
  externa: ['europa', 'uniao europeia', 'diplomac', 'embaixad', 'tratado', 'onu', 'cplp', 'comunidades'],
  cultura: ['cultura', 'rtp', 'cinema', 'teatro', 'museu', 'artes', 'desporto', 'patrimonio', 'livro', 'comunicacao social'],
  agricultura: ['agricult', 'pesca', 'pescador', 'rural', 'gado', 'vinho', 'regadio', 'floresta'],
  instituicoes: ['deputad', 'eleic', 'mandato', 'parlamento', 'assembleia', 'presidente da republica', 'referendo', 'constituic', 'governo', 'partido', 'voto'],
  costumes: ['aborto', 'ivg', 'eutanasia', 'casamento', 'droga', 'canabis', 'tourada', 'burca', 'genero', 'prostitui', 'barrigas de aluguer'],
  regioes: ['regionaliz', 'regiao', 'interior', 'autarquia', 'municipio', 'descentraliz', 'madeira', 'acores', 'autonomia'],
};
const KW = (() => { const k = {}; const src = KW_DATA && Object.keys(KW_DATA).length ? KW_DATA : FALLBACK_KW; for (const a in src) k[a] = [...new Set([...(src[a] || []), ...(FALLBACK_KW[a] || [])].map(normalizeText))]; return k; })();

const DIR = {
  up: ['aumentar', 'aumento', 'subir', 'subida', 'reforcar', 'reforco', 'alargar', 'alargamento', 'expandir', 'investir', 'investimento', 'criar', 'criacao', 'contratar', 'contratacao', 'duplicar', 'garantir', 'gratuit', 'universal', 'apoiar', 'apoio', 'subsidi', 'incentiv', 'valorizar', 'melhorar', 'construir', 'construcao', 'mais ', 'reforcad', 'atualiz'],
  down: ['reduzir', 'reducao', 'baixar', 'baixa ', 'descida', 'descer', 'diminuir', 'cortar', 'corte', 'eliminar', 'eliminacao', 'abolir', 'abolicao', 'extinguir', 'extincao', 'acabar', 'fim d', 'isentar', 'isencao', 'menos ', 'congelar', 'suspender'],
  restrict: ['proibir', 'proibicao', 'interditar', 'banir', 'criminaliz', 'punir', 'penaliz', 'agravar', 'endurecer', 'restringir', 'restricao', 'limitar', 'limite', 'teto', 'tecto', 'controlar', 'controlo', 'vigiar', 'expulsar', 'deportar', 'obrigatori', 'quota'],
  liberal: ['legalizar', 'liberalizar', 'despenaliz', 'permitir', 'autorizar', 'desregul', 'simplificar', 'desburocratiz', 'privatiz', 'concession', 'concorrencia', 'liberdade de escolha', 'cheque'],
  state: ['nacionaliz', 'publico', 'publica', 'estatal', 'controlo publico', 'resgat', 'empresa publica'],
};
const RICH = ['ricos', 'fortuna', 'lucros', 'banca', 'bancos', 'grandes empresas', 'milionari', 'heranc', 'luxo', 'dividendos', 'especula'];
const STRONG = ['drastic', 'total', 'radical', 'imediat', 'todos', 'todas', 'absolut', 'inteiramente', 'completamente'];
const SOFT = ['progressiv', 'gradual', 'faseado', 'piloto', 'experimental', 'estudar', 'avaliar'];

const CONST_RULES = [
  { re: /pena de morte|pena capital|execucao dos condenados|fuzilamento/, articles: ['24.º'], issue: 'A vida humana é inviolável. Em caso algum haverá pena de morte.', severity: 'grave', limit288: true },
  { re: /prisao perpetua|penas? perpetuas?|duracao ilimitada|prisao para sempre/, articles: ['30.º'], issue: 'Não pode haver penas privativas da liberdade com caráter perpétuo ou de duração ilimitada.', severity: 'grave', limit288: true },
  { re: /castracao|tortura|castigos? corporais|chicot/, articles: ['25.º'], issue: 'A integridade moral e física das pessoas é inviolável.', severity: 'grave', limit288: true },
  { re: /censura|controlar (a )?(imprensa|comunicacao social)|proibir (os )?jornais|autorizacao previa para publicar/, articles: ['37.º', '38.º'], issue: 'Liberdade de expressão e de imprensa; proibição de qualquer censura.', severity: 'grave', limit288: true },
  { re: /(suspender|adiar|cancelar|abolir|acabar com) (as |todas as )?eleicoes|sem eleicoes/, articles: ['10.º', '113.º'], issue: 'O sufrágio universal, direto, secreto e periódico é limite material da revisão (art. 288.º, h).', severity: 'grave', limit288: true },
  { re: /(proibir|ilegalizar|extinguir|dissolver) (os |todos os )?partidos|partido unico/, articles: ['51.º'], issue: 'O pluralismo de expressão e organização política é limite material (art. 288.º, i).', severity: 'grave', limit288: true },
  { re: /(proibir|abolir|suspender) (o direito a |as )?greves?|fim do direito a greve/, articles: ['57.º'], issue: 'É garantido o direito à greve.', severity: 'grave', limit288: true },
  { re: /(proibir|extinguir|dissolver) (os )?sindicatos/, articles: ['55.º'], issue: 'Liberdade sindical.', severity: 'grave', limit288: true },
  { re: /(expuls|deport)\w* (de )?(cidadaos portugueses|portugueses|nacionais)/, articles: ['33.º'], issue: 'Não é admitida a expulsão de cidadãos portugueses do território nacional.', severity: 'grave', limit288: true },
  { re: /(retirar|perda da|perder a) nacionalidade/, articles: ['26.º'], issue: 'A privação da cidadania só pode ocorrer nos casos e termos da lei, nunca por motivos políticos.', severity: 'duvidosa', limit288: false },
  { re: /(ciganos?|muculman\w*|judeus?|negros?|africanos?|brasileiros?|homossexua\w*|lgbt)\b.*\b(proibir|proibidos|impedir|excluir|apenas|nao podem|restringir)|(proibir|impedir|excluir|restringir)\w*\b.*\b(ciganos?|muculman\w*|judeus?|negros?|homossexua\w*)/, articles: ['13.º'], issue: 'Princípio da igualdade: ninguém pode ser privilegiado ou prejudicado em razão da raça, religião, orientação sexual…', severity: 'grave', limit288: true },
  { re: /retroativ/, articles: ['29.º', '103.º'], issue: 'Proibição da retroatividade da lei penal desfavorável e dos impostos.', severity: 'duvidosa', limit288: false },
  { re: /burca|niqab|ocultacao do rosto|ocultar o rosto/, articles: ['41.º'], issue: 'Liberdade de consciência, de religião e de culto.', severity: 'duvidosa', limit288: false },
  { re: /enriquecimento (ilicito|injustificado|nao justificado)/, articles: ['32.º'], issue: 'Presunção de inocência e inversão do ónus da prova.', severity: 'duvidosa', limit288: false },
  { re: /(acabar com|extinguir|privatizar|fim do) (o )?(sns|servico nacional de saude)/, articles: ['64.º'], issue: 'O direito à proteção da saúde é realizado através de um SNS universal e geral.', severity: 'grave', limit288: false },
  { re: /monarquia|restaurar o rei|rei de portugal/, articles: ['288.º, b)'], issue: 'A forma republicana de governo é limite material da revisão constitucional.', severity: 'grave', limit288: true },
  { re: /religiao oficial|religiao do estado|estado catolico/, articles: ['41.º', '288.º, c)'], issue: 'Separação das igrejas do Estado.', severity: 'grave', limit288: true },
  { re: /independencia (da madeira|dos acores)|separatis/, articles: ['6.º', '288.º, a)'], issue: 'Unidade do Estado e integridade territorial.', severity: 'grave', limit288: true },
  { re: /sair da (ue|uniao europeia)|saida do euro|abandonar a uniao europeia/, articles: ['7.º', '8.º'], issue: 'Vinculação aos tratados europeus; exige revisão constitucional e processo do art. 50.º do TUE.', severity: 'duvidosa', limit288: false },
  { re: /(juizes|tribunais).*(nomeados pelo governo|controlo do governo)|extinguir o tribunal constitucional/, articles: ['203.º', '222.º'], issue: 'Independência dos tribunais (limite material, art. 288.º, m).', severity: 'grave', limit288: true },
];

// Regras área × direção → ideologia e efeitos
function rules(area, d, t) {
  const has = arr => arr.some(w => t.includes(w));
  const R = { ideo: { econ: 0, social: 0, sistema: 0 }, eff: { groups: {}, econ: {} }, cost: 0, label: '' };
  const g = (k, v) => (R.eff.groups[k] = (R.eff.groups[k] || 0) + v);
  const e = (k, v) => (R.eff.econ[k] = (R.eff.econ[k] || 0) + v);
  const I = (a, b, c) => { R.ideo.econ += a; R.ideo.social += b; R.ideo.sistema += c; };
  switch (area) {
    case 'impostos':
      if (d.up && has(RICH)) { I(-4, -0.5, 0.5); g('trabalhadores', 3); g('empresarios', -7); R.cost -= 600; R.label = 'Mais impostos sobre rendimentos elevados/lucros'; }
      else if (d.down || has(['isent'])) { I(3.5, 0.5, 0); g('classe_media', 5); g('empresarios', 4); g('trabalhadores', 2); e('deficit', 0.2); R.cost += 700; R.label = 'Descida de impostos'; }
      else if (d.up) { I(-2.5, 0, 0); g('classe_media', -5); g('empresarios', -4); R.cost -= 500; R.label = 'Aumento de impostos'; }
      break;
    case 'trabalho':
      if (has(['salario minimo', 'salarios', 'aumento salarial'])) { I(-3, 0, 0); g('trabalhadores', 7); g('empresarios', -5); e('unemployment', 0.1); R.label = 'Aumento dos salários'; }
      if (has(['semana de 4', 'semana de quatro', '35 horas', 'reduzir o horario'])) { I(-3, -1, 0); g('trabalhadores', 6); g('jovens', 4); g('empresarios', -6); e('gdp', -0.1); R.label = 'Redução do tempo de trabalho'; }
      if (d.liberal || has(['flexibiliz', 'despedimento', 'banco de horas'])) { I(4, 0, 0); g('empresarios', 7); g('trabalhadores', -7); e('unemployment', -0.1); e('gdp', 0.1); R.label = 'Flexibilização laboral'; }
      if (d.restrict && has(['greve'])) { I(3, 3, 2); g('trabalhadores', -8); g('funcpublicos', -6); }
      break;
    case 'saude':
      if (d.liberal || has(['privad', 'cheque', 'ppp', 'parceria'])) { I(4, 0, 0); g('saude', -2); g('classe_media', 2); e('waiting', -2); R.cost += 200; R.label = 'Mais privados na saúde'; }
      else if (d.up || d.state) { I(-2.5, 0, 0); g('saude', 7); g('pensionistas', 4); e('waiting', -5); R.cost += 650; R.label = 'Reforço do SNS'; }
      else if (d.down) { I(3, 0, 0); g('saude', -7); g('pensionistas', -5); e('waiting', 5); R.cost -= 400; }
      break;
    case 'educacao':
      if (d.liberal || has(['cheque-ensino', 'cheque ensino', 'privad'])) { I(4, 1, 0); g('professores', -4); g('classe_media', 2); R.cost += 150; }
      else if (d.up || has(['gratuit', 'propina'])) { I(-2.5, -1, 0); g('professores', 5); g('jovens', 5); R.cost += 450; R.label = 'Investimento na educação'; }
      else if (d.down) { I(2.5, 0, 0); g('professores', -6); g('jovens', -3); R.cost -= 300; }
      break;
    case 'habitacao':
      if (has(['teto', 'tecto', 'congelar', 'limitar']) && has(['renda', 'rendas'])) { I(-4.5, -1, 1); g('jovens', 7); g('classe_media', 3); g('empresarios', -4); e('housing', -1.5); R.label = 'Controlo das rendas'; }
      if (has(['construir', 'construcao', 'habitacao publica', 'casas publicas'])) { I(-2.5, 0, 0); g('jovens', 5); g('classe_media', 3); e('housing', -1); R.cost += 900; R.label = 'Construção de habitação pública'; }
      if (d.liberal || has(['isencao de imt', 'imt', 'licenciamento'])) { I(2, 0, 0); g('jovens', 3); g('empresarios', 3); e('housing', -0.5); R.cost += 150; }
      if (has(['alojamento local']) && (d.restrict || d.down)) { I(-3, -1, 0); g('jovens', 4); g('empresarios', -5); e('housing', -1); }
      if (has(['devolut', 'coerciv'])) { I(-4, 0, 1); g('jovens', 3); g('classe_media', -2); }
      break;
    case 'seguranca':
      if (d.up || has(['efetivos', 'mais policias', 'agentes'])) { I(0.5, 2.5, 1); g('seguranca', 7); e('crime', -3); R.cost += 250; R.label = 'Reforço das forças de segurança'; }
      if (d.restrict || has(['videovigilancia'])) { I(0.5, 3.5, 2); e('crime', -1.5); g('jovens', -1); }
      break;
    case 'justica':
      if (d.restrict || has(['agravar', 'penas mais'])) { I(0.5, 4, 2.5); e('crime', -1); g('seguranca', 3); R.label = 'Agravamento de penas'; }
      if (has(['corrupcao'])) { I(0, 1, 2); g('classe_media', 3); }
      if (d.up && has(['tribunais', 'juizes', 'oficiais de justica'])) { I(-1, 0, -1); R.cost += 120; }
      break;
    case 'imigracao':
      if (d.restrict || d.down || has(['quotas', 'expuls', 'deport', 'travar'])) { I(1, 5.5, 4); g('imigrantes', -12); g('empresarios', -2); g('trabalhadores', 1); R.label = 'Restrição da imigração'; }
      else if (d.up || has(['regulariz', 'integra', 'acolh', 'legaliz'])) { I(-1, -4.5, -1); g('imigrantes', 12); g('empresarios', 2); R.cost += 80; R.label = 'Integração de imigrantes'; }
      break;
    case 'ambiente':
      if (has(['litio', 'mineracao', 'explorar']) && !d.restrict) { I(2, 1, 0); g('agricultores', -2); g('interior', 2); e('gdp', 0.05); }
      else if (d.up || d.restrict) { I(-1.5, -3.5, 0); g('jovens', 4); g('empresarios', -3); g('agricultores', -2); R.cost += 150; R.label = 'Proteção ambiental'; }
      else if (d.down || d.liberal) { I(2.5, 1.5, 1); g('empresarios', 3); g('jovens', -3); }
      break;
    case 'energia':
      if (has(['renovav', 'solar', 'eolic'])) { I(-1, -2.5, 0); g('jovens', 3); R.cost += 200; R.label = 'Transição energética'; }
      if (has(['nuclear'])) { I(2, 1.5, 1.5); }
      if (d.down && has(['iva', 'preco', 'fatura'])) { I(-1, 0, 1); g('classe_media', 4); g('pensionistas', 4); R.cost += 350; }
      break;
    case 'transportes':
      if (has(['portage']) && (d.down || has(['fim', 'acabar', 'abolir']))) { I(-1, 0, 1.5); g('interior', 7); g('classe_media', 2); R.cost += 250; R.label = 'Fim das portagens'; }
      if (has(['passe', 'gratuit', 'ferrovi', 'comboio', 'metro'])) { I(-2, -1.5, 0); g('jovens', 4); g('interior', 2); g('trabalhadores', 2); R.cost += 300; R.label = 'Transportes públicos'; }
      if (has(['privatiz'])) { I(4.5, 0, 0); g('trabalhadores', -2); R.cost -= 100; }
      break;
    case 'social':
      if (d.up || has(['aumento das pensoes', 'aumento extraordinario'])) { I(-3, 0, 1); g('pensionistas', 8); e('deficit', 0.1); R.cost += 900; R.label = 'Reforço das pensões/apoios'; }
      else if (d.down || has(['idade da reforma'])) { I(3.5, 0, 0); g('pensionistas', -9); R.cost -= 600; }
      break;
    case 'defesa':
      if (d.up || has(['2%', '3,5%', 'servico militar'])) { I(0.5, 2.5, 0.5); g('seguranca', 3); R.cost += 900; R.label = 'Reforço da Defesa'; }
      if (has(['sair da nato', 'saida da nato'])) { I(-4, -1, 5); g('seguranca', -6); }
      break;
    case 'economia':
      if (has(['nacionaliz', 'controlo publico'])) { I(-6, 0, 2); g('empresarios', -7); g('trabalhadores', 2); R.cost += 400; R.label = 'Nacionalização'; }
      else if (has(['privatiz'])) { I(5, 0, 0); g('empresarios', 3); g('trabalhadores', -2); R.cost -= 300; R.label = 'Privatização'; }
      else if (d.up || has(['incentiv', 'pme', 'startup'])) { I(2, 0, 0); g('empresarios', 6); e('gdp', 0.1); R.cost += 250; R.label = 'Apoio às empresas'; }
      break;
    case 'cultura':
      if (has(['privatiz']) && has(['rtp'])) { I(4.5, 1, 1); g('classe_media', -1); R.cost -= 150; }
      else if (d.up) { I(-1.5, -1.5, 0); g('jovens', 2); R.cost += 90; R.label = 'Apoio à cultura'; }
      break;
    case 'agricultura':
      if (d.up || has(['apoio', 'seca', 'gasoleo'])) { I(0, 0.5, 0); g('agricultores', 9); g('interior', 3); R.cost += 180; R.label = 'Apoio à agricultura'; }
      break;
    case 'costumes':
      if (d.liberal || has(['legaliz', 'despenaliz'])) { I(0, -5.5, 0.5); g('jovens', 3); g('pensionistas', -3); R.label = 'Liberalização de costumes'; }
      if (d.restrict) { I(0, 5.5, 2); g('jovens', -3); g('pensionistas', 2); R.label = 'Restrição de costumes'; }
      if (has(['tourada']) && d.restrict) { R.ideo.social -= 9; g('agricultores', -4); g('interior', -3); }
      break;
    case 'instituicoes':
      if (has(['reduzir o numero de deputados', 'menos deputados', 'reducao de deputados'])) { I(1, 1, 4.5); g('classe_media', 2); }
      if (has(['limitacao de mandatos', 'limitar mandatos'])) I(0, 0, 2);
      if (has(['referendo'])) I(0, 0, 2.5);
      if (has(['exclusividade', 'subvencoes', 'privilegios'])) { I(0, 0, 3); g('classe_media', 2); }
      if (has(['voto eletronico', 'voto antecipado', 'mobilidade'])) { I(0, -1, -1); g('jovens', 2); }
      break;
    case 'regioes':
      if (has(['regionaliz', 'descentraliz'])) { I(-0.5, -0.5, 1); g('interior', 6); R.label = 'Regionalização'; }
      if (d.up && has(['interior'])) { I(-1, 0, 0.5); g('interior', 8); R.cost += 200; }
      if (has(['autonomia'])) { I(0, 0, 1.5); }
      break;
    case 'externa':
      if (has(['federal', 'integracao europeia'])) I(-0.5, -2, -2);
      if (has(['soberania', 'sair da'])) I(0, 2, 5);
      break;
    default: break;
  }
  return R;
}

export function detectAreas(text) {
  const t = ' ' + normalizeText(text) + ' ';
  const scores = {};
  for (const a in KW) for (const w of KW[a]) if (w && t.includes(w)) scores[a] = (scores[a] || 0) + (w.length > 6 ? 1.4 : 1);
  return Object.entries(scores).sort((a, b) => b[1] - a[1]).map(([area, score]) => ({ area, score }));
}

export function analyzeText(text) {
  const t = ' ' + normalizeText(text) + ' ';
  const d = {};
  for (const k in DIR) d[k] = DIR[k].some(w => t.includes(w));
  const areas = detectAreas(text);
  let intensity = 1;
  if (STRONG.some(w => t.includes(w))) intensity = 1.35;
  if (SOFT.some(w => t.includes(w))) intensity = 0.7;
  const pct = (t.match(/(\d+[.,]?\d*)\s?%/) || [])[1];
  const ideology = { econ: 0, social: 0, sistema: 0 };
  const effects = { groups: {}, econ: {} };
  let cost = 0; const labels = [];
  const used = areas.slice(0, 3);
  used.forEach((a, i) => {
    const w = i === 0 ? 1 : 0.55;
    const r = rules(a.area, d, t);
    for (const k in ideology) ideology[k] += r.ideo[k] * w;
    for (const g in r.eff.groups) effects.groups[g] = (effects.groups[g] || 0) + r.eff.groups[g] * w;
    for (const e in r.eff.econ) effects.econ[e] = (effects.econ[e] || 0) + r.eff.econ[e] * w;
    cost += r.cost * w; if (r.label) labels.push(r.label);
  });
  for (const k in ideology) ideology[k] = clamp(ideology[k] * intensity, -10, 10);
  for (const g in effects.groups) effects.groups[g] = clamp(Math.round(effects.groups[g] * intensity), -15, 15);
  for (const e in effects.econ) effects.econ[e] = Math.round(effects.econ[e] * intensity * 100) / 100;
  if (pct && Number(pct.replace(',', '.')) > 20) intensity *= 1.1;
  cost = Math.round(cost * intensity / 10) * 10;
  const constitutional = checkConstitution(text);
  const approval = clamp(Math.round(Object.values(effects.groups).reduce((s, v) => s + v, 0) / 8), -5, 5);
  if (approval) effects.approval = approval;
  if (constitutional) { effects.unrest = (effects.unrest || 0) + (constitutional.severity === 'grave' ? 8 : 3); effects.eu = constitutional.limit288 ? -8 : -2; effects.president = constitutional.severity === 'grave' ? -10 : -4; }
  if (!Object.keys(effects.econ).length) delete effects.econ;
  return {
    areas, primaryArea: areas[0]?.area || 'instituicoes', direction: d, intensity, ideology, effects, annualCost: cost, constitutional, labels,
    confidence: clamp(areas.reduce((s, a) => s + a.score, 0) / 4, 0.1, 1),
  };
}

export function checkConstitution(text) {
  const t = normalizeText(text);
  const hits = CONST_RULES.filter(r => r.re.test(t));
  if (!hits.length) return null;
  const grave = hits.find(h => h.severity === 'grave');
  const main = grave || hits[0];
  return { articles: [...new Set(hits.flatMap(h => h.articles))], issue: hits.map(h => h.issue).join(' '), severity: main.severity, limit288: hits.some(h => h.limit288) };
}
