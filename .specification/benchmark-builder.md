# Benchmark Builder

## Overview
- **Path:** `/benchmark-builder`
- **Category:** Measurement
- **Description:** Easily compare execution time of tasks with this very simple online benchmark builder.
- **Keywords:** `benchmark`, `builder`, `execution`, `duration`, `mean`, `variance`
- **Redirect from:** None
- **Icon:** `SpeedFilled` (from `@vicons/material`)
- **Created at:** 2023-04-05
- **i18n key:** `tools.benchmark-builder.title` / `.description`

## Purpose
Lets a user record multiple measurement runs (e.g. milliseconds for "Algorithm A" vs "Algorithm B"), automatically computes mean and variance per suite, ranks the suites by mean, and shows the delta and ratio of each suite vs the fastest. The result table can be copied as Markdown or as a bullet list, ready to paste into PR descriptions or benchmark blog posts.

## Inputs

### Per-suite (one card per suite, multiple suites supported)
| Field | Type | Default | Validation / Notes |
|-------|------|---------|--------------------|
| `title` | string | `'Suite 1'`, `'Suite 2'`, … | Editable, `clearable`. |
| `data` | array of `number \| null` | `[5, 10]` for Suite 1, `[8, 12]` for Suite 2 (initial seed) | Each measurement is an `n-input-number`. `null` entries are filtered out before computation. |

### Global
| Field | Type | Default | Notes |
|-------|------|---------|-------|
| `unit` | string | `''` | Suffix appended to all numeric outputs (e.g. `ms`, `s`, `ns`). Trimmed before use. |

All three (`suites[].title`, `suites[].data`, `unit`) are persisted via `useStorage`:
- `benchmark-builder:suites`
- `benchmark-builder:unit`

## Outputs

### Computed `results` table
A sorted-ascending-by-mean array. Each row contains:
| Column header | Field | Description |
|---------------|-------|-------------|
| Position | `position` | 1-indexed rank by mean (lowest first). |
| Suite | `title` | Suite title. |
| Samples | `size` | Number of non-null measurements. |
| Mean | `mean` | `<round(mean)><unit>` plus, for non-fastest suites, ` (+<delta><unit> ; x<ratio>)`. |
| Variance | `variance` | `<round(variance)><unit>²` (the `²` is appended only when a unit is set). |

Where `round(v) = Math.round(v * 1000) / 1000` (3 decimal places).

### Copy formats
- **Markdown table:** the result of `arrayToMarkdownTable({ data: results, headerMap })`.
- **Bullet list:** suite title as top-level bullet, then `Position`, `Samples`, `Mean`, `Variance` as second-level bullets.

## UI / Components
- Horizontal `n-scrollbar` with one `c-card` per suite (each 294 px wide):
  - `c-input-text` for the suite title.
  - `n-divider`.
  - `<DynamicValues v-model:values="suite.data">` — a list of `NInputNumber` rows with delete (Trash) and "Add a measure" (Plus) buttons. Pressing Enter on the last row appends a new row and focuses it; Enter on an inner row jumps to the next row.
  - Below the card: text-only `c-button`s "Delete suite" (only when more than 1 suite) and "Add suite" (always; inserts a new suite to the right with `data: [0]`).
- Below the suite scroller, in a max-w-600px column:
  - `c-input-text` for `unit` (label-left).
  - "Reset suites" `c-button` (replaces all suites with two empty suites titled Suite 1 and Suite 2).
  - `c-table` rendering `results` with the headers map.
  - "Copy as markdown table" and "Copy as bullet list" buttons.

## Logic / Algorithm

### Per suite
```ts
const data = dirtyData.filter(_.isNumber); // strip nulls
const mean = sum(data) / data.length;       // 0 if empty
const variance = mean(data.map(v => (v - mean) ** 2)); // 0 if empty
```
(`computeAverage` returns 0 when `data.length === 0`; `computeVariance` calls `computeAverage` twice.)

