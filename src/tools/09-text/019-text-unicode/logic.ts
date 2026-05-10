/**
 * Per-codepoint Unicode inspector. For each Unicode scalar value in the
 * input, returns its codepoint, hex, and a normalised name guess (we don't
 * ship the full UCD — just a category hint).
 */

export interface CodepointInfo {
  readonly char: string;
  readonly codepoint: number;
  readonly hex: string; // U+XXXX
  readonly utf8: string; // hex bytes joined with " "
  readonly utf16: string; // hex code units joined with " "
  readonly category: string; // letter, digit, punct, …
}

export function inspect(input: string): readonly CodepointInfo[] {
  const out: CodepointInfo[] = [];
  for (const ch of input) {
    const cp = ch.codePointAt(0) ?? 0;
    out.push({
      char: ch,
      codepoint: cp,
      hex: 'U+' + cp.toString(16).toUpperCase().padStart(4, '0'),
      utf8: utf8Hex(ch),
      utf16: utf16Hex(ch),
      category: categorise(ch),
    });
  }
  return out;
}

function utf8Hex(ch: string): string {
  const bytes = new TextEncoder().encode(ch);
  const out: string[] = [];
  for (const b of bytes) {
    out.push(b.toString(16).toUpperCase().padStart(2, '0'));
  }
  return out.join(' ');
}

function utf16Hex(ch: string): string {
  const out: string[] = [];
  for (let i = 0; i < ch.length; i++) {
    out.push(ch.charCodeAt(i).toString(16).toUpperCase().padStart(4, '0'));
  }
  return out.join(' ');
}

function categorise(ch: string): string {
  if (/\p{L}/u.test(ch)) return 'letter';
  if (/\p{N}/u.test(ch)) return 'digit';
  if (/\p{P}/u.test(ch)) return 'punctuation';
  if (/\p{Z}/u.test(ch)) return 'separator';
  if (/\p{S}/u.test(ch)) return 'symbol';
  if (/\p{C}/u.test(ch)) return 'control';
  if (/\p{M}/u.test(ch)) return 'mark';
  return 'other';
}
