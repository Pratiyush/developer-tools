# Specification Index

> **Status:** catalog only. Numbers (NNN) and category folders are NOT assigned here — that happens during the selection step before each tool gets implemented.
> **Source files:** existing per-tool specs in this folder + `_recommended-new-tools.md` (Round 1) + `_recommended-new-tools-additional.md` (Round 2).

## Stats

- **Existing specs (per-tool `.md` files):** 85
- **Round 1 candidates:** ~80 (Tiers 1–5)
- **Round 2 candidates:** ~150 (Sections A–Z)
- **Combined candidate pool (with overlaps):** ~250
- **De-duplicated rough estimate:** ~220 distinct tools
- **v1.0 target:** 100+ (final selection deferred)

## How to read this

| Column | Meaning |
|---|---|
| **Slug** | Kebab-case tool identifier; matches existing spec filename when applicable |
| **Category** | Draft category (12 buckets) — reviewable before any folder gets created |
| **Source** | `existing` = has a per-tool spec file here · `R1` = from `_recommended-new-tools.md` · `R2` = from `_recommended-new-tools-additional.md` |
| **Tag** | `NEW` = new tool · `EXTEND <slug>` = enhances an existing tool · `REPLACE <slug>` = supersedes an existing tool |
| **Note** | Library hint or rationale (when relevant) |

## Draft categories (12)

```
01-encoding              # base64, url-encode, html-entities, binary, unicode, base58/62/32, etc.
02-crypto-hashing        # hash, hmac, bcrypt/argon2/scrypt, encryption, RSA/ECDSA/Ed25519, PGP, x509, CSR, SRI, PDF sig
03-auth-secrets          # JWT (parse/build), OTP/TOTP, passwords, basic auth, tokens, BIP39, ULID/UUID, OAuth/PKCE, WebAuthn, OIDC, SAML, htpasswd, HIBP
04-data-formats          # JSON/YAML/TOML/XML/CSV/CBOR/MessagePack/Protobuf/Parquet conversions, viewers, diff, schema, NDJSON
05-text-string           # diff, stats, NATO, ASCII art, slug, case, lorem, markdown, list, dedupe, set ops, classical ciphers
06-network-web           # IP/MAC/subnet/Wireguard, DNS-over-HTTPS, whois, GeoIP, URL, OG/Twitter, JSON-LD, REM/PX, OpenAPI, GraphQL
07-time-date             # date/time, chronometer, ETA, cron (gen+next), durations, multi-calendar, sunrise/sunset, age, working days
08-math-calc             # chmod, percent, math eval, roman/Mayan, temperature, GCD/LCM, statistics, BigInt prime, IEEE-754, semver
09-graphics-media        # color/contrast/colorblind, SVG/PNG/QR/favicon/EXIF/compression, mermaid, glassmorphism, fonts, palettes
10-validators-parsers    # email, IBAN, phone, MIME, HTTP status, BCP-47, ICU MessageFormat, magic-byte, OpenAPI breaking-diff
11-dev-utilities         # regex (test/visualize/codegen), SQL (prettify/ORM/dialect), docker, git, benchmark, keycode, LLM tokens, jq/JSONPath, gitignore, license picker, AI/MCP, ARN, IAM, k8s/helm
12-device-system         # device info, HTML editor, audio/voice, embedded/IoT, mobile/native, game dev, CLI/terminal helpers
```

> Categories are draft. Pratiyush can rename, merge, split, or reassign before any folder is created.

---

## Existing specs (85)

