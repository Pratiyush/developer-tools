# YAML prettify and format

## Overview
- **Path:** `/yaml-prettify`  *(folder is named `yaml-viewer` but the URL is `/yaml-prettify`)*
- **Category:** Development
- **Description:** Prettify your YAML string into a friendly, human-readable format.
- **Keywords:** `yaml`, `viewer`, `prettify`, `format`
- **Redirect from:** None
- **Icon:** `AlignJustified` (from `@vicons/tabler`)
- **Created:** 2024-01-31

## Purpose
Re-emits a YAML document with consistent formatting: configurable indent width and an optional alphabetical sort of map keys. Useful for canonicalizing YAML files before committing to version control, for diffing two near-identical YAMLs that differ only in whitespace, or for stabilizing a file whose author used inconsistent indent widths.

## Inputs
| Field | Type | Default | Validation |
|-------|------|---------|------------|
| `rawYaml` | `string` (multiline `c-input-text`, 20 rows) | `''` (persisted via `useStorage` key `yaml-prettify:raw-yaml`) | Validated by `(v) => v === '' || yaml.parse(v)` — empty is valid; parse errors trigger `"Provided YAML is not valid."` |
| `indentSize` | `number` (n-input-number) | `2` (persisted via `useStorage` key `yaml-prettify:indent-size`) | `min=1`, `max=10` (note: minimum 1, unlike xml-formatter's 0) |
| `sortKeys` | `boolean` (n-switch) | `false` (persisted via `useStorage` key `yaml-prettify:sort-keys`) | — |

## Outputs
| Output | Type | Description |
|--------|------|-------------|
| `cleanYaml` | `string` | Prettified YAML, displayed in a `TextareaCopyable` with YAML syntax highlighting and a copy button; the output textarea matches the input height via `:follow-height-of="inputElement"` |

## UI / Components
- A centered top control row (`max-width: 600px`) with two `n-form-item`s side by side:
  - "Sort keys :" — `n-switch` for alphabetical sort.
  - "Indent size :" — `n-input-number` (`min=1`, `max=10`, `width: 100px`).
- An input `n-form-item` "Your raw YAML" with the `c-input-text` (multiline, monospace, autocomplete/autocorrect/autocapitalize/spellcheck all off, 20 rows) and live validation feedback (`:feedback`, `:validation-status`).
- An output `n-form-item` "Prettified version of your YAML" with `<TextareaCopyable :value="cleanYaml" language="yaml" :follow-height-of="inputElement" />`.
- A `<style>` block defines `.result-card` with relative position and an absolute-positioned `.copy-button` at top-right, although the class isn't applied in the visible template (vestigial?).

## Logic / Algorithm
1. State is set up with `useStorage` for all three persisted fields.
2. `cleanYaml` is a `computed` that calls `formatYaml({ rawYaml, indentSize, sortKeys })` inside `withDefaultOnError(..., '')`.
3. `formatYaml` (in `yaml-models.ts`):
   - `yaml.parse(get(rawYaml))` — first parses the input. If invalid, throws (caught by `withDefaultOnError`).
   - `yaml.stringify(parsedYaml, { sortMapEntries: get(sortKeys), indent: get(indentSize) })` — re-serializes. `sortMapEntries: true` sorts map keys alphabetically (recursively); `indent` controls how nested maps and sequences are indented.
4. Validation runs independently via `useValidation`:
   - The rule is `(v) => v === '' || yaml.parse(v)` — empty stays valid, otherwise parse must not throw.
   - `useValidation` exposes `.message` and `.status` for the form item.

```ts
function formatYaml({ rawYaml, sortKeys = false, indentSize = 2 }) {
  const parsedYaml = yaml.parse(get(rawYaml));
  return yaml.stringify(parsedYaml, {
    sortMapEntries: get(sortKeys),
    indent: get(indentSize),
  });
}
```

## Dependencies
- `yaml` (`^2.2.1`) — `parse` and `stringify` (with `sortMapEntries` and `indent` options).
- `@vueuse/core` — `useStorage`, `MaybeRef`, `get`.
- `@/utils/defaults#withDefaultOnError` — error-safe formatting.
- `@/composable/validation#useValidation` — exposes `.message` and `.status` for live form-item feedback.
- `@/components/TextareaCopyable.vue` — output viewer with syntax highlighting + copy button.
- `@vicons/tabler#AlignJustified` — icon.

## Edge Cases & Validation
- **Empty input:** validator returns `true`; `formatYaml('')` parses to `null` and `yaml.stringify(null, ...)` returns `'null\n'`. With `withDefaultOnError`, that's fine — output shows `null`. (However, in practice users notice the literal `null` and may treat it as a quirk.)
- **Whitespace-only input:** parses to `null` → `'null\n'` output.
- **Sort keys ON:** sorts every map's keys recursively. Affects readability but not semantics.
- **Indent of 1:** valid (`min=1`); produces compact YAML like `a:\n b:\n  c: 1`.
- **Anchors and aliases:** `yaml.stringify` will preserve aliases when round-tripped through the AST, but here `parse → stringify` resolves them — the output is the dereferenced form.
- **Comments:** `yaml.parse` discards comments by default → `stringify` cannot recover them; users will see comment-free output. (Not flagged in the UI.)
- **Custom tags / schemas:** none configured — falls back to library defaults.
- **Invalid YAML:** rule fires → red feedback; `cleanYaml` is `''` thanks to `withDefaultOnError`.
- The output textarea ties its height to the input via `:follow-height-of="inputElement"`, so resizing the input grows the output.

## Examples
**Example 1 — default settings (indent 2, no sort)**
- Input:
  ```yaml
  zeta:
      one: 1
      two: 2
  alpha: x
  ```
- Output:
  ```yaml
  zeta:
    one: 1
    two: 2
  alpha: x
  ```

**Example 2 — sortKeys ON**
- Input: same as above
- Output:
  ```yaml
  alpha: x
  zeta:
    one: 1
    two: 2
  ```

**Example 3 — invalid input**
- Input: `foo: : bar`
- Output: `''` and the error feedback `"Provided YAML is not valid."`.

## File Structure
| File | Purpose |
|------|---------|
| `index.ts` | Tool metadata: name from `tools.yaml-prettify.title`, path `/yaml-prettify`, keywords `['yaml', 'viewer', 'prettify', 'format']`, icon `AlignJustified`. |
| `yaml-viewer.vue` | View component: state, computed, validation, layout. |
| `yaml-models.ts` | `formatYaml` function — pure parse-then-stringify wrapper around the `yaml` library. |

## Notes
- **i18n:** title/description from `tools.yaml-prettify.title` / `.description`. Other UI strings are hard-coded English.
- **Persistence:** all three inputs (`rawYaml`, `indentSize`, `sortKeys`) persist via `localStorage`.
- **Naming inconsistency:** the folder is `yaml-viewer`, the file is `yaml-viewer.vue`, the helper is `yaml-models.ts`, but the URL path and i18n key are both `yaml-prettify`. The tool was likely renamed at some point.
- **Vestigial CSS:** `.result-card` / `.copy-button` selectors in the scoped style block are not used by the current template.
- **Accessibility:** validation status is exposed through Naive UI form-item feedback. The output `TextareaCopyable` has a built-in copy button.
- **No tests** committed for this tool (no `.test.ts` or `.spec.ts`).
