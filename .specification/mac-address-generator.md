# MAC address generator

## Overview
- **Path:** `/mac-address-generator`
- **Category:** Network
- **Description:** Translated via i18n key `tools.mac-address-generator.description` (e.g. "Enter the quantity and prefix and generate random MAC addresses.").
- **Keywords:** mac, address, generator, random, prefix
- **Redirect from:** None
- **Created at:** 2023-11-31 (note: November has only 30 days; the `Date` constructor normalizes this to 2023-12-01)
- **Icon:** `Devices` from `@vicons/tabler`
- **i18n:** Title and description come from `translate('tools.mac-address-generator.title')` / `.description`.

## Purpose
Generates one or more random MAC addresses, optionally with a fixed OUI/vendor prefix and configurable separator and case. Useful for testing networking code, pre-seeding device databases, or generating placeholder hardware identifiers.

## Inputs
| Name | Type | Default | Validation / Range |
| --- | --- | --- | --- |
| Quantity | integer (`<n-input-number>`) | `1` | `min=1`, `max=100`. Persisted under `mac-address-generator-amount`. |
| MAC address prefix | string | `64:16:7F` | Must match `/^([0-9a-f]{2}[:\-. ]){0,5}([0-9a-f]{0,2})$/i` (the `partialMacAddressValidationRules` regex), otherwise the validation message "Invalid partial MAC address" is shown and no addresses are generated. Clearable, raw text, spellcheck off. Persisted under `mac-address-generator-prefix`. |
| Case | `'(value: string) => string'` (button group) | Uppercase | Two buttons: Uppercase (default) and Lowercase. |
| Separator | string (button group) | `:` | Options: `:` (default), `-`, `.`, None (`''`). Persisted under `mac-address-generator-separator`. |

The `useStorage` defaults are `1`, `'64:16:7F'`, and `:`.

## Outputs
| Name | Type | Description |
| --- | --- | --- |
| MAC addresses | string | Generated addresses (one per line) shown in a `<c-card>` containing `<pre>` text. The card has `data-test-id="ulids"` (a copy-paste artefact from the ULID generator). |

## UI / Components
- Vertical layout with controls and result card:
  1. Quantity row — labelled `<label>` (150px wide) + `<n-input-number>`.
  2. MAC address prefix — `<c-input-text>` with `clearable`, `label-position="left"`, `label-width="150px"`, validation rule, raw-text styling.
  3. Case — `<c-buttons-select>` between Uppercase / Lowercase.
  4. Separator — `<c-buttons-select>` between `:`, `-`, `.`, None.
- Result `<c-card>` with `data-test-id="ulids"` containing a centered `<pre>` block.
- Two centered buttons below the result card:
  - **Refresh** (`data-test-id="refresh"`) — re-rolls all addresses.
  - **Copy** — copies the multiline string via `useCopy`.

## Logic / Algorithm
The Vue component drives the generation:
```ts
const [macAddresses, refreshMacAddresses] = computedRefreshable(() => {
  if (!prefixValidation.isValid) return '';
  const ids = _.times(amount.value, () => caseTransformer.value(generateRandomMacAddress({
    prefix: macAddressPrefix.value,
    separator: separator.value,
  })));
  return ids.join('\n');
});
```

`generateRandomMacAddress` (in `mac-adress-generator.models.ts`):
```ts
function generateRandomMacAddress({
  prefix: rawPrefix = '',
  separator = ':',
  getRandomByte = () => _.random(0, 255).toString(16).padStart(2, '0'),
} = {}) {
  const prefix = splitPrefix(rawPrefix);
  const randomBytes = _.times(6 - prefix.length, getRandomByte);
  const bytes = [...prefix, ...randomBytes];
  return bytes.join(separator);
}
```

`splitPrefix(prefix)`:
```ts
function splitPrefix(prefix: string): string[] {
  const base = prefix.match(/[^0-9a-f]/i) === null
    ? prefix.match(/.{1,2}/g) ?? []
    : prefix.split(/[^0-9a-f]/i);
  return base.filter(Boolean).map(byte => byte.padStart(2, '0'));
}
```

Step-by-step:
1. **Split the prefix into bytes:**
   - If the prefix contains only hex characters, split into chunks of 2 (`prefix.match(/.{1,2}/g)`).
   - Otherwise split on any non-hex character (so `:`, `-`, `.`, space all work as delimiters).
   - Drop empty strings, then left-pad each chunk to 2 characters with `'0'` (so `'a'` becomes `'0a'`, `'1'` becomes `'01'`).
2. **Generate the missing bytes:** `_.times(6 - prefix.length, getRandomByte)`. The default `getRandomByte` returns a 2-character lowercase hex string from `_.random(0, 255)`.
3. **Concatenate** prefix bytes and random bytes (always producing 6 total).
4. **Join** them with the chosen separator (`:`, `-`, `.`, or `''`).
5. **Apply case transformer** to the joined string (`toUpperCase` or `toLowerCase`).

The component repeats this `amount.value` times and joins the resulting strings with `'\n'`. The `Refresh` button re-runs the producer to generate a fresh batch.

