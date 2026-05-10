/**
 * JWT decoder.
 *
 * **This tool decodes only — it never verifies a signature.** Verification
 * requires the issuer's secret (HS-family) or public key (RS- / ES-family),
 * The whole point is to peek at what's inside a token; treat the result
 * as untrusted input until your server confirms it.
 *
 * A JWT is three base64url-encoded segments separated by dots:
 *
 *   `<header>.<payload>.<signature>`
 *
 * Header and payload are JSON. Signature is opaque bytes — we surface it
 * as the original base64url segment so the user can copy it. We tolerate
 * whitespace around the input and an optional `Bearer ` prefix because
 * that's how it usually arrives from a curl / Postman copy-paste.
 */

export interface JwtDecodeSuccess {
  readonly ok: true;
  readonly header: Record<string, unknown>;
  readonly payload: Record<string, unknown>;
  readonly signature: string;
  /** Pretty-printed, 2-space-indented JSON for header and payload. */
  readonly headerPretty: string;
  readonly payloadPretty: string;
}

export interface JwtDecodeFailure {
  readonly ok: false;
  readonly reason: 'shape' | 'header' | 'payload';
}

export type JwtDecodeResult = JwtDecodeSuccess | JwtDecodeFailure;

/**
 * Parse + decode a JWT string. Tolerates surrounding whitespace and a
 * leading `Bearer ` prefix. Returns `{ ok: false }` for anything that
 * doesn't shape up — never throws.
 */
export function decodeJwt(input: string): JwtDecodeResult {
  const cleaned = input.trim().replace(/^Bearer\s+/i, '').trim();
  const parts = cleaned.split('.');
  // Allow signatures that are present-but-empty (the `none` algorithm
  // produces `header.payload.` — three parts, third empty).
  if (parts.length !== 3) return { ok: false, reason: 'shape' };
  const [headerSeg = '', payloadSeg = '', signatureSeg = ''] = parts;
  if (!headerSeg || !payloadSeg) return { ok: false, reason: 'shape' };

  const headerJson = decodeSegment(headerSeg);
  if (headerJson === null) return { ok: false, reason: 'header' };
  let header: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(headerJson);
    if (!isPlainObject(parsed)) return { ok: false, reason: 'header' };
    header = parsed;
  } catch {
    return { ok: false, reason: 'header' };
  }

  const payloadJson = decodeSegment(payloadSeg);
  if (payloadJson === null) return { ok: false, reason: 'payload' };
  let payload: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(payloadJson);
    if (!isPlainObject(parsed)) return { ok: false, reason: 'payload' };
    payload = parsed;
  } catch {
    return { ok: false, reason: 'payload' };
  }

  return {
    ok: true,
    header,
    payload,
    signature: signatureSeg,
    headerPretty: JSON.stringify(header, null, 2),
    payloadPretty: JSON.stringify(payload, null, 2),
  };
}

/**
 * Reads a Unix timestamp claim (`exp`, `iat`, `nbf`) from the payload.
 * Accepts numbers or numeric strings; returns `null` for anything else
 * (matches the spec: claims are optional, missing is fine).
 */
export function readTimestamp(
  payload: Record<string, unknown>,
  claim: 'exp' | 'iat' | 'nbf',
): number | null {
  const v = payload[claim];
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v && /^\d+$/.test(v)) return Number(v);
  return null;
}

/** True if a Unix-timestamp `exp` claim is in the past. */
export function isExpired(payload: Record<string, unknown>, nowSec = Date.now() / 1000): boolean {
  const exp = readTimestamp(payload, 'exp');
  return exp !== null && exp < nowSec;
}

/** True if a Unix-timestamp `nbf` claim is still in the future. */
export function isNotYetValid(
  payload: Record<string, unknown>,
  nowSec = Date.now() / 1000,
): boolean {
  const nbf = readTimestamp(payload, 'nbf');
  return nbf !== null && nbf > nowSec;
}

/** Format a Unix timestamp in seconds as ISO-8601 (UTC). */
export function formatTimestamp(sec: number): string {
  const d = new Date(sec * 1000);
  if (Number.isNaN(d.getTime())) return String(sec);
  return d.toISOString();
}

