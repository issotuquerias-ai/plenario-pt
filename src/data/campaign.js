// PLENÁRIO PT — Conteúdos de campanha: televisões, sondagens, debates, entrevistas, comícios, visitas e eventos.
// Canais e empresas de sondagens reais; moderadores e figuras públicas fictícios.
// Marcadores nos debates: {tema} (forma minúscula do tema — campo `tema` em DEBATE_TOPICS), {adversario}, {partido_adv},
// {partido}, {proposta} (de TOPIC_PROPOSALS), {ataque} (de TOPIC_ATTACKS, que contém {partido_adv}), {numero}, {cidade}, {lider}.

export const TV_CHANNELS = [
  { id: 'rtp', name: 'RTP1', color: '#0b3a8c', color2: '#e30613', moderators: ['Helena Vasconcelos Prata', 'Duarte Meireles'] },
  { id: 'sic', name: 'SIC', color: '#d4202c', color2: '#f2b705', moderators: ['Marta Brandão Sequeira', 'Gonçalo Viegas'] },
  { id: 'tvi', name: 'TVI', color: '#1c3f94', color2: '#ffcc00', moderators: ['Inês Valadares', 'Nuno Barreiros'] },
  { id: 'cnn', name: 'CNN Portugal', color: '#cc0000', color2: '#ffffff', moderators: ['Joana Teles Pacheco', 'Henrique Lacerda'] }
];

export const POLLSTERS = [
  { id: 'aximage', name: 'Aximage', houseEffects: { ch: 1.0, ps: -0.5, ad: -0.3 } },
  { id: 'catolica', name: 'CESOP–Universidade Católica', houseEffects: { ad: 0.8, ch: -0.8, livre: 0.3 } },
  { id: 'intercampus', name: 'Intercampus', houseEffects: { ch: 0.6, ps: 0.4, ad: -0.6 } },
  { id: 'pitagorica', name: 'Pitagórica', houseEffects: { ad: 0.5, il: 0.3, cdu: -0.2 } },
  { id: 'ics_iscte', name: 'ICS/ISCTE', houseEffects: { ps: 0.8, ch: -0.5, be: 0.2 } }
];

export const DEBATE_TOPICS = [
  { id: 'habitacao', area: 'habitacao', name: 'Habitação', tema: 'habitação',
    questions: ['{lider}, os jovens portugueses não conseguem comprar nem arrendar casa. O que fará nos primeiros cem dias para mudar isto?', 'As rendas em Lisboa e no Porto já ultrapassam o salário mínimo. Defende tetos às rendas?', '{adversario} acusa o seu partido de não ter soluções para a habitação. O que responde?', 'O alojamento local e o investimento estrangeiro são os culpados da crise da habitação?'],
    stakes: 'O tema que mais preocupa os jovens e a classe média urbana.' },
  { id: 'saude', area: 'saude', name: 'Saúde e SNS', tema: 'saúde',
    questions: ['Mais de um milhão e meio de portugueses não têm médico de família. Como resolve o problema?', 'As urgências fecham todos os fins de semana. A solução passa pelo setor privado?', '{lider}, garante que o SNS continuará universal e tendencialmente gratuito?', 'Que medidas concretas propõe para fixar médicos no SNS?'],
    stakes: 'Decisivo para os pensionistas e para o interior.' },
  { id: 'imigracao', area: 'imigracao', name: 'Imigração', tema: 'imigração',
    questions: ['Portugal tem hoje cerca de um milhão e meio de residentes estrangeiros. A imigração está descontrolada?', 'Defende quotas de imigração?', '{adversario} diz que o seu partido explora o medo. Como responde?', 'O que fazer com os processos pendentes na AIMA?'],
    stakes: 'Tema polarizador que mobiliza a direita populista.' },
  { id: 'impostos', area: 'impostos', name: 'Impostos', tema: 'impostos',
    questions: ['Vai baixar impostos? Quais, quanto e quando?', 'A carga fiscal em Portugal é das mais altas da sua história. É sustentável baixá-la?', '{adversario} diz que as suas contas não batem certo. Como financia as suas propostas?', 'Defende a descida do IRC ou do IRS? Porquê?'],
    stakes: 'Classe média e empresários estão atentos.' },
  { id: 'salarios', area: 'trabalho', name: 'Salários e Trabalho', tema: 'salários',
    questions: ['Os salários portugueses continuam entre os mais baixos da Europa Ocidental. Como os aumenta?', 'Qual deve ser o salário mínimo no fim da legislatura?', 'Concorda com a reforma laboral proposta pelo Governo?', '{lider}, a semana de quatro dias é uma boa ideia para Portugal?'],
    stakes: 'Trabalhadores e jovens qualificados que pensam emigrar.' },
  { id: 'corrupcao', area: 'justica', name: 'Corrupção e Justiça', tema: 'corrupção',
    questions: ['Os portugueses acham que a corrupção está generalizada. Que medidas concretas propõe?', 'A justiça é demasiado lenta. Como a torna mais rápida?', 'Defende a criminalização do enriquecimento ilícito, mesmo com dúvidas constitucionais?', '{adversario} acusa o seu partido de proteger os seus. O que responde?'],
    stakes: 'Tema de confiança: castiga quem parece incoerente.' },
  { id: 'educacao', area: 'educacao', name: 'Educação', tema: 'educação',
    questions: ['Há milhares de alunos sem professor. Como resolve a falta de docentes?', 'Defende propinas zero no ensino superior?', 'Os professores devem ser avaliados por resultados?', '{lider}, a escola pública está a perder qualidade?'],
    stakes: 'Professores e famílias com filhos em idade escolar.' },
  { id: 'seguranca', area: 'seguranca', name: 'Segurança', tema: 'segurança',
    questions: ['Os portugueses sentem-se mais inseguros. Os números confirmam essa perceção?', 'As polícias queixam-se de salários baixos e falta de meios. O que lhes promete?', 'Defende penas mais duras para os crimes violentos?', '{adversario} acusa-o de alarmismo. Tem razão?'],
    stakes: 'Eleitores mais velhos e forças de segurança.' },
  { id: 'clima', area: 'ambiente', name: 'Ambiente e Clima', tema: 'clima',
    questions: ['O país enfrenta secas e incêndios cada vez mais graves. O que faria de diferente?', 'Concorda com a exploração de lítio em Portugal?', 'A transição energética está a ser paga pelos mais pobres?', 'Portugal deve antecipar a neutralidade carbónica?'],
    stakes: 'Jovens urbanos e agricultores com visões opostas.' },
  { id: 'economia', area: 'economia', name: 'Economia e Crescimento', tema: 'economia',
    questions: ['Portugal foi ultrapassado por vários países do Leste europeu. Como acelera o crescimento?', 'O que fará para atrair investimento estrangeiro?', 'Os fundos do PRR estão a ser bem aproveitados?', '{lider}, que país quer ter daqui a dez anos?'],
    stakes: 'Credibilidade económica e confiança dos mercados.' },
  { id: 'pensoes', area: 'social', name: 'Pensões', tema: 'pensões',
    questions: ['As pensões estão garantidas para os jovens de hoje?', 'Vai aumentar as pensões mais baixas? Quanto?', 'Defende o aumento da idade da reforma?', '{adversario} diz que o seu programa põe em risco a Segurança Social. É verdade?'],
    stakes: 'O maior bloco eleitoral do país: os reformados.' },
  { id: 'transportes', area: 'transportes', name: 'Transportes e Infraestruturas', tema: 'transportes',
    questions: ['A TAP deve ser privatizada?', 'O novo aeroporto e a alta velocidade vão finalmente avançar?', 'O que fará pela ferrovia no interior?', 'As portagens das antigas SCUT devem acabar de vez?'],
    stakes: 'Grandes obras e coesão territorial.' },
  { id: 'europa_defesa', area: 'externa', name: 'Europa e Defesa', tema: 'Europa e defesa',
    questions: ['Portugal deve gastar 3,5% do PIB em defesa, como pede a NATO?', 'Qual deve ser o papel de Portugal na União Europeia?', 'Como responde às tarifas comerciais dos Estados Unidos?', '{lider}, defende um exército europeu?'],
    stakes: 'Tema de Estado: credibilidade internacional.' },
  { id: 'interior', area: 'regioes', name: 'Interior e Coesão', tema: 'interior',
    questions: ['O interior continua a perder população. Que medida concreta propõe?', 'É a favor da regionalização?', 'O que diz a quem vive numa aldeia sem médico, sem escola e sem transportes?', 'Os incêndios são consequência do abandono do interior?'],
    stakes: 'Distritos pequenos onde cada voto pesa.' },
  { id: 'governabilidade', area: 'instituicoes', name: 'Estabilidade e Governabilidade', tema: 'estabilidade',
    questions: ['Se não tiver maioria, com quem está disposto a governar?', 'Viabilizaria um governo de {adversario}?', 'O país teve três eleições legislativas em poucos anos. De quem é a culpa?', 'Admite fazer acordos com partidos de que discorda profundamente?'],
    stakes: 'A pergunta que todos os eleitores fazem: quem governa no dia seguinte?' }
];

export const APPROACHES = [
  { id: 'proposta', label: 'Proposta concreta', desc: 'Apresenta uma medida concreta. Ganha credibilidade, sobretudo se o tema for forte para o partido.' },
  { id: 'ataque', label: 'Atacar o adversário', desc: 'Expõe as contradições do adversário. Eficaz, mas pode parecer agressivo.' },
  { id: 'emocao', label: 'Apelo emocional', desc: 'Fala das pessoas e das suas histórias. Depende muito do carisma do líder.' },
  { id: 'factcheck', label: 'Desmentir', desc: 'Desmonta uma afirmação do adversário. Grande recompensa se ele exagerou; arriscado se não.' },
  { id: 'soundbite', label: 'Frase de efeito', desc: 'Uma frase curta e memorável para as redes sociais. Pode tornar-se viral… ou numa gafe.' },
  { id: 'esquiva', label: 'Contornar a pergunta', desc: 'Evita a pergunta e muda de assunto. Seguro, mas os comentadores reparam.' }
];

