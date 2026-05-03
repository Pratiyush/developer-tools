# Conventions

The longer version of the rules summarized in `CLAUDE.md`.

## TypeScript

- `strict: true` plus `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`, `noUnusedLocals`, `noUnusedParameters`.
- **Never use `any`.** Not even with a justification comment. Replace with a concrete type.
- **Never use `unknown`** in source code. For caught errors, narrow via `instanceof Error`. For parsed JSON, validate with a typed schema. For heterogeneous arrays, use a discriminated union.
- Generics MUST have `extends` constraints. Raw `<T>` is forbidden.
- Prefer `type` for unions and aliases, `interface` for object shapes that may be extended.
- Use `import type { Foo }` for type-only imports (enforced by `consistent-type-imports`).
- DOM queries: type the result (`querySelector<HTMLButtonElement>(...)`) and null-check.
- All authored files are `.ts`. No `.mjs`, no `.js` source files. Build/dev scripts run via `tsx`.

## Modules and exports

- Named exports by default.
- Default exports only for: page/route entry files, framework conventions, dynamic imports.
- One default export per file maximum.
- Re-exports through `index.ts` are fine for stable public surfaces of a folder; avoid for internal modules (it hurts tree-shaking and find-references).

## CSS

- All colors, spacing, radii, and font stacks come from CSS custom properties in `src/style.css`.
- Default theme (Clean) lives at `:root`. Six alternates ride on `[data-theme="<name>"]` selectors. Adding a theme is one CSS block.
- Token namespaces: `--bg-*`, `--fg-*`, `--line*`, `--accent*`, `--radius*`, `--shadow-mult`, `--font-*`, `--fs-*`, `--sp-*`, `--anim-*`. Don't invent ad-hoc names.
- Component class names use `dt-` prefix + BEM (`.dt-btn--primary`, `.dt-panel__label`). Keeps CSS modular and discoverable.
- Avoid `!important`. If you reach for it, the cascade or specificity is wrong.
- Mobile-first media queries: write the small-screen styles unscoped, then `@media (min-width: ...)` for larger.
- RTL: use `[dir='rtl']` overrides, not duplicated rules. Logical properties (`margin-inline-start`) where supported.

## Tests

- Test behavior, not implementation. Don't assert on internal state.
- One `describe` per module / public function.
- Use `it('does X when Y')` phrasing.
- Prefer real DOM (jsdom) over mocks where possible.
- **Two layers:**
  - **Unit (Vitest)** — colocated as `*.test.ts` next to the source. Pure logic, primitives in jsdom.
  - **E2E (Playwright)** — `tests/e2e/<slug>.spec.ts`. Real browser, real Vite dev server. Every tool ships an E2E spec.
- **Every tool's E2E spec MUST include an a11y assertion** via `@axe-core/playwright`. WCAG 2.1 AA, no rule disabled. Fix at the source.
- E2E specs run across all 7 themes for the home page; per-tool specs run on the default Clean theme.

## Tooling

- **Package manager:** pnpm 9 (pinned via `packageManager` in `package.json`). All scripts use `pnpm`, all hooks use `pnpm exec`. Never `npm` or `npx`.
- **Logger:** `consola` via the wrapper at `src/lib/log.ts`. Use `getLogger(tag)` for module-scoped instances. Never `console.*` in production code (eslint warns).
- **i18n:** strings live in Tolgee (https://app.tolgee.io). Local sources of truth: `src/locales/types.ts` (key contract) + `src/locales/en.ts` (English values). After adding a key, run `pnpm seed-tolgee` to push it. After translating, run `pnpm sync-i18n` to pull.
- **Never hardcode user-facing strings** — use `translate('key')`. Hardcoded strings in tests are fine.
- **License:** all source contributed under AGPL-3.0-only. SPDX header on each file is optional but encouraged.

## Tools (per-tool conventions)

- Tools live at `src/tools/<NN-category>/<NNN-slug>/`. Numbers are global (not per-category) and zero-padded.
- One folder per tool. Six standard files: `index.ts` (registry entry), `logic.ts` (pure functions), `logic.test.ts` (Vitest), `url-state.ts` (parse/serialize), `render.ts` (DOM render), `README.md` (per-tool note).
- **Tools never import from sibling tools.** Cross-cutting code goes to `src/lib/` or `src/ui/`. ESLint enforces via `no-restricted-imports`.
- Hybrid URL state: structure params in `?query`, sensitive payloads in `#hash` (hash never hits server logs / Referer).
- Pure-logic modules (no DOM, no globals, no I/O) — fully unit-testable.
- Typed error codes (`'EMPTY' | 'BAD_ALPHABET' | …`), never string error messages — stable across i18n.

## Git

- Branch from `main`: `feat/<slug>`, `fix/<slug>`, `chore/<slug>`, `docs/<slug>`.
- **Conventional Commits enforced** by commitlint (commit-msg hook). Subject ≤ 100 chars, no upper-case / pascal-case.
- **Signed commits required** (GPG). Branch protection enforces.
- **Sole author = Pratiyush.** Never `Co-authored-by:` in commits, PRs, or release notes. The `prepare-commit-msg` hook strips AI attribution lines as a safety net.
- Commits in imperative mood, scoped narrowly.
- Squash on merge unless the PR has a meaningful commit-by-commit history worth keeping.
- Don't force-push during code review unless the reviewer asks.

## PRs

- Fill out the PR template — especially **Motivation** and **Testing**.
- Keep PRs under ~400 lines of diff when possible. Split otherwise.
- Self-review your own diff before requesting a reviewer.
