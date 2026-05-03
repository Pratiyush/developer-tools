# Slugify string

## Overview
- **Path:** `/slugify-string`
- **Category:** Web
- **Description:** Make a string url, filename and id safe.
- **Keywords:** slugify, string, escape, emoji, special, character, space, trim
- **Redirect from:** (none)

## Purpose
Converts an arbitrary string into a "slug" — a URL-, filename-, and id-safe representation. Useful for generating canonical URL paths from titles ("My Blog Post!" → "my-blog-post"), safe filenames from human-friendly text, or stable identifiers from arbitrary input. The tool handles emoji, accented characters, spaces, and special characters by transliterating, normalizing case, and substituting separators automatically.

## Inputs
| Name | Type | Default | Validation |
|------|------|---------|-----------|
| `input` | `string` (multiline) | `''` (empty) | None — free-form text. Auto-focuses on mount. Marked `raw-text` so contents are not HTML-encoded. |

## Outputs
| Name | Type | Description |
|------|------|-------------|
| `slug` | `string` | The slugified version of `input`, computed reactively. Read-only display. |

## UI / Components
- Two `<c-input-text multiline>` fields stacked vertically:
  1. **Input** — labelled "Your string to slugify", placeholder `"Put your string here (ex: My file path)"`, autofocus.
  2. **Output** — labelled "Your slug", read-only, placeholder `"You slug will be generated here (ex: my-file-path)"`.
- A centered **Copy slug** `<c-button>` that is disabled when the slug is empty. Copying triggers a toast: `"Slug copied to clipboard"`.
- No tabs, no extra options exposed in the UI — slugify runs with the library's default options.

## Logic / Algorithm
The tool is a thin wrapper around the `@sindresorhus/slugify` library:

```ts
const slug = computed(() => withDefaultOnError(() => slugify(input.value), ''));
```

`@sindresorhus/slugify` performs (in order):
1. Unicode-normalizes the input (NFD/NFKD) and strips combining diacritical marks ("café" → "cafe").
2. Replaces emoji and special graphical characters with their textual transliteration where possible (or strips them).
3. Lowercases all letters.
4. Replaces sequences of non-alphanumeric characters (spaces, punctuation, symbols) with a single `-` separator.
5. Trims leading/trailing separators.

`withDefaultOnError` wraps the call so that any thrown error from `slugify` results in an empty string instead of crashing the UI.

`useCopy({ source: slug, text: 'Slug copied to clipboard' })` writes the current slug to the clipboard and shows a confirmation message.

## Dependencies
- **`@sindresorhus/slugify`** — the slugification engine. Default behaviour (lowercase, `-` separator, transliteration enabled) is used; no override is exposed.
- **`@/utils/defaults#withDefaultOnError`** — converts thrown errors to a safe default value.
- **`@/composable/copy#useCopy`** — clipboard helper with toast feedback.
- **Vue 3** Composition API (`ref`, `computed`).
- **Naive UI / custom `c-*` components** for input and button rendering (`c-input-text`, `c-button`).

## Edge Cases & Validation
- **Empty input** → empty slug; copy button is disabled.
- **Pure-emoji input** (e.g. `"🎉🚀"`) → either an empty slug or a transliterated slug, depending on what `@sindresorhus/slugify` recognizes; errors are swallowed by `withDefaultOnError`.
- **Already-slugified input** (e.g. `"my-file-path"`) → returned unchanged.
- **Strings with accented characters** (e.g. `"Café Résumé"`) → diacritics are stripped → `"cafe-resume"`.
- **Strings of only separators / punctuation** (`"---!!!"`) → empty slug.
- **Very long input** — no upper bound enforced; slugify runs synchronously on every keystroke (could be slow for >100 KB input but no debounce).

## Examples
| Input | Output |
|-------|--------|
| `My file path` | `my-file-path` |
| `Hello, World!` | `hello-world` |
| `Café Résumé` | `cafe-resume` |
| `  multiple   spaces  ` | `multiple-spaces` |
| `Foo_Bar.Baz` | `foo-bar-baz` |
| `🎉 Party Time! 🚀` | `party-time` (emoji stripped) |
| `   ` (only whitespace) | `` (empty) |

## File Structure
| File | Purpose |
|------|---------|
| `index.ts` | Tool registration metadata (name, path, description, keywords, icon, component loader). |
| `slugify-string.vue` | Single-file Vue component containing the entire UI and slugification call. No separate model/service file. |

## Notes
- **i18n:** title and description come from `tools.slugify-string.{title,description}` keys via `translate()`.
- **Persistence:** none — input is not saved across reloads.
- **Icon:** `AbcRound` from `@vicons/material`.
- **Accessibility:** uses semantic labels on each input; the Copy button is disabled when there is nothing to copy.
- **No options exposed:** unlike many slugify tools, this one does not let the user choose separator, case, or transliteration locale. The defaults of `@sindresorhus/slugify` are used unconditionally.
- **Reactive:** the slug updates synchronously on every keystroke; no debounce.