export const DEBATE_LINES = {
  proposta: {
    esquerda: [
      'A nossa proposta é clara: {proposta}. Quem trabalha não pode continuar a pagar a crise dos outros.',
      'Em matéria de {tema}, o {partido} propõe {proposta}. É o Estado a cumprir o seu papel.',
      'Não precisamos de mais promessas, precisamos de {proposta}. E o dinheiro existe: está nos lucros recorde da banca e da energia.',
      'Proponho {proposta}. É justo, é possível e é urgente.',
      'Vamos ao concreto: {proposta}, com financiamento público e controlo democrático.'
    ],
    centro_esquerda: [
      'O {partido} tem uma proposta responsável: {proposta}, sem pôr em causa as contas certas.',
      'Em {tema}, a solução passa por {proposta}. Já provámos que é possível crescer e distribuir.',
      'Proponho {proposta}, com metas claras e avaliação anual no Parlamento.',
      'A nossa prioridade é {proposta}. É assim que se protege a classe média.',
      'Não há soluções mágicas, mas há caminho: {proposta}.'
    ],
    centro_direita: [
      'A nossa proposta é {proposta}. Menos burocracia, mais resultados.',
      'Em {tema}, o {partido} propõe {proposta}, com rigor e sem aventuras orçamentais.',
      'Proponho {proposta}. É assim que se põe o país a crescer acima da média europeia.',
      'Os portugueses querem soluções, não ideologia: {proposta}.',
      'Temos um plano: {proposta}, em parceria com o setor social e privado.'
    ],
    direita_liberal: [
      'A solução é libertar quem cria riqueza: {proposta}.',
      'Em {tema}, propomos {proposta}. O Estado tem de sair da frente.',
      'Proponho {proposta}. Mais concorrência, mais liberdade de escolha, melhores serviços.',
      'O {partido} propõe {proposta}. É o que funciona nos países que nos ultrapassaram.',
      'Menos impostos e menos Estado: {proposta}. É simples.'
    ],
    direita_populista: [
      'Vou ser muito claro: {proposta}. Sem medo e sem politicamente correto.',
      'Os portugueses de bem estão fartos. O {partido} propõe {proposta}, doa a quem doer.',
      'Em {tema}, a nossa proposta é {proposta}. Os outros falam, nós fazemos.',
      'Proponho {proposta}. É isto que o povo pede e que o sistema não quer ouvir.',
      'Basta de desculpas: {proposta}, logo no primeiro dia de governo.'
    ],
    ecologista: [
      'A nossa proposta é {proposta}. Não há futuro sem justiça social e climática.',
      'Em {tema}, o {partido} propõe {proposta}, pensando nas próximas gerações.',
      'Proponho {proposta}. É bom para as pessoas e é bom para o planeta.',
      'Temos de ter coragem: {proposta}. O tempo das meias medidas acabou.',
      'A transição justa começa aqui: {proposta}.'
    ],
    generico: [
      'A nossa proposta é {proposta}.',
      'Em matéria de {tema}, o {partido} propõe {proposta}.',
      'Proponho {proposta}. É uma medida concreta, com prazos e com contas feitas.',
      'O país precisa de {proposta}, e nós vamos fazê-lo.',
      'Sejamos concretos: {proposta}.'
    ]
  },
  ataque: {
    esquerda: [
      'O {partido_adv} fala muito, mas a verdade é que {ataque}.',
      '{adversario}, os portugueses não se esquecem: {ataque}.',
      'Não venha agora dar lições. A verdade é que {ataque}, e isso diz tudo sobre de que lado está.',
      'É sempre a mesma coisa: {ataque}. E quem paga são os trabalhadores.',
      'O seu partido governa para os mesmos de sempre. Basta lembrar que {ataque}.'
    ],
    centro_esquerda: [
      '{adversario}, convém ter memória: {ataque}.',
      'O problema do {partido_adv} é a incoerência. É que {ataque}.',
      'Não pode querer ser solução quando {ataque}.',
      'Os factos são teimosos: {ataque}.',
      'Com todo o respeito, {adversario}, {ataque}. Os portugueses merecem mais seriedade.'
    ],
    centro_direita: [
      'O {partido_adv} tem um problema de credibilidade: {ataque}.',
      '{adversario}, o país lembra-se bem: {ataque}.',
      'É fácil prometer na oposição. Mas a verdade é que {ataque}.',
      'Quem teve oportunidade e falhou não pode dar lições. E {ataque}.',
      'Os números não mentem: {ataque}.'
    ],
    direita_liberal: [
      'O {partido_adv} é parte do problema: {ataque}.',
      '{adversario}, o seu modelo falhou. Basta ver que {ataque}.',
      'A solução do {partido_adv} é sempre mais impostos. E veja o resultado: {ataque}.',
      'Não se pode levar a sério quem defende o mesmo que nos trouxe até aqui. É que {ataque}.',
      'É a receita de sempre, com outro nome: {ataque}.'
    ],
    direita_populista: [
      'Isso é uma vergonha! {ataque}, e agora vem pedir o voto aos portugueses?',
      '{adversario}, o senhor é o sistema. E o sistema é isto: {ataque}.',
      'Os portugueses estão fartos: {ataque}.',
      'É preciso dizer as coisas como são: {ataque}.',
      'Vocês tiveram anos e anos. E o resultado? {ataque}. Basta!'
    ],
    ecologista: [
      'O {partido_adv} continua no século passado: {ataque}.',
      '{adversario}, não se pode falar de futuro quando {ataque}.',
      'É grave e é preciso dizê-lo: {ataque}.',
      'O planeta não espera, mas o {partido_adv} espera sempre. Até porque {ataque}.',
      'Os jovens deste país sabem bem que {ataque}.'
    ],
    generico: [
      'A verdade, {adversario}, é que {ataque}.',
      'O {partido_adv} não tem autoridade nesta matéria: {ataque}.',
      'Convém lembrar que {ataque}.',
      'Diz uma coisa e faz outra: {ataque}.',
      'Os portugueses não se esquecem: {ataque}.'
    ]
  },
  emocao: {
    esquerda: [
      'Ainda ontem estive em {cidade} com uma mãe que trabalha doze horas por dia e não consegue pagar a renda. É por ela que aqui estou.',
      'Por trás de cada número há uma pessoa. Uma reformada que escolhe entre os medicamentos e o jantar. Isto não pode continuar.',
      'Cresci num bairro onde o elevador social estava avariado. Quero um país onde ninguém fique para trás.',
      'Conheci em {cidade} um operário com trinta anos de casa e salário mínimo. Ele merece respeito, não discursos.',
      'Falamos de {tema} como se fosse uma folha de Excel. Não é: é a vida das pessoas.'
    ],
    centro_esquerda: [
      'Em {cidade}, um casal jovem disse-me que vai emigrar. Não quero um país que exporta os seus filhos.',
      'A minha mãe foi enfermeira no SNS durante 35 anos. Sei o que é servir o país.',
      'Há famílias que contam os euros no fim do mês. É para elas que queremos governar.',
      'Quando falamos de {tema}, falamos de dignidade. É isso que está em causa nestas eleições.',
      'Prometi a uma avó em {cidade} que não me ia esquecer dela. E não vou.'
    ],
    centro_direita: [
      'Em {cidade}, conheci um empresário que criou cinquenta postos de trabalho e passa a vida em repartições. Ele merece um Estado que ajude.',
      'Os meus pais trabalharam a vida inteira para me dar oportunidades. Quero que os vossos filhos as tenham cá, em Portugal.',
      'Falo de {tema} a pensar nas famílias que querem apenas viver melhor, sem sobressaltos.',
      'Um país que funciona é um país onde quem se esforça é recompensado. É isso que quero para Portugal.',
      'Há jovens em {cidade} que já desistiram de cá ficar. Não podemos aceitar isso.'
    ],
    direita_liberal: [
      'Conheci em {cidade} uma jovem engenheira que vai para a Holanda ganhar o triplo. Quero que ela possa ficar.',
      'Quem cria um negócio em Portugal é tratado como suspeito. Eu quero um país que celebre quem arrisca.',
      'Os nossos jovens são dos mais qualificados da Europa e dos mais mal pagos. Isso revolta-me.',
      'Liberdade não é um conceito abstrato: é poder escolher a escola, o médico, o futuro.',
      'Pensem nos vossos filhos: querem que eles fiquem cá ou que nos visitem só no Natal?'
    ],
    direita_populista: [
      'Em {cidade}, uma senhora de oitenta anos disse-me que tem medo de sair à rua à noite. É este o país que queremos?',
      'Há portugueses que trabalharam quarenta anos e recebem uma pensão de miséria. E o sistema não quer saber.',
      'Não sou político de carreira. Estou aqui porque estou farto, como vocês.',
      'Os portugueses comuns sentem que ninguém os ouve. Eu ouço-os.',
      'Quantas famílias em {cidade} já não conseguem pagar as contas? E os do costume continuam no poleiro.'
    ],
    ecologista: [
      'Em {cidade}, vi agricultores a perder colheitas inteiras por causa da seca. A crise climática já está aqui.',
      'Os jovens que encheram as ruas pelo clima não querem discursos, querem futuro.',
      'Quero que os meus filhos conheçam os rios e as florestas que eu conheci.',
      'A crise climática e a crise social são a mesma crise. E quem sofre mais são os mais pobres.',
      'Há crianças em {cidade} a respirar ar poluído todos os dias. Isso tem de acabar.'
    ],
    generico: [
      'Ainda ontem, em {cidade}, ouvi histórias que me tiram o sono.',
      'Por trás de cada número há uma família. Nunca nos podemos esquecer disso.',
      'Faço política pelas pessoas, não pelos lugares.',
      'Quando falo de {tema}, penso nas pessoas que conheci nesta campanha.',
      'Os portugueses merecem um país que cuide deles.'
    ]
  },
  factcheck: {
    esquerda: [
      'Isso que disse é falso, {adversario}. Os dados do INE mostram exatamente o contrário.',
      'Lamento, mas não é verdade. O {partido_adv} votou contra essa medida no Parlamento — está nas atas.',
      'Os números que apresentou estão errados em mais de {numero}%. Os portugueses podem confirmar.',
      'Isso não é verdade, e os verificadores de factos já o demonstraram.',
      'Não pode inventar números em direto. Os relatórios oficiais desmentem-no.'
    ],
    centro_esquerda: [
      'Peço desculpa, mas os factos não são esses. Os dados oficiais dizem o contrário.',
      '{adversario}, isso não corresponde à verdade. Está tudo nos relatórios do Conselho das Finanças Públicas.',
      'Não é sério dizer isso. O {partido_adv} votou precisamente ao contrário.',
      'Esse número está errado. O valor real é bem diferente e qualquer jornalista o pode confirmar.',
      'Com todo o respeito, isso é desinformação.'
    ],
    centro_direita: [
      'Isso não é verdade e sabe-o bem. Os números do Eurostat desmentem-no.',
      '{adversario}, está a confundir os portugueses. Os dados são públicos.',
      'Não foi isso que aconteceu. Basta consultar as votações no Parlamento.',
      'Esses números são falsos. O próprio Banco de Portugal diz o contrário.',
      'Permita-me corrigir: o que disse simplesmente não é verdade.'
    ],
    direita_liberal: [
      'Isso é factualmente errado. Os dados da OCDE mostram o contrário.',
      'Os seus números não batem certo, {adversario}. Faça as contas.',
      'Isso é um mito repetido há anos. Os factos desmentem-no.',
      'O {partido_adv} insiste num número que não existe.',
      'Não é verdade, e qualquer economista o confirma.'
    ],
    direita_populista: [
      'Mentira! Isso é mentira e os portugueses sabem!',
      'Isso é falso, {adversario}, e o senhor sabe que é falso.',
      'Os números verdadeiros são outros, e bem piores do que diz.',
      'Está a enganar os portugueses em direto na televisão.',
      'Isso não é verdade. Vá às ruas de {cidade} e veja com os seus olhos.'
    ],
    ecologista: [
      'Isso não é verdade. A ciência é clara e os dados também.',
      'Desculpe, mas os relatórios da Agência Portuguesa do Ambiente dizem o contrário.',
      '{adversario}, está a negar factos científicos.',
      'Esse número está errado em mais de {numero}%.',
      'Não é sério fazer essa afirmação. Os dados públicos desmentem-na.'
    ],
    generico: [
      'Isso não é verdade.',
      'Os dados oficiais desmentem o que acabou de dizer.',
      '{adversario}, está a fazer uma afirmação falsa.',
      'Peço aos portugueses que verifiquem: não foi isso que aconteceu.',
      'Esse número está simplesmente errado.'
    ]
  },
  soundbite: {
    esquerda: [
      'Para eles há sempre dinheiro para os bancos. Para os salários, nunca há.',
      'Os lucros sobem de elevador e os salários sobem de escada.',
      'Quem trabalha não pode ser pobre.',
      'Este país não é um condomínio de luxo para fundos estrangeiros.',
      'Casa para viver, não para especular.'
    ],
    centro_esquerda: [
      'Contas certas e pessoas primeiro.',
      'Não deixamos ninguém para trás.',
      'Estabilidade não é imobilismo: é confiança.',
      'Um país que cuida é um país que cresce.',
      'O futuro não se promete, constrói-se.'
    ],
    centro_direita: [
      'Menos conversa, mais trabalho.',
      'Portugal pode mais.',
      'Quem governa não se esconde atrás de desculpas.',
      'Crescer para distribuir, não distribuir o que não temos.',
      'Estabilidade para o país avançar.'
    ],
    direita_liberal: [
      'O dinheiro dos portugueses é dos portugueses, não do Estado.',
      'Liberdade para crescer.',
      'O Estado é como um mau inquilino: ocupa tudo e paga pouco.',
      'Não queremos um país de subsidiados, queremos um país de oportunidades.',
      'Menos Estado, melhor Estado.'
    ],
    direita_populista: [
      'Portugal primeiro, sempre.',
      'Acabar com os tachos e com os corruptos.',
      'Eles têm medo de nós porque dizemos a verdade.',
      'Basta de tachos!',
      'O povo acordou.'
    ],
    ecologista: [
      'Não há planeta B.',
      'O futuro não se adia.',
      'Justiça climática é justiça social.',
      'Menos betão, mais vida.',
      'Os nossos filhos vão perguntar o que fizemos. Eu quero ter resposta.'
    ],
    generico: [
      'Portugal merece melhor.',
      'É agora ou nunca.',
      'Palavra dada é palavra honrada.',
      'Menos promessas, mais resultados.',
      'O futuro começa no domingo.'
    ]
  },
  esquiva: {
    esquerda: [
      'Essa pergunta é importante, mas o essencial é outra coisa: os salários continuam baixíssimos.',
      'Deixe-me responder com o que realmente preocupa as pessoas: o custo de vida.',
      'Antes disso, é preciso dizer que este debate esconde a verdadeira questão, que é a desigualdade.',
      'Não é isso que os portugueses me perguntam na rua. Perguntam-me como pagar a renda.',
      'Voltaremos a isso. Mas primeiro quero falar de quem trabalha e não chega ao fim do mês.'
    ],
    centro_esquerda: [
      'É uma questão complexa, que exige diálogo. O que posso garantir é responsabilidade.',
      'Essa pergunta merece ponderação. Mas olhe para o nosso historial.',
      'Antes de entrar nesse ponto, quero sublinhar a importância da estabilidade.',
      'Não vou especular. Prefiro falar do que já fizemos pelo país.',
      'Essa decisão será tomada no momento certo, com todos os parceiros.'
    ],
    centro_direita: [
      'Isso é uma discussão para depois das eleições. Agora, o que interessa é o crescimento.',
      'Prefiro focar-me naquilo que os portugueses valorizam: resultados.',
      'Não vou entrar em cenários. O nosso compromisso é com o país.',
      'Essa questão está ultrapassada; o importante é olhar para a frente.',
      'Respondo com factos: o desemprego está em mínimos.'
    ],
    direita_liberal: [
      'A questão de fundo não é essa: é o peso excessivo do Estado.',
      'Isso é um detalhe. O problema estrutural é a carga fiscal.',
      'Vamos ao que interessa: Portugal está a ser ultrapassado por todos.',
      'Prefiro falar de crescimento económico, que é o que resolve tudo o resto.',
      'Essa pergunta parte de um pressuposto errado.'
    ],
    direita_populista: [
      'Isso não interessa nada aos portugueses. O que interessa é a corrupção.',
      'Desculpe, mas os jornalistas fazem sempre as perguntas que dão jeito ao sistema.',
      'Vamos falar do que interessa: a insegurança nas ruas.',
      'Essa é a pergunta do politicamente correto. Eu falo do que o povo sente.',
      'Prefiro responder aos portugueses e não aos comentadores.'
    ],
    ecologista: [
      'Essa pergunta é importante, mas a maior urgência é a crise climática.',
      'Antes disso, temos de falar do mundo que vamos deixar aos nossos filhos.',
      'É uma falsa questão. A verdadeira escolha é entre o futuro e o passado.',
      'Não aceito essa dicotomia. Vamos falar de soluções sustentáveis.',
      'Prefiro falar do que nos une: o futuro do planeta.'
    ],
    generico: [
      'É uma boa pergunta, mas deixe-me falar do essencial.',
      'Antes de responder, há algo mais importante a dizer.',
      'Não vou entrar em especulações.',
      'Os portugueses querem saber outra coisa.',
      'Isso discutiremos no momento certo.'
    ]
  }
};

