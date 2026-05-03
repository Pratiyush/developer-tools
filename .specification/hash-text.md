# Hash text

## Overview
- **Path:** `/hash-text`
- **Category:** Crypto
- **Description:** Hash a text string using the function you need: MD5, SHA1, SHA256, SHA224, SHA512, SHA384, SHA3 or RIPEMD160.
- **Keywords:** `hash`, `digest`, `crypto`, `security`, `text`, `MD5`, `SHA1`, `SHA256`, `SHA224`, `SHA512`, `SHA384`, `SHA3`, `RIPEMD160`
- **Redirect from:** `/hash`
- **Icon:** `EyeOff` (from `@vicons/tabler`)

## Purpose
A single-input, multi-output hashing utility: type a string once and see all eight common cryptographic digests at once, in any of four output encodings. Useful for verifying file/text fingerprints, comparing against published checksums, generating fixtures, or learning the differences between digest sizes. All hashing happens in-browser via `crypto-js` (synchronous, no Web Crypto).

## Inputs

| Field | Type | Default | Validation |
|---|---|---|---|
| `clearText` | string (multiline) | `''` | Free text. Rendered in a 3-row autosize `c-input-text` with `raw-text`, `autofocus`. |
| `encoding` | enum | `'Hex'` | One of `'Bin'`, `'Hex'`, `'Base64'`, `'Base64url'`. **Persisted as URL query parameter** `?encoding=...` via `useQueryParam`. |

## Outputs

For each of the eight algorithms `MD5`, `SHA1`, `SHA256`, `SHA224`, `SHA512`, `SHA384`, `SHA3`, `RIPEMD160` (in that order on screen), the tool renders:

| Output | Type | Description |
|---|---|---|
| Algorithm digest | string | The chosen-encoding rendering of `algos[name](clearText)`. |

Default sizes (in hex chars):
- MD5 → 32, SHA1 → 40, SHA224 → 56, SHA256 → 64, SHA384 → 96, SHA512 → 128, SHA3 → 128 (default `crypto-js` SHA3-512), RIPEMD160 → 40.

## UI / Components
- Single `c-card`.
- Top: `<c-input-text>` multiline, raw-text, 3 rows autosize, autofocus, label "Your text to hash:".
- `<n-divider>`.
- `<c-select>` "Digest encoding" with these options:
  - `Binary (base 2)` → `Bin`
  - `Hexadecimal (base 16)` → `Hex`
  - `Base64 (base 64)` → `Base64`
  - `Base64url (base 64 with url safe chars)` → `Base64url`
- A `v-for` loop over `algoNames` rendering one row per algorithm:
  - `<n-input-group>` with a 120-px wide `<n-input-group-label>` (algorithm name) and an `<InputCopyable>` showing the digest.
  - `InputCopyable` is a project component that wraps the value with a "click to copy" affordance.

## Logic / Algorithm
1. Maintain reactive refs for `clearText` and `encoding`.
2. Define `algos = { MD5, SHA1, SHA256, SHA224, SHA512, SHA384, SHA3, RIPEMD160 }` from `crypto-js`.
3. For each algo: call `algos[algo](clearText)` → returns `lib.WordArray`.
4. `formatWithEncoding(words, encoding)`:
   - If `encoding === 'Bin'`: `convertHexToBin(words.toString(enc.Hex))`.
   - Else: `words.toString(enc[encoding])`.
5. **`convertHexToBin`** (in `hash-text.service.ts`):
   ```ts
   hex.trim().split('').map(byte =>
     parseInt(byte, 16).toString(2).padStart(4, '0')
   ).join('')
   ```
   Each hex character (a nibble) is expanded to its 4-bit binary representation.
6. Recomputed reactively on every keystroke or encoding change. The encoding ref is also synced to the URL via `useQueryParam`, so reloads / shared links retain the choice.

### Tested behaviour (`hash-text.service.test.ts`)
```ts
expect(convertHexToBin('')).toEqual('');
expect(convertHexToBin('FF')).toEqual('11111111');
expect(convertHexToBin('F'.repeat(200))).toEqual('1111'.repeat(200));
expect(convertHexToBin('2123006AD00F694CE120')).toEqual(
  '00100001001000110000000001101010110100000000111101101001010011001110000100100000',
);
```

## Dependencies
- `crypto-js` — `MD5`, `SHA1`, `SHA224`, `SHA256`, `SHA384`, `SHA512`, `SHA3`, `RIPEMD160`, `enc.Hex`, `enc.Base64`, `enc.Base64url`.
- `@/composable/queryParams` — `useQueryParam` synchronises a ref with the URL.
- Project component `InputCopyable` for click-to-copy outputs.
- Naive UI / `c-*` wrappers (`c-card`, `c-input-text`, `c-select`, `n-input-group`, `n-input-group-label`, `n-divider`).
- `vitest` for tests.

## Edge Cases & Validation
- **Empty input**: every algo still produces its empty-string digest (e.g., MD5 `d41d8cd98f00b204e9800998ecf8427e`). The tool always shows eight outputs.
- **Unicode input**: passed verbatim through `crypto-js`, which interprets the JS string as UTF-16 code units and hashes the underlying bytes — common gotcha when comparing against `sha256sum` (UTF-8 byte stream). Users may need to pre-normalise.
- **Very long input**: synchronous hashing on the main thread; could cause UI hitching on huge inputs. There is no chunking.
- **Bin encoding**: produces 4× the hex character count (e.g., MD5 → 128 chars of 0/1).
- **Base64url**: `crypto-js` `enc.Base64url` strips the `=` padding and replaces `+`/`/` with `-`/`_`.
- **No reset / clear button** beyond clearing the textarea manually.

## Examples

**Empty string, Hex**
- MD5 → `d41d8cd98f00b204e9800998ecf8427e`
- SHA1 → `da39a3ee5e6b4b0d3255bfef95601890afd80709`
- SHA256 → `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`
- SHA512 → `cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e`
- RIPEMD160 → `9c1185a5c5e9fc54612808977ee8f548b2258d31`

**`"hello"`, Base64**
- MD5 → `XUFAKrxLKna5cZ2REBfFkg==`
- SHA1 → `qvTGHdzF6KLavt4PO0gs2a6pQ00=`
- SHA256 → `LPJNul+wow4m6DsqxbninhsWHlwfp0JecwQzYpOLmCQ=`

**`"FF"` → Bin via `convertHexToBin('FF')`** = `"11111111"`.

## File Structure
| File | Purpose |
|---|---|
| `index.ts` | Tool registration: name, path `/hash-text`, redirect from `/hash`, full keyword list, lazy-loads `hash-text.vue`. |
| `hash-text.vue` | UI + reactive logic. Iterates the algorithm map and renders `InputCopyable` for each digest. Uses `useQueryParam` to persist encoding to URL. |
| `hash-text.service.ts` | Single helper `convertHexToBin(hex: string): string`. |
| `hash-text.service.test.ts` | Vitest unit tests for `convertHexToBin`. |

## Notes
- **URL persistence**: only `encoding` is in the URL; the input text is not (privacy-friendly default).
- **i18n**: title and description from `tools.hash-text.*`.
- The HMAC tool re-uses `convertHexToBin` from this file — see `hmac-generator.vue`.
- No async / Web Crypto fallback — kept synchronous for parity across all 8 algos.
