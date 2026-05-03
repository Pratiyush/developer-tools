# Architecture Decision Records

Append-only log of consequential decisions. Newest at the top.

## Format

```
## ADR-NNN: <Title>
- **Date:** YYYY-MM-DD
- **Status:** Proposed | Accepted | Superseded by ADR-XXX
- **Context:** What problem are we solving? What constraints?
- **Decision:** What did we choose?
- **Consequences:** What changes? What do we accept as a trade-off?
```

---

## ADR-009: License — AGPL-3.0-only (replaces MIT)

- **Date:** 2026-04-30
- **Status:** Accepted
- **Context:** The scaffold defaulted to MIT. For a webapp, MIT permits closed-source SaaS forks — the AGPL §13 network-use clause closes that loophole.
- **Decision:** Switch to AGPL-3.0-only. Full canonical text in `LICENSE`, SPDX identifier in `package.json`.
- **Consequences:** Strong copyleft + network-use disclosure required for any deployed fork. Future contributors implicitly license under AGPL. If commercial relicensing is ever wanted, requires a CLA from every contributor (today: just Pratiyush, so still possible). Some downstream users who can't tolerate copyleft will not adopt — that's the trade.

## ADR-008: TypeScript discipline — no `any`, no `unknown`

- **Date:** 2026-04-29
- **Status:** Accepted
- **Context:** The default `strict` set still permits `any` and `unknown`. Both are escape hatches that hide bugs.
- **Decision:** Forbid both. Concrete types or constrained generics only. ESLint enforces (rule lives in `eslint.config.js`; manual application required, see `BRANCH_PROTECTION.md`).
- **Consequences:** Slightly more verbose types at API boundaries (especially for parsed JSON and registry-of-tools cases). The `ToolRegistry` will use a discriminated union of tool state types instead of `ToolModule<unknown>[]` once the second tool lands.

## ADR-007: Default theme + runtime theme switcher

- **Date:** 2026-04-29
- **Status:** Accepted
- **Context:** The `design/` folder explored 7 design directions. We need one default + a way for users to try the others.
- **Decision:** Default = **Clean** with `--radius: 14px` + `--shadow-mult: 1.2`. Six alternates: Linear, Vercel, Paper, Swiss, Aurora, Matrix. Runtime dropdown writes `data-theme` to `<html>` and persists in `localStorage` (`dt.theme`). Translation tokens come from `src/style.css` — no code copied from `design/`.
- **Consequences:** All UI primitives must use design tokens, not hex values. Adding a theme = one CSS block. Per-tool styles must work across all 7 themes (a11y spec catches contrast regressions per theme).

## ADR-006: i18n via Tolgee, build-time pull

- **Date:** 2026-04-30
- **Status:** Accepted
- **Context:** i18n needs a single source of truth, must auto-detect from `navigator.language`, must support 15 majors. Browser-runtime API calls would expose the API key.
- **Decision:** Translations live in Tolgee (https://app.tolgee.io). `pnpm sync-i18n` calls `GET /v2/projects/export` once (all locales in one shot) and writes `src/locales/_synced/<code>.json`. Vite bundles them at build time via `import.meta.glob`. Runtime is fully static — no Tolgee call ever fires from the browser. API key in `.env` (Node-only, gitignored).
- **Consequences:** Translations are stale until `pnpm sync-i18n` runs. CI runs it before `pnpm build`. Requires `TOLGEE_API_KEY` as a repo secret. Without the secret, sync exits 0 and runtime falls back to `src/locales/en.ts`.

## ADR-005: Package manager — pnpm

- **Date:** 2026-04-29
- **Status:** Accepted
- **Context:** Faster installs, content-addressed `node_modules`, strict dependency resolution (catches phantom imports), workspace support if we ever split into packages.
- **Decision:** pnpm 9. `packageManager` field in `package.json` pins it via corepack. `pnpm-lock.yaml` is the lockfile (committed). CI uses `pnpm/action-setup@v4`.
- **Consequences:** Contributors need pnpm. The `prepare` script wires Husky via `pnpm exec husky`. Husky hooks call `pnpm exec X`, never `npx X`.

## ADR-004: Tooling — Playwright + axe-core for E2E + a11y

- **Date:** 2026-04-30
- **Status:** Accepted
- **Context:** Vitest covers unit tests. Real-browser flows + WCAG checks need a separate stack.
- **Decision:** `@playwright/test` for E2E (specs at `tests/e2e/*.spec.ts`). `@axe-core/playwright` for WCAG 2.1 AA verification, run on every theme. Three browser projects (chromium, firefox, webkit). Storybook deferred to v0.5.
- **Consequences:** First CI run downloads Playwright browsers (~300 MB). Cached after that. WCAG violations block the merge — fix at the source.

## ADR-003: ESLint 9 flat config + typescript-eslint v8

- **Date:** 2026-04-29 (typescript-eslint upgraded 7 → 8 on 2026-04-29)
- **Status:** Accepted

- **Date:** 2026-04-29
- **Status:** Accepted
- **Context:** ESLint 9 defaults to flat config; legacy `.eslintrc.*` is on a deprecation path. typescript-eslint v7 has first-class flat config support.
- **Decision:** Use `eslint.config.js` flat config exclusively. Use `recommendedTypeChecked` + `stylisticTypeChecked` presets from typescript-eslint.
- **Consequences:** Editor integrations need recent ESLint plugin versions. Type-checked rules require `parserOptions.project`, which makes lint slightly slower but catches more bugs.

## ADR-002: Vite as bundler

- **Date:** 2026-04-29
- **Status:** Accepted
- **Context:** Need a fast dev server with TS support out of the box, minimal config, and good ecosystem fit for Vitest.
- **Decision:** Vite 5.
- **Consequences:** ESM-first. Native dynamic imports. Vitest pairs naturally. If we ever need SSR, we'll revisit.

## ADR-001: Vanilla TypeScript (no framework)

- **Date:** 2026-04-29
- **Status:** Accepted
- **Context:** The project is intentionally lightweight; we want to learn the platform and avoid framework lock-in.
- **Decision:** Plain TS + HTML/CSS, no React/Vue/Svelte.
- **Consequences:** UI patterns are hand-rolled. If complexity grows (state management, routing across many pages), we'll re-evaluate and write a superseding ADR.
