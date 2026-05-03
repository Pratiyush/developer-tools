# Text to ASCII binary

## Overview
- **Path:** `/text-to-binary`
- **Category:** Converter
- **Description:** Convert text to its ASCII binary representation and vice-versa.
- **Keywords:** text, to, binary, converter, encode, decode, ascii
- **Redirect from:** (none)
- **Created at:** 2023-10-15

## Purpose
Bidirectional converter between plain text and its ASCII binary representation (one space-separated 8-bit octet per character). Useful for educational demos, low-level encoding visualizations, encoding text inside puzzle/CTF challenges, or quickly inspecting the bit pattern of an arbitrary character. Two independent panels are presented — one for each direction — and inputs/outputs do not interfere with each other.

## Inputs
There are two independent forms in two `<c-card>`s.

### Card 1 — Text → Binary
| Name | Type | Default | Validation |
|------|------|---------|-----------|
| `inputText` | `string` (multiline `<c-input-text autosize autofocus raw-text>`) | `''` | None — any string accepted. Auto-focuses on mount. `test-id="text-to-binary-input"`. |

### Card 2 — Binary → Text
| Name | Type | Default | Validation |
|------|------|---------|-----------|
| `inputBinary` | `string` (multiline `<c-input-text autosize raw-text>` with validation rule) | `''` | Validation rule: `convertAsciiBinaryToText` must not throw — i.e. after stripping non-`0/1` characters, the remaining length must be a multiple of 8. Error message: `"Binary should be a valid ASCII binary string with multiples of 8 bits"`. `test-id="binary-to-text-input"`. |

## Outputs
Each card has a read-only output and a copy button.

| Name | Type | Description |
|------|------|-------------|
| `binaryFromText` | `string` (computed) | `convertTextToAsciiBinary(inputText)` — space-separated 8-bit binary octets for each character of the input. `test-id="text-to-binary-output"`. |
| `textFromBinary` | `string` (computed, error-tolerant) | `withDefaultOnError(() => convertAsciiBinaryToText(inputBinary), '')` — when the binary is invalid, falls back to `''`. `test-id="binary-to-text-output"`. |

## UI / Components
Two stacked `<c-card>`s:

### Card 1 — "Text to ASCII binary"
1. `<c-input-text>` for `inputText` — multiline, autosize, autofocus, raw-text, placeholder `"e.g. 'Hello world'"`, label `"Enter text to convert to binary"`.
2. `<c-input-text>` for `binaryFromText` — multiline, autosize, raw-text, **read-only**, label `"Binary from your text"`, placeholder `"The binary representation of your text will be here"`.
3. Centered `<c-button>` `"Copy binary to clipboard"`, disabled when `binaryFromText` is empty.

### Card 2 — "ASCII binary to text"
1. `<c-input-text>` for `inputBinary` — multiline, autosize, raw-text, with the validation rule above, placeholder `"e.g. '01001000 01100101 01101100 01101100 01101111'"`, label `"Enter binary to convert to text"`.
2. `<c-input-text>` for `textFromBinary` — multiline, autosize, raw-text, **read-only**, label `"Text from your binary"`, placeholder `"The text representation of your binary will be here"`.
3. Centered `<c-button>` `"Copy text to clipboard"`, disabled when `textFromBinary` is empty.

## Logic / Algorithm
All logic lives in `text-to-binary.models.ts`:

```ts
function convertTextToAsciiBinary(text: string, { separator = ' ' }: { separator?: string } = {}): string {
  return text
    .split('')
    .map(char => char.charCodeAt(0).toString(2).padStart(8, '0'))
    .join(separator);
}

function convertAsciiBinaryToText(binary: string): string {
  const cleanBinary = binary.replace(/[^01]/g, '');
  if (cleanBinary.length % 8) {
    throw new Error('Invalid binary string');
  }
  return cleanBinary
    .split(/(\d{8})/)
    .filter(Boolean)
    .map(binary => String.fromCharCode(Number.parseInt(binary, 2)))
    .join('');
}
```

### Text → Binary
1. Iterate over the text by UTF-16 code unit (`text.split('')`).
2. For each character, take `charCodeAt(0)` (UTF-16 code unit value), convert to base-2, left-pad with `'0'` to 8 digits.
3. Join with the separator (default `' '`, hard-coded `' '` from the Vue caller).

### Binary → Text
1. Strip everything that isn't `0` or `1` (`/[^01]/g`).
2. If the cleaned length is not a multiple of 8, throw `"Invalid binary string"`.
3. Split the cleaned string on captured 8-digit groups using `/(\d{8})/` (the capture group preserves the matches in the output array). Empty strings between groups are dropped via `.filter(Boolean)`.
4. Parse each 8-digit group as a base-2 integer and pass to `String.fromCharCode`. Join the resulting characters.

The Vue layer wraps the decode with `withDefaultOnError` so a thrown error becomes an empty string output (the validation rule already shows the user a message). The validation function uses `isNotThrowing` from `@/utils/boolean`.

