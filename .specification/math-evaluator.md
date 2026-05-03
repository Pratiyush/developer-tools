# Math evaluator

## Overview
- **Path:** `/math-evaluator`
- **Category:** Math
- **Description:** A calculator for evaluating mathematical expressions. You can use functions like sqrt, cos, sin, abs, etc.
- **Keywords:** math, evaluator, calculator, expression, abs, acos, acosh, acot, acoth, acsc, acsch, asec, asech, asin, asinh, atan, atan2, atanh, cos, cosh, cot, coth, csc, csch, sec, sech, sin, sinh, sqrt, tan, tanh
- **Redirect from:** (none)
- **Created at:** (no `createdAt` set)
- **Icon:** `Math` (from `@vicons/tabler`)

## Purpose
This tool evaluates arbitrary mathematical expressions entered as a string, using the `mathjs` library. The user can type expressions ranging from simple arithmetic (`2+3*4`) to advanced operations using trigonometric, hyperbolic, exponential, and other math functions (e.g. `2*sqrt(6)`, `sin(pi/2)`, `log(100, 10)`). It functions as an in-browser scientific calculator with full expression parsing — no need to break problems into steps.

## Inputs
| Name | Type | Default | Validation |
| --- | --- | --- | --- |
| `expression` | string (multiline, monospace) | `''` (empty) | None up front — `mathjs.evaluate` is called inside `withDefaultOnError` so any parse/runtime error is silently swallowed |

The input field is a `c-input-text` configured with:
- `placeholder`: `"Your math expression (ex: 2*sqrt(6) )..."`
- `rows`: `1`
- `multiline`: true
- `raw-text`: true
- `monospace`: true
- `autofocus`: true
- `autosize`: true (grows as the user adds lines)

## Outputs
| Name | Type | Description |
| --- | --- | --- |
| `result` | string \| number \| any | The evaluated result of the expression as returned by `mathjs.evaluate`. Errors and `null`/`undefined` returns coerce to `''` (empty string). Shown inside a `c-card` with title `"Result "` only if `result !== ''`. |

## UI / Components
- `c-input-text` — single-line-by-default, autosizing monospaced input for the math expression.
- `c-card` (title `"Result "`, top margin `mt-5`) — shown conditionally (`v-if="result !== ''"`) when there is a non-empty result. The result is rendered as `{{ result }}` interpolation (no syntax highlighting, no copy button).

## Logic / Algorithm
1. `expression` ref starts as `''`.
2. `result` is a computed:
   ```ts
   const result = computed(() =>
     withDefaultOnError(() => evaluate(expression.value) ?? '', '')
   );
   ```
   - `evaluate()` from `mathjs` parses and evaluates the input string.
   - The nullish coalescing `?? ''` converts `null`/`undefined` results into `''` so the card is hidden.
   - `withDefaultOnError(fn, '')` wraps the evaluation: if `fn()` throws (parse error, undefined symbol, division-by-zero behavior of `mathjs`, etc.), the helper returns the default value `''`.
3. The result card is shown only when `result !== ''`. This means: empty input → no card, syntax error → no card, valid expression → card with the value.

`mathjs.evaluate` supports:
- Basic arithmetic: `+ - * / %`, parentheses.
- Exponentiation: `^` or `**`.
- Trig (radian-based by default): `sin`, `cos`, `tan`, `asin`, etc.; reciprocals `sec`, `csc`, `cot`; hyperbolic `sinh`, `cosh`, `tanh`, etc.
- Roots and logs: `sqrt`, `cbrt`, `nthRoot`, `log`, `log2`, `log10`, `ln`, `exp`.
- Constants: `pi`, `e`, `tau`, `phi`, `Infinity`, `NaN`.
- Statistics: `mean`, `median`, `std`, `variance`, `min`, `max`.
- Linear algebra: matrices `[[1,2],[3,4]]`, `det`, `inv`, `transpose`.
- Units: `5 cm to inch`, `1 kg + 200 g`.
- Custom variables / multi-line: `x = 5; x^2`.

## Dependencies
| Library | Purpose | Notes |
| --- | --- | --- |
| `mathjs` | Expression parser & evaluator | The core engine — supports BigNumbers, units, complex numbers, matrices |
| `@/utils/defaults` (`withDefaultOnError`) | Try-catch helper that returns a default on throw | Used to suppress parse errors from cluttering the UI |
| `vue` (`ref`, `computed`) | Reactivity | |
| Internal `c-input-text`, `c-card` | UI primitives | |

## Edge Cases & Validation
- **Empty input:** Result is `''` → card hidden.
- **Syntax errors** (e.g. `2++`, `2 * (`): `mathjs.evaluate` throws → `withDefaultOnError` returns `''` → card hidden silently. No error message shown to the user.
- **Undefined symbols** (e.g. `foo + 1` where `foo` is unset): same — silent empty result.
- **Division by zero:** `mathjs` returns `Infinity` or `NaN` (depending on context) — those values *are* shown in the card as their string forms.
- **Very large / very small numbers:** Returned with `mathjs`'s formatting (which may use scientific notation).
- **Multi-line / multi-statement input:** `mathjs.evaluate` accepts statements separated by newlines or `;` — only the last expression's value is shown.
- **Matrix / object results:** Rendered via Vue's default `toString`, which may give `[1,2,3]` or `{ ... }` representations depending on `mathjs` formatting.
- **No copy button:** Result must be selected manually to be copied.

## Examples
**Example 1 — Square root with multiplication**

Input: `2*sqrt(6)`
Output (Result card): `4.898979485566356`

**Example 2 — Trig and constants**

Input: `sin(pi/2) + cos(0)`
Output: `2`

**Example 3 — Invalid input**

Input: `2 * (`
Output: (no card displayed)

**Example 4 — Unit conversion**

Input: `5 cm to inch`
Output: `1.968503937007874 inch`

## File Structure
```
math-evaluator/
├── index.ts             # Tool metadata (name, path, keywords incl. all supported function names)
└── math-evaluator.vue   # Single-file component with input + computed evaluation
```

## Notes
- **i18n:** `name` and `description` come from `translate('tools.math-evaluator.title' / '.description')`. Translations live in `locales/<lang>.yml` under `tools.math-evaluator.{title,description}`.
- No persistence (no `useStorage`).
- No tests for this tool (no `.test.ts` / `.spec.ts` / `.e2e.spec.ts`).
- Errors are silently suppressed — there is no inline validation message; the user only knows their expression failed because no result appears.
- Result card title contains a trailing space: `"Result "` (literal as authored).
- Keywords include all common trig and hyperbolic function names, used to make the tool discoverable when the user searches for any of them.
