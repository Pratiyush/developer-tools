# Case Converter

## Overview
- **Path:** `/case-converter`
- **Category:** Converter
- **Description:** Transform the case of a string and choose between different formats.
- **Keywords:** `case`, `converter`, `camelCase`, `capitalCase`, `constantCase`, `dotCase`, `headerCase`, `noCase`, `paramCase`, `pascalCase`, `pathCase`, `sentenceCase`, `snakeCase`
- **Redirect from:** None
- **Icon:** `LetterCaseToggle` (from `@vicons/tabler`)
- **i18n key:** `tools.case-converter.title` / `.description`

## Purpose
Takes a single input string and renders it side-by-side in 14 different case styles, each with its own copy button. Useful for converting between identifier conventions (variable names, env-var names, file slugs) without remembering each library's separate API.

## Inputs
| Field | Type | Default | Notes |
|-------|------|---------|-------|
| `input` (Your string) | string | `'lorem ipsum dolor sit amet'` | Plain text (`raw-text`). The label is left-aligned at 120 px. |

## Outputs
A `formats` computed array of `{ label, value }` pairs, rendered as one `InputCopyable` row per format. The 14 formats:

| Label | Source | Description |
|-------|--------|-------------|
| `Lowercase:` | `input.toLocaleLowerCase()` | Locale-aware lowercase. |
| `Uppercase:` | `input.toLocaleUpperCase()` | Locale-aware uppercase. |
| `Camelcase:` | `camelCase(input, baseConfig)` | `loremIpsumDolorSitAmet` |
| `Capitalcase:` | `capitalCase(input, baseConfig)` | `Lorem Ipsum Dolor Sit Amet` |
| `Constantcase:` | `constantCase(input, baseConfig)` | `LOREM_IPSUM_DOLOR_SIT_AMET` |
| `Dotcase:` | `dotCase(input, baseConfig)` | `lorem.ipsum.dolor.sit.amet` |
| `Headercase:` | `headerCase(input, baseConfig)` | `Lorem-Ipsum-Dolor-Sit-Amet` |
| `Nocase:` | `noCase(input, baseConfig)` | `lorem ipsum dolor sit amet` (lowercase, space-separated). |
| `Paramcase:` | `paramCase(input, baseConfig)` | `lorem-ipsum-dolor-sit-amet` (kebab-case). |
| `Pascalcase:` | `pascalCase(input, baseConfig)` | `LoremIpsumDolorSitAmet` |
| `Pathcase:` | `pathCase(input, baseConfig)` | `lorem/ipsum/dolor/sit/amet` |
| `Sentencecase:` | `sentenceCase(input, baseConfig)` | `Lorem ipsum dolor sit amet` |
| `Snakecase:` | `snakeCase(input, baseConfig)` | `lorem_ipsum_dolor_sit_amet` |
| `Mockingcase:` | inline | Alternates upper/lower per character index (`LoReM iPsUm…`). |

The shared `baseConfig` overrides `change-case`'s default split regex:
```ts
const baseConfig = { stripRegexp: /[^A-Za-zÀ-ÖØ-öø-ÿ]+/gi };
```
This treats anything that is not a Latin/Latin-1 letter (the Unicode block from `À` through `ö`/`ÿ`, excluding ASCII control + math symbols) as a word separator. Numbers and punctuation are dropped. (Note that `ÿ` is included; CJK and other non-Latin scripts are not.)

Mockingcase logic:
```ts
input.split('').map((char, i) => i % 2 === 0 ? char.toUpperCase() : char.toLowerCase()).join('')
```

## UI / Components
- Single `c-card`.
- `c-input-text` for the source string (label-left, label-width 120 px, `raw-text`).
- A horizontal divider (`<div my-16px divider>`).
- A vertical list of `InputCopyable` rows (one per format), each with the same `labelPosition: 'left'`, `labelWidth: '120px'`, `labelAlign: 'right'` config and `mb-1` spacing.

`InputCopyable` is the project's read-only input that renders an inline copy-to-clipboard button (the entire row is the affordance for copying the rendered value).

## Logic / Algorithm
1. `input` is a Vue `ref` initialised with `'lorem ipsum dolor sit amet'`.
2. `formats` is `computed`. On every input change it rebuilds the array of 14 format pairs.
3. For each `change-case` helper, the same `baseConfig` is passed so word-splitting is consistent across formats.
4. The two pure-JS formats (`Lowercase`, `Uppercase`) use locale-aware variants (`toLocaleLowerCase` / `toLocaleUpperCase`) — important for languages like Turkish where `i`/`I` map differently.
5. Mockingcase is a custom inline transform.
6. The template iterates `formats` and feeds each into `InputCopyable`.

## Dependencies
- `change-case` — `camelCase`, `capitalCase`, `constantCase`, `dotCase`, `headerCase`, `noCase`, `paramCase`, `pascalCase`, `pathCase`, `sentenceCase`, `snakeCase`.
- Project component `InputCopyable` (read-only field with copy affordance).
- Project components: `c-card`, `c-input-text`.

## Edge Cases & Validation
- Empty input — every format yields the empty string.
- Pure punctuation/digits (e.g. `123-456`) — `baseConfig.stripRegexp` removes them, so `change-case` formats produce empty strings; `Lowercase`/`Uppercase` retain the original; `Mockingcase` alternates as expected.
- Non-Latin characters outside `À-Öø-ÿ` (e.g. Cyrillic, Greek, CJK, emoji) — also stripped by `baseConfig.stripRegexp`, leading to empty results in the `change-case` formats. The locale-aware up/lower-case variants and Mockingcase still operate on them.
- Single-character input — all formats trivially apply (Mockingcase always uppercases the first character because index 0 is even).
- Mixed-case input — every `change-case` format normalizes; Lowercase/Uppercase are direct.
- No locale parameter is passed to `toLocale*Case`, so it uses the browser's default locale.

## Examples
1. **Default `lorem ipsum dolor sit amet`** — see the table above (every example listed corresponds to the default input).
2. **`HelloWorld_2024`** —
   - Camelcase: `helloWorld`
   - Constantcase: `HELLO_WORLD`
   - Mockingcase: `HeLlOwOrLd_2024` (digits and underscore retained because Mockingcase operates on the raw input, not via `change-case`).
   - Paramcase: `hello-world`
3. **`Le café`** —
   - Camelcase: `leCafé`
   - Snakecase: `le_café`
   - Mockingcase: `Le cAfÉ` (alternates per index regardless of accents).

## File Structure
| File | Description |
|------|-------------|
| `index.ts` | Tool metadata. |
| `case-converter.vue` | Single-file component containing the input, computed `formats` array, and the per-format `InputCopyable` rows. |

## Notes
- **No persistence.** The input value is not stored; reloading resets to the default phrase.
- **i18n:** Title and description are translated; per-format labels are hard-coded English. The `change-case` helpers themselves are language-agnostic but the splitter regex is Latin-only.
- **Locale awareness:** Only the `Lowercase`/`Uppercase` rows respect the user's locale; the rest go through `change-case`.
- **`raw-text`** on the input ensures any pasted content is treated literally.
