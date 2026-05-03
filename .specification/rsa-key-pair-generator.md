# RSA Key Pair Generator

## Overview
- **Path:** `/rsa-key-pair-generator`
- **Category:** Crypto
- **Description:** Generate an RSA public/private key pair in PEM format, with a configurable key size.
- **Keywords:** rsa, key, pair, generator, public, private, secret, ssh, pem
- **Redirect from:** None
- **Icon:** `Certificate` (from `@vicons/tabler`)

## Purpose
Generates a fresh RSA key pair in the browser using `node-forge`'s RSA implementation, offloaded to a Web Worker (`prime.worker`) so the UI stays responsive even at large key sizes. Both keys are returned as PEM-encoded strings, copy-paste-ready for SSH config, JWT signing, TLS testing, or any tooling that consumes PKCS#1/PKCS#8 PEM. The user can refresh to roll a new pair.

## Inputs

| Name | Type | Default | Validation |
|------|------|---------|------------|
| `bits` | number | `2048` | Must satisfy `bits >= 256 && bits <= 16384 && bits % 8 === 0`. The `n-input-number` clamps with `min="256"`, `max="16384"`, `step="8"`. Error message: `"Bits should be 256 <= bits <= 16384 and be a multiple of 8"`. |

(There are no other inputs — public exponent and PEM format are fixed by node-forge defaults: `e = 65537`, PKCS#1 PEM headers `BEGIN RSA PRIVATE KEY` / `BEGIN PUBLIC KEY`.)

## Outputs

| Name | Type | Description |
|------|------|-------------|
| `certs.publicKeyPem` | string | PEM-encoded RSA public key (`-----BEGIN PUBLIC KEY-----` … `-----END PUBLIC KEY-----`). |
| `certs.privateKeyPem` | string | PEM-encoded RSA private key (`-----BEGIN RSA PRIVATE KEY-----` … `-----END RSA PRIVATE KEY-----`). |

While generation is running, the previous values are kept (or the empty defaults `{ publicKeyPem: '', privateKeyPem: '' }` for the first call). On error, the empty pair is shown.

## UI / Components
- Top row, max-width 600px, horizontal flex with `gap-3`:
  - `n-form-item` "Bits :" (label-placement left, label-width 100), containing `n-input-number` (min 256, max 16384, step 8) bound to `bits`.
  - `c-button` "Refresh key-pair" — invokes `refreshCerts`.
- Below, two stacked sections:
  - `<h3>Public key</h3>` + `<TextareaCopyable :value="certs.publicKeyPem" />`
  - `<h3>Private key</h3>` + `<TextareaCopyable :value="certs.privateKeyPem" />`

`TextareaCopyable` shows the value in a code/textarea-style block with a built-in copy button.

## Logic / Algorithm

### `generateKeyPair({ bits })` (`rsa-key-pair-generator.service.ts`)
```ts
import { pki } from 'node-forge';
import workerScript from 'node-forge/dist/prime.worker.min?url';

function generateRawPairs({ bits = 2048 }) {
  return new Promise<pki.rsa.KeyPair>((resolve, reject) =>
    pki.rsa.generateKeyPair({ bits, workerScript }, (err, keyPair) => {
      if (err) reject(err);
      else resolve(keyPair);
    }),
  );
}

async function generateKeyPair(config = {}) {
  const { privateKey, publicKey } = await generateRawPairs(config);
  return {
    publicKeyPem: pki.publicKeyToPem(publicKey),
    privateKeyPem: pki.privateKeyToPem(privateKey),
  };
}
```

Key steps:
1. Vite resolves `node-forge/dist/prime.worker.min?url` to a URL string at build time. That URL is passed to forge's `generateKeyPair`, which spawns the worker via `new Worker(url)` to do the prime-search off the main thread.
2. `pki.rsa.generateKeyPair` is callback-style; the wrapper turns it into a promise.
3. `pki.publicKeyToPem` and `pki.privateKeyToPem` serialize to PEM strings using node-forge's defaults (PKCS#1 for the private key, SubjectPublicKeyInfo for the public key).

### Component glue
- `computedRefreshableAsync(generator, fallback)` returns `[ref, refreshFn]`:
  - `ref` resolves to `{ publicKeyPem, privateKeyPem }`.
  - `refreshFn` re-invokes the async generator to produce a new pair.
- `withDefaultOnErrorAsync(fn, default)` swallows generation errors and yields the fallback (empty PEMs).
- A first generation runs on mount because `computedRefreshableAsync` immediately invokes the generator — so visiting the page triggers the worker.

### Validation
- `useValidation` watches `bits` and exposes `validationStatus` to the form. Note: the validation only **gates UI feedback** — it does not stop the watcher. If `bits` is set to `300` (not a multiple of 8) the validation errors, but the underlying refresh would still pass that value through to `pki.rsa.generateKeyPair` (which itself may throw or behave oddly). In practice the input's `step="8"` and clamps make invalid values rare.

### Defaults
- Bits default: `2048` (still considered acceptable for general-purpose RSA in 2024–2026).
- The form caps at `16384`, which is impractical: generating a 16384-bit RSA key in the browser can take **many minutes**.

## Dependencies
- `node-forge` (`pki`, `pki.rsa.generateKeyPair`, `pki.publicKeyToPem`, `pki.privateKeyToPem`).
- `node-forge/dist/prime.worker.min?url` — Vite-resolved worker URL for off-main-thread prime generation.
- `@vicons/tabler` (`Certificate` icon).
- Internal: `useValidation`, `withDefaultOnErrorAsync`, `computedRefreshableAsync`, `TextareaCopyable`, `c-button`, `n-form-item`, `n-input-number`.

## Edge Cases & Validation
- **Bits too small** (`< 256`) or **too large** (`> 16384`) or **not a multiple of 8**: input form shows error; the user can still trigger generation, but the `withDefaultOnErrorAsync` wrapper shows the empty-PEM fallback if forge rejects.
- **Generation in progress**: clicking "Refresh" again before completion will queue another generation via `computedRefreshableAsync`. There is no explicit "loading" indicator in the markup, so the previous keys remain visible until the new ones arrive.
- **Worker fails to load** (CSP / sandbox / 404): the promise rejects; `withDefaultOnErrorAsync` returns the empty pair, and the textareas show empty strings.
- **Repeated refresh**: each call yields a brand-new pair. There is no persistence — leaving and returning to the page generates a fresh pair (you cannot recover the previous private key). Users must copy before navigating away.
- **Browser without `Worker` support**: forge falls back to synchronous prime generation on the main thread, blocking the UI.

## Examples

For `bits = 2048` (default), a typical output looks like:

```
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
...
-----END PUBLIC KEY-----
```

```
-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEA...
...
-----END RSA PRIVATE KEY-----
```

For `bits = 4096`: longer base64 bodies (~3175 chars private), generation visibly slower but still under a few seconds in modern browsers thanks to the worker.

## File Structure
- `index.ts` — Tool registration (i18n name/description, keywords, `Certificate` icon, lazy-loaded component).
- `rsa-key-pair-generator.vue` — UI: bits input + refresh button + two `TextareaCopyable`s.
- `rsa-key-pair-generator.service.ts` — `generateKeyPair`, wrapping `node-forge`'s callback API as a promise and exporting PEM strings.

## Notes
- **No test file** for this tool (unlike most other crypto tools, which have unit tests).
- The PEM private key is the **PKCS#1** format (header `BEGIN RSA PRIVATE KEY`), not PKCS#8 (`BEGIN PRIVATE KEY`). Some tools require conversion (e.g., `openssl pkcs8 -topk8 ...`).
- Public key is in **SubjectPublicKeyInfo** format (`BEGIN PUBLIC KEY`), the most widely interoperable form.
- No password protection / encryption on the private key — the PEM is unencrypted. Anyone copying the textarea has the full secret.
- The page generates a key pair on every mount because `computedRefreshableAsync` runs eagerly; bookmarking the page and reopening it incurs a generation.
- The default-bit choice (2048) is a reasonable starting point but the form allows up to 16384, which can lock the browser briefly even with the worker.
- Because generation is non-blocking, the form is technically usable mid-generation — changing `bits` while a refresh is in flight is a benign race because the refresh re-runs on `bits` change.
