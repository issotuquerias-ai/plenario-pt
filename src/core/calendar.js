// Datas do jogo: strings 'AAAA-MM-DD' tratadas em UTC (sem problemas de fuso horário).
export const MONTHS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
export const MONTHS_SHORT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
export const WEEKDAYS = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];

export function parse(d) { const [y, m, dd] = String(d).split('-').map(Number); return new Date(Date.UTC(y, m - 1, dd)); }
export function iso(date) { return date.toISOString().slice(0, 10); }
export function addDays(d, n) { const x = parse(d); x.setUTCDate(x.getUTCDate() + n); return iso(x); }
export function addMonths(d, n) {
  const x = parse(d); const day = x.getUTCDate();
  x.setUTCDate(1); x.setUTCMonth(x.getUTCMonth() + n);
  const last = new Date(Date.UTC(x.getUTCFullYear(), x.getUTCMonth() + 1, 0)).getUTCDate();
  x.setUTCDate(Math.min(day, last)); return iso(x);
}
export function diffDays(a, b) { return Math.round((parse(b) - parse(a)) / 86400000); }
export const weekday = d => parse(d).getUTCDay();
export const year = d => parse(d).getUTCFullYear();
export const month = d => parse(d).getUTCMonth() + 1;
export const day = d => parse(d).getUTCDate();
export function longDate(d) { const x = parse(d); return `${WEEKDAYS[x.getUTCDay()]}, ${x.getUTCDate()} de ${MONTHS[x.getUTCMonth()]} de ${x.getUTCFullYear()}`; }
export function mediumDate(d) { const x = parse(d); return `${x.getUTCDate()} de ${MONTHS[x.getUTCMonth()]} de ${x.getUTCFullYear()}`; }
export function shortDate(d) { const x = parse(d); return `${x.getUTCDate()} ${MONTHS_SHORT[x.getUTCMonth()]} ${x.getUTCFullYear()}`; }
export function monthYear(d) { const x = parse(d); return `${MONTHS[x.getUTCMonth()]} de ${x.getUTCFullYear()}`; }
export function nextWeekday(d, wd) { let x = d; for (let i = 0; i < 8; i++) { if (weekday(x) === wd) return x; x = addDays(x, 1); } return x; }
export const nextSunday = d => nextWeekday(d, 0);
export const isAfter = (a, b) => parse(a) > parse(b);
export const isBefore = (a, b) => parse(a) < parse(b);
export function monthsBetween(a, b) { const A = parse(a), B = parse(b); return (B.getUTCFullYear() - A.getUTCFullYear()) * 12 + (B.getUTCMonth() - A.getUTCMonth()); }