export const TOPIC_PROPOSALS = {
  habitacao: {
    esquerda: ['um teto de 2% aos aumentos das rendas', 'a construção de 50 mil casas públicas', 'o fim dos benefícios fiscais aos fundos imobiliários', 'o arrendamento obrigatório das casas devolutas'],
    centro_esquerda: ['um programa nacional de habitação a custos acessíveis', 'o reforço do Porta 65 para todos os jovens', 'a mobilização de imóveis públicos devolutos para habitação'],
    centro_direita: ['IMT zero na primeira casa para jovens', 'a garantia pública no crédito à habitação', 'o IVA a 6% na construção de habitação', 'licenciamentos com deferimento tácito'],
    direita_liberal: ['a liberalização do mercado de arrendamento', 'licenciamentos decididos em 60 dias', 'a eliminação do IMT', 'a libertação de solos públicos para construção'],
    direita_populista: ['o fim dos benefícios fiscais a estrangeiros ricos', 'despejos rápidos para quem ocupa casas ilegalmente', 'IMI zero na habitação própria'],
    ecologista: ['cooperativas de habitação apoiadas pelo Estado', 'a reabilitação energética do parque habitacional', 'limites ao alojamento local nos centros históricos']
  },
  saude: {
    esquerda: ['a exclusividade dos médicos no SNS com salários dignos', 'o fim das parcerias público-privadas', 'a contratação de 3000 enfermeiros'],
    centro_esquerda: ['médico de família para todos até 2028', 'o reforço das unidades de saúde familiar', 'um plano de recuperação das urgências'],
    centro_direita: ['o cheque-cirurgia quando o SNS não cumpre os prazos', 'a dedicação plena com melhores salários', 'a cooperação com os setores social e privado'],
    direita_liberal: ['a liberdade de escolha entre o público e o privado', 'o regresso das PPP nos hospitais', 'a dedução integral dos seguros de saúde'],
    direita_populista: ['urgências abertas 24 horas em todos os distritos', 'o fim dos gestores políticos nos hospitais', 'auditorias independentes às listas de espera'],
    ecologista: ['a aposta na prevenção e na saúde mental', 'um psicólogo em cada centro de saúde', 'a saúde oral no SNS']
  },
  imigracao: {
    esquerda: ['a regularização de quem trabalha e desconta', 'o combate às redes de exploração laboral', 'habitação digna para os trabalhadores imigrantes'],
    centro_esquerda: ['uma AIMA com meios para decidir em 90 dias', 'acordos de mobilidade com países terceiros', 'programas de integração e de ensino do português'],
    centro_direita: ['uma imigração regulada e ligada ao emprego', 'uma unidade de estrangeiros e fronteiras na PSP', 'contratos de trabalho antes da entrada no país'],
    direita_liberal: ['vistos rápidos para talento qualificado', 'canais legais de recrutamento para as empresas', 'uma AIMA digital e eficiente'],
    direita_populista: ['quotas de imigração aprovadas pelo Parlamento', 'a expulsão de estrangeiros condenados', 'uma lei da nacionalidade mais exigente', 'controlo apertado das fronteiras'],
    ecologista: ['corredores humanitários para refugiados climáticos', 'o direito de voto local aos residentes estrangeiros', 'integração plena com acesso à língua e à habitação']
  },
  impostos: {
    esquerda: ['um imposto sobre as grandes fortunas', 'a taxação dos lucros extraordinários', 'o englobamento obrigatório dos rendimentos'],
    centro_esquerda: ['a atualização dos escalões de IRS acima da inflação', 'IVA zero no cabaz alimentar', 'um alívio fiscal para a classe média'],
    centro_direita: ['a descida do IRS até ao oitavo escalão', 'o IRS Jovem alargado', 'a redução progressiva do IRC'],
    direita_liberal: ['uma taxa de IRS de 15% para a maioria dos contribuintes', 'o IRC a 15%', 'a eliminação da derrama estadual'],
    direita_populista: ['a descida do imposto sobre os combustíveis', 'IMI zero na habitação própria', 'o fim das mordomias pagas pelos contribuintes'],
    ecologista: ['uma fiscalidade verde que premeie quem polui menos', 'IVA reduzido nos transportes públicos e na reparação', 'uma taxa de carbono com dividendo para as famílias']
  },
  salarios: {
    esquerda: ['um salário mínimo de 1100 euros', 'aumentos gerais de salários de 15%', 'as 35 horas para todos'],
    centro_esquerda: ['um acordo de rendimentos para subir o salário médio', 'o salário mínimo de 1000 euros', 'o combate à precariedade'],
    centro_direita: ['a redução da TSU para quem aumenta salários', 'prémios de produtividade isentos de impostos', 'um acordo de concertação social para a competitividade'],
    direita_liberal: ['a redução da carga fiscal sobre o trabalho', 'uma legislação laboral mais flexível', 'o fim das barreiras à contratação'],
    direita_populista: ['um salário mínimo isento de IRS', 'prioridade ao emprego dos portugueses', 'subsídios só para quem trabalha'],
    ecologista: ['a semana de quatro dias', 'empregos verdes com salários dignos', 'o direito a desligar']
  },
  corrupcao: {
    esquerda: ['o fim das portas giratórias entre o Governo e as empresas', 'o reforço dos meios do Ministério Público', 'o levantamento do sigilo bancário nas investigações'],
    centro_esquerda: ['a regulamentação do lobbying', 'a proteção reforçada dos denunciantes', 'uma Entidade para a Transparência com meios'],
    centro_direita: ['uma agenda anticorrupção com prazos', 'tribunais especializados em crime económico', 'a perda alargada de bens de origem injustificada'],
    direita_liberal: ['menos Estado para haver menos corrupção', 'a publicação em tempo real de todos os contratos públicos', 'o fim das nomeações políticas na administração'],
    direita_populista: ['a criminalização do enriquecimento ilícito', 'prisão efetiva para os corruptos', 'o fim dos tachos e das nomeações de amigos'],
    ecologista: ['transparência total nos grandes projetos', 'a avaliação independente dos contratos públicos', 'o fim do financiamento privado das campanhas']
  },
  educacao: {
    esquerda: ['propinas zero no ensino superior', 'a vinculação dos professores contratados', 'turmas mais pequenas'],
    centro_esquerda: ['a valorização da carreira docente', 'creches gratuitas para todas as crianças', 'um plano de recuperação das aprendizagens'],
    centro_direita: ['a autonomia das escolas', 'a avaliação externa e o mérito', 'a proibição dos telemóveis nas escolas'],
    direita_liberal: ['o cheque-ensino e a liberdade de escolha', 'escolas com gestão independente', 'contratos de associação com escolas privadas'],
    direita_populista: ['autoridade reforçada para os professores', 'a Cidadania como disciplina facultativa', 'disciplina e exigência nas escolas'],
    ecologista: ['educação ambiental em todos os ciclos', 'escolas sustentáveis e inclusivas', 'mais psicólogos nas escolas']
  },
  seguranca: {
    esquerda: ['policiamento de proximidade nos bairros', 'a valorização salarial das polícias', 'mais prevenção e menos repressão'],
    centro_esquerda: ['o reforço do efetivo policial com carreiras atrativas', 'equipas especializadas na violência doméstica', 'a modernização dos equipamentos das polícias'],
    centro_direita: ['mais 4000 agentes nas ruas', 'videovigilância nas zonas críticas', 'um subsídio de risco digno para as forças de segurança'],
    direita_liberal: ['uma justiça rápida que dissuada o crime', 'a reorganização das forças de segurança', 'tecnologia ao serviço do policiamento'],
    direita_populista: ['tolerância zero com o crime', 'penas mais duras para quem agride polícias', 'prisão perpétua para crimes hediondos'],
    ecologista: ['prevenção social e urbanismo seguro', 'câmaras corporais e controlo independente da atividade policial', 'o combate aos crimes de ódio']
  },
  clima: {
    esquerda: ['transportes públicos gratuitos', 'o controlo público da energia', 'o fim dos subsídios aos combustíveis fósseis'],
    centro_esquerda: ['a neutralidade carbónica até 2045', 'o reforço das energias renováveis', 'um plano nacional para a água'],
    centro_direita: ['uma transição energética sem prejudicar as empresas', 'a dessalinização e novas barragens', 'o licenciamento rápido das renováveis'],
    direita_liberal: ['um mercado de carbono eficiente', 'o estudo da energia nuclear', 'a inovação tecnológica em vez de proibições'],
    direita_populista: ['o fim das taxas verdes que castigam os portugueses', 'a defesa do mundo rural e dos agricultores', 'a limpeza das florestas pelo Estado'],
    ecologista: ['uma lei do clima com metas vinculativas', 'a proibição da mineração de lítio a céu aberto', '30% do mar português protegido']
  },
  economia: {
    esquerda: ['um plano de reindustrialização', 'o controlo público dos setores estratégicos', 'investimento público de 4% do PIB'],
    centro_esquerda: ['a execução integral do PRR', 'contas certas com crescimento', 'um acordo de rendimentos e competitividade'],
    centro_direita: ['um choque de competitividade fiscal', 'pagamentos do Estado a 30 dias', 'a captação de investimento estrangeiro'],
    direita_liberal: ['uma desburocratização radical', 'a privatização de empresas públicas', 'o IRC mais baixo da Europa Ocidental'],
    direita_populista: ['proteger as empresas portuguesas da concorrência desleal', 'cortar no desperdício do Estado', 'preferência nacional nas compras públicas'],
    ecologista: ['a economia verde e circular', 'a aposta na ferrovia e nas renováveis', 'investimento em ciência e inovação sustentável']
  },
  pensoes: {
    esquerda: ['um aumento de 50 euros em todas as pensões até três IAS', 'a reposição da idade da reforma aos 65 anos', 'a defesa da Segurança Social pública'],
    centro_esquerda: ['o reforço do Complemento Solidário para Idosos', 'a atualização das pensões acima da inflação', 'a diversificação das fontes de financiamento da Segurança Social'],
    centro_direita: ['um suplemento extraordinário às pensões mais baixas', 'a sustentabilidade da Segurança Social sem cortes', 'o reforço do Fundo de Estabilização'],
    direita_liberal: ['o plafonamento das contribuições', 'contas individuais de reforma', 'a liberdade de escolha do sistema de pensões'],
    direita_populista: ['pensões dignas para quem trabalhou uma vida inteira', 'o corte nas subvenções vitalícias dos políticos', 'nenhuma pensão abaixo do salário mínimo'],
    ecologista: ['um rendimento básico para os mais velhos', 'cuidados domiciliários de proximidade', 'o apoio aos cuidadores informais']
  },
  transportes: {
    esquerda: ['a TAP 100% pública', 'a reabertura das linhas ferroviárias do interior', 'passes gratuitos para jovens e reformados'],
    centro_esquerda: ['a alta velocidade Lisboa–Porto até 2032', 'o passe ferroviário verde', 'o novo Aeroporto Luís de Camões'],
    centro_direita: ['a privatização parcial da TAP', 'a aceleração do novo aeroporto', 'parcerias para modernizar a ferrovia'],
    direita_liberal: ['a privatização total da TAP', 'a concessão de linhas a operadores privados', 'a liberalização do transporte ferroviário'],
    direita_populista: ['o fim das portagens no interior', 'a descida do preço dos combustíveis', 'uma auditoria a todas as obras públicas'],
    ecologista: ['uma rede nacional de ciclovias', 'comboios noturnos para a Europa', 'zonas de emissões reduzidas nas cidades']
  },
  europa_defesa: {
    esquerda: ['uma política externa de paz', 'a saída da NATO', 'a revisão das regras orçamentais europeias'],
    centro_esquerda: ['uma Europa social e solidária', 'o reforço da defesa europeia', 'o cumprimento dos compromissos com a NATO'],
    centro_direita: ['defesa a 2% do PIB já', 'um Portugal no centro da Europa', 'a defesa das comunidades portuguesas'],
    direita_liberal: ['a conclusão do mercado único', 'novos acordos de comércio livre', 'uma defesa europeia forte'],
    direita_populista: ['a soberania nacional acima de Bruxelas', 'o controlo das fronteiras europeias', 'referendos às novas transferências para a UE'],
    ecologista: ['uma Europa federal e verde', 'a diplomacia climática', 'cláusulas de direitos humanos nos acordos comerciais']
  },
  interior: {
    esquerda: ['serviços públicos garantidos no interior', 'a regionalização', '30% do investimento público no interior'],
    centro_esquerda: ['a regionalização com referendo', 'incentivos à fixação de médicos e professores', 'a ferrovia até todas as capitais de distrito'],
    centro_direita: ['um estatuto fiscal para o interior', 'a descentralização para as autarquias', 'apoios à fixação de jovens famílias'],
    direita_liberal: ['zonas económicas especiais com IRC de 10%', 'menos burocracia para investir', 'o teletrabalho com incentivos fiscais'],
    direita_populista: ['o fim das portagens no interior', 'a defesa dos agricultores', 'nenhuma escola ou centro de saúde fechado'],
    ecologista: ['transporte a pedido nas aldeias', 'uma gestão florestal sustentável', 'comunidades de energia renovável']
  },
  governabilidade: {
    esquerda: ['um governo de esquerda com acordos escritos', 'uma maioria de progresso', 'a recusa de entendimentos com a direita'],
    centro_esquerda: ['um governo estável com acordos à esquerda', 'o diálogo com todos os partidos democráticos', 'estabilidade para quatro anos'],
    centro_direita: ['um governo estável sem dependências extremistas', 'acordos pontuais com responsabilidade', 'quatro anos de estabilidade'],
    direita_liberal: ['um governo reformista', 'acordos com quem quiser reformar o país', 'o fim do bloco central de interesses'],
    direita_populista: ['acabar com o sistema dos partidos do costume', 'um governo que obedeça ao povo', 'a redução do número de deputados'],
    ecologista: ['uma convergência progressista', 'acordos com metas climáticas', 'um governo de compromisso com o futuro']
  }
};

