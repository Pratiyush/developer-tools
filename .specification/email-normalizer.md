# Email normalizer

## Overview
- **Path:** `/email-normalizer`
- **Category:** Development
- **Description:** Normalize email addresses to a standard format for easier comparison. Useful for deduplication and data cleaning.
- **Keywords:** email, normalizer
- **Redirect from:** None
- **Created at:** 2024-08-15 (newer than 2 weeks before today's date may show "isNew" flag, but 2024-08-15 is older than 2 weeks before 2026-04-28)

## Purpose
Normalize a list of email addresses into their canonical form so duplicates can be detected. Many email providers ignore dots, plus-tags, and case in the local part — for example, `Foo.Bar+spam@gmail.com` and `foobar@gmail.com` route to the same inbox. This tool applies provider-specific rules (via the `email-normalizer` npm package) to reduce all forms to the same canonical address. Useful for cleaning up signup lists, deduping CRM data, and fraud-prevention checks.

## Inputs
| Field | Type | Default | Validation |
|---|---|---|---|
| `emails` | string (multiline) | `''` | None upfront; failure to parse a line yields a placeholder error string in the output (`Unable to parse email: <line>`) |

The input is split on `\n` (newline), so the user enters one email per line.

The textarea has the following props set:
- `placeholder="Put your emails here (one per line)..."`
- `rows="3"`, `multiline`
- `autocomplete="off"`, `autocorrect="off"`, `autocapitalize="off"`, `spellcheck="false"`
- `autofocus`, `monospace`

## Outputs
| Output | Type | Description |
|---|---|---|
| `normalizedEmails` | string (multiline) | The same number of lines as the input, each containing either the normalized email address or `Unable to parse email: <original>` for invalid lines |

## UI / Components
- A label `Raw emails to normalize:` above a multi-line `c-input-text` (3 rows, monospace, autofocus) where the user pastes emails.
- A label `Normalized emails:` above a read-only `c-input-text` (3 rows, monospace) showing the normalized output.
- Below, two side-by-side buttons:
  - `Clear emails` — sets `emails = ''`, clearing both inputs and outputs
  - `Copy normalized emails` — copies `normalizedEmails` to the clipboard via `useCopy` (with a toast `'Normalized emails copied to the clipboard'`); disabled when output is empty.

## Logic / Algorithm
1. The Vue ref `emails` holds the raw text.
2. A `computed` `normalizedEmails`:
   - If `emails` is empty → return `''`.
   - Else split on `\n`, map each line through `normalizeEmail({ email })` (from the `email-normalizer` npm package) wrapped in `withDefaultOnError` to produce `Unable to parse email: <line>` on any throw. Join the results with `\n`.
3. The `useCopy` composable handles the copy-to-clipboard, displaying a toast.

The `normalizeEmail` function applies provider-specific rules. Common transformations include (depending on package internals):
- Lowercasing the local and domain parts.
- For `gmail.com` / `googlemail.com`: removing dots from the local part, stripping `+tags`, normalizing the domain to `gmail.com`.
- For `outlook.com`, `hotmail.com`, `live.com`, `msn.com`, etc.: stripping `+tags`.
- For `yahoo.com`: stripping `-tags`.

(Exact behavior depends on the version of `email-normalizer` installed.)

## Dependencies
- `email-normalizer` (`^1.0.0`) — provides `normalizeEmail({ email })`
- `@/utils/defaults` — `withDefaultOnError`
- `@/composable/copy` — `useCopy` (with toast)
- `@vicons/tabler` — icon `Mail`
- Internal `c-input-text`, `c-button`

## Edge Cases & Validation
- **Empty input** → empty output (no errors thrown).
- **Single invalid line** (e.g., `not an email`) → that line becomes `Unable to parse email: not an email`. Other lines still process normally.
- Multiple emails are processed in parallel (synchronously, via `map`).
- Trailing newlines preserve the empty line in the output (which becomes `Unable to parse email: ` at minimum).
- The output line count matches the input line count exactly (`split('\n').map(...).join('\n')`).
- No deduplication of identical normalized addresses — that is left to the user; the tool just shows the canonical forms side by side.
- Whitespace inside email lines: `normalizeEmail` likely fails on emails with leading/trailing whitespace because each line is passed verbatim. There is no `.trim()` per line.

## Examples
**Example 1 (Gmail dot/plus normalization):**
- Input:
  ```
  Foo.Bar+test@gmail.com
  foobar@gmail.com
  ```
- Output:
  ```
  foobar@gmail.com
  foobar@gmail.com
  ```

**Example 2 (mixed providers):**
- Input:
  ```
  Alice+work@yahoo.com
  bob@OUTLOOK.com
  ```
- Output:
  ```
  alice@yahoo.com  (or similar; depends on Yahoo's tag char)
  bob@outlook.com
  ```

**Example 3 (invalid line):**
- Input:
  ```
  not-an-email
  test@example.com
  ```
- Output:
  ```
  Unable to parse email: not-an-email
  test@example.com
  ```

## File Structure
- `index.ts` — Tool registration; route `/email-normalizer`, icon `Mail`, `createdAt: new Date('2024-08-15')`. Notably, the title and description are hard-coded English (`name: 'Email normalizer'`) rather than going through `translate(...)`.
- `email-normalizer.vue` — Single-file component: the two textareas + two buttons, with the `computed normalizedEmails` doing the work.

## Notes
- No tests for this tool.
- No persistence; clears on reload.
- The tool is fully client-side; no API calls.
- Unlike most other tools, the `index.ts` does not call `translate(...)` — title and description are hard-coded English strings. This means the tool name will not be localized.
- The tool was added on 2024-08-15.
- The `useCopy` toast message is `'Normalized emails copied to the clipboard'`.
- The icon is `Mail` from `@vicons/tabler`.
- This tool relies on a third-party `email-normalizer` package; its rules are version-specific.
