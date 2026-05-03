# Percentage calculator

## Overview
- **Path:** `/percentage-calculator`
- **Category:** Math
- **Description:** Easily calculate percentages from a value to another value, or from a percentage to a value.
- **Keywords:** percentage, calculator, calculate, value, number, %
- **Redirect from:** (none)
- **Created at:** 2023-06-18
- **Icon:** `Percentage` (from `@vicons/tabler`)

## Purpose
A three-mode percentage calculator covering the most common everyday percentage questions:
1. **Value of a percentage:** "What is X% of Y?" → returns `(X / 100) * Y`.
2. **Percentage of a value:** "X is what percent of Y?" → returns `100 * X / Y`.
3. **Percentage change:** "What is the percentage increase/decrease from `From` to `To`?" → returns `((To − From) / From) * 100`.

Each calculation is independent (the three rows don't share state). Useful for tip calculations, sale discounts, growth metrics, and quick everyday math.

## Inputs
There are six numeric inputs across the three rows. All use `n-input-number` with `placeholder` set to a single letter or word. Each has a unique `data-test-id`.

### Row 1 — "What is X % of Y"
| Name | Type | Default | Validation | Test ID |
| --- | --- | --- | --- | --- |
| `percentageX` | number \| undefined | `undefined` | None — Naive UI's number input enforces numeric input | `percentageX` |
| `percentageY` | number \| undefined | `undefined` | Same | `percentageY` |

### Row 2 — "X is what percent of Y"
| Name | Type | Default | Validation | Test ID |
| --- | --- | --- | --- | --- |
| `numberX` | number \| undefined | `undefined` | None | `numberX` |
| `numberY` | number \| undefined | `undefined` | None — division by 0 produces non-finite which is filtered | `numberY` |

### Row 3 — "What is the percentage increase/decrease"
| Name | Type | Default | Validation | Test ID |
| --- | --- | --- | --- | --- |
| `numberFrom` | number \| undefined | `undefined` | None — `numberFrom = 0` produces non-finite which is filtered | `numberFrom` |
| `numberTo` | number \| undefined | `undefined` | None | `numberTo` |

## Outputs
Each row has a result field (read-only `input-copyable` with `max-width: 150px`):

| Output | Type | Test ID | Logic |
| --- | --- | --- | --- |
| `percentageResult` | string | `percentageResult` | `(percentageX / 100 * percentageY).toString()` |
| `numberResult` | string | `numberResult` | `(100 * numberX / numberY).toString()` — empty string if non-finite (e.g. `numberY === 0`) |
| `percentageIncreaseDecrease` | string | `percentageIncreaseDecrease` | `((numberTo − numberFrom) / numberFrom * 100).toString()` — empty string if non-finite (e.g. `numberFrom === 0`) |

All three computeds return `''` when either input of their pair is `undefined` (i.e. the user hasn't filled both yet).

## UI / Components
The page uses a 3-stack of `c-card`s, each laid out horizontally with `flex gap-2`.

### Row 1 — `What is X % of Y`
Layout (small breakpoint and above):
```
[What is] [n-input-number percentageX] [%] [of] [n-input-number percentageY] [input-copyable percentageResult]
```
- A "What is" label is shown inline (`hidden pt-1 sm:block`) on small screens and above; on mobile a separate header `<div mb-3 sm:hidden>What is</div>` is shown above instead.
- The `% of` text appears between the two inputs (`min-w-fit pt-1`).
- Result input has `max-width: 150px`.

### Row 2 — `X is what percent of Y`
- On mobile: header `<div mb-3 sm:hidden>X is what percent of Y</div>`.
- Inline: `[numberX] is what percent of [numberY] [numberResult]`. The "is what percent of" label is `hidden min-w-fit pt-1 sm:block`.

### Row 3 — `What is the percentage increase/decrease`
- Always-visible header `<div mb-3>What is the percentage increase/decrease</div>` (no responsive hiding here).
- Inline: `[numberFrom] [numberTo] [percentageIncreaseDecrease]` — the inputs are placeholdered `From` and `To` respectively; no inline connector text between them.

The whole tool is wrapped in a centered container (`max-width: 600px`).

## Logic / Algorithm
All logic in the SFC, no service file:

```ts
const percentageX = ref();
const percentageY = ref();
const percentageResult = computed(() => {
  if (percentageX.value === undefined || percentageY.value === undefined) {
    return '';
  }
  return (percentageX.value / 100 * percentageY.value).toString();
});

const numberX = ref();
const numberY = ref();
const numberResult = computed(() => {
  if (numberX.value === undefined || numberY.value === undefined) {
    return '';
  }
  const result = 100 * numberX.value / numberY.value;
  return (!Number.isFinite(result) || Number.isNaN(result)) ? '' : result.toString();
});

const numberFrom = ref();
const numberTo = ref();
const percentageIncreaseDecrease = computed(() => {
  if (numberFrom.value === undefined || numberTo.value === undefined) {
    return '';
  }
  const result = (numberTo.value - numberFrom.value) / numberFrom.value * 100;
  return (!Number.isFinite(result) || Number.isNaN(result)) ? '' : result.toString();
});
```

Steps for each row:
1. Both inputs must be set (not `undefined`) — else result `''`.
2. Compute the formula.
3. For the two division-based formulas (rows 2 and 3), guard against `Infinity` / `-Infinity` / `NaN` and substitute `''`.
4. Return result via `.toString()` — no rounding, no thousands separators.

(Note: row 1 does **not** check for `Number.isFinite`, but multiplication with `undefined`-checked finite numbers won't produce non-finite results unless one input is itself non-finite, which `n-input-number` doesn't normally allow.)

## Dependencies
| Library | Purpose | Notes |
| --- | --- | --- |
| `vue` (`ref`, `computed`) | Reactivity | |
| `naive-ui` (`n-input-number`) | Number input field | |
| Internal `c-card`, `input-copyable` | UI primitives | `input-copyable` is read-only and renders a copy button |
| `@playwright/test` (dev) | E2E test | |

## Edge Cases & Validation
- **One input empty:** Result is `''`.
- **Both empty:** Result is `''`.
- **Zero divisor:**
  - `numberY === 0` in row 2 → `100 * numberX / 0` is `Infinity` (or `NaN` if `numberX === 0`); guard returns `''`.
  - `numberFrom === 0` in row 3 → same; guard returns `''`.
- **Negative numbers:** Allowed and produce mathematically correct signed results.
- **Floating-point oddities:** Results are JavaScript-precision (e.g. `123 is what percent of 456` produces `26.973684210526315`, with full repeating decimals — see test).
- **Very large or tiny numbers:** Returned via `.toString()`, which switches to scientific notation for very small/large values.
- **No locale formatting:** No thousand separators, no rounding.
- **Inputs are typed as `number`** by `n-input-number`; clearing a field sets `ref.value === undefined` (not `null`).

## Examples
From the e2e test (and trivial recomputation):

| Operation | Inputs | Output |
| --- | --- | --- |
| `What is 123% of 456` | percentageX=123, percentageY=456 | `560.88` |
| `123 is what percent of 456` | numberX=123, numberY=456 | `26.973684210526315` |
| `Percentage change from 123 to 456` | numberFrom=123, numberTo=456 | `270.7317073170732` |
| Empty 2nd input | percentageX=123, percentageY=∅ | `''` (no result) |

## File Structure
```
percentage-calculator/
├── index.ts                          # Tool metadata (icon Percentage, createdAt 2023-06-18)
├── percentage-calculator.vue         # Single-file component containing all 3 calculators
└── percentage-calculator.e2e.spec.ts # Playwright tests for all three operations + empty-input behavior
```

## Notes
- **i18n:** `name` and `description` come from `translate('tools.percentage-calculator.title' / '.description')`. The three section headings ("What is", "X is what percent of Y", "What is the percentage increase/decrease") and placeholders are hard-coded English.
- **No persistence** — refs are not bound to `useStorage`.
- **Three-row layout is responsive** via Tailwind/UnoCSS `sm:` breakpoints — on mobile the header text moves above the row, on desktop it inlines between inputs.
- **No business-logic file** — everything lives in the `.vue` SFC; the only test is the Playwright e2e spec.
- **Result inputs are copyable** but typed `readonly`; users can copy the result without manual selection.
- **Row 1 lacks the non-finite guard** the other two have. In practice this is harmless because `(X/100) * Y` can only yield non-finite results if `X` or `Y` is itself non-finite, which `n-input-number` does not produce.
- **`v-model:value` on the readonly result fields** is technically two-way but the `readonly` attribute prevents user editing.
