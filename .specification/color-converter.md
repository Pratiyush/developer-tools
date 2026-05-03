# Color converter

## Overview
- **Path:** `/color-converter`
- **Category:** Converter
- **Description:** Convert color between the different formats (hex, rgb, hsl and css name)
- **Keywords:** color, converter
- **Redirect from:** `/color-picker-converter`

## Purpose
Convert a color between any of seven color representations side by side. Editing any field updates all others in real time. The tool lets developers and designers translate colors between the formats they typically need (CSS hex, RGB(A), HSL(A), HWB, LCH, CMYK, and CSS named colors), and includes a graphical color picker.

## Inputs
The user can edit any one of these fields; the tool re-derives all others. Each field has its own validation that flags malformed input.

| Field | Type | Default | Validation |
|---|---|---|---|
| `picker` | color picker (hex string) | `#1ea54c` | n/a (color picker handles input) |
| `hex` | string | derived from `#1ea54c` | Must parse via `colord` |
| `rgb` | string | derived | Must parse via `colord` |
| `hsl` | string | derived | Must parse via `colord` |
| `hwb` | string | derived | Must parse via `colord` |
| `lch` | string | derived | Must parse via `colord` (`lch` plugin) |
| `cmyk` | string | derived | Must parse via `colord` (`cmyk` plugin) |
| `name` | string | derived | Must parse via `colord` (`names` plugin); falls back to closest name |

The initial color seed is `#1ea54c` (a green) set in the script setup via `updateColorValue(colord('#1ea54c'))`.

Placeholders shown in each field:
- `hex`: `e.g. #ff0000`
- `rgb`: `e.g. rgb(255, 0, 0)`
- `hsl`: `e.g. hsl(0, 100%, 50%)`
- `hwb`: `e.g. hwb(0, 0%, 0%)`
- `lch`: `e.g. lch(53.24, 104.55, 40.85)`
- `cmyk`: `e.g. cmyk(0, 100%, 100%, 0)`
- `name`: `e.g. red`

## Outputs
The output is the same set of seven fields. Whichever field the user is not currently typing in is updated to the equivalent representation of the parsed color.

| Output | Type | Description |
|---|---|---|
| color picker | hex string | A `#rrggbb`/`#rrggbbaa` value |
| hex | string | e.g. `#1ea54c` |
| rgb | string | e.g. `rgb(30, 165, 76)` |
| hsl | string | e.g. `hsl(140, 69%, 38%)` |
| hwb | string | e.g. `hwb(140 12% 35%)` |
| lch | string | e.g. `lch(58.92% 56.49 142.06)` |
| cmyk | string | e.g. `device-cmyk(82% 0% 54% 35%)` |
| name | string | Closest CSS named color (e.g. `forestgreen`); `Unknown` if none. |

## UI / Components
- A single `c-card` containing rows of `input-copyable` (custom internal component) for each text format, plus an `n-color-picker` for the color picker row.
- Each `input-copyable` is a label-on-the-left layout (`label-position="left"`, `label-width="100px"`, `label-align="right"`), is `clearable`, and supports validation feedback.
- Each input field has a unique `test-id` like `input-hex`, `input-rgb`, used by Playwright tests.
- Color picker is implemented with Naive UI's `n-color-picker` (placement `bottom-end`).

## Logic / Algorithm
### Setup
- Imports `colord` (a tiny color manipulation library) plus four plugins:
  - `cmykPlugin` — adds `toCmykString()` and CMYK parsing
  - `hwbPlugin` — adds `toHwbString()` and HWB parsing
  - `namesPlugin` — adds `toName()` for CSS named colors
  - `lchPlugin` — adds `toLchString()` and LCH parsing
- Calls `extend([cmykPlugin, hwbPlugin, namesPlugin, lchPlugin])`.

### `buildColorFormat(...)` (in `color-converter.models.ts`)
Creates a config object for each color format:
- `value`: a `ref('')` holding the current text value of this field.
- `parse(v)`: a wrapped parser that returns a `Colord` instance or `undefined` on error (uses `withDefaultOnError`).
- `format(c)`: a function that turns a `Colord` into the field's string representation.
- `validation`: a `useValidation` rule that allows empty strings, otherwise checks `parse(v).isValid()`.
- `type`: `'text'` (default) or `'color-picker'`.

