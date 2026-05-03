# HTML WYSIWYG editor

## Overview
- **Path:** `/html-wysiwyg-editor`
- **Category:** Web
- **Description:** Online, feature-rich WYSIWYG HTML editor which generates the source code of the content immediately.
- **Keywords:** `html`, `wysiwyg`, `editor`, `p`, `ul`, `ol`, `converter`, `live`
- **Redirect from:** none
- **Icon:** `Edit` (from `@vicons/tabler`)

## Purpose
A live "what you see is what you get" rich-text editor that emits the underlying HTML source as you type. Designed for quickly composing snippets (paragraphs, headings, lists, code blocks, blockquotes), then copying the formatted HTML into emails, CMS fields, or static sites. Built on top of TipTap (ProseMirror) so the document model is rich and well-formed.

## Inputs

| Field | Type | Default | Validation / Persistence |
|---|---|---|---|
| `html` | string | `'<h1>Hey!</h1><p>Welcome to this html wysiwyg editor</p>'` | Persisted to `localStorage` under key `html-wysiwyg-editor--html` via `useStorage` from `@vueuse/core`. Two-way bound between the TipTap editor and the visible source. |

User-driven actions (toolbar):
- **Bold**, **Italic**, **Strike**, **Inline code** (mark toggles)
- **Heading 1 / 2 / 3 / 4** (block toggles)
- **Bullet list**, **Ordered list**, **Code block**, **Blockquote** (block toggles)
- **Hard break** (insert `<br>`)
- **Clear format** (`clearNodes().unsetAllMarks()`)
- **Undo**, **Redo** (history)

Each toolbar button is exposed via `MenuBarItem`, a tooltipped `c-button` (`circle`, `variant="text"`, `type="primary"` when active).

## Outputs

| Field | Type | Description |
|---|---|---|
| HTML source preview | string | `formattedHtml` is `prettier.format(html, { parser: 'html', plugins: [htmlParser] })`. Rendered via `<TextareaCopyable :value="formattedHtml" language="html" />` — has its own copy button + syntax-highlighting (project component). |

