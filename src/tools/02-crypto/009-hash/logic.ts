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
  const buf = await crypto.subtle.digest(algo, cloneToArrayBuffer(bytes));
  return toHex(new Uint8Array(buf));
}

/** Hash a Uint8Array. Used by the file path. */
export async function hashBytes(bytes: Uint8Array, algo: Algorithm): Promise<string> {
  const buf = await crypto.subtle.digest(algo, cloneToArrayBuffer(bytes));
  return toHex(new Uint8Array(buf));
}

/** Defensive copy: matches the project-wide idiom established in tools
 *  027/030/035/JWT-verify. Returns a fresh Uint8Array so SubtleCrypto
 *  cannot read past view bounds (e.g. on a `subarray`-derived view) and
 *  so Node 20's stricter realm-aware ArrayBuffer check accepts the input. */
function cloneToArrayBuffer(view: Uint8Array): Uint8Array<ArrayBuffer> {
  const out = new Uint8Array(view.byteLength);
  out.set(view);
  return out;
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
