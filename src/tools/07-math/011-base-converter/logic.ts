/**
 * Numeric base converter — decimal / binary / hex / octal, plus arbitrary
 * radix 2..36. Uses BigInt to handle inputs longer than 53 bits.
 */

export type Base = 2 | 8 | 10 | 16 | 36;

export const COMMON_BASES: readonly Base[] = [2, 8, 10, 16];

/** Parse `input` (with optional `0x` / `0b` / `0o` prefix) as `from` base.
 *  Returns null on parse failure. */
export function parseInBase(input: string, from: Base): bigint | null {
  let s = input.trim().toLowerCase();
  if (!s) return null;
  // Strip language-conventional prefixes when they match the base.
  if (from === 16 && s.startsWith('0x')) s = s.slice(2);
  if (from === 2 && s.startsWith('0b')) s = s.slice(2);
  if (from === 8 && s.startsWith('0o')) s = s.slice(2);
  if (s.startsWith('-')) {
    const tail = parseUnsigned(s.slice(1), from);
    return tail === null ? null : -tail;
  }
  return parseUnsigned(s, from);
}

function parseUnsigned(s: string, base: Base): bigint | null {
  if (!s) return null;
  // Reject non-digit characters for the base. BigInt() accepts only base-10
  // strings, so we walk char-by-char.
  let n = 0n;
  const b = BigInt(base);
  for (const ch of s) {
    const d = digitValue(ch);
    if (d === -1 || d >= base) return null;
    n = n * b + BigInt(d);
  }
  return n;
}

function digitValue(ch: string): number {
  const c = ch.charCodeAt(0);
  if (c >= 48 && c <= 57) return c - 48;        // 0-9
  if (c >= 97 && c <= 122) return c - 97 + 10;  // a-z
  if (c >= 65 && c <= 90) return c - 65 + 10;   // A-Z (paranoid; we lowercase)
  return -1;
}

/** Render `value` in `to` base. Negative values get a leading `-`. */
export function formatInBase(value: bigint, to: Base): string {
  if (value < 0n) return '-' + (-value).toString(to);
  return value.toString(to);
}

/** Convert directly. Returns null on parse failure. */
export function convert(input: string, from: Base, to: Base): string | null {
  const n = parseInBase(input, from);
  if (n === null) return null;
  return formatInBase(n, to);
}
