// Pessoas geradas, listas de candidatos por círculo e verificação da Lei da Paridade (Lei Orgânica n.º 1/2019).
import { FIRST_M, FIRST_F, MIDDLE_M, MIDDLE_F, SURNAMES, PROFESSIONS } from '../data/names.js';
import { DISTRICTS, DISTRICT_BY_ID } from '../data/districts.js';
import { rng } from '../core/rng.js';
import { clamp } from '../core/util.js';

let counter = 0;
export function genName(gender) {
  const first = gender === 'f' ? rng.pick(FIRST_F) : rng.pick(FIRST_M);
  const mid = rng.chance(0.35) ? ' ' + (gender === 'f' ? rng.pick(MIDDLE_F) : rng.pick(MIDDLE_M)) : '';
  let s1 = rng.pick(SURNAMES), s2 = rng.pick(SURNAMES);
  while (s2 === s1) s2 = rng.pick(SURNAMES);
  const name = rng.chance(0.6) ? `${first}${mid} ${s1} ${s2}` : `${first}${mid} ${s2}`;
  return name.replace(/\s+/g, ' ').trim();
}

export function createPerson(G, { partyId = null, gender, home = null, role = 'candidato', name, profession, traits, photo = null, age } = {}) {
  const g = gender || (rng.chance(0.5) ? 'f' : 'm');
  const id = `g${(counter++).toString(36)}${rng.int(100, 999)}`;
  const prof = profession || rng.pick(PROFESSIONS).id;
  const base = () => clamp(Math.round(rng.gauss(52, 11)), 20, 92);
  const P = { id, name: name || genName(g), gender: g, partyId, home, role, profession: prof, generated: true, age: age || rng.int(28, 68), localFame: Math.round(clamp(rng.gauss(30, 15), 0, 90)) };
  if (photo) P.photo = photo;
  if (traits || role === 'independente' || role === 'ministro') P.traits = traits || { carisma: base(), debate: base(), gestao: base(), experiencia: base() };
  G.people[id] = P;
  return id;
}

// Número de candidatos suplentes: mínimo 2, máximo 5 (lei eleitoral da AR)
export const listSize = seats => seats + Math.min(5, Math.max(2, Math.ceil(seats / 6)));

// Ordena respeitando: não mais de 2 do mesmo sexo consecutivos e ≥ 40% de cada sexo.
export function enforceParity(G, ids) {
  const people = ids.map(id => G.people[id]);
  const m = people.filter(p => p.gender === 'm'), f = people.filter(p => p.gender === 'f');
  const out = [];
  let lastTwo = [];
  const take = arr => { const p = arr.shift(); out.push(p.id); lastTwo = [...lastTwo, p.gender].slice(-2); };
  // manter o cabeça de lista
  const head = people[0]; (head.gender === 'm' ? m : f).splice((head.gender === 'm' ? m : f).indexOf(head), 1); out.push(head.id); lastTwo = [head.gender];
  while (m.length || f.length) {
    const blocked = lastTwo.length === 2 && lastTwo[0] === lastTwo[1] ? lastTwo[0] : null;
    const prefer = out.length % 2 === 1 ? (head.gender === 'm' ? 'f' : 'm') : head.gender;
    let g = prefer;
    if (g === blocked) g = g === 'm' ? 'f' : 'm';
    if ((g === 'm' && !m.length) || (g === 'f' && !f.length)) g = g === 'm' ? 'f' : 'm';
    take(g === 'm' ? m : f);
  }
  return out;
}

export function checkParity(G, ids, seats) {
  const problems = [];
  const people = ids.map(id => G.people[id]).filter(Boolean);
  if (people.length < seats) problems.push(`A lista tem ${people.length} candidatos mas o círculo elege ${seats}.`);
  const nf = people.filter(p => p.gender === 'f').length, nm = people.length - nf;
  if (people.length >= 3) {
    if (nf / people.length < 0.4) problems.push('Menos de 40% de mulheres na lista.');
    if (nm / people.length < 0.4) problems.push('Menos de 40% de homens na lista.');
  }
  for (let i = 2; i < people.length; i++) {
    if (people[i].gender === people[i - 1].gender && people[i].gender === people[i - 2].gender) { problems.push(`Três candidatos do mesmo sexo seguidos (posições ${i - 1} a ${i + 1}).`); break; }
  }
  return { ok: problems.length === 0, problems };
}

// Gera as listas de um partido para todos os círculos onde concorre.
export function generateLists(G, pid) {
  const p = G.parties[pid];
  G.lists[pid] = G.lists[pid] || {};
  const figures = Object.values(G.people).filter(x => x.partyId === pid && !x.generated && x.role !== 'par' && x.role !== 'presidente');
  const used = new Set();
  const leader = G.people[p.leaderId];
  for (const d of DISTRICTS) {
    if (!p.isCustom && d.results2025[pid] == null) continue;
    if (p.isCustom && p.districts && !p.districts.includes(d.id)) continue;
    const n = listSize(d.seats);
    const ids = [];
    // cabeça de lista
    let head = null;
    if (leader && (leader.home === d.id || (!leader.home && d.id === 'lisboa'))) head = leader.id;
    if (!head) { const f = figures.find(x => x.home === d.id && !used.has(x.id) && x.id !== p.leaderId); if (f) head = f.id; }
    if (head) { ids.push(head); used.add(head); }
    // outras figuras com ligação ao círculo
    for (const f of figures) { if (ids.length >= Math.min(n, 4)) break; if (!used.has(f.id) && f.home === d.id) { ids.push(f.id); used.add(f.id); } }
    const target = pid === G.playerPartyId ? n : Math.min(n, ids.length);
    while (ids.length < target) ids.push(createPerson(G, { partyId: pid, home: d.id, gender: ids.length % 2 === 0 ? (rng.chance(0.5) ? 'f' : 'm') : null }));
    G.lists[pid][d.id] = ids.length > 1 ? enforceParity(G, ids) : ids;
  }
}

// Fama local média dos primeiros lugares da lista (influencia a campanha local)
export function listStrength(G, pid, did) {
  const l = G.lists[pid]?.[did]; if (!l || !l.length) return 0;
  const head = G.people[l[0]];
  const fame = head ? (head.localFame ?? 40) + (head.generated ? 0 : 25) : 30;
  return clamp((fame - 40) / 100, -0.2, 0.45);
}

export function districtOfPerson(G, personId) {
  for (const pid in G.lists) for (const did in G.lists[pid]) if (G.lists[pid][did].includes(personId)) return did;
  return null;
}
export { DISTRICT_BY_ID };
