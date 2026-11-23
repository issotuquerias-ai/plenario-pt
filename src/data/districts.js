// Os 22 círculos eleitorais da Assembleia da República (mandatos e resultados das legislativas de 18 de maio de 2025).
// Fonte dos resultados: MAI / SGMAI (resultados globais 2025). Percentagens sobre votantes (inclui brancos e nulos).
// r2025: [AD, CH, PS, IL, L, CDU, BE, PAN, JPP] (null = não concorreu)
// lean: inclinação ideológica média do eleitorado do círculo (eixos econ/social/sistema), usada pelo modelo de eleitorado.

const ORDER = ['ad', 'ch', 'ps', 'il', 'livre', 'cdu', 'be', 'pan', 'jpp'];

const RAW = [
  { id: 'acores', name: 'Açores', capital: 'Ponta Delgada', towns: ['Ponta Delgada', 'Angra do Heroísmo', 'Horta', 'Ribeira Grande'], style: 'ilhas', seats: 5, registered: 228000, turnout: 47, age65: 17, urban: 0.5, income: 0.84, issues: ['Transportes aéreos', 'Pescas', 'Custo de vida insular'], lean: { econ: 0.5, social: 1.0, sistema: -0.5 }, r2025: [36.6, 22.9, 23.6, 3.5, 2.5, 1.2, 2.1, 1.3, 0.3] },
  { id: 'aveiro', name: 'Aveiro', capital: 'Aveiro', towns: ['Aveiro', 'Santa Maria da Feira', 'Ovar', 'Águeda', 'Oliveira de Azeméis'], style: 'centro', seats: 16, registered: 662000, turnout: 66, age65: 23, urban: 0.6, income: 0.95, issues: ['Indústria exportadora', 'Ria de Aveiro', 'Ferrovia'], lean: { econ: 1.5, social: 1.0, sistema: 0 }, r2025: [39.5, 20.7, 21.7, 5.7, 3.1, 1.2, 1.7, 1.2, null] },
  { id: 'beja', name: 'Beja', capital: 'Beja', towns: ['Beja', 'Moura', 'Serpa', 'Odemira'], style: 'alentejo', seats: 3, registered: 124000, turnout: 59, age65: 27, urban: 0.3, income: 0.82, issues: ['Seca e regadio do Alqueva', 'Despovoamento', 'Aeroporto de Beja'], lean: { econ: -3.0, social: 0.5, sistema: 1.5 }, r2025: [20.9, 27.7, 26.5, 2.0, 2.1, 13.6, 1.9, 0.9, null] },
  { id: 'braga', name: 'Braga', capital: 'Braga', towns: ['Braga', 'Guimarães', 'Barcelos', 'Vila Nova de Famalicão'], style: 'norte', seats: 19, registered: 785000, turnout: 66, age65: 19, urban: 0.6, income: 0.88, issues: ['Indústria têxtil', 'Habitação', 'Ferrovia de alta velocidade'], lean: { econ: 1.0, social: 1.5, sistema: 0 }, r2025: [36.3, 22.0, 23.0, 6.7, 3.1, 1.7, 1.8, 1.0, 0.1] },
  { id: 'braganca', name: 'Bragança', capital: 'Bragança', towns: ['Bragança', 'Mirandela', 'Macedo de Cavaleiros', 'Miranda do Douro'], style: 'interior_norte', seats: 3, registered: 125000, turnout: 55, age65: 30, urban: 0.2, income: 0.78, issues: ['Despovoamento', 'Saúde no interior', 'Acessibilidades'], lean: { econ: 1.0, social: 3.0, sistema: 0 }, r2025: [43.7, 20.4, 25.4, 2.2, 1.1, 1.0, 0.8, 0.7, null] },
  { id: 'castelo-branco', name: 'Castelo Branco', capital: 'Castelo Branco', towns: ['Castelo Branco', 'Covilhã', 'Fundão', 'Sertã'], style: 'interior_centro', seats: 4, registered: 166000, turnout: 60, age65: 29, urban: 0.35, income: 0.8, issues: ['Incêndios florestais', 'Despovoamento', 'Portagens na A23'], lean: { econ: -0.5, social: 1.5, sistema: 0.5 }, r2025: [32.3, 23.4, 28.6, 3.0, 2.6, 2.1, 1.7, 0.9, null] },
  { id: 'coimbra', name: 'Coimbra', capital: 'Coimbra', towns: ['Coimbra', 'Figueira da Foz', 'Cantanhede', 'Lousã'], style: 'centro', seats: 9, registered: 372000, turnout: 64, age65: 26, urban: 0.55, income: 0.92, issues: ['Saúde (CHUC)', 'Ensino superior', 'Metro Mondego'], lean: { econ: -0.5, social: 0, sistema: -0.5 }, r2025: [34.4, 18.4, 27.4, 4.4, 4.1, 2.5, 2.2, 1.2, 0.1] },
  { id: 'evora', name: 'Évora', capital: 'Évora', towns: ['Évora', 'Montemor-o-Novo', 'Estremoz', 'Vendas Novas'], style: 'alentejo', seats: 3, registered: 126000, turnout: 62, age65: 26, urban: 0.35, income: 0.86, issues: ['Hospital Central do Alentejo', 'Agricultura', 'Despovoamento'], lean: { econ: -2.5, social: 0, sistema: 0.5 }, r2025: [24.8, 24.8, 27.8, 2.8, 2.7, 10.2, 1.8, 0.9, null] },
  { id: 'faro', name: 'Faro', capital: 'Faro', towns: ['Faro', 'Portimão', 'Loulé', 'Albufeira', 'Tavira'], style: 'algarve', seats: 9, registered: 381000, turnout: 56, age65: 22, urban: 0.6, income: 0.9, issues: ['Seca', 'Turismo e sazonalidade', 'Habitação', 'Saúde'], lean: { econ: 0.5, social: 1.0, sistema: 2.0 }, r2025: [25.7, 33.9, 20.5, 4.4, 3.4, 2.7, 2.6, 1.8, 0.1] },
  { id: 'guarda', name: 'Guarda', capital: 'Guarda', towns: ['Guarda', 'Seia', 'Gouveia', 'Pinhel'], style: 'interior_centro', seats: 3, registered: 125000, turnout: 58, age65: 31, urban: 0.25, income: 0.78, issues: ['Despovoamento', 'Portagens na A25', 'Saúde no interior'], lean: { econ: 1.0, social: 2.0, sistema: 0 }, r2025: [39.6, 21.1, 26.4, 2.4, 1.5, 1.3, 1.2, 0.7, null] },
  { id: 'leiria', name: 'Leiria', capital: 'Leiria', towns: ['Leiria', 'Caldas da Rainha', 'Pombal', 'Marinha Grande', 'Nazaré'], style: 'centro', seats: 10, registered: 412000, turnout: 64, age65: 24, urban: 0.5, income: 0.92, issues: ['Indústria dos moldes e vidro', 'Linha do Oeste', 'Pinhal de Leiria'], lean: { econ: 1.5, social: 1.0, sistema: 0.5 }, r2025: [37.1, 23.1, 19.0, 6.0, 3.5, 2.1, 1.9, 1.2, null] },
  { id: 'lisboa', name: 'Lisboa', capital: 'Lisboa', towns: ['Lisboa', 'Sintra', 'Amadora', 'Cascais', 'Loures', 'Oeiras', 'Odivelas'], style: 'lisboa', seats: 48, registered: 1985000, turnout: 63, age65: 22, urban: 0.95, income: 1.25, issues: ['Habitação', 'Transportes', 'Imigração', 'Custo de vida'], lean: { econ: -0.5, social: -2.0, sistema: 0 }, r2025: [28.5, 20.9, 23.6, 7.6, 6.9, 3.6, 2.4, 1.85, 0.1] },
  { id: 'madeira', name: 'Madeira', capital: 'Funchal', towns: ['Funchal', 'Câmara de Lobos', 'Santa Cruz', 'Machico'], style: 'ilhas', seats: 6, registered: 255000, turnout: 55, age65: 18, urban: 0.6, income: 0.85, issues: ['Autonomia', 'Subsídio de mobilidade', 'Custo de vida insular'], lean: { econ: 1.0, social: 2.0, sistema: 0.5 }, r2025: [41.4, 20.9, 13.5, 2.6, 1.3, 1.3, 1.4, 1.0, 12.3] },
  { id: 'portalegre', name: 'Portalegre', capital: 'Portalegre', towns: ['Portalegre', 'Elvas', 'Ponte de Sor', 'Campo Maior'], style: 'alentejo', seats: 2, registered: 86000, turnout: 60, age65: 30, urban: 0.25, income: 0.8, issues: ['Despovoamento', 'Saúde', 'Agricultura'], lean: { econ: -2.0, social: 1.0, sistema: 1.5 }, r2025: [26.8, 29.9, 28.0, 1.9, 1.7, 5.2, 1.3, 0.7, null] },
  { id: 'porto', name: 'Porto', capital: 'Porto', towns: ['Porto', 'Vila Nova de Gaia', 'Matosinhos', 'Gondomar', 'Maia', 'Penafiel'], style: 'porto', seats: 40, registered: 1652000, turnout: 66, age65: 21, urban: 0.85, income: 1.0, issues: ['Habitação', 'Metro do Porto', 'Indústria', 'Saúde'], lean: { econ: 0, social: 0, sistema: 0 }, r2025: [34.2, 20.7, 24.0, 6.1, 4.3, 2.3, 2.0, 1.5, 0.1] },
  { id: 'santarem', name: 'Santarém', capital: 'Santarém', towns: ['Santarém', 'Tomar', 'Torres Novas', 'Ourém', 'Abrantes'], style: 'ribatejo', seats: 9, registered: 370000, turnout: 62, age65: 26, urban: 0.4, income: 0.88, issues: ['Agricultura', 'Rio Tejo', 'Indústria'], lean: { econ: 0, social: 1.5, sistema: 1.5 }, r2025: [30.6, 28.1, 22.8, 3.9, 3.2, 3.6, 1.8, 1.1, null] },
  { id: 'setubal', name: 'Setúbal', capital: 'Setúbal', towns: ['Setúbal', 'Almada', 'Seixal', 'Barreiro', 'Montijo'], style: 'setubal', seats: 19, registered: 783000, turnout: 62, age65: 21, urban: 0.8, income: 0.95, issues: ['Indústria (Autoeuropa)', 'Habitação', 'Transportes fluviais', 'Segurança'], lean: { econ: -2.0, social: -0.5, sistema: 1.0 }, r2025: [21.0, 26.4, 25.0, 5.5, 5.8, 7.1, 2.7, 1.9, 0.1] },
  { id: 'viana', name: 'Viana do Castelo', capital: 'Viana do Castelo', towns: ['Viana do Castelo', 'Ponte de Lima', 'Arcos de Valdevez', 'Caminha'], style: 'norte', seats: 5, registered: 220000, turnout: 58, age65: 27, urban: 0.35, income: 0.82, issues: ['Emigração', 'Indústria naval', 'Turismo rural'], lean: { econ: 1.5, social: 2.0, sistema: 0 }, r2025: [39.6, 23.0, 21.7, 3.8, 2.6, 2.0, 1.6, 0.9, null] },
  { id: 'vila-real', name: 'Vila Real', capital: 'Vila Real', towns: ['Vila Real', 'Chaves', 'Peso da Régua', 'Valpaços'], style: 'interior_norte', seats: 5, registered: 210000, turnout: 57, age65: 28, urban: 0.3, income: 0.78, issues: ['Douro vinhateiro', 'Despovoamento', 'Saúde'], lean: { econ: 1.5, social: 2.5, sistema: 0 }, r2025: [44.4, 20.0, 24.6, 2.2, 1.5, 1.2, 1.0, 0.7, null] },
  { id: 'viseu', name: 'Viseu', capital: 'Viseu', towns: ['Viseu', 'Lamego', 'Tondela', 'Mangualde'], style: 'interior_centro', seats: 8, registered: 332000, turnout: 61, age65: 27, urban: 0.4, income: 0.82, issues: ['Sem comboio', 'Incêndios', 'Agricultura'], lean: { econ: 2.0, social: 2.5, sistema: 0 }, r2025: [42.7, 22.1, 21.9, 3.1, 2.1, 1.2, 1.2, null, null] },
  { id: 'europa', name: 'Europa', capital: 'Paris', towns: ['Paris', 'Genebra', 'Luxemburgo', 'Londres'], style: 'emigracao', seats: 2, registered: 950000, turnout: 21, age65: 20, urban: 0.9, income: 1.1, issues: ['Consulados', 'Voto postal', 'Ensino do português'], lean: { econ: 1.0, social: 2.0, sistema: 2.5 }, abroad: true, blankNull: 28, r2025: [14.7, 28.2, 13.5, 2.5, 2.2, 0.9, 1.9, 1.6, 0.2] },
  { id: 'fora', name: 'Fora da Europa', capital: 'São Paulo', towns: ['São Paulo', 'Rio de Janeiro', 'Toronto', 'Joanesburgo', 'Newark'], style: 'emigracao', seats: 2, registered: 700000, turnout: 14, age65: 24, urban: 0.9, income: 1.0, issues: ['Consulados', 'Dupla nacionalidade', 'Segurança'], lean: { econ: 1.5, social: 2.0, sistema: 2.0 }, abroad: true, blankNull: 33, r2025: [19.6, 20.8, 13.5, 2.1, 1.0, 0.6, 1.8, 2.1, 0.2] },
];

