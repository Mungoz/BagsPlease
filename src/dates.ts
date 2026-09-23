// Dates are stored as integer day numbers (days since 1970-01-01 UTC) to keep comparisons trivial.
export type DayNum = number;

const MS = 86400000;
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

export function mkDate(y: number, m: number, d: number): DayNum {
  return Math.round(Date.UTC(y, m - 1, d) / MS);
}

function parts(n: DayNum) {
  const dt = new Date(n * MS);
  return { y: dt.getUTCFullYear(), m: dt.getUTCMonth() + 1, d: dt.getUTCDate(), wd: dt.getUTCDay() };
}

export function fmtDate(n: DayNum): string {
  const p = parts(n);
  return `${String(p.d).padStart(2, '0')} ${MONTHS[p.m - 1]} ${p.y}`;
}

export function fmtShort(n: DayNum): string {
  const p = parts(n);
  return `${WEEKDAYS[p.wd]} ${p.d} ${MONTHS[p.m - 1]}`;
}

export function fmtNumeric(n: DayNum): string {
  const p = parts(n);
  return `${String(p.d).padStart(2, '0')}.${String(p.m).padStart(2, '0')}.${p.y}`;
}

export function weekday(n: DayNum): string {
  return WEEKDAYS[parts(n).wd];
}

export function yearOf(n: DayNum): number {
  return parts(n).y;
}

/** Whole years between dob and date. */
export function ageOn(dob: DayNum, on: DayNum): number {
  const a = parts(dob);
  const b = parts(on);
  let age = b.y - a.y;
  if (b.m < a.m || (b.m === a.m && b.d < a.d)) age--;
  return age;
}

/** A date `years` years before `on`, offset by `days`. */
export function yearsBefore(on: DayNum, years: number, days = 0): DayNum {
  const p = parts(on);
  return mkDate(p.y - years, p.m, p.d) - days;
}
