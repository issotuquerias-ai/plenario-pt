// PLENÁRIO PT — Catálogo de leis, medidas para a «IA» offline e palavras-chave por área.
// Textos em português europeu. Efeitos económicos = impacto de longo prazo (pontos percentuais);
// annualCost em milhões de euros por ano (positivo = custo, negativo = receita).

export const AREA_LABELS = {
  economia: 'Economia',
  impostos: 'Impostos e Finanças Públicas',
  trabalho: 'Trabalho',
  saude: 'Saúde',
  educacao: 'Educação',
  habitacao: 'Habitação',
  seguranca: 'Segurança Interna',
  justica: 'Justiça',
  imigracao: 'Imigração',
  ambiente: 'Ambiente e Clima',
  energia: 'Energia',
  transportes: 'Transportes e Infraestruturas',
  social: 'Segurança Social e Solidariedade',
  defesa: 'Defesa Nacional',
  externa: 'Negócios Estrangeiros e Europa',
  cultura: 'Cultura e Comunicação Social',
  agricultura: 'Agricultura e Pescas',
  instituicoes: 'Sistema Político e Instituições',
  costumes: 'Direitos Civis e Costumes',
  regioes: 'Regiões e Coesão Territorial'
};

export const AREA_KEYWORDS = {
  economia: ['economia', 'económico', 'economico', 'empresa', 'empresas', 'pme', 'investimento', 'crescimento', 'pib', 'exportação', 'exportacao', 'exportações', 'exportacoes', 'indústria', 'industria', 'privatização', 'privatizacao', 'privatizar', 'nacionalização', 'nacionalizacao', 'nacionalizar', 'mercado', 'concorrência', 'concorrencia', 'prr', 'fundos europeus', 'startup', 'inovação', 'inovacao', 'comércio'],
  impostos: ['imposto', 'impostos', 'irs', 'irc', 'iva', 'imi', 'imt', 'isp', 'taxa', 'taxas', 'fiscal', 'fiscais', 'tributação', 'tributacao', 'tributar', 'contribuinte', 'contribuintes', 'derrama', 'escalão', 'escalao', 'escalões', 'dedução', 'deducao', 'benefício fiscal', 'beneficio fiscal', 'orçamento', 'orcamento', 'défice', 'defice', 'dívida'],
  trabalho: ['trabalho', 'trabalhador', 'trabalhadores', 'salário', 'salario', 'salários', 'salarios', 'salário mínimo', 'salario minimo', 'emprego', 'desemprego', 'horário', 'horario', 'horas', 'greve', 'sindicato', 'sindicatos', 'despedimento', 'despedimentos', 'contrato', 'contratos', 'precariedade', 'precário', 'precario', 'recibos verdes', 'teletrabalho', 'férias', 'ferias', 'laboral', 'tsu'],
  saude: ['saúde', 'saude', 'sns', 'hospital', 'hospitais', 'médico', 'medico', 'médicos', 'medicos', 'enfermeiro', 'enfermeiros', 'urgência', 'urgencia', 'urgências', 'urgencias', 'centro de saúde', 'centro de saude', 'consulta', 'consultas', 'cirurgia', 'cirurgias', 'inem', 'medicamento', 'medicamentos', 'utente', 'utentes', 'listas de espera', 'médico de família', 'medico de familia', 'doentes'],
  educacao: ['educação', 'educacao', 'escola', 'escolas', 'professor', 'professores', 'aluno', 'alunos', 'ensino', 'universidade', 'universidades', 'propina', 'propinas', 'exame', 'exames', 'manuais', 'creche', 'creches', 'estudante', 'estudantes', 'ensino superior', 'currículo', 'curriculo', 'docente', 'docentes', 'bolsa', 'bolsas'],
  habitacao: ['habitação', 'habitacao', 'casa', 'casas', 'renda', 'rendas', 'arrendamento', 'alojamento local', 'imobiliário', 'imobiliario', 'senhorio', 'senhorios', 'inquilino', 'inquilinos', 'despejo', 'despejos', 'crédito à habitação', 'credito a habitacao', 'devoluta', 'devolutas', 'construção', 'construcao', 'fogos', 'condomínio', 'condominio', 'habitação pública', 'habitacao publica', 'imt'],
  seguranca: ['segurança', 'seguranca', 'polícia', 'policia', 'psp', 'gnr', 'crime', 'crimes', 'criminalidade', 'agente', 'agentes', 'videovigilância', 'videovigilancia', 'assalto', 'assaltos', 'violência', 'violencia', 'esquadra', 'patrulha', 'bodycam', 'bodycams', 'incêndio', 'incendio', 'incêndios', 'incendios', 'bombeiros', 'proteção civil', 'protecao civil'],
  justica: ['justiça', 'justica', 'tribunal', 'tribunais', 'juiz', 'juízes', 'juizes', 'pena', 'penas', 'prisão', 'prisao', 'prisões', 'prisoes', 'corrupção', 'corrupcao', 'ministério público', 'ministerio publico', 'processo', 'processos', 'recluso', 'reclusos', 'condenado', 'condenados', 'perpétua', 'perpetua', 'pena de morte', 'enriquecimento', 'castração', 'castracao', 'penal'],
  imigracao: ['imigração', 'imigracao', 'imigrante', 'imigrantes', 'estrangeiro', 'estrangeiros', 'nacionalidade', 'fronteira', 'fronteiras', 'asilo', 'refugiado', 'refugiados', 'vistos', 'visto', 'aima', 'autorização de residência', 'autorizacao de residencia', 'reagrupamento', 'quotas', 'expulsão', 'expulsao', 'migrantes', 'migração', 'migracao', 'naturalização', 'naturalizacao', 'cplp'],
  ambiente: ['ambiente', 'ambiental', 'clima', 'climática', 'climatica', 'carbono', 'emissões', 'emissoes', 'poluição', 'poluicao', 'floresta', 'florestas', 'água', 'agua', 'seca', 'rio', 'rios', 'oceano', 'mar', 'plástico', 'plastico', 'reciclagem', 'biodiversidade', 'natureza', 'lítio', 'litio', 'neutralidade carbónica', 'neutralidade carbonica', 'resíduos', 'residuos'],
  energia: ['energia', 'energético', 'energetico', 'eletricidade', 'electricidade', 'gás', 'gas', 'combustível', 'combustivel', 'combustíveis', 'combustiveis', 'gasolina', 'gasóleo', 'gasoleo', 'renovável', 'renovavel', 'renováveis', 'renovaveis', 'solar', 'eólica', 'eolica', 'nuclear', 'hidrogénio', 'hidrogenio', 'barragem', 'barragens', 'apagão', 'apagao', 'fatura da luz', 'tarifa'],
  transportes: ['transporte', 'transportes', 'comboio', 'comboios', 'ferrovia', 'ferroviário', 'ferroviario', 'cp', 'metro', 'autocarro', 'autocarros', 'tap', 'aeroporto', 'aeroportos', 'avião', 'aviao', 'portagem', 'portagens', 'autoestrada', 'autoestradas', 'estrada', 'estradas', 'tgv', 'alta velocidade', 'passe', 'mobilidade', 'ciclovia', 'automóvel', 'automovel'],
  social: ['pensão', 'pensao', 'pensões', 'pensoes', 'reforma', 'reformados', 'pensionista', 'pensionistas', 'segurança social', 'seguranca social', 'subsídio', 'subsidio', 'subsídios', 'subsidios', 'pobreza', 'rsi', 'rendimento social', 'abono', 'idosos', 'lar', 'lares', 'deficiência', 'deficiencia', 'csi', 'complemento solidário', 'prestação', 'prestacao', 'natalidade', 'cuidadores'],
  defesa: ['defesa', 'militar', 'militares', 'forças armadas', 'forcas armadas', 'exército', 'exercito', 'marinha', 'força aérea', 'forca aerea', 'nato', 'otan', 'serviço militar', 'servico militar', 'guerra', 'armamento', 'tropa', 'soldado', 'soldados', 'quartel', 'drones', 'ciberdefesa'],
  externa: ['europa', 'europeia', 'união europeia', 'uniao europeia', 'bruxelas', 'tratado', 'tratados', 'embaixada', 'embaixadas', 'diplomacia', 'diplomático', 'diplomatico', 'externa', 'internacional', 'onu', 'nações unidas', 'nacoes unidas', 'tarifas', 'estados unidos', 'ucrânia', 'ucrania', 'emigrantes', 'comunidades portuguesas', 'consulado', 'consulados', 'lusofonia'],
  cultura: ['cultura', 'cultural', 'rtp', 'televisão', 'televisao', 'rádio', 'radio', 'cinema', 'teatro', 'museu', 'museus', 'artes', 'artista', 'artistas', 'música', 'musica', 'livro', 'livros', 'biblioteca', 'património', 'patrimonio', 'comunicação social', 'comunicacao social', 'jornalismo', 'imprensa', 'desporto', 'futebol', 'tauromaquia'],
  agricultura: ['agricultura', 'agricultor', 'agricultores', 'agrícola', 'agricola', 'pesca', 'pescas', 'pescador', 'pescadores', 'rural', 'campo', 'gado', 'pecuária', 'pecuaria', 'vinho', 'vinha', 'olival', 'regadio', 'pac', 'colheita', 'gasóleo agrícola', 'gasoleo agricola', 'produtores', 'alimentar'],
  instituicoes: ['deputado', 'deputados', 'parlamento', 'assembleia', 'eleição', 'eleicao', 'eleições', 'eleicoes', 'eleitoral', 'voto', 'votar', 'mandato', 'mandatos', 'presidente da república', 'presidente da republica', 'ministério', 'ministerio', 'referendo', 'constituição', 'constituicao', 'partido', 'partidos', 'transparência', 'transparencia', 'lobbying', 'subvenção', 'subvencao', 'autarquia', 'autarquias', 'círculo', 'circulo'],
  costumes: ['aborto', 'ivg', 'eutanásia', 'eutanasia', 'casamento', 'canábis', 'canabis', 'cannabis', 'droga', 'drogas', 'tourada', 'touradas', 'burca', 'niqab', 'género', 'genero', 'lgbt', 'lgbti', 'igualdade', 'religião', 'religiao', 'família', 'familia', 'barrigas de aluguer', 'prostituição', 'prostituicao', 'animais', 'maus-tratos'],
  regioes: ['região', 'regiao', 'regiões', 'regioes', 'regionalização', 'regionalizacao', 'interior', 'açores', 'acores', 'madeira', 'autonomia', 'autonomias', 'coesão', 'coesao', 'despovoamento', 'desertificação', 'desertificacao', 'baixa densidade', 'concelho', 'concelhos', 'municípios', 'municipios', 'alentejo', 'algarve', 'trás-os-montes', 'tras-os-montes', 'beira', 'minho']
};

