import { describe, expect, it } from 'vitest';
import { entropyHexFor, fromEntropyHex, generate, isValid } from './logic';

describe('bip39 logic', () => {
  it('generates a 12-word mnemonic', () => {
    const m = generate(12);
    const words = m.split(/\s+/);
    expect(words).toHaveLength(12);
    expect(isValid(m)).toBe(true);
  });

  it('generates a 24-word mnemonic', () => {
    const m = generate(24);
    expect(m.split(/\s+/)).toHaveLength(24);
    expect(isValid(m)).toBe(true);
  });

  it('round-trips entropy hex ↔ mnemonic', () => {
    // Entropy from BIP-0039 spec test vector.
    const hex = '00000000000000000000000000000000';
    const m = fromEntropyHex(hex);
    expect(m).toBe('abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about');
    expect(entropyHexFor(m ?? '')).toBe(hex);
  });

  it('rejects malformed mnemonic', () => {
    expect(isValid('abandon abandon abandon')).toBe(false);
    expect(isValid('not real words at all hello world here')).toBe(false);
  });

  it('rejects bad entropy hex', () => {
    expect(fromEntropyHex('zzzz')).toBeNull();
    expect(fromEntropyHex('aa')).toBeNull(); // wrong length
    expect(fromEntropyHex('')).toBeNull();
  });

  it('two generated mnemonics are different', () => {
    expect(generate(12)).not.toBe(generate(12));
  });
});
