# MAC address lookup

## Overview
- **Path:** `/mac-address-lookup`
- **Category:** Network
- **Description:** Translated via i18n key `tools.mac-address-lookup.description` (e.g. "Find the vendor / manufacturer of a device by its MAC address.").
- **Keywords:** mac, address, lookup, vendor, parser, manufacturer
- **Redirect from:** None
- **Created at:** 2023-04-06
- **Icon:** `Devices` from `@vicons/tabler`
- **i18n:** Title and description come from `translate('tools.mac-address-lookup.title')` / `.description`.

## Purpose
Looks up the manufacturer / vendor of a network device given its MAC address by matching the first three bytes (the OUI — Organizationally Unique Identifier) against the IEEE-published OUI registry that ships with the `oui-data` NPM package. Useful for identifying unknown devices on a local network or annotating ARP/MAC tables.

## Inputs
| Name | Type | Default | Validation |
| --- | --- | --- | --- |
| MAC address | string | `20:37:06:12:34:56` | Must match `/^([0-9A-Fa-f]{2}[:-]){2,5}([0-9A-Fa-f]{2})$/` (the `macAddressValidationRules` regex). Allows 3 to 6 hex byte pairs separated by `:` or `-`. Larger size input (`size="large"`), clearable, autocomplete/autocorrect/autocapitalize/spellcheck all off. Validation message: "Invalid MAC address". |

The default value `20:37:06:12:34:56` belongs to a known vendor (Apple), so the lookup card shows a result on first render.

## Outputs
| Name | Type | Description |
| --- | --- | --- |
| Vendor info | string (multi-line) | The lookup string from `oui-data` for the OUI prefix. Rendered as one `<div>` per line of the value. If the OUI is not in the database, the card shows the italic gray text "Unknown vendor for this address". |

## UI / Components
- A large `<c-input-text>` at the top labelled "MAC address:" with the validation rule applied, `mb-5`.
- The static label "Vendor info:" sits above a `<c-card>` (`mb-5`):
  - When `details` is truthy: each line of the result is rendered as its own `<div>`.
  - Otherwise: italic, `op-60` text "Unknown vendor for this address".
- A centered "Copy vendor info" `<c-button>`. The button is disabled when there is no vendor result.

## Logic / Algorithm
1. The vendor key is computed from the input MAC address:
   ```ts
   const getVendorValue = (address: string) =>
     address.trim().replace(/[.:-]/g, '').toUpperCase().substring(0, 6);
   ```
   - Trim leading/trailing whitespace.
   - Strip `.`, `:`, and `-` separators.
   - Uppercase the remaining hex.
   - Take the first 6 characters (the 3-byte OUI prefix, e.g. `203706`).
2. Look up the key in the `oui-data` package (a default-exported object of `{ "<OUI prefix>": "<multi-line vendor info>" }`):
   ```ts
   const details = computed<string | undefined>(
     () => (db as Record<string, string>)[getVendorValue(macAddress.value)],
   );
   ```
3. The result is either a multi-line string (e.g. company name + address from the IEEE registry) or `undefined`.
4. The Vue template splits `details` on `\n` and renders one `<div>` per line.
5. A `useCopy({ source: () => details.value ?? '', text: 'Vendor info copied to the clipboard' })` exposes a `copy()` function bound to the Copy button.

## Dependencies
- `oui-data` (^1.0.10) — bundled IEEE OUI database (~30k entries) keyed by 6-char uppercase hex prefix. Each value is a `\n`-separated string with the company name and registered address.
- `@/utils/macAddress` (`macAddressValidationRules`) — strict MAC address regex.
- `@/composable/copy` (`useCopy`).
- Project shared `<c-input-text>`, `<c-card>`, `<c-button>`.

## Edge Cases & Validation
- **Empty input:** Validation fails (the regex requires at least three byte-pairs). `details` resolves to `undefined`, "Unknown vendor for this address" is displayed and the Copy button is disabled.
- **Invalid format (mixed separators, wrong byte counts, non-hex chars):** Validation surfaces "Invalid MAC address". Note: the `getVendorValue` lookup still runs on the raw value, so the lookup result depends on whatever the first six hex characters happen to be after the separators are stripped.
- **Unknown OUI:** The shape is structurally valid but the OUI is not in `oui-data`. Card shows "Unknown vendor for this address".
- **Lowercase input:** Normalized to uppercase before lookup.
- **Mixed separators (`.`, `:`, `-`):** All are stripped; the lookup key is always the first 3 bytes.
- **Address shorter than 3 bytes (e.g. `20:37`):** validation fails (regex requires 3+ bytes), but `getVendorValue` would still compute a shorter prefix. The lookup would return `undefined`.
- **Spaces in the address:** Trim removes only leading/trailing whitespace; spaces between bytes are *not* stripped by `getVendorValue` (only `.:-` are removed), and the validation regex does not permit spaces between bytes — so such input is rejected by validation.
- The `oui-data` payload is bundled in the JS bundle, so the lookup is fully offline / client-side.

## Examples
**Example 1 — default `20:37:06:12:34:56`:**
- Vendor key → `203706`.
- `oui-data['203706']` → multi-line Apple, Inc. registry entry.
- Card displays one line per row of the vendor info.

**Example 2 — `9C-2D-CD-AB-CD-EF`:**
- Stripped → `9C2DCD`. (Belongs to a Sercomm registration in `oui-data`, depending on database version.)

**Example 3 — `00:00:00:00:00:00`:**
- Stripped → `000000`. Vendor key for the IEEE-registered XEROX entry.

**Example 4 — Unknown OUI like `FF:FF:FF:00:00:00`:**
- Stripped → `FFFFFF`. Not in the database → card shows "Unknown vendor for this address" and the Copy button is disabled.

## File Structure
- `index.ts` — Tool metadata.
- `mac-address-lookup.vue` — Vue 3 SFC: input, vendor lookup, copy button.

## Notes
- No persistence; the input always starts at the default Apple-prefixed sample address on each visit.
- The `oui-data` package is loaded synchronously as `db` and bundled with the app; lookups never hit the network.
- The lookup happens even when the validation rule fails — i.e. the card may briefly show stale data while the user types. The Copy button is correctly disabled when there is no result.
- No tests for this tool.
- Each line in the rendered vendor info is a separate `<div>`, which may include the company's full registered postal address.
