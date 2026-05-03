# YAML to TOML

## Overview
- **Path:** `/yaml-to-toml`
- **Category:** Converter
- **Description:** Parse and convert YAML to TOML.
- **Keywords:** `yaml`, `to`, `toml`, `convert`, `transform`
- **Redirect from:** None
- **Icon:** `AlignJustified` (from `@vicons/tabler`)
- **Created:** 2023-06-23

## Purpose
Live one-way converter from YAML to TOML. Pairs with the project's other "small-format" converters (yaml↔json, json↔toml, toml↔yaml, etc.) as part of a complete matrix. Useful when migrating config files between ecosystems — for example, converting a Kubernetes-flavored YAML manifest into a `pyproject.toml`-style TOML structure for prototyping or exporting.

## Inputs
| Field | Type | Default | Validation |
|-------|------|---------|------------|
| Input YAML | `string` (multiline textarea, provided by `<format-transformer>`) | empty | Validated by `(v) => v === '' || parseYaml(v)` — empty is valid; otherwise the parser must produce a truthy value (or it implicitly throws). Error message: `"Provided JSON is not valid."` (note: the message string says "JSON" rather than "YAML" — likely a copy-paste artifact). |

No formatting options — output uses `iarna-toml-esm` defaults.

## Outputs
| Output | Type | Description |
|--------|------|-------------|
| TOML | `string` | TOML text, syntax-highlighted (`output-language="toml"`), trimmed, with a copy button (rendered by `<format-transformer>`) |

## UI / Components
A single `<format-transformer>`:
- `input-label="Your YAML"`, `input-placeholder="Paste your YAML here..."`.
- `output-label="TOML from your YAML"`, `output-language="toml"`.
- `:input-validation-rules="rules"`, `:transformer="transformer"`.

No options or toggles.

## Logic / Algorithm
1. Define a transformer:
   - If trimmed input is empty, return `''` early.
   - Otherwise compute `convertYamlToToml(value)` inside `withDefaultOnError(..., '')`.
2. `convertYamlToToml(value)`:
   - Parse with `parseYaml(value)` (no merge-key option here, unlike yaml-to-json).
   - Stringify with `iarna-toml-esm`'s `stringify(...)`.
   - Wrap in `[...].flat().join('\n').trim()` — `iarna-toml-esm` may return either a string or an iterable; `[...].flat()` normalizes both shapes, then `join('\n')` recombines lines, and `trim()` removes the trailing newline.

```ts
const convertYamlToToml = (value: string) =>
  [stringifyToml(parseYaml(value))].flat().join('\n').trim();

const transformer = (value: string) =>
  value.trim() === '' ? '' : withDefaultOnError(() => convertYamlToToml(value), '');
```

3. Validation rule:
   - `(v) => v === '' || parseYaml(v)` — returns `true` for empty input, or any truthy parse result. A `null` parse (e.g. just a comment) would technically fall through as falsy, but in practice the parse-throw path catches malformed input first.

## Dependencies
- `yaml` (`^2.2.1`) — `parse` function.
- `iarna-toml-esm` (`^3.0.5`) — ESM build of `@iarna/toml`'s `stringify` function.
- `@/utils/defaults#withDefaultOnError` — error-safe transformation (note: imported via relative path `'../../utils/defaults'` rather than the `@/` alias — different from sibling tools).
- Shared layout component `<format-transformer>`.
- `@vicons/tabler#AlignJustified` — icon.

## Edge Cases & Validation
- **Empty input:** transformer's early-return yields `''`; validator returns `true`; no error.
- **Whitespace-only input:** trimmed empty → `''`.
- **Top-level scalar** (e.g. `foo`): parses to a JS string, `iarna-toml-esm.stringify` only accepts objects → throws → caught by `withDefaultOnError`. The validation message states "Provided JSON is not valid." (label confusion).
- **Top-level array:** TOML cannot represent a top-level array; `iarna-toml-esm` will throw → empty output.
- **Nested objects:** become TOML tables (`[a]`, `[a.b]`); see e2e example.
- **Heterogeneous arrays in YAML:** `iarna-toml-esm` enforces TOML 1.0's homogeneous-array rule — mixing types throws → empty output.
- **Datetime / date-only YAML values:** turn into JS `Date` objects, which `iarna-toml-esm` serializes as TOML datetimes.
- **Special characters in keys:** TOML quoted keys are emitted automatically when needed.
- **Validation message bug:** the error string is `"Provided JSON is not valid."` instead of "YAML"; users will still see the message but the wording is incorrect.

## Examples
**Example 1 — nested tables (from e2e test)**
- Input:
  ```yaml
  foo: bar
  list:
    name: item
    another:
      key: value
      number: 1
  ```
- Output:
  ```toml
  foo = "bar"

  [list]
  name = "item"

    [list.another]
    key = "value"
    number = 1
  ```
  Note the indentation under nested tables — `iarna-toml-esm`'s default cosmetic indent.

**Example 2 — scalar list**
- Input:
  ```yaml
  fruits:
    - apple
    - banana
    - cherry
  ```
- Output:
  ```toml
  fruits = [ "apple", "banana", "cherry" ]
  ```

**Example 3 — empty input**
- Input: ``
- Output: ``

## File Structure
| File | Purpose |
|------|---------|
| `index.ts` | Tool metadata: name, path `/yaml-to-toml`, keywords `['yaml', 'to', 'toml', 'convert', 'transform']`, icon `AlignJustified`. |
| `yaml-to-toml.vue` | View component: defines transformer, validation rule, mounts `<format-transformer>`. |
| `yaml-to-toml.e2e.spec.ts` | Playwright E2E spec: page title check, nested-table conversion test. |

## Notes
- **i18n:** title/description from `tools.yaml-to-toml.title` / `.description`. Other strings are hard-coded English.
- **Persistence:** none.
- **Library import quirk:** `iarna-toml-esm` is the ESM-friendly fork of `@iarna/toml` — chosen because the original package was CommonJS and didn't tree-shake well in Vite/Rollup builds.
- **Output normalization:** `[...].flat().join('\n').trim()` is a defensive idiom that handles both array-and-string return shapes from `stringifyToml`.
- **Bugs to flag:** (1) error message says "JSON" instead of "YAML"; (2) merge keys (`<<`) are NOT enabled here, unlike in yaml-to-json — anchors will resolve but `<<: *anchor` will not.
