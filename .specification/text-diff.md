# Text diff

## Overview
- **Path:** `/text-diff`
- **Category:** Text
- **Description:** Compare two texts and see the differences between them.
- **Keywords:** text, diff, compare, string, text diff, code
- **Redirect from:** (none)
- **Created at:** 2023-08-16

## Purpose
Provides a side-by-side, line-aligned diff of two text blocks, powered by Monaco's diff editor (the same engine that runs in VS Code). Useful for comparing two versions of code, configuration files, log lines, or any plain-text artifact and seeing inline character/line-level changes with syntax-aware highlighting and gutter markers.

## Inputs
The tool itself has no Vue-level reactive props — it embeds a fully self-managed Monaco diff editor that exposes two text panes:

| Pane | Type | Default |
|------|------|---------|
| Original (left) | `string` (editable) | `'original text'` (Monaco model seed) |
| Modified (right) | `string` (editable) | `'modified text'` (Monaco model seed) |

Both panes are editable because `originalEditable: true` is set on the Monaco editor.

The component does accept an `options` prop on the `<c-diff-editor>` itself (`monaco.editor.IDiffEditorOptions`), but `text-diff.vue` does not pass any options — it uses defaults.

## Outputs
- **Visual diff** — Monaco renders inserted lines (typically green), deleted lines (typically red), and unchanged lines, with a gutter and inline character-level differences. There is no programmatic textual output exposed to Vue.
- The user can copy text from either pane via the Monaco editor's standard interactions.

## UI / Components
- A single full-width `<c-card>` with no padding (`important:pa-0`) and `important:flex-1` so it expands to fill available space.
- Inside the card, one `<c-diff-editor />` component with no props.
- The Monaco editor itself renders two side-by-side editors with a center divider, line numbers, gutter, and minimap (minimap is disabled — `minimap.enabled: false`).
- Theme follows the global app theme: switches between `'it-tools-dark'` and `'it-tools-light'` (both are custom themes that override `editor.background` to fully transparent so the card's background shows through).

The `<c-diff-editor>` component itself:
```vue
<template>
  <div ref="editorContainer" h-600px />
</template>
```
A 600 px-tall container hosts the Monaco diff editor.

## Logic / Algorithm
All logic lives in `c-diff-editor.vue`. Behaviour:

1. **Theme registration** — on script setup, two Monaco themes are defined:
   ```ts
   monaco.editor.defineTheme('it-tools-dark', { base: 'vs-dark', inherit: true, rules: [], colors: { 'editor.background': '#00000000' } });
   monaco.editor.defineTheme('it-tools-light', { base: 'vs', inherit: true, rules: [], colors: { 'editor.background': '#00000000' } });
   ```
2. **Theme synchronization** — a `watch` on `useStyleStore().isDarkTheme` calls `monaco.editor.setTheme('it-tools-dark' | 'it-tools-light')` whenever the global theme toggles. Runs immediately on mount.
3. **Options sync** — a deep `watch` on the `options` prop calls `editor?.updateOptions(options)`. Runs immediately on mount.
4. **Resize handling** — `useResizeObserver(editorContainer, () => editor?.layout())` re-layouts the editor whenever its container box changes (responsive to window/card resizing).
5. **Mount** — on `onMounted`:
   ```ts
   editor = monaco.editor.createDiffEditor(editorContainer.value, {
     originalEditable: true,
     minimap: { enabled: false },
   });
   editor.setModel({
     original: monaco.editor.createModel('original text', 'txt'),
     modified: monaco.editor.createModel('modified text', 'txt'),
   });
   ```
   The "original" model is editable, both models are seeded with placeholder strings, and the language is plain text (`txt`).

The diff itself is computed by Monaco's worker — it uses a token-aware variant of the Myers diff algorithm and renders inline character-level differences within changed lines.

## Dependencies
- **`monaco-editor`** — the core editor library, providing `createDiffEditor`, `createModel`, `defineTheme`, `setTheme`. Imported as a namespace `* as monaco`.
- **`@vueuse/core`** (`useResizeObserver`) — to relayout the editor on container resize.
- **`@/stores/style.store#useStyleStore`** — global style store; the `isDarkTheme` reactive flag drives the theme switch.
- **Vue 3** (`ref`, `toRefs`, `withDefaults`, `defineProps`, `watch`, `onMounted`).
- **Custom `c-*`**: `c-card`, `c-diff-editor`.

## Edge Cases & Validation
- **No language detection / syntax highlighting** — both models are created with language `'txt'`, so there is no syntax highlighting; only line- and character-level diff visuals.
- **Initial state shows fake content** — both panes are pre-populated with the literal strings `'original text'` and `'modified text'`. There is no input clearing helper; the user must select-all and replace.
- **No reset / load / save** — no UI button resets the editor or imports/exports text.
- **Memory** — the editor and its two models are created on mount but are **never disposed**. If the component unmounts (route change), Monaco's models persist in the worker; this is a minor leak in long-lived sessions.
- **Very large inputs** — Monaco handles large texts well but can be slow on the diff worker for files in the hundreds of thousands of lines. No size guard.
- **No persistence** — text is lost on reload.
- **No `originalEditable: false` opt-out** — both panes are always editable, which differs from typical "read-only original / editable modified" diff UIs.

## Examples

### Example 1 — minimal edit
**Original:**
```
hello world
```
**Modified:**
```
hello brave new world
```
**Visual:** Monaco shows `hello ` unchanged, `world` removed (red strike-through on left), `brave new world` added (green highlight on right) with character-level mark-up showing the inserted words.

### Example 2 — block change in JSON
**Original:**
```
{
  "name": "alice",
  "age": 30
}
```
**Modified:**
```
{
  "name": "alice",
  "age": 31,
  "active": true
}
```
**Visual:** the `"age": 30` line is shown removed, `"age": 31,` and `"active": true` are shown added; the `{`, `"name"…`, and `}` lines are unchanged. Because language is `txt`, JSON tokens are not highlighted as JSON; only diff colors apply.

## File Structure
| File | Purpose |
|------|---------|
| `index.ts` | Tool registration metadata (name, path, description, keywords, icon, component loader, `createdAt`). |
| `text-diff.vue` | Single-file Vue component — just a `<c-card>` wrapping a `<c-diff-editor/>`. The actual editor logic is in `src/ui/c-diff-editor/c-diff-editor.vue`. |

(There is no separate `model.ts` / `service.ts` / test file for this tool.)

## Notes
- **i18n:** title and description come from `tools.text-diff.{title,description}`.
- **Persistence:** none.
- **Icon:** `FileDiff` from `@vicons/tabler`.
- **Themes:** the diff editor uses transparent backgrounds so the surrounding card paints through, giving it a more "native" look in the it-tools shell.
- **`<c-diff-editor>`** is shared infrastructure and could in principle be reused with custom options, but `text-diff.vue` does not exercise that capability.
- **Unusual structure:** the entire UI of this tool is one Vue tag (`<c-diff-editor />`); the spec coverage above mostly reflects the embedded editor's behaviour rather than tool-specific code.
- **Accessibility:** Monaco provides built-in keyboard navigation and screen-reader support, but the tool exposes no extra ARIA labels.