## Dependencies
- **`@/utils/defaults#withDefaultOnError`** — converts thrown decode errors to `''`.
- **`@/utils/boolean#isNotThrowing`** — wraps the decode call for the input validator.
- **`@/composable/copy#useCopy`** — clipboard helper for both copy buttons.
- **Vue 3** (`ref`, `computed`).
- **Custom `c-*`**: `c-card`, `c-input-text`, `c-button`.

## Edge Cases & Validation
- **Empty input** in either direction → empty output. Copy button disabled.
- **Non-ASCII characters in text input** — `charCodeAt(0)` returns the UTF-16 code unit. ASCII characters (`< 128`) fit in 7 bits; `padStart(8, '0')` produces a leading zero. Characters with code unit values `≥ 256` will overflow 8 bits, producing a binary string longer than 8 digits for that character — at which point the round-trip will not work because the decoder reads exactly 8 bits at a time. So:
  - Pure ASCII input → 8-bit octets, perfect round-trip.
  - Latin-1 supplement (128–255) → still fits in 8 bits.
  - Anything ≥ 256 (e.g. `'é'` may be one code unit but encodes to 9–16 bits depending on character) → `padStart(8, '0')` is a no-op when the value is already ≥ 8 bits, producing a longer-than-8 sequence and breaking round-trips. This is **a known limitation** of the tool.
  - Surrogate pairs (e.g. emoji like `'😀'`) → split into two UTF-16 code units, each handled separately.
- **Garbage characters in binary input** — silently stripped by `/[^01]/g`. The test suite explicitly verifies: `convertAsciiBinaryToText('  01000 001garbage')` → `'A'`.
- **Binary length not a multiple of 8** → `convertAsciiBinaryToText` throws `'Invalid binary string'`. The Vue input shows the validation message; the output stays `''`.
- **Whitespace inside binary** is stripped by the `[^01]` filter, so any separator (space, newline, tab) works.
- **Pre-trimming of the binary** is destructive (e.g. `'01001x'` → `'01001'`, length 5, throws), but the user's view shows their original input unchanged.
- **Performance** — both functions run on every keystroke in their respective panel, O(n). No debounce.

## Examples

### Text → Binary
| `inputText` | `binaryFromText` |
|-------------|------------------|
| `''` | `''` |
| `'A'` | `'01000001'` |
| `'hello'` | `'01101000 01100101 01101100 01101100 01101111'` |
| `'it-tools'` | `'01101001 01110100 00101101 01110100 01101111 01101111 01101100 01110011'` |
| `'😀'` | `'11011000 00111101 11011110 00000000'` (surrogate pair, two UTF-16 code units; bottom byte of high surrogate fits, but high byte of high surrogate is `0xD8` → `'11011000'`, etc.) |

### Binary → Text
| `inputBinary` | `textFromBinary` |
|---------------|------------------|
| `'01000001'` | `'A'` |
| `'01101000 01100101 01101100 01101100 01101111'` | `'hello'` |
| `'01101001 01110100 00101101 01110100 01101111 01101111 01101100 01110011'` | `'it-tools'` |
| `'  01000 001garbage'` | `'A'` (cleaned, decoded) |
| `'010000011'` | `''` (invalid — length 9; validation message shown) |
| `'1'` | `''` (invalid — length 1; validation message shown) |

## File Structure
| File | Purpose |
|------|---------|
| `index.ts` | Tool registration metadata (name, path, description, keywords, icon, component loader, `createdAt`). |
| `text-to-binary.vue` | Vue UI: two cards with input/output, validation rule, copy buttons. |
| `text-to-binary.models.ts` | Pure functions `convertTextToAsciiBinary` and `convertAsciiBinaryToText`. |
| `text-to-binary.models.test.ts` | Vitest unit tests for both directions, custom separators, garbage stripping, invalid lengths. |
| `text-to-binary.e2e.spec.ts` | Playwright end-to-end test verifying the page title and round-trip conversion of `'it-tools'` via the test IDs. |

## Notes
- **i18n:** title and description come from `tools.text-to-binary.{title,description}`.
- **Page title** (per Playwright spec): `"Text to ASCII binary - IT Tools"`.
- **Persistence:** none.
- **Icon:** `Binary` from `@vicons/tabler`.
- **`raw-text`** on every input means content isn't HTML-encoded for storage; the textareas display literal characters.
- **`autosize`** lets each textarea grow with its content.
- **Test IDs** (`text-to-binary-input`, `text-to-binary-output`, `binary-to-text-input`, `binary-to-text-output`) — exposed for E2E testing.
- **Tooling-friendly** — has both unit and Playwright e2e tests, which is somewhat unusual for tools in this repo (most have only unit tests).
- **Limitation:** the name says "ASCII binary" and the algorithm assumes 8-bit characters; non-ASCII inputs may not round-trip cleanly. Users intending to encode UTF-8 should encode to bytes first via a separate tool.
