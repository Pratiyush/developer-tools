# Bcrypt

## Overview
- **Path:** `/bcrypt`
- **Category:** Crypto
- **Description:** Hash and compare text string using bcrypt. Bcrypt is a password-hashing function based on the Blowfish cipher.
- **Keywords:** `bcrypt`, `hash`, `compare`, `password`, `salt`, `round`, `storage`, `crypto`
- **Redirect from:** None
- **Icon:** `LockSquare` (from `@vicons/tabler`)
- **i18n key:** `tools.bcrypt.title` / `.description`

## Purpose
Two-card utility: (1) compute a bcrypt hash for a given plaintext string with a configurable cost factor, and (2) verify whether a plaintext string matches a previously generated bcrypt hash. Common use cases include seeding databases with hashed test passwords, verifying password hashes from a backend, or experimenting with bcrypt cost factors.

## Inputs

### "Hash" card
| Field | Type | Default | Validation / Notes |
|-------|------|---------|--------------------|
| `input` (Your string) | string | `''` | Plain text (`raw-text`), labelled left at 120 px. |
| `saltCount` | integer | `10` | `n-input-number`, min `0`, max `100`. Used as the cost factor (number of `2^n` Blowfish rounds). Bcrypt traditionally uses 4–31; values >12 get slow quickly. The UI allows the unconventional range 0–100 because the underlying lib enforces its own bounds. |

### "Compare string with hash" card
| Field | Type | Default | Validation / Notes |
|-------|------|---------|--------------------|
| `compareString` | string | `''` | Plain text. |
| `compareHash` | string | `''` | Plain text. Expected to be a `$2a$`/`$2b$` bcrypt hash. |

## Outputs

### "Hash" card
| Field | Type | Description |
|-------|------|-------------|
| `hashed` | string (computed) | `hashSync(input, saltCount)` from `bcryptjs`. Re-runs every input change. |

### "Compare" card
| Field | Type | Description |
|-------|------|-------------|
| `compareMatch` | boolean (computed) | `compareSync(compareString, compareHash)`. Rendered as colored "Yes"/"No" — green (`themeVars.successColor`) on match, red (`themeVars.errorColor`) on miss. |

## UI / Components
- **Hash card:**
  - `c-input-text` for the plaintext (label-left, 120 px, raw-text).
  - `n-form-item` with `n-input-number` for `saltCount` (full width, `:max="100"` `:min="0"`).
  - Read-only `c-input-text` for the resulting hash (centred text).
  - "Copy hash" `c-button` centered below.
- **Compare card:**
  - `n-form` with label width 120 px.
  - `c-input-text` rows for the candidate string and the candidate hash.
  - `n-form-item` "Do they match ?" with a `<div class="compare-result">` that flips between green ("Yes") and red ("No") via `:class="{ positive: compareMatch }"`.

## Logic / Algorithm
1. **Hashing** is synchronous via `hashSync(plain, saltCount)`:
   - `bcryptjs` generates a random salt at the requested cost factor and produces a `$2a$<cost>$<22-char-salt><31-char-hash>` digest.
   - Every keystroke recomputes the hash; the salt is therefore re-randomised on every input change.
2. **Comparison** is synchronous via `compareSync(plain, hash)`:
   - Returns `true` only if the plaintext, hashed with the salt encoded in `hash`, matches the digest portion.
   - Returns `false` for any malformed hash or mismatch.

## Dependencies
- `bcryptjs` (`hashSync`, `compareSync`) — pure-JS bcrypt implementation.
- Naive-UI: `useThemeVars` (for success/error colors), `n-form`, `n-form-item`, `n-input-number`.
- Project composable: `useCopy`.
- Project components: `c-card`, `c-input-text`, `c-button`.

## Edge Cases & Validation
- Empty plaintext — `bcryptjs` will still produce a valid hash for the empty string.
- Salt count `0` — `bcryptjs` defaults internally; expect a generic-cost hash.
- Salt count `>12` — UI freezes briefly while the synchronous hash computes (cost grows exponentially with `n`).
- Salt count `100` — extremely slow; the UI will lock for a long time. There is no async or worker offloading.
- Invalid hash in compare card — `compareSync` returns `false`; the UI shows "No".
- Each keystroke of the plaintext triggers a fresh hash with a new salt, so the displayed hash changes constantly.

## Examples
1. **Hash "password" with cost 10**
   - One possible output: `$2a$10$N9qo8uLOickgx2ZMRZoMye.IjZKPC8B0xq9iV0r6Mc6EzNfzk.7E.` (varies per call).
2. **Compare correct match**
   - `compareString = "password"`, `compareHash = "$2a$10$N9qo8uLOickgx2ZMRZoMye.IjZKPC8B0xq9iV0r6Mc6EzNfzk.7E."` → "Yes" (green).
3. **Compare mismatch**
   - `compareString = "Password"` (capital P), same hash → "No" (red).

## File Structure
| File | Description |
|------|-------------|
| `index.ts` | Tool metadata. |
| `bcrypt.vue` | Single-file component containing both cards (hash + compare) and the styled compare-result indicator. |

## Notes
- **No persistence.** None of the fields are saved.
- **Performance warning:** `hashSync` runs on the main thread. Cost factors >12 are noticeable; >15 is multi-second; the UI does not warn the user.
- **i18n:** Title and description are translated; field labels are hard-coded.
- **Theming:** The match indicator uses Naive-UI theme variables, so it adapts to light/dark themes.
