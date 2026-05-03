# XML formatter

## Overview
- **Path:** `/xml-formatter`
- **Category:** Development
- **Description:** Prettify your XML string into a friendly, human-readable format.
- **Keywords:** `xml`, `prettify`, `format`
- **Redirect from:** None
- **Icon:** `Code` (from `@vicons/tabler`)
- **Created:** 2023-06-17

## Purpose
Takes an arbitrary XML document (typically minified, single-line, or inconsistently indented) and produces an indented, line-broken, human-readable equivalent. The user controls the indent width and whether short text content collapses onto a single line. Useful for inspecting SOAP responses, RSS feeds, configuration files, or any XML payload pulled from logs or HTTP traces.

## Inputs
| Field | Type | Default | Validation |
|-------|------|---------|------------|
| Input XML | `string` (multiline textarea, provided by `<format-transformer>`) | `'<hello><world>foo</world><world>bar</world></hello>'` | Validated by `isValidXML` — invalid XML shows the message `"Provided XML is not valid."` and the output stays empty |
| `indentSize` | `number` (n-input-number) | `2` (persisted via `useStorage` key `xml-formatter:indent-size`) | `min=0`, `max=10` |
| `collapseContent` | `boolean` (n-switch) | `true` (persisted via `useStorage` key `xml-formatter:collapse-content`) | — |

## Outputs
| Output | Type | Description |
|--------|------|-------------|
| Formatted XML | `string` | Indented XML with `\n` line separators, displayed read-only with copy button (rendered by `<format-transformer>` using its `output-language="xml"` syntax highlighting) |

## UI / Components
- A top control row centered horizontally with two `n-form-item`s side by side:
  - "Collapse content:" with an `n-switch`.
  - "Indent size:" with an `n-input-number` (`min=0`, `max=10`, `width: 100px`).
- A `<format-transformer>` shared component wired with:
  - `input-label="Your XML"`, `input-placeholder="Paste your XML here..."`.
  - `output-label="Formatted XML from your XML"`, `output-language="xml"`.
  - `:input-validation-rules="rules"` (the `isValidXML` rule).
  - `:transformer="transformer"` (the formatting function).
  - `:input-default="defaultValue"`.
- The wrapper `<div important:flex-full important:flex-shrink-0 important:flex-grow-0>` ensures full-width control row.

## Logic / Algorithm
1. Read `indentSize` and `collapseContent` from `localStorage` via `useStorage`.
2. **Transformer** function (called by `<format-transformer>` whenever input changes):
   - Calls `formatXml(value, { indentation: ' '.repeat(indentSize), collapseContent, lineSeparator: '\n' })`.
   - `formatXml` (in `xml-formatter.service.ts`) trims input then delegates to the `xml-formatter` npm package; result wrapped in `withDefaultOnError(..., '')` so any throw yields an empty string.
3. **Validation** — `isValidXML(value)`:
   - Trim input. If empty, return `true` (empty input is considered valid; output is just empty).
   - Otherwise call `xmlFormat(cleanedRawXml)` and report whether it threw.
4. The `<format-transformer>` component handles input/output panes, copy button, and validation message rendering.

```ts
// Service implementation
function formatXml(rawXml: string, options?: XMLFormatterOptions): string {
  return withDefaultOnError(() => xmlFormat(cleanRawXml(rawXml), options) ?? '', '');
}

function isValidXML(rawXml: string): boolean {
  const cleanedRawXml = cleanRawXml(rawXml);
  if (cleanedRawXml === '') return true;
  try { xmlFormat(cleanedRawXml); return true; } catch (e) { return false; }
}
```

## Dependencies
- `xml-formatter` (`^3.3.2`) — does the actual indenting; supports options like `indentation`, `collapseContent`, `lineSeparator`, `whiteSpaceAtEndOfSelfclosingTag`, etc. Only the first three are wired through here.
- `@vueuse/core#useStorage` — persists indent and collapse settings.
- `@/utils/defaults#withDefaultOnError` — error-safe formatting.
- Shared layout component `<format-transformer>` (input/output panel, validation messages, copy button).
- `@vicons/tabler#Code` — icon.

## Edge Cases & Validation
- **Empty input:** `isValidXML` returns `true`; output is `''`; no error message displayed.
- **Non-XML text** (e.g. plain prose): formatter throws → `withDefaultOnError` returns `''`; validation message `"Provided XML is not valid."` is shown.
- **Indent of 0:** produces a fully un-indented result while still adding line breaks between elements.
- **`collapseContent=true`:** short text-only nodes like `<bar>baz</bar>` stay on one line; with `false`, they expand to:
  ```xml
  <bar>
    baz
  </bar>
  ```
  (as shown in the unit test `xml-formatter.service.test.ts`, where the default-options test produces the expanded multiline form).
- **Inputs with leading/trailing whitespace:** `cleanRawXml` strips them before parsing.
- The `xml-formatter` library tolerates many quirks (declarations, comments, CDATA, processing instructions). Anything it cannot parse is reported as invalid.

## Examples
**Example 1 — default settings, formatted (indent 2, collapse true)** (from the e2e test):
- Input: `<foo><bar>baz</bar><bar>baz</bar></foo>`
- Output:
  ```xml
  <foo>
    <bar>baz</bar>
    <bar>baz</bar>
  </foo>
  ```

**Example 2 — formatter library default options (indent 4, collapse false)** (from the unit test):
- Input: `<hello><world>foo</world><world>bar</world></hello>`
- Output:
  ```xml
  <hello>
      <world>
          foo
      </world>
      <world>
          bar
      </world>
  </hello>
  ```

**Example 3 — invalid input**
- Input: `hello world`
- Output: `''` and the error message `"Provided XML is not valid."`.

## File Structure
| File | Purpose |
|------|---------|
| `index.ts` | Tool metadata: name, path `/xml-formatter`, keywords `['xml', 'prettify', 'format']`, icon `Code`. |
| `xml-formatter.vue` | View component: bindings to indent size and collapse switch, mounts shared `<format-transformer>`. |
| `xml-formatter.service.ts` | Pure functions `formatXml`, `isValidXML`, helper `cleanRawXml`. Re-exported from one place. |
| `xml-formatter.service.test.ts` | Vitest unit tests covering happy path and invalid input. |
| `xml-formatter.e2e.spec.ts` | Playwright E2E test asserting page title and that the on-page formatter produces the indented output. |

## Notes
- **i18n:** title/description from `tools.xml-formatter.title` / `.description`; control labels are hard-coded English.
- **Persistence:** indent size and collapse toggle persist via `localStorage`; input does not.
- **Reuse:** `isValidXML` is also imported by the `xml-to-json` tool to share the same validation rule.
- **Test IDs:** the shared `<format-transformer>` exposes `data-testid="input"` and `data-testid="area-content"` — see the e2e spec.
- **Accessibility:** validation feedback is rendered as form item feedback by the wrapper component.
