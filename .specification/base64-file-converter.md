# Base64 File Converter

## Overview
- **Path:** `/base64-file-converter`
- **Category:** Converter
- **Description:** Convert a string, file, or image into its base64 representation.
- **Keywords:** `base64`, `converter`, `upload`, `image`, `file`, `conversion`, `web`, `data`, `format`
- **Redirect from:** None
- **Icon:** `FileDigit` (from `@vicons/tabler`)
- **i18n key:** `tools.base64-file-converter.title` / `tools.base64-file-converter.description`

## Purpose
A two-way converter for binary data. The first card takes a base64-encoded string (with or without a `data:...;base64,` prefix), validates it, lets the user preview it as an image, and downloads it as a file with a configurable filename and extension. The second card accepts an arbitrary file via drag-and-drop or file picker and returns its base64-encoded contents (with the data URL prefix included).

## Inputs

### "Base64 to file" card
| Field | Type | Default | Validation / Notes |
|-------|------|---------|--------------------|
| `fileName` | string | `'file'` | Used as the download filename. Auto-appended with `.<extension>` if not already present. |
| `fileExtension` | string | `''` | Extension shown next to the filename. Auto-populated when the input base64 begins with a recognisable signature (PDF, PNG, JPG, GIF) or with a `data:...;base64,` prefix. |
| `base64Input` | string (multiline, 5 rows) | `''` | Validated by `isValidBase64(value.trim())` from `@/utils/base64`. Invalid input shows the error "Invalid base 64 string". |

### "File to base64" card
| Field | Type | Default | Validation / Notes |
|-------|------|---------|--------------------|
| `fileInput` | `File` | `undefined` | Provided by `c-file-upload` (drag-and-drop or click-to-pick). |

## Outputs
| Field | Type | Description |
|-------|------|-------------|
| Image preview | DOM element | Rendered into `#previewContainer` when "Preview image" is clicked, capped at 100% width / 400 px height. |
| Downloaded file | binary | Triggered via a hidden `<a download>`. The file uses the user-supplied filename + extension; a MIME type is inferred when missing. |
| `fileBase64` | string (Ref) | Computed via `useBase64(fileInput)` from `@vueuse/core`. Includes the `data:<mime>;base64,` prefix. |

## UI / Components
- **Card 1 — "Base64 to file":**
  - `n-grid` (3 columns): two-column `c-input-text` for `fileName`, single-column `c-input-text` for `fileExtension`.
  - Multiline `c-input-text` (5 rows) for the base64 string with live validation.
  - `<div id="previewContainer">` for image preview.
  - Two action buttons in a flex row: "Preview image" and "Download file" — both disabled while the input is empty or invalid.
- **Card 2 — "File to base64":**
  - `c-file-upload` (drag-and-drop area + click trigger).
  - Read-only multiline `c-input-text` (5 rows) showing the encoded value.
  - "Copy" button below.

## Logic / Algorithm

### Base64 → File
1. The user pastes a base64 string into `base64Input`.
2. `useValidation` runs `isValidBase64(value.trim())` (see Dependencies / Edge Cases for what makes a valid string).
3. A watcher on `base64Input` calls `getMimeTypeFromBase64({ base64String })`. The function:
   - Looks for a `data:<mime>;base64,` prefix and uses that MIME type if present.
   - Otherwise tries to match the start of the string against well-known signatures:
     - `JVBERi0` → `application/pdf`
     - `R0lGODdh` / `R0lGODlh` → `image/gif`
     - `iVBORw0KGgo` → `image/png`
     - `/9j/` → `image/jpg`
   - If a MIME type is detected, the file extension is set via `getExtensionFromMimeType(mimeType)`.
4. **Preview image** (`previewImage()`): exits early if validation fails. Otherwise creates an `<img>` from the base64 string, caps its dimensions, and replaces the contents of `#previewContainer`.
5. **Download file** (`downloadFile()`): exits early on invalid input. Otherwise:
   - If the source already has a `data:...;base64,` prefix, it is used as the `<a href>` directly.
   - Otherwise the prefix is constructed from the user-provided extension (or `'txt'` as a default) using `getMimeTypeFromExtension()`.
   - Filename defaults to `file.<extension>`. If the user-typed name does not end with `.<extension>`, the extension is appended.

