# Outlook Safelink Decoder

## Overview
- **Path:** `/safelink-decoder`
- **Category:** Web
- **Description:** Decode Outlook SafeLink links
- **Display name:** "Outlook Safelink decoder"
- **Keywords:** outlook, safelink, decoder
- **Redirect from:** None
- **Created:** 2024-03-11
- **Icon:** `Mailbox` (from `@vicons/tabler`)

## Purpose
Microsoft 365 / Exchange Online's "Safe Links" feature rewrites every URL in inbound emails into a tracking redirector under `*.safelinks.protection.outlook.com`, embedding the original URL inside a `url=` query parameter alongside `data=`, `sdata=`, and `reserved=` opaque tracking blobs. This tool reverses the rewrite — paste the wrapped URL, get back the original. Useful for previewing where a link actually goes, archiving cleaner URLs, or copy-pasting links from quoted-text email replies.

## Inputs

| Name | Type | Default | Validation |
|------|------|---------|------------|
| `inputSafeLinkUrl` | string | `''` | Must contain the substring matching `/\.safelinks\.protection\.outlook\.com/`. If not, the tool throws `Error('Invalid SafeLinks URL provided')` and the error message is displayed in the output area instead of a URL. |

The input is rendered with `raw-text` mode (no formatting/escaping), `autofocus`, and the label "Your input Outlook SafeLink Url:".

## Outputs

| Name | Type | Description |
|------|------|-------------|
| `outputDecodedUrl` | string | The decoded original URL — the value of the `url` query parameter, automatically URL-decoded by `URLSearchParams`. If the input is invalid, the textarea instead shows the stringified error (`"Error: Invalid SafeLinks URL provided"`). |

The output is rendered in a `<TextareaCopyable :word-wrap="true" />` for one-click copying.

## UI / Components
- `c-input-text` (raw, autofocus) — the input.
- `n-divider` — visual separator.
- `n-form-item` "Output decoded URL:" wrapping `<TextareaCopyable>` — the output, with word-wrap on so long URLs wrap rather than horizontally scroll.

Layout is a single column with no extra cards.

## Logic / Algorithm

### `decodeSafeLinksURL(safeLinksUrl)` (`safelink-decoder.service.ts`)
```ts
export function decodeSafeLinksURL(safeLinksUrl: string) {
  if (!safeLinksUrl.match(/\.safelinks\.protection\.outlook\.com/)) {
    throw new Error('Invalid SafeLinks URL provided');
  }
  return new URL(safeLinksUrl).searchParams.get('url');
}
```

The function:
1. Validates that the URL belongs to the SafeLinks domain via a substring regex (`.safelinks.protection.outlook.com`). The leading `.` is intentional — it ensures `safelinks.protection.outlook.com` is a subdomain (e.g., `aus01.safelinks.protection.outlook.com`, `eur02.safelinks…`).
2. Parses the input as a `URL` object, leveraging the built-in `URLSearchParams` to extract the `url` parameter. `URLSearchParams.get` automatically percent-decodes the value.
3. Returns the decoded URL or `null` if the `url` param is missing.

### Component glue
The Vue file wraps the call in `try`/`catch`:
```ts
const outputDecodedUrl = computed(() => {
  try { return decodeSafeLinksURL(inputSafeLinkUrl.value); }
  catch (e: any) { return e.toString(); }
});
```
So invalid inputs produce a human-readable error in the output area rather than crashing.

### HTML-entity handling
Some users paste a SafeLink URL as it appears in an email's HTML source, where `&` is encoded as `&amp;`. The `URL` constructor still parses these — it treats `&amp;` as a key (`amp`) and `=...` as its value, so the actual `url=...` segment (the first one) is parsed correctly. The unit test `should decode encoded safelink urls` confirms this: a URL containing `&amp;data=...` decodes to the same result as the unencoded form.

## Dependencies
- Native `URL` / `URLSearchParams` — no third-party libraries.
- `@vicons/tabler` (`Mailbox` icon).
- Internal: `c-input-text`, `n-divider`, `n-form-item`, `TextareaCopyable`.

## Edge Cases & Validation

| Case | Behavior |
|------|----------|
| Empty input | `''.match(/.../)` is `null` → throws `Invalid SafeLinks URL provided` → output shows error string. |
| Non-SafeLinks URL (e.g., `https://google.com`) | Throws → error string shown (per unit test). |
| SafeLinks URL without a `url` param | `searchParams.get('url')` returns `null` → output is the literal string `null`. |
| URL with HTML-encoded ampersands (`&amp;`) | Decoded correctly; the `url` parameter is found before any malformed segments. |
| URL with multiple `url=` query keys | `URLSearchParams.get` returns the first occurrence. |
| Whitespace around the URL | `URL` constructor would throw for leading whitespace, caught by the outer try/catch and shown as an error string. |
| Hash fragment in inner URL | The `url` value can contain `#...`; `URLSearchParams.get` returns the entire encoded fragment correctly. |
| `https://safelinks.protection.outlook.com` (no subdomain) | Does **not** match the regex (which requires a leading `.`); throws. |

## Examples

### Test fixtures (from `safelink-decoder.service.test.ts`)

1. **Plain SafeLink URL**
   - Input: `https://aus01.safelinks.protection.outlook.com/?url=https%3A%2F%2Fwww.google.com%2Fsearch%3Fq%3Dsafelink%26rlz%3D1&data=05%7C02%7C...&sdata=...&reserved=0`
   - Output: `https://www.google.com/search?q=safelink&rlz=1`

2. **HTML-encoded SafeLink URL** (`&` → `&amp;`)
   - Input: `https://aus01.safelinks.protection.outlook.com/?url=https%3A%2F%2Fwww.google.com%2Fsearch%3Fq%3Dsafelink%26rlz%3D1&amp;data=...&amp;sdata=...&amp;reserved=0`
   - Output: `https://www.google.com/search?q=safelink&rlz=1`

3. **Non-SafeLink URL**
   - Input: `https://google.com`
   - Output: `Error: Invalid SafeLinks URL provided`

## File Structure
- `index.ts` — Tool registration: hard-coded English `name: 'Outlook Safelink decoder'`, `description: 'Decode Outlook SafeLink links'`, keywords, `Mailbox` icon, `createdAt: 2024-03-11`. (Bypasses i18n, similar to `regex-tester`/`regex-memo`.)
- `safelink-decoder.vue` — Tiny single-file component: input, divider, output via `TextareaCopyable`. Wraps the service in a try/catch.
- `safelink-decoder.service.ts` — Pure function `decodeSafeLinksURL` (8 lines).
- `safelink-decoder.service.test.ts` — Vitest tests covering plain decoding, HTML-encoded decoding, and the invalid-domain throw.

## Notes
- The validator only checks the **substring** `.safelinks.protection.outlook.com`, not the actual host of the URL. A URL whose path or query contains that substring (but whose host is something else) would falsely pass the check, then likely fail downstream when `URL(...).searchParams.get('url')` returns `null`.
- The output is **not** further normalized — if the wrapped URL itself contained percent-encoding beyond what `searchParams.get` decodes (e.g., the user wants `+` to become space), no extra decoding is performed.
- No persistence. The input clears on reload; this is desirable for privacy since SafeLinks URLs often contain personal `data=` blobs.
- The output area shows the literal string `null` when the `url` parameter is missing — could be misread as success.
- Uses native `URL` parsing so behaves consistently across modern browsers; falls in line with how email clients and downstream tools would process the same URL.
