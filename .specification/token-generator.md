# Token Generator

## Overview
- **Path:** `/token-generator`
- **Category:** Crypto
- **Description:** Generate random string with the chars you want, uppercase or lowercase letters, numbers and/or symbols.
- **Keywords:** `token`, `random`, `string`, `alphanumeric`, `symbols`, `number`, `letters`, `lowercase`, `uppercase`, `password`
- **Redirect from:** None
- **Icon:** `ArrowsShuffle` from `@vicons/tabler`
- **Created at:** Not specified

## Purpose
Generates a random string (token / password) of configurable length and character classes. The user toggles which classes (uppercase, lowercase, digits, symbols) participate, picks a length 1–512, and gets a fresh token they can copy. The generator settings are persisted in the URL via query parameters, making any specific configuration shareable as a link.

## Inputs
| Name | Type | Default | Validation |
| ---- | ---- | ------- | ---------- |
| `length` | `number` (slider, integer) | `64` | Bounded by slider: `min=1`, `max=512`, `step=1`. |
| `withUppercase` | `boolean` (switch) | `true` | None (any boolean). |
| `withLowercase` | `boolean` (switch) | `true` | None. |
| `withNumbers` | `boolean` (switch) | `true` | None. |
| `withSymbols` | `boolean` (switch) | `false` | None. |

All five inputs are bound to the URL via `useQueryParam` (query keys: `length`, `uppercase`, `lowercase`, `numbers`, `symbols`).

The lower-level service also accepts an `alphabet?: string` override that bypasses the four flags entirely, but it is **not** exposed in the UI.

## Outputs
| Name | Type | Description |
| ---- | ---- | ----------- |
| `token` | `string` (computed, readonly textarea) | The generated random string. |

The output is a multiline, readonly `c-input-text` with `rows="3"`, `autosize`, and centered text via the `.token-display` style. A "Copy" button copies it; a "Refresh" button regenerates.

## UI / Components
- A single `c-card` containing:
  - `n-form` with `label-placement="left"` and `label-width="140"`. Two columns:
    - **Left column:** `n-form-item` "Uppercase (ABC...)" + `n-switch withUppercase`; `n-form-item` "Lowercase (abc...)" + `n-switch withLowercase`.
    - **Right column:** `n-form-item` "Numbers (123...)" + `n-switch withNumbers`; `n-form-item` "Symbols (!-;...)" + `n-switch withSymbols`.
  - `n-form-item` with dynamic label `"Length (<value>)"` containing `n-slider` (`min=1`, `max=512`, `step=1`).
  - `c-input-text` showing the token (multiline, readonly, autosize, placeholder = "The token...").
  - Two `c-button`s: "Copy" (calls `copy()`), "Refresh" (calls `refreshToken`).
- Layout: `<div mt-5 flex justify-center gap-3>`.
- Switch labels and button text are i18n-translated (`t('tools.token-generator.*')`).

## Logic / Algorithm
Service `createToken` in `token-generator.service.ts`:

```ts
import { shuffleString } from '@/utils/random';

export function createToken({
  withUppercase = true,
  withLowercase = true,
  withNumbers = true,
  withSymbols = false,
  length = 64,
  alphabet,
}: { ... }) {
  const allAlphabet = alphabet ?? [
    withUppercase ? 'ABCDEFGHIJKLMOPQRSTUVWXYZ' : '',
    withLowercase ? 'abcdefghijklmopqrstuvwxyz' : '',
    withNumbers ? '0123456789' : '',
    withSymbols ? '.,;:!?./-"\'#{([-|\\@)]=}*+' : '',
  ].join('');

  return shuffleString(allAlphabet.repeat(length)).substring(0, length);
}
```

**Step-by-step:**
1. If `alphabet` is supplied, use it directly. Otherwise build an alphabet by concatenating the enabled character-class strings:
   - Uppercase: `"ABCDEFGHIJKLMOPQRSTUVWXYZ"` — 25 chars (note: **letter `N` is missing** — this is a bug in the source).
   - Lowercase: `"abcdefghijklmopqrstuvwxyz"` — 25 chars (likewise missing `n`).
   - Numbers: `"0123456789"` — 10 chars.
   - Symbols: `'.,;:!?./-"\'#{([-|\\@)]=}*+'` — 26 chars.
