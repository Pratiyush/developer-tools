# Recommended New Tools — Additional (Round 2)

**Generated:** 2026-04-28
**Method:** Three more parallel research streams beyond the first round — (1) hidden-gem tool sites (Toolsley, 10015.io, Haikei, Clippy, regex101 deep features, FontDrop, Hashids/Sqids, Coolors, etc.), (2) specialized domains (a11y, i18n, calendars, embedded/IoT, audio/voice, mobile-native, privacy, advanced math), (3) cloud/devops/database/API/observability/auth/CLI tooling.

**Companion file:** [`_recommended-new-tools.md`](./_recommended-new-tools.md) (Round 1) — read first. This file is a strict superset of additional ideas not already listed there.

All recommendations have a **verified browser-compatible npm library or browser API**. `[BACKEND]` markers call out items that require a server.

---

## A. CSS / Design Generators (currently zero in it-tools)

| Tool | Library | Tag |
|------|---------|-----|
| **Clip-path polygon editor** (Clippy-style) | pure SVG/JS | `NEW` |
| **Glassmorphism builder** (frosted-glass card CSS) | pure CSS | `NEW` |
| **Neumorphism builder** (dual-shadow soft-UI) | pure CSS | `NEW` |
| **SVG wave / blob / pattern generator** (Haikei-style) | pure SVG | `NEW` |
| **Mesh-gradient builder** (oklch/oklab/Display-P3 HDR) | `colorjs.io` | `NEW` |
| **CSS loader / spinner generator** | pure CSS | `NEW` |
| **CSS shadow / drop-shadow editor** | pure CSS | `NEW` |
| **Cubic-bezier easing editor** | `bezier-easing` | `NEW` |
| **Gradient-shades / palette extender** (oklch interp) | `chroma-js` | `EXTEND color-converter` |
| **Curated palette browser** (Coolors / FlatUI / ColorHunt JSON) | static JSON | `NEW` |
| **Image-to-palette extractor** (drag photo, get N hexes) | `node-vibrant` | `NEW` |
| **Text-shadow / box-shadow visual editor** | pure CSS | `NEW` |
| **CSS pattern (stripes, dots, checkerboard) generator** | pure CSS | `NEW` |

---

## B. Accessibility (a11y)

| Tool | Library | Tag |
|------|---------|-----|
| **WCAG AA/AAA + APCA dual contrast checker** | `apca-w3` + `wcag-contrast` | `EXTEND color-converter` |
| **8-mode color-blindness simulator** (protan/deuter/tritan/achromat × normal/severe) | `@bjornlu/colorblind` | `NEW` |
| **Reading-grade-level analyzer** (Flesch-Kincaid, Coleman-Liau, Dale-Chall) | `text-readability` | `EXTEND text-statistics` |
| **ARIA role explorer** (~80 roles, grouped landmark/widget/composite) | static JSON | `NEW` |
| **Reduced-motion preview** (CSS `prefers-reduced-motion` toggle) | pure CSS | `NEW` |
| **Focus-order visualizer** (paste HTML, draw numbered overlays) | pure JS | `NEW` |
| **Screen-reader text preview** (`SpeechSynthesis`, list voices) | browser-native | `NEW` |
| **Heading hierarchy linter** (paste HTML, flag h-skip / multiple h1) | `DOMParser` | `NEW` |

---

## C. Internationalization / Localization

