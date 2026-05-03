# List converter

## Overview
- **Path:** `/list-converter`
- **Category:** Converter
- **Description:** Translated via i18n key `tools.list-converter.description` (e.g. "Convert and format your text lists with ease.").
- **Keywords:** list, converter, sort, reverse, prefix, suffix, lowercase, truncate
- **Redirect from:** None
- **Created at:** 2023-05-07
- **Icon:** `List` from `@vicons/tabler`
- **i18n:** Title and description come from `translate('tools.list-converter.title')` / `.description`.

## Purpose
Takes a multiline list (one item per line) and reformats it according to user-selected rules: trim, deduplicate, lowercase, sort or reverse, wrap each item with a prefix/suffix, wrap the whole list with a list-level prefix/suffix, and join the items with a custom separator. Handy for going between SQL `IN (...)` lists, HTML `<ul><li>...` snippets, comma-separated CSVs, JS arrays, etc.

## Inputs
| Name | Type | Default | Validation |
| --- | --- | --- | --- |
| Your input data (textarea) | string (multiline, one item per line) | empty | None — empty input simply returns "" when no list-level prefixes are set. |
| Trim list items | boolean (switch) | `true` | Persisted in `list-converter:conversionConfig.trimItems`. |
| Remove duplicates | boolean (switch) | `true` | Persisted in `list-converter:conversionConfig.removeDuplicates`. Has data-test-id `removeDuplicates`. |
| Convert to lowercase | boolean (switch) | `false` | Persisted. |
| Keep line breaks | boolean (switch) | `false` | Persisted. When on, a `\n` is appended after the separator and after the list-prefix / before the list-suffix. |
| Sort list | `'asc' \| 'desc' \| null` (select with placeholder "Sort alphabetically") | `null` | Disabled when "Reverse list" is on. Has data-test-id `sortList`. Persisted. |
| Separator | string | `', '` | Free text. Persisted. |
| Item prefix / Item suffix | string | `''` / `''` | Free text. Each test-id `itemPrefix` / `itemSuffix`. Persisted. |
| List prefix / List suffix | string | `''` / `''` | Free text. Each test-id `listPrefix` / `listSuffix`. Persisted. |

Note: the Vue UI does **not** expose a "Reverse list" toggle, but `ConvertOptions` contains a `reverseList` boolean and the unit tests cover it. The default in storage is `false`. (Sort is disabled in the UI when `reverseList` is true; this guard exists in the template even though there is no UI to flip it.)

The full `ConvertOptions` schema (from `list-converter.types.ts`):
```ts
type SortOrder = 'asc' | 'desc' | null;
interface ConvertOptions {
  lowerCase: boolean;
  trimItems: boolean;
  itemPrefix: string;
  itemSuffix: string;
  listPrefix: string;
  listSuffix: string;
  reverseList: boolean;
  sortList: SortOrder;
  removeDuplicates: boolean;
  separator: string;
  keepLineBreaks: boolean;
}
```

All settings are persisted under the localStorage key `list-converter:conversionConfig` as a single JSON object.

## Outputs
| Name | Type | Description |
| --- | --- | --- |
| Your transformed data | string | The list reformatted per the options. Rendered through the shared `<format-transformer>` (read-only, copyable). |

## UI / Components
- A centered `<c-card>` at the top with two columns:
  - **Left column (switches):** Trim list items, Remove duplicates, Convert to lowercase, Keep line breaks. Each is an `<n-form-item>` with `label-placement="left"`, `label-width="150"`.
  - **Right column (form fields):** Sort list (`<c-select>`), Separator (`<c-input-text>`), Wrap item (two `<c-input-text>` inputs side by side), Wrap list (two `<c-input-text>` inputs side by side).
- Below the card, the shared `<format-transformer>` is rendered with input label "Your input data" and output label "Your transformed data".

## Logic / Algorithm
The transformation is implemented in `convert(list, options)` in `list-converter.models.ts`:
```ts
function convert(list: string, options: ConvertOptions): string {
  const lineBreak = options.keepLineBreaks ? '\n' : '';
  return _.chain(list)
    .thru(whenever(options.lowerCase, text => text.toLowerCase()))
    .split('\n')
    .thru(whenever(options.removeDuplicates, _.uniq))
    .thru(whenever(options.reverseList, _.reverse))
    .thru(whenever(!_.isNull(options.sortList), parts => parts.sort(byOrder({ order: options.sortList }))))
    .map(whenever(options.trimItems, _.trim))
    .without('')
    .map(p => options.itemPrefix + p + options.itemSuffix)
    .join(options.separator + lineBreak)
    .thru(text => [options.listPrefix, text, options.listSuffix].join(lineBreak))
    .value();
}
```

