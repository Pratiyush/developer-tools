# BIP39 Passphrase Generator

## Overview
- **Path:** `/bip39-generator`
- **Category:** Crypto
- **Description:** Generate a BIP39 passphrase from an existing or random mnemonic, or get the mnemonic from the passphrase.
- **Keywords:** `BIP39`, `passphrase`, `generator`, `mnemonic`, `entropy`
- **Redirect from:** None
- **Icon:** `AlignJustified` (from `@vicons/tabler`)
- **i18n key:** `tools.bip39-generator.title` / `.description`

## Purpose
A BIP-0039 helper for cryptocurrency seed phrases. Users can:
- generate fresh random entropy and view the corresponding mnemonic in any of 10 supported wordlists, or
- type/paste an existing mnemonic and reverse-derive its hex entropy.

The two fields stay synchronized; changing one updates the other through a `computed` two-way getter/setter pattern.

## Inputs
| Field | Type | Default | Validation / Notes |
|-------|------|---------|--------------------|
| `language` | enum | `'English'` | Selects the BIP39 wordlist. Options: `English`, `Chinese simplified`, `Chinese traditional`, `Czech`, `French`, `Italian`, `Japanese`, `Korean`, `Portuguese`, `Spanish`. Searchable dropdown. |
| `entropy` | string (hex) | random 16-byte hex from `generateEntropy()` | Validated on every change: must be `''` or pass both rules: (a) `length` between 16 and 32 inclusive AND a multiple of 4 (i.e. `16, 20, 24, 28, 32`); (b) characters must match `/^[a-fA-F0-9]*$/`. Note: `length` here is the string length in hex chars, not bytes (so 16 hex chars = 8 bytes — these mirror the BIP39 entropy lengths of 128–256 bits in 32-bit increments, but counted as hex chars / 2). |
| `passphrase` | string (mnemonic) | derived from entropy | Validated by `mnemonicToEntropy(value, wordlist)` not throwing. Two-way binding via a `computed` setter. `raw-text`. |

## Outputs
| Field | Type | Description |
|-------|------|-------------|
| `entropy` | string | Hex entropy. When changed, the passphrase recomputes via `entropyToMnemonic(entropy, wordlist)`. |
| `passphrase` | string | BIP39 mnemonic. When the user edits it, the entropy recomputes via `mnemonicToEntropy(value, wordlist)`. Both directions are wrapped in `withDefaultOnError` so an invalid intermediate state does not crash the page. |
| Copy actions | clipboard | Both fields have a "Copy" button that emits a toast. |

## UI / Components
- `n-grid` (3 columns):
  - **Span 1:** `c-select` for language (searchable).
  - **Span 2:** `n-form-item` with feedback/status from `entropyValidation`. Inside, an `n-input-group` containing:
    - `c-input-text` for entropy.
    - `c-button` with `Refresh` icon — calls `refreshEntropy()` to generate new random entropy.
    - `c-button` with `Copy` icon — copies the entropy.
- `n-form-item` for passphrase (full row) with feedback/status from `mnemonicValidation`. Inside, an `n-input-group`:
  - `c-input-text` for the mnemonic (`raw-text`).
  - `c-button` with `Copy` icon — copies the passphrase.

## Logic / Algorithm

### Entropy generation
```ts
const entropy = ref(generateEntropy());
function refreshEntropy() { entropy.value = generateEntropy(); }
```
`generateEntropy()` (from `@it-tools/bip39`) produces a fresh hex entropy string of the default length (16 bytes / 32 hex chars matches BIP39's lower bound for 128 bits → 12-word mnemonic). The exact default depends on the library's implementation.

### Two-way derivation
```ts
const passphrase = computed({
  get() {
    return withDefaultOnError(
      () => entropyToMnemonic(entropy.value, languages[language.value]),
      passphraseInput.value
    );
  },
  set(value) {
    passphraseInput.value = value;
    entropy.value = withDefaultOnError(
      () => mnemonicToEntropy(value, languages[language.value]),
      ''
    );
  },
});
```
- Reading `passphrase` runs `entropyToMnemonic(entropy, wordlist)`. If that throws (invalid entropy), it falls back to the user's typed string `passphraseInput`.
- Writing `passphrase` stores the user's typed text in `passphraseInput` then attempts to reverse-derive the entropy; on failure the entropy becomes the empty string.

### Validation
Entropy validators:
1. `value === '' || (length <= 32 && length >= 16 && length % 4 === 0)` — message: "Entropy length should be >= 16, <= 32 and be a multiple of 4".
2. `/^[a-fA-F0-9]*$/.test(value)` — message: "Entropy should be an hexadecimal string".

Mnemonic validator:
1. `isNotThrowing(() => mnemonicToEntropy(value, wordlist))` — message: "Invalid mnemonic".

## Dependencies
- `@it-tools/bip39` — wordlists for 10 languages and the conversion helpers `entropyToMnemonic`, `mnemonicToEntropy`, `generateEntropy`.
- `@vicons/tabler` (`Copy`, `Refresh`).
- Project composables: `useCopy`, `useValidation`, `withDefaultOnError`, `isNotThrowing`.
- Naive-UI: `n-grid`, `n-gi`, `n-form-item`, `n-input-group`, `n-icon`.
- Project components: `c-select`, `c-input-text`, `c-button`.

## Edge Cases & Validation
- Empty entropy is allowed; the passphrase falls back to whatever the user typed (or empty).
- Hex entropy with an odd length or non-hex characters → validation flag, passphrase fallback used.
- Mnemonic with one wrong word → fails BIP39 checksum → `mnemonicToEntropy` throws → entropy becomes `''` and the validator marks the field as invalid.
- Switching language does **not** reseed the entropy — it just re-renders the same entropy in the new wordlist (which always succeeds because the wordlists are fixed-length and BIP39 checksums are language-independent).
- Reading the passphrase ref while `entropy` is invalid returns the cached typed value, so the UI does not blank out unexpectedly.

## Examples
1. **Random English mnemonic**
   - Click "Refresh" → entropy becomes e.g. `7c61c1f4c9b2ae3a3a04c8f9b4d59f88` (32 hex chars).
   - Passphrase: `infant absurd virtual swing limb dirt swarm scout neck embody fruit fluid` (12 words from the English wordlist).
2. **Switch language to "French"**
   - Same entropy `7c61c1f4...` → passphrase becomes 12 corresponding French BIP39 words.
3. **Enter a known mnemonic**
   - Paste `legal winner thank year wave sausage worth useful legal winner thank yellow` → entropy resolves to `7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f` (the canonical BIP39 test vector).

## File Structure
| File | Description |
|------|-------------|
| `index.ts` | Tool metadata. |
| `bip39-generator.vue` | Single-file component containing the two-way binding, language selector, validators, and copy buttons. |

## Notes
- **No persistence.** The current entropy/mnemonic do not survive a page reload — desirable for a tool dealing with seed phrases.
- **Client-side only:** entropy is generated by the `@it-tools/bip39` package; no network calls.
- **i18n:** Title and description are translated; the language option labels are hard-coded English keys mapped to the library's wordlist constants.
- **Security caveat:** Despite running locally, browsers are not the recommended environment for generating production wallet seeds — the tool is best treated as an educational/utility helper.
