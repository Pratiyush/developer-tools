# __SLUG__

## Overview

Short, user-facing summary of what `__SLUG__` does and who it is for.

## Spec link

- Spec: `.specification/tools/__SLUG__.md` (TODO: create / link)

## Library used

- TODO: list any third-party library and pin its version in `package.json`.
- Prefer zero-dep stdlib where feasible.

## UX inspiration

- TODO: link 1–3 reference tools (CyberChef, DevToys, etc.) and note what
  was borrowed vs. intentionally diverged.

## Notes

- State split: `input` lives in URL hash; structural flags in query.
- Pure logic in `logic.ts`; DOM concerns in `render.ts`.
- Never log raw input — use `mask()` from `src/lib/log.ts` if needed.