export const TOPIC_ATTACKS = {
  habitacao: ['o {partido_adv} prometeu casas e entregou listas de espera', 'o {partido_adv} assistiu de braços cruzados à duplicação do preço das casas', 'o {partido_adv} votou contra as propostas para travar as rendas', 'as propostas do {partido_adv} só beneficiam os fundos imobiliários', 'o {partido_adv} nunca apresentou um plano sério de habitação pública', 'o {partido_adv} quer resolver a habitação com slogans'],
  saude: ['o {partido_adv} deixou o SNS com urgências fechadas ao fim de semana', 'há mais de um milhão de portugueses sem médico de família e o {partido_adv} não tem solução', 'o {partido_adv} quer entregar a saúde aos privados', 'o {partido_adv} votou contra o reforço dos profissionais de saúde', 'o {partido_adv} fala do SNS mas nunca apresentou contas', 'as promessas do {partido_adv} para a saúde não têm financiamento'],
  imigracao: ['o {partido_adv} deixou a imigração sem qualquer regra', 'o {partido_adv} explora o medo para ganhar votos', 'o {partido_adv} não tem resposta para os processos parados na AIMA', 'o {partido_adv} quer fechar portas que a economia precisa abertas', 'o {partido_adv} muda de posição sobre imigração conforme as sondagens', 'o {partido_adv} nunca explicou como pagaria as pensões sem imigrantes'],
  impostos: ['o {partido_adv} deixou a carga fiscal em máximos históricos', 'o {partido_adv} promete baixar impostos mas nunca diz onde corta', 'as propostas do {partido_adv} beneficiam sobretudo os mais ricos', 'o {partido_adv} quer mais impostos para alimentar mais Estado', 'o programa do {partido_adv} tem um buraco de milhares de milhões', 'o {partido_adv} votou contra o alívio do IRS'],
  salarios: ['o {partido_adv} votou contra o aumento do salário mínimo', 'com o {partido_adv}, os jovens continuam a emigrar por causa dos salários baixos', 'o {partido_adv} quer facilitar os despedimentos', 'o {partido_adv} só se lembra dos trabalhadores em campanha', 'as propostas do {partido_adv} destruiriam empregos', 'o {partido_adv} defende uma economia de salários baixos'],
  corrupcao: ['o {partido_adv} fala de ética mas trava as regras de transparência', 'o {partido_adv} distribui cargos pelos seus quando chega ao poder', 'o {partido_adv} só descobre a corrupção quando está na oposição', 'o {partido_adv} nunca apresentou uma medida anticorrupção séria', 'o {partido_adv} usa a corrupção como arma de arremesso, sem propostas', 'o {partido_adv} exige transparência aos outros e esquece-se de si próprio'],
  educacao: ['o {partido_adv} deixou milhares de alunos sem professor', 'o {partido_adv} desvalorizou a escola pública', 'o {partido_adv} quer transformar a educação num negócio', 'o {partido_adv} prometeu aos professores o que nunca cumpriu', 'o {partido_adv} acabou com a exigência nas escolas', 'o {partido_adv} não tem uma única ideia para o ensino superior'],
  seguranca: ['o {partido_adv} deixou as polícias sem meios', 'o {partido_adv} vive de alarmismo', 'o {partido_adv} nunca valorizou quem nos protege', 'o {partido_adv} confunde segurança com populismo', 'o {partido_adv} aceitou o fecho de esquadras no interior', 'o {partido_adv} promete penas que a Constituição proíbe'],
  clima: ['o {partido_adv} desvaloriza a urgência climática', 'o {partido_adv} quer pôr os mais pobres a pagar a transição', 'o {partido_adv} aprova metas que nunca cumpre', 'o {partido_adv} sacrifica o interior em nome do ambiente', 'o {partido_adv} não tem resposta para a seca', 'o {partido_adv} defende o lítio num dia e ataca-o no outro'],
  economia: ['o {partido_adv} quer aventuras orçamentais', 'com as receitas do {partido_adv}, Portugal foi ultrapassado por meia Europa', 'o {partido_adv} só sabe gastar o dinheiro dos outros', 'o {partido_adv} desperdiçou oportunidades com os fundos europeus', 'o programa do {partido_adv} não tem contas', 'o {partido_adv} defende receitas que já falharam noutros países'],
  pensoes: ['o {partido_adv} já apoiou cortes nas pensões no passado', 'as propostas do {partido_adv} põem em risco a Segurança Social', 'o {partido_adv} só se lembra dos reformados nas eleições', 'o {partido_adv} quer entregar as pensões aos mercados', 'o {partido_adv} promete aumentos sem dizer como os paga', 'o {partido_adv} nunca tirou os idosos da pobreza'],
  transportes: ['o {partido_adv} enterrou milhões na TAP', 'o {partido_adv} contribuiu para adiar o aeroporto durante décadas', 'o {partido_adv} deixou a ferrovia ao abandono', 'o {partido_adv} quer vender a TAP ao desbarato', 'o {partido_adv} promete obras que nunca saem do papel', 'o {partido_adv} esqueceu-se dos comboios do interior'],
  europa_defesa: ['o {partido_adv} é ambíguo sobre a NATO', 'o {partido_adv} quer isolar Portugal na Europa', 'o {partido_adv} diz amém a tudo o que vem de Bruxelas', 'o {partido_adv} não tem uma posição clara sobre a defesa', 'o {partido_adv} quer gastar em armas o que falta na saúde', 'o {partido_adv} esquece as comunidades portuguesas'],
  interior: ['o {partido_adv} aceitou o fecho de escolas e centros de saúde no interior', 'o {partido_adv} só se lembra do interior quando há incêndios', 'o {partido_adv} prometeu a regionalização e nunca a fez', 'o {partido_adv} manteve as portagens que matam o interior', 'o {partido_adv} governa a pensar em Lisboa', 'o {partido_adv} não tem um plano para travar o despovoamento'],
  governabilidade: ['o {partido_adv} não diz com quem vai governar', 'o {partido_adv} provocou crises políticas desnecessárias', 'o {partido_adv} é sinónimo de instabilidade', 'o {partido_adv} está disposto a tudo para chegar ao poder', 'o {partido_adv} recusa compromissos com quem quer que seja', 'o {partido_adv} já mudou de posição sobre alianças várias vezes']
};

