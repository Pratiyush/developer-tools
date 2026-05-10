/**
 * `.dt-kv-list` — a `<dl>` container holding multiple `kvRow`s.
 * Returns a handle that disposes every nested copy-button.
 */

import { kvRow, type KvRowHandle, type KvRowOptions } from './kv-row';

export interface KvListOptions {
  readonly entries: readonly KvRowOptions[];
}

export interface KvListHandle {
  readonly el: HTMLDListElement;
  dispose(): void;
}

export function kvList(options: KvListOptions): KvListHandle {
  const root = document.createElement('dl');
  root.className = 'dt-kv-list';

  const handles: KvRowHandle[] = [];
  for (const entry of options.entries) {
    const handle = kvRow(entry);
    handles.push(handle);
    root.appendChild(handle.el);
  }

  return {
    el: root,
    dispose: () => {
      for (const handle of handles) handle.dispose();
    },
  };
}
