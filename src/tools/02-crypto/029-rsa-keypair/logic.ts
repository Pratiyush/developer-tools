/**
 * RSA key-pair generator. Uses WebCrypto's `crypto.subtle.generateKey`
 * for RSASSA-PKCS1-v1_5 with the user's chosen modulus length, then
 * exports the keys in SPKI/PKCS#8 DER and wraps them in PEM envelopes.
 *
 * No private key ever leaves the page.
 */

export const KEY_SIZES = [2048, 3072, 4096] as const;
export type KeySize = (typeof KEY_SIZES)[number];

export const HASH_ALGOS = ['SHA-256', 'SHA-384', 'SHA-512'] as const;
export type HashAlgo = (typeof HASH_ALGOS)[number];

export interface KeyPairPem {
  readonly publicPem: string;
  readonly privatePem: string;
  readonly modulusBits: number;
  readonly hash: HashAlgo;
}

export async function generateRsaKeyPair(size: KeySize, hash: HashAlgo): Promise<KeyPairPem> {
  const pair = await crypto.subtle.generateKey(
    {
      name: 'RSASSA-PKCS1-v1_5',
      modulusLength: size,
      publicExponent: new Uint8Array([1, 0, 1]), // 65537, the standard
      hash: { name: hash },
    },
    true,
    ['sign', 'verify'],
  );
  const spki = await crypto.subtle.exportKey('spki', pair.publicKey);
  const pkcs8 = await crypto.subtle.exportKey('pkcs8', pair.privateKey);
  return {
    publicPem: pemEnvelope(new Uint8Array(spki), 'PUBLIC KEY'),
    privatePem: pemEnvelope(new Uint8Array(pkcs8), 'PRIVATE KEY'),
    modulusBits: size,
    hash,
  };
}

/** Wrap raw DER bytes in a PEM envelope with 64-char body lines. */
function pemEnvelope(bytes: Uint8Array, label: string): string {
  const b64 = bytesToBase64(bytes);
  const lines = b64.match(/.{1,64}/g) ?? [b64];
  return `-----BEGIN ${label}-----\n${lines.join('\n')}\n-----END ${label}-----`;
}

function bytesToBase64(bytes: Uint8Array): string {
  // btoa requires a binary string; chunk to avoid overflowing String.fromCharCode.
  const CHUNK = 0x8000;
  let bin = '';
  for (let i = 0; i < bytes.length; i += CHUNK) {
    bin += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(bin);
}
