# Lorem Ipsum generator

## Overview
- **Path:** `/lorem-ipsum-generator`
- **Category:** Text
- **Description:** Translated via i18n key `tools.lorem-ipsum-generator.description` (e.g. "Lorem Ipsum is a placeholder text commonly used to demonstrate the visual form of a document or a typeface without relying on meaningful content.").
- **Keywords:** lorem, ipsum, dolor, sit, amet, placeholder, text, filler, random, generator
- **Redirect from:** None
- **Created at:** Not set in metadata
- **Icon:** `AlignJustified` from `@vicons/tabler`
- **i18n:** Title and description come from `translate('tools.lorem-ipsum-generator.title')` / `.description`.

## Purpose
Generates random placeholder text in the classic "lorem ipsum" Latin pseudo-language, with controls over the number of paragraphs, sentences per paragraph, words per sentence, an optional canonical opener, and optional `<p>...</p>` wrapping. Useful for filling layouts during design and front-end development.

## Inputs
| Name | Type | Default | Validation / Range |
| --- | --- | --- | --- |
| Paragraphs | integer (slider) | `1` | `min=1`, `max=20`, step `1`. Single-value slider. |
| Sentences per paragraph | `[number, number]` (range slider) | `[3, 8]` | `min=1`, `max=50`, step `1`. The per-output count is a uniform random integer between the two bounds (re-rolled per refresh). |
| Words per sentence | `[number, number]` (range slider) | `[8, 15]` | `min=1`, `max=50`, step `1`. Same uniform-random behaviour as the sentence range. |
| Start with lorem ipsum ? | boolean (switch) | `true` | When on, the very first sentence is forced to `"Lorem ipsum dolor sit amet, consectetur adipiscing elit."`. |
| As html ? | boolean (switch) | `false` | When on, paragraphs are wrapped in `<p>...</p>` tags joined with blank lines. |

No inputs are persisted to localStorage; defaults reset on refresh.

## Outputs
| Name | Type | Description |
| --- | --- | --- |
| Lorem ipsum text | string | Generated text. Rendered into a read-only multiline `<c-input-text>` (5 rows). |

## UI / Components
- A `<c-card>` containing five `<n-form-item>` rows, each with `label-placement="left"` and `label-width="200"`:
  1. Paragraphs — `<n-slider>` (single value).
  2. Sentences per paragraph — `<n-slider range>`.
  3. Words per sentence — `<n-slider range>`.
  4. Start with lorem ipsum ? — `<n-switch>`.
  5. As html ? — `<n-switch>`.
- A read-only multiline `<c-input-text>` showing the generated text, `rows=5`, placeholder "Your lorem ipsum…", `mt-5`.
- Two centered buttons below the output: **Copy** (autofocus) and **Refresh**.

## Logic / Algorithm
The component coordinates:
```ts
const [loremIpsumText, refreshLoremIpsum] = computedRefreshable(() =>
  generateLoremIpsum({
    paragraphCount: paragraphs.value,
    asHTML: asHTML.value,
    sentencePerParagraph: randIntFromInterval(sentences.value[0], sentences.value[1]),
    wordCount: randIntFromInterval(words.value[0], words.value[1]),
    startWithLoremIpsum: startWithLoremIpsum.value,
  }),
);
```
- `computedRefreshable` (custom composable) wraps a producer so that:
  - It re-runs whenever its reactive dependencies change.
  - It can be force-refreshed via `refreshLoremIpsum()`, which re-rolls the random ranges.
- `randIntFromInterval(min, max)` is `Math.floor(Math.random() * (max - min) + min)` (note: with these fixed integer bounds the result is an integer in `[min, max-1]`, exclusive of `max`).

`generateLoremIpsum` (in `lorem-ipsum-generator.service.ts`):
1. Builds `paragraphs` as `paragraphCount` arrays, each containing `sentencePerParagraph` sentences produced by `generateSentence(wordCount)`.
2. `generateSentence(length)`:
   - Builds a string of `length` random words drawn (with replacement) from a 175-word Latin vocabulary by `randFromArray`.
   - Joins them with single spaces.
   - Uppercases the first character.
   - Appends a period.