export const MODERATOR_LINES = {
  intro: [
    'Boa noite. Bem-vindos a mais um debate das eleições legislativas. Frente a frente, esta noite, {lider} e {adversario}.',
    'Boa noite e muito obrigado por estarem connosco. Esta noite discutimos o futuro do país. Comecemos.',
    'Boa noite. Temos trinta minutos e muitos temas. Peço a ambos respostas curtas e concretas.',
    'Boa noite. As regras são conhecidas: tempos iguais e respeito pelas intervenções do adversário. Vamos a isso.'
  ],
  transition: [
    'Passemos a outro tema.',
    'Vamos avançar, o tempo é curto.',
    'Mudemos de assunto: há um tema que preocupa muito os portugueses.',
    'Obrigado. Vamos agora a outra questão.',
    'Fica registado. Avancemos.'
  ],
  interrupt: [
    'Peço-lhe que conclua, por favor.',
    'Deixe responder o seu adversário.',
    'Um de cada vez, por favor, assim os espectadores não percebem nada.',
    'Já ultrapassou o seu tempo.',
    'Vou ter de o interromper.'
  ],
  closing: [
    'Chegámos ao fim deste debate. Obrigado a ambos e aos espectadores.',
    'Fica a escolha nas mãos dos portugueses. Boa noite.',
    'Terminamos aqui. A decisão é sua, no dia das eleições.',
    'Obrigado pela vossa participação. Até ao próximo debate.'
  ]
};

const IQ = (area, question, options) => ({ area, question, options: options.map(([label, effects, risk]) => ({ label, effects, risk })) });

export const INTERVIEW_QUESTIONS = [
  IQ('instituicoes', 'Se não tiver maioria, com quem está disposto a governar?', [
    ['Converso com todos os partidos democráticos', { valence: { player: 0.05 } }, 0.2],
    ['Não faço acordos com extremistas', { valence: { player: 0.08 }, groups: { classe_media: 2 } }, 0.3],
    ['Só governo com maioria própria', { valence: { player: -0.05 }, awareness: { player: 0.02 } }, 0.4]]),
  IQ('saude', 'O SNS tem futuro ou é preciso abrir mais ao setor privado?', [
    ['O SNS é a joia da democracia e tem de ser reforçado', { groups: { saude: 3, pensionistas: 3 } }, 0.15],
    ['Precisamos de todos: público, social e privado', { groups: { classe_media: 2, empresarios: 2 } }, 0.25],
    ['O modelo atual está esgotado', { awareness: { player: 0.03 }, groups: { saude: -4 } }, 0.45]]),
  IQ('impostos', 'Vai baixar impostos? Quanto e quando?', [
    ['Sim, o IRS da classe média já no primeiro orçamento', { groups: { classe_media: 4 } }, 0.3],
    ['Só quando as contas o permitirem', { valence: { player: 0.04 } }, 0.15],
    ['Vamos cortar a sério, a começar pelo IRC', { groups: { empresarios: 5, trabalhadores: -2 } }, 0.4]]),
  IQ('imigracao', 'A imigração é um problema para Portugal?', [
    ['É uma necessidade, desde que regulada', { groups: { empresarios: 2, imigrantes: 3 } }, 0.2],
    ['Está descontrolada e é preciso pôr ordem', { awareness: { player: 0.03 }, groups: { imigrantes: -5 } }, 0.4],
    ['O problema é a exploração dos imigrantes', { groups: { imigrantes: 5, trabalhadores: 2 } }, 0.3]]),
  IQ('habitacao', 'O que diz a um jovem de 30 anos que ainda vive com os pais?', [
    ['Que vamos construir casas públicas a preços que ele pode pagar', { groups: { jovens: 4 } }, 0.2],
    ['Que vamos baixar impostos para ele poder comprar casa', { groups: { jovens: 3, classe_media: 2 } }, 0.2],
    ['Que a culpa é dos sucessivos governos', { awareness: { player: 0.02 }, valence: { player: -0.02 } }, 0.35]]),
  IQ('justica', 'Como garante que não haverá casos de corrupção no seu partido?', [
    ['Quem for acusado sai das listas, sem exceções', { valence: { player: 0.06 } }, 0.25],
    ['Confio na justiça e na presunção de inocência', { valence: { player: 0.02 } }, 0.2],
    ['Ninguém pode garantir isso', { valence: { player: -0.04 } }, 0.3]]),
  IQ('costumes', 'Qual é a sua posição sobre a eutanásia?', [
    ['É uma questão de liberdade individual', { groups: { jovens: 3, pensionistas: -2 } }, 0.3],
    ['Defendo a vida e os cuidados paliativos', { groups: { pensionistas: 3, jovens: -2 } }, 0.3],
    ['Deve ser decidida em referendo', { valence: { player: 0.02 } }, 0.2]]),
  IQ('economia', 'Os seus números batem certo? Como financia as promessas?', [
    ['Temos um cenário macroeconómico validado por economistas', { valence: { player: 0.07 } }, 0.3],
    ['Com crescimento económico', { valence: { player: 0.01 } }, 0.35],
    ['Cortando no desperdício do Estado', { awareness: { player: 0.02 } }, 0.4]]),
  IQ('instituicoes', 'O que fará se perder as eleições?', [
    ['Respeito a vontade dos portugueses e farei oposição construtiva', { valence: { player: 0.05 } }, 0.1],
    ['Não estou a pensar em perder', { awareness: { player: 0.02 } }, 0.25],
    ['Tiro consequências e saio', { valence: { player: 0.03 } }, 0.2]]),
  IQ('defesa', 'Portugal deve gastar mais em defesa?', [
    ['Sim, os compromissos com a NATO são para cumprir', { groups: { seguranca: 3 } }, 0.25],
    ['Primeiro a saúde e a educação', { groups: { pensionistas: 2, professores: 2 } }, 0.25],
    ['Só numa lógica de defesa europeia', { valence: { player: 0.02 } }, 0.2]]),
  IQ('trabalho', 'Concorda com a semana de quatro dias?', [
    ['Sim, começando pela Administração Pública', { groups: { funcpublicos: 4, jovens: 3, empresarios: -3 } }, 0.35],
    ['Só por acordo entre empresas e trabalhadores', { valence: { player: 0.03 } }, 0.15],
    ['Não, precisamos de produzir mais', { groups: { empresarios: 4, trabalhadores: -3 } }, 0.3]]),
  IQ('social', 'As pensões estão garantidas para os jovens de hoje?', [
    ['Sim, com uma Segurança Social pública reforçada', { groups: { pensionistas: 3 } }, 0.25],
    ['Só se fizermos reformas corajosas agora', { groups: { jovens: 2, pensionistas: -3 } }, 0.35],
    ['Ninguém pode prometer isso com honestidade', { valence: { player: 0.03 }, groups: { jovens: 1 } }, 0.3]]),
  IQ('educacao', 'Os professores têm razão nas suas reivindicações?', [
    ['Têm toda a razão', { groups: { professores: 6 } }, 0.25],
    ['Em parte, mas é preciso negociar', { groups: { professores: 2 }, valence: { player: 0.02 } }, 0.15],
    ['Os alunos não podem ser reféns das greves', { groups: { professores: -5, classe_media: 3 } }, 0.35]]),
  IQ('ambiente', 'Concorda com a mineração de lítio em Portugal?', [
    ['Sim, é uma oportunidade económica', { groups: { empresarios: 3, interior: -2 } }, 0.3],
    ['Só com o acordo das populações', { groups: { interior: 3 } }, 0.15],
    ['Não, destrói o território', { groups: { interior: 2, empresarios: -2 } }, 0.25]]),
  IQ('regioes', 'É a favor da regionalização?', [
    ['Sim, com referendo', { groups: { interior: 3 } }, 0.25],
    ['Não, criaria mais tachos', { awareness: { player: 0.02 }, groups: { classe_media: 2 } }, 0.3],
    ['Primeiro a descentralização para os municípios', { valence: { player: 0.02 } }, 0.15]]),
  IQ('externa', 'Como responde às tarifas impostas pelos Estados Unidos?', [
    ['Com uma resposta europeia firme e unida', { valence: { player: 0.03 } }, 0.2],
    ['Negociando diretamente com Washington', { groups: { empresarios: 2 } }, 0.3],
    ['Apoiando já as nossas exportadoras', { groups: { empresarios: 3, agricultores: 2 } }, 0.2]]),
  IQ('seguranca', 'Portugal está mais inseguro?', [
    ['Os dados dizem que somos dos países mais seguros do mundo', { valence: { player: 0.03 } }, 0.3],
    ['As pessoas sentem-se inseguras e isso conta', { groups: { seguranca: 3, pensionistas: 2 } }, 0.25],
    ['Sim, e a culpa é de quem nos governou', { awareness: { player: 0.03 }, groups: { seguranca: 3 } }, 0.4]]),
  IQ('transportes', 'A TAP deve ser privatizada?', [
    ['Sim, o Estado não deve gerir companhias aéreas', { groups: { empresarios: 3 } }, 0.3],
    ['Apenas uma parte, mantendo o controlo nacional', { valence: { player: 0.03 } }, 0.15],
    ['Não, a TAP é estratégica', { groups: { trabalhadores: 3 } }, 0.25]]),
  IQ('cultura', 'A RTP deve continuar pública?', [
    ['Sim, o serviço público é essencial', { valence: { player: 0.02 } }, 0.15],
    ['Sim, mas mais pequena e sem publicidade', { groups: { classe_media: 2 } }, 0.2],
    ['Não, deve ser privatizada', { awareness: { player: 0.02 }, groups: { funcpublicos: -2 } }, 0.35]]),
  IQ('economia', 'Sabe quanto custa hoje um litro de leite no supermercado?', [
    ['Arrisca um preço certo e fala da inflação alimentar', { valence: { player: 0.06 } }, 0.45],
    ['Admite que não sabe ao cêntimo e muda de tema', { valence: { player: -0.02 } }, 0.2],
    ['Recusa responder a «perguntas de algibeira»', { valence: { player: -0.06 }, awareness: { player: 0.02 } }, 0.35]])
];

