# Date-time converter

## Overview
- **Path:** `/date-converter`
- **Category:** Converter
- **Description:** Convert date and time into the various different formats
- **Keywords:** date, time, converter, iso, utc, timezone, year, month, day, minute, seconde
- **Redirect from:** None

## Purpose
Take a single date/time value in any one of ten formats and display its equivalent representation in all of the others. The tool auto-detects the input format (e.g., recognizes a Mongo ObjectID vs. an ISO 8601 string vs. a Unix timestamp) and falls back to "current time" when the input is empty. Useful for engineers debugging timestamps, migrating between systems, or comparing different formats side-by-side.

## Inputs
| Field | Type | Default | Validation |
|---|---|---|---|
| `inputDate` | string | `''` (empty → uses current time) | Validated against the selected `formats[formatIndex].toDate(value)`; must produce a `Date` for which `isDate(d) && isValid(d)` is true. Error: `'This date is invalid for this format'` |
| `formatIndex` | number | `6` (i.e., `'Timestamp'`) | n/a; integer index into the `formats` array |

The `formats` array supports auto-detection: when the user types in the input, each format's `formatMatcher(value)` is checked in order, and the first match wins — `formatIndex` is updated automatically.

## Outputs
Ten output fields (one per format), each a read-only `input-copyable` row that displays the input's representation in that format. When the input is empty, all rows display the equivalent of "now" (live, since `useNow()` is reactive).

| Format | Render via | Example for 2023-04-12T23:10:24+02:00 |
|---|---|---|
| JS locale date string | `date.toString()` | `Wed Apr 12 2023 23:10:24 GMT+0200 (Central European Summer Time)` |
| ISO 8601 | `formatISO(date)` | `2023-04-12T23:10:24+02:00` |
| ISO 9075 | `formatISO9075(date)` | `2023-04-12 23:10:24` |
| RFC 3339 | `formatRFC3339(date)` | `2023-04-12T23:10:24+02:00` |
| RFC 7231 | `formatRFC7231(date)` | `Wed, 12 Apr 2023 21:10:24 GMT` |
| Unix timestamp (seconds) | `String(getUnixTime(date))` | `1681333824` |
| Timestamp (milliseconds) | `String(getTime(date))` | `1681333824000` |
| UTC format | `date.toUTCString()` | `Wed, 12 Apr 2023 21:10:24 GMT` |
| Mongo ObjectID | `Math.floor(t/1000).toString(16) + '0000000000000000'` | `64371e400000000000000000` |
| Excel date/time | `(t/86400000) + 25569` (days since 1899-12-30) | `45028.88222222222` |

## UI / Components
- Top row: a `c-input-text` (autofocus, clearable, `test-id="date-time-converter-input"`) for the date input, and a `c-select` for the format dropdown (with `data-test-id="date-time-converter-format-select"`).
- An `n-divider`.
- A list of ten read-only `input-copyable` rows, each showing the value in one format. Label position is `left`, label width 150px, label aligned right.
- Each output row has a `test-id` matching its format `name` (used by the e2e test).

## Logic / Algorithm
### Format definitions
Each `DateFormat` has:
- `name` — display label
- `fromDate(date)` — converts a `Date` to its string form
- `toDate(value)` — parses a string into a `Date`
- `formatMatcher(value)` — returns true if `value` syntactically matches this format

The list (in order, with array index in parentheses):
0. **JS locale date string** — `formatMatcher: () => false` (never auto-detected)
1. **ISO 8601** — uses `parseISO`
2. **ISO 9075** — uses `parseISO`
3. **RFC 3339** — uses `new Date(...)`
4. **RFC 7231** — uses `new Date(...)`
5. **Unix timestamp** — uses `fromUnixTime(+sec)`
6. **Timestamp** — uses `parseJSON(+ms)` (default selection)
7. **UTC format** — uses `new Date(...)`
8. **Mongo ObjectID** — `objectId.substring(0,8)` parsed hex × 1000
9. **Excel date/time** — `(num - 25569) * 86400 * 1000`

### Auto-detection
On every input change, the tool calls `onDateInputChanged(value)` which iterates through `formats[]` and finds the **first** format whose `formatMatcher(value)` returns `true`. If found, `formatIndex` is set to that index. (The order matters: e.g., a value that matches both `isUnixTimestamp` (10 digits) and `isTimestamp` (1-13 digits) hits Unix first.)

### Normalization
`normalizedDate` is computed:
- If `inputDate` is empty → return `now.value` (continuously updating from `useNow()`).
- Otherwise → call the selected format's `toDate(inputDate)` inside try/catch. On error → `undefined`.

### Render
For each format, `formatDateUsingFormatter(fromDate, normalizedDate)`:
- Returns `''` if no date or validation failed.
- Otherwise tries `fromDate(date)` with `withDefaultOnError(..., '')`.

### Validation
`useValidation` rule:
```ts
{
  message: 'This date is invalid for this format',
  validator: value => {
    if (value === '') return true;
    const d = formats[formatIndex.value].toDate(value);
    return isDate(d) && isValid(d);
  }
}
```
Watches both `inputDate` and `formatIndex`.

