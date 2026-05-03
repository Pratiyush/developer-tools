# Privacy

**Last updated:** 2026-04-30

`developer-tools` is a static webapp. It has **no server** of its own, runs entirely in your browser, and never transmits the data you paste. This document describes what that means in concrete terms.

---

## I. Overview

Every tool on this site:

- Runs as JavaScript in your browser tab.
- Reads input you paste, types, drag-drop, or load from a URL parameter.
- Computes the result locally.
- Optionally writes a small amount of preference data to your browser's `localStorage` (theme, locale, per-tool toggles).

There is no API call to a backend we control. There is no log we keep. There is no analytics — yet — and when there is, it will be off by default and you'll be asked to opt in.

---

## II. Information we collect on a server

**None.** There is no server we operate.

---

## III. Information that stays in your browser

We use `localStorage` for a small set of preferences, listed below. You can clear all of it via DevTools → Application → Storage → Clear, or by running `localStorage.clear()` in the browser console.

| Key           | Purpose                                                         | Status   |
| ------------- | --------------------------------------------------------------- | -------- |
| `dt.theme`    | Selected theme (clean / linear / vercel / paper / …)            | Today    |
| `dt.locale`   | Explicit locale override (otherwise auto-detected)              | Today    |
| `dt.consent`  | Your consent choice for analytics (off by default)              | Planned  |
| Per-tool keys | Tool-specific UI state (e.g. URL-safe toggle on base64 encoder) | Per tool |

---

## IV. Cookies

**We set zero cookies today.**

GitHub Pages — our hosting provider — may set its own cookies for service-level functions (rate limiting, security). Those are governed by [GitHub's privacy policy](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement).

When we introduce analytics (Section V), we will add a consent banner. Cookies fire only after you accept.

---

## V. Analytics

There is **no analytics today**.

When introduced (planned via Google Tag Manager loading GA4 + Hotjar), the design is:

- **Off by default.** No tracker fires until you explicitly accept via a consent banner.
- **`Do-Not-Track` honored.** If your browser sends `DNT: 1`, no trackers load even if you click accept.
- **Inputs are never tracked.** Events are limited to user actions (`tool_opened`, `encode_clicked`) and bucketed metadata (`output_length: '100-1000'`). The text you paste never crosses the wire.
- **One-click reject.** A "Reject all" button in the consent banner clears any stored consent and stops further loading.

When this changes, this section will list the exact tags loaded and what each measures.

---

## VI. Deep links and the URL

Some tools encode their state in the URL so you can share a working link.

- **Query parameters (`?…`)** carry small, non-sensitive values: which tool, which mode, toggle states. Search-engine bots and HTTP `Referer` headers can see these.
- **Hash parameters (`#…`)** carry the actual paste/input. Hash is **never** sent to any server, never logged in webserver logs, and never appears in `Referer`. We deliberately put sensitive payloads in the hash for this reason.

If you share a deep-link, the recipient sees what you saw. **Don't share if the input is sensitive.**

---

## VII. Third parties

The site is hosted on **GitHub Pages**. When you visit, your browser connects to GitHub's CDN. GitHub sees your IP address, your User-Agent, and the URL you requested. We do not receive that information ourselves; it sits in GitHub's logs under their privacy policy.

We load fonts from **Google Fonts** for typography (`fonts.googleapis.com`, `fonts.gstatic.com`). Google's Fonts API logs the request as documented in [Google Fonts API Service Specific Terms](https://developers.google.com/fonts/faq/privacy).

That's it. No other third-party request fires from any tool today.

---

## VIII. Security

We treat the privacy and integrity of your input as a security concern. See [SECURITY.md](SECURITY.md) for the threat model and how to report vulnerabilities.

In short:

- All processing is in-browser.
- Dependencies are scanned via Dependabot + CodeQL.
- The build is reproducible from the source on GitHub.
- Releases are signed.

---

## IX. Children

The tools are not directed at children. We do not knowingly collect any data from anyone — child or adult — because we do not collect data at all. If you're under your country's age of digital consent, the tools are still safe to use; nothing leaves your browser.

---

## X. International data transfers

We don't transfer data because we don't collect any. Hosting via GitHub Pages may serve content from a CDN edge node nearest to you, in whichever country that is.

---

## XI. Your rights and choices

You can:

- **Clear stored preferences** in DevTools → Application → Storage → Clear.
- **Disable JavaScript** entirely; the tools require it to run, so they will not work, but no preferences will be stored either.
- **Use a privacy-respecting browser** (Firefox, Brave, etc.) or extensions (uBlock Origin, etc.) — nothing on this site relies on tracking.
- **Open an issue** if you discover a privacy bug. Use GitHub Security Advisories for sensitive reports.

If/when analytics is added, you will additionally be able to:

- **Reject** all trackers via the consent banner.
- **Revoke** consent at any time; the next page load loads no trackers.

---

## XII. Changes

This document is versioned alongside the source code. Material changes are noted in [CHANGELOG.md](CHANGELOG.md) and announced in release notes.

If we ever begin server-side data collection (we currently have no plans to), this page will be rewritten before the change is deployed, and a notice will appear in the footer until users have had a chance to read it.

---

## XIII. Contact

Questions: `pratiyush1@gmail.com` with the prefix `[privacy]`. Security issues: see [SECURITY.md](SECURITY.md).

The maintainer responds within 7 days for general questions and within 72 hours for privacy-impacting bug reports.