## UI / Components
- Outer composition: `<Editor v-model:html="html" />` followed by `<TextareaCopyable :value="formattedHtml" language="html" />`.
- **`Editor`** (`editor/editor.vue`):
  - Wraps a TipTap `Editor` instance configured with `StarterKit` (paragraph, headings, marks, lists, history, codeblock, blockquote, hardbreak — TipTap's canonical starter set).
  - Renders `<MenuBar :editor="editor" />` and `<EditorContent :editor="editor" />` inside a `c-card` styled with theme-bound `cardColor`.
  - Subscribes to TipTap `update` events and emits `update:html` with the latest `editor.getHTML()`.
  - Cleans up via `tryOnBeforeUnmount(() => editor.destroy())`.
  - Heavy scoped CSS pierces `::v-deep(.ProseMirror)` to style headings, code, blockquotes, `mark`, `hr`, task lists, etc.
- **`MenuBar`** (`editor/menu-bar.vue`):
  - An array of `MenuItem` (button or divider).
  - Buttons map to `editor.chain().focus().<command>().run()` and an `isActive` predicate.
  - Dividers render as vertical `<n-divider vertical>`.
- **`MenuBarItem`** (`editor/menu-bar-item.vue`):
  - `<c-tooltip>` wrapping a circular text-variant `c-button`. Toggles `type="primary"` when `isActive()` is true.

## Logic / Algorithm
1. `useStorage('html-wysiwyg-editor--html', '<h1>Hey!</h1>...')` returns a reactive ref backed by `localStorage`.
2. `Editor` props: `{ content: html.value, extensions: [StarterKit] }`.
3. On every TipTap update, emit `update:html` with `editor.getHTML()` so the parent ref (and therefore localStorage) stays in sync.
4. The parent computes `formattedHtml` asynchronously via `asyncComputed`:
   ```ts
   const formattedHtml = asyncComputed(
     () => format(html.value, { parser: 'html', plugins: [htmlParser] }),
     '',
   );
   ```
   `prettier`'s standalone build is used in-browser; the HTML parser plugin is `prettier/plugins/html`.
5. The toolbar commands are pure TipTap chain calls; their `isActive` mirrors the editor's mark/node state for visual feedback.

## Dependencies
- `@tiptap/vue-3` — `Editor`, `EditorContent`.
- `@tiptap/starter-kit` — bundled extensions: paragraph, headings, bold/italic/strike/code marks, bulletList/orderedList/listItem, codeBlock, blockquote, hardBreak, history, dropcursor, gapcursor.
- `prettier` (browser build) — `format` for HTML beautification.
- `prettier/plugins/html` — required parser plugin for `parser: 'html'` in browser.
- `@vueuse/core` — `useStorage`, `useVModel`, `tryOnBeforeUnmount`.
- `naive-ui` — `useThemeVars` for dark/light theming of code blocks/PRE/QUOTE.
- `@vicons/tabler` — toolbar icons (Bold, Italic, Strikethrough, Code, CodePlus, H1–H4, List, ListNumbers, Blockquote, ClearFormatting, ArrowBack, ArrowForwardUp, TextWrap).
- Project: `c-card`, `c-button`, `c-tooltip`, `TextareaCopyable`.

## Edge Cases & Validation
- **Initial localStorage corruption**: `useStorage` defaults to the provided fallback. Invalid HTML inside localStorage will be re-parsed by TipTap into the closest valid structure on mount.
- **Pasted HTML**: TipTap StarterKit handles a sensible subset; unsupported tags/attributes are stripped or transformed.
- **Async format errors**: `asyncComputed` falls back to its initial value (`''`) while pending or on error.
- **Round-tripping**: TipTap normalises HTML on parse, so what comes out of the editor may not be byte-identical to what went in (whitespace and attribute order can change).
- **Editor instance**: created once at component setup; `tryOnBeforeUnmount` ensures it's torn down when the route is left.
- **No max length / no character counter.**

## Examples

**Default content**
- Input: `<h1>Hey!</h1><p>Welcome to this html wysiwyg editor</p>`
- Formatted source pane:
  ```html
  <h1>Hey!</h1>
  <p>Welcome to this html wysiwyg editor</p>
  ```

**After clicking Bullet list and typing two items**
- Source becomes:
  ```html
  <ul>
    <li><p>First item</p></li>
    <li><p>Second item</p></li>
  </ul>
  ```

**After Code block**
- Source becomes:
  ```html
  <pre><code>console.log('hi')</code></pre>
  ```

## File Structure
| File | Purpose |
|---|---|
| `index.ts` | Tool registration: name, path `/html-wysiwyg-editor`, keywords, lazy-loads the page. |
| `html-wysiwyg-editor.vue` | Page-level component: persists `html` to localStorage, calls `prettier`, wires `<Editor>` to `<TextareaCopyable>`. |
| `editor/editor.vue` | Wraps TipTap + StarterKit. Owns the `Editor` instance, renders MenuBar + EditorContent, applies ProseMirror scoped styling. |
| `editor/menu-bar.vue` | Declarative array of toolbar items (buttons + dividers) bound to TipTap chain commands. |
| `editor/menu-bar-item.vue` | Single button presentation: tooltip-wrapped circular `c-button`, active-state styling. |

## Notes
- **Persistence**: `localStorage` key `html-wysiwyg-editor--html` is the only persisted state.
- **i18n** — title and description from `tools.html-wysiwyg-editor.*`. The toolbar tooltips are **English only** (hard-coded).
- The "feature-rich" promise comes from StarterKit; advanced features (links, tables, images, color, etc.) are **not** wired in this build.
- `formattedHtml` is async — there is a momentary flash of blank or stale source on first render of a long document.
- Themed `<pre>` and `<code>` background colors via `useThemeVars()` follow the global IT-Tools light/dark theme automatically.
