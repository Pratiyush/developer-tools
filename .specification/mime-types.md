# MIME types

## Overview
- **Path:** `/mime-types`
- **Category:** Web
- **Description:** Convert MIME types to file extensions and vice-versa.
- **Keywords:** mime, types, extension, content, type
- **Redirect from:** (none)
- **Created at:** (no `createdAt` set)
- **Icon:** `World` (from `@vicons/tabler`)

## Purpose
A two-way lookup tool for the relationship between MIME content types and file extensions. The user can either select a MIME type to see all extensions associated with it, or select a file extension to see its canonical MIME type. Below the two interactive lookup cards, a complete reference table lists every MIME type and all its extensions. Useful for setting `Content-Type` headers, configuring web servers, and identifying unfamiliar files.

## Inputs
| Name | Type | Default | Validation / Notes |
| --- | --- | --- | --- |
| `selectedMimeType` | string \| undefined | `undefined` | Selected from a searchable dropdown of all known MIME types; option `value` and `label` are both the MIME type string |
| `selectedExtension` | string \| undefined | `undefined` | Selected from a searchable dropdown of all known extensions; the `label` is the extension prefixed with `.` (e.g. `.pdf`), the `value` is the bare extension (`pdf`) |

Both selects use `searchable` mode so the user can type to filter.

## Outputs
| Name | Type | Description |
| --- | --- | --- |
| `extensionsFound` | `string[]` | Array of file extensions (without leading dot) associated with the chosen MIME type. Returns `[]` when nothing is selected. |
| `mimeTypeFound` | string \| `[]` | Canonical MIME type for the chosen extension. Note: when nothing is selected the code returns `[]` (an empty array), but when selected it returns the MIME type string from `mime-types`. The template only renders the value if a selection exists, masking the type quirk. |
| `mimeInfos` | `Array<{ mimeType: string; extensions: string[] }>` | The complete list, used to build the reference table. |

## UI / Components
The page is laid out vertically:

### 1. "Mime type to extension" card (`c-card`)
- Title: `<n-h2>` "Mime type to extension"
- Subtitle: "Know which file extensions are associated to a mime-type"
- `c-select` with `searchable`, options of all MIME types, placeholder `"Select your mimetype here... (ex: application/pdf)"`.
- When `extensionsFound` is non-empty:
  - Inline text: `Extensions of files with the <Tag>{{ selectedMimeType }}</Tag> mime-type:`
  - One `n-tag` per extension below (rounded, no border, `type="primary"`), each prefixed with `.`.

### 2. "File extension to mime type" card (`c-card`)
- Title: `<n-h2>` "File extension to mime type"
- Subtitle: "Know which mime type is associated to a file extension"
- `c-select` with `searchable`, options of all extensions (label `.ext`, value `ext`), placeholder `"Select your mimetype here... (ex: application/pdf)"`.
  - (Note: placeholder text is identical to the previous select — likely a copy-paste from the first card.)
- When `selectedExtension` truthy:
  - Inline text: `Mime type associated to the extension <Tag>{{ selectedExtension }}</Tag> file extension:`
  - A single `n-tag` (rounded, primary) showing `{{ mimeTypeFound }}`.

### 3. Reference table (`n-table`)
- Two-column table with headers: `Mime types`, `Extensions`.
- One row per MIME type. The "Extensions" column contains one `n-tag` per extension (rounded, no border).

## Logic / Algorithm
1. Imports two records from `mime-types`:
   - `extensions` (renamed `mimeTypeToExtension`) — `Record<mimeType, string[]>` mapping a MIME type to all file extensions.
   - `types` (renamed `extensionToMimeType`) — `Record<extension, mimeType>` mapping an extension to its canonical MIME type.

2. Builds option lists from those records:
   ```ts
   const mimeToExtensionsOptions = Object.keys(mimeTypeToExtension)
     .map(label => ({ label, value: label }));

   const extensionToMimeTypeOptions = Object.keys(extensionToMimeType)
     .map(label => ({ label: `.${label}`, value: label }));
   ```

3. Computes lookups reactively:
   ```ts
   const extensionsFound = computed(() =>
     selectedMimeType.value ? mimeTypeToExtension[selectedMimeType.value] : []
   );
   const mimeTypeFound = computed(() =>
     selectedExtension.value ? extensionToMimeType[selectedExtension.value] : []
   );
   ```

4. Builds the table data:
   ```ts
   const mimeInfos = Object.entries(mimeTypeToExtension)
     .map(([mimeType, extensions]) => ({ mimeType, extensions }));
   ```
   `mimeInfos` is *not* a computed — it's a one-shot array built at component setup. The list never changes (the `mime-types` package data is static).

## Dependencies
| Library | Purpose | Notes |
| --- | --- | --- |
| `mime-types` (npm) | Source of MIME-type / extension mappings | Provides `types` (extension → MIME) and `extensions` (MIME → extensions[]) records derived from the IANA registry |
| `naive-ui` (`n-h2`, `n-tag`, `n-table`) | UI primitives | |
| Internal `c-card`, `c-select` | Custom UI primitives | |
| `vue` (`ref`, `computed`) | Reactivity | |

## Edge Cases & Validation
- **No selection:** Both lookups return `[]` and the conditional rendering hides the result blocks. `selectedMimeType.value` and `selectedExtension.value` are `undefined` initially.
- **Unknown extensions / MIME types:** Cannot occur because both selects are populated only with values present in the `mime-types` data; the user can only pick a known value.
- **Multiple extensions for one MIME type:** Handled — `extensionsFound` is an array and renders one tag per element.
- **`mimeTypeFound` type quirk:** When nothing is selected, the computed returns `[]` rather than `undefined`/`''`. The template condition `v-if="selectedExtension"` prevents the empty array from being rendered. If the binding were ever exposed elsewhere, callers should beware.
- **Searchable select behavior:** Naive UI's `searchable` filters by substring match against the option `label`. Extension search must include the leading `.` to match the label, but the user can still type the bare extension because Naive UI's filter is fuzzy/substring against label.

## Examples
**Example 1 — MIME type to extensions**

Selecting `application/pdf` produces:
- Heading: "Extensions of files with the `application/pdf` mime-type:"
- Tag: `.pdf`

**Example 2 — Extension to MIME type**

Selecting `.json` (value `json`) produces:
- Heading: "Mime type associated to the extension `json` file extension:"
- Tag: `application/json`

**Example 3 — Multi-extension MIME type**

Selecting `image/jpeg` may produce tags: `.jpeg`, `.jpg`, `.jpe`, etc. (depending on the `mime-types` package's registered extensions for that type).

## File Structure
```
mime-types/
├── index.ts        # Tool metadata (name via translate(), keywords, World icon)
└── mime-types.vue  # Component containing both lookup cards + the full reference table
```

## Notes
- **i18n:** `name` and `description` come from `translate('tools.mime-types.title' / '.description')`. The two card titles, subtitles, placeholders, and the reference table are all hard-coded English.
- **No persistence** — selections are not saved between sessions.
- **No tests** for this tool (no `.test.ts` / `.spec.ts` / `.e2e.spec.ts`).
- The full reference table is rendered fully on initial mount — for the typical `mime-types` data set (~1000 entries) this is fine but produces a long page.
- The placeholder text on the second card mistakenly says "Select your mimetype here..." even though it's an extension selector — minor UX bug.
- Both selects use `value === undefined` initially, which Naive UI handles correctly as "no selection".
