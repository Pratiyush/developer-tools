# Numeronym generator

## Overview
- **Path:** `/numeronym-generator`
- **Category:** Text
- **Description:** A numeronym is a word where a number is used to form an abbreviation. For example, "i18n" is a numeronym of "internationalization" where 18 stands for the number of letters between the first i and the last n in the word.
- **Keywords:** numeronym, generator, abbreviation, i18n, a11y, l10n
- **Redirect from:** (none)
- **Created at:** 2023-11-05
- **Icon:** Custom SVG `n7m-icon.svg` (imported via `n7m-icon.svg?component`)

## Purpose
Generates a numeronym (numerical contraction) for any input word: keeps the first letter, replaces the middle letters with a count of how many letters were dropped, and keeps the last letter. The classic developer examples are `internationalization` → `i18n`, `accessibility` → `a11y`, and `localization` → `l10n`. Useful for naming things or quickly producing the conventional abbreviation for a long term.

## Inputs
| Name | Type | Default | Validation |
| --- | --- | --- | --- |
| `word` | string | `''` | None — any string accepted; behavior diverges based on length only |

The input is a single `c-input-text` with:
- `placeholder`: `"Enter a word, e.g. 'internationalization'"`
- `size`: `"large"`
- `clearable`: true
- `test-id`: `"word-input"`

## Outputs
| Name | Type | Description |
| --- | --- | --- |
| `numeronym` | string | The generated numeronym, computed reactively. Empty input → empty output. |

The output is shown in an `input-copyable` (read-only with copy button) configured with:
- `size`: `"large"`
- `readonly`: true
- `placeholder`: `"Your numeronym will be here, e.g. 'i18n'"`
- `test-id`: `"numeronym"`

## UI / Components
Centered single-column flex layout (`flex flex-col items-center gap-4`):
1. `c-input-text` for the word.
2. `icon-mdi-arrow-down` (down arrow icon, 30px) as a visual separator indicating the transformation direction.
3. `input-copyable` displaying the numeronym with a built-in copy button.

The whole tool is intentionally minimal — no extra options or settings.

## Logic / Algorithm
The transformation lives in `numeronym-generator.service.ts`:
```ts
function generateNumeronym(word: string): string {
  const wordLength = word.length;

  if (wordLength <= 3) {
    return word;
  }

  return `${word.at(0)}${wordLength - 2}${word.at(-1)}`;
}
```

Step by step:
1. Take the input string `word` and its length `n = word.length`.
2. If `n <= 3`, return the word unchanged (a numeronym of a short word would be longer than the word itself, defeating the purpose).
3. Otherwise, return `firstChar + (n - 2) + lastChar`, using `String.prototype.at(0)` and `at(-1)` to access the boundaries.

The Vue component wires this in a computed:
```ts
const numeronym = computed(() => generateNumeronym(word.value));
```
So the output updates on every keystroke.

## Dependencies
| Library | Purpose | Notes |
| --- | --- | --- |
| `vue` (`ref`, `computed`) | Reactivity | |
| Internal `c-input-text`, `input-copyable` | Custom input components | |
| `n7m-icon.svg?component` | Inline SVG component for the tool icon | Loaded via the SVG-loader plugin (`?component` suffix produces a Vue component) |
| `icon-mdi-arrow-down` | Down-arrow icon | Auto-imported (UnoCSS / icon plugin) |
| `vitest` (dev) | Unit tests | |
| `@playwright/test` (dev) | E2E tests | |

## Edge Cases & Validation
- **Empty input** (`''`): `length === 0 <= 3`, returns `''`. Output box stays empty.
- **1–3 character word** (e.g. `abc`): returned verbatim. (Tested in unit tests.)
- **Exactly 4 characters** (e.g. `abcd`): produces `a2d`.
- **Whitespace / multi-word input** (e.g. `"hello world"`): treated as one string of length 11 → `h9d` (last character is `d`). Spaces are counted in the length.
- **Unicode / emoji:** `String.prototype.at` and `length` operate on UTF-16 code units, so multi-code-unit characters (e.g. emoji) may produce surrogate halves at the boundary or undercount the visual length.
- **Leading/trailing whitespace:** Treated as part of the word; not trimmed.
- **No locale handling:** Doesn't lowercase, doesn't normalize Unicode forms.

## Examples
| Input | Output | Why |
| --- | --- | --- |
| `internationalization` | `i18n` | length 20, drop 18 middle letters |
| `accessibility` | `a11y` | length 13, drop 11 middle letters |
| `localization` | `l10n` | length 12, drop 10 middle letters |
| `abc` | `abc` | length ≤ 3, unchanged |
| `cat` | `cat` | length ≤ 3, unchanged |
| (empty) | (empty) | length 0, unchanged |
| `cats` | `c2s` | length 4, drop 2 middle letters |

## File Structure
```
numeronym-generator/
├── index.ts                              # Tool metadata (name via translate(), custom SVG icon)
├── numeronym-generator.vue               # Component (renders input + arrow + copyable output)
├── numeronym-generator.service.ts        # Pure function generateNumeronym(word)
├── numeronym-generator.service.test.ts   # Vitest unit tests for generateNumeronym
├── numeronym-generator.e2e.spec.ts       # Playwright end-to-end test (page title + UI flow)
└── n7m-icon.svg                          # Custom tool icon (imported as Vue component)
```

## Notes
- **i18n:** `name` and `description` come from `translate('tools.numeronym-generator.title' / '.description')`.
- **No persistence** between sessions.
- **Tests:** Unit tests confirm the expected outputs for `internationalization`, `accessibility`, `localization`, and short-word passthrough. E2E tests confirm the page title (`"Numeronym generator - IT Tools"`) and the input → output flow via test IDs `word-input` and `numeronym`.
- **Custom icon:** Uses a hand-drawn SVG (`n7m-icon.svg`) instead of the standard `@vicons/tabler` icon set — making it the only one of the assigned tools with a custom inline SVG icon.
- **Pure logic:** Service is a single 7-line pure function with no external dependencies — the simplest tool in the assigned set.
