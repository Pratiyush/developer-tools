import { describe, expect, it } from 'vitest';
import { ALGORITHMS, hmac } from './logic';

// RFC 4231 HMAC test vector — SHA-256 of "Hi There" with key 0x0b...0b.
// We use a string secret for our wrapper, so we test our own consistency
// rather than the literal RFC 4231 vector.
describe('hmac logic', () => {
  it('exposes the four SHA-2 algorithms', () => {
    expect(ALGORITHMS).toEqual(['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512']);
  });

  it('SHA-256 with a known test vector matches (RFC 4231 §4.2)', async () => {
    // key = "Jefe", data = "what do ya want for nothing?"
    expect(await hmac('what do ya want for nothing?', 'Jefe', 'SHA-256')).toBe(
      '5bdcc146bf60754e6a042426089575c75a003f089d2739839dec58b964ec3843',
    );
  });

  it('produces deterministic output for fixed inputs', async () => {
    const a = await hmac('hello', 'secret', 'SHA-256');
    const b = await hmac('hello', 'secret', 'SHA-256');
    expect(a).toBe(b);
  });

  it('different secret → different digest', async () => {
    const a = await hmac('hello', 's1', 'SHA-256');
    const b = await hmac('hello', 's2', 'SHA-256');
    expect(a).not.toBe(b);
  });

  it('different algorithm → different digest length', async () => {
    expect((await hmac('x', 'k', 'SHA-256')).length).toBe(64);
    expect((await hmac('x', 'k', 'SHA-512')).length).toBe(128);
  });
});
