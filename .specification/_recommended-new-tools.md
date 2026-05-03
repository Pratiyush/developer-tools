# Recommended New Tools for it-tools

**Generated:** 2026-04-28
**Method:** Three parallel research streams — (1) competitor catalog gap analysis (CyberChef, DevToys, transform.tools, omatsuri, freeformatter, jsonformatter, dencode, convertcase, string-functions, smallseotools), (2) live GitHub issue/discussion mining of `CorentinTh/it-tools` (open requests, sorted by engagement), (3) emerging 2025–2026 trend search (AI/LLM, web3, modern web standards, security, devops, media).

**Existing baseline:** 86 tools across 10 categories — Crypto (11), Converter (20), Web (16), Images & videos (4), Development (14), Network (6), Math (3), Measurement (3), Text (7), Data (2).

Each recommendation below is annotated with:
- **Tag:** `NEW` | `EXTEND <existing-tool>` | `REPLACE <existing-tool>`
- **Source signals:** `[community]`, `[CyberChef]`, `[DevToys]`, `[transform.tools]`, `[trend-2026]`
- **Library:** A pure-browser npm package that proves client-side feasibility (no backend needed)
- **Issue refs** when there's an open GitHub issue/discussion

---

## Tier 1 — Must-Have (high community demand AND big competitor gap)

These are the strongest additions: real users have asked, competitors all ship them, and a battle-tested browser library exists.

### 1. JWT Builder / Signer (HS256, RS256, ES256, EdDSA)
- **Tag:** `EXTEND jwt-parser`
- **Sources:** `[CyberChef] [DevToys] [trend-2026]`
- **Library:** `jose` (panva/jose, zero-dep, browser-native, supports JWKS)
- **Why:** Existing `jwt-parser` is decode-only. Backend devs constantly need to forge test tokens. Single biggest "verify-half-only" gap in it-tools.

### 2. X.509 / PEM Certificate Decoder
- **Tag:** `NEW (Crypto)`
- **Sources:** `[community #671 R:5 C:2] [#1498] [#578] [CyberChef] [trend-2026]`
- **Library:** `@peculiar/x509` or `pkijs`
- **Why:** Daily TLS/cert debugging task. Paste PEM → see subject, SAN, issuer, expiry, key algo, fingerprints.

### 3. CSR Generator
- **Tag:** `NEW (Crypto)`
- **Sources:** `[community #586] [#736]`
- **Library:** `node-forge` (already in repo for RSA tool) or `@peculiar/x509`
- **Why:** OpenSSL-style CSR builder for ops teams who don't have a Linux box handy.

### 4. UUID v6 / v7 Support
- **Tag:** `EXTEND uuid-generator`
- **Sources:** `[community #1654 R:4 C:3]`
- **Library:** `uuid` (already in repo) — v9.0+ supports v6/v7 directly
- **Why:** v7 is the new default for time-sortable distributed IDs. Trivial extension to existing tool.

