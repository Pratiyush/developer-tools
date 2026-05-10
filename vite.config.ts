import { defineConfig } from 'vite';

// Project-page hosting on GitHub Pages: https://pratiyush.github.io/developer-tools/
// `base` is required so asset URLs resolve under the repo path.
export default defineConfig({
  root: '.',
  base: '/developer-tools/',
  build: {
    outDir: 'dist',
    sourcemap: true,
    target: 'es2022',
  },
  server: {
    port: 5173,
    open: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    exclude: [
      'node_modules/**',
      'dist/**',
      '.analysis/**',
      '.specification/**',
      'marketing/**',
      'tools/**',
      'design/**',
      '.playwright-mcp/**',
      '.claude/**',
      'tests/e2e/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
  },
});
