import { describe, expect, it } from 'vitest';
import { variants } from './variants';

describe('variants', () => {
  it('returns base alone when no variants selected and no defaults', () => {
    const cls = variants({ base: 'dt-foo', variants: {} });
    expect(cls()).toBe('dt-foo');
  });

  it('applies the default variant when none is selected', () => {
    const cls = variants({
      base: 'dt-foo',
      variants: { tone: { primary: 'dt-foo--primary', secondary: 'dt-foo--secondary' } },
      defaultVariants: { tone: 'primary' },
    });
    expect(cls()).toBe('dt-foo dt-foo--primary');
  });

  it('overrides the default variant when an option is provided', () => {
    const cls = variants({
      base: 'dt-foo',
      variants: { tone: { primary: 'dt-foo--primary', secondary: 'dt-foo--secondary' } },
      defaultVariants: { tone: 'primary' },
    });
    expect(cls({ tone: 'secondary' })).toBe('dt-foo dt-foo--secondary');
  });

  it('skips empty class strings cleanly', () => {
    const cls = variants({
      base: 'dt-foo',
      variants: { size: { sm: 'dt-foo--sm', md: '' } },
      defaultVariants: { size: 'md' },
    });
    expect(cls()).toBe('dt-foo');
  });

  it('combines multiple variant groups', () => {
    const cls = variants({
      base: 'dt-btn',
      variants: {
        tone: { primary: 'dt-btn--primary', danger: 'dt-btn--danger' },
        size: { sm: 'dt-btn--sm', md: 'dt-btn--md' },
      },
      defaultVariants: { tone: 'primary', size: 'md' },
    });
    expect(cls({ tone: 'danger' })).toBe('dt-btn dt-btn--danger dt-btn--md');
    expect(cls({ size: 'sm' })).toBe('dt-btn dt-btn--primary dt-btn--sm');
    expect(cls({})).toBe('dt-btn dt-btn--primary dt-btn--md');
  });

  it('omits a group entirely when neither selected nor default is provided', () => {
    const cls = variants({
      base: 'dt-btn',
      variants: { tone: { primary: 'dt-btn--primary' } },
    });
    expect(cls()).toBe('dt-btn');
  });

  it('omits the base when not provided', () => {
    const cls = variants({
      variants: { tone: { primary: 'dt-btn--primary' } },
      defaultVariants: { tone: 'primary' },
    });
    expect(cls()).toBe('dt-btn--primary');
  });
});
