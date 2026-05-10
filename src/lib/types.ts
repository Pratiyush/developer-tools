/**
 * Public type contracts for the developer-tools registry.
 *
 * Each tool ships as a self-contained module exposing pure URL-state
 * (de)serialization plus a render hook. The registry composes them.
 */

/** Static metadata every tool must expose. */
export interface ToolMeta {
  /** Stable kebab-case identifier, unique across the registry. */
  readonly id: string;
  /** Globally monotonic 1..N ordering used for canonical URLs. */
  readonly number: number;
  /** Folder-style category slug, e.g. `'01-encoding'`. */
  readonly category: string;
  readonly name: string;
  readonly description: string;
  readonly tags: readonly string[];
}

/**
 * A tool module with its state shape `S` pinned. The base `ToolMeta` is
 * extended with the three lifecycle methods that depend on `S`.
 */
export interface ToolModule<S> extends ToolMeta {
  /**
   * Rebuild typed state from URL `?search` and `#hash` params.
   * Hash is parsed as `?key=val&...` after stripping the leading `#`.
   */
  parseParams(search: URLSearchParams, hash: URLSearchParams): S;

  /** Inverse of {@link parseParams}: decide which slice of state goes where. */
  serializeParams(state: S): { search: URLSearchParams; hash: URLSearchParams };

  /**
   * Mount the tool into `host`. Returns a disposer that detaches listeners
   * and clears DOM. Must be idempotent.
   */
  render(host: HTMLElement, initial: S): { dispose(): void };
}

/**
 * Read-only ordered list of all known tool modules. Uses `never` for the
 * state generic so the empty registry type-checks under strict rules.
 * Tool registrations widen this via the `as` assertion in the registry file.
 */
export type ToolRegistry = readonly ToolModule<never>[];

/**
 * Lazy entry for the route-level code-split. The metadata fields satisfy
 * the sidebar / home grid synchronously; `load()` triggers a dynamic
 * `import()` (Vite emits one chunk per call site) and resolves to the
 * full {@link ToolModule}. The router awaits this only when the user
 * actually navigates to the tool.
 */
export interface ToolManifest extends ToolMeta {
  /** Returns a thenable for the runtime module — render / parse / serialize. */
  readonly load: () => Promise<ToolModule<unknown>>;
}
