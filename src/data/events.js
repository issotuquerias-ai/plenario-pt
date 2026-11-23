// PLENÁRIO PT — Eventos de governação, oposição e regime.
// Os eventos nunca atribuem crimes ou declarações inventadas a pessoas reais: usam cargos e marcadores
// ({pm}, {ministro}, {presidente}, {cidade}...) ou figuras fictícias.

export const GOV_EVENTS = [
  // ───────────── GREVES E CONFLITOS LABORAIS ─────────────
  {
    id: 'greve_professores', area: 'educacao', title: 'Greve nacional de professores',
    text: '{sind_prof} convoca uma greve nacional de professores por tempo indeterminado, exigindo {exigencia}. Milhares de escolas fecham portas e as avaliações do período estão em risco.',
    vars: { sind_prof: ['A FENPROF', 'A FNE', 'O STOP'], exigencia: ['aumentos salariais de 10%', 'a redução da carga burocrática', 'a vinculação dos professores contratados', 'o fim das quotas na avaliação de desempenho'] },
    when: { months: [1, 2, 3, 4, 5, 9, 10, 11, 12] }, weight: 1.2, severity: 2,
    options: [
      { label: 'Ceder às exigências', desc: 'Paz nas escolas, mas um custo elevado e um precedente.', effects: { budget: 300, approval: 1, econ: { deficit: 0.1 }, groups: { professores: 15, funcpublicos: 4, classe_media: -2 } } },
      { label: 'Negociar um acordo faseado', desc: 'Compromisso possível, mas os sindicatos podem recusar.', effects: {},
        chance: { p: 0.6, successText: 'Os sindicatos aceitam o acordo faseado e suspendem a greve.', failureText: 'As negociações falham e a greve prolonga-se por mais três semanas.',
          success: { budget: 120, approval: 1, groups: { professores: 8 } }, failure: { approval: -2, groups: { professores: -5, classe_media: -4 } } } },
      { label: 'Decretar serviços mínimos', desc: 'Garante as avaliações, mas inflama o conflito.', effects: { approval: -1, unrest: 5, groups: { professores: -12, classe_media: 2 } } },
      { label: 'Avançar com requisição civil', desc: 'Medida extrema: escolas abertas, sindicatos furiosos.', effects: { unrest: 8, president: -5, media: -3, groups: { professores: -18, funcpublicos: -6, classe_media: 3 } } }
    ]
  },
  {
    id: 'greve_medicos', area: 'saude', title: 'Médicos em greve e urgências fechadas',
    text: 'Os sindicatos médicos convocam uma greve de três dias e centenas de médicos recusam fazer horas extraordinárias além do limite legal. Várias urgências de {zona_saude} encerram durante a noite.',
    vars: { zona_saude: ['Lisboa e Vale do Tejo', 'Setúbal', 'Algarve', 'região Centro', 'região Norte'] },
    weight: 1.2, severity: 3,
    options: [
      { label: 'Aceitar a revisão da grelha salarial', desc: 'Resolve a crise, mas pesa no Orçamento.', effects: { budget: 250, approval: 1, econ: { waiting: -3, deficit: 0.1 }, groups: { saude: 15, pensionistas: 3 } } },
      { label: 'Contratar médicos tarefeiros', desc: 'Remendo caro e criticado pela Ordem dos Médicos.', effects: { budget: 80, media: -2, econ: { waiting: -1 }, groups: { saude: -5 } } },
      { label: 'Endurecer o discurso', desc: 'Afirma autoridade, mas os doentes pagam a fatura.', effects: { approval: -3, econ: { waiting: 4 }, groups: { saude: -12, pensionistas: -5 } } }
    ]
  },
  {
    id: 'greve_enfermeiros', area: 'saude', title: 'Enfermeiros param os blocos operatórios',
    text: 'Uma greve de enfermeiros adia milhares de cirurgias programadas. Os sindicatos exigem a contagem integral dos pontos para progressão e o fim das horas extraordinárias não pagas.',
    weight: 0.9, severity: 2,
    options: [
      { label: 'Descongelar a progressão na carreira', desc: 'Custo moderado, alívio nos hospitais.', effects: { budget: 150, econ: { waiting: -2 }, groups: { saude: 10 } } },
      { label: 'Propor um calendário plurianual', desc: 'Pode convencer os sindicatos moderados.', effects: {},
        chance: { p: 0.55, successText: 'Os enfermeiros aceitam o calendário e suspendem a greve.', failureText: 'A greve continua e as listas de espera disparam.',
          success: { budget: 60, groups: { saude: 5 } }, failure: { econ: { waiting: 4 }, approval: -2, groups: { saude: -6 } } } },
      { label: 'Recorrer aos tribunais', desc: 'Contestação jurídica da greve: impopular entre os profissionais.', effects: { media: -2, econ: { waiting: 2 }, groups: { saude: -10, pensionistas: -2 } } }
    ]
  },
  {
    id: 'greve_cp', area: 'transportes', title: 'Greve na CP paralisa os comboios',
    text: 'Os trabalhadores da CP e da Infraestruturas de Portugal param durante uma semana. Milhares de pessoas ficam sem transporte nas linhas de Sintra, Cascais e Azambuja.',
    weight: 1, severity: 2,
    options: [
      { label: 'Aceitar os aumentos pedidos', desc: 'Repõe os comboios rapidamente.', effects: { budget: 60, groups: { trabalhadores: 4, classe_media: 2 } } },
      { label: 'Fixar serviços mínimos alargados', desc: 'Reduz o caos, mas os sindicatos contestam.', effects: { unrest: 3, groups: { trabalhadores: -3, classe_media: 1 } } },
      { label: 'Contratar autocarros de substituição', desc: 'Solução temporária e cara.', effects: { budget: 25, approval: -1, groups: { classe_media: -2 } } }
    ]
  },
  {
    id: 'greve_oficiais_justica', area: 'justica', title: 'Oficiais de justiça em greve',
    text: 'A greve dos oficiais de justiça entra na quarta semana. Milhares de julgamentos são adiados e há presos preventivos em risco de libertação por excesso de prazo.',
    weight: 0.8, severity: 2,
    options: [
      { label: 'Aprovar o novo estatuto profissional', desc: 'Resolve a greve e melhora a justiça.', effects: { budget: 70, groups: { funcpublicos: 6 }, media: 2 } },
      { label: 'Abrir negociação com prazo', desc: 'Pode acalmar os ânimos.', effects: {},
        chance: { p: 0.6, successText: 'Os oficiais de justiça suspendem a greve durante as negociações.', failureText: 'A greve prolonga-se e há libertações polémicas.',
          success: { groups: { funcpublicos: 3 } }, failure: { approval: -3, media: -4, econ: { crime: 1 } } } },
      { label: 'Ignorar a greve', desc: 'Poupa dinheiro, mas os tribunais param.', effects: { approval: -2, media: -3, groups: { funcpublicos: -6, empresarios: -2 } } }
    ]
  },
  {
    id: 'greve_geral', area: 'trabalho', title: 'CGTP e UGT convocam greve geral',
    text: 'Pela primeira vez em mais de uma década, a CGTP e a UGT convocam em conjunto uma greve geral contra a política do Governo. Transportes, escolas e hospitais vão parar.',
    when: { maxApproval: 45 }, weight: 0.8, severity: 3,
    options: [
      { label: 'Convocar a concertação social', desc: 'Abre a porta a um acordo de rendimentos.', effects: { stability: 3, groups: { trabalhadores: 5, empresarios: -2 } } },
      { label: 'Manter o rumo das reformas', desc: 'Firmeza perante as centrais sindicais.', effects: { approval: -3, unrest: 10, groups: { trabalhadores: -8, empresarios: 4 } } },
      { label: 'Recuar nas medidas mais contestadas', desc: 'Desmobiliza a greve, mas parece fraqueza.', effects: { approval: 1, stability: -3, media: -2, groups: { trabalhadores: 8, empresarios: -6 } }, setFlag: 'recuo_reformas' }
    ]
  },
  {
    id: 'greve_policias', area: 'seguranca', title: 'Polícias protestam em frente ao Parlamento',
    text: 'Milhares de agentes da PSP e militares da GNR concentram-se em São Bento a exigir um suplemento de risco equiparado ao da Polícia Judiciária. Há ameaças de baixas médicas coletivas.',
    weight: 0.9, severity: 2,
    options: [
      { label: 'Equiparar o suplemento de risco', desc: 'Satisfaz as polícias, mas abre a porta a outras exigências.', effects: { budget: 180, approval: 1, groups: { seguranca: 15, funcpublicos: -2 } } },
      { label: 'Propor um aumento intermédio', desc: 'Compromisso possível.', effects: {},
        chance: { p: 0.5, successText: 'As associações aceitam o aumento intermédio.', failureText: 'Os protestos continuam e há esquadras a funcionar a meio gás.',
          success: { budget: 90, groups: { seguranca: 8 } }, failure: { econ: { crime: 2 }, groups: { seguranca: -6 }, approval: -1 } } },
      { label: 'Recusar: não há margem orçamental', desc: 'Contas certas, polícias desmotivados.', effects: { econ: { crime: 2 }, groups: { seguranca: -12 } } }
    ]
  },
  {
    id: 'greve_camionistas', area: 'transportes', title: 'Greve dos motoristas de matérias perigosas',
    text: 'Os motoristas de matérias perigosas iniciam uma greve sem pré-aviso alargado. Em poucas horas, centenas de postos de abastecimento ficam sem combustível e os aeroportos racionam o jet fuel.',
    weight: 0.7, severity: 3,
    options: [
      { label: 'Declarar crise energética e serviços mínimos', desc: 'Garante abastecimentos prioritários.', effects: { approval: 1, unrest: 3, groups: { trabalhadores: -2 } } },
      { label: 'Decretar requisição civil', desc: 'Militares e GNR a conduzir camiões-cisterna.', effects: { approval: 2, president: -3, unrest: 5, groups: { trabalhadores: -6 } } },
      { label: 'Mediar aumentos com as empresas', desc: 'Resolve o conflito com dinheiro privado e pressão pública.', effects: {},
        chance: { p: 0.65, successText: 'Patrões e motoristas chegam a acordo ao fim de dois dias.', failureText: 'O país fica uma semana em rutura de combustível.',
          success: { approval: 2 }, failure: { approval: -4, econ: { gdp: -0.1 } } } }
    ]
  },
  // ───────────── SAÚDE ─────────────
  {
    id: 'urgencias_caos', area: 'saude', title: 'Caos nas urgências',
    text: 'Doentes esperam mais de 15 horas nas urgências do hospital de {cidade}. As imagens de macas nos corredores abrem os telejornais e a oposição exige explicações a {ministro}.',
    when: { months: [12, 1, 2] }, weight: 1.4, severity: 2,
    options: [
      { label: 'Ativar o plano de contingência de inverno', desc: 'Mais camas e profissionais, a custo moderado.', effects: { budget: 60, econ: { waiting: -2 } } },
      { label: 'Demitir a administração hospitalar', desc: 'Sinal de responsabilização; os profissionais não gostam.', effects: { approval: 1, media: 2, groups: { saude: -3 } } },
      { label: 'Desvalorizar: é o pico da gripe', desc: 'Pode parecer insensível.', effects: { approval: -2, media: -3, groups: { pensionistas: -4 } } }
    ]
  },
  {
    id: 'inem_falhas', area: 'saude', title: 'Falhas no INEM',
    text: 'Um homem morre em {cidade} depois de esperar mais de uma hora por uma ambulância. A greve às horas extraordinárias dos técnicos do INEM está no centro da polémica.',
    weight: 1, severity: 3,
    options: [
      { label: 'Contratar técnicos e comprar ambulâncias', desc: 'Resposta estrutural, cara mas eficaz.', effects: { budget: 90, approval: 1, econ: { waiting: -1 }, groups: { saude: 5 } } },
      { label: 'Abrir um inquérito independente', desc: 'Ganha tempo e mostra transparência.', effects: { media: 2 } },
      { label: 'Defender {ministro} publicamente', desc: 'Lealdade política com custos na opinião pública.', effects: { approval: -3, media: -4 } }
    ]
  },
  {
    id: 'sem_medico_familia', area: 'saude', title: 'Utentes sem médico de família',
    text: '{total} portugueses continuam sem médico de família, segundo dados divulgados hoje. O tema domina a agenda política e os autarcas do interior pedem medidas urgentes.',
    vars: { total: ['Mais de 1,5 milhões de', 'Cerca de 1,6 milhões de', 'Quase 1,7 milhões de'] },
    weight: 1, severity: 2,
    options: [
      { label: 'Lançar USF modelo C com o setor social', desc: 'Abre consultas rapidamente; a esquerda critica.', effects: { budget: 80, econ: { waiting: -3 }, groups: { pensionistas: 4, saude: -2 }, relations: { be: -5, cdu: -5 } } },
      { label: 'Incentivos à fixação de médicos', desc: 'Medida lenta mas consensual.', effects: { budget: 120, econ: { waiting: -2 }, groups: { saude: 4, interior: 3 } } },
      { label: 'Prometer médico de família para todos em dois anos', desc: 'Promessa forte e arriscada.', effects: { approval: 2 }, setFlag: 'promessa_medicos' }
    ]
  },
  {
    id: 'surto_legionella', area: 'saude', title: 'Surto de legionela',
    text: 'Um surto de legionela em {cidade} provoca dezenas de internamentos e duas mortes. As autoridades de saúde procuram a origem numa torre de refrigeração industrial.',
    weight: 0.6, severity: 2,
    options: [
      { label: 'Encerrar preventivamente as unidades suspeitas', desc: 'Prudência sanitária, prejuízo económico local.', effects: { approval: 2, groups: { empresarios: -3 } } },
      { label: 'Reforçar a fiscalização a nível nacional', desc: 'Resposta abrangente.', effects: { budget: 15, media: 2 } },
      { label: 'Deixar a gestão à Direção-Geral da Saúde', desc: 'Discreto, mas pode parecer ausência.', effects: { approval: -1 } }
    ]
  },
  // ───────────── EDUCAÇÃO ─────────────
  {
    id: 'alunos_sem_professor', area: 'educacao', title: 'Milhares de alunos sem professor',
    text: 'Um mês depois do início do ano letivo, mais de 50 mil alunos continuam sem professor a pelo menos uma disciplina, sobretudo em Lisboa e no Algarve, onde o custo da habitação afasta os docentes.',
    when: { months: [9, 10, 11] }, weight: 1.1, severity: 2,
    options: [
      { label: 'Subsídio de deslocação e alojamento', desc: 'Atrai professores para as zonas carenciadas.', effects: { budget: 60, groups: { professores: 6, classe_media: 3 } } },
      { label: 'Contratar professores sem habilitação profissional', desc: 'Resolve a curto prazo, os sindicatos protestam.', effects: { groups: { professores: -6, classe_media: 2 }, media: -1 } },
      { label: 'Aumentar o número de alunos por turma', desc: 'Medida impopular junto das famílias.', effects: { approval: -2, groups: { professores: -4, classe_media: -4 } } }
    ]
  },
  {
    id: 'exames_polemica', area: 'educacao', title: 'Erro num exame nacional',
    text: 'Um erro grave no exame nacional de Matemática A obriga a anular uma pergunta. Pais e alunos exigem a repetição da prova e o IAVE está debaixo de fogo.',
    when: { months: [6, 7] }, weight: 0.5, severity: 1,
    options: [
      { label: 'Permitir a repetição voluntária do exame', desc: 'Justo para os alunos, logística complexa.', effects: { budget: 5, groups: { jovens: 3, classe_media: 2 } } },
      { label: 'Cotar a pergunta para todos', desc: 'Solução rápida e pouco contestada.', effects: { groups: { jovens: 2 } } },
      { label: 'Exigir a demissão da direção do IAVE', desc: 'Responsabilização visível.', effects: { media: 1, groups: { professores: -1 } } }
    ]
  },
  // ───────────── CATÁSTROFES E AMBIENTE ─────────────
  {
    id: 'incendios', area: 'seguranca', title: 'Incêndios devastadores no interior',
    text: 'Um incêndio de grandes dimensões lavra há três dias no distrito de {distrito_fogo}, com aldeias evacuadas e milhares de hectares ardidos. As populações queixam-se da falta de meios.',
    vars: { distrito_fogo: ['Castelo Branco', 'Viseu', 'Guarda', 'Coimbra', 'Vila Real', 'Santarém', 'Faro', 'Leiria', 'Bragança'] },
    when: { months: [6, 7, 8, 9] }, weight: 1.8, severity: 3,
    options: [
      { label: 'Pedir meios aéreos europeus', desc: 'Ativação do mecanismo rescEU.', effects: { budget: 50, approval: 2, eu: 3, groups: { interior: 4 } } },
      { label: 'Declarar calamidade e apoios imediatos', desc: 'Resposta forte às populações afetadas.', effects: { budget: 200, approval: 3, econ: { deficit: 0.05 }, groups: { interior: 8, agricultores: 6 } } },
      { label: '{pm} visita o terreno', desc: 'Presença política: pode correr bem ou muito mal.', effects: {},
        chance: { p: 0.6, successText: 'A visita é bem recebida e as populações sentem-se apoiadas.', failureText: 'O primeiro-ministro é vaiado por populares revoltados, em direto nas televisões.',
          success: { approval: 3, groups: { interior: 4 } }, failure: { approval: -3, media: -3 } } },
      { label: 'Confiar na Proteção Civil', desc: 'Discrição que pode parecer indiferença.', effects: { approval: -4, media: -4, groups: { interior: -10 } } }
    ]
  },
  {
    id: 'cheias', area: 'ambiente', title: 'Tempestade provoca cheias',
    text: 'Uma depressão atlântica provoca cheias em várias localidades do vale do {rio}, com estradas cortadas, casas inundadas e um morto. O IPMA mantém o aviso vermelho.',
    vars: { rio: ['Tejo', 'Mondego', 'Douro', 'Sado', 'Vouga'] },
    when: { months: [10, 11, 12, 1, 2, 3] }, weight: 1.1, severity: 2,
    options: [
      { label: 'Linha de apoio de emergência às famílias', desc: 'Apoio direto e rápido.', effects: { budget: 150, approval: 3, groups: { classe_media: 2, agricultores: 3 } } },
      { label: 'Acionar o Fundo de Solidariedade da UE', desc: 'Dinheiro europeu, mas demora meses.', effects: { budget: 40, approval: 1, eu: 2 } },
      { label: 'Plano de obras de prevenção', desc: 'Investimento estrutural a médio prazo.', effects: { budget: 300, approval: 1, econ: { deficit: 0.05 } } }
    ]
  },
  {
    id: 'seca_sul', area: 'agricultura', title: 'Seca extrema no Sul',
    text: 'As barragens do {zona_seca} estão abaixo dos 20% e há concelhos com cortes de água. Os agricultores pedem apoios urgentes e os hoteleiros temem pela época alta.',
    vars: { zona_seca: ['Algarve', 'Alentejo', 'Barlavento algarvio', 'Baixo Alentejo'] },
    when: { months: [5, 6, 7, 8, 9] }, weight: 1.2, severity: 2,
    options: [
      { label: 'Fundo de emergência para a agricultura', desc: 'Apoia agricultores e criadores de gado.', effects: { budget: 150, groups: { agricultores: 10, interior: 3 } } },
      { label: 'Restringir a água no turismo e no golfe', desc: 'Prioriza o consumo humano e a agricultura.', effects: { approval: 1, groups: { empresarios: -6, agricultores: 4 } } },
      { label: 'Acelerar a dessalinizadora', desc: 'Solução estrutural, com custos imediatos.', effects: { budget: 250, approval: 1, groups: { agricultores: 5 } } }
    ]
  },
  {
    id: 'apagao', area: 'energia', title: 'Apagão geral no país',
    text: 'Um apagão elétrico deixa todo o território continental sem luz durante várias horas. Hospitais funcionam a gerador, os comboios param e as comunicações falham. Exige-se saber o que falhou.',
    weight: 0.5, severity: 3,
    options: [
      { label: 'Criar uma comissão técnica independente', desc: 'Transparência e apuramento de responsabilidades.', effects: { approval: 1, media: 2 } },
      { label: 'Investir em armazenamento e interligações', desc: 'Prevenção séria, cara.', effects: { budget: 400, approval: 2, econ: { deficit: 0.05 } } },
      { label: 'Atribuir culpas à rede europeia', desc: 'Desvia atenções, irrita Bruxelas e Madrid.', effects: { approval: -1, eu: -3 } }
    ]
  },
  {
    id: 'litio_protestos', area: 'ambiente', title: 'Protestos contra a mina de lítio',
    text: 'Populações de Boticas e Montalegre bloqueiam o acesso aos trabalhos de prospeção de lítio. A empresa concessionária ameaça abandonar um investimento de centenas de milhões de euros.',
    weight: 0.8, severity: 2,
    options: [
      { label: 'Suspender o projeto', desc: 'Vitória para as populações, sinal negativo para investidores.', effects: { econ: { gdp: -0.05 }, groups: { interior: 4, empresarios: -5 }, relations: { pan: 8, il: -8 } } },
      { label: 'Avançar com contrapartidas aos municípios', desc: 'Compromisso económico e local.', effects: { budget: 30, econ: { gdp: 0.1 }, groups: { empresarios: 4, interior: -2 } } },
      { label: 'Garantir a ordem com a GNR', desc: 'Firmeza com risco de imagens de confronto.', effects: { unrest: 5, media: -4, groups: { interior: -6, empresarios: 3 } } }
    ]
  },
  // ───────────── HABITAÇÃO E CUSTO DE VIDA ─────────────
  {
    id: 'manifestacao_habitacao', area: 'habitacao', title: 'Milhares nas ruas pela habitação',
    text: 'O movimento «Casa para Viver» junta dezenas de milhares de pessoas em Lisboa, no Porto e noutras cidades contra o preço das casas e das rendas. Os jovens são a maioria.',
    weight: 1.2, severity: 2,
    options: [
      { label: 'Anunciar um pacote de emergência', desc: 'Medidas imediatas para jovens e famílias.', effects: { budget: 300, approval: 2, econ: { housing: -1 }, groups: { jovens: 8, classe_media: 4 } } },
      { label: 'Prometer mais construção e menos impostos', desc: 'Agrada aos promotores; os manifestantes duvidam.', effects: { groups: { empresarios: 4, jovens: 2 } } },
      { label: 'Desvalorizar o protesto', desc: 'Os jovens não esquecem.', effects: { approval: -3, unrest: 4, groups: { jovens: -10 } } }
    ]
  },
  {
    id: 'juros_subida', area: 'economia', title: 'BCE volta a subir os juros',
    text: 'O Banco Central Europeu sobe as taxas de juro. As prestações da casa disparam e as famílias com crédito à habitação pedem ajuda ao Governo.',
    weight: 0.7, severity: 2,
    options: [
      { label: 'Apoio ao pagamento das prestações', desc: 'Alívio direto às famílias endividadas.', effects: { budget: 200, groups: { classe_media: 6, jovens: 3 } } },
      { label: 'Pressionar os bancos a renegociar', desc: 'Sem custos orçamentais.', effects: { groups: { classe_media: 3, empresarios: -2 } } },
      { label: 'Manter a disciplina orçamental', desc: 'Bruxelas aplaude, as famílias nem tanto.', effects: { econ: { deficit: -0.05 }, eu: 2, groups: { classe_media: -5 } } }
    ]
  },
  {
    id: 'inflacao_alimentar', area: 'economia', title: 'Preços dos alimentos disparam',
    text: 'O INE confirma a maior subida dos preços dos alimentos em dois anos. Ovos, azeite e carne lideram os aumentos e as associações de consumidores acusam a grande distribuição de margens abusivas.',
    weight: 0.9, severity: 2,
    options: [
      { label: 'IVA zero num cabaz de bens essenciais', desc: 'Alívio imediato e popular.', effects: { budget: 300, approval: 2, econ: { inflation: -0.3 }, groups: { pensionistas: 6, trabalhadores: 4 } } },
      { label: 'Pacto com a distribuição e os produtores', desc: 'Compromisso voluntário de contenção de preços.', effects: {},
        chance: { p: 0.5, successText: 'A distribuição aceita congelar os preços de 40 produtos.', failureText: 'O pacto não sai do papel e os preços continuam a subir.',
          success: { approval: 2, econ: { inflation: -0.2 } }, failure: { approval: -2 } } },
      { label: 'Mandar a ASAE fiscalizar as margens', desc: 'Mostra firmeza, efeito limitado.', effects: { approval: 1, groups: { empresarios: -3 } } }
    ]
  },
  {
    id: 'combustiveis_precos', area: 'energia', title: 'Preço dos combustíveis dispara',
    text: 'O gasóleo ultrapassa os 2 euros por litro. Camionistas, taxistas e agricultores ameaçam bloquear estradas se o Governo não baixar os impostos.',
    weight: 0.8, severity: 2,
    options: [
      { label: 'Baixar o ISP temporariamente', desc: 'Alívio imediato, perda de receita.', effects: { budget: 350, approval: 2, econ: { inflation: -0.2 }, groups: { trabalhadores: 4, agricultores: 5, interior: 4 } } },
      { label: 'Apoio apenas aos setores profissionais', desc: 'Medida dirigida e mais barata.', effects: { budget: 100, groups: { agricultores: 4, empresarios: 3 } } },
      { label: 'Manter os impostos', desc: 'Coerência climática e orçamental.', effects: { approval: -2, unrest: 4, relations: { livre: 3, ch: -5 } } }
    ]
  },
  // ───────────── ECONOMIA E FINANÇAS ─────────────
  {
    id: 'rating_alerta', area: 'economia', title: 'Agência de rating ameaça Portugal',
    text: 'A {agencia} coloca a dívida portuguesa em perspetiva negativa, citando {motivo}. Os juros a dez anos sobem e o Conselho das Finanças Públicas pede prudência.',
    vars: { agencia: ['S&P', 'Moody’s', 'Fitch', 'DBRS'], motivo: ['a trajetória da despesa', 'a instabilidade política', 'o abrandamento do crescimento'] },
    weight: 0.6, severity: 2,
    options: [
      { label: 'Anunciar medidas de consolidação', desc: 'Tranquiliza os mercados, irrita os sindicatos.', effects: { econ: { deficit: -0.2 }, eu: 3, groups: { funcpublicos: -4 } } },
      { label: 'Manter o rumo', desc: 'Aposta na confiança.', effects: {},
        chance: { p: 0.5, successText: 'A agência mantém a nota e os juros estabilizam.', failureText: 'A agência corta mesmo a notação e os juros disparam.',
          success: { approval: 1 }, failure: { econ: { debt: 1, gdp: -0.1 }, approval: -2 } } },
      { label: 'Roadshow junto dos investidores', desc: 'O ministro das Finanças viaja a Londres e Nova Iorque.', effects: { budget: 2, econ: { debt: -0.2 } } }
    ]
  },
  {
    id: 'rating_subida', area: 'economia', title: 'Rating de Portugal sobe',
    text: 'Uma das grandes agências de notação sobe o rating de Portugal, destacando a redução da dívida pública e o crescimento acima da média europeia. Os juros caem para mínimos.',
    weight: 0.5, severity: 1,
    options: [
      { label: 'Capitalizar politicamente', desc: 'Conferência de imprensa a celebrar.', effects: { approval: 2, media: 1 } },
      { label: 'Aproveitar para amortizar dívida', desc: 'Prudência elogiada pelos economistas.', effects: { approval: 1, econ: { debt: -1 } } },
      { label: 'Anunciar reforço do investimento público', desc: 'Usa a margem para obras e serviços.', effects: { econ: { gdp: 0.1, deficit: 0.1 }, groups: { funcpublicos: 3, empresarios: 2 } } }
    ]
  },
  {
    id: 'procedimento_defice', area: 'economia', title: 'Bruxelas ameaça com procedimento por défice',
    text: 'A Comissão Europeia alerta que o desvio da despesa líquida face ao plano orçamental de médio prazo pode levar à abertura de um procedimento por défice excessivo.',
    weight: 0.5, severity: 2,
    options: [
      { label: 'Corrigir com cativações', desc: 'Cumpre as regras, sufoca os serviços públicos.', effects: { approval: -1, eu: 5, econ: { deficit: -0.3 }, groups: { funcpublicos: -5, saude: -3 } } },
      { label: 'Negociar flexibilidade', desc: 'Invoca o investimento em defesa e o PRR.', effects: {},
        chance: { p: 0.5, successText: 'Bruxelas aceita a flexibilidade pedida.', failureText: 'Bruxelas recusa e abre mesmo o procedimento.',
          success: { eu: 2 }, failure: { eu: -5, econ: { debt: 0.5 }, approval: -2 } } },
      { label: 'Desafiar Bruxelas', desc: 'Popular internamente, perigoso nos mercados.', effects: { approval: 1, eu: -8, econ: { debt: 0.5 } } }
    ]
  },
  {
    id: 'prr_prazos', area: 'economia', title: 'Prazos do PRR em risco',
    text: 'O relatório da Comissão Nacional de Acompanhamento revela que Portugal pode perder centenas de milhões de euros do PRR por atrasos na execução de obras e reformas.',
    weight: 0.8, severity: 2,
    options: [
      { label: 'Criar uma estrutura de missão de emergência', desc: 'Acelera a execução.', effects: { budget: 20, eu: 3, econ: { gdp: 0.1 } } },
      { label: 'Reprogramar e cortar projetos', desc: 'Salva o dinheiro, sacrifica obras no interior.', effects: { approval: -1, eu: 1, groups: { interior: -3 } } },
      { label: 'Atribuir culpas à burocracia herdada', desc: 'Discurso fácil, pouco convincente.', effects: { approval: -1, media: -2 } }
    ]
  },
  {
    id: 'banco_dificuldades', area: 'economia', title: 'Banco em dificuldades',
    text: 'Um banco de média dimensão sofre uma corrida aos depósitos depois de revelar perdas inesperadas. O Banco de Portugal pede uma decisão urgente ao Governo durante o fim de semana.',
    weight: 0.4, severity: 3,
    options: [
      { label: 'Resolução bancária com o Fundo de Resolução', desc: 'Protege depósitos; os contribuintes desconfiam.', effects: { budget: 400, approval: -2, econ: { debt: 0.5 }, groups: { classe_media: -2 } } },
      { label: 'Nacionalização temporária', desc: 'Estabiliza o sistema a um custo elevado.', effects: { budget: 900, approval: -1, econ: { debt: 1 } } },
      { label: 'Deixar cair o banco', desc: 'Sem dinheiro público, mas com contágio.', effects: { approval: -4, stability: -5, econ: { gdp: -0.3, unemployment: 0.1 }, groups: { classe_media: -8 } } }
    ]
  },
  {
    id: 'crescimento_surpresa', area: 'economia', title: 'Economia cresce acima do esperado',
    text: 'O INE revela que o PIB cresceu muito acima das previsões, impulsionado pelo turismo, pelas exportações e pelo investimento. A receita fiscal supera o previsto no Orçamento.',
    weight: 0.6, severity: 1,
    options: [
      { label: 'Devolver às famílias com descida do IRS', desc: 'Popular e imediato.', effects: { approval: 2, econ: { deficit: 0.1 }, groups: { classe_media: 5, trabalhadores: 3 } } },
      { label: 'Amortizar dívida pública', desc: 'Prudência para tempos difíceis.', effects: { econ: { debt: -1.5 }, eu: 2 } },
      { label: 'Reforçar os serviços públicos', desc: 'Mais meios para saúde e educação.', effects: { econ: { waiting: -2 }, groups: { saude: 3, professores: 3, funcpublicos: 3 } } }
    ]
  },
  {
    id: 'investimento_estrangeiro', area: 'economia', title: 'Multinacional quer instalar fábrica',
    text: 'Uma multinacional tecnológica escolhe Portugal para um centro de dados e uma fábrica de componentes, desde que o Estado garanta incentivos fiscais e energia a preço competitivo.',
    weight: 0.7, severity: 1,
    options: [
      { label: 'Oferecer incentivos fiscais', desc: 'Milhares de empregos qualificados.', effects: { budget: 150, econ: { gdp: 0.2, unemployment: -0.1 }, groups: { empresarios: 5, jovens: 3 } } },
      { label: 'Exigir contrapartidas sociais', desc: 'Salários acima da média e formação local.', effects: {},
        chance: { p: 0.5, successText: 'A empresa aceita as contrapartidas e o investimento avança.', failureText: 'A empresa escolhe Espanha.',
          success: { econ: { gdp: 0.15 }, groups: { trabalhadores: 4 }, approval: 2 }, failure: { approval: -1, media: -2 } } },
      { label: 'Recusar benefícios especiais', desc: 'Coerência fiscal; o investimento vai para outro país.', effects: { groups: { empresarios: -4 }, relations: { il: -5 } } }
    ]
  },
  {
    id: 'turismo_recorde', area: 'economia', title: 'Turismo bate todos os recordes',
    text: 'Portugal recebe um número recorde de turistas e as receitas superam todas as previsões. Mas nos centros históricos de Lisboa e do Porto cresce a contestação ao excesso de turismo.',
    when: { months: [7, 8, 9] }, weight: 0.7, severity: 1,
    options: [
      { label: 'Criar uma taxa turística nacional', desc: 'Receita consignada à habitação.', effects: { budget: -150, econ: { housing: -0.3 }, groups: { empresarios: -4, jovens: 3 } } },
      { label: 'Promover o turismo no interior', desc: 'Distribui os benefícios pelo território.', effects: { budget: 30, groups: { interior: 4 } } },
      { label: 'Celebrar os números', desc: 'Boa notícia, aproveitada politicamente.', effects: { approval: 2 } }
    ]
  },
  {
    id: 'tarifas_eua', area: 'externa', title: 'Estados Unidos anunciam tarifas',
    text: 'Washington anuncia tarifas de 20% sobre produtos europeus, atingindo o vinho, a cortiça, o calçado e os moldes portugueses. As associações empresariais pedem apoio urgente.',
    weight: 0.6, severity: 2,
    options: [
      { label: 'Plano de apoio às exportadoras', desc: 'Linhas de crédito e seguros à exportação.', effects: { budget: 200, groups: { empresarios: 6, agricultores: 4 } } },
      { label: 'Defender uma resposta firme da UE', desc: 'Solidariedade europeia, custos a curto prazo.', effects: { eu: 3, econ: { gdp: -0.1 } } },
      { label: 'Negociar bilateralmente com Washington', desc: 'Arriscado: Bruxelas não gosta.', effects: {},
        chance: { p: 0.35, successText: 'Washington isenta o vinho e a cortiça portuguesa.', failureText: 'A tentativa falha e irrita os parceiros europeus.',
          success: { approval: 3, groups: { empresarios: 5, agricultores: 5 } }, failure: { eu: -5, approval: -1 } } }
    ]
  },
  // ───────────── TRANSPORTES E OBRAS PÚBLICAS ─────────────
  {
    id: 'tap_proposta', area: 'transportes', title: 'Proposta de compra da TAP',
    text: 'Um grande grupo aéreo europeu apresenta uma proposta firme pela maioria do capital da TAP, garantindo o hub de Lisboa durante dez anos. Os sindicatos da aviação ameaçam com greves.',
    weight: 0.6, severity: 2,
    options: [
      { label: 'Aceitar a venda da maioria', desc: 'Encaixe financeiro elevado e fim do risco para o Estado.', effects: { budget: -1200, econ: { debt: -0.4 }, groups: { trabalhadores: -4, empresarios: 4 }, relations: { cdu: -10, be: -10, il: 8 } } },
      { label: 'Vender apenas uma posição minoritária', desc: 'Compromisso: o Estado mantém o controlo.', effects: { budget: -600, groups: { empresarios: 2 } } },
      { label: 'Recusar: a TAP é estratégica', desc: 'Mantém a companhia pública e os riscos.', effects: { groups: { trabalhadores: 3 }, relations: { il: -10, cdu: 5 } } }
    ]
  },
  {
    id: 'aeroporto_custos', area: 'transportes', title: 'Derrapagem no novo aeroporto',
    text: 'O consórcio responsável pelo Aeroporto Luís de Camões revê em alta o custo da obra e o calendário. A oposição fala em «novo escândalo de obras públicas».',
    weight: 0.6, severity: 2,
    options: [
      { label: 'Renegociar o contrato de concessão', desc: 'Protege o Estado, atrasa a obra.', effects: { media: 2, econ: { gdp: -0.05 } } },
      { label: 'Assumir o custo para não atrasar', desc: 'Garante o calendário, pesa nas contas.', effects: { budget: 400, approval: -1, econ: { gdp: 0.05 } } },
      { label: 'Pedir uma auditoria ao Tribunal de Contas', desc: 'Transparência que ganha tempo.', effects: { media: 3 } }
    ]
  },
  {
    id: 'tgv_atraso', area: 'transportes', title: 'Alta velocidade com atrasos',
    text: 'O troço Porto–Oiã da linha de alta velocidade acumula atrasos e Bruxelas avisa que os fundos europeus têm prazos. Os autarcas do Centro exigem garantias de que o comboio vai parar nas suas cidades.',
    weight: 0.6, severity: 1,
    options: [
      { label: 'Reforçar meios e acelerar expropriações', desc: 'Cumpre prazos, gera conflitos locais.', effects: { budget: 100, eu: 2, groups: { interior: -2 } } },
      { label: 'Garantir paragens em Coimbra e Leiria', desc: 'Agrada aos autarcas, encarece a obra.', effects: { budget: 150, approval: 1, groups: { classe_media: 2 } } },
      { label: 'Adiar o segundo troço', desc: 'Poupa dinheiro, perde fundos.', effects: { eu: -3, econ: { gdp: -0.05 } } }
    ]
  },
  // ───────────── IMIGRAÇÃO E SEGURANÇA ─────────────
  {
    id: 'aima_pendentes', area: 'imigracao', title: 'Centenas de milhares de processos parados na AIMA',
    text: 'Imigrantes fazem fila desde a madrugada à porta da AIMA em {cidade}. Há centenas de milhares de processos pendentes e as empresas queixam-se de não conseguir contratar.',
    weight: 1, severity: 2,
    options: [
      { label: 'Criar uma task-force de regularização', desc: 'Resolve os processos, a direita radical protesta.', effects: { budget: 50, groups: { imigrantes: 10, empresarios: 4 }, relations: { ch: -8 } } },
      { label: 'Endurecer as regras de entrada', desc: 'Menos pedidos novos, mais irregularidade.', effects: { groups: { imigrantes: -8, empresarios: -3 }, relations: { ch: 6 } } },
      { label: 'Contratar serviços externos para despachar', desc: 'Rápido mas criticado.', effects: { budget: 30, media: -1, groups: { imigrantes: 5 } } }
    ]
  },
  {
    id: 'pacto_migracoes', area: 'imigracao', title: 'Bruxelas pede acolhimento de requerentes de asilo',
    text: 'Ao abrigo do Pacto das Migrações, a Comissão Europeia pede a Portugal que acolha 1500 requerentes de asilo atualmente em Itália e na Grécia.',
    weight: 0.5, severity: 1,
    options: [
      { label: 'Aceitar o acolhimento', desc: 'Solidariedade europeia.', effects: { eu: 5, groups: { imigrantes: 4 }, relations: { ch: -8 } } },
      { label: 'Pagar a contribuição financeira', desc: 'Alternativa prevista no Pacto.', effects: { budget: 30, eu: 1 } },
      { label: 'Recusar', desc: 'Conflito com Bruxelas.', effects: { eu: -6, relations: { ch: 6, livre: -6 } } }
    ]
  },
  {
    id: 'tensao_bairro', area: 'imigracao', title: 'Ataques a lojas de imigrantes',
    text: 'Um grupo ataca lojas de comerciantes imigrantes em {cidade}. A comunidade organiza uma vigília, as redes sociais incendeiam-se e o país discute racismo e segurança.',
    weight: 0.6, severity: 2,
    options: [
      { label: 'Condenar firmemente e reforçar o policiamento', desc: 'Defesa clara do Estado de direito.', effects: { approval: 1, media: 2, econ: { crime: -1 }, groups: { imigrantes: 6 } } },
      { label: 'Apelar à calma e prometer controlo da imigração', desc: 'Equilíbrio difícil.', effects: { groups: { imigrantes: -4 }, relations: { ch: 4, livre: -4 } } },
      { label: 'Não comentar', desc: 'O silêncio também comunica.', effects: { approval: -2, media: -3 } }
    ]
  },
  {
    id: 'crime_mediatico', area: 'seguranca', title: 'Crime violento choca o país',
    text: 'Um assalto violento em {cidade} termina com a morte de um comerciante. O caso domina os telejornais e reacende o debate sobre segurança e meios das polícias.',
    weight: 1, severity: 2,
    options: [
      { label: 'Reforçar o policiamento na zona', desc: 'Resposta visível e rápida.', effects: { budget: 20, approval: 1, econ: { crime: -1 }, groups: { seguranca: 3 } } },
      { label: 'Anunciar o agravamento de penas', desc: 'Agrada à direita e a muitos eleitores.', effects: { approval: 1, groups: { seguranca: 4 }, relations: { ch: 5, be: -4 } } },
      { label: 'Apelar à serenidade e aos números', desc: 'Portugal é dos países mais seguros do mundo.', effects: { approval: -1, media: 2 } }
    ]
  },
  {
    id: 'ciberataque', area: 'seguranca', title: 'Ciberataque paralisa serviços públicos',
    text: 'Um ataque informático com ransomware paralisa os sistemas de vários hospitais e do Portal das Finanças. Os atacantes exigem um resgate em criptomoedas.',
    weight: 0.5, severity: 3,
    options: [
      { label: 'Recusar o resgate e restaurar sistemas', desc: 'Princípio firme, dias de caos.', effects: { approval: 1, econ: { waiting: 2 }, media: 1 } },
      { label: 'Criar um centro nacional de cibersegurança', desc: 'Investimento estrutural.', effects: { budget: 80, approval: 1, groups: { seguranca: 2 } } },
      { label: 'Minimizar publicamente o ataque', desc: 'Arriscado se houver fuga de dados.', effects: {},
        chance: { p: 0.4, successText: 'O ataque é contido sem grandes danos.', failureText: 'Dados de milhões de contribuintes aparecem à venda na internet.',
          success: {}, failure: { approval: -5, media: -6 } } }
    ]
  },
  // ───────────── POLÍTICA E INSTITUIÇÕES ─────────────
  {
    id: 'demissao_se', area: 'instituicoes', title: 'Secretário de Estado em polémica',
    text: 'Um secretário de Estado é notícia por ter acumulado funções numa empresa que recebeu contratos públicos da sua área. A oposição exige a demissão imediata.',
    weight: 1, severity: 2,
    options: [
      { label: 'Exigir a demissão imediata', desc: 'Corta o mal pela raiz.', effects: { approval: 1, media: 3, stability: -2 } },
      { label: 'Manter a confiança política', desc: 'Lealdade arriscada.', effects: {},
        chance: { p: 0.4, successText: 'A polémica esmorece em poucos dias.', failureText: 'Surgem novos dados e o secretário de Estado acaba por cair, arrastando o Governo.',
          success: { stability: 1 }, failure: { approval: -4, media: -5, stability: -4 } } },
      { label: 'Pedir parecer à Entidade da Transparência', desc: 'Ganha tempo.', effects: { approval: -1 } }
    ]
  },
  {
    id: 'fuga_informacao', area: 'instituicoes', title: 'Fuga de informação do Conselho de Ministros',
    text: 'Um semanário publica o conteúdo de uma reunião reservada do Conselho de Ministros, revelando divisões internas sobre o Orçamento.',
    weight: 0.6, severity: 1,
    options: [
      { label: 'Abrir um inquérito interno', desc: 'Pode criar mal-estar na equipa.', effects: { stability: -1, media: -1 } },
      { label: 'Desvalorizar: o Governo está unido', desc: 'Discurso de normalidade.', effects: { approval: -1 } },
      { label: 'Remodelar o Governo', desc: 'Reafirma a autoridade do primeiro-ministro.', effects: { stability: 3, approval: 1, media: 1 } }
    ]
  },
  {
    id: 'tensao_presidente', area: 'instituicoes', title: 'O Presidente da República critica o Governo',
    text: 'Numa intervenção pública, o Presidente da República, {presidente}, critica a falta de diálogo do Governo e admite usar todos os poderes que a Constituição lhe confere.',
    weight: 0.8, severity: 2,
    options: [
      { label: 'Pedir audiência em Belém', desc: 'Reconciliação institucional.', effects: { president: 8 } },
      { label: 'Responder publicamente', desc: 'Afirmação política com risco institucional.', effects: { approval: 1, president: -10, stability: -2 } },
      { label: 'Ignorar', desc: 'Evita o confronto direto.', effects: { president: -4 } }
    ]
  },
  {
    id: 'nomeacoes_polemica', area: 'instituicoes', title: 'Polémica com nomeações',
    text: 'A imprensa revela que vários dirigentes partidários foram nomeados para administrações de empresas públicas e institutos. A oposição fala em «assalto ao aparelho de Estado».',
    weight: 0.7, severity: 1,
    options: [
      { label: 'Anunciar concursos públicos para dirigentes', desc: 'Reforma que agrada à opinião pública.', effects: { approval: 1, media: 3 } },
      { label: 'Defender a competência dos nomeados', desc: 'A polémica continua.', effects: { approval: -2, media: -3 } },
      { label: 'Anular as nomeações mais polémicas', desc: 'Recuo com custos internos.', effects: { approval: 1, stability: -2 } }
    ]
  },
  {
    id: 'corrupcao_autarquia', area: 'justica', title: 'Autarca detido por suspeitas de corrupção',
    text: 'A Polícia Judiciária detém o presidente de uma câmara municipal do distrito de {distrito} por suspeitas de corrupção em contratos de obras públicas. O caso relança o debate sobre a transparência.',
    weight: 0.8, severity: 1,
    options: [
      { label: 'Anunciar um pacote anticorrupção', desc: 'Iniciativa política forte.', effects: { approval: 1, media: 3 } },
      { label: 'Deixar a justiça funcionar', desc: 'Resposta institucional e prudente.', effects: {} },
      { label: 'Propor a perda automática de mandato', desc: 'Popular, juridicamente delicada.', effects: { approval: 1, media: 2, relations: { ch: 4 } } }
    ]
  },
  {
    id: 'sondagem_desastrosa', area: 'instituicoes', title: 'Sondagem desastrosa para o Governo',
    text: 'Uma sondagem coloca o {partido_gov} a mais de dez pontos do principal adversário e a avaliação do Governo atinge mínimos. Dentro do partido há quem fale em mudança.',
    when: { maxApproval: 35 }, weight: 1, severity: 2,
    options: [
      { label: 'Remodelar o Governo', desc: 'Novos rostos, nova energia.', effects: { approval: 2, stability: -3 } },
      { label: 'Comunicação ao país', desc: 'O primeiro-ministro fala diretamente aos portugueses.', effects: {},
        chance: { p: 0.5, successText: 'A comunicação é bem recebida e trava a queda.', failureText: 'A comunicação é vista como propaganda e agrava o desgaste.',
          success: { approval: 3 }, failure: { approval: -2, media: -2 } } },
      { label: 'Manter o rumo', desc: 'As sondagens não governam.', effects: { approval: -1 } }
    ]
  },
  {
    id: 'comissao_inquerito', area: 'instituicoes', title: 'Oposição avança com comissão de inquérito',
    text: 'A oposição usa o direito potestativo para criar uma comissão parlamentar de inquérito à gestão de {tema_cpi}. Os trabalhos vão durar meses e ter audições televisionadas.',
    vars: { tema_cpi: ['uma empresa pública', 'os fundos do PRR', 'um contrato de obras públicas', 'uma nomeação polémica'] },
    weight: 0.7, severity: 2,
    options: [
      { label: 'Colaborar com total transparência', desc: 'Entregar todos os documentos pedidos.', effects: { media: 3 } },
      { label: 'Contestar o objeto do inquérito', desc: 'Pode parecer que há algo a esconder.', effects: { approval: -1, media: -3 } },
      { label: 'Atacar a oposição por aproveitamento político', desc: 'Mobiliza a base, cansa os outros.', effects: { approval: -1, media: -2, stability: -1 } }
    ]
  },
  // ───────────── EXTERNA E DEFESA ─────────────
  {
    id: 'cimeira_nato', area: 'defesa', title: 'Cimeira da NATO exige mais investimento',
    text: 'Na cimeira da NATO, os aliados pressionam Portugal a acelerar a trajetória para 3,5% do PIB em defesa. Portugal continua entre os países que menos investem.',
    when: { months: [6, 7] }, weight: 0.7, severity: 2,
    options: [
      { label: 'Comprometer-se com o calendário', desc: 'Credibilidade internacional, pressão nas contas.', effects: { eu: 6, econ: { deficit: 0.3 }, groups: { seguranca: 5 }, relations: { cdu: -8, be: -8 } } },
      { label: 'Pedir mais tempo', desc: 'Prudência orçamental.', effects: { eu: -2 } },
      { label: 'Contabilizar despesa civil como defesa', desc: 'Criatividade contabilística que os aliados notam.', effects: { eu: -1, media: -2 } }
    ]
  },
  {
    id: 'mundial_2030', area: 'cultura', title: 'Mundial 2030: estádios e custos',
    text: 'A organização do Mundial 2030 exige obras nos estádios e acessibilidades. Os clubes pedem dinheiro público e a oposição questiona as prioridades.',
    weight: 0.5, severity: 1,
    options: [
      { label: 'Financiar as obras com fundos públicos', desc: 'Grande evento, grande fatura.', effects: { budget: 250, approval: 1, econ: { gdp: 0.05 }, groups: { empresarios: 3 } } },
      { label: 'Exigir financiamento privado', desc: 'Contas protegidas, clubes descontentes.', effects: { media: 1 } },
      { label: 'Investir só nas acessibilidades', desc: 'Compromisso com legado para as cidades.', effects: { budget: 100, groups: { classe_media: 2 } } }
    ]
  },
  {
    id: 'web_summit', area: 'economia', title: 'Web Summit ameaça sair de Lisboa',
    text: 'A organização da Web Summit pede a renovação do contrato com mais apoio público, sob pena de mudar a conferência para outra capital europeia.',
    weight: 0.4, severity: 1,
    options: [
      { label: 'Renovar o contrato', desc: 'Mantém Lisboa no mapa tecnológico.', effects: { budget: 11, groups: { jovens: 2, empresarios: 2 } } },
      { label: 'Negociar uma redução do apoio', desc: 'Pode correr bem.', effects: {},
        chance: { p: 0.6, successText: 'A organização aceita um apoio menor.', failureText: 'A conferência anuncia a saída de Lisboa.',
          success: { budget: 6 }, failure: { media: -2, groups: { empresarios: -2 } } } },
      { label: 'Deixar sair', desc: 'Poupa dinheiro público.', effects: { groups: { empresarios: -3 } } }
    ]
  },
  // ───────────── SOCIAL E TERRITÓRIO ─────────────
  {
    id: 'pensoes_atualizacao', area: 'social', title: 'Atualização das pensões',
    text: 'Aproxima-se a atualização anual das pensões. Os reformados querem mais do que a fórmula legal e os partidos fazem leilão de propostas.',
    when: { months: [10, 11, 12] }, weight: 1, severity: 2,
    options: [
      { label: 'Aumento extraordinário das pensões baixas', desc: 'Popular entre os mais velhos.', effects: { budget: 300, approval: 2, econ: { deficit: 0.1 }, groups: { pensionistas: 10 } } },
      { label: 'Cumprir apenas a lei', desc: 'Contas certas.', effects: { groups: { pensionistas: -3 } } },
      { label: 'Suplemento extraordinário único', desc: 'Pago uma vez, sem efeito permanente na despesa.', effects: { budget: 200, approval: 1, groups: { pensionistas: 6 } } }
    ]
  },
  {
    id: 'emigracao_jovem', area: 'social', title: 'Emigração jovem em máximos',
    text: 'Um estudo revela que um em cada três jovens licenciados pondera emigrar nos próximos dois anos. Salários baixos e casas caras são os principais motivos.',
    weight: 0.8, severity: 2,
    options: [
      { label: 'Reforçar o IRS Jovem', desc: 'Alívio fiscal para quem fica.', effects: { budget: 200, econ: { emigration: -3 }, groups: { jovens: 6 } } },
      { label: 'Reforçar o programa Regressar', desc: 'Apoio a quem volta.', effects: { budget: 40, econ: { emigration: -1 }, groups: { jovens: 2 } } },
      { label: 'Lançar um pacto para os salários', desc: 'Concertação com patrões e sindicatos.', effects: {},
        chance: { p: 0.5, successText: 'Patrões e sindicatos assinam um acordo de rendimentos ambicioso.', failureText: 'A concertação falha e o tema volta às manchetes.',
          success: { approval: 2, econ: { emigration: -2 }, groups: { trabalhadores: 4, jovens: 3 } }, failure: { approval: -1 } } }
    ]
  },
  {
    id: 'interior_despovoamento', area: 'regioes', title: 'O interior continua a perder gente',
    text: 'Os dados do INE confirmam que vários concelhos do interior perderam mais de 10% da população numa década. Escolas fecham e há aldeias sem um único jovem.',
    weight: 0.7, severity: 1,
    options: [
      { label: 'Estatuto fiscal para o interior', desc: 'Medida forte de coesão.', effects: { budget: 150, groups: { interior: 8, jovens: 2 } } },
      { label: 'Descentralizar serviços públicos', desc: 'Organismos do Estado mudam-se para o interior.', effects: { groups: { interior: 4, funcpublicos: -3 } } },
      { label: 'Apoiar a fixação de imigrantes no interior', desc: 'Solução pragmática e controversa.', effects: { groups: { interior: 3, imigrantes: 4 }, relations: { ch: -4 } } }
    ]
  },
  {
    id: 'autonomia_madeira', area: 'regioes', title: 'Madeira exige mais autonomia',
    text: 'O Governo Regional da Madeira exige a revisão da Lei de Finanças Regionais e o fim do Representante da República, ameaçando endurecer o discurso contra Lisboa.',
    weight: 0.5, severity: 1,
    options: [
      { label: 'Abrir negociações', desc: 'Diálogo com custos orçamentais.', effects: { budget: 80, relations: { jpp: 8 } } },
      { label: 'Recusar alterações', desc: 'Defende o Orçamento do Estado.', effects: { relations: { jpp: -10 } } },
      { label: 'Propor um grupo de trabalho', desc: 'Adia a questão.', effects: { relations: { jpp: 2 } } }
    ]
  },
  {
    id: 'acores_ligacoes', area: 'regioes', title: 'Crise nas ligações aéreas aos Açores',
    text: 'Cancelamentos sucessivos de voos deixam passageiros retidos nas ilhas. O Governo Regional dos Açores exige que o Estado assegure o serviço público de transporte aéreo.',
    weight: 0.5, severity: 1,
    options: [
      { label: 'Reforçar as obrigações de serviço público', desc: 'Mais rotas garantidas.', effects: { budget: 40, approval: 1 } },
      { label: 'Aumentar o subsídio de mobilidade', desc: 'Alívio para os residentes.', effects: { budget: 30, relations: { jpp: 3 } } },
      { label: 'Remeter para o Governo Regional', desc: 'A responsabilidade é partilhada.', effects: { approval: -1 } }
    ]
  },
  {
    id: 'salario_minimo_concertacao', area: 'trabalho', title: 'Salário mínimo para o próximo ano',
    text: 'Abre a negociação do salário mínimo na concertação social. Os patrões aceitam 50 euros de aumento, a UGT pede 80 e a CGTP exige 150.',
    when: { months: [10, 11] }, weight: 1, severity: 1,
    options: [
      { label: 'Fechar acordo com aumento de 50 euros', desc: 'Acordo com os patrões e a UGT.', effects: { stability: 2, groups: { empresarios: 3, trabalhadores: 3 } } },
      { label: 'Fixar um aumento de 80 euros', desc: 'Equilíbrio entre parceiros.', effects: { groups: { trabalhadores: 6, empresarios: -3 }, econ: { inflation: 0.1 } } },
      { label: 'Decretar um aumento de 100 euros', desc: 'Medida popular sem acordo.', effects: { approval: 2, econ: { inflation: 0.2, unemployment: 0.1 }, groups: { trabalhadores: 10, empresarios: -8 } } }
    ]
  },
  {
    id: 'fraude_fundos', area: 'agricultura', title: 'Fraude com fundos agrícolas europeus',
    text: 'A Procuradoria Europeia investiga uma rede que terá desviado milhões de euros de fundos agrícolas no {zona_fundos}. Bruxelas ameaça suspender pagamentos.',
    vars: { zona_fundos: ['Alentejo', 'Ribatejo', 'Centro', 'Norte'] },
    weight: 0.4, severity: 2,
    options: [
      { label: 'Colaborar e reforçar o controlo', desc: 'Proteção dos fundos europeus.', effects: { eu: 3, groups: { agricultores: -2 } } },
      { label: 'Suspender os pagamentos na região', desc: 'Prudência que castiga os inocentes.', effects: { eu: 4, groups: { agricultores: -8 } } },
      { label: 'Defender os agricultores portugueses', desc: 'Discurso protetor, desconfiança europeia.', effects: { eu: -4, groups: { agricultores: 4 } } }
    ]
  }
];

