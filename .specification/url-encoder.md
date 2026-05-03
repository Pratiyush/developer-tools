# URL Encoder

## Overview
- **Path:** `/url-encoder`
- **Category:** Web
- **Description:** Encode/decode URL-formatted strings (also known as "percent-encoded"). The translated description reads: "Encode text to URL-encoded format (also known as 'percent-encoded'), or decode from it."
- **Title (translated):** "Encode/decode URL-formatted strings"
- **Keywords:** `url`, `encode`, `decode`, `percent`, `%20`, `format`
- **Redirect from:** None
- **Icon:** `Link` from `@vicons/tabler`
- **Created at:** Not specified

## Purpose
A bidirectional URL component encoder/decoder. Provides two side-by-side cards: one that takes plain text and percent-encodes it via `encodeURIComponent`, and one that takes a percent-encoded string and decodes it via `decodeURIComponent`. Common uses: preparing query-string values, decoding email/Slack-mangled URLs, debugging webhook payloads, or handling embedded special characters (spaces become `%20`, `:` becomes `%3A`, etc.).

## Inputs
| Card | Field | Type | Default | Validation |
| ---- | ----- | ---- | ------- | ---------- |
| Encode | `encodeInput` | `string` (multiline textarea, autosize, 2 rows) | `'Hello world :)'` | Must not throw when passed to `encodeURIComponent`. Failure message: **"Impossible to parse this string"**. |
| Decode | `decodeInput` | `string` (multiline textarea, autosize, 2 rows) | `'Hello%20world%20%3A)'` | Must not throw when passed to `decodeURIComponent`. Failure message: **"Impossible to parse this string"**. |

Both inputs use `c-input-text` with `multiline`, `autosize`, `rows="2"` and the `validation` prop wired from `useValidation`.

## Outputs
| Card | Field | Type | Description |
| ---- | ----- | ---- | ----------- |
| Encode | `encodeOutput` | `string` (computed, readonly multiline) | `encodeURIComponent(encodeInput)`; falls back to `''` on throw. |
| Decode | `decodeOutput` | `string` (computed, readonly multiline) | `decodeURIComponent(decodeInput)`; falls back to `''` on throw. |

Each output is a separate read-only `c-input-text` followed by a centred "Copy" `c-button`.

## UI / Components
Two stacked `c-card`s.

**Card 1 — `title="Encode"`:**
- `c-input-text v-model:value="encodeInput"` — label `"Your string :"`, validation, multiline, autosize, placeholder `"The string to encode"`, `rows="2"`, `mb-3`.
- `c-input-text :value="encodeOutput"` — label `"Your string encoded :"`, multiline, autosize, readonly, placeholder `"Your string encoded"`, `rows="2"`, `mb-3`.
- `c-button` `"Copy"` (centred via `flex justify-center`) — invokes `copyEncoded()`. Toast: `"Encoded string copied to the clipboard"`.

**Card 2 — `title="Decode"`:**
- Same shape, swapping in `decodeInput`/`decodeOutput`. Labels `"Your encoded string :"` / `"Your string decoded :"`. Placeholders `"The string to decode"` / `"Your string decoded"`. Toast: `"Decoded string copied to the clipboard"`.

There are no other configuration controls or tabs.

## Logic / Algorithm
```ts
const encodeInput = ref('Hello world :)');
const encodeOutput = computed(() => withDefaultOnError(() => encodeURIComponent(encodeInput.value), ''));

const encodedValidation = useValidation({
  source: encodeInput,
  rules: [
    {
      validator: value => isNotThrowing(() => encodeURIComponent(value)),
      message: 'Impossible to parse this string',
    },
  ],
});

const decodeInput = ref('Hello%20world%20%3A)');
const decodeOutput = computed(() => withDefaultOnError(() => decodeURIComponent(decodeInput.value), ''));

const decodeValidation = useValidation({ ... });
```

