/**
 * HTML entity encoder / decoder.
 *
 * Two encode modes:
 *   - **minimal** — escapes only `& < > " '` (the SGML-five). Idempotent
 *     and suitable for safe inline-HTML embedding of user input.
 *   - **extended** — adds Latin-1 Supplement, currency, math, dashes,
 *     curly quotes, and a few archaic-but-frequent symbols. Useful when
 *     you want a shareable representation of pasted content (Markdown
 *     paste-safe, email subject lines, RSS).
 *
 * Decode is one mode: it understands every entity from `extended`, the
 * five aliases (`apos`, `AMP`, etc.), AND numeric forms — decimal
 * (`&#65;`) and hexadecimal (`&#x41;` / `&#X41;`).
 *
 * Anything outside the table is left intact rather than mangled — better
 * to surface "I don't know that entity" than to silently corrupt input.
 */

import { DECODE_MAP, EXTENDED_ENCODE, MINIMAL_ENCODE } from './entities';

export type EncodeVariant = 'minimal' | 'extended';

/** Escape characters per the chosen variant. Idempotent only for `minimal`. */
export function encode(input: string, variant: EncodeVariant = 'minimal'): string {
  const table = variant === 'extended' ? EXTENDED_ENCODE : MINIMAL_ENCODE;
  let out = '';
  for (const ch of input) {
    out += table[ch] ?? ch;
  }
  return out;
}

/** Decode named + numeric entities. Lossless on round-trip with `encode`. */
export function decode(input: string): string {
  // Match: &<name>; OR &#<digits>; OR &#x<hex>;
  return input.replace(
    /&(?:#(x?)([0-9a-f]+)|([a-z][a-z0-9]+));/gi,
    (match: string, x: string | undefined, num: string | undefined, name: string | undefined) => {
      if (num !== undefined) {
        const codepoint = parseInt(num, x ? 16 : 10);
        if (!Number.isFinite(codepoint) || codepoint < 0 || codepoint > 0x10ffff) {
          return match;
        }
        try {
          return String.fromCodePoint(codepoint);
        } catch {
          return match;
        }
      }
      if (name !== undefined) {
        const ch = DECODE_MAP[name];
        return ch ?? match;
      }
      return match;
    },
  );
}

/** True when `input` is byte-for-byte identical after a round-trip
 *  encode → decode under the given variant. Used in tests; surfaced as a
 *  property the UI can verify. */
export function roundTripsCleanly(input: string, variant: EncodeVariant): boolean {
  return decode(encode(input, variant)) === input;
}

/** Counts entities found in a string, useful for surfacing a "decoded N
 *  entities" hint to the user. Matches the same pattern as `decode`. */
export function countEntities(input: string): number {
  const matches = input.match(/&(?:#x?[0-9a-f]+|[a-z][a-z0-9]+);/gi);
  return matches ? matches.length : 0;
}
