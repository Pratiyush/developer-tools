# User-agent parser

## Overview
- **Path:** `/user-agent-parser`
- **Category:** Web
- **Description:** Detect and parse Browser, Engine, OS, CPU, and Device type/model from an user-agent string.
- **Keywords:** `user`, `agent`, `parser`, `browser`, `engine`, `os`, `cpu`, `device`, `user-agent`, `client`
- **Redirect from:** None
- **Icon:** `Browser` (from `@vicons/tabler`)
- **Created:** 2023-04-06

## Purpose
The User-agent parser takes an HTTP `User-Agent` header string and dissects it into structured information about the client: browser name and version, layout/rendering engine, operating system, device hardware, and CPU architecture. A user pastes any UA string (e.g. one captured from server logs or `navigator.userAgent`) and immediately sees a card-based breakdown of what software/hardware sent that header, useful for analytics, debugging cross-browser issues, and identifying bots or unusual clients. The tool pre-populates the input with the visitor's own `navigator.userAgent` so it is immediately useful as a "what am I?" lookup.

## Inputs
| Field | Type | Default | Validation |
|-------|------|---------|------------|
| `ua` (User agent string) | `string` (multiline textarea) | `navigator.userAgent` (the visitor's own UA at component-mount time) | None — any string is accepted; empty input intentionally yields an empty result rather than parsing the visitor's UA |

UI attributes on the input: `multiline`, `clearable`, `raw-text`, `rows="2"`, `autosize`, `monospace`, placeholder `"Put your user-agent here..."`.

## Outputs
The output is rendered as five informational cards (in a responsive grid: 1 column on small screens, 2 columns on `s:` breakpoint and above). For every field, when `ua-parser-js` returns `undefined`, a dimmed fallback message is shown instead of an empty tag.

| Section | Field | Source from `UAParser.IResult` | Undefined fallback |
|---------|-------|---------------------------------|---------------------|
| **Browser** (`Browser` icon) | Name | `browser.name` | `No browser name available` |
| | Version | `browser.version` | `No browser version available` |
| **Engine** (`Engine` icon) | Name | `engine.name` | `No engine name available` |
| | Version | `engine.version` | `No engine version available` |
| **OS** (`Adjustments` icon) | Name | `os.name` | `No OS name available` |
| | Version | `os.version` | `No OS version available` |
| **Device** (`Devices` icon) | Model | `device.model` | `No device model available` |
| | Type | `device.type` | `No device type available` |
| | Vendor | `device.vendor` | `No device vendor available` |
| **CPU** (`Cpu` icon) | Architecture | `cpu.architecture` | `No CPU architecture available` |

Each defined value is rendered as a green `n-tag` (size `large`, `round`, no border) with a tooltip showing the field label. Undefined values are rendered as plain dimmed text (opacity `op-70`).

## UI / Components
- **Input area:** `c-input-text` styled monospace, autosize textarea labeled "User agent string".
- **Result cards:** `n-grid` with `:x-gap="12"` and `:y-gap="8"`, `cols="1 s:2"` responsive. Each card (`c-card h-full`) has:
  - A header row with a 30 px tabler icon (`n-icon`, `:depth="3"`) and a section heading (`text-lg`).
  - A flex row of green tags wrapped in `c-tooltip` showing label-on-hover.
  - A column of fallback messages for undefined fields.
- The card list is delegated to a sibling component `UserAgentResultCards` driven by an array of `UserAgentResultSection` descriptors.

## Logic / Algorithm
1. Initialize `ua` ref with `navigator.userAgent`.
2. On every change to `ua`, run `getUserAgentInfo(ua.value)`:
   - `userAgent.trim().length > 0` → return `UAParser(userAgent.trim())`.
   - Otherwise → return a hand-built empty result `{ ua: '', browser: {}, cpu: {}, device: {}, engine: {}, os: {} }`.
   - This avoids the default behavior where `UAParser('')` returns the host browser's parsed UA, which would be confusing.
3. Wrap with `withDefaultOnError(...)` so any thrown error in parsing yields `undefined` rather than crashing the view.
4. For each section descriptor, the template invokes `getValue(userAgentInfo)` to extract the field; truthy values render as a tag, undefined values render the fallback string.

```ts
function getUserAgentInfo(userAgent: string) {
  return userAgent.trim().length > 0
    ? UAParser(userAgent.trim())
    : ({ ua: '', browser: {}, cpu: {}, device: {}, engine: {}, os: {} } as UAParser.IResult);
}
```

## Dependencies
- `ua-parser-js` (`^1.0.35`) — the entire parsing engine; one call to `UAParser(string)` returns `IResult` with `browser`, `cpu`, `device`, `engine`, `os`, and `ua` fields.
- `@vicons/tabler` — icons (`Browser`, `Adjustments`, `Cpu`, `Devices`, `Engine`).
- `naive-ui` — `n-grid`, `n-gi`, `n-icon`, `n-tag` (rendered via `c-card`, `c-tooltip`, `c-input-text` wrapper components).
- `@/utils/defaults#withDefaultOnError` — error-safe computation wrapper.

## Edge Cases & Validation
- **Empty input:** explicitly returns an empty `IResult` so all five cards display only fallback strings (no parsing of the host browser's UA).
- **Whitespace-only input:** `trim()` yields empty → same as empty input above.
- **Malformed/garbage strings:** `ua-parser-js` is lenient — it never throws, just returns `undefined` for fields it cannot identify. Any unexpected throw is caught by `withDefaultOnError`, leaving `userAgentInfo` as `undefined`.
- **Partial matches:** sections with only some fields populated render the available tags and fallback text for the missing ones, side by side.
- The input has no length cap or input sanitization beyond `trim()`.

## Examples
**Example 1 — Chrome on macOS**
- Input: `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36`
- Output:
  - Browser: `Chrome` / `120.0.0.0`
  - Engine: `Blink` / `120.0.0.0`
  - OS: `Mac OS` / `10.15.7`
  - Device: (all three fallbacks — Desktop UA has no device)
  - CPU: (architecture fallback)

**Example 2 — iPhone**
- Input: `Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1`
- Output:
  - Browser: `Mobile Safari` / `17.0`
  - Engine: `WebKit` / `605.1.15`
  - OS: `iOS` / `17.0`
  - Device: model `iPhone`, type `mobile`, vendor `Apple`
  - CPU: (fallback, since iPhone UA does not declare CPU arch)

## File Structure
| File | Purpose |
|------|---------|
| `index.ts` | Tool metadata: name, path `/user-agent-parser`, keywords, icon `Browser`, lazy component import. |
| `user-agent-parser.vue` | Main view: input field, computed `userAgentInfo`, declarative `sections` array, mounts `UserAgentResultCards`. |
| `user-agent-result-cards.vue` | Renders the cards grid from a `sections[]` definition and the parsed result. |
| `user-agent-parser.types.ts` | Exports the `UserAgentResultSection` interface (`heading`, optional `icon`, and a `content` array of `{label, getValue, undefinedFallback?}`). |

## Notes
- **i18n:** title and description come from `tools.user-agent-parser.title` / `.description` keys. Section headings, field labels, and fallback strings are hard-coded English in the `.vue` (not translated).
- **Persistence:** none — input is not saved with `useStorage`; the field always starts at the visitor's current UA on each visit.
- **Accessibility:** tooltips disclose the underlying field label for each tag; icons are decorative (no `aria-label`).
- **Test coverage:** no `.test.ts` or `.spec.ts` for this tool — behavior is delegated to `ua-parser-js`.