export const RALLY_THEMES = [
  { id: 'habitacao', label: 'Casas para os jovens', area: 'habitacao', groups: { jovens: 1, classe_media: 0.5 } },
  { id: 'sns', label: 'Salvar o SNS', area: 'saude', groups: { pensionistas: 1, saude: 0.6, classe_media: 0.4 } },
  { id: 'salarios', label: 'Salários dignos', area: 'trabalho', groups: { trabalhadores: 1, jovens: 0.5 } },
  { id: 'impostos', label: 'Menos impostos', area: 'impostos', groups: { classe_media: 1, empresarios: 0.6 } },
  { id: 'seguranca', label: 'Segurança nas ruas', area: 'seguranca', groups: { seguranca: 0.8, pensionistas: 0.5, classe_media: 0.4 } },
  { id: 'imigracao', label: 'Imigração com regras', area: 'imigracao', groups: { classe_media: 0.4, seguranca: 0.4, imigrantes: -0.5 } },
  { id: 'pensoes', label: 'Pensões justas', area: 'social', groups: { pensionistas: 1 } },
  { id: 'interior', label: 'Um país inteiro', area: 'regioes', groups: { interior: 1, agricultores: 0.5 } },
  { id: 'clima', label: 'Futuro verde', area: 'ambiente', groups: { jovens: 0.8, classe_media: 0.3 } },
  { id: 'corrupcao', label: 'Fim da corrupção', area: 'justica', groups: { classe_media: 0.6, trabalhadores: 0.4, pensionistas: 0.3 } },
  { id: 'educacao', label: 'Escola pública de qualidade', area: 'educacao', groups: { professores: 1, classe_media: 0.4, jovens: 0.3 } },
  { id: 'economia', label: 'Crescer e investir', area: 'economia', groups: { empresarios: 1, trabalhadores: 0.3 } },
  { id: 'estabilidade', label: 'Estabilidade e confiança', area: 'instituicoes', groups: { pensionistas: 0.4, classe_media: 0.5, empresarios: 0.3 } }
];

export const VISIT_TYPES = [
  { id: 'hospital', label: 'Visitar o hospital distrital', place: 'Hospital distrital', icon: '🏥', groups: { saude: 1, pensionistas: 0.6 }, area: 'saude' },
  { id: 'escola', label: 'Visitar uma escola secundária', place: 'Escola secundária', icon: '🏫', groups: { professores: 1, classe_media: 0.4, jovens: 0.3 }, area: 'educacao' },
  { id: 'fabrica', label: 'Visitar uma fábrica', place: 'Fábrica', icon: '🏭', groups: { trabalhadores: 1, empresarios: 0.5 }, area: 'economia' },
  { id: 'mercado', label: 'Passear pelo mercado municipal', place: 'Mercado municipal', icon: '🧺', groups: { pensionistas: 0.6, agricultores: 0.5, classe_media: 0.4 }, area: 'economia' },
  { id: 'feira', label: 'Visitar a feira semanal', place: 'Feira semanal', icon: '🛒', groups: { interior: 0.6, pensionistas: 0.4, agricultores: 0.4 }, area: 'agricultura' },
  { id: 'lar', label: 'Visitar um lar de idosos', place: 'Lar de idosos', icon: '👵', groups: { pensionistas: 1 }, area: 'social' },
  { id: 'universidade', label: 'Debate numa universidade', place: 'Universidade', icon: '🎓', groups: { jovens: 1 }, area: 'educacao' },
  { id: 'bombeiros', label: 'Visitar o quartel de bombeiros', place: 'Quartel de bombeiros voluntários', icon: '🚒', groups: { interior: 0.8, seguranca: 0.5 }, area: 'seguranca' },
  { id: 'porto_pesca', label: 'Visitar o porto de pesca', place: 'Porto de pesca', icon: '⚓', groups: { agricultores: 1, interior: 0.3 }, area: 'agricultura' },
  { id: 'exploracao', label: 'Visitar uma exploração agrícola', place: 'Exploração agrícola', icon: '🚜', groups: { agricultores: 1, interior: 0.5 }, area: 'agricultura' },
  { id: 'esquadra', label: 'Visitar uma esquadra da PSP', place: 'Esquadra da PSP', icon: '🚓', groups: { seguranca: 1, classe_media: 0.3 }, area: 'seguranca' },
  { id: 'startup', label: 'Visitar uma incubadora de startups', place: 'Incubadora de startups', icon: '💡', groups: { jovens: 0.7, empresarios: 0.7 }, area: 'economia' },
  { id: 'bairro', label: 'Visitar um bairro social', place: 'Bairro social', icon: '🏘️', groups: { trabalhadores: 0.6, imigrantes: 0.5, jovens: 0.3 }, area: 'habitacao' }
];

export const SOCIAL_CONTENT = [
  { id: 'video_curto', label: 'Vídeo curto nas redes sociais', cost: 8000, youth: 0.9, risk: 0.25, desc: 'Um vídeo de 30 segundos pensado para o TikTok e o Instagram. Alcance jovem enorme se acertar no tom.' },
  { id: 'direto', label: 'Direto com perguntas dos eleitores', cost: 2000, youth: 0.6, risk: 0.35, desc: 'O líder responde em direto a perguntas sem filtro. Autenticidade com risco de deslizes.' },
  { id: 'memes', label: 'Campanha de memes sobre o adversário', cost: 3000, youth: 0.8, risk: 0.45, desc: 'Humor político para viralizar. Pode ser visto como campanha negativa.' },
  { id: 'anuncios', label: 'Anúncios segmentados', cost: 25000, youth: 0.5, risk: 0.1, desc: 'Publicidade paga dirigida por idade e região. Caro, mas previsível.' },
  { id: 'podcast', label: 'Entrevista num podcast popular', cost: 1000, youth: 0.7, risk: 0.3, desc: 'Conversa longa e descontraída. Chega a quem não vê telejornais.' },
  { id: 'influenciadores', label: 'Parceria com influenciadores', cost: 15000, youth: 0.9, risk: 0.4, desc: 'Criadores de conteúdo apresentam as propostas. Alcance alto, credibilidade discutível.' },
  { id: 'newsletter', label: 'Mensagem a militantes e simpatizantes', cost: 500, youth: 0.2, risk: 0.05, desc: 'Mobiliza a base e angaria pequenos donativos.' }
];

