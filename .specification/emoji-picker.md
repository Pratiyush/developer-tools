# Emoji picker

## Overview
- **Path:** `/emoji-picker`
- **Category:** Text
- **Description:** Copy and paste emojis easily and get the unicode and code points value of each emoji.
- **Keywords:** emoji, picker, unicode, copy, paste
- **Redirect from:** None
- **Created at:** 2023-08-07

## Purpose
A searchable, browsable emoji directory. Users can scroll the full Unicode emoji catalog grouped by category, or fuzzy-search across emoji names, keywords, code points, and unicode escapes. Clicking an emoji or any of its metadata (code point, escaped unicode) copies that string to the clipboard. Useful for developers who need a specific emoji's escape sequence or anyone who wants to paste an emoji and accompanying metadata into chat, code, or documentation.

## Inputs
| Field | Type | Default | Validation |
|---|---|---|---|
| `searchQuery` | string (debounced) | `''` | None — empty string shows all groups; non-empty triggers fuzzy search |

The search input is debounced 500ms via `useDebouncedRef('', 500)` to avoid running the fuzzy search on every keystroke.

## Outputs
The tool itself produces no persistent output; clicking an emoji or its metadata copies a string to the clipboard:

| Click target | Copies | Toast |
|---|---|---|
| Emoji glyph | The literal emoji (e.g., `😀`) | `Emoji 😀 copied to the clipboard` |
| Code points (e.g., `0x1f600`) | Hex code point string | `Code points '0x1f600' copied to the clipboard` |
| Unicode (e.g., `😀`) | JS-style unicode escape string | `Unicode '😀' copied to the clipboard` |

## UI / Components
The tool consists of three Vue components:
- `emoji-picker.vue` — top-level: search bar + group/result rendering
- `emoji-grid.vue` — responsive grid of `emoji-card`s
- `emoji-card.vue` — individual emoji card with title and copyable metadata

### `emoji-picker.vue`
- A centered search input (`c-input-text`, max-width 600px) with an `icon-mdi-search` prefix and placeholder `Search emojis (e.g. 'smile')...`.
- When `searchQuery.trim().length > 0`:
  - If 0 results → shows `No results` (20px bold).
  - Else → shows `Search result` heading and an `<emoji-grid>` of all matches.
- When the search is empty:
  - Iterates through all emoji groups (e.g., `Smileys & Emotion`, `Animals & Nature`, `Food & Drink`, etc.). Each group renders its name as a 20px bold heading and its emojis in an `<emoji-grid>`.

### `emoji-grid.vue`
- A CSS grid that adapts the number of columns to the viewport:
  - 1 column on extra-small (default)
  - 2 columns on `sm:` (≥ 640px)
  - 3 columns on `md:` (≥ 768px)
  - 4 columns on `lg:` (≥ 1024px)
  - 6 columns on `xl:` (≥ 1280px)
- 2-pixel gap between cells.

### `emoji-card.vue`
- A `c-card` with `flex items-center gap-3`, padding 8px y / 10px-5px x.
- Left: large 30px emoji glyph; clickable → copies the emoji.
- Right: a flex column with:
  - Title (truncated, bold) — capitalized emoji name
  - A row (text-xs, mono, opacity 70%) with two clickable spans:
    - Code points string (e.g., `0x1f600`) — clickable, hover changes to primary color, copies on click
    - Unicode escape string (e.g., `😀`) — clickable, truncates if long, copies on click

## Logic / Algorithm
### Data preparation
- Imports `emojiUnicodeData` from `unicode-emoji-json` (object keyed by emoji glyph; each value contains `{ name, group, ... }`).
- Imports `emojiKeywords` from `emojilib` (object keyed by emoji glyph; each value is `string[]` of keywords).
- For each emoji, builds an `EmojiInfo`:
  ```ts
  {
    ...emojiInfo,
    emoji,
    title: _.capitalize(emojiInfo.name),
    keywords: emojiKeywords[emoji as keyof typeof emojiKeywords],
    codePoints: getEmojiCodePoints({ emoji }),
    unicode: escapeUnicode({ emoji }),
  }
  ```
- `emojisGroups` groups all emojis by their `group` field via `_.chain(emojis).groupBy('group').map(...)`.

### Helper functions
- `escapeUnicode({ emoji })`: Splits the emoji string into code units (`split('')`), maps each to `\u{4-hex-padded}`, and joins. For surrogate pairs, this yields two `\u` escapes.
  ```ts
  emoji.split('').map(unit =>
    `\\u${unit.charCodeAt(0).toString(16).padStart(4, '0')}`
  ).join('')
  ```
- `getEmojiCodePoints({ emoji })`: Returns the first code point as `0x` + hex, or `undefined` if the emoji string is empty.
  ```ts
  emoji.codePointAt(0) ? `0x${emoji.codePointAt(0)?.toString(16)}` : undefined
  ```

