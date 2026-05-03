# Branch Protection

Branch protection rules live in the GitHub UI, not in the repo. This document captures the exact settings to apply so they're reproducible across re-creations of the repo.

**Last applied:** _(not yet — repo not pushed)_

## Settings to apply on `main`

Go to **Settings → Branches → Branch protection rules → Add rule** with branch name pattern `main`, then enable:

1. **Require a pull request before merging** — yes.
2. **Require approvals** — `1`.
3. **Dismiss stale pull request approvals when new commits are pushed** — yes.
4. **Require review from Code Owners** — yes (`.github/CODEOWNERS` routes everything to `@Pratiyush`).
5. **Require status checks to pass before merging** — yes. Required checks:
   - `Lint, typecheck, test, build` (from `.github/workflows/ci.yml`)
   - `CodeQL` (from `.github/workflows/codeql.yml`)
   - `guardrails` (from `.github/workflows/guardrails.yml`)
6. **Require branches to be up to date before merging** — yes.
7. **Require conversation resolution before merging** — yes.
8. **Require signed commits** — yes. (Set up GPG signing locally first; see `feedback_signed_commits` memory.)
9. **Require linear history** — yes (forces squash or rebase merge).
10. **Do not allow bypassing the above settings** — yes. The maintainer is bound by the same rules.
11. **Restrict who can push to matching branches** — `@Pratiyush` only.
12. **Allow force pushes** — NO.
13. **Allow deletions** — NO.

## Other repo-level settings

1. **Settings → General → Default branch:** `main`.
2. **Settings → General → Features → Wikis:** disabled (use `.specification/` instead).
3. **Settings → General → Features → Projects:** disabled (use Issues + labels).
4. **Settings → General → Features → Discussions:** optional; enable if you want a community surface.
5. **Settings → Pages → Source:** GitHub Actions.
6. **Settings → Pages → Build and deployment:** custom domain optional.
7. **Settings → Actions → General → Workflow permissions:** Read and write permissions (release-please needs write).
8. **Settings → Actions → General → Allow GitHub Actions to create and approve pull requests:** yes (release-please opens a release PR).
9. **Settings → Code security:**
   - Dependabot alerts: enabled.
   - Dependabot security updates: enabled.
   - Dependabot version updates: enabled (config in `.github/dependabot.yml`).
   - Code scanning (CodeQL): enabled (workflow at `.github/workflows/codeql.yml`).
   - Secret scanning: enabled.
   - Push protection: enabled.
10. **Settings → Secrets → Actions:** none required for v1.0. The Pages deploy uses OIDC. release-please uses `GITHUB_TOKEN`.

## Verifying via `gh`

After applying the settings, verify with:

```sh
# Branch protection (returns the protection JSON)
gh api repos/Pratiyush/developer-tools/branches/main/protection

# Required status checks
gh api repos/Pratiyush/developer-tools/branches/main/required_status_checks

# Vulnerability alerts
gh api repos/Pratiyush/developer-tools/vulnerability-alerts -i

# Dependabot config (must return the file)
gh api repos/Pratiyush/developer-tools/contents/.github/dependabot.yml --jq .name
```

If a check is missing, re-run the corresponding step.

## Notes

- Branch protection cannot be applied via Actions — it must be set in the UI by the repo owner.
- After the first push, before announcing the project (Day 0), apply this checklist end-to-end and update the **Last applied** date at the top of this file.
- If new required workflows are added later (e.g. an E2E job), update the **Required status checks** list here AND in the GitHub UI together.
