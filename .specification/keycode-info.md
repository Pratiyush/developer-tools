# Keycode info

## Overview
- **Path:** `/keycode-info`
- **Category:** Web
- **Description:** Translated via i18n key `tools.keycode-info.description` (e.g. "Find out the JavaScript keycode, code, location, and modifiers of any pressed key.").
- **Keywords:** keycode, info, code, javascript, event, keycodes, which, keyboard, press, modifier, alt, ctrl, meta, shift
- **Redirect from:** None
- **Created at:** Not set in metadata
- **Icon:** `Keyboard` from `@vicons/tabler`
- **i18n:** Title and description come from `translate('tools.keycode-info.title')` / `.description`.

## Purpose
Captures keystrokes anywhere on the page and shows the resulting `KeyboardEvent` properties so a developer can quickly check what `key`, `keyCode`, `code`, `location`, and modifier state JavaScript will see for any physical or virtual key. Useful for building keyboard shortcuts, validating keypress handlers, or debugging cross-platform/keyboard-layout issues.

## Inputs
| Name | Type | Default | Validation |
| --- | --- | --- | --- |
| Key press | KeyboardEvent (captured globally via `document.keydown`) | None — empty state shown until a key is pressed. | None — every key press is captured and displayed; modifier keys (Ctrl/Alt/Meta/Shift) are tracked separately. |

There is no text input; the user simply presses a key while the page has focus.

## Outputs
| Name | Type | Description |
| --- | --- | --- |
| Pressed key (large display) | string (`event.key`) | Rendered in 3xl text inside the centered card before any rows. Hidden until a key has been pressed. |
| Key | string | `event.key` — the value the key represents (e.g. `"a"`, `"Enter"`, `"ArrowLeft"`). |
| Keycode | string | `String(event.keyCode)` — the legacy numeric keycode (deprecated DOM property but still surfaced for compatibility). |
| Code | string | `event.code` — the physical key code (e.g. `"KeyA"`, `"Enter"`, `"ArrowLeft"`). Layout-independent. |
| Location | string | `String(event.location)` — `0` (standard), `1` (left), `2` (right), or `3` (numpad). |
| Modifiers | string | `+`-separated list of currently held modifier flags from the event: `Meta`, `Shift`, `Ctrl`, `Alt`. Empty if none. Falls back to placeholder "None" when blank. |

Each output row is rendered through `<InputCopyable>` (read-only) so the user can copy any individual value to the clipboard.

## UI / Components
- A `<c-card>` at the top, centered text, large `py-12`. Inside:
  - When a key has been pressed: the `event.key` rendered at `text-3xl` and `mb-2`.
  - Always shown: the dimmed instruction "Press the key on your keyboard you want to get info about this key".
- Below the card: a vertical stack of `<n-input-group>` rows. Each row has:
  - A fixed-width (150px) `<n-input-group-label>` with the field label.
  - A read-only `<InputCopyable>` for the captured value.
- The five rows: Key, Keycode, Code, Location, Modifiers. Until the first keypress, `fields` is an empty array and only the card with the prompt is shown.

## Logic / Algorithm
1. The component holds a single ref `event = ref<KeyboardEvent>()`.
2. `useEventListener(document, 'keydown', e => { event.value = e })` from `@vueuse/core` registers a global `keydown` listener that updates the ref on every keypress; the listener is automatically removed when the component unmounts.
3. A `computed` named `fields` builds an array of five `{ label, value, placeholder }` objects from the latest event, returning `[]` until the first key press:
   ```ts
   const fields = computed(() => {
     if (!event.value) return [];
     return [
       { label: 'Key :',       value: event.value.key,                placeholder: 'Key name...' },
       { label: 'Keycode :',   value: String(event.value.keyCode),    placeholder: 'Keycode...' },
       { label: 'Code :',      value: event.value.code,               placeholder: 'Code...' },
       { label: 'Location :',  value: String(event.value.location),   placeholder: 'Code...' },
       { label: 'Modifiers :', value: [
           event.value.metaKey  && 'Meta',
           event.value.shiftKey && 'Shift',
           event.value.ctrlKey  && 'Ctrl',
           event.value.altKey   && 'Alt',
         ].filter(Boolean).join(' + '),
         placeholder: 'None' },
     ];
   });
   ```
4. The template renders the card and iterates `fields` in order to render the rows. Modifiers are joined with " + " (e.g. `Meta + Shift`).

## Dependencies
- `@vueuse/core` (`useEventListener`) — automatically managed DOM event subscription.
- `@/components/InputCopyable.vue` — read-only input with copy-to-clipboard button.
- Naive UI components: `n-card` (via the project's `<c-card>`), `n-input-group`, `n-input-group-label`.

## Edge Cases & Validation
- **No keypress yet:** the row block is empty; only the prompt card is shown.
- **Modifier-only press (e.g. just `Shift`):** all five rows render — `key=Shift`, `code=ShiftLeft` (or `ShiftRight`), modifier list `Shift`.
- **Sticky modifier values:** the captured event is whatever the user last released the keydown of; pressing a key with multiple modifiers held shows them all simultaneously in the Modifiers row.
- **Browser shortcuts (Ctrl+S, Ctrl+W, etc.):** the listener does not call `preventDefault()`, so browser shortcuts still execute. This is intentional but means some shortcuts can't be observed (e.g. Ctrl+T opens a new tab before the row updates).
- **IME composition / dead keys:** captured as the underlying `KeyboardEvent` would normally surface them — `key` may be `Dead`, etc.
- **Numeric keypad keys:** show `location=3`.

## Examples
**Example 1 — Pressing the letter "a":**
| Field | Value |
| --- | --- |
| Key : | a |
| Keycode : | 65 |
| Code : | KeyA |
| Location : | 0 |
| Modifiers : | (empty) |

**Example 2 — Pressing the right `Shift`:**
| Field | Value |
| --- | --- |
| Key : | Shift |
| Keycode : | 16 |
| Code : | ShiftRight |
| Location : | 2 |
| Modifiers : | Shift |

**Example 3 — Pressing `Ctrl + Alt + Delete`:**
| Field | Value |
| --- | --- |
| Key : | Delete |
| Keycode : | 46 |
| Code : | Delete |
| Location : | 0 |
| Modifiers : | Ctrl + Alt |

(On most OSs the OS intercepts Ctrl+Alt+Delete; the example illustrates the value layout.)

## File Structure
- `index.ts` — Tool metadata definition with i18n title/description and a long keyword list including modifiers.
- `keycode-info.vue` — Vue 3 SFC: keydown listener + reactive output rows.

## Notes
- No persistence — the captured event is reset on page reload but remains while the component is mounted.
- The big `event.key` headline only appears after the first keypress; before that, the card shows just the prompt.
- The output uses `<InputCopyable>` so each row's value can be copied independently.
- Listener is attached to `document` (not `window`), and there is no `preventDefault()` — browser-level shortcuts still trigger.
- No tests for this tool.
