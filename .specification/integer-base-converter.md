# Integer Base Converter

## Overview
- **Path:** `/base-converter`
- **Category:** Converter
- **Description:** Convert a number between different bases (decimal, hexadecimal, binary, octal, base64, ...)
- **Keywords:** integer, number, base, conversion, decimal, hexadecimal, binary, octal, base64
- **Redirect from:** None
- **Icon:** `ArrowsLeftRight` from `@vicons/tabler`
- **Created at:** Not specified (older tool, no `createdAt` set)

## Purpose
Convert an integer between arbitrary numeric bases ranging from base 2 (binary) up to base 64. Users supply a number written in some source base, choose that source base, and the tool simultaneously displays the value re-encoded in binary, octal, decimal, hexadecimal, base 64, plus an arbitrary user-selected output base. Useful for developers, students learning radix conversion, network engineers (e.g., converting IP segments), or anyone working across different numeral systems.

## Inputs
| Name | Type | Default | Validation |
|---|---|---|---|
| `input` | `string` (number written in `inputBase`) | `'42'` | Each digit must belong to the alphabet for `inputBase`; otherwise an error is shown. |
| `inputBase` | `number` (integer) | `10` | `min=2`, `max=64` (enforced via `n-input-number`). |
| `outputBase` | `number` (integer) | `42` | `min=2`, `max=64` (enforced via `n-input-number`); used only by the "Custom" output line. |

The accepted digit alphabet (in canonical order, indices 0-63):
```
0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+/
```

## Outputs
Each output is a string copyable via the `InputCopyable` component.

| Output | Type | Description |
|---|---|---|
| Binary (2) | `string` | Input number expressed in base 2. |
| Octal (8) | `string` | Input number expressed in base 8. |
| Decimal (10) | `string` | Input number expressed in base 10. |
| Hexadecimal (16) | `string` | Input number expressed in base 16 (lowercase letters a-f). |
| Base64 (64) | `string` | Input number expressed in base 64 using the alphabet above. |
| Custom (`outputBase`) | `string` | Input number expressed in any user-selected base 2-64. |

If conversion throws (because of an invalid digit), each output reverts to an empty string and an error banner is shown above the divider.

## UI / Components
- Container: `c-card` wrapping all controls.
- `c-input-text` for "Input number" with placeholder `Put your number here (ex: 42)`, label width `110px`, label aligned right, label placement left, bottom margin.
- `n-form-item` + `n-input-number` for "Input base" (label width `110`, full width input).
- `n-alert` (type `error`) shown only when the conversion throws.
- `n-divider` separating input from outputs.
- Five fixed `InputCopyable` rows (Binary, Octal, Decimal, Hexadecimal, Base64) — each is `readonly`, `labelPosition='left'`, `labelWidth='170px'`, `labelAlign='right'`, with placeholders like `Binary version will be here...`.
- A horizontal flex row containing an `n-input-group` (`Custom:` label + `n-input-number` for `outputBase`, fixed width 160px) and a flex-1 `InputCopyable` showing the custom-base result.
- Scoped Less style: `.n-input-group:not(:first-child) { margin-top: 5px; }`.

## Logic / Algorithm
The conversion is implemented in `integer-base-converter.model.ts` as `convertBase({ value, fromBase, toBase })` using `BigInt` arithmetic so the tool handles arbitrarily large integers (e.g., a 128-bit value).

Steps:
1. Build the digit alphabet:
   ```
   range = '0123456789abcdef…XYZ+/'.split('')
   fromRange = range.slice(0, fromBase)
   toRange = range.slice(0, toBase)
   ```
2. Convert input to a `bigint` decimal value by reversing the input string and reducing:
   ```
   decValue = sum( index_of_digit_in_fromRange * fromBase^position )
   ```
   If a digit is not in `fromRange`, throw `Invalid digit "<d>" for base <fromBase>.`
3. Repeatedly divide by `toBase`, prepending the remainder (looked up in `toRange`) to build the output string.
4. If the resulting string is empty (input was zero), return `'0'`.

The Vue component wraps the call in `errorlessConvert` so failures yield an empty string instead of crashing the row, while a parallel `error` computed property keeps the original error message for the alert.

Note: there is no negative number, fractional, or sign handling — only non-negative integers represented as digit strings within the bounded alphabet.

## Dependencies
- `@vicons/tabler` (icon `ArrowsLeftRight`).
- Naive UI: `n-input-number`, `n-form-item`, `n-input-group`, `n-input-group-label`, `n-alert`, `n-divider`.
- Local: `InputCopyable.vue`, `c-card`, `c-input-text`, `@/utils/error.getErrorMessageIfThrows`.
- Native `BigInt` (no math library required).

## Edge Cases & Validation
- Empty input: `convertBase('', …)` returns `'0'` (the reducer never iterates, decValue is `0n`).
- Digit not in source alphabet: throws `Invalid digit "<digit>" for base <fromBase>.` — the error appears in `n-alert`; all output rows display empty strings.
- Mixed case matters: `A` belongs to base 37+ only; `a` belongs to base 11+. Using `A` with a base ≤ 36 will be flagged invalid because `range.slice(0, 36)` stops at `z`.
- Very large numbers: supported via `BigInt`; tests confirm 128-bit IPv6-style integers (e.g., `42540766411283223938465490632011909384`).
- `inputBase` or `outputBase` outside 2-64: the `n-input-number` clamps to `[2, 64]`.
- Hexadecimal output is lowercase by design (the alphabet uses lowercase a-f); callers needing uppercase (such as `ipv4-address-converter`) call `.toUpperCase()` themselves.

## Examples
- `convertBase({ value: '10100101', fromBase: 2, toBase: 16 })` returns `'a5'`.
- `convertBase({ value: '192654', fromBase: 10, toBase: 8 })` returns `'570216'`.
- `convertBase({ value: 'zz', fromBase: 64, toBase: 10 })` returns `'2275'`.
- `convertBase({ value: '42540766411283223938465490632011909384', fromBase: 10, toBase: 16 })` returns `'20010db8000085a300000000ac1f8908'`.
- UI default: input `42` in base 10 yields binary `101010`, octal `52`, hex `2a`, base64 `g`, base 42 → `10`.

## File Structure
- `index.ts` — Tool metadata and route registration via `defineTool`.
- `integer-base-converter.vue` — Single-page UI: input field, base selector, fixed rows (binary/octal/decimal/hex/base64), custom-base row.
- `integer-base-converter.model.ts` — Pure `convertBase` function operating on `BigInt`.
- `integer-base-converter.model.test.ts` — Vitest unit tests covering small and 128-bit conversions across bases.

## Notes
- No persistence: the input and bases are component-local `ref`s, lost on reload.
- The tool's exported `convertBase` is reused by `ipv4-address-converter` and `ipv4-range-expander` (for IP-to-binary/decimal/hex conversions).
- i18n: title and description come from `tools.base-converter.title/description` in `locales/en.yml`. Other UI strings (labels, placeholders, alerts) are hard-coded English.
- Accessibility: relies on Naive UI's built-in label-for behavior; no special ARIA additions.
