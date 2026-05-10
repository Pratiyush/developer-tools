/**
 * Roman numerals — encode 1..3999 to canonical Roman numerals and decode
 * any well-formed numeral back. Uses the modern subtractive form
 * (IV, IX, XL, XC, CD, CM).
 */

const PAIRS: readonly (readonly [number, string])[] = [
  [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
  [100, 'C'],  [90, 'XC'],  [50, 'L'],  [40, 'XL'],
  [10, 'X'],   [9, 'IX'],   [5, 'V'],   [4, 'IV'], [1, 'I'],
];

export function toRoman(value: number): string | null {
  if (!Number.isInteger(value) || value < 1 || value > 3999) return null;
  let n = value;
  let out = '';
  for (const [v, s] of PAIRS) {
    while (n >= v) {
      out += s;
      n -= v;
    }
  }
  return out;
}

export function fromRoman(input: string): number | null {
  const s = input.trim().toUpperCase();
  if (!s || !/^[MDCLXVI]+$/.test(s)) return null;
  let i = 0;
  let total = 0;
  while (i < s.length) {
    const two = s.slice(i, i + 2);
    const one = s.slice(i, i + 1);
    const pairTwo = PAIRS.find(([, p]) => p === two);
    const pairOne = PAIRS.find(([, p]) => p === one);
    if (pairTwo) {
      total += pairTwo[0];
      i += 2;
    } else if (pairOne) {
      total += pairOne[0];
      i += 1;
    } else {
      return null;
    }
  }
  // Verify canonical form by re-encoding.
  return toRoman(total) === s ? total : null;
}
