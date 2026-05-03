# Roman Numeral Converter

## Overview
- **Path:** `/roman-numeral-converter`
- **Category:** Converter
- **Description:** Convert numbers between Arabic (1, 2, 3) and Roman (I, II, III) representations, in both directions.
- **Keywords:** roman, arabic, converter, X, I, V, L, C, D, M
- **Redirect from:** None
- **Icon:** `LetterX` (from `@vicons/tabler`)

## Purpose
A bidirectional converter for numbers ≤ 3999. The page has two cards stacked vertically: the top one converts an Arabic integer to its Roman numeral equivalent; the bottom one parses a Roman numeral string back to its Arabic integer. Both directions provide live validation and a copy button. Useful for chapter-numbering, royal-name suffixes, watch-face numerals, and trivia.

## Inputs

### Arabic → Roman card
| Name | Type | Default | Validation |
|------|------|---------|------------|
| `inputNumeral` | number | `42` | Must satisfy `MIN_ARABIC_TO_ROMAN <= value <= MAX_ARABIC_TO_ROMAN` (i.e., `1 ≤ value ≤ 3999`). Error message: `"We can only convert numbers between 1 and 3,999"` (numbers formatted via `toLocaleString()`). The `n-input-number` enforces `:min="1"` and shows no spinner buttons (`:show-button="false"`). |

### Roman → Arabic card
| Name | Type | Default | Validation |
|------|------|---------|------------|
| `inputRoman` | string | `'XLII'` | Must match the canonical Roman regex (see Logic). Error message: `"The input you entered is not a valid roman number"`. |

## Outputs

| Name | Type | Description |
|------|------|-------------|
| `outputRoman` | string | Result of `arabicToRoman(inputNumeral)`. Empty string on out-of-range input (which can happen briefly before validation re-renders). |
| `outputNumeral` | number \| null | Result of `romanToArabic(inputRoman)`. `null` if the input is not a valid Roman numeral. |

Both are rendered with `font-size: 22px` in a centered "result" div.

Two copy buttons:
- "Copy" (Roman) — disabled when `validationNumeral.validationStatus === 'error'`. Toast: "Roman number copied to the clipboard".
- "Copy" (Arabic) — disabled when `!validationRoman.isValid`. Toast: "Arabic number copied to the clipboard".

## UI / Components
Two `c-card`s — first titled "Arabic to roman", second "Roman to arabic" — separated by `mt-5`. Each card has a horizontal flex row (`flex items-center justify-between`):

- **Arabic card:** `n-form-item` containing `n-input-number` (width 200px, no spinners), large `<div class="result">{{ outputRoman }}</div>`, and `c-button` "Copy" (autofocus on first card).
- **Roman card:** `c-input-text` (width 200px) with validation, `<div class="result">{{ outputNumeral }}</div>`, `c-button` "Copy" (disabled when invalid).

## Logic / Algorithm

### `arabicToRoman(num: number): string`
- Range guard: returns `''` if `num < 1 || num > 3999`.
- Greedy lookup table (ordered, descending):

```ts
{ M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40,
  X: 10,  IX: 9,   V: 5,   IV: 4,   I: 1 }
```

```ts
let roman = '';
for (const i in lookup) {
  while (num >= lookup[i]) {
    roman += i;
    num -= lookup[i];
  }
}
return roman;
```

Note: `for...in` on an object literal in modern JS engines preserves insertion order for non-integer string keys (which all of these are, since they start with letters). Floating-point inputs are silently floored because `num -= lookup[i]` accumulates the integer part — e.g. `arabicToRoman(1.9)` → `'I'`. (`for-in` on a plain object iterates in insertion order for string keys.)

### `isValidRomanNumber(romanNumber: string): boolean`
Tests against the canonical regex:
```
/^M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/
```
Empty string matches (since all groups can match empty), but the converter returns `0` in that case — see edge cases.

