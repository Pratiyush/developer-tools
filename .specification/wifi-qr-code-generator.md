# WiFi QR Code generator

## Overview
- **Path:** `/wifi-qrcode-generator`
- **Category:** Images and videos
- **Description:** Generate and download QR codes for quick connections to WiFi networks.
- **Keywords:** `qr`, `code`, `generator`, `square`, `color`, `link`, `low`, `medium`, `quartile`, `high`, `transparent`, `wifi`
- **Redirect from:** None
- **Icon:** `Qrcode` (from `@vicons/tabler`)
- **Created:** 2023-09-06

## Purpose
Builds a QR code following the de-facto Wi-Fi network configuration string spec (the `WIFI:` URI accepted by Android, iOS 11+, and many other camera apps), so a phone can scan and join a network without typing credentials. The user picks an encryption mode, fills in SSID/password (and EAP details where applicable), customizes foreground/background colors, then previews and downloads the resulting PNG. Useful for printed signage in offices, hotels, cafes, or for sharing a guest network without spelling out the password.

## Inputs
| Field | Type | Default | Validation / Notes |
|-------|------|---------|--------------------|
| `encryption` | `'WPA' \| 'WEP' \| 'nopass' \| 'WPA2-EAP'` (select) | `'WPA'` (initialized inside `useWifiQRCode`) | Default-value attribute on the select is `WPA`; UI labels: "WPA/WPA2", "WEP", "No password", "WPA2-EAP" |
| `ssid` | `string` | `undefined` | Required — no QR code is produced without it |
| `password` | `string` (type=password) | `undefined` | Required for `WPA`, `WEP`, `WPA2-EAP`; hidden for `nopass` |
| `isHiddenSSID` | `boolean` (checkbox) | `false` | Adds `H:true` to the URI when checked |
| `eapMethod` | one of 17 EAP methods (`MD5`, `POTP`, `GTC`, `TLS`, `IKEv2`, `SIM`, `AKA`, `AKA'`, `TTLS`, `PWD`, `LEAP`, `PSK`, `FAST`, `TEAP`, `EKE`, `NOOB`, `PEAP`) | `undefined` | Only shown for `WPA2-EAP`; required for that mode |
| `eapAnonymous` | `boolean` (checkbox) | `false` | Anonymizes identity in the URI (`A:anon`); only for `WPA2-EAP` |
| `eapIdentity` | `string` | `undefined` | Required for `WPA2-EAP` if not anonymous |
| `eapPhase2Method` | `'None' \| 'MSCHAPV2'` | `undefined` | Required when `eapMethod === 'PEAP'` |
| `foreground` | hex color string | `'#000000ff'` | `n-color-picker` modes restricted to `['hex']` |
| `background` | hex color string | `'#ffffffff'` | `n-color-picker` modes restricted to `['hex']` |

The hardcoded QR rendering options:

| Option | Value |
|--------|-------|
| `width` | `1024` (PNG side length in px) |
| `errorCorrectionLevel` | `'M'` (medium ~15% recovery) |
| `color.dark` | `foreground` |
| `color.light` | `background` |

## Outputs
| Output | Type | Description |
|--------|------|-------------|
| `qrcode` | base64 data URL (PNG) | Bound to `<img src>` for the on-page preview (rendered at `width="200"`) and to a "Download qr-code" button via `useDownloadFileFromBase64` (filename `qr-code.png`) |
| `encryption` | reactive `WifiEncryption` | Two-way bound to the encryption select |

The composable also constructs the underlying `WIFI:` URI internally (not exposed as a separate output).

## UI / Components
The whole tool sits inside a single `c-card`. Layout: `grid grid-cols-1 gap-12`.

Form section (always visible):
- `c-select` — Encryption method (`label-width="130px"`, right-aligned label).
- A horizontal flex row with `c-input-text` for SSID + an `n-checkbox` "Hidden SSID".
- `c-input-text` (type password) for Password — hidden for `nopass`.

Conditional WPA2-EAP block (only when `encryption === 'WPA2-EAP'`):
- `c-select` for EAP method (searchable).
- A flex row with `c-input-text` for EAP Identity + `n-checkbox` "Anonymous?".
- `c-select` for EAP Phase 2 method (searchable).

Color section (always visible) inside an `n-form` with `label-width="130"`, `label-placement="left"`:
- `n-form-item` "Foreground color:" → `n-color-picker` (hex only).
- `n-form-item` "Background color:" → `n-color-picker` (hex only).

Preview section (only when `qrcode` is non-empty):
- A centered column (`flex flex-col items-center gap-3`) with the rendered `<img alt="wifi-qrcode" :src="qrcode" width="200">` and a `c-button` "Download qr-code".

## Logic / Algorithm

The composable `useWifiQRCode` does the heavy lifting; the `.vue` is mostly bindings.

