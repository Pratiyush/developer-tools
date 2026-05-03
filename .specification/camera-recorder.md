# Camera Recorder

## Overview
- **Path:** `/camera-recorder`
- **Category:** Images and videos
- **Description:** Take a picture or record a video from your webcam or camera.
- **Keywords:** `camera`, `recoder` *(typo retained from source)*
- **Redirect from:** None
- **Icon:** `Camera` (from `@vicons/tabler`)
- **Created at:** 2023-05-15
- **i18n key:** `tools.camera-recorder.title` / `.description`

## Purpose
A small in-browser webcam utility. After granting camera + microphone permissions, the user can pick which camera/microphone to use, see a live preview, snap PNG screenshots, and record WebM videos with pause/resume/stop controls. Each captured artifact appears in a gallery below where it can be downloaded or removed.

## Inputs
| Field | Type | Default | Notes |
|-------|------|---------|-------|
| `currentCamera` | string (deviceId) | first detected camera | Selected via `c-select` populated from `useDevicesList().videoInputs`. |
| `currentMicrophone` | string (deviceId) | first detected microphone | Selected via `c-select` (only shown when at least one mic exists). |
| User permissions | implicit | not granted | Requested via `useDevicesList({ requestPermissions: true, constraints: { video: true, audio: true } })` and explicitly via the "Grant permission" button. |

## Outputs
| Field | Type | Description |
|-------|------|-------------|
| `medias` | `Array<{ type: 'image' \| 'video'; value: string; createdAt: Date }>` | Gallery — newest items prepended via `unshift`. `value` is a `data:image/png;base64,...` URL for screenshots and a `blob:` object URL for recordings. |
| Downloaded screenshot | PNG file | Filename: `image-<createdAt.getTime()>.png`. |
| Downloaded recording | WebM file | Filename: `video-<createdAt.getTime()>.webm`. |

## UI / Components
- **State branches** (only one is rendered at a time):
  - `!isSupported` → `c-card` "Your browser does not support recording video from camera".
  - `!permissionGranted` → centred `c-card` with a "Grant permission" `c-button`. After a denied prompt, an additional `c-alert` explains how to grant permission manually.
  - Otherwise the live UI:
    - Two stacked `c-select`s for video and audio device.
    - "Start webcam" `c-button` if `!isMediaStreamAvailable`.
    - When streaming:
      - `<video ref="video" autoplay controls playsinline>` showing the live stream.
      - Action row:
        - "Take screenshot" button (camera icon, `icon-mdi-camera`).
        - Record controls (only if `isRecordingSupported`):
          - "Start recording" (when `recordingState === 'stopped'`).
          - "Pause" (when `'recording'`).
          - "Resume" (when `'paused'`).
          - "Stop" (when not stopped) — `type="error"`.
        - Otherwise an italic message "Video recording is not supported in your browser".
- **Gallery:** `grid-cols-2` of `c-card`s. Each card shows the media (`<img>` or `<video controls>`) and a header row with the type label ("Screenshot" / "Video") plus Download and Delete `c-button`s.

## Logic / Algorithm

### Device discovery & stream
```ts
const { videoInputs, audioInputs, permissionGranted, isSupported, ensurePermissions }
  = useDevicesList({ requestPermissions: true, constraints: { video: true, audio: true }, onUpdated() { refreshCurrentDevices(); } });
const { stream, start, stop, enabled } = useUserMedia({
  constraints: computed(() => ({
    video: { deviceId: currentCamera.value },
    ...(currentMicrophone.value ? { audio: { deviceId: currentMicrophone.value } } : {}),
  })),
  autoSwitch: true,
});
```
`refreshCurrentDevices()` falls back to the first available device whenever the currently selected one disappears (e.g. unplugged USB cam).

### Screenshot
```ts
const canvas = document.createElement('canvas');
canvas.width = video.videoWidth;
canvas.height = video.videoHeight;
canvas.getContext('2d')?.drawImage(video, 0, 0);
const image = canvas.toDataURL('image/png');
medias.unshift({ type: 'image', value: image, createdAt: new Date() });
```

