import '@testing-library/jest-dom/vitest';

// Build-time constants injected by Vite's `define`; provide them under Vitest too.
(globalThis as Record<string, unknown>).__APP_VERSION__ ??= '0.0.0-test';
(globalThis as Record<string, unknown>).__GIT_SHA__ ??= 'testsha';
(globalThis as Record<string, unknown>).__BUILD_TIME__ ??= '1970-01-01T00:00:00.000Z';
