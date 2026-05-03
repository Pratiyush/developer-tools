# Temperature converter

## Overview
- **Path:** `/temperature-converter`
- **Category:** Measurement
- **Description:** Degrees temperature conversions for Kelvin, Celsius, Fahrenheit, Rankine, Delisle, Newton, Réaumur, and Rømer.
- **Keywords:** temperature, converter, degree, Kelvin, Celsius, Fahrenheit, Rankine, Delisle, Newton, Réaumur, Rømer
- **Redirect from:** (none)

## Purpose
A live, bidirectional temperature converter spanning eight scales: Kelvin, Celsius, Fahrenheit, Rankine, Delisle, Newton, Réaumur, and Rømer. Editing any one field instantly recomputes the other seven in sync, using Kelvin as the canonical pivot scale. Useful for thermodynamics, historical science, weather/recipe conversions, and engineering work that crosses scale conventions.

## Inputs
Eight numeric inputs, each rendered as an `<n-input-number>` inside an `<n-input-group>`. All start at `0`:

| Field key | Title | Unit | Default |
|-----------|-------|------|---------|
| `kelvin` | Kelvin | `K` | `0` |
| `celsius` | Celsius | `°C` | `0` |
| `fahrenheit` | Fahrenheit | `°F` | `0` |
| `rankine` | Rankine | `°R` | `0` |
| `delisle` | Delisle | `°De` | `0` |
| `newton` | Newton | `°N` | `0` |
| `reaumur` | Réaumur | `°Ré` | `0` |
| `romer` | Rømer | `°Rø` | `0` |

There is no min/max; arbitrary numeric values are allowed (including below absolute zero in non-Kelvin scales — no validation is enforced).

## Outputs
The same eight fields are read back as outputs after any one of them changes — i.e. the tool is bidirectional and stateful. After editing field `k`, the other seven are overwritten with values converted from `k` via Kelvin.

## UI / Components
- A vertical stack of eight `<n-input-group>` rows, one per scale.
- Each row consists of:
  - **Left label** (`<n-input-group-label style="width: 100px">`) — the scale title.
  - **Number input** (`<n-input-number style="flex: 1">`) bound to `units[key].ref` with an `@update:value` handler that calls `update(key)`.
  - **Right unit label** (`<n-input-group-label style="width: 50px">`) — the unit symbol.
- All eight rows are rendered with `v-for` over `Object.entries(units)`.
- No tabs, no extra controls, no copy/download buttons (the standard `n-input-number` text can be copied with the OS clipboard).

## Logic / Algorithm
A `reactive` map `units` stores per-scale metadata, including current value (`ref`), `toKelvin`, and `fromKelvin` converters. On any input change:

```ts
function update(key: TemperatureScale) {
  const { ref: value, toKelvin } = units[key];
  const kelvins = toKelvin(value) ?? 0;

  _.chain(units)
    .omit(key)
    .forEach(({ fromKelvin }, index) => {
      units[index].ref = Math.floor((fromKelvin(kelvins) ?? 0) * 100) / 100;
    })
    .value();
}
```

1. Take the value from the modified scale and convert it to Kelvin via the scale's `toKelvin` function.
2. For every **other** scale (lodash `_.omit(key)`), call `fromKelvin(kelvins)`.
3. Round to 2 decimals using `Math.floor(x * 100) / 100` (this **truncates toward zero** for positive numbers and toward negative infinity for negatives — it is **not** symmetric rounding).
4. Write the result back into `units[index].ref`, which re-renders that input.

`update('kelvin')` is invoked at component setup so the seven dependent scales get initialized from `kelvin = 0` instead of remaining at their literal default of `0` (these would have been correct anyway for `0 K`, but the call ensures consistency).

### Conversion formulas (`temperature-converter.models.ts`)
All formulas convert through Kelvin:

