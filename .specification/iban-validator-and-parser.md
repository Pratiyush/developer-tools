# IBAN validator and parser

## Overview
- **Path:** `/iban-validator-and-parser`
- **Category:** Data
- **Description:** Validate and parse IBAN numbers. Check if an IBAN is valid and get the country, BBAN, if it is a QR-IBAN and the IBAN friendly format.
- **Keywords:** `iban`, `validator`, `and`, `parser`, `bic`, `bank`
- **Redirect from:** none
- **Icon:** `Bank` (from `~icons/mdi/bank`)
- **Created:** `2023-08-26`

## Purpose
Lets users paste an IBAN (with arbitrary spaces / dashes) and get an immediate validity verdict, a list of friendly error messages if it is invalid, the parsed country code and BBAN, a QR-IBAN check (Switzerland-specific), and a "friendly format" rendering (groups of four). Useful for sanity-checking bank account numbers in support tickets, payment forms, ETL pipelines, or while writing test fixtures.

## Inputs

| Field | Type | Default | Validation / Normalisation |
|---|---|---|---|
| `rawIban` | string | `''` | Free text input. Before processing, the tool normalises: `.toUpperCase().replace(/\s/g, '').replace(/-/g, '')`. Empty after normalisation → no info card is shown. Has `test-id="iban-input"` for e2e tests. |

## Outputs

When `rawIban` is non-empty, a `c-key-value-list` is rendered with these items:

| Label | Type | Description |
|---|---|---|
| `Is IBAN valid ?` | boolean | `validateIBAN(iban).valid`. Always shown. |
| `IBAN errors` | string[] (optional) | `getFriendlyErrors(errorCodes)` — friendly messages mapped from `ValidationErrorsIBAN` codes. Hidden when there are no errors (`hideOnNil: true`). |
| `Is IBAN a QR-IBAN ?` | boolean | `isQRIBAN(iban)`. Always shown. |
| `Country code` | string | `extractIBAN(iban).countryCode` (e.g. `DE`, `FR`). Shows `N/A` when not extractable. |
| `BBAN` | string | `extractIBAN(iban).bban` — the Basic Bank Account Number (the part after the country code + check digits). |
| `IBAN friendly format` | string | `friendlyFormatIBAN(iban)` — splits the IBAN into 4-character groups separated by spaces. |

A static **"Valid IBAN examples"** card is always rendered below the result, listing three known-good IBANs:
- `FR7630006000011234567890189`
- `DE89370400440532013000`
- `GB29NWBK60161331926819`

Each example is shown as a `c-text-copyable` whose `value` is the canonical (no-space) IBAN and whose displayed value is the friendly-formatted version.

## UI / Components
- `<c-input-text v-model:value="rawIban">` with placeholder "Enter an IBAN to check for validity..." and `test-id="iban-input"`.
- Conditional `<c-card>` (only when `ibanInfo.length > 0`) containing the `<c-key-value-list :items="ibanInfo">` (with `data-test-id="iban-info"`).
- Static `<c-card title="Valid IBAN examples">` with three `<c-text-copyable>` rows, each `font-mono`.

## Logic / Algorithm
1. **Normalisation** (in the `ibanInfo` `computed`):
   ```ts
   const iban = rawIban.value.toUpperCase().replace(/\s/g, '').replace(/-/g, '');
   ```
2. **Validation** via `validateIBAN(iban)` from `ibantools` returns `{ valid: boolean, errorCodes: ValidationErrorsIBAN[] }`. The error codes used by this tool are mapped in `iban-validator-and-parser.service.ts`:
   ```ts
   const ibanErrorToMessage = {
     [ValidationErrorsIBAN.NoIBANProvided]: 'No IBAN provided',
     [ValidationErrorsIBAN.NoIBANCountry]: 'No IBAN country',
     [ValidationErrorsIBAN.WrongBBANLength]: 'Wrong BBAN length',
     [ValidationErrorsIBAN.WrongBBANFormat]: 'Wrong BBAN format',
     [ValidationErrorsIBAN.ChecksumNotNumber]: 'Checksum is not a number',
     [ValidationErrorsIBAN.WrongIBANChecksum]: 'Wrong IBAN checksum',
     [ValidationErrorsIBAN.WrongAccountBankBranchChecksum]: 'Wrong account bank branch checksum',
     [ValidationErrorsIBAN.QRIBANNotAllowed]: 'QR-IBAN not allowed',
   };
   ```
   Unknown error codes are filtered out (`.filter(Boolean)`).
