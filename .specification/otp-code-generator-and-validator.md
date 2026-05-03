# OTP code generator

## Overview
- **Path:** `/otp-generator`
- **Category:** Web
- **Tool Name (i18n):** "OTP code generator"
- **Description:** Generate and validate time-based OTP (one time password) for multi-factor authentication.
- **Keywords:** otp, code, generator, validator, one, time, password, authentication, MFA, mobile, device, security, TOTP, Time, HMAC
- **Redirect from:** (none)
- **Created at:** (no `createdAt` set)
- **Icon:** `DeviceMobile` (from `@vicons/tabler`)

## Purpose
Generates and displays Time-based One-Time Passwords (TOTP) per RFC 6238 / HOTP per RFC 4226 from a user-supplied or auto-generated base32 secret. Shows the previous, current, and next 6-digit codes in real time, a countdown to the next 30-second window, a QR code containing the `otpauth://totp/...` URI for scanning into authenticator apps, plus diagnostic outputs (secret in hex, current epoch, iteration counter in decimal and hex). Useful for testing 2FA setups, debugging TOTP integrations, or simulating an authenticator app in the browser.

## Inputs
| Name | Type | Default | Validation |
| --- | --- | --- | --- |
| `secret` | string (base32) | A freshly generated 16-character base32 token at component setup | Two rules via `c-input-text` `validation-rules`: (1) must match `/^[A-Z234567]+$/` after uppercasing → message `"Secret should be a base32 string"`; (2) must be non-empty → `"Please set a secret"`. Lower case is accepted because the regex is run after `.toUpperCase()`. |

The input is a `c-input-text` with:
- Label: `"Secret"`
- Placeholder: `"Paste your TOTP secret..."`
- Suffix slot: a circular text-style refresh button (`icon-mdi-refresh`) wrapped in a `c-tooltip` (`"Generate a new random secret"`); clicking it calls `refreshSecret()` to regenerate.

## Outputs
The page shows several derived values:

| Output | Source | Notes |
| --- | --- | --- |
| **Token display** (Previous / Current / Next) | `tokens.previous`, `tokens.current`, `tokens.next` from `computedRefreshable` | Three buttons in a connected button group; each click copies the corresponding token. The current token is rendered larger (22px). |
| **Progress bar** + countdown | Time elapsed in current 30-s window | `n-progress` showing `(100 * interval) / 30` percentage; below it `Next in {N}s` countdown (zero-padded to 2 digits). |
| **QR code** | `useQRCode({ text: keyUri, ... })` | Encodes the `otpauth://totp/...` URI; size 210; foreground black; background white in dark mode, transparent in light mode. |
| **"Open Key URI in new tab" button** | `keyUri` | Opens the `otpauth://` link in a new tab; some OSes will hand it off to an authenticator app. |
| **Secret in hexadecimal** | `base32toHex(secret)` | Read-only copyable input. |
| **Epoch** | `Math.floor(now / 1000).toString()` | Read-only copyable input; updates with `useTimestamp()`. |
| **Iteration count** | `getCounterFromTime({ now, timeStep: 30 })` | Decimal counter (current 30-s window since Unix epoch). |
| **Padded hex iteration** | `counter.toString(16).padStart(16, '0')` | 16-character zero-padded hex of the counter (the value HMACed when computing HOTP). |

## UI / Components
The page splits into two side-by-side columns (each `max-width: 350px`).

**Left column** (interactive):
- `c-input-text` (Secret) with refresh button suffix.
- `<TokenDisplay>` showing prev/current/next tokens as a 3-button row with copy-on-click.
- `<n-progress>` linear progress bar (color: theme primary) for the current TOTP window.
- Centered text: `Next in {N}s`.
- `<n-image>` with the QR code data URL.
- `<c-button>` link `Open Key URI in new tab`.

**Right column** (diagnostics):
- `<InputCopyable>` "Secret in hexadecimal" — base32-decoded hex of the secret.
- `<InputCopyable>` "Epoch" — current epoch seconds.
- `<p>Iteration</p>` heading.
- `<InputCopyable>` "Count:" (label-position left, width 90px) — decimal counter.
- `<InputCopyable>` "Padded hex:" — 16-char hex counter.

`<TokenDisplay>` (`token-display.vue`) layout:
- A row above with three labels: "Previous", "Current OTP", "Next" (left/center/right).
- A horizontally connected group of three `c-button`s. The middle button has thicker border-x and font-size 22px to emphasize the current token. Each button's click handler copies that specific token via `useCopy({ createToast: false })`.
- Tooltip on each button toggles between `Copy ... OTP` and `Copied !` based on the per-button `isJustCopied` flag.

