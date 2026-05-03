# Crontab generator

## Overview
- **Path:** `/crontab-generator`
- **Category:** Development
- **Description:** Validate and generate crontab and get the human-readable description of the cron schedule.
- **Keywords:** crontab, generator, cronjob, cron, schedule, parse, expression, year, month, week, day, minute, second
- **Redirect from:** None

## Purpose
Help users author cron expressions by typing in a cron string and seeing a plain-English description (e.g., `Every minute, every hour, every day, only on Sunday`). It also validates the expression and shows a syntax cheat sheet (special symbols and `@yearly`, `@daily`, etc. shortcuts). Useful for sysadmins and developers who write crontab entries.

## Inputs
| Field | Type | Default | Validation |
|---|---|---|---|
| `cron` | string | `'40 * * * *'` (every hour at minute 40) | Validated by `cron-validator` with `{ allowBlankDay: true, alias: true, seconds: true }`; the message `'This cron is invalid'` displays when invalid |
| `cronstrueConfig.verbose` | boolean | `true` | n/a |
| `cronstrueConfig.use24HourTimeFormat` | boolean | `true` | n/a |
| `cronstrueConfig.dayOfWeekStartIndexZero` | boolean | `true` | n/a |
| `cronstrueConfig.throwExceptionOnParseError` | boolean | `true` (internal, not toggleable) | n/a |

## Outputs
| Output | Type | Description |
|---|---|---|
| Cron description | string | Human-readable description of the cron expression returned by `cronstrue.toString(...)`. If invalid, a single space `' '` is rendered. |

## UI / Components
- **Top card** (`c-card`):
  - A single large monospace text input (`c-input-text`) for the cron expression, centered in a `max-w-sm` container, with a 30px font size.
  - Below the input, a centered description (22px font, 0.8 opacity) showing the human-readable explanation.
  - An `n-divider` separates the input area from the toggle controls.
  - A 3-toggle form (Naive `n-form` / `n-switch`):
    - `Verbose`
    - `Use 24 hour time format`
    - `Days start at 0`
- **Helper card** (a second `c-card`):
  - A `<pre>` block that renders ASCII art explaining each cron field (seconds, minutes, hours, day of month, month, day of week).
  - Below it, a help table (`c-table`) of cron symbols and shortcuts. On small screens (`isSmallScreen`), the table renders as a list of cards instead.

The helper data is a static array of 11 entries:
| Symbol | Meaning | Example | Equivalent |
|---|---|---|---|
| `*` | Any value | `* * * *` | Every minute |
| `-` | Range of values | `1-10 * * *` | Minutes 1 through 10 |
| `,` | List of values | `1,10 * * *` | At minutes 1 and 10 |
| `/` | Step values | `*/10 * * *` | Every 10 minutes |
| `@yearly` | Once every year at midnight of 1 January | `@yearly` | `0 0 1 1 *` |
| `@annually` | Same as @yearly | `@annually` | `0 0 1 1 *` |
| `@monthly` | Once a month at midnight on the first day | `@monthly` | `0 0 1 * *` |
| `@weekly` | Once a week at midnight on Sunday morning | `@weekly` | `0 0 * * 0` |
| `@daily` | Once a day at midnight | `@daily` | `0 0 * * *` |
| `@midnight` | Same as @daily | `@midnight` | `0 0 * * *` |
| `@hourly` | Once an hour at the beginning of the hour | `@hourly` | `0 * * * *` |
| `@reboot` | Run at startup | `''` | `''` |

## Logic / Algorithm
### Validation
```ts
function isCronValid(v: string) {
  return isValidCron(v, { allowBlankDay: true, alias: true, seconds: true });
}
```
Uses `cron-validator`'s `isValidCron`:
- `allowBlankDay: true` — allows `?` for day fields
- `alias: true` — allows month and weekday names like `jan`, `mon`
- `seconds: true` — allows a 6-field expression with optional seconds prefix

### Description generation
- A `computed` (`cronString`) calls `cronstrue.toString(cron.value, cronstrueConfig)` only when the cron is valid.
- If invalid, returns a single space (`' '`) so the layout doesn't collapse.
- `cronstrueConfig` is reactive, so flipping any of the three toggles immediately re-renders the description.

### Responsive helper
- Reads `useStyleStore()` for `styleStore.isSmallScreen` to swap between a card list and a table layout for the cron syntax cheat sheet.

## Dependencies
- `cronstrue` (`^2.26.0`) — converts cron expressions to human-readable text
- `cron-validator` (`^1.3.1`) — validates cron expression syntax
- `naive-ui` — `n-divider`, `n-form`, `n-form-item`, `n-switch`
- `@vicons/tabler` — icon `Alarm`
- `@/stores/style.store` — `useStyleStore` for responsive flag
- Internal `c-card`, `c-input-text`, `c-table`

## Edge Cases & Validation
- Invalid cron expression → the description area renders a non-breaking single space, and the input shows a validation error.
- Empty input → invalid cron → empty description.
- 6-field expressions (seconds prefix) are accepted because `seconds: true`.
- Aliases like `jan`, `feb`, `mon`, `tue`, etc. are accepted (`alias: true`).
- The `?` character for blank day-of-month or day-of-week is accepted (`allowBlankDay: true`).
- `@reboot` has no example/equivalent in the helper because it can't be converted to a 5-field expression.
- The default placeholder is `* * * * *` but the initial value loaded is `40 * * * *`.

## Examples
**Example 1:** `40 * * * *` → `At 40 minutes past the hour`
**Example 2:** `*/10 * * * *` → `Every 10 minutes`
**Example 3:** `@daily` → `At 12:00 AM` (or `00:00` if 24-hour mode is on)
**Example 4:** `0 0 * * 0` → `At 12:00 AM, only on Sunday`
**Example 5:** `not-a-cron` → input shows error `'This cron is invalid'`; description area is blank.

## File Structure
- `index.ts` — Tool registration; route `/crontab-generator`, icon `Alarm`
- `crontab-generator.vue` — Single-file component: input, description display, three toggles, ASCII art legend, and the symbol cheat sheet table

## Notes
- No tests are present for this tool (no `.test.ts` or `.spec.ts` files in the folder).
- No persistence of the cron value or toggle state across reloads.
- The ASCII diagram assumes 6-field cron (with seconds), even though the default is 5-field.
- i18n: title and description are translated; in-component labels (toggle labels, helper-table column headers) and the cheat-sheet content are hard-coded English.
- Both `cronstrue` and `cron-validator` are configured for compatibility — the validator must accept what `cronstrue` can render, otherwise mismatched validity could produce confusing output.
