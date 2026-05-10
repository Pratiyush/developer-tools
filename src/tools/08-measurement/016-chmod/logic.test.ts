import { describe, expect, it } from 'vitest';
import { fromOctal, toOctal, toSymbolic } from './logic';

describe('chmod logic', () => {
  it('toOctal: rwxr-xr-x = 755', () => {
    const p = {
      user: { r: true, w: true, x: true },
      group: { r: true, w: false, x: true },
      other: { r: true, w: false, x: true },
    };
    expect(toOctal(p)).toBe('755');
    expect(toSymbolic(p)).toBe('rwxr-xr-x');
  });

  it('toOctal: rw-r--r-- = 644', () => {
    const p = {
      user: { r: true, w: true, x: false },
      group: { r: true, w: false, x: false },
      other: { r: true, w: false, x: false },
    };
    expect(toOctal(p)).toBe('644');
    expect(toSymbolic(p)).toBe('rw-r--r--');
  });

  it('all-off → 000', () => {
    const p = {
      user: { r: false, w: false, x: false },
      group: { r: false, w: false, x: false },
      other: { r: false, w: false, x: false },
    };
    expect(toOctal(p)).toBe('000');
  });

  it('round-trips fromOctal', () => {
    expect(toOctal(fromOctal('755'))).toBe('755');
    expect(toOctal(fromOctal('644'))).toBe('644');
    expect(toOctal(fromOctal('777'))).toBe('777');
  });

  it('fromOctal returns 000 on bad input', () => {
    expect(toOctal(fromOctal('abc'))).toBe('000');
    expect(toOctal(fromOctal('888'))).toBe('000');
    expect(toOctal(fromOctal('99'))).toBe('000');
  });
});
