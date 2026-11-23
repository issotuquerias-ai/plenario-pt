// "IA offline" — gerador procedimental de logótipos de partidos (SVG vetorial).
import { RNG } from '../core/rng.js';
import { esc, mixColor, luminance } from '../core/util.js';

// Símbolos desenhados numa caixa 100×100; c = cor principal, k = cor secundária
const S = {
  estrela: (c) => `<path fill="${c}" d="M50 6l12.4 27.6 30.1 3.2-22.6 20.1 6.5 29.6L50 71.3 23.6 86.5l6.5-29.6L7.5 36.8l30.1-3.2z"/>`,
  rosa: (c, k) => `<g fill="${c}"><circle cx="50" cy="38" r="16"/><circle cx="34" cy="48" r="13"/><circle cx="66" cy="48" r="13"/><circle cx="42" cy="62" r="12"/><circle cx="58" cy="62" r="12"/></g><circle cx="50" cy="50" r="7" fill="${k}"/><path d="M50 72v24" stroke="${c}" stroke-width="5" stroke-linecap="round"/><path d="M50 86c-8-2-12-8-12-12 6 1 10 5 12 12z" fill="${c}"/>`,
  punho: (c) => `<path fill="${c}" d="M30 44c0-6 4-9 8-9s6 2 7 4c1-3 3-5 7-5s6 2 7 5c1-2 3-4 6-4 4 0 7 3 7 7v18c0 14-9 26-24 26h-4C35 86 30 76 30 64z"/><rect x="36" y="84" width="28" height="12" rx="3" fill="${c}"/>`,
  pomba: (c) => `<path fill="${c}" d="M8 52c14-2 24 2 32 10 4-14 14-30 34-36-6 10-8 18-6 26 8-6 16-8 26-6-10 6-16 14-20 24-6 14-22 20-38 16-10-2-18-8-22-14 6 0 12-2 16-6-8 0-16-6-22-14z"/>`,
  chama: (c, k) => `<path fill="${c}" d="M50 4c4 18 26 26 26 50 0 18-12 32-26 32S24 72 24 54c0-12 8-20 12-26 2 10 6 14 10 16-2-16 0-30 4-40z"/><path fill="${k}" d="M50 44c2 10 14 14 14 26 0 9-6 15-14 15s-14-6-14-15c0-6 4-10 6-12 1 5 3 7 5 8-1-8 1-15 3-22z"/>`,
  folha: (c, k) => `<path fill="${c}" d="M84 10C40 10 14 34 14 66c0 8 2 16 6 22 6-22 22-40 44-50-18 14-30 30-36 52 6 2 12 4 20 4 32 0 48-34 36-84z"/><path d="M20 88C30 60 46 46 64 38" stroke="${k}" stroke-width="2.5" fill="none" opacity=".5"/>`,
  arvore: (c, k) => `<circle cx="50" cy="36" r="26" fill="${c}"/><circle cx="30" cy="50" r="16" fill="${c}"/><circle cx="70" cy="50" r="16" fill="${c}"/><rect x="45" y="56" width="10" height="36" rx="3" fill="${k}"/>`,
  sol: (c) => `<circle cx="50" cy="50" r="20" fill="${c}"/>${Array.from({ length: 12 }, (_, i) => { const a = i * Math.PI / 6; return `<path d="M${50 + Math.cos(a) * 27} ${50 + Math.sin(a) * 27}L${50 + Math.cos(a) * 44} ${50 + Math.sin(a) * 44}" stroke="${c}" stroke-width="6" stroke-linecap="round"/>`; }).join('')}`,
  coracao: (c) => `<path fill="${c}" d="M50 88S10 62 10 36c0-14 10-24 22-24 8 0 14 4 18 10 4-6 10-10 18-10 12 0 22 10 22 24 0 26-40 52-40 52z"/>`,
  seta: (c) => `<path fill="${c}" d="M14 78l40-40H34V22h48v48H66V50L26 90z"/>`,
  ondas: (c, k) => `<path d="M6 40c11-10 22-10 33 0s22 10 33 0 22-10 22-10" stroke="${c}" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M6 62c11-10 22-10 33 0s22 10 33 0 22-10 22-10" stroke="${k}" stroke-width="9" fill="none" stroke-linecap="round"/>`,
  pessoas: (c, k) => `<circle cx="30" cy="34" r="10" fill="${k}"/><circle cx="70" cy="34" r="10" fill="${k}"/><circle cx="50" cy="26" r="12" fill="${c}"/><path d="M14 80c0-14 7-24 16-24s16 10 16 24z" fill="${k}"/><path d="M54 80c0-14 7-24 16-24s16 10 16 24z" fill="${k}"/><path d="M30 86c0-20 9-34 20-34s20 14 20 34z" fill="${c}"/>`,
  esfera: (c, k) => `<circle cx="50" cy="50" r="38" fill="none" stroke="${c}" stroke-width="5"/><ellipse cx="50" cy="50" rx="38" ry="14" fill="none" stroke="${c}" stroke-width="4" transform="rotate(-25 50 50)"/><ellipse cx="50" cy="50" rx="14" ry="38" fill="none" stroke="${c}" stroke-width="4"/><path d="M12 50h76" stroke="${k}" stroke-width="4"/><circle cx="50" cy="50" r="6" fill="${k}"/>`,
  caravela: (c, k) => `<path fill="${c}" d="M14 66h72l-10 16H24z"/><path d="M48 14v52" stroke="${c}" stroke-width="4"/><path fill="${k}" d="M50 18c14 6 20 16 20 28-6-4-12-6-20-6zM46 22c-12 6-18 14-18 26 6-4 12-6 18-6z"/><path d="M42 44h16v6H42z" fill="${c}"/><path d="M8 90c10-4 20-4 28 0s20 4 28 0 20-4 28 0" stroke="${c}" stroke-width="4" fill="none"/>`,
  castelo: (c) => `<path fill="${c}" d="M14 90V42h10v8h8v-8h10v8h16v-8h10v8h8v-8h10v48H58V68c0-5-4-8-8-8s-8 3-8 8v22z"/><path fill="${c}" d="M38 40V22h8v6h8v-6h8v18z"/>`,
  escudo: (c, k) => `<path fill="${c}" d="M50 6l38 12v28c0 24-16 40-38 48C28 86 12 70 12 46V18z"/><path fill="${k}" d="M50 18l26 8v20c0 16-10 28-26 34-16-6-26-18-26-34V26z" opacity=".9"/><circle cx="50" cy="48" r="10" fill="${c}"/>`,
  farol: (c, k) => `<path fill="${c}" d="M40 30h20l6 60H34z"/><rect x="38" y="18" width="24" height="12" rx="2" fill="${k}"/><path d="M50 8l10 10H40z" fill="${c}"/><path d="M38 50h24v8H38zM36 70h28v8H36z" fill="${k}"/><path d="M62 22L94 12v20zM38 22L6 12v20z" fill="${k}" opacity=".35"/>`,
  espiga: (c) => `<path d="M50 94V20" stroke="${c}" stroke-width="4"/>${[0, 1, 2, 3, 4].map(i => `<ellipse cx="40" cy="${26 + i * 12}" rx="9" ry="5" transform="rotate(-35 40 ${26 + i * 12})" fill="${c}"/><ellipse cx="60" cy="${26 + i * 12}" rx="9" ry="5" transform="rotate(35 60 ${26 + i * 12})" fill="${c}"/>`).join('')}<ellipse cx="50" cy="14" rx="5" ry="9" fill="${c}"/>`,
  engrenagem: (c, k) => `<g fill="${c}">${Array.from({ length: 8 }, (_, i) => `<rect x="44" y="6" width="12" height="18" rx="2" transform="rotate(${i * 45} 50 50)"/>`).join('')}<circle cx="50" cy="50" r="30"/></g><circle cx="50" cy="50" r="13" fill="${k}"/>`,
  asas: (c, k) => `<path fill="${c}" d="M50 60C36 40 18 34 4 36c8 4 12 10 14 16-6-2-10-2-14 0 10 4 16 10 20 16 8 6 18 6 26-8z"/><path fill="${c}" d="M50 60c14-20 32-26 46-24-8 4-12 10-14 16 6-2 10-2 14 0-10 4-16 10-20 16-8 6-18 6-26-8z"/><circle cx="50" cy="56" r="8" fill="${k}"/>`,
  pata: (c) => `<g fill="${c}"><ellipse cx="50" cy="66" rx="20" ry="17"/><ellipse cx="26" cy="44" rx="9" ry="12"/><ellipse cx="42" cy="30" rx="9" ry="12"/><ellipse cx="58" cy="30" rx="9" ry="12"/><ellipse cx="74" cy="44" rx="9" ry="12"/></g>`,
  montanha: (c, k) => `<path fill="${c}" d="M4 88L36 30l18 30 10-14 32 42z"/><path fill="${k}" d="M36 30l8 14-8-4-6 6z"/>`,
  rosa_ventos: (c, k) => `<path fill="${c}" d="M50 4l8 38 38 8-38 8-8 38-8-38-38-8 38-8z"/><path fill="${k}" d="M50 26l5 19 19 5-19 5-5 19-5-19-19-5 19-5z"/>`,
  raio: (c) => `<path fill="${c}" d="M58 4L20 56h24l-8 40 40-56H52z"/>`,
  balanca: (c) => `<path d="M50 12v70M22 26h56M30 84h40" stroke="${c}" stroke-width="5" stroke-linecap="round"/><path d="M22 26L10 54h24zM78 26L66 54h24z" fill="none" stroke="${c}" stroke-width="4"/><path d="M8 54a14 8 0 0 0 28 0zM64 54a14 8 0 0 0 28 0z" fill="${c}"/>`,
  livro: (c, k) => `<path fill="${c}" d="M8 24c14-6 28-6 40 4v62c-12-10-26-10-40-4z"/><path fill="${k}" d="M92 24c-14-6-28-6-40 4v62c12-10 26-10 40-4z"/>`,
  maos: (c, k) => `<circle cx="50" cy="50" r="38" fill="none" stroke="${c}" stroke-width="8" stroke-dasharray="18 6"/><circle cx="50" cy="50" r="18" fill="${k}"/>`,
  coroa: (c, k) => `<path fill="${c}" d="M12 76L6 30l24 18 20-30 20 30 24-18-6 46z"/><rect x="12" y="78" width="76" height="10" rx="2" fill="${c}"/><circle cx="50" cy="56" r="6" fill="${k}"/>`,
  cravo: (c, k) => `<path d="M50 96V46" stroke="${k}" stroke-width="5"/><path d="M50 70c10-2 16-8 18-16-10 0-16 6-18 16z" fill="${k}"/><path fill="${c}" d="M30 30c4-14 14-22 20-22s16 8 20 22c-4-2-8-2-10 2-2-6-6-8-10-8s-8 2-10 8c-2-4-6-4-10-2z"/><path fill="${c}" d="M28 32c6 6 14 10 22 10s16-4 22-10c0 10-10 18-22 18S28 42 28 32z"/>`,
  circulos: (c, k) => `<circle cx="38" cy="50" r="26" fill="${c}" opacity=".9"/><circle cx="62" cy="50" r="26" fill="${k}" opacity=".85"/>`,
};

