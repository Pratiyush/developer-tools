---
description: Scaffold a new TypeScript module with a co-located test.
argument-hint: <module-name>
---

Create a new module under `src/` named `$ARGUMENTS`:

1. Create `src/$ARGUMENTS.ts` with a named export and a JSDoc comment describing the module's purpose.
2. Create `tests/$ARGUMENTS.test.ts` with a `describe` block and at least one passing `it` test.
3. Follow the conventions in `memory/conventions.md` — named exports, no `any`, strict types.
4. Run `npm run typecheck && npm run test` and report results.

If `$ARGUMENTS` is empty, ask the user for the module name first.