### File → Base64
1. `c-file-upload` invokes `onUpload(file)` which sets `fileInput.value`.
2. `useBase64(fileInput)` (from `@vueuse/core`) reads the `File` and exposes its base64 representation (with data URL prefix) reactively.
3. The "Copy" button uses `useCopy({ source: fileBase64, text: 'Base64 string copied to the clipboard' })` to copy the value and toast.

### Base64 validation (`isValidBase64`)
```ts
function isValidBase64(str, { makeUrlSafe = false } = {}) {
  let cleanStr = removePotentialDataAndMimePrefix(str); // strip "data:...;base64,"
  if (makeUrlSafe) cleanStr = unURI(cleanStr);
  try {
    const reEncoded = Base64.fromUint8Array(Base64.toUint8Array(cleanStr));
    return makeUrlSafe
      ? removePotentialPadding(reEncoded) === cleanStr
      : reEncoded === cleanStr.replace(/\s/g, '');
  } catch { return false; }
}
```
The check is round-trip: decode to bytes then re-encode, and require the result to match (modulo whitespace).

## Dependencies
- `js-base64` (via `@/utils/base64`) — RFC 4648 encode/decode, including URL-safe variants.
- `mime-types` (via `@/composable/downloadBase64`) — MIME ↔ extension lookup.
- `@vueuse/core`:
  - `useBase64` — converts a `File` ref to a base64 ref.
- Project composables: `useCopy`, `useValidation`, `useDownloadFileFromBase64Refs`.
- Project utilities: `getExtensionFromMimeType`, `getMimeTypeFromBase64`, `previewImageFromBase64`.
- Naive-UI: `n-grid`, `n-gi`.
- Project components: `c-card`, `c-input-text`, `c-button`, `c-file-upload`.

## Edge Cases & Validation
- Empty `base64Input` — both action buttons are disabled.
- Invalid base64 — `useValidation` flags the field; both buttons become disabled.
- Whitespace inside base64 — accepted; `isValidBase64` strips whitespace before comparison.
- `data:...;base64,` prefix — accepted both for validation and for preview/download (used directly as data URL).
- Non-image base64 with "Preview image" clicked — the `<img>` will fail to load silently (the `try/catch` swallows the error).
- Empty `base64Input` with the download flow — `downloadFromBase64` would normally throw `'Base64 string is empty'`, but the disabled-button guard prevents this in the UI.
- Unknown MIME type and missing extension — the file is downloaded as `file.txt` with a `text/plain`-style data URL prefix.
- File-to-base64 with a very large file — `useBase64` reads the entire file into memory; large files may freeze the UI or exhaust memory.

## Examples
1. **PNG round-trip**
   - Paste `iVBORw0KGgoAAAANSUhEUgAAAAUA...` — extension auto-fills to `png`. Click "Preview image" to display, "Download file" to save as `file.png`.
2. **PDF with data URL prefix**
   - Paste `data:application/pdf;base64,JVBERi0xLjQK...` — the watcher reads `application/pdf` from the prefix and sets the extension to `pdf`. Download produces a working PDF.
3. **Upload a text file** "hello.txt" containing `Hello`
   - `fileBase64` becomes `data:text/plain;base64,SGVsbG8=`.

## File Structure
| File | Description |
|------|-------------|
| `index.ts` | Tool metadata; pulls translated `name` and `description` from i18n. |
| `base64-file-converter.vue` | Single-file component with both cards (base64→file and file→base64) and all logic wiring through `@/composable/downloadBase64` and `@/utils/base64`. |

## Notes
- **No persistence** — none of the form fields are stored in `localStorage`.
- **i18n:** Title and description go through `translate('tools.base64-file-converter.title' | '.description')` (English strings shown above are from `locales/en.yml`).
- **Side-effect coupling:** `previewImageFromBase64` (in `downloadBase64.ts`) hard-codes a lookup for `document.getElementById('previewContainer')`, which is why the template includes that exact id.
- **Accessibility:** Action buttons are disabled state-aware; the file uploader exposes a full-width drop zone via the scoped `::v-deep(.n-upload-trigger)` rule.
