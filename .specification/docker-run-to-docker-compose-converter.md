# Docker run to Docker compose converter

## Overview
- **Path:** `/docker-run-to-docker-compose-converter`
- **Category:** Development
- **Description:** Transforms "docker run" commands into docker-compose files!
- **Keywords:** docker, run, compose, yaml, yml, convert, deamon
- **Redirect from:** None

## Purpose
Take an arbitrary `docker run ...` shell command and convert it to an equivalent `docker-compose.yml` snippet. Lets users quickly migrate single-container quick-start commands into compose-based local development setups, and downloads the generated YAML directly. The tool also surfaces three classes of conversion warnings: options that have no compose equivalent, options not yet implemented, and parser errors.

## Inputs
| Field | Type | Default | Validation |
|---|---|---|---|
| `dockerRun` | string (multiline) | `'docker run -p 80:80 -v /var/run/docker.sock:/tmp/docker.sock:ro --restart always --log-opt max-size=1g nginx'` | None at the input level; the `composerize` library reports issues |

## Outputs
| Output | Type | Description |
|---|---|---|
| `dockerCompose` | string (YAML) | The converted compose file rendered in a `TextareaCopyable` with YAML syntax highlighting |
| `notImplemented` | string[] | List of `docker run` options that the converter does not yet implement (warning alert) |
| `notComposable` | string[] | List of options that fundamentally cannot be expressed in docker-compose (info alert) |
| `errors` | string[] | List of parser errors encountered (error alert) |
| Download `docker-compose.yml` | file | Triggered by the Download button; encodes the YAML as base64 data URL `data:application/yaml;base64,...` |

## UI / Components
- A multi-line `c-input-text` (3 rows, monospace font) for the docker run command, label `Your docker run command:`, with placeholder `Your docker run command to convert...`.
- An `n-divider`.
- A `TextareaCopyable` (internal component) showing the converted YAML output with `language="yaml"` for syntax highlighting and a copy button.
- Below the output, a horizontal flex with a `Download docker-compose.yml` button (secondary, disabled when output is empty).
- Below the download button, three conditional alert blocks:
  - `<n-alert type="info">` titled "This options are not translatable to docker-compose" → renders `notComposable[]` as a `<ul>`
  - `<n-alert type="warning">` titled "This options are not yet implemented and therefore haven't been translated to docker-compose" → renders `notImplemented[]`
  - `<n-alert type="error">` titled "The following errors occured" → renders `errors[]`

## Logic / Algorithm
The conversion is delegated entirely to the `composerize-ts` library:

```ts
const conversionResult = computed(() =>
  withDefaultOnError(() => composerize(dockerRun.value.trim()), { yaml: '', messages: [] }),
);
```

The library returns `{ yaml: string, messages: ConversionMessage[] }`. Messages are partitioned by `MessageType`:
- `MessageType.notImplemented` → warning bucket
- `MessageType.notTranslatable` → info bucket
- `MessageType.errorDuringConversion` → error bucket

```ts
const dockerComposeBase64 = computed(
  () => `data:application/yaml;base64,${textToBase64(dockerCompose.value)}`
);
const { download } = useDownloadFileFromBase64({
  source: dockerComposeBase64,
  filename: 'docker-compose.yml',
});
```

`textToBase64` (from `@/utils/base64`) encodes the YAML; `useDownloadFileFromBase64` (from `@/composable/downloadBase64`) provides the `download()` action that triggers a browser-side file download.

If `composerize` throws (e.g., garbage input), `withDefaultOnError` returns `{ yaml: '', messages: [] }`, and the YAML pane is empty.

## Dependencies
- `composerize-ts` (`^0.6.2`) — the conversion engine (TypeScript port of the original `composerize`); also exports `MessageType`
- `naive-ui` — `n-alert`, `n-divider`
- `@vicons/tabler` — icon `BrandDocker`
- `@/utils/base64` — `textToBase64`
- `@/composable/downloadBase64` — `useDownloadFileFromBase64`
- `@/utils/defaults` — `withDefaultOnError`
- Internal `c-input-text`, `c-button`, `TextareaCopyable`
- Type declaration file `composerize.d.ts` (declares ambient module `composerize` for type-only purposes; the tool actually uses `composerize-ts`)

## Edge Cases & Validation
- Empty input → empty output, no alerts; the download button is disabled.
- Garbage input (not a `docker run` command) → `composerize` may throw; caught by `withDefaultOnError`; output stays empty.
- Options with no compose equivalent (e.g., `--privileged` flags depending on coverage of the library) appear in the `notComposable` info alert.
- Options not yet implemented in `composerize-ts` appear in the `notImplemented` warning alert.
- The downloaded file is named `docker-compose.yml`.
- The conversion respects the trimmed input (`dockerRun.value.trim()`), so leading/trailing whitespace is harmless.
- The `MessageType` enum is imported from `composerize-ts`. The library's exact naming conventions and behavior define which warnings appear when.
- The dummy `composerize.d.ts` in the folder declares a different module (`composerize`); the actual import is `composerize-ts`. This d.ts file appears to be vestigial (legacy from before the `-ts` port).

## Examples
**Default input:**
```sh
docker run -p 80:80 -v /var/run/docker.sock:/tmp/docker.sock:ro --restart always --log-opt max-size=1g nginx
```

**Approximate output (depends on composerize-ts version):**
```yaml
version: '3.3'
services:
    nginx:
        ports:
            - '80:80'
        volumes:
            - '/var/run/docker.sock:/tmp/docker.sock:ro'
        restart: always
        logging:
            options:
                max-size: 1g
        image: nginx
```

The user may then click `Download docker-compose.yml` to save the file.

## File Structure
- `index.ts` — Tool registration; route `/docker-run-to-docker-compose-converter`, icon `BrandDocker`
- `docker-run-to-docker-compose-converter.vue` — Single-file component: input, divider, output textarea, download button, three alert sections
- `composerize.d.ts` — Ambient module declaration (`declare module 'composerize'`) — appears to be legacy/unused in favor of `composerize-ts`

## Notes
- No unit tests or e2e tests for this tool.
- All conversion logic is in `composerize-ts`; this Vue component is a thin UI wrapper.
- No persistence; reload clears the input.
- The keyword list contains `deamon` (typo for `daemon`).
- The downloaded file uses content-type `application/yaml`.
- The output text supports copy via `TextareaCopyable` and download via the dedicated button.
- Error messages from `composerize-ts` are surfaced verbatim — they are typically helpful (e.g., "option `--foo` not yet translated").
