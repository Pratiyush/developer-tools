# Text to Unicode

## Overview
- **Path:** `/text-to-unicode`
- **Category:** Converter
- **Description:** Parse and convert text to unicode and vice-versa.
- **Keywords:** `text`, `to`, `unicode`
- **Redirect from:** None
- **Icon:** `TextWrap` from `@vicons/tabler`
- **Created at:** `2024-01-31`

## Purpose
A two-way converter between plain text and HTML numeric character references (decimal entities, e.g. `&#65;` for `A`). Useful for embedding non-ASCII text in HTML/email markup, obfuscating strings, or decoding HTML-escaped content. Both directions live side-by-side on the same page in independent cards, so a user can encode text in one and decode it back in the other simultaneously.

## Inputs
| Card | Field | Type | Default | Validation |
| ---- | ----- | ---- | ------- | ---------- |
| Text → Unicode | `inputText` | `string` (multiline textarea) | `''` | None — every JavaScript string is acceptable |
| Unicode → Text | `inputUnicode` | `string` (multiline textarea) | `''` | None at the field level; non-matching tokens are left in place |

Both inputs are `multiline`, `autosize`, `raw-text`. The text input is `autofocus`.

## Outputs
| Card | Field | Type | Description |
| ---- | ----- | ---- | ----------- |
| Text → Unicode | `unicodeFromText` | `string` (computed, readonly textarea) | HTML numeric entities (decimal) for each char in the input. Empty (`''`) when input is empty/whitespace-only. |
| Unicode → Text | `textFromUnicode` | `string` (computed, readonly textarea) | Result of replacing `&#<digits>;` substrings with their decoded characters. Empty when input is empty/whitespace-only. |

Each card has a "Copy ... to clipboard" button that is disabled until the corresponding output is non-empty.

## UI / Components
The component renders two stacked `c-card`s.

**Card 1 — Title `"Text to Unicode"`**
- `c-input-text` `inputText` (label: `"Enter text to convert to unicode"`, placeholder: `e.g. 'Hello Avengers'`, `multiline`, `autosize`, `autofocus`, `raw-text`, `test-id="text-to-unicode-input"`).
- `c-input-text` `unicodeFromText` (readonly, label: `"Unicode from your text"`, `test-id="text-to-unicode-output"`).
- `c-button` `"Copy unicode to clipboard"` — disabled when the output is empty.

**Card 2 — Title `"Unicode to Text"`**
- `c-input-text` `inputUnicode` (label: `"Enter unicode to convert to text"`, placeholder: `Input Unicode`, `test-id="unicode-to-text-input"`).
- `c-input-text` `textFromUnicode` (readonly, label: `"Text from your Unicode"`, `test-id="unicode-to-text-output"`).
- `c-button` `"Copy text to clipboard"` — disabled when output is empty.

The `useCopy` composable shows a Naive UI toast on copy (default `"Copied to the clipboard"` text since no custom message is supplied).

## Logic / Algorithm
Implemented in `text-to-unicode.service.ts`:

```ts
function convertTextToUnicode(text: string): string {
  return text.split('').map(value => `&#${value.charCodeAt(0)};`).join('');
}

function convertUnicodeToText(unicodeStr: string): string {
  return unicodeStr.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec));
}
```

**Encoding (text → unicode):**
1. Split the input string into UTF-16 code units (`text.split('')`).
2. For each code unit, format it as `&#<charCode>;` where `charCode` is the numeric value of `String.prototype.charCodeAt(0)` (decimal).
3. Concatenate all encoded tokens (no separator between them).
4. The Vue layer guards: empty / whitespace-only input short-circuits to `''` (`inputText.value.trim() === ''`).

**Decoding (unicode → text):**
1. Apply the regex `/&#(\d+);/g` globally to the input.
2. For each match, parse the captured decimal digits and convert via `String.fromCharCode(dec)` (which accepts a numeric string and coerces it).
3. Substrings that do not match the pattern are left untouched in the output.
4. The Vue layer applies the same empty-trim guard to the input.

The component uses `computed` for both outputs so updates are live; copy actions are wired with `useCopy({ source: ... })`.

## Dependencies
- `@vicons/tabler` — `TextWrap` icon.
- `@/composable/copy` — clipboard helper.
- Vue 3 reactivity (`ref`, `computed`).
- No external encoding libraries; the implementation uses native `String.charCodeAt` / `String.fromCharCode` and a regex.

## Edge Cases & Validation
- **Empty input:** Both directions short-circuit to `''` and disable their copy buttons.
- **Whitespace-only input:** Treated as empty due to `.trim() === ''` check.
- **Astral / non-BMP characters (emoji, etc.):** `split('')` and `charCodeAt` operate on UTF-16 code units, so a code point above `U+FFFF` (e.g. `"😀"`, `U+1F600`) is split into a surrogate pair and emitted as two separate `&#...;` tokens (`&#55357;&#56832;`). Round-tripping is correct because `String.fromCharCode(d1) + String.fromCharCode(d2)` reconstructs the original surrogate pair, but each individual entity is **not** a valid HTML numeric reference for the underlying code point (HTML expects the actual code point in either decimal or hex, not the surrogate halves).
- **Decoding malformed entities:** Tokens that do not match `&#(\d+);` exactly (e.g. `&#x41;` hex form, `&amp;`, `&#65` without trailing semicolon) are left in place verbatim. There is no validation that flags malformed input.
- **Decoding very large numbers:** The regex captures arbitrarily many digits; `String.fromCharCode` will mod-65536 them implicitly, which can lead to nonsensical characters but no error.
- **No upper limit** on input length; computed update runs on every keystroke.

## Examples
- Encoding: `"A"` → `"&#65;"`.
- Encoding: `"it-tools"` → `"&#105;&#116;&#45;&#116;&#111;&#111;&#108;&#115;"` (asserted by the e2e test).
- Encoding (full): `"linke the string convert to unicode"` → `"&#108;&#105;&#110;&#107;&#101;&#32;&#116;&#104;&#101;&#32;&#115;&#116;&#114;&#105;&#110;&#103;&#32;&#99;&#111;&#110;&#118;&#101;&#114;&#116;&#32;&#116;&#111;&#32;&#117;&#110;&#105;&#99;&#111;&#100;&#101;"` (asserted by the unit test).
- Decoding: `"&#65;"` → `"A"`.
- Decoding mixed: `"hi &#65;!"` → `"hi A!"` (non-matching text passes through).
- Decoding empty: `""` → `""`.

## File Structure
- `index.ts` — tool descriptor (name, path, description, keywords, icon, `createdAt`).
- `text-to-unicode.service.ts` — pure conversion functions.
- `text-to-unicode.service.test.ts` — Vitest unit tests covering both directions and the empty case.
- `text-to-unicode.e2e.spec.ts` — Playwright e2e tests asserting page title and round-trip.
- `text-to-unicode.vue` — two-card UI with bidirectional converters.

## Notes
- Title and description are i18n-translated; static UI labels and toast text are not translated.
- No persistence (no `useStorage`); state is in-memory only.
- The component does not use `defineTool`'s `redirectFrom`; only the tool's primary path is exposed.
- Encoding always emits decimal entities, never hexadecimal (`&#x...;`); decoding likewise only handles decimal.
