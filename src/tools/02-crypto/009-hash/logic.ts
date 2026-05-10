/**
 * Cryptographic hash text — wraps `crypto.subtle.digest` for the four
 * SHA-2 family algorithms WebCrypto supports out of the box.
 *
 * MD5 + SHA-1 are intentionally NOT exposed here despite being listed in
 * the v3 mock — neither is collision-resistant in 2026 and we don't want
 * anyone using this tool to choose them. SHA-256 is the lowest sensible
 * floor.
 */

export const ALGORITHMS = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'] as const;
export type Algorithm = (typeof ALGORITHMS)[number];

/** Hash `text` using `algo`. Returns lowercase hex. UTF-8 encoded input. */
export async function hashText(text: string, algo: Algorithm): Promise<string> {
  const bytes = new TextEncoder().encode(text);
  // Cast through ArrayBuffer — TextEncoder.encode() returns
  // Uint8Array<ArrayBufferLike> in modern lib.dom; SubtleCrypto wants a
  // strict ArrayBuffer view, and we know we're not using SharedArrayBuffer.
  const buf = await crypto.subtle.digest(algo, bytes.buffer);
  return toHex(new Uint8Array(buf));
}

/** Hash a Uint8Array. Used by the file path. */
export async function hashBytes(bytes: Uint8Array, algo: Algorithm): Promise<string> {
  const buf = await crypto.subtle.digest(algo, bytes.buffer as ArrayBuffer);
  return toHex(new Uint8Array(buf));
}

/** Constant-time-ish comparison of two hex strings. */
export function hexEqualsCT(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) {
    r |= (a.charCodeAt(i) ^ b.charCodeAt(i));
  }
  return r === 0;
}

function toHex(bytes: Uint8Array): string {
  let s = '';
  for (const b of bytes) {
    s += b.toString(16).padStart(2, '0');
  }
  return s;
}
