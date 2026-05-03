# Markdown to HTML

## Overview
- **Path:** `/markdown-to-html`
- **Category:** Converter
- **Description:** Convert Markdown to Html and allow to print (as PDF)
- **Keywords:** markdown, html, converter, pdf
- **Redirect from:** (none)
- **Created at:** 2024-08-25
- **Icon:** `Markdown` (from `@vicons/tabler`)

## Purpose
This tool converts Markdown text into rendered HTML in real time as the user types. The rendered HTML is shown in a copyable textarea, and a "Print as PDF" button opens a new browser window populated with the rendered HTML and triggers the browser's native print dialog — letting the user save the resulting page as a PDF via the browser's "Print to PDF" feature. The use case is quickly turning a Markdown document into HTML for embedding, copying into a CMS, or printing a clean PDF version.

## Inputs
| Name             | Type   | Default | Validation |
| ---------------- | ------ | ------- | ---------- |
| `inputMarkdown`  | string (multiline) | `''` (empty) | None — any string accepted; rendered as Markdown |

The input field is a multiline `c-input-text` (textarea) with:
- `placeholder`: `"Your Markdown content..."`
- `rows`: 8
- `autofocus`: true
- `raw-text`: true (no rich-text styling on input)
- `label`: `"Your Markdown to convert:"`

## Outputs
| Name         | Type   | Description |
| ------------ | ------ | ----------- |
| `outputHtml` | string (HTML) | The HTML rendered from the input Markdown by `markdown-it`. Displayed inside a `TextareaCopyable` (read-only, syntax-highlighted as `html`, with word-wrap). |

## UI / Components
- `c-input-text` — multiline Markdown input area at the top.
- `n-divider` — horizontal divider between input and output.
- `n-form-item` (label `"Output HTML:"`) wrapping a `TextareaCopyable` showing the rendered HTML with a copy button and `language="html"` syntax highlighting.
- `n-button` — `"Print as PDF"` button, centered via flex layout (`flex justify-center`).

## Logic / Algorithm
1. The component creates a reactive `inputMarkdown` ref initialized to `''`.
2. `outputHtml` is a computed value that:
   - Instantiates a `markdown-it` parser via `markdownit()` (with default options — CommonMark-ish, no HTML allowed by default, no linkify/typographer enabled).
   - Calls `md.render(inputMarkdown.value)` and returns the resulting HTML string.
   - Recomputes on every keystroke.
3. `printHtml()` function (bound to the print button):
   ```ts
   function printHtml() {
     const w = window.open();
     if (w === null) {
       return; // Popup blocked or otherwise unavailable
     }
     w.document.body.innerHTML = outputHtml.value;
     w.print();
   }
   ```
   - Opens a blank popup window via `window.open()`.
   - Returns silently if the browser blocked it (`w === null`).
   - Injects the rendered HTML into the new window's `document.body` via `innerHTML`.
   - Calls `w.print()` to trigger the browser print dialog. The user can then choose "Save as PDF" / "Print to PDF".

## Dependencies
| Library | Purpose | Notes |
| --- | --- | --- |
| `markdown-it` | Markdown → HTML conversion | Used with default options (no plugins) |
| `vue` (auto-imported `ref`, `computed`) | Reactivity | |
| `@/components/TextareaCopyable.vue` | Read-only output with copy button & syntax highlighting | |
| `naive-ui` (`n-divider`, `n-form-item`, `n-button`) | UI primitives | |
| Internal `c-input-text` | Custom input wrapper | |

## Edge Cases & Validation
- **Empty input:** `outputHtml` becomes an empty string; the print window would open with an empty body if the user clicks Print as PDF with no content.
- **HTML in Markdown:** With `markdown-it` defaults, raw HTML is left as-is (default `html: false` would escape, but library default behaviour means it depends on the version — see notes).
- **Popup blockers:** If `window.open()` is blocked, `printHtml()` returns silently with no user feedback (no toast, no alert).
- **Cross-origin / sandbox:** The new window inherits the same origin as the tool, so injecting HTML and calling `print()` works without restriction.
- **Large input:** No length limit. Performance for very large Markdown is bounded by `markdown-it`'s parser; input is re-rendered on every keystroke (no debouncing).
- **Special characters / Unicode:** Handled by `markdown-it`. The user's input is passed verbatim to `md.render`.

## Examples
**Example 1 — Headers and emphasis**

Input:
```markdown
# Hello
This is **bold** and _italic_.
```

Output:
```html
<h1>Hello</h1>
<p>This is <strong>bold</strong> and <em>italic</em>.</p>
```

**Example 2 — Code block and list**

Input:
```markdown
- item 1
- item 2

```js
const x = 1;
```
```

Output:
```html
<ul>
<li>item 1</li>
<li>item 2</li>
</ul>
<pre><code class="language-js">const x = 1;
</code></pre>
```

## File Structure
```
markdown-to-html/
├── index.ts                # Tool metadata (name, path, keywords, icon)
└── markdown-to-html.vue    # Single-file component containing UI + logic
```

## Notes
- No persistence: input is not saved across sessions (no `useStorage`).
- No i18n: hard-coded English labels in the component (only the tool definition has no translations either; `name`/`description` are hard-coded English strings).
- No tests: no `.test.ts`, `.spec.ts`, or `.e2e.spec.ts` file present for this tool.
- Print fidelity depends on the browser's print engine — there is no embedded CSS or styling sent to the new window, so output prints with the browser's default user-agent styles.
- The `markdown-it` instance is recreated on every render of the computed (every keystroke). Could be hoisted but is functionally fine.