| Slug | Category | Source | Tag |
|---|---|---|---|
| ascii-text-drawer | 05-text-string | existing | NEW |
| base64-file-converter | 01-encoding | existing | NEW |
| base64-string-converter | 01-encoding | existing | NEW |
| basic-auth-generator | 03-auth-secrets | existing | NEW |
| bcrypt | 02-crypto-hashing | existing | NEW |
| benchmark-builder | 11-dev-utilities | existing | NEW |
| bip39-generator | 03-auth-secrets | existing | NEW |
| camera-recorder | 12-device-system | existing | NEW |
| case-converter | 05-text-string | existing | NEW |
| chmod-calculator | 08-math-calc | existing | NEW |
| chronometer | 07-time-date | existing | NEW |
| color-converter | 09-graphics-media | existing | NEW |
| crontab-generator | 07-time-date | existing | NEW |
| date-time-converter | 07-time-date | existing | NEW |
| device-information | 12-device-system | existing | NEW |
| docker-run-to-docker-compose-converter | 11-dev-utilities | existing | NEW |
| email-normalizer | 10-validators-parsers | existing | NEW |
| emoji-picker | 09-graphics-media | existing | NEW |
| encryption | 02-crypto-hashing | existing | NEW |
| eta-calculator | 07-time-date | existing | NEW |
| git-memo | 11-dev-utilities | existing | NEW |
| hash-text | 02-crypto-hashing | existing | NEW |
| hmac-generator | 02-crypto-hashing | existing | NEW |
| html-entities | 01-encoding | existing | NEW |
| html-wysiwyg-editor | 12-device-system | existing | NEW |
| http-status-codes | 10-validators-parsers | existing | NEW |
| iban-validator-and-parser | 10-validators-parsers | existing | NEW |
| integer-base-converter | 01-encoding | existing | NEW |
| ipv4-address-converter | 06-network-web | existing | NEW |
| ipv4-range-expander | 06-network-web | existing | NEW |
| ipv4-subnet-calculator | 06-network-web | existing | NEW |
| ipv6-ula-generator | 06-network-web | existing | NEW |
| json-diff | 04-data-formats | existing | NEW |
| json-minify | 04-data-formats | existing | NEW |
| json-to-csv | 04-data-formats | existing | NEW |
| json-to-toml | 04-data-formats | existing | NEW |
| json-to-xml | 04-data-formats | existing | NEW |
| json-to-yaml-converter | 04-data-formats | existing | NEW |
| json-viewer | 04-data-formats | existing | NEW |
| jwt-parser | 03-auth-secrets | existing | NEW |
| keycode-info | 11-dev-utilities | existing | NEW |
| list-converter | 05-text-string | existing | NEW |
| lorem-ipsum-generator | 05-text-string | existing | NEW |
| mac-address-generator | 06-network-web | existing | NEW |
| mac-address-lookup | 06-network-web | existing | NEW |
| markdown-to-html | 05-text-string | existing | NEW |
| math-evaluator | 08-math-calc | existing | NEW |
| meta-tag-generator | 06-network-web | existing | NEW |
| mime-types | 10-validators-parsers | existing | NEW |
| numeronym-generator | 05-text-string | existing | NEW |
| otp-code-generator-and-validator | 03-auth-secrets | existing | NEW |
| password-strength-analyser | 03-auth-secrets | existing | NEW |
| pdf-signature-checker | 02-crypto-hashing | existing | NEW |
| percentage-calculator | 08-math-calc | existing | NEW |
| phone-parser-and-formatter | 10-validators-parsers | existing | NEW |
| qr-code-generator | 09-graphics-media | existing | NEW |
| random-port-generator | 06-network-web | existing | NEW |
| regex-memo | 11-dev-utilities | existing | NEW |
| regex-tester | 11-dev-utilities | existing | NEW |
| roman-numeral-converter | 08-math-calc | existing | NEW |
| rsa-key-pair-generator | 02-crypto-hashing | existing | NEW |
| safelink-decoder | 01-encoding | existing | NEW |
| slugify-string | 05-text-string | existing | NEW |
| sql-prettify | 11-dev-utilities | existing | NEW |
| string-obfuscator | 01-encoding | existing | NEW |
| svg-placeholder-generator | 09-graphics-media | existing | NEW |
| temperature-converter | 08-math-calc | existing | NEW |
| text-diff | 05-text-string | existing | NEW |
| text-statistics | 05-text-string | existing | NEW |
| text-to-binary | 01-encoding | existing | NEW |
| text-to-nato-alphabet | 05-text-string | existing | NEW |
| text-to-unicode | 01-encoding | existing | NEW |
| token-generator | 03-auth-secrets | existing | NEW |
| toml-to-json | 04-data-formats | existing | NEW |
| toml-to-yaml | 04-data-formats | existing | NEW |
| ulid-generator | 03-auth-secrets | existing | NEW |
| url-encoder | 01-encoding | existing | NEW |
| url-parser | 06-network-web | existing | NEW |
| user-agent-parser | 06-network-web | existing | NEW |
| uuid-generator | 03-auth-secrets | existing | NEW |
| wifi-qr-code-generator | 09-graphics-media | existing | NEW |
| xml-formatter | 04-data-formats | existing | NEW |
| xml-to-json | 04-data-formats | existing | NEW |
| yaml-to-json-converter | 04-data-formats | existing | NEW |
| yaml-to-toml | 04-data-formats | existing | NEW |
| yaml-viewer | 04-data-formats | existing | NEW |

---

## Round 1 candidates — Tier 1 (Must-Have, 15)

| Slug | Category | Source | Tag | Note |
|---|---|---|---|---|
| jwt-builder-signer | 03-auth-secrets | R1 | EXTEND jwt-parser | `jose`; HS256/RS256/ES256/EdDSA |
| x509-certificate-decoder | 02-crypto-hashing | R1 | NEW | `@peculiar/x509` or `pkijs` |
| csr-generator | 02-crypto-hashing | R1 | NEW | `node-forge` |
| uuid-v6-v7 | 03-auth-secrets | R1 | EXTEND uuid-generator | `uuid` v9 |
| dns-lookup-doh | 06-network-web | R1 | NEW | DoH via fetch |
| whois-geoip-lookup | 06-network-web | R1 | NEW | public APIs |
| yaml-validator-precise | 04-data-formats | R1 | EXTEND yaml-viewer | `yaml` linePos |
| json-schema-validator-generator | 04-data-formats | R1 | NEW | `ajv` + `quicktype-core` |
| markdown-table-generator | 04-data-formats | R1 | NEW | pure JS / `markdown-table` |
| html-markdown-converter | 04-data-formats | R1 | NEW | `turndown` + `marked` |
| date-duration-calculator | 07-time-date | R1 | NEW | `date-fns` |
| mermaid-renderer-export | 09-graphics-media | R1 | NEW | `mermaid` + `html-to-image` |
| favicon-generator | 09-graphics-media | R1 | NEW | `pica` + `to-ico` |
| qr-code-decoder | 09-graphics-media | R1 | EXTEND qr-code-generator | `jsqr` / `@zxing/library` |
| dedupe-lines | 05-text-string | R1 | NEW or EXTEND list-converter | pure JS |

## Round 1 — Tier 2 (Strong, ~50)

