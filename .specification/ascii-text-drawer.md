# ASCII Art Text Generator

## Overview
- **Path:** `/ascii-text-drawer`
- **Category:** Text
- **Description:** Create ASCII art text with many fonts and styles.
- **Keywords:** `ascii`, `asciiart`, `text`, `drawer`
- **Redirect from:** None
- **Icon:** `Artboard` (from `@vicons/tabler`)
- **Created at:** 2024-03-03

## Purpose
This tool converts plain text into stylized ASCII art using FIGlet fonts. Users provide a string, choose from over 200 FIGlet fonts (e.g. `Standard`, `3D-ASCII`, `Banner`, `ANSI Shadow`, `Doom`), and constrain the output to a maximum width. The rendered ASCII art can be copied to the clipboard and embedded into terminals, READMEs, comments, banners, and similar text-only contexts.

## Inputs
| Field | Type | Default | Validation / Notes |
|-------|------|---------|--------------------|
| `input` (Your text) | string (multiline textarea, 4 rows) | `'Ascii ART'` | Plain text. Treated as `raw-text` (no HTML escaping in editor). |
| `font` | enum (one of ~250 FIGlet font names) | `'Standard'` | Persisted in `localStorage` under key `ascii-text-drawer:font`. Searchable dropdown. |
| `width` | integer | `80` | Min `0`, max `10000`. Persisted under key `ascii-text-drawer:width`. Sets the FIGlet `width` rendering option (controls line wrapping). |

## Outputs
| Field | Type | Description |
|-------|------|-------------|
| `output` | string (ASCII art) | The rendered FIGlet text. Shown in a `TextareaCopyable` block with an external copy button. |
| `errored` | boolean | Internal flag — when font loading or rendering throws, an error alert is rendered instead of the output. |
| `processing` | boolean | Internal flag — toggles a loading spinner (`n-spin` + "Loading font...") while the font is being fetched and the text is being rendered. |

## UI / Components
- Single `c-card` (max-width 600 px).
- `c-input-text` (multiline, raw-text, 4 rows) for the source text.
- `n-divider`.
- `n-grid` with two equal columns (each `span="2"` of 4 cols):
  - `c-select` for the font (searchable, top-aligned label).
  - `n-form-item` containing `n-input-number` for the width (min 0, max 10000).
- `n-divider`.
- Conditional regions:
  - `n-spin` + "Loading font..." while `processing`.
  - `c-alert` with `type="error"` and the message "Current settings resulted in error." when `errored` is true.
  - `n-form-item` with label "Ascii Art text:" wrapping a `TextareaCopyable` (copy button placed `outside`) when neither processing nor errored.

## Logic / Algorithm
1. The component initialises FIGlet with `figlet.defaults({ fontPath: '//unpkg.com/figlet@1.6.0/fonts/' })` so font definitions are fetched lazily over the network from the unpkg CDN.
2. A `watchEffect` runs whenever `input`, `font`, or `width` changes.
3. The effect sets `processing = true`, then awaits a Promise wrapping `figlet.text(input, options, callback)`.
   - `options` = `{ font: <selected font>, width: <selected width>, whitespaceBreak: true }`.
   - `whitespaceBreak: true` means FIGlet may wrap on whitespace when a line would exceed the configured `width`.
4. On successful render, `output.value` is set to the produced text (or `''` if FIGlet returns `null/undefined`) and `errored` is reset to `false`.
5. On failure (font fetch error, invalid font, etc.) the catch block sets `errored = true`.
6. Either way, `processing` is set back to `false`.

There are no other transformations on the input string — it is passed verbatim to FIGlet.

## Dependencies
- `figlet@^1.6.0` — ASCII art rendering library; fonts are loaded from the CDN at runtime.
- `@vueuse/core` (`useStorage`) — persists font and width selections.
- `@vicons/tabler` (`Artboard` icon).
- Naive-UI components: `n-divider`, `n-grid`, `n-gi`, `n-form-item`, `n-input-number`, `n-spin`.
- Project components: `c-card`, `c-input-text`, `c-select`, `c-alert`, `c-button`, `TextareaCopyable`.

## Edge Cases & Validation
- Empty `input` — FIGlet returns an empty string; the textarea is empty.
- Width `0` — likely produces a single column wrap; not explicitly guarded.
- Font load error (network failure, CDN unreachable) — rejection is caught and shown as the error alert.
- Unrecognised font name — would reject; same error path.
- Very long input or large width (up to 10000) — no soft cap is enforced beyond the `n-input-number` `max="10000"`.
- The fonts list contains some duplicates (`B1FF`, `Rot13`) — both refer to the same FIGlet fonts; the duplicates are harmless.

## Examples
1. **Default state**
   - `input = "Ascii ART"`, `font = "Standard"`, `width = 80`.
   - Output (truncated):
     ```
        _                _ _      _    ____ _____
       / \   ___  ___(_|_)    / \  |  _ \_   _|
      / _ \ / __|/ __| | |   / _ \ | |_) || |
     / ___ \\__ \ (__| | |  / ___ \|  _ < | |
    /_/   \_\___/\___|_|_| /_/   \_\_| \_\|_|
     ```
2. **Banner font with constrained width**
   - `input = "Hi"`, `font = "Banner"`, `width = 30`.
   - Output: stylised "Hi" using the `Banner` glyph set.

## File Structure
| File | Description |
|------|-------------|
| `index.ts` | Tool definition (name, path, description, keywords, icon, createdAt). |
| `ascii-text-drawer.vue` | Single-file component containing the entire UI and FIGlet-driven rendering logic, including the hard-coded list of font names. |

## Notes
- **Persistence:** Font and width are persisted via `useStorage` (localStorage). The input text and output are not persisted.
- **Network dependency:** Because FIGlet fonts are loaded from `//unpkg.com/figlet@1.6.0/fonts/`, the tool requires internet access to render fonts that have not yet been cached. Offline users may see the error alert.
- **Async rendering:** `watchEffect` is async — if a user types quickly while a slow font is loading, the latest run's resolution wins (no explicit cancellation).
- **i18n:** Title and description are hard-coded English strings (no `translate(...)` call), unlike many other tools.
- **Accessibility:** Textareas are `raw-text` (plain text only); copy is provided via the `TextareaCopyable` component.
