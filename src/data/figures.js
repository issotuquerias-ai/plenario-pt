// Figuras reais da política portuguesa (2026). Fotos: Wikimedia Commons (ver assets/creditos.json).
// traits (0–100): carisma, debate, gestao, experiencia — valores de jogo, sem pretensão de avaliação real.
// home: círculo eleitoral de ligação (usado como cabeça de lista por omissão).

export const REAL_PEOPLE = [
  // Instituições
  { id: 'seguro', name: 'António José Seguro', gender: 'm', partyId: null, role: 'presidente', photo: 'seguro', traits: { carisma: 66, debate: 68, gestao: 72, experiencia: 85 } },
  { id: 'aguiarbranco', name: 'José Pedro Aguiar-Branco', gender: 'm', partyId: 'ad', role: 'par', photo: 'aguiarbranco', home: 'porto', traits: { carisma: 60, debate: 70, gestao: 72, experiencia: 90 } },

  // AD (PSD / CDS-PP)
  { id: 'montenegro', name: 'Luís Montenegro', gender: 'm', partyId: 'ad', sub: 'psd', role: 'lider', photo: 'montenegro', home: 'lisboa', traits: { carisma: 68, debate: 74, gestao: 76, experiencia: 85 } },
  { id: 'melo', name: 'Nuno Melo', gender: 'm', partyId: 'ad', sub: 'cds', role: 'figura', photo: null, home: 'braga', traits: { carisma: 62, debate: 70, gestao: 65, experiencia: 82 } },
  { id: 'hugosoares', name: 'Hugo Soares', gender: 'm', partyId: 'ad', sub: 'psd', role: 'lider_parlamentar', home: 'braga', traits: { carisma: 60, debate: 72, gestao: 62, experiencia: 75 } },
  { id: 'sarmento', name: 'Joaquim Miranda Sarmento', gender: 'm', partyId: 'ad', sub: 'psd', role: 'figura', home: 'lisboa', expertise: 'financas', traits: { carisma: 50, debate: 62, gestao: 78, experiencia: 70 } },
  { id: 'rangel', name: 'Paulo Rangel', gender: 'm', partyId: 'ad', sub: 'psd', role: 'figura', home: 'porto', expertise: 'estrangeiros', traits: { carisma: 62, debate: 78, gestao: 70, experiencia: 88 } },
  { id: 'leitaoamaro', name: 'António Leitão Amaro', gender: 'm', partyId: 'ad', sub: 'psd', role: 'figura', home: 'viseu', expertise: 'presidencia', traits: { carisma: 58, debate: 70, gestao: 70, experiencia: 70 } },
  { id: 'pintoluz', name: 'Miguel Pinto Luz', gender: 'm', partyId: 'ad', sub: 'psd', role: 'figura', home: 'lisboa', expertise: 'infraestruturas', traits: { carisma: 58, debate: 64, gestao: 70, experiencia: 72 } },
  { id: 'anapaulamartins', name: 'Ana Paula Martins', gender: 'f', partyId: 'ad', sub: 'psd', role: 'figura', home: 'lisboa', expertise: 'saude', traits: { carisma: 52, debate: 58, gestao: 68, experiencia: 70 } },
  { id: 'fernandoalexandre', name: 'Fernando Alexandre', gender: 'm', partyId: 'ad', sub: 'psd', role: 'figura', home: 'braga', expertise: 'educacao', traits: { carisma: 52, debate: 60, gestao: 72, experiencia: 65 } },
  { id: 'castroalmeida', name: 'Manuel Castro Almeida', gender: 'm', partyId: 'ad', sub: 'psd', role: 'figura', home: 'aveiro', expertise: 'economia', traits: { carisma: 50, debate: 58, gestao: 72, experiencia: 85 } },
  { id: 'palmaramalho', name: 'Maria do Rosário Palma Ramalho', gender: 'f', partyId: 'ad', sub: 'psd', role: 'figura', home: 'lisboa', expertise: 'trabalho', traits: { carisma: 48, debate: 60, gestao: 70, experiencia: 70 } },
  { id: 'gracacarvalho', name: 'Maria da Graça Carvalho', gender: 'f', partyId: 'ad', sub: 'psd', role: 'figura', home: 'lisboa', expertise: 'ambiente', traits: { carisma: 50, debate: 58, gestao: 72, experiencia: 85 } },
  { id: 'josemanuelfernandes', name: 'José Manuel Fernandes', gender: 'm', partyId: 'ad', sub: 'psd', role: 'figura', home: 'braga', expertise: 'agricultura', traits: { carisma: 50, debate: 56, gestao: 68, experiencia: 80 } },
  { id: 'balseirolopes', name: 'Margarida Balseiro Lopes', gender: 'f', partyId: 'ad', sub: 'psd', role: 'figura', home: 'leiria', expertise: 'cultura', traits: { carisma: 62, debate: 66, gestao: 64, experiencia: 65 } },
  { id: 'ritajudice', name: 'Rita Alarcão Júdice', gender: 'f', partyId: 'ad', sub: 'psd', role: 'figura', home: 'lisboa', expertise: 'justica', traits: { carisma: 50, debate: 56, gestao: 66, experiencia: 60 } },
  { id: 'abreuamorim', name: 'Carlos Abreu Amorim', gender: 'm', partyId: 'ad', sub: 'psd', role: 'figura', home: 'porto', expertise: 'parlamentares', traits: { carisma: 56, debate: 70, gestao: 60, experiencia: 75 } },
  { id: 'joaoalmeida', name: 'João Almeida', gender: 'm', partyId: 'ad', sub: 'cds', role: 'figura', home: 'aveiro', expertise: 'administracao_interna', traits: { carisma: 54, debate: 64, gestao: 60, experiencia: 78 } },

  // PS
  { id: 'carneiro', name: 'José Luís Carneiro', gender: 'm', partyId: 'ps', role: 'lider', photo: 'carneiro', home: 'porto', traits: { carisma: 62, debate: 68, gestao: 74, experiencia: 82 } },
  { id: 'pns', name: 'Pedro Nuno Santos', gender: 'm', partyId: 'ps', role: 'figura', photo: 'pns', home: 'aveiro', expertise: 'infraestruturas', traits: { carisma: 66, debate: 72, gestao: 64, experiencia: 75 } },
  { id: 'mvs', name: 'Mariana Vieira da Silva', gender: 'f', partyId: 'ps', role: 'figura', home: 'lisboa', expertise: 'presidencia', traits: { carisma: 56, debate: 68, gestao: 76, experiencia: 78 } },
  { id: 'medina', name: 'Fernando Medina', gender: 'm', partyId: 'ps', role: 'figura', home: 'lisboa', expertise: 'financas', traits: { carisma: 54, debate: 66, gestao: 74, experiencia: 82 } },
  { id: 'acmendes', name: 'Ana Catarina Mendes', gender: 'f', partyId: 'ps', role: 'figura', home: 'setubal', expertise: 'parlamentares', traits: { carisma: 56, debate: 70, gestao: 66, experiencia: 80 } },
  { id: 'brilhantedias', name: 'Eurico Brilhante Dias', gender: 'm', partyId: 'ps', role: 'lider_parlamentar', home: 'leiria', expertise: 'economia', traits: { carisma: 52, debate: 66, gestao: 66, experiencia: 72 } },
  { id: 'marinagoncalves', name: 'Marina Gonçalves', gender: 'f', partyId: 'ps', role: 'figura', home: 'viana', expertise: 'infraestruturas', traits: { carisma: 54, debate: 62, gestao: 66, experiencia: 62 } },
  { id: 'duartecordeiro', name: 'Duarte Cordeiro', gender: 'm', partyId: 'ps', role: 'figura', home: 'lisboa', expertise: 'ambiente', traits: { carisma: 54, debate: 64, gestao: 70, experiencia: 72 } },
  { id: 'delgadoalves', name: 'Pedro Delgado Alves', gender: 'm', partyId: 'ps', role: 'figura', home: 'lisboa', expertise: 'justica', traits: { carisma: 52, debate: 70, gestao: 62, experiencia: 70 } },
  { id: 'mendesgodinho', name: 'Ana Mendes Godinho', gender: 'f', partyId: 'ps', role: 'figura', home: 'guarda', expertise: 'trabalho', traits: { carisma: 54, debate: 60, gestao: 68, experiencia: 74 } },
  { id: 'assis', name: 'Francisco Assis', gender: 'm', partyId: 'ps', role: 'figura', home: 'porto', expertise: 'estrangeiros', traits: { carisma: 58, debate: 74, gestao: 62, experiencia: 85 } },

  // Chega
  { id: 'ventura', name: 'André Ventura', gender: 'm', partyId: 'ch', role: 'lider', photo: 'ventura', home: 'lisboa', traits: { carisma: 80, debate: 84, gestao: 55, experiencia: 66 } },
  { id: 'pedropinto', name: 'Pedro Pinto', gender: 'm', partyId: 'ch', role: 'lider_parlamentar', home: 'faro', expertise: 'seguranca', traits: { carisma: 52, debate: 62, gestao: 52, experiencia: 58 } },
  { id: 'ritamatias', name: 'Rita Matias', gender: 'f', partyId: 'ch', role: 'figura', home: 'setubal', expertise: 'cultura', traits: { carisma: 62, debate: 66, gestao: 48, experiencia: 48 } },
  { id: 'pedrofrazao', name: 'Pedro Frazão', gender: 'm', partyId: 'ch', role: 'figura', home: 'santarem', expertise: 'saude', traits: { carisma: 54, debate: 60, gestao: 52, experiencia: 52 } },
  { id: 'ruipaulosousa', name: 'Rui Paulo Sousa', gender: 'm', partyId: 'ch', role: 'figura', home: 'lisboa', expertise: 'financas', traits: { carisma: 50, debate: 58, gestao: 56, experiencia: 55 } },
  { id: 'pachecoamorim', name: 'Diogo Pacheco de Amorim', gender: 'm', partyId: 'ch', role: 'figura', home: 'porto', expertise: 'estrangeiros', traits: { carisma: 48, debate: 60, gestao: 52, experiencia: 70 } },
  { id: 'martasilva', name: 'Marta Silva', gender: 'f', partyId: 'ch', role: 'figura', home: 'porto', expertise: 'social', traits: { carisma: 52, debate: 58, gestao: 50, experiencia: 50 } },

  // IL
  { id: 'leitao', name: 'Mariana Leitão', gender: 'f', partyId: 'il', role: 'lider', photo: 'leitao', home: 'lisboa', traits: { carisma: 64, debate: 70, gestao: 66, experiencia: 60 } },
  { id: 'rocha', name: 'Rui Rocha', gender: 'm', partyId: 'il', role: 'figura', photo: 'rocha', home: 'braga', expertise: 'economia', traits: { carisma: 62, debate: 72, gestao: 64, experiencia: 66 } },
  { id: 'bernardoblanco', name: 'Bernardo Blanco', gender: 'm', partyId: 'il', role: 'figura', home: 'lisboa', expertise: 'financas', traits: { carisma: 56, debate: 64, gestao: 60, experiencia: 52 } },
  { id: 'guimaraespinto', name: 'Carlos Guimarães Pinto', gender: 'm', partyId: 'il', role: 'figura', home: 'porto', expertise: 'economia', traits: { carisma: 62, debate: 72, gestao: 64, experiencia: 62 } },
  { id: 'joanacordeiro', name: 'Joana Cordeiro', gender: 'f', partyId: 'il', role: 'figura', home: 'porto', expertise: 'saude', traits: { carisma: 54, debate: 60, gestao: 58, experiencia: 50 } },
  { id: 'amorimlopes', name: 'Mário Amorim Lopes', gender: 'm', partyId: 'il', role: 'figura', home: 'porto', expertise: 'saude', traits: { carisma: 52, debate: 62, gestao: 62, experiencia: 50 } },

  // Livre
  { id: 'tavares', name: 'Rui Tavares', gender: 'm', partyId: 'livre', role: 'lider', photo: 'tavares', home: 'lisboa', traits: { carisma: 66, debate: 74, gestao: 60, experiencia: 72 } },
  { id: 'isabelmendeslopes', name: 'Isabel Mendes Lopes', gender: 'f', partyId: 'livre', role: 'lider_parlamentar', home: 'lisboa', expertise: 'habitacao', traits: { carisma: 56, debate: 64, gestao: 58, experiencia: 52 } },
  { id: 'jorgepinto', name: 'Jorge Pinto', gender: 'm', partyId: 'livre', role: 'figura', home: 'porto', expertise: 'ambiente', traits: { carisma: 56, debate: 62, gestao: 56, experiencia: 52 } },
  { id: 'paulomuacho', name: 'Paulo Muacho', gender: 'm', partyId: 'livre', role: 'figura', home: 'setubal', expertise: 'justica', traits: { carisma: 50, debate: 58, gestao: 54, experiencia: 48 } },

  // CDU / PCP
  { id: 'raimundo', name: 'Paulo Raimundo', gender: 'm', partyId: 'cdu', role: 'lider', photo: 'raimundo', home: 'setubal', traits: { carisma: 58, debate: 66, gestao: 56, experiencia: 64 } },
  { id: 'paulasantos', name: 'Paula Santos', gender: 'f', partyId: 'cdu', role: 'lider_parlamentar', home: 'setubal', expertise: 'trabalho', traits: { carisma: 52, debate: 64, gestao: 56, experiencia: 66 } },
  { id: 'antoniofilipe', name: 'António Filipe', gender: 'm', partyId: 'cdu', role: 'figura', home: 'lisboa', expertise: 'justica', traits: { carisma: 52, debate: 70, gestao: 58, experiencia: 88 } },
  { id: 'alfredomaia', name: 'Alfredo Maia', gender: 'm', partyId: 'cdu', role: 'figura', home: 'porto', expertise: 'cultura', traits: { carisma: 48, debate: 58, gestao: 52, experiencia: 56 } },

  // BE
  { id: 'pureza', name: 'José Manuel Pureza', gender: 'm', partyId: 'be', role: 'lider', photo: 'pureza', home: 'coimbra', traits: { carisma: 58, debate: 70, gestao: 58, experiencia: 78 } },
  { id: 'mortagua', name: 'Mariana Mortágua', gender: 'f', partyId: 'be', role: 'figura', photo: 'mortagua', home: 'lisboa', expertise: 'financas', traits: { carisma: 64, debate: 76, gestao: 60, experiencia: 70 } },
  { id: 'fabianfigueiredo', name: 'Fabian Figueiredo', gender: 'm', partyId: 'be', role: 'figura', home: 'lisboa', expertise: 'habitacao', traits: { carisma: 54, debate: 64, gestao: 52, experiencia: 52 } },
  { id: 'joanamortagua', name: 'Joana Mortágua', gender: 'f', partyId: 'be', role: 'figura', home: 'setubal', expertise: 'educacao', traits: { carisma: 56, debate: 66, gestao: 54, experiencia: 66 } },

  // PAN
  { id: 'sousareal', name: 'Inês de Sousa Real', gender: 'f', partyId: 'pan', role: 'lider', photo: 'sousareal', home: 'lisboa', traits: { carisma: 56, debate: 62, gestao: 56, experiencia: 62 } },

  // JPP
  { id: 'elviosousa', name: 'Élvio Sousa', gender: 'm', partyId: 'jpp', role: 'lider', photo: 'elviosousa', home: 'madeira', traits: { carisma: 58, debate: 60, gestao: 58, experiencia: 62 } },
  { id: 'filipesousa', name: 'Filipe Sousa', gender: 'm', partyId: 'jpp', role: 'figura', home: 'madeira', expertise: 'coesao', traits: { carisma: 52, debate: 56, gestao: 58, experiencia: 60 } },

  // Partidos sem assento parlamentar
  { id: 'fialho', name: 'Bruno Fialho', gender: 'm', partyId: 'adn', role: 'lider', home: 'lisboa', traits: { carisma: 50, debate: 54, gestao: 45, experiencia: 45 } },
  { id: 'liber', name: 'Ossanda Líber', gender: 'f', partyId: 'nd', role: 'lider', home: 'lisboa', traits: { carisma: 56, debate: 58, gestao: 48, experiencia: 45 } },
  { id: 'volt_lider', name: 'Porta-voz do Volt', gender: 'f', partyId: 'volt', role: 'lider', home: 'lisboa', generic: true, traits: { carisma: 50, debate: 56, gestao: 52, experiencia: 40 } },
  { id: 'rir_lider', name: 'Porta-voz do RIR', gender: 'm', partyId: 'rir', role: 'lider', home: 'lisboa', generic: true, traits: { carisma: 54, debate: 50, gestao: 45, experiencia: 40 } },
  { id: 'mrpp_lider', name: 'Porta-voz do PCTP/MRPP', gender: 'm', partyId: 'mrpp', role: 'lider', home: 'lisboa', generic: true, traits: { carisma: 48, debate: 56, gestao: 40, experiencia: 50 } },
];

// Ex-líderes e figuras históricas citáveis (sem papel ativo no jogo)
export const PRESIDENT = { id: 'seguro', name: 'António José Seguro', since: '2026-03-09', termEnds: '2031-03-09', ideology: { econ: -1.5, social: -2, sistema: -7 }, activism: 0.5 };
