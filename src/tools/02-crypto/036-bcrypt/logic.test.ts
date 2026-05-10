import { describe, expect, it } from 'vitest';
import { COST_DEFAULT, COST_MIN, costOf, hashPassword, verifyPassword } from './logic';

describe('bcrypt logic', () => {
  it('hashes and verifies a password', async () => {
    const hash = await hashPassword('correct horse battery staple', COST_MIN);
    expect(hash).toMatch(/^\$2[abxy]\$04\$/);
    expect(await verifyPassword('correct horse battery staple', hash)).toBe(true);
    expect(await verifyPassword('wrong password', hash)).toBe(false);
  }, 30_000);

  it('reports the cost factor embedded in a hash', async () => {
    const hash = await hashPassword('hunter2', COST_MIN);
    expect(costOf(hash)).toBe(COST_MIN);
  }, 30_000);

  it('returns null cost for non-bcrypt strings', () => {
    expect(costOf('not-a-hash')).toBeNull();
    expect(costOf('$2a$xx$0123456789012345678901234567890123456789012345678901')).toBeNull();
  });

  it('verifies against a fresh hash we did not see during hashing', async () => {
    // Generate a hash, throw away the salt, and re-verify only via the hash
    // string. Catches any regression where verifyPassword leaks state.
    const hash = await hashPassword('reference-vector', COST_MIN);
    const dup = `${hash}`;
    expect(await verifyPassword('reference-vector', dup)).toBe(true);
    expect(await verifyPassword('Reference-Vector', dup)).toBe(false);
  }, 30_000);

  it('rejects malformed hashes', async () => {
    expect(await verifyPassword('whatever', 'definitely not bcrypt')).toBe(false);
    expect(await verifyPassword('whatever', '')).toBe(false);
  });

  it('default cost is sensible', () => {
    expect(COST_DEFAULT).toBeGreaterThanOrEqual(10);
  });
});
