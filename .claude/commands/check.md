---
description: Run the full local quality gate — same checks CI runs.
---

Run the project's full quality gate in order, stopping at the first failure:

1. `npm run format:check`
2. `npm run lint`
3. `npm run typecheck`
4. `npm run test`
5. `npm run build`

If any step fails, show the relevant output and propose the smallest fix. Do not auto-commit.