### Format detection regexes (in `date-time-converter.models.ts`)

```text
ISO 8601: complex regex (see code) — supports calendar/ordinal/week dates with optional time
ISO 9075: /^([0-9]{4})-([0-9]{2})-([0-9]{2}) ([0-9]{2}):([0-9]{2}):([0-9]{2})(\.[0-9]{1,6})?(([+-])([0-9]{2}):([0-9]{2})|Z)?$/
RFC 3339: /^([0-9]{4})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2}):([0-9]{2})(\.[0-9]{1,9})?(([+-])([0-9]{2}):([0-9]{2})|Z)$/
RFC 7231: /^[A-Za-z]{3},\s[0-9]{2}\s[A-Za-z]{3}\s[0-9]{4}\s[0-9]{2}:[0-9]{2}:[0-9]{2}\sGMT$/
Unix timestamp: /^[0-9]{1,10}$/  (up to 10 digits)
Timestamp: /^[0-9]{1,13}$/        (up to 13 digits)
Mongo ObjectID: /^[0-9a-fA-F]{24}$/
Excel format: /^-?\d+(\.\d+)?$/   (optional sign, decimal)
UTC: detected by round-tripping new Date(date).toUTCString() === date
```

### Excel epoch
Excel counts days since 1900-01-01 (with the buggy 1900-leap-year), so JS uses an offset of **25569 days** to convert between JS milliseconds and Excel serial numbers:
```ts
dateToExcelFormat(date)   = (date.getTime() / 86400000) + 25569
excelFormatToDate(excel)  = new Date((excel - 25569) * 86400 * 1000)
```

### Mongo ObjectID
The first 8 hex characters are seconds since epoch:
```ts
fromDate: date => `${Math.floor(date.getTime() / 1000).toString(16)}0000000000000000`
toDate:   id   => new Date(parseInt(id.substring(0,8), 16) * 1000)
```
Only the timestamp prefix is preserved; the remaining 16 hex characters are filled with zeros.

## Dependencies
- `date-fns` (`^2.29.3`) — `formatISO`, `formatISO9075`, `formatRFC3339`, `formatRFC7231`, `fromUnixTime`, `getTime`, `getUnixTime`, `isDate`, `isValid`, `parseISO`, `parseJSON`
- `@vueuse/core` — `useNow` (live current time)
- `lodash` — `_.isNil` for null/undefined checks in matchers
- `@vicons/tabler` — icon `Calendar`
- `@/utils/defaults` — `withDefaultOnError`
- `@/composable/validation` — `useValidation`
- Internal `input-copyable`, `c-input-text`, `c-select`

## Edge Cases & Validation
- **Empty input** → all output rows show the **current time**, refreshed live via `useNow()`.
- **Invalid input** → the input shows a validation error and all outputs are blank.
- The format dropdown index defaults to `6` (`Timestamp`); if the user types something matching a different format, the dropdown auto-switches.
- Order-of-precedence quirks: a 10-digit number is detected as `Unix timestamp` even if the user intends a `Timestamp` (ms). User can override via the dropdown.
- Excel format accepts negative numbers (dates before 1900-01-01).
- Mongo ObjectID's lower 16 hex bytes are lost in conversion — round-trips lose machine ID and counter.
- The JS locale string format depends on the user's browser locale.
- ISO 9075 strings without the date portion (e.g., `12:00:00Z`) are rejected by `isISO9075DateString`.
- The Unix timestamp value `0` is valid (returns true for both `isUnixTimestamp` and `isTimestamp`).

## Examples
**Auto-detect (e2e test):**
- Input: `2023-04-12T23:10:24+02:00`
- Auto-detected format: `ISO 8601`
- All ten outputs are populated as listed in the Outputs table above.

**Excel ↔ Date round-trip (unit test):**
- `dateToExcelFormat(new Date('2016-05-20T00:00:00.000Z'))` → `'42510'`
- `excelFormatToDate('2')` → `new Date('1900-01-01T00:00:00.000Z')`
- `excelFormatToDate('-1000')` → `new Date('1897-04-04T00:00:00.000Z')`

**Mongo ObjectID detection:** `507f1f77bcf86cd799439011` → matches `isMongoObjectId`.

## File Structure
- `index.ts` — Tool registration; route `/date-converter` (name in i18n: "Date-time converter"); icon `Calendar`
- `date-time-converter.vue` — UI: input, format select, divider, ten read-only output rows
- `date-time-converter.models.ts` — Format-detection regex matchers and Excel/Mongo helpers
- `date-time-converter.models.test.ts` — Vitest tests for each detector and Excel round-trip
- `date-time-converter.types.ts` — `DateFormat`, `ToDateMapper` type definitions
- `date-time-converter.e2e.spec.ts` — Playwright e2e test verifying auto-detection and ten-format output

## Notes
- The route is `/date-converter` (not `/date-time-converter`).
- No persistence; clears on reload.
- Time zones are determined by the browser's local zone.
- `useNow()` causes a re-render every second when the input is empty (live "current time" view).
- The ISO 8601 regex is intentionally lenient (e.g., year-only `2016` is valid ISO 8601).
- The keyword list contains `seconde` (typo for `second`).