Step-by-step:
1. **Encoding direction:** On every change to `encodeInput`, the computed runs `encodeURIComponent(encodeInput)`. `encodeURIComponent` percent-encodes every character except the unreserved set `A-Z a-z 0-9 - _ . ! ~ * ' ( )`. Multi-byte UTF-8 sequences are produced for non-ASCII characters.
2. **Decoding direction:** On every change to `decodeInput`, the computed runs `decodeURIComponent(decodeInput)`. Triplets of `%XX` are interpreted as UTF-8 byte sequences and decoded; any malformed escape (e.g. `%G1`, `%2`, lone `%`) throws `URIError`.
3. **Error handling:** Both computeds use `withDefaultOnError(() => ..., '')` so a thrown `URIError` collapses the output to `''`. The corresponding `useValidation` rule independently surfaces the inline error `"Impossible to parse this string"`.
4. Copy buttons are wired with `useCopy({ source: encodeOutput | decodeOutput, text: <toast> })`. (Note: the buttons are not disabled when output is empty.)

`encodeURIComponent` cannot fail on any well-formed UTF-16 string — it is essentially total — but the validator is implemented symmetrically with the decode side.

## Dependencies
- `@/composable/copy` — clipboard helper (`useCopy`).
- `@/composable/validation` — `useValidation` hook used to surface inline errors.
- `@/utils/boolean` — `isNotThrowing`.
- `@/utils/defaults` — `withDefaultOnError`.
- `@vicons/tabler` — `Link` icon.
- Native browser APIs `encodeURIComponent` / `decodeURIComponent`. No third-party encoding library.

## Edge Cases & Validation
- **Empty input:** Output is `''`; copy button is **not** disabled (it will still copy an empty string).
- **Invalid percent-encoding (decode):** A lone `%`, a `%X` not followed by two hex digits, or a `%XX` that does not form valid UTF-8 (e.g. `%C3%28`) throws `URIError`. Output is `''` and validator displays `"Impossible to parse this string"`.
- **Surrogate pairs (encode):** `encodeURIComponent` correctly re-encodes a paired surrogate (e.g. `"😀"` → `%F0%9F%98%80`). A **lone surrogate** (e.g. `'\uD83D'`) throws `URIError` and the validator fires.
- **Reserved characters:** `encodeURIComponent` encodes all reserved URI characters except the unreserved set, including `:`, `/`, `?`, `#`, `&`, `=`. This is stricter than `encodeURI`, which preserves those characters.
- **Already-encoded input (encode side):** Each `%` becomes `%25`, so double-encoding is possible if the user pastes already-encoded text — by design.
- **Mixed encoded + plain (decode side):** `%20` decodes to space, while non-`%` characters pass through unchanged.
- **Whitespace input (encode):** Spaces become `%20`. Newlines become `%0A`, etc.

## Examples
- Encode: `"Hello world :)"` → `"Hello%20world%20%3A)"` (default).
- Decode: `"Hello%20world%20%3A)"` → `"Hello world :)"` (default).
- Encode: `"https://example.com/path?key=value&q=hi"` → `"https%3A%2F%2Fexample.com%2Fpath%3Fkey%3Dvalue%26q%3Dhi"`.
- Encode: `"café 😀"` → `"caf%C3%A9%20%F0%9F%98%80"`.
- Decode invalid: `"%G1"` → output `''`; validator shows `"Impossible to parse this string"`.

## File Structure
- `index.ts` — Tool descriptor (name, path, description, keywords, icon).
- `url-encoder.vue` — Single-file Vue component with both encode and decode cards, using native browser URI functions.

No services file, no tests (`url-encoder` has neither a unit test nor an e2e spec in this folder).

## Notes
- This tool uses `encodeURIComponent` (not `encodeURI`); it encodes URL **components** (i.e. query-string values, path segments), not entire URLs.
- The validation rule is a soft guard: since `encodeURIComponent` essentially never throws on a normal string, the encode-side validator is mostly defensive.
- Title is i18n-translated as `"Encode/decode URL-formatted strings"`; the UI labels and toast messages are hardcoded English.
- No persistence; default values are seeded inline so the tool always renders a worked example on first load.
- Copy buttons are not gated by output presence — they will always copy whatever the output currently is, including `''`.
