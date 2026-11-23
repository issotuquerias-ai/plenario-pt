// Estrutura do Governo e da Assembleia da República.

export const MINISTRIES = [
  { id: 'financas', name: 'Finanças', title: 'Ministro de Estado e das Finanças', weight: 10, areas: ['impostos', 'economia'] },
  { id: 'estrangeiros', name: 'Negócios Estrangeiros', title: 'Ministro de Estado e dos Negócios Estrangeiros', weight: 8, areas: ['externa'] },
  { id: 'presidencia', name: 'Presidência', title: 'Ministro da Presidência', weight: 8, areas: ['instituicoes', 'imigracao'] },
  { id: 'economia', name: 'Economia e Coesão Territorial', title: 'Ministro da Economia e da Coesão Territorial', weight: 7, areas: ['economia', 'regioes'] },
  { id: 'defesa', name: 'Defesa Nacional', title: 'Ministro da Defesa Nacional', weight: 6, areas: ['defesa'] },
  { id: 'administracao_interna', name: 'Administração Interna', title: 'Ministro da Administração Interna', weight: 7, areas: ['seguranca', 'imigracao'] },
  { id: 'justica', name: 'Justiça', title: 'Ministro da Justiça', weight: 6, areas: ['justica', 'costumes'] },
  { id: 'saude', name: 'Saúde', title: 'Ministro da Saúde', weight: 8, areas: ['saude'] },
  { id: 'educacao', name: 'Educação, Ciência e Inovação', title: 'Ministro da Educação, Ciência e Inovação', weight: 7, areas: ['educacao'] },
  { id: 'trabalho', name: 'Trabalho, Solidariedade e Segurança Social', title: 'Ministro do Trabalho, Solidariedade e Segurança Social', weight: 7, areas: ['trabalho', 'social'] },
  { id: 'infraestruturas', name: 'Infraestruturas e Habitação', title: 'Ministro das Infraestruturas e Habitação', weight: 7, areas: ['habitacao', 'transportes'] },
  { id: 'ambiente', name: 'Ambiente e Energia', title: 'Ministro do Ambiente e Energia', weight: 6, areas: ['ambiente', 'energia'] },
  { id: 'agricultura', name: 'Agricultura e Mar', title: 'Ministro da Agricultura e Mar', weight: 5, areas: ['agricultura'] },
  { id: 'cultura', name: 'Cultura, Juventude e Desporto', title: 'Ministro da Cultura, Juventude e Desporto', weight: 4, areas: ['cultura'] },
  { id: 'reforma_estado', name: 'Reforma do Estado', title: 'Ministro Adjunto e da Reforma do Estado', weight: 4, areas: ['instituicoes'] },
  { id: 'parlamentares', name: 'Assuntos Parlamentares', title: 'Ministro dos Assuntos Parlamentares', weight: 5, areas: ['instituicoes'] },
];

export const AREA_TO_MINISTRY = {
  economia: 'economia', impostos: 'financas', trabalho: 'trabalho', saude: 'saude', educacao: 'educacao', habitacao: 'infraestruturas',
  seguranca: 'administracao_interna', justica: 'justica', imigracao: 'administracao_interna', ambiente: 'ambiente', energia: 'ambiente',
  transportes: 'infraestruturas', social: 'trabalho', defesa: 'defesa', externa: 'estrangeiros', cultura: 'cultura', agricultura: 'agricultura',
  instituicoes: 'presidencia', costumes: 'justica', regioes: 'economia',
};

// Defaults do "governo-sombra" para os partidos reais (ministério -> pessoa)
export const DEFAULT_CABINETS = {
  ad: { financas: 'sarmento', estrangeiros: 'rangel', presidencia: 'leitaoamaro', economia: 'castroalmeida', defesa: 'melo', administracao_interna: 'joaoalmeida', justica: 'ritajudice', saude: 'anapaulamartins', educacao: 'fernandoalexandre', trabalho: 'palmaramalho', infraestruturas: 'pintoluz', ambiente: 'gracacarvalho', agricultura: 'josemanuelfernandes', cultura: 'balseirolopes', parlamentares: 'abreuamorim' },
  ps: { financas: 'medina', presidencia: 'mvs', estrangeiros: 'assis', economia: 'brilhantedias', infraestruturas: 'pns', justica: 'delgadoalves', trabalho: 'mendesgodinho', ambiente: 'duartecordeiro', parlamentares: 'acmendes' },
  ch: { administracao_interna: 'pedropinto', saude: 'pedrofrazao', financas: 'ruipaulosousa', estrangeiros: 'pachecoamorim', cultura: 'ritamatias', trabalho: 'martasilva' },
  il: { economia: 'guimaraespinto', financas: 'bernardoblanco', saude: 'amorimlopes', presidencia: 'rocha' },
  livre: { infraestruturas: 'isabelmendeslopes', ambiente: 'jorgepinto', justica: 'paulomuacho' },
  cdu: { trabalho: 'paulasantos', justica: 'antoniofilipe', cultura: 'alfredomaia' },
  be: { financas: 'mortagua', infraestruturas: 'fabianfigueiredo', educacao: 'joanamortagua' },
};

