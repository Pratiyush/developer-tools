# UUIDs generator

## Overview
- **Path:** `/uuid-generator`
- **Category:** Crypto
- **Description:** A Universally Unique Identifier (UUID) is a 128-bit number used to identify information in computer systems. The number of possible UUIDs is 16^32, which is 2^128 or about 3.4x10^38 (which is a lot!).
- **Keywords:** `uuid`, `v4`, `random`, `id`, `alphanumeric`, `identity`, `token`, `string`, `identifier`, `unique`, `v1`, `v3`, `v5`, `nil`
- **Redirect from:** None
- **Icon:** `Fingerprint` (from `@vicons/tabler`)
- **Created:** No `createdAt` (predates the field; never marked "new")

## Purpose
Generates one or more RFC 4122 UUIDs in a chosen version. Supports the all-zero NIL UUID, the time-and-MAC v1, the namespace+name MD5-hashed v3, the random v5-style cryptographic v4, and the namespace+name SHA-1-hashed v5. Useful when developers need quick test data, primary keys for inserts, namespaced IDs derived from URLs/DNS names, or to validate the format of an existing UUID.

## Inputs
| Field | Type | Default | Validation |
|-------|------|---------|------------|
| `version` | One of `'NIL' \| 'v1' \| 'v3' \| 'v4' \| 'v5'` (button select) | `'v4'` (persisted to `localStorage` key `uuid-generator:version`) | Constrained to the listed values |
| `count` | `number` (n-input-number) | `1` (persisted to `localStorage` key `uuid-generator:quantity`) | `min=1`, `max=50` |
| `v35Args.namespace` | `string` (UUID) — picker buttons + free text | `'6ba7b811-9dad-11d1-80b4-00c04fd430c8'` (URL namespace, in-memory only — not persisted) | Must match `^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$` or the NIL UUID `00000000-0000-0000-0000-000000000000` |
| `v35Args.name` | `string` | `''` | None |

The four pre-baked namespace presets exposed via `c-buttons-select`:

| Label | Value (RFC 4122 well-known namespace) |
|-------|----------------------------------------|
| DNS | `6ba7b810-9dad-11d1-80b4-00c04fd430c8` |
| URL | `6ba7b811-9dad-11d1-80b4-00c04fd430c8` |
| OID | `6ba7b812-9dad-11d1-80b4-00c04fd430c8` |
| X500 | `6ba7b814-9dad-11d1-80b4-00c04fd430c8` |

`v35Args.namespace` and `v35Args.name` inputs are only shown when `version === 'v3' || version === 'v5'`.

## Outputs
| Output | Type | Description |
|--------|------|-------------|
| `uuids` | `string` | A newline-separated list of `count` UUID strings (after refresh; readonly textarea, monospace, center-aligned) |

A "Copy" button copies the textarea contents; toast: `"UUIDs copied to the clipboard"`. A "Refresh" button regenerates the list (relevant for v1/v4 randomized output and for re-pulling a current timestamp in v1).

## UI / Components
- `c-buttons-select` for `version` with `label-width="100px"`.
- A row containing a 100 px label "Quantity" and `n-input-number` with `min=1`, `max=50`.
- For v3/v5 only: a buttons-select for the four well-known namespaces, a free-text `c-input-text` for the namespace UUID with the validation rule above, and a name field.
- `c-input-text` (multiline, autosize, monospace, readonly, center-aligned) showing the joined UUIDs. Style: `text-align: center; font-family: monospace`. A `<style scoped lang="less">` block with `::v-deep(.uuid-display) { textarea { text-align: center; } }` re-centers the textarea content because some Naive UI defaults left-align it.
- Buttons row (centered, `gap-3`): "Copy" (autofocus) and "Refresh".

## Logic / Algorithm
1. Read `version` and `count` from `useStorage`.
2. Build a `generators` map keyed by version:
   - `NIL`: returns the constant `nilUuid` (`'00000000-0000-0000-0000-000000000000'`).
   - `v1`: calls `uuid.v1` with explicit options every time, derived from the loop index — `clockseq: index`, `msecs: Date.now()`, `nsecs: Math.floor(Math.random() * 10000)`, `node: 6 random bytes`. This guarantees that batch v1 generation does not collide on the same millisecond.
   - `v3`: `uuid.v3(name, namespace)` — MD5 hashing.
   - `v4`: `uuid.v4()` — cryptographically random.
   - `v5`: `uuid.v5(name, namespace)` — SHA-1 hashing.
