# Escape HTML entities (html-entities)

## Overview
- **Path:** `/html-entities`
- **Category:** Web
- **Description:** Escape or unescape HTML entities (replace characters like `<`, `>`, `&`, `"` and `'` with their HTML version).
- **Keywords:** `html`, `entities`, `escape`, `unescape`, `special`, `characters`, `tags`
- **Redirect from:** none
- **Icon:** `Code` (from `@vicons/tabler`)

## Purpose
Lets users convert raw text containing HTML-significant characters into their entity-encoded form (so it can be safely embedded in HTML), and to convert HTML-entity-encoded text back to its raw form. Each direction sits in its own card and updates live as you type. Useful for posting code snippets in HTML, escaping user-provided strings for safe embedding, or decoding scraped HTML.

## Inputs

### Escape card
| Field | Type | Default | Validation |
|---|---|---|---|
| `escapeInput` | string (multiline) | `'<title>IT Tool</title>'` | Free text, raw, 3-row autosize. |

### Unescape card
| Field | Type | Default | Validation |
|---|---|---|---|
| `unescapeInput` | string (multiline) | `'&lt;title&gt;IT Tool&lt;/title&gt;'` | Free text, raw, 3-row autosize. |

## Outputs

| Field | Type | Description |
|---|---|---|
| `escapeOutput` | string | `lodash.escape(escapeInput)`. Returns a string with the five characters `&`, `<`, `>`, `"`, `'` replaced by their HTML named entities. Read-only multiline. |
| `unescapeOutput` | string | `lodash.unescape(unescapeInput)`. Inverse of `escape`: turns the five named entities back into their characters. Read-only multiline. |
| Copy button per card | action | `useCopy({ source: escapeOutput })` and `useCopy({ source: unescapeOutput })`. Each card has its own "Copy" `c-button`. |

## UI / Components
- Two stacked `c-card`s, titled "Escape html entities" and "Unescape html entities".
- Each card contains:
  - An `<n-form-item>` with the input `c-input-text` (multiline, raw-text, 3 rows autosize, placeholder).
  - An `<n-form-item>` with a read-only `c-input-text` showing the result.
  - A centered `c-button` "Copy" that invokes the corresponding `useCopy` callback.
- The two cards do not interact — they are independent pipelines.

## Logic / Algorithm
1. **Escape** uses lodash's `escape`:
   ```ts
   escape('<title>IT Tool</title>')
   // → '&lt;title&gt;IT Tool&lt;/title&gt;'
   ```
   Replaces only the five characters: `&` → `&amp;`, `<` → `&lt;`, `>` → `&gt;`, `"` → `&quot;`, `'` → `&#39;`.
   Does **not** escape any other character (no numerical entities, no Unicode), and the order is `&` first to avoid double-escaping.
2. **Unescape** uses lodash's `unescape`:
   ```ts
   unescape('&lt;title&gt;IT Tool&lt;/title&gt;')
   // → '<title>IT Tool</title>'
   ```
   Reverses exactly the five entities listed above (and `&apos;` is **not** handled — only `&#39;`). Other entities (e.g. `&nbsp;`, `&copy;`, numeric `&#xnn;`) pass through unchanged.
3. Both are wrapped in `computed()` to recompute on every keystroke.

## Dependencies
- `lodash` — `escape`, `unescape`.
- `@/composable/copy` — `useCopy` clipboard helper.
- Naive UI: `n-form-item`. Project wrappers: `c-card`, `c-input-text`, `c-button`.

## Edge Cases & Validation
- **Already-escaped input** in the Escape pane: `&` → `&amp;`, so `&lt;` becomes `&amp;lt;` (double-escaping is the intended behaviour).
- **Plain text in the Unescape pane**: passes through unchanged (no entities to substitute).
- **Numeric entities** (`&#65;` for "A", `&#x41;`): unescape **does not** convert them — only the five named entities are reversed by lodash.
- **Other named entities** (`&copy;`, `&euro;`, `&nbsp;`): unescape leaves them as-is.
- **Empty input**: outputs are empty strings.
- **Very large input**: lodash's regexes are O(n); fast for typical sizes.
- **No persistence** across reloads.

## Examples

**Escape**
- Input: `<title>IT Tool</title>`
- Output: `&lt;title&gt;IT Tool&lt;/title&gt;`

- Input: `'A & B'`
- Output: `&#39;A &amp; B&#39;`

**Unescape**
- Input: `&lt;title&gt;IT Tool&lt;/title&gt;`
- Output: `<title>IT Tool</title>`

- Input: `Tom &amp; Jerry`
- Output: `Tom & Jerry`

- Input: `&copy; 2024 &nbsp; A &#65;` (mixed)
- Output: `&copy; 2024 &nbsp; A &#65;` (unchanged — lodash does not handle these)

## File Structure
| File | Purpose |
|---|---|
| `index.ts` | Tool registration: name, path `/html-entities`, keywords, lazy-loads `html-entities.vue`. |
| `html-entities.vue` | Single component holding the two refs, two computed outputs, two `useCopy` instances, and the layout. |

## Notes
- **i18n** — title and description from `tools.html-entities.*`.
- No tests in this folder; relies on lodash's own behaviour.
- Be aware that `lodash.escape` does **not** produce safe attribute values for all contexts — it is intentionally minimal. The tool documentation mirrors lodash's contract.
- The two cards are mutually independent — you cannot pipe escape→unescape automatically.
