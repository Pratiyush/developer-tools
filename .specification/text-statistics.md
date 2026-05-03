# Text statistics

## Overview
- **Path:** `/text-statistics`
- **Category:** Text
- **Description:** Get information about a text, the number of characters, the number of words, its size in bytes, ...
- **Keywords:** text, statistics, length, characters, count, size, bytes
- **Redirect from:** `/text-stats`

## Purpose
Computes basic descriptive statistics over a piece of text in real time: total character count, word count, line count, and byte size (UTF-8). Useful for tweet-length checks, fitting copy into UI components, validating against API limits expressed in bytes/characters, or quick sanity-checking pasted content.

## Inputs
| Name | Type | Default | Validation |
|------|------|---------|-----------|
| `text` | `string` (multiline `<c-input-text>`, 5 rows) | `''` (empty) | None — free-form text. |

## Outputs
Four reactive `<n-statistic>` tiles, each updating immediately on input change:

| Stat label | Computed value | Notes |
|------------|----------------|-------|
| **Character count** | `text.length` | UTF-16 code-unit count. A surrogate-pair emoji counts as 2. |
| **Word count** | `text === '' ? 0 : text.split(/\s+/).length` | Splits on any whitespace run; an empty string is special-cased to 0 (otherwise `''.split(/\s+/)` returns `['']`, giving a misleading 1). Leading/trailing whitespace can introduce empty strings into the array — see Edge Cases. |
| **Line count** | `text === '' ? 0 : text.split(/\r\n\|\r\|\n/).length` | Splits on `\r\n`, `\r`, or `\n`. Empty input → 0. |
| **Byte size** | `formatBytes(getStringSizeInBytes(text))` | UTF-8 byte length, formatted via `formatBytes` to a human-readable string (`Bytes`, `KB`, `MB`, …). |

## UI / Components
- A single `<c-card>` containing:
  - One multiline `<c-input-text>` (5 rows, placeholder "Your text...").
  - A flex row with four equal-width `<n-statistic>` tiles below it.
- No tabs, copy buttons, or downloads — this is a one-way display tool.

```vue
<c-card>
  <c-input-text v-model:value="text" multiline placeholder="Your text..." rows="5" />
  <div mt-5 flex>
    <n-statistic label="Character count" :value="text.length" flex-1 />
    <n-statistic label="Word count" :value="text === '' ? 0 : text.split(/\s+/).length" flex-1 />
    <n-statistic label="Line count" :value="text === '' ? 0 : text.split(/\r\n|\r|\n/).length" flex-1 />
    <n-statistic label="Byte size" :value="formatBytes(getStringSizeInBytes(text))" flex-1 />
  </div>
</c-card>
```

## Logic / Algorithm
1. **Character count**: native `String.prototype.length` — counts UTF-16 code units.
2. **Word count**: `text.split(/\s+/).length` with empty-string special case. Note that the regex matches one or more whitespace characters (spaces, tabs, newlines, etc.). The split has these pitfalls when leading/trailing whitespace is present:
   - `'hello world'.split(/\s+/)` → `['hello', 'world']` → 2 (correct).
   - `' hello world '.split(/\s+/)` → `['', 'hello', 'world', '']` → 4 (overcounts by 2).
   The empty-string-only special case only catches `''`; whitespace-only inputs return `2` (because `'   '.split(/\s+/)` → `['', '']`).
3. **Line count**: split on `\r\n`, `\r`, or `\n`. A single line with no trailing newline → 1; ending with `\n` → 2 because the trailing empty string after the newline is included.
4. **Byte size** is computed by `getStringSizeInBytes` in `text-statistics.service.ts`:
   ```ts
   export function getStringSizeInBytes(text: string) {
     return new TextEncoder().encode(text).buffer.byteLength;
   }
   ```
   `TextEncoder` always emits UTF-8. The result is the number of UTF-8 bytes (e.g. ASCII `'a'` → 1, `'😀'` → 4).
   
   That number is then passed to `formatBytes` (`@/utils/convert`):
   ```ts
   export function formatBytes(bytes: number, decimals = 2) {
     if (bytes === 0) return '0 Bytes';
     const k = 1024;
     const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
     const i = Math.floor(Math.log(bytes) / Math.log(k));
     return `${Number.parseFloat((bytes / k ** i).toFixed(decimals))} ${sizes[i]}`;
   }
   ```
   It uses **binary prefixes** (1 KB = 1024 Bytes), not decimal, despite labels like `KB`/`MB`. Two-decimal rounding via `toFixed(2)`.

