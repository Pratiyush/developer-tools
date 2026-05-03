# XML to JSON

## Overview
- **Path:** `/xml-to-json`
- **Category:** Converter
- **Description:** Convert XML to JSON
- **Keywords:** `xml`, `json`
- **Redirect from:** None
- **Icon:** `Braces` (from `@vicons/tabler`)
- **Created:** 2024-08-09

## Purpose
A one-way converter that turns an XML document into its JSON representation using the `xml-js` library's "compact" object form. The user pastes XML, the tool emits a hierarchical JSON object that mirrors the XML tree (with attributes under `_attributes` keys, text under `_text`, etc.). Useful for piping XML data into tools or services that consume JSON, or for visually inspecting XML structure as a JS object.

## Inputs
| Field | Type | Default | Validation |
|-------|------|---------|------------|
| Input XML | `string` (multiline textarea, provided by `<format-transformer>`) | `'<a x="1.234" y="It\'s"/>'` | Validated via the same `isValidXML` rule used by the XML formatter — invalid XML shows `"Provided XML is not valid."` |

The tool intentionally exposes no formatting options — output indentation is fixed at 2 spaces.

## Outputs
| Output | Type | Description |
|--------|------|-------------|
| Converted JSON | `string` | Pretty-printed JSON with 2-space indent, syntax-highlighted as JSON, with a copy button (rendered by `<format-transformer>`) |

## UI / Components
A single `<format-transformer>` component:
- `input-label="Your XML content"`, `input-placeholder="Paste your XML content here..."`, `:input-default="defaultValue"`.
- `output-label="Converted JSON"`, `output-language="json"`.
- `:transformer="transformer"`, `:input-validation-rules="rules"`.

No other controls — there are no toggles for compact-vs-verbose mode, no namespace handling switches, etc.

## Logic / Algorithm
1. The transformer wraps `convert.xml2js(value, { compact: true })` (from `xml-js`) and pretty-prints with `JSON.stringify(obj, null, 2)`.
2. Errors are caught by `withDefaultOnError(..., '')`, returning an empty string when the input is unparseable.
3. The validation rule is shared with `xml-formatter`: imports `isValidXML` from `../xml-formatter/xml-formatter.service`. Empty input is considered valid.

```ts
function transformer(value: string) {
  return withDefaultOnError(() => {
    return JSON.stringify(convert.xml2js(value, { compact: true }), null, 2);
  }, '');
}
```

The `compact: true` mode of `xml-js` produces an object where:
- Element children are keys whose values are nested objects (or arrays when an element repeats).
- Attributes go under a `_attributes` key.
- Text content goes under a `_text` key.
- Declarations under `_declaration`, comments under `_comment`, CDATA under `_cdata`, etc.

## Dependencies
- `xml-js` (`^1.6.11`) — `xml2js(...)` parser used in `compact` mode.
- `xml-formatter` (transitively) — only via the shared `isValidXML` validator.
- `@/utils/defaults#withDefaultOnError` — error-safe transformation.
- Shared layout component `<format-transformer>`.
- `@vicons/tabler#Braces` — icon.

## Edge Cases & Validation
- **Empty input:** `isValidXML` returns `true`; transformer's `xml-js` call returns `{}`, JSON output is `"{}"`.
- **Invalid XML (e.g., unclosed tag, garbage text):** the validator marks it invalid and the message appears; transformer returns `''`.
- **XML declaration (`<?xml ... ?>`):** preserved under a `_declaration` key in the output.
- **Repeated sibling elements:** `xml-js` represents them as arrays of objects under the shared element name (different from non-compact mode, which always uses arrays).
- **Self-closing tags:** parsed as elements with attributes only (no `_text`).
- **Attributes containing entity-encoded characters (`&apos;`, `&amp;` etc.)** are decoded by `xml-js`. The default value `<a x="1.234" y="It's"/>` exercises an apostrophe.
- The transformer doesn't expose options for `alwaysArray`, `nativeType`, `ignoreAttributes`, etc. — only defaults of `compact: true`.

## Examples
**Example 1 — default value**
- Input: `<a x="1.234" y="It's"/>`
- Output:
  ```json
  {
    "a": {
      "_attributes": {
        "x": "1.234",
        "y": "It's"
      }
    }
  }
  ```

**Example 2 — nested elements with text and attributes**
- Input:
  ```xml
  <library>
    <book id="1">
      <title>Book A</title>
    </book>
    <book id="2">
      <title>Book B</title>
    </book>
  </library>
  ```
- Output:
  ```json
  {
    "library": {
      "book": [
        {
          "_attributes": { "id": "1" },
          "title": { "_text": "Book A" }
        },
        {
          "_attributes": { "id": "2" },
          "title": { "_text": "Book B" }
        }
      ]
    }
  }
  ```

**Example 3 — invalid input**
- Input: `<a><b></a>` (mismatched closing tag)
- Output: `''` with the validation error `"Provided XML is not valid."`.

## File Structure
| File | Purpose |
|------|---------|
| `index.ts` | Tool metadata: name `'XML to JSON'` (literal, not translated), path `/xml-to-json`, keywords `['xml', 'json']`, icon `Braces`. |
| `xml-to-json.vue` | View component: imports `xml-js`, defines transformer + validation rule, mounts `<format-transformer>`. |

## Notes
- **i18n:** unique among my assigned tools — the metadata uses **literal English strings** rather than `translate(...)` calls (`name: 'XML to JSON'`, `description: 'Convert XML to JSON'`). Other tools use translation keys.
- **Persistence:** none.
- **Reuse:** validation logic is delegated to the XML formatter's service module so the two tools agree on what "valid XML" means.
- **No tests** committed for this tool (no `.test.ts` or `.spec.ts`).
- **Configurability gap:** users cannot opt into `xml-js` non-compact mode, JSON spacing changes, or attribute key rename — these are baked in.
