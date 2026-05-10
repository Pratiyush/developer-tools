import { describe, expect, it } from 'vitest';
import { kvRow } from './kv-row';
import { kvList } from './kv-list';
import { output } from './output';
import { preview } from './preview';

describe('kvRow', () => {
  it('renders dt + dd with the provided key + value', () => {
    const handle = kvRow({ key: 'Name', value: 'Pratiyush' });
    const dt = handle.el.querySelector('dt.dt-kv-row__key');
    const dd = handle.el.querySelector('dd.dt-kv-row__value');
    expect(dt?.textContent).toBe('Name');
    expect(dd?.textContent).toBe('Pratiyush');
  });

  it('skips the copy button by default', () => {
    const handle = kvRow({ key: 'k', value: 'v' });
    expect(handle.el.querySelector('.dt-kv-row__action')).toBeNull();
  });

  it('renders a copy button when copyable is true', () => {
    const handle = kvRow({ key: 'k', value: 'v', copyable: true });
    expect(handle.el.querySelector('.dt-kv-row__action')).not.toBeNull();
    expect(handle.el.querySelector('button.dt-copy')).not.toBeNull();
  });

  it('applies mono modifier on the value when mono is true', () => {
    const handle = kvRow({ key: 'k', value: 'v', mono: true });
    expect(handle.el.querySelector('.dt-kv-row__value--mono')).not.toBeNull();
  });

  it('dispose is a no-op when no copy button was created', () => {
    const handle = kvRow({ key: 'k', value: 'v' });
    expect(() => handle.dispose()).not.toThrow();
  });

  it('dispose removes the copy button listeners (smoke)', () => {
    const handle = kvRow({ key: 'k', value: 'v', copyable: true });
    handle.dispose();
    // Re-disposing should not throw.
    expect(() => handle.dispose()).not.toThrow();
  });
});

describe('kvList', () => {
  it('wraps multiple rows inside a <dl class="dt-kv-list">', () => {
    const handle = kvList({
      entries: [
        { key: 'A', value: '1' },
        { key: 'B', value: '2' },
      ],
    });
    expect(handle.el.tagName).toBe('DL');
    expect(handle.el.classList.contains('dt-kv-list')).toBe(true);
    expect(handle.el.querySelectorAll('.dt-kv-row')).toHaveLength(2);
  });

  it('disposes every row', () => {
    const handle = kvList({ entries: [{ key: 'A', value: '1', copyable: true }] });
    expect(() => handle.dispose()).not.toThrow();
  });
});

describe('output', () => {
  it('renders <pre><code> with the content', () => {
    const el = output({ content: 'hello\nworld' });
    expect(el.tagName).toBe('PRE');
    expect(el.classList.contains('dt-output')).toBe(true);
    expect(el.querySelector('code.dt-output__code')?.textContent).toBe('hello\nworld');
  });

  it('writes data-language when provided', () => {
    const el = output({ content: '{}', language: 'json' });
    expect(el.dataset.language).toBe('json');
  });

  it('preserves textual content without HTML interpretation', () => {
    const el = output({ content: '<script>alert(1)</script>' });
    expect(el.querySelector('.dt-output__code')?.innerHTML).toBe(
      '&lt;script&gt;alert(1)&lt;/script&gt;',
    );
  });
});

describe('preview', () => {
  it('mounts the provided content into the body', () => {
    const child = document.createElement('button');
    child.textContent = 'Click me';
    const el = preview({ content: child });
    expect(el.classList.contains('dt-preview')).toBe(true);
    expect(el.querySelector('.dt-preview__body')?.firstChild).toBe(child);
  });

  it('renders caption when provided', () => {
    const el = preview({ caption: 'Live preview', content: document.createElement('span') });
    expect(el.querySelector('.dt-preview__caption')?.textContent).toBe('Live preview');
  });

  it('omits caption when not provided', () => {
    const el = preview({ content: document.createElement('span') });
    expect(el.querySelector('.dt-preview__caption')).toBeNull();
  });
});