`usePartialMacAddressValidation` (from `@/utils/macAddress.ts`) reactively validates the prefix against the regex:
```ts
{ message: 'Invalid partial MAC address',
  validator: (value: string) => value.trim().match(/^([0-9a-f]{2}[:\-. ]){0,5}([0-9a-f]{0,2})$/i) }
```
This permits 0–6 byte pairs separated by `:`, `-`, `.`, or space, with an optional final 1- or 2-character pair. If invalid, the producer returns `''`.

## Dependencies
- `lodash` (^4.17.21) — `_.times`, `_.random`.
- `@vueuse/core` (`useStorage`).
- `@/composable/copy` (`useCopy`).
- `@/composable/computedRefreshable` — refreshable computed.
- `@/utils/macAddress` (`usePartialMacAddressValidation`, `partialMacAddressValidationRules`).
- Project shared `<c-input-text>`, `<c-buttons-select>`, `<c-button>`, `<c-card>`.
- Naive UI `<n-input-number>`.
- No locally-bundled OUI database (this is the *generator*; the *lookup* tool uses `oui-data`).

## Edge Cases & Validation
- **Empty prefix:** `splitPrefix('')` returns `[]` → 6 fully random bytes (e.g. `00:01:02:03:04:05` with the test stub). All-random MAC addresses.
- **Prefix shorter than 6 bytes:** missing bytes filled with random hex. e.g. `64:16:7F` → 3 random bytes appended.
- **Prefix with single-character chunks (`'ff:ee:a'`):** padded with leading zero → `ff:ee:0a` then random bytes.
- **Prefix containing mixed separators (`'ff-ee:aa'`):** `splitPrefix` splits on any non-hex character, so the same prefix works regardless of the separator the user typed; the *output* always uses the user-selected separator (so input `ff-ee:aa` with separator `-` yields `ff-ee-aa-...`).
- **Prefix containing a non-hex non-delimiter character (e.g. letters g–z):** the regex match treats them as delimiters, splitting around them.
- **Invalid regex match (e.g. `'g:1'`):** `usePartialMacAddressValidation` reports invalid; the output is empty.
- **Quantity `0` or negative:** clamped by `n-input-number` `min=1`. Setting a value above `100` is clamped to 100.
- **Case transformer with separator `'.'`:** the dot is unaffected (no letters), but the hex letters change.
- **Persistence:** `amount`, `prefix`, and `separator` survive across sessions; `caseTransformer` is a function and is intentionally **not** persisted (it lives in a normal `ref`).

## Examples
**Example 1 — defaults (1 address, prefix `64:16:7F`, uppercase, separator `:`)**:
```
64:16:7F:A4:9B:C2
```
(random suffix re-rolled on each Refresh)

**Example 2 — quantity 3, prefix empty, lowercase, separator `-`**:
```
8a-12-3f-9c-d4-01
ff-aa-22-3b-77-ee
01-02-03-04-05-06
```

**Example 3 — prefix `aabbccddee` (no separators), separator `.`, uppercase**:
`splitPrefix` produces `['aa', 'bb', 'cc', 'dd', 'ee']`; one random byte appended; output:
```
AA.BB.CC.DD.EE.7F
```

**Example 4 — verified by unit tests**:
- `splitPrefix('0123456')` → `['01', '23', '45', '06']` (last single nibble padded).
- `generateRandomMacAddress({ prefix: 'ff:ee:aa' })` (with deterministic stub) → `'ff:ee:aa:00:01:02'`.
- `generateRandomMacAddress({ prefix: 'ff ee:aa', separator: '-' })` → `'ff-ee-aa-00-01-02'`.

## File Structure
- `index.ts` — Tool metadata. The `createdAt` of `2023-11-31` is invalid; `new Date('2023-11-31')` parses to `2023-12-01` in JavaScript.
- `mac-address-generator.vue` — Vue 3 SFC: persisted controls, generation, copy/refresh buttons.
- `mac-adress-generator.models.ts` — `splitPrefix` and `generateRandomMacAddress`. (Note the typo: "adress" without the second 'd'.)
- `mac-adress-generator.models.test.ts` — Vitest unit tests for both functions, including edge cases for prefix splitting and various separator inputs.
- `mac-address-generator.e2e.spec.ts` — Playwright e2e: navigates to `/mac-address-generator` and asserts the page title `"MAC address generator - IT Tools"`.

## Notes
- The model file's filename has a typo: `mac-adress-generator.models.ts` (and `.test.ts`) — only one `d` instead of `mac-address`. The Vue file uses the correct spelling. Imports in the SFC reference the typo'd filename.
- The result card carries `data-test-id="ulids"` left over from the ULID generator template; it does not affect the user.
- The MAC address is a list of 6 bytes; this tool does not enforce the locally-administered (LA) or universally-administered (UA) address bit conventions or the unicast/multicast bit. The randomness covers the full 0–255 range per byte.
- `useCopy` shows a toast "MAC addresses copied to the clipboard" on successful copy.
- Page title in tests: `"MAC address generator - IT Tools"`.
