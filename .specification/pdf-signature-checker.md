# PDF signature checker

## Overview
- **Path:** `/pdf-signature-checker`
- **Category:** Crypto
- **Description:** Verify the signatures of a PDF file. A signed PDF file contains one or more signatures that may be used to determine whether the contents of the file have been altered since the file was signed.
- **Keywords:** pdf, signature, checker, verify, validate, sign
- **Redirect from:** (none)
- **Created at:** 2023-12-09
- **Icon:** `mdi/file-certificate-outline` (via `~icons/mdi/file-certificate-outline`)

## Purpose
Allows the user to upload a (typically digitally-signed) PDF file and inspect the signatures embedded inside it. For each signature, the tool extracts and renders the X.509 certificate chain, including the issuer details, the subject (issued to), validity period, and the raw PEM certificate. Useful for verifying signed contracts, invoices, government forms, or any PDF that needs proof-of-origin / proof-of-integrity validation. The PDF is parsed client-side; nothing is uploaded to a server.

## Inputs
| Name | Type | Default | Validation |
| --- | --- | --- | --- |
| `file` (uploaded PDF) | `File \| null` | `null` | Accept attribute restricted to `.pdf`; underlying `verifyPDF` throws if the file is not a parseable PDF or contains no signatures |

The upload uses a `<c-file-upload>`:
- `title`: `"Drag and drop a PDF file here, or click to select a file"`
- `accept`: `".pdf"`
- Emits `@file-upload` with the chosen `File` object.

Internal state:
| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `signatures` | `SignatureInfo[]` | `[]` | Parsed signatures from the PDF |
| `status` | `'idle' \| 'loading' \| 'parsed' \| 'error'` | `'idle'` | Drives conditional rendering |
| `file` | `File \| null` | `null` | The most recently uploaded PDF, used to render its name and size |

## Outputs
For each parsed signature, the tool renders a `pdf-signature-details` card showing a `c-table` of certificates with these columns (per `tableHeaders`):
- **Validity period** — `notBefore` / `notAfter` (`Date` strings localized via `toLocaleString()`).
- **Issued by** — Common name, Organization name, Country name, Locality name, Organizational unit name, State or province name.
- **Issued to** — Same fields as Issued by.
- **PEM certificate** — Triggered via a `c-modal-value` button labeled "View PEM cert" that opens a modal showing the full PEM text (`break-all text-xs`).

The shape of `SignatureInfo` (from `pdf-signature-checker.types.ts`):
```ts
interface SignatureInfo {
  verified: boolean
  authenticity: boolean
  integrity: boolean
  expired: boolean
  meta: {
    certs: {
      clientCertificate?: boolean
      issuedBy: {
        commonName: string
        organizationalUnitName?: string
        organizationName: string
        countryName?: string
        localityName?: string
        stateOrProvinceName?: string
      }
      issuedTo: {
        commonName: string
        serialNumber?: string
        organizationalUnitName?: string
        organizationName: string
        countryName?: string
        localityName?: string
        stateOrProvinceName?: string
      }
      validityPeriod: {
        notBefore: string
        notAfter: string
      }
      pemCertificate: string
    }[]
    signatureMeta: {
      reason: string
      contactInfo: string | null
      location: string
      name: string | null
    }
  }
}
```

(Note: although the type carries `verified`, `authenticity`, `integrity`, `expired`, and `signatureMeta` fields, the current UI does not surface them — only the `meta.certs` array is rendered.)

## UI / Components
**Top section** (`max-width: 600px`, centered):
- `<c-file-upload>` for drag/drop or click upload.
- After a file has been chosen, a `<c-card>` shows the file's name (bold) and humanized size via `formatBytes(file.size)`.
- If `status === 'error'`, a `<c-alert>` appears: `"No signatures found in the provided file."`

**Bottom section** (full-width, shown when `status === 'parsed' && signatures.length > 0`):
- Heading per signature: `"Signature {N} certificates :"` (1-indexed).
- `<pdf-signature-details>` (in `components/`) renders a `<c-table>`:
  - One row per certificate in the chain.
  - Custom slot templates:
    - `#validityPeriod` — `c-key-value-list` with "Not before" / "Not after".
    - `#issuedBy` — `c-key-value-list` of the six fields listed above.
    - `#issuedTo` — `c-key-value-list` of the same six fields (no `serialNumber` shown despite the type allowing it).
    - `#pemCertificate` — `c-modal-value` (button "View PEM cert") opening a modal that renders the PEM in monospace `text-xs break-all`.

## Logic / Algorithm
The component is small; the heavy lifting is in `pdf-signature-reader`:

```ts
async function onVerifyClicked(uploadedFile: File) {
  file.value = uploadedFile;
  const fileBuffer = await uploadedFile.arrayBuffer();

  status.value = 'loading';
  try {
    const { signatures: parsedSignatures } = verifyPDF(fileBuffer);
    signatures.value = parsedSignatures;
    status.value = 'parsed';
  }
  catch (e) {
    signatures.value = [];
    status.value = 'error';
  }
}
```

