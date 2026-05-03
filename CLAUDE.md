# CLAUDE.md

> Working memory for Claude when collaborating on this project.
> Keep this file short and actionable. Long-form context lives under `memory/`.

## What this project is

**Developer Tools** — a TypeScript + HTML/CSS application scaffolded with Vite, intended as the foundation for a suite of small developer utilities.

- Owner: Pratiyush Kumar (`pratiyush1@gmail.com`)
- Status: scaffold / early
- Design source: Figma — https://claude.ai/design/p/019dd5a6-8252-7df2-a3d9-060a9fb71e14

## Tech stack

- **Language:** TypeScript (strict mode, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`)
- **Bundler:** Vite 5
- **Lint:** ESLint 9 (flat config) + typescript-eslint v8
- **Format:** Prettier 3 (semi, single quotes, trailing commas, 100 col)
- **Unit test:** Vitest + jsdom
- **E2E test:** Playwright + `@axe-core/playwright` (WCAG 2.1 AA)
- **Package manager:** pnpm 9
- **i18n:** Tolgee (`pnpm sync-i18n` pulls all locales as JSON)
- **Hooks:** Husky 9 + lint-staged + commitlint
- **CI:** GitHub Actions (`.github/workflows/ci.yml`)
- **Releases:** release-please (Conventional Commits → SemVer)
- **License:** AGPL-3.0-only

## Conventions

- Use **named exports**. Default exports only for top-level page/route entries.
- Keep modules small and single-purpose. One concept per file.
- Co-locate tests as `*.test.ts` next to source, OR put them in `tests/` — both are configured.
- No `any` without an inline justification comment.
- CSS: use the design tokens defined in `src/style.css` (`--color-*`, `--space-*`, `--radius-*`). Don't hardcode hex values.
- Commits: imperative mood ("Add X" not "Added X").
- Branches: `feat/*`, `fix/*`, `docs/*`, `chore/*`.

## Scripts cheat sheet

```sh
pnpm dev             # Vite dev server (http://localhost:5173/developer-tools/)
pnpm build           # tsc -b && vite build
pnpm typecheck       # tsc --noEmit
pnpm lint            # eslint .
pnpm lint:fix        # eslint . --fix
pnpm format          # prettier --write .
pnpm test            # vitest run
pnpm test:watch      # vitest
pnpm test:e2e        # playwright (themes + a11y)
pnpm new-tool        # scaffold a new tool from _template/
pnpm sync-i18n       # pull translations from Tolgee
pnpm seed-tolgee     # push English keys + 15 languages to Tolgee
```

## Before you push

CI runs all of these — run them locally first:

```sh
pnpm format:check && pnpm lint && pnpm typecheck && pnpm test && pnpm build
```

Or just commit; lint-staged auto-formats and lints staged files via the pre-commit hook.

## Where things live

```
src/                Application source
tests/              Vitest tests (jsdom env)
.github/            CI workflow, CODEOWNERS, PR template
.husky/             Git hooks (created by `npm install`)
memory/             Long-form project memory for Claude (see memory/README.md)
.claude/            Claude-specific config and slash commands
```

## Things Claude should NOT do without asking

- Don't add new runtime dependencies — propose them in chat first with rationale.
- Don't change the build system (Vite), language target, or Node version.
- Don't disable ESLint rules globally; prefer scoped overrides with a comment.
- Don't commit on the user's behalf or push branches.
- Don't add framework dependencies (React, Vue, Svelte, etc.) — this is intentionally a vanilla TS project.

## Open questions / TODOs

- [ ] Translate the Figma design tokens into `src/style.css` (`--color-*`, typography scale).
- [ ] Decide on a routing approach if the app grows beyond a single page.
- [x] ~~Replace placeholder `@your-github-username` in `.github/CODEOWNERS`~~ (done — `@Pratiyush`).

## Pointers to deeper context

- `memory/glossary.md` — terms, acronyms, and project-specific language
- `memory/decisions.md` — architectural decisions (ADR-style log)
- `memory/people.md` — collaborators and roles
- `memory/projects.md` — related projects and dependencies
