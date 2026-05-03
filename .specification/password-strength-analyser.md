# Password strength analyser

## Overview
- **Path:** `/password-strength-analyser`
- **Category:** Crypto
- **Description:** Discover the strength of your password with this client-side-only password strength analyser and crack time estimation tool.
- **Keywords:** password, strength, analyser, and, crack, time, estimation, brute, force, attack, entropy, cracking, hash, hashing, algorithm, algorithms, md5, sha1, sha256, sha512, bcrypt, scrypt, argon2, argon2id, argon2i, argon2d
- **Redirect from:** (none)
- **Created at:** 2023-06-24
- **Icon:** `mdi/form-textbox-password` (via `~icons/mdi/form-textbox-password`)

## Purpose
Estimates how long it would take to brute-force a given password, based purely on the password's character mix and length (not dictionary attacks). Computes the character set size, password length, entropy in bits, a normalized score 0–100, and a human-friendly crack-time estimate. The tool is fully client-side — the password never leaves the browser. Useful for picking strong passwords or demonstrating to non-technical users why their `Password1` is bad.

## Inputs
| Name | Type | Default | Validation |
| --- | --- | --- | --- |
| `password` | string (masked) | `''` | None — any string is analyzed |

The field is a `c-input-text` with:
- `type="password"` — characters masked.
- `placeholder`: `"Enter a password..."`
- `clearable`: true
- `autofocus`: true
- `raw-text`: true
- `test-id`: `"password-input"`

A note below the form clarifies: *"The computed strength is based on the time it would take to crack the password using a brute force approach, it does not take into account the possibility of a dictionary attack."*

## Outputs
The page displays via two `c-card` blocks:

### Crack-duration card
| Field | Type | Source |
| --- | --- | --- |
| Heading text | string (hard-coded) | `"Duration to crack this password with brute force"` |
| Crack duration formatted | string | `crackTimeEstimation.crackDurationFormatted` (test-id `crack-duration`) — large 2xl text |

### Details card
A list of `{ label, value }` rows, each `flex gap-3` with right-aligned label / left-aligned value:

| Label | Value source | Type |
| --- | --- | --- |
| `Password length:` | `crackTimeEstimation.passwordLength` | number |
| `Entropy:` | `Math.round(crackTimeEstimation.entropy * 100) / 100` | number (rounded to 2 decimals) |
| `Character set size:` | `crackTimeEstimation.charsetLength` | number |
| `Score:` | `Math.round(crackTimeEstimation.score * 100) + ' / 100'` | string |

## UI / Components
- `c-input-text` masked input.
- `c-card` (centered) with the human-friendly crack duration, prefixed by faded explanatory text.
- `c-card` listing the four detail rows.
- A faded `<div op-70>` paragraph note about brute-force vs dictionary attacks.
- Layout uses `flex flex-col gap-3` for the whole tool.

## Logic / Algorithm
All logic in `password-strength-analyser.service.ts`. Two exports: `getPasswordCrackTimeEstimation`, `getCharsetLength`.

### `getCharsetLength({ password })`
Determines the assumed brute-force alphabet size by inspecting the password's character classes:
```ts
function getCharsetLength({ password }) {
  const hasLowercase    = /[a-z]/.test(password);
  const hasUppercase    = /[A-Z]/.test(password);
  const hasDigits       = /\d/.test(password);
  const hasSpecialChars = /\W|_/.test(password);

  let charsetLength = 0;
  if (hasLowercase)    charsetLength += 26;
  if (hasUppercase)    charsetLength += 26;
  if (hasDigits)       charsetLength += 10;
  if (hasSpecialChars) charsetLength += 32;
  return charsetLength;
}
```
- Lowercase only → 26
- Uppercase only → 26
- Digits only → 10
- Special only → 32 (`\W` matches non-word characters; `_` is included explicitly because `\W` excludes it)
- All four → 26 + 26 + 10 + 32 = **94**
- Empty password → 0

### `getPasswordCrackTimeEstimation({ password, guessesPerSecond = 1e9 })`
```ts
const charsetLength    = getCharsetLength({ password });
const passwordLength   = password.length;
const entropy          = password === '' ? 0 : Math.log2(charsetLength) * passwordLength;
const secondsToCrack   = 2 ** entropy / guessesPerSecond;
const crackDurationFormatted = getHumanFriendlyDuration({ seconds: secondsToCrack });
const score = Math.min(entropy / 128, 1);

return {
  entropy, charsetLength, passwordLength,
  crackDurationFormatted, secondsToCrack, score,
};
```
- **Entropy:** `log2(charsetLength) * passwordLength` bits — assumes uniform random selection from the charset.
- **Seconds to crack:** `2^entropy / guessesPerSecond` (default `1e9` = 1 billion guesses/sec, an attacker-with-a-GPU baseline).
- **Score:** `min(entropy / 128, 1)` — caps at 128 bits of entropy = 1.0 (displayed as 100/100).
- For an empty password: entropy = 0 → secondsToCrack = `2^0 / 1e9 = 1e-9` seconds → "Instantly".

