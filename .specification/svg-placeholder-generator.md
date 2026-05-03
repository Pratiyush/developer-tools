# SVG placeholder generator

## Overview
- **Path:** `/svg-placeholder-generator`
- **Category:** Images and videos
- **Description:** Generate svg images to use as a placeholder in your applications.
- **Keywords:** svg, placeholder, generator, image, size, mockup
- **Redirect from:** (none)

## Purpose
Generates a configurable SVG placeholder image — a solid background rectangle with centered text — at a chosen width × height. Useful for building UI mockups, prototyping image grids, filling layout slots while real assets are unavailable, or producing data-URI placeholders for emails and stories. Outputs the raw SVG markup, a `data:image/svg+xml;base64` URI, and a downloadable `.svg` file, plus a live preview rendered in the page.

## Inputs
| Name | Type | Default | Validation |
|------|------|---------|-----------|
| `width` | `number` (`<n-input-number>`) | `600` | `min="1"`. Used as both `viewBox` width and (optionally) the rendered `width` attribute. |
| `height` | `number` (`<n-input-number>`) | `350` | `min="1"`. Used as both `viewBox` height and (optionally) the rendered `height` attribute. |
| `fontSize` | `number` (`<n-input-number>`) | `26` | `min="1"`. Pixel font size for the centered text. |
| `bgColor` | `string` (hex color, `<n-color-picker mode="hex">`) | `'#cccccc'` | Constrained by Naive UI hex color picker. |
| `fgColor` | `string` (hex color, `<n-color-picker mode="hex">`) | `'#333333'` | Constrained by Naive UI hex color picker. |
| `useExactSize` | `boolean` (`<n-switch>`) | `true` | When `true` adds `width` and `height` attributes to the SVG root in addition to the `viewBox`. |
| `customText` | `string` (`<c-input-text>`) | `''` | Optional override for the centered label. Empty string → fallback `${width}x${height}`. |

## Outputs
| Name | Type | Description |
|------|------|-------------|
| `svgString` | `string` | Pretty SVG markup (multi-line, trimmed). |
| `base64` | `string` | Full data URI: `data:image/svg+xml;base64,<base64-of-svgString>`. |
| Live `<img>` preview | rendered DOM | Browser-rendered preview of the generated SVG using the data URI as `src`. |

## UI / Components
Form layout uses `<n-form label-placement="left" label-width="100">` with three two-column rows:

1. **Row 1** — Width (`n-input-number`) + Background color (`n-color-picker`).
2. **Row 2** — Height (`n-input-number`) + Text color (`n-color-picker`).
3. **Row 3** — Font size (`n-input-number`) + Custom text (`c-input-text`, placeholder `Default is ${width}x${height}`).

Below the rows: a single "Use exact size" `<n-switch>` form item.

Two read-only `<TextareaCopyable copy-placement="none">` blocks display, in order, the **SVG HTML element** and the **SVG in Base64**.

A row of three buttons:
- **Copy svg** → calls `useCopy({ source: svgString })`.
- **Copy base64** → calls `useCopy({ source: base64 })`.
- **Download svg** → calls `useDownloadFileFromBase64({ source: base64 })`.

Finally an `<img :src="base64" alt="Image">` displays the generated SVG live.

Scoped CSS forces `<n-input-number>` widths to `100%`.

## Logic / Algorithm
The SVG is computed from a tagged template:

```ts
const svgString = computed(() => {
  const w = width.value;
  const h = height.value;
  const text = customText.value.length > 0 ? customText.value : `${w}x${h}`;
  const size = useExactSize.value ? ` width="${w}" height="${h}"` : '';
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"${size}>
  <rect width="${w}" height="${h}" fill="${bgColor.value}"></rect>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
        font-family="monospace" font-size="${fontSize.value}px" fill="${fgColor.value}">${text}</text>
</svg>
  `.trim();
});
```

Step by step:
1. Read `width`, `height`, `customText`, `useExactSize`, `bgColor`, `fgColor`, `fontSize`.
2. Compute the displayed text: `customText` if non-empty, otherwise `"${width}x${height}"`.
3. Compute `size`: `width="…" height="…"` when the toggle is on, otherwise empty (only `viewBox` is set).
4. Emit the SVG markup with:
   - Always: `xmlns="http://www.w3.org/2000/svg"`, `viewBox="0 0 W H"`, and a `<rect>` covering the full viewBox filled with `bgColor`.
   - Always: a centered `<text>` element using `dominant-baseline="middle"`, `text-anchor="middle"`, monospace font, supplied font size, and `fgColor`.
5. The base64 data URI is computed via `textToBase64(svgString)` (which uses `Base64.encode` from `js-base64`) and prefixed with `data:image/svg+xml;base64,`.
6. `useDownloadFileFromBase64({ source: base64 })` exposes a `download()` action that decodes the data URI and triggers a browser download of the SVG file.

## Dependencies
- **`@/components/TextareaCopyable`** — read-only output renderer (used twice).
- **`@/composable/copy#useCopy`** — clipboard helper.
- **`@/composable/downloadBase64#useDownloadFileFromBase64`** — base64-data-URI → file download trigger.
- **`@/utils/base64#textToBase64`** — wraps `Base64.encode` from **`js-base64`**.
- **Naive UI**: `n-form`, `n-form-item`, `n-input-number`, `n-color-picker`, `n-switch`.
- **Custom `c-*`**: `c-input-text`, `c-button`.
- **Vue 3** (`ref`, `computed`).

