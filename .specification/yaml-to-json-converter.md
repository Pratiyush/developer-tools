# YAML to JSON converter

## Overview
- **Path:** `/yaml-to-json-converter`
- **Category:** Converter
- **Description:** Simply convert YAML to JSON with this online live converter.
- **Keywords:** `yaml`, `to`, `json`
- **Redirect from:** None
- **Icon:** `AlignJustified` (from `@vicons/tabler`)
- **Created:** 2023-04-10

## Purpose
Live one-way converter from YAML to JSON. Users paste a YAML document and immediately see the equivalent JSON output, with full support for YAML merge keys (`<<`) so anchors and aliases dereference correctly. Useful for working with config files (Docker Compose, GitHub Actions, Kubernetes manifests, etc.) that ship as YAML when downstream tools expect JSON, or for quickly understanding a complex YAML document by viewing it in a stricter, more familiar shape.

## Inputs
| Field | Type | Default | Validation |
|-------|------|---------|------------|
| Input YAML | `string` (multiline textarea, provided by `<format-transformer>`) | empty | Validated by `(value) => isNotThrowing(() => parseYaml(value))` — invalid YAML triggers the message `"Provided YAML is not valid."` |

No formatting options — output indentation is fixed at 3 spaces.

## Outputs
| Output | Type | Description |
|--------|------|-------------|
| JSON | `string` | Pretty-printed JSON (3-space indent), syntax-highlighted, with a copy button (rendered by `<format-transformer>`) |

## UI / Components
A single `<format-transformer>` instance:
- `input-label="Your YAML"`, `input-placeholder="Paste your yaml here..."`.
- `output-label="JSON from your YAML"`, `output-language="json"`.
- `:input-validation-rules="rules"` (the YAML parse-must-not-throw rule).
- `:transformer="transformer"`.

No additional controls (no indent setting, no toggle for merge keys, etc.).

## Logic / Algorithm
1. Define a transformer:
   - Parse with `parseYaml(value, { merge: true })` — the `merge: true` option enables YAML merge key (`<<`) resolution so anchors are inlined.
   - If the result is truthy, return `JSON.stringify(obj, null, 3)`; if falsy (e.g. `null` from empty input), return `''`.
   - Wrapped in `withDefaultOnError(..., '')` so any thrown error yields an empty string.
2. Define a validation rule:
   - `isNotThrowing(() => parseYaml(value))` — flags inputs that cause the parser to throw.
3. The `<format-transformer>` handles the rest of the UI/state.

```ts
function transformer(value: string) {
  return withDefaultOnError(() => {
    const obj = parseYaml(value, { merge: true });
    return obj ? JSON.stringify(obj, null, 3) : '';
  }, '');
}

const rules: UseValidationRule<string>[] = [
  {
    validator: (value: string) => isNotThrowing(() => parseYaml(value)),
    message: 'Provided YAML is not valid.',
  },
];
```

## Dependencies
- `yaml` (`^2.2.1`) — `parse` function with `merge: true` option.
- `@/utils/defaults#withDefaultOnError` — error-safe transformation.
- `@/utils/boolean#isNotThrowing` — boolean wrapper to test for thrown errors.
- Shared layout component `<format-transformer>`.
- `@vicons/tabler#AlignJustified` — icon.

## Edge Cases & Validation
- **Empty input:** `parseYaml('')` returns `null`, so the transformer's `obj ? ... : ''` branch yields `''`. Validation does not throw → no error message.
- **Just whitespace / comments:** also parses to `null` → empty output.
- **Merge keys (`<<`)**: fully supported — see the e2e test:
  ```yaml
  default: &default
    name: ''
    age: 0
  person:
    *default
  persons:
    - <<: *default
      age: 1
  ```
  produces JSON where `persons[0]` ends up as `{ "name": "", "age": 1 }` (merge key fields override only when not specified locally, with the JS YAML library's left-to-right merging behavior — see the test for the exact expected output).
- **Invalid YAML (e.g. bad indentation, unmatched brackets):** the parser throws → validator marks invalid; transformer returns `''`.
- **Tags that JSON cannot represent** (custom YAML tags, `Date`, `RegExp` outputs from custom resolvers): default YAML library produces JS values that `JSON.stringify` may serialize as `{}` or strings; no special handling.
- **Anchor-only documents:** anchors without aliases serialize naturally.
- **Recursive references:** would yield JSON.stringify TypeError; caught by `withDefaultOnError` → empty string.

## Examples
**Example 1 — simple object with list (from e2e test)**
- Input:
  ```yaml
  foo: bar
  list:
    - item
    - key: value
  ```
- Output:
  ```json
  {
     "foo": "bar",
     "list": [
        "item",
        {
           "key": "value"
        }
     ]
  }
  ```

**Example 2 — merge keys (from e2e test)**
- Input:
  ```yaml
  default: &default
    name: ''
    age: 0

  person:
    *default

  persons:
  - <<: *default
    age: 1
  - <<: *default
    name: John
  - { age: 3, <<: *default }
  ```
- Output:
  ```json
  {
     "default": {
        "name": "",
        "age": 0
     },
     "person": {
        "name": "",
        "age": 0
     },
     "persons": [
        {
           "name": "",
           "age": 1
        },
        {
           "name": "John",
           "age": 0
        },
        {
           "age": 3,
           "name": ""
        }
     ]
  }
  ```

**Example 3 — invalid YAML**
- Input: `foo: : :bar` (illegal repeated colons at root)
- Output: `''` with the error `"Provided YAML is not valid."`.

## File Structure
| File | Purpose |
|------|---------|
| `index.ts` | Tool metadata: name, path `/yaml-to-json-converter`, keywords `['yaml', 'to', 'json']`, icon `AlignJustified`, lazy import. |
| `yaml-to-json.vue` | View component: defines transformer + validation rule, mounts `<format-transformer>`. |
| `yaml-to-json.e2e.spec.ts` | Playwright E2E spec: page title check, simple list test, merge-key test. |

## Notes
- **i18n:** title/description from `tools.yaml-to-json-converter.title` / `.description`. Input/output labels are hard-coded English.
- **Persistence:** none — input does not persist between visits.
- **Indent quirk:** uses **3-space JSON indent** (`JSON.stringify(obj, null, 3)`) — uncommon and inconsistent with the more typical `null, 2` used by the XML-to-JSON tool. The e2e test asserts this exact 3-space indentation.
- **Sibling tools:** logical inverse is the JSON-to-YAML converter (also in the `Converter` category).
