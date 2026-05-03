# JSON Diff

## Overview
- **Path:** `/json-diff`
- **Category:** Web
- **Description:** Compare two JSON objects and get the differences between them.
- **Keywords:** json, diff, compare, difference, object, data
- **Redirect from:** None
- **Icon:** `CompareArrowsRound` from `@vicons/material`
- **Created at:** 2023-04-20

## Purpose
Side-by-side textual comparison of two JSON documents that highlights additions, removals, and value changes per key/index. Unlike a generic text diff, the comparison is structural: arrays are walked by index, objects by key, and equality is checked deeply via `lodash.isEqual`. A toggle hides unchanged keys for fast review of large documents. JSON5 is accepted on input, so users can paste loose JSON (single quotes, trailing commas, comments).

## Inputs
| Name | Type | Default | Validation |
|---|---|---|---|
| `rawLeftJson` | `string` (JSON5 text) | `''` | `value === '' \|\| isNotThrowing(() => JSON5.parse(value))` — error message `Invalid JSON format`. |
| `rawRightJson` | `string` (JSON5 text) | `''` | Same as left. |
| `onlyShowDifferences` (in `DiffsViewer`) | `boolean` | `false` | UI switch only. |

Both inputs are **not persisted** — they reset on reload.

## Outputs
A `c-card` rendered by the `DiffsViewer` child component. Two cases:

1. If both parsed JSONs are deep-equal → centered muted text: `The provided JSONs are the same`.
2. Otherwise → recursive HTML tree (`<ul><li>` nesting) where each node has CSS classes corresponding to its `DifferenceStatus`:
   - `added` — green background+text (`success.colorFaded`/`success.color`).
   - `removed` — red background+text (`error.colorFaded`/`error.color`).
   - `updated` — old value (rendered red) followed by new value (rendered green) — see `ComparisonViewer`.
   - `unchanged` — default text color (`text.mutedColor`).
   - `children-updated` — wrapper status; children render with their own statuses.
3. When `onlyShowDifferences=true`, every node with `status === 'unchanged'` is filtered out at every level.

Clicking on any leaf "value" copies the JSON-stringified value to clipboard via `useCopy`.

## UI / Components
- Two `c-input-text` controls each `multiline`, `rows="20"`, `monospace`, `raw-text`, with placeholders `Paste your first JSON here...` / `Paste your JSON to compare here...` and test IDs `leftJson`/`rightJson`.
- `DiffsViewer` (`./diff-viewer/diff-viewer.vue`) below the inputs:
  - Hidden until both `leftJson` and `rightJson` are not `undefined`.
  - Top-centered switch `Only show differences` (Naive UI `n-form-item` + `n-switch`).
  - `c-card[data-test-id="diff-result"]` wrapping either the equality message or `<DiffRootViewer :diff="result" />`.
- The recursive renderer (`diff-viewer.models.tsx`) produces:
  - `DiffViewer` chooses the right sub-renderer per node.
  - `LineDiffViewer` for leaf added/removed/unchanged values.
  - `ComparisonViewer` for `updated` (renders old then new on the same `<li>`).
  - `ChildrenViewer` for `array` (`[`/`]`) and `object` (`{`/`}`) — recursively renders children, optionally with their keys.
- Scoped styles use Naive UI theme via `useAppTheme()` and `v-bind` to color status pills.

## Logic / Algorithm
**Parsing:** `withDefaultOnError(() => JSON5.parse(rawLeftJson.value), undefined)` (so an empty/invalid input yields `undefined` and the diff is hidden until both sides parse). JSON5 supports relaxed JSON syntax (comments, single quotes, trailing commas, unquoted keys).

**Diff (`json-diff.models.ts → diff(obj, newObj, { onlyShowDifferences })`):**