Step by step:
1. User drops or selects a `.pdf` file.
2. The handler stores the `File` and reads it as an `ArrayBuffer`.
3. Sets `status = 'loading'`.
4. Calls `verifyPDF(fileBuffer)` (default export of `pdf-signature-reader`). This returns `{ signatures: SignatureInfo[] }` or throws.
5. On success, populates `signatures` and transitions to `'parsed'`.
6. On exception (no signatures, malformed PDF, etc.), clears `signatures` and transitions to `'error'`.

In `<pdf-signature-details>`:
1. The list of certificates per signature is mapped to add a `certificateName: 'Certificate N'` and to convert ISO `notBefore`/`notAfter` strings to localized strings via `new Date(...).toLocaleString()`.
2. The mapped array is bound to `<c-table :data="certs" :headers="tableHeaders">`.

`pdf-signature-reader` itself parses the PDF object stream, locates `/Type /Sig` dictionaries, extracts `/Contents` (the PKCS#7 / CMS signature), and decodes the embedded X.509 certificate chain — emitting structured info and verification flags.

## Dependencies
| Library | Purpose | Notes |
| --- | --- | --- |
| `pdf-signature-reader` | Parses PDF, extracts signatures + certificate chain, returns `{ signatures: SignatureInfo[] }` | Default export `verifyPDF(buffer)` — does the parse + verification |
| `vue` (`ref`, `toRefs`, `computed`) | Reactivity | |
| `@/utils/convert` (`formatBytes`) | Human-readable file size | |
| Internal `c-file-upload`, `c-card`, `c-alert`, `c-table`, `c-key-value-list`, `c-modal-value` | UI primitives | |
| `@playwright/test` (dev) | E2E test (title only) | |

## Edge Cases & Validation
- **Unsigned PDF:** `verifyPDF` typically throws; UI shows `"No signatures found in the provided file."` alert.
- **Corrupt/non-PDF file:** `verifyPDF` throws; same error path.
- **Multiple signatures:** Each gets its own block headed by `"Signature N certificates :"` and its own certificate table.
- **Long certificate chain:** Rendered as multiple rows in one table.
- **Missing optional fields** (e.g. `localityName`, `stateOrProvinceName`): `c-key-value-list` will show the label with no value (likely an empty cell) — graceful degradation depends on the component.
- **PEM with newlines:** Rendered with `break-all text-xs` inside the modal — wraps long base64 segments.
- **Verified / authenticity / integrity / expired flags:** Not currently displayed by the UI even though the data is available in the parsed output.
- **`signatureMeta` (reason, contact info, location, name):** Also parsed but not displayed.
- **Large PDF files:** Loaded entirely into memory via `arrayBuffer()`; very large PDFs may stress the browser.
- **No reset between uploads:** Uploading a new file replaces `file` and re-runs the parser; `status` transitions through `loading` → `parsed`/`error` correctly.
- **Status `'idle'` and `'loading'`:** Neither has a dedicated UI element; the user sees no progress indicator while parsing.

## Examples
**Example 1 — Single-signature PDF:**
- User uploads `signed.pdf`.
- File card shows `signed.pdf  123 KB`.
- `Signature 1 certificates :` heading renders.
- A 2-row table appears: row 1 the leaf cert (subject = signer), row 2 the intermediate or root CA. Each row exposes "View PEM cert" button.

**Example 2 — Unsigned PDF:**
- File card displays the file name/size.
- Alert: `"No signatures found in the provided file."`.

**Example 3 — Multi-signature workflow PDF** (e.g. signed by both a worker and a manager):
- Two `Signature N certificates :` headings.
- Each shows its own certificate chain.

## File Structure
```
pdf-signature-checker/
├── index.ts                           # Tool metadata (icon: mdi/file-certificate-outline, createdAt 2023-12-09)
├── pdf-signature-checker.vue          # Main component: file upload + state machine + render signatures
├── pdf-signature-checker.types.ts     # SignatureInfo TypeScript interface
├── pdf-signature-checker.e2e.spec.ts  # Playwright E2E test (page title only)
└── components/
    └── pdf-signature-details.vue      # Subcomponent: renders one signature's certificate table
```

## Notes
- **i18n:** `name` and `description` come from `translate('tools.pdf-signature-checker.title' / '.description')`. UI strings (file upload title, error alert text, table headers, "View PEM cert" button) are hard-coded English.
- **Fully client-side** — the PDF buffer never leaves the browser.
- **No persistence** between sessions.
- **E2E coverage is minimal** — only verifies the page title; no fixture PDF is uploaded.
- **Latent fields not surfaced:** `verified`, `authenticity`, `integrity`, `expired` booleans and `signatureMeta` (reason, contactInfo, location, name) are parsed but never rendered. Could be a useful future improvement to show a green/red badge per signature based on `verified`.
- **Memory:** The whole PDF is loaded as an `ArrayBuffer`. For very large files this may be slow.
- **Error UX:** All error states collapse into one alert message. Distinguishing "not a PDF" from "PDF without signatures" would be nicer.
- The `c-table` slot pattern is the only somewhat unusual structure in this tool — using header-keyed named slots instead of column components.
