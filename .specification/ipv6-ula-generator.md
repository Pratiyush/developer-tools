# IPv6 ULA Generator

## Overview
- **Path:** `/ipv6-ula-generator`
- **Category:** Network
- **Description:** Generate your own local, non-routable IP addresses for your network according to RFC4193.
- **Keywords:** ipv6, ula, generator, rfc4193, network, private
- **Redirect from:** None
- **Icon:** `BuildingFactory` from `@vicons/tabler`
- **Created at:** 2023-04-09

## Purpose
Implements the algorithm from [RFC 4193](https://datatracker.ietf.org/doc/html/rfc4193) section 3.2.2 to derive a pseudo-random Unique Local Address (ULA) /48 prefix for an IPv6 network. The user provides a MAC address (intended to make distinct sites unlikely to collide), and the tool combines it with the current timestamp, hashes via SHA1, and emits the lower 40 bits as the Global ID. Returns the /48 prefix plus the first and last routable /64 blocks within the prefix.

## Inputs
| Name | Type | Default | Validation |
|---|---|---|---|
| `macAddress` | `string` (MAC address) | `'20:37:06:12:34:56'` (in-memory only — not persisted) | `macAddressValidation` regex `/^([0-9A-Fa-f]{2}[:-]){2,5}([0-9A-Fa-f]{2})$/`. Accepts colon- or dash-separated MACs of 3-6 octets (typical 6-octet MACs match). Error message: `Invalid MAC address`. |

The current timestamp is also implicitly an input, refreshed every reactive recompute.

## Outputs
Three computed values, displayed only when the MAC address is valid:

| Label | Format | Example |
|---|---|---|
| `IPv6 ULA:` | `fdXX:XXXX:XXXX::/48` (the random Global ID prefix) | `fda1:2b3c:4d5e::/48` |
| `First routable block:` | `fdXX:XXXX:XXXX:0::/64` | `fda1:2b3c:4d5e:0::/64` |
| `Last routable block:` | `fdXX:XXXX:XXXX:ffff::/64` | `fda1:2b3c:4d5e:ffff::/64` |

Each output is rendered through `InputCopyable` (read-only with copy button).

## UI / Components
- `n-alert` (type `info`, title `Info`) explaining the methodology in plain English.
- `c-input-text` for the MAC address: `clearable`, `raw-text`, label `MAC address:`, my-8 vertical margin, validation bound to `addressValidation`.
- Conditional `<div v-if="addressValidation.isValid">` containing three `InputCopyable` rows (label width `160px`, label aligned right, label placement left, read-only, mb-2).

The info alert reads:
> This tool uses the first method suggested by IETF using the current timestamp plus the mac address, sha1 hashed, and the lower 40 bits to generate your random ULA.

## Logic / Algorithm
The algorithm in `ipv6-ula-generator.vue`:

```ts
const timestamp = new Date().getTime();
const hex40bit = SHA1(timestamp + macAddress.value).toString().substring(30);
const ula = `fd${hex40bit.substring(0, 2)}:${hex40bit.substring(2, 6)}:${hex40bit.substring(6)}`;
```

Steps:
1. Concatenate `timestamp + macAddress` (string concatenation due to JS coercion of the number to string).
2. SHA-1 hash via `crypto-js`. The resulting digest is a 40-character lowercase hex string (160 bits).
3. `.substring(30)` keeps the last 10 hex characters (= 40 bits) — the RFC 4193 Global ID length.
4. Build `ula` by:
   - Hard-coding the FC00::/7 + L=1 prefix as `fd`.
   - Appending the next 2 hex chars (8 bits, the rest of the first 16-bit block).
   - Then `:` + next 4 chars (next 16-bit block).
   - Then `:` + last 4 chars (third 16-bit block).
5. Form three values:
   - `IPv6 ULA: ${ula}::/48`
   - `First routable block: ${ula}:0::/64`
   - `Last routable block: ${ula}:ffff::/64`

Because the computation references `macAddress.value` (a `ref`), the timestamp is recomputed on every reactive update — including each typed character — so the output changes continuously while typing.

## Dependencies
- `crypto-js` (`^4.1.1`) `SHA1` for hashing. Types: `@types/crypto-js`.
- `@vicons/tabler` `BuildingFactory`.
- Local: `InputCopyable.vue`, `macAddressValidation` from `@/utils/macAddress`, `c-input-text`, `n-alert`.

## Edge Cases & Validation
- Invalid MAC (wrong format, only 1 or 2 octets, more than 6, non-hex characters) → outputs hidden, validation message shown.
- Mixed `:`/`-` separators are not accepted by the regex (it expects a single separator type repeating).
- The output is intentionally non-deterministic: every keystroke or re-render yields a different ULA because of the timestamp. To "fix" a generated address, a user must copy it before retyping.
- The hash uses string concatenation, so two MACs differing only by capitalization (`AB:CD:...` vs `ab:cd:...`) hash to different values; both pass validation.
- 40 bits of pseudo-randomness gives ~10^12 possible Global IDs — collisions across organizations are unlikely but not impossible.

## Examples
- MAC `20:37:06:12:34:56` at some timestamp → e.g.
  - `IPv6 ULA: fdab:cdef:0123::/48`
  - `First routable block: fdab:cdef:0123:0::/64`
  - `Last routable block: fdab:cdef:0123:ffff::/64`
- MAC `aa:bb` → invalid MAC → no output.
- MAC `00:00:00:00:00:00` → still valid; produces a different SHA-1 each time the timestamp changes.

## File Structure
- `index.ts` — Tool metadata; route `/ipv6-ula-generator`; `createdAt: 2023-04-09`.
- `ipv6-ula-generator.vue` — All logic and UI (no separate service or model file).

## Notes
- No persistence: `macAddress` is a plain `ref`, lost on reload.
- No tests in the tool folder.
- The tool uses the IETF "first method" only (timestamp+MAC+SHA1), not the alternative methods in RFC 4193.
- i18n: title/description via `tools.ipv6-ula-generator.*`. The info alert and labels are hard-coded English.
- The result's `::` between blocks 3 and 4 is implicit — the tool composes `${ula}::/48`, exploiting IPv6 zero-compression notation.
