# Hmac generator

## Overview
- **Path:** `/hmac-generator`
- **Category:** Crypto
- **Description:** Computes a hash-based message authentication code (HMAC) using a secret key and your favorite hashing function.
- **Keywords:** `hmac`, `generator`, `MD5`, `SHA1`, `SHA256`, `SHA224`, `SHA512`, `SHA384`, `SHA3`, `RIPEMD160`
- **Redirect from:** none
- **Icon:** `ShortTextRound` (from `@vicons/material`)

## Purpose
Produces an HMAC (keyed-hash message authentication code) for a given plain text + secret key, using one of eight hash functions. HMACs are used to verify both the integrity and the authenticity of a message — useful for signing webhook payloads, API requests (e.g. AWS-style signatures), or generating per-record signatures over a shared secret. The tool runs purely client-side via `crypto-js`.

## Inputs

| Field | Type | Default | Validation |
|---|---|---|---|
| `plainText` | string (multiline) | `''` | Free text. 3-row autosize `c-input-text`, `raw-text`, `autofocus`. |
| `secret` | string | `''` | Free text, single line, clearable. Note: an empty secret is still valid input but produces a constant value per algorithm — *not* recommended in practice. |
| `hashFunction` | enum | `'SHA256'` | One of `MD5`, `RIPEMD160`, `SHA1`, `SHA3`, `SHA224`, `SHA256`, `SHA384`, `SHA512`. (Note: enum value order on screen follows `Object.keys(algos)` which is `MD5, RIPEMD160, SHA1, SHA3, SHA224, SHA256, SHA384, SHA512`.) |
| `encoding` | enum | `'Hex'` | One of `'Bin'`, `'Hex'`, `'Base64'`, `'Base64url'`. Not URL-persisted (unlike hash-text). |

## Outputs

| Field | Type | Description |
|---|---|---|
| `hmac` | string | `formatWithEncoding(algos[hashFunction](plainText, secret), encoding)`. Single output value. |
| Copy button | action | A "Copy HMAC" `c-button` invokes `useCopy({ source: hmac })`. |

## UI / Components
- Vertical flex container (`flex flex-col gap-4`).
- `c-input-text` multiline, raw-text, autosize, 3 rows, label "Plain text to compute the hash".
- `c-input-text` single-line, raw-text, clearable, label "Secret key".
- Row of two `c-select`s side-by-side:
  - "Hashing function" — populated from `Object.keys(algos)`.
  - "Output encoding" — same four options as in hash-text:
    - `Binary (base 2)` → `Bin`
    - `Hexadecimal (base 16)` → `Hex`
    - `Base64 (base 64)` → `Base64`
    - `Base64-url (base 64 with url safe chars)` → `Base64url`
- `<input-copyable>` (multiline / `type="textarea"`, label "HMAC of your text") bound to `hmac`.
- Centered "Copy HMAC" `c-button` triggering the `useCopy` callback.

## Logic / Algorithm
1. Build the algorithm map mapping logical names → `crypto-js` HMAC variants:
   ```ts
   const algos = {
     MD5: HmacMD5,
     RIPEMD160: HmacRIPEMD160,
     SHA1: HmacSHA1,
     SHA3: HmacSHA3,
     SHA224: HmacSHA224,
     SHA256: HmacSHA256,
     SHA384: HmacSHA384,
     SHA512: HmacSHA512,
   } as const;
   ```
2. Compute reactively:
   ```ts
   const hmac = computed(() =>
     formatWithEncoding(algos[hashFunction.value](plainText.value, secret.value), encoding.value),
   );
   ```
3. `formatWithEncoding`: if `encoding === 'Bin'`, render through `convertHexToBin(words.toString(enc.Hex))` (imported from `../hash-text/hash-text.service`); otherwise `words.toString(enc[encoding])`.
4. `useCopy({ source: hmac })` exposes `copy()` that reads the current value into the clipboard. `<input-copyable>` already has its own click-to-copy; the explicit button is a redundancy/affordance.

## Dependencies
- `crypto-js` — `HmacMD5`, `HmacSHA1`, `HmacSHA3`, `HmacSHA224`, `HmacSHA256`, `HmacSHA384`, `HmacSHA512`, `HmacRIPEMD160`, `enc.Hex`, `enc.Base64`, `enc.Base64url`.
- `@/composable/copy` — `useCopy` clipboard helper.
- Re-uses `convertHexToBin` from `../hash-text/hash-text.service.ts`.
- Project wrappers: `c-input-text`, `c-select`, `c-button`, `input-copyable`.

## Edge Cases & Validation
- **Empty plain text + empty secret**: still produces a deterministic HMAC for the chosen algorithm (e.g., HMAC-SHA256 of empty text/empty key in hex is `b613679a0814d9ec772f95d778c35fc5ff1697c493715653c6c712144292c5ad`).
- **Empty secret only**: works but should not be relied on for authenticity.
- **Unicode inputs**: same caveat as hash-text — `crypto-js` interprets JS strings as UTF-16 code units, not UTF-8 bytes; results may differ from server-side libraries that pre-encode UTF-8.
- **Very long inputs**: synchronous; UI may hitch on huge messages.
- **No persistence** of values across reloads.

## Examples

**HMAC-SHA256, key=`"secret"`, msg=`"hello"`, hex**
- Output: `88aab3ede8d3adf94d26ab90d3bafd4a2083070c3bcce9c014ee04a443847c0b`

**HMAC-MD5, key=`""`, msg=`""`, hex**
- Output: `74e6f7298a9c2d168935f58c001bad88`

**HMAC-SHA512, key=`"key"`, msg=`"The quick brown fox jumps over the lazy dog"`, base64**
- Output: `tF3J7BqIDlcSJyy/N86OzIcfYkHtDGpIYWvHFtcEWr5BYR4mcVUFJoyDRCpQ7nGY1iVIWB9LIfLnTkgu1qB7Cw==`

**Bin encoding, HMAC-MD5, msg=`""`, key=`""`**
- Hex `74e6f7298a9c2d168935f58c001bad88` → 128-char binary string `01110100 11100110 11110111 …` (bits run together without spaces).

## File Structure
| File | Purpose |
|---|---|
| `index.ts` | Tool registration: name, path `/hmac-generator`, keywords, lazy-loads `hmac-generator.vue`. |
| `hmac-generator.vue` | Single component containing the algorithm map, inputs, computed `hmac`, and copy button. Imports `convertHexToBin` from the sibling hash-text service. |

## Notes
- **i18n** — title and description from `tools.hmac-generator.*`.
- No URL persistence (consider that the secret would otherwise leak into the URL — intentional).
- No tests in this folder; relies on `crypto-js`'s own correctness and on the shared `convertHexToBin` test in hash-text.
- The order of `algos` keys (`MD5, RIPEMD160, SHA1, SHA3, SHA224, SHA256, SHA384, SHA512`) is what users see in the dropdown.
