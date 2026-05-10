import { describe, expect, it } from 'vitest';
import { hslToRgb, oklchToCss, parseColor, rgbToHex, rgbToHsl, rgbToOklch } from './logic';

describe('color logic', () => {
  it('parses #fff and #ffffff', () => {
    expect(parseColor('#fff')).toEqual({ r: 255, g: 255, b: 255 });
    expect(parseColor('#ffffff')).toEqual({ r: 255, g: 255, b: 255 });
    expect(parseColor('FFF')).toEqual({ r: 255, g: 255, b: 255 });
  });

  it('parses rgb(...)', () => {
    expect(parseColor('rgb(255, 0, 0)')).toEqual({ r: 255, g: 0, b: 0 });
  });

  it('parses hsl(...)', () => {
    expect(parseColor('hsl(0, 100%, 50%)')).toEqual({ r: 255, g: 0, b: 0 });
  });

  it('rgbToHex round-trips', () => {
    expect(rgbToHex({ r: 99, g: 102, b: 241 })).toBe('#6366f1');
    expect(parseColor(rgbToHex({ r: 99, g: 102, b: 241 }))).toEqual({ r: 99, g: 102, b: 241 });
  });

  it('rgbToHsl: red', () => {
    expect(rgbToHsl({ r: 255, g: 0, b: 0 })).toEqual({ h: 0, s: 100, l: 50 });
  });

  it('hsl → rgb → hsl preserves green', () => {
    const h = { h: 120, s: 100, l: 50 };
    expect(rgbToHsl(hslToRgb(h))).toEqual(h);
  });

  it('rejects garbage', () => {
    expect(parseColor('not a color')).toBeNull();
    expect(parseColor('')).toBeNull();
  });

  // ─── OKLCH ─────────────────────────────────────────────────────────────
  // CSS Color Module Level 4 reference values from
  // https://www.w3.org/TR/css-color-4/#ok-lab — sRGB-red converts to
  // approximately oklch(62.8% 0.258 29.234) (the value that appears
  // verbatim throughout the spec, MDN, and Björn Ottosson's reference
  // implementation).
  it('rgbToOklch: sRGB red matches CSS Color L4 reference', () => {
    const o = rgbToOklch({ r: 255, g: 0, b: 0 });
    expect(o.l).toBeCloseTo(0.628, 2);
    expect(o.c).toBeCloseTo(0.258, 2);
    expect(o.h).toBeCloseTo(29.23, 1);
  });

  it('rgbToOklch: pure white lightness 1, chroma 0', () => {
    const o = rgbToOklch({ r: 255, g: 255, b: 255 });
    expect(o.l).toBeCloseTo(1, 3);
    expect(o.c).toBeCloseTo(0, 3);
  });

  it('rgbToOklch: pure black lightness 0, chroma 0', () => {
    const o = rgbToOklch({ r: 0, g: 0, b: 0 });
    expect(o.l).toBeCloseTo(0, 3);
    expect(o.c).toBeCloseTo(0, 3);
  });

  it('oklchToCss formats cleanly', () => {
    const css = oklchToCss({ l: 0.628, c: 0.258, h: 29.234 });
    expect(css).toBe('oklch(62.8% 0.258 29.23)');
  });
});
