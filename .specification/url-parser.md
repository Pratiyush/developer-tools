# URL Parser

## Overview
- **Path:** `/url-parser`
- **Category:** Web
- **Description:** Parse a URL into its separate constituent parts (protocol, origin, params, port, username-password, ...).
- **Keywords:** `url`, `parser`, `protocol`, `origin`, `params`, `port`, `username`, `password`, `href`
- **Redirect from:** None
- **Icon:** `Unlink` from `@vicons/tabler`
- **Created at:** Not specified

## Purpose
Takes a single URL and breaks it into its constituent parts for easy inspection: protocol, username/password, hostname, port, path, search/query string, plus each query parameter pair on its own row. Useful for debugging deep-link parameters, extracting credentials from a URI, or quickly understanding a malformed URL pasted from logs. Each rendered field is independently copyable via the shared `<InputCopyable>` component.

## Inputs
| Name | Type | Default | Validation |
| ---- | ---- | ------- | ---------- |
| `urlToParse` | `string` (single-line input) | `'https://me:pwd@it-tools.tech:3000/url-parser?key1=value&key2=value2#the-hash'` | Must construct successfully via `new URL(value)`. Failure displays the inline message: **"Invalid url"**. |

The input is a single `c-input-text` with `raw-text` and a `validation-rules` prop.

## Outputs
The parsed URL is rendered as seven labelled, read-only `<InputCopyable>` rows derived from the `URL` object plus a dynamic list of query-parameter rows.

| Field | Source | Notes |
| ----- | ------ | ----- |
| `Protocol` | `urlParsed.protocol` | E.g. `https:`, `http:`, `ftp:` (always includes the trailing colon). |
| `Username` | `urlParsed.username` | Empty string if no `user:` part. |
| `Password` | `urlParsed.password` | Empty string if absent. |
| `Hostname` | `urlParsed.hostname` | Domain or IP without port. |
| `Port` | `urlParsed.port` | Empty string for default ports (80 for http, 443 for https). |
| `Path` | `urlParsed.pathname` | Includes leading `/`. |
| `Params` | `urlParsed.search` | The full `?key=value&...` string (with leading `?`); empty if no query. |

Below those, the component iterates over `urlParsed.searchParams` entries:
- For each entry `[key, value]`, render an arrow icon (`icon-mdi-arrow-right-bottom`) plus two `<InputCopyable>` fields side-by-side: the parameter name and its value.

Note: `URL` properties **NOT** displayed include `href`, `origin`, `host`, and `hash` — the keyword list mentions `href` but it is not rendered as its own row. The hash (e.g. `#the-hash`) is parsed but not surfaced as a separate field.

## UI / Components
Layout:

```vue
<c-card>
  <c-input-text v-model:value="urlToParse" label="Your url to parse:" placeholder="Your url to parse..." raw-text :validation-rules="urlValidationRules" />
  <n-divider />
  <InputCopyable v-for="{ title, key } in properties" ... :label="title" :value="(urlParsed?.[key] as string) ?? ''" readonly label-position="left" label-width="110px" mb-2 placeholder=" " />
  <div v-for="[k, v] in Object.entries(Object.fromEntries(urlParsed?.searchParams.entries() ?? []))" :key="k" mb-2 w-full flex>
    <div style="flex: 1 0 110px"><icon-mdi-arrow-right-bottom /></div>
    <InputCopyable :value="k" readonly />
    <InputCopyable :value="v" readonly />
  </div>
</c-card>
```

Details:
- `<InputCopyable>` (in `src/components/InputCopyable.vue`) wraps `c-input-text` and adds a circular text-variant copy button in the suffix slot with a tooltip toggling between `"Copy to clipboard"` and `"Copied!"`. It does **not** show a toast (`createToast: false`), so feedback is via the tooltip text only.
- All rows for the seven fixed properties have `label-width="110px"` and `label-position="left"`. The query-param rows mirror that with a 110px-wide spacer column for alignment.
- The placeholder for property rows is a single space (`" "`) to keep input height consistent when empty.
- A `<n-divider>` separates the input from the parsed output.

## Logic / Algorithm
```ts
const urlToParse = ref('https://me:pwd@it-tools.tech:3000/url-parser?key1=value&key2=value2#the-hash');

const urlParsed = computed(() => withDefaultOnError(() => new URL(urlToParse.value), undefined));
const urlValidationRules = [
  { validator: (value: string) => isNotThrowing(() => new URL(value)), message: 'Invalid url' },
];

const properties: { title: string; key: keyof URL }[] = [
  { title: 'Protocol', key: 'protocol' },
  { title: 'Username', key: 'username' },
  { title: 'Password', key: 'password' },
  { title: 'Hostname', key: 'hostname' },
  { title: 'Port', key: 'port' },
  { title: 'Path', key: 'pathname' },
  { title: 'Params', key: 'search' },
];
```

