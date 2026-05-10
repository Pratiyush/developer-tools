import type { Preview } from '@storybook/html';

const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'Design theme from the extracted zip',
      defaultValue: 'mono',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: [
          { value: 'mono', title: 'Mono' },
          { value: 'editorial', title: 'Editorial' },
          { value: 'grid', title: 'Grid' },
          { value: 'aurora', title: 'Aurora' },
          { value: 'clean', title: 'Clean' },
        ],
        dynamicTitle: true,
      },
    },
    preset: {
      description: 'Curated preset: theme + accent + type + radius',
      defaultValue: 'linear',
      toolbar: {
        title: 'Preset',
        icon: 'switchalt',
        items: [
          { value: 'linear', title: 'Linear' },
          { value: 'vercel', title: 'Vercel' },
          { value: 'paper', title: 'Paper' },
          { value: 'swiss', title: 'Swiss' },
          { value: 'aurora', title: 'Aurora' },
          { value: 'clean', title: 'Clean' },
          { value: 'matrix', title: 'Matrix' },
        ],
        dynamicTitle: true,
      },
    },
    density: {
      description: 'Density scale',
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
