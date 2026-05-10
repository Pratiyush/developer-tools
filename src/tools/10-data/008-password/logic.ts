/**
 * Password generator + entropy meter.
 *
 * Pulls bytes from `crypto.getRandomValues` and rejects samples that fall
 * outside the multiple-of-alphabet range (avoids modulo bias). Entropy is
 * computed in Shannon bits: `length * log2(alphabetSize)`.
 */

const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const DIGITS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?/~';
const AMBIGUOUS = new Set('0OoIl1');

export interface AlphabetOptions {
  readonly upper: boolean;
  readonly lower: boolean;
  readonly digits: boolean;
  readonly symbols: boolean;
  /** When true, drop characters that look alike (0/O/o, I/l/1). */
  readonly excludeAmbiguous: boolean;
}

export function buildAlphabet(opts: AlphabetOptions): string {
  let pool = '';
  if (opts.upper) pool += UPPER;
  if (opts.lower) pool += LOWER;
  if (opts.digits) pool += DIGITS;
  if (opts.symbols) pool += SYMBOLS;
  if (opts.excludeAmbiguous) {
    pool = pool
      .split('')
      .filter((c) => !AMBIGUOUS.has(c))
      .join('');
  }
  return pool;
}

/**
 * Generate a password from `alphabet` of the given length. Uses unbiased
 * rejection sampling — never exposes the modulo bias you'd get from the
 * naive `bytes[i] % alphabet.length` trick.
 */
export function generatePassword(length: number, alphabet: string): string {
  if (length < 1) return '';
  if (alphabet.length === 0) return '';
  if (alphabet.length > 256) {
    // Defensive: 8-bit byte pool can't address > 256 symbols evenly.
    throw new Error('alphabet too large (max 256)');
  }
  const out: string[] = [];
  // Reject any byte ≥ floor(256/N)·N — the largest unbiased upper bound.
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

/** Shannon entropy of a uniform-random password drawn from `alphabet`. */
export function entropyBits(length: number, alphabet: string): number {
  if (length < 1 || alphabet.length === 0) return 0;
  return length * Math.log2(alphabet.length);
}

export type Strength = 'awful' | 'weak' | 'okay' | 'strong' | 'extreme';

/** Bin entropy into a 5-bucket strength rating. The thresholds are the
 *  industry-conventional 28/40/60/80-bit cutoffs. */
export function strengthFor(entropy: number): Strength {
  if (entropy < 28) return 'awful';
  if (entropy < 40) return 'weak';
  if (entropy < 60) return 'okay';
  if (entropy < 80) return 'strong';
  return 'extreme';
}

/**
 * Human-readable estimate of how long an offline guess attack at 1 billion
 * tries/second would take to enumerate half the keyspace. Returns a short
 * label like "~3.4×10⁹ years" or "instant". Pure cosmetic — for the meter.
 */
export function timeToCrack(entropy: number): string {
  if (entropy < 1) return 'instant';
  const seconds = Math.pow(2, entropy - 1) / 1e9;
  if (seconds < 1) return 'instant';
  if (seconds < 60) return `~${Math.round(seconds)} seconds`;
  if (seconds < 3600) return `~${Math.round(seconds / 60)} minutes`;
  if (seconds < 86_400) return `~${Math.round(seconds / 3600)} hours`;
  if (seconds < 31_536_000) return `~${Math.round(seconds / 86_400)} days`;
  const years = seconds / 31_536_000;
  if (years < 1000) return `~${Math.round(years)} years`;
  return `~${years.toExponential(1)} years`;
}