export const LOGO_SYMBOLS = [
  { id: 'estrela', label: 'Estrela', fam: ['socialista', 'comunista', 'populista_esquerda', 'liberal'] }, { id: 'rosa', label: 'Rosa', fam: ['socialdemocrata', 'socialista'] },
  { id: 'punho', label: 'Punho', fam: ['socialista', 'comunista', 'populista_esquerda'] }, { id: 'pomba', label: 'Pomba', fam: ['centrista', 'democrata_cristao', 'socialdemocrata'] },
  { id: 'chama', label: 'Chama', fam: ['populista_direita', 'antissistema', 'conservador'] }, { id: 'folha', label: 'Folha', fam: ['ecologista', 'animalista'] },
  { id: 'arvore', label: 'Árvore', fam: ['ecologista', 'regionalista'] }, { id: 'sol', label: 'Sol', fam: ['socialdemocrata', 'ecologista', 'centrista'] },
  { id: 'coracao', label: 'Coração', fam: ['animalista', 'democrata_cristao'] }, { id: 'seta', label: 'Seta', fam: ['liberal', 'tecnocrata', 'centrista'] },
  { id: 'ondas', label: 'Ondas', fam: ['ecologista', 'regionalista'] }, { id: 'pessoas', label: 'Pessoas', fam: ['centrista', 'antissistema', 'socialdemocrata'] },
  { id: 'esfera', label: 'Esfera armilar', fam: ['conservador', 'populista_direita', 'monarquico', 'centrista'] }, { id: 'caravela', label: 'Caravela', fam: ['conservador', 'populista_direita', 'monarquico'] },
  { id: 'castelo', label: 'Castelo', fam: ['conservador', 'monarquico', 'regionalista'] }, { id: 'escudo', label: 'Escudo', fam: ['conservador', 'populista_direita', 'monarquico'] },
  { id: 'farol', label: 'Farol', fam: ['centrista', 'tecnocrata', 'liberal'] }, { id: 'espiga', label: 'Espiga', fam: ['regionalista', 'comunista', 'democrata_cristao'] },
  { id: 'engrenagem', label: 'Engrenagem', fam: ['comunista', 'tecnocrata', 'socialista'] }, { id: 'asas', label: 'Asas', fam: ['liberal', 'populista_direita'] },
  { id: 'pata', label: 'Pata', fam: ['animalista'] }, { id: 'montanha', label: 'Montanha', fam: ['regionalista', 'ecologista'] },
  { id: 'rosa_ventos', label: 'Rosa dos ventos', fam: ['liberal', 'tecnocrata', 'centrista'] }, { id: 'raio', label: 'Raio', fam: ['antissistema', 'populista_esquerda', 'tecnocrata'] },
  { id: 'balanca', label: 'Balança', fam: ['centrista', 'democrata_cristao'] }, { id: 'livro', label: 'Livro', fam: ['tecnocrata', 'socialdemocrata'] },
  { id: 'maos', label: 'Círculo unido', fam: ['socialdemocrata', 'centrista'] }, { id: 'coroa', label: 'Coroa', fam: ['monarquico'] },
  { id: 'cravo', label: 'Cravo', fam: ['socialista', 'comunista', 'socialdemocrata'] }, { id: 'circulos', label: 'Círculos', fam: ['tecnocrata', 'liberal', 'centrista'] },
];
export const LOGO_LAYOUTS = [
  { id: 'empilhado', label: 'Símbolo + sigla' }, { id: 'circulo', label: 'Emblema circular' }, { id: 'lateral', label: 'Horizontal' },
  { id: 'quadrado', label: 'Bloco de cor' }, { id: 'escudo', label: 'Brasão' }, { id: 'monograma', label: 'Monograma' },
];
export const LOGO_FONTS = [
  { id: 'black', label: 'Moderna forte', css: "'Arial Black','Segoe UI Black',Arial,sans-serif", weight: 900 },
  { id: 'serif', label: 'Clássica', css: "Georgia,'Times New Roman',serif", weight: 700 },
  { id: 'impact', label: 'Impacto', css: "Impact,'Arial Narrow Bold',sans-serif", weight: 400 },
  { id: 'clean', label: 'Limpa', css: "'Segoe UI',Verdana,sans-serif", weight: 700 },
  { id: 'round', label: 'Arredondada', css: "'Trebuchet MS','Segoe UI',sans-serif", weight: 700 },
];

