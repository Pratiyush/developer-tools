# TOML to JSON

## Overview
- **Path:** `/toml-to-json`
- **Category:** Converter
- **Description:** Parse and convert TOML to JSON.
- **Keywords:** `toml`, `json`, `convert`, `online`, `transform`, `parser`
- **Redirect from:** None
- **Icon:** `BracketIcon` from `~icons/mdi/code-brackets`
- **Created at:** `2023-06-23`

## Purpose
Converts a TOML document supplied by the user into pretty-printed JSON. Useful when migrating configuration formats (e.g. between Cargo, Pyproject, Poetry, or other TOML-based tooling and JSON-consuming systems), exploring how a TOML structure maps to a JSON object, or quickly validating a TOML snippet (since invalid TOML triggers an inline error). The page is built on top of the generic `<format-transformer>` component used by all "X to Y" converter tools.

## Inputs
| Name | Type | Default | Validation |
| ---- | ---- | ------- | ---------- |
| TOML input | `string` (multiline textarea) | `''` | `isValidToml(value)` — must parse successfully via `iarna-toml-esm`. Failure displays the message: **"Provided TOML is not valid."** |

The input area uses the shared `FormatTransformer` component (`rows="20"`, `autosize`, `multiline`, `monospace`, `raw-text`, `test-id="input"`). Placeholder: `"Paste your TOML here..."`. Label: `"Your TOML"`.

## Outputs
| Name | Type | Description |
| ---- | ---- | ----------- |
| JSON output | `string` (rendered in a copyable code block) | The TOML parsed into a JS object and stringified with `JSON.stringify(value, null, 3)` (3-space indentation). On any parse error, output is `''`. |

The output uses `<textarea-copyable>` with `language="json"` so it gets syntax highlighting and a copy affordance from that shared component. Label: `"JSON from your TOML"`.

## UI / Components
The component is a thin wrapper over `<format-transformer>`:

```vue
<format-transformer
  input-label="Your TOML"
  input-placeholder="Paste your TOML here..."
  output-label="JSON from your TOML"
  output-language="json"
  :input-validation-rules="rules"
  :transformer="transformer"
/>
```

`FormatTransformer` lays out:
- A labelled `CInputText` (multiline, raw-text, monospace, autosize, 20 rows initially) bound to internal `input` ref.
- An output area showing `outputLabel` followed by `<textarea-copyable :value :language="json" :follow-height-of="inputElement">`. The copyable component handles the "Copy" button and syntax highlighting.

There is no extra config UI — this tool offers only the input/output pair.

## Logic / Algorithm
**Validation (`toml.services.ts`):**
```ts
import { parse as parseToml } from 'iarna-toml-esm';
import { isNotThrowing } from '../../utils/boolean';

export function isValidToml(toml: string): boolean {
  return isNotThrowing(() => parseToml(toml));
}
```

**Transformation (`toml-to-json.vue`):**
```ts
const transformer = (value: string) =>
  value === '' ? '' : withDefaultOnError(() => JSON.stringify(parseToml(value), null, 3), '');
```

Step-by-step:
1. If the trimmed input is empty (`value === ''`), short-circuit to `''` without invoking the parser.
2. Otherwise call `parseToml(value)` to obtain a plain JS object. The parser supports the full TOML 1.0 spec (tables, inline tables, arrays of tables, dotted keys, dates, integers, floats, etc.).
3. `JSON.stringify(parsed, null, 3)` formats the result with 3-space indentation. The `null` replacer emits all enumerable string-keyed properties.
4. Any thrown error during parse or stringify is caught by `withDefaultOnError`, which returns `''`. The validator runs separately and surfaces the user-visible error message.

The `format-transformer` runs `transformer(input)` reactively, so the JSON updates live as the user types.

