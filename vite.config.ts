import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as {
  version: string;
};

function gitSha(): string {
  if (process.env.VITE_GIT_SHA) return process.env.VITE_GIT_SHA;
  if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA.slice(0, 12);
  try {
    return execSync('git rev-parse --short=12 HEAD', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return 'unknown';
  }
}

// PAGES_BASE_PATH — must match "/<REPO_NAME>/" for GitHub Pages project sites.
const BASE = process.env.VITE_BASE_PATH ?? '/TRL-assess/';

export default defineConfig({
  base: BASE,
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __GIT_SHA__: JSON.stringify(gitSha()),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  build: {
    target: 'es2022',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/exceljs')) return 'exceljs';
          if (id.includes('node_modules/jszip')) return 'jszip';
          if (id.includes('node_modules/react-markdown') || id.includes('node_modules/remark'))
            return 'markdown';
          return undefined;
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [path.resolve('./tests/setup.ts')],
    include: ['tests/unit/**/*.test.ts', 'tests/component/**/*.test.tsx'],
    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'json-summary', 'lcov'],
      include: ['src/domain/**/*.ts'],
      exclude: ['src/domain/**/index.ts'],
      thresholds: { lines: 95, functions: 95, branches: 85, statements: 95 },
    },
  },
});