function sym(id, c, k, x, y, size) {
  const f = S[id] || S.estrela;
  const s = size / 100;
  return `<g transform="translate(${x} ${y}) scale(${s})">${f(c, k)}</g>`;
}

export function logoSVG(o) {
  const short = (o.short || 'NP').slice(0, 6);
  const c = o.color || '#1d4ed8', k = o.color2 || '#f59e0b';
  const font = LOGO_FONTS.find(f => f.id === o.font) || LOGO_FONTS[0];
  const fs = short.length <= 2 ? 92 : short.length <= 3 ? 78 : short.length <= 4 ? 62 : 50;
  const txt = (x, y, size, fill, extra = '') => `<text x="${x}" y="${y}" font-family="${font.css}" font-weight="${font.weight}" font-size="${size}" fill="${fill}" text-anchor="middle" dominant-baseline="middle" letter-spacing="${font.id === 'impact' ? 2 : 0}" ${extra}>${esc(short)}</text>`;
  const onC = luminance(c) > 0.6 ? '#111827' : '#ffffff';
  const kOnC = luminance(k) > 0.85 && onC === '#ffffff' ? k : (luminance(mixColor(k, c, 0)) < 0.2 ? '#ffffff' : k);
  const name = o.name ? `<text x="150" y="282" font-family="'Segoe UI',Arial,sans-serif" font-size="15" font-weight="600" fill="#334155" text-anchor="middle">${esc(o.name.length > 34 ? o.name.slice(0, 33) + '…' : o.name)}</text>` : '';
  let body = '';
  switch (o.layout) {
    case 'circulo':
      body = `<circle cx="150" cy="140" r="122" fill="${c}"/><circle cx="150" cy="140" r="110" fill="none" stroke="${k}" stroke-width="5"/>${sym(o.symbol, kOnC, onC, 98, 40, 104)}${txt(150, 196, fs * 0.82, onC)}`;
      break;
    case 'lateral':
      body = `${sym(o.symbol, c, k, 14, 88, 104)}${`<text x="128" y="142" font-family="${font.css}" font-weight="${font.weight}" font-size="${fs * 1.05}" fill="${c}" dominant-baseline="middle">${esc(short)}</text>`}<rect x="130" y="186" width="${Math.min(150, short.length * 34)}" height="8" rx="4" fill="${k}"/>`;
      break;
    case 'quadrado':
      body = `<rect x="28" y="18" width="244" height="244" rx="36" fill="${c}"/>${sym(o.symbol, kOnC, onC, 95, 34, 110)}${txt(150, 204, fs * 0.9, onC)}`;
      break;
    case 'escudo':
      body = `<path d="M150 14l112 30v80c0 70-48 116-112 140C86 240 38 194 38 124V44z" fill="${c}"/><path d="M150 32l94 25v67c0 58-40 98-94 118-54-20-94-60-94-118V57z" fill="none" stroke="${k}" stroke-width="5"/>${sym(o.symbol, kOnC, onC, 108, 50, 84)}${txt(150, 180, fs * 0.72, onC)}`;
      break;
    case 'monograma':
      body = `${txt(150, 150, fs * 1.75, c)}${sym(o.symbol, k, c, 205, 30, 70)}<rect x="40" y="232" width="220" height="10" rx="5" fill="${k}"/>`;
      break;
    default: // empilhado
      body = `${sym(o.symbol, c, k, 85, 16, 130)}${txt(150, 204, fs, c)}<rect x="${150 - Math.min(110, short.length * 26)}" y="244" width="${Math.min(220, short.length * 52)}" height="7" rx="3.5" fill="${k}"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300">${body}${o.showName ? name : ''}</svg>`;
}

// Sugestões variadas coerentes com a família ideológica
export function suggestLogos(base, n = 8, seed = Date.now()) {
  const r = new RNG(seed);
  const fam = base.family || 'centrista';
  const pref = LOGO_SYMBOLS.filter(s => s.fam.includes(fam)).map(s => s.id);
  const all = LOGO_SYMBOLS.map(s => s.id);
  const out = [];
  for (let i = 0; i < n; i++) {
    const symbol = pref.length && r.chance(0.7) ? r.pick(pref) : r.pick(all);
    out.push({ ...base, symbol, layout: r.pick(LOGO_LAYOUTS).id, font: r.pick(LOGO_FONTS).id, seed: r.int(1, 1e9) });
  }
  return out;
}

export function svgToDataURL(svg) {
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

export function rasterizeSVG(svg, size = 256) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => { const cv = document.createElement('canvas'); cv.width = cv.height = size; const g = cv.getContext('2d'); g.drawImage(img, 0, 0, size, size); resolve(cv.toDataURL('image/png')); };
    img.onerror = reject;
    img.src = svgToDataURL(svg);
  });
}
