/**
 * HMAC generator. Uses WebCrypto's `crypto.subtle.sign('HMAC', ...)` with
 * the four SHA-2 family hashes the SubtleCrypto exposes. Output is hex.
 *
 * Educational note: HMAC is a keyed hash — verifying integrity *and*
 * authenticity. Use it for API request signing (AWS sigv4, Stripe events,
 * Slack webhooks, etc.).
 */

export const ALGORITHMS = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'] as const;
export type Algorithm = (typeof ALGORITHMS)[number];

export async function hmac(
  message: string,
  secret: string,
  algo: Algorithm,
): Promise<string> {
  const enc = new TextEncoder();
  // Clone to a standalone ArrayBuffer — `.buffer` on a Uint8Array view
  // exposes the whole underlying buffer (which can be longer than the
  // view), and SubtleCrypto would read past the intended bytes.
  const key = await crypto.subtle.importKey(
    'raw',
    cloneToArrayBuffer(enc.encode(secret)),
    { name: 'HMAC', hash: { name: algo } },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign(
    'HMAC',
    key,
    cloneToArrayBuffer(enc.encode(message)),
  );
  return toHex(new Uint8Array(sig));
}

/** Defensive copy: returns a fresh Uint8Array (TypedArray) so SubtleCrypto
 *  can't read past view bounds AND so Node 20's stricter realm-aware
 *  ArrayBuffer check doesn't reject the buffer. */
function cloneToArrayBuffer(view: Uint8Array): Uint8Array<ArrayBuffer> {
  const out = new Uint8Array(view.byteLength);
  out.set(view);
  return out;
}

function toHex(bytes: Uint8Array): string {
  let s = '';
  for (const b of bytes) s += b.toString(16).padStart(2, '0');
  return s;
}
