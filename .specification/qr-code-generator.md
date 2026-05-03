# QR Code Generator

## Overview
- **Path:** `/qrcode-generator`
- **Category:** Images and videos
- **Description:** Generate a customizable QR code for any text/URL with adjustable foreground/background colors and error-correction level; download as PNG.
- **Keywords:** qr, code, generator, square, color, link, low, medium, quartile, high, transparent
- **Redirect from:** None
- **Icon:** `Qrcode` (from `@vicons/tabler`)

## Purpose
Encodes any string (typically a URL) into a QR code image rendered as a 1024-pixel-wide PNG. Users can pick the dark and light pixel colors (including alpha for transparency), choose the Reed-Solomon error-correction level (low/medium/quartile/high), and download the result. Useful for sharing links via printed media, posters, business cards, or screens.

## Inputs

| Name | Type | Default | Validation |
|------|------|---------|------------|
| `text` | `string` | `'https://it-tools.tech'` | None enforced; `.trim()` is applied before encoding. If empty/whitespace, no QR is generated (the watch guard skips `toDataURL`). |
| `foreground` | hex color string with alpha | `'#000000ff'` | Must be valid hex; enforced by `n-color-picker` set to `['hex']` mode. |
| `background` | hex color string with alpha | `'#ffffffff'` | Same as foreground. Setting alpha to `00` produces a transparent background. |
| `errorCorrectionLevel` | `'low' \| 'medium' \| 'quartile' \| 'high'` (typed `QRCodeErrorCorrectionLevel`) | `'medium'` | One of four options. The hook also accepts the short form `'M'` and falls back to `'M'` if undefined. |

Hard-coded options (not user-editable):
- Output `width`: `1024` pixels.

## Outputs

| Name | Type | Description |
|------|------|-------------|
| `qrcode` | string (data URL) | Base64-encoded PNG returned by `QRCode.toDataURL`. Bound to `<n-image :src="qrcode" width="200" />`. |
| Downloaded file | binary `image/png` | Saved as `qr-code.png` via `useDownloadFileFromBase64`. |

## UI / Components
- **Card layout (`c-card`)** with an `n-grid` of 1 column on narrow screens and 3 columns at ≥ 600px.
- **Left panel (span 2):**
  - `c-input-text` for "Text:" — multiline, autosizing (`rows="1"`, `autosize`), placeholder "Your link or text...".
  - `n-form` with label-width 130, left-aligned labels:
    - `n-color-picker` for "Foreground color:" (hex mode).
    - `n-color-picker` for "Background color:" (hex mode).
    - `c-select` "Error resistance:" with options labeled `low`, `medium`, `quartile`, `high`.
- **Right panel:** centered preview at 200px wide and a `c-button` "Download qr-code".

## Logic / Algorithm
The `useQRCode` composable wires the inputs together:

```ts
watch(
  [text, background, foreground, errorCorrectionLevel].filter(isRef),
  async () => {
    if (get(text)) {
      qrcode.value = await QRCode.toDataURL(get(text).trim(), {
        color: { dark: get(foreground), light: get(background), ...options?.color },
        errorCorrectionLevel: get(errorCorrectionLevel) ?? 'M',
        ...options,
      });
    }
  },
  { immediate: true },
);
```

1. On any reactive change, the trimmed text is fed to `QRCode.toDataURL`.
2. `dark` ← foreground, `light` ← background. Hex strings with alpha are accepted, so `#ffffff00` produces a transparent background.
3. The error-correction level can be `'low' | 'medium' | 'quartile' | 'high'` or short codes `L | M | Q | H`. Reed-Solomon redundancy ratios approximately:
   - low (`L`): 7%
   - medium (`M`): 15%
   - quartile (`Q`): 25%
   - high (`H`): 30%
4. `width: 1024` produces a 1024×1024 PNG; the preview shrinks it to 200px via `<n-image>`.
5. Downloading triggers `useDownloadFileFromBase64({ source: qrcode, filename: 'qr-code.png' })`, which decodes the data URL and saves the bytes.

## Dependencies
- `qrcode` — npm encoder; provides `toDataURL`, `QRCodeErrorCorrectionLevel`, and `QRCodeToDataURLOptions`.
- `@vueuse/core` — `MaybeRef`, `get` helpers in `useQRCode.ts`.
- `vue` — `ref`, `watch`, `isRef`.
- `naive-ui` — `n-grid`, `n-gi`, `n-form`, `n-form-item`, `n-color-picker`, `n-image`.
- `@vicons/tabler` (`Qrcode` icon).
- Internal: `c-card`, `c-input-text`, `c-select`, `c-button`, `useDownloadFileFromBase64`.

## Edge Cases & Validation
- **Empty/whitespace-only text:** `if (get(text))` is falsy after trim; the previous QR (if any) remains, no new image is generated. Initial state has the default URL so this rarely matters.
- **Very long text:** the `qrcode` library will throw if the data exceeds the chosen error-correction level's capacity. The error is unhandled (would surface in console). For long URLs the user should pick `low`.
- **Transparent background with transparent foreground:** the QR becomes invisible; nothing prevents this combination.
- **Special unicode characters:** encoded as-is; `qrcode` handles UTF-8.
- **Color contrast:** no enforcement — picking similar fg/bg colors produces an unscannable code.

## Examples
1. Default load:
   - Text: `https://it-tools.tech`
   - Foreground: `#000000ff`, Background: `#ffffffff`, Level: `medium`
   - Output: ~1024×1024 black-on-white PNG.
2. Branded QR:
   - Text: `https://example.com`
   - Foreground: `#1f4e79ff`, Background: `#ffffff00` (transparent), Level: `high`
   - Output: dark blue QR on transparent background, with the highest redundancy (better for noisy print).

## File Structure
- `index.ts` — Tool registration (path `/qrcode-generator`, keywords, lazy-loaded component, no `createdAt`).
- `qr-code-generator.vue` — UI: text input, color pickers, error-level select, preview, download button.
- `useQRCode.ts` — Composable that wraps the `qrcode` library, watches reactive inputs, and exposes `qrcode` ref containing the data URL.

## Notes
- No persistence — every reload reverts to defaults.
- Internal width is fixed at 1024 px (not exposed to the user).
- `n-color-picker` is restricted to hex mode; users cannot enter HSL/RGB pickers.
- The composable filters refs with `isRef` so that direct values (e.g., a literal string) wouldn't be watched — useful when callers pass a mix.
- The default-route name `qrcode-generator` is one word (no hyphen between `qr` and `code`) even though the folder is named `qr-code-generator`.
- No i18n keys for this tool's name/description (uses `translate('tools.qrcode-generator.title')` so values come from locale files).