| Slug | Category | Source | Tag | Note |
|---|---|---|---|---|
| totp-hotp-standalone | 03-auth-secrets | R1 | EXTEND otp-code-generator-and-validator | `otpauth` |
| argon2-scrypt | 02-crypto-hashing | R1 | NEW | `argon2-browser` (WASM), `scrypt-js` |
| pgp-keypair-encrypt-sign | 02-crypto-hashing | R1 | NEW | `openpgp.js` |
| ecdsa-ed25519 | 02-crypto-hashing | R1 | NEW | Web Crypto |
| oauth2-pkce-helper | 03-auth-secrets | R1 | NEW | pure JS |
| hibp-password-checker | 03-auth-secrets | R1 | NEW | `is-pwned` (k-anonymity) |
| cvss-calculator | 11-dev-utilities | R1 | NEW | pure JS |
| htpasswd-manager | 03-auth-secrets | R1 | NEW | `htpasswd-js` |
| log-pii-redactor | 05-text-string | R1 | NEW | pure JS regex |
| csp-header-builder | 06-network-web | R1 | NEW | pure JS |
| sri-hash-generator | 02-crypto-hashing | R1 | NEW | Web Crypto SHA-256/384/512 |
| docker-compose-to-docker-run | 11-dev-utilities | R1 | NEW | pure JS |
| docker-compose-to-k8s | 11-dev-utilities | R1 | NEW | `kompose-wasm` or custom |
| json-to-typescript-zod-go-rust-kotlin-csharp-python | 04-data-formats | R1 | NEW | `quicktype-core` |
| json-to-toon | 04-data-formats | R1 | NEW | small custom encoder |
| csv-to-json-tsv-markdown | 04-data-formats | R1 | EXTEND json-to-csv | `papaparse` |
| cbor-msgpack-bson-avro | 04-data-formats | R1 | NEW | `cbor-x`, `@msgpack/msgpack` |
| protobuf-encode-decode | 04-data-formats | R1 | NEW | `protobufjs` |
| base58-base62-base32-fernet | 01-encoding | R1 | EXTEND base64-string-converter | `base-x`, `fernet` |
| xslt-transformer | 04-data-formats | R1 | NEW | browser-native XSLTProcessor |
| pdf-to-text-markdown-png | 04-data-formats | R1 | NEW | `pdfjs-dist` |
| parquet-ndjson-jsonl-viewer | 04-data-formats | R1 | NEW | `hyparquet` or `duckdb-wasm` |
| jsonpath-jmespath-jsonata-playground | 11-dev-utilities | R1 | NEW | `jsonpath-plus`, `jmespath`, `jsonata` |
| jq-playground-wasm | 11-dev-utilities | R1 | NEW | `jq-wasm` |
| dbml-schema-visualizer | 11-dev-utilities | R1 | NEW | `@dbml/core` + `@dbml/parse` |
| html-to-plain-text | 05-text-string | R1 | NEW | DOMParser |
| folder-tree-ascii-generator | 05-text-string | R1 | NEW | pure JS |
| xpath-jsonpath-tester | 11-dev-utilities | R1 | NEW | `xpath` lib |
| unicode-invisible-homoglyph-detector | 05-text-string | R1 | NEW | `confusables` + `unicode-name` |
| ansi-to-html | 05-text-string | R1 | NEW | `ansi-to-html` |
| log-line-parser | 11-dev-utilities | R1 | NEW | `pino-pretty` rules |
| set-operations-on-lines | 05-text-string | R1 | NEW | pure JS |
| visual-subnet-calculator-tree | 06-network-web | R1 | EXTEND ipv4-subnet-calculator | netmask + tree UI |
| wireguard-config-generator | 06-network-web | R1 | NEW | `tweetnacl` (X25519) |
| csv-hosts-dhcp-parser | 06-network-web | R1 | NEW | pure JS |
| rem-px-converter | 06-network-web | R1 | NEW | pure JS |
| http-request-tool-curl-builder | 06-network-web | R1 | NEW | fetch + curl emit |
| opengraph-twitter-card-debugger | 06-network-web | R1 | NEW | DOMParser |
| jsonld-schema-org-tester | 06-network-web | R1 | NEW | `jsonld.js` |
| webauthn-passkey-playground | 03-auth-secrets | R1 | NEW | `@simplewebauthn/browser` |
| cose-cbor-decoder | 06-network-web | R1 | NEW | `cbor-x` |
| cors-preflight-tester | 06-network-web | R1 | NEW | pure JS |
| html-to-jsx-pug-svg-jsx-vue-rn | 04-data-formats | R1 | NEW | `htmltojsx`, `svgr/core` |
| css-to-tailwind-jsobject | 06-network-web | R1 | NEW | `css-to-tailwindcss`, `transform-css` |
| exif-viewer-stripper | 09-graphics-media | R1+R2 | NEW | `ExifReader` + `piexifjs` |
| wcag-apca-contrast | 09-graphics-media | R1+R2 | EXTEND color-converter | `apca-w3` + `wcag-contrast` |
| svg-optimizer | 09-graphics-media | R1 | NEW | `svgo` browser build |
| glassmorphism-neumorphism-builder | 09-graphics-media | R1+R2 | NEW | pure CSS |
| video-to-gif | 09-graphics-media | R1 | NEW | `@ffmpeg/ffmpeg` |
| image-compressor | 09-graphics-media | R1 | NEW | `browser-image-compression` |
| color-palette-generator | 09-graphics-media | R1+R2 | NEW | `chroma-js` |
| triangle-blob-wave-svg-generator | 09-graphics-media | R1+R2 | NEW | pure JS |
| mock-fake-data-generator | 11-dev-utilities | R1 | NEW | `@faker-js/faker` |
| semver-calculator | 08-math-calc | R1 | NEW | `semver` |
| gitignore-generator | 11-dev-utilities | R1 | NEW | gitignore.io templates |
| license-picker-spdx | 11-dev-utilities | R1 | NEW | `spdx-license-list` |
| github-actions-yaml-linter | 11-dev-utilities | R1+R2 | NEW | `actionlint-wasm` |
| dockerfile-linter | 11-dev-utilities | R1 | NEW | `hadolint` rules |
| dotenv-validator-converter | 11-dev-utilities | R1 | NEW | `dotenv` + custom |
| conventional-commit-pr-checker | 11-dev-utilities | R1+R2 | NEW | `@commitlint/parse` + `semver` |
| cron-parser-next-runs | 07-time-date | R1+R2 | EXTEND crontab-generator | `cronstrue` + `cron-parser` |
| aws-sigv4-signer | 11-dev-utilities | R1+R2 | NEW | `aws4fetch` |
| resistor-color-code | 12-device-system | R1+R2 | NEW | pure JS |
| data-storage-transfer-unit-converter | 08-math-calc | R1 | NEW | pure JS |
| raid-calculator | 08-math-calc | R1 | NEW | pure JS |

