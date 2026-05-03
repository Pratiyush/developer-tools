# Device information

## Overview
- **Path:** `/device-information`
- **Category:** Web
- **Description:** Get information about your current device (screen size, pixel-ratio, user agent, ...)
- **Keywords:** device, information, screen, pixel, ratio, status, data, computer, size, user, agent
- **Redirect from:** None

## Purpose
Surface live information about the user's browser and device by reading from the `window.screen`, `navigator`, and live window-size APIs. Useful for diagnosing display issues, logging environment details, debugging responsive layouts, or capturing user-agent strings to share with support teams.

## Inputs
None — the tool is purely informational. No fields, no buttons, no editable state. The window size auto-updates when the user resizes the browser.

## Outputs
The output is grouped into **two sections**:

### Screen
| Label | Source | Example |
|---|---|---|
| Screen size | `${window.screen.availWidth} x ${window.screen.availHeight}` | `1920 x 1080` |
| Orientation | `window.screen.orientation.type` | `landscape-primary` |
| Orientation angle | `${window.screen.orientation.angle}°` | `0°` |
| Color depth | `${window.screen.colorDepth} bits` | `24 bits` |
| Pixel ratio | `${window.devicePixelRatio} dppx` | `2 dppx` |
| Window size | `${width} x ${height}` (from `useWindowSize()`) | `1280 x 800` |

### Device
| Label | Source | Example |
|---|---|---|
| Browser vendor | `navigator.vendor` | `Google Inc.` |
| Languages | `navigator.languages.join(', ')` | `en-US, en` |
| Platform | `navigator.platform` | `MacIntel` |
| User agent | `navigator.userAgent` | `Mozilla/5.0 (...) Chrome/...` |

Each value is a Vue `computed` that re-evaluates on render — `Window size` is the only one that changes reactively (driven by `useWindowSize()` from VueUse). The other values are practically static during a session but are still wrapped in computeds.

## UI / Components
- Two `c-card` blocks, each with a `title` (`Screen` and `Device`).
- Inside each card, an `n-grid` with responsive cols `1 400:2` (one column on narrow screens, two columns on screens ≥ 400px wide), with horizontal/vertical gaps of 12px.
- Each cell (`n-gi`) renders an information panel with:
  - A small label (14px, opacity 0.8)
  - The value (20px, weight 400) wrapped in `n-ellipsis` (so long strings truncate gracefully)
  - When the value is falsy/undefined, the placeholder text `unknown` (faded) is shown instead.
- Background: `#aaaaaa11` (very light gray with alpha) and `border-radius: 4px` for each card.

## Logic / Algorithm
1. On mount, the component reads:
   - `window.screen.*` for screen properties
   - `window.devicePixelRatio` for pixel density
   - `navigator.*` for environment info
   - `useWindowSize()` from VueUse for live `width`/`height` (reactive)
2. Each property is wrapped in a `computed` so Vue re-renders when their reactive deps change.
3. Each cell renders the value or `unknown` based on truthiness.

There is no transformation logic beyond string interpolation and unit suffixing (`bits`, `dppx`, `°`).

## Dependencies
- `vue` — `computed`
- `@vueuse/core` (`^10.3.0`) — `useWindowSize` for reactive viewport dimensions
- `naive-ui` — `n-grid`, `n-gi`, `n-ellipsis`
- `@vicons/tabler` — icon `DeviceDesktop`
- Internal `c-card`

## Edge Cases & Validation
- If the browser does not provide `window.screen.orientation` (some old browsers), the component will throw a runtime error because the access happens unguarded. There is no try/catch around accesses.
- Falsy values (e.g., empty `navigator.vendor` in Firefox where this can be empty) render as `unknown`.
- The user-agent string can be very long; `n-ellipsis` truncates with a tooltip rather than wrapping.
- No copy-to-clipboard button is provided — the user must select text manually.
- No persistence; values are read live each render.
- `window.screen.availWidth/Height` reports the screen area minus OS task bars/docks; full screen size (without that) would use `width`/`height`. The component uses `availWidth/Height`.

## Examples
On a typical laptop browser:
- **Screen → Screen size:** `1920 x 1080` or `1440 x 900`
- **Screen → Pixel ratio:** `2 dppx` (Retina) or `1 dppx`
- **Screen → Color depth:** `24 bits` or `30 bits`
- **Device → Platform:** `MacIntel`, `Win32`, `Linux x86_64`
- **Device → User agent:** `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36`

## File Structure
- `index.ts` — Tool registration; route `/device-information`, icon `DeviceDesktop`
- `device-information.vue` — Single-file component with the two `c-card` panels and an `n-grid` of computed values

## Notes
- No tests for this tool (no `.test.ts` or `.spec.ts` files in folder).
- The tool runs only in the browser (relies on `window`/`navigator`).
- No persistence; refreshing the page is the same as reading new live values.
- i18n: title and description are translated via `tools.device-information.*`; the in-component labels (`Screen size`, `Browser vendor`, etc.) are hard-coded English.
- This tool exposes no sensitive info beyond what a website normally has access to via the web platform APIs.
