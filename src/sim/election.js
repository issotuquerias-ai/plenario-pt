// Eleições: método de D'Hondt por círculo, simulação do dia eleitoral e projeções.
import { DISTRICTS } from '../data/districts.js';
import { districtShares, nationalShares } from './electorate.js';
import { rng } from '../core/rng.js';
import { clamp } from '../core/util.js';

export function dhondt(votes, seats, exclude = ['out']) {
  const entries = Object.entries(votes).filter(([p, v]) => v > 0 && !exclude.includes(p));
  const res = {}; entries.forEach(([p]) => (res[p] = 0));
  const quotients = [];
  for (let s = 0; s < seats; s++) {
    let best = null, bq = -1;
    for (const [p, v] of entries) {
      const q = v / (res[p] + 1);
      if (q > bq || (q === bq && best && v > votes[best])) { bq = q; best = p; }
    }
    if (!best) break;
    res[best]++;
    quotients.push({ party: best, q: bq, seat: s + 1 });
  }
  return { seats: res, quotients };
}

// Projeção determinística de mandatos (sem ruído) a partir do estado atual
export function projectSeats(G) {
  const seats = {}; const { shares, byDistrict } = nationalShares(G);
  for (const d of DISTRICTS) {
    const s = byDistrict[d.id];
    const votes = {}; for (const p in s) votes[p] = s[p] * 1e6;
    const r = dhondt(votes, d.seats).seats;
    for (const p in r) seats[p] = (seats[p] || 0) + r[p];
  }
  return { seats, shares };
}

// Simula a eleição completa (com erro de sondagem e ruído local)
export function simulateElection(G, opts = {}) {
  const natNoise = {};
  for (const id of G.partyIds) natNoise[id] = rng.gauss(0, opts.natSd ?? 0.07);
  const byDistrict = {};
  const natVotes = {}; let registered = 0, voters = 0, valid = 0;
  const mob = G.campaign?.mobilization || {};
  for (const d of DISTRICTS) {
    const noise = {};
    for (const id of G.partyIds) noise[id] = natNoise[id] + rng.gauss(0, opts.locSd ?? 0.05);
    const shares = districtShares(G, d.id, { noise });
    const turnout = clamp(d.turnout + (G.turnoutShift || 0) + (mob[d.id] || 0) + rng.gauss(0, d.abroad ? 1.2 : 1.6), 6, 90);
    const v = Math.round(d.registered * turnout / 100);
    const bn = clamp(d.blankNull + rng.gauss(0, 0.35), 1, 45);
    const val = Math.round(v * (1 - bn / 100));
    const votes = {};
    for (const p in shares) { votes[p] = Math.round(val * shares[p]); natVotes[p] = (natVotes[p] || 0) + votes[p]; }
    const { seats, quotients } = dhondt(votes, d.seats);
    const pct = {}; for (const p in votes) pct[p] = (votes[p] / v) * 100; // % sobre votantes (como no apuramento oficial)
    byDistrict[d.id] = { votes, pct, seats, quotients, turnout, voters: v, valid: val, blankNull: bn, registered: d.registered };
    registered += d.registered; voters += v; valid += val;
  }
  const seats = {};
  for (const did in byDistrict) for (const p in byDistrict[did].seats) seats[p] = (seats[p] || 0) + byDistrict[did].seats[p];
  const pct = {}; for (const p in natVotes) pct[p] = (natVotes[p] / voters) * 100;
  const order = Object.keys(seats).filter(p => seats[p] > 0).sort((a, b) => seats[b] - seats[a] || natVotes[b] - natVotes[a]);
  const byVotes = Object.keys(natVotes).filter(p => p !== 'out').sort((a, b) => natVotes[b] - natVotes[a]);
  return {
    date: G.electionDate, byDistrict, national: { votes: natVotes, pct, seats }, registered, voters, valid,
    turnout: (voters / registered) * 100, order, winner: byVotes[0], mostSeats: order[0],
  };
}

// Sondagem à boca das urnas: intervalos à volta do resultado real
export function exitPoll(result, rngLocal = rng) {
  const out = {};
  for (const p of Object.keys(result.national.pct)) {
    if (p === 'out') continue;
    const real = result.national.pct[p];
    if (real < 0.8) continue;
    const center = real + rngLocal.gauss(0, Math.max(0.4, real * 0.035));
    const half = Math.max(1, real * 0.09);
    const sCenter = (result.national.seats[p] || 0) + Math.round(rngLocal.gauss(0, Math.max(1, (result.national.seats[p] || 0) * 0.05)));
    const sHalf = Math.max(1, Math.round((result.national.seats[p] || 0) * 0.08) + 1);
    out[p] = { pctMin: Math.max(0, center - half), pctMax: center + half, seatsMin: Math.max(0, sCenter - sHalf), seatsMax: sCenter + sHalf };
  }
  return out;
}