export const LAWS = [
  // ───────────── ECONOMIA ─────────────
  {
    id: 'pagamentos_30_dias', title: 'Pagamentos do Estado a 30 dias', area: 'economia', type: 'lei', decree: true,
    summary: 'Obriga o Estado, as autarquias e as empresas públicas a pagar aos fornecedores em 30 dias, com juros de mora automáticos.',
    articles: [
      'Artigo 1.º — Objeto: Prazos de pagamento das entidades públicas.',
      'Artigo 2.º — Prazo: As entidades públicas pagam as faturas no prazo máximo de 30 dias após a sua receção.',
      'Artigo 3.º — Juros: O atraso confere automaticamente direito a juros de mora, compensáveis com dívidas fiscais.'
    ],
    ideology: { econ: 2, social: 0, sistema: -1 }, salience: 0.3,
    effects: { econ: { gdp: 0.05 }, groups: { empresarios: 7 } },
    annualCost: 20, constitutional: null, partySupport: { il: 1, ad: 1 }, tags: ['PME', 'tesouraria']
  },
  {
    id: 'banco_fomento_pme', title: 'Banco de Fomento ao serviço das PME', area: 'economia', type: 'lei', decree: true,
    summary: 'Transforma o Banco Português de Fomento num banco de crédito direto às PME e à reindustrialização, com garantias públicas.',
    articles: [
      'Artigo 1.º — Objeto: Revisão do mandato do Banco Português de Fomento.',
      'Artigo 2.º — Crédito direto: O Banco pode conceder crédito direto a PME, com taxas bonificadas em setores estratégicos.',
      'Artigo 3.º — Reindustrialização: É criada uma linha de 2 mil milhões de euros para investimento industrial.'
    ],
    ideology: { econ: -3, social: 0, sistema: -1 }, salience: 0.3,
    effects: { econ: { gdp: 0.1, unemployment: -0.1 }, groups: { empresarios: 5, trabalhadores: 2, interior: 2 } },
    annualCost: 150, constitutional: null, partySupport: { ps: 1, livre: 1, il: -2 }, tags: ['PME', 'investimento']
  },
  {
    id: 'privatizacao_participacoes', title: 'Programa de venda de participações do Estado', area: 'economia', type: 'lei', decree: true,
    summary: 'Aliena participações do Estado em empresas não estratégicas e afeta a receita à amortização da dívida pública.',
    articles: [
      'Artigo 1.º — Objeto: Programa de alienação de participações sociais do Estado.',
      'Artigo 2.º — Âmbito: São alienadas as participações em empresas sem interesse estratégico, identificadas em anexo.',
      'Artigo 3.º — Consignação: A receita é integralmente afeta à redução da dívida pública.'
    ],
    ideology: { econ: 7, social: 0, sistema: 0 }, salience: 0.4,
    effects: { budget: -800, econ: { debt: -0.4 }, groups: { empresarios: 3, trabalhadores: -2 } },
    annualCost: 0, constitutional: null, partySupport: { il: 3, ad: 1, cdu: -3, be: -3 }, tags: ['privatizações', 'dívida']
  },
  // ───────────── IMPOSTOS ─────────────
  {
    id: 'irc_17', title: 'Descida do IRC para 17%', area: 'impostos', type: 'lei', decree: false,
    summary: 'Reduz a taxa geral de IRC de 20% para 17% em três anos e cria uma taxa de 12,5% para os primeiros 50 mil euros de lucro das PME.',
    articles: [
      'Artigo 1.º — Objeto: A presente lei altera o Código do IRC, reduzindo de forma faseada a taxa geral do imposto.',
      'Artigo 2.º — Taxa geral: A taxa de IRC é de 19% em 2027, 18% em 2028 e 17% a partir de 1 de janeiro de 2029.',
      'Artigo 3.º — PME: Os primeiros 50 000 euros de matéria coletável das pequenas e médias empresas são tributados à taxa de 12,5%.'
    ],
    ideology: { econ: 6, social: 0, sistema: -3 }, salience: 0.6,
    effects: { econ: { gdp: 0.2, unemployment: -0.1, deficit: 0.2 }, groups: { empresarios: 10, trabalhadores: -2 } },
    annualCost: 700, constitutional: null, partySupport: { ad: 2, il: 2, ch: 1, ps: -1 }, tags: ['IRC', 'empresas', 'competitividade']
  },
  {
    id: 'irc_15', title: 'Choque fiscal: IRC a 15%', area: 'impostos', type: 'lei', decree: false,
    summary: 'Reduz a taxa de IRC para 15% até 2029 e elimina gradualmente a derrama estadual.',
    articles: [
      'Artigo 1.º — Objeto: A presente lei estabelece uma trajetória de redução do IRC e da derrama estadual.',
      'Artigo 2.º — Taxa: A taxa geral de IRC é reduzida 1,5 pontos percentuais por ano até atingir 15% em 2029.',
      'Artigo 3.º — Derrama estadual: A derrama estadual é eliminada de forma progressiva até 1 de janeiro de 2030.'
    ],
    ideology: { econ: 8, social: 0, sistema: -1 }, salience: 0.6,
    effects: { econ: { gdp: 0.35, unemployment: -0.15, deficit: 0.45, debt: 0.5 }, groups: { empresarios: 15, trabalhadores: -4, funcpublicos: -3 } },
    annualCost: 1800, constitutional: null, partySupport: { il: 3, ad: 1, ch: 1, ps: -2, cdu: -3, be: -3 }, tags: ['IRC', 'choque fiscal']
  },
  {
    id: 'irs_jovem', title: 'IRS Jovem alargado até aos 35 anos', area: 'impostos', type: 'lei', decree: false,
    summary: 'Isenta de IRS os jovens até aos 35 anos no primeiro ano de trabalho e aplica isenções parciais nos anos seguintes, com teto de rendimento.',
    articles: [
      'Artigo 1.º — Objeto: A presente lei alarga o regime do IRS Jovem.',
      'Artigo 2.º — Âmbito: Beneficiam do regime os sujeitos passivos até aos 35 anos, independentemente das habilitações académicas.',
      'Artigo 3.º — Isenção: Os rendimentos do trabalho ficam isentos a 100% no primeiro ano e a 75% do segundo ao quarto ano, até ao limite de 55 vezes o IAS.'
    ],
    ideology: { econ: 4, social: 1, sistema: -2 }, salience: 0.7,
    effects: { econ: { emigration: -4, deficit: 0.2 }, groups: { jovens: 12, classe_media: 3, pensionistas: -3 } },
    annualCost: 1000, constitutional: null, partySupport: { ad: 2, il: 1 }, tags: ['IRS', 'jovens', 'emigração']
  },
  {
    id: 'englobamento', title: 'Englobamento obrigatório dos rendimentos', area: 'impostos', type: 'lei', decree: false,
    summary: 'Obriga ao englobamento dos rendimentos de capitais e prediais quando o rendimento total ultrapassa 100 mil euros anuais.',
    articles: [
      'Artigo 1.º — Objeto: A presente lei altera o Código do IRS em matéria de tributação dos rendimentos de capitais e prediais.',
      'Artigo 2.º — Englobamento: Os sujeitos passivos com rendimento coletável superior a 100 000 euros ficam obrigados a englobar todos os rendimentos.',
      'Artigo 3.º — Produção de efeitos: A presente lei aplica-se aos rendimentos auferidos a partir de 1 de janeiro do ano seguinte.'
    ],
    ideology: { econ: -6, social: -1, sistema: -1 }, salience: 0.4,
    effects: { econ: { deficit: -0.1 }, groups: { empresarios: -10, classe_media: -4, trabalhadores: 3 } },
    annualCost: -450, constitutional: null, partySupport: { be: 2, livre: 2, cdu: 1, il: -3, ad: -2 }, tags: ['IRS', 'justiça fiscal']
  },
  {
    id: 'lucros_extraordinarios', title: 'Taxa sobre lucros extraordinários', area: 'impostos', type: 'lei', decree: false,
    summary: 'Cria uma contribuição de 33% sobre os lucros que excedam em mais de 20% a média dos quatro anos anteriores nos setores da energia, banca e grande distribuição.',
    articles: [
      'Artigo 1.º — Objeto: É criada a contribuição de solidariedade sobre lucros extraordinários.',
      'Artigo 2.º — Incidência: Estão sujeitas as empresas dos setores energético, bancário e da grande distribuição alimentar.',
      'Artigo 3.º — Taxa: A contribuição é de 33% sobre a parte dos lucros tributáveis que exceda em 20% a média dos quatro exercícios anteriores.',
      'Artigo 4.º — Consignação: A receita é consignada ao apoio às famílias de baixos rendimentos.'
    ],
    ideology: { econ: -6, social: 0, sistema: 2 }, salience: 0.6,
    effects: { econ: { deficit: -0.1, gdp: -0.05 }, groups: { empresarios: -10, trabalhadores: 5, pensionistas: 3 } },
    annualCost: -400, constitutional: null, partySupport: { cdu: 2, be: 2, livre: 1, ch: 1, il: -3, ad: -1 }, tags: ['banca', 'energia', 'lucros']
  },
  {
    id: 'iva_zero_cabaz', title: 'IVA zero no cabaz alimentar', area: 'impostos', type: 'lei', decree: false,
    summary: 'Isenta de IVA um cabaz de 46 bens alimentares essenciais durante um ano, com monitorização dos preços pela ASAE.',
    articles: [
      'Artigo 1.º — Objeto: A presente lei estabelece a isenção temporária de IVA num cabaz de bens alimentares essenciais.',
      'Artigo 2.º — Bens abrangidos: A lista de bens consta do anexo e inclui pão, leite, ovos, fruta, legumes, carne e peixe.',
      'Artigo 3.º — Fiscalização: A ASAE acompanha a evolução dos preços e publica relatórios mensais.'
    ],
    ideology: { econ: -2, social: 0, sistema: 1 }, salience: 0.7,
    effects: { approval: 2, econ: { inflation: -0.3, deficit: 0.2 }, groups: { pensionistas: 8, trabalhadores: 6, classe_media: 4, agricultores: 2 } },
    annualCost: 600, constitutional: null, partySupport: { ch: 1, ps: 1 }, tags: ['IVA', 'custo de vida', 'inflação']
  },
  {
    id: 'grandes_fortunas', title: 'Imposto sobre grandes fortunas', area: 'impostos', type: 'lei', decree: false,
    summary: 'Cria um imposto anual de 1% a 2% sobre patrimónios líquidos superiores a 3 milhões de euros.',
    articles: [
      'Artigo 1.º — Objeto: É criado o imposto sobre o grande património.',
      'Artigo 2.º — Incidência: Estão sujeitos os patrimónios líquidos globais superiores a 3 000 000 de euros.',
      'Artigo 3.º — Taxas: A taxa é de 1% entre 3 e 10 milhões de euros e de 2% acima desse valor.'
    ],
    ideology: { econ: -8, social: -1, sistema: 2 }, salience: 0.5,
    effects: { econ: { gdp: -0.1, deficit: -0.05 }, groups: { empresarios: -12, trabalhadores: 4 } },
    annualCost: -250, constitutional: null, partySupport: { be: 3, cdu: 2, livre: 2, mrpp: 2, il: -3, ad: -2, ch: -1 }, tags: ['património', 'ricos']
  },
  {
    id: 'irs_classe_media', title: 'Descida do IRS para a classe média', area: 'impostos', type: 'lei', decree: false,
    summary: 'Reduz as taxas marginais do 3.º ao 8.º escalão de IRS e atualiza os escalões acima da inflação.',
    articles: [
      'Artigo 1.º — Objeto: A presente lei altera a tabela de taxas do artigo 68.º do Código do IRS.',
      'Artigo 2.º — Taxas: As taxas marginais do 3.º ao 8.º escalão são reduzidas entre 1 e 2 pontos percentuais.',
      'Artigo 3.º — Atualização: Os limites dos escalões são atualizados em 4,6%.'
    ],
    ideology: { econ: 3, social: 0, sistema: -2 }, salience: 0.7,
    effects: { approval: 2, econ: { deficit: 0.3, gdp: 0.1 }, groups: { classe_media: 10, trabalhadores: 6, funcpublicos: 4 } },
    annualCost: 1200, constitutional: null, partySupport: { ad: 2, ps: 1, il: 1 }, tags: ['IRS', 'classe média']
  },
  {
    id: 'isp_combustiveis', title: 'Redução do ISP nos combustíveis', area: 'impostos', type: 'lei', decree: true,
    summary: 'Reduz o imposto sobre os produtos petrolíferos em 10 cêntimos por litro durante um ano.',
    articles: [
      'Artigo 1.º — Objeto: Redução extraordinária das taxas unitárias do ISP aplicáveis à gasolina e ao gasóleo rodoviário.',
      'Artigo 2.º — Valor: A redução corresponde a 10 cêntimos por litro, incluindo o efeito no IVA.',
      'Artigo 3.º — Vigência: A medida vigora durante doze meses, sendo reavaliada trimestralmente.'
    ],
    ideology: { econ: 1, social: 1, sistema: 3 }, salience: 0.6,
    effects: { approval: 1, econ: { inflation: -0.2, deficit: 0.2 }, groups: { trabalhadores: 5, agricultores: 5, interior: 6, empresarios: 3 } },
    annualCost: 700, constitutional: null, partySupport: { ch: 2, il: 1, livre: -2, pan: -2 }, tags: ['combustíveis', 'ISP']
  },
  {
    id: 'iva_eletricidade', title: 'IVA da eletricidade e do gás a 6%', area: 'energia', type: 'lei', decree: false,
    summary: 'Aplica a taxa reduzida de IVA a todo o consumo doméstico de eletricidade e gás natural.',
    articles: [
      'Artigo 1.º — Objeto: A presente lei altera a Lista I anexa ao Código do IVA.',
      'Artigo 2.º — Taxa reduzida: O fornecimento de eletricidade e gás natural a clientes domésticos passa a ser tributado à taxa de 6%.'
    ],
    ideology: { econ: -1, social: 0, sistema: 2 }, salience: 0.5,
    effects: { econ: { inflation: -0.2, deficit: 0.15 }, groups: { pensionistas: 4, classe_media: 4, trabalhadores: 3 } },
    annualCost: 500, constitutional: null, partySupport: { cdu: 2, be: 1, ch: 1 }, tags: ['IVA', 'energia', 'custo de vida']
  },
  // ───────────── TRABALHO ─────────────
  {
    id: 'smn_1000', title: 'Salário mínimo de 1000 euros', area: 'trabalho', type: 'lei', decree: true,
    summary: 'Fixa a retribuição mínima mensal garantida em 1000 euros a partir de janeiro, com compensação às PME através da TSU.',
    articles: [
      'Artigo 1.º — Objeto: Atualização da retribuição mínima mensal garantida.',
      'Artigo 2.º — Valor: A retribuição mínima mensal garantida é fixada em 1000 euros.',
      'Artigo 3.º — Compensação: As micro e pequenas empresas beneficiam de uma redução de 1 ponto percentual na TSU durante doze meses.'
    ],
    ideology: { econ: -4, social: 0, sistema: 0 }, salience: 0.7,
    effects: { approval: 2, econ: { unemployment: 0.1, inflation: 0.1 }, groups: { trabalhadores: 12, jovens: 4, empresarios: -6 } },
    annualCost: 150, constitutional: null, partySupport: { ps: 1, livre: 1 }, tags: ['salário mínimo', 'rendimentos']
  },
  {
    id: 'smn_1100', title: 'Salário mínimo de 1100 euros já', area: 'trabalho', type: 'lei', decree: true,
    summary: 'Aumenta de imediato o salário mínimo nacional para 1100 euros, sem contrapartidas para as empresas.',
    articles: [
      'Artigo 1.º — Objeto: Aumento extraordinário da retribuição mínima mensal garantida.',
      'Artigo 2.º — Valor: A retribuição mínima mensal garantida é fixada em 1100 euros a partir do mês seguinte à publicação.'
    ],
    ideology: { econ: -7, social: 0, sistema: 2 }, salience: 0.7,
    effects: { econ: { unemployment: 0.3, inflation: 0.3, gdp: -0.1 }, groups: { trabalhadores: 15, jovens: 5, empresarios: -12, agricultores: -5 } },
    annualCost: 350, constitutional: null, partySupport: { cdu: 3, be: 2, mrpp: 2, il: -3, ad: -2 }, tags: ['salário mínimo']
  },
  {
    id: 'semana_4_dias', title: 'Semana de quatro dias', area: 'trabalho', type: 'lei', decree: false,
    summary: 'Generaliza a semana de 32 horas na Administração Pública e cria incentivos fiscais às empresas que a adotem sem perda salarial.',
    articles: [
      'Artigo 1.º — Objeto: A presente lei estabelece o regime da semana de quatro dias.',
      'Artigo 2.º — Administração Pública: O período normal de trabalho dos trabalhadores em funções públicas passa a ser de 32 horas semanais, distribuídas por quatro dias.',
      'Artigo 3.º — Setor privado: As empresas que adotem a semana de quatro dias sem redução salarial beneficiam de dedução majorada em IRC.'
    ],
    ideology: { econ: -4, social: -3, sistema: 0 }, salience: 0.6,
    effects: { econ: { gdp: -0.1 }, groups: { funcpublicos: 10, trabalhadores: 8, jovens: 6, empresarios: -6 } },
    annualCost: 250, constitutional: null, partySupport: { livre: 3, be: 2, pan: 1, il: -2 }, tags: ['horário', 'qualidade de vida']
  },
  {
    id: 'trabalho_xxi', title: 'Reforma laboral «Trabalho XXI»', area: 'trabalho', type: 'lei', decree: false,
    summary: 'Revê o Código do Trabalho: banco de horas individual, contratos a prazo mais longos, simplificação dos despedimentos por inadaptação e menos limites ao outsourcing.',
    articles: [
      'Artigo 1.º — Objeto: A presente lei procede à revisão do Código do Trabalho.',
      'Artigo 2.º — Banco de horas: É reintroduzido o banco de horas individual, por acordo entre trabalhador e empregador.',
      'Artigo 3.º — Contratação a termo: A duração máxima dos contratos a termo certo passa para três anos.',
      'Artigo 4.º — Despedimento: É simplificado o procedimento de despedimento por inadaptação.'
    ],
    ideology: { econ: 6, social: 1, sistema: -2 }, salience: 0.8,
    effects: { econ: { gdp: 0.2, unemployment: -0.2 }, groups: { empresarios: 12, trabalhadores: -12, jovens: -4 }, unrest: 6 },
    annualCost: 0,
    constitutional: { articles: ['53.º'], issue: 'Algumas normas sobre despedimento podem colidir com a garantia de segurança no emprego.', severity: 'duvidosa', limit288: false },
    partySupport: { il: 2, ad: 2, ps: -2, cdu: -3, be: -3, livre: -2 }, tags: ['código do trabalho', 'flexibilidade', 'concertação social']
  },
  {
    id: 'contratacao_coletiva', title: 'Fim da caducidade das convenções coletivas', area: 'trabalho', type: 'lei', decree: false,
    summary: 'Revoga a caducidade das convenções coletivas de trabalho e repõe o princípio do tratamento mais favorável ao trabalhador.',
    articles: [
      'Artigo 1.º — Objeto: A presente lei altera o regime da contratação coletiva previsto no Código do Trabalho.',
      'Artigo 2.º — Caducidade: As convenções coletivas mantêm-se em vigor até serem substituídas por outro instrumento negociado.',
      'Artigo 3.º — Tratamento mais favorável: É reposto o princípio do tratamento mais favorável ao trabalhador.'
    ],
    ideology: { econ: -5, social: 0, sistema: 0 }, salience: 0.4,
    effects: { groups: { trabalhadores: 8, funcpublicos: 2, empresarios: -8 } },
    annualCost: 0, constitutional: null, partySupport: { cdu: 3, be: 2, livre: 1, il: -2, ad: -1 }, tags: ['sindicatos', 'contratação coletiva']
  },
  {
    id: 'plataformas_digitais', title: 'Presunção de contrato nas plataformas digitais', area: 'trabalho', type: 'lei', decree: false,
    summary: 'Presume a existência de contrato de trabalho entre as plataformas digitais e os estafetas ou motoristas, reforçando a fiscalização da ACT.',
    articles: [
      'Artigo 1.º — Objeto: Regime laboral aplicável à atividade prestada através de plataformas digitais.',
      'Artigo 2.º — Presunção: Presume-se a existência de contrato de trabalho quando a plataforma fixa a retribuição ou controla a atividade.',
      'Artigo 3.º — Fiscalização: A ACT é reforçada com uma unidade dedicada às plataformas digitais.'
    ],
    ideology: { econ: -3, social: -1, sistema: 0 }, salience: 0.3,
    effects: { groups: { jovens: 5, trabalhadores: 5, imigrantes: 4, empresarios: -5 } },
    annualCost: 10, constitutional: null, partySupport: { be: 1, livre: 1, il: -2 }, tags: ['precariedade', 'estafetas']
  },
  // ───────────── SAÚDE ─────────────
  {
    id: 'dedicacao_plena', title: 'Dedicação plena generalizada no SNS', area: 'saude', type: 'lei', decree: true,
    summary: 'Alarga o regime de dedicação plena a todos os médicos do SNS, com majoração salarial de 25% e limite às horas extraordinárias.',
    articles: [
      'Artigo 1.º — Objeto: Alargamento do regime de dedicação plena no Serviço Nacional de Saúde.',
      'Artigo 2.º — Remuneração: Os médicos em dedicação plena têm um acréscimo remuneratório de 25%.',
      'Artigo 3.º — Trabalho suplementar: O trabalho suplementar fica limitado a 250 horas anuais.'
    ],
    ideology: { econ: -2, social: 0, sistema: -2 }, salience: 0.6,
    effects: { econ: { waiting: -4 }, groups: { saude: 8, pensionistas: 3 } },
    annualCost: 300, constitutional: null, partySupport: { ps: 1 }, tags: ['SNS', 'médicos']
  },
  {
    id: 'ppp_saude', title: 'Regresso das PPP nos hospitais', area: 'saude', type: 'lei', decree: true,
    summary: 'Permite a gestão de hospitais públicos em parceria público-privada, começando pelas cinco unidades com piores indicadores.',
    articles: [
      'Artigo 1.º — Objeto: Regime de gestão de estabelecimentos hospitalares do SNS em parceria público-privada.',
      'Artigo 2.º — Âmbito: O Governo lança concursos para a gestão de cinco hospitais, selecionados com base nos indicadores de desempenho.',
      'Artigo 3.º — Garantias: Os utentes mantêm todos os direitos de acesso ao SNS, sem qualquer custo adicional.'
    ],
    ideology: { econ: 5, social: 0, sistema: -1 }, salience: 0.5,
    effects: { econ: { waiting: -3 }, groups: { saude: -3, empresarios: 4, pensionistas: 2 } },
    annualCost: -80, constitutional: null, partySupport: { il: 2, ad: 1, cdu: -3, be: -3, livre: -2 }, tags: ['SNS', 'PPP', 'gestão']
  },
  {
    id: 'cheque_consulta', title: 'Cheque-consulta e cirurgia no privado', area: 'saude', type: 'lei', decree: true,
    summary: 'Quando o SNS ultrapassa os tempos máximos de resposta garantidos, o utente recebe um vale para consulta ou cirurgia no setor privado ou social.',
    articles: [
      'Artigo 1.º — Objeto: Garantia do cumprimento dos tempos máximos de resposta no SNS.',
      'Artigo 2.º — Vale: Ultrapassado o tempo máximo de resposta garantido, é emitido automaticamente um vale para o setor privado ou social.',
      'Artigo 3.º — Preço: O Estado paga ao prestador o preço praticado nos hospitais públicos.'
    ],
    ideology: { econ: 4, social: 0, sistema: 0 }, salience: 0.6,
    effects: { econ: { waiting: -6 }, groups: { pensionistas: 6, classe_media: 3, saude: -3, empresarios: 2 } },
    annualCost: 400, constitutional: null, partySupport: { il: 2, ch: 1, ad: 1, cdu: -2, be: -2 }, tags: ['SNS', 'listas de espera']
  },
  {
    id: 'medicos_familia', title: 'Médico de família para todos', area: 'saude', type: 'lei', decree: true,
    summary: 'Plano para atribuir médico de família a todos os utentes até 2028, com USF modelo C, incentivos à fixação no interior e contratação de recém-especialistas.',
    articles: [
      'Artigo 1.º — Objeto: Plano nacional de cobertura universal por médico de família.',
      'Artigo 2.º — Meta: Todos os utentes inscritos no SNS devem ter médico de família atribuído até 31 de dezembro de 2028.',
      'Artigo 3.º — Incentivos: Os médicos que se fixem em zonas carenciadas recebem um suplemento mensal e apoio à habitação.'
    ],
    ideology: { econ: -1, social: 0, sistema: -1 }, salience: 0.8,
    effects: { approval: 2, econ: { waiting: -7 }, groups: { pensionistas: 8, saude: 5, interior: 4, classe_media: 3 } },
    annualCost: 500, constitutional: null, partySupport: {}, tags: ['SNS', 'cuidados primários']
  },
  {
    id: 'medicos_estrangeiros', title: 'Reconhecimento acelerado de médicos estrangeiros', area: 'saude', type: 'lei', decree: true,
    summary: 'Simplifica o reconhecimento de diplomas de médicos formados fora da União Europeia, com estágio supervisionado no SNS.',
    articles: [
      'Artigo 1.º — Objeto: Regime extraordinário de reconhecimento de qualificações médicas obtidas no estrangeiro.',
      'Artigo 2.º — Procedimento: O reconhecimento é decidido em 90 dias, após prova de comunicação em português e estágio supervisionado.'
    ],
    ideology: { econ: 0, social: -2, sistema: -1 }, salience: 0.3,
    effects: { econ: { waiting: -3 }, groups: { saude: -4, imigrantes: 4, pensionistas: 2 } },
    annualCost: 40, constitutional: null, partySupport: { ch: -2 }, tags: ['SNS', 'imigração']
  },
  // ───────────── EDUCAÇÃO ─────────────
  {
    id: 'tempo_servico', title: 'Recuperação integral do tempo de serviço dos professores', area: 'educacao', type: 'lei', decree: true,
    summary: 'Devolve aos professores os 6 anos, 6 meses e 23 dias de serviço congelado, em cinco tranches até 2028.',
    articles: [
      'Artigo 1.º — Objeto: Recuperação do tempo de serviço docente congelado entre 2005 e 2017.',
      'Artigo 2.º — Faseamento: A recuperação de 2393 dias é feita em cinco tranches anuais de igual valor.',
      'Artigo 3.º — Efeitos: O tempo recuperado conta para a progressão na carreira e para a aposentação.'
    ],
    ideology: { econ: -3, social: 0, sistema: 0 }, salience: 0.6,
    effects: { econ: { deficit: 0.1 }, groups: { professores: 18, funcpublicos: 5 } },
    annualCost: 350, constitutional: null, partySupport: { cdu: 1, be: 1 }, tags: ['professores', 'carreiras']
  },
  {
    id: 'propinas_zero', title: 'Propinas zero no ensino superior', area: 'educacao', type: 'lei', decree: false,
    summary: 'Elimina as propinas de licenciatura e mestrado nas instituições de ensino superior público, compensando-as no orçamento.',
    articles: [
      'Artigo 1.º — Objeto: Gratuitidade da frequência do ensino superior público.',
      'Artigo 2.º — Propinas: É abolida a cobrança de propinas nos ciclos de licenciatura e mestrado integrado ou não integrado.',
      'Artigo 3.º — Compensação: O Estado transfere para as instituições o valor correspondente à receita perdida.'
    ],
    ideology: { econ: -5, social: -2, sistema: 0 }, salience: 0.6,
    effects: { econ: { emigration: -1 }, groups: { jovens: 12, classe_media: 5 } },
    annualCost: 350, constitutional: null, partySupport: { be: 2, cdu: 2, livre: 2, il: -2 }, tags: ['ensino superior', 'jovens']
  },
  {
    id: 'cheque_ensino', title: 'Cheque-ensino e liberdade de escolha', area: 'educacao', type: 'lei', decree: false,
    summary: 'As famílias passam a receber um valor por aluno que podem usar numa escola pública, privada ou cooperativa à sua escolha.',
    articles: [
      'Artigo 1.º — Objeto: Liberdade de escolha da escola pelas famílias.',
      'Artigo 2.º — Cheque-ensino: O Estado atribui por aluno um valor equivalente ao custo médio na escola pública.',
      'Artigo 3.º — Escolas aderentes: Podem aderir as escolas privadas e cooperativas que cumpram o currículo nacional.'
    ],
    ideology: { econ: 6, social: 3, sistema: 0 }, salience: 0.5,
    effects: { groups: { classe_media: 4, professores: -8, funcpublicos: -3 } },
    annualCost: 200, constitutional: null, partySupport: { il: 3, ch: 1, cdu: -3, be: -3, livre: -2 }, tags: ['liberdade de escolha', 'escolas']
  },
  {
    id: 'telemoveis_escolas', title: 'Proibição de telemóveis nas escolas até ao 9.º ano', area: 'educacao', type: 'lei', decree: true,
    summary: 'Proíbe o uso de telemóveis por alunos do 1.º ao 3.º ciclo durante todo o tempo escolar, incluindo recreios.',
    articles: [
      'Artigo 1.º — Objeto: Utilização de equipamentos móveis nos estabelecimentos de ensino básico.',
      'Artigo 2.º — Proibição: Os alunos do ensino básico não podem utilizar telemóveis durante as aulas e os intervalos.'
    ],
    ideology: { econ: 0, social: 2, sistema: 0 }, salience: 0.4,
    effects: { approval: 1, groups: { professores: 4, classe_media: 4, jovens: -4 } },
    annualCost: 0, constitutional: null, partySupport: {}, tags: ['escolas', 'digital']
  },
  {
    id: 'creche_gratuita', title: 'Creche gratuita para todas as crianças', area: 'educacao', type: 'lei', decree: true,
    summary: 'Alarga o programa Creche Feliz a todas as crianças até aos três anos, com construção de novas salas em parceria com o setor social.',
    articles: [
      'Artigo 1.º — Objeto: Universalização da gratuitidade das creches.',
      'Artigo 2.º — Âmbito: A frequência de creche é gratuita para todas as crianças, independentemente do rendimento familiar.',
      'Artigo 3.º — Rede: São criadas 20 000 novas vagas até 2029.'
    ],
    ideology: { econ: -3, social: -1, sistema: -1 }, salience: 0.5,
    effects: { groups: { classe_media: 7, jovens: 6, trabalhadores: 5 } },
    annualCost: 250, constitutional: null, partySupport: {}, tags: ['natalidade', 'família']
  },
  // ───────────── HABITAÇÃO ─────────────
  {
    id: 'teto_rendas', title: 'Teto às rendas em zonas de pressão', area: 'habitacao', type: 'lei', decree: false,
    summary: 'Limita os aumentos anuais das rendas a 2% e fixa valores máximos por metro quadrado nos concelhos com carência habitacional.',
    articles: [
      'Artigo 1.º — Objeto: Regime extraordinário de proteção dos arrendatários em zonas de pressão urbanística.',
      'Artigo 2.º — Aumentos: A atualização anual das rendas não pode exceder 2% durante três anos.',
      'Artigo 3.º — Valores máximos: Nos novos contratos, a renda não pode exceder o valor de referência por metro quadrado fixado para o concelho.'
    ],
    ideology: { econ: -6, social: -1, sistema: 1 }, salience: 0.8,
    effects: { econ: { housing: -2 }, groups: { jovens: 10, classe_media: 4, empresarios: -8 } },
    annualCost: 0,
    constitutional: { articles: ['62.º'], issue: 'Restrição relevante ao direito de propriedade e à liberdade contratual, que exige proporcionalidade.', severity: 'duvidosa', limit288: false },
    partySupport: { be: 2, livre: 2, cdu: 2, il: -3, ad: -2 }, tags: ['rendas', 'arrendamento']
  },
  {
    id: 'al_zonas_pressao', title: 'Fim de novos registos de Alojamento Local em zonas de pressão', area: 'habitacao', type: 'lei', decree: true,
    summary: 'Suspende a emissão de novos registos de alojamento local nas freguesias com carência habitacional declarada.',
    articles: [
      'Artigo 1.º — Objeto: Contenção do alojamento local em zonas de pressão urbanística.',
      'Artigo 2.º — Suspensão: Não são admitidos novos registos de alojamento local em freguesias com carência habitacional declarada pelo município.'
    ],
    ideology: { econ: -4, social: -1, sistema: 0 }, salience: 0.5,
    effects: { econ: { housing: -1.5 }, groups: { jovens: 6, empresarios: -6 } },
    annualCost: 0, constitutional: null, partySupport: { be: 1, livre: 1, il: -2 }, tags: ['alojamento local', 'turismo']
  },
  {
    id: 'casas_publicas', title: '50 mil casas públicas até 2030', area: 'habitacao', type: 'lei', decree: true,
    summary: 'Programa nacional de construção e reabilitação de 50 mil habitações públicas a custos acessíveis, financiado pelo PRR e pelo Orçamento.',
    articles: [
      'Artigo 1.º — Objeto: Programa Nacional de Habitação Pública Acessível.',
      'Artigo 2.º — Meta: São construídos ou reabilitados 50 000 fogos públicos até 2030.',
      'Artigo 3.º — Renda: As rendas não podem exceder 30% do rendimento do agregado familiar.'
    ],
    ideology: { econ: -5, social: -1, sistema: -1 }, salience: 0.8,
    effects: { approval: 2, econ: { housing: -2.5, deficit: 0.3 }, groups: { jovens: 10, classe_media: 6, trabalhadores: 4 } },
    annualCost: 900, constitutional: null, partySupport: { ps: 1, livre: 1, be: 1, cdu: 1 }, tags: ['habitação pública']
  },
  {
    id: 'imt_jovens', title: 'IMT zero na primeira casa para jovens', area: 'habitacao', type: 'lei', decree: false,
    summary: 'Isenta de IMT e de imposto do selo a compra da primeira habitação própria e permanente por jovens até aos 35 anos.',
    articles: [
      'Artigo 1.º — Objeto: Isenção de impostos na aquisição da primeira habitação por jovens.',
      'Artigo 2.º — Isenção: A aquisição de habitação própria e permanente até 316 mil euros por jovens até 35 anos está isenta de IMT e de imposto do selo.'
    ],
    ideology: { econ: 3, social: 1, sistema: -1 }, salience: 0.5,
    effects: { econ: { housing: 0.5 }, groups: { jovens: 8, classe_media: 3 } },
    annualCost: 150, constitutional: null, partySupport: { ad: 2, il: 1 }, tags: ['jovens', 'compra de casa']
  },
  {
    id: 'arrendamento_coercivo', title: 'Arrendamento coercivo de casas devolutas', area: 'habitacao', type: 'lei', decree: false,
    summary: 'Permite aos municípios arrendar compulsivamente imóveis devolutos há mais de dois anos em zonas de pressão, pagando renda ao proprietário.',
    articles: [
      'Artigo 1.º — Objeto: Mobilização de imóveis devolutos para habitação.',
      'Artigo 2.º — Arrendamento forçado: Os imóveis devolutos há mais de dois anos podem ser arrendados pelo município, que paga uma renda ao proprietário.',
      'Artigo 3.º — Garantias: O proprietário pode opor-se provando a realização de obras ou a intenção de habitar o imóvel.'
    ],
    ideology: { econ: -7, social: -1, sistema: 1 }, salience: 0.6,
    effects: { econ: { housing: -1 }, groups: { empresarios: -10, classe_media: -3, jovens: 4 } },
    annualCost: 30,
    constitutional: { articles: ['62.º'], issue: 'Intervenção forte no direito de propriedade privada, com sérias dúvidas de proporcionalidade.', severity: 'duvidosa', limit288: false },
    partySupport: { be: 1, cdu: 1, ch: -2, il: -3, ad: -2 }, tags: ['devolutos', 'propriedade']
  },
  {
    id: 'simplex_construcao', title: 'Simplex urbanístico e IVA a 6% na construção', area: 'habitacao', type: 'lei', decree: false,
    summary: 'Introduz o deferimento tácito nos licenciamentos e aplica IVA a 6% à construção de habitação a preços moderados.',
    articles: [
      'Artigo 1.º — Objeto: Simplificação do licenciamento urbanístico e incentivo fiscal à construção.',
      'Artigo 2.º — Licenciamento: Os pedidos de licenciamento consideram-se deferidos se não houver decisão em 60 dias.',
      'Artigo 3.º — IVA: A construção de habitação para venda ou arrendamento a preços moderados é tributada a 6%.'
    ],
    ideology: { econ: 5, social: 0, sistema: -1 }, salience: 0.5,
    effects: { econ: { housing: -1.5, gdp: 0.1 }, groups: { empresarios: 8, jovens: 3 } },
    annualCost: 300, constitutional: null, partySupport: { il: 2, ad: 2 }, tags: ['construção', 'licenciamento']
  },
  {
    id: 'garantia_credito_jovem', title: 'Garantia pública no crédito à habitação para jovens', area: 'habitacao', type: 'lei', decree: true,
    summary: 'O Estado garante até 15% do valor do empréstimo para que os jovens possam comprar casa sem entrada inicial.',
    articles: [
      'Artigo 1.º — Objeto: Garantia pública na aquisição de habitação própria por jovens.',
      'Artigo 2.º — Garantia: O Estado presta garantia até 15% do valor da transação, permitindo financiamento bancário a 100%.'
    ],
    ideology: { econ: 2, social: 0, sistema: -1 }, salience: 0.4,
    effects: { econ: { housing: 0.5 }, groups: { jovens: 7 } },
    annualCost: 30, constitutional: null, partySupport: { ad: 1 }, tags: ['jovens', 'crédito']
  },
  // ───────────── SEGURANÇA E JUSTIÇA ─────────────
  {
    id: 'policias_reforco', title: 'Reforço de efetivos da PSP e da GNR', area: 'seguranca', type: 'lei', decree: true,
    summary: 'Recruta 4000 novos agentes e militares em dois anos e revê o suplemento de risco das forças de segurança.',
    articles: [
      'Artigo 1.º — Objeto: Programa extraordinário de reforço das forças de segurança.',
      'Artigo 2.º — Recrutamento: São abertos concursos para 4000 novos elementos da PSP e da GNR.',
      'Artigo 3.º — Suplemento de risco: O suplemento por serviço e risco é aumentado em 200 euros mensais.'
    ],
    ideology: { econ: -1, social: 3, sistema: 0 }, salience: 0.6,
    effects: { approval: 1, econ: { crime: -5 }, groups: { seguranca: 15 } },
    annualCost: 300, constitutional: null, partySupport: { ch: 2, ad: 1 }, tags: ['polícias', 'segurança']
  },
  {
    id: 'videovigilancia', title: 'Videovigilância e bodycams nas forças de segurança', area: 'seguranca', type: 'lei', decree: false,
    summary: 'Autoriza a videovigilância nas zonas urbanas de maior criminalidade e generaliza as câmaras corporais nos agentes.',
    articles: [
      'Artigo 1.º — Objeto: Utilização de sistemas de videovigilância e câmaras corporais.',
      'Artigo 2.º — Videovigilância: Os municípios podem instalar câmaras em zonas de elevada criminalidade, mediante parecer da CNPD.',
      'Artigo 3.º — Câmaras corporais: Os agentes em patrulha passam a usar câmaras corporais.'
    ],
    ideology: { econ: 0, social: 4, sistema: 2 }, salience: 0.4,
    effects: { econ: { crime: -2 }, groups: { seguranca: 6, jovens: -2 } },
    annualCost: 40,
    constitutional: { articles: ['26.º', '35.º'], issue: 'É necessário garantir a reserva da intimidade da vida privada e a proteção de dados pessoais.', severity: 'duvidosa', limit288: false },
    partySupport: { ch: 2, ad: 1, be: -2 }, tags: ['segurança', 'privacidade']
  },
  {
    id: 'prisao_perpetua', title: 'Prisão perpétua para crimes hediondos', area: 'justica', type: 'lei', decree: false,
    summary: 'Introduz a pena de prisão perpétua para homicídios qualificados múltiplos, terrorismo e crimes sexuais graves contra menores.',
    articles: [
      'Artigo 1.º — Objeto: Alteração ao Código Penal para introdução da pena de prisão perpétua.',
      'Artigo 2.º — Pena: É aplicável a pena de prisão perpétua aos crimes de homicídio qualificado múltiplo, terrorismo e abuso sexual agravado de menores.',
      'Artigo 3.º — Revisão: A pena pode ser revista ao fim de 25 anos de cumprimento efetivo.'
    ],
    ideology: { econ: 1, social: 9, sistema: 7 }, salience: 0.8,
    effects: { econ: { crime: -1 }, groups: { seguranca: 5, classe_media: 2 }, president: -10, eu: -4, media: -3 },
    annualCost: 20,
    constitutional: { articles: ['30.º'], issue: 'O artigo 30.º proíbe penas ou medidas de segurança privativas da liberdade com caráter perpétuo ou de duração ilimitada.', severity: 'grave', limit288: true },
    partySupport: { ch: 3, adn: 3, nd: 2, ad: -2, ps: -3, il: -2, livre: -3, be: -3, cdu: -3, pan: -3 }, tags: ['penas', 'populismo penal']
  },
  {
    id: 'castracao_quimica', title: 'Castração química para abusadores de menores', area: 'justica', type: 'lei', decree: false,
    summary: 'Impõe a castração química como pena acessória para condenados por crimes sexuais contra menores.',
    articles: [
      'Artigo 1.º — Objeto: Alteração ao Código Penal em matéria de crimes sexuais contra menores.',
      'Artigo 2.º — Pena acessória: Os condenados por abuso sexual de crianças ficam sujeitos a tratamento farmacológico de inibição da libido.'
    ],
    ideology: { econ: 0, social: 8, sistema: 6 }, salience: 0.6,
    effects: { groups: { seguranca: 3 }, president: -8, eu: -3, media: -3 },
    annualCost: 5,
    constitutional: { articles: ['25.º', '30.º'], issue: 'Viola a integridade física e a proibição de penas cruéis, degradantes ou desumanas.', severity: 'grave', limit288: true },
    partySupport: { ch: 3, adn: 2, nd: 2, ps: -3, livre: -3, be: -3, pan: -2, il: -2, ad: -2 }, tags: ['penas', 'crimes sexuais']
  },
  {
    id: 'pena_morte', title: 'Reintrodução da pena de morte', area: 'justica', type: 'lei', decree: false,
    summary: 'Reintroduz a pena capital para crimes de terrorismo e homicídio múltiplo.',
    articles: [
      'Artigo 1.º — Objeto: Reintrodução da pena de morte no ordenamento jurídico português.',
      'Artigo 2.º — Crimes abrangidos: A pena de morte é aplicável aos crimes de terrorismo com vítimas mortais e de homicídio qualificado múltiplo.'
    ],
    ideology: { econ: 1, social: 10, sistema: 10 }, salience: 0.9,
    effects: { approval: -3, president: -20, eu: -15, unrest: 8, media: -8 },
    annualCost: 0,
    constitutional: { articles: ['24.º'], issue: 'Em caso algum haverá pena de morte (artigo 24.º, n.º 2). Portugal aboliu-a para crimes civis em 1867.', severity: 'grave', limit288: true },
    partySupport: { ch: -1, ad: -3, ps: -3, il: -3, livre: -3, be: -3, cdu: -3, pan: -3, jpp: -3, volt: -3 }, tags: ['penas', 'direitos fundamentais']
  },
  {
    id: 'enriquecimento_ilicito', title: 'Criminalização do enriquecimento injustificado', area: 'justica', type: 'lei', decree: false,
    summary: 'Cria o crime de ocultação de riqueza injustificada por titulares de cargos políticos e altos cargos públicos.',
    articles: [
      'Artigo 1.º — Objeto: Criminalização da ocultação de enriquecimento por titulares de cargos públicos.',
      'Artigo 2.º — Crime: Quem, sendo titular de cargo político, não declarar acréscimos patrimoniais superiores a 50 salários mínimos é punido com pena de prisão até cinco anos.'
    ],
    ideology: { econ: 0, social: 2, sistema: 4 }, salience: 0.6,
    effects: { approval: 1, media: 3, groups: { classe_media: 4 } },
    annualCost: 5,
    constitutional: { articles: ['32.º'], issue: 'Risco de inversão do ónus da prova e de violação da presunção de inocência; o Tribunal Constitucional já chumbou versões anteriores.', severity: 'duvidosa', limit288: false },
    partySupport: { ch: 2, be: 1, cdu: 1, livre: 1 }, tags: ['corrupção', 'transparência']
  },
  {
    id: 'agenda_anticorrupcao', title: 'Agenda anticorrupção e proteção de denunciantes', area: 'justica', type: 'lei', decree: false,
    summary: 'Reforça o Mecanismo Nacional Anticorrupção, protege os denunciantes e cria tribunais especializados em criminalidade económica.',
    articles: [
      'Artigo 1.º — Objeto: Reforço dos instrumentos de prevenção e combate à corrupção.',
      'Artigo 2.º — Denunciantes: Os denunciantes de boa-fé beneficiam de proteção contra represálias e de anonimato.',
      'Artigo 3.º — Tribunais: São criados juízos especializados em criminalidade económico-financeira em Lisboa e no Porto.'
    ],
    ideology: { econ: 0, social: 0, sistema: 1 }, salience: 0.5,
    effects: { approval: 1, media: 4, groups: { classe_media: 3 } },
    annualCost: 25, constitutional: null, partySupport: {}, tags: ['corrupção', 'justiça']
  },
  {
    id: 'justica_celere', title: 'Justiça mais rápida', area: 'justica', type: 'lei', decree: false,
    summary: 'Fixa prazos máximos para as decisões judiciais, limita expedientes dilatórios e contrata 1000 oficiais de justiça.',
    articles: [
      'Artigo 1.º — Objeto: Medidas de celeridade processual.',
      'Artigo 2.º — Prazos: Os processos cíveis e administrativos devem ser decididos em primeira instância no prazo máximo de 18 meses.',
      'Artigo 3.º — Recursos humanos: São abertos concursos para 1000 oficiais de justiça.'
    ],
    ideology: { econ: 1, social: 0, sistema: -1 }, salience: 0.4,
    effects: { econ: { gdp: 0.05 }, groups: { funcpublicos: 4, empresarios: 4 } },
    annualCost: 120, constitutional: null, partySupport: {}, tags: ['tribunais', 'oficiais de justiça']
  },
  // ───────────── IMIGRAÇÃO ─────────────
  {
    id: 'nacionalidade_restritiva', title: 'Lei da Nacionalidade mais exigente', area: 'imigracao', type: 'lei_organica', decree: false,
    summary: 'Exige 10 anos de residência legal para a naturalização, prova de português e de cultura cívica, e prevê a perda da nacionalidade adquirida em caso de crimes graves.',
    articles: [
      'Artigo 1.º — Objeto: Alteração à Lei da Nacionalidade.',
      'Artigo 2.º — Naturalização: O prazo de residência legal exigido passa de cinco para dez anos.',
      'Artigo 3.º — Requisitos: É exigida prova de conhecimento da língua portuguesa, da história e dos princípios do Estado de direito democrático.',
      'Artigo 4.º — Perda: A nacionalidade adquirida há menos de dez anos pode ser perdida em caso de condenação por crime grave.'
    ],
    ideology: { econ: 1, social: 6, sistema: 4 }, salience: 0.7,
    effects: { groups: { imigrantes: -15, seguranca: 3 }, eu: -2 },
    annualCost: 0,
    constitutional: { articles: ['13.º', '26.º'], issue: 'A perda da nacionalidade como sanção pode violar o princípio da igualdade e a proibição de privação arbitrária da cidadania.', severity: 'duvidosa', limit288: false },
    partySupport: { ch: 3, ad: 1, ps: -2, livre: -3, be: -3, cdu: -2 }, tags: ['nacionalidade', 'imigração']
  },
  {
    id: 'quotas_imigracao', title: 'Quotas anuais de imigração', area: 'imigracao', type: 'lei', decree: false,
    summary: 'O Parlamento passa a aprovar anualmente o número máximo de autorizações de residência por setor de atividade.',
    articles: [
      'Artigo 1.º — Objeto: Regime de contingentação da imigração laboral.',
      'Artigo 2.º — Quotas: A Assembleia da República aprova anualmente, sob proposta do Governo, o contingente máximo de autorizações de residência para trabalho.',
      'Artigo 3.º — Prioridades: O contingente é distribuído por setores de acordo com as necessidades identificadas pelo IEFP.'
    ],
    ideology: { econ: 1, social: 6, sistema: 5 }, salience: 0.7,
    effects: { econ: { gdp: -0.1 }, groups: { imigrantes: -12, empresarios: -6, agricultores: -6, seguranca: 2 } },
    annualCost: 0, constitutional: null, partySupport: { ch: 3, adn: 2, nd: 2, il: -2 }, tags: ['imigração', 'quotas']
  },
  {
    id: 'reagrupamento_familiar', title: 'Restrição do reagrupamento familiar', area: 'imigracao', type: 'lei', decree: false,
    summary: 'Exige dois anos de residência legal e meios de subsistência comprovados para pedir o reagrupamento familiar.',
    articles: [
      'Artigo 1.º — Objeto: Alteração ao regime de entrada, permanência e afastamento de estrangeiros.',
      'Artigo 2.º — Reagrupamento: O direito ao reagrupamento familiar depende de dois anos de residência legal, alojamento adequado e meios de subsistência.'
    ],
    ideology: { econ: 0, social: 5, sistema: 3 }, salience: 0.5,
    effects: { groups: { imigrantes: -10 } },
    annualCost: 0,
    constitutional: { articles: ['36.º', '67.º'], issue: 'Possível violação da proteção constitucional da família e da unidade familiar.', severity: 'duvidosa', limit288: false },
    partySupport: { ch: 2, ad: 1, livre: -2, be: -2 }, tags: ['imigração', 'família']
  },
  {
    id: 'aima_reforco', title: 'Reforço da AIMA e regularização dos processos pendentes', area: 'imigracao', type: 'lei', decree: true,
    summary: 'Contrata 600 técnicos para a AIMA, cria balcões móveis e fixa um prazo de 90 dias para a decisão dos pedidos.',
    articles: [
      'Artigo 1.º — Objeto: Plano de emergência da Agência para a Integração, Migrações e Asilo.',
      'Artigo 2.º — Meios: São contratados 600 técnicos e abertos balcões em todos os distritos.',
      'Artigo 3.º — Prazo: Os pedidos de autorização de residência são decididos em 90 dias.'
    ],
    ideology: { econ: 0, social: -3, sistema: -2 }, salience: 0.4,
    effects: { groups: { imigrantes: 12, empresarios: 4, agricultores: 3 } },
    annualCost: 80, constitutional: null, partySupport: { ch: -3, ps: 1 }, tags: ['AIMA', 'imigração']
  },
  {
    id: 'ocultacao_rosto', title: 'Proibição da ocultação do rosto em espaço público', area: 'imigracao', type: 'lei', decree: false,
    summary: 'Proíbe o uso, em espaços públicos, de vestuário que oculte o rosto, incluindo a burca e o niqab, com exceções de saúde e segurança.',
    articles: [
      'Artigo 1.º — Objeto: Proibição da ocultação do rosto em espaços públicos.',
      'Artigo 2.º — Proibição: É proibido o uso de peças de vestuário destinadas a ocultar o rosto em espaços públicos.',
      'Artigo 3.º — Exceções: Excetuam-se as situações de saúde, segurança no trabalho, desporto e manifestações culturais.'
    ],
    ideology: { econ: 0, social: 7, sistema: 5 }, salience: 0.5,
    effects: { groups: { imigrantes: -8 } },
    annualCost: 0,
    constitutional: { articles: ['41.º'], issue: 'Pode restringir de forma desproporcionada a liberdade religiosa.', severity: 'duvidosa', limit288: false },
    partySupport: { ch: 3, livre: -3, be: -3, ps: -1 }, tags: ['religião', 'imigração']
  },
  // ───────────── COSTUMES ─────────────
  {
    id: 'canabis_recreativa', title: 'Legalização da canábis para uso recreativo', area: 'costumes', type: 'lei', decree: false,
    summary: 'Legaliza a venda de canábis a maiores de 21 anos em estabelecimentos licenciados, com tributação especial.',
    articles: [
      'Artigo 1.º — Objeto: Regime jurídico da canábis para uso pessoal não medicinal.',
      'Artigo 2.º — Venda: A venda é permitida apenas em estabelecimentos licenciados e a maiores de 21 anos.',
      'Artigo 3.º — Tributação: A canábis fica sujeita a imposto especial de consumo.'
    ],
    ideology: { econ: 2, social: -7, sistema: 0 }, salience: 0.5,
    effects: { econ: { crime: -1 }, groups: { jovens: 8, pensionistas: -6 } },
    annualCost: -100, constitutional: null, partySupport: { be: 2, livre: 2, il: 1, ch: -3, cdu: -1, ad: -2 }, tags: ['drogas', 'liberdades']
  },
  {
    id: 'ivg_14_semanas', title: 'Alargamento do prazo da IVG para 14 semanas', area: 'costumes', type: 'lei', decree: false,
    summary: 'Alarga de 10 para 14 semanas o prazo para a interrupção voluntária da gravidez e elimina o período de reflexão obrigatório.',
    articles: [
      'Artigo 1.º — Objeto: Alteração ao regime da interrupção voluntária da gravidez.',
      'Artigo 2.º — Prazo: A interrupção voluntária da gravidez é permitida, por opção da mulher, nas primeiras 14 semanas.',
      'Artigo 3.º — Reflexão: É revogado o período de reflexão obrigatório de três dias.'
    ],
    ideology: { econ: 0, social: -7, sistema: 0 }, salience: 0.6,
    effects: { groups: { jovens: 3, pensionistas: -4 } },
    annualCost: 5, constitutional: null, partySupport: { be: 2, livre: 2, ch: -3, ad: -2 }, tags: ['aborto', 'direitos das mulheres']
  },
  {
    id: 'revogar_eutanasia', title: 'Revogação da lei da morte medicamente assistida', area: 'costumes', type: 'lei', decree: false,
    summary: 'Revoga a lei que despenalizou a morte medicamente assistida e reforça a rede de cuidados paliativos.',
    articles: [
      'Artigo 1.º — Objeto: Revogação da Lei n.º 22/2023.',
      'Artigo 2.º — Cuidados paliativos: O Governo garante uma rede de cuidados paliativos com cobertura nacional.'
    ],
    ideology: { econ: 0, social: 7, sistema: 1 }, salience: 0.5,
    effects: { groups: { pensionistas: 1, jovens: -3 } },
    annualCost: 50, constitutional: null, partySupport: { ch: 2, cdu: 1, ad: 1, il: -2, be: -3, livre: -3, ps: -2 }, tags: ['eutanásia', 'vida']
  },
  {
    id: 'proibir_touradas', title: 'Proibição das touradas', area: 'costumes', type: 'lei', decree: false,
    summary: 'Proíbe os espetáculos tauromáquicos em todo o território nacional, com um período de transição de dois anos.',
    articles: [
      'Artigo 1.º — Objeto: Proibição dos espetáculos tauromáquicos.',
      'Artigo 2.º — Proibição: São proibidas as corridas de touros e demais espetáculos que envolvam o sofrimento de animais.',
      'Artigo 3.º — Transição: A proibição produz efeitos dois anos após a publicação, com apoio à reconversão das praças.'
    ],
    ideology: { econ: 0, social: -5, sistema: 0 }, salience: 0.4,
    effects: { groups: { interior: -6, agricultores: -6, jovens: 3 } },
    annualCost: -5, constitutional: null, partySupport: { pan: 3, be: 1, livre: 1, ch: -3, cdu: -1, ad: -1 }, tags: ['animais', 'tradição']
  },
  {
    id: 'protecao_animal', title: 'Reforço da proteção legal dos animais', area: 'costumes', type: 'lei', decree: false,
    summary: 'Agrava as penas por maus-tratos a animais de companhia e cria um provedor nacional do animal.',
    articles: [
      'Artigo 1.º — Objeto: Reforço do regime sancionatório dos maus-tratos a animais.',
      'Artigo 2.º — Penas: O crime de maus-tratos a animal de companhia passa a ser punido com prisão até três anos.',
      'Artigo 3.º — Provedor: É criado o Provedor Nacional do Animal.'
    ],
    ideology: { econ: 0, social: -3, sistema: 0 }, salience: 0.3,
    effects: { groups: { jovens: 3, classe_media: 2, agricultores: -2 } },
    annualCost: 10, constitutional: null, partySupport: { pan: 3, livre: 1, be: 1 }, tags: ['animais']
  },
  // ───────────── AMBIENTE E ENERGIA ─────────────
  {
    id: 'clima_2045', title: 'Neutralidade carbónica em 2045', area: 'ambiente', type: 'lei', decree: false,
    summary: 'Antecipa para 2045 a meta de neutralidade carbónica da Lei de Bases do Clima, com orçamentos de carbono vinculativos por setor.',
    articles: [
      'Artigo 1.º — Objeto: Alteração à Lei de Bases do Clima.',
      'Artigo 2.º — Meta: Portugal compromete-se a atingir a neutralidade climática até 2045.',
      'Artigo 3.º — Orçamentos de carbono: São fixados orçamentos de carbono quinquenais e vinculativos para cada setor.'
    ],
    ideology: { econ: -3, social: -4, sistema: -1 }, salience: 0.5,
    effects: { econ: { gdp: -0.1 }, groups: { jovens: 6, empresarios: -4, agricultores: -3 }, eu: 3 },
    annualCost: 200, constitutional: null, partySupport: { livre: 3, pan: 3, be: 1, volt: 2, ch: -3 }, tags: ['clima', 'descarbonização']
  },
  {
    id: 'proibir_litio', title: 'Proibição da mineração de lítio a céu aberto', area: 'ambiente', type: 'lei', decree: false,
    summary: 'Proíbe novas concessões de exploração de lítio a céu aberto, incluindo os projetos de Boticas e Montalegre.',
    articles: [
      'Artigo 1.º — Objeto: Proibição da exploração mineira de lítio a céu aberto.',
      'Artigo 2.º — Concessões: Não são atribuídas novas concessões e são revistas as já atribuídas que não tenham iniciado exploração.'
    ],
    ideology: { econ: -4, social: -2, sistema: 2 }, salience: 0.4,
    effects: { econ: { gdp: -0.1 }, groups: { empresarios: -5, interior: 2 }, eu: -2 },
    annualCost: 0, constitutional: null, partySupport: { pan: 2, be: 1, livre: 1, il: -3, ad: -2 }, tags: ['lítio', 'mineração', 'interior']
  },
  {
    id: 'taxa_carbono', title: 'Taxa de carbono com dividendo climático', area: 'ambiente', type: 'lei', decree: false,
    summary: 'Cria uma taxa progressiva sobre as emissões de CO2, devolvendo parte da receita às famílias através de um dividendo anual.',
    articles: [
      'Artigo 1.º — Objeto: Criação da taxa de carbono e do dividendo climático.',
      'Artigo 2.º — Taxa: É aplicada uma taxa de 60 euros por tonelada de CO2, crescente até 2030.',
      'Artigo 3.º — Dividendo: 60% da receita é devolvida às famílias de rendimentos baixos e médios.'
    ],
    ideology: { econ: -2, social: -3, sistema: -1 }, salience: 0.4,
    effects: { econ: { inflation: 0.2 }, groups: { trabalhadores: -3, interior: -4, jovens: 3 }, eu: 3 },
    annualCost: -200, constitutional: null, partySupport: { livre: 2, volt: 2, pan: 1, ch: -3, cdu: -1 }, tags: ['clima', 'fiscalidade verde']
  },
  {
    id: 'mobilidade_eletrica', title: 'Incentivos à mobilidade elétrica e ao autoconsumo solar', area: 'energia', type: 'lei', decree: true,
    summary: 'Reforça os apoios à compra de veículos elétricos e à instalação de painéis solares nas habitações.',
    articles: [
      'Artigo 1.º — Objeto: Programa de incentivos à transição energética das famílias.',
      'Artigo 2.º — Apoios: São atribuídos apoios de 4000 euros por veículo elétrico e de 50% do investimento em painéis solares.'
    ],
    ideology: { econ: -1, social: -2, sistema: -1 }, salience: 0.3,
    effects: { groups: { classe_media: 4, empresarios: 2 } },
    annualCost: 150, constitutional: null, partySupport: { livre: 1, pan: 1 }, tags: ['energia', 'renováveis']
  },
  {
    id: 'nuclear_smr', title: 'Abertura à energia nuclear (pequenos reatores modulares)', area: 'energia', type: 'lei', decree: false,
    summary: 'Revoga a proibição de facto da energia nuclear e cria o enquadramento para pequenos reatores modulares.',
    articles: [
      'Artigo 1.º — Objeto: Enquadramento legal da produção de energia nuclear.',
      'Artigo 2.º — Regulador: É criada a Autoridade de Segurança Nuclear.',
      'Artigo 3.º — Projetos-piloto: O Governo pode licenciar pequenos reatores modulares após avaliação ambiental.'
    ],
    ideology: { econ: 3, social: 2, sistema: 2 }, salience: 0.5,
    effects: { econ: { gdp: 0.05 }, groups: { empresarios: 4, jovens: -2 } },
    annualCost: 50, constitutional: null, partySupport: { il: 2, ch: 1, pan: -3, be: -3, livre: -3 }, tags: ['nuclear', 'energia']
  },
  {
    id: 'plano_agua', title: 'Plano Nacional da Água', area: 'ambiente', type: 'lei', decree: true,
    summary: 'Aprova a construção de uma central de dessalinização no Algarve, novas barragens no Alentejo e a reutilização de águas residuais.',
    articles: [
      'Artigo 1.º — Objeto: Plano Nacional de Eficiência e Segurança Hídrica.',
      'Artigo 2.º — Investimentos: São prioritárias a dessalinizadora do Algarve, a ligação entre albufeiras e a reutilização de águas residuais.'
    ],
    ideology: { econ: -1, social: 0, sistema: -1 }, salience: 0.5,
    effects: { econ: { deficit: 0.05 }, groups: { agricultores: 8, interior: 3 } },
    annualCost: 200, constitutional: null, partySupport: {}, tags: ['água', 'seca']
  },
  // ───────────── TRANSPORTES ─────────────
  {
    id: 'fim_portagens_scut', title: 'Fim das portagens nas ex-SCUT', area: 'transportes', type: 'lei', decree: false,
    summary: 'Elimina as portagens na A4, A13, A22, A23, A24, A25 e A28, compensando as concessionárias pelo Orçamento do Estado.',
    articles: [
      'Artigo 1.º — Objeto: Eliminação das taxas de portagem nas antigas autoestradas sem custos para o utilizador.',
      'Artigo 2.º — Âmbito: É eliminada a cobrança de portagens nos lanços identificados no anexo.'
    ],
    ideology: { econ: -2, social: 0, sistema: 2 }, salience: 0.6,
    effects: { econ: { deficit: 0.06 }, groups: { interior: 12, agricultores: 4, empresarios: 3 } },
    annualCost: 180, constitutional: null, partySupport: { ch: 2, cdu: 1, be: 1, ps: 1, il: -2 }, tags: ['portagens', 'interior']
  },
  {
    id: 'tap_privatizacao', title: 'Privatização da TAP', area: 'transportes', type: 'lei', decree: true,
    summary: 'Aliena até 49,9% do capital da TAP a um grupo aéreo europeu, garantindo o hub de Lisboa e as rotas para as regiões autónomas e as comunidades.',
    articles: [
      'Artigo 1.º — Objeto: Reprivatização parcial do capital social da TAP, S.A.',
      'Artigo 2.º — Alienação: É alienada uma participação até 49,9% do capital, por concurso internacional.',
      'Artigo 3.º — Garantias: O comprador compromete-se a manter o hub de Lisboa e as ligações às regiões autónomas.'
    ],
    ideology: { econ: 6, social: 0, sistema: -1 }, salience: 0.7,
    effects: { budget: -1200, econ: { debt: -0.4 }, groups: { empresarios: 4, trabalhadores: -3 } },
    annualCost: 0, constitutional: null, partySupport: { il: 2, ad: 1, cdu: -3, be: -3, livre: -2, ch: -1 }, tags: ['TAP', 'privatização']
  },
  {
    id: 'tap_publica', title: 'TAP 100% pública', area: 'transportes', type: 'lei', decree: true,
    summary: 'Suspende o processo de privatização e aprova um plano estratégico para a TAP como empresa integralmente pública.',
    articles: [
      'Artigo 1.º — Objeto: Manutenção da TAP no setor empresarial do Estado.',
      'Artigo 2.º — Plano estratégico: O Governo aprova um plano estratégico a cinco anos com metas de rotas e de emprego.'
    ],
    ideology: { econ: -5, social: 0, sistema: 1 }, salience: 0.6,
    effects: { groups: { trabalhadores: 3 } },
    annualCost: 100, constitutional: null, partySupport: { cdu: 2, be: 2, il: -3, ad: -1 }, tags: ['TAP', 'setor público']
  },
  {
    id: 'aeroporto_alcochete', title: 'Aceleração do Aeroporto Luís de Camões', area: 'transportes', type: 'lei', decree: true,
    summary: 'Antecipa a construção do novo aeroporto no Campo de Tiro de Alcochete, com expansão transitória do Humberto Delgado.',
    articles: [
      'Artigo 1.º — Objeto: Medidas de aceleração do Novo Aeroporto de Lisboa.',
      'Artigo 2.º — Calendário: A primeira pista deve entrar em funcionamento até 2034.',
      'Artigo 3.º — Acessibilidades: É assegurada a ligação ferroviária e a terceira travessia do Tejo.'
    ],
    ideology: { econ: 2, social: 0, sistema: -2 }, salience: 0.5,
    effects: { budget: 300, econ: { gdp: 0.2 }, groups: { empresarios: 6, trabalhadores: 2 } },
    annualCost: 0, constitutional: null, partySupport: {}, tags: ['aeroporto', 'obras públicas']
  },
  {
    id: 'alta_velocidade', title: 'Alta velocidade Lisboa–Porto–Vigo', area: 'transportes', type: 'lei', decree: true,
    summary: 'Garante o financiamento plurianual da linha de alta velocidade Lisboa–Porto e da ligação a Vigo.',
    articles: [
      'Artigo 1.º — Objeto: Programa plurianual de investimento na rede ferroviária de alta velocidade.',
      'Artigo 2.º — Prazos: O troço Porto–Lisboa deve estar concluído até 2032 e a ligação a Vigo até 2034.'
    ],
    ideology: { econ: -1, social: -1, sistema: -2 }, salience: 0.5,
    effects: { budget: 500, econ: { gdp: 0.15, deficit: 0.05 }, groups: { empresarios: 4, classe_media: 3 }, eu: 3 },
    annualCost: 250, constitutional: null, partySupport: { livre: 1 }, tags: ['ferrovia', 'TGV']
  },
  {
    id: 'passe_verde', title: 'Passe ferroviário verde nacional a 20 euros', area: 'transportes', type: 'lei', decree: true,
    summary: 'Alarga o passe ferroviário verde a todos os comboios regionais, inter-regionais e intercidades por 20 euros mensais.',
    articles: [
      'Artigo 1.º — Objeto: Passe ferroviário nacional.',
      'Artigo 2.º — Preço: O passe custa 20 euros mensais e é válido em todos os serviços da CP, exceto o Alfa Pendular.'
    ],
    ideology: { econ: -2, social: -2, sistema: -1 }, salience: 0.4,
    effects: { groups: { jovens: 6, trabalhadores: 5, interior: 4, classe_media: 2 } },
    annualCost: 80, constitutional: null, partySupport: { livre: 2, pan: 1 }, tags: ['transportes públicos', 'CP']
  },
  // ───────────── SOCIAL ─────────────
  {
    id: 'pensoes_extra', title: 'Aumento extraordinário das pensões mais baixas', area: 'social', type: 'lei', decree: true,
    summary: 'Aumento permanente de 50 euros mensais nas pensões até três vezes o IAS, a partir de janeiro.',
    articles: [
      'Artigo 1.º — Objeto: Atualização extraordinária das pensões.',
      'Artigo 2.º — Valor: As pensões de valor até três IAS têm um aumento extraordinário de 50 euros mensais.'
    ],
    ideology: { econ: -3, social: 1, sistema: 1 }, salience: 0.7,
    effects: { approval: 2, econ: { deficit: 0.2 }, groups: { pensionistas: 14 } },
    annualCost: 600, constitutional: null, partySupport: { ch: 1, cdu: 1, ps: 1 }, tags: ['pensões', 'idosos']
  },
  {
    id: 'csi_reforco', title: 'Complemento Solidário para Idosos até ao limiar da pobreza', area: 'social', type: 'lei', decree: true,
    summary: 'Eleva o valor de referência do CSI até ao limiar da pobreza e simplifica o acesso, deixando de contar os rendimentos dos filhos.',
    articles: [
      'Artigo 1.º — Objeto: Reforço do Complemento Solidário para Idosos.',
      'Artigo 2.º — Valor de referência: O valor de referência do CSI é igual ao limiar de risco de pobreza.',
      'Artigo 3.º — Acesso: Deixam de ser considerados os rendimentos dos filhos na atribuição.'
    ],
    ideology: { econ: -3, social: 0, sistema: -1 }, salience: 0.5,
    effects: { groups: { pensionistas: 10, interior: 3 } },
    annualCost: 250, constitutional: null, partySupport: {}, tags: ['pobreza', 'idosos']
  },
  {
    id: 'idade_reforma', title: 'Reforma da Segurança Social e aumento da idade da reforma', area: 'social', type: 'lei', decree: false,
    summary: 'Indexa a idade da reforma à esperança de vida com um fator mais exigente e introduz um plafonamento opcional das contribuições.',
    articles: [
      'Artigo 1.º — Objeto: Medidas de sustentabilidade do sistema previdencial.',
      'Artigo 2.º — Idade da reforma: A idade normal de acesso à pensão aumenta dois meses por cada ano de ganho de esperança de vida.',
      'Artigo 3.º — Plafonamento: Os rendimentos acima de oito IAS podem descontar para regimes complementares de capitalização.'
    ],
    ideology: { econ: 6, social: 1, sistema: -2 }, salience: 0.7,
    effects: { approval: -3, econ: { deficit: -0.3, debt: -1 }, groups: { pensionistas: -10, trabalhadores: -8, funcpublicos: -5 }, unrest: 5 },
    annualCost: -800, constitutional: null, partySupport: { il: 3, ch: -2, ps: -2, cdu: -3, be: -3 }, tags: ['pensões', 'sustentabilidade']
  },
  {
    id: 'rsi_regras', title: 'Endurecimento das regras do RSI', area: 'social', type: 'lei', decree: true,
    summary: 'Torna obrigatória a procura ativa de emprego ou trabalho comunitário para os beneficiários do RSI em idade ativa.',
    articles: [
      'Artigo 1.º — Objeto: Alteração ao regime do Rendimento Social de Inserção.',
      'Artigo 2.º — Condicionalidade: Os beneficiários em idade ativa e aptos para o trabalho ficam obrigados a procura ativa de emprego, formação ou trabalho comunitário.'
    ],
    ideology: { econ: 4, social: 4, sistema: 4 }, salience: 0.5,
    effects: { econ: { deficit: -0.02 }, groups: { classe_media: 3, imigrantes: -4 } },
    annualCost: -60, constitutional: null, partySupport: { ch: 3, ps: -2, be: -3, cdu: -2 }, tags: ['RSI', 'prestações sociais']
  },
  // ───────────── DEFESA E POLÍTICA EXTERNA ─────────────
  {
    id: 'defesa_2pct', title: 'Defesa a 2% do PIB', area: 'defesa', type: 'lei', decree: true,
    summary: 'Fixa na Lei de Programação Militar o investimento em defesa de 2% do PIB, em linha com os compromissos da NATO.',
    articles: [
      'Artigo 1.º — Objeto: Alteração à Lei de Programação Militar.',
      'Artigo 2.º — Meta: A despesa com defesa nacional corresponde, no mínimo, a 2% do PIB.'
    ],
    ideology: { econ: 1, social: 2, sistema: -3 }, salience: 0.5,
    effects: { econ: { deficit: 0.3 }, groups: { seguranca: 6 }, eu: 4 },
    annualCost: 1200, constitutional: null, partySupport: { cdu: -3, be: -3, mrpp: -3, livre: -1 }, tags: ['NATO', 'defesa']
  },
  {
    id: 'defesa_35pct', title: 'Trajetória de 3,5% do PIB em Defesa até 2035', area: 'defesa', type: 'lei', decree: false,
    summary: 'Compromete Portugal com a meta de 3,5% do PIB em defesa até 2035, acordada na cimeira da NATO.',
    articles: [
      'Artigo 1.º — Objeto: Trajetória plurianual de investimento em defesa.',
      'Artigo 2.º — Meta: A despesa com defesa aumenta anualmente até atingir 3,5% do PIB em 2035.',
      'Artigo 3.º — Indústria: Pelo menos 40% do investimento é aplicado em indústria europeia.'
    ],
    ideology: { econ: 2, social: 3, sistema: -2 }, salience: 0.6,
    effects: { econ: { deficit: 0.6, gdp: 0.1 }, groups: { seguranca: 8, pensionistas: -3, funcpublicos: -3 }, eu: 6 },
    annualCost: 4000, constitutional: null, partySupport: { il: 1, cdu: -3, be: -3, livre: -2, pan: -2 }, tags: ['NATO', 'defesa']
  },
  {
    id: 'servico_militar', title: 'Serviço militar obrigatório', area: 'defesa', type: 'lei', decree: false,
    summary: 'Reintroduz o serviço militar obrigatório de seis meses para jovens de ambos os sexos, com alternativa de serviço cívico.',
    articles: [
      'Artigo 1.º — Objeto: Reintrodução do serviço militar efetivo normal.',
      'Artigo 2.º — Duração: O serviço militar tem a duração de seis meses e abrange os cidadãos entre os 18 e os 25 anos.',
      'Artigo 3.º — Objeção de consciência: É garantido o serviço cívico alternativo.'
    ],
    ideology: { econ: 0, social: 6, sistema: 3 }, salience: 0.6,
    effects: { approval: -2, groups: { jovens: -12, seguranca: 5 } },
    annualCost: 500, constitutional: null, partySupport: { ch: 2, adn: 2, ps: -2, il: -2, livre: -3, be: -3 }, tags: ['forças armadas', 'jovens']
  },
  {
    id: 'sair_nato', title: 'Saída de Portugal da NATO', area: 'externa', type: 'resolucao', decree: false,
    summary: 'Recomenda ao Governo que inicie o processo de denúncia do Tratado do Atlântico Norte.',
    articles: [
      'Ponto 1 — A Assembleia da República recomenda ao Governo que inicie o processo de saída de Portugal da Organização do Tratado do Atlântico Norte.',
      'Ponto 2 — O Governo deve promover um sistema de segurança coletiva no quadro das Nações Unidas.'
    ],
    ideology: { econ: -3, social: -1, sistema: 7 }, salience: 0.7,
    effects: { approval: -3, eu: -15, president: -12, groups: { seguranca: -8 } },
    annualCost: -300, constitutional: null, partySupport: { cdu: 3, mrpp: 3, be: 1, ps: -3, ad: -3, il: -3, ch: -3, livre: -2 }, tags: ['NATO', 'política externa']
  },
  {
    id: 'mobilidade_cplp', title: 'Acordo de mobilidade CPLP reforçado', area: 'externa', type: 'resolucao', decree: false,
    summary: 'Aprova o reforço do acordo de mobilidade entre os Estados da CPLP, com vistos de procura de trabalho e reconhecimento de qualificações.',
    articles: [
      'Ponto 1 — A Assembleia da República aprova o protocolo adicional ao Acordo de Mobilidade da CPLP.',
      'Ponto 2 — O Governo deve garantir a capacidade de resposta da rede consular e da AIMA.'
    ],
    ideology: { econ: 0, social: -2, sistema: -1 }, salience: 0.3,
    effects: { groups: { imigrantes: 6, empresarios: 3 } },
    annualCost: 10, constitutional: null, partySupport: { ch: -2 }, tags: ['CPLP', 'lusofonia']
  },
  // ───────────── CULTURA E COMUNICAÇÃO SOCIAL ─────────────
  {
    id: 'privatizar_rtp', title: 'Privatização da RTP', area: 'cultura', type: 'lei', decree: false,
    summary: 'Aliena a totalidade do capital da RTP e extingue a contribuição audiovisual.',
    articles: [
      'Artigo 1.º — Objeto: Reprivatização da Rádio e Televisão de Portugal, S.A.',
      'Artigo 2.º — Alienação: O Estado aliena a totalidade das ações representativas do capital da RTP.',
      'Artigo 3.º — Contribuição audiovisual: É extinta a contribuição para o audiovisual.'
    ],
    ideology: { econ: 7, social: 1, sistema: 2 }, salience: 0.5,
    effects: { budget: -300, media: -4, groups: { funcpublicos: -3 } },
    annualCost: -200,
    constitutional: { articles: ['38.º'], issue: 'O artigo 38.º, n.º 5, obriga o Estado a assegurar a existência de um serviço público de rádio e de televisão.', severity: 'grave', limit288: false },
    partySupport: { il: 3, ch: 1, ps: -3, cdu: -3, be: -3, livre: -3 }, tags: ['RTP', 'serviço público']
  },
  {
    id: 'fim_taxa_audiovisual', title: 'Fim da contribuição audiovisual', area: 'cultura', type: 'lei', decree: false,
    summary: 'Elimina a contribuição audiovisual cobrada na fatura da eletricidade, passando a RTP a ser financiada pelo Orçamento do Estado.',
    articles: [
      'Artigo 1.º — Objeto: Extinção da contribuição para o audiovisual.',
      'Artigo 2.º — Financiamento: O serviço público de rádio e televisão passa a ser financiado por transferência do Orçamento do Estado.'
    ],
    ideology: { econ: 3, social: 0, sistema: 2 }, salience: 0.4,
    effects: { groups: { classe_media: 3, pensionistas: 2 } },
    annualCost: 190, constitutional: null, partySupport: { il: 2, ch: 2 }, tags: ['RTP', 'fatura da luz']
  },
  {
    id: 'cultura_1pct', title: '1% do Orçamento para a Cultura', area: 'cultura', type: 'lei', decree: false,
    summary: 'Fixa como meta que 1% da despesa do Orçamento do Estado seja destinado à Cultura até ao fim da legislatura.',
    articles: [
      'Artigo 1.º — Objeto: Programação financeira da despesa pública em Cultura.',
      'Artigo 2.º — Meta: A despesa da área governativa da Cultura atinge 1% da despesa total do Orçamento do Estado.'
    ],
    ideology: { econ: -2, social: -2, sistema: -1 }, salience: 0.3,
    effects: { media: 2, groups: { jovens: 2, classe_media: 2 } },
    annualCost: 400, constitutional: null, partySupport: { livre: 2, be: 1, cdu: 1 }, tags: ['cultura']
  },
  // ───────────── AGRICULTURA ─────────────
  {
    id: 'apoio_seca', title: 'Apoio extraordinário aos agricultores afetados pela seca', area: 'agricultura', type: 'lei', decree: true,
    summary: 'Cria uma linha de apoio a fundo perdido para agricultores e criadores de gado afetados pela seca no Sul.',
    articles: [
      'Artigo 1.º — Objeto: Medidas excecionais de apoio à agricultura afetada pela seca.',
      'Artigo 2.º — Apoio: É criada uma linha de 200 milhões de euros para alimentação animal, captação de água e compensação de perdas.'
    ],
    ideology: { econ: -1, social: 1, sistema: 0 }, salience: 0.5,
    effects: { budget: 200, groups: { agricultores: 12, interior: 4 } },
    annualCost: 0, constitutional: null, partySupport: {}, tags: ['seca', 'agricultura']
  },
  {
    id: 'gasoleo_agricola', title: 'Reforço do gasóleo agrícola e das pescas', area: 'agricultura', type: 'lei', decree: true,
    summary: 'Aumenta o desconto no gasóleo agrícola e isenta de ISP o combustível da pesca artesanal.',
    articles: [
      'Artigo 1.º — Objeto: Apoio aos custos de produção agrícola e da pesca.',
      'Artigo 2.º — Gasóleo: O desconto no gasóleo agrícola é aumentado em 50% e a pesca artesanal fica isenta de ISP.'
    ],
    ideology: { econ: 0, social: 1, sistema: 1 }, salience: 0.3,
    effects: { groups: { agricultores: 8, interior: 3 } },
    annualCost: 60, constitutional: null, partySupport: { pan: -2, livre: -1, ch: 1 }, tags: ['agricultura', 'pescas']
  },
  // ───────────── INSTITUIÇÕES ─────────────
  {
    id: 'deputados_180', title: 'Redução do número de deputados para 180', area: 'instituicoes', type: 'lei_organica', decree: false,
    summary: 'Altera a Lei Eleitoral da Assembleia da República, reduzindo o número de deputados de 230 para 180, o mínimo permitido pela Constituição.',
    articles: [
      'Artigo 1.º — Objeto: Alteração à Lei Eleitoral da Assembleia da República.',
      'Artigo 2.º — Número de deputados: A Assembleia da República passa a ser composta por 180 deputados.',
      'Artigo 3.º — Mapa: O número de deputados por círculo é recalculado pela Comissão Nacional de Eleições.'
    ],
    ideology: { econ: 0, social: 2, sistema: 6 }, salience: 0.6,
    effects: { approval: 1, groups: { classe_media: 4 } },
    annualCost: -15, constitutional: null, partySupport: { ch: 3, il: 1, livre: -3, be: -3, pan: -3, cdu: -3, jpp: -2 }, tags: ['sistema eleitoral', 'parlamento']
  },
  {
    id: 'circulo_compensacao', title: 'Círculo nacional de compensação', area: 'instituicoes', type: 'lei_organica', decree: false,
    summary: 'Introduz um círculo nacional de compensação de 40 deputados para corrigir a desproporcionalidade dos círculos pequenos.',
    articles: [
      'Artigo 1.º — Objeto: Alteração ao sistema eleitoral para a Assembleia da República.',
      'Artigo 2.º — Círculo nacional: São eleitos 40 deputados num círculo nacional de compensação, pelo método de Hondt.'
    ],
    ideology: { econ: 0, social: -1, sistema: -2 }, salience: 0.3,
    effects: { media: 1 },
    annualCost: 0, constitutional: null, partySupport: { il: 2, livre: 2, be: 2, pan: 2, volt: 2, ad: -1, ps: -1 }, tags: ['sistema eleitoral', 'proporcionalidade']
  },
  {
    id: 'voto_mobilidade', title: 'Voto em mobilidade e voto eletrónico presencial', area: 'instituicoes', type: 'lei_organica', decree: false,
    summary: 'Generaliza o voto antecipado em mobilidade e permite o voto eletrónico presencial em qualquer assembleia de voto do país.',
    articles: [
      'Artigo 1.º — Objeto: Modernização do processo eleitoral.',
      'Artigo 2.º — Voto em mobilidade: Qualquer eleitor pode votar antecipadamente em qualquer município.',
      'Artigo 3.º — Voto eletrónico: É admitido o voto eletrónico presencial com cadernos eleitorais desmaterializados.'
    ],
    ideology: { econ: 0, social: -1, sistema: -2 }, salience: 0.3,
    effects: { groups: { jovens: 4 } },
    annualCost: 20, constitutional: null, partySupport: {}, tags: ['eleições', 'abstenção']
  },
  {
    id: 'exclusividade_deputados', title: 'Exclusividade dos deputados', area: 'instituicoes', type: 'lei', decree: false,
    summary: 'Impõe o regime de exclusividade a todos os deputados, proibindo a acumulação com funções privadas remuneradas.',
    articles: [
      'Artigo 1.º — Objeto: Alteração ao Estatuto dos Deputados.',
      'Artigo 2.º — Exclusividade: O mandato de deputado é exercido em regime de exclusividade, salvo atividades docentes ou de investigação.'
    ],
    ideology: { econ: 0, social: 0, sistema: 3 }, salience: 0.4,
    effects: { approval: 1, groups: { classe_media: 3 } },
    annualCost: 10, constitutional: null, partySupport: { ch: 2, be: 1, livre: 1 }, tags: ['transparência', 'parlamento']
  },
  {
    id: 'lobbying', title: 'Regulamentação do lobbying', area: 'instituicoes', type: 'lei', decree: false,
    summary: 'Cria um registo obrigatório de representantes de interesses e a publicação das agendas de governantes e deputados.',
    articles: [
      'Artigo 1.º — Objeto: Regime de representação profissional de interesses.',
      'Artigo 2.º — Registo: É criado o Registo de Transparência, de inscrição obrigatória para os representantes de interesses.',
      'Artigo 3.º — Agendas: Os membros do Governo publicam semanalmente as reuniões com representantes de interesses.'
    ],
    ideology: { econ: 0, social: 0, sistema: -1 }, salience: 0.3,
    effects: { media: 3 },
    annualCost: 2, constitutional: null, partySupport: { il: 1, livre: 1 }, tags: ['transparência']
  },
  {
    id: 'regionalizacao', title: 'Criação das regiões administrativas', area: 'regioes', type: 'lei_organica', decree: false, referendum: true,
    summary: 'Cria cinco regiões administrativas no continente, coincidentes com as CCDR, sujeitas a referendo nacional.',
    articles: [
      'Artigo 1.º — Objeto: Lei-quadro de criação das regiões administrativas.',
      'Artigo 2.º — Regiões: São criadas as regiões do Norte, Centro, Lisboa e Vale do Tejo, Alentejo e Algarve.',
      'Artigo 3.º — Referendo: A instituição em concreto das regiões depende de referendo, nos termos do artigo 256.º da Constituição.'
    ],
    ideology: { econ: -1, social: -2, sistema: -1 }, salience: 0.6,
    effects: { stability: -2, groups: { interior: 6 } },
    annualCost: 150, constitutional: null, partySupport: { ps: 2, livre: 1, cdu: 1, ch: -3, il: -1 }, tags: ['regionalização', 'descentralização']
  },
  // ───────────── REGIÕES ─────────────
  {
    id: 'financas_regionais', title: 'Nova Lei de Finanças das Regiões Autónomas', area: 'regioes', type: 'lei_organica', decree: false,
    summary: 'Reforça as transferências e o poder tributário próprio dos Açores e da Madeira.',
    articles: [
      'Artigo 1.º — Objeto: Revisão da Lei das Finanças das Regiões Autónomas.',
      'Artigo 2.º — Transferências: As transferências do Estado aumentam 15% e passam a considerar os custos da insularidade.',
      'Artigo 3.º — Poder tributário: As regiões podem reduzir até 30% as taxas nacionais de IRS, IRC e IVA.'
    ],
    ideology: { econ: 0, social: 0, sistema: 1 }, salience: 0.3,
    effects: { relations: { jpp: 10 } },
    annualCost: 120, constitutional: null, partySupport: { jpp: 3, ad: 1 }, tags: ['autonomias', 'Açores', 'Madeira']
  },
  {
    id: 'hospital_alentejo', title: 'Conclusão do Hospital Central do Alentejo', area: 'regioes', type: 'lei', decree: true,
    summary: 'Garante o financiamento e a abertura do Hospital Central do Alentejo, em Évora, e um plano de investimento no interior.',
    articles: [
      'Artigo 1.º — Objeto: Programa de investimento em equipamentos de saúde no interior.',
      'Artigo 2.º — Hospital Central do Alentejo: O hospital entra em funcionamento até ao final da legislatura.'
    ],
    ideology: { econ: -1, social: 0, sistema: -1 }, salience: 0.3,
    effects: { budget: 200, econ: { waiting: -1 }, groups: { interior: 8, saude: 3 } },
    annualCost: 20, constitutional: null, partySupport: { cdu: 1 }, tags: ['Alentejo', 'saúde', 'interior']
  },
  {
    id: 'estatuto_interior', title: 'Estatuto fiscal do interior', area: 'regioes', type: 'lei', decree: false,
    summary: 'Reduz o IRS em 20% para quem resida no interior e aplica IRC de 12,5% às empresas que aí criem emprego.',
    articles: [
      'Artigo 1.º — Objeto: Regime fiscal de coesão territorial.',
      'Artigo 2.º — IRS: Os residentes em territórios de baixa densidade beneficiam de uma redução de 20% na coleta de IRS.',
      'Artigo 3.º — IRC: As empresas com atividade principal nesses territórios são tributadas à taxa de 12,5%.'
    ],
    ideology: { econ: 2, social: 0, sistema: 0 }, salience: 0.4,
    effects: { econ: { emigration: -2 }, groups: { interior: 12, jovens: 3, empresarios: 3 } },
    annualCost: 250, constitutional: null, partySupport: { ad: 1, ch: 1 }, tags: ['interior', 'despovoamento']
  }
];