2. Repeat the alphabet `length` times: `allAlphabet.repeat(length)`. This guarantees the buffer is long enough even if the alphabet is short (e.g. only digits, length 256 → 2560-char buffer).
3. Shuffle the resulting buffer using `shuffleString` (Durstenfeld shuffle on `str.split('')`, joined back without delimiter).
4. Slice the first `length` characters and return.

**Randomness source:** `Math.random()` via `@/utils/random.ts` (`shuffleArrayMutate` uses `Math.random`). This is **not cryptographically secure**.

**Vue wiring (`token-generator.tool.vue`):**
- All toggles and length use `useQueryParam` so changes write to the URL.
- `computedRefreshable(() => createToken({ ... }))` returns `[token, refreshToken]`. `computedRefreshable` (in `@/composable/computedRefreshable.ts`) marks itself dirty whenever any source ref changes, so flipping any toggle or moving the slider triggers a regeneration on next read; calling `refreshToken()` also marks dirty and forces re-evaluation. (This means the slider does not produce a new token on the same dirty cycle but will the next time the value is read by the template — in practice every reactive change yields a new token.)
- `useCopy({ source: token, text: t('tools.token-generator.copied') })` copies the token and shows the toast `"Token copied to the clipboard"`.

## Dependencies
- `@/utils/random` — `shuffleString` and Durstenfeld shuffle (uses `Math.random()`).
- `@/composable/copy` — clipboard helper.
- `@/composable/queryParams` (`useQueryParam`) — URL-synced state.
- `@/composable/computedRefreshable` — manually-refreshable computed value.
- `@vicons/tabler` — `ArrowsShuffle` icon.
- `naive-ui` (`n-form`, `n-form-item`, `n-switch`, `n-slider`).
- Vue I18n (`useI18n`).
- No third-party random libraries.

## Edge Cases & Validation
- **All toggles off:** `allAlphabet` is empty; `''.repeat(length)` is `''`; `.substring(0, length)` yields `''`. The output is empty (test asserts `length === 0`).
- **`length === 0`:** Yields `''`. The slider's `min=1` prevents this from the UI but service callers can still trigger it.
- **`length > 512`:** Slider caps at 512 in the UI; the service has no internal cap, so direct API callers can request larger.
- **Symbols regex test:** Verified against `/^[.,;:!?./\-"'#{([-|\\@)\]=}*+]+$/`. Note `[` appears twice in the symbol string (`{([` and `[-`), and `-` is mentioned twice. These duplicates are tolerated; they slightly bias the distribution toward certain characters but do not break correctness.
- **Bug in alphabet:** The uppercase and lowercase strings are missing the letter `N`/`n`. Tokens generated through the four-flag path therefore never contain `N` or `n`. The `alphabet` override does not have this issue.
- **Non-cryptographic randomness:** `Math.random()` is not suitable for security tokens, secrets, or passwords. The keyword list still includes `password`; consumers should be aware.
- **Repeated characters:** Because the buffer is `alphabet.repeat(length)` shuffled and truncated, character frequencies in the output approximate the input alphabet's distribution but are not strictly uniform per draw (the truncation introduces small bias).

## Examples
- Default (length 64, upper+lower+numbers, symbols off): a 64-character mixed alphanumeric token, e.g. `"K9aZbR4tQ2L7v8mP1xC3oH5dE6fJgU0sYwT8iBnVlMrXyWqA1zL3nP7tD"` (illustrative).
- All flags off, length 10: `""`.
- Only `withUppercase=true`, length 256: matches `/^[A-Z]+$/` (test asserts).
- Only `withSymbols=true`, length 256: matches `/^[.,;:!?./\-"'#{([-|\\@)\]=}*+]+$/` (test asserts).

## File Structure
- `index.ts` — Tool descriptor.
- `token-generator.service.ts` — `createToken` function (pure).
- `token-generator.service.test.ts` — Vitest unit tests for length, character-class isolation, and combined classes.
- `token-generator.tool.vue` — UI: switches, slider, output, copy/refresh buttons.
- `token-generator.e2e.spec.ts` — Playwright test asserting page title and that "Refresh" produces a different token.

## Notes
- Filename uses the `.tool.vue` suffix (unique to this tool — most others use plain `<name>.vue`).
- Settings persist in the URL via query parameters (no `useStorage`/local storage).
- I18n: switch labels, length label, placeholder, button text, copy toast all translated; tool name & description translated.
- Test IDs are not used; the e2e test relies on placeholder text (`The token...`) and accessible button names (`Refresh`).
- The slider label dynamically displays the current length: `Length (64)`.