## Dependencies
- **`@/utils/convert#formatBytes`** — formats byte counts as human-readable strings.
- **Native `TextEncoder`** — UTF-8 encoding for byte-length computation.
- **Naive UI**: `n-statistic`.
- **Custom `c-*`**: `c-card`, `c-input-text`.
- **Vue 3** (`ref`).

## Edge Cases & Validation
- **Empty input** → all stats display 0 (or `'0 Bytes'`). The empty-string check guards word and line counts.
- **Whitespace-only input** (e.g. `"   "`):
  - Character count: `3`.
  - Word count: `2` (overcount because `' '.split(/\s+/)` → `['', '']`).
  - Line count: `1`.
  - Byte size: `3 Bytes`.
  This is a known imprecision of the simple regex.
- **Leading/trailing whitespace around words** — overcounts words by 1–2 due to empty strings in the split result.
- **Multi-byte characters** — character count uses UTF-16 code units, so a 4-byte emoji like `'😀'` (a single user-perceived character) counts as `2` characters but `4` bytes.
- **Different newline conventions** — `\r\n` (Windows), `\n` (Unix), and `\r` (classic Mac) are all handled.
- **Trailing newline** — a string `"foo\n"` reports a line count of `2` because of the empty string after the newline.
- **Very large input** — all computations are O(n) and run synchronously on every keystroke; `TextEncoder` materializes the full byte array each time. Could be costly for multi-megabyte input, but the input is bound to a textarea so practical sizes are small.

## Examples
| Input | Char count | Word count | Line count | Byte size |
|-------|-----------:|-----------:|-----------:|-----------|
| `''` | `0` | `0` | `0` | `0 Bytes` |
| `'a'` | `1` | `1` | `1` | `1 Bytes` |
| `'aa'` | `2` | `1` | `1` | `2 Bytes` |
| `'hello world'` | `11` | `2` | `1` | `11 Bytes` |
| `'foo\nbar'` | `7` | `2` | `2` | `7 Bytes` |
| `'foo\n'` | `4` | `2` | `2` | `4 Bytes` |
| `'😀'` | `2` | `1` | `1` | `4 Bytes` |
| `'aaaaaaaaaa'` | `10` | `1` | `1` | `10 Bytes` |
| `'   '` (3 spaces) | `3` | `2` (overcounts) | `1` | `3 Bytes` |

(Byte sizes for the `'😀'` and `'aaaaaaaaaa'` rows are confirmed by `text-statistics.service.test.ts`.)

## File Structure
| File | Purpose |
|------|---------|
| `index.ts` | Tool registration metadata (name, path, description, keywords, icon, component loader, `redirectFrom: ['/text-stats']`). |
| `text-statistics.vue` | Vue UI: textarea + 4 statistic tiles. Word/line counting logic is inlined as template expressions. |
| `text-statistics.service.ts` | Single function `getStringSizeInBytes` using `TextEncoder` + `.buffer.byteLength`. |
| `text-statistics.service.test.ts` | Vitest tests for the byte-size function (empty, ASCII, emoji, repeated chars). |

## Notes
- **i18n:** title and description come from `tools.text-statistics.{title,description}`.
- **Redirect:** `/text-stats` redirects to `/text-statistics` (declared in `index.ts`).
- **Persistence:** none.
- **Icon:** `FileText` from `@vicons/tabler`.
- **No copy / export controls** — this tool is informational only.
- **Limitations to be aware of:**
  - The word-count regex is naive: it does not handle hyphenated words, leading/trailing whitespace, or Unicode word boundaries. Consumers expecting "exactly N words" should double-check.
  - Byte size labels read `KB`/`MB` but use binary prefixes (1024-base). For tweet-style limits expressed in *characters*, prefer the character count, not byte size.
  - Character count uses UTF-16 code units, not grapheme clusters; emoji and combining marks may count as more than one.
