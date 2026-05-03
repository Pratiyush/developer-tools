# JSON to TOML

## Overview
- **Path:** `/json-to-toml`
- **Category:** Converter
- **Description:** Parse and convert JSON to TOML.
- **Keywords:** json, parse, toml, convert, transform
- **Redirect from:** None
- **Icon:** `Braces` from `@vicons/tabler`
- **Created at:** 2023-06-23

## Purpose
Convert a JSON (or relaxed JSON5) document into the TOML configuration format. Useful for migrating configuration between systems (e.g. converting an `app.json` to an `app.toml`), or for understanding how a particular JSON shape maps onto TOML's table-based syntax.

## Inputs
| Name | Type | Default | Validation |
|---|---|---|---|
| Input textarea (`value`) | `string` (JSON5) | `''` | `value === '' \|\| JSON5.parse(value)` — must parse without throwing. Error message: `Provided JSON is not valid.` |

## Outputs
| Output | Type | Description |
|---|---|---|
| Right textarea | `string` (TOML) | TOML string produced by `iarna-toml-esm.stringify`, with the array result flattened, joined by `\n`, then `.trim()`-ed. Empty when input is empty/whitespace or invalid. |

The output panel uses `output-language="toml"` for syntax highlighting.

## UI / Components
Built atop the shared `FormatTransformer`:

- Left: `CInputText` (label `Your JSON`, placeholder `Paste your JSON here...`, `multiline`, `monospace`, `raw-text`, `rows="20"`, `autosize`, `test-id="input"`, validation rule from `rules`).
- Right: label `TOML from your JSON` over `textarea-copyable` rendering the live transform with TOML highlighting.

No additional toggles or buttons.

## Logic / Algorithm
The component (`json-to-toml.vue`) defines:

```ts
const convertJsonToToml = (value: string) =>
  [stringifyToml(JSON5.parse(value))].flat().join('\n').trim();

const transformer = (value: string) =>
  value.trim() === ''
    ? ''
    : withDefaultOnError(() => convertJsonToToml(value), '');
```

Steps:
1. If the input is empty or whitespace, output is empty.
2. Otherwise, `JSON5.parse(value)` — relaxed JSON parser.
3. `iarna-toml-esm.stringify(parsed)` — produces a TOML string. The result is wrapped in an array and flattened (`[...].flat()`) so that whether the library returns a string or string array, both shapes are handled uniformly.
4. Joined with `\n`.
5. `.trim()` removes leading/trailing whitespace.
6. Any thrown error (e.g. parsing the JSON or unsupported TOML structure) yields an empty string via `withDefaultOnError`.

The TOML library follows the `@iarna/toml` semantics (encoded into ESM as `iarna-toml-esm`):
- Top-level scalar/array fields print first.
- Nested objects become `[table]` headers.
- Deeply nested objects nest with indented `[parent.child]` headers (the e2e test confirms two-space indentation for `[list.another]`).

## Dependencies
- `iarna-toml-esm` (`^3.0.5`) — TOML serializer.
- `json5` (`^2.2.3`) — relaxed JSON parser.
- `@vicons/tabler` `Braces`.
- Local: `withDefaultOnError`, `FormatTransformer.vue`, `c-input-text`, `textarea-copyable`.

## Edge Cases & Validation
- Empty/whitespace-only input → output empty (and validation passes).
- Invalid JSON → validation banner `Provided JSON is not valid.`; output empty.
- Top-level non-object inputs (e.g., `[1,2,3]`, `"foo"`, `42`) — TOML requires a top-level table; `iarna-toml-esm.stringify` will throw, leading to an empty output.
- Mixed-type arrays — TOML disallows arrays of mixed types; the library will throw and the output will be empty.
- Keys containing dots, spaces, or other special characters — the TOML serializer auto-quotes them per the spec.
- Unicode strings are preserved (encoded in TOML's basic strings).
- Dates: JSON has no date type, so dates remain ISO strings rather than TOML datetimes.
- Order of keys: object iteration order is preserved from `JSON5.parse`, but `iarna-toml-esm` reorders top-level scalars before tables (so they appear before `[table]` headers, as TOML requires).

## Examples
- Input:
  ```
  {
     "foo": "bar",
     "list": {
        "name": "item",
        "another": {
           "key": "value"
        }
     }
  }
  ```
  Output:
  ```
  foo = "bar"

  [list]
  name = "item"

    [list.another]
    key = "value"
  ```
- Input: `{ "name": "test", "version": 1 }` → `name = "test"\nversion = 1`.
- Input: `{}` → empty string (after trim).
- Input: `{ "arr": [1, 2, 3] }` → `arr = [ 1, 2, 3 ]` (or similar, depending on the library's pretty form).

## File Structure
- `index.ts` — Tool metadata; route `/json-to-toml`; icon `Braces`; `createdAt: 2023-06-23`.
- `json-to-toml.vue` — Defines `convertJsonToToml`, the `transformer`, validation rules; embeds `<format-transformer>`.
- `json-to-toml.e2e.spec.ts` — Playwright tests for page title and a multi-level conversion.

## Notes
- No persistence; reload clears input.
- No unit tests for the transformer itself — the e2e test plus the underlying library's test suite are the coverage.
- i18n: title/description from `tools.json-to-toml.*`. UI labels are hard-coded.
- The icon `Braces` is the same as for `json-minify`, reflecting the shared "JSON-input" character of the tool.
- The flatten-then-join-then-trim pipeline (`[stringifyToml(...)].flat().join('\n').trim()`) is defensive: it works whether `stringifyToml` returns a `string` or an array of lines, and strips leading/trailing whitespace either way.
