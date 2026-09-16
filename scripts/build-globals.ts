/**
 * Side-effect module: supplies the build-time constants that Vite's `define` injects, so that
 * app modules can be imported from Node scripts. Import this *before* any `src/` import.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';

const pkg = JSON.parse(readFileSync(path.resolve('package.json'), 'utf8')) as { version: string };
const globals = globalThis as Record<string, unknown>;

globals.__APP_VERSION__ ??= pkg.version;
globals.__GIT_SHA__ ??= process.env.VITE_GIT_SHA ?? process.env.GITHUB_SHA?.slice(0, 12) ?? 'local';
globals.__BUILD_TIME__ ??= new Date().toISOString();

export {};