## Round 1 — Tier 3 (AI/LLM Era, 8)

| Slug | Category | Source | Tag | Note |
|---|---|---|---|---|
| prompt-token-counter-cost | 11-dev-utilities | R1+R2 | NEW | `js-tiktoken` + `@anthropic-ai/tokenizer` |
| json-schema-to-zod | 04-data-formats | R1 | NEW | `json-schema-to-zod` |
| json-schema-to-typescript | 04-data-formats | R1 | NEW | `json-schema-to-typescript` |
| llms-txt-generator | 06-network-web | R1+R2 | NEW | pure markdown |
| function-call-schema-builder | 11-dev-utilities | R1+R2 | NEW | Monaco + Ajv |
| prompt-template-tester | 11-dev-utilities | R1+R2 | NEW | `nunjucks`/`mustache.js` |
| embedding-visualizer-2d | 08-math-calc | R1+R2 | NEW | `umap-js` / `druid` |
| mcp-server-config-builder | 11-dev-utilities | R1+R2 | NEW | pure JSON |

## Round 1 — Tier 4 (Web3, 7)

| Slug | Category | Source | Tag | Note |
|---|---|---|---|---|
| eip55-checksum-ens-resolver | 06-network-web | R1 | NEW | `viem` |
| abi-encoder-decoder | 06-network-web | R1 | NEW | `viem` ABI utils |
| eip712-typed-data-signer | 06-network-web | R1 | NEW | `viem.verifyTypedData` |
| wei-gwei-ether-converter | 08-math-calc | R1 | EXTEND | `viem.formatUnits` |
| bip32-bip44-derivation | 03-auth-secrets | R1 | EXTEND bip39-generator | `bip39` + `@scure/bip32` |
| ethereum-keystore-v3-decoder | 03-auth-secrets | R1 | NEW | `ethereumjs-wallet` |
| paserk-key-generator | 03-auth-secrets | R1 | NEW | `paseto-ts` |

## Round 1 — Tier 5 (Niche/Delight, ~10)

| Slug | Category | Source | Tag | Note |
|---|---|---|---|---|
| regex-railroad-visualizer | 11-dev-utilities | R1+R2 | EXTEND regex-tester | regexper-render |
| hex-color-name-guesser | 09-graphics-media | R1 | NEW | `color-name-list` |
| cli-cheatsheet-generator | 12-device-system | R1+R2 | NEW | static curated JSON |
| http-status-eli5-meme | 10-validators-parsers | R1 | EXTEND http-status-codes | static JSON+images |
| mitre-attack-lookup | 11-dev-utilities | R1 | NEW | static MITRE JSON |
| caret-m-quoted-printable-punycode-netbios-braille-modhex | 01-encoding | R1+R2 | NEW | each EXTEND text-to-X |
| alternating-vaporwave-zalgo-case | 05-text-string | R1 | EXTEND case-converter | pure JS |
| ocr-image-to-text | 09-graphics-media | R1 | NEW | `tesseract.js` |
| webrtc-stats-stun-tester | 06-network-web | R1 | NEW | RTCPeerConnection |

---

## Round 2 candidates — Section A: CSS / Design (13)

| Slug | Category | Source | Tag | Note |
|---|---|---|---|---|
| clip-path-polygon-editor | 09-graphics-media | R2 | NEW | pure SVG/JS |
| glassmorphism-builder | 09-graphics-media | R2 | NEW | pure CSS |
| neumorphism-builder | 09-graphics-media | R2 | NEW | pure CSS |
| svg-wave-blob-pattern-generator | 09-graphics-media | R2 | NEW | pure SVG |
| mesh-gradient-builder | 09-graphics-media | R2 | NEW | `colorjs.io` |
| css-loader-spinner-generator | 09-graphics-media | R2 | NEW | pure CSS |
| css-shadow-editor | 09-graphics-media | R2 | NEW | pure CSS |
| cubic-bezier-easing-editor | 09-graphics-media | R2 | NEW | `bezier-easing` |
| gradient-shades-palette-extender | 09-graphics-media | R2 | EXTEND color-converter | `chroma-js` |
| curated-palette-browser | 09-graphics-media | R2 | NEW | static JSON |
| image-to-palette-extractor | 09-graphics-media | R2 | NEW | `node-vibrant` |
| text-shadow-box-shadow-editor | 09-graphics-media | R2 | NEW | pure CSS |
| css-pattern-generator | 09-graphics-media | R2 | NEW | pure CSS |

