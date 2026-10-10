// Datas são tratadas como strings "YYYY-MM-DD" (sem fuso) para evitar
// surpresas entre o servidor (UTC) e o horário de Brasília.

const TZ = "America/Sao_Paulo";

export function todayISO() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date());
}

export function isISODate(s: string | undefined | null): s is string {
  return !!s && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));
}

function parse(s: string) {
  return new Date(`${s}T00:00:00Z`);
}

function toISO(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function addDays(s: string, n: number) {
  const d = parse(s);
  d.setUTCDate(d.getUTCDate() + n);
  return toISO(d);
}

export function daysBetween(from: string, to: string) {
  return Math.round((parse(to).getTime() - parse(from).getTime()) / 86_400_000);
}

/** Domingo da semana (domingo a sábado) que contém a data. */
export function weekStart(s: string) {
  return addDays(s, -parse(s).getUTCDay());
}

export function weekEnd(s: string) {
  return addDays(weekStart(s), 6);
}

/** "YYYY-MM" */
export function monthOf(s: string) {
  return s.slice(0, 7);
}

export function isMonth(s: string | undefined | null): s is string {
  return !!s && /^\d{4}-(0[1-9]|1[0-2])$/.test(s);
}

export function addMonths(ym: string, n: number) {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + n, 1));
  return toISO(d).slice(0, 7);
}

export function monthRange(ym: string) {
  const from = `${ym}-01`;
  const to = addDays(`${addMonths(ym, 1)}-01`, -1);
  return { from, to };
}

/** Semanas (domingo a sábado) que cobrem o mês, para o calendário. */
export function monthGrid(ym: string) {
  const { from, to } = monthRange(ym);
  const weeks: string[][] = [];
  let cur = weekStart(from);
  while (cur <= to) {
    weeks.push(Array.from({ length: 7 }, (_, i) => addDays(cur, i)));
    cur = addDays(cur, 7);
  }
  return weeks;
}

const fmt = (opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC", ...opts });

const longFmt = fmt({ weekday: "long", day: "numeric", month: "long" });
const shortFmt = fmt({ day: "2-digit", month: "2-digit" });
const monthFmt = fmt({ month: "long", year: "numeric" });

export const formatLong = (s: string) => longFmt.format(parse(s));
export const formatShort = (s: string) => shortFmt.format(parse(s));
export const formatMonth = (ym: string) => monthFmt.format(parse(`${ym}-01`));
