# String obfuscator

## Overview
- **Path:** `/string-obfuscator`
- **Category:** Text
- **Description:** Obfuscate a string (like a secret, an IBAN, or a token) to make it shareable and identifiable without revealing its content.
- **Keywords:** string, obfuscator, secret, token, hide, obscure, mask, masking
- **Redirect from:** (none)
- **Created at:** 2023-08-16

## Purpose
Masks the middle portion of a string while preserving a configurable number of leading and trailing characters, so the value can be shared (e.g. in a screenshot or a support ticket) without revealing the actual secret. Common use cases: redacting API keys, IBANs, credit card numbers, and access tokens for documentation, logs, or screenshots — leaving enough characters intact to identify which token is being referred to.

## Inputs
| Name | Type | Default | Validation |
|------|------|---------|-----------|
| `str` | `string` (multiline) | `'Lorem ipsum dolor sit amet'` | None — free-form text. Marked `clearable` and `raw-text`. |
| `keepFirst` | `number` (`<n-input-number>`) | `4` | `min="0"`. Number of leading characters to preserve unmasked. |
| `keepLast` | `number` (`<n-input-number>`) | `4` | `min="0"`. Number of trailing characters to preserve unmasked. |
| `keepSpace` | `boolean` (`<n-switch>`) | `true` | When `true`, space characters in the middle region are kept as spaces (not replaced). |
| `replacementChar` | `string` (model-only — not exposed in UI) | `'*'` | Default applied via `obfuscateString` parameter. |

## Outputs
| Name | Type | Description |
|------|------|-------------|
| `obfuscatedString` | `string` (computed `Ref`) | Reactive computed result. Equal to the original input except characters at indices `[keepFirst, length − keepLast)` are replaced with `replacementChar` (with optional space preservation). |

## UI / Components
- **Input** `<c-input-text>` with `clearable`, `multiline`, `raw-text`, label "String to obfuscate:", placeholder "Enter string to obfuscate".
- **Three controls** in a flex row:
  1. "Keep first:" `<n-input-number min="0">`.
  2. "Keep last:" `<n-input-number min="0">`.
  3. "Keep spaces:" `<n-switch>`.
- **Result card** (`<c-card>` with monospaced text, max-width 600 px) that appears only when `obfuscatedString` is non-empty. It contains:
  - The obfuscated text (with `break-anywhere` wrapping).
  - A `<c-button>` with `<icon-mdi:content-copy/>` for clipboard copy.

## Logic / Algorithm
Implemented in `string-obfuscator.model.ts` as the pure function `obfuscateString` plus a Vue `useObfuscateString` wrapper:

```ts
function obfuscateString(
  str: string,
  { replacementChar = '*', keepFirst = 4, keepLast = 0, keepSpace = true } = {}
): string {
  return str
    .split('')
    .map((char, index, array) => {
      if (keepSpace && char === ' ') {
        return char;
      }
      return (index < keepFirst || index >= array.length - keepLast)
        ? char
        : replacementChar;
    })
    .join('');
}
```

Step by step for each character at position `index` in an array of length `array.length`:
1. If `keepSpace` is `true` **and** the character is ASCII space (`' '`), it is kept verbatim — even if the index falls inside the masked region.
2. Otherwise, the character is kept verbatim if `index < keepFirst` (in the leading window) or `index >= array.length - keepLast` (in the trailing window).
3. Otherwise the character is replaced with `replacementChar` (default `'*'`).

The reactive wrapper:
```ts
function useObfuscateString(str, { replacementChar, keepFirst, keepLast, keepSpace } = {}) {
  return computed(() => obfuscateString(get(str), { /* unwrapped refs */ }));
}
```

`get` from `@vueuse/core` unwraps any `MaybeRef<T>` argument, so each option may be a plain value or a `Ref`.

Note: the model file's default for `keepLast` is `0`, but the Vue UI sets `keepLast.value = 4` by default — the UI default overrides the function default.

## Dependencies
- **`@vueuse/core`** (`get`) — to unwrap `MaybeRef` arguments inside the composable.
- **Vue 3** Composition API (`computed`, `ref`).
- **Naive UI**: `n-input-number`, `n-switch`.
- **Custom `c-*` components**: `c-input-text`, `c-card`, `c-button`.
- **`@/composable/copy#useCopy`** — clipboard helper.
- **`icon-mdi:content-copy`** — Iconify icon component.

## Edge Cases & Validation
- **Empty input** → empty output; result card is not rendered (`v-if="obfuscatedString"`).
- **`keepFirst + keepLast >= str.length`** → no character meets the masking condition; the entire string is returned unchanged. Tested: `obfuscateString('1234567890', { keepFirst: 5, keepLast: 5 })` → `'1234567890'`.
- **`keepFirst = 0`** → no leading characters are kept; only trailing are. e.g. `obfuscateString('1234567890', { keepFirst: 0, keepLast: 5 })` → `'*****67890'`.
- **`keepLast = 0`** (default in model) → only leading characters are kept.
- **Negative numbers** — UI restricts `min="0"`, but the function does not validate; passing a negative value would alter the comparison logic.
- **Multi-byte / emoji characters** → `str.split('')` splits by UTF-16 code units, so a 4-byte emoji (surrogate pair) is treated as two characters and each half is handled independently. May produce broken surrogates in output.
- **Spaces inside masked region** — preserved when `keepSpace=true` (default). With `keepSpace=false`, spaces are replaced like any other character.
- **Unicode whitespace other than `' '`** (`\t`, `\n`, NBSP, etc.) — never preserved by the space rule; only the literal ASCII space matches `char === ' '`.

## Examples
| Input | `keepFirst` | `keepLast` | `keepSpace` | Output |
|-------|-------------|------------|-------------|--------|
| `1234567890` | 4 | 0 | true | `1234******` |
| `1234567890` | 0 | 5 | true | `*****67890` |
| `1234567890` | 5 | 5 | true | `1234567890` (unchanged) |
| `1234567890` | 2 | 2 | true | `12******90` |
| `12345 67890` | 4 | 4 | `true` | `1234* *7890` |
| `12345 67890` | 4 | 4 | `false` | `1234***7890` |
| `Lorem ipsum dolor sit amet` | 4 | 4 | `true` | `Lore* ***** ***** *** amet` |
| `sk-AbC123XyZ456` | 4 | 4 | `true` | `sk-A******Z456` |

(The final two are derived from the algorithm; the first six are direct test cases from `string-obfuscator.model.test.ts`.)

## File Structure
| File | Purpose |
|------|---------|
| `index.ts` | Tool registration metadata (name, path, description, keywords, icon, component loader, `createdAt`). |
| `string-obfuscator.vue` | Vue UI: input textarea, 3 option controls, result card, copy button. |
| `string-obfuscator.model.ts` | Pure `obfuscateString` function + `useObfuscateString` Vue composable. |
| `string-obfuscator.model.test.ts` | Vitest unit tests covering core obfuscation behavior, custom replacement char, and `keepSpace` toggling. |

## Notes
- **i18n:** title and description come from `tools.string-obfuscator.{title,description}`.
- **Persistence:** none.
- **Icon:** `EyeOff` from `@vicons/tabler`.
- **Replacement character is hard-coded** in the UI: only `'*'` can be used. The `replacementChar` parameter exists in the model and is unit-tested but is not surfaced in the Vue component.
- **No download / file export** — copy-only.
- **Pure / deterministic** — same input + options always produce same output. Safe against XSS in the rendered card because Vue text interpolation HTML-escapes by default.
