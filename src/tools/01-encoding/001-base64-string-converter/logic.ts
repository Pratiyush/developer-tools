/**
 * UTF-8-safe Base64 encoding/decoding with optional URL-safe variant.
 *
 * Why not raw `btoa` / `atob`?
 *   `btoa` only handles Latin-1 — `btoa("日本語")` throws. We round-trip
 *   through `TextEncoder` / `TextDecoder` so any UTF-8 string (CJK, emoji,
 *   accented Latin) survives encode → decode unchanged.
 *
 * URL-safe variant (RFC 4648 §5):
 *   - `+` → `-`, `/` → `_`
 *   - padding (`=`) stripped
 *   Common in JWT segments and URL fragments.
 */

export interface Base64Options {
  /** Use the URL-safe alphabet. Default false. */
  readonly makeUrlSafe?: boolean;
}

const STANDARD_ALPHABET = /^[A-Za-z0-9+/]*={0,2}$/;
const URL_SAFE_ALPHABET = /^[A-Za-z0-9_-]*={0,2}$/;
const DATA_URI_PREFIX = /^data:[^;]*;base64,/;

/**
 * Encode a UTF-8 string to Base64.
 *
 * @example
 *   textToBase64("Hello")              // "SGVsbG8="
 *   textToBase64("日本語")              // "5pel5pys6Kqe"
 *   textToBase64("subjects?ids[]=1", { makeUrlSafe: true })
 *     // "c3ViamVjdHM_aWRzW109MQ"
 */
export function textToBase64(input: string, options: Base64Options = {}): string {
  if (input === '') return '';
  const bytes = new TextEncoder().encode(input);
  // String.fromCharCode applied to a byte array gives a Latin-1 binary string
  // suitable for btoa.
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  const standard = btoa(binary);
  if (!options.makeUrlSafe) return standard;
  return standard.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Decode a Base64 string back to UTF-8 text.
 *
 * Accepts a leading `data:...;base64,` prefix (stripped) and trims whitespace.
 * URL-safe input is accepted when `makeUrlSafe` is true.
 *
 * @throws {Error} `'Incorrect base64 string'` if the input is not valid Base64
 *                 in the requested alphabet.
 *
 * @example
 *   base64ToText("SGVsbG8=")           // "Hello"
 *   base64ToText("5pel5pys6Kqe")       // "日本語"
 *   base64ToText("c3ViamVjdHM_aWRzW109MQ", { makeUrlSafe: true })
 *     // "subjects?ids[]=1"
 */
export function base64ToText(input: string, options: Base64Options = {}): string {
  const cleaned = stripDataUriPrefix(input).trim();
  if (cleaned === '') return '';
  if (!isValidBase64(cleaned, options)) {
    throw new Error('Incorrect base64 string');
  }
  const standard = options.makeUrlSafe ? toStandardAlphabet(cleaned) : cleaned;
  let binary: string;
  try {
    binary = atob(standard);
  } catch {
    throw new Error('Incorrect base64 string');
  }
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  // `fatal: true` rejects malformed UTF-8 (overlong sequences, lone surrogates).
  return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
}

/**
 * Validate that a string is well-formed Base64 in the requested alphabet.
 *
 * Strict: an empty string is valid (vacuous), whitespace is ignored, but the
 * decoded bytes must round-trip back to the same Base64 input (modulo
 * padding for URL-safe).
 *
 * @example
 *   isValidBase64("SGVsbG8=")                          // true
 *   isValidBase64("c3ViamVjdHM_aWRzW109MQ", { makeUrlSafe: true })  // true
 *   isValidBase64("not_base64!!!")                     // false
 */
export function isValidBase64(input: string, options: Base64Options = {}): boolean {
  const cleaned = stripDataUriPrefix(input).trim().replace(/\s+/g, '');
  if (cleaned === '') return true;

  const alphabet = options.makeUrlSafe ? URL_SAFE_ALPHABET : STANDARD_ALPHABET;
  if (!alphabet.test(cleaned)) return false;

  // URL-safe mode strips padding; pad it back to a multiple of 4 for atob.
  const standard = options.makeUrlSafe ? toStandardAlphabet(cleaned) : cleaned;
  // Standard alphabet without padding is a fail; padded base64 must be
  // a length that's a multiple of 4 with at most two trailing `=`.
  if (standard.length % 4 !== 0) return false;
  try {
    const decoded = atob(standard);
    // Round-trip: decode and re-encode; should match cleaned (without padding
    // for URL-safe; with padding for standard).
    const reEncoded = btoa(decoded);
    if (options.makeUrlSafe) {
      const reUrlSafe = reEncoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      return reUrlSafe === cleaned;
    }
    return reEncoded === cleaned;
  } catch {
    return false;
  }
}

function stripDataUriPrefix(input: string): string {
  return input.replace(DATA_URI_PREFIX, '');
}

function toStandardAlphabet(urlSafe: string): string {
  const replaced = urlSafe.replace(/-/g, '+').replace(/_/g, '/');
  // Add `=` padding back to a multiple of 4 length.
  const padding = (4 - (replaced.length % 4)) % 4;
  return replaced + '='.repeat(padding);
}
