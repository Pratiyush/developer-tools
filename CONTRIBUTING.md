# Contributing

Thanks for your interest in contributing! This document covers the workflow, coding standards, and review process for this project.

## Getting started

1. **Fork & clone** the repository.
2. Use the Node version pinned in `.nvmrc` (currently Node 20). With `nvm`:
   ```sh
   nvm use
   ```
3. Install dependencies:
   ```sh
   pnpm install
   ```
   This also installs the Husky pre-commit hooks via the `prepare` script.
4. Start the dev server:
   ```sh
   pnpm dev
   ```

## Branching & commits

- Branch from `main`. Use a descriptive name: `feat/<short-name>`, `fix/<short-name>`, `docs/<short-name>`.
- Write commits in the imperative mood: "Add login form", not "Added" or "Adds".
- Keep commits focused — one logical change per commit when practical.

## Code quality

Before pushing, run the same checks CI runs:

```sh
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Or just commit — `lint-staged` will auto-format and lint your staged files.

### Style

- TypeScript with `strict` enabled. No `any` unless justified in a comment.
- Prettier owns formatting; ESLint owns correctness. Don't fight them.
- Prefer named exports. Default exports only for top-level page/component entries.
- Keep modules small and single-purpose.

### Testing

- Add or update tests for any behavior change.
- Tests live in `tests/` or alongside source as `*.test.ts`.
- Run `pnpm test:watch` while developing.

## Pull requests

1. Push your branch and open a PR against `main`.
2. Fill out the PR template completely — the description, motivation, and testing notes matter.
3. Make sure CI is green.
4. A code owner (see `.github/CODEOWNERS`) will review.
5. Address feedback by pushing follow-up commits; don't force-push during review unless asked.

## Reporting bugs

Open an issue with:

- A clear title and short description
- Steps to reproduce
- Expected vs. actual behavior
- Environment (OS, browser, Node version)

## Code of Conduct

See [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md). Be respectful. Disagree on the substance, not the person.

## License

By contributing, you agree your contribution is licensed under the project's license: **AGPL-3.0-only** (see [LICENSE](./LICENSE)). The AGPL's network-use clause applies to any deployment, including SaaS — derivative deployments must offer source to their users.