| Scale | toKelvin(t) | fromKelvin(t) |
|-------|-------------|---------------|
| Celsius | `t + 273.15` | `t - 273.15` |
| Fahrenheit | `(t + 459.67) * (5/9)` | `t * (9/5) - 459.67` |
| Rankine | `t * (5/9)` | `t * (9/5)` |
| Delisle | `373.15 - (2/3) * t` | `(3/2) * (373.15 - t)` |
| Newton | `t * (100/33) + 273.15` | `(t - 273.15) * (33/100)` |
| Réaumur | `t * (5/4) + 273.15` | `(t - 273.15) * (4/5)` |
| Rømer | `(t - 7.5) * (40/21) + 273.15` | `(t - 273.15) * (21/40) + 7.5` |
| Kelvin | `_.identity` | `_.identity` |

## Dependencies
- **`lodash`** (`_.identity`, `_.chain`, `.omit`, `.forEach`, `.value`) — used for the immutable update pipeline.
- **Vue 3** Composition API (`reactive`).
- **Naive UI**: `n-input-group`, `n-input-group-label`, `n-input-number`.

## Edge Cases & Validation
- **Below absolute zero** — no validation. e.g. entering `-300 °C` produces `-26.85 K` (and propagates to all other scales), which is physically impossible. The tool does not warn.
- **Non-numeric input** — `n-input-number` handles parsing; clearing the field can yield `null`. The `update` function uses `?? 0` so `null` is treated as `0`.
- **Floating-point precision** — `Math.floor(x * 100) / 100` truncates rather than rounds, so a value like `36.999` would display as `36.99` (not `37.00`). This can cause asymmetry between scales after multiple round-trip edits.
- **Editing one scale clears slight precision in others** — because every conversion truncates to 2 decimals, repeatedly clicking back and forth between scales can lose precision (e.g. enter `1` °C, see Kelvin `274.15`, edit Kelvin slightly, return to °C — value may have drifted by 0.01).
- **Identity for the active field** — `_.omit(key)` keeps the user-edited field untouched, so the typed digits aren't truncated mid-keystroke.
- **No persistence** — refresh resets all to `0`.

## Examples
### Example 1 — boil water
Edit Celsius → `100`. The component runs `update('celsius')`:
- `toKelvin(100) = 373.15`
- `fromKelvin(373.15)` for each other scale and truncate to 2 decimals.

| Scale | Value |
|-------|-------|
| Kelvin | `373.15` |
| Celsius | `100` (untouched) |
| Fahrenheit | `212` |
| Rankine | `671.67` |
| Delisle | `0` |
| Newton | `33` |
| Réaumur | `80` |
| Rømer | `60` |

### Example 2 — room temperature
Edit Fahrenheit → `68`. `toKelvin(68) = (68 + 459.67) * 5/9 ≈ 293.15`.

| Scale | Value (truncated to 2 dp) |
|-------|---------------------------|
| Kelvin | `293.15` |
| Celsius | `20` |
| Fahrenheit | `68` (untouched) |
| Rankine | `527.67` |
| Delisle | `120` |
| Newton | `6.6` |
| Réaumur | `16` |
| Rømer | `18` |

### Example 3 — absolute zero
Edit Kelvin → `0`. All scales display their respective representations of 0 K:
- Celsius → `-273.15`
- Fahrenheit → `-459.67`
- Rankine → `0`
- Delisle → `559.72` (since `(3/2) * 373.15 = 559.725`, truncated)
- Newton → `-90.13`
- Réaumur → `-218.52`
- Rømer → `-135.9` (truncated)

## File Structure
| File | Purpose |
|------|---------|
| `index.ts` | Tool registration metadata (name, path, description, keywords, icon, component loader). |
| `temperature-converter.vue` | Vue UI: 8-row form, `units` reactive map, `update()` propagation function. |
| `temperature-converter.models.ts` | Pure conversion functions for each scale to/from Kelvin. |

## Notes
- **i18n:** title and description come from `tools.temperature-converter.{title,description}`.
- **Persistence:** none.
- **Icon:** `Temperature` from `@vicons/tabler`.
- **No tests** for the conversion functions directly, despite their relative complexity (Newton/Delisle/Rømer have non-obvious constants).
- **Truncation, not rounding** — `Math.floor(x * 100) / 100` is consistent but asymmetric for negatives and may surprise users expecting `toFixed(2)` semantics.
- **Pivot-through-Kelvin design** keeps the conversion table additive: a new scale only needs `toKelvin` + `fromKelvin`. There is no direct A → B path; every conversion is two steps.