1. **Watch sources:** every reactive input (`ssid`, `password`, `encryption`, `eapMethod`, `isHiddenSSID`, `eapAnonymous`, `eapIdentity`, `eapPhase2Method`, `background`, `foreground`) is collected into a watch list (`.filter(isRef)` so plain values are skipped).
2. **Build the URI** via `getQrCodeText(...)`:
   - Escape special characters in SSID/password/identity using `escapeString`: `\\, ;, ,, :, "` are each prefixed with a backslash.
   - **No SSID:** return `null` (no QR generated).
   - **`nopass`:** return `WIFI:S:<ssid>;;` — type and password omitted, smaller QR.
   - **`WPA` or `WEP`:** return `WIFI:S:<ssid>;T:<encryption>;P:<password>;<H:true if hidden>;`.
   - **`WPA2-EAP`:** requires either `eapIdentity` or `eapAnonymous` (else `null`); if `eapMethod === 'PEAP'` also requires `eapPhase2Method`. Build identity segment as `A:anon` (anonymous) or `I:<eapIdentity>`. Build phase2 segment as `PH2:<method>;` (omitted when `None`). Return:
     - `WIFI:S:<ssid>;T:WPA2-EAP;P:<password>;E:<eapMethod>;<phase2><identity>;<H:true if hidden>;`
3. **Render:** if URI is non-null, call `QRCode.toDataURL(text.trim(), { color: { dark: fg, light: bg, ...options.color }, errorCorrectionLevel: 'M', ...options })` and assign the resulting base64 PNG to `qrcode`.
4. The watch fires `immediate: true`, so the QR appears the moment the input is valid.

Escape implementation (regex `/([\\;,:"])/g` → `\\$1`):
```ts
function escapeString(str: string) {
  return str.replace(/([\\;,:"])/g, '\\$1');
}
```

## Dependencies
- `qrcode` (`^1.5.1`) — generates the PNG data URL.
- `yaml` not used here — but `@vueuse/core` (`MaybeRef`, `get`) for ergonomic ref unwrapping.
- `@vicons/tabler#Qrcode` — icon.
- `naive-ui` — `n-form`, `n-form-item`, `n-color-picker`, `n-checkbox`, plus the `c-*` wrappers (`c-card`, `c-select`, `c-input-text`, `c-button`).
- `@/composable/downloadBase64#useDownloadFileFromBase64` — wires the download button to the data URL with filename `qr-code.png`.

## Edge Cases & Validation
- **Missing SSID:** the composable returns `null` and no QR is generated; the preview/download block is hidden because of `v-if="qrcode"`.
- **Missing password (non-`nopass`):** URI builder takes the `password` truthiness branch; for empty password, it falls through and returns `null` → no QR.
- **WPA2-EAP without identity/anonymous:** `null` → no QR.
- **PEAP without Phase 2 method:** `null` → no QR.
- **SSID/password contains `\`, `;`, `,`, `:`, or `"`:** automatically backslash-escaped per the spec.
- **Color picker non-hex:** disallowed — `:modes="['hex']"` constrains to hex only (including alpha).
- **No size cap on inputs:** very long SSIDs or passwords increase QR density (with EC level `M`, ~15% damage tolerance).
- The image is rendered at 200 px on screen but the underlying PNG is `1024×1024`, so download yields a high-resolution print-ready PNG.

## Examples
**Example 1 — Home WPA2 network**
- Inputs: `encryption='WPA'`, `ssid='HomeWiFi'`, `password='s3cret!'`, `isHiddenSSID=false`
- URI: `WIFI:S:HomeWiFi;T:WPA;P:s3cret!;;`
- A 1024×1024 PNG QR code is generated; iPhone/Android camera apps recognize the URI and prompt to join.

**Example 2 — Open guest network with hidden SSID**
- Inputs: `encryption='nopass'`, `ssid='Guest, Lounge'`, `isHiddenSSID=true` (note: `nopass` URI does not actually emit `H:true` because the `nopass` branch returns early before that segment is added)
- URI: `WIFI:S:Guest\, Lounge;;` (comma escaped)

**Example 3 — Enterprise WPA2-EAP with PEAP**
- Inputs: `encryption='WPA2-EAP'`, `ssid='CorpNet'`, `password='p@ss'`, `eapMethod='PEAP'`, `eapPhase2Method='MSCHAPV2'`, `eapIdentity='alice@corp.com'`, `eapAnonymous=false`
- URI: `WIFI:S:CorpNet;T:WPA2-EAP;P:p@ss;E:PEAP;PH2:MSCHAPV2;I:alice@corp.com;;`

## File Structure
| File | Purpose |
|------|---------|
| `index.ts` | Tool metadata: name, path `/wifi-qrcode-generator`, keywords, icon `Qrcode`, lazy import. |
| `wifi-qr-code-generator.vue` | View component: form bindings, color pickers, preview, download button. |
| `useQRCode.ts` | Logic composable: encryption/EAP enums, escape function, URI builder, QR rendering watcher. |

## Notes
- **i18n:** title/description from `tools.wifi-qrcode-generator.title` / `.description`. All other strings are hard-coded English.
- **Persistence:** none — every input resets on page load.
- **Spec reference:** the URI grammar follows ZXing's [Barcode Contents wiki](https://github.com/zxing/zxing/wiki/Barcode-Contents#wi-fi-network-config-android-ios-11). EAP method list refers to [Wikipedia Extensible Authentication Protocol](https://en.wikipedia.org/wiki/Extensible_Authentication_Protocol).
- **Privacy:** all generation is client-side; SSID and password never leave the browser.
- **Accessibility:** the preview `<img>` has `alt="wifi-qrcode"`. Color contrast can be set arbitrarily by the user — no warning if foreground/background contrast is too low for scanners.
- **Quirk:** for `nopass`, the early-return in `getQrCodeText` means `isHiddenSSID` is silently ignored; for the other branches it is appended.