## Round 2 — Section B: Accessibility (8)

| Slug | Category | Source | Tag | Note |
|---|---|---|---|---|
| color-blindness-simulator-8mode | 09-graphics-media | R2 | NEW | `@bjornlu/colorblind` |
| reading-grade-level-analyzer | 05-text-string | R2 | EXTEND text-statistics | `text-readability` |
| aria-role-explorer | 06-network-web | R2 | NEW | static JSON |
| reduced-motion-preview | 09-graphics-media | R2 | NEW | pure CSS |
| focus-order-visualizer | 06-network-web | R2 | NEW | pure JS |
| screen-reader-text-preview | 12-device-system | R2 | NEW | SpeechSynthesis |
| heading-hierarchy-linter | 06-network-web | R2 | NEW | DOMParser |

## Round 2 — Section C: i18n / l10n (10)

| Slug | Category | Source | Tag | Note |
|---|---|---|---|---|
| bcp-47-builder-validator | 10-validators-parsers | R2 | NEW | `bcp-47` + `bcp-47-match` |
| icu-messageformat-playground | 10-validators-parsers | R2 | NEW | `intl-messageformat` |
| cldr-plural-rule-explorer | 10-validators-parsers | R2 | NEW | `Intl.PluralRules` |
| unicode-normalization-inspector | 01-encoding | R2 | EXTEND text-to-unicode | native normalize |
| bidi-rtl-text-preview | 05-text-string | R2 | NEW | `bidi-js` |
| encoding-sniffer | 01-encoding | R2 | NEW | `jschardet` + TextDecoder |
| iso-4217-currency-lookup | 10-validators-parsers | R2 | NEW | `currency-codes` |
| iso-3166-country-region-lookup | 10-validators-parsers | R2 | NEW | `iso-3166-1` + `country-to-currency` |
| half-full-width-converter | 05-text-string | R2 | NEW | pure JS |
| punycode-idn-encoder | 01-encoding | R2 | NEW | native `punycode` |

## Round 2 — Section D: Time / Date / Calendar (9)

| Slug | Category | Source | Tag | Note |
|---|---|---|---|---|
| iso-8601-duration-parser | 07-time-date | R2 | NEW | `tinyduration` |
| timezone-abbreviation-collision | 07-time-date | R2 | NEW | static JSON |
| multi-resolution-unix-epoch | 07-time-date | R2 | EXTEND date-time-converter | pure JS |
| multi-calendar-converter | 07-time-date | R2 | NEW | Intl + hebcal/hijri/jalaali |
| working-days-calculator-holidays | 07-time-date | R2 | NEW | `date-holidays` |
| sunrise-sunset-twilight | 07-time-date | R2 | NEW | `suncalc` |
| stardate-converter | 07-time-date | R2 | NEW | pure math |
| age-calculator | 07-time-date | R2 | EXTEND date-time-converter | `date-fns` |

## Round 2 — Section E: Math / Numbers (10)

| Slug | Category | Source | Tag | Note |
|---|---|---|---|---|
| bigint-prime-factorizer | 08-math-calc | R2 | NEW | `extra-bigint` |
| gcd-lcm-calculator | 08-math-calc | R2 | NEW | pure Euclid |
| fraction-simplifier | 08-math-calc | R2 | NEW | `fraction.js` |
| sigfig-rounder-scientific | 08-math-calc | R2 | NEW | pure JS |
| ieee-754-float-bit-analyzer | 08-math-calc | R2 | NEW | pure JS |
| numbers-to-words | 08-math-calc | R2 | NEW | `number-to-words` |
| roman-mayan-egyptian-babylonian | 08-math-calc | R2 | EXTEND roman-numeral-converter | static map |
| statistics-calculator | 08-math-calc | R2 | NEW | `simple-statistics` |
| linear-logistic-regression | 08-math-calc | R2 | NEW | `simple-statistics` |
| easing-function-visualizer | 09-graphics-media | R2 | NEW | `d3-ease` |

## Round 2 — Section F: Embedded / IoT / Hardware (10)

| Slug | Category | Source | Tag | Note |
|---|---|---|---|---|
| capacitor-eia-decoder | 12-device-system | R2 | NEW | pure lookup |
| ohms-law-calculator | 12-device-system | R2 | NEW | pure math |
| gps-nmea-parser | 12-device-system | R2 | NEW | `nmea-simple` |
| modbus-register-decoder | 12-device-system | R2 | NEW | hand-rolled |
| esp32-arduino-rpi-pinout | 12-device-system | R2 | NEW | static JSON |
| ip67-ip68-lookup | 12-device-system | R2 | NEW | static table |
| i2c-spi-uart-address-explorer | 12-device-system | R2 | NEW | static JSON |
| awg-mm2-wire-gauge | 12-device-system | R2 | NEW | static table |
| battery-capacity-runtime | 12-device-system | R2 | NEW | pure math |

## Round 2 — Section G: Audio / Voice / Speech (8)

| Slug | Category | Source | Tag | Note |
|---|---|---|---|---|
| text-to-speech-preview | 12-device-system | R2 | NEW | SpeechSynthesis |
| speech-to-text-preview | 12-device-system | R2 | NEW | SpeechRecognition |
| audio-waveform-viewer | 12-device-system | R2 | NEW | `wavesurfer.js` |
| bpm-tap-tempo-detect | 12-device-system | R2 | NEW | `realtime-bpm-analyzer` |
| note-frequency-cents-converter | 12-device-system | R2 | NEW | `tone` |
| webaudio-synth-playground | 12-device-system | R2 | NEW | `tone` |
| ipa-phonetic-transcription | 12-device-system | R2 | NEW | `cmu-pronouncing-dictionary` |
| decibel-amplitude-power-converter | 12-device-system | R2 | NEW | pure math |