Note: Multi-codepoint emojis (e.g., flags, family emoji with ZWJ sequences) only get their **first** code point reported in `codePoints`. The full unicode escape contains all units, but the code point is just the first.

### Fuzzy search
- Built atop `useFuzzySearch` (which wraps `fuse.js`).
- Configuration:
  ```ts
  {
    keys: ['group', { name: 'name', weight: 3 }, 'keywords', 'unicode', 'codePoints', 'emoji'],
    threshold: 0.3,
    useExtendedSearch: true,
    isCaseSensitive: false,
  }
  ```
- The `name` field has weight 3 (other keys default to 1), so name matches rank highest. The `threshold: 0.3` means a relatively strict match.

### Copy
- Uses `useCopy()` from `@/composable/copy`. The card's emoji area calls `copy(emojiInfo.emoji, { notificationMessage: '...' })`.

## Dependencies
- `unicode-emoji-json` (`^0.4.0`) — primary data source: emojis grouped by category with names
- `emojilib` (`^3.0.10`) — keywords for each emoji (used in fuzzy-search)
- `fuse.js` (`^6.6.2`) — wrapped by `useFuzzySearch`
- `lodash` (`^4.17.21`) — `_.map`, `_.chain`, `_.groupBy`, `_.capitalize`
- `@/composable/fuzzySearch` — `useFuzzySearch`
- `@/composable/debouncedref` — `useDebouncedRef`
- `@/composable/copy` — `useCopy`
- `@vicons/tabler` — icon `MoodSmile`
- `icon-mdi-search` — for the search input prefix

## Edge Cases & Validation
- **Empty search** → shows all groups (the entire catalog).
- **No matches** → renders `No results` text instead of the grid.
- **Single-codepoint emoji** (most common): `codePoints` is the only code point, `unicode` is one `\u` escape.
- **Multi-codepoint emoji** (e.g., flags `🇺🇸`, family `👨‍👩‍👧‍👦`):
  - `unicode` produces multiple `\u....` escapes for the surrogate pairs and ZWJ characters
  - `codePoints` reports only the **first** code point
- The unicode escapes use 4-digit padding; surrogate pairs result in `\uXXXX\uXXXX` rather than `\u{1FXXX}` (ES6 form).
- The data set is determined entirely by `unicode-emoji-json` and `emojilib` — its size and emoji ordering matches the package version.
- Search has a 500ms debounce, so very fast typing won't kick off intermediate searches.
- Copy operations rely on the browser's clipboard API; failures (e.g., no HTTPS, blocked permissions) will fail silently or show a fallback toast depending on the `useCopy` composable behavior.

## Examples
**Search "smile":** Returns matches like `😀 grinning face`, `😃 grinning face with big eyes`, etc.

**`escapeUnicode({ emoji: '😀' })`** (single codepoint U+1F600 → surrogate pair `😀`):
```text
😀
```

**`getEmojiCodePoints({ emoji: '😀' })`:**
```text
0x1f600
```

**Click the title `😀`** → clipboard contains `😀`, toast: `Emoji 😀 copied to the clipboard`.

## File Structure
- `index.ts` — Tool registration; route `/emoji-picker`, icon `MoodSmile`, `createdAt: 2023-08-07`
- `emoji-picker.vue` — Top-level component: search input, group iteration, search-result rendering
- `emoji-grid.vue` — Wrapper component: responsive grid of `emoji-card`s for a given list of `EmojiInfo`s
- `emoji-card.vue` — Individual card: emoji glyph, title, copyable codePoints/unicode badges
- `emoji.types.ts` — `EmojiInfo` type that extends `unicode-emoji-json`'s entry type with `title`, `emoji`, `codePoints`, `unicode`

## Notes
- The data files (`unicode-emoji-json`, `emojilib`) are bundled with the app, so the tool works offline.
- No persistence (no recents, no favorites).
- All emojis are loaded eagerly into memory at component mount.
- `codePoints` only shows the first code point — composite emojis are not fully represented.
- Search keys include the unicode/codePoints fields, so users can search by hex (e.g., typing `1f600` to find 😀).
- Emoji groups come from the `unicode-emoji-json` data and follow the official Unicode CLDR group names (Smileys & Emotion, People & Body, Animals & Nature, Food & Drink, Travel & Places, Activities, Objects, Symbols, Flags).
- The `EmojiInfo` type spreads `typeof emojiUnicodeData[string]`, so all base fields (e.g., `name`, `slug`, `group`, `emoji_version`, `unicode_version`, `skin_tone_support`) are available.
- A commented-out block in `emoji-card.vue` suggests there was an earlier UI variant with `c-link` and a different layout.