3. The reactive `uuids` value is built via the `computedRefreshable` composable: `Array.from({ length: count }, (_, index) => generator(index)).join('\n')`. Wrapped in `withDefaultOnError(..., '')` so an invalid namespace input returns an empty string rather than throwing.
4. The "Refresh" button calls the second tuple element (`refreshUUIDs`) which forces re-evaluation even when no inputs changed (useful for v1's clock-driven values and v4's randomness).
5. The "Copy" button uses the `useCopy` composable bound to `uuids`.

```ts
const generators = {
  NIL: () => nilUuid,
  v1: (index: number) => generateUuidV1({
    clockseq: index,
    msecs: Date.now(),
    nsecs: Math.floor(Math.random() * 10000),
    node: Array.from({ length: 6 }, () => Math.floor(Math.random() * 256)),
  }),
  v3: () => generateUuidV3(v35Args.value.name, v35Args.value.namespace),
  v4: () => generateUuidV4(),
  v5: () => generateUuidV5(v35Args.value.name, v35Args.value.namespace),
};
```

## Dependencies
- `uuid` (`^9.0.0`) — `v1`, `v3`, `v4`, `v5`, `NIL`.
- `@vueuse/core#useStorage` — persists `version` and `count` to `localStorage`.
- `@/composable/copy#useCopy` — clipboard copy with toast.
- `@/composable/computedRefreshable#computedRefreshable` — derived value with manual refresh trigger.
- `@/utils/defaults#withDefaultOnError` — wraps the generator so bad input doesn't crash.
- `@vicons/tabler#Fingerprint` — icon.

## Edge Cases & Validation
- **Quantity bounds:** `n-input-number` enforces 1–50; users cannot generate more than 50 UUIDs at once.
- **Invalid v3/v5 namespace:** validator regex flags non-UUID strings (NIL is permitted explicitly). When invalid, `uuid.v3`/`v5` would throw; `withDefaultOnError` catches and yields `''`, so the textarea goes blank.
- **Empty `name` for v3/v5:** still valid — produces a deterministic UUID derived from just the namespace.
- **NIL version:** ignores `count` semantics in spirit (you'll get the same NIL UUID repeated `count` times) since the generator always returns the same constant.
- **v1 collisions:** mitigated by combining `clockseq: index` with random `nsecs` and a random 6-byte `node` per call, making batch generation safe on the same machine within the same millisecond.
- **Refresh while a generator is invalid:** safe — produces empty output but does not throw.

## Examples
**Example 1 — Default v4, quantity 3**
- Inputs: `version='v4'`, `count=3`
- Output (random; example):
  ```
  3f6d80b4-1f47-4cef-9bd2-7df0c4f3eb29
  c2a90b1f-09c8-4c5d-bd80-b3a05a37b6de
  9c1b1d40-4ad6-4a47-9f7c-cb1f6a32eaa1
  ```

**Example 2 — v5 with URL namespace and name `https://example.com`**
- Inputs: `version='v5'`, `count=1`, `namespace='6ba7b811-9dad-11d1-80b4-00c04fd430c8'`, `name='https://example.com'`
- Output: `cfbff0d1-9375-5685-968a-48ce8b50e3a5` (deterministic — running again produces the same UUID).

**Example 3 — NIL**
- Inputs: `version='NIL'`, `count=2`
- Output:
  ```
  00000000-0000-0000-0000-000000000000
  00000000-0000-0000-0000-000000000000
  ```

## File Structure
| File | Purpose |
|------|---------|
| `index.ts` | Tool metadata: name, path `/uuid-generator`, keywords, icon `Fingerprint`. |
| `uuid-generator.vue` | Single-file component — all state, generation logic, validation, and view. |

## Notes
- **i18n:** title/description from `tools.uuid-generator.title` / `.description`. All other UI strings are hard-coded English.
- **Persistence:** `version` and `count` persist via `localStorage`; namespace/name do not.
- **Accessibility:** the textarea is readonly with `aria` defaults from Naive UI; "Copy" auto-focuses on mount, allowing keyboard copy via Enter without tabbing.
- **Performance:** generation is synchronous; even at the 50-item cap the cost is negligible.