// Eventos da fase de campanha. Chaves de efeito: valence, awareness, money (€), energy, localSupport, topic, news.
// localSupport.district = 'current' → o distrito onde o líder está ({distrito} no texto); 'random' → um distrito qualquer.
export const CAMPAIGN_EVENTS = [
  { id: 'sondagem_surpresa', area: 'instituicoes', title: 'Sondagem surpreendente',
    text: 'Uma sondagem publicada esta manhã coloca o {partido_jogador} bem acima do esperado. Os comentadores já falam de «fenómeno eleitoral».',
    weight: 1, severity: 1,
    options: [
      { label: 'Capitalizar com uma conferência de imprensa', desc: 'Mais notoriedade, algum cansaço.', effects: { awareness: { player: 0.04 }, valence: { player: 0.03 }, energy: -5, news: '{partido_jogador} em alta nas sondagens' } },
      { label: 'Manter a humildade', desc: 'Passa uma imagem de seriedade.', effects: { valence: { player: 0.06 } } }
    ] },
  { id: 'gafe_microfone', area: 'instituicoes', title: 'Gafe apanhada por um microfone',
    text: '{lider_jogador} foi apanhado por um microfone aberto a fazer um comentário depreciativo sobre os eleitores de um distrito do interior.',
    weight: 0.9, severity: 2,
    options: [
      { label: 'Pedir desculpa de imediato', desc: 'Limita os danos.', effects: { valence: { player: -0.05 }, localSupport: { district: 'random', value: -0.05 }, news: '{lider_jogador} pede desculpa por comentário infeliz' } },
      { label: 'Dizer que foi descontextualizado', desc: 'Pode colar... ou não.', effects: {},
        chance: { p: 0.4, successText: 'A explicação convence e o caso morre em 24 horas.', failureText: 'O vídeo completo prova o contrário e o caso domina a campanha.',
          success: { valence: { player: -0.02 } }, failure: { valence: { player: -0.2 }, localSupport: { district: 'random', value: -0.15 } } } },
      { label: 'Ignorar', desc: 'Espera que passe.', effects: { valence: { player: -0.12 } } }
    ] },
  { id: 'candidato_polemica', area: 'instituicoes', title: 'Candidato em polémica',
    text: 'Um candidato do {partido_jogador} é notícia por publicações antigas nas redes sociais consideradas ofensivas. Os adversários exigem a sua retirada das listas.',
    weight: 0.9, severity: 2,
    options: [
      { label: 'Retirar o candidato da lista', desc: 'Firmeza com pequeno custo local.', effects: { valence: { player: 0.02 }, localSupport: { district: 'random', value: -0.03 }, news: '{partido_jogador} afasta candidato polémico' } },
      { label: 'Defender o candidato', desc: 'Mobiliza a base, assusta moderados.', effects: { valence: { player: -0.12 }, awareness: { player: 0.02 } } },
      { label: 'Pedir explicações e esperar', desc: 'Indecisão visível.', effects: { valence: { player: -0.05 } } }
    ] },
  { id: 'apoio_figura_publica', area: 'cultura', title: 'Apoio de uma figura pública',
    text: '{figura} declara publicamente o seu voto no {partido_jogador} e oferece-se para participar na campanha.',
    vars: { figura: ['Um antigo internacional de futebol', 'Uma conhecida fadista', 'Um chef de cozinha mediático', 'Uma escritora premiada', 'Um empresário respeitado do Norte'] },
    weight: 0.8, severity: 1,
    options: [
      { label: 'Convidá-la para um comício', desc: 'Notoriedade imediata.', effects: { awareness: { player: 0.05 }, valence: { player: 0.04 }, money: -2000, news: 'Figura pública declara apoio ao {partido_jogador}' } },
      { label: 'Agradecer discretamente', desc: 'Sem riscos.', effects: { valence: { player: 0.02 } } }
    ] },
  { id: 'chuva_arruada', area: 'ambiente', title: 'Aviso laranja para chuva intensa',
    text: 'O IPMA emite aviso laranja para o distrito de {distrito}. A arruada prevista pode transformar-se num fiasco.',
    weight: 0.8, severity: 1,
    options: [
      { label: 'Manter a arruada à chuva', desc: 'Pode ser épico ou um desastre.', effects: {},
        chance: { p: 0.5, successText: 'As imagens do líder encharcado mas sorridente tornam-se o momento do dia.', failureText: 'Meia dúzia de apoiantes debaixo de chapéus de chuva: as imagens são cruéis.',
          success: { localSupport: { district: 'current', value: 0.08 }, news: 'Arruada à chuva impressiona' }, failure: { localSupport: { district: 'current', value: -0.04 }, energy: -10 } } },
      { label: 'Trocar por uma visita a um mercado coberto', desc: 'Solução segura.', effects: { localSupport: { district: 'current', value: 0.02 } } }
    ] },
  { id: 'fake_news', area: 'instituicoes', title: 'Notícia falsa viral',
    text: 'Circula nas redes sociais uma notícia falsa que atribui ao {partido_jogador} a intenção de cortar pensões. Milhares de partilhas em poucas horas.',
    weight: 0.8, severity: 2,
    options: [
      { label: 'Desmentir com os verificadores de factos', desc: 'Resposta factual.', effects: { valence: { player: 0.02 }, money: -1000 } },
      { label: 'Apresentar queixa contra os autores', desc: 'Dá mais visibilidade ao caso.', effects: { money: -5000, awareness: { player: 0.02 } } },
      { label: 'Ignorar', desc: 'Arrisca deixar a mentira crescer.', effects: {},
        chance: { p: 0.5, successText: 'A notícia falsa perde força sozinha.', failureText: 'A mentira cola e muitos reformados acreditam nela.',
          success: {}, failure: { valence: { player: -0.1 } } } }
    ] },
  { id: 'poligrafo_falso', area: 'instituicoes', title: 'Verificação de factos dá «Falso»',
    text: 'O Polígrafo classifica como «Falso» uma afirmação de {lider_jogador} sobre os números do desemprego feita num comício.',
    weight: 0.7, severity: 1,
    options: [
      { label: 'Corrigir publicamente', desc: 'Humildade que limita os danos.', effects: { valence: { player: -0.03 } } },
      { label: 'Atacar os verificadores', desc: 'Agrada a alguns, parece arrogante a outros.', effects: { valence: { player: -0.1 }, awareness: { player: 0.03 } } }
    ] },
  { id: 'cartazes_vandalizados', area: 'seguranca', title: 'Cartazes vandalizados',
    text: 'Dezenas de cartazes do {partido_jogador} em {cidade} amanhecem rasgados e pintados.',
    weight: 0.8, severity: 1,
    options: [
      { label: 'Substituir os cartazes', desc: 'Custa dinheiro.', effects: { money: -4000 } },
      { label: 'Transformar o caso em notícia', desc: 'Vitimização com retorno mediático.', effects: { awareness: { player: 0.03 }, valence: { player: 0.02 }, news: 'Cartazes do {partido_jogador} vandalizados' } },
      { label: 'Apresentar queixa e seguir em frente', desc: 'Sobriedade.', effects: { valence: { player: 0.01 } } }
    ] },
  { id: 'greve_agenda', area: 'educacao', title: 'Greve domina a agenda',
    text: 'Uma greve nacional de professores domina os noticiários e todos os partidos são chamados a tomar posição.',
    weight: 0.7, severity: 1,
    options: [
      { label: 'Apoiar os grevistas', desc: 'Ganha os professores.', effects: { topic: 'educacao', valence: { player: 0.03 } } },
      { label: 'Defender serviços mínimos', desc: 'Agrada às famílias.', effects: { topic: 'educacao', valence: { player: 0.01 } } },
      { label: 'Não comentar', desc: 'Parece fugir ao tema.', effects: { valence: { player: -0.03 } } }
    ] },
  { id: 'incendio_campanha', area: 'seguranca', title: 'Incêndio suspende a campanha',
    text: 'Um incêndio florestal de grandes dimensões atinge o distrito de {distrito}. Todos os partidos suspendem a campanha por um dia.',
    weight: 0.6, severity: 2,
    options: [
      { label: 'Visitar as populações afetadas', desc: 'Pode parecer solidário ou oportunista.', effects: {},
        chance: { p: 0.55, successText: 'A visita discreta, sem câmaras, é elogiada.', failureText: 'Os bombeiros acusam o partido de aproveitamento político.',
          success: { localSupport: { district: 'current', value: 0.06 }, valence: { player: 0.04 } }, failure: { valence: { player: -0.08 } } } },
      { label: 'Suspender a campanha em sinal de respeito', desc: 'Atitude de Estado e um dia de descanso.', effects: { valence: { player: 0.04 }, energy: 10 } }
    ] },
  { id: 'donativo_suspeito', area: 'justica', title: 'Donativo sob suspeita',
    text: 'A Entidade das Contas e Financiamentos Políticos questiona um donativo de 20 mil euros recebido pelo {partido_jogador} de uma empresa.',
    weight: 0.6, severity: 2,
    options: [
      { label: 'Devolver o donativo', desc: 'Transparência com custo financeiro.', effects: { money: -20000, valence: { player: 0.03 } } },
      { label: 'Justificar com documentos', desc: 'Pode resolver ou complicar.', effects: {},
        chance: { p: 0.6, successText: 'A documentação esclarece tudo.', failureText: 'Os documentos levantam ainda mais dúvidas.',
          success: {}, failure: { valence: { player: -0.12 }, news: 'Financiamento do {partido_jogador} sob suspeita' } } },
      { label: 'Atacar a entidade fiscalizadora', desc: 'Péssima imagem.', effects: { valence: { player: -0.1 } } }
    ] },
  { id: 'debate_pequenos', area: 'instituicoes', title: 'Pequenos partidos exigem debate',
    text: 'Os partidos sem assento parlamentar exigem às televisões um debate alargado. O {partido_jogador} é desafiado a liderar a exigência.',
    weight: 0.6, severity: 1,
    options: [
      { label: 'Liderar a exigência', desc: 'Ganha visibilidade.', effects: { awareness: { player: 0.04 } } },
      { label: 'Manter-se à margem', desc: 'Sem custos.', effects: {} }
    ] },
  { id: 'entrevista_dificil', area: 'economia', title: 'Entrevista difícil',
    text: '{lider_jogador} é encostado à parede numa entrevista sobre as contas do programa eleitoral.',
    weight: 0.8, severity: 1,
    options: [
      { label: 'Responder com números', desc: 'Se estiver preparado, brilha.', effects: {},
        chance: { p: 0.6, successText: 'Os números saem certos e a entrevista corre muito bem.', failureText: 'Um número errado torna-se o tema do dia.',
          success: { valence: { player: 0.08 } }, failure: { valence: { player: -0.1 } } } },
      { label: 'Mudar de assunto', desc: 'Os jornalistas reparam.', effects: { valence: { player: -0.04 } } }
    ] },
  { id: 'video_viral', area: 'cultura', title: 'Vídeo viral',
    text: 'Um vídeo de {lider_jogador} a dançar numa feira em {cidade} torna-se viral nas redes sociais.',
    weight: 0.7, severity: 1,
    options: [
      { label: 'Abraçar o momento', desc: 'Humaniza o líder.', effects: { awareness: { player: 0.06 }, valence: { player: 0.02 } } },
      { label: 'Ignorar', desc: 'O vídeo circula na mesma.', effects: { awareness: { player: 0.03 } } }
    ] },
  { id: 'queda_sondagens', area: 'instituicoes', title: 'Queda nas sondagens',
    text: 'Duas sondagens seguidas mostram o {partido_jogador} a perder terreno. Há nervosismo na sede de campanha.',
    weight: 0.8, severity: 2,
    options: [
      { label: 'Mudar de estratégia', desc: 'Arriscado a meio da campanha.', effects: {},
        chance: { p: 0.5, successText: 'A nova mensagem pega e a tendência inverte-se.', failureText: 'A mudança parece desorientação.',
          success: { valence: { player: 0.08 } }, failure: { valence: { player: -0.06 } } } },
      { label: 'Reforçar a mensagem', desc: 'Consistência.', effects: { valence: { player: 0.02 }, energy: -5 } },
      { label: 'Contratar um novo diretor de campanha', desc: 'Profissionaliza a campanha.', effects: { money: -15000, valence: { player: 0.04 } } }
    ] },
  { id: 'jantar_angariacao', area: 'economia', title: 'Jantar de angariação de fundos',
    text: 'Um grupo de empresários propõe organizar um jantar de angariação de fundos para o {partido_jogador}.',
    weight: 0.7, severity: 1,
    options: [
      { label: 'Aceitar o convite dos empresários', desc: 'Dinheiro com alguma desconfiança.', effects: { money: 30000, valence: { player: -0.03 } } },
      { label: 'Preferir microdonativos', desc: 'Menos dinheiro, mais legitimidade.', effects: { money: 8000, valence: { player: 0.02 } } }
    ] },
  { id: 'militantes_forca', area: 'instituicoes', title: 'Militantes em força',
    text: 'Centenas de militantes aparecem espontaneamente na sede distrital de {distrito}, prontos para ajudar.',
    weight: 0.6, severity: 1,
    options: [
      { label: 'Organizar uma arruada surpresa', desc: 'Aproveita o entusiasmo.', effects: { localSupport: { district: 'current', value: 0.06 }, energy: -10 } },
      { label: 'Poupar energias para o fim da campanha', desc: 'Gestão do esforço.', effects: { energy: 15 } }
    ] },
  { id: 'cansaco_lider', area: 'instituicoes', title: 'Cansaço do líder',
    text: '{lider_jogador} acusa o desgaste de semanas de estrada. A equipa sugere uma pausa.',
    weight: 0.7, severity: 1,
    options: [
      { label: 'Tirar uma manhã de descanso', desc: 'Recupera energia.', effects: { energy: 25 } },
      { label: 'Continuar a todo o gás', desc: 'Mais presença, mais risco de erro.', effects: {},
        chance: { p: 0.6, successText: 'A energia do líder impressiona.', failureText: 'Exausto, o líder comete um erro numa entrevista.',
          success: { awareness: { player: 0.02 } }, failure: { valence: { player: -0.08 }, energy: -15 } } }
    ] },
  { id: 'ataque_adversario', area: 'instituicoes', title: 'Ataque de um adversário',
    text: 'Um dirigente de um partido adversário acusa {lider_jogador} de não ter experiência para governar o país.',
    weight: 0.8, severity: 1,
    options: [
      { label: 'Responder à letra', desc: 'Mostra combatividade.', effects: { awareness: { player: 0.02 }, valence: { player: -0.01 } } },
      { label: 'Ignorar e falar de propostas', desc: 'Postura de Estado.', effects: { valence: { player: 0.03 } } },
      { label: 'Responder com ironia', desc: 'Pode ser o momento do dia.', effects: {},
        chance: { p: 0.5, successText: 'A resposta irónica torna-se viral.', failureText: 'A piada cai mal.',
          success: { awareness: { player: 0.05 } }, failure: { valence: { player: -0.05 } } } }
    ] },
  { id: 'comentador_arrasa', area: 'cultura', title: 'Comentador arrasa a campanha',
    text: 'Um comentador influente no horário nobre considera a campanha do {partido_jogador} «a mais fraca dos últimos anos».',
    weight: 0.6, severity: 1,
    options: [
      { label: 'Responder nas redes sociais', desc: 'Alimenta a polémica.', effects: { awareness: { player: 0.02 }, valence: { player: -0.02 } } },
      { label: 'Desvalorizar', desc: 'Sem custos.', effects: {} }
    ] },
  { id: 'capa_favoravel', area: 'cultura', title: 'Capa de jornal favorável',
    text: 'Um semanário de referência dedica a capa às propostas do {partido_jogador} com o título «A surpresa destas eleições».',
    weight: 0.5, severity: 1,
    options: [
      { label: 'Partilhar e capitalizar', desc: 'Boa imprensa.', effects: { awareness: { player: 0.04 }, valence: { player: 0.03 } } },
      { label: 'Agradecer com discrição', desc: 'Sóbrio.', effects: { valence: { player: 0.04 } } }
    ] },
  { id: 'debate_radio', area: 'instituicoes', title: 'Convite para debate na rádio',
    text: 'A Antena 1 e a TSF convidam {lider_jogador} para um debate radiofónico com outros candidatos.',
    weight: 0.6, severity: 1,
    options: [
      { label: 'Aceitar', desc: 'Exposição a eleitores informados.', effects: {},
        chance: { p: 0.6, successText: 'O líder destaca-se no debate radiofónico.', failureText: 'O debate corre mal e os comentadores dão-lhe a derrota.',
          success: { valence: { player: 0.06 }, awareness: { player: 0.03 } }, failure: { valence: { player: -0.05 } } } },
      { label: 'Recusar por falta de agenda', desc: 'Evita riscos, é criticado.', effects: { valence: { player: -0.02 } } }
    ] },
  { id: 'sindicato_apoio', area: 'trabalho', title: 'Sindicato declara apoio',
    text: 'A direção de um sindicato do setor dos transportes manifesta publicamente simpatia pelas propostas do {partido_jogador}.',
    weight: 0.5, severity: 1,
    options: [
      { label: 'Agradecer e assumir o apoio', desc: 'Ganha trabalhadores, perde empresários.', effects: { valence: { player: 0.03 }, topic: 'trabalho' } },
      { label: 'Manter distância', desc: 'Independência face aos sindicatos.', effects: { valence: { player: 0.01 } } }
    ] },
  { id: 'carta_empresarios', area: 'economia', title: 'Carta aberta de empresários',
    text: 'Cinquenta empresários assinam uma carta aberta a criticar as propostas económicas do {partido_jogador}.',
    weight: 0.5, severity: 1,
    options: [
      { label: 'Responder ponto por ponto', desc: 'Debate económico sério.', effects: { valence: { player: 0.02 }, topic: 'economia' } },
      { label: 'Dizer que defendem interesses próprios', desc: 'Mobiliza a base, assusta moderados.', effects: { awareness: { player: 0.02 }, valence: { player: -0.03 } } }
    ] },
  { id: 'incidente_arruada', area: 'seguranca', title: 'Incidente numa arruada',
    text: 'Um militante de um partido rival empurra {lider_jogador} durante uma arruada em {cidade}. As câmaras captam tudo.',
    weight: 0.5, severity: 2,
    options: [
      { label: 'Manter a calma', desc: 'A imagem de serenidade compensa.', effects: { valence: { player: 0.08 }, awareness: { player: 0.03 }, news: '{lider_jogador} mantém a calma após empurrão' } },
      { label: 'Responder ao agressor', desc: 'Muito arriscado.', effects: {},
        chance: { p: 0.3, successText: 'A resposta firme mas pacífica é aplaudida.', failureText: 'As imagens de confusão prejudicam a campanha.',
          success: { awareness: { player: 0.04 } }, failure: { valence: { player: -0.12 } } } }
    ] },
  { id: 'voto_postal', area: 'externa', title: 'Problemas no voto postal',
    text: 'Milhares de emigrantes queixam-se de não ter recebido os boletins de voto a tempo.',
    weight: 0.4, severity: 1,
    options: [
      { label: 'Exigir explicações ao Ministério da Administração Interna', desc: 'Defende a diáspora.', effects: { localSupport: { district: 'random', value: 0.02 }, valence: { player: 0.01 } } },
      { label: 'Não comentar', desc: 'Sem efeitos.', effects: {} }
    ] },
  { id: 'tempos_antena', area: 'cultura', title: 'Tempos de antena',
    text: 'Os tempos de antena começam amanhã na televisão e na rádio. Que tom escolhe o {partido_jogador}?',
    weight: 0.6, severity: 1,
    options: [
      { label: 'Positivo e esperançoso', desc: 'Seguro.', effects: { valence: { player: 0.04 } } },
      { label: 'Contraste com os adversários', desc: 'Mais impacto, alguma rejeição.', effects: { awareness: { player: 0.03 }, valence: { player: -0.02 } } },
      { label: 'Humorístico', desc: 'Tudo ou nada.', effects: {},
        chance: { p: 0.5, successText: 'O tempo de antena humorístico é o mais comentado da campanha.', failureText: 'O humor não resulta e é ridicularizado.',
          success: { awareness: { player: 0.06 } }, failure: { valence: { player: -0.05 } } } }
    ] },
  { id: 'ataque_informatico', area: 'seguranca', title: 'Ataque informático ao site do partido',
    text: 'O site do {partido_jogador} é atacado e fica em baixo durante 24 horas, em plena campanha.',
    weight: 0.4, severity: 1,
    options: [
      { label: 'Reforçar a segurança informática', desc: 'Custa dinheiro.', effects: { money: -6000 } },
      { label: 'Denunciar o ataque publicamente', desc: 'Gera solidariedade.', effects: { awareness: { player: 0.02 }, valence: { player: 0.02 } } }
    ] },
  { id: 'sondagem_local', area: 'instituicoes', title: 'Sondagem local animadora',
    text: 'Uma sondagem local no distrito de {distrito} dá o {partido_jogador} perto de eleger mais um deputado.',
    weight: 0.6, severity: 1,
    options: [
      { label: 'Concentrar recursos neste distrito', desc: 'Pode valer um mandato.', effects: { localSupport: { district: 'current', value: 0.08 }, money: -5000 } },
      { label: 'Manter o plano nacional', desc: 'Estratégia equilibrada.', effects: {} }
    ] },
  { id: 'final_taca', area: 'cultura', title: 'Final da Taça de Portugal',
    text: 'A final da Taça de Portugal no Jamor domina o fim de semana. Os líderes partidários disputam lugar na tribuna.',
    when: { months: [5, 6] }, weight: 0.4, severity: 1,
    options: [
      { label: 'Ir ao Jamor', desc: 'Popularidade ou vaias.', effects: {},
        chance: { p: 0.5, successText: 'O líder é aplaudido pelos adeptos.', failureText: 'O líder é assobiado pelas duas claques.',
          success: { awareness: { player: 0.03 }, valence: { player: 0.03 } }, failure: { valence: { player: -0.04 } } } },
      { label: 'Ficar fora do futebol', desc: 'Prudência.', effects: { energy: 10 } }
    ] }
];

