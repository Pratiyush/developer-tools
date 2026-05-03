# ULID Generator

## Overview
- **Path:** `/ulid-generator`
- **Category:** Crypto
- **Description:** Generate random Universally Unique Lexicographically Sortable Identifier (ULID).
- **Keywords:** `ulid`, `generator`, `random`, `id`, `alphanumeric`, `identity`, `token`, `string`, `identifier`, `unique`
- **Redirect from:** None
- **Icon:** `SortDescendingNumbers` from `@vicons/tabler`
- **Created at:** `2023-09-11`

## Purpose
Generates one or more ULIDs (Universally Unique Lexicographically Sortable Identifiers). ULIDs are 26-character Crockford-base32-encoded strings combining a 48-bit millisecond timestamp prefix and an 80-bit random suffix, making them sortable by creation time while remaining unique. The tool exposes a quantity selector (1–100) and a choice of two output formats (raw newline-delimited list or JSON array). The selected quantity and format persist across sessions in `localStorage`.

## Inputs
| Name | Type | Default | Validation |
| ---- | ---- | ------- | ---------- |
| `amount` | `number` (numeric input) | `1` (persisted in `localStorage` under key `ulid-generator-amount`) | Bounded: `min="1"`, `max="100"` (note: bound passed as string attribute on `n-input-number`). |
| `format` | `'raw' \| 'json'` (button-toggle) | `'raw'` (persisted under key `ulid-generator-format`) | One of the two `formats` entries. |

## Outputs
| Name | Type | Description |
| ---- | ---- | ----------- |
| `ulids` | `string` (computed, refreshable) | Either `\n`-joined ULIDs (raw mode) or `JSON.stringify(idsArray, null, 2)` (json mode). |

## UI / Components
Layout: vertical flex column, `gap-2`.

- **Quantity row:** `<label>Quantity:</label>` (75px wide) and `<n-input-number v-model:value="amount" min="1" max="100" flex-1>`.
- **Format row:** `<c-buttons-select v-model:value="format" :options="formats" label="Format: " label-width="75px">` with `formats = [{ label: 'Raw', value: 'raw' }, { label: 'JSON', value: 'json' }]`.
- **Output panel:** `<c-card mt-5 flex data-test-id="ulids">` containing `<pre>{{ ulids }}</pre>` centred via `m-x-auto`.
- **Action buttons:**
  - `<c-button data-test-id="refresh">Refresh</c-button>` triggers `refreshUlids()`.
  - `<c-button>Copy</c-button>` triggers `copy()` and shows the toast `"ULIDs copied to the clipboard"`.

The output is rendered in a `<pre>` so newline-separated raw ULIDs are visually preserved.

## Logic / Algorithm
```ts
import { ulid } from 'ulid';
import _ from 'lodash';
import { computedRefreshable } from '@/composable/computedRefreshable';

const amount = useStorage('ulid-generator-amount', 1);
const formats = [{ label: 'Raw', value: 'raw' }, { label: 'JSON', value: 'json' }] as const;
const format = useStorage<typeof formats[number]['value']>('ulid-generator-format', formats[0].value);

const [ulids, refreshUlids] = computedRefreshable(() => {
  const ids = _.times(amount.value, () => ulid());

  if (format.value === 'json') {
    return JSON.stringify(ids, null, 2);
  }

  return ids.join('\n');
});
```

Step-by-step:
1. Read the persisted `amount` (or default `1`) and `format` (or default `'raw'`) from `localStorage` via `@vueuse/core` `useStorage`.
2. On any reactive change to `amount` / `format` (or when `refreshUlids()` is invoked), the computed re-evaluates:
   1. `_.times(amount.value, () => ulid())` calls the `ulid` library `amount` times to produce an array of fresh ULIDs.
   2. If `format === 'json'`, return `JSON.stringify(ids, null, 2)` — pretty-printed JSON array with 2-space indent.
   3. Otherwise, return `ids.join('\n')` — one ULID per line.