// Comissões parlamentares permanentes (XVII Legislatura, aproximado)
export const COMMITTEES = [
  { id: 'cacdlg', name: 'Assuntos Constitucionais, Direitos, Liberdades e Garantias', short: '1.ª Comissão', areas: ['justica', 'instituicoes', 'costumes', 'seguranca', 'imigracao'], prestige: 10 },
  { id: 'cnecp', name: 'Negócios Estrangeiros e Comunidades Portuguesas', short: '2.ª Comissão', areas: ['externa'], prestige: 7 },
  { id: 'cdn', name: 'Defesa Nacional', short: '3.ª Comissão', areas: ['defesa'], prestige: 6 },
  { id: 'cae', name: 'Assuntos Europeus', short: '4.ª Comissão', areas: ['externa'], prestige: 5 },
  { id: 'cofap', name: 'Orçamento, Finanças e Administração Pública', short: '5.ª Comissão', areas: ['impostos', 'economia'], prestige: 10 },
  { id: 'cect', name: 'Economia e Coesão Territorial', short: '6.ª Comissão', areas: ['economia', 'regioes'], prestige: 7 },
  { id: 'cec', name: 'Educação e Ciência', short: '7.ª Comissão', areas: ['educacao'], prestige: 7 },
  { id: 'cs', name: 'Saúde', short: '9.ª Comissão', areas: ['saude'], prestige: 8 },
  { id: 'ctssi', name: 'Trabalho, Segurança Social e Inclusão', short: '10.ª Comissão', areas: ['trabalho', 'social'], prestige: 7 },
  { id: 'cae2', name: 'Ambiente e Energia', short: '11.ª Comissão', areas: ['ambiente', 'energia'], prestige: 6 },
  { id: 'ccjd', name: 'Cultura, Comunicação, Juventude e Desporto', short: '12.ª Comissão', areas: ['cultura'], prestige: 4 },
  { id: 'cimh', name: 'Infraestruturas, Mobilidade e Habitação', short: '6.ª-B Comissão', areas: ['habitacao', 'transportes'], prestige: 8 },
  { id: 'cap', name: 'Agricultura e Pescas', short: '8.ª Comissão', areas: ['agricultura'], prestige: 4 },
  { id: 'cplot', name: 'Poder Local e Ordenamento do Território', short: '13.ª Comissão', areas: ['regioes'], prestige: 4 },
  { id: 'cret', name: 'Reforma do Estado e Transparência', short: '14.ª Comissão', areas: ['instituicoes'], prestige: 6 },
];

// Grupos sociais do eleitorado (para satisfação e efeitos de políticas)
export const GROUPS = [
  { id: 'pensionistas', name: 'Pensionistas', icon: '👴', weight: 0.24 },
  { id: 'jovens', name: 'Jovens e estudantes', icon: '🎓', weight: 0.13 },
  { id: 'trabalhadores', name: 'Trabalhadores do privado', icon: '👷', weight: 0.2 },
  { id: 'funcpublicos', name: 'Funcionários públicos', icon: '🏛️', weight: 0.08 },
  { id: 'empresarios', name: 'Empresários e PME', icon: '💼', weight: 0.06 },
  { id: 'agricultores', name: 'Agricultores e pescadores', icon: '🌾', weight: 0.04 },
  { id: 'classe_media', name: 'Classe média urbana', icon: '🏙️', weight: 0.12 },
  { id: 'professores', name: 'Professores', icon: '📚', weight: 0.03 },
  { id: 'saude', name: 'Profissionais de saúde', icon: '🩺', weight: 0.03 },
  { id: 'seguranca', name: 'Forças de segurança', icon: '🚓', weight: 0.02 },
  { id: 'interior', name: 'Populações do interior', icon: '🏞️', weight: 0.05 },
  { id: 'imigrantes', name: 'Comunidades imigrantes', icon: '🌍', weight: 0.0 },
];
