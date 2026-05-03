# JSON Minify

## Overview
- **Path:** `/json-minify`
- **Category:** Development
- **Description:** Minify and compress your JSON by removing unnecessary whitespace.
- **Keywords:** json, minify, format
- **Redirect from:** None
- **Icon:** `Braces` from `@vicons/tabler`
- **Created at:** Not specified

## Purpose
Take a JSON (or relaxed JSON5) document and re-emit it without any indentation, line breaks, or unnecessary whitespace. Useful when shrinking payloads for inline storage, embedding in environment variables, or copying into single-line config slots. Because the parser is JSON5, the tool also doubles as a sanitizer that converts JSON5 (with comments / single quotes / trailing commas) into strict, minified JSON.

## Inputs
| Name | Type | Default | Validation |
|---|---|---|---|
| Input textarea (`value`) | `string` (JSON5) | `'{\n\t"hello": [\n\t\t"world"\n\t]\n}'` | `value === '' \|\| JSON5.parse(value)` (any thrown parse error fails the rule). Error message: `Provided JSON is not valid.` |

## Outputs
| Output | Type | Description |
|---|---|---|
| Right textarea | `string` | `JSON.stringify(JSON5.parse(value), null, 0)` — the canonical strict-JSON minified form (no spaces, no newlines). On invalid input the output is empty. |

The output panel is rendered with the `output-language="json"` syntax highlighter inside `textarea-copyable`.

## UI / Components
The tool relies entirely on the shared `FormatTransformer` component (`src/components/FormatTransformer.vue`):

- Left side: `CInputText` with the supplied default value, label `Your raw JSON`, placeholder `Paste your raw JSON here...`, `multiline`, `rows="20"`, `autosize`, `monospace`, `raw-text`, `test-id="input"`, `validationRules` from this tool's `rules` array.
- Right side: a label (`Minified version of your JSON`) plus `textarea-copyable` displaying the live-transformed output. The output textarea follows the height of the input textarea (`follow-height-of`), so they grow together as the user types.
- No additional buttons, no settings — the transformation is automatic on every keystroke.

## Logic / Algorithm
Inside `json-minify.vue`:

```ts
const transformer = (value: string) => withDefaultOnError(
  () => JSON.stringify(JSON5.parse(value), null, 0),
  ''
);
```

Steps per input change:
1. Parse with `JSON5.parse(value)` — strict JSON is a subset of JSON5, so any valid JSON also parses; in addition, JSON5 features (comments, unquoted keys, trailing commas, single quotes, hex literals, leading/trailing decimals) are accepted.
2. Re-serialize with `JSON.stringify(parsed, null, 0)` — the third argument `0` produces no whitespace at all (no indentation, no line breaks, no spaces between separators).
3. Wrap the operation in `withDefaultOnError(..., '')` so any parse failure produces an empty output rather than an exception bubbling up.

`FormatTransformer` simply binds the input via `v-model:value="input"` and pipes through `output = transformer(input)`.

## Dependencies
- `json5` (`^2.2.3`) — relaxed JSON parsing.
- Native `JSON.stringify`.
- `@vicons/tabler` `Braces`.
- Local: `@/utils/defaults.withDefaultOnError`, `@/components/FormatTransformer.vue`, `@/ui/c-input-text/c-input-text.vue`, `textarea-copyable` component.

## Edge Cases & Validation
- Empty input: validation passes (`value === ''` short-circuit) and the output is also empty.
- Invalid JSON: validation fails with `Provided JSON is not valid.`; output remains empty due to `withDefaultOnError`.
- JSON5 features supported (e.g. `{ /* comment */ a: 'b', }` parses fine and minifies to `{"a":"b"}`).
- Numbers are output via `JSON.stringify`, so trailing zeros are dropped, scientific notation is preserved, and `NaN`/`Infinity` cannot round-trip (JSON spec disallows them; even if JSON5 accepts them, `JSON.stringify` would emit `null`).
- Unicode escapes in strings are preserved; `JSON.stringify` does not pretty-encode characters above U+007F unless the source escaped them.
- Order of object keys is preserved as iteration order from `JSON5.parse` (modern V8 keeps insertion order for string keys).

## Examples
- Input:
  ```
  {
    "hello": [
      "world"
    ]
  }
  ```
  Output: `{"hello":["world"]}`
- Input (JSON5): `{ a: 1, b: 'two', /* note */ }` → Output: `{"a":1,"b":"two"}`
- Input: `{not valid json` → output empty, validation banner shows error.
- Input: `[1, 2, 3, 4]` → Output: `[1,2,3,4]`

## File Structure
- `index.ts` — Tool metadata; route `/json-minify`; icon `Braces`.
- `json-minify.vue` — Defines the `defaultValue`, the `transformer` function, the validation rules, and embeds `<format-transformer>`.

## Notes
- No tests in the tool folder.
- No persistence (input is not stored in localStorage); reload resets to `defaultValue`.
- i18n: title/description from `tools.json-minify.*`. The `Your raw JSON`, `Minified version of your JSON`, placeholder, and validation message are hard-coded.
- The tool's behavior is identical to a generic "JSON5 → strict JSON minified" formatter.
