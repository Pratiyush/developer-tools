# Phone Parser and Formatter

## Overview
- **Path:** `/phone-parser-and-formatter`
- **Category:** Data
- **Description:** Parse, validate, and format a telephone number, displaying country, type, and multiple canonical formats.
- **Keywords:** phone, parser, formatter, validate, format, number, telephone, mobile, cell, international, national
- **Redirect from:** None
- **Created:** 2023-05-01
- **Icon:** `Phone` (from `@vicons/tabler`)

## Purpose
This tool takes a free-form phone number (with optional spaces, plus signs, dashes, and parentheses) plus a default country code and produces a complete breakdown including the inferred country, the country calling code, validity flags, the type of phone (mobile, fixed line, VoIP, etc.) and four canonical string representations (international, national, E.164, and RFC3966). It is helpful for engineers cleaning up user-supplied phone data or writing validation logic, and for support staff who receive numbers in inconsistent formats and need to normalize them.

## Inputs

| Name | Type | Default | Validation |
|------|------|---------|------------|
| `defaultCountryCode` | `CountryCode` (ISO-3166 alpha-2 string from `libphonenumber-js`) | Inferred from `window.navigator.language` (locale's region part); falls back to `'FR'` if locale has no region or is unknown | Must be one of the country codes returned by `getCountries()` from `libphonenumber-js/max`. The select is searchable. |
| `rawPhone` | `string` | `''` (empty) | Either empty or matches `/^[0-9 +\-()]+$/` (digits, spaces, `+`, `-`, `(`, `)`). Validation message: "Invalid phone number". |

## Outputs
When the input is non-empty, validates, and `parsePhoneNumber` succeeds, a table renders with these rows:

| Label | Type | Description |
|-------|------|-------------|
| Country | string \| undefined | ISO-3166 alpha-2 country code returned by `parsed.country` (e.g., `US`). |
| Country | string \| undefined | Full country name resolved via `country-code-lookup` (`lookup.byIso(parsed.country)?.country`), e.g., `United States`. (Two rows are intentionally labeled "Country" — code, then name.) |
| Country calling code | string | International dialing prefix without `+` (e.g., `1`, `33`). |
| Is valid? | string | "Yes"/"No" derived from `parsed.isValid()` via `booleanToHumanReadable`. |
| Is possible? | string | "Yes"/"No" derived from `parsed.isPossible()`. |
| Type | string \| undefined | Human-readable line type (see mapping below). |
| International format | string | E.g. `+1 415 555 2671`. |
| National format | string | E.g. `(415) 555-2671`. |
| E.164 format | string | E.g. `+14155552671` (compact). |
| RFC3966 format | string | E.g. `tel:+1-415-555-2671`. |

The type label mapping (`formatTypeToHumanReadable`):

```ts
MOBILE                  -> 'Mobile'
FIXED_LINE              -> 'Fixed line'
FIXED_LINE_OR_MOBILE    -> 'Fixed line or mobile'
PERSONAL_NUMBER         -> 'Personal number'
PREMIUM_RATE            -> 'Premium rate'
SHARED_COST             -> 'Shared cost'
TOLL_FREE               -> 'Toll free'
UAN                     -> 'Universal access number'
VOICEMAIL               -> 'Voicemail'
VOIP                    -> 'VoIP'
PAGER                   -> 'Pager'
```

Each value cell renders via `<span-copyable>` (one click to copy). When a field is missing, "Unknown" is shown (with `op-70`).

## UI / Components
- **Default-country select:** `c-select` (searchable) — options come from `libphonenumber-js`' `getCountries()`. Each label is `"<full country name from country-code-lookup> (+<calling code>)"`; falls back to the ISO code if `country-code-lookup` doesn't know the country.
- **Phone number input:** `c-input-text` with placeholder "Enter a phone number" and live validation.
- **Results table:** `n-table` rendered conditionally (`v-if="parsedDetails"`). Each row uses `font-bold` for the label cell, and `<span-copyable>` for copy-on-click.

Layout is a single column, with `mb-5` spacing between the select, the input, and the table.

## Logic / Algorithm
1. Determine `defaultCountryCode` once on mount via `getDefaultCountryCode()`:
   ```ts
   const countryCode = locale.split('-')[1]?.toUpperCase();
   return (lookup.byIso(countryCode)?.iso2 ?? defaultCode) as CountryCode; // defaultCode = 'FR'
   ```
2. The user types a number. The input is validated against `/^[0-9 +\-()]+$/` (or empty).
3. If valid, the `parsedDetails` computed runs:
   - `parsePhoneNumber(rawPhone, defaultCountryCode)` from `libphonenumber-js/max`.
   - Wrapped in `withDefaultOnError(..., undefined)` so a parse exception just yields `undefined` (no UI error).
4. If parsing succeeds, build the array of `{label, value}` rows shown above.
5. The `max` build of libphonenumber-js is used (largest metadata bundle, supports `getType()`).

## Dependencies
- `libphonenumber-js/max` — phone parsing/formatting library; the `max` entry point includes line-type metadata (mobile, fixed, etc.).
- `country-code-lookup` — ISO-3166 lookup for full country names.
- `@vicons/tabler` (`Phone` icon).
- Internal: `useValidation` composable, `withDefaultOnError`, `booleanToHumanReadable`, `c-select`, `c-input-text`, `span-copyable`, `n-table`.

## Edge Cases & Validation
- **Empty input:** validation passes (regex allows empty), but `parsedDetails` is `undefined` so the table is not rendered.
- **Characters outside `[0-9 +\-()]`:** validation fails ("Invalid phone number"), table is not shown.
- **Parse exception:** the underlying library throws on malformed input even after the regex check (e.g., a single `+`); the `withDefaultOnError` wrapper swallows it, and the table simply doesn't render.
- **Number with no inferable country:** `parsed.country` is `undefined`, so the first "Country" row shows "Unknown" and the resolved full name is also "Unknown".
- **`getType()` returns `undefined`:** the "Type" cell shows "Unknown".
- **Invalid but possible numbers:** Both flags are independent; the user sees both in the output.

## Examples
1. `defaultCountryCode = 'US'`, input `(415) 555-2671`:
   - Country: `US` / `United States`
   - Country calling code: `1`
   - Is valid? Yes; Is possible? Yes
   - International format: `+1 415 555 2671`
   - National format: `(415) 555-2671`
   - E.164: `+14155552671`
   - RFC3966: `tel:+1-415-555-2671`
2. `defaultCountryCode = 'FR'`, input `+33 1 23 45 67 89`:
   - Country: `FR` / `France`
   - Country calling code: `33`
   - National format: `01 23 45 67 89`
   - E.164: `+33123456789`

## File Structure
- `index.ts` — Tool registration (path, name, keywords, icon, lazy-loaded component, `createdAt`).
- `phone-parser-and-formatter.vue` — Single-page component containing all UI and reactive logic.
- `phone-parser-and-formatter.models.ts` — Helpers: `formatTypeToHumanReadable`, `getFullCountryName`, `getDefaultCountryCode`, plus the `typeToLabel` map.
- `phone-parser-and-formatter.e2e.spec.ts` — Playwright smoke test that asserts the page title is `Phone parser and formatter - IT Tools`.

## Notes
- Title and description come from i18n (`tools.phone-parser-and-formatter.title`/`.description`); localized strings live in the i18n locale files.
- The component does not persist state — `defaultCountryCode` and `rawPhone` reset on navigation. No `useStorage`/`useQueryParamOrStorage` usage here.
- The default-country auto-detection runs at module setup time using `window.navigator.language`; reloading the page after changing the OS/browser language picks up a new default.
- "Country" appears twice in the output (ISO code, then full name) — this is intentional in the source.
- Uses `libphonenumber-js/max` (not `min` or `mobile`) — bundle size is heavier, but `getType()` is reliable.