export const OPPOSITION_EVENTS = [
  {
    id: 'oe_abstencao', area: 'impostos', title: 'O Governo pede-lhe a abstenção no Orçamento',
    text: '{pm} telefona a {lider_jogador}: o Governo está disponível para incluir medidas do {partido_jogador} no Orçamento do Estado em troca da abstenção na votação na generalidade.',
    when: { months: [9, 10, 11] }, weight: 1.6, severity: 2,
    options: [
      { label: 'Aceitar em troca de uma medida emblemática', desc: 'Mostra responsabilidade e arranca uma vitória concreta.', effects: { valence: { player: 0.15, gov: 0.1 }, stability: 5 } },
      { label: 'Exigir um pacote alargado', desc: 'Sobe a parada: o Governo pode recusar.', effects: {},
        chance: { p: 0.45, successText: 'O Governo cede e inclui três propostas do partido no Orçamento.', failureText: 'O Governo rompe as negociações e acusa o partido de irresponsabilidade.',
          success: { valence: { player: 0.25 }, stability: 4 }, failure: { valence: { player: -0.1 }, stability: -4 } } },
      { label: 'Recusar e votar contra', desc: 'Coerência de oposição, risco de crise política.', effects: { valence: { player: 0.05, gov: -0.1 }, stability: -8 } }
    ]
  },
  {
    id: 'escandalo_governo', area: 'instituicoes', title: 'Escândalo abala o Governo',
    text: 'Uma investigação jornalística revela que {ministro} terá favorecido uma empresa próxima num concurso público. O Governo garante que tudo foi legal.',
    weight: 1.2, severity: 2,
    options: [
      { label: 'Exigir a demissão do ministro', desc: 'Pressão política imediata.', effects: { valence: { player: 0.08, gov: -0.1 }, media: 2 } },
      { label: 'Pedir uma comissão de inquérito', desc: 'Escrutínio longo e mediático.', effects: { valence: { player: 0.1, gov: -0.15 }, stability: -3 } },
      { label: 'Apresentar uma moção de censura', desc: 'Jogada arriscada: pode reforçar o Governo se falhar.', effects: { valence: { player: 0.05 }, stability: -6 }, setFlag: 'mocao_censura' }
    ]
  },
  {
    id: 'governo_fragil', area: 'instituicoes', title: 'O Governo está nas cordas',
    text: 'Com a avaliação do Governo em mínimos, os comentadores perguntam se a oposição vai avançar. Os militantes do {partido_jogador} pedem ação.',
    when: { maxApproval: 35 }, weight: 1, severity: 2,
    options: [
      { label: 'Apresentar uma moção de censura', desc: 'Pode derrubar o Governo e abrir eleições.', effects: { stability: -8, valence: { player: 0.05 } }, setFlag: 'mocao_censura' },
      { label: 'Esperar pelo momento certo', desc: 'Deixa o Governo desgastar-se sozinho.', effects: { valence: { player: 0.03 } } },
      { label: 'Propor um pacto de estabilidade', desc: 'Postura de Estado, agrada ao centro.', effects: { valence: { player: 0.1 }, stability: 6, president: 5 } }
    ]
  },
  {
    id: 'dissidencia_interna', area: 'instituicoes', title: 'Dissidência interna no partido',
    text: 'Um grupo de dirigentes do {partido_jogador} critica publicamente a estratégia de {lider_jogador} e pede um congresso extraordinário.',
    weight: 0.8, severity: 2,
    options: [
      { label: 'Convocar o congresso e ir a votos', desc: 'Pode sair reforçado... ou não.', effects: {},
        chance: { p: 0.65, successText: '{lider_jogador} vence o congresso com folga e sai reforçado.', failureText: 'O congresso expõe as divisões e o partido sai fragilizado.',
          success: { valence: { player: 0.15 } }, failure: { valence: { player: -0.2 } } } },
      { label: 'Afastar os críticos da direção', desc: 'Autoridade com custos de imagem.', effects: { valence: { player: -0.05 }, media: -2 } },
      { label: 'Integrar os críticos na direção', desc: 'Unidade com cedências.', effects: { valence: { player: 0.05 } } }
    ]
  },
  {
    id: 'autarquicas', area: 'instituicoes', title: 'Eleições autárquicas à porta',
    text: 'As eleições autárquicas são o primeiro grande teste à liderança de {lider_jogador}. É preciso decidir onde concentrar meios e candidatos.',
    when: { months: [9, 10] }, weight: 0.8, severity: 1,
    options: [
      { label: 'Apostar tudo nas grandes cidades', desc: 'Visibilidade máxima, alto risco.', effects: {},
        chance: { p: 0.45, successText: 'O partido conquista uma grande câmara e domina a noite eleitoral.', failureText: 'Os candidatos nas grandes cidades ficam muito aquém.',
          success: { valence: { player: 0.2 } }, failure: { valence: { player: -0.1 } } } },
      { label: 'Apostar na implantação no interior', desc: 'Crescimento lento e sólido.', effects: { valence: { player: 0.05 } } },
      { label: 'Fazer coligações locais', desc: 'Mais câmaras, menos identidade.', effects: { valence: { player: 0.04 }, relations: { ad: 3, ps: 3 } } }
    ]
  },
  {
    id: 'europeias', area: 'externa', title: 'Eleições europeias',
    text: 'Aproximam-se as eleições para o Parlamento Europeu. O {partido_jogador} tem de escolher um cabeça de lista e o tom da campanha.',
    when: { months: [4, 5, 6] }, weight: 0.6, severity: 1,
    options: [
      { label: 'Cabeça de lista mediático', desc: 'Notoriedade garantida.', effects: { valence: { player: 0.08 } } },
      { label: 'Lista de especialistas', desc: 'Credibilidade, pouco entusiasmo.', effects: { valence: { player: 0.04 } } },
      { label: 'Campanha crítica de Bruxelas', desc: 'Mobiliza descontentes, assusta moderados.', effects: { valence: { player: 0.02 }, eu: -3 } }
    ]
  },
  {
    id: 'pacto_saude', area: 'saude', title: 'Convite para um pacto de regime na Saúde',
    text: 'O Governo convida o {partido_jogador} para um pacto de regime sobre o futuro do SNS, com metas para dez anos.',
    weight: 0.6, severity: 1,
    options: [
      { label: 'Aceitar e negociar', desc: 'Sentido de Estado e influência nas políticas.', effects: { valence: { player: 0.08, gov: 0.05 }, president: 5 } },
      { label: 'Recusar', desc: 'Preserva a diferença face ao Governo.', effects: { valence: { player: -0.02 } } },
      { label: 'Aceitar com condições públicas', desc: 'Põe o ónus no Governo.', effects: { valence: { player: 0.06 } } }
    ]
  },
  {
    id: 'pacto_justica', area: 'justica', title: 'Pacto para a Justiça',
    text: 'O Presidente da República apela a um entendimento alargado para reformar a Justiça. O Governo propõe-lhe um acordo sobre prazos processuais e combate à corrupção.',
    weight: 0.5, severity: 1,
    options: [
      { label: 'Assinar o pacto', desc: 'Agrada a Belém e ao centro.', effects: { valence: { player: 0.06 }, president: 8 } },
      { label: 'Apresentar uma proposta própria', desc: 'Marca agenda própria.', effects: { valence: { player: 0.05 } } },
      { label: 'Recusar: o Governo não é credível', desc: 'Discurso duro.', effects: { valence: { player: 0.01 }, president: -4 } }
    ]
  },
  {
    id: 'sondagem_favoravel', area: 'instituicoes', title: 'Sondagem dá vitória à oposição',
    text: 'Uma sondagem coloca o {partido_jogador} em primeiro lugar pela primeira vez. A pressão para forçar eleições antecipadas aumenta.',
    weight: 0.7, severity: 1,
    options: [
      { label: 'Pedir eleições antecipadas', desc: 'Ataque frontal ao Governo.', effects: { valence: { player: 0.03 }, stability: -5, president: -3 } },
      { label: 'Moderar o discurso', desc: 'Conquistar o centro sem pressa.', effects: { valence: { player: 0.08 } } },
      { label: 'Apresentar um programa alternativo', desc: 'Mostra que está pronto para governar.', effects: { valence: { player: 0.1 }, media: 2 } }
    ]
  },
  {
    id: 'grande_entrevista', area: 'instituicoes', title: 'Grande entrevista em horário nobre',
    text: '{lider_jogador} é convidado para uma grande entrevista em horário nobre. É uma oportunidade e um risco.',
    weight: 0.7, severity: 1,
    options: [
      { label: 'Aceitar e preparar a fundo', desc: 'Exposição máxima.', effects: {},
        chance: { p: 0.65, successText: 'A entrevista é um sucesso e domina os comentários do dia seguinte.', failureText: 'Uma resposta infeliz torna-se viral pelos piores motivos.',
          success: { valence: { player: 0.15 } }, failure: { valence: { player: -0.12 } } } },
      { label: 'Recusar', desc: 'Evita riscos.', effects: { valence: { player: -0.02 } } }
    ]
  },
  {
    id: 'apoio_greve', area: 'trabalho', title: 'Sindicatos pedem apoio à greve',
    text: 'Os sindicatos da função pública pedem ao {partido_jogador} que apoie publicamente a greve marcada para a próxima semana.',
    weight: 0.6, severity: 1,
    options: [
      { label: 'Apoiar publicamente', desc: 'Ganha os trabalhadores, perde os empresários.', effects: { valence: { player: 0.04 }, groups: { funcpublicos: 5, empresarios: -3 } } },
      { label: 'Compreender sem apoiar', desc: 'Equilíbrio cauteloso.', effects: { valence: { player: 0.02 } } },
      { label: 'Criticar a greve', desc: 'Defende os utentes afetados.', effects: { groups: { funcpublicos: -5, empresarios: 3 } } }
    ]
  },
  {
    id: 'figura_independente', area: 'instituicoes', title: 'Figura independente quer juntar-se ao partido',
    text: 'Um antigo bastonário respeitado, sem filiação partidária, mostra-se disponível para integrar o governo-sombra do {partido_jogador}.',
    weight: 0.5, severity: 1,
    options: [
      { label: 'Integrá-lo com destaque', desc: 'Credibilidade e cobertura mediática.', effects: { valence: { player: 0.1 } } },
      { label: 'Integrá-lo discretamente', desc: 'Evita ciúmes internos.', effects: { valence: { player: 0.04 } } },
      { label: 'Recusar', desc: 'O aparelho agradece.', effects: {} }
    ]
  },
  {
    id: 'deputado_rebelde', area: 'instituicoes', title: 'Deputado ameaça passar a independente',
    text: 'Um deputado do {partido_jogador} ameaça abandonar a bancada e passar a deputado não inscrito, em desacordo com a linha política.',
    weight: 0.5, severity: 1,
    options: [
      { label: 'Negociar com o deputado', desc: 'Evita a rutura.', effects: {},
        chance: { p: 0.6, successText: 'O deputado fica na bancada.', failureText: 'O deputado sai e acusa a direção de autoritarismo.',
          success: {}, failure: { valence: { player: -0.08 } } } },
      { label: 'Deixá-lo sair', desc: 'Firmeza, perda de um lugar.', effects: { valence: { player: -0.04 } } }
    ]
  },
  {
    id: 'estado_nacao', area: 'instituicoes', title: 'Debate do Estado da Nação',
    text: 'É dia do Debate do Estado da Nação. {lider_jogador} tem a oportunidade de confrontar {pm} no Parlamento perante todo o país.',
    when: { months: [7] }, weight: 1.5, severity: 1,
    options: [
      { label: 'Ataque frontal ao primeiro-ministro', desc: 'Mobiliza os apoiantes.', effects: { valence: { player: 0.05, gov: -0.05 } } },
      { label: 'Apresentar propostas concretas', desc: 'Mostra alternativa de governo.', effects: { valence: { player: 0.08 } } },
      { label: 'Tom de Estado', desc: 'Agrada ao eleitorado moderado e a Belém.', effects: { valence: { player: 0.05 }, president: 4 } }
    ]
  },
  {
    id: 'presidente_ouve', area: 'instituicoes', title: 'O Presidente da República quer ouvi-lo',
    text: '{presidente} recebe {lider_jogador} em Belém para discutir a situação política e a estabilidade do país.',
    weight: 0.5, severity: 1,
    options: [
      { label: 'Garantir disponibilidade para a estabilidade', desc: 'Relação institucional reforçada.', effects: { president: 8, stability: 3 } },
      { label: 'Pedir eleições antecipadas', desc: 'Posição de força.', effects: { president: -5, stability: -3 } },
      { label: 'Denunciar as falhas do Governo', desc: 'Pressão sobre o Executivo.', effects: { president: 2, valence: { gov: -0.05 } } }
    ]
  },
  {
    id: 'orcamento_alternativo', area: 'impostos', title: 'Apresentar um orçamento alternativo?',
    text: 'Os economistas do {partido_jogador} preparam um orçamento alternativo completo. A direção tem de decidir se o apresenta publicamente.',
    when: { months: [9, 10] }, weight: 0.5, severity: 1,
    options: [
      { label: 'Apresentar com contas detalhadas', desc: 'Credibilidade, mas expõe-se ao escrutínio.', effects: {},
        chance: { p: 0.6, successText: 'O Conselho das Finanças Públicas considera as contas plausíveis.', failureText: 'Os economistas encontram um buraco de mil milhões de euros nas contas.',
          success: { valence: { player: 0.12 } }, failure: { valence: { player: -0.1 } } } },
      { label: 'Apresentar apenas as linhas gerais', desc: 'Menos risco, menos impacto.', effects: { valence: { player: 0.03 } } }
    ]
  }
];

