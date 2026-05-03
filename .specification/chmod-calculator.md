# Chmod calculator

## Overview
- **Path:** `/chmod-calculator`
- **Category:** Development
- **Description:** Compute your chmod permissions and commands with this online chmod calculator.
- **Keywords:** chmod, calculator, file, permission, files, directory, folder, recursive, generator, octal
- **Redirect from:** None

## Purpose
The chmod calculator helps users compute Unix file permissions interactively. By toggling read/write/execute checkboxes for the three permission scopes (owner, group, public), the user gets the equivalent octal numeric representation (e.g. `755`) and the symbolic representation (e.g. `rwxr-xr-x`) in real time. It also outputs the full `chmod <octal> path` command, ready to be copied into a terminal. This is useful for system administrators, developers, and anyone managing Unix/Linux file permissions who would rather click checkboxes than memorize octal arithmetic.

## Inputs
A 3x3 matrix of boolean checkboxes representing permissions:

| Field | Type | Default | Validation |
|---|---|---|---|
| `permissions.owner.read` | boolean | `false` | n/a |
| `permissions.owner.write` | boolean | `false` | n/a |
| `permissions.owner.execute` | boolean | `false` | n/a |
| `permissions.group.read` | boolean | `false` | n/a |
| `permissions.group.write` | boolean | `false` | n/a |
| `permissions.group.execute` | boolean | `false` | n/a |
| `permissions.public.read` | boolean | `false` | n/a |
| `permissions.public.write` | boolean | `false` | n/a |
| `permissions.public.execute` | boolean | `false` | n/a |

The TypeScript types are defined in `chmod-calculator.types.ts`:
```ts
export type Scope = 'read' | 'write' | 'execute';
export type Group = 'owner' | 'group' | 'public';
export type GroupPermissions = { [k in Scope]: boolean };
export type Permissions = { [k in Group]: GroupPermissions };
```

## Outputs
| Output | Type | Description |
|---|---|---|
| Octal representation | string | A 3-digit octal number such as `"755"` or `"000"` representing combined permission bits |
| Symbolic representation | string | A 9-character string such as `"rwxr-xr-x"` |
| Copyable command | string | The full ready-to-paste command: `` `chmod ${octal} path` `` |

## UI / Components
- A `n-table` (Naive UI) with no border serves as the permission grid:
  - Column headers: `Owner (u)`, `Group (g)`, `Public (o)`
  - Row headers: `Read (4)`, `Write (2)`, `Execute (1)` — the numeric weight is shown alongside the label
  - Each cell contains an `n-checkbox` of size `large`, two-way bound to `permissions[group][scope]`
- Below the table, two large centered displays (50px monospace, primary theme color) showing the octal and symbolic representations
- An `InputCopyable` component at the bottom rendering `` chmod <octal> path `` in read-only mode with a copy button
- Responsive: cell padding shrinks from 15px to 5px on screens under 600px wide
- Comment in template suggests an `n-switch` was considered but a checkbox was chosen

## Logic / Algorithm
Two pure functions in `chmod-calculator.service.ts`:

### `computeChmodOctalRepresentation({ permissions })`
1. Define value mapping: `{ read: 4, write: 2, execute: 1 }`.
2. For each of the three groups (owner, group, public):
   - Sum the values for each scope where the boolean is `true`.
3. Concatenate the three resulting digits into a string.

### `computeChmodSymbolicRepresentation({ permissions })`
1. Define character mapping: `{ read: 'r', write: 'w', execute: 'x' }`.
2. For each of the three groups:
   - For each scope, append the letter if `true`, else append `'-'`.
3. Concatenate the three 3-letter blocks into a 9-character string.

Both functions iterate via `_.reduce` on lodash. Outputs update reactively because of Vue `computed` wrappers.

## Dependencies
- `vue` — reactivity (`ref`, `computed`)
- `naive-ui` — `n-table`, `n-checkbox`, plus `useThemeVars` for styling
- `lodash` (`^4.17.21`) — `_.reduce`, `_.get` for composing permission values
- `@vicons/tabler` — icon `FileInvoice`
- Internal `InputCopyable` component
- `@/plugins/i18n.plugin` — `translate` for localized title/description

## Edge Cases & Validation
- Inputs are pure booleans, so there is no parsing or runtime validation needed.
- All checkboxes unchecked → octal `000` and symbolic `---------`.
- All checkboxes checked → octal `777` and symbolic `rwxrwxrwx`.
- The tool does not handle special bits (setuid, setgid, sticky bit) — only the standard 3-digit chmod permissions.
- The output `chmod <octal> path` is a literal placeholder; the user must replace `path` themselves before running it.
- No way to enter an octal directly to compute the inverse (UI is one-way: checkboxes → octal/symbolic).

## Examples
**Example 1 (full permissions):**
- Inputs: all 9 boxes checked
- Octal: `777`
- Symbolic: `rwxrwxrwx`
- Command: `chmod 777 path`

**Example 2 (mixed):**
- Inputs:
  - owner: write only
  - group: write + execute
  - public: read + execute
- Octal: `235` (owner=2, group=3, public=5)
- Symbolic: `-w--wxr-x`
- Command: `chmod 235 path`

**Example 3 (one bit per group):**
- Inputs:
  - owner: read only (4)
  - group: write only (2)
  - public: execute only (1)
- Octal: `421`
- Symbolic: `r---w---x`

## File Structure
- `index.ts` — Tool registration via `defineTool`; declares route, name, keywords, icon, lazy-loaded component
- `chmod-calculator.vue` — UI: 3x3 checkbox grid, octal/symbolic outputs, copyable command
- `chmod-calculator.service.ts` — Pure functions `computeChmodOctalRepresentation` and `computeChmodSymbolicRepresentation`
- `chmod-calculator.service.test.ts` — Vitest unit tests covering octal and symbolic outputs for several permission combinations (777, 000, 235, 421, 124, 222)
- `chmod-calculator.types.ts` — TypeScript types `Scope`, `Group`, `GroupPermissions`, `Permissions`

## Notes
- No persistence (`useStorage`); state resets on page reload.
- No undo/redo or history of computed values.
- The icon `FileInvoice` from `@vicons/tabler` is used in tool listings.
- i18n: title/description are translated via the `translate('tools.chmod-calculator.*')` keys; the in-component labels (`Owner (u)`, `Read (4)`, etc.) are hard-coded English.
- The tool is purely client-side; no network calls.
