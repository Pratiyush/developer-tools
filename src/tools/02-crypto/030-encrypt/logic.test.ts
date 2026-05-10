import { describe, expect, it } from 'vitest';
import { decrypt, encrypt } from './logic';

describe('encrypt/decrypt logic', () => {
  it('encrypts then decrypts a string back', async () => {
    const ct = await encrypt('hello world', 'my-passphrase');
    expect(ct).not.toBe('hello world');
    const r = await decrypt(ct, 'my-passphrase');
    expect(r.ok).toBe(true);
    expect(r.plaintext).toBe('hello world');
  }, 15_000);

  it('UTF-8: emoji round-trips', async () => {
    const ct = await encrypt('日本語🍣', 'pass');
    const r = await decrypt(ct, 'pass');
    expect(r.plaintext).toBe('日本語🍣');
  }, 15_000);

  it('two encrypts of the same plaintext produce different ciphertexts', async () => {
    const a = await encrypt('hello', 'pass');
    const b = await encrypt('hello', 'pass');
    expect(a).not.toBe(b);
  }, 15_000);

  it('wrong passphrase fails authenticated decryption', async () => {
    const ct = await encrypt('hello', 'right');
    const r = await decrypt(ct, 'wrong');
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/wrong passphrase/);
  }, 15_000);

  it('garbage ciphertext fails gracefully', async () => {
    const r = await decrypt('not-a-real-blob', 'pass');
    expect(r.ok).toBe(false);
  });

  it('empty plaintext returns empty', async () => {
    expect(await encrypt('', 'pass')).toBe('');
  });
});
