# JSON to XML

## Overview
- **Path:** `/json-to-xml`
- **Category:** Converter
- **Description:** Convert JSON to XML
- **Keywords:** json, xml
- **Redirect from:** None
- **Created at:** 2024-08-09
- **Icon:** `Braces` from `@vicons/tabler`

## Purpose
A converter that turns JSON content into an equivalent XML document. The user pastes (or types) a JSON value into the left pane and the right pane immediately shows the converted XML serialization. The tool uses `xml-js`'s "compact" mode, which means JSON keys map directly to XML element names and a special `_attributes` key inside an object is interpreted as XML attributes on the parent element. Because input is parsed via `JSON5`, trailing commas, single quotes, comments, and unquoted keys are tolerated.

## Inputs
| Name | Type | Default | Validation |
| --- | --- | --- | --- |
| Your JSON content | string (multiline) | `{"a":{"_attributes":{"x":"1.234","y":"It's"}}}` | Must be empty or parseable by `JSON5.parse` (see Logic). Otherwise the validation message "Provided JSON is not valid." is shown. |

## Outputs
| Name | Type | Description |
| --- | --- | --- |
| Converted XML | string | XML document produced by `xml-js`'s `js2xml` in `compact: true` mode. Read-only and copyable. Highlighted with the `xml` language. Empty string when input fails validation. |

## UI / Components
- Wraps the shared `<format-transformer>` component, giving the standard two-pane "input on the left, transformed output on the right" layout.
- Left pane: labelled "Your JSON content" with placeholder "Paste your JSON content here..." and the default JSON above pre-filled.
- Right pane: labelled "Converted XML" with the output rendered with `output-language="xml"` (so the shared component applies XML syntax highlighting and shows a copy button).
- Validation feedback is rendered next to the input when invalid JSON is detected.

## Logic / Algorithm
1. The component declares a `defaultValue` constant `{"a":{"_attributes":{"x":"1.234","y":"It's"}}}` shown in the input.
2. The `transformer(value)` callback runs whenever the input changes:
   - It calls `JSON5.parse(value)` to convert the string to a JS value.
   - It feeds the result to `convert.js2xml(parsed, { compact: true })` from the `xml-js` package.
   - The whole call is wrapped in `withDefaultOnError(..., '')`, so any thrown error yields an empty string.
3. The validation rule allows the empty string ("don't show an error when the field is empty") and otherwise re-runs `JSON5.parse(v)`; if that throws, the validation message "Provided JSON is not valid." is displayed.
4. With `compact: true`, the conventions are:
   - Object keys → element names.
   - `_attributes` → XML attributes.
   - `_text` → text content.
   - Arrays → repeated elements.

## Dependencies
- `xml-js` (^1.6.11) — provides `js2xml` for the actual conversion.
- `json5` (^2.2.3) — lenient JSON parsing (trailing commas, comments, unquoted keys, single quotes, etc.).
- `@/utils/defaults` (`withDefaultOnError`) — internal helper to swallow exceptions and return a fallback.
- `@/composable/validation` (`UseValidationRule`) — typed validation rule definition consumed by `<format-transformer>`.
- `format-transformer` shared Vue component (auto-imported via `unplugin-auto-import` / `unplugin-vue-components`).

## Edge Cases & Validation
- **Empty input:** validation passes (`v === ''`), `transformer` returns empty string, output pane is blank.
- **Invalid JSON:** the validator's `JSON5.parse(v)` throws, the field shows "Provided JSON is not valid.", and `transformer` returns `''` (because `withDefaultOnError` catches the same exception).
- **Plain JS literal (`123`, `"hi"`, `true`):** `xml-js`'s compact serializer produces no element wrapping for primitive top-level values; the output is typically empty.
- **Unicode / special characters:** `xml-js` escapes them automatically for valid XML; entities like `&`, `<`, `>` are encoded.
- **`_attributes` key:** treated specially — its key/value pairs become XML attributes on the parent element rather than child elements.
- No XML declaration (`<?xml ... ?>`) is emitted unless the source JSON includes a `_declaration` key.

## Examples
**Example 1 — default input:**
```json
{"a":{"_attributes":{"x":"1.234","y":"It's"}}}
```
Output:
```xml
<a x="1.234" y="It's"/>
```

**Example 2 — nested elements with text:**
```json
{ "book": { "title": { "_text": "Vue Up & Running" }, "year": 2018 } }
```
Output:
```xml
<book><title>Vue Up &amp; Running</title><year>2018</year></book>
```

**Example 3 — array becomes repeated elements:**
```json
{ "items": { "item": [1, 2, 3] } }
```
Output:
```xml
<items><item>1</item><item>2</item><item>3</item></items>
```

## File Structure
- `index.ts` — Tool metadata definition (`defineTool`) with `name`, `path`, `description`, `keywords`, `component`, `icon`, `createdAt`.
- `json-to-xml.vue` — Vue 3 SFC: validation rules + transformer wrapping `<format-transformer>`.

## Notes
- No `useStorage` — the input is not persisted between sessions; only the default sample is shown on first render.
- No i18n keys are defined for this tool's name/description (it uses the literal English strings, unlike most other tools which use `translate('tools.<name>.title')`). This makes the title/description language-agnostic by happenstance.
- No accessibility customization beyond the underlying shared `<format-transformer>`.
- No tests (no `.test.ts` or `.spec.ts` exists for this tool).
