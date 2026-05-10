import { describe, expect, it } from 'vitest';
import { HASH_ALGOS, KEY_SIZES, generateRsaKeyPair } from './logic';

describe('rsa-keypair logic', () => {
  it('exposes the expected key sizes + hashes', () => {
    expect(KEY_SIZES).toEqual([2048, 3072, 4096]);
    expect(HASH_ALGOS).toEqual(['SHA-256', 'SHA-384', 'SHA-512']);
  });

  // RSA keygen is comparatively expensive; test with the smallest size.
  it('produces a valid PEM key pair (2048-bit, SHA-256)', async () => {
    const r = await generateRsaKeyPair(2048, 'SHA-256');
    expect(r.publicPem).toMatch(/^-----BEGIN PUBLIC KEY-----/);
    expect(r.publicPem).toMatch(/-----END PUBLIC KEY-----$/);
    expect(r.privatePem).toMatch(/^-----BEGIN PRIVATE KEY-----/);
    expect(r.privatePem).toMatch(/-----END PRIVATE KEY-----$/);
    expect(r.modulusBits).toBe(2048);
    expect(r.hash).toBe('SHA-256');
  }, 15_000);

  it('two consecutive calls produce different keys', async () => {
    const a = await generateRsaKeyPair(2048, 'SHA-256');
    const b = await generateRsaKeyPair(2048, 'SHA-256');
    expect(a.publicPem).not.toBe(b.publicPem);
  }, 30_000);
});
