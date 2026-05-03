# Regex Cheatsheet (Regex Memo)

## Overview
- **Path:** `/regex-memo`
- **Category:** Development
- **Description:** Javascript Regex/Regular Expression cheatsheet
- **Name (display):** "Regex cheatsheet"
- **Keywords:** regex, regular, expression, javascript, memo, cheatsheet
- **Redirect from:** None
- **Created:** 2024-09-20
- **Icon:** `BrandJavascript` (from `@vicons/tabler`)

## Purpose
A static, scrollable reference page showing JavaScript regex syntax (character classes, quantifiers, lookarounds, capturing groups, etc.) rendered from a Markdown file. It's intended to be opened alongside the Regex Tester (`/regex-tester`) — that tool links here via the "See Regular Expression Cheatsheet" link. Helpful when you don't remember whether you need `\b` or `\B`, or which characters need escaping inside vs. outside a character set.

## Inputs
**None.** The page renders pre-authored content; there are no input controls.

## Outputs
**None** in the data sense — only rendered Markdown content.

## UI / Components
- The whole page is the rendered Markdown (`regex-memo.content.md`) imported as a Vue component. The Vite/Vue build is configured to treat `.md` files as components (via `vite-plugin-md` or similar — see app-level config).
- Themed table & code styles use `naive-ui`'s `useThemeVars()`:
  - `<pre>` → `padding: 15px 22px`, `background-color: themeVars.cardColor`, `border-radius: 4px`, scrollable on overflow.
  - `<table>` / `<td>` / `<th>` → `border-collapse: collapse`, `border: 1px solid themeVars.textColor1`, `padding: 5px`.
  - `<a>` → uses `themeVars.textColor1` (so links match the theme's primary text color).

## Content Sections (in order)
1. **Normal characters** — `.` `[A-Za-z]` `[a-z]` `[A-Z]` `\d` `\D` `_` `\w` `\W` `\S`.
2. **Whitespace characters** — space, `\t`, `\n`, `\r`, `\s`.
3. **Character set** — `[xyz]`, `[^xyz]`, `[1-3]`, `[^1-3]`, with three notes:
   - "Think of a character set as an `OR` operation…"
   - Use `^` after `[` to negate.
   - Within a set, `.` is literal.
4. **Characters that require escaping**
   - **Outside a character set**: `\.`, `\^`, `\$`, `\|`, `\\`, `\/`, `\(`, `\)`, `\[`, `\]`, `\{`, `\}`.
   - **Inside a character set**: `\\`, `\]`. Plus rules:
     - `^` only escaped if right after the opening `[`.
     - `-` only escaped if between two alphabets/digits.
5. **Quantifiers** — `{2}`, `{2,}`, `{2,7}`, `*`, `+`, `?`. Note: "the quantifier goes after the expression."
6. **Boundaries** — `^`, `$`, `\b`, with bullet-list of word-boundary rules.
7. **Matching** — alternation `foo|bar`, lookahead `foo(?=bar)`, negative lookahead `foo(?!bar)`, lookbehind `(?<=bar)foo`, negative lookbehind `(?<!bar)foo`.
8. **Grouping and capturing** — `(foo)`, `(?:foo)`, backreference `(foo)bar\1`. Note: capturing groups matter for `string.match`, `string.matchAll`, `string.replace(regexp, callback)`.
9. **References and tools** — links to MDN's Regex guide and the RegExplained tool.

## Logic / Algorithm
None. The component is pure presentation: import the Markdown component, mount it, apply theme-aware styles via `v-bind` with naive-ui's theme variables.

```vue
<script setup lang="ts">
import { useThemeVars } from 'naive-ui';
import Memo from './regex-memo.content.md';
const themeVars = useThemeVars();
</script>

<template>
  <div>
    <Memo />
  </div>
</template>
```

The `::v-deep` selectors target the elements rendered by the Markdown component (the `Memo` component sits inside the wrapper div).

## Dependencies
- `naive-ui` (`useThemeVars`).
- `@vicons/tabler` (`BrandJavascript` icon).
- A Markdown-to-Vue plugin in the project's Vite config (the `.md` import works because of that build-time transform).

## Edge Cases & Validation
- Truly static — nothing to validate, no error state.
- The cheatsheet does **not** cover ECMAScript-specific flags (`g`, `i`, `m`, `s`, `u`, `v`, `d`) — flags are demonstrated via the Regex Tester tool itself.
- Content is hard-coded: any updates require a code change to `regex-memo.content.md`.

## Examples
N/A — this is a reference page. (Sample row: `\d` or `[0-9]` → `digit`.)

## File Structure
- `index.ts` — Tool registration: `name: 'Regex cheatsheet'`, `path: '/regex-memo'`, hard-coded English (no i18n `translate(...)` for these strings unlike most other tools), `createdAt: 2024-09-20`.
- `regex-memo.vue` — Tiny wrapper that imports the Markdown content and applies theme-aware deep selectors (`::v-deep`) to the rendered `<pre>`, `<table>`, `<td>`, `<th>`, `<a>`.
- `regex-memo.content.md` — The cheatsheet content (~122 lines), authored as Markdown tables.

## Notes
- Unlike most tools, the title and description are hard-coded English strings, not `translate('tools.regex-memo.title')`. This is the only assigned tool that bypasses i18n in `index.ts`.
- The Regex Tester (`/regex-tester`) explicitly links here with a `<router-link target="_blank" to="/regex-memo">`. Links open in a new tab, supporting cross-tool workflows.
- Adding new sections requires editing the Markdown file. Theme styling automatically follows naive-ui dark/light mode.
- Code samples in the doc use Markdown-table escaping (e.g. `\|` for a literal pipe inside a table cell), which is a Markdown idiosyncrasy unrelated to regex syntax.
