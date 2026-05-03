# TOML to YAML

## Overview
- **Path:** `/toml-to-yaml`
- **Category:** Converter
- **Description:** Parse and convert TOML to YAML.
- **Keywords:** `toml`, `yaml`, `convert`, `online`, `transform`, `parse`
- **Redirect from:** None
- **Icon:** `BracketIcon` from `~icons/mdi/code-brackets`
- **Created at:** `2023-06-23`

## Purpose
Converts a TOML document into YAML. Useful when migrating between configuration formats, comparing two equivalent representations, or producing YAML for tooling that does not consume TOML directly. Like its sibling tools, this is a thin wrapper over the shared `<format-transformer>` component and reuses the TOML validator from `toml-to-json`.

## Inputs
| Name | Type | Default | Validation |
| ---- | ---- | ------- | ---------- |
| TOML input | `string` (multiline textarea) | `''` | `isValidToml(value)` from `../toml-to-json/toml.services`. Failure displays: **"Provided TOML is not valid."** |

The input field comes from `FormatTransformer`: multiline, autosize, monospace, raw-text, 20 rows initially, `test-id="input"`. Placeholder: `"Paste your TOML here..."`. Label: `"Your TOML"`.

## Outputs
| Name | Type | Description |
| ---- | ---- | ----------- |
| YAML output | `string` (rendered in copyable code block) | TOML parsed via `iarna-toml-esm` then serialised via `yaml`'s `stringify`. Empty when input is whitespace-only or parsing throws. |

Rendered through `<textarea-copyable language="yaml">` with the same height-following behaviour and copy button.

## UI / Components
Identical layout to `toml-to-json` but with different transformer / output language:

```vue
<format-transformer
  input-label="Your TOML"
  input-placeholder="Paste your TOML here..."
  output-label="YAML from your TOML"
  output-language="yaml"
  :input-validation-rules="rules"
  :transformer="transformer"
/>
```

No additional configuration controls.

## Logic / Algorithm
**Validation** — reuses the shared validator:
```ts
import { isValidToml } from '../toml-to-json/toml.services';
```

**Transformation:**
```ts
import { parse as parseToml } from 'iarna-toml-esm';
import { stringify as stringifyToYaml } from 'yaml';
import { withDefaultOnError } from '../../utils/defaults';

const transformer = (value: string) =>
  value.trim() === '' ? '' : withDefaultOnError(() => stringifyToYaml(parseToml(value)), '');
```

Step-by-step:
1. If `value.trim()` is empty, short-circuit to `''` without parsing. (Note: this is **stricter** than `toml-to-json`, which uses a non-trimmed `value === ''` check.)
2. Otherwise call `parseToml(value)` to get a JS object.
3. Call `stringifyToYaml(parsed)` from the `yaml` package to produce a YAML string. Default `yaml` `stringify` options apply: 2-space indent, double-quote strings only when needed, dates serialised in their YAML form, etc.
4. Any thrown error is caught and the output is `''`. The validator handles the user-facing error message separately.

The `format-transformer` recomputes `transformer(input)` on every change, so the YAML updates live.

## Dependencies
- `iarna-toml-esm` (`^3.0.5`) — TOML parser.
- `yaml` (`^2.2.1`) — used for `stringify`. Default options.
- `@/utils/defaults` (`withDefaultOnError`).
- `../toml-to-json/toml.services` — re-uses `isValidToml`.
- `~icons/mdi/code-brackets` — icon.
- Shared `<format-transformer>` and `<textarea-copyable>` components.

## Edge Cases & Validation
- **Empty / whitespace-only input:** Output is `''` (transformer short-circuits on `.trim() === ''`).
- **Invalid TOML:** Inline validation message `"Provided TOML is not valid."` Output remains `''`.
- **TOML dates / datetimes:** Parsed to JS `Date` objects; the `yaml` library serialises them as YAML timestamps in ISO-like form (e.g. `created: 2023-06-23T12:00:00.000Z`).
- **TOML BigInts (large integers):** `parseToml` returns `BigInt` for out-of-range integers. `yaml.stringify` may throw or emit a non-standard token; the `withDefaultOnError` swallows any throw and the output becomes `''`. Validation will still pass, so the user sees an empty output with no error explanation in that edge case.
- **Comments:** Stripped (TOML parsing discards them).
- **Inline tables, arrays of tables:** Converted to nested YAML mappings / sequences using default `yaml` formatting (block style by default).
- **Whitespace-only input vs. `toml-to-json`:** This tool returns `''` for whitespace-only; `toml-to-json` would call the parser which returns `{}` and thus emits `"{}"`. Behaviour is intentionally a touch different.

## Examples

**Example 1 — Basic table with nested sub-table** (asserted by e2e test):

Input:
```toml
foo = "bar"

# This is a comment

[list]
  name = "item"
[list.another]
  key = "value"
```

Output:
```yaml
foo: bar
list:
  name: item
  another:
    key: value
```

**Example 2 — Mixed types:**

Input:
```toml
title = "Example"
count = 42
enabled = true
ratio = 0.75
tags = ["a", "b"]

[server]
host = "localhost"
port = 8080
```

Output (default `yaml` stringify; block style):
```yaml
title: Example
count: 42
enabled: true
ratio: 0.75
tags:
  - a
  - b
server:
  host: localhost
  port: 8080
```

**Example 3 — Empty / invalid:**
- Empty / whitespace-only input → empty output, no validation error.
- Input `foo = ` → empty output, validation message `"Provided TOML is not valid."`.

## File Structure
- `index.ts` — Tool descriptor.
- `toml-to-yaml.vue` — Wrapper using `<format-transformer>` with the TOML→YAML transformer.
- `toml-to-yaml.e2e.spec.ts` — Playwright test asserting title and TOML→YAML round-trip on the exact input above.

There is **no** local `services.ts` or unit-test file in this folder. The shared `isValidToml` lives in the sibling `toml-to-json/toml.services.ts`.

## Notes
- **No unit tests** for this tool — only the e2e test.
- Validation logic is shared with `toml-to-json` via cross-tool import.
- No persistence; in-memory only.
- Title and description i18n-translated; labels and validation message are hardcoded English.
- The empty-input handling differs subtly from `toml-to-json` (`.trim() === ''` here vs `=== ''` there) — both short-circuit but the YAML version is more permissive about leading/trailing whitespace.
- YAML default formatting uses 2-space block-style indentation.
