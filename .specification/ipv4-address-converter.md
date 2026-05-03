# IPv4 Address Converter

## Overview
- **Path:** `/ipv4-address-converter`
- **Category:** Network
- **Description:** Convert an IP address into decimal, binary, hexadecimal, or even an IPv6 representation of it.
- **Keywords:** ipv4, address, converter, decimal, hexadecimal, binary, ipv6
- **Redirect from:** None
- **Icon:** `Binary` from `@vicons/tabler`
- **Created at:** 2023-04-08

## Purpose
Given a dotted-decimal IPv4 address (e.g. `192.168.1.1`), simultaneously display the equivalent representations a network engineer typically needs: 32-bit decimal integer, hexadecimal (uppercase), 32-bit binary string, IPv4-mapped IPv6 in long form, and IPv4-mapped IPv6 in compressed `::ffff:` form. The address is persisted across reloads so it survives a refresh during longer debugging sessions.

## Inputs
| Name | Type | Default | Validation |
|---|---|---|---|
| `rawIpAddress` | `string` (dotted-decimal IPv4) | `'192.168.1.1'` (persisted in `localStorage` under key `ipv4-converter:ip` via `useStorage`) | Regex check `isValidIpv4`; if invalid, all output values are blanked. |

The validation regex is:
```
/^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/
```

## Outputs
Five computed rows, each rendered with `input-copyable`:

| Label | Format | Example for `192.168.1.1` |
|---|---|---|
| `Decimal:` | unsigned 32-bit integer as string | `3232235777` |
| `Hexadecimal:` | uppercase hex (no separators, no `0x`) | `C0A80101` |
| `Binary:` | binary string (variable length, no padding) | `11000000101010000000000100000001` |
| `Ipv6:` | IPv4-mapped IPv6 with full prefix | `0000:0000:0000:0000:0000:ffff:c0a8:0101` |
| `Ipv6 (short):` | IPv4-mapped IPv6 with compressed prefix | `::ffff:c0a8:0101` |

When the IP fails validation, every value is replaced with the empty string and the inputs show the placeholder `Set a correct ipv4 address`.

## UI / Components
- `c-input-text` labelled `The ipv4 address:` with placeholder `The ipv4 address...` and inline validation.
- `n-divider` separating the input from outputs.
- `v-for` over `convertedSections` rendering five `input-copyable` rows: `labelPosition='left'`, `labelWidth='100px'`, `labelAlign='right'`, `mb-2`, `placeholder='Set a correct ipv4 address'`.
- All outputs are read-only and have a click-to-copy button via `InputCopyable`.

## Logic / Algorithm
Implemented in `ipv4-address-converter.service.ts`:

1. **`isValidIpv4({ ip })`** — trims input, returns the regex match against `/^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/`.
2. **`ipv4ToInt({ ip })`** — if invalid returns `0`; otherwise:
   ```
   int = sum_{i=0..3} ( octet[i] * 256^(3 - i) )
   ```
3. **`ipv4ToIpv6({ ip, prefix = '0000:0000:0000:0000:0000:ffff:' })`** — if invalid returns `''`; otherwise:
   - Split the IPv4 into 4 octets, convert each to 2-character hex (zero-padded, lowercase).
   - Chunk pairs of bytes into 16-bit groups, join each chunk as a 4-character hex block.
   - Join blocks with `':'` and prepend `prefix`.
   - For the short form the component passes `prefix: '::ffff:'`.

The `.vue` component composes these helpers with `convertBase` (from the integer-base-converter model) for the decimal/hex/binary rows. The hex row uppercases the result.

`useValidation` from `@/composable/validation` produces a `validationStatus`; when `'error'` the template overwrites every output with `''`.

## Dependencies
- `lodash` (chained transformations in `ipv4ToIpv6`).
- `@vueuse/core` `useStorage` for persistence (auto-imported via Vue auto-import config).
- `@vicons/tabler` `Binary`.
- Local: `convertBase` from `../integer-base-converter/integer-base-converter.model`, `@/composable/validation` `useValidation`, `c-input-text`, `input-copyable`, `n-divider`.

## Edge Cases & Validation
- Trailing/leading whitespace is trimmed before validation and conversion.
- Invalid inputs verified by tests:
  - `''`, `' '`, `'foo'`, `'-1'`, `'0'` — all rejected.
  - `'256.168.0.1'` — rejected (octet > 255).
  - `'192.168.0'`, `'192.168.0.1.2'`, `'192.168.0.1.'`, `'.192.168.0.1'`, `'192.168.0.a'` — rejected.
- The regex permits unusual forms with a trailing dot but the `\b` boundary plus `{4}` requires exactly four octet matches.
- `ipv4ToInt` returns `0` for invalid input, but the UI never displays it because the validation guard blanks the outputs first.
- The IPv6 hex string is lowercase (the per-octet `toString(16).padStart(2, '0')` is lowercase). Decimal and binary outputs have no padding (binary may be shorter than 32 chars for low addresses).
- The hex output, in contrast, is `.toUpperCase()`-applied in the template, so the IPv6 row and the hex row use opposite cases.

## Examples
- Input `192.168.0.1` →
  - Decimal `3232235521`
  - Hex `C0A80001`
  - Binary `11000000101010000000000000000001`
  - IPv6 `0000:0000:0000:0000:0000:ffff:c0a8:0001`
  - IPv6 (short) `::ffff:c0a8:0001`
- Input `255.255.255.255` →
  - Decimal `4294967295`
  - Hex `FFFFFFFF`
  - Binary `11111111111111111111111111111111`
  - IPv6 (short) `::ffff:ffff:ffff`
- Input `10.0.0.1` →
  - Decimal `167772161`

## File Structure
- `index.ts` — Tool metadata, registers route `/ipv4-address-converter`, sets `createdAt: 2023-04-08`.
- `ipv4-address-converter.vue` — Single input plus 5 computed read-only output rows.
- `ipv4-address-converter.service.ts` — `ipv4ToInt`, `ipv4ToIpv6`, `isValidIpv4` pure helpers.
- `ipv4-address-converter.service.test.ts` — Vitest unit tests for `ipv4ToInt` and `isValidIpv4`.

## Notes
- Persistence: `useStorage('ipv4-converter:ip', '192.168.1.1')` — survives reloads in the browser's `localStorage`.
- `isValidIpv4` and `ipv4ToInt` are reused by `ipv4-range-expander`, making this service a building block for two other tools.
- i18n: title/description from `tools.ipv4-address-converter.*`. Inline strings ("The ipv4 address:", labels) are not translated.
- No accessibility-specific code; relies on Naive UI defaults.
