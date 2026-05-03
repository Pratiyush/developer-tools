# ETA calculator

## Overview
- **Path:** `/eta-calculator`
- **Category:** Math
- **Description:** An ETA (Estimated Time of Arrival) calculator to determine the approximate end time of a task, for example, the end time and duration of a file download.
- **Keywords:** `eta`, `calculator`, `estimated`, `time`, `arrival`, `average`
- **Redirect from:** none
- **Icon:** `Hourglass` (from `@vicons/tabler`)

## Purpose
A simple throughput-based projection tool: given a quantity of work (units), a known throughput rate (units per time-span), and a start datetime, the tool projects the total wall-clock duration and a human-readable end time. Useful for predicting batch-processing finish times, file downloads, item-by-item processing pipelines, or any task whose rate is roughly linear.

## Inputs

| Field | Type | Default | Validation |
|---|---|---|---|
| `unitCount` | integer | `186` (i.e. `3 * 62`) | `min: 1`. The total amount of items to consume. |
| `unitPerTimeSpan` | integer | `3` | `min: 1`. The number of units consumed per `timeSpan`. |
| `timeSpan` | integer | `5` | `min: 1`. Quantity of time-units that pair with `unitPerTimeSpan`. |
| `timeSpanUnitMultiplier` | enum (number) | `60000` (minutes) | One of `1` (ms), `1000` (s), `60000` (min), `3_600_000` (h), `86_400_000` (d). Multiplier converting `timeSpan` to milliseconds. |
| `startedAt` | timestamp (ms) | `Date.now()` at component mount | Datetime picker. Free choice; can be past, present, or future. |

## Outputs

| Field | Type | Description |
|---|---|---|
| `durationMs` | number | Total task duration in milliseconds: `unitCount / (unitPerTimeSpan / (timeSpan * multiplier))`. |
| Total duration display | string | `formatMsDuration(durationMs)` — uses `date-fns` `formatDuration` (e.g. `"5 hours 12 minutes 30 seconds"`) plus a trailing `"X ms"` if there are residual milliseconds. |
| `endAt` | string | `formatRelative(addMilliseconds(startedAt, durationMs), Date.now(), { locale: enGB })` — phrases like `"tomorrow at 14:00"`, `"last Wednesday at 09:30"`, etc. |

## UI / Components
- Top-of-card `op-70` blurb explaining the use case: *"With a concrete example, if you wash 5 plates in 3 minutes and you have 500 plates to wash, it will take you 5 hours to wash them all."*
- `<n-divider>`.
- Row of two flex-1 `n-form-item`s:
  - "Amount of element to consume" → `<n-input-number :min="1" />`
  - "The consumption started at" → `<n-date-picker type="datetime" />`
- Section labelled "Amount of unit consumed by time span" with three controls inline (column on small screens, row on `md`+):
  - `<n-input-number>` for `unitPerTimeSpan`
  - literal text "in"
  - `<n-input-number :min="1" min-w-130px>` for `timeSpan`
  - `<c-select>` with options `[milliseconds, seconds, minutes, hours, days]` mapped to ms multipliers.
- `<n-divider>`.
- Two `c-card`s using `<n-statistic>`:
  - "Total duration" → `formatMsDuration(durationMs)`
  - "It will end" → `endAt` relative phrase.
- `<style lang="less" scoped>`: forces both `n-input-number` and `n-date-picker` to fill width.

## Logic / Algorithm
1. Compute timeSpan in ms: `timeSpanMs = timeSpan * timeSpanUnitMultiplier`.
2. Compute throughput as units-per-ms: `unitPerTimeSpan / timeSpanMs`.
3. Total duration in ms is the inverse division:
   ```ts
   durationMs = unitCount / (unitPerTimeSpan / timeSpanMs)
              = unitCount * timeSpanMs / unitPerTimeSpan
   ```
4. End time: add `durationMs` to `startedAt` and pass through `formatRelative` with `enGB` locale for a phrasing like "today at 18:42".
5. **`formatMsDuration` helper** (in `eta-calculator.service.ts`):
   - Decompose `duration` into ms / s / m / h via integer arithmetic.
   - Format via `formatDuration({ hours, minutes, seconds })`.
   - Append `" X ms"` if `ms > 0`.

## Dependencies
- `date-fns` — `addMilliseconds`, `formatRelative`, `formatDuration`.
- `date-fns/locale` — `enGB` locale for relative phrasing.
- Naive UI: `n-input-number`, `n-date-picker`, `n-form-item`, `n-divider`, `n-statistic`.
- Project wrappers: `c-card`, `c-select`.

## Edge Cases & Validation
- **`unitCount = 0`**: prevented by `min: 1`. With 0 the duration would be 0 → "It will end now".
- **`unitPerTimeSpan = 0`**: prevented by `min: 1`. Would produce `Infinity` duration if forced.
- **Very large `durationMs`**: `addMilliseconds` may overflow into impossible dates; `formatRelative` will still render but values beyond ~year +275000 are unreliable.
- **Past `startedAt`**: end time may be in the past or future, both phrased correctly by `formatRelative`.
- **No persistence** — values reset on reload.
- **No copy button**, only display.

## Examples

**Default (washing-plates analog)**
- `unitCount = 186`, `unitPerTimeSpan = 3`, `timeSpan = 5`, multiplier = 60000 (minutes)
- `durationMs = 186 * (5 * 60000) / 3 = 18_600_000` ms = 5 h 10 min
- "Total duration": `5 hours 10 minutes`
- "It will end": e.g. `today at 18:00` (depends on `startedAt`).

**Big batch processed quickly**
- `unitCount = 1000`, `unitPerTimeSpan = 100`, `timeSpan = 1`, multiplier = 1000 (seconds)
- `durationMs = 1000 * 1000 / 100 = 10_000` ms = 10 s
- "Total duration": `10 seconds`.

**Sub-second remainder**
- `unitCount = 1`, `unitPerTimeSpan = 4`, `timeSpan = 1`, multiplier = 1000 → `durationMs = 250` ms
- `formatMsDuration(250)` → `"" + "250 ms"` → `" 250 ms"` (the leading `formatDuration` returns empty when no h/m/s, so output is just `"250 ms"` after a leading space).

## File Structure
| File | Purpose |
|---|---|
| `index.ts` | Tool registration: name, path `/eta-calculator`, keywords, lazy-loads `eta-calculator.vue`. |
| `eta-calculator.vue` | Single-file component: defines refs for inputs, computes `durationMs` and `endAt`, renders the form and the two stat cards. |
| `eta-calculator.service.ts` | Exports `formatMsDuration(duration: number): string` — decomposes ms into h/m/s/ms and combines with `date-fns` `formatDuration`. |

## Notes
- **i18n** — title and description from `tools.eta-calculator.*`.
- Hard-coded `enGB` locale for relative dates regardless of user's i18n choice (a known limitation; comment in code says *"Duplicate issue with sub directory"*).
- No tests in this folder.
- All math is plain JS floats — no rounding controls, so small rates may produce fractional ms outputs that are floored to integer ms inside `formatMsDuration`.
