# Encrypt / decrypt text

## Overview
- **Path:** `/encryption`
- **Category:** Crypto
- **Description:** Encrypt clear text and decrypt ciphertext using crypto algorithms like AES, TripleDES, Rabbit or RC4.
- **Keywords:** `cypher`, `encipher`, `text`, `AES`, `TripleDES`, `Rabbit`, `RC4`
- **Redirect from:** `/cypher`
- **Icon:** `Lock` (from `@vicons/tabler`)

## Purpose
This tool provides a two-pane utility that lets the user symmetrically encrypt arbitrary clear text into a passphrase-protected ciphertext and, in a separate panel, decrypt previously produced ciphertext back to its plain form. It is useful for quick-and-dirty obfuscation of secrets during demos, sharing snippets between developers, or generating test fixtures, while making the choice of cipher (AES, TripleDES, Rabbit, RC4) explicit. The tool runs entirely in-browser via `crypto-js`, so the secret key and plaintext never leave the client.

## Inputs

### Encrypt panel
| Field | Type | Default | Validation |
|---|---|---|---|
| `cypherInput` | multiline string | `'Lorem ipsum dolor sit amet'` | Free text; raw (no HTML escaping). Rendered in a `c-input-text` with 4 rows, autosize, monospace. |
| `cypherSecret` | string | `'my secret key'` | Free string, clearable, raw. Used as the passphrase fed to the cipher (`crypto-js` derives the key/IV via OpenSSL-compatible KDF). |
| `cypherAlgo` | enum | `'AES'` | One of: `AES`, `TripleDES`, `Rabbit`, `RC4` (the keys of the `algos` map). |

### Decrypt panel
| Field | Type | Default | Validation |
|---|---|---|---|
| `decryptInput` | multiline string | `'U2FsdGVkX1/EC3+6P5dbbkZ3e1kQ5o2yzuU0NHTjmrKnLBEwreV489Kr0DIB+uBs'` | OpenSSL-compatible base64 ciphertext. Free-text; if it cannot be decrypted, an alert is shown. |
| `decryptSecret` | string | `'my secret key'` | Same as `cypherSecret`; must match the secret used for encryption. |
| `decryptAlgo` | enum | `'AES'` | Same set as `cypherAlgo`; must match the algorithm used for encryption. |

## Outputs

| Field | Type | Description |
|---|---|---|
| `cypherOutput` | string | Base64-encoded OpenSSL-formatted ciphertext for `cypherInput` produced by `algos[cypherAlgo].encrypt(input, secret).toString()`. Re-rendered reactively. |
| `decryptOutput` | string | UTF-8 decoded plaintext from `algos[decryptAlgo].decrypt(input, secret).toString(enc.Utf8)`. Empty string when an error is thrown. |
| `decryptError` | string \| null | Error message captured by `computedCatch`. When present, an `<c-alert type="error">` block replaces the output panel with the message "Unable to decrypt your text". |

## UI / Components
- Two stacked `c-card`s (titled `Encrypt` and `Decrypt`).
- Each card shows a 2-column flex layout: left column is the textarea (`c-input-text` `multiline raw-text monospace autosize flex-1`, 4 rows); right column has the secret-key `c-input-text` (clearable) and an algorithm `c-select` populated from `Object.keys(algos)`.
- Below each card sits a read-only output `c-input-text` (3 rows, autosize, monospace) showing either the cipher result or the decrypted text.
- The Decrypt card also conditionally shows a `<c-alert type="error" title="Error while decrypting">` when `decryptError` is truthy.
- All updates are reactive — there is no submit button; the outputs recompute as the user edits.

## Logic / Algorithm
1. Define `const algos = { AES, TripleDES, Rabbit, RC4 }` from `crypto-js`.
2. Encryption:
   ```ts
   cypherOutput = algos[cypherAlgo].encrypt(cypherInput, cypherSecret).toString();
   ```
   `crypto-js` returns a `CipherParams` whose default `toString()` yields the base64 of `Salted__ + 8-byte salt + ciphertext` (OpenSSL-compatible format).
3. Decryption is wrapped in `computedCatch` so thrown errors flow to `decryptError` instead of crashing the view:
   ```ts
   const [decryptOutput, decryptError] = computedCatch(
     () => algos[decryptAlgo].decrypt(decryptInput, decryptSecret).toString(enc.Utf8),
     { defaultValue: '', defaultErrorMessage: 'Unable to decrypt your text' },
   );
   ```
4. UTF-8 decoding via `enc.Utf8` will throw a `Malformed UTF-8 data` error if the wrong key/algorithm is used — `computedCatch` converts that into a friendly alert.

## Dependencies
- `crypto-js` — provides `AES`, `TripleDES`, `Rabbit`, `RC4`, and `enc.Utf8`. AES default is CBC + PKCS#7 padding with OpenSSL passphrase-derived key/IV.
- `@/composable/computed/catchedComputed` — local `computedCatch` helper for safe reactive error handling.
- Naive UI / project `c-*` wrappers (`c-card`, `c-input-text`, `c-select`, `c-alert`).

## Edge Cases & Validation
- **Empty plaintext**: `crypto-js` still produces a non-empty ciphertext containing only the salt; output renders normally.
- **Empty secret**: `crypto-js` accepts an empty key string and emits ciphertext, but it cannot be decrypted with anything else.
- **Wrong algorithm at decrypt time**: throws inside `enc.Utf8` decoding → `decryptError` shows the alert.
- **Malformed base64 ciphertext**: `decrypt` either returns garbage WordArray (decoded as malformed UTF-8) or throws — both routed to the alert.
- **Mismatched secret**: same as wrong algorithm — UTF-8 decoding fails.
- The tool does **not** validate that the algorithm in the Encrypt panel matches the Decrypt panel; users must keep both in sync manually. The two panels are independent.

## Examples

**Encrypt with AES**
- Input: `Lorem ipsum dolor sit amet` + secret `my secret key` + AES
- Output (varies due to random salt): `U2FsdGVkX1+...` (base64, OpenSSL format)

**Decrypt the default ciphertext**
- Input: `U2FsdGVkX1/EC3+6P5dbbkZ3e1kQ5o2yzuU0NHTjmrKnLBEwreV489Kr0DIB+uBs` + secret `my secret key` + AES
- Output: `Lorem ipsum dolor sit amet`

**Wrong key**
- Same ciphertext + secret `wrong` + AES → `decryptError = 'Unable to decrypt your text'`, alert shown.

## File Structure
| File | Purpose |
|---|---|
| `index.ts` | Tool registration: name, path `/encryption`, redirect from `/cypher`, keywords, AES/TripleDES/Rabbit/RC4 listing, lazy-loads `encryption.vue`. |
| `encryption.vue` | Sole component: two `c-card`s for encrypt and decrypt, all logic inline using `crypto-js` and `computedCatch`. |

## Notes
- **No persistence** — values reset on reload (no `useStorage`).
- **i18n** — title and description come from `tools.encryption.*` (`Encrypt / decrypt text`).
- The tool is alias-routed: legacy `/cypher` URLs redirect here.
- No copy buttons in this tool (output is a read-only textarea — selection-only).
- Computation is fully synchronous and runs on every keystroke — fine for short inputs but `crypto-js` is JS-pure and not WebCrypto-backed.
