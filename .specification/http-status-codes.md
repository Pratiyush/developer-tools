# HTTP status codes

## Overview
- **Path:** `/http-status-codes`
- **Category:** Web
- **Description:** The list of all HTTP status codes, their name, and their meaning.
- **Keywords:** `http`, `status`, `codes`, plus every individual code (`100`, `101`, …) and code name (`Continue`, `Switching Protocols`, …) generated dynamically from the constants file.
- **Redirect from:** none
- **Icon:** `HttpRound` (from `@vicons/material`)
- **Created:** `2023-04-13`

## Purpose
A searchable, categorised reference of HTTP and WebDAV status codes. Each entry shows the numeric code, the standard name, a one-sentence description, and (for WebDAV codes) a tag indicating it applies to WebDAV. The page supports fuzzy search across codes/names/descriptions and falls back to the full categorised listing when the search is empty.

## Inputs

| Field | Type | Default | Validation |
|---|---|---|---|
| `search` | string | `''` | Free text. Drives a Fuse.js fuzzy search over the entire dataset; `autofocus`, `raw-text`, single-line. |

## Outputs

| Field | Type | Description |
|---|---|---|
| `codesByCategoryFiltered` | array of `{ category, codes }` | When `search` is empty, equal to the static `codesByCategories` list. Otherwise a single synthetic group `{ category: 'Search results', codes: searchResult.value }` from the fuzzy search. |
| Each `code` row | object | `{ code: number, name: string, description: string, type: 'HTTP' \| 'WebDav' }` (with `category` injected for the search index). |

The full reference contains the categories:
- `1xx informational response` — 100, 101, 102 (WebDAV), 103
- `2xx success` — 200, 201, 202, 203, 204, 205, 206, 207 (WebDAV), 208 (WebDAV), 226
- `3xx redirection` — 300, 301, 302, 303, 304, 305, 306, 307, 308
- `4xx client error` — 400, 401, 402, 403, 404, 405, 406, 407, 408, 409, 410, 411, 412, 413, 414, 415, 416, 417, 418, 421, 422, 423, 424, 425, 426, 428, 429, 431, 451
- `5xx server error` — 500, 501, 502, 503, 504, 505, 506, 507, 508, 510, 511

(See `http-status-codes.constants.ts` for full descriptions and exact strings.)

## UI / Components
- Top: `<c-input-text>` placeholder "Search http status...", `autofocus`, `raw-text`, `mb-10`.
- For each `{ category, codes }` in `codesByCategoryFiltered`:
  - Heading row (text-xl) with the category name.
  - One `<c-card>` per code displaying:
    - `text-lg font-bold`: `{{ code }} {{ name }}` (e.g. `200 OK`)
    - `op-70` description text. If `type !== 'HTTP'`, append `For WebDav.` (currently the only non-HTTP type).
- Cards are `mb-2`; categories are `mb-8`.

## Logic / Algorithm
1. `codesByCategories` is exported as a flat array of `{ category, codes[] }` (see Inputs/Outputs above).
2. The Vue component flattens it for the search index, injecting `category` into each row:
   ```ts
   data: codesByCategories.flatMap(({ codes, category }) =>
     codes.map(code => ({ ...code, category })),
   )
   ```
3. `useFuzzySearch` (project composable wrapping Fuse.js) is configured with weighted keys:
   ```ts
   options: {
     keys: [
       { name: 'code', weight: 3 },
       { name: 'name', weight: 2 },
       'description',
       'category',
     ],
   }
   ```
   So an exact code is the strongest signal, followed by name, then description and category.
4. `codesByCategoryFiltered = computed(() => search === '' ? codesByCategories : [{ category: 'Search results', codes: searchResult.value }])`.
5. **Keywords for tool registration** are dynamically derived: every `String(code)` and `name` in the dataset is concatenated into the `keywords` array, so the global tool-search picks up any code/name as a route hint:
   ```ts
   keywords: [
     'http', 'status', 'codes',
     ...codesByCategories.flatMap(({ codes }) =>
       codes.flatMap(({ code, name }) => [String(code), name])
     ),
   ]
   ```

## Dependencies
- `fuse.js` (via `@/composable/fuzzySearch`) — fuzzy matching.
- `@vicons/material` — `HttpRound` icon.
- Project wrappers: `c-card`, `c-input-text`.
- `@playwright/test` — for the e2e spec.

## Edge Cases & Validation
- **Empty search**: shows the entire categorised dataset (5 categories).
- **No matches**: the "Search results" group is rendered with zero cards (just a heading).
- **Case insensitivity**: Fuse.js by default lower-cases inputs; works on names like `"Not Found"` regardless of case.
- **Numeric search**: typing `404` matches code `404` directly thanks to the weighted `code` key.
- **Type rendering**: only `'HTTP'` and `'WebDav'` types exist; the suffix logic appends `For WebDav.` only when not `'HTTP'`.

## Examples

**Search `404`**
- "Search results" group → one card: `404 Not Found` — `The requested resource could not be found but may be available in the future.`

**Search `teapot`**
- One card: `418 I'm a teapot` — `The server refuses the attempt to brew coffee with a teapot.`

**Search `webdav`**
- Several cards: `102 Processing`, `207 Multi-Status`, `208 Already Reported`, each appended with `For WebDav.`

**Empty search**
- Five sections rendered in order: `1xx informational response`, `2xx success`, `3xx redirection`, `4xx client error`, `5xx server error`.

## File Structure
| File | Purpose |
|---|---|
| `index.ts` | Tool registration: dynamic keywords expansion (every code + name), name, path `/http-status-codes`, lazy-loads the Vue component, `createdAt: 2023-04-13`. |
| `http-status-codes.vue` | Page-level component: search input, fuzzy filter, render of grouped cards. |
| `http-status-codes.constants.ts` | The static dataset: `codesByCategories: { category: string, codes: { code, name, description, type: 'HTTP' \| 'WebDav' }[] }[]`. |
| `http-status-codes.e2e.spec.ts` | Playwright e2e: ensures the page title is `HTTP status codes - IT Tools`. |

## Notes
- **No persistence** of the search query.
- **i18n** — title and description from `tools.http-status-codes.*`; the dataset (descriptions) is **English only**.
- The tool participates in the IT-Tools global "tool search" via the dynamically expanded `keywords`, so navigating to e.g. `404 Not Found` from the home search bar lands here.
- Despite the name, this includes both HTTP and a few WebDAV codes (RFC 4918/5842). The tag in each card distinguishes them.
- No copy buttons — content is read-only browseable text.
