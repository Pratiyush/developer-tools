import { describe, expect, it } from 'vitest';
import { ALGORITHMS, hashText, hexEqualsCT } from './logic';

// Reference vectors (NIST / RFC test vectors).
const ABC_SHA1 = 'a9993e364706816aba3e25717850c26c9cd0d89d';
const ABC_SHA256 = 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad';

describe('hash logic', () => {
  it('exposes the four SHA-2 family algorithms', () => {
    expect(ALGORITHMS).toEqual(['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512']);
  });

  it('SHA-1 of "abc" matches the standard test vector', async () => {
    expect(await hashText('abc', 'SHA-1')).toBe(ABC_SHA1);
  });

  it('SHA-256 of "abc" matches the NIST test vector', async () => {
    expect(await hashText('abc', 'SHA-256')).toBe(ABC_SHA256);
  });

  it('produces 96 hex chars for SHA-384', async () => {
    expect(await hashText('hello', 'SHA-384')).toHaveLength(96);
  });

  it('produces 128 hex chars for SHA-512', async () => {
    expect(await hashText('hello', 'SHA-512')).toHaveLength(128);
  });

  it('UTF-8: "café" hashes deterministically', async () => {
    const a = await hashText('café', 'SHA-256');
    const b = await hashText('café', 'SHA-256');
    expect(a).toBe(b);
  });

  it('hexEqualsCT is true for identical, false otherwise', () => {
    expect(hexEqualsCT(ABC_SHA1, ABC_SHA1)).toBe(true);
    expect(hexEqualsCT(ABC_SHA1, ABC_SHA256)).toBe(false);
  });
});
