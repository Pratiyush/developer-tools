# Text to NATO Alphabet

## Overview
- **Path:** `/text-to-nato-alphabet`
- **Category:** Converter
- **Description:** Transform text into the NATO phonetic alphabet for oral transmission.
- **Keywords:** `string`, `nato`, `alphabet`, `phonetic`, `oral`, `transmission`
- **Redirect from:** None
- **Icon:** `Speakerphone` from `@vicons/tabler`
- **Created at:** Not specified (no `createdAt` in `index.ts`)

## Purpose
Converts arbitrary text input into the NATO (ICAO) phonetic alphabet representation, replacing each Latin letter with its corresponding code word (`A` → `Alpha`, `B` → `Bravo`, ... `Z` → `Zulu`). The tool is useful for spelling words orally over noisy channels (radio, telephone) where individual letters may be misheard. Non-letter characters (digits, punctuation, whitespace) are passed through unchanged. The output is a single string with code words and pass-through characters joined by single spaces.

## Inputs
| Name | Type | Default | Validation |
| ---- | ---- | ------- | ---------- |
| `input` | `string` (single-line text input) | `''` (empty) | None — any input is accepted; non-letters are echoed verbatim |

The input field is `clearable` and uses placeholder `Put your text here...`.

## Outputs
| Name | Type | Description |
| ---- | ---- | ----------- |
| `natoText` | `string` (computed) | Space-separated NATO code words for each Latin letter in input; non-letter characters are passed through verbatim. Only rendered when truthy. |

The output is presented inside a `c-card` and is copyable via a button.

## UI / Components
- A single `c-input-text` field labelled "Your text to convert to NATO phonetic alphabet" with placeholder "Put your text here..." and `clearable` enabled.
- Conditional output block (`v-if="natoText"`):
  - Heading: "Your text in NATO phonetic alphabet"
  - `c-card` containing the rendered NATO string
  - `c-button` "Copy NATO string" (autofocus) that copies the output to the clipboard via `useCopy` composable, displaying a toast `"NATO alphabet string copied."`
- Layout uses utility classes (`mb-5`, `mb-2`, `mt-3`, `flex`, `justify-center`).

## Logic / Algorithm
1. The text-to-NATO conversion is implemented in `text-to-nato-alphabet.service.ts`:
   ```ts
   function getLetterPositionInAlphabet({ letter }: { letter: string }) {
     return letter.toLowerCase().charCodeAt(0) - 'a'.charCodeAt(0);
   }

   function textToNatoAlphabet({ text }: { text: string }) {
     return text
       .split('')
       .map((character) => {
         const alphabetIndex = getLetterPositionInAlphabet({ letter: character });
         const natoWord = natoAlphabet[alphabetIndex];
         return natoWord ?? character;
       })
       .join(' ');
   }
   ```
2. The lookup table `natoAlphabet` (from `text-to-nato-alphabet.constants.ts`) is a 26-element array indexed `0..25` (A..Z):
   `['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot', 'Golf', 'Hotel', 'India', 'Juliet', 'Kilo', 'Lima', 'Mike', 'November', 'Oscar', 'Papa', 'Quebec', 'Romeo', 'Sierra', 'Tango', 'Uniform', 'Victor', 'Whiskey', 'X-ray', 'Yankee', 'Zulu']`.
3. For each character `c`:
   - Lowercase it and compute `index = charCode(c) - charCode('a')`.
   - If `0 <= index <= 25`, replace with `natoAlphabet[index]`. Otherwise, fall back to the original character (digits, punctuation, whitespace, non-Latin Unicode all hit this path because their lowercased char codes fall outside the `[97, 122]` range, returning `undefined` from the array lookup).
4. All transformed tokens are joined with a single space.
5. The Vue component wires `natoText` as a `computed` over the reactive `input` ref, so output updates live as the user types.

## Dependencies
- `@vicons/tabler` (`^0.12.0`) — provides the `Speakerphone` icon.
- `@/composable/copy` (`useCopy`) — wraps `@vueuse/core` `useClipboard` and surfaces a Naive UI toast.
- Vue 3 reactivity (`ref`, `computed`).
- No third-party text-processing libraries are used; the conversion is pure native string manipulation.

## Edge Cases & Validation
- **Empty input:** `natoText` evaluates to `''`. The `v-if="natoText"` block hides the output and copy button entirely.
- **Whitespace:** Spaces map to `undefined` in the lookup, so they pass through unchanged but get sandwiched between joining spaces, producing two consecutive spaces around each original space (e.g. `"a b"` → `"Alpha   Bravo"` — three spaces between code words because the original space is preserved as a token).
- **Digits / punctuation / emoji / non-Latin letters:** Pass through untouched; for example `"42!"` becomes `"4 2 !"`.
- **Mixed casing:** Letters are normalised to lowercase before indexing so `"aA"` → `"Alpha Alpha"`.
- **Multi-codepoint characters (emoji, surrogate pairs, combining marks):** `text.split('')` splits on UTF-16 code units, which can break surrogate pairs into independent halves; each half then has a char code outside `[97, 122]` and is passed through. Visual results may be partial code units.
- **No length cap:** Arbitrary input is accepted; performance scales linearly with input length.

## Examples
- Input `"Hello"` → Output `"Hotel Echo Lima Lima Oscar"`.
- Input `"NATO 1!"` → Output `"November Alpha Tango Oscar   1 !"` (extra spaces because the original space and `1`/`!` survive as their own tokens).
- Input `""` (empty) → Output `""`; UI hides the result block.
- Input `"abcXYZ"` → Output `"Alpha Bravo Charlie X-ray Yankee Zulu"`.

## File Structure
- `index.ts` — Tool descriptor: name, path, description, keywords, icon, lazy-loaded component.
- `text-to-nato-alphabet.constants.ts` — The 26-entry NATO code-word array.
- `text-to-nato-alphabet.service.ts` — `textToNatoAlphabet` and helper `getLetterPositionInAlphabet`.
- `text-to-nato-alphabet.vue` — UI: input, conditional output, copy button.

## Notes
- The folder does **not** contain unit or e2e tests.
- Title and description are i18n-translated via `translate('tools.text-to-nato-alphabet.title')` / `.description` from `/locales/en.yml`.
- No persistence (no `useStorage`); state is in-memory only.
- The toast message `"NATO alphabet string copied."` is hardcoded English in the Vue file (not translated).
- Note the historic NATO X-ray spelling here uses a hyphen (`"X-ray"`) rather than `"Xray"`.