3. The computed is re-runnable: `computedRefreshable` exposes the second tuple member (`refreshUlids`) which marks the computed dirty so the next read regenerates the IDs even if no input changed (this is what the "Refresh" button uses).
4. `useCopy({ source: ulids, text: 'ULIDs copied to the clipboard' })` provides the clipboard write and toast.

**ULID format** (informational, from the `ulid` library):
- 26 ASCII characters, all uppercase.
- Crockford Base32 alphabet: `0123456789ABCDEFGHJKMNPQRSTVWXYZ` (no `I`, `L`, `O`, `U`).
- First 10 characters encode a 48-bit millisecond UNIX timestamp; remaining 16 characters encode 80 bits of randomness.
- Lexicographic sort approximates chronological sort.

## Dependencies
- `ulid` (`^2.3.0`) — generates ULIDs. The default factory uses `Math.random()` for the random portion (the library exports `factory()` and `monotonicFactory()` if cryptographic randomness is needed, but this tool calls the default `ulid()`).
- `lodash` (`^4.17.21`) — `_.times` for iteration.
- `@vueuse/core` (`^10.3.0`) — `useStorage` for persistence.
- `@/composable/computedRefreshable` — manually-refreshable computed.
- `@/composable/copy` — clipboard helper.
- `@vicons/tabler` — `SortDescendingNumbers` icon.

## Edge Cases & Validation
- **Quantity below 1:** `n-input-number` enforces `min=1` from the UI; if the persisted value gets corrupted to a smaller number (e.g. via DevTools), `_.times(0)` returns `[]`, output is `''` (or `"[]"` in JSON mode).
- **Quantity above 100:** UI cap is `max=100`; programmatic override (e.g. modifying `localStorage` directly) would generate more, with no internal limit.
- **Non-integer quantity:** `_.times` truncates via its internal `toInteger` semantics, so `1.7` becomes `1`.
- **Format value outside `'raw'|'json'`:** Falls through to the raw branch (no explicit error).
- **Persistence failure:** `useStorage` falls back to in-memory ref if `localStorage` is unavailable.
- **Time skew / clock manipulation:** ULIDs use `Date.now()` for the timestamp portion; system clock changes affect generated values' chronological prefix.
- **Cryptographic strength:** The default `ulid()` uses `Math.random()` for the random component. **Not cryptographically secure**; do not use as a security token.

## Examples
- Quantity = 1, format = `raw` →
  ```
  01H7XQ5Y6KZ8DJ4P2ABCD0FGHX
  ```
- Quantity = 3, format = `raw` (newline-joined) →
  ```
  01H7XQ5Y6KZ8DJ4P2ABCD0FGHX
  01H7XQ5Y8RZ8DJ4P2ABCD0FGRX
  01H7XQ5YBZZ8DJ4P2ABCD0FGSY
  ```
- Quantity = 2, format = `json` →
  ```json
  [
    "01H7XQ5Y6KZ8DJ4P2ABCD0FGHX",
    "01H7XQ5Y8RZ8DJ4P2ABCD0FGRX"
  ]
  ```
- The e2e spec asserts each ULID matches the regex `/[0-9A-Z]{26}/`.

## File Structure
- `index.ts` — Tool descriptor.
- `ulid-generator.vue` — Single-file Vue component containing all logic and UI.
- `ulid-generator.e2e.spec.ts` — Playwright test asserting page title and that pressing Refresh produces a different valid ULID.

No `service.ts`, no unit-test file. All logic lives directly in the Vue component.

## Notes
- Both `amount` and `format` are persisted via `useStorage` (localStorage keys `ulid-generator-amount` and `ulid-generator-format`).
- Title and description are i18n-translated; UI strings ("Quantity:", "Format:", "Refresh", "Copy", and the toast) are hardcoded English.
- Output container has `data-test-id="ulids"` and the refresh button has `data-test-id="refresh"` for e2e tests (note: `data-test-id` here, not `test-id` as in some sibling tools).
- The `<pre>` block centring (`m-x-auto`) and zero margin (`m-0`) are explicit utility classes so output stays visually aligned for both single and multiple ULIDs.
