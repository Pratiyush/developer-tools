# JSON to YAML converter

## Overview
- **Path:** `/json-to-yaml-converter`
- **Category:** Converter
- **Description:** Translated via i18n key `tools.json-to-yaml-converter.description` (e.g. "Parse and convert JSON to YAML.").
- **Keywords:** yaml, to, json
- **Redirect from:** None
- **Created at:** 2023-04-10
- **Icon:** `Braces` from `@vicons/tabler`
- **i18n:** Title and description come from `translate('tools.json-to-yaml-converter.title')` / `.description`.

## Purpose
Converts JSON input into the equivalent YAML representation. Useful for developers translating configuration files between formats (e.g. moving Docker, Kubernetes, or CI configurations from JSON to a more human-friendly YAML notation). Because parsing is done with `JSON5`, the input may include trailing commas, single quotes, comments, and unquoted keys; the result is then serialized as YAML by the `yaml` package.

## Inputs
| Name | Type | Default | Validation |
| --- | --- | --- | --- |
| Your JSON | string (multiline) | empty | Must either be empty or successfully convert to YAML. The validator runs `stringify(JSON5.parse(value))` inside `isNotThrowing`; if that throws, the message "Provided JSON is not valid." is displayed. |

## Outputs
| Name | Type | Description |
| --- | --- | --- |
| YAML from your JSON | string | YAML serialization of the parsed JSON, produced by `stringify` from the `yaml` package. Read-only, copyable, with `output-language="yaml"` so the shared component applies YAML syntax highlighting. |

## UI / Components
- Uses the shared `<format-transformer>` component (left input pane, right output pane).
- Input pane: label "Your JSON", placeholder "Paste your JSON here...".
- Output pane: label "YAML from your JSON", language `yaml`.
- Standard validation feedback is shown beneath the input.

## Logic / Algorithm
1. The Vue setup defines a `transformer(value)` function:
   ```ts
   const transformer = (value: string) =>
     withDefaultOnError(() => stringify(JSON5.parse(value)), '');
   ```
   - `JSON5.parse(value)` accepts lenient JSON and returns a JS value.
   - `stringify(...)` from the `yaml` package serializes the value as YAML 1.2 with default options.
   - `withDefaultOnError(fn, '')` ensures the output is `''` if parsing or serialization throws.
2. The `rules` array contains a single rule: `value === ''` is allowed; otherwise the validator calls `stringify(JSON5.parse(value))` wrapped in `isNotThrowing` (returns `true` if no exception is raised, `false` otherwise).
3. Whenever the input changes, the wrapped `<format-transformer>` re-runs `transformer` and updates the output.

## Dependencies
- `yaml` (^2.2.1) — provides `stringify` for YAML serialization.
- `json5` (^2.2.3) — lenient JSON parsing.
- `@/utils/boolean` (`isNotThrowing`) — small helper that runs a fn and returns a boolean.
- `@/utils/defaults` (`withDefaultOnError`) — error-swallowing fallback wrapper.
- `@/composable/validation` (`UseValidationRule` type).
- Shared `<format-transformer>` Vue component.

## Edge Cases & Validation
- **Empty input:** considered valid; output is empty.
- **Invalid JSON:** validator surfaces "Provided JSON is not valid." and output is empty.
- **JSON5 features (comments, trailing commas, single quotes, unquoted keys):** accepted because parsing uses `JSON5.parse`.
- **Top-level primitives (numbers, booleans, strings):** valid YAML scalars are produced (`42` → `42\n`, `"hi"` → `hi\n`).
- **Arrays:** become YAML block sequences with `- ` markers.
- **Objects with mixed values:** become YAML block maps and sequences using two-space indentation (the `yaml` package's default).
- **Special YAML strings (e.g. starting with `*`, `&`, `:` etc.):** `yaml.stringify` quotes them automatically.

## Examples
**Example 1 — basic mix (from the Playwright e2e test):**
```json
{"foo":"bar","list":["item",{"key":"value"}]}
```
Output:
```yaml
foo: bar
list:
  - item
  - key: value
```

**Example 2 — nested object:**
```json
{ "server": { "host": "localhost", "port": 8080, "tls": true } }
```
Output:
```yaml
server:
  host: localhost
  port: 8080
  tls: true
```

**Example 3 — array of primitives:**
```json
[1, 2, 3]
```
Output:
```yaml
- 1
- 2
- 3
```

## File Structure
- `index.ts` — Tool metadata (`defineTool`) using i18n `translate(...)` for `name` and `description`.
- `json-to-yaml.vue` — Vue 3 SFC: validation rules + transformer wrapping `<format-transformer>`.
- `json-to-yaml.e2e.spec.ts` — Playwright e2e test: navigates to `/json-to-yaml-converter`, asserts the page title and tests the conversion of `{"foo":"bar","list":["item",{"key":"value"}]}`.

## Notes
- No `useStorage` — the input is not persisted between sessions.
- The page title in tests is `"JSON to YAML converter - IT Tools"`.
- The keywords are unusually written as `['yaml', 'to', 'json']` (likely a copy-paste artefact from a yaml-to-json tool); the search ranking still surfaces the tool when users search for "yaml" or "json".
- No additional accessibility customization beyond what `<format-transformer>` provides.
