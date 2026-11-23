// Eixos ideológicos, distâncias, rótulos e famílias políticas.
import { clamp } from '../core/util.js';

export const AXES = ['econ', 'social', 'sistema'];
export const AXIS_INFO = {
  econ: { name: 'Economia', left: 'Esquerda (Estado forte)', right: 'Direita (mercado livre)' },
  social: { name: 'Sociedade', left: 'Progressista', right: 'Conservador' },
  sistema: { name: 'Sistema', left: 'Institucional / moderado', right: 'Antissistema / populista' },
};
const W = { econ: 1, social: 0.9, sistema: 0.75 };

export function dist2(a, b, w = W) {
  return w.econ * (a.econ - b.econ) ** 2 + w.social * (a.social - b.social) ** 2 + w.sistema * (a.sistema - b.sistema) ** 2;
}
export const dist = (a, b, w) => Math.sqrt(dist2(a, b, w));

// Distância normalizada 0..1 (0 = idêntico)
export const ndist = (a, b) => clamp(dist(a, b) / 24, 0, 1);

export function spectrumScore(ideo) { return ideo.econ * 0.6 + ideo.social * 0.4 + (ideo.sistema > 5 && ideo.social > 4 ? 1.5 : 0); }
export function spectrumLabel(ideo) {
  const x = spectrumScore(ideo);
  if (x <= -7) return 'Extrema-esquerda';
  if (x <= -4) return 'Esquerda';
  if (x <= -1.5) return 'Centro-esquerda';
  if (x < 1.5) return 'Centro';
  if (x < 4) return 'Centro-direita';
  if (x < 7) return 'Direita';
  return 'Direita radical';
}

const FAMILY_BY_PARTY = { ad: 'centro_direita', ps: 'centro_esquerda', ch: 'direita_populista', il: 'direita_liberal', livre: 'ecologista', cdu: 'esquerda', be: 'esquerda', pan: 'ecologista', jpp: 'centro_esquerda', adn: 'direita_populista', volt: 'ecologista', rir: 'centro_esquerda', mrpp: 'esquerda', nd: 'direita_populista' };
export const FAMILIES = ['esquerda', 'centro_esquerda', 'centro_direita', 'direita_liberal', 'direita_populista', 'ecologista'];
export const FAMILY_LABELS = { esquerda: 'Esquerda', centro_esquerda: 'Centro-esquerda', centro_direita: 'Centro-direita', direita_liberal: 'Direita liberal', direita_populista: 'Direita populista', ecologista: 'Ecologista' };

export function familyOf(ideo, partyId) {
  if (partyId && FAMILY_BY_PARTY[partyId]) return FAMILY_BY_PARTY[partyId];
  if (!ideo) return 'centro_esquerda';
  if (ideo.sistema >= 5 && ideo.social >= 3) return 'direita_populista';
  if (ideo.econ <= -6) return 'esquerda';
  if (ideo.social <= -5 && ideo.econ < 1) return 'ecologista';
  if (ideo.econ >= 5) return 'direita_liberal';
  if (ideo.econ >= 0.8) return 'centro_direita';
  return 'centro_esquerda';
}

// Predefinições para a criação de partidos
export const FAMILY_PRESETS = [
  { id: 'socialdemocrata', label: 'Social-democrata', icon: '🌹', ideology: { econ: -2, social: -2, sistema: -5 }, desc: 'Economia social de mercado, Estado social forte, moderação.' },
  { id: 'socialista', label: 'Socialista democrático', icon: '✊', ideology: { econ: -6, social: -5, sistema: -1 }, desc: 'Serviços públicos, redistribuição, direitos laborais.' },
  { id: 'comunista', label: 'Comunista', icon: '☭', ideology: { econ: -9.5, social: -1, sistema: 4 }, desc: 'Controlo público da economia, luta de classes, soberania.' },
  { id: 'ecologista', label: 'Ecologista', icon: '🌿', ideology: { econ: -4, social: -7, sistema: -1 }, desc: 'Clima, natureza e justiça social em primeiro lugar.' },
  { id: 'animalista', label: 'Animalista', icon: '🐾', ideology: { econ: -2, social: -6, sistema: 0 }, desc: 'Direitos dos animais e proteção ambiental.' },
  { id: 'centrista', label: 'Centrista', icon: '⚖️', ideology: { econ: 0.5, social: 0, sistema: -4 }, desc: 'Pragmatismo, consensos e reformas graduais.' },
  { id: 'liberal', label: 'Liberal', icon: '🗽', ideology: { econ: 7.5, social: -4, sistema: -1 }, desc: 'Mercado livre, menos impostos, liberdades individuais.' },
  { id: 'democrata_cristao', label: 'Democrata-cristão', icon: '✝️', ideology: { econ: 2.5, social: 5, sistema: -4 }, desc: 'Família, subsidiariedade, economia social de mercado.' },
  { id: 'conservador', label: 'Conservador', icon: '🏛️', ideology: { econ: 4.5, social: 6.5, sistema: -2 }, desc: 'Tradição, ordem, responsabilidade orçamental.' },
  { id: 'populista_direita', label: 'Populista de direita', icon: '📣', ideology: { econ: 3, social: 7.5, sistema: 8.5 }, desc: 'Contra as elites, segurança, controlo da imigração.' },
  { id: 'populista_esquerda', label: 'Populista de esquerda', icon: '📢', ideology: { econ: -7, social: -2, sistema: 7.5 }, desc: 'Contra as elites económicas, justiça social radical.' },
  { id: 'antissistema', label: 'Movimento de protesto', icon: '🔥', ideology: { econ: 0, social: 1, sistema: 9 }, desc: 'Transversal, contra os partidos tradicionais.' },
  { id: 'regionalista', label: 'Regionalista', icon: '🗺️', ideology: { econ: -0.5, social: 0.5, sistema: 3 }, desc: 'Descentralização, interior e regiões primeiro.' },
  { id: 'tecnocrata', label: 'Tecnocrata / reformista', icon: '🔬', ideology: { econ: 2, social: -3, sistema: -6 }, desc: 'Decisões baseadas em evidência, modernização do Estado.' },
  { id: 'monarquico', label: 'Monárquico', icon: '👑', ideology: { econ: 2, social: 6, sistema: 3 }, desc: 'Restauração da monarquia constitucional e tradição.' },
];
