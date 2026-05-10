import { describe, expect, it } from 'vitest';
import { evaluate } from './logic';

describe('math-eval logic', () => {
  it('arithmetic precedence', () => {
    expect((evaluate('1 + 2 * 3') as { value: number }).value).toBe(7);
    expect((evaluate('(1 + 2) * 3') as { value: number }).value).toBe(9);
    expect((evaluate('10 - 5 - 2') as { value: number }).value).toBe(3);
  });
  it('exponent is right-associative', () => {
    expect((evaluate('2 ** 3 ** 2') as { value: number }).value).toBe(512);
  });
  it('unary minus', () => {
    expect((evaluate('-5 + 3') as { value: number }).value).toBe(-2);
    expect((evaluate('--5') as { value: number }).value).toBe(5);
  });
  it('Math functions', () => {
    expect((evaluate('sqrt(16)') as { value: number }).value).toBe(4);
    expect((evaluate('max(1, 2, 3)') as { value: number }).value).toBe(3);
    expect((evaluate('abs(-7)') as { value: number }).value).toBe(7);
  });
  it('constants', () => {
    expect((evaluate('pi') as { value: number }).value).toBeCloseTo(Math.PI);
    expect((evaluate('e') as { value: number }).value).toBeCloseTo(Math.E);
  });
  it('rejects bad input', () => {
    expect(evaluate('1 +').ok).toBe(false);
    expect(evaluate('hax(1)').ok).toBe(false);
    expect(evaluate('1 / 0').ok).toBe(false);
  });
  it('empty → 0', () => {
    expect(evaluate('')).toEqual({ ok: true, value: 0 });
  });
});
