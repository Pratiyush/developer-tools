import type { Preview } from '@storybook/html';
import { themeDecorator } from '../src/stories/_decorators/theme';

const preview: Preview = {
  decorators: [themeDecorator],
  globalTypes: {
    theme: {
      // Mirrors `THEMES` in `src/lib/theme.ts`. Default matches `DEFAULT_THEME`.
      // Both `theme` and `preset` are written to `<html>` until SB-16 (#54)
      // unifies on `[data-preset]` + `[data-density]`.
      description: 'Live app theme — applied as [data-theme] on <html>',
      defaultValue: 'clean',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: [
          { value: 'clean', title: 'Clean' },
          { value: 'linear', title: 'Linear' },
          { value: 'vercel', title: 'Vercel' },
          { value: 'paper', title: 'Paper' },
          { value: 'swiss', title: 'Swiss' },
          { value: 'aurora', title: 'Aurora' },
          { value: 'matrix', title: 'Matrix' },
        ],
        dynamicTitle: true,
      },
    },
    preset: {
      description: 'Design preset — applied as [data-preset] on <html>',
      defaultValue: 'clean',
      toolbar: {
        title: 'Preset',
        icon: 'switchalt',
        items: [
          { value: 'clean', title: 'Clean' },
          { value: 'linear', title: 'Linear' },
          { value: 'vercel', title: 'Vercel' },
          { value: 'paper', title: 'Paper' },
          { value: 'swiss', title: 'Swiss' },
          { value: 'aurora', title: 'Aurora' },
          { value: 'matrix', title: 'Matrix' },
        ],
        dynamicTitle: true,
      },
    },
    density: {
      description: 'Density scale — applied as [data-density] on <html>',
      defaultValue: 'default',
      toolbar: {
        title: 'Density',
        icon: 'component',
        items: [
          { value: 'default', title: 'Default' },
          { value: 'compact', title: 'Compact' },
        ],
        dynamicTitle: true,
      },
    },
  },
  parameters: {
    layout: 'fullscreen',
    // SB-18 (#56): WCAG 2.1 AA rules. No rule disabled (per
    // `feedback_wcag_axe.md`). A story can opt out by tagging itself
    // `a11y-exempt` AND providing `parameters.a11yExemptReason`.
    a11y: {
      options: {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
        },
      },
    },
    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile 390',
          styles: { width: '390px', height: '844px' },
        },
        tablet: {
          name: 'Tablet 768',
          styles: { width: '768px', height: '1024px' },
        },
        desktop: {
          name: 'Desktop 1440',
          styles: { width: '1440px', height: '900px' },
        },
        wide: {
          name: 'Wide 1920',
          styles: { width: '1920px', height: '1080px' },
        },
      },
    },
    options: {
      storySort: {
        order: [
          'Developer Tools Design System',
          [
            'Foundations',
            'Presets',
            'Buttons',
            'Forms',
            'Tool Cards',
            'Navigation',
            'Results',
            'App Frame',
            'Verification',
          ],
          'Design Screens',
          ['Visual Testing Guide', 'Home', 'Tools'],
        ],
      },
    },
  },
};

export default preview;