export const SLOGAN_PARTS = {
  // Padrões: {Verbo} {Nome} {Adjetivo} vêm das listas abaixo; {verbo} e {nome} são as formas em minúsculas.
  verbs: ['Mudar', 'Construir', 'Libertar', 'Unir', 'Renovar', 'Defender', 'Reerguer', 'Transformar', 'Avançar', 'Cuidar', 'Acreditar', 'Recuperar'],
  nouns: ['Portugal', 'o País', 'o Futuro', 'a Esperança', 'a Liberdade', 'a Confiança', 'a Justiça', 'a Dignidade', 'o Trabalho', 'a Mudança'],
  adjectives: ['Maior', 'Melhor', 'Mais Justo', 'Livre', 'Inteiro', 'de Pé', 'com Futuro', 'Novo', 'Forte', 'Solidário'],
  patterns: ['{Verbo} {Nome}', 'Portugal {Adjetivo}', 'Por um Portugal {Adjetivo}', '{Verbo} {Nome}, juntos', 'É tempo de {verbo}', '{Verbo} Portugal', 'Um país {Adjetivo}', '{Nome} começa agora'],
  byFamily: {
    esquerda: ['Quem trabalha não pode ser pobre', 'Salários dignos, vida digna', 'Pelo direito a viver em Portugal', 'O país é de quem trabalha', 'Justiça social, já', 'Casa, pão e dignidade', 'Contra as desigualdades, pela maioria', 'Mais Estado social, mais futuro', 'A força de quem trabalha', 'Um país para todos'],
    centro_esquerda: ['Contas certas, vida melhor', 'Um Portugal mais justo', 'Confiança no futuro', 'Ninguém fica para trás', 'Estabilidade e progresso', 'Avançar com as pessoas', 'Portugal inteiro', 'O futuro em boas mãos', 'Mais coesão, mais futuro', 'Um país que cuida'],
    centro_direita: ['Portugal pode mais', 'Crescer para todos', 'Estabilidade para avançar', 'Fazer acontecer', 'Mais Portugal, melhor futuro', 'Confiança e crescimento', 'Trabalho, mérito e futuro', 'Governar com seriedade', 'Um Portugal que funciona', 'Ambição para Portugal'],
    direita_liberal: ['Liberdade para crescer', 'Menos Estado, mais futuro', 'Portugal a acelerar', 'O teu dinheiro é teu', 'Libertar Portugal', 'Ambição sem amarras', 'Mais escolha, mais futuro', 'Desbloquear o país', 'Crescer como os melhores', 'A liberdade dá trabalho'],
    direita_populista: ['Salvar Portugal', 'Portugal primeiro', 'Limpar a política', 'A voz do povo', 'Basta!', 'Devolver o país às pessoas', 'Coragem para mudar', 'Contra o sistema, pelo povo', 'Ordem e justiça', 'Por um Portugal de bem'],
    ecologista: ['O futuro é verde', 'Não há planeta B', 'Viver melhor, poluir menos', 'Justiça climática, justiça social', 'Um país para respirar', 'O tempo é agora', 'Cuidar do futuro', 'Por um Portugal sustentável', 'Mais natureza, mais vida', 'Coragem verde']
  }
};