| Tool | Library | Tag |
|------|---------|-----|
| **BCP-47 builder + validator** | `bcp-47` + `bcp-47-match` | `NEW` |
| **ICU MessageFormat playground** (plural/select AST) | `intl-messageformat` + `@formatjs/icu-messageformat-parser` | `NEW` |
| **CLDR plural-rule explorer** (~220 locales) | `Intl.PluralRules` (native) | `NEW` |
| **Unicode normalization inspector** (NFC/NFD/NFKC/NFKD, byte-level diff) | `String.prototype.normalize` (native) | `EXTEND text-to-unicode` |
| **Bidi/RTL text preview** (UAX #9 embedding levels) | `bidi-js` | `NEW` |
| **Encoding sniffer** (Shift-JIS/Big5/GBK/KOI-8/Win-1251) | `jschardet` + `TextDecoder` (native) | `NEW` |
| **ISO 4217 currency lookup** | `currency-codes` | `NEW` |
| **ISO 3166 country / region lookup** + currency cross-map | `iso-3166-1` + `country-to-currency` | `NEW` |
| **Half-width ↔ full-width converter** (Latin / katakana / Hangul) | pure JS table | `NEW` |
| **Punycode / IDN encoder/decoder** | `punycode` (native) | `NEW` |

---

## D. Time / Date / Calendar (existing date-time-converter is format-only)

| Tool | Library | Tag |
|------|---------|-----|
| **Cron next-N-fires preview with TZ/DST** | `cron-parser` + `cronstrue` | `EXTEND crontab-generator` |
| **ISO 8601 duration parser** (`PT1H30M` ↔ object) | `tinyduration` | `NEW` |
| **Timezone abbreviation collision viewer** (CST/IST/AST disambiguation) | static JSON | `NEW` |
| **Multi-resolution Unix epoch** (s / ms / μs / ns auto-detect) | pure JS | `EXTEND date-time-converter` |
| **Multi-calendar converter** (Hebrew / Hijri / Persian / Buddhist / Japanese) | `Intl.DateTimeFormat` (native) + `@hebcal/core` + `hijri-converter` + `jalaali-js` | `NEW` |
| **Working-days calculator with country holidays** | `date-holidays` (every country, 1970–2080) | `NEW` |
| **Sunrise / sunset / civil-twilight** (lat/lng) | `suncalc` | `NEW` |
| **Stardate (TNG / TOS / Kelvin) converter** | pure math | `NEW` (delight) |
| **Age calculator** (years/months/days between two dates) | `date-fns` (existing) | `EXTEND date-time-converter` |

---

## E. Math / Numbers (currently 3 tools)

| Tool | Library | Tag |
|------|---------|-----|
| **BigInt prime checker / factorizer** | `extra-bigint` + native `BigInt` | `NEW` |
| **GCD / LCM calculator** | pure Euclid | `NEW` |
| **Fraction simplifier + continued fraction** | `fraction.js` | `NEW` |
| **Significant-figures rounder + scientific notation** | pure JS | `NEW` |
| **IEEE-754 float bit analyzer** (sign / exponent / mantissa) | pure JS | `NEW` |
| **Numbers-to-words** (cardinal text up to nonillion) | `number-to-words` | `NEW` |
| **Roman / Mayan / Egyptian / Babylonian numeral converter** | static mapping | `EXTEND roman-numeral-converter` |
| **Statistics (mean/median/mode/stdev/quantiles)** | `simple-statistics` | `NEW` |
| **Linear / logistic regression on pasted CSV** | `simple-statistics` | `NEW` |
| **Easing function visualizer** (30+ named easings) | `d3-ease` | `NEW` |

---

## F. Embedded / IoT / Hardware (currently zero)

| Tool | Library | Tag |
|------|---------|-----|
| **Resistor color-code (3/4/5/6-band)** | pure JS table | `NEW` |
| **Capacitor 3-digit / EIA marking decoder** | pure lookup | `NEW` |
| **Ohm's law calculator** (V/I/R/P + LED resistor variant) | pure math | `NEW` |
| **GPS / NMEA sentence parser** (GGA/RMC/VTG) | `nmea-simple` or `gps` | `NEW` |
| **Modbus register decoder** (RTU / TCP framing + CRC) | hand-rolled (~120 LOC) | `NEW` |
| **ESP32 / Arduino / RPi pinout reference** | static JSON | `NEW` |
| **IP67/IP68 ingress-protection lookup** | static 2D table | `NEW` |
| **I²C / SPI / UART address explorer** | static JSON | `NEW` |
| **AWG ↔ mm² wire-gauge converter** | static table | `NEW` |
| **Battery capacity / runtime calculator** (mAh + draw) | pure math | `NEW` |

---

## G. Audio / Voice / Speech (currently zero)

| Tool | Library | Tag |
|------|---------|-----|
| **Text-to-speech preview** (list `getVoices()` by locale) | browser-native `SpeechSynthesis` | `NEW` |
| **Speech-to-text preview** (Chrome/Edge only; warn re: Google routing) | browser-native `SpeechRecognition` | `NEW` |
| **Audio waveform viewer** (drag WAV/MP3/OGG) | `wavesurfer.js` (+ Spectrogram plugin) | `NEW` |
| **BPM tap-tempo + auto-detect** | `realtime-bpm-analyzer` | `NEW` |
| **Note frequency / cents converter** (A4 = 440Hz default, configurable) | `tone` or pure formula | `NEW` |
| **WebAudio synth playground** (oscillator + envelope + filter) | `tone` | `NEW` |
| **IPA phonetic transcription** (English ARPABET → IPA) | `cmu-pronouncing-dictionary` | `NEW` |
| **Decibel ↔ amplitude / power converter** | pure math | `NEW` |

---

## H. Game Dev / Graphics

| Tool | Library | Tag |
|------|---------|-----|
| **Texture-atlas / sprite-sheet slicer** (export Phaser/PixiJS JSON) | Canvas2D | `NEW` |
| **Hex → ARM/x86/x64 disassembler** (lazy WASM) | `capstone.js` (~5MB lazy) | `NEW` |
| **Color-space converter** (Lab/LCh/OKLCH/HSL/Display-P3/Jzazbz) | `colorjs.io` | `REPLACE color-converter` (extend with full-gamut ops) |
| **Gamut-mapping previewer** (sRGB → P3 → rec2020 visual) | `colorjs.io` | `NEW` |
| **Game tick / frame-rate calculator** (fps → ms / hz) | pure math | `NEW` |

---

## I. Mobile / Native Dev (currently zero)

| Tool | Library | Tag |
|------|---------|-----|
| **iOS app icon-set generator** (15 sizes from one PNG) | Canvas + JSZip | `NEW` |
| **Android adaptive icon generator** (foreground + background + mipmap-mdpi…xxxhdpi) | Canvas + JSZip | `NEW` |
| **App Store / Play Store char-counter** (title/subtitle/desc limits) | pure JS | `NEW` |
| **APNS / FCM push payload builder + validator** | `ajv` + JSON Schema | `NEW` |
| **Deep-link / Universal-link builder + tester** (with QR) | pure JS + `qrcode` (existing) | `EXTEND qr-code-generator` |
| **Privacy-nutrition-label preview** (Apple-style SVG) | static markup | `NEW` |
| **Android Manifest permission explainer** | static JSON | `NEW` |

---

## J. Database / SQL (currently sql-prettify only)

| Tool | Library | Tag |
|------|---------|-----|
| **DBML ↔ SQL DDL ↔ ERD viewer** | `@dbml/core` + `mermaid` (erDiagram) | `NEW` |
| **DuckDB-WASM SQL playground** (run real SQL on pasted CSV/JSON/Parquet) | `@duckdb/duckdb-wasm` | `NEW` |
| **Postgres EXPLAIN visualizer** | `pev2` (Vue 3 — perfect fit) | `NEW` |
| **SQL → ORM (Prisma / Drizzle / TypeORM / Sequelize / SQLAlchemy / GORM)** | `node-sql-parser` + templates | `EXTEND sql-prettify` |
| **SQL dialect differ** (Postgres → MySQL incompatibilities) | `node-sql-parser` AST diff | `NEW` |
| **Mongo aggregation pipeline runner** (against pasted JSON) | `mingo` | `NEW` |
| **Redis command builder** (form → exact `redis-cli` command) | pure JS | `NEW` |
| **Migration diff (Alembic / Flyway / Liquibase)** | `@dbml/core` + templates | `NEW` |
| **Query parameter binder** ($1/?/`:name`/`@p1` substitution) | pure JS | `NEW` |
| **JSON / NDJSON / Parquet preview** | `hyparquet` (10KB read-only) | `NEW` |

---

## K. Cloud — AWS / GCP / Azure (currently zero cloud-specific)

| Tool | Library | Tag |
|------|---------|-----|
| **AWS ARN parser/builder** | `@aws-sdk/util-arn-parser` | `NEW` |
| **AWS SigV4 signing playground** (canonical request → signature, step-by-step) | `@aws-sdk/signature-v4` + `@aws-crypto/sha256-browser` | `NEW` |
| **IAM policy simulator** (Allow/Deny w/ SCP & boundary) | `@cloud-copilot/iam-simulate` | `NEW` |
| **IAM policy linter / minifier** | `@thinkinglabs/aws-iam-policy` | `NEW` |
| **S3 URL / presigned-URL decoder** | native `URL` | `EXTEND url-parser` |
| **Cognito / Apple / Google sign-in JWT explainer** (claim dictionary) | `jose` | `EXTEND jwt-parser` |
| **GCP service-account key parser** (project / key-id / fingerprint) | `jose` | `NEW` |
| **AWS region / AZ latency picker** (haversine on static lat/long) | `@turf/distance` | `NEW` |

---

## L. IaC — Terraform / Pulumi / CloudFormation

| Tool | Library | Tag |
|------|---------|-----|
| **HCL ↔ JSON converter** | `@cdktf/hcl2json` (HashiCorp WASM) | `NEW` |
| **HCL prettifier (`terraform fmt` offline)** | `@cdktf/hcl2json` | `NEW` |
| **CloudFormation YAML/JSON converter** (handles `!Ref`/`!Sub`) | `yaml-cfn` | `NEW` |
| **Terraform plan visualizer** (JSON form via `terraform show -json`) | tree component | `NEW` |
| **ARM / Bicep template viewer** | tree component | `EXTEND json-viewer` |

---

## M. CI/CD Pipelines

| Tool | Library | Tag |
|------|---------|-----|
| **GitHub Actions / GitLab CI / CircleCI / Bitbucket Pipelines / Azure Pipelines / BuildKite YAML linter** (one tool, dialect picker, all schemas from SchemaStore.org) | `ajv` + JSON Schemas | `NEW` |
| **Conventional-commit checker + semver bump previewer** | `@commitlint/parse` + `semver` | `NEW` |
| **Renovate / Dependabot config validator** | `ajv` + SchemaStore | `NEW` |
| **Bazel BUILD / MODULE.bazel cheat-helper** | static reference (no parser available) | `NEW` |

---

## N. Kubernetes / Helm / Docker

| Tool | Library | Tag |
|------|---------|-----|
| **K8s YAML linter / kubeconform** | `@monokle/validation` (browser-ready, ships K8s schemas) | `NEW` |
| **kubectl explain mirror** | `@monokle/validation` | `NEW` |
| **Helm values deep-merge / diff** | `js-yaml` + `lodash.merge` | `NEW` |
| **ConfigMap / Secret base64 wrap helper** | `js-yaml` + native `btoa` | `EXTEND base64-string-converter` |
| **Pod resource calculator** (parse "500m"/"1Gi", sum requests/limits, flag overcommit) | `kubernetes-resource-parser` | `NEW` |
| **HPA target-utilization simulator** | pure math + `chart.js` | `NEW` |
| **CRD schema viewer** (paste OpenAPI v3) | `@stoplight/json-schema-viewer` | `NEW` |
| **Dockerfile layer / size analyzer** (parse + flag bloat) | `dockerfile-ast` | `EXTEND docker-run-to-docker-compose-converter` |

---

## O. API / OpenAPI / GraphQL / AsyncAPI

| Tool | Library | Tag |
|------|---------|-----|
| **OpenAPI → Postman collection** | `openapi-to-postmanv2` | `NEW` |
| **OpenAPI → curl / fetch / axios snippets** | `openapi-snippet` | `NEW` |
| **OpenAPI breaking-change diff** | `openapi-diff` | `NEW` |
| **OpenAPI YAML/JSON converter** | `js-yaml` | `EXTEND yaml-to-json-converter` |
| **Swagger 2 → OpenAPI 3 upgrade** | `swagger2openapi` | `NEW` |
| **GraphQL → TypeScript codegen** | `@graphql-codegen/typescript` | `NEW` |
| **GraphQL schema linter (Spectral rules)** | `@stoplight/spectral-core` + rulesets | `NEW` |
| **AsyncAPI viewer** | `@asyncapi/parser` | `NEW` |
| **gRPC reflection JSON viewer** | tree component | `EXTEND json-viewer` |
| **Postman ↔ Insomnia ↔ Hoppscotch collection converter** | `postman-collection` | `NEW` |

---

## P. Auth / Identity

| Tool | Library | Tag |
|------|---------|-----|
| **OIDC discovery doc explorer** (paste `.well-known/openid-configuration`, decorate fields with spec section) | `fetch` + static dictionary | `NEW` |
| **SAML XML decoder** (deflate + parse assertion) | `pako` + `fast-xml-parser` | `NEW` |
| **SCIM 2.0 payload validator** | `scim-patch` + `@braveulysses/scim2` | `NEW` |
| **LDAP DN parser** (RFC 2253) | `rfc2253` | `NEW` |
| **WebAuthn / Passkey playground** (register + auth + parse attestation) | `@simplewebauthn/browser` | `NEW` |
| **htpasswd manager** (bcrypt / SHA-1 / MD5 entries) | `bcryptjs` (existing) + custom | `NEW` |

---

## Q. Logging / Observability

| Tool | Library | Tag |
|------|---------|-----|
| **Common-Log-Format parser** (Apache / nginx) | `clf-parser` | `NEW` |
| **syslog RFC 3164 / 5424 / CEF parser** | `nsyslog-parser` | `NEW` |
| **Logstash Grok pattern tester** | `grok-js` + Logstash patterns | `NEW` |
| **journald JSON line parser** | tree component | `EXTEND json-viewer` |
| **PromQL helper / explainer** | `@prometheus-io/lezer-promql` | `NEW` |
| **Grafana Loki LogQL playground** | `@grafana/lezer-logql` | `NEW` |
| **Jaeger trace JSON Gantt viewer** | `gantt-task-react` (port to Vue) | `NEW` |
| **OpenTelemetry semconv lookup** | `@opentelemetry/semantic-conventions` | `NEW` |
| **SLO error-budget calculator** | pure formula | `NEW` |
| **CloudWatch Logs Insights / Splunk SPL formatter** | `sql-formatter` (generic) | `NEW` |

---

## R. JSON Specialists (beyond formatter)

| Tool | Library | Tag |
|------|---------|-----|
| **Semantic JSON diff** (key-order-insensitive — `{a,b}` ≡ `{b,a}`) | `deep-diff` | `EXTEND json-diff` |
| **JSON sort** (recursive alpha or by-value) | pure JS | `NEW` |
| **JSON ↔ JSON Lines / NDJSON converter** | pure JS | `NEW` |
| **JSON-to-Swift Codable / Kotlin / Rust / Go / Python class** | `quicktype-core` | `NEW` |
| **JSON click-to-copy tree viewer with JSONPath** | tree component + `jsonpath-plus` | `EXTEND json-viewer` |
| **JSON → TOON (token-efficient)** | small custom encoder | `NEW` |

---

## S. Regex Specialists (beyond regex-tester)

| Tool | Library | Tag |
|------|---------|-----|
| **Regex code generator** (emit Python/Go/Java/C#/Rust/PHP from a JS regex) | template engine | `EXTEND regex-tester` |
| **Regex unit-test panel** (save expected match/no-match cases as a regression suite) | `localStorage` | `EXTEND regex-tester` |
| **Regex pattern library** (saveable + shareable named patterns) | `localStorage` + URL share | `EXTEND regex-tester` |
| **Regex backtracking debugger / step-through** | custom NFA visualizer | `EXTEND regex-tester` |
| **Railroad diagram visualizer** (already has regexper internals — surface) | `regexper-render` (existing) | `EXTEND regex-tester` |

---

## T. File Forensics / Privacy

| Tool | Library | Tag |
|------|---------|-----|
| **Magic-byte / file-type detector** (drag any file, detect type from signature) | `file-type` or `magic-bytes.js` | `NEW` |
| **File hash (SHA-256/512) drag-drop** with streaming for big files | `crypto.subtle.digest` + `hash-wasm` | `EXTEND hash-text` |
| **Strings extractor** (binary → printable ASCII/UTF-16, len ≥4) | pure JS | `NEW` |
| **EXIF viewer + lossless stripper** | `ExifReader` (read) + `piexifjs` (write) | `NEW` |
| **JPEG metadata stripper (XMP / IPTC / GPS too)** | `piexifjs` | `NEW` |
| **PDF metadata viewer + stripper** | `pdf-lib` | `NEW` |
| **LSB image steganography encode/decode** | `steganography` or `lsb` | `NEW` |
| **File splitter / joiner** (chunk for size-limited transfers) | Blob slicing | `NEW` |
| **CRC / Adler-32 / xxHash file checksum** | `crc-32` + `hash-wasm` | `EXTEND hash-text` |

---

## U. Classical Cryptography (educational / CTF)

| Tool | Library | Tag |
|------|---------|-----|
| **Caesar / ROT13 / ROT47** | pure JS | `NEW` |
| **Vigenère / Atbash / Affine cipher** | pure JS | `NEW` |
| **Frequency analysis + substitution-cipher solver** (hill-climbing on n-gram score) | pure JS (~150 LOC) | `NEW` |
| **Playfair / Rail-fence / ADFGVX** | pure JS | `NEW` |
| **One-time-pad XOR encoder** | pure JS | `NEW` |
| **WordPress phpass password hash** | `phpass-js` | `NEW` |
| **Hashids / Sqids encode-decode** (reversible int → short URL-safe string) | `hashids` + `sqids` | `NEW` |
| **NanoID generator with collision-probability calculator** | `nanoid` + custom math | `EXTEND uuid-generator` |

---

## V. Social / Mockup Generators (delight / shareable)

| Tool | Library | Tag |
|------|---------|-----|
| **Code-to-image** (Carbon-style screenshot) | `html-to-image` + Shiki/Prism | `NEW` |
| **Fake tweet / fake DM / fake Instagram post generator** | static templates | `NEW` |
| **YouTube / Vimeo thumbnail grabber** (all resolutions) | URL transform | `NEW` |
| **iFrame tester** (preview URL inside `<iframe>` at custom viewports; surfaces X-Frame-Options diagnoses) | pure HTML | `NEW` |

---

## W. CLI / Terminal Helpers

| Tool | Library | Tag |
|------|---------|-----|
| **ANSI escape preview** (paste, render colored HTML) | `ansi_up` | `NEW` |
| **Bash / Zsh / Fish prompt (PS1) builder** | `ansi_up` + escape dictionary | `NEW` |
| **terminfo decoder** (binary parser) | hand-rolled (~200 LOC) | `NEW` |
| **tmux config preview / linter** | static option list | `NEW` |
| **Vim / Emacs / Nano cheatsheet generator** | static markdown | `NEW` |
| **Docker / kubectl / git / ffmpeg / jq cheatsheet generator** | static curated JSON | `NEW` |

---

## X. Fonts (zero in it-tools)

| Tool | Library | Tag |
|------|---------|-----|
| **Font inspector** (drop TTF/OTF/WOFF2 — show glyphs, OpenType features `liga`/`ss01-20`/`tnum`, variation axes, unicode coverage) | `opentype.js` | `NEW` |
| **Font subset generator** (pick chars → smaller WOFF2) | `subset-font` (browser fork) | `NEW` |
| **Web-font CSS @font-face generator** | pure JS | `NEW` |
| **Variable-font axis playground** | `opentype.js` | `NEW` |

---

## Y. AI / LLM Era — Round 2 (in addition to Round 1's tier 3)

| Tool | Library | Tag |
|------|---------|-----|
| **Anthropic / OpenAI / Gemini token counter** (multi-model side-by-side cost) | `js-tiktoken` + `@anthropic-ai/tokenizer` | `NEW` |
| **System prompt diff tool** (paste two versions, show semantic + token diff) | `diff` (existing) + tokenizers | `EXTEND text-diff` |
| **Function-call schema builder** (visual Zod / JSON Schema → Anthropic tool format) | `ajv` + `zod` | `NEW` |
| **MCP server config builder** (output JSON for Claude Desktop / Cursor / Windsurf) | pure JSON | `NEW` |
| **Embedding visualizer (UMAP/PCA 2D plot)** | `umap-js` | `NEW` |
| **Prompt template tester** (variables × table of inputs, side-by-side outputs) | `nunjucks` | `NEW` |
| **llms.txt / llms-full.txt generator** | pure markdown | `NEW` |

---

## Z. Web3 / Blockchain — Round 2

| Tool | Library | Tag |
|------|---------|-----|
| **Bitcoin address validator** (P2PKH / P2SH / Bech32) | `bitcoinjs-lib` (browser) | `NEW` |
| **Solana address / transaction decoder** | `@solana/web3.js` | `NEW` |
| **IPFS CID v0 ↔ v1 converter** | `multiformats` | `NEW` |
| **NFT metadata viewer** (paste tokenURI JSON, render image + traits) | tree component + `<img>` | `NEW` |
| **Smart contract source verification helper** (compute Solidity bytecode metadata hash) | `solc-js` (heavy, lazy-load) | `NEW` |

---

## Implementation Priority — Round 2's "Top 20 Quick Wins"

Sorted by user-reach × low effort × pure-browser feasibility.

| #  | Tool                                | Cluster | Effort | Library |
|----|--------------------------------------|---------|--------|---------|
| 1  | Magic-byte file-type detector        | T       | S      | `file-type` |
| 2  | File hash (drag-drop SHA-256/512)    | T       | S      | `crypto.subtle` + `hash-wasm` |
| 3  | EXIF viewer + stripper               | T       | S      | `ExifReader` + `piexifjs` |
| 4  | Resistor color-code                  | F       | S      | pure JS |
| 5  | DBML ↔ ERD viewer                    | J       | M      | `@dbml/core` + `mermaid` |
| 6  | Postgres EXPLAIN visualizer          | J       | S      | `pev2` (Vue 3) |
| 7  | DuckDB-WASM SQL playground           | J       | M      | `@duckdb/duckdb-wasm` |
| 8  | OpenAPI → curl/fetch/axios           | O       | S      | `openapi-snippet` |
| 9  | OpenAPI → Postman collection         | O       | S      | `openapi-to-postmanv2` |
| 10 | AWS ARN parser/builder               | K       | S      | `@aws-sdk/util-arn-parser` |
| 11 | iOS / Android icon-set generator     | I       | M      | Canvas + JSZip |
| 12 | ANSI escape preview                  | W       | S      | `ansi_up` |
| 13 | Color-blindness simulator (8 modes)  | B       | S      | `@bjornlu/colorblind` |
| 14 | APCA + WCAG dual contrast checker    | B       | S      | `apca-w3` + `wcag-contrast` |
| 15 | ICU MessageFormat playground         | C       | S      | `intl-messageformat` |
| 16 | Cron next-N-fires + DST              | D       | S      | `cron-parser` |
| 17 | Multi-calendar converter             | D       | S      | `Intl.DateTimeFormat` (native) |
| 18 | Hashids / Sqids encoder              | U       | S      | `hashids` + `sqids` |
| 19 | Font inspector (drop TTF/WOFF2)      | X       | M      | `opentype.js` |
| 20 | Code-to-image (Carbon-style)         | V       | M      | `html-to-image` + Shiki |

**Total Round 1 + Round 2 candidate count:** ~200 distinct tool ideas across ~25 categories. Implementing all Tier-1 from Round 1 (15 tools) + Top 20 from Round 2 = **35 high-value additions** that take it-tools from 86 → 121 tools and close the most painful gaps versus CyberChef / DevToys / transform.tools.

---

## Combined "If you can only ship 50" — End-State Vision

Pulling the highest-priority items from both rounds:

**Crypto/Security (10):** JWT signer, X.509 decoder, CSR generator, OAuth2 PKCE, HIBP checker, CVSS calc, Argon2/Scrypt, Ed25519/ECDSA, file-magic detector, drag-drop file hash.

**Data/Format (10):** JSON Schema validator+gen, JSON→TS/Zod/Go/Rust class, semantic JSON diff, JSON↔NDJSON, CSV↔Markdown, HTML↔Markdown, OpenAPI→Postman/curl, DBML↔ERD, DuckDB-WASM, jq playground.

**Network/Cloud (8):** DNS-over-HTTPS lookup, whois/GeoIP, AWS SigV4, ARN parser, IAM simulator, K8s linter, kubectl explain, Wireguard config gen.

**Web/Dev (8):** Mermaid renderer, favicon generator, QR decoder, REM↔PX, OG/Twitter debugger, llms.txt gen, prompt token counter, function-call schema builder.

**Image/Design (6):** EXIF stripper, image compressor, contrast (APCA+WCAG), color-blind sim, code-to-image (Carbon), Haikei-style SVG generators.

**Time/Math/Hardware (4):** date/duration calculator, multi-calendar converter, resistor color-code, BigInt prime/factor.

**Text/i18n (4):** Markdown table generator, ICU MessageFormat, BCP-47 builder, half↔full-width converter.

= 50 tools, all client-side, all with verified libraries.
