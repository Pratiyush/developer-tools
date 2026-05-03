# JWT Parser

## Overview
- **Path:** `/jwt-parser`
- **Category:** Web
- **Description:** Translated via i18n key `tools.jwt-parser.description` (e.g. "Parse and decode your JSON Web Token (jwt) and display its content.").
- **Keywords:** jwt, parser, decode, typ, alg, iss, sub, aud, exp, nbf, iat, jti, json, web, token
- **Redirect from:** None
- **Created at:** Not set in metadata
- **Icon:** `Key` from `@vicons/tabler`
- **i18n:** Title and description come from `translate('tools.jwt-parser.title')` / `.description`.

## Purpose
Decodes a JSON Web Token (JWT) so the user can inspect its header and payload claims without verifying the signature. Each decoded claim is shown alongside a friendly description (sourced from the IANA JWT registry) and, when applicable, a friendly value (e.g. an absolute date for `exp`/`nbf`/`iat`, or a human-readable algorithm name for `alg`). The signature is intentionally not validated — this is purely a structural/visual decoder.

## Inputs
| Name | Type | Default | Validation |
| --- | --- | --- | --- |
| JWT to decode | string (multiline, raw text) | A pre-filled sample token: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c` | The input must be non-empty and `decodeJwt({ jwt })` must not throw (i.e. the value must look like a structurally valid JWT with three Base64URL-encoded segments). Otherwise the message "Invalid JWT" is shown. |

## Outputs
| Name | Type | Description |
| --- | --- | --- |
| Header table | array of `{ claim, claimDescription, value, friendlyValue }` | Header parameters from the JWT (e.g. `alg`, `typ`). Each row shows the bold claim key (with the human-friendly name in parentheses), the value, and any friendly value (e.g. expanded `alg` description). |
| Payload table | array of `{ claim, claimDescription, value, friendlyValue }` | Payload claims from the JWT (e.g. `sub`, `iat`, `exp`, custom keys). |

The two outputs are rendered together as one `<n-table>` with section headers. Object/array claim values are JSON-stringified with 3-space indentation; everything else is coerced via `_.toString`.

## UI / Components
- `<c-card>` wrapper.
- A multiline `<c-input-text>` labelled "JWT to decode" with `rows=5`, `raw-text` (monospace styling), `autofocus`, placeholder "Put your token here...", and validation feedback.
- When validation passes, an `<n-table>` is rendered with two section headers ("Header" and "Payload") implemented as `<th colspan="2" class="table-header">` rows.
- For each claim, one `<tr>` displays:
  - Left cell: bold `claim` key, with the human-friendly description (`claimDescription`) in light gray parentheses.
  - Right cell: the formatted `value`, optionally followed by the friendly value in light gray parentheses (e.g. `1516239022 (4/17/2018, 9:23:42 AM)`).
- Custom CSS centers the table-header rows.

## Logic / Algorithm
The component delegates to `decodeJwt({ jwt })` from `jwt-parser.service.ts`:
1. `jwtDecode<JwtHeader>(jwt, { header: true })` decodes the header (1st segment).
2. `jwtDecode<JwtPayload>(jwt)` decodes the payload (2nd segment) — both via `jwt-decode`.
3. `_.map(rawHeader, (value, claim) => parseClaims({ claim, value }))` and the same for the payload.
4. `parseClaims` produces:
   - `value`: `JSON.stringify(value, null, 3)` if the value is a plain object or array; `_.toString(value)` otherwise.
   - `friendlyValue`: from `getFriendlyValue({ claim, value })`:
     - For `claim ∈ {exp, nbf, iat}` it converts the numeric value to a Date by `new Date(Number(value) * 1000)` and formats as `${date.toLocaleDateString()} ${date.toLocaleTimeString()}` (`undefined` if the value is null/undefined).
     - For `claim === 'alg'` (and value is a string), it looks the algorithm up in `ALGORITHM_DESCRIPTIONS` (e.g. `"HS256"` → `"HMAC using SHA-256"`).
     - Otherwise `undefined`.
   - `claim`: original key.
   - `claimDescription`: lookup in `CLAIM_DESCRIPTIONS` (a map of ~70 well-known claim names to human-friendly descriptions, sourced from the IANA JWT registry).
5. The Vue `decodedJWT` ref runs the same call wrapped in `withDefaultOnError(..., { header: [], payload: [] })`; the `useValidation` rule guards against runtime errors so the table only renders when valid.

## Constants
- **`ALGORITHM_DESCRIPTIONS`** (from `jwt-parser.constants.ts`): RFC 7518 §3.1 mapping for `HS256/384/512`, `RS256/384/512`, `ES256/384/512`, `PS256/384/512`, and `none`.
- **`CLAIM_DESCRIPTIONS`** (~70 entries): IANA JWT registry mapping for standard claims (e.g. `iss` → "Issuer", `sub` → "Subject", `aud` → "Audience", `exp` → "Expiration Time", `nbf` → "Not Before", `iat` → "Issued At", `jti` → "JWT ID") plus OpenID Connect claims (`name`, `email`, `picture`, `address`, `auth_time`, `nonce`, `acr`, `amr`, `at_hash`, …) and SIP/SHAKEN/W3C VC claims (`sip_callid`, `sip_via_branch`, `attest`, `vc`, `vp`, etc.).

## Dependencies
- `jwt-decode` (^3.1.2) — header/payload decoding (no signature verification). Note this is the v3 API where `jwtDecode` is the default export.
- `lodash` (^4.17.21) — `_.map`, `_.isPlainObject`, `_.isArray`, `_.isString`, `_.isNil`, `_.toString`.
- `@/composable/validation` (`useValidation`).
- `@/utils/boolean` (`isNotThrowing`) — runs a fn and returns whether it threw, used in the validator.
- `@/utils/defaults` (`withDefaultOnError`).
- Naive UI `<n-table>`.
- Project shared `<c-card>` and `<c-input-text>`.

## Edge Cases & Validation
- **Empty input:** validation fails (`value.length > 0` check), nothing rendered.
- **Malformed JWT (e.g. missing dots, invalid Base64):** `jwt-decode` throws → `isNotThrowing` reports false → `Invalid JWT` message; the table is hidden.
- **Whitespace / line breaks in the token:** the input field passes the raw value to `jwtDecode`; surrounding whitespace will likely cause a decoding error.
- **Object / array claim values:** rendered as 3-space-indented JSON.
- **Unknown algorithm strings:** `alg` shown without a friendly value if not in `ALGORITHM_DESCRIPTIONS`.
- **Numeric `exp/nbf/iat`:** treated as Unix epoch seconds (multiplied by 1000). Non-numeric values pass through `Number(...)` (likely `NaN`) and would render as "Invalid Date Invalid Date".
- **`null` or `undefined` claim values:** `_.toString(value)` returns `"null"`/`""`; date helpers return `undefined`.
- **No signature verification:** the third segment (signature) is never validated; do NOT use this tool to authenticate a token.

## Examples
**Example 1 — default sample token:**
Header decoded:
| Claim | Value | Friendly |
| --- | --- | --- |
| alg (Algorithm) | HS256 | HMAC using SHA-256 |
| typ (Type) | JWT | — |

Payload decoded:
| Claim | Value | Friendly |
| --- | --- | --- |
| sub (Subject) | 1234567890 | — |
| name (Full name) | John Doe | — |
| iat (Issued At) | 1516239022 | 4/17/2018, 9:23:42 AM (locale-dependent) |

**Example 2 — token with object claim:**
Payload `{ "user": { "id": 1, "name": "Alice" } }` would render with `value` set to:
```json
{
   "id": 1,
   "name": "Alice"
}
```
in the value cell.

## File Structure
- `index.ts` — Tool metadata: name/description from i18n, exhaustive keyword list of standard claim abbreviations.
- `jwt-parser.vue` — Vue 3 SFC: input + reactive table rendered from `decodeJwt`.
- `jwt-parser.constants.ts` — `ALGORITHM_DESCRIPTIONS` (RFC 7518 §3.1) and `CLAIM_DESCRIPTIONS` (IANA JWT registry, ~70 entries).
- `jwt-parser.service.ts` — `decodeJwt`, `parseClaims`, `getFriendlyValue`, `dateFormatter`.

## Notes
- No `useStorage` — the input is not persisted.
- `autofocus` is set on the input so the user can paste immediately.
- Date formatting uses the runtime locale (`toLocaleDateString` / `toLocaleTimeString`), so the same JWT will display differently depending on the user's machine.
- The tool deliberately does NOT verify signatures; it is purely an inspection tool. Any cryptographic verification would need a separate implementation with the secret/public key.
- Custom claim values (anything not in `CLAIM_DESCRIPTIONS`) display the raw key with no description.
