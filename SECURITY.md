# Security Policy

`developer-tools` is a static webapp deployed to GitHub Pages. There is no
server, no database, and no telemetry. All computation runs in the user's
browser, and no user data leaves the browser.

That said, I take security reports seriously. If you find a vulnerability,
please follow the process below.

## Reporting a vulnerability

Use one of the following channels. Do **not** open a public GitHub issue for
a security bug.

- Preferred: open a [GitHub Security Advisory](https://github.com/Pratiyush/developer-tools/security/advisories/new)
  on this repository.
- Email: `pratiyush1@gmail.com` with the subject prefix `[security]`.

Include a clear reproduction, the affected URL or commit, and the impact you
believe the issue has. If you have a proposed fix, even better.

## Response timeline

- I will acknowledge your report within **72 hours**.
- For high-severity issues (anything that lets an attacker run code in a
  visitor's browser, leak data the user has entered, or compromise the
  deployed bundle), I aim to ship a fix and a release within **14 days**.
- Lower-severity issues will be tracked and fixed on a best-effort basis.

## Scope

In scope:

- Cross-site scripting (XSS) reachable via crafted URL parameters or input
  to any tool on the live site.
- Vulnerabilities in third-party dependencies that affect the deployed
  bundle (i.e. CVEs that materialise in code shipped to GitHub Pages).
- Supply-chain or build-pipeline issues that could lead to a compromised
  artifact being published.

Out of scope:

- Client-side denial-of-service (e.g. a tool that hangs the tab when given
  a 1 GB input). The site runs entirely in the user's tab; closing the tab
  is the remedy.
- Attacks that require physical access to the victim's machine.
- Reports based purely on missing security headers on `github.io` (those
  are controlled by GitHub, not this repo).
- Self-XSS, social-engineering, or anything that requires the victim to
  paste attacker-supplied code into a tool input.

## Supported versions

Only the latest minor version on `main` is supported. Older tags are kept
for history and will not receive security backports.