## Dependencies
- `iarna-toml-esm` (`^3.0.5`) — ESM-friendly fork of `@iarna/toml`. Used for parsing TOML.
- `@/utils/boolean` (`isNotThrowing`) — wrap a `cb` and return `true` if it doesn't throw.
- `@/utils/defaults` (`withDefaultOnError`) — try/catch helper that returns a fallback on throw.
- `~icons/mdi/code-brackets` — icon (`unplugin-icons` resolver pulling from `@mdi/js`).
- `<format-transformer>` and `<textarea-copyable>` shared components.

## Edge Cases & Validation
- **Empty input:** Output is `''`. No validation message is shown (the validator only flags non-empty bad TOML; empty is treated as valid).
- **Invalid TOML:** The validator surfaces the inline message `"Provided TOML is not valid."` Output remains `''` because the transformer's `withDefaultOnError` swallows the parser exception.
- **Whitespace-only input:** Treated as non-empty by the `=== ''` check, so the parser is invoked. `iarna-toml-esm` accepts pure whitespace as valid (returns `{}`); output becomes `"{}"` (with the `null, 3` formatting). However, the test in `toml-to-json.e2e.spec.ts` uses `.trim()` so both sides of the assertion drop whitespace.
- **TOML dates / datetimes:** `@iarna/toml` returns `Date` objects for date values; `JSON.stringify` emits these as ISO 8601 strings.
- **TOML BigInts:** Integers larger than `Number.MAX_SAFE_INTEGER` are returned by the parser as `BigInt`; `JSON.stringify` will throw on `BigInt`, so the `withDefaultOnError` catches it and the output becomes `''`. (Validation does **not** flag this because the parse itself succeeds.)
- **Nested tables:** Preserved as nested objects in JSON.
- **Arrays of tables (`[[items]]`):** Become arrays of objects in JSON.
- **Comments:** Stripped (TOML comments are not preserved by `parseToml`).

## Examples

**Example 1 — Basic table with nested sub-table** (asserted by e2e test):

Input:
```toml
foo = "bar"

# This is a comment

[list]
  name = "item"
[list.another]
  key = "value"
```

Output (3-space indent):
```json
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

**Example 2 — Mixed types**:

Input:
```toml
title = "Example"
count = 42
enabled = true
ratio = 0.75
tags = ["a", "b"]
created = 2023-06-23T12:00:00Z

[server]
host = "localhost"
port = 8080
```

Output:
```json
{
   "title": "Example",
   "count": 42,
   "enabled": true,
   "ratio": 0.75,
   "tags": ["a", "b"],
   "created": "2023-06-23T12:00:00.000Z",
   "server": {
      "host": "localhost",
      "port": 8080
   }
}
```

(Array formatting depends on `JSON.stringify` defaults; arrays may render across multiple lines with the 3-space indent.)

**Example 3 — Empty / Invalid:**
- Empty input → empty output, no error.
- Input `foo = ` (incomplete) → output `''`, validation message `"Provided TOML is not valid."`.

## File Structure
- `index.ts` — Tool descriptor (path, name, description, keywords, icon, `createdAt`).
- `toml.services.ts` — Exports `isValidToml`. Note the filename is **`toml.services.ts`** (plural with a dot), not `toml-to-json.service.ts` — and is also imported by sibling tool `toml-to-yaml`.
- `toml-to-json.vue` — Tiny wrapper using `<format-transformer>` with the TOML→JSON transformer and validator.
- `toml-to-json.e2e.spec.ts` — Playwright test asserting page title and a specific input/output pair.

## Notes
- **No unit tests** — only an e2e test exists.
- The validation rule is shared via the exported `isValidToml` helper, which is reused by the `toml-to-yaml` tool (`../toml-to-json/toml.services`).
- No persistence; input/output are session-scoped only.
- Title and description are i18n-translated; the validation message and labels are hardcoded English.
- The `format-transformer` provides syntax highlighting via the `language="json"` prop on `textarea-copyable`.
- Indentation is **3 spaces** (slightly unusual; most JSON formatters use 2 or 4).