/**
 * Verify a JWT signature using an HMAC secret. Only HS256/HS384/HS512 are
 * supported here — RSA/ECDSA verification needs a public-key paste flow
 * which is significantly more UI surface; HMAC covers the common case.
 *
 * Returns one of:
 *   - `{ ok: true,  match: true  }` — signature verified
 *   - `{ ok: true,  match: false }` — signature mismatch (wrong secret/key)
 *   - `{ ok: false, reason: 'unsupported' }` — alg is not HS-family
 *   - `{ ok: false, reason: 'shape' }`        — JWT itself doesn't parse
 */
export type JwtVerifyResult =
  | { readonly ok: true; readonly match: boolean; readonly algo: 'HS256' | 'HS384' | 'HS512' }
  | { readonly ok: false; readonly reason: 'shape' | 'unsupported' | 'crypto' };

const HS_ALGS: Readonly<Record<string, 'SHA-256' | 'SHA-384' | 'SHA-512'>> = {
  HS256: 'SHA-256',
  HS384: 'SHA-384',
  HS512: 'SHA-512',
};

export async function verifyJwtHmac(token: string, secret: string): Promise<JwtVerifyResult> {
  const cleaned = token.trim().replace(/^Bearer\s+/i, '').trim();
  const parts = cleaned.split('.');
  if (parts.length !== 3) return { ok: false, reason: 'shape' };
  const [headerSeg = '', payloadSeg = '', sigSeg = ''] = parts;
  if (!headerSeg || !payloadSeg || !sigSeg) return { ok: false, reason: 'shape' };

  // Pull alg out of the header so we know which HMAC variant to use.
  const headerJson = decodeSegment(headerSeg);
  if (headerJson === null) return { ok: false, reason: 'shape' };
  let alg: string;
  try {
    const h: unknown = JSON.parse(headerJson);
    if (!isPlainObject(h) || typeof h.alg !== 'string') return { ok: false, reason: 'shape' };
    alg = h.alg;
  } catch {
    return { ok: false, reason: 'shape' };
  }
  const hashName = HS_ALGS[alg];
  if (!hashName) return { ok: false, reason: 'unsupported' };

  // Sign `header.payload` with the secret and compare against the segment.
  const signingInput = `${headerSeg}.${payloadSeg}`;
  try {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      cloneToArrayBuffer(enc.encode(secret)),
      { name: 'HMAC', hash: { name: hashName } },
      false,
      ['sign'],
    );
    const sig = await crypto.subtle.sign(
      'HMAC',
      key,
      cloneToArrayBuffer(enc.encode(signingInput)),
    );
    const expected = bytesToBase64Url(new Uint8Array(sig));
    return {
      ok: true,
      match: timingSafeEquals(expected, sigSeg),
      algo: alg as 'HS256' | 'HS384' | 'HS512',
    };
  } catch {
    return { ok: false, reason: 'crypto' };
  }
}

/** Defensive copy: returns a fresh Uint8Array (TypedArray) so SubtleCrypto
 *  can't read past view bounds AND so Node 20's stricter realm-aware
 *  ArrayBuffer check doesn't reject the buffer. */
function cloneToArrayBuffer(view: Uint8Array): Uint8Array<ArrayBuffer> {
  const out = new Uint8Array(view.byteLength);
  out.set(view);
  return out;
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function timingSafeEquals(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

// ───────────────────────────────────────────────────────────────────────
// internals
// ───────────────────────────────────────────────────────────────────────

/** Decode a base64url segment to UTF-8 text. Returns null on failure. */
function decodeSegment(segment: string): string | null {
  // base64url → base64
  const padded = segment.replace(/-/g, '+').replace(/_/g, '/');
  const padLen = (4 - (padded.length % 4)) % 4;
  const b64 = padded + '='.repeat(padLen);
  try {
    const binary = atob(b64);
    // atob yields a binary string — decode as UTF-8.
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new TextDecoder('utf-8', { fatal: false }).decode(bytes);
  } catch {
    return null;
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
