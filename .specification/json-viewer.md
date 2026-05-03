# JSON Prettify and Format (JSON viewer)

## Overview
- **Path:** `/json-prettify`
- **Category:** Development
- **Description:** Translated via i18n key `tools.json-prettify.description` (e.g. "Prettify your JSON string to a human friendly readable format.").
- **Keywords:** json, viewer, prettify, format
- **Redirect from:** `/json-viewer`
- **Created at:** Not set in metadata
- **Icon:** `Braces` from `@vicons/tabler`
- **i18n:** Name/description come from `translate('tools.json-prettify.title')` / `.description`.

## Purpose
Pretty-prints a raw JSON string for human readability. Provides options to recursively sort object keys alphabetically and to choose the indentation depth. Because parsing is done with `JSON5`, the user can paste lenient JSON (trailing commas, single quotes, comments, unquoted keys) and still get strict, prettified JSON back.

## Inputs
| Name | Type | Default | Validation / Range |
| --- | --- | --- | --- |
| Your raw JSON | string (multiline) | `{"hello": "world", "foo": "bar"}` | Must be empty or parseable by `JSON5.parse`; error "Provided JSON is not valid." otherwise. Persisted to localStorage key `json-prettify:raw-json`. |
| Sort keys | boolean (switch) | `true` | None. Persisted to localStorage key `json-prettify:sort-keys`. |
| Indent size | integer (number input) | `3` | `min=0`, `max=10`. Persisted to localStorage key `json-prettify:indent-size`. |

## Outputs
| Name | Type | Description |
| --- | --- | --- |
| Prettified version of your JSON | string | Result of `JSON.stringify(parsed, null, indentSize)`, with `sortObjectKeys` applied recursively when "Sort keys" is on. Rendered in `<TextareaCopyable>` with `language="json"` and `follow-height-of` matching the input height. Empty string when input is invalid. |

## UI / Components
- A centered controls row at the top with two `<n-form-item>`s side-by-side: a `<n-switch>` for "Sort keys :" and a `<n-input-number>` (width 100px) for "Indent size :".
- Below the controls, the input is a multiline `<c-input-text>` with `rows=20`, `monospace`, autocomplete/autocorrect/autocapitalize off, `spellcheck="false"`. A label "Your raw JSON" sits above and a validation feedback message appears below when invalid.
- The output is a `<TextareaCopyable>` (read-only, with copy button and language-aware syntax highlighting) that follows the height of the input element via the `follow-height-of` prop.
- Internal CSS adds a relative-positioned `.result-card` with an absolute `.copy-button` (legacy styling).

## Logic / Algorithm
1. Three reactive refs are bound to localStorage via `useStorage`:
   - `rawJson` (default `{"hello": "world", "foo": "bar"}`)
   - `indentSize` (default `3`)
   - `sortKeys` (default `true`)
2. `cleanJson` is a `computed` that calls `formatJson({ rawJson, indentSize, sortKeys })`, wrapped by `withDefaultOnError(..., '')`.
3. `formatJson` lives in `json.models.ts`:
   ```ts
   function formatJson({ rawJson, sortKeys = true, indentSize = 3 }) {
     const parsedObject = JSON5.parse(get(rawJson));
     return JSON.stringify(get(sortKeys) ? sortObjectKeys(parsedObject) : parsedObject, null, get(indentSize));
   }
   ```
4. `sortObjectKeys<T>(obj)` recursively walks the parsed value:
   - Returns primitives unchanged.
   - For arrays: maps each element through `sortObjectKeys`.
   - For objects: takes `Object.keys(obj)`, sorts them with `localeCompare`, then rebuilds the object key by key (each value recursed).
5. The `useValidation` hook tracks the input ref and runs the rule `v === '' || JSON5.parse(v)`; if `JSON5.parse` throws, the field is marked invalid with message "Provided JSON is not valid." (the `cleanJson` computed simultaneously falls back to `''`).

## Dependencies
- `json5` (^2.2.3) — lenient parser used for input.
- Native `JSON.stringify` — strict prettification of output.
- `@vueuse/core` (`useStorage`, `MaybeRef`, `get`) — localStorage persistence and ref unwrapping.
- `@/composable/validation` (`useValidation`) — drives the inline validation message.
- `@/utils/defaults` (`withDefaultOnError`) — wraps `formatJson` to fall back to `''` on errors.
- `@/components/TextareaCopyable.vue` — read-only output with copy button and syntax highlight.
- Naive UI components (`n-form-item`, `n-switch`, `n-input-number`).

## Edge Cases & Validation
- **Empty input:** validation passes; both `cleanJson` is empty (no output rendered).
- **Invalid JSON:** validator marks the field invalid; `withDefaultOnError` swallows the parse error and the output area is blank.
- **Sort + arrays:** array order is preserved; only objects' keys are sorted.
- **Indent size 0:** `JSON.stringify(value, null, 0)` produces a minified-style output (no indentation, but still with newlines? — actually `JSON.stringify(o, null, 0)` outputs no whitespace; identical to plain `stringify`). Indent size 1–10 inserts that many spaces per level.
- **Nested arrays of objects:** keys inside each object are sorted recursively even when wrapped in arrays.
- **`null` values inside the tree:** `sortObjectKeys` short-circuits on `obj === null` and returns it unchanged.
- The persistence keys (`json-prettify:raw-json`, `json-prettify:indent-size`, `json-prettify:sort-keys`) live across sessions; clearing localStorage resets defaults.

## Examples
**Example 1 — default input + sort + indent 3:**
Input:
```
{"hello": "world", "foo": "bar"}
```
Output:
```json
{
   "foo": "bar",
   "hello": "world"
}
```

**Example 2 — sort off, indent 2:**
Input:
```
{"b": 2, "a": 1, "c": [{"z": 9, "y": 8}]}
```
Output (sort keys = false):
```json
{
  "b": 2,
  "a": 1,
  "c": [
    {
      "z": 9,
      "y": 8
    }
  ]
}
```

**Example 3 — sort on, indent 4 (verified by `json.models.test.ts`):**
```js
sortObjectKeys({ b: 2, a: 1, d: { j: 7, a: [{ z: 9, y: 8 }] }, c: 3 })
// → { a: 1, b: 2, c: 3, d: { a: [{ y: 8, z: 9 }], j: 7 } }
```

## File Structure
- `index.ts` — Tool metadata: name/description from i18n, path `/json-prettify`, redirect from `/json-viewer`.
- `json-viewer.vue` — Vue 3 SFC: persisted controls and reactive output via `formatJson`.
- `json.models.ts` — `formatJson` (parses with `JSON5`, stringifies with `JSON.stringify`) and recursive `sortObjectKeys`.
- `json.models.test.ts` — Vitest unit tests for `sortObjectKeys`, asserting recursive alphabetical ordering of object keys (including inside arrays).

## Notes
- The folder is named `json-viewer` for legacy reasons; the user-visible URL is `/json-prettify` and the tool name comes from the i18n key `tools.json-prettify.title`. The redirect entry preserves old `/json-viewer` bookmarks.
- All three controls persist via `useStorage`, so a returning user gets back exactly the JSON, indent size, and sort preference they last used.
- The output element uses `follow-height-of="inputElement"` so the read-only output grows together with the input area, keeping a balanced layout for large documents.
- i18n is partially applied (title/description), but inline labels in the Vue template are not translated.