### `getHumanFriendlyDuration({ seconds })`
Formats a seconds count into "X years, Y months" style:
- `seconds <= 0.001` → `"Instantly"`
- `seconds <= 1` → `"Less than a second"`
- Otherwise iterates through time units (largest to smallest):
  ```ts
  millennium (31_536_000_000 s)   // formatted with prettifyExponentialNotation()
  century    (3_153_600_000 s)
  decade     (315_360_000 s)
  year       (31_536_000 s)
  month      (2_592_000 s)
  week       (604_800 s)
  day        (86_400 s)
  hour       (3_600 s)
  minute     (60 s)
  second     (1 s)
  ```
  - For each unit: take `Math.floor(seconds / secondsInUnit)`, subtract that quantity from `seconds` (`seconds %= secondsInUnit`).
  - Skip units with quantity 0.
  - Take the first 2 non-zero units, join with `, `.
  - Pluralizes: `1 year` vs `2 years`, `century`/`centuries`, `millennium`/`millennia`.

### `prettifyExponentialNotation(n)`
For very large numbers (millennia in particular):
- If `n.toString()` has an exponent, format the base as integer (toLocaleString) or 2-decimal float; keep the exponent suffix.
- E.g. `1.234e10` → `1.23e10`, `1.5e6` → `1,500,000` (no exponent left after toString of an integer).

## Dependencies
| Library | Purpose | Notes |
| --- | --- | --- |
| `lodash` (`_.chain`, `_.identity`, `.take(2)`, `.compact()`) | Functional helpers in `getHumanFriendlyDuration` | |
| `vue` (`ref`, `computed`) | Reactivity | |
| Internal `c-input-text`, `c-card` | UI primitives | |
| `~icons/mdi/form-textbox-password` | Icon | |
| `vitest` (dev), `@playwright/test` (dev) | Tests | |

## Edge Cases & Validation
- **Empty password:** `entropy = 0`, `secondsToCrack = 1e-9`, formatted as `"Instantly"`. Charset, length, score all 0.
- **Single character:** Charset reflects that character's class (e.g. lowercase 'a' → 26). Entropy = `log2(26) ≈ 4.7` bits.
- **Repeated characters** (e.g. `'aaaaaaaa'`): No special handling — the formula treats it as a standard 8-char lowercase password (~37.6 bits). Real attacker would crack it instantly via dictionary.
- **Unicode / non-ASCII characters:** `\W` matches them and adds 32 to the charset (counted as "special"). `password.length` counts UTF-16 code units, not grapheme clusters.
- **Very long passwords:** Entropy can produce astronomical durations; the duration formatter handles this via `prettifyExponentialNotation` for millennia counts (e.g. `15,091 millennia, 3 centuries`).
- **Score cap:** Entropy above 128 bits all score 100/100.
- **`guessesPerSecond` not configurable in UI** — defaults to `1e9` (1 billion/s).
- **Bug in unit test comment:** A test asserts `getCharsetLength('...all-categories...')` returns 94 but is described in the test name as 95 — the actual returned and expected value is 94, only the test name is misleading.

## Examples
**Example 1 — `ABCabc123!@#`** (e2e tested):
- All four character classes → charsetLength 94.
- Length 12.
- entropy = log2(94) × 12 ≈ 6.555 × 12 ≈ 78.66 bits.
- secondsToCrack = 2^78.66 / 1e9 ≈ 4.76e14 seconds ≈ 15,091 millennia and ~3 centuries.
- Displayed crack duration: `"15,091 millennia, 3 centuries"`.

**Example 2 — `password`**:
- Lowercase only → charset 26. Length 8. Entropy ≈ 37.6 bits.
- secondsToCrack = 2^37.6 / 1e9 ≈ 209 s ≈ 3 minutes 29 seconds → displayed `"3 minutes, 29 seconds"`.

**Example 3 — empty**:
- All fields 0; duration `"Instantly"`.

**Example 4 — Single special character `_`**:
- charsetLength 32, length 1, entropy 5 bits, secondsToCrack ≈ 32e-9 s → `"Instantly"`.

## File Structure
```
password-strength-analyser/
├── index.ts                                  # Tool metadata (icon: mdi/form-textbox-password, createdAt 2023-06-24)
├── password-strength-analyser.vue            # Component (single password input + two cards)
├── password-strength-analyser.service.ts     # Logic: getPasswordCrackTimeEstimation, getCharsetLength, formatters
├── password-strength-analyser.service.test.ts# Vitest tests for getCharsetLength on various character classes
└── password-strength-analyser.e2e.spec.ts    # Playwright test asserting page title + crack duration for 'ABCabc123!@#'
```

## Notes
- **i18n:** `name` and `description` come from `translate('tools.password-strength-analyser.title' / '.description')`. Section headings, labels, and the explanatory note are hard-coded English.
- **Fully client-side** — confirmed by both UX text and code (no network calls; only local computation).
- **No persistence** — password is held in a normal `ref`, not `useStorage`. (You wouldn't want passwords persisted anyway.)
- **Approach assumes uniform random password generation** — real passwords often have far less entropy than this estimate suggests because of human patterns. The tool's own note acknowledges this gap.
- **`guessesPerSecond = 1e9`** is a reasonable default for a single GPU; the actual attacker capability varies wildly by hash algorithm. The tool keywords reference hash algorithms (md5, sha1, sha256, sha512, bcrypt, scrypt, argon2…) but the tool doesn't actually choose between them or adjust the guess rate accordingly.
- **`charsetLength` cannot exceed 94** in this implementation despite the keyword list mentioning argon2 etc. — special-character pool is fixed at 32.
- **Score formula:** `entropy / 128 capped at 1` — choosing 128 as the "fully strong" entropy threshold is a reasonable convention but not exposed/configurable.