// Eventos do modo ditadura: tom sóbrio, consequências explícitas.
const R = { regimeOnly: true };
export const REGIME_EVENTS = [
  {
    id: 'manif_avenida', area: 'instituicoes', title: 'Manifestação gigante na Avenida da Liberdade',
    text: 'Centenas de milhares de pessoas descem a Avenida da Liberdade com cravos vermelhos, exigindo eleições livres. As imagens correm o mundo e abrem os noticiários internacionais.',
    when: R, weight: 1.5, severity: 3,
    options: [
      { label: 'Dispersar à força', desc: 'Restabelece a ordem nas ruas a um preço altíssimo.', effects: { unrest: 10, regime: { repression: 15, legitimacy: -15, international: -15, resistance: 10 } } },
      { label: 'Permitir e ignorar', desc: 'Evita a violência, mas mostra fraqueza.', effects: { regime: { legitimacy: -5, resistance: 5 } } },
      { label: 'Prometer um calendário eleitoral', desc: 'Acalma as ruas e abre caminho à transição.', effects: { unrest: -6, regime: { legitimacy: 10, international: 8, resistance: -8, military: 3 } } }
    ]
  },
  {
    id: 'greve_geral_regime', area: 'trabalho', title: 'Greve geral paralisa o país',
    text: 'Sindicatos na clandestinidade convocam uma greve geral. Portos, transportes e fábricas param. A economia regista o pior dia desde a pandemia.',
    when: R, weight: 1.2, severity: 3,
    options: [
      { label: 'Requisição militar dos serviços essenciais', desc: 'Militares substituem grevistas.', effects: { econ: { gdp: -0.3 }, regime: { repression: 10, military: -6, legitimacy: -8 } } },
      { label: 'Prender os dirigentes sindicais', desc: 'Decapita o movimento e indigna o mundo.', effects: { regime: { repression: 15, international: -12, legitimacy: -10, resistance: 10 } } },
      { label: 'Negociar aumentos salariais', desc: 'Compra a paz social.', effects: { budget: 500, regime: { legitimacy: 5, resistance: -4 }, groups: { trabalhadores: 6 } } }
    ]
  },
  {
    id: 'artigo_7', area: 'externa', title: 'Bruxelas ativa o artigo 7.º e congela fundos',
    text: 'A Comissão Europeia ativa o artigo 7.º do Tratado da União Europeia e congela os pagamentos do PRR e do PT2030. Portugal arrisca perder o direito de voto no Conselho.',
    when: R, weight: 1.2, severity: 3,
    options: [
      { label: 'Ceder parcialmente às exigências', desc: 'Liberta alguns fundos, enfraquece o regime.', effects: { eu: 8, regime: { international: 10, legitimacy: 3, repression: -5 } } },
      { label: 'Desafiar Bruxelas', desc: 'Discurso soberanista, cofres vazios.', effects: { eu: -10, econ: { gdp: -0.5, deficit: 0.5 }, regime: { international: -10, legitimacy: 2 } } },
      { label: 'Ameaçar sair da União Europeia', desc: 'Escalada perigosa.', effects: { eu: -15, econ: { gdp: -0.6, debt: 2 }, regime: { international: -15, legitimacy: -5 } } }
    ]
  },
  {
    id: 'rating_lixo', area: 'economia', title: 'Rating da dívida cai para «lixo»',
    text: 'As agências de notação cortam a dívida portuguesa para a categoria de investimento especulativo. Os juros disparam acima dos 7% e o Estado tem dificuldade em financiar-se.',
    when: R, weight: 1, severity: 3,
    options: [
      { label: 'Cortes de emergência na despesa', desc: 'Austeridade imposta por decreto.', effects: { econ: { deficit: -0.5, gdp: -0.3 }, groups: { funcpublicos: -10, pensionistas: -8 }, regime: { legitimacy: -8 } } },
      { label: 'Controlo de capitais', desc: 'Trava a fuga de dinheiro, assusta as empresas.', effects: { econ: { gdp: -0.4 }, groups: { empresarios: -10 }, regime: { international: -8, repression: 4 } } },
      { label: 'Pedir financiamento a potências não europeias', desc: 'Dinheiro com condições políticas.', effects: { econ: { debt: 2 }, eu: -8, regime: { international: -6 } } }
    ]
  },
  {
    id: 'fuga_capitais', area: 'economia', title: 'Fuga de capitais',
    text: 'Os depósitos bancários caem a pique e grandes empresas transferem sedes para o estrangeiro. O Banco de Portugal alerta para o risco sistémico.',
    when: R, weight: 1, severity: 2,
    options: [
      { label: 'Limitar os levantamentos bancários', desc: 'Estanca a sangria, revolta a classe média.', effects: { groups: { classe_media: -12 }, regime: { repression: 6, legitimacy: -8 } } },
      { label: 'Nacionalizar a banca', desc: 'Controlo total, isolamento financeiro.', effects: { econ: { gdp: -0.4, debt: 2 }, groups: { empresarios: -12 }, regime: { international: -10 } } },
      { label: 'Garantias de estabilidade aos investidores', desc: 'Tentativa de recuperar confiança.', effects: {},
        chance: { p: 0.3, successText: 'A fuga de capitais abranda temporariamente.', failureText: 'Ninguém acredita nas garantias e a fuga acelera.',
          success: { econ: { gdp: 0.1 } }, failure: { econ: { gdp: -0.3 }, regime: { legitimacy: -4 } } } }
    ]
  },
  {
    id: 'oficiais_descontentes', area: 'defesa', title: 'Oficiais das Forças Armadas descontentes',
    text: 'Um grupo de capitães e majores faz circular um documento a exigir o regresso à normalidade democrática, numa evocação explícita do Movimento das Forças Armadas de 1974.',
    when: R, weight: 1.2, severity: 3,
    options: [
      { label: 'Purgar as chefias militares', desc: 'Afasta os críticos, divide os quartéis.', effects: { regime: { military: -15, repression: 10, resistance: 8 } } },
      { label: 'Aumentar salários e regalias militares', desc: 'Compra lealdades.', effects: { budget: 300, regime: { military: 12 } } },
      { label: 'Dialogar com os oficiais', desc: 'Reconhece as preocupações sem ceder em tudo.', effects: { regime: { military: 6, legitimacy: 3 } } }
    ]
  },
  {
    id: 'jornalistas_detidos', area: 'cultura', title: 'Jornalistas detidos',
    text: 'Três jornalistas de investigação são detidos depois de publicarem documentos internos do Governo. Os Repórteres Sem Fronteiras e o Parlamento Europeu exigem a sua libertação.',
    when: R, weight: 1, severity: 2,
    options: [
      { label: 'Libertar os jornalistas', desc: 'Recua perante a pressão internacional.', effects: { media: 5, regime: { international: 8, legitimacy: 3, repression: -5 } } },
      { label: 'Manter as detenções', desc: 'Intimida a imprensa e indigna o mundo.', effects: { media: -10, regime: { repression: 10, international: -12, resistance: 6 } } },
      { label: 'Julgá-los em tribunal especial', desc: 'Formalismo jurídico que não convence ninguém.', effects: { media: -8, regime: { repression: 8, international: -10, legitimacy: -5 } } }
    ]
  },
  {
    id: 'presidente_recusa', area: 'instituicoes', title: 'O Presidente da República recusa reconhecer os decretos',
    text: 'O Presidente da República, {presidente}, declara que não reconhece os decretos do Governo e apela à resistência pacífica das instituições democráticas.',
    when: R, weight: 1.1, severity: 3,
    options: [
      { label: 'Cercar o Palácio de Belém', desc: 'Rutura total com o Estado de direito.', effects: { president: -20, regime: { repression: 15, legitimacy: -18, international: -18, military: -10 } } },
      { label: 'Negociar com Belém', desc: 'Procura uma saída institucional.', effects: { president: 5, regime: { legitimacy: 5 } } },
      { label: 'Ignorar o Presidente', desc: 'Tenta esvaziar o seu papel.', effects: { regime: { legitimacy: -5, resistance: 5 } } }
    ]
  },
  {
    id: 'tc_nulidade', area: 'justica', title: 'Tribunal Constitucional declara atos nulos',
    text: 'Numa decisão histórica, os juízes do Tribunal Constitucional declaram juridicamente inexistentes os decretos do Governo. Juízes de todo o país anunciam que não os aplicarão.',
    when: R, weight: 1, severity: 3,
    options: [
      { label: 'Afastar os juízes', desc: 'Ataque direto à independência judicial.', effects: { regime: { repression: 12, legitimacy: -12, international: -15, resistance: 8 } } },
      { label: 'Ignorar a decisão', desc: 'Os tribunais deixam de cooperar.', effects: { regime: { legitimacy: -8, resistance: 5 } } },
      { label: 'Suspender a aplicação dos decretos mais polémicos', desc: 'Recuo tático.', effects: { regime: { legitimacy: 6, international: 4, repression: -4 } } }
    ]
  },
  {
    id: 'exilio_opositores', area: 'instituicoes', title: 'Opositores partem para o exílio',
    text: 'Dirigentes da oposição deixam o país e formam em Madrid e Bruxelas um governo democrático no exílio, reconhecido por vários parlamentos europeus.',
    when: R, weight: 0.8, severity: 2,
    options: [
      { label: 'Pedir a extradição dos exilados', desc: 'Pedido que ninguém vai aceitar.', effects: { regime: { international: -8, legitimacy: -3 } } },
      { label: 'Confiscar os seus bens', desc: 'Retaliação que reforça a narrativa de perseguição.', effects: { regime: { repression: 6, international: -6, resistance: 4 } } },
      { label: 'Ignorar o governo no exílio', desc: 'Retira-lhe protagonismo.', effects: { regime: { legitimacy: -2 } } }
    ]
  },
  {
    id: 'diaspora_mobiliza', area: 'externa', title: 'A diáspora mobiliza-se',
    text: 'Comunidades portuguesas em Paris, Genebra, Londres, Toronto e São Paulo organizam protestos à porta das embaixadas. As remessas dos emigrantes caem a pique.',
    when: R, weight: 0.8, severity: 2,
    options: [
      { label: 'Encerrar consulados nos países mais críticos', desc: 'Corta pontes com milhões de portugueses.', effects: { regime: { international: -8, legitimacy: -6 } } },
      { label: 'Campanha de propaganda nas comunidades', desc: 'Dinheiro gasto com resultados incertos.', effects: { budget: 30, regime: { legitimacy: 1 } } },
      { label: 'Abrir canal de diálogo com as comunidades', desc: 'Gesto de apaziguamento.', effects: { regime: { legitimacy: 4, international: 3, resistance: -2 } } }
    ]
  },
  {
    id: 'pressao_nato', area: 'defesa', title: 'NATO e Estados Unidos pressionam',
    text: 'Washington suspende a cooperação militar e a NATO avalia o estatuto da Base das Lajes. Os aliados exigem garantias de regresso à democracia.',
    when: R, weight: 0.8, severity: 2,
    options: [
      { label: 'Prometer eleições a prazo', desc: 'Garante tempo e algum apoio externo.', effects: { regime: { international: 10, legitimacy: 4, military: 4 } } },
      { label: 'Ameaçar sair da NATO', desc: 'Isolamento estratégico total.', effects: { regime: { international: -15, military: -10 } } },
      { label: 'Oferecer contrapartidas militares', desc: 'Compra tolerância com bases e acordos.', effects: { budget: 200, regime: { international: 4 } } }
    ]
  },
  {
    id: 'sancoes', area: 'externa', title: 'Sanções económicas internacionais',
    text: 'Vários países europeus aprovam sanções contra membros do Governo e congelam ativos. Companhias aéreas suspendem voos e o turismo afunda.',
    when: R, weight: 0.9, severity: 3,
    options: [
      { label: 'Resistir às sanções', desc: 'Economia de cerco.', effects: { econ: { gdp: -0.7, unemployment: 0.5 }, regime: { legitimacy: -6 } } },
      { label: 'Libertar presos políticos em troca de alívio', desc: 'Concessão negociada.', effects: { regime: { international: 10, repression: -8, legitimacy: 5 } } },
      { label: 'Culpar o estrangeiro na propaganda', desc: 'Funciona por pouco tempo.', effects: { regime: { legitimacy: 2, international: -3 } } }
    ]
  },
  {
    id: 'escassez', area: 'economia', title: 'Escassez de bens essenciais',
    text: 'Faltam medicamentos nas farmácias e há prateleiras vazias nos supermercados. Formam-se filas e o mercado negro prospera.',
    when: R, weight: 0.9, severity: 3,
    options: [
      { label: 'Racionamento oficial', desc: 'Distribuição controlada, descontentamento geral.', effects: { unrest: 6, regime: { legitimacy: -8, repression: 4 } } },
      { label: 'Importações de emergência', desc: 'Caro e dependente de parceiros relutantes.', effects: { budget: 400, regime: { legitimacy: 3 } } },
      { label: 'Fixar preços máximos', desc: 'Agrava o mercado negro.', effects: { econ: { inflation: 1 }, regime: { legitimacy: -3 } } }
    ]
  },
  {
    id: 'propaganda_falha', area: 'cultura', title: 'Propaganda sai pela culatra',
    text: 'Um vídeo oficial de propaganda torna-se motivo de troça nas redes sociais. Milhões de partilhas transformam-no num símbolo da resistência.',
    when: R, weight: 0.7, severity: 1,
    options: [
      { label: 'Bloquear as redes sociais', desc: 'Silêncio digital, indignação real.', effects: { media: -6, regime: { repression: 8, legitimacy: -6, international: -6 } } },
      { label: 'Retirar o vídeo e mudar de estratégia', desc: 'Corta perdas.', effects: { regime: { legitimacy: -1 } } },
      { label: 'Processar os autores das paródias', desc: 'Efeito Streisand garantido.', effects: { regime: { repression: 5, legitimacy: -5, resistance: 4 } } }
    ]
  },
  {
    id: 'tentativa_golpe', area: 'defesa', title: 'Tentativa de golpe militar',
    text: 'Durante a madrugada, unidades militares ocupam a RTP, o aeroporto e pontos estratégicos de Lisboa. Um comunicado anuncia a «restauração da legalidade democrática».',
    when: R, weight: 0.6, severity: 3,
    options: [
      { label: 'Resistir com forças leais', desc: 'Tudo ou nada.', effects: {},
        chance: { p: 0.45, successText: 'As forças leais ao Governo controlam a situação ao fim do dia.', failureText: 'As unidades leais recusam disparar contra camaradas. O regime vacila.',
          success: { regime: { repression: 10, military: 5, legitimacy: -5 } }, failure: { regime: { military: -25, legitimacy: -20, resistance: 15 } } } },
      { label: 'Negociar uma saída e convocar eleições', desc: 'Evita derramamento de sangue.', effects: { regime: { legitimacy: 15, international: 15, military: 10, resistance: -15, repression: -15 } } },
      { label: 'Apelar ao povo na televisão', desc: 'Se a população não sair à rua, acabou.', effects: {},
        chance: { p: 0.3, successText: 'Milhares de apoiantes cercam os quartéis e o golpe falha.', failureText: 'Ninguém sai à rua para defender o Governo.',
          success: { regime: { legitimacy: 8, military: 4 } }, failure: { regime: { legitimacy: -15, military: -15 } } } }
    ]
  },
  {
    id: 'igreja_apelo', area: 'instituicoes', title: 'A Igreja apela ao diálogo',
    text: 'A Conferência Episcopal Portuguesa apela publicamente ao fim da repressão e à libertação dos detidos políticos, num comunicado lido em todas as missas.',
    when: R, weight: 0.6, severity: 1,
    options: [
      { label: 'Aceitar a mediação da Igreja', desc: 'Abre uma via de diálogo.', effects: { regime: { legitimacy: 6, resistance: -4, international: 3 } } },
      { label: 'Ignorar o apelo', desc: 'Perde apoio entre católicos moderados.', effects: { regime: { legitimacy: -4 } } },
      { label: 'Criticar a ingerência da Igreja', desc: 'Conflito com uma instituição respeitada.', effects: { regime: { legitimacy: -8, resistance: 5 } } }
    ]
  },
  {
    id: 'universidades_ocupadas', area: 'educacao', title: 'Estudantes ocupam universidades',
    text: 'Estudantes ocupam as universidades de Lisboa, Coimbra e Porto, evocando a crise académica de 1969. Os reitores recusam chamar a polícia.',
    when: R, weight: 0.8, severity: 2,
    options: [
      { label: 'Evacuar à força', desc: 'Imagens de violência contra estudantes.', effects: { groups: { jovens: -15 }, regime: { repression: 12, legitimacy: -12, international: -8, resistance: 8 } } },
      { label: 'Encerrar as universidades', desc: 'Paralisa o ensino superior.', effects: { groups: { jovens: -10 }, regime: { legitimacy: -6, resistance: 4 } } },
      { label: 'Dialogar com as associações de estudantes', desc: 'Reduz a tensão.', effects: { regime: { legitimacy: 4, resistance: -3 } } }
    ]
  },
  {
    id: 'sindicatos_clandestinos', area: 'trabalho', title: 'Sindicatos na clandestinidade',
    text: 'Dirigentes sindicais organizam redes clandestinas de apoio a grevistas e a famílias de presos. A polícia política diz ter identificado os líderes.',
    when: R, weight: 0.7, severity: 2,
    options: [
      { label: 'Ordenar detenções em massa', desc: 'Repressão que alimenta a resistência.', effects: { regime: { repression: 15, resistance: 10, international: -10, legitimacy: -8 } } },
      { label: 'Legalizar sindicatos sob regras estritas', desc: 'Válvula de escape controlada.', effects: { regime: { legitimacy: 5, resistance: -5, repression: -4 } } },
      { label: 'Infiltrar e vigiar', desc: 'Discreto, mas pode ser descoberto.', effects: { regime: { repression: 5 } } }
    ]
  },
  {
    id: 'plebiscito_regime', area: 'instituicoes', title: 'Plebiscito ao regime',
    text: 'Os conselheiros propõem um plebiscito para dar uma aparência de legitimidade ao regime. Observadores internacionais recusam participar.',
    when: R, weight: 0.5, severity: 2,
    options: [
      { label: 'Plebiscito controlado', desc: 'Resultado garantido, credibilidade nula.', effects: { regime: { legitimacy: 4, international: -8 } } },
      { label: 'Plebiscito livre e observado', desc: 'Arriscado: o povo pode dizer não.', effects: {},
        chance: { p: 0.3, successText: 'Contra todas as expectativas, o regime vence o plebiscito por margem curta.', failureText: 'O «não» vence de forma esmagadora.',
          success: { regime: { legitimacy: 15, international: 6 } }, failure: { regime: { legitimacy: -20, resistance: 15 } } } },
      { label: 'Abandonar a ideia', desc: 'Evita o risco.', effects: {} }
    ]
  }
];