// ───────────── MEDIDAS PARA A «IA» OFFLINE ─────────────
// Usadas para compor leis a partir de pedidos do jogador (ex.: «quero baixar o preço das casas»).
const M = (title, text, [econ, social, sistema], effects = {}, annualCost = 0) =>
  ({ title, text, ideology: { econ, social, sistema }, effects, annualCost });

export const MEASURES = {
  economia: {
    esquerda: [
      M('Banco de fomento reforçado', 'O Banco Português de Fomento passa a conceder crédito direto às PME, com taxas bonificadas pelo Estado.', [-4, 0, -1], { econ: { gdp: 0.05 }, groups: { empresarios: 3 } }, 120),
      M('Controlo público de setores estratégicos', 'O Estado reforça a sua posição acionista em empresas dos setores da energia e das telecomunicações.', [-7, 0, 2], { groups: { empresarios: -6, trabalhadores: 2 } }, 200),
      M('Plano de reindustrialização', 'É criado um programa plurianual de investimento público na reindustrialização, com prioridade ao interior.', [-5, 0, -1], { econ: { gdp: 0.1, unemployment: -0.1 }, groups: { trabalhadores: 4, interior: 3 } }, 400)
    ],
    direita: [
      M('Simplificação administrativa para empresas', 'São eliminados os licenciamentos prévios redundantes, substituídos por comunicação prévia com fiscalização posterior.', [5, 0, -1], { econ: { gdp: 0.1 }, groups: { empresarios: 6 } }, -20),
      M('Estabilidade fiscal para investimento', 'Os investimentos produtivos superiores a 25 milhões de euros beneficiam de um contrato de estabilidade fiscal por dez anos.', [6, 0, -2], { econ: { gdp: 0.1 }, groups: { empresarios: 5 } }, 80),
      M('Venda de participações do Estado', 'O Governo aliena as participações minoritárias do Estado em empresas sem interesse estratégico.', [7, 0, 0], { budget: -400, groups: { empresarios: 3, trabalhadores: -2 } }, 0)
    ],
    conservador: [
      M('Proteção do comércio tradicional', 'São criadas zonas de proteção do comércio tradicional e limitada a abertura das grandes superfícies ao domingo.', [-1, 4, 2], { groups: { empresarios: -2, interior: 2 } }, 10),
      M('Preferência nacional nas compras públicas', 'Os concursos públicos passam a valorizar a produção nacional e as empresas com sede em Portugal.', [-1, 3, 4], { groups: { empresarios: 3 }, eu: -3 }, 0),
      M('Apoio às empresas familiares', 'As transmissões de empresas familiares entre gerações ficam isentas de imposto do selo.', [3, 4, 0], { groups: { empresarios: 4, agricultores: 2 } }, 30)
    ],
    progressista: [
      M('Fundo para a economia circular', 'É criado um fundo de transição para financiar empresas da economia circular e da descarbonização.', [-2, -3, -1], { groups: { jovens: 3, empresarios: 2 } }, 150),
      M('Transparência salarial', 'As empresas com mais de 50 trabalhadores publicam relatórios anuais de igualdade salarial entre mulheres e homens.', [-2, -4, -1], { groups: { trabalhadores: 2, empresarios: -2 } }, 0),
      M('Estatuto da startup', 'É criado o estatuto de startup, com vistos tecnológicos e tributação reduzida das opções sobre ações.', [3, -3, -2], { econ: { emigration: -1 }, groups: { jovens: 4, empresarios: 3 } }, 40)
    ],
    neutro: [
      M('Pagamentos do Estado a 30 dias', 'O Estado e as autarquias ficam obrigados a pagar aos fornecedores no prazo máximo de 30 dias.', [1, 0, -1], { groups: { empresarios: 5 } }, 0),
      M('Execução acelerada do PRR', 'É criada uma estrutura de missão para garantir a execução integral dos fundos do PRR dentro do prazo.', [0, 0, -2], { econ: { gdp: 0.1 }, eu: 3 }, 20),
      M('Estratégia nacional de exportações', 'O Estado reforça a AICEP e os seguros de crédito à exportação para novos mercados.', [1, 0, -1], { econ: { gdp: 0.05 }, groups: { empresarios: 3 } }, 50)
    ]
  },
  impostos: {
    esquerda: [
      M('Escalão adicional de IRS', 'É criado um novo escalão de IRS, com taxa de 53%, para rendimentos coletáveis superiores a 250 mil euros.', [-6, 0, 1], { groups: { empresarios: -5, trabalhadores: 2 } }, -200),
      M('Fim de benefícios fiscais injustificados', 'São revogados os benefícios fiscais aos fundos imobiliários e os regimes especiais para residentes estrangeiros.', [-5, 0, 1], { econ: { housing: -0.5 }, groups: { empresarios: -4 } }, -300),
      M('IVA reduzido em bens essenciais', 'A eletricidade, o gás e os produtos alimentares básicos passam a ser tributados à taxa reduzida de IVA.', [-3, 0, 2], { econ: { inflation: -0.2 }, groups: { pensionistas: 4, trabalhadores: 4 } }, 800)
    ],
    direita: [
      M('Redução das taxas de IRS', 'As taxas marginais de IRS são reduzidas em dois pontos percentuais em todos os escalões.', [5, 0, -1], { econ: { deficit: 0.3 }, groups: { classe_media: 6, trabalhadores: 3 } }, 1500),
      M('IRC competitivo', 'A taxa de IRC é reduzida em dois pontos percentuais e é eliminada a derrama estadual.', [7, 0, -1], { econ: { gdp: 0.15 }, groups: { empresarios: 8 } }, 900),
      M('IRS de duas taxas', 'O IRS passa a ter apenas duas taxas, de 15% e de 28%, com dedução fixa por dependente.', [9, 1, 2], { econ: { deficit: 0.5 }, groups: { classe_media: 4, empresarios: 6, trabalhadores: -2 } }, 2500)
    ],
    conservador: [
      M('Quociente familiar no IRS', 'O cálculo do IRS passa a considerar o número de filhos através de um quociente familiar.', [2, 5, 0], { groups: { classe_media: 5 } }, 400),
      M('IMI zero na habitação própria', 'A habitação própria e permanente com valor patrimonial até 250 mil euros fica isenta de IMI.', [3, 3, 2], { groups: { classe_media: 5, pensionistas: 3 } }, 350),
      M('Benefícios às famílias numerosas', 'As famílias com três ou mais filhos beneficiam de dedução adicional de IRS e de redução do IMI.', [1, 5, 1], { groups: { classe_media: 3 } }, 150)
    ],
    progressista: [
      M('IVA zero na higiene menstrual', 'Os produtos de higiene menstrual ficam isentos de IVA.', [-1, -4, 0], { groups: { jovens: 2 } }, 15),
      M('Fiscalidade verde', 'É agravada a tributação dos combustíveis fósseis e reduzida a das energias renováveis e dos transportes públicos.', [-2, -3, -1], { econ: { inflation: 0.1 }, groups: { jovens: 2, interior: -3 } }, -100),
      M('Taxa sobre transações financeiras', 'É criada uma taxa de 0,1% sobre transações de ações e de 0,01% sobre derivados financeiros.', [-4, -2, 1], { groups: { empresarios: -3 } }, -100)
    ],
    neutro: [
      M('Escalões atualizados à inflação', 'Os escalões de IRS e as deduções passam a ser atualizados automaticamente de acordo com a inflação.', [1, 0, -1], { groups: { classe_media: 3, trabalhadores: 2 } }, 300),
      M('IRS automático para todos', 'O IRS automático é alargado a todos os contribuintes com rendimentos de trabalho e pensões.', [1, 0, -2], { groups: { classe_media: 2 } }, 5),
      M('Combate à fraude fiscal', 'São reforçados os meios da Autoridade Tributária e a troca automática de informação financeira.', [-1, 0, -1], { econ: { deficit: -0.1 } }, -150)
    ]
  },
  trabalho: {
    esquerda: [
      M('Aumento do salário mínimo', 'O salário mínimo nacional aumenta 75 euros por ano até atingir 60% do salário médio.', [-5, 0, 0], { econ: { inflation: 0.1 }, groups: { trabalhadores: 8, empresarios: -5 } }, 100),
      M('Fim da precariedade no Estado', 'Os trabalhadores precários que asseguram necessidades permanentes do Estado são integrados nos quadros.', [-4, 0, 0], { groups: { funcpublicos: 6, jovens: 3 } }, 150),
      M('35 horas para todos', 'O período normal de trabalho no setor privado passa a ser de 35 horas semanais, sem perda salarial.', [-6, -1, 1], { econ: { gdp: -0.1 }, groups: { trabalhadores: 8, empresarios: -8 } }, 0)
    ],
    direita: [
      M('Banco de horas individual', 'É admitido o banco de horas individual por acordo entre o trabalhador e o empregador.', [5, 0, -1], { groups: { empresarios: 6, trabalhadores: -5 } }, 0),
      M('Redução da TSU patronal', 'A taxa social única das empresas é reduzida em dois pontos percentuais para novos contratos sem termo.', [5, 0, -1], { econ: { unemployment: -0.1, deficit: 0.2 }, groups: { empresarios: 6, trabalhadores: 1 } }, 600),
      M('Simplificação dos despedimentos', 'São simplificados os procedimentos de despedimento por inadaptação e por extinção do posto de trabalho.', [7, 0, 0], { groups: { empresarios: 7, trabalhadores: -8 }, unrest: 3 }, 0)
    ],
    conservador: [
      M('Licença parental de 12 meses', 'A licença parental inicial passa a ser de 12 meses pagos a 100%, partilhável entre os progenitores.', [-2, 3, -1], { groups: { trabalhadores: 4, classe_media: 4 } }, 300),
      M('Prioridade ao emprego residente', 'Os centros de emprego dão prioridade aos desempregados residentes antes de autorizar recrutamento no estrangeiro.', [0, 4, 4], { groups: { imigrantes: -5, trabalhadores: 2, empresarios: -2 } }, 0),
      M('Descanso ao domingo', 'O trabalho ao domingo no comércio passa a exigir o acordo do trabalhador e uma majoração de 50%.', [-2, 4, 1], { groups: { trabalhadores: 3, empresarios: -3 } }, 0)
    ],
    progressista: [
      M('Direito a desligar reforçado', 'É proibido ao empregador contactar o trabalhador fora do horário de trabalho, salvo motivo de força maior.', [-2, -3, 0], { groups: { trabalhadores: 3, jovens: 3 } }, 0),
      M('Teletrabalho como direito', 'Os trabalhadores com funções compatíveis passam a ter direito a dois dias de teletrabalho por semana.', [-1, -3, 0], { groups: { classe_media: 3, jovens: 3, empresarios: -2 } }, 0),
      M('Projeto-piloto da semana de quatro dias', 'É lançado um projeto-piloto nacional de semana de quatro dias, com apoio público às empresas aderentes.', [-3, -3, 0], { groups: { jovens: 4, trabalhadores: 3 } }, 50)
    ],
    neutro: [
      M('Formação profissional garantida', 'Cada trabalhador passa a ter direito a 40 horas anuais de formação certificada paga pelo empregador.', [0, 0, -1], { groups: { trabalhadores: 2 } }, 30),
      M('Reforço da ACT', 'A Autoridade para as Condições do Trabalho recebe 300 novos inspetores.', [-1, 0, -1], { groups: { trabalhadores: 3 } }, 20),
      M('Conciliação entre trabalho e família', 'As empresas que ofereçam horários flexíveis a pais de crianças até 12 anos beneficiam de majoração fiscal.', [1, 1, -1], { groups: { classe_media: 2 } }, 40)
    ]
  },
  saude: {
    esquerda: [
      M('Exclusividade no SNS', 'Os médicos que ingressem no SNS ficam em regime de exclusividade, com majoração salarial de 40%.', [-5, 0, 0], { econ: { waiting: -3 }, groups: { saude: 2 } }, 400),
      M('Fim do recurso aos privados', 'O SNS reduz progressivamente as convenções com prestadores privados, investindo na capacidade própria.', [-7, 0, 1], { econ: { waiting: 3 }, groups: { empresarios: -4 } }, 300),
      M('Contratação de profissionais de saúde', 'O SNS contrata 3000 enfermeiros e 1500 médicos nos próximos dois anos.', [-3, 0, -1], { econ: { waiting: -4 }, groups: { saude: 6 } }, 350)
    ],
    direita: [
      M('Liberdade de escolha do prestador', 'O utente pode escolher ser atendido no setor público, social ou privado, pagando o Estado o mesmo preço.', [6, 0, 0], { econ: { waiting: -4 }, groups: { saude: -3, empresarios: 4 } }, 500),
      M('Gestão privada de hospitais', 'Os hospitais com piores indicadores passam a ser geridos em regime de parceria público-privada.', [5, 0, 0], { econ: { waiting: -2 }, groups: { saude: -2 } }, -50),
      M('Seguros de saúde dedutíveis', 'Os prémios de seguros de saúde passam a ser integralmente dedutíveis no IRS.', [5, 0, 0], { groups: { classe_media: 3, saude: -1 } }, 150)
    ],
    conservador: [
      M('Cuidados paliativos para todos', 'É garantida uma rede nacional de cuidados paliativos com cobertura em todos os distritos.', [-1, 4, -1], { groups: { pensionistas: 5 } }, 120),
      M('Apoio aos cuidadores informais', 'Os cuidadores informais passam a receber um subsídio mensal e a ter direito a períodos de descanso.', [-2, 3, -1], { groups: { pensionistas: 4, classe_media: 2 } }, 150),
      M('Médicos para o interior', 'Os médicos que se fixem no interior recebem um suplemento de 1000 euros mensais e habitação.', [-1, 2, -1], { econ: { waiting: -2 }, groups: { interior: 6 } }, 60)
    ],
    progressista: [
      M('Saúde mental no SNS', 'Cada centro de saúde passa a ter um psicólogo e é criado o cheque-psicólogo para jovens.', [-2, -3, -1], { econ: { waiting: -1 }, groups: { jovens: 5 } }, 80),
      M('Saúde oral no SNS', 'É criado o cheque-dentista universal e são integrados médicos dentistas nos centros de saúde.', [-3, -2, 0], { groups: { pensionistas: 3, classe_media: 2 } }, 120),
      M('Prevenção e saúde pública', 'A receita do imposto sobre bebidas açucaradas passa a financiar programas de prevenção da doença.', [-2, -3, -1], { groups: { saude: 2 } }, -30)
    ],
    neutro: [
      M('Rede de urgências regionais', 'As urgências são reorganizadas em rede regional, com escalas obrigatórias e a linha SNS 24 como porta de entrada.', [0, 0, -1], { econ: { waiting: -2 }, groups: { saude: -1 } }, 50),
      M('Processo clínico eletrónico único', 'É criado o processo clínico eletrónico único, acessível em qualquer unidade do SNS.', [0, 0, -2], { econ: { waiting: -1 } }, 60),
      M('Reforço do INEM', 'O INEM recebe novas ambulâncias, helicópteros e 400 técnicos de emergência pré-hospitalar.', [-1, 0, -1], { econ: { waiting: -1 }, groups: { saude: 3, interior: 2 } }, 70)
    ]
  },
  educacao: {
    esquerda: [
      M('Propinas zero', 'São abolidas as propinas de licenciatura e mestrado no ensino superior público.', [-5, -1, 0], { groups: { jovens: 8, classe_media: 3 } }, 350),
      M('Vinculação dos professores contratados', 'Os professores com três ou mais anos de serviço são vinculados aos quadros.', [-4, 0, 0], { groups: { professores: 8 } }, 120),
      M('Escola pública a tempo inteiro', 'As escolas públicas passam a oferecer atividades gratuitas até às 19 horas.', [-3, -1, -1], { groups: { classe_media: 4, professores: -1 } }, 150)
    ],
    direita: [
      M('Autonomia das escolas', 'As escolas passam a contratar diretamente os seus professores e a gerir o seu orçamento.', [5, 0, -1], { groups: { professores: -4, classe_media: 2 } }, 0),
      M('Contratos de associação', 'O Estado financia escolas privadas com contrato de associação onde a oferta pública seja insuficiente.', [5, 2, 0], { groups: { professores: -4, classe_media: 3 } }, 100),
      M('Avaliação e mérito', 'São reintroduzidos exames nacionais no 4.º e no 6.º ano e prémios às escolas com maiores progressos.', [3, 3, 0], { groups: { professores: -3, classe_media: 2 } }, 20)
    ],
    conservador: [
      M('Autoridade do professor', 'O professor passa a beneficiar do estatuto de autoridade pública e são agravadas as sanções disciplinares.', [1, 5, 2], { groups: { professores: 6, jovens: -3 } }, 0),
      M('Cidadania facultativa', 'A disciplina de Cidadania e Desenvolvimento passa a ser facultativa, por opção dos encarregados de educação.', [1, 6, 3], { groups: { professores: -2, classe_media: 1 } }, 0),
      M('Ensino da História de Portugal', 'É reforçada a carga horária da História de Portugal no ensino básico e secundário.', [0, 4, 1], { groups: { classe_media: 1 } }, 5)
    ],
    progressista: [
      M('Educação sexual e para a igualdade', 'A educação sexual e para a igualdade passa a integrar o currículo obrigatório em todos os ciclos.', [-1, -5, 0], { groups: { jovens: 2, pensionistas: -2 } }, 5),
      M('Escola inclusiva', 'É reforçado o número de professores de educação especial e de terapeutas nas escolas.', [-3, -3, -1], { groups: { professores: 3, classe_media: 2 } }, 90),
      M('Competências digitais', 'Todos os alunos recebem equipamento informático e as escolas passam a ensinar programação.', [-1, -2, -1], { groups: { jovens: 3 } }, 80)
    ],
    neutro: [
      M('Recuperação de aprendizagens', 'É criado um programa de tutorias para alunos com dificuldades a Português e a Matemática.', [0, 0, -1], { groups: { professores: 2, classe_media: 2 } }, 60),
      M('Alojamento estudantil', 'São construídas 18 mil camas em residências universitárias públicas até 2028.', [-2, 0, -1], { econ: { housing: -0.3 }, groups: { jovens: 6 } }, 120),
      M('Valorização da carreira docente', 'A carreira docente é revista, com progressão mais rápida nos primeiros escalões.', [-2, 0, 0], { groups: { professores: 8 } }, 200)
    ]
  },
  habitacao: {
    esquerda: [
      M('Teto aos aumentos das rendas', 'Os aumentos anuais das rendas ficam limitados a 2% durante três anos.', [-6, -1, 1], { econ: { housing: -1.5 }, groups: { jovens: 6, empresarios: -5 } }, 0),
      M('Parque habitacional público', 'O Estado constrói 30 mil fogos de habitação pública a custos controlados até 2030.', [-5, 0, -1], { econ: { housing: -2 }, groups: { jovens: 6, classe_media: 4 } }, 700),
      M('Mobilização de casas devolutas', 'Os imóveis devolutos há mais de dois anos em zonas de pressão ficam sujeitos a arrendamento obrigatório.', [-7, -1, 1], { econ: { housing: -1 }, groups: { empresarios: -6 } }, 20)
    ],
    direita: [
      M('Licenciamento rápido', 'Os pedidos de licenciamento urbanístico consideram-se deferidos se não houver decisão em 60 dias.', [5, 0, -1], { econ: { housing: -1 }, groups: { empresarios: 5 } }, 0),
      M('IVA a 6% na construção', 'A construção de habitação para venda ou arrendamento a preços moderados é tributada a 6% de IVA.', [5, 0, -1], { econ: { housing: -1.2 }, groups: { empresarios: 5 } }, 300),
      M('Libertação de solos públicos', 'O Estado disponibiliza terrenos públicos a promotores privados com compromisso de preços acessíveis.', [4, 0, -1], { econ: { housing: -1 }, groups: { empresarios: 4, jovens: 2 } }, -50)
    ],
    conservador: [
      M('Garantia para jovens casais', 'Os casais até aos 35 anos beneficiam de garantia pública no crédito à primeira habitação.', [2, 3, 0], { econ: { housing: 0.3 }, groups: { jovens: 5, classe_media: 2 } }, 30),
      M('Despejo célere', 'É criado um balcão de despejo célere para incumprimento de rendas, com decisão em 30 dias.', [4, 3, 1], { groups: { empresarios: 4, jovens: -3 } }, 5),
      M('Repovoamento das aldeias', 'São concedidos apoios à reabilitação de casas no interior às famílias que aí se fixem.', [0, 2, 0], { groups: { interior: 5 } }, 60)
    ],
    progressista: [
      M('Cooperativas de habitação', 'O Estado apoia cooperativas de habitação com cedência de terrenos em direito de superfície.', [-3, -2, -1], { econ: { housing: -0.5 }, groups: { jovens: 3, classe_media: 2 } }, 80),
      M('Limites ao alojamento local', 'São proibidos novos registos de alojamento local nos centros históricos com carência habitacional.', [-4, -1, 0], { econ: { housing: -1 }, groups: { jovens: 4, empresarios: -4 } }, 0),
      M('Reabilitação energética das casas', 'São criados apoios à reabilitação energética das habitações de famílias de baixos rendimentos.', [-2, -2, -1], { groups: { pensionistas: 3, classe_media: 2 } }, 100)
    ],
    neutro: [
      M('Porta 65 alargado', 'O apoio ao arrendamento jovem Porta 65 é alargado a todos os jovens até aos 35 anos.', [-1, 0, -1], { groups: { jovens: 5 } }, 80),
      M('IMT zero para jovens', 'A compra da primeira habitação por jovens até aos 35 anos fica isenta de IMT e de imposto do selo.', [2, 0, -1], { groups: { jovens: 5 } }, 150),
      M('Bolsa de arrendamento acessível', 'É criada uma bolsa pública que garante as rendas aos senhorios que arrendem abaixo do preço de mercado.', [0, 0, -1], { econ: { housing: -0.5 }, groups: { jovens: 3, empresarios: 1 } }, 60)
    ]
  },
  seguranca: {
    esquerda: [
      M('Policiamento de proximidade', 'É criado um programa de policiamento de proximidade em todos os bairros sociais, com agentes fixos.', [-2, -1, -1], { econ: { crime: -2 }, groups: { seguranca: 2 } }, 60),
      M('Valorização salarial das polícias', 'É revisto o estatuto remuneratório das forças de segurança, com um subsídio de risco digno.', [-2, 1, 0], { groups: { seguranca: 10 } }, 180),
      M('Resposta à violência doméstica', 'São criadas equipas especializadas na violência doméstica em todos os comandos distritais.', [-1, -3, -1], { econ: { crime: -1 }, groups: { classe_media: 2 } }, 30)
    ],
    direita: [
      M('Mais agentes nas ruas', 'São recrutados 2500 novos agentes para a PSP e a GNR nos próximos dois anos.', [0, 3, 0], { econ: { crime: -3 }, groups: { seguranca: 6 } }, 150),
      M('Videovigilância urbana', 'É autorizada a videovigilância nas zonas urbanas com maior criminalidade.', [1, 3, 1], { econ: { crime: -2 }, groups: { jovens: -1 } }, 30),
      M('Segurança privada complementar', 'As empresas de segurança privada podem colaborar com as polícias na vigilância de grandes eventos.', [4, 2, 0], { groups: { seguranca: -2, empresarios: 2 } }, -10)
    ],
    conservador: [
      M('Tolerância zero para agressões', 'São agravadas as penas para agressões a agentes de autoridade, professores e profissionais de saúde.', [0, 6, 4], { econ: { crime: -1 }, groups: { seguranca: 5, professores: 2, saude: 2 } }, 5),
      M('Expulsão de estrangeiros condenados', 'Os estrangeiros condenados a penas superiores a três anos são expulsos após o cumprimento da pena.', [0, 7, 5], { groups: { imigrantes: -6, seguranca: 2 } }, 10),
      M('Polícia municipal reforçada', 'As polícias municipais passam a ter competências na pequena criminalidade.', [1, 3, 2], { econ: { crime: -1 } }, 40)
    ],
    progressista: [
      M('Controlo independente da atividade policial', 'Os agentes passam a usar câmaras corporais e é criada uma entidade independente de controlo da atividade policial.', [-1, -3, -1], { groups: { seguranca: -2, jovens: 2 } }, 30),
      M('Combate aos crimes de ódio', 'São criadas unidades especializadas na investigação de crimes de ódio e de discriminação.', [-1, -5, -1], { groups: { imigrantes: 3 } }, 10),
      M('Reinserção social de reclusos', 'É reforçado o programa de reinserção de reclusos, com formação profissional e acompanhamento após a libertação.', [-2, -3, -1], { econ: { crime: -1 } }, 40)
    ],
    neutro: [
      M('Modernização dos equipamentos', 'As forças de segurança recebem novas viaturas, coletes e sistemas de comunicação.', [0, 1, -1], { groups: { seguranca: 5 } }, 80),
      M('Prevenção dos incêndios rurais', 'É reforçado o dispositivo de combate aos incêndios rurais, com mais meios aéreos e equipas de sapadores.', [0, 0, -1], { groups: { interior: 4, agricultores: 2 } }, 100),
      M('Centro de cibersegurança', 'É criado um centro nacional de resposta a ataques informáticos contra serviços públicos.', [0, 0, -2], { media: 1 }, 30)
    ]
  },
  justica: {
    esquerda: [
      M('Apoio judiciário alargado', 'O acesso ao apoio judiciário é alargado às famílias com rendimentos até dois salários mínimos.', [-3, -1, 0], { groups: { trabalhadores: 3 } }, 40),
      M('Acesso a informação bancária', 'O Ministério Público passa a aceder diretamente a informação bancária em investigações de corrupção.', [-2, 0, 2], { media: 2, groups: { empresarios: -2 } }, 0),
      M('Meios contra a criminalidade económica', 'São reforçados os meios da Polícia Judiciária e do Ministério Público no combate à corrupção.', [-1, 0, 1], { media: 2 }, 50)
    ],
    direita: [
      M('Arbitragem alargada', 'É alargado o recurso à arbitragem para litígios comerciais e fiscais.', [5, 0, -1], { groups: { empresarios: 4 } }, -10),
      M('Simplificação processual', 'São limitados os recursos dilatórios e fixados prazos máximos para as decisões judiciais.', [3, 1, 0], { groups: { empresarios: 3 } }, 10),
      M('Gestão profissional dos tribunais', 'Os tribunais passam a ter administradores profissionais com objetivos de produtividade.', [3, 0, -1], { groups: { funcpublicos: -2 } }, 10)
    ],
    conservador: [
      M('Agravamento das penas', 'São agravadas as penas para crimes violentos, incêndio florestal e tráfico de droga.', [0, 6, 3], { econ: { crime: -1 }, groups: { seguranca: 3 } }, 20),
      M('Cumprimento efetivo das penas', 'A liberdade condicional só é possível após o cumprimento de dois terços da pena.', [0, 6, 3], { groups: { seguranca: 2 } }, 30),
      M('Perda alargada de bens', 'Os bens de condenados por corrupção cuja origem lícita não seja demonstrada revertem para o Estado.', [0, 3, 4], { media: 2 }, -20)
    ],
    progressista: [
      M('Penas alternativas à prisão', 'São alargadas as penas de trabalho comunitário e de vigilância eletrónica para crimes menores.', [-1, -4, -1], { econ: { crime: 1 } }, -30),
      M('Justiça restaurativa', 'É criado um programa nacional de justiça restaurativa para jovens infratores.', [-1, -3, -1], { groups: { jovens: 1 } }, 10),
      M('Proteção das vítimas', 'As vítimas de crimes violentos passam a ter advogado gratuito e indemnização antecipada pelo Estado.', [-2, -1, 0], { groups: { classe_media: 2 } }, 30)
    ],
    neutro: [
      M('Mais oficiais de justiça', 'São contratados 1000 oficiais de justiça e é revisto o seu estatuto.', [-1, 0, -1], { groups: { funcpublicos: 3 } }, 50),
      M('Justiça digital', 'Todos os processos passam a ser eletrónicos e as audiências podem decorrer por videoconferência.', [1, 0, -2], { groups: { empresarios: 2 } }, 30),
      M('Registo de representantes de interesses', 'É criado um registo obrigatório de representantes de interesses junto do Governo e do Parlamento.', [0, 0, -1], { media: 2 }, 2)
    ]
  },
  imigracao: {
    esquerda: [
      M('Regularização de quem trabalha', 'Os imigrantes que descontam para a Segurança Social há pelo menos um ano podem obter autorização de residência.', [-2, -4, 0], { groups: { imigrantes: 10, empresarios: 2 } }, 20),
      M('Combate à exploração laboral', 'São reforçadas as inspeções às explorações agrícolas e às empresas de trabalho temporário.', [-3, -2, 0], { groups: { imigrantes: 5, agricultores: -3 } }, 15),
      M('Alojamento digno para trabalhadores', 'É criado um programa de alojamento temporário para trabalhadores imigrantes em zonas de forte procura.', [-3, -3, 0], { groups: { imigrantes: 6 } }, 40)
    ],
    direita: [
      M('Imigração com contrato prévio', 'A entrada de trabalhadores estrangeiros passa a depender de um contrato de trabalho prévio.', [2, 4, 2], { groups: { imigrantes: -5, empresarios: -1 } }, 0),
      M('Visto para talento', 'É criado um visto rápido para trabalhadores altamente qualificados e investigadores.', [3, -1, -2], { econ: { gdp: 0.05 }, groups: { empresarios: 4 } }, 5),
      M('Recrutamento pelas empresas', 'As associações empresariais podem recrutar no estrangeiro através de canais acelerados.', [4, 0, -1], { groups: { empresarios: 5, imigrantes: 2 } }, 5)
    ],
    conservador: [
      M('Quotas de imigração', 'O Parlamento aprova anualmente o número máximo de autorizações de residência por setor.', [0, 6, 5], { groups: { imigrantes: -8, empresarios: -3 } }, 0),
      M('Unidade de controlo de fronteiras', 'É criada uma unidade especial de controlo de fronteiras e de afastamento de imigrantes em situação ilegal.', [0, 6, 4], { groups: { imigrantes: -6, seguranca: 3 } }, 60),
      M('Exigência de português', 'A autorização de residência permanente passa a exigir conhecimento comprovado da língua portuguesa.', [0, 4, 2], { groups: { imigrantes: -3 } }, 5)
    ],
    progressista: [
      M('Integração pela língua', 'Todos os imigrantes passam a ter acesso gratuito a cursos de português e de cidadania.', [-1, -3, -1], { groups: { imigrantes: 5 } }, 20),
      M('Voto autárquico para residentes', 'Os residentes estrangeiros há mais de cinco anos podem votar nas eleições autárquicas.', [-1, -4, 0], { groups: { imigrantes: 4 } }, 0),
      M('Corredores humanitários', 'Portugal acolhe 2000 refugiados por ano através de corredores humanitários europeus.', [-1, -4, -1], { groups: { imigrantes: 3 }, eu: 2 }, 30)
    ],
    neutro: [
      M('AIMA eficiente', 'A AIMA recebe os meios necessários para decidir todos os pedidos em 90 dias.', [0, 0, -2], { groups: { imigrantes: 6, empresarios: 2 } }, 50),
      M('Rede consular reforçada', 'São reforçados os consulados nos países de origem dos principais fluxos migratórios.', [0, 0, -1], { groups: { imigrantes: 2 } }, 15),
      M('Acordos de mobilidade laboral', 'Portugal celebra acordos bilaterais de mobilidade laboral com países terceiros.', [1, 0, -1], { groups: { empresarios: 3, imigrantes: 2 } }, 5)
    ]
  },
  ambiente: {
    esquerda: [
      M('Transportes públicos gratuitos', 'Os transportes públicos urbanos passam a ser gratuitos para estudantes e reformados.', [-4, -2, 0], { groups: { jovens: 4, pensionistas: 4 } }, 200),
      M('Fim dos subsídios fósseis', 'São eliminados progressivamente os benefícios fiscais aos combustíveis fósseis na indústria.', [-3, -3, 0], { groups: { empresarios: -3 } }, -150),
      M('Floresta pública', 'O Estado adquire e gere terrenos florestais abandonados para prevenir incêndios.', [-4, -1, 0], { groups: { interior: 3, agricultores: 1 } }, 80)
    ],
    direita: [
      M('Créditos de carbono florestais', 'As empresas podem compensar emissões através de créditos de carbono florestais certificados.', [4, -1, -1], { groups: { empresarios: 3, agricultores: 2 } }, 0),
      M('Licenciamento ambiental simplificado', 'São reduzidos os prazos de avaliação de impacte ambiental para projetos de energia renovável.', [4, 0, 0], { econ: { gdp: 0.05 }, groups: { empresarios: 3 } }, 0),
      M('Incentivos à inovação verde', 'São criados incentivos fiscais à investigação em tecnologias limpas.', [3, -1, -1], { groups: { empresarios: 3 } }, 60)
    ],
    conservador: [
      M('Gestão ativa da floresta', 'Os proprietários florestais recebem apoio para a limpeza de terrenos e o pastoreio preventivo.', [1, 2, 0], { groups: { agricultores: 4, interior: 3 } }, 60),
      M('Caça e pesca sustentáveis', 'São simplificadas as licenças de caça e pesca e reforçado o papel das associações locais.', [1, 4, 1], { groups: { interior: 3, agricultores: 2 } }, 0),
      M('Avaliação do impacto rural', 'As medidas ambientais passam a ter avaliação obrigatória do seu impacto no mundo rural.', [1, 3, 2], { groups: { agricultores: 3, interior: 2 } }, 0)
    ],
    progressista: [
      M('Lei do clima ambiciosa', 'Portugal antecipa a neutralidade carbónica para 2045, com metas vinculativas por setor.', [-3, -4, -1], { groups: { jovens: 5, empresarios: -3 }, eu: 2 }, 200),
      M('Áreas marinhas protegidas', 'São criadas áreas marinhas protegidas que abrangem 30% do mar português.', [-1, -3, -1], { groups: { agricultores: -2 }, eu: 2 }, 20),
      M('Fim dos plásticos descartáveis', 'São proibidos os plásticos de utilização única na restauração e no comércio.', [-2, -3, 0], { groups: { empresarios: -2, jovens: 2 } }, 0)
    ],
    neutro: [
      M('Eficiência hídrica', 'É lançado um programa de redução de perdas nas redes municipais de água e de reutilização de águas residuais.', [0, 0, -1], { groups: { agricultores: 3 } }, 100),
      M('Dessalinização no Algarve', 'É construída uma central de dessalinização para garantir o abastecimento de água no Algarve.', [0, 0, -1], { groups: { agricultores: 3 } }, 50),
      M('Prevenção de cheias', 'São reforçadas as infraestruturas de drenagem nas zonas urbanas com risco de inundação.', [0, 0, -1], { groups: { classe_media: 2 } }, 70)
    ]
  },
  energia: {
    esquerda: [
      M('Controlo público das redes', 'O Estado recupera uma posição de controlo nas redes elétricas nacionais.', [-7, 0, 2], { groups: { empresarios: -4 } }, 300),
      M('Tarifa social alargada', 'A tarifa social de energia é alargada às famílias com rendimentos até 1,5 salários mínimos.', [-3, 0, 0], { groups: { pensionistas: 4, trabalhadores: 3 } }, 120),
      M('Preços máximos da energia', 'São fixados preços máximos para a eletricidade e o gás dos clientes domésticos.', [-6, 0, 2], { econ: { inflation: -0.2 }, groups: { pensionistas: 3, empresarios: -4 } }, 200)
    ],
    direita: [
      M('Mercado energético liberalizado', 'São eliminadas as tarifas reguladas e reforçada a concorrência no mercado da eletricidade.', [6, 0, 0], { groups: { empresarios: 3, pensionistas: -2 } }, -50),
      M('Exploração de recursos nacionais', 'É autorizada a exploração de lítio, com contrapartidas financeiras para os municípios.', [4, 1, 0], { econ: { gdp: 0.1 }, groups: { empresarios: 4, interior: -1 } }, -30),
      M('Estudo da energia nuclear', 'É criado um grupo de trabalho para avaliar pequenos reatores nucleares modulares.', [3, 2, 2], { groups: { empresarios: 2 } }, 5)
    ],
    conservador: [
      M('Soberania energética', 'Portugal fixa a meta de produzir 90% da sua eletricidade a partir de fontes nacionais até 2035.', [0, 2, 2], { groups: { empresarios: 2 } }, 100),
      M('Proteção dos solos agrícolas', 'São proibidas centrais solares de grande dimensão em solos agrícolas de elevada qualidade.', [0, 3, 2], { groups: { agricultores: 4, empresarios: -2 } }, 0),
      M('Cheque-energia de inverno', 'É criado um cheque-energia de inverno para idosos com pensões baixas.', [-2, 2, 1], { groups: { pensionistas: 5 } }, 80)
    ],
    progressista: [
      M('Comunidades de energia', 'Os cidadãos e as autarquias podem criar comunidades de energia renovável com apoio público.', [-2, -3, -1], { groups: { classe_media: 3 } }, 60),
      M('Fim das caldeiras a gás', 'É proibida a instalação de caldeiras a gás em edifícios novos a partir de 2028.', [-2, -3, 0], { groups: { classe_media: -2, jovens: 2 } }, 0),
      M('Hidrogénio verde em Sines', 'É apoiada a produção de hidrogénio verde em Sines com fundos europeus.', [-1, -2, -1], { econ: { gdp: 0.05 }, eu: 2 }, 50)
    ],
    neutro: [
      M('Autoconsumo solar', 'As famílias que instalem painéis solares recebem um apoio de 50% do investimento.', [-1, -1, -1], { groups: { classe_media: 4 } }, 120),
      M('Interligações elétricas', 'Portugal reforça as interligações elétricas com Espanha e França para prevenir apagões.', [0, 0, -2], { eu: 2 }, 80),
      M('Armazenamento de energia', 'São instaladas baterias de grande escala para garantir a estabilidade da rede elétrica.', [0, 0, -1], { groups: { empresarios: 1 } }, 100)
    ]
  },
  transportes: {
    esquerda: [
      M('Ferrovia pública para o interior', 'A CP recebe investimento para renovar a frota e reabrir linhas encerradas no interior.', [-4, -1, 0], { groups: { interior: 4, trabalhadores: 2 } }, 250),
      M('Transportes gratuitos para jovens', 'Os jovens até aos 23 anos passam a viajar gratuitamente em todos os transportes públicos.', [-3, -2, 0], { groups: { jovens: 6 } }, 120),
      M('TAP integralmente pública', 'A TAP mantém-se integralmente pública, ao serviço das comunidades e da coesão territorial.', [-5, 0, 1], { groups: { trabalhadores: 2 } }, 80)
    ],
    direita: [
      M('Concessão de transportes', 'As linhas de autocarro e de ferrovia regionais são concessionadas a operadores privados por concurso.', [5, 0, 0], { groups: { empresarios: 3, trabalhadores: -2 } }, -50),
      M('Venda da maioria da TAP', 'O Estado aliena a maioria do capital da TAP a um grande grupo aéreo.', [6, 0, 0], { budget: -800, groups: { empresarios: 3, trabalhadores: -3 } }, 0),
      M('Parcerias para infraestruturas', 'As novas infraestruturas rodoviárias e ferroviárias passam a ser financiadas em parceria com privados.', [4, 0, -1], { econ: { gdp: 0.05 }, groups: { empresarios: 3 } }, -30)
    ],
    conservador: [
      M('Estradas para o interior', 'É concluída a rede de itinerários complementares que liga as sedes de concelho do interior.', [0, 2, 1], { groups: { interior: 5 } }, 150),
      M('Fim das portagens no interior', 'São abolidas as portagens nas autoestradas que servem os distritos do interior.', [-1, 2, 2], { groups: { interior: 6 } }, 150),
      M('Referendo às zonas de emissões', 'As zonas de emissões reduzidas passam a depender de referendo local.', [1, 3, 3], { groups: { classe_media: 2, jovens: -1 } }, 0)
    ],
    progressista: [
      M('Rede nacional de ciclovias', 'É criada uma rede nacional de ciclovias e um apoio à compra de bicicletas.', [-1, -3, -1], { groups: { jovens: 3 } }, 50),
      M('Zonas de emissões reduzidas', 'Lisboa e Porto passam a ter zonas de emissões reduzidas nos centros urbanos.', [-1, -3, 0], { groups: { classe_media: -1, jovens: 2 } }, 0),
      M('Comboios noturnos para a Europa', 'Portugal retoma as ligações ferroviárias noturnas a Madrid e a Paris.', [-1, -2, -1], { eu: 2 }, 30)
    ],
    neutro: [
      M('Alta velocidade', 'É acelerada a construção da linha de alta velocidade entre Lisboa e o Porto.', [0, 0, -2], { econ: { gdp: 0.1 }, groups: { empresarios: 2 } }, 250),
      M('Novo aeroporto', 'É acelerada a construção do Aeroporto Luís de Camões, no Campo de Tiro de Alcochete.', [1, 0, -2], { econ: { gdp: 0.1 }, groups: { empresarios: 3 } }, 100),
      M('Metro e transportes urbanos', 'São alargadas as redes de metro de Lisboa e do Porto e reforçadas as frotas de autocarros.', [-1, 0, -1], { groups: { classe_media: 3, trabalhadores: 2 } }, 200)
    ]
  },
  social: {
    esquerda: [
      M('Aumento das pensões', 'Todas as pensões até três IAS têm um aumento extraordinário de 50 euros mensais.', [-4, 0, 1], { econ: { deficit: 0.2 }, groups: { pensionistas: 10 } }, 700),
      M('RSI até ao limiar da pobreza', 'O Rendimento Social de Inserção é aumentado até ao limiar da pobreza.', [-5, -1, 0], { groups: { trabalhadores: 1, classe_media: -2 } }, 200),
      M('Abono de família universal', 'O abono de família passa a ser atribuído a todas as crianças, independentemente do rendimento.', [-4, 0, 0], { groups: { classe_media: 4, trabalhadores: 3 } }, 400)
    ],
    direita: [
      M('Plafonamento das contribuições', 'Os rendimentos acima de um teto podem ser descontados para fundos de pensões privados.', [7, 0, 0], { groups: { classe_media: 2, pensionistas: -4 } }, 300),
      M('Condicionalidade das prestações', 'As prestações sociais para pessoas em idade ativa passam a exigir procura ativa de emprego ou formação.', [4, 3, 2], { groups: { classe_media: 2 } }, -80),
      M('Parceria com o setor social', 'O Estado contratualiza com as IPSS e as Misericórdias a gestão de respostas sociais.', [3, 2, -1], { groups: { pensionistas: 2 } }, 50)
    ],
    conservador: [
      M('Cheque-bebé', 'É criado um cheque-bebé de 2000 euros e majoradas as prestações a partir do segundo filho.', [-1, 5, 1], { groups: { classe_media: 4, jovens: 3 } }, 250),
      M('Mais vagas em lares', 'São abertas 10 mil novas vagas em lares e reforçado o apoio domiciliário.', [-2, 3, -1], { groups: { pensionistas: 6 } }, 200),
      M('Avaliação do impacto familiar', 'Todas as novas leis passam a ter avaliação obrigatória do impacto nas famílias.', [0, 5, 1], { groups: { classe_media: 1 } }, 0)
    ],
    progressista: [
      M('Garantia para a Infância', 'É criada uma prestação mensal para crianças em situação de pobreza extrema.', [-3, -2, -1], { groups: { trabalhadores: 2 } }, 150),
      M('Quotas de emprego para pessoas com deficiência', 'São reforçadas as quotas de emprego para pessoas com deficiência nos setores público e privado.', [-2, -3, -1], { groups: { trabalhadores: 1 } }, 20),
      M('Rendimento básico experimental', 'É lançado um projeto-piloto de rendimento básico incondicional em três concelhos.', [-3, -3, 1], { groups: { jovens: 2 } }, 40)
    ],
    neutro: [
      M('CSI reforçado', 'O valor de referência do Complemento Solidário para Idosos sobe até ao limiar da pobreza.', [-2, 0, 0], { groups: { pensionistas: 6 } }, 250),
      M('Prestações automáticas', 'As prestações sociais passam a ser atribuídas automaticamente com base nos dados da Segurança Social.', [0, 0, -2], { groups: { pensionistas: 2 } }, 30),
      M('Reforço do Fundo de Estabilização', 'O Fundo de Estabilização Financeira da Segurança Social passa a receber uma parte da receita do IRC.', [1, 0, -2], { groups: { pensionistas: 1 } }, 100)
    ]
  },
  defesa: {
    esquerda: [
      M('Missões apenas sob mandato da ONU', 'Portugal limita a participação em missões militares às aprovadas pelas Nações Unidas.', [-3, -1, 2], { eu: -3 }, -50),
      M('Valorização dos militares', 'São revistos os salários e as carreiras dos militares das categorias de praças e sargentos.', [-2, 1, 0], { groups: { seguranca: 5 } }, 120),
      M('Indústria de defesa pública', 'O investimento em defesa passa a privilegiar as empresas públicas nacionais.', [-4, 1, 1], { groups: { trabalhadores: 2 } }, 50)
    ],
    direita: [
      M('Defesa a 2% do PIB', 'O investimento em defesa atinge 2% do PIB, conforme os compromissos assumidos na NATO.', [2, 2, -2], { groups: { seguranca: 5 }, eu: 3 }, 1200),
      M('Indústria de defesa europeia', 'São criados incentivos à instalação de indústria de defesa europeia em Portugal.', [4, 1, -1], { econ: { gdp: 0.05 }, groups: { empresarios: 3 } }, 60),
      M('Modernização das Forças Armadas', 'São adquiridos novos navios-patrulha, aeronaves e drones.', [2, 2, -1], { groups: { seguranca: 4 } }, 400)
    ],
    conservador: [
      M('Serviço militar voluntário premiado', 'Os jovens que cumpram um ano de serviço militar voluntário recebem bolsa de estudo e prioridade no emprego público.', [0, 4, 1], { groups: { jovens: 2, seguranca: 3 } }, 80),
      M('Formação cívico-militar', 'O Dia da Defesa Nacional passa a incluir uma semana de formação cívico-militar.', [0, 5, 2], { groups: { jovens: -3 } }, 30),
      M('Reserva de voluntários', 'É criada uma reserva militar de 20 mil voluntários para apoio em catástrofes.', [0, 3, 1], { groups: { seguranca: 2 } }, 40)
    ],
    progressista: [
      M('Força europeia de reação rápida', 'Portugal participa numa força europeia comum de reação rápida.', [0, -2, -3], { eu: 4 }, 100),
      M('Igualdade nas Forças Armadas', 'São eliminadas as barreiras ao acesso das mulheres a todas as especialidades militares.', [0, -3, -1], { groups: { seguranca: 1 } }, 5),
      M('Capacidade humanitária', 'As Forças Armadas reforçam a capacidade de resposta a catástrofes naturais e a missões humanitárias.', [-1, -2, -1], { eu: 2 }, 40)
    ],
    neutro: [
      M('Comando de ciberdefesa', 'É criado um comando de ciberdefesa nas Forças Armadas.', [0, 0, -2], { groups: { seguranca: 2 } }, 50),
      M('Vigilância do mar', 'É reforçada a vigilância da Zona Económica Exclusiva com novos meios navais.', [0, 1, -1], { groups: { seguranca: 2, agricultores: 1 } }, 100),
      M('Incentivos ao recrutamento', 'São criados incentivos financeiros ao recrutamento e à retenção de militares.', [0, 1, -1], { groups: { seguranca: 3 } }, 80)
    ]
  },
  externa: {
    esquerda: [
      M('Política externa de paz', 'Portugal defende a resolução de conflitos exclusivamente por via diplomática, no quadro das Nações Unidas.', [-3, -1, 2], { eu: -2 }, 0),
      M('Ajuda ao desenvolvimento a 0,7%', 'Portugal aumenta a ajuda pública ao desenvolvimento para 0,7% do rendimento nacional.', [-2, -2, -1], { eu: 1 }, 300),
      M('Revisão das regras orçamentais europeias', 'Portugal propõe na União Europeia que o investimento público seja excluído das regras do défice.', [-4, 0, 1], { eu: -2 }, 0)
    ],
    direita: [
      M('Diplomacia económica', 'As embaixadas passam a ter objetivos de captação de investimento e de apoio às exportações.', [3, 0, -1], { econ: { gdp: 0.05 }, groups: { empresarios: 2 } }, 20),
      M('Acordos de comércio livre', 'Portugal apoia a ratificação dos acordos de comércio livre da União Europeia, incluindo o Mercosul.', [5, 0, -2], { groups: { empresarios: 3, agricultores: -3 } }, 0),
      M('Aliança atlântica reforçada', 'Portugal reforça a cooperação bilateral com os Estados Unidos e o papel da Base das Lajes.', [2, 2, -2], { eu: 1 }, 20)
    ],
    conservador: [
      M('Soberania nacional na União', 'Portugal opõe-se a novas transferências de competências para Bruxelas sem referendo.', [1, 4, 5], { eu: -5 }, 0),
      M('Lusofonia primeiro', 'A política externa passa a privilegiar a CPLP e as relações com os países de língua portuguesa.', [0, 3, 1], { groups: { imigrantes: 1 } }, 20),
      M('Apoio às comunidades portuguesas', 'É reforçada a rede consular e o apoio aos emigrantes portugueses.', [0, 2, 0], { approval: 1 }, 30)
    ],
    progressista: [
      M('Europa federal', 'Portugal defende listas transnacionais e mais competências para o Parlamento Europeu.', [0, -3, -3], { eu: 5 }, 0),
      M('Diplomacia dos oceanos', 'Portugal lidera uma coligação internacional pela proteção dos oceanos.', [-1, -3, -2], { eu: 2 }, 10),
      M('Cláusulas de direitos humanos', 'Os acordos comerciais passam a incluir cláusulas vinculativas de direitos humanos.', [-1, -3, -1], { groups: { empresarios: -1 } }, 0)
    ],
    neutro: [
      M('Candidaturas internacionais', 'Portugal prepara candidaturas a organismos internacionais e reforça a sua diplomacia multilateral.', [0, 0, -2], { eu: 2 }, 15),
      M('Consulados digitais', 'É modernizada a rede diplomática, com serviços consulares digitais.', [0, 0, -1], { approval: 1 }, 20),
      M('Estrutura de missão para o Mundial 2030', 'É criada uma estrutura de missão para a organização do Campeonato do Mundo de Futebol de 2030.', [1, 1, -1], { econ: { gdp: 0.05 }, groups: { empresarios: 2 } }, 100)
    ]
  },
  cultura: {
    esquerda: [
      M('1% para a Cultura', 'O Orçamento do Estado passa a destinar 1% da despesa à Cultura.', [-3, -2, 0], { groups: { jovens: 2 } }, 400),
      M('Estatuto dos profissionais da cultura', 'Os trabalhadores da cultura passam a ter regime contributivo próprio e proteção no desemprego.', [-3, -2, 0], { groups: { trabalhadores: 1 } }, 30),
      M('Serviço público de media reforçado', 'A RTP e a Lusa recebem financiamento plurianual garantido.', [-3, -1, -1], { media: 2 }, 60)
    ],
    direita: [
      M('Mecenato cultural', 'Os donativos para a cultura passam a ter dedução fiscal de 150%.', [4, 0, -1], { groups: { empresarios: 2 } }, 40),
      M('Venda de um canal público', 'O Estado aliena um dos canais de televisão da RTP.', [6, 0, 1], { media: -2 }, -50),
      M('Fim da contribuição audiovisual', 'A contribuição audiovisual cobrada na fatura da eletricidade é abolida.', [3, 0, 2], { groups: { classe_media: 2 } }, 190)
    ],
    conservador: [
      M('Apoio às tradições populares', 'É criado um programa de apoio às festas populares, romarias e tradições locais.', [0, 4, 1], { groups: { interior: 3 } }, 20),
      M('Tauromaquia como património', 'A tauromaquia é reconhecida como património cultural imaterial.', [0, 5, 2], { groups: { interior: 2, jovens: -2 } }, 0),
      M('Quotas de música portuguesa', 'As rádios passam a ter quotas obrigatórias de 30% de música em português.', [0, 3, 1], { groups: { jovens: -1 } }, 0)
    ],
    progressista: [
      M('Museus gratuitos', 'Os museus e monumentos nacionais passam a ser gratuitos para residentes.', [-2, -2, 0], { groups: { jovens: 2 } }, 20),
      M('Plataforma pública de streaming', 'É criada uma plataforma pública de cinema e música portuguesa em streaming.', [-1, -2, -1], { groups: { jovens: 2 } }, 15),
      M('Bolsas para jovens criadores', 'São criadas bolsas de criação para jovens artistas em todas as disciplinas.', [-2, -2, 0], { groups: { jovens: 3 } }, 20)
    ],
    neutro: [
      M('Apoio à imprensa regional', 'A imprensa regional recebe apoio à distribuição e à transição digital.', [-1, 0, -1], { media: 2 }, 15),
      M('Rede de bibliotecas modernizada', 'É modernizada a rede nacional de bibliotecas públicas.', [-1, 0, -1], { groups: { jovens: 1 } }, 25),
      M('Desporto escolar', 'É reforçado o desporto escolar e a construção de equipamentos desportivos.', [-1, 0, -1], { groups: { jovens: 2 } }, 40)
    ]
  },
  agricultura: {
    esquerda: [
      M('Preços justos à produção', 'É criado um observatório com poderes para impedir vendas abaixo do custo de produção.', [-4, 1, 1], { groups: { agricultores: 6, empresarios: -2 } }, 10),
      M('Agricultura familiar prioritária', 'O estatuto da agricultura familiar passa a dar acesso prioritário aos fundos da PAC.', [-3, 1, 0], { groups: { agricultores: 5, interior: 2 } }, 50),
      M('Banco público de terras', 'É criado um banco de terras públicas para jovens agricultores.', [-4, 0, 0], { groups: { agricultores: 3, jovens: 2 } }, 30)
    ],
    direita: [
      M('Agricultura competitiva', 'São apoiados o regadio e a modernização das explorações orientadas para a exportação.', [4, 0, -1], { econ: { gdp: 0.05 }, groups: { agricultores: 5 } }, 100),
      M('Menos burocracia agrícola', 'São simplificados os licenciamentos agrícolas e as candidaturas aos fundos europeus.', [3, 1, 0], { groups: { agricultores: 5 } }, 0),
      M('Seguros de colheita', 'É criado um sistema de seguros de colheita com comparticipação pública.', [3, 0, -1], { groups: { agricultores: 4 } }, 40)
    ],
    conservador: [
      M('Gasóleo agrícola reforçado', 'É reforçado o apoio ao gasóleo agrícola e às pescas.', [0, 2, 1], { groups: { agricultores: 5 } }, 60),
      M('Produto nacional nas cantinas', 'As cantinas públicas passam a comprar pelo menos 50% de produtos nacionais.', [-1, 3, 2], { groups: { agricultores: 5 } }, 20),
      M('Defesa do mundo rural', 'São reduzidas as restrições ambientais à atividade agrícola e pecuária.', [2, 4, 2], { groups: { agricultores: 5, jovens: -1 } }, 0)
    ],
    progressista: [
      M('Agricultura biológica', 'É duplicado o apoio à conversão para a agricultura biológica.', [-1, -3, -1], { groups: { agricultores: 2 } }, 40),
      M('Bem-estar animal na pecuária', 'São reforçadas as normas de bem-estar animal nas explorações pecuárias.', [-1, -3, 0], { groups: { agricultores: -3 } }, 10),
      M('Limites à agricultura intensiva', 'É limitada a expansão do olival e do abacate intensivos nas zonas de escassez de água.', [-2, -2, 0], { groups: { agricultores: -3, interior: 1 } }, 0)
    ],
    neutro: [
      M('Fundo de emergência para a seca', 'É criado um fundo de emergência para os agricultores afetados pela seca.', [-1, 0, 0], { groups: { agricultores: 6 } }, 100),
      M('Prémio aos jovens agricultores', 'Os jovens agricultores recebem um prémio de instalação de 40 mil euros.', [0, 0, -1], { groups: { agricultores: 3, jovens: 2 } }, 50),
      M('Pesca artesanal modernizada', 'É modernizada a frota de pesca artesanal com fundos europeus.', [0, 0, -1], { groups: { agricultores: 3 } }, 40)
    ]
  },
  instituicoes: {
    esquerda: [
      M('Fim das subvenções vitalícias', 'São abolidas todas as subvenções vitalícias de antigos titulares de cargos políticos.', [-1, 0, 3], { approval: 1 }, -5),
      M('Financiamento público das campanhas', 'As campanhas eleitorais passam a ser financiadas exclusivamente com dinheiros públicos.', [-3, -1, 0], { media: 1 }, 30),
      M('Orçamento participativo nacional', 'É criado um orçamento participativo nacional de 50 milhões de euros.', [-2, -2, 0], { groups: { jovens: 2 } }, 50)
    ],
    direita: [
      M('Governo com 12 ministérios', 'O Governo passa a ter um máximo de 12 ministérios.', [3, 0, 1], { approval: 1 }, -20),
      M('Avaliação independente da despesa', 'É criada uma entidade independente de avaliação da despesa pública.', [4, 0, -1], { econ: { deficit: -0.05 } }, 5),
      M('Teto à despesa corrente', 'É fixado um teto plurianual para o crescimento da despesa corrente primária.', [5, 0, -1], { econ: { deficit: -0.2 }, groups: { funcpublicos: -3 } }, -300)
    ],
    conservador: [
      M('Menos deputados', 'O número de deputados é reduzido para 180.', [0, 2, 6], { approval: 1 }, -15),
      M('Referendo para temas fraturantes', 'Os temas de consciência passam a ser decididos preferencialmente por referendo.', [0, 4, 5], { approval: 1 }, 10),
      M('Limitação de mandatos', 'Os deputados e os membros do Governo ficam limitados a três mandatos consecutivos.', [0, 1, 4], { approval: 1 }, 0)
    ],
    progressista: [
      M('Voto aos 16 anos', 'É proposta a revisão constitucional para permitir o voto a partir dos 16 anos.', [0, -4, -1], { groups: { jovens: 3 } }, 0),
      M('Círculo de compensação', 'O sistema eleitoral passa a incluir um círculo nacional de compensação.', [0, -1, -2], { media: 1 }, 0),
      M('Paridade plena', 'As listas eleitorais passam a ser obrigatoriamente alternadas entre mulheres e homens.', [0, -4, -1], {}, 0)
    ],
    neutro: [
      M('Despesa pública em tempo real', 'Todas as despesas do Estado acima de 5 mil euros passam a ser publicadas em tempo real.', [0, 0, -1], { media: 2 }, 5),
      M('Voto em mobilidade generalizado', 'É generalizado o voto antecipado em mobilidade e testado o voto eletrónico presencial.', [0, -1, -2], { groups: { jovens: 2 } }, 15),
      M('Entidade para a Transparência com meios', 'A Entidade para a Transparência recebe meios para fiscalizar as declarações de rendimentos.', [0, 0, -1], { media: 2 }, 5)
    ]
  },
  costumes: {
    esquerda: [
      M('Igualdade salarial efetiva', 'As empresas com diferenças salariais injustificadas entre mulheres e homens são sancionadas.', [-2, -4, 0], { groups: { trabalhadores: 2 } }, 0),
      M('Proteção contra a discriminação', 'São reforçadas as sanções para a discriminação em razão da orientação sexual e da identidade de género.', [-1, -6, 0], { groups: { jovens: 2, pensionistas: -1 } }, 5),
      M('Proteção das vítimas de tráfico', 'É reforçado o apoio às vítimas de tráfico de seres humanos e de exploração sexual.', [-2, -3, 0], { groups: { imigrantes: 2 } }, 10)
    ],
    direita: [
      M('Escolha da escola pelos pais', 'Os pais passam a escolher a escola dos filhos, independentemente da área de residência.', [4, 2, 0], { groups: { classe_media: 2 } }, 10),
      M('Liberdade de horários comerciais', 'O comércio pode funcionar livremente, sem limites de horário.', [5, -1, 0], { groups: { empresarios: 2, trabalhadores: -2 } }, 0),
      M('Liberdade contratual', 'São revistas as normas que limitam a liberdade contratual entre particulares.', [5, 0, 0], { groups: { empresarios: 2 } }, 0)
    ],
    conservador: [
      M('Apoio à maternidade', 'É reforçado o apoio à maternidade e criado um acompanhamento obrigatório antes da IVG.', [0, 7, 2], { groups: { jovens: -3, pensionistas: 2 } }, 30),
      M('Revogação da eutanásia', 'É revogada a lei da morte medicamente assistida.', [0, 7, 1], { groups: { pensionistas: 1 } }, 0),
      M('Proibição da ocultação do rosto', 'É proibido o uso de vestuário que oculte o rosto em espaços públicos.', [0, 7, 5], { groups: { imigrantes: -5 } }, 0)
    ],
    progressista: [
      M('Canábis recreativa', 'É legalizada a venda de canábis para uso recreativo em estabelecimentos licenciados.', [1, -7, 0], { groups: { jovens: 5, pensionistas: -4 } }, -100),
      M('IVG até às 14 semanas', 'O prazo para a interrupção voluntária da gravidez é alargado para 14 semanas.', [0, -7, 0], { groups: { jovens: 2, pensionistas: -3 } }, 0),
      M('Fim das touradas', 'São proibidos os espetáculos tauromáquicos em todo o território nacional.', [0, -5, 0], { groups: { interior: -4, jovens: 2 } }, 0)
    ],
    neutro: [
      M('Proteção das crianças online', 'As plataformas digitais ficam obrigadas a verificar a idade dos utilizadores menores de 16 anos.', [0, 1, 0], { groups: { classe_media: 3 } }, 5),
      M('Tribunais de violência doméstica', 'São criados juízos especializados em violência doméstica.', [-1, -1, -1], { groups: { classe_media: 2 } }, 30),
      M('Registo dos animais de companhia', 'É criado um registo nacional obrigatório e reforçada a punição dos maus-tratos a animais.', [0, -2, 0], { groups: { jovens: 2 } }, 10)
    ]
  },
  regioes: {
    esquerda: [
      M('Regionalização', 'São criadas cinco regiões administrativas com órgãos eleitos.', [-2, -2, -1], { groups: { interior: 4 } }, 150),
      M('Serviços públicos no interior', 'É proibido o encerramento de escolas, centros de saúde e tribunais no interior sem alternativa de proximidade.', [-3, 1, 1], { groups: { interior: 6, funcpublicos: 2 } }, 80),
      M('Investimento público no interior', 'Pelo menos 30% do investimento público passa a ser aplicado no interior.', [-3, 0, 0], { groups: { interior: 6 } }, 200)
    ],
    direita: [
      M('Zonas económicas especiais', 'São criadas zonas económicas especiais no interior com IRC de 10%.', [5, 0, 0], { groups: { interior: 5, empresarios: 4 } }, 150),
      M('Descentralização de competências', 'As autarquias passam a gerir escolas e centros de saúde, com financiamento garantido.', [2, 0, -1], { groups: { interior: 2, funcpublicos: -1 } }, 50),
      M('IRS reduzido no interior', 'O IRS é reduzido em 20% para os residentes nos concelhos de baixa densidade.', [3, 0, 0], { groups: { interior: 6 } }, 200)
    ],
    conservador: [
      M('Defesa da identidade local', 'Não haverá fusão de freguesias ou concelhos sem referendo local.', [0, 4, 2], { groups: { interior: 3 } }, 0),
      M('Natalidade no interior', 'As famílias que tenham filhos no interior recebem um apoio mensal acrescido.', [-1, 4, 1], { groups: { interior: 4 } }, 80),
      M('Autonomias regionais respeitadas', 'É reforçada a autonomia financeira dos Açores e da Madeira.', [1, 2, 1], { relations: { jpp: 5 } }, 80)
    ],
    progressista: [
      M('Teletrabalho no interior', 'São criados espaços públicos de cowork e apoios a quem se mude para o interior em teletrabalho.', [-1, -2, -1], { groups: { interior: 4, jovens: 2 } }, 40),
      M('Transporte a pedido', 'É criado um sistema de transporte a pedido nos concelhos de baixa densidade.', [-2, -1, -1], { groups: { interior: 5, pensionistas: 2 } }, 50),
      M('Fixação de jovens no interior', 'Os jovens que se fixem no interior têm as propinas pagas e apoio à habitação.', [-2, -1, -1], { groups: { interior: 4, jovens: 3 } }, 60)
    ],
    neutro: [
      M('Portagens a metade no interior', 'É aplicado um desconto de 50% nas portagens das autoestradas do interior.', [-1, 1, 1], { groups: { interior: 4 } }, 80),
      M('Fundos europeus para a coesão', 'Os fundos do PT2030 passam a privilegiar os territórios de baixa densidade.', [0, 0, -1], { groups: { interior: 3 }, eu: 1 }, 0),
      M('Mobilidade nas ilhas', 'O subsídio social de mobilidade dos residentes nos Açores e na Madeira passa a ser descontado no ato da compra.', [-1, 0, 0], { relations: { jpp: 4 } }, 30)
    ]
  }
};
