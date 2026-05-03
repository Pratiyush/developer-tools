# Random Port Generator

## Overview
- **Path:** `/random-port-generator`
- **Category:** Development
- **Description:** Generate a single random TCP/UDP port number outside the well-known/system range.
- **Keywords:** system, port, lan, generator, random, development, computer
- **Redirect from:** None
- **Icon:** `Server` (from `@vicons/tabler`)

## Purpose
A one-button utility that returns a random integer in `[1024, 65535]` — the registered/dynamic port range — so developers can quickly pick a port for a local service without colliding with system-reserved ports (`0–1023`). Useful when bringing up a quick dev server, testing peer-to-peer apps, or scripting Docker port mappings.

## Inputs
This tool has **no user inputs**. The user only triggers actions (Copy, Refresh).

## Outputs

| Name | Type | Description |
|------|------|-------------|
| `port` | string | A randomly-chosen integer in the closed interval `[1024, 65535]`, formatted as a string (`String(generatePort())`). |

The number is rendered in a large, centered numeric display (`font-size: 26px`).

## UI / Components
- **`c-card`** wrapping the entire UI.
- **`<div class="port">`** — large centered number (26px, weight 400, `margin: 10px 0 25px`).
- **Two buttons** (`c-button`) inside a centered flex row with `gap-3`:
  - **Copy** — invokes `useCopy({ source: port, text: 'Port copied to the clipboard' })`.
  - **Refresh** — re-runs `generatePort()` via `computedRefreshable`.

## Logic / Algorithm
- `generatePort` (`random-port-generator.model.ts`):
  ```ts
  export const generatePort = () => randIntFromInterval(1024, 65535);
  ```
- The `randIntFromInterval` utility (in `@/utils/random`) returns a uniformly-distributed integer in the inclusive range. It typically uses `Math.floor(Math.random() * (max - min + 1)) + min`.
- `computedRefreshable` returns `[port, refreshPort]`: a reactive ref derived from the generator and an imperative function to recompute it. The first port is generated immediately on component mount.
- Range rationale: `1024` is the first non-privileged port on Unix systems (binding below 1024 typically requires root). `65535` is the maximum 16-bit port number. The dynamic/private/ephemeral range per IANA is actually `49152–65535`, but this generator uses the wider registered+dynamic range so any non-system port can be returned.

## Dependencies
- Internal `@/utils/random` (`randIntFromInterval`).
- Internal `@/composable/computedRefreshable` (`computedRefreshable`).
- Internal `@/composable/copy` (`useCopy`).
- `@vicons/tabler` (`Server` icon).
- Internal UI components: `c-card`, `c-button`.

## Edge Cases & Validation
- No input → no validation needed.
- The result is always a valid integer in `[1024, 65535]` (16-bit non-privileged port).
- The port is **not** checked against locally-listening ports — picking, e.g., `8080` may still collide with running services.
- Repeated clicks may, by chance, return the same port (uniform random; no de-dup).
- No persistence — refreshing the page picks a fresh value at mount.

## Examples
1. Mount: shows `52317` (random).
2. Click "Refresh" → shows `8174`.
3. Click "Copy" → clipboard now contains `8174`, toast "Port copied to the clipboard".

## File Structure
- `index.ts` — Tool registration (path, name via i18n, keywords, lazy-loaded component).
- `random-port-generator.vue` — Single-file component: card UI, computed `port`, copy and refresh handlers.
- `random-port-generator.model.ts` — Exports `generatePort`, a one-line wrapper around `randIntFromInterval(1024, 65535)`.

## Notes
- Uses `Math.random` indirectly — **not cryptographically secure**. For randomness needed in security contexts, prefer the `token-generator` or `uuid-generator` tools.
- Range covers registered ports (1024–49151) + dynamic/ephemeral (49152–65535). It does **not** restrict to ephemeral only.
- No i18n strings for the button labels ("Copy", "Refresh") or the toast message — only `name` and `description` are translated.
- Output is rendered as a string (`String(generatePort())`) so the template binds directly to text without further formatting.
