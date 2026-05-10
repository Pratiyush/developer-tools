/**
 * AES-GCM encrypt/decrypt with passphrase-derived key (PBKDF2 → AES-256-GCM).
 * Output is a self-contained base64 blob: `salt | iv | ciphertext+tag`.
 *
 * Format (binary):
 *   bytes 0..15  → 16-byte PBKDF2 salt
 *   bytes 16..27 → 12-byte AES-GCM IV
 *   bytes 28..   → ciphertext + 16-byte GCM auth tag (concatenated by SubtleCrypto)
 *
 * Encoded as base64 for transport.
 */

const SALT_LEN = 16;
const IV_LEN = 12;
const ITERATIONS = 250_000;

/** Slice a Uint8Array into a freestanding ArrayBuffer. Avoids the trap
 *  where `.buffer` exposes the whole underlying buffer the view was
 *  carved from — SubtleCrypto would then read across the slice. */
function cloneToArrayBuffer(view: Uint8Array): ArrayBuffer {
  const out = new ArrayBuffer(view.byteLength);
  new Uint8Array(out).set(view);
  return out;
}

async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    'raw',
    cloneToArrayBuffer(enc.encode(passphrase)),
    'PBKDF2',
    false,
    ['deriveKey'],
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: cloneToArrayBuffer(salt),
      iterations: ITERATIONS,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

export async function encrypt(plaintext: string, passphrase: string): Promise<string> {
  if (!plaintext) return '';
  const salt = new Uint8Array(SALT_LEN);
  const iv = new Uint8Array(IV_LEN);
  crypto.getRandomValues(salt);
  crypto.getRandomValues(iv);
  const key = await deriveKey(passphrase, salt);
  const ct = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: cloneToArrayBuffer(iv) },
    key,
    cloneToArrayBuffer(new TextEncoder().encode(plaintext)),
  );
  const out = new Uint8Array(SALT_LEN + IV_LEN + ct.byteLength);
  out.set(salt, 0);
  out.set(iv, SALT_LEN);
  out.set(new Uint8Array(ct), SALT_LEN + IV_LEN);
  return bytesToBase64(out);
}

export interface DecryptResult {
  readonly ok: boolean;
  readonly plaintext?: string;
  readonly error?: string;
}

export async function decrypt(blob: string, passphrase: string): Promise<DecryptResult> {
  const trimmed = blob.trim();
  if (!trimmed) return { ok: false, error: 'empty input' };
  let raw: Uint8Array;
  try {
    raw = base64ToBytes(trimmed);
  } catch {
    return { ok: false, error: 'not valid base64' };
  }
  if (raw.length < SALT_LEN + IV_LEN + 16) return { ok: false, error: 'too short' };
  const salt = raw.subarray(0, SALT_LEN);
  const iv = raw.subarray(SALT_LEN, SALT_LEN + IV_LEN);
  const ct = raw.subarray(SALT_LEN + IV_LEN);
  try {
    const key = await deriveKey(passphrase, salt);
    const buf = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: cloneToArrayBuffer(iv) },
      key,
      cloneToArrayBuffer(ct),
    );
    return { ok: true, plaintext: new TextDecoder().decode(buf) };
  } catch {
    return { ok: false, error: 'wrong passphrase or tampered ciphertext' };
  }
}

function bytesToBase64(bytes: Uint8Array): string {
  const CHUNK = 0x8000;
  let bin = '';
  for (let i = 0; i < bytes.length; i += CHUNK) {
    bin += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(bin);
}

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