// Listas combinatórias para crises procedimentais (o marcador {cidade} é preenchido com um local da lista places).
export const GENERIC_CRISIS = {
  sectors: [
    { id: 'urgencias', label: 'As urgências do hospital de {cidade}', area: 'saude', group: 'saude' },
    { id: 'centro_saude', label: 'O centro de saúde de {cidade}', area: 'saude', group: 'pensionistas' },
    { id: 'escolas', label: 'As escolas do concelho de {cidade}', area: 'educacao', group: 'professores' },
    { id: 'universidade', label: 'A universidade de {cidade}', area: 'educacao', group: 'jovens' },
    { id: 'linha_cp', label: 'A linha ferroviária que serve {cidade}', area: 'transportes', group: 'trabalhadores' },
    { id: 'tribunal', label: 'O tribunal de {cidade}', area: 'justica', group: 'funcpublicos' },
    { id: 'esquadra', label: 'A esquadra da PSP de {cidade}', area: 'seguranca', group: 'seguranca' },
    { id: 'bombeiros', label: 'O quartel de bombeiros de {cidade}', area: 'seguranca', group: 'interior' },
    { id: 'fabrica', label: 'A maior fábrica de {cidade}', area: 'economia', group: 'trabalhadores' },
    { id: 'bairro', label: 'Um bairro social de {cidade}', area: 'habitacao', group: 'classe_media' },
    { id: 'porto_pesca', label: 'O porto de pesca de {cidade}', area: 'agricultura', group: 'agricultores' },
    { id: 'lar', label: 'Um lar de idosos em {cidade}', area: 'social', group: 'pensionistas' },
    { id: 'aima', label: 'O balcão da AIMA em {cidade}', area: 'imigracao', group: 'imigrantes' },
    { id: 'estacao_agua', label: 'O abastecimento de água de {cidade}', area: 'ambiente', group: 'agricultores' }
  ],
  problems: [
    { id: 'falta_pessoal', text: 'enfrenta uma falta crítica de profissionais', severity: 2 },
    { id: 'encerramento', text: 'está ameaçado de encerramento', severity: 2 },
    { id: 'degradacao', text: 'funciona em instalações degradadas e sem condições', severity: 1 },
    { id: 'greve', text: 'está paralisado por uma greve', severity: 2 },
    { id: 'denuncia', text: 'é alvo de denúncias graves de negligência', severity: 3 },
    { id: 'cortes', text: 'sofre cortes orçamentais que comprometem o funcionamento', severity: 2 },
    { id: 'listas', text: 'acumula atrasos e listas de espera recorde', severity: 2 },
    { id: 'insolvencia', text: 'está em risco de insolvência, com centenas de postos de trabalho em causa', severity: 3 },
    { id: 'protesto', text: 'é palco de protestos diários da população', severity: 1 },
    { id: 'avaria', text: 'está parado devido a uma avaria grave que ninguém resolve', severity: 1 }
  ],
  places: ['Lisboa', 'Porto', 'Braga', 'Coimbra', 'Setúbal', 'Faro', 'Aveiro', 'Viseu', 'Leiria', 'Évora', 'Beja', 'Guarda', 'Bragança', 'Vila Real', 'Castelo Branco', 'Portalegre', 'Santarém', 'Viana do Castelo', 'Funchal', 'Ponta Delgada', 'Amadora', 'Almada', 'Sintra', 'Guimarães', 'Barreiro', 'Loures', 'Odivelas', 'Seixal', 'Portimão', 'Covilhã'],
  responses: [
    { label: 'Reforçar meios de imediato', desc: 'Resolve o problema com dinheiro do Orçamento.', effects: { budget: 40, approval: 1 } },
    { label: 'Enviar uma equipa técnica e prometer solução', desc: 'Ganha tempo sem grandes custos.', effects: { media: 1 } },
    { label: 'Remeter para a autarquia', desc: 'Passa a responsabilidade ao poder local.', effects: { approval: -1, media: -1 } },
    { label: 'Ignorar: é um caso local', desc: 'Poupa recursos, pode crescer na comunicação social.', effects: { approval: -2 } }
  ]
};