Scoped styles: `n-progress` line transition is shortened to `0.05s` for a smooth countdown feel.

## Logic / Algorithm
All cryptographic logic is in `otp.service.ts` (uses `crypto-js` for HMAC-SHA1).

### Helpers
- **`hexToBytes(hex)`** — splits a hex string into pairs and parses each pair as a byte; tolerates odd-length input by ignoring the last unpaired char (regex `.{1,2}`).
- **`base32toHex(base32)`** — RFC 4648 base32 decode → hex:
  1. Uppercases input; strips trailing `=` padding.
  2. Maps each char to its 5-bit binary index in the alphabet `ABCDEFGHIJKLMNOPQRSTUVWXYZ234567`.
  3. Joins all bits, splits into 8-bit chunks, parses each as a hex byte (zero-padded to 2 chars).
- **`computeHMACSha1(message, key)`** — `HmacSHA1` from `crypto-js` over `enc.Hex.parse(message)` with key `enc.Hex.parse(base32toHex(key))`, returns hex digest.

### HOTP (RFC 4226) — `generateHOTP({ key, counter = 0 })`
1. Convert `counter` to a 16-char hex string (zero-padded): `counter.toString(16).padStart(16, '0')`.
2. Compute HMAC-SHA1 over those 8 bytes with the secret.
3. Convert the hex digest to a 20-byte array.
4. **Dynamic truncation:** `offset = bytes[19] & 0xF` (low nibble of last byte).
5. Read 4 bytes at `bytes[offset..offset+3]`, mask high bit, combine into a 31-bit unsigned int:
   `v = ((bytes[off] & 0x7F) << 24) | ((bytes[off+1] & 0xFF) << 16) | ((bytes[off+2] & 0xFF) << 8) | (bytes[off+3] & 0xFF)`.
6. `code = String(v % 1_000_000).padStart(6, '0')` — 6-digit OTP.

### Verify HOTP — `verifyHOTP({ token, key, window = 0, counter = 0 })`
Brute-force loops `i` from `counter - window` to `counter + window` inclusive, returns `true` if any `generateHOTP({ key, counter: i }) === token`.

### TOTP (RFC 6238) — `generateTOTP({ key, now = Date.now(), timeStep = 30 })`
- `counter = Math.floor(now / 1000 / timeStep)` (via `getCounterFromTime`).
- Returns `generateHOTP({ key, counter })`.

### Verify TOTP — `verifyTOTP({ key, token, window = 0, now, timeStep = 30 })`
- Same as `verifyHOTP` but counter derived from `now`/`timeStep`.

### Build Key URI — `buildKeyUri({ secret, app = 'IT-Tools', account = 'demo-user', algorithm = 'SHA1', digits = 6, period = 30 })`
Returns:
```
otpauth://totp/<urlencoded(app)>:<urlencoded(account)>?issuer=<app>&secret=<secret>&algorithm=<algo>&digits=<n>&period=<n>
```
Default in this UI: `otpauth://totp/IT-Tools:demo-user?issuer=IT-Tools&secret=<secret>&algorithm=SHA1&digits=6&period=30`

### Generate secret — `generateSecret()`
`createToken({ length: 16, alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567' })` from `token-generator.service` — produces a 16-character base32 random secret.

### Component reactivity
- `now` from `useTimestamp()` (vueuse) — refreshes every animation frame.
- `interval = (now / 1000) % 30` — seconds elapsed in the current 30-s window (range `[0, 30)`).
- `tokens` from `computedRefreshable(..., { throttle: 500 })` — recomputes prev/current/next every 500 ms:
  ```ts
  {
    previous: generateTOTP({ key: secret.value, now: now.value - 30000 }),
    current:  generateTOTP({ key: secret.value, now: now.value }),
    next:     generateTOTP({ key: secret.value, now: now.value + 30000 }),
  }
  ```
- `keyUri = buildKeyUri({ secret })` (recomputes when secret changes).
- QR code generated via `useQRCode({ text: keyUri, ..., options: { width: 210 } })` — adapts background color to dark/light theme.