### Two-way conversion (`updateColorValue`)
When any field changes:
1. Parse the new value into a `Colord` instance via that field's `parse`.
2. If parse failed (`undefined`) or the result is not `isValid()`, do nothing — leave other fields untouched.
3. Otherwise, iterate over all `formats`, and for each one **except** the field that the user just edited (`omitLabel` keeps it from being overwritten while typing), set its value to that field's `format(value)`.

### Helper
`removeAlphaChannelWhenOpaque(hexColor)` (exported but not used directly by the Vue component): if a hex color ends with `ff` (fully opaque alpha), strip those two characters. Regex: `/^(#(?:[0-9a-f]{3}){1,2})ff$/i`.

## Dependencies
- `colord` (`^2.9.3`) — color parsing and conversion
- `colord/plugins/cmyk` — CMYK support
- `colord/plugins/hwb` — HWB support
- `colord/plugins/names` — CSS named colors support
- `colord/plugins/lch` — LCH support
- `lodash` (`^4.17.21`) — `_.forEach` for iterating format definitions
- `naive-ui` — `n-color-picker`, `n-form-item`
- `@vicons/tabler` — icon `Palette`
- `@/composable/validation` — `useValidation`
- `@/utils/defaults` — `withDefaultOnError`
- Internal `input-copyable` component

## Edge Cases & Validation
- Invalid input in one field is silently ignored — no propagation. The user sees a validation error message in the offending field (e.g. `Invalid hex format.`).
- Empty input is treated as "valid" (no error), but does not propagate (because it cannot parse to a valid color).
- For the `name` field, when no exact CSS name matches, it falls back to the **closest** name via `colord.toName({ closest: true })`. If even closest fails, the literal string `'Unknown'` is displayed.
- Parsing errors are swallowed by `withDefaultOnError`.
- When typing into a field, the field's own value is preserved (not reformatted) until the user moves focus or finishes typing — preventing the cursor from jumping.

## Examples
From the e2e test (`color-converter.e2e.spec.ts`) typing `olive` into the name field:
| Format | Value |
|---|---|
| name | `olive` |
| hex | `#808000` |
| rgb | `rgb(128, 128, 0)` |
| hsl | `hsl(60, 100%, 25%)` |
| hwb | `hwb(60 0% 50%)` |
| cmyk | `device-cmyk(0% 0% 100% 50%)` |
| lch | `lch(52.15% 56.81 99.57)` |

From `color-converter.models.test.ts`:
- `removeAlphaChannelWhenOpaque('#000000ff')` → `'#000000'` (alpha stripped)
- `removeAlphaChannelWhenOpaque('#ffffffFF')` → `'#ffffff'` (case-insensitive)
- `removeAlphaChannelWhenOpaque('#000000FE')` → `'#000000FE'` (alpha not 1.0, kept)
- `removeAlphaChannelWhenOpaque('#00000000')` → `'#00000000'` (transparent, alpha not 1.0)

## File Structure
- `index.ts` — Tool registration; route `/color-converter`, redirect from `/color-picker-converter`, icon `Palette`
- `color-converter.vue` — UI: 8 input rows (1 picker + 7 text formats), bidirectional sync via `updateColorValue`
- `color-converter.models.ts` — `buildColorFormat` factory and `removeAlphaChannelWhenOpaque` helper
- `color-converter.models.test.ts` — Vitest tests for `removeAlphaChannelWhenOpaque`
- `color-converter.e2e.spec.ts` — Playwright e2e test verifying that typing `olive` updates all formats

## Notes
- This tool has a redirect from `/color-picker-converter` for backward compatibility.
- The page title in the browser is `Color converter - IT Tools` (set via head plugin).
- All formats live in client-side memory only; no persistence.
- The `picker` row uses `n-color-picker` directly (instead of `input-copyable`); it reads/writes its own value separately, hooked via the same `updateColorValue` callback.
- The default seed color `#1ea54c` is the IT-Tools green/primary color.
- The CMYK output uses the `device-cmyk(...)` CSS-conformant syntax with percent units.
