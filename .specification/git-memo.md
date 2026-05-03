# Git cheatsheet (git-memo)

## Overview
- **Path:** `/git-memo`
- **Category:** Development
- **Description:** Git is a decentralized version management software. With this cheatsheet, you will have quick access to the most common git commands.
- **Keywords:** `git`, `push`, `force`, `pull`, `commit`, `amend`, `rebase`, `merge`, `reset`, `soft`, `hard`, `lease`
- **Redirect from:** none
- **Icon:** `BrandGit` (from `@vicons/tabler`)

## Purpose
A static reference page that surfaces the most common git commands in well-organised sections (Configuration, Get started, Commit, "I've made a mistake", Miscellaneous). It is purely informational — there are no inputs and no transformations. The page reads from a markdown file imported as a Vue component, so the cheatsheet content lives in plain Markdown next to the Vue shell.

## Inputs
None. This is a documentation page.

## Outputs
A rendered HTML article containing:
- Section: **Configuration** — `git config --global user.name "[name]"`, `git config --global user.email "[email]"`
- Section: **Get started** — `git init`, `git clone [url]`
- Section: **Commit** — `git commit -am "[commit message]"`, `git commit --amend --no-edit`
- Section: **I've made a mistake** —
  - `git commit --amend` (change last message)
  - `git reset HEAD~1` (undo most recent commit, keep changes)
  - `git reset HEAD~N` (undo N commits, keep changes)
  - `git reset HEAD~1 --hard` (undo and discard)
  - `git fetch origin` + `git reset --hard origin/[branch-name]` (reset to remote)
- Section: **Miscellaneous** — `git branch -m master main` (rename local master to main)

## UI / Components
- Single root `<div>` rendering an imported `<Memo />` component (the markdown file).
- Markdown renders to native HTML headings (`##`) and `<pre><code>` shell blocks.
- A scoped `<style lang="less">` block themes the `<pre>` blocks:
  - `padding: 15px 22px`
  - `background-color` bound to Naive UI theme `cardColor` via `useThemeVars()` and CSS `v-bind`
  - `border-radius: 4px`, `overflow: auto`, `margin: 0`.
- Uses `::v-deep(pre)` to pierce scoped styling boundary onto the rendered markdown.

## Logic / Algorithm
1. Vite/Vue is configured (via `unplugin-vue-markdown` or similar) to import `*.md` files as Vue components.
2. `git-memo.content.md` is imported as `Memo` and rendered as a `<Memo />` element.
3. `useThemeVars()` from `naive-ui` is called to fetch the current theme's `cardColor`, then applied to `<pre>` blocks via CSS `v-bind('themeVars.cardColor')`.
4. No reactivity, no data flow, no user input.

## Dependencies
- `naive-ui` — `useThemeVars` for theming `<pre>` blocks.
- Vue 3 + the project's markdown import pipeline (likely `unplugin-vue-markdown`/`vite-plugin-md`).

## Edge Cases & Validation
- N/A. Content is static.
- Theming follows the global IT-Tools light/dark theme automatically through `useThemeVars`.

## Examples
The file content is the entire output. The shell snippets below are reproduced verbatim from the markdown:

```shell
git config --global user.name "[name]"
git config --global user.email "[email]"
```

```shell
git init
```

```shell
git commit -am "[commit message]"
```

```shell
git reset HEAD~N
```

```shell
git fetch origin
git reset --hard origin/[branch-name]
```

```shell
git branch -m master main
```

## File Structure
| File | Purpose |
|---|---|
| `index.ts` | Tool registration: name, path `/git-memo`, keywords, lazy-loads `git-memo.vue`. |
| `git-memo.vue` | Tiny shell that imports the markdown content as `Memo` and renders it. Contains scoped `<pre>` styling using `useThemeVars`. |
| `git-memo.content.md` | The full cheatsheet content in Markdown — single source of truth for the page text. |

## Notes
- **No i18n for content** — the markdown file is English only (the i18n plugin only translates the tool's title and description in the listing/search UI).
- **No persistence**, no input state.
- Content is written to be copy-pasteable directly. The page does **not** include explicit copy buttons per command — users select-copy from the rendered code block.
- Title in i18n is `tools.git-memo.title = "Git cheatsheet"`.
- Easy to extend: add new sections by editing `git-memo.content.md` only.