## Dependencies
| Library | Purpose | Notes |
| --- | --- | --- |
| `crypto-js` (`HmacSHA1`, `enc`) | HMAC-SHA1 computation and hex encoding/decoding | Core crypto primitive |
| `lodash` (`_.map`, `_.join`) | Used in `buildKeyUri` to URL-encode the params | |
| `@vueuse/core` (`useTimestamp`) | Live timestamp ref for the countdown | |
| `naive-ui` (`useThemeVars`, `n-progress`, `n-image`) | UI primitives + theming | |
| `qr-code-generator` tool's `useQRCode` composable | QR rendering | Reused composable from the QR tool |
| Internal `computedRefreshable` (composable) | Throttled recomputation | Tokens refresh at 500ms cadence even though `now` ticks faster |
| Internal `useCopy` (composable) | Copy-to-clipboard with `isJustCopied` flag | |
| Internal `c-input-text`, `c-button`, `c-tooltip`, `InputCopyable` | UI helpers | |
| Internal `token-generator.service` (`createToken`) | Random secret generator | |
| `useStyleStore` (Pinia) | Detect dark theme for QR background | |
| `vitest` (dev), `@playwright/test` (dev) | Tests | |

## Edge Cases & Validation
- **Empty secret:** Validation rule fires; tokens become empty/zeros for that input cycle (still computed because validation is UI-only — `c-input-text` doesn't block computation, just shows the message).
- **Lower-case base32 input:** Accepted (`base32toHex` uppercases first; the validator also uppercases before regex check).
- **Non-base32 characters:** Validator shows `"Secret should be a base32 string"`. The OTP service still tries to compute (`base32toHex` will produce wrong bytes since `indexOf` returns `-1` for unknown chars; `(-1).toString(2)` produces `-1` which `padStart(5, '0')` turns into `'-001'` and breaks downstream).
- **`=` padding:** Stripped before decoding.
- **Window drift:** Validation supports a `window` parameter (number of preceding/following counters to accept). The UI doesn't expose a validation flow for arbitrary tokens — it only displays generated codes.
- **Algorithm hard-coded to SHA1, digits=6, period=30** in this UI — the underlying service supports custom values but the UI passes none.
- **Timezone:** Uses local `Date.now()` (UTC milliseconds) so counter is timezone-agnostic.

## Examples
**Example 1 — Known test vector** (from unit tests)
- `key = 'JBSWY3DPEHPK3PXP'`, `now = 0` → TOTP `'282760'`.
- HOTP for the same key: counters 0..4 → `['282760', '996554', '602287', '143627', '960129']`.

**Example 2 — base32 → hex**
- `'ABCDEF'` → `'00443205'`
- `'JBSWY3DPEHPK3PXP'` → `'48656c6c6f21deadbeef'` (which is the ASCII for `Hello!` followed by `\xde\xad\xbe\xef`).

**Example 3 — Build URI**
- `buildKeyUri({ secret: 'JBSWY3DPEHPK3PXP' })` →
  `otpauth://totp/IT-Tools:demo-user?issuer=IT-Tools&secret=JBSWY3DPEHPK3PXP&algorithm=SHA1&digits=6&period=30`

**Example 4 — E2E** (with `Date.now` stubbed to `1609477200000`, secret `ITTOOLS`)
- Hex: `44e6e72e02`
- Previous OTP: `028034`
- Current OTP: `162195`
- Next OTP: `452815`

## File Structure
```
otp-code-generator-and-validator/
├── index.ts                                # Tool metadata (path /otp-generator, DeviceMobile icon)
├── otp-code-generator-and-validator.vue    # Main component: secret input, tokens, QR, diagnostics
├── token-display.vue                       # Subcomponent: prev/current/next 3-button OTP display with copy
├── otp.service.ts                          # Pure crypto logic: HOTP, TOTP, base32→hex, key URI, secret generator
├── otp.service.test.ts                     # Vitest unit tests covering all service functions
└── otp-code-generator.e2e.spec.ts          # Playwright E2E test (mocks Date.now, asserts OTP output)
```

## Notes
- **i18n:** `name` and `description` come from `translate('tools.otp-generator.title' / '.description')`. UI labels (`Secret`, `Previous`, `Current OTP`, `Next`, `Open Key URI in new tab`, etc.) are hard-coded English.
- **Path mismatch:** Directory is `otp-code-generator-and-validator/` but the route is `/otp-generator`.
- **Token refresh cadence:** `computedRefreshable` throttles to 500 ms — tokens may briefly lag `now` for up to half a second (negligible for the 30-second window).
- **No persistence:** Secret is regenerated on every page load; not stored in `useStorage`.
- **Algorithm hard-coded:** UI uses SHA1/6 digits/30s period. Service supports overrides but they're not exposed.
- **The "validator" half of the tool name is implicit** — the user can copy the displayed current/previous/next codes to validate against an external system, but there's no explicit "paste a code, see if it matches" UI.
- **QR code** automatically adapts background between transparent (light theme) and white (dark theme) for legibility.
- **`crypto-js` is used directly** rather than the more modern Web Crypto SubtleCrypto API.
