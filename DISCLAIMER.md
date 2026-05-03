# Disclaimer

`developer-tools` is provided **as-is**, without warranty of any kind. See [LICENSE](LICENSE) for the full MIT terms.

## Usage

These utilities are intended for **convenience and learning**, not for handling production-grade secrets at scale. Although every tool runs entirely in your browser and nothing leaves your device, you are still responsible for what you paste.

A few common-sense guidelines:

- **Do not** paste real production credentials (API keys, database passwords, signing keys) into any tool, even though processing is local. Your browser, browser extensions, screen-recording software, and clipboard managers all see the input.
- **Do not** paste personally identifiable information about real people if you can avoid it.
- **Do** verify cryptographic outputs against a second independent tool when correctness matters (e.g. signing a JWT for a payment endpoint).

## Accuracy

Every tool is tested, and every release passes a quality gate (lint, typecheck, unit tests, E2E with `@axe-core/playwright`). That said: bugs happen. If you depend on a tool's output for something important, **verify the result with at least one other source**.

## Reporting issues

For security-impacting bugs, follow [SECURITY.md](SECURITY.md). For other bugs and feature requests, open a GitHub issue using the templates in `.github/ISSUE_TEMPLATE/`.

## No professional advice

Output from any tool here is not legal, financial, medical, or other professional advice. The tools manipulate data; they do not interpret it for your situation.