Step-by-step:
1. The input string is parsed by the WHATWG `URL` constructor. If it throws (malformed / not absolute), the computed catches via `withDefaultOnError(..., undefined)` and the field rows fall back to `''` because of the `urlParsed?.[key] ?? ''` access.
2. The validator runs in parallel via `useValidation`-style rules, surfacing the inline error `"Invalid url"`.
3. The fixed seven rows are rendered from the `properties` array.
4. The dynamic query-param rows are built by:
   - `urlParsed?.searchParams.entries()` — iterator of `[key, value]` tuples; falsey-coalesced to `[]`.
   - `Object.fromEntries(...)` — collapse to a plain object (this drops duplicate keys, keeping only the last occurrence!).
   - `Object.entries(...)` — iterate to render the rows.
5. The `key` of the `v-for` loop is the parameter name, which would warn on duplicates — but duplicates are already eliminated by step 4's `Object.fromEntries`.

## Dependencies
- `@/components/InputCopyable.vue` — copy-button-augmented input.
- `@/utils/boolean` — `isNotThrowing` for the validator.
- `@/utils/defaults` — `withDefaultOnError`.
- `@vicons/tabler` — `Unlink` icon for the tool entry.
- `icon-mdi-arrow-right-bottom` — auto-imported icon component.
- Native WHATWG `URL` API. No third-party URL parser.
- `n-divider` from Naive UI.
- `useCopy` (transitively, via `<InputCopyable>`) — uses `@vueuse/core` `useClipboard`.

## Edge Cases & Validation
- **Empty input:** `new URL('')` throws → validator fires `"Invalid url"`, all property rows render empty strings, no query-param rows render.
- **Relative URL (e.g. `/foo?bar=1`):** `new URL` requires a base; this throws → validator fires.
- **URL without a scheme (e.g. `example.com`):** Throws → validator fires.
- **URL with no port:** `port` is empty string. (For default ports, `port` is also empty even if explicitly written.)
- **URL with no credentials:** Both `username` and `password` are empty strings.
- **URL with no query:** `search` is `''` and the dynamic block emits no rows.
- **URL with duplicate query keys (e.g. `?a=1&a=2`):** `searchParams.entries()` yields both, but `Object.fromEntries` keeps only the last (`{ a: '2' }`). Only one row is rendered. The full original query is still visible in the `Params` field.
- **URL with hash:** `#the-hash` is parsed but not displayed as a labelled row. It is, however, included if you reconstruct via `href`.
- **IPv6 hosts:** `hostname` returns the IPv6 in bracketed form for v6 (`[::1]`).
- **IDN / Unicode hostnames:** Normalised by the URL parser to their punycode/ASCII form.
- **Userinfo with special characters:** `username`/`password` are returned percent-encoded by the URL API.

## Examples

**Default input:** `https://me:pwd@it-tools.tech:3000/url-parser?key1=value&key2=value2#the-hash`

| Field | Value |
| ----- | ----- |
| Protocol | `https:` |
| Username | `me` |
| Password | `pwd` |
| Hostname | `it-tools.tech` |
| Port | `3000` |
| Path | `/url-parser` |
| Params | `?key1=value&key2=value2` |

Plus two query-parameter rows:
- `key1` → `value`
- `key2` → `value2`

(The hash `the-hash` is parsed but not rendered.)

**Example 2:** `http://example.com`

| Field | Value |
| ----- | ----- |
| Protocol | `http:` |
| Username | `''` |
| Password | `''` |
| Hostname | `example.com` |
| Port | `''` (default 80) |
| Path | `/` |
| Params | `''` |

No dynamic rows.

**Example 3 — invalid:** `not a url` → validator shows `"Invalid url"`, all output rows empty.

## File Structure
- `index.ts` — Tool descriptor.
- `url-parser.vue` — Single Vue component with the input, validation, fixed property rows, and dynamic query-param rows.

No services file, no unit tests, no e2e tests in this folder.

## Notes
- Uses the **native** WHATWG `URL` API exclusively — no third-party parser.
- Each output row is individually copyable via `<InputCopyable>`'s suffix copy button (with tooltip feedback rather than a toast).
- The component only relies on a small subset of `URL` properties; `href`, `origin`, `host`, and `hash` are not surfaced.
- Default seed value is a fully-fledged URL with all components present, providing a concrete worked example on first render.
- Title and description are i18n-translated; UI labels (`"Protocol"`, `"Username"`, etc.), placeholder, and validation message are hardcoded English.
- No persistence; the input is session-scoped.
- Styling: `.n-input-group-label { text-align: right }` and `.n-input-group { margin: 2px 0 }` are scoped to the component.