## Round 2 — Section H: Game Dev / Graphics (5)

| Slug | Category | Source | Tag | Note |
|---|---|---|---|---|
| texture-atlas-sprite-slicer | 09-graphics-media | R2 | NEW | Canvas2D + Phaser/PixiJS JSON |
| hex-asm-disassembler | 11-dev-utilities | R2 | NEW | `capstone.js` (lazy WASM) |
| color-space-converter-full | 09-graphics-media | R2 | REPLACE color-converter | `colorjs.io` |
| gamut-mapping-previewer | 09-graphics-media | R2 | NEW | `colorjs.io` |
| game-tick-fps-calculator | 08-math-calc | R2 | NEW | pure math |

## Round 2 — Section I: Mobile / Native (7)

| Slug | Category | Source | Tag | Note |
|---|---|---|---|---|
| ios-app-icon-set-generator | 09-graphics-media | R2 | NEW | Canvas + JSZip |
| android-adaptive-icon-generator | 09-graphics-media | R2 | NEW | Canvas + JSZip |
| app-store-char-counter | 10-validators-parsers | R2 | NEW | pure JS |
| apns-fcm-push-payload-builder | 11-dev-utilities | R2 | NEW | `ajv` + JSON Schema |
| deep-link-universal-link-builder | 06-network-web | R2 | EXTEND qr-code-generator | pure JS + qrcode |
| privacy-nutrition-label-preview | 06-network-web | R2 | NEW | static markup |
| android-manifest-permission-explainer | 11-dev-utilities | R2 | NEW | static JSON |

## Round 2 — Section J: Database / SQL (10)

| Slug | Category | Source | Tag | Note |
|---|---|---|---|---|
| dbml-sql-erd-viewer | 11-dev-utilities | R2 | NEW | `@dbml/core` + mermaid |
| duckdb-wasm-sql-playground | 11-dev-utilities | R2 | NEW | `@duckdb/duckdb-wasm` |
| postgres-explain-visualizer | 11-dev-utilities | R2 | NEW | `pev2` |
| sql-to-orm | 11-dev-utilities | R2 | EXTEND sql-prettify | `node-sql-parser` + templates |
| sql-dialect-differ | 11-dev-utilities | R2 | NEW | `node-sql-parser` AST diff |
| mongo-aggregation-runner | 11-dev-utilities | R2 | NEW | `mingo` |
| redis-command-builder | 11-dev-utilities | R2 | NEW | pure JS |
| migration-diff | 11-dev-utilities | R2 | NEW | `@dbml/core` + templates |
| query-parameter-binder | 11-dev-utilities | R2 | NEW | pure JS |
| ndjson-parquet-preview | 04-data-formats | R2 | NEW | `hyparquet` |

## Round 2 — Section K: Cloud — AWS/GCP/Azure (8)

| Slug | Category | Source | Tag | Note |
|---|---|---|---|---|
| aws-arn-parser-builder | 11-dev-utilities | R2 | NEW | `@aws-sdk/util-arn-parser` |
| aws-sigv4-signing-playground | 11-dev-utilities | R2 | NEW | `@aws-sdk/signature-v4` |
| iam-policy-simulator | 11-dev-utilities | R2 | NEW | `@cloud-copilot/iam-simulate` |
| iam-policy-linter | 11-dev-utilities | R2 | NEW | `@thinkinglabs/aws-iam-policy` |
| s3-presigned-url-decoder | 06-network-web | R2 | EXTEND url-parser | native URL |
| cognito-apple-google-jwt-explainer | 03-auth-secrets | R2 | EXTEND jwt-parser | `jose` |
| gcp-service-account-key-parser | 03-auth-secrets | R2 | NEW | `jose` |
| aws-region-az-latency-picker | 06-network-web | R2 | NEW | `@turf/distance` |

## Round 2 — Section L: IaC (5)

| Slug | Category | Source | Tag | Note |
|---|---|---|---|---|
| hcl-json-converter | 04-data-formats | R2 | NEW | `@cdktf/hcl2json` |
| hcl-prettifier | 04-data-formats | R2 | NEW | `@cdktf/hcl2json` |
| cloudformation-yaml-json-converter | 04-data-formats | R2 | NEW | `yaml-cfn` |
| terraform-plan-visualizer | 11-dev-utilities | R2 | NEW | tree component |
| arm-bicep-template-viewer | 11-dev-utilities | R2 | EXTEND json-viewer | tree |

## Round 2 — Section M: CI/CD (4)

| Slug | Category | Source | Tag | Note |
|---|---|---|---|---|
| ci-yaml-multi-dialect-linter | 11-dev-utilities | R2 | NEW | `ajv` + SchemaStore |
| renovate-dependabot-config-validator | 11-dev-utilities | R2 | NEW | `ajv` + SchemaStore |
| bazel-build-cheat-helper | 11-dev-utilities | R2 | NEW | static reference |

## Round 2 — Section N: Kubernetes / Helm / Docker (8)