3. If `startWithLoremIpsum` is true, replaces `paragraphs[0][0]` with `'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'`.
4. Joins each paragraph's sentences with `' '`, then:
   - When `asHTML=false`: joins paragraphs with `'\n\n'`.
   - When `asHTML=true`: returns `'<p>' + paragraphs.map(s => s.join(' ')).join('</p>\n\n<p>') + '</p>'`.

The vocabulary lives entirely in-memory in the service file (no external API calls).

`useCopy({ source: loremIpsumText, text: 'Lorem ipsum copied to the clipboard' })` provides the `copy()` function bound to the Copy button.

## Dependencies
- `@/composable/copy` (`useCopy`) — clipboard wrapper that shows a toast on success.
- `@/composable/computedRefreshable` — custom composable returning `[computedRef, refresh]`.
- `@/utils/random` (`randIntFromInterval`, `randFromArray`) — simple `Math.random`-based helpers.
- Naive UI components (`n-slider`, `n-switch`, `n-form-item`).
- Project shared `<c-card>`, `<c-input-text>`, `<c-button>`.
- No external lorem-ipsum library; the 175-word vocabulary is bundled inline.

## Edge Cases & Validation
- **`paragraphCount=1, startWithLoremIpsum=true`:** Output begins with the canonical "Lorem ipsum dolor sit amet, consectetur adipiscing elit." regardless of the requested word/sentence counts.
- **`startWithLoremIpsum=true` with multiple paragraphs:** only the first sentence of the first paragraph is replaced; the rest are random.
- **Word/sentence range with `min===max`:** `randIntFromInterval` returns `min` deterministically (`max - min === 0` makes the random factor zero).
- **HTML mode:** every paragraph (even an empty one) is wrapped in `<p>`. Paragraphs are joined with a literal `</p>\n\n<p>` separator.
- **Slider order:** Naive UI's range slider keeps the two values in order; the lower bound is always passed first to `randIntFromInterval`.
- **Refresh** button: re-evaluates the producer, re-rolling the per-paragraph random sentence and word counts even if no settings changed.
- **No persistence:** changing settings does not survive a page reload.

## Examples
**Example 1 — defaults, click Copy:**
Output is one paragraph, 3–7 sentences (because `randIntFromInterval(3, 8)` yields 3–7), each sentence 8–14 words drawn from the bundled vocabulary, the first sentence forced to "Lorem ipsum dolor sit amet, consectetur adipiscing elit." Example:
```
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Eu vehicula ad nec dolor sodales lectus...
```

**Example 2 — HTML mode, 2 paragraphs:**
```
<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. ...</p>

<p>... ... ...</p>
```

**Example 3 — `startWithLoremIpsum=false`, 1 paragraph:**
A single paragraph entirely composed of random vocabulary, no canonical opener.

## File Structure
- `index.ts` — Tool metadata, i18n title/description, `AlignJustified` icon.
- `lorem-ipsum-generator.vue` — Vue 3 SFC: sliders, switches, output textarea, and Copy / Refresh buttons.
- `lorem-ipsum-generator.service.ts` — 175-word Latin `vocabulary`, the canonical `firstSentence`, `generateSentence(length)`, and `generateLoremIpsum({ ... })`.

## Notes
- No tests for this tool.
- No external lorem ipsum NPM package — the entire vocabulary is bundled inline (~175 words).
- `randIntFromInterval` is exclusive of the upper bound; users should be aware that the upper slider value is "up to (but not including)" when interpreting displayed ranges.
- Output is rendered in a read-only multiline input rather than `<TextareaCopyable>`, but a dedicated Copy button is provided.
- The Copy button is `autofocus`, so pressing Enter immediately copies after the page loads.
