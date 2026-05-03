# Chronometer

## Overview
- **Path:** `/chronometer`
- **Category:** Measurement
- **Description:** Monitor the duration of a thing. Basically a chronometer with simple chronometer features.
- **Keywords:** chronometer, time, lap, duration, measure, pause, resume, stopwatch
- **Redirect from:** None

## Purpose
A simple browser-based stopwatch with start, stop (pause), and reset controls. The user clicks Start to begin counting elapsed time in milliseconds, can pause/resume the count, and reset back to zero. Useful for quick informal duration measurement (e.g., timing a task) without leaving the IT-Tools app or installing a stopwatch app.

## Inputs
There are no editable text inputs. The user interacts via three buttons:

| Control | Type | Action |
|---|---|---|
| Start | button (`type="primary"`, visible when not running) | Resumes the timer |
| Stop | button (`type="warning"`, visible when running) | Pauses the timer |
| Reset | button | Resets the elapsed counter to `0` |

Internal reactive state:
- `isRunning: boolean` — Default `false`. Tracks whether the timer is actively counting.
- `counter: number` — Default `0`. Total elapsed milliseconds.

## Outputs
| Output | Type | Description |
|---|---|---|
| Formatted duration | string | The elapsed time displayed in the format `[HH:]MM:SS.mmm` |

## UI / Components
- A `c-card` displays the live elapsed duration (40px, monospace, centered text).
- Below the card, a horizontal flex row of buttons with margin-top 5 and gap 3:
  - When `!isRunning`: `Start` button (primary)
  - When `isRunning`: `Stop` button (warning, yellow/orange)
  - Always visible: `Reset` button
- The buttons swap based on state, so the user always sees exactly two buttons (Start/Stop + Reset).

## Logic / Algorithm
### Tick loop
- Uses `useRafFn` from `@vueuse/core` (a `requestAnimationFrame` wrapper). The callback runs once per browser frame (~16.6ms at 60fps).
- Initialized with `{ immediate: false }`, so the loop is paused at startup.
- On each frame:
  ```ts
  const deltaMs = Date.now() - previousRafDate;
  previousRafDate = Date.now();
  counter.value += deltaMs;
  ```
  This computes the delta since the last frame and accumulates it. Using `Date.now()` deltas instead of `performance.now()` is fine here because the deltas are summed.

### Resume
1. Reset `previousRafDate = Date.now()` so the first delta after resuming is small.
2. Call `resumeRaf()` to restart the RAF loop.
3. Set `isRunning.value = true`.

### Pause
1. Call `pauseRaf()` to halt the RAF loop.
2. Set `isRunning.value = false`.

### Reset
- Inline handler in the template: `@click="counter = 0"`. Note: reset does **not** automatically pause; if the timer is running it continues from 0.

### Format function (`chronometer.service.ts`)
```ts
function formatMs(msTotal: number) {
  const ms   = msTotal % 1000;
  const secs = ((msTotal - ms) / 1000) % 60;
  const mins = (((msTotal - ms) / 1000 - secs) / 60) % 60;
  const hrs  = (((msTotal - ms) / 1000 - secs) / 60 - mins) / 60;
  const hrsString = hrs > 0 ? `${hrs.toString().padStart(2, '0')}:` : '';
  return `${hrsString}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
}
```
- Hours are only rendered if greater than zero.
- Minutes and seconds are zero-padded to 2 digits; milliseconds are zero-padded to 3 digits.

## Dependencies
- `vue` — reactivity (`ref`)
- `@vueuse/core` (`^10.3.0`) — `useRafFn` for the requestAnimationFrame-based tick loop
- Internal `c-card`, `c-button` — local UI components

## Edge Cases & Validation
- Reset while running keeps the timer running; the user must press Stop separately to pause.
- The frame rate determines the apparent ms resolution. On lower frame rates (e.g., background tabs throttled to 1Hz), accuracy degrades because RAF callbacks are paused or de-prioritized in inactive tabs — though counter accumulates correct delta when it does run.
- The `counter` is a JavaScript number; very long timing sessions are well within the safe integer range (Number.MAX_SAFE_INTEGER ms ≈ 285 million years).
- No persistence — refreshing the page resets the counter and loses the state.
- No alarms, lap times, or split times are supported despite "lap" being in the keywords.

## Examples
**Example 1:** `formatMs(0)` → `"00:00.000"`
**Example 2:** `formatMs(1)` → `"00:00.001"`
**Example 3:** `formatMs(123456)` → `"02:03.456"` (2 minutes, 3 seconds, 456 ms)
**Example 4:** `formatMs(12345600)` → `"03:25:45.600"` (3 hours, 25 min, 45.6 s)

## File Structure
- `index.ts` — Tool registration via `defineTool`; sets path, icon (`TimerOutlined` from `@vicons/material`), name, keywords
- `chronometer.vue` — UI and timer state machine using `useRafFn`
- `chronometer.service.ts` — `formatMs` helper for converting milliseconds to display string
- `chronometer.service.test.ts` — Vitest tests for `formatMs` with edge values (0, 1, 123456, 12345600)

## Notes
- No persistence; state is in-memory only.
- No keyboard shortcuts.
- Despite the keyword `lap`, no lap functionality is implemented.
- The icon used is `TimerOutlined` from `@vicons/material` (a Material Icons style).
- i18n: title and description are translated via `tools.chronometer.*` keys; in-component button labels (Start, Stop, Reset) are hard-coded English.
