import { describe, expect, it } from 'vitest';
import { convert, formatInBase, parseInBase } from './logic';

describe('base converter logic', () => {
  it('parses decimal/binary/hex/octal', () => {
    expect(parseInBase('42', 10)).toBe(42n);
    expect(parseInBase('101010', 2)).toBe(42n);
    expect(parseInBase('2a', 16)).toBe(42n);
    expect(parseInBase('52', 8)).toBe(42n);
  });

  it('strips conventional prefixes', () => {
    expect(parseInBase('0x2A', 16)).toBe(42n);
    expect(parseInBase('0b101010', 2)).toBe(42n);
    expect(parseInBase('0o52', 8)).toBe(42n);
  });

  it('returns null on illegal digits for the base', () => {
    expect(parseInBase('123', 2)).toBeNull();
    expect(parseInBase('xyz', 10)).toBeNull();
    expect(parseInBase('', 10)).toBeNull();
  });

  it('handles BigInt-sized numbers', () => {
    const n = parseInBase('ffffffffffffffff', 16);
    expect(n).toBe(2n ** 64n - 1n);
  });

  it('handles negative numbers', () => {
    expect(parseInBase('-42', 10)).toBe(-42n);
    expect(formatInBase(-42n, 16)).toBe('-2a');
  });

  it('formatInBase emits canonical lowercase hex', () => {
    expect(formatInBase(255n, 16)).toBe('ff');
    expect(formatInBase(8n, 2)).toBe('1000');
  });

  it('convert: hex → bin', () => {
    expect(convert('ff', 16, 2)).toBe('11111111');
  });

  it('convert: returns null on bad input', () => {
    expect(convert('zzz', 10, 16)).toBeNull();
  });
});
