/**
 * Color converter — parse hex/rgb/hsl and emit all three forms (plus a
 * normalised CSS hex).
 */

export interface RGB { readonly r: number; readonly g: number; readonly b: number }
export interface HSL { readonly h: number; readonly s: number; readonly l: number }
export interface OKLCH { readonly l: number; readonly c: number; readonly h: number }

/** Parse `#abc`, `#aabbcc`, `rgb(r,g,b)`, `hsl(h,s%,l%)`. Null on garbage. */
export function parseColor(input: string): RGB | null {
  const s = input.trim().toLowerCase();
  if (!s) return null;
  // Hex: #fff, #ffffff
  const hex3 = /^#?([0-9a-f])([0-9a-f])([0-9a-f])$/.exec(s);
  if (hex3) {
    return { r: parseInt((hex3[1] ?? '0') + (hex3[1] ?? '0'), 16), g: parseInt((hex3[2] ?? '0') + (hex3[2] ?? '0'), 16), b: parseInt((hex3[3] ?? '0') + (hex3[3] ?? '0'), 16) };
  }
  const hex6 = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/.exec(s);
  if (hex6) return { r: parseInt(hex6[1] ?? '0', 16), g: parseInt(hex6[2] ?? '0', 16), b: parseInt(hex6[3] ?? '0', 16) };
  // rgb(...)
  const rgb = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/.exec(s);
  if (rgb) {
    const r = clamp255(Number(rgb[1])), g = clamp255(Number(rgb[2])), b = clamp255(Number(rgb[3]));
    return { r, g, b };
  }
  // hsl(...)
  const hsl = /^hsla?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)%\s*,\s*(\d+(?:\.\d+)?)%/.exec(s);
  if (hsl) {
    return hslToRgb({ h: Number(hsl[1]), s: Number(hsl[2]), l: Number(hsl[3]) });
  }
  return null;
}

export function rgbToHex(rgb: RGB): string {
  const h = (n: number): string => Math.round(clamp255(n)).toString(16).padStart(2, '0');
  return `#${h(rgb.r)}${h(rgb.g)}${h(rgb.b)}`;
}

export function rgbToHsl(rgb: RGB): HSL {
  const r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h *= 60;
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function hslToRgb(hsl: HSL): RGB {
  const h = ((hsl.h % 360) + 360) % 360;
  const s = clamp01(hsl.s / 100), l = clamp01(hsl.l / 100);
  if (s === 0) {
    const v = Math.round(l * 255);
    return { r: v, g: v, b: v };
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hk = h / 360;
  const tr = hk + 1 / 3, tg = hk, tb = hk - 1 / 3;
  return {
    r: Math.round(hueToChannel(p, q, tr) * 255),
    g: Math.round(hueToChannel(p, q, tg) * 255),
    b: Math.round(hueToChannel(p, q, tb) * 255),
  };
}

function hueToChannel(p: number, q: number, t: number): number {
  let tt = t;
  if (tt < 0) tt += 1;
  if (tt > 1) tt -= 1;
  if (tt < 1 / 6) return p + (q - p) * 6 * tt;
  if (tt < 1 / 2) return q;
  if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
  return p;
}

function clamp255(n: number): number {
  return Math.max(0, Math.min(255, Number.isFinite(n) ? n : 0));
}
function clamp01(n: number): number {
  return Math.max(0, Math.min(1, Number.isFinite(n) ? n : 0));
}

/** sRGB → OKLCH per CSS Color Module Level 4 §7.3.
 *  Output: L in 0–1, C in 0–~0.4, H in 0–360°. */
export function rgbToOklch(rgb: RGB): OKLCH {
  // 1. sRGB 0–255 → linear sRGB 0–1
  const lr = srgbToLinear(rgb.r / 255);
  const lg = srgbToLinear(rgb.g / 255);
  const lb = srgbToLinear(rgb.b / 255);

  // 2. Linear sRGB → LMS (Björn Ottosson's matrix)
  const lLMS = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
  const mLMS = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
  const sLMS = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;

  // 3. Cube root → non-linear LMS
  const l_ = Math.cbrt(lLMS);
  const m_ = Math.cbrt(mLMS);
  const s_ = Math.cbrt(sLMS);

  // 4. Non-linear LMS → OKLab
  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const b = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;

  // 5. OKLab → OKLCH (polar form)
  const C = Math.hypot(a, b);
  let H = (Math.atan2(b, a) * 180) / Math.PI;
  if (H < 0) H += 360;
  // Achromatic colors: hue is undefined; CSS spec uses 'none', we use 0.
  if (C < 1e-4) H = 0;

  return { l: L, c: C, h: H };
}

/** Format an OKLCH value as a CSS string: `oklch(62.8% 0.258 29.234)` */
export function oklchToCss(o: OKLCH): string {
  const lPct = (o.l * 100).toFixed(1);
  const c = o.c.toFixed(3);
  const h = o.h.toFixed(2);
  return `oklch(${lPct}% ${c} ${h})`;
}

function srgbToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}