### Recording (`useMediaRecorder`)
- `isRecordingSupported = MediaRecorder.isTypeSupported('video/webm')`.
- `startRecording`:
  - Bails if not supported, no stream, or already recording.
  - Creates `new MediaRecorder(stream, { mimeType: 'video/webm' })`.
  - On `ondataavailable` events with non-empty `data`, push to `recordedChunks`.
  - On `onstop`, build `new Blob(recordedChunks, { type: 'video/webm' })`, create a `URL.createObjectURL(blob)`, clear the chunks, and trigger the `recordAvailable` event hook.
  - Calls `mediaRecorder.start()` and sets `recordingState = 'recording'`.
- `stopRecording` / `pauseRecording` / `resumeRecording` are guarded so they only run from valid prior states.
- The component subscribes via `onRecordAvailable((url) => medias.unshift({ type: 'video', value: url, createdAt: new Date() }))`.

### Cleanup
- `onBeforeUnmount(() => stop())` shuts the live stream when leaving the page.
- A `watchEffect` reattaches `video.srcObject = stream` whenever either changes.

### Permissions
- Initial mount triggers `useDevicesList`'s built-in `requestPermissions: true`.
- The "Grant permission" button calls `ensurePermissions()` inside a `try/catch`. If the browser refuses the prompt entirely (`NotAllowedError` / `PermissionDeniedError` etc.), `permissionCannotBePrompted = true` flips the alert into "you must enable manually" mode.

### Download
```ts
const link = document.createElement('a');
link.href = value;
link.download = `${type}-${createdAt.getTime()}.${type === 'image' ? 'png' : 'webm'}`;
link.click();
```

## Dependencies
- `@vueuse/core` (auto-imported globally in this project): `useDevicesList`, `useUserMedia`, `createEventHook`.
- `lodash` (`_.isNil`).
- Native APIs: `MediaRecorder`, `Blob`, `URL.createObjectURL`, `<canvas>.toDataURL`.
- Project components: `c-card`, `c-button`, `c-select`, `c-alert`.
- `@vicons/tabler` (`Camera`, registered as the tool icon).
- Inline `icon-mdi-*` (Material Design icons via UnoCSS preset / iconify).

## Edge Cases & Validation
- Browser without `getUserMedia` (`!isSupported`) — only a "browser not supported" card is shown.
- Denied permissions — "Grant permission" button retried; if browser refuses to even prompt, the manual-instruction alert displays.
- No microphone — the audio constraint is omitted entirely (so calls succeed on devices without a mic).
- Hot-swapping devices — `useDevicesList.onUpdated` triggers `refreshCurrentDevices`, falling back to the first device when the previous one vanishes.
- Browser without `MediaRecorder.isTypeSupported('video/webm')` — recording controls are replaced with an italic notice; screenshots still work.
- Pause/resume/stop methods all bail out silently in the wrong state (e.g. resuming when stopped) — they do not throw.
- Closing the tab during recording — the WebM blob is built only when `stop()` fires `onstop`; abrupt unmount calls `stop()` on the stream but the MediaRecorder is left to its own cleanup.
- Privacy: media URLs are object URLs/data URLs; nothing leaves the browser. They live in memory until the gallery item is removed (object URLs are not explicitly revoked when deleted).

## Examples
1. **Take a screenshot** — click "Take screenshot" while streaming. A new card appears at the top of the gallery with a PNG preview and Download/Delete buttons. Filename: `image-1714312832123.png`.
2. **Record a 5-second clip** — Start → wait → Stop. A new card appears with an inline `<video controls>` player. Filename: `video-1714312862456.webm`.
3. **Pause & resume** — start recording, click "Pause" mid-clip (recorder enters `paused`), click "Resume" to continue; on Stop the resulting WebM concatenates both segments.

## File Structure
| File | Description |
|------|-------------|
| `index.ts` | Tool metadata (createdAt 2023-05-15). |
| `camera-recorder.vue` | Top-level component: device pickers, live preview, screenshot, gallery rendering, permission gating. |
| `useMediaRecorder.ts` | Custom composable wrapping the native `MediaRecorder` API: state machine (`stopped`/`recording`/`paused`), event hook for finished recordings, support detection. |

## Notes
- **No persistence.** The gallery is in-memory only.
- **Privacy / client-only:** No data leaves the browser; recording is fully local.
- **i18n:** Title and description are translated; UI strings are hard-coded English.
- **Object-URL leaks:** Deleted gallery items keep their object URLs until garbage-collected; for long sessions consider wiring a `URL.revokeObjectURL` cleanup (not currently done).
- **Recording mime type:** Hard-coded to `video/webm`. Browsers without WebM (rare) hide the recording controls entirely.
