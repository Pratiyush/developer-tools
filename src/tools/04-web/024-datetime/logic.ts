/**
 * Date/time inspector + format converter.
 *
 * Accepts ISO-8601, UNIX timestamps (seconds or milliseconds), or any
 * string `Date` understands, and emits a row of common formats.
 */

export interface ParsedDate {
  readonly date: Date;
  readonly source: 'iso' | 'unix-s' | 'unix-ms' | 'native';
}

export function parseDateInput(input: string): ParsedDate | null {
  const s = input.trim();
  if (!s) return null;
  // All-digits → unix timestamp. 10 digits = seconds, 13 = ms.
  if (/^-?\d+$/.test(s)) {
    const n = Number(s);
    if (Math.abs(n) >= 1e11) {
      const d = new Date(n);
      return Number.isFinite(d.getTime()) ? { date: d, source: 'unix-ms' } : null;
    }
    const d = new Date(n * 1000);
    return Number.isFinite(d.getTime()) ? { date: d, source: 'unix-s' } : null;
  }
  // ISO-8601 (broad pattern) → native Date. Date constructor handles most.
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return null;
  return { date: d, source: /^\d{4}-\d{2}-\d{2}/.test(s) ? 'iso' : 'native' };
}

export interface DateFormats {
  readonly iso: string;
  readonly utc: string;
  readonly local: string;
  readonly unixSeconds: string;
  readonly unixMillis: string;
  readonly rfc2822: string;
  readonly relative: string;
}

export function formatDate(d: Date, now: Date = new Date()): DateFormats {
  return {
    iso: d.toISOString(),
    utc: d.toUTCString(),
    local: d.toString(),
    unixSeconds: String(Math.floor(d.getTime() / 1000)),
    unixMillis: String(d.getTime()),
    rfc2822: d.toUTCString(), // toUTCString happens to match RFC-2822 form
    relative: relative(d, now),
  };
}

function relative(d: Date, now: Date): string {
  const ms = d.getTime() - now.getTime();
  const abs = Math.abs(ms);
  const unit = (n: number, lbl: string): string =>
    `${ms >= 0 ? 'in ' : ''}${Math.round(n)} ${lbl}${Math.round(n) === 1 ? '' : 's'}${ms < 0 ? ' ago' : ''}`;
  if (abs < 60_000) return unit(abs / 1000, 'second');
  if (abs < 3_600_000) return unit(abs / 60_000, 'minute');
  if (abs < 86_400_000) return unit(abs / 3_600_000, 'hour');
  if (abs < 30 * 86_400_000) return unit(abs / 86_400_000, 'day');
  if (abs < 365 * 86_400_000) return unit(abs / (30 * 86_400_000), 'month');
  return unit(abs / (365 * 86_400_000), 'year');
}
