# Storybook reference patterns

> SB-19 (#57). Curated takeaways from the design-system Storybook
> implementations we audited (Carbon, Chakra, Primer, Nord) and the
> shadcn/ui library — distilled into actionable conventions for
> developer-tools. Each entry names the pattern, points at the source
> we lifted it from, and states what we will do differently as a
> result.
>
> **Scope:** patterns only. Per-tool specs live in `.specification/`
> (gitignored). Cross-cutting Storybook infra lives in
> `.specification/_infra/storybook/backlog.md` (also gitignored).

---

## 1. `argTypes` named after the factory's `Options` field

**Source:** Carbon `packages/react/src/components/Form/Form.stories.js`
([github.com/carbon-design-system/carbon](https://github.com/carbon-design-system/carbon)).

**Pattern:** Carbon stories don't invent new prop names for the
controls panel — every `argTypes` key matches a field on the
component's public props. Story authors never have to mentally
translate between "control name" and "actual prop name."

**Application:** every developer-tools tool exports a `State`
interface from `url-state.ts`. Story `argTypes` keys MUST match
`State` field names verbatim. Generated stories from `pnpm new-tool`
already follow this; verified in `#43` (SB-04) for base64.

---

## 2. Named-export-per-use-case (no anonymous default)

**Source:** Carbon component stories use this throughout the
catalog. Chakra also enforces it.

**Pattern:** instead of one parameterized "Playground" story, ship
multiple **named exports** that each freeze a use case (`Default`,
`Loading`, `Empty`, `Error`). The Storybook sidebar then becomes a
test plan: each meaningful state is browsable, snapshot-able, and
addressable by URL.

**Application:** every tool story exports the cross-cutting
minimum set: `Default`, `Empty`, `Error`, `WithMaxInput`. Enforced
by `pnpm check:story-coverage` (#48 / SB-10) and emitted by the
scaffold (#53 / SB-15). The base64 story (#43) extends with
`UrlSafe` + `DecodedRoundTrip` for tool-specific variants.

---

## 3. addon-a11y in-panel, plus a separate CI axe gate

**Source:** Chakra uses `vitest-axe` to gate CI on accessibility.
Primer adds an in-panel a11y addon for dev-loop feedback.

**Pattern:** developer feedback at write time (a panel in
Storybook) plus a non-negotiable CI gate (Playwright + axe). They
catch different bugs — the panel surfaces issues during authoring;
the CI gate prevents regressions in pre-existing stories.

**Application:** `@storybook/addon-a11y` ships in `.storybook/main.ts`
(#56 / SB-18) with WCAG 2.1 AA rules and no rule disabled.
`@axe-core/playwright` runs alongside Playwright E2E in
`tests/e2e/*.spec.ts` — separate process, runs on every PR.

---

## 4. Programmatic token-table generation

**Source:** GitHub Primer
([github.com/primer/css/blob/main/src/support/variables.scss](https://github.com/primer/css)).
Primer documents its design tokens from CSS variables rather than a
hand-maintained YAML — tables can never drift.

**Pattern:** parse the canonical CSS once at build time; emit
generated docs. Hand-authored token lists in markdown go out of
date within weeks.

**Application:** `scripts/extract-css-tokens.ts` (#58 / SB-20)
parses `src/stories/_styles/foundations.css` and snapshots the
result to `scripts/__snapshots__/tokens.json`. CI `pnpm tokens:check`
gate fails on drift. The Tokens MDX page (#55 / SB-17) imports the
extraction at build time.

---

## 5. Preset matrix presentation (color/size combinations as a grid)

**Source:** Nord palette
([nordtheme.com](https://www.nordtheme.com/docs/colors-and-palettes)).
Their docs show every accent against every neutral as a small grid
of tiles — the matrix surfaces unintended contrast collisions.

**Pattern:** wherever the design has two orthogonal axes (e.g.
preset × density), build a single dedicated story that renders the
full grid. Reviewers can scan rather than click through every
permutation.

**Application:** the SB-14 (#52) foundation stories use this
pattern for `Status / All tones` (5 tones in one frame) and
`Stat / Grid` (4 cards in one frame). Future: preset × density
matrix story will land with SB-16 (#54, currently DEFERRED).

---

## 6. MDX docs structure (Foundations / Tokens / A11y / Contributing)

**Source:** Carbon + Chakra both ship MDX-driven design-system
homes with exactly this four-page top-level structure.

**Pattern:** CSF stories are _examples_; MDX pages are
_principles_. A new contributor reads MDX first ("how do we think
about color"), then drills into CSF to see specific cases.

**Application:** SB-17 (#55) ships the four MDX pages. Token
content comes from the SB-20 extractor — no hand-maintained
tables.

---

## 7. `data-state` + `data-slot` attribute convention

**Source:** shadcn/ui
(`/Users/deepshikhasingh/Downloads/Modern Sidebar Web App UI/`).
Every shadcn primitive uses `data-state="open|closed"`,
`data-slot="trigger"`, etc., then targets the attrs from CSS
selectors (no React-specific render-prop machinery).

**Pattern:** treat DOM attributes as the contract. Internal state
changes write a `data-state` attribute; CSS targets the attribute
with `[data-state="open"]`. The same selector works in vanilla TS,
React, Vue — anywhere.

**Application:** the SB-14 (#52) `segment` primitive uses
`data-state="active|inactive"` per tab button. Future modal /
dialog primitives (SB-25 / #63) will use the same convention.

---

## 8. CVA-style variant API

**Source:** shadcn/ui re-exports `class-variance-authority` to
build conditional class lists. The author writes a config; the
component calls it with options.

**Pattern:** variant logic is data, not branching. A primitive
declares its variants once; consumers pick from a typed string
union. Adding a new variant is a one-line change.

**Application:** `src/ui/_helpers/variants.ts` (#52 / SB-14) is a
~50-LoC in-repo port. No npm dep. Type-safe builder. All new SB-14
primitives use it; existing primitives will be refactored in
SB-14b (post-design-system-stabilization).

---

## What we deliberately do NOT carry over

- **Tailwind utility-first** (shadcn assumes it). Our system is
  plain CSS + `[data-preset]` tokens (SB-16 / #54). Adopting
  Tailwind would force every primitive rewrite.
- **`react-hook-form` + `Form*` family.** We use explicit factory
  state + DOM events. Tools are vanilla TS factories returning
  disposers, not React components.
- **Emotion / styled-components.** Plain CSS files + tokens. The
  variants helper produces class names, not inline styles.
- **JSX rendering.** Every primitive is a vanilla DOM factory.
  Storybook framework is `@storybook/html-vite`, not React.

---

## How this doc stays accurate

When a new pattern is adopted, append it here with: name, source
path, summary, application. When a pattern is replaced (e.g. when
SB-16 lands and the `data-theme` → `data-preset` migration ships),
update the relevant entry rather than deleting it — the history
helps future contributors understand why the conventions are what
they are.

Link from `CONTRIBUTING.md` is added in #45 (SB-06).