### 5. DNS Lookup (A/AAAA/MX/TXT/CNAME) over DoH
- **Tag:** `NEW (Network)`
- **Sources:** `[community #831 R:6 C:8] [smallseotools] [trend-2026]`
- **Library:** Cloudflare/Google DNS-over-HTTPS endpoint via `fetch` (no library needed — pure browser)
- **Why:** Top community request. Pure client-side via DoH means no backend. Bundle with whois/SSL-check (#454, #578).

### 6. Whois / GeoIP Lookup
- **Tag:** `NEW (Network)`
- **Sources:** `[community #454 R:4 C:2] [smallseotools]`
- **Library:** Public APIs (ipapi.co, ip-api.com) — would require user-supplied API key for higher tier or use of a free tier with rate limits
- **Why:** Every ops triage moment. Bundles naturally with DNS lookup tool.

### 7. YAML Validator (with line-precise errors)
- **Tag:** `EXTEND yaml-viewer`
- **Sources:** `[community #540 R:4 C:9]`
- **Library:** `yaml` (already used) — surface error.linePos
- **Why:** Highest-engagement format-validator request. Extend existing viewer to show schema + position errors.

### 8. JSON Schema Validator + Generator
- **Tag:** `NEW (Converter)`
- **Sources:** `[community #801 R:2] [DevToys] [transform.tools] [trend-2026]`
- **Library:** `ajv` (validator) + `quicktype-core` (generator)
- **Why:** OpenAPI / AJV pipelines need this daily. Bidirectional: paste JSON → schema, paste schema + JSON → validate.

### 9. Markdown Table Generator (Visual)
- **Tag:** `NEW (Converter / Text)`
- **Sources:** `[community #542 R:3 C:5] [#572] [convertcase]`
- **Library:** Pure JS (build grid → emit GFM) — optional `markdown-table` npm
- **Why:** Most-asked Stack Overflow conversion. tablesgenerator.com clones this; we can do it better in-tab.

### 10. HTML ↔ Markdown
- **Tag:** `NEW (Converter)`
- **Sources:** `[community #538 R:1 C:5]`
- **Library:** `turndown` (HTML→MD) + `marked` (already used for markdown-to-html, MD→HTML)
- **Why:** Reverse direction of existing markdown-to-html. Round-trip docs editing.

### 11. Date / Duration Calculator (add/subtract)
- **Tag:** `NEW (Math)`
- **Sources:** `[community #584 R:3] [#1037] [#1711]`
- **Library:** `date-fns` (already in repo) — `add`, `differenceInX`
- **Why:** "What date is 90 business days from today?" — it-tools has date-format converter but no arithmetic.

### 12. Mermaid Live Renderer + PNG/SVG Export
- **Tag:** `NEW (Images / Dev)`
- **Sources:** `[community #1564 R:3] [trend-2026]`
- **Library:** `mermaid` + `html-to-image` for export
- **Why:** Diagram-as-code is now ubiquitous in READMEs/Notion/Confluence.

### 13. Favicon Generator (multi-size .ico from PNG)
- **Tag:** `NEW (Images & videos)`
- **Sources:** `[community discussion #1353] [smallseotools] [trend-2026]`
- **Library:** `pica` (resize) + `to-ico` (assemble multi-resolution ICO)
- **Why:** Every new site needs one. Currently a friction-step for indie devs.

### 14. QR Code Decoder
- **Tag:** `EXTEND qr-code-generator`
- **Sources:** `[community #656]`
- **Library:** `jsqr` or `@zxing/library`
- **Why:** We can encode but not decode — common "what's this QR?" workflow. Drag-drop image, get payload.

### 15. Remove Duplicate Lines / Deduplicate
- **Tag:** `EXTEND list-converter` or `NEW (Text)`
- **Sources:** `[community #824 R:1 C:4] [#1513] [DevToys]`
- **Library:** Pure JS (`new Set(text.split('\n'))`)
- **Why:** Trivial to ship; daily CLI replacement (`sort -u`).

---

## Tier 2 — Strong (clear competitor coverage OR clear modern need)

### Crypto / Security
- **TOTP / HOTP standalone with QR & secret extractor** — `EXTEND otp-code-generator-and-validator` — `otpauth` lib — paste `otpauth://` URI, get live codes. `[CyberChef] [trend-2026]`
- **Argon2 / Scrypt hash + verify** — `NEW` — `argon2-browser` (WASM), `scrypt-js` — bcrypt alone is no longer best practice. `[CyberChef] [trend-2026]`
- **PGP keypair + encrypt/decrypt/sign/verify** — `NEW` — `openpgp.js` — fills a gap left by RSA-only tooling. `[CyberChef]`
- **ECDSA + Ed25519 keypair / sign / verify** — `NEW` — Web Crypto API native — modern keys (SSH ed25519, JWT ES256, Bitcoin). `[CyberChef] [trend-2026]`
- **OAuth2 PKCE helper** (code-verifier + S256 challenge + state) — `NEW` — pure JS — every SPA auth flow. `[trend-2026]`
- **HIBP password breach checker (k-anonymity)** — `NEW` — `is-pwned` — first 5 chars of SHA-1 only leave the browser; great UX. `[trend-2026]`
- **CVSS 3.1 + 4.0 calculator** — `NEW` — pure JS — security teams use this constantly. `[trend-2026]`
- **htpasswd manager** — `NEW` — `htpasswd-js` or hand-rolled bcrypt+md5 — generate/inspect Apache htpasswd files. `[community #1490]`
- **Log obfuscator (PII redact)** — `NEW` — pure JS regex pipeline — paste log, redact emails/IPs/IDs. `[community #765]`
- **CSP header builder + evaluator** — `NEW` — pure JS — directive picker, live header preview, nonce/strict-dynamic warnings. `[trend-2026]`
- **SRI hash generator** — `NEW` — Web Crypto SHA-256/384/512 — pin CDN scripts. `[trend-2026]`

### Converters / Format
- **docker-compose → docker run** (reverse of existing) — `NEW` — pure JS — completes the round-trip. `[community #546 #634]`
- **Docker-compose → Kubernetes manifest** — `NEW` — `kompose-wasm` if available, else custom mapper — multi-cluster ops. `[community #883 #1555]`
- **JSON → TypeScript / Zod / Mongoose / Go / Rust / Kotlin / C# / Python class** — `NEW` — `quicktype-core` (browser build) — all DevToys/transform.tools have this. `[DevToys] [transform.tools]`
- **JSON → TOON (token-efficient JSON)** — `NEW` — small custom encoder — emerging LLM-friendly format. `[community #1677 R:2]`
- **CSV ↔ JSON / TSV / Markdown** — `EXTEND json-to-csv` — `papaparse` (likely already in repo) — completes bidirectional matrix. `[community discussion #658 #1646]`
- **CBOR / MessagePack / BSON / Avro encode-decode** — `NEW (Converter)` — `cbor-x`, `@msgpack/msgpack` — modern API/streaming formats. `[CyberChef]`
- **Protobuf encode-decode (with .proto upload)** — `NEW` — `protobufjs` — wire-format debugging. `[CyberChef]`
- **base58 / base62 / base32 / Fernet decoder** — `EXTEND base64-string-converter` — `base-x`, `fernet` — bitcoin/IPFS/Solana payload IDs. `[CyberChef]`
- **XSLT transformer** — `NEW` — browser-native `XSLTProcessor` — niche but no good free alternative. `[freeformatter]`
- **PDF → text / markdown / PNG** — `NEW` — `pdfjs-dist` — paste/drop PDF, extract content. `[community #1572 R:1 C:5]`
- **Parquet / NDJSON / JSON Lines viewer** — `NEW` — `hyparquet` (10KB read-only) or `duckdb-wasm` — modern data formats. `[community #1516] [trend-2026]`
- **JSONPath / JMESPath / JSONata multi-engine playground** — `NEW (Dev)` — `jsonpath-plus`, `@jmespath/jmespath`, `jsonata` — unified query playground. `[community #672] [trend-2026]`
- **jq playground (full WASM)** — `NEW (Dev)` — `jq-wasm` — runs real jq in-browser. `[trend-2026]`
- **DBML schema visualizer** — `NEW (Dev)` — `@dbml/core` + `@dbml/parse` — DB ERDs from text. `[trend-2026]`

### Text / Data Manipulation
- **Extract inner text from HTML/DOM** — `NEW (Text)` — `DOMParser` + `textContent` — paste HTML, get plain text. `[community #1035 R:3 C:5]`
- **Folder/tree structure ASCII generator** — `NEW (Text)` — pure JS — paste/build, emit tree-style ascii. `[community #938 R:1 C:8]`
- **XPath / JSONPath tester/builder** — `NEW (Dev)` — `xpath` lib + visual builder. `[community #672]`
- **Unicode invisible-char detector / homoglyph inspector** — `NEW (Text)` — `confusables` + `unicode-name` — security-adjacent. `[community #735] [#1580]`
- **ANSI → HTML / terminal color preview** — `NEW (Text)` — `ansi-to-html` — strip/preview log output. `[trend-2026]`
- **Log line parser (Apache / nginx / journald / JSON / GoAccess)** — `NEW (Dev)` — `pino-pretty` rules + custom — paste log, get structured rows. `[trend-2026]`
- **Set operations on lines (union / intersect / diff)** — `NEW (Text)` — pure JS Set ops — daily CLI replacement. `[DevToys]`

### Network / Infra
- **Visual subnet calculator (splittable planner)** — `EXTEND ipv4-subnet-calculator` — netmask + tree UI. `[community discussion #1745]`
- **Wireguard config generator** — `NEW (Network)` — `tweetnacl` (X25519) — wg keypair + peer config. `[community #1536 R:4 C:1]`
- **CSV/HOSTS/dhcp.conf parser** — `NEW (Network)` — pure JS — bulk parse infra files. `[trend-2026]`

### Web / Frontend
- **REM ↔ PX converter** — `NEW (Web)` — pure JS — daily CSS task. `[community #677]`
- **HTTP request tool / API client (curl-builder + headers)** — `NEW (Web)` — pure JS, fetch + curl emit. `[community #837 #1732]`
- **OpenGraph / Twitter Card debugger** — `NEW (Web)` — `DOMParser` — paste HTML, get OG/Twitter preview. `[trend-2026]`
- **JSON-LD / schema.org structured-data tester** — `NEW (Web)` — `jsonld.js` — SEO debugging. `[trend-2026]`
- **WebAuthn / passkey playground** — `NEW (Web)` — `@simplewebauthn/browser` — register/auth, parse attestation. `[trend-2026]`
- **COSE / CBOR decoder** — `NEW (Web)` — `cbor-x` — passkey attestations, CWT. `[trend-2026]`
- **CORS preflight tester (offline checklist)** — `NEW (Web)` — pure JS — explain why a request is blocked. `[trend-2026]`
- **HTML → JSX / Pug, SVG → JSX / Vue / React Native** — `NEW (Converter)` — `htmltojsx`, `svgr/core` — daily frontend task. `[transform.tools]`
- **CSS → Tailwind / JS-object** — `NEW (Web)` — `css-to-tailwindcss`, `transform-css` — Tailwind migration helper. `[transform.tools]`
- **Image-to-base64 with format auto-detect** — `EXTEND base64-file-converter` — already supports it; surface MIME, alt-text generator. `[smallseotools]`

### Images / Media
- **EXIF viewer + stripper (privacy)** — `NEW (Images)` — `ExifReader` (read), `piexifjs` (write) — privacy-critical for shared photos. `[CyberChef] [trend-2026]`
- **WCAG contrast checker + APCA + color-blindness simulator** — `EXTEND color-converter` — `chroma-js` + `colorjs.io` — a11y workflows. `[DevToys] [trend-2026]`
- **SVG optimizer (full SVGOMG-style plugin picker)** — `NEW (Images)` — `svgo` browser build — `[trend-2026]`
- **Glassmorphism / neumorphism / gradient builder** — `NEW (Images)` — pure CSS preview + copy — designer tools. `[omatsuri] [trend-2026]`
- **Video → GIF (ffmpeg.wasm)** — `NEW (Images)` — `@ffmpeg/ffmpeg` — common content task. `[trend-2026]`
- **Image compressor (PNG/JPEG/WebP) with quality slider** — `NEW (Images)` — `browser-image-compression` or `imagetracerjs` — ubiquitous task. `[DevToys]`
- **Color-palette generator (analogous / complementary / shades)** — `NEW (Images)` — `chroma-js` — designer staple. `[omatsuri]`
- **Triangle / blob / wave SVG generator** — `NEW (Images)` — pure JS — landing-page asset gen. `[omatsuri]`

### DevOps / Generators
- **Mock/fake data generator (faker.js → JSON / CSV / SQL INSERT)** — `NEW (Dev)` — `@faker-js/faker` (browser build) — testing fixtures. `[omatsuri] [trend-2026]`
- **Semver calculator (compare, bump, satisfy ranges)** — `NEW (Math/Dev)` — `semver` — release engineering. `[DevToys] [trend-2026]`
- **gitignore generator (template picker + composer)** — `NEW (Dev)` — static `gitignore.io` template list bundled. `[trend-2026]`
- **License picker (SPDX-aware)** — `NEW (Dev)` — `spdx-license-list` — open-source publishing. `[trend-2026]`
- **GitHub Actions YAML linter** — `NEW (Dev)` — `actionlint` rules ported / `actionlint-wasm` — CI/CD debug. `[trend-2026]`
- **Dockerfile linter (hadolint rules)** — `NEW (Dev)` — `hadolint` rules in JS. `[trend-2026]`
- **.env validator + dotenv ↔ JSON ↔ TOML** — `NEW (Dev)` — `dotenv` + custom — config-format friction. `[trend-2026]`
- **Conventional-commit PR-title checker + semver bump previewer** — `NEW (Dev)` — `@commitlint/parse` + `semver`. `[trend-2026]`
- **Cron parser with human-readable + next-run preview** — `EXTEND crontab-generator` — `cronstrue` + `cron-parser` — completes generator/parser pair. `[DevToys]`
- **AWS SigV4 request signer** — `NEW (Dev)` — `aws4fetch` — debug API requests. `[trend-2026]`
- **Resistor color-code calculator (4/5/6 band)** — `NEW (Math)` — pure JS lookup — electronics hobbyist staple. `[community #580 R:3 C:1]`
- **Data-storage / data-transfer unit converter (B/KB/MB/Gbps/Mbps)** — `NEW (Measurement)` — pure JS — daily ops calc. `[community #539 #785 #848]`
- **RAID calculator** — `NEW (Math)` — pure JS — capacity / fault-tolerance planner. `[community discussion #1506]`

---

## Tier 3 — AI / LLM Era (high novelty, growing usage)

The fastest-growing utility category in 2025–2026. it-tools has zero AI tooling today.

- **Prompt token counter & cost estimator** — `NEW (Dev)` — `js-tiktoken` (GPT) + `@anthropic-ai/tokenizer` (Claude) — paste prompt, see tokens + $ across models. `[trend-2026]`
- **JSON-Schema → Zod converter** — `NEW (Converter)` — `json-schema-to-zod` — codegen for tool/function calling. `[transform.tools] [trend-2026]`
- **JSON Schema → TypeScript** — `NEW (Converter)` — `json-schema-to-typescript` or `quicktype-core`. `[transform.tools] [trend-2026]`
- **llms.txt / llms-full.txt generator** — `NEW (Web)` — pure markdown templating — robots.txt for AI crawlers, mass adoption 2025–26. `[trend-2026]`
- **OpenAI/Anthropic function-call schema builder** — `NEW (Dev)` — Monaco + Ajv — visual JSON-Schema builder for tool-use spec. `[trend-2026]`
- **Prompt template tester (variables + diff)** — `NEW (Dev)` — `nunjucks`/`mustache.js` — run same template across var sets, side-by-side diff. `[trend-2026]`
- **Embedding visualizer (2D/PCA/UMAP)** — `NEW (Math)` — `umap-js` or `druid` — paste vectors, see cluster. `[trend-2026]`
- **MCP server config builder** — `NEW (Dev)` — pure JSON — Claude/Cursor/Windsurf MCP entry helper. `[trend-2026]`

---

## Tier 4 — Web3 / Blockchain (specialized but underserved)

- **EIP-55 checksum validator + ENS resolver** — `NEW` — `viem` (browser-native) — common eth-address task. `[trend-2026]`
- **ABI encoder / decoder (calldata + events)** — `NEW` — `viem` ABI utils — wire-format debugging. `[trend-2026]`
- **EIP-712 typed-data signature builder + verifier** — `NEW` — `viem.verifyTypedData`. `[trend-2026]`
- **Wei / Gwei / Ether converter + EIP-1559 fee estimator** — `EXTEND temperature-converter`-style — `viem.formatUnits`. `[trend-2026]`
- **BIP-32 / BIP-44 derivation playground** — `EXTEND bip39-generator` — `bip39` + `@scure/bip32` — Iancoleman's BIP-39 page modernized. `[trend-2026]`
- **Ethereum keystore (V3) decoder** — `NEW` — `ethereumjs-wallet` — drop in JSON, enter password, view privkey locally. `[trend-2026]`
- **PASERK key generator** — `NEW` — `paseto-ts` — modern PASETO sibling. `[community #1567]`

---

## Tier 5 — Niche but Delightful

These add personality / community appeal even if they aren't daily drivers.

- **Regex visualizer (railroad diagrams)** — `EXTEND regex-tester` — already uses regexper internals; surface the diagram as a first-class tool. `[trend-2026]`
- **Hex color → human name guesser** — `NEW` — `color-name-list` — nearest CSS / Pantone / xkcd name. `[trend-2026]`
- **Command-line cheatsheet generator** — `NEW` — static JSON — pick tool (git, ffmpeg, jq), get curated cheatsheet. `[trend-2026]`
- **HTTP status "explain like I'm 5"** with cat-meme alts — `EXTEND http-status-codes` — pure JS + static images. `[trend-2026]`
- **MITRE ATT&CK technique lookup** — `NEW` — static MITRE JSON — security analysts. `[trend-2026]`
- **Caret-M / Quoted-Printable / Punycode / NetBIOS / Braille / Modhex encoders** — `NEW` (each a small `EXTEND text-to-X`) — `[dencode]`
- **Alternating / vaporwave / Zalgo case** — `EXTEND case-converter` — pure JS. `[convertcase]`
- **OCR (image → text)** — `NEW (Images)` — `tesseract.js` — extracts text from screenshots. `[CyberChef] [trend-2026]`
- **WebRTC stats viewer / TURN/STUN tester** — `NEW (Network)` — pure browser RTCPeerConnection. `[trend-2026]`

---

## Implementation Priority — "If You Can Only Ship 15"

Optimized for highest user-value × lowest implementation cost × pure browser-side feasibility.

| #  | Tool                            | Tier | Eff. (S/M/L) | Library                 |
|----|---------------------------------|------|--------------|--------------------------|
| 1  | JWT Builder/Signer              | 1    | M            | `jose`                   |
| 2  | UUID v6/v7                      | 1    | S            | `uuid` v9                |
| 3  | DNS lookup (DoH)                | 1    | S            | native `fetch`           |
| 4  | YAML validator (extend)         | 1    | S            | `yaml` (existing)        |
| 5  | Markdown table generator        | 1    | S            | pure JS                  |
| 6  | HTML ↔ Markdown                 | 1    | S            | `turndown` + `marked`    |
| 7  | QR decoder                      | 1    | S            | `jsqr`                   |
| 8  | Date/duration calculator        | 1    | S            | `date-fns` (existing)    |
| 9  | X.509 cert decoder              | 1    | M            | `@peculiar/x509`         |
| 10 | JSON Schema validator+generator | 1    | M            | `ajv` + `quicktype-core` |
| 11 | Mermaid renderer + export       | 1    | M            | `mermaid`                |
| 12 | Favicon generator               | 1    | M            | `pica` + `to-ico`        |
| 13 | Prompt token counter            | 3    | S            | `js-tiktoken`            |
| 14 | llms.txt generator              | 3    | S            | pure JS                  |
| 15 | EXIF viewer / stripper          | 2    | S            | `ExifReader` + `piexifjs`|

**Effort:** S ≈ a half-day per spec, M ≈ 1–2 days. Total ~3 weeks if shipped sequentially; ~1 week if parallelized across contributors.

---

## Notes & Project-Health Caveats

- **Upstream maintenance:** Issue #1635 ("Is this project dead?") and #1704 indicate `CorentinTh/it-tools` is slow-moving. The active community fork at `sharevb/it-tools` already implements several Tier-1 items (worth diff'ing before shipping).
- **i18n discipline:** Every new tool's `index.ts` should use `translate('tools.<name>.title' / '.description')`, not hard-coded English. Prior batch found 8 existing tools that violate this.
- **Test coverage baseline:** Tier-1 tools should ship with `*.service.test.ts` + a Playwright `*.e2e.spec.ts`. ~60% of existing tools lack tests; we shouldn't worsen the ratio.
- **No-backend constraint:** Every recommendation above has a verified pure-browser library. If a tool requires a server (e.g. true whois, real-time SSL chain analysis), call that out and use a public API (with disclosure) or skip it.
- **Avoid duplication with `redirectFrom`:** When extending an existing tool, prefer `EXTEND` over a new route — and add the old route to `redirectFrom` if the URL would change.

---

## Source Index

**Competitor catalogs surveyed:**
- CyberChef Categories.json (gchq/CyberChef master)
- DevToys 2.0 catalog (devtoys.app)
- transform.tools, freeformatter.com, jsonformatter.org
- omatsuri.app (rtivital/omatsuri)
- dencode.com, convertcase.net, string-functions.com
- smallseotools developer suite

**Community signals (it-tools repo):**
- Open issues with `new tool` / `enhancement` labels (engagement-sorted via GitHub API)
- Discussions in the "Ideas" category
- CHANGELOG of recently-shipped tools (excluded from suggestions)

**Trend research:**
- 2025–2026 dev/AI/web3 tooling articles
- npm download stats for verified pure-browser libraries
- Public playgrounds (jsonpath101, jq.play, mermaid live editor, Iancoleman BIP-39, srihash.org)