// Fatores de distribuição dos partidos sem assento (percentagem nacional ≈ 2025) por círculo.
const MINOR = {
  adn: { base: 1.4, f: d => (d.abroad ? 1.4 : d.style === 'lisboa' ? 0.9 : 1.0) },
  volt: { base: 0.4, f: d => (d.id === 'lisboa' ? 2.2 : d.id === 'porto' ? 1.5 : d.abroad ? 1.6 : 0.6) },
  rir: { base: 0.4, f: d => (d.abroad ? 0.5 : 1.0) },
  mrpp: { base: 0.25, f: d => (d.style === 'setubal' || d.style === 'alentejo' ? 1.4 : 1.0) },
  nd: { base: 0.25, f: d => (d.abroad ? 1.4 : 1.0) },
};

export const DISTRICTS = RAW.map(d => {
  const results = {};
  ORDER.forEach((pid, i) => { if (d.r2025[i] != null) results[pid] = d.r2025[i]; });
  const blankNull = d.blankNull ?? 2.8;
  for (const [pid, m] of Object.entries(MINOR)) results[pid] = +(m.base * m.f(d)).toFixed(2);
  const used = Object.values(results).reduce((s, x) => s + x, 0);
  results.out = Math.max(0.4, +(100 - used - blankNull).toFixed(2));
  return { ...d, blankNull, results2025: results };
});

export const DISTRICT_BY_ID = Object.fromEntries(DISTRICTS.map(d => [d.id, d]));
export const TOTAL_SEATS = DISTRICTS.reduce((s, d) => s + d.seats, 0); // 230
export const MAJORITY = 116;
export const TWO_THIRDS = 154;

// Resultados nacionais oficiais de 2025 (percentagem e mandatos).
export const NATIONAL_2025 = {
  ad: { pct: 31.8, seats: 91 }, ch: { pct: 22.8, seats: 60 }, ps: { pct: 22.8, seats: 58 }, il: { pct: 5.4, seats: 9 },
  livre: { pct: 4.1, seats: 6 }, cdu: { pct: 2.9, seats: 3 }, be: { pct: 2.0, seats: 1 }, pan: { pct: 1.4, seats: 1 }, jpp: { pct: 0.3, seats: 1 },
  adn: { pct: 1.4, seats: 0 }, volt: { pct: 0.4, seats: 0 }, rir: { pct: 0.4, seats: 0 }, mrpp: { pct: 0.2, seats: 0 }, nd: { pct: 0.2, seats: 0 },
};
export const TURNOUT_2025 = 58.3;
