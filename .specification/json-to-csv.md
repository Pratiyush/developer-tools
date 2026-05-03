# JSON to CSV

## Overview
- **Path:** `/json-to-csv`
- **Category:** Development
- **Description:** Convert JSON to CSV with automatic header detection.
- **Keywords:** json, to, csv, convert
- **Redirect from:** None
- **Icon:** `List` from `@vicons/tabler`
- **Created at:** 2023-06-18

## Purpose
Given an array of objects expressed in JSON (or JSON5), emit a CSV string with the union of all object keys as the header row. Designed for converting API responses or fixture data into a spreadsheet-importable form. Handles missing keys (empty cells), commas (auto-quoted), newlines/carriage returns (escaped to `\n`/`\r`), and double quotes (escaped to `\"`).

## Inputs
| Name | Type | Default | Validation |
|---|---|---|---|
| Input textarea (`value`) | `string` (JSON5 — must be an array of objects when valid) | `''` | `value === '' \|\| JSON5.parse(value)` — the parse must not throw. Error message: `Provided JSON is not valid.` |

The validator only checks that the input parses; the transformer assumes the parsed value is an `Array<Record<string, unknown>>`. If the parsed value is something else (an object, a primitive), `convertArrayToCsv` may behave unexpectedly (see Edge Cases).

## Outputs
| Output | Type | Description |
|---|---|---|
| Right textarea | `string` (CSV) | Header row (comma-separated keys) followed by data rows joined by `\n`. No language highlighting (`output-language` defaults to empty). |

The header row is the union of all keys across all objects, in first-seen order. Each data row contains the value for each header (empty when the key is absent).

## UI / Components
The tool uses the shared `FormatTransformer` component:

- Left: `CInputText` (label `Your raw JSON`, placeholder `Paste your raw JSON here...`, `multiline`, `monospace`, `raw-text`, `rows="20"`, `autosize`, `test-id="input"`, validation rule from `rules`).
- Right: label `CSV version of your JSON` over `textarea-copyable` showing the live transform.
- No additional toggles or buttons.

## Logic / Algorithm
**Component (`json-to-csv.vue`):**
```ts
function transformer(value: string) {
  return withDefaultOnError(() => {
    if (value === '') return '';
    return convertArrayToCsv({ array: JSON5.parse(value) });
  }, '');
}
```

**Service (`json-to-csv.service.ts`):**

1. **`getHeaders({ array })`** — iterates each object, builds a `Set<string>` of keys (preserving first-seen order), then returns `Array.from(set)`.
2. **`serializeValue(value)`**:
   - `null` → literal `'null'` (the four-character string).
   - `undefined` → empty string.
   - Otherwise: `String(value)`, then replace `\n` → `\\n`, `\r` → `\\r`, `"` → `\\"`. If the resulting string contains a comma, wrap it in double quotes; otherwise return as-is.
3. **`convertArrayToCsv({ array })`** — builds:
   ```
   headers = getHeaders({ array })
   rows = array.map(item => headers.map(h => serializeValue(item[h])))
   return [headers.join(','), ...rows].join('\n')
   ```

The transformer wraps everything in `withDefaultOnError` so any failure (parse, lookup) yields an empty output rather than crashing.

## Dependencies
- `json5` (`^2.2.3`) — accepts relaxed JSON (single quotes, trailing commas, comments).
- `@vicons/tabler` `List`.
- Local: `convertArrayToCsv` from `./json-to-csv.service`, `withDefaultOnError`, `FormatTransformer.vue`, `c-input-text`, `textarea-copyable`.

## Edge Cases & Validation
- Empty input → output empty.
- Invalid JSON → validation banner; output empty.
- Empty array `[]` → headers empty array, output empty string.
- Single object `[{ "a": 1 }]` → header `a`, one row `1`.
- Heterogeneous keys per row: missing keys produce empty cells. Test:
  - `[{ a: 1, b: 2 }, { a: 3, c: 4 }]` → `"a,b,c\n1,2,\n3,,4"`.
- `null` values: serialized as the literal string `null` (so distinguishable from empty in some contexts but not all).
- `undefined` values: serialized as empty string.
- Strings with commas: wrapped in double quotes (`hello, world` → `"hello, world"`).
- Strings with double quotes: each `"` becomes `\"`. Test asserts:
  - Input `{ a: 'hello "world"', b: 2 }` → `a,b\nhello \\"world\\",2` (no surrounding quotes because no comma is present).
- Strings with newlines/carriage returns: replaced with the two-character escape sequences `\n`/`\r` (note: this is an unusual CSV dialect — most CSVs would wrap the field in double quotes and keep the literal newline; this tool escapes them instead).
- Header order matches the order of first appearance, not lexicographic order.
- Nested objects/arrays as values: `String(value)` produces `[object Object]` or `1,2,3` etc., which may not be what the user wants — there's no flattening or JSON-encoding of nested values.

## Examples
- Input:
  ```
  [
    { "Age": 18, "Salary": 20000, "Gender": "Male", "Country": "Germany", "Purchased": "N" },
    { "Age": 19, "Salary": 22000, "Gender": "Female", "Country": "France", "Purchased": "N" }
  ]
  ```
  Output:
  ```
  Age,Salary,Gender,Country,Purchased
  18,20000,Male,Germany,N
  19,22000,Female,France,N
  ```
- Input: `[{a:1,b:2},{a:3,b:4}]` → `a,b\n1,2\n3,4`.
- Input: `[{a:1,b:2},{a:3,c:4}]` → `a,b,c\n1,2,\n3,,4`.
- Input: `[{a: null, b: 2}]` → `a,b\nnull,2`.
- Input: `[{a: 'hello, world', b: 2}]` → `a,b\n"hello, world",2`.

## File Structure
- `index.ts` — Tool metadata; route `/json-to-csv`; `createdAt: 2023-06-18`.
- `json-to-csv.vue` — Embeds `<format-transformer>`, defines `transformer` and validation rules.
- `json-to-csv.service.ts` — Pure helpers `getHeaders`, `serializeValue` (file-scoped), `convertArrayToCsv`.
- `json-to-csv.service.test.ts` — Vitest unit tests for header extraction, missing keys, null/undefined handling, comma quoting, double-quote escaping.
- `json-to-csv.e2e.spec.ts` — Playwright smoke test verifying title and a sample conversion.

## Notes
- No persistence; reload empties the input.
- Number formatting: `Number(18.0)` becomes the string `18` (trailing zero is dropped because of native `String(...)` on a `number`). The e2e test expects `18`, `20000`, `22000` rather than `18.0`, `20000.0`.
- The tool does not implement RFC 4180 strict CSV; in particular it escapes newlines as the literal two-character sequences `\n` rather than wrapping fields in double quotes, and it does not wrap fields containing only quotes (without commas).
- The tool name (translation key `tools.json-to-csv.*`) and the labels are taken from i18n; per-cell content is not translated.
