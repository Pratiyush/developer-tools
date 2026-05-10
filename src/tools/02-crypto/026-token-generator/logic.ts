/**
 * Token generator — like the password generator, but explicitly designed
 * for API tokens / session keys with named alphabet presets and an
 * entropy-bits target rather than a length target.
 *
 * Reuses the unbiased-rejection sampling approach from
 * `password/logic.ts` to avoid modulo bias.
 */

const ALPHABETS = {
  base64url: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_',
  hex: '0123456789abcdef',
  alnum:
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
  numeric: '0123456789',
  base58:
    '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz',
} as const;

export type Preset = keyof typeof ALPHABETS;
export const PRESETS = Object.keys(ALPHABETS) as readonly Preset[];

export function alphabetFor(preset: Preset): string {
  return ALPHABETS[preset];
}

/** Bits-of-entropy a single character contributes for a given alphabet. */
export function bitsPerChar(alphabet: string): number {
  return alphabet.length > 0 ? Math.log2(alphabet.length) : 0;
}

/** Length needed to reach `targetBits` in `alphabet`. Always rounds up. */
export function lengthForEntropy(alphabet: string, targetBits: number): number {
  const bpc = bitsPerChar(alphabet);
  if (bpc <= 0) return 0;
  return Math.ceil(targetBits / bpc);
}

/** Generate a token of `length` chars from the given alphabet. CSPRNG-backed
 *  with unbiased rejection sampling (same as password/logic). */
export function generateToken(length: number, alphabet: string): string {
  if (length < 1 || alphabet.length === 0) return '';
  if (alphabet.length > 256) throw new Error('alphabet too large (max 256)');
  const out: string[] = [];
  const cap = Math.floor(256 / alphabet.length) * alphabet.length;
  const buf = new Uint8Array(length * 2);
  while (out.length < length) {
    if (typeof crypto !== 'undefined') crypto.getRandomValues(buf);
    for (let i = 0; i < buf.length && out.length < length; i++) {
      const b = buf[i] ?? 0;
      if (b < cap) out.push(alphabet[b % alphabet.length] ?? '');
    }
  }
  return out.join('');
}

/** Total Shannon entropy for `length` characters drawn from `alphabet`. */
export function entropyBits(length: number, alphabet: string): number {
  return length * bitsPerChar(alphabet);
}