| Slug | Category | Source | Tag | Note |
|---|---|---|---|---|
| k8s-yaml-linter-kubeconform | 11-dev-utilities | R2 | NEW | `@monokle/validation` |
| kubectl-explain-mirror | 11-dev-utilities | R2 | NEW | `@monokle/validation` |
| helm-values-deep-merge-diff | 11-dev-utilities | R2 | NEW | `js-yaml` + `lodash.merge` |
| configmap-secret-base64-helper | 11-dev-utilities | R2 | EXTEND base64-string-converter | `js-yaml` + btoa |
| pod-resource-calculator | 11-dev-utilities | R2 | NEW | `kubernetes-resource-parser` |
| hpa-target-utilization-simulator | 11-dev-utilities | R2 | NEW | pure math + chart.js |
| crd-schema-viewer | 11-dev-utilities | R2 | NEW | `@stoplight/json-schema-viewer` |
| dockerfile-layer-size-analyzer | 11-dev-utilities | R2 | EXTEND docker-run-to-docker-compose-converter | `dockerfile-ast` |

## Round 2 — Section O: API / OpenAPI / GraphQL / AsyncAPI (10)

| Slug | Category | Source | Tag | Note |
|---|---|---|---|---|
| openapi-to-postman | 11-dev-utilities | R2 | NEW | `openapi-to-postmanv2` |
| openapi-to-curl-fetch-axios | 11-dev-utilities | R2 | NEW | `openapi-snippet` |
| openapi-breaking-diff | 11-dev-utilities | R2 | NEW | `openapi-diff` |
| openapi-yaml-json-converter | 04-data-formats | R2 | EXTEND yaml-to-json-converter | `js-yaml` |
| swagger2-to-openapi3 | 11-dev-utilities | R2 | NEW | `swagger2openapi` |
| graphql-to-typescript | 11-dev-utilities | R2 | NEW | `@graphql-codegen/typescript` |
| graphql-schema-linter | 11-dev-utilities | R2 | NEW | `@stoplight/spectral-core` |
| asyncapi-viewer | 11-dev-utilities | R2 | NEW | `@asyncapi/parser` |
| grpc-reflection-json-viewer | 04-data-formats | R2 | EXTEND json-viewer | tree |
| postman-insomnia-hoppscotch-converter | 11-dev-utilities | R2 | NEW | `postman-collection` |

## Round 2 — Section P: Auth / Identity (6)

| Slug | Category | Source | Tag | Note |
|---|---|---|---|---|
| oidc-discovery-doc-explorer | 03-auth-secrets | R2 | NEW | fetch + dictionary |
| saml-xml-decoder | 03-auth-secrets | R2 | NEW | `pako` + `fast-xml-parser` |
| scim-payload-validator | 03-auth-secrets | R2 | NEW | `scim-patch` |
| ldap-dn-parser | 03-auth-secrets | R2 | NEW | `rfc2253` |

## Round 2 — Section Q: Logging / Observability (10)

| Slug | Category | Source | Tag | Note |
|---|---|---|---|---|
| common-log-format-parser | 11-dev-utilities | R2 | NEW | `clf-parser` |
| syslog-parser | 11-dev-utilities | R2 | NEW | `nsyslog-parser` |
| logstash-grok-tester | 11-dev-utilities | R2 | NEW | `grok-js` |
| journald-json-parser | 11-dev-utilities | R2 | EXTEND json-viewer | tree |
| promql-helper | 11-dev-utilities | R2 | NEW | `@prometheus-io/lezer-promql` |
| logql-playground | 11-dev-utilities | R2 | NEW | `@grafana/lezer-logql` |
| jaeger-trace-gantt-viewer | 11-dev-utilities | R2 | NEW | `gantt-task-react` |
| opentelemetry-semconv-lookup | 11-dev-utilities | R2 | NEW | `@opentelemetry/semantic-conventions` |
| slo-error-budget-calculator | 11-dev-utilities | R2 | NEW | pure formula |
| logs-insights-spl-formatter | 11-dev-utilities | R2 | NEW | `sql-formatter` |

## Round 2 — Section R: JSON Specialists (6)

| Slug | Category | Source | Tag | Note |
|---|---|---|---|---|
| semantic-json-diff | 04-data-formats | R2 | EXTEND json-diff | `deep-diff` |
| json-sort | 04-data-formats | R2 | NEW | pure JS |
| json-ndjson-jsonl-converter | 04-data-formats | R2 | NEW | pure JS |
| json-to-swift-codable-kotlin-rust-go-python | 04-data-formats | R2 | NEW | `quicktype-core` |
| json-tree-viewer-jsonpath | 04-data-formats | R2 | EXTEND json-viewer | `jsonpath-plus` |

## Round 2 — Section S: Regex Specialists (5)

| Slug | Category | Source | Tag | Note |
|---|---|---|---|---|
| regex-codegen-py-go-java-cs-rust-php | 11-dev-utilities | R2 | EXTEND regex-tester | template engine |
| regex-unit-test-panel | 11-dev-utilities | R2 | EXTEND regex-tester | localStorage |
| regex-pattern-library | 11-dev-utilities | R2 | EXTEND regex-tester | localStorage + URL share |
| regex-backtracking-debugger | 11-dev-utilities | R2 | EXTEND regex-tester | NFA visualizer |

## Round 2 — Section T: File Forensics / Privacy (9)

| Slug | Category | Source | Tag | Note |
|---|---|---|---|---|
| magic-byte-file-type-detector | 10-validators-parsers | R2 | NEW | `file-type` / `magic-bytes.js` |
| file-hash-drag-drop | 02-crypto-hashing | R2 | EXTEND hash-text | crypto.subtle + `hash-wasm` |
| strings-extractor | 05-text-string | R2 | NEW | pure JS |
| jpeg-metadata-stripper | 09-graphics-media | R2 | NEW | `piexifjs` |
| pdf-metadata-viewer-stripper | 04-data-formats | R2 | NEW | `pdf-lib` |
| lsb-image-steganography | 09-graphics-media | R2 | NEW | `steganography` / `lsb` |
| file-splitter-joiner | 04-data-formats | R2 | NEW | Blob slicing |
| crc-adler32-xxhash-checksum | 02-crypto-hashing | R2 | EXTEND hash-text | `crc-32` + `hash-wasm` |