1. Determine the type of each side: `'array'`, `'object'`, or `'value'` via `getType` (treating `null` as a value).
2. If both are arrays → recurse via `diffArrays` (length = `max(arr.length, newArr.length)`, walk by index).
3. If both are objects → recurse via `diffObjects` (keys = union of both objects' keys).
4. Otherwise → return a single `ValueDifference` (leaf).
5. **`getStatus(value, newValue)`**:
   - `value === undefined` → `'added'` (the key only exists in the new side).
   - `newValue === undefined` → `'removed'`.
   - `_.isEqual(value, newValue)` → `'unchanged'`.
   - Both are objects or both are arrays → `'children-updated'` (further recursion will mark children).
   - Otherwise → `'updated'` (a leaf where old and new differ).
6. `onlyShowDifferences` filters at every level: any node whose `status === 'unchanged'` is dropped.

**Rendering tree:**
- `DiffViewer` short-circuits on `status === 'updated'` to render the comparison form (old red strikethrough-like + new green) regardless of underlying type.
- For `array` and `object` containers it picks the bracket pair and whether to show child keys (objects show keys, arrays do not).
- `Value` JSON-stringifies the value (`null` → literal `null`); clicking calls `useCopy({ source: formattedValue }).copy()`.

## Dependencies
- `json5` (`^2.2.3`) for parsing relaxed JSON.
- `lodash` for `_.isEqual`, `_.isArray`, `_.isObject`, `_.isUndefined`, `_.isNull`.
- `@vicons/material` `CompareArrowsRound`.
- Local: `@/composable/copy.useCopy`, `@/utils/defaults.withDefaultOnError`, `@/utils/boolean.isNotThrowing`, `@/ui/theme/themes.useAppTheme`, Naive UI primitives, `c-card`, `c-input-text`.

## Edge Cases & Validation
- Empty input on either side: validation passes but `withDefaultOnError` returns `undefined`; `DiffsViewer` is hidden until both are valid JSON.
- Invalid JSON: `c-input-text` displays "Invalid JSON format"; the same `withDefaultOnError` keeps the parsed value `undefined`.
- Type mismatch (object vs array vs primitive) at root: not deep-equal, so the root reports `status === 'updated'` and renders an old/new comparison.
- `null` is treated as a value (not a container).
- Arrays of unequal length: extra positions on the longer side appear as `added` or `removed`.
- Identical objects with reordered keys: `_.isEqual` returns true → `unchanged`.
- e2e expectations confirmed:
  - Identical → "The provided JSONs are the same".
  - Different → tree text contains `{\nfoo: "bar""buz",\nbaz: "qux",\n},`.
  - With "Only show differences" toggled → only the differing keys are emitted.

## Examples
- Left `{ a: 1, b: 2 }`, right `{ a: 1, b: 2, c: 3 }`:
  - root status `children-updated`
  - children: `a` unchanged 1=1, `b` unchanged 2=2, `c` added 3.
- Left `[1, 2]`, right `[1, 2, 3]`:
  - root array status `children-updated`
  - index 2 added with value `3`.
- Left `{"foo":"bar"}`, right `{"foo":"buz","baz":"qux"}`:
  - `foo`: status `updated` → renders `"bar"` (red) then `"buz"` (green).
  - `baz`: status `added` → renders `"qux"` in green.
- Identical content with whitespace differences (e.g. `{"foo":"bar"}` vs `{   "foo":  "bar" }`) → both parse to the same object, so the equality message is shown.

## File Structure
- `index.ts` — Metadata, `createdAt: 2023-04-20`, route `/json-diff`.
- `json-diff.vue` — Two input textareas; embeds `DiffsViewer`.
- `json-diff.types.ts` — `Difference`, `ObjectDifference`, `ArrayDifference`, `ValueDifference`, `DifferenceStatus` definitions.
- `json-diff.models.ts` — `diff` function plus internal helpers `diffObjects`, `diffArrays`, `createDifference`, `getType`, `getStatus`.
- `json-diff.models.test.ts` — Vitest tests covering object diff and array diff.
- `json-diff.e2e.spec.ts` — Playwright tests for title, equality message, difference rendering, and the "Only show differences" toggle.
- `diff-viewer/diff-viewer.vue` — Renders the toggle, equality message, or recursive tree; theme-aware styling via `useAppTheme()`.
- `diff-viewer/diff-viewer.models.tsx` — JSX renderers (`DiffRootViewer`, `DiffViewer`, `LineDiffViewer`, `ComparisonViewer`, `ChildrenViewer`, `Value`, `formatValue`).

## Notes
- Inputs not persisted (no `useStorage`).
- Click-to-copy on every leaf value — handy for grabbing only the changed sub-value.
- The TSX component file is the only `.tsx` in the tool folder; everything else is Vue/TS. This is a common Vue 3 pattern for composing recursive virtual DOM with conditional class lists.
- The "updated" branch in `DiffViewer` short-circuits even for object-vs-primitive transitions, ensuring the user sees both old and new representations side by side.
- i18n: title/description from `tools.json-diff.*`. UI labels (`Your first JSON`, switch text, equality message) are hard-coded.