## Edge Cases & Validation
- **Empty `customText`** → automatically falls back to `${width}x${height}`.
- **`width` or `height` ≤ 0** — UI enforces `min="1"`. Bypassing the UI (e.g. clearing the field) can produce a string like `viewBox="0 0  ${h}"` if the value is `null`/`undefined`; that would yield malformed SVG.
- **Tiny font vs huge SVG / huge font vs tiny SVG** — text may be clipped or extend outside the `viewBox`, but no clipping is enforced.
- **Custom text with HTML / SVG-significant characters** (`<`, `>`, `&`, `"`, `'`) — values are interpolated into the SVG without escaping; a malicious `customText` like `</text><script>…</script>` would inject markup. The output is then base64-encoded into a `data:` URI; modern browsers do **not** execute scripts inside `data:image/svg+xml` referenced by `<img src=…>`, so the live preview is safe, but copying the SVG and embedding it via `<object>` or inline could be exploitable. **No escaping is performed.**
- **Color values not valid hex** — UI enforces hex via `n-color-picker`. Direct binding with arbitrary string would just be inlined into the `fill` attribute.
- **Very long text** — no wrapping; SVG `<text>` is single-line and may overflow.
- **`useExactSize=false`** — the SVG has only `viewBox`, allowing it to scale to its CSS-given size (e.g. `width: 100%`).

## Examples

### Example 1 — defaults
**Inputs:** `width=600`, `height=350`, `fontSize=26`, `bgColor=#cccccc`, `fgColor=#333333`, `useExactSize=true`, `customText=''`.

**`svgString`:**
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 350" width="600" height="350">
  <rect width="600" height="350" fill="#cccccc"></rect>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="monospace" font-size="26px" fill="#333333">600x350</text>
</svg>
```

### Example 2 — custom text, no exact size
**Inputs:** `width=200`, `height=200`, `fontSize=20`, `bgColor=#1e1e1e`, `fgColor=#ffffff`, `useExactSize=false`, `customText='Hero image'`.

**`svgString`:**
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <rect width="200" height="200" fill="#1e1e1e"></rect>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="monospace" font-size="20px" fill="#ffffff">Hero image</text>
</svg>
```

**`base64` (truncated):** `data:image/svg+xml;base64,PHN2ZyB4bWxucz0i…`

## File Structure
| File | Purpose |
|------|---------|
| `index.ts` | Tool registration metadata (name, path, description, keywords, icon, component loader). |
| `svg-placeholder-generator.vue` | Single-file Vue component containing form, computed SVG/base64, copy/download buttons, and live preview. No tests. |

## Notes
- **i18n:** title and description come from `tools.svg-placeholder-generator.{title,description}`.
- **Persistence:** none — settings reset on reload.
- **Icon:** `ImageOutlined` from `@vicons/material`.
- **Live preview:** the trailing `<img :src="base64">` makes this WYSIWYG — changes apply instantly.
- **Download filename:** governed by `useDownloadFileFromBase64`; based on the data URI MIME type (so `.svg`).
- **Accessibility:** the preview `<img>` has `alt="Image"` (a generic placeholder; could be improved with the actual text).
- **Security:** custom text is **not escaped** before insertion into the SVG. Treat the output as untrusted markup if `customText` is user-controlled in any downstream system.
- **Copy buttons** use `<TextareaCopyable copy-placement="none">` so the textarea itself does not offer a copy icon; the explicit buttons below are the only copy affordance.
