# Base64 String Encoder / Decoder

## Overview
- **Path:** `/base64-string-converter`
- **Category:** Converter
- **Description:** Simply encode and decode strings into their base64 representation.
- **Keywords:** `base64`, `converter`, `conversion`, `web`, `data`, `format`, `atob`, `btoa`
- **Redirect from:** `/file-to-base64`, `/base64-converter`
- **Icon:** `FileDigit` (from `@vicons/tabler`)
- **i18n key:** `tools.base64-string-converter.title` / `.description`

## Purpose
Provides bidirectional plain-text ↔ base64 conversion with optional URL-safe encoding (`+` → `-`, `/` → `_`, padding stripped). It is intended for quick string-level encoding tasks (form data, JWT segments, URL fragments) rather than binary files (use the Base64 file converter for that).

## Inputs

### "String to base64" card
| Field | Type | Default | Validation / Notes |
|-------|------|---------|--------------------|
| `encodeUrlSafe` | boolean | `false` | Persisted in localStorage under key `base64-string-converter--encode-url-safe`. When true, the encoded output replaces `+`/`/` with `-`/`_` and strips `=` padding. |
| `textInput` | string (multiline, 5 rows) | `''` | Treated as `raw-text` (no rich-text/HTML). |

### "Base64 to string" card
| Field | Type | Default | Validation / Notes |
|-------|------|---------|--------------------|
| `decodeUrlSafe` | boolean | `false` | Persisted under key `base64-string-converter--decode-url-safe`. When true, the validator and decoder accept URL-safe input. |
| `base64Input` | string (multiline, 5 rows) | `''` | Validated by `isValidBase64(value.trim(), { makeUrlSafe: decodeUrlSafe.value })`. Validation re-runs whenever `decodeUrlSafe` flips. |

## Outputs
| Field | Type | Description |
|-------|------|-------------|
| `base64Output` | string (computed) | `textToBase64(textInput, { makeUrlSafe: encodeUrlSafe })` — read-only textarea + "Copy base64" button. |
| `textOutput` | string (computed) | `withDefaultOnError(() => base64ToText(base64Input.trim(), { makeUrlSafe: decodeUrlSafe }), '')` — read-only textarea + "Copy decoded string" button. Shows empty string on invalid input. |

## UI / Components
- Two stacked `c-card`s.
- Each card has:
  - `n-form-item` with an `n-switch` for the URL-safe toggle.
  - A multiline `c-input-text` (5 rows) for input.
  - A multiline read-only `c-input-text` for the output.
  - A centered `c-button` for copying the output to the clipboard.
- The decode card additionally passes `:validation-rules` and `:validation-watch` so the decoder field reacts to toggle changes.

## Logic / Algorithm

### Encode (text → base64)
```ts
const base64Output = computed(() =>
  textToBase64(textInput.value, { makeUrlSafe: encodeUrlSafe.value })
);
```
`textToBase64` (in `@/utils/base64`) uses `Base64.encode` from `js-base64`. If `makeUrlSafe` is true, it post-processes:
```ts
encoded.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
```

### Decode (base64 → text)
```ts
const textOutput = computed(() =>
  withDefaultOnError(
    () => base64ToText(base64Input.value.trim(), { makeUrlSafe: decodeUrlSafe.value }),
    ''
  )
);
```
`base64ToText`:
1. Calls `isValidBase64` first; throws `'Incorrect base64 string'` on failure.
2. Strips any `data:...;base64,` prefix via `removePotentialDataAndMimePrefix`.
3. If `makeUrlSafe`, runs `unURI` (replaces `-`→`+`, `_`→`/`, drops any chars outside `[A-Za-z0-9+/]`).
4. Calls `Base64.decode`. Any thrown error is rethrown as `'Incorrect base64 string'` and swallowed by `withDefaultOnError` to yield `''`.

### Validation (`isValidBase64`)
The validator does a strict round-trip check: it converts the cleaned string to bytes and re-encodes; the result must match the cleaned input (whitespace ignored in non-URL-safe mode; padding ignored in URL-safe mode).

## Dependencies
- `js-base64` (`Base64.encode`, `Base64.decode`, `Base64.toUint8Array`, `Base64.fromUint8Array`) — wrapped by `@/utils/base64`.
- `@vueuse/core` `useStorage` — persists URL-safe toggles.
- Project composables: `useCopy`, `withDefaultOnError`.
- Naive-UI: `n-form-item`, `n-switch`.
- Project components: `c-card`, `c-input-text`, `c-button`.

## Edge Cases & Validation
- Empty input — output is empty; copy button copies the empty string.
- Whitespace in base64 — stripped by `isValidBase64` (non-URL-safe path) and by `Base64.decode` itself.
- `data:` prefix in input — stripped before decoding/validating.
- Non-ASCII text — `js-base64`'s `Base64.encode` handles full UTF-8 input correctly (unlike native `btoa`).
- URL-safe encoded input given to a non-URL-safe decoder — fails validation; output is empty.
- Padding mismatch — non-URL-safe mode requires padding (`=`); URL-safe mode strips padding from comparison.

## Examples
1. **Round-trip "Hello"**
   - `textInput = "Hello"` → `base64Output = "SGVsbG8="`.
   - Paste `"SGVsbG8="` → `textOutput = "Hello"`.
2. **URL-safe encoding**
   - `textInput = "subjects?ids[]=1"`, `encodeUrlSafe = true` → output `c3ViamVjdHM_aWRzW109MQ` (note: `_` instead of `/`, no `=` padding).
3. **UTF-8 text**
   - `textInput = "日本語"` → `base64Output = "5pel5pys6Kqe"`.

## File Structure
| File | Description |
|------|-------------|
| `index.ts` | Tool metadata, including `redirectFrom: ['/file-to-base64', '/base64-converter']`. |
| `base64-string-converter.vue` | Single-file component containing both encode and decode cards. |

## Notes
- **Persistence:** Both URL-safe toggles persist via `useStorage`. Input/output text does not persist.
- **Backwards compat:** Two redirects (`/file-to-base64`, `/base64-converter`) point to this tool, suggesting it absorbed the role of older standalone pages.
- **i18n:** Title and description use `translate(...)`; per-field labels are hard-coded English.
- **`raw-text`** is set on the encode input to ensure no transformation/escaping happens before encoding.
