# Architecture

Top-level architecture for `developer-tools`. Read this before adding a tool.

## Goals

1. **Local-only.** No tool sends user data to a server. Ever.
2. **Independent tools.** Adding tool #N must not affect any of the previous N-1.
3. **Deep-linkable.** Every tool's state lives in the URL (hybrid `?` + `#`).
4. **Accessible.** WCAG 2.1 AA verified per theme. No exceptions.
5. **Internationalized.** 15 major languages. Browser auto-detects.
6. **Static.** No runtime API calls except optional (gated) analytics.

## High-level shape

```
                ┌──────────────────────────────────────────────┐
                │                  index.html                   │
                │  (theme + locale set before paint, no flash)  │
                └────────────────────┬─────────────────────────┘
                                     │
                                     ▼
                            ┌────────────────┐
                            │    main.ts     │
                            │ initI18n +     │
                            │ initTheme +    │
                            │ layout(host)   │
                            └────────┬───────┘
                                     │
              ┌──────────────────────┼──────────────────────┐
              ▼                      ▼                      ▼
       ┌────────────┐         ┌─────────────┐        ┌────────────┐
       │ src/lib/   │         │ src/ui/     │        │ src/tools/ │
       │ types,     │         │ topbar,     │◄───────│ <NN-cat>/  │
       │ log,       │  used   │ sidebar,    │ render │ <NNN-slug>/│
       │ theme,     │  by all │ home,       │        │ logic +    │
       │ i18n,      │   tools │ footer,     │        │ url-state +│
       │ url-state, │         │ layout,     │        │ render +   │
       │ analytics, │         │ primitives/ │        │ tests      │
       │ consent    │         │             │        └────────────┘
       └────────────┘         └─────────────┘
```

Tools are leaves. They consume `lib` + `ui` and never import each other. Cross-cutting code lives in `lib` (logic primitives) or `ui` (visual primitives).

## Per-tool layout

```
src/tools/01-encoding/001-base64-string-converter/
├── index.ts            # Registers a ToolModule<State> in src/tools/index.ts
├── logic.ts            # Pure functions (no DOM, no I/O)
├── logic.test.ts       # Vitest unit tests
├── url-state.ts        # parseParams / serializeParams; defines `State` shape
├── render.ts           # Mounts the tool into a host element (returns dispose())
└── README.md           # Per-tool note: spec link, library used, UX inspiration
```

The registry at `src/tools/index.ts` is the **only** place any code references all tools. Adding a tool inserts an import there; removing one reverses it.

## Data flow inside a tool

```
       URL change                Initial render
       ────────                  ──────────────
   ┌──────────────┐                       ┌──────────────┐
   │ window.loc   │                       │ window.loc   │
   └──────┬───────┘                       └──────┬───────┘
          │ parseParams(loc)                     │
          ▼                                      ▼
   ┌──────────────┐                       ┌──────────────┐
   │ State (typed)│                       │ State (typed)│
   └──────┬───────┘                       └──────┬───────┘
          │ logic.process(input)                  │ render(host, state)
          ▼                                      ▼
   ┌──────────────┐                       ┌──────────────┐
   │ Output       │                       │ DOM          │
   └──────┬───────┘                       └──────┬───────┘
          │ render(state, output)                │ user input → input event
          ▼                                      ▼
       (displayed)                           (state update)
                                                 │
                                                 ▼
                                          serializeParams(state)
                                                 │
                                                 ▼
                                          history.replaceState
```

URL state is the source of truth. `logic` is pure. `render` is a thin DOM layer that listens for input and writes the URL.

## Build + deploy

```
git push main          GitHub Actions
   │                   ┌─────────────────┐
   │                   │  CI workflow    │
   ├──────────────────►│  format/lint/   │
                       │  typecheck/test │
                       │  + e2e+axe      │
                       └────────┬────────┘
                                │ green
                                ▼
                       ┌─────────────────┐
                       │ Deploy workflow │
                       │  pnpm sync-i18n │
                       │  pnpm build     │
                       │  upload to      │
                       │  Pages          │
                       └────────┬────────┘
                                │
                                ▼
                       https://pratiyush.github.io/developer-tools/

git push tag (release-please-bot's PR merge)
                                │
                                ▼
                       ┌─────────────────┐
                       │ release-please  │
                       │ tags + Release  │
                       │ + CHANGELOG     │
                       └─────────────────┘
```

## Layers and dependencies

- **`src/lib/*`** — no UI dependency. Pure helpers. Can be unit-tested in jsdom or Node.
- **`src/ui/*`** — depends on `lib` only. Renders DOM. No business logic.
- **`src/tools/<N>/*`** — depends on `lib` + `ui`. Cannot import from sibling tools. Enforced by ESLint `no-restricted-imports`.
- **`scripts/*`** — Node-only TS run via `tsx`. No browser concerns. Cannot use `import.meta.glob` (Vite-specific).

## Themes

7 visual themes share the same DOM. Switching theme = setting `<html data-theme="…">`. CSS variables in `src/style.css` cascade. Adding a theme is one CSS block; no source changes elsewhere.

## i18n

Authored strings live in `src/locales/types.ts` (key contract) + `src/locales/en.ts` (English values). Tolgee is the source of truth in production. `pnpm sync-i18n` pulls all locales as JSON into `src/locales/_synced/`. Vite `import.meta.glob` bundles them at build time. Runtime is fully static.

## What this architecture deliberately rejects

- **Frameworks.** No React/Vue/Svelte. We hand-roll DOM. Reasons in `decisions.md` ADR-001.
- **Bundling tools across boundaries.** A bug in tool #5 cannot affect tool #4. Enforced by ESLint.
- **Server-side anything.** No SSR, no API routes, no backend. The site is fully static.
- **Runtime API calls.** Translations and trackers are bundled at build time or lazy-loaded via consent. No API key ever ships in the browser bundle.
