# Basic Auth Generator

## Overview
- **Path:** `/basic-auth-generator`
- **Category:** Web
- **Description:** Generate a base64 basic auth header from a username and password.
- **Keywords:** `basic`, `auth`, `generator`, `username`, `password`, `base64`, `authentication`, `header`, `authorization`
- **Redirect from:** None
- **Icon:** `PasswordRound` (from `@vicons/material`)
- **i18n key:** `tools.basic-auth-generator.title` / `.description`

## Purpose
Generates the HTTP `Authorization: Basic <base64(username:password)>` header line used for HTTP Basic authentication (RFC 7617). Useful when constructing curl commands, manual API requests, or copy-pasting credentials into a Postman/Insomnia configuration. Computation is fully client-side.

## Inputs
| Field | Type | Default | Validation / Notes |
|-------|------|---------|--------------------|
| `username` | string | `''` | Plain text (`raw-text`), `clearable`. |
| `password` | string | `''` | Rendered as `type="password"` (masked), `raw-text`, `clearable`. |

There is no length validation; `:` is not stripped or warned about even though it would split the credentials at decode time.

## Outputs
| Field | Type | Description |
|-------|------|-------------|
| `header` | string (computed) | `` `Authorization: Basic ${textToBase64(`${username}:${password}`)}` ``. Displayed inside an `n-statistic` with horizontal scroll, monospace font, 17 px size. |

## UI / Components
- `c-input-text` for username (`mb-5`, clearable, raw-text).
- `c-input-text` for password (`mb-2`, clearable, raw-text, `type="password"`).
- `c-card` containing an `n-statistic` labelled "Authorization header:" with a horizontally scrollable `n-scrollbar` (max-width 550 px) showing the computed header.
- `c-button` "Copy header" centered below the card.
- Scoped CSS forces the `n-statistic` value to monospace, 17 px, no-wrap.

## Logic / Algorithm
1. Concatenate `username + ':' + password`.
2. Pass to `textToBase64` (`Base64.encode` from `js-base64`, no URL-safe option) to get the encoded credentials.
3. Wrap in the literal prefix `Authorization: Basic ` to form the full HTTP header line.
4. Provide a one-click `useCopy` button that copies the full header string and toasts "Header copied to the clipboard".

## Dependencies
- `js-base64` via `@/utils/base64` (`textToBase64`).
- Project composable: `useCopy`.
- Naive-UI: `n-statistic`, `n-scrollbar`.
- Project components: `c-card`, `c-input-text`, `c-button`.

## Edge Cases & Validation
- Empty username/password — still produces a valid header, e.g. `Authorization: Basic Og==` (which decodes to `:`).
- Username containing `:` — base64 encodes faithfully but the receiving server will split at the first `:`, treating the rest as the password. The tool does not warn.
- Non-ASCII characters — `Base64.encode` handles UTF-8 correctly (modern servers may or may not accept UTF-8 in basic auth).
- Very long inputs — no soft cap; output is horizontally scrollable.
- Reactive recomputation happens on every keystroke; no debouncing.

## Examples
1. **`alice` / `s3cret`**
   - `header = "Authorization: Basic YWxpY2U6czNjcmV0"`.
2. **Empty credentials**
   - `header = "Authorization: Basic Og=="` (`:` encoded).
3. **UTF-8 password**
   - `username = "user"`, `password = "пароль"` → `header = "Authorization: Basic dXNlcjrQv9Cw0YDQvtC70Yw="`.

## File Structure
| File | Description |
|------|-------------|
| `index.ts` | Tool metadata. |
| `basic-auth-generator.vue` | Single-file component (two inputs + computed header + copy button). |

## Notes
- **No persistence.** Inputs and output are not saved across sessions, which is appropriate for credentials.
- **Security:** Base64 is encoding, not encryption — the header is trivially decodable. Tool description / placeholder explicitly assumes the user understands this.
- **i18n:** Title and description go through `translate(...)`. Field labels and the toast text are hard-coded English.
- **Client-side only** — credentials never leave the browser.
