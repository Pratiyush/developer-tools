# IPv4 Range Expander

## Overview
- **Path:** `/ipv4-range-expander`
- **Category:** Network
- **Description:** Given a start and an end IPv4 address, this tool calculates a valid IPv4 subnet along with its CIDR notation.
- **Keywords:** ipv4, range, expander, subnet, creator, cidr
- **Redirect from:** None
- **Icon:** `UnfoldMoreOutlined` from `@vicons/material`
- **Created at:** 2023-04-19

## Purpose
Network operators frequently need to fit an arbitrary IPv4 address range (e.g. `192.168.1.1`-`192.168.7.255`) into the smallest valid CIDR block whose boundaries are aligned to a power of two. This tool takes a start and an end IPv4 address, identifies the longest common bit prefix, and outputs the smallest enclosing subnet, its CIDR notation, the new start/end addresses, and the change in range size before/after expansion. Both inputs persist in localStorage so multiple visits keep the working range.

## Inputs
| Name | Type | Default | Validation |
|---|---|---|---|
| `rawStartAddress` | `string` (IPv4) | `'192.168.1.1'` (persisted as `ipv4-range-expander:startAddress`) | `isValidIpv4` regex (shared with ipv4-address-converter). Error message: `Invalid ipv4 address`. |
| `rawEndAddress` | `string` (IPv4) | `'192.168.6.255'` (persisted as `ipv4-range-expander:endAddress`) | Same validation. |

## Outputs
A 4-row table with columns `old value` and `new value`. The values come from `Ipv4RangeExpanderResult`:

```ts
interface Ipv4RangeExpanderResult {
  oldSize?: number
  newStart?: string
  newEnd?: string
  newCidr?: string
  newSize?: number
}
```

| Row label | Old value source | New value source |
|---|---|---|
| `Start address` | user-supplied `rawStartAddress` | `result.newStart` |
| `End address` | user-supplied `rawEndAddress` | `result.newEnd` |
| `Addresses in range` | `result.oldSize` (`toLocaleString()`) | `result.newSize` (`toLocaleString()`) |
| `CIDR` | empty string `''` | `result.newCidr` (e.g. `192.168.0.0/21`) |

If the end address is numerically lower than the start address, the table is hidden and an `n-alert` (type `error`, title `Invalid combination of start and end IPv4 address`) is shown along with a `Switch start and end IPv4 address` button (icon `Exchange`).

## UI / Components
- Two-column flex layout (`flex gap-4 mb-4`) with two `c-input-text` fields (`Start address`, `End address`), each `clearable` and bound to its own `useValidation` instance.
- Conditional rendering:
  - If the range is valid → `n-table` with header row `["", "old value", "new value"]` and four `ResultRow`s.
  - Else if both inputs are individually valid (so the only error is order) → `n-alert` with the swap button.
  - Else → nothing (each input shows its own validation message).
- `ResultRow` (`result-row.vue`) renders: a bold label cell, an old-value cell with `SpanCopyable` styled `class="monospace"`, and a new-value cell with `SpanCopyable`. Test IDs are `kebab-case(label).old` and `.new` (e.g. `addresses-in-range.old`).

## Logic / Algorithm
Implemented in `ipv4-range-expander.service.ts`:

1. Convert each IPv4 to 32-bit decimal via `ipv4ToInt` (reused from ipv4-address-converter).
2. Convert each decimal to a binary string with `convertBase(..., toBase: 2)`, then `padStart(32, '0')`.
3. **`getCidr(start, end)`** — finds the longest common prefix:
   ```
   for i in 0..31:
       if start[i] !== end[i]:
           mask = i; break
   newStart = start[0..mask] + '0'.repeat(32-mask)
   newEnd   = start[0..mask] + '1'.repeat(32-mask)
   ```
   If `getRangesize(start, end) < 1` (end is below start) it returns `null`, signalling no valid result.
4. **`getRangesize(start, end)`** — computes `1 + parseInt(end, 2) - parseInt(start, 2)` (inclusive count).
5. **`bits2ip(int)`** — converts a 32-bit integer back to dotted-decimal:
   ```
   `${ipInt >>> 24}.${(ipInt >> 16) & 255}.${(ipInt >> 8) & 255}.${ipInt & 255}`
   ```
