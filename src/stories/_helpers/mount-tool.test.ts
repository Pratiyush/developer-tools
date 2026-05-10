import { describe, expect, it, vi } from 'vitest';
import { mountTool } from './mount-tool';
import type { ToolModule } from '../../lib/types';

function makeTool(name: string): {
  tool: ToolModule<{ value: string }>;
  dispose: ReturnType<typeof vi.fn>;
} {
  const dispose: ReturnType<typeof vi.fn> = vi.fn();
  const tool: ToolModule<{ value: string }> = {
    id: name,
    number: 1,
    category: '00-foundations',
    name,
    description: `Test ${name}`,
    tags: [],
    parseParams: (): { value: string } => ({ value: '' }),
    serializeParams: (): { search: URLSearchParams; hash: URLSearchParams } => ({
      search: new URLSearchParams(),
      hash: new URLSearchParams(),
    }),
    render: (host, initial) => {
      const p = host.ownerDocument.createElement('p');
      p.textContent = `mounted: ${initial.value}`;
      host.appendChild(p);
      return { dispose };
    },
  };
  return { tool, dispose };
}

describe('mountTool', () => {
  it('returns a wrapper element with dt-story-host class', () => {
    const { tool } = makeTool('test1');
    const host = mountTool(tool, { value: 'hello' });
    expect(host.tagName).toBe('DIV');
    expect(host.classList.contains('dt-story-host')).toBe(true);
  });

  it('invokes the tool render with the host and initial state', () => {
    const { tool } = makeTool('test2');
    const host = mountTool(tool, { value: 'rendered' });
    expect(host.querySelector('p')?.textContent).toBe('mounted: rendered');
  });

  it('stashes the disposer on the host element', () => {
    const { tool, dispose } = makeTool('test3');
    const host = mountTool(tool, { value: 'x' }) as HTMLDivElement & { __dtDispose?: () => void };
    expect(typeof host.__dtDispose).toBe('function');
    host.__dtDispose?.();
    expect(dispose).toHaveBeenCalledTimes(1);
  });
});
