/**
 * ULID generator. ULID = Universally Unique Lexicographically Sortable
 * Identifier (https://github.com/ulid/spec).
 *
 * 26 characters, Crockford's base32:
 *   - First 10 chars  = 48-bit timestamp (ms since UNIX epoch)
 *   - Last 16 chars   = 80 random bits
 *
 * Sorts lexicographically in time order (a major reason to pick it over
 * UUID v4 for index keys). Generated locally via `crypto.getRandomValues`.
 */

const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'; // Crockford base32
const TIME_LEN = 10;
const RAND_LEN = 16;

export function generateUlid(now: number = Date.now()): string {
  return encodeTime(now) + encodeRandom();
}

export function generateUlids(count: number): readonly string[] {
  if (!Number.isInteger(count) || count < 1) return [];
  const out: string[] = [];
  for (let i = 0; i < count; i++) out.push(generateUlid());
  return out;
}

/** Validate a ULID — 26 chars, all from the Crockford base32 alphabet. */
export function isValidUlid(input: string): boolean {
  return /^[0-9A-HJKMNP-TV-Z]{26}$/.test(input.trim().toUpperCase());
}

/**
 * Decode the timestamp half of a ULID into a UNIX-ms number. Returns null
 * if the input doesn't validate.
 */
export function decodeTimestamp(ulid: string): number | null {
  if (!isValidUlid(ulid)) return null;
  const upper = ulid.toUpperCase();
  let ms = 0;
  for (let i = 0; i < TIME_LEN; i++) {
    const idx = ALPHABET.indexOf(upper[i] ?? '');
    if (idx < 0) return null;
    ms = ms * 32 + idx;
  }
  return ms;
}

/* ─── internals ─────────────────────────────────────────────────────── */

function encodeTime(now: number): string {
  let n = Math.floor(now);
  let out = '';
  for (let i = 0; i < TIME_LEN; i++) {
    out = (ALPHABET[n % 32] ?? '0') + out;
    n = Math.floor(n / 32);
  }
  return out;
}

function encodeRandom(): string {
  const bytes = new Uint8Array(RAND_LEN);
  if (typeof crypto !== 'undefined') crypto.getRandomValues(bytes);
  let out = '';
  for (let i = 0; i < RAND_LEN; i++) {
    // Each byte spans 8 bits; we fold to 5-bit alphabet indices by
    // sampling the byte modulo 32. Slight non-uniformity (256 % 32 == 0,
    // so this is actually exactly uniform).
    out += ALPHABET[(bytes[i] ?? 0) & 0x1f];
  }
  return out;
}