## Round 2 — Section U: Classical Cryptography (8)

| Slug | Category | Source | Tag | Note |
|---|---|---|---|---|
| caesar-rot13-rot47 | 02-crypto-hashing | R2 | NEW | pure JS |
| vigenere-atbash-affine | 02-crypto-hashing | R2 | NEW | pure JS |
| frequency-analysis-substitution-solver | 02-crypto-hashing | R2 | NEW | pure JS |
| playfair-railfence-adfgvx | 02-crypto-hashing | R2 | NEW | pure JS |
| one-time-pad-xor | 02-crypto-hashing | R2 | NEW | pure JS |
| wordpress-phpass-hash | 02-crypto-hashing | R2 | NEW | `phpass-js` |
| hashids-sqids | 01-encoding | R2 | NEW | `hashids` + `sqids` |
| nanoid-collision-calc | 03-auth-secrets | R2 | EXTEND uuid-generator | `nanoid` |

## Round 2 — Section V: Social / Mockup (4)

| Slug | Category | Source | Tag | Note |
|---|---|---|---|---|
| code-to-image-carbon | 09-graphics-media | R2 | NEW | `html-to-image` + Shiki |
| fake-tweet-dm-instagram-generator | 09-graphics-media | R2 | NEW | static templates |
| youtube-vimeo-thumbnail-grabber | 09-graphics-media | R2 | NEW | URL transform |
| iframe-tester | 06-network-web | R2 | NEW | pure HTML |

## Round 2 — Section W: CLI / Terminal (6)

| Slug | Category | Source | Tag | Note |
|---|---|---|---|---|
| ansi-escape-preview | 05-text-string | R2 | NEW | `ansi_up` |
| ps1-prompt-builder | 12-device-system | R2 | NEW | `ansi_up` + dictionary |
| terminfo-decoder | 12-device-system | R2 | NEW | hand-rolled |
| tmux-config-preview-linter | 12-device-system | R2 | NEW | static option list |
| vim-emacs-nano-cheatsheet | 12-device-system | R2 | NEW | static markdown |
| docker-kubectl-git-ffmpeg-jq-cheatsheet | 12-device-system | R2 | NEW | curated JSON |

## Round 2 — Section X: Fonts (4)

| Slug | Category | Source | Tag | Note |
|---|---|---|---|---|
| font-inspector | 09-graphics-media | R2 | NEW | `opentype.js` |
| font-subset-generator | 09-graphics-media | R2 | NEW | `subset-font` |
| webfont-fontface-generator | 09-graphics-media | R2 | NEW | pure JS |
| variable-font-axis-playground | 09-graphics-media | R2 | NEW | `opentype.js` |

## Round 2 — Section Y: AI / LLM (Round 2 additions, 7)

| Slug | Category | Source | Tag | Note |
|---|---|---|---|---|
| anthropic-openai-gemini-token-counter | 11-dev-utilities | R2 | NEW | `js-tiktoken` + `@anthropic-ai/tokenizer` |
| system-prompt-diff | 05-text-string | R2 | EXTEND text-diff | `diff` + tokenizers |
| zod-jsonschema-tool-format-builder | 11-dev-utilities | R2 | NEW | `ajv` + `zod` |
| mcp-server-config-builder-r2 | 11-dev-utilities | R2 | NEW | pure JSON |
| embedding-visualizer-umap-pca | 08-math-calc | R2 | NEW | `umap-js` |
| prompt-template-tester-r2 | 11-dev-utilities | R2 | NEW | `nunjucks` |
| llms-txt-generator-r2 | 06-network-web | R2 | NEW | pure markdown |

## Round 2 — Section Z: Web3 (Round 2 additions, 5)

| Slug | Category | Source | Tag | Note |
|---|---|---|---|---|
| bitcoin-address-validator | 03-auth-secrets | R2 | NEW | `bitcoinjs-lib` |
| solana-address-tx-decoder | 03-auth-secrets | R2 | NEW | `@solana/web3.js` |
| ipfs-cid-converter | 01-encoding | R2 | NEW | `multiformats` |
| nft-metadata-viewer | 04-data-formats | R2 | NEW | tree + img |
| solidity-bytecode-metadata-hash | 02-crypto-hashing | R2 | NEW | `solc-js` (lazy) |

---

## Notes

- **Overlaps:** Some tools appear in both Round 1 and Round 2 (marked `R1+R2` in Source). Pick the more detailed source when implementing.
- **Numbering not assigned:** This index lists the candidate pool. NNN tool numbers are assigned only as tools are selected for build.
- **Folder structure not created:** No category folders exist under `src/tools/` yet. They will be created during the layout/scaffold step.
- **Per-tool spec files for R1/R2 candidates:** Not written. The per-tool spec is created during the "in-depth analysis" step of each tool's lifecycle (see `feedback_tool_lifecycle` in auto-memory).
- **`tools/` folder:** Out of scope until Pratiyush lifts the freeze.
- **Reference policy:** `.analysis/it-tools/` is for inspiration only — no cloning. Each tool is rewritten Pratiyush's way.