### Ranking & delta
1. Sort suites by `mean` ascending → fastest at index 0.
2. Compute the formatted display:
   - `bestMean = sorted[0].mean`.
   - `delta = mean - bestMean`.
   - `ratio = bestMean === 0 ? '∞' : round(mean / bestMean)`.
   - Append `(+<round(delta)><unit> ; x<ratio>)` only when `index !== 0` and `bestMean !== mean` (so ties do not show a delta).

### Markdown table format (`arrayToMarkdownTable`)
```ts
| Position | Suite | Samples | Mean | Variance |
| --- | --- | --- | --- | --- |
| 1 | Suite 1 | 2 | 7.5ms | 6.25ms² |
| 2 | Suite 2 | 2 | 10ms (+2.5ms ; x1.333) | 4ms² |
```
Headers come from a fixed `headerMap`: `position → Position`, `title → Suite`, `size → Samples`, `mean → Mean`, `variance → Variance`.

### Bullet list format
```
 - Suite 1
    - Position: 1
    - Samples: 2
    - Mean: 7.5ms
    - Variance: 6.25ms²
 - Suite 2
    - Position: 2
    - Samples: 2
    - Mean: 10ms (+2.5ms ; x1.333)
    - Variance: 4ms²
```

## Dependencies
- `lodash` (`_.sum`, `_.isNumber`).
- `@vueuse/core`:
  - `useStorage` — persistence.
  - `useTemplateRefsList`, `useVModel`, `nextTick` (in `dynamic-values.vue`).
- `@vicons/tabler` (`Plus`, `Trash`).
- Naive-UI: `n-divider`, `n-input-number`.
- Project composable: `useCopy` (called with `createToast: false`, so no toast appears on copy).
- Project components: `c-card`, `c-input-text`, `c-button`, `c-table`, `c-tooltip`.

## Edge Cases & Validation
- Empty suite — `mean = 0`, `variance = 0`, `size = 0`. Ratio against a zero best-mean is rendered as `∞`.
- All suites have `mean = 0` — every suite is "best"; only Position 1 has no delta because `bestMean === mean` for every row.
- Identical means across suites — neither row shows a delta (since `bestMean !== mean` is false).
- Non-numeric (null) entries — silently filtered before averaging.
- Negative values — accepted; the math is still well-defined but the use case is unusual.
- Very large suites — no virtualization; the suite cards render every row.
- Reset clears all data to `Suite 1` / `Suite 2` with empty arrays.

## Examples
1. **Default seed**
   - Suite 1: `[5, 10]` → mean 7.5, variance 6.25.
   - Suite 2: `[8, 12]` → mean 10, variance 4.
   - With `unit = "ms"`:
     - Position 1: Suite 1, Samples 2, Mean `7.5ms`, Variance `6.25ms²`.
     - Position 2: Suite 2, Samples 2, Mean `10ms (+2.5ms ; x1.333)`, Variance `4ms²`.
2. **Empty unit**
   - Same as above but Mean `7.5`, Variance `6.25` (no `²` because `cleanUnit` is empty).
3. **Tie**
   - Both suites at `[1, 2, 3]` → both report Position 1/Mean `2`/Variance `0.667`; second row omits the `(+0 ; x1)` annotation because of the `bestMean !== mean` guard.

## File Structure
| File | Description |
|------|-------------|
| `index.ts` | Tool metadata (createdAt 2023-04-05). |
| `benchmark-builder.vue` | Top-level component: suite layout, computed results, and copy formatting. |
| `dynamic-values.vue` | Reusable child component for per-suite measurements (add/remove rows, Enter-to-advance focus). |
| `benchmark-builder.models.ts` | Pure functions: `computeAverage`, `computeVariance`, `arrayToMarkdownTable`. |

## Notes
- **Persistence:** Whole `suites` array (titles + measurements) and the `unit` are saved between visits.
- **i18n:** Title and description are translated. UI text and the headers map are hard-coded English.
- **Tracking:** No actual benchmarking is done in-tool — users paste in numbers they measured elsewhere. The tool is a calculator + formatter.
- **`useCopy` no-toast:** Both copy actions intentionally suppress the toast (`createToast: false`).