6. The final result has:
   - `result.newStart = bits2ip(parseInt(cidr.start, 2))`
   - `result.newEnd   = bits2ip(parseInt(cidr.end,   2))`
   - `result.newCidr  = `${newStart}/${mask}``
   - `result.newSize  = getRangesize(cidr.start, cidr.end)`
   - `result.oldSize  = getRangesize(start, end)`

The Vue layer:
- `result = computed(() => calculateCidr(...))`.
- `showResult = endValid && startValid && result !== undefined`.
- `onSwitchStartEndClicked()` swaps the two persisted refs.

## Dependencies
- `@vicons/tabler` `Exchange`, `@vicons/material` `UnfoldMoreOutlined`.
- `@vueuse/core` `useStorage` (auto-imported).
- `lodash` `_.kebabCase` in `result-row.vue` for test IDs.
- Local: `calculateCidr` (this folder), `convertBase` (integer-base-converter), `ipv4ToInt`/`isValidIpv4` (ipv4-address-converter), `useValidation` composable, `SpanCopyable` component, `c-input-text`, `n-table`, `n-alert`, `n-icon`, `c-button`.

## Edge Cases & Validation
- Either input invalid → that field shows its own validation error; no result table.
- Both valid but `start > end` numerically → `getCidr` returns `null` → `result` is `undefined` → swap-prompt alert is shown.
- Equal start and end → range size 1; `getCidr` finds full match → `mask=32` → CIDR `/32`.
- Tested cases:
  - `192.168.1.1`-`192.168.7.255` → `oldSize=1791`, `newStart=192.168.0.0`, `newEnd=192.168.7.255`, `newCidr=192.168.0.0/21`, `newSize=2048`.
  - `10.0.0.1`-`10.0.0.17` → `oldSize=17`, `newStart=10.0.0.0`, `newEnd=10.0.0.31`, `newCidr=10.0.0.0/27`, `newSize=32`.
  - `192.168.7.1`-`192.168.6.255` → `result === undefined`.
- `bits2ip` uses `>>> 24` for the first octet to keep the value unsigned, but the binary string is built by `convertBase` (which uses `BigInt`), then padded to 32 bits — adequate for any valid IPv4.
- `toLocaleString()` formats large counts with thousands separators (e.g. `1,791`, `2,048`), as the e2e test asserts.

## Examples
- Inputs `192.168.1.1` & `192.168.7.255`:
  - Old size `1,791`, new size `2,048`
  - New start `192.168.0.0`, new end `192.168.7.255`
  - New CIDR `192.168.0.0/21`
- Inputs `10.0.0.1` & `10.0.0.17`:
  - Old size `17`, new size `32`
  - New start `10.0.0.0`, new end `10.0.0.31`
  - New CIDR `10.0.0.0/27`
- Inputs `192.168.7.1` & `192.168.6.255`:
  - Result undefined → "Invalid combination" alert with swap button.

## File Structure
- `index.ts` — Tool metadata, route, icon, `createdAt: 2023-04-19`.
- `ipv4-range-expander.vue` — Two-input form, conditional table or error alert.
- `result-row.vue` — Single `<tr>` rendering label and two copyable cells.
- `ipv4-range-expander.service.ts` — `calculateCidr`, plus internal helpers `bits2ip`, `getCidr`, `getRangesize`.
- `ipv4-range-expander.types.ts` — `Ipv4RangeExpanderResult` interface.
- `ipv4-range-expander.service.test.ts` — Vitest unit tests covering valid ranges and inverted inputs.
- `ipv4-range-expander.e2e.spec.ts` — Playwright tests verifying UI fields, page title `IPv4 range expander - IT Tools`, and the hidden result table for invalid inputs.

## Notes
- Persistence: both addresses survive reloads via `useStorage`.
- The reused IPv4 service module means a regex change to `isValidIpv4` propagates here automatically.
- The "switch" affordance is more discoverable than typing both fields again, and is a common UX pattern for symmetric inputs.
- Test IDs follow the `kebab-case(label).old|new` convention so the same e2e test selectors keep working when labels are renamed only at the language layer.
- i18n: title/description translated via `tools.ipv4-range-expander.*`. UI strings (`Start address`, error text, switch button label) are hard-coded.
