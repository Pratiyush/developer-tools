# IPv4 Subnet Calculator

## Overview
- **Path:** `/ipv4-subnet-calculator`
- **Category:** Network
- **Description:** Parse your IPv4 CIDR blocks and get all the info you need about your subnet.
- **Keywords:** ipv4, subnet, calculator, mask, network, cidr, netmask, bitmask, broadcast, address
- **Redirect from:** None
- **Icon:** `RouterOutlined` from `@vicons/material`
- **Created at:** Not specified

## Purpose
Take a single IPv4 CIDR block (e.g. `192.168.0.1/24`) and decompose it into all the metadata a sysadmin or network engineer typically wants — netmask in dotted form, network address, mask in binary, hostmask/wildcard, network size, first/last usable addresses, broadcast, and the legacy IP class. Provides "Previous block" / "Next block" navigation buttons to walk through adjacent subnets of the same size, useful when planning subnet allocations sequentially.

## Inputs
| Name | Type | Default | Validation |
|---|---|---|---|
| `ip` | `string` (IPv4 with or without `/mask`) | `'192.168.0.1/24'` (persisted as `ipv4-subnet-calculator:ip`) | `isNotThrowing(() => new Netmask(value.trim()))` — message `We cannot parse this address, check the format`. |

## Outputs
A two-column `n-table` where every row has a bold label and a copyable value (or a muted fallback when the value is undefined). Backed by the [`netmask`](https://www.npmjs.com/package/netmask) library:

| Label | Source | Example for `192.168.0.1/24` |
|---|---|---|
| `Netmask` | `block.toString()` | `192.168.0.0/24` |
| `Network address` | `block.base` | `192.168.0.0` |
| `Network mask` | `block.mask` | `255.255.255.0` |
| `Network mask in binary` | `'1'.repeat(bitmask) + '0'.repeat(32-bitmask)` chunked into 8-bit groups joined by `.` | `11111111.11111111.11111111.00000000` |
| `CIDR notation` | `/${block.bitmask}` | `/24` |
| `Wildcard mask` | `block.hostmask` | `0.0.0.255` |
| `Network size` | `String(block.size)` | `256` |
| `First address` | `block.first` | `192.168.0.1` |
| `Last address` | `block.last` | `192.168.0.254` |
| `Broadcast address` | `block.broadcast` | `192.168.0.255` (fallback `No broadcast address with this mask` when undefined, e.g. `/31`, `/32`) |
| `IP class` | `getIPClass({ ip: block.base })` | `C` (fallback `Unknown class type`) |

The IP class function maps the first octet:
| First octet | Class |
|---|---|
| `0-127` | `A` |
| `128-191` | `B` |
| `192-223` | `C` |
| `224-239` | `D` |
| `240-255` | `E` |
| else | `undefined` (renders fallback) |

## UI / Components
- `c-input-text` (label `An IPv4 address with or without mask`, placeholder `The ipv4 address...`, bottom margin) with `validationRules`.
- `n-table` listing all metadata rows. Each row uses `SpanCopyable` for the value or a muted fallback span (`op-70`).
- Footer flex row with two `c-button`s:
  - "Previous block" (icon `ArrowLeft`) → calls `switchToBlock({ count: -1 })`.
  - "Next block" (icon `ArrowRight`) → calls `switchToBlock({ count: 1 })`.
  - Both delegate to `Netmask.next(count)` and update `ip` to the resulting block's `toString()`.

## Logic / Algorithm
1. Build a `Netmask` instance: `new Netmask(ip.trim())`. The library accepts:
   - `192.168.0.0/24`
   - `192.168.0.0 255.255.255.0`
   - Bare addresses (defaulting to `/32`).
2. `withDefaultOnError(() => new Netmask(...), undefined)` so invalid input leaves the table hidden.
3. The component reads properties from the `Netmask` block (`base`, `mask`, `bitmask`, `hostmask`, `size`, `first`, `last`, `broadcast`, `toString`).
4. The "Network mask in binary" row builds the 32-bit mask string manually:
   ```
   ('1'.repeat(bitmask) + '0'.repeat(32 - bitmask)).match(/.{8}/g)?.join('.')
   ```
5. Block navigation: `networkInfo.next(count)` returns the next or previous adjacent block (or `null` at the edges); the component updates `ip` so the table re-renders.
6. `getIPClass` does pure first-octet bucketing.

## Dependencies
- `netmask` (`^2.0.2`, types from `@types/netmask`) — does the heavy parsing.
- `@vueuse/core` `useStorage`.
- `@vicons/material` `RouterOutlined`, `@vicons/tabler` `ArrowLeft`/`ArrowRight`.
- Local utilities: `withDefaultOnError`, `isNotThrowing`.
- UI: `SpanCopyable`, `c-input-text`, `c-button`, `n-table`, `n-icon`.

## Edge Cases & Validation
- Empty input or non-parsable string → validation error displayed; table hidden.
- `/32` (single host) → `Netmask` exposes `base === first === last` and undefined `broadcast`; the broadcast row shows `No broadcast address with this mask`.
- `/31` (point-to-point per RFC 3021) → similar behavior; broadcast undefined.
- IP class A for `0-127` includes loopback (`127.x`) and `0.0.0.0/8`; the function does not distinguish reserved ranges.
- `getIPClass` for any first octet ≥ 256 returns `undefined`, but `Netmask` would reject such input first.
- `Next block`/`Previous block` may produce `undefined`; the function silently no-ops.

## Examples
- Input `192.168.0.1/24`:
  - Netmask `192.168.0.0/24`, base `192.168.0.0`, mask `255.255.255.0`, bitmask `/24`, binary mask `11111111.11111111.11111111.00000000`, hostmask `0.0.0.255`, size `256`, first `192.168.0.1`, last `192.168.0.254`, broadcast `192.168.0.255`, class `C`.
- Input `10.0.0.0/8`:
  - Netmask `10.0.0.0/8`, mask `255.0.0.0`, size `16777216`, first `10.0.0.1`, last `10.255.255.254`, broadcast `10.255.255.255`, class `A`.
- Input `192.168.0.1/32`:
  - Mask `255.255.255.255`, size `1`, first/last `192.168.0.1`, broadcast undefined → fallback shown.
- Click "Next block" with `192.168.0.1/24` → input updates to `192.168.1.0/24`.

## File Structure
- `index.ts` — Tool metadata, registers the `/ipv4-subnet-calculator` route.
- `ipv4-subnet-calculator.vue` — Input field, results table, prev/next buttons.
- `ipv4-subnet-calculator.models.ts` — Pure `getIPClass` helper.

## Notes
- Persistence: input survives reloads via `useStorage`.
- No dedicated unit test file — the logic is mostly delegated to the third-party `netmask` library.
- i18n: title/description from `tools.ipv4-subnet-calculator.*`. Row labels are hard-coded English.
- The "Previous/Next block" feature implicitly assumes the user wants adjacent blocks of the same size (`Netmask.next(count)` keeps the bitmask).