3. **Extraction** via `extractIBAN(iban)` — returns `{ countryCode, countryName, bban, valid }`; the tool reads `countryCode` and `bban`. If absent, `c-key-value-list` renders `N/A`.
4. **QR-IBAN detection** via `isQRIBAN(iban)` — applies to Swiss IBANs whose internal QR-IID is in the special range.
5. **Friendly format** via `friendlyFormatIBAN(iban)` — groups in fours: `DE89 3704 0044 0532 0130 00`.
6. The whole thing is wrapped in a single `computed<CKeyValueListItems>`, so it recomputes on every keystroke. Empty input short-circuits to `[]` (no card rendered).

## Dependencies
- `ibantools` — `extractIBAN`, `friendlyFormatIBAN`, `isQRIBAN`, `validateIBAN`, `ValidationErrorsIBAN` enum.
- Project: `c-input-text`, `c-card`, `c-key-value-list`, `c-text-copyable` (and types `CKeyValueListItems`).
- `@playwright/test` for the e2e spec.

## Edge Cases & Validation
- **Empty input** → no info card; only the examples card is shown.
- **Lower-case + spaces + dashes** → all stripped/upper-cased before validation.
- **Wrong checksum** → `Is IBAN valid ?: No`, `IBAN errors: Wrong account bank branch checksum, Wrong IBAN checksum`.
- **Unknown country** → `Country code: N/A`, `BBAN: N/A`, errors include "No IBAN country".
- **Non-Swiss IBAN** → `Is IBAN a QR-IBAN ?: No`.
- **Swiss QR-IBAN** → `Yes`. The `QRIBANNotAllowed` error code corresponds to a context where QR-IBANs are forbidden by the validator (currently only used if explicitly configured — `validateIBAN(iban)` without options does not set it).
- **Friendly format** still runs on invalid input (purely string manipulation), so users always see the grouped rendering.
- **No max length** check; very long pasted text is normalised then validated and rejected with `Wrong BBAN length`.

### Tested e2e behaviour (`iban-validator-and-parser.e2e.spec.ts`)
- Title `IBAN validator and parser - IT Tools`.
- Valid German IBAN `DE89370400440532013000`:
  - `Is IBAN valid ?` → `Yes`
  - `Is IBAN a QR-IBAN ?` → `No`
  - `Country code` → `DE`
  - `BBAN` → `370400440532013000`
  - `IBAN friendly format` → `DE89 3704 0044 0532 0130 00`
- Invalid French IBAN `FR7630006060011234567890189`:
  - `Is IBAN valid ?` → `No`
  - `IBAN errors` → `Wrong account bank branch checksum Wrong IBAN checksum`
  - `Is IBAN a QR-IBAN ?` → `No`
  - `Country code` → `N/A`
  - `BBAN` → `N/A`
  - `IBAN friendly format` → `FR76 3000 6060 0112 3456 7890 189`

## Examples

**Valid German**
- Input: `de89 3704 0044 0532 0130 00`
- After normalisation: `DE89370400440532013000`
- `Is IBAN valid ?: Yes`, `Country code: DE`, `BBAN: 370400440532013000`, `Friendly: DE89 3704 0044 0532 0130 00`.

**Valid UK**
- Input: `GB29-NWBK-6016-1331-9268-19`
- Normalised: `GB29NWBK60161331926819`
- Valid; `BBAN: NWBK60161331926819`; friendly: `GB29 NWBK 6016 1331 9268 19`.

**Invalid (bad checksum)**
- Input: `FR7630006060011234567890189` → invalid; both checksum errors listed; country/BBAN show `N/A`.

## File Structure
| File | Purpose |
|---|---|
| `index.ts` | Tool registration: name, path `/iban-validator-and-parser`, keywords, lazy-loads the Vue component, `createdAt: 2023-08-26`. |
| `iban-validator-and-parser.vue` | Single component: input, computed `ibanInfo`, examples card. |
| `iban-validator-and-parser.service.ts` | `getFriendlyErrors(errorCodes: ValidationErrorsIBAN[]): string[]` mapping enum values to human-readable strings. |
| `iban-validator-and-parser.e2e.spec.ts` | Playwright e2e: title check + valid/invalid IBAN flows. |

## Notes
- **i18n** — title and description from `tools.iban-validator-and-parser.*`. Field labels and friendly error strings are **English only**.
- **No BIC validation** despite being in the keyword list — the tool currently parses only IBAN structure (the BIC is mentioned because it often co-occurs with IBANs but is a separate value).
- **No persistence**; input resets on reload.
- The "Valid IBAN examples" card uses fictional but structurally valid IBANs widely used in tutorials (notably `DE89370400440532013000`).
- Reactivity: every keystroke triggers a fresh validate/extract — `ibantools` is fully synchronous and very fast, so this is fine.