### `romanToArabic(s: string): number | null`
Returns `null` if `isValidRomanNumber(s)` is false. Otherwise:
```ts
const map = { I:1, V:5, X:10, L:50, C:100, D:500, M:1000 };
return [...s].reduce((r, c, i, s) =>
  (map[s[i + 1]] > map[c] ? r - map[c] : r + map[c]), 0);
```
Uses the standard "subtract-when-followed-by-larger" trick. Spread `[...s]` iterates by code point. The next-character lookup `s[i+1]` is `undefined` past the end, so `map[undefined]` is `undefined > map[c]` → `false`, falling through to addition.

### Constants
- `MIN_ARABIC_TO_ROMAN = 1`
- `MAX_ARABIC_TO_ROMAN = 3999`
- The 3999 ceiling is the largest number expressible in standard Roman numerals (4000 would require Apostrophus or vinculum notation).

## Dependencies
- `@vicons/tabler` (`LetterX` icon).
- Internal: `useCopy`, `useValidation`, `c-card`, `c-input-text`, `c-button`, `n-form-item`, `n-input-number`.

## Edge Cases & Validation

### Arabic → Roman
- `< 1` or `> 3999`: validation flags an error; the result div may briefly show `''` (since `arabicToRoman` returns empty); the copy button is disabled.
- Floating-point: silently truncated to the integer part. `1.9 → 'I'`, `17.6 → 'XVII'`, `29.999 → 'XXIX'`. Negative floats `< 1` → `''`.
- `0`, `0.5`, `0.9` → `''` (per tests).
- `3999.1`, `4000`, `10000` → `''`.
- Boundary: `arabicToRoman(1)` → `'I'`; `arabicToRoman(3999)` → `'MMMCMXCIX'`.

### Roman → Arabic
- Lowercase (`'iv'`) → invalid (regex is uppercase-only); `null`.
- Empty string `''` matches the regex (all groups empty), so `romanToArabic('')` returns `0` rather than `null`.
- Non-canonical sequences like `'IIII'` or `'VV'` → invalid (regex doesn't allow them); `null`.
- Whitespace, leading/trailing → invalid.
- Long strings with valid prefixes (e.g. `'XIIabc'`) → invalid.

## Examples

### Arabic → Roman (from tests)
| Input | Output |
|-------|--------|
| 1 | `I` |
| 4 | `IV` |
| 9 | `IX` |
| 14 | `XIV` |
| 40 | `XL` |
| 90 | `XC` |
| 400 | `CD` |
| 900 | `CM` |
| 999 | `CMXCIX` |
| 1000 | `M` |
| 2000 | `MM` |

### Roman → Arabic
| Input | Output |
|-------|--------|
| `XLII` | 42 |
| `MMXXIV` | 2024 |
| `IV` | 4 |
| `MMMCMXCIX` | 3999 |

## File Structure
- `index.ts` — Tool registration: i18n title/description, keywords, lazy-loaded component, `LetterX` icon. No `createdAt`.
- `roman-numeral-converter.vue` — Two-card UI, validations, computed outputs, copy handlers.
- `roman-numeral-converter.service.ts` — `arabicToRoman`, `romanToArabic`, `isValidRomanNumber`, `MIN_ARABIC_TO_ROMAN`, `MAX_ARABIC_TO_ROMAN`.
- `roman-numeral-converter.service.test.ts` — Vitest tests for `arabicToRoman` covering negative numbers, > 3999, floats, and an exhaustive list of small/medium values.

## Notes
- No persistence. Defaults reset on reload (Arabic input back to `42`, Roman input back to `'XLII'`).
- The "Copy" buttons live next to their result. The first ("Copy" Roman) is `autofocus`ed when the page loads.
- `for...in` over an object literal works here because object key insertion order is preserved for string keys; if someone ever rewrote the lookup as a `Map`, the same iteration order would be guaranteed.
- Tests cover the Arabic→Roman direction thoroughly but **not** Roman→Arabic, and not the regex validator. The regex enforces canonical form (no `IIII`, no `VX`, etc.).
- Both i18n title and description come from `tools.roman-numeral-converter.title`/`.description` locale entries.
- The error message for the Arabic side uses `toLocaleString()` for the bounds, so non-en locales see localized digit grouping (e.g., `3 999` in fr-FR).