Step-by-step:
1. **Lowercase the entire input** (if `lowerCase` is true).
2. **Split** the string on `\n` to produce an array of items.
3. **Deduplicate** with `_.uniq` (if `removeDuplicates`).
4. **Reverse** with `_.reverse` (if `reverseList`).
5. **Sort** in ascending or descending order using `byOrder({ order })` (which calls `localeCompare`) — only when `sortList !== null`.
6. **Trim** each item with `_.trim` (if `trimItems`).
7. **Drop empty strings** via `_.without('')`.
8. **Wrap each item** with `itemPrefix` + item + `itemSuffix`.
9. **Join** with `options.separator + lineBreak`. (When `keepLineBreaks` is on, `lineBreak === '\n'`, so the separator effectively becomes `<separator>\n`.)
10. **Wrap the whole list** with `listPrefix`, joined-result, `listSuffix` — joined by `lineBreak` (so list prefix/suffix get their own lines when `keepLineBreaks` is on, otherwise they are concatenated directly).

The `whenever(condition, fn)` helper applies `fn` only when `condition` is true; otherwise it returns the value unchanged.

`byOrder` (from `@/utils/array.ts`):
```ts
function byOrder({ order }: { order: 'asc' | 'desc' | null | undefined }) {
  return (a: string, b: string) =>
    order === 'asc' ? a.localeCompare(b) : b.localeCompare(a);
}
```
Note the sort comparator treats anything other than `'asc'` (including `'desc'` and unexpected values) as descending.

## Dependencies
- `lodash` (^4.17.21) — `_.chain`, `_.uniq`, `_.reverse`, `_.trim`, `_.without`, `_.isNull`.
- `@vueuse/core` (`useStorage`) — persistence of all controls under one localStorage object.
- `@/utils/array` (`byOrder`) — locale-aware ascending/descending comparator.
- Shared `<format-transformer>` Vue component for the input/output panes.
- Naive UI form components (`n-form-item`, `n-switch`, etc.) and the project's own `<c-card>`, `<c-select>`, `<c-input-text>`.

## Edge Cases & Validation
- **Empty input:** returns `''` even with non-empty list-level prefix/suffix? No — the chain still runs: `[listPrefix, '', listSuffix].join(lineBreak)`. So if both are empty, output is `''`. With non-empty prefix/suffix and `keepLineBreaks` off, output is `listPrefix + listSuffix`. With `keepLineBreaks` on, it becomes `listPrefix + '\n' + '' + '\n' + listSuffix`. The unit test covers `convert('', defaults)` and expects `''`.
- **Whitespace-only lines:** before trim, lines like `"  "` survive deduplication; with `trimItems=true` they become `''` and are removed by `_.without('')`. Without trim, they pass through and are concatenated with their item prefix/suffix.
- **Reverse + Sort:** The order in `convert` is reverse first, then sort. Combined with the UI rule that disables the sort dropdown while `reverseList` is on, the actual user-facing behaviour is "reverse OR sort". Programmatically, both can be true and sort wins (because it runs after).
- **Duplicates after trim:** Deduplication runs **before** trim, so `"  a  "` and `"a"` are still two distinct items.
- **Sort on unequal-case strings:** `localeCompare` is used, so case-sensitivity is locale dependent (typically case-insensitive in most locales).
- **`sortList` with values other than `'asc'`:** treated as descending by `byOrder`.

## Examples
**Example 1 — default settings, list with duplicates and empty lines:**
Input:
```
1
2

3
3
4
```
Settings: `separator=', '`, `trimItems=true`, `removeDuplicates=true`, `itemPrefix='"'`, `itemSuffix='"'`, all others default.
Output:
```
"1", "2", "3", "4"
```

**Example 2 — HTML list with line breaks:**
Input:
```
1
2
3
```
Settings: `separator=''`, `itemPrefix='<li>'`, `itemSuffix='</li>'`, `listPrefix='<ul>'`, `listSuffix='</ul>'`, `keepLineBreaks=true`, `trimItems=true`.
Output:
```
<ul>
<li>1</li>
<li>2</li>
<li>3</li>
</ul>
```

**Example 3 — sort + dedup (from the Playwright test):**
Input:
```
1
2
2
4
4
3
5
```
Settings: defaults + `removeDuplicates=true`, `itemPrefix="'"`, `itemSuffix="'"`.
Output:
```
'1', '2', '4', '3', '5'
```

## File Structure
- `index.ts` — Tool metadata.
- `list-converter.vue` — Vue 3 SFC: persisted controls + transformer.
- `list-converter.models.ts` — `convert` and the `whenever` helper.
- `list-converter.types.ts` — `ConvertOptions` interface and `SortOrder` type.
- `list-converter.models.test.ts` — Vitest unit tests covering default conversion, empty input, and `keepLineBreaks` HTML formatting.
- `list-converter.e2e.spec.ts` — Playwright e2e tests covering the page title, default-settings conversion, and prefix/suffix wrapping with deduplication.

## Notes
- The entire config is stored as a single object under `list-converter:conversionConfig` in localStorage (via `useStorage`). Returning users get back their last-used preferences.
- The UI does not expose `reverseList`; that field exists in the type/storage but is effectively always `false` from the form. It is honoured by `convert` if set programmatically.
- `<format-transformer>` provides the copy button, syntax highlighting (none for this tool by default), and area-content test selectors used by the e2e tests.
- Page title in tests: `"List converter - IT Tools"`.
- The internal helper `whenever(condition, fn)` is a tiny conditional-application wrapper that keeps the lodash chain readable.
