/**
 * The initial JavaScript chunk must stay small and must not contain ExcelJS or JSZip
 * (BUILD_SPEC Phase 4 task 4, Phase 8 task 3).
 *
 * The suite reads `dist/`, so it only asserts once a build exists. `npm run verify` runs the tests
 * before the build, so on a clean checkout this suite skips; CI re-runs it after the build through
 * the dedicated "Bundle budget" step, and `npm run check:bundle` does the same locally.
 */
import { describe, it, expect } from 'vitest';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import path from 'node:path';

const DIST = path.resolve('dist/assets');
const INITIAL_JS_GZIP_BUDGET_BYTES = 300 * 1024;

const built = existsSync(DIST);
const describeIfBuilt = built ? describe : describe.skip;

function jsFiles(): string[] {
  return readdirSync(DIST).filter((f) => f.endsWith('.js'));
}

function entryChunk(): string {
  const entry = jsFiles().find((f) => f.startsWith('index-'));
  if (!entry) throw new Error('no entry chunk in dist/assets');
  return entry;
}

describeIfBuilt('bundle budget', () => {
  it('produces an entry chunk', () => {
    expect(entryChunk()).toMatch(/^index-.*\.js$/);
  });

  it('keeps ExcelJS and JSZip out of the entry chunk', () => {
    const source = readFileSync(path.join(DIST, entryChunk()), 'utf8');
    // Marker strings that only appear inside the libraries themselves.
    expect(source).not.toContain('xl/workbook.xml');
    expect(source).not.toContain('JSZip');
    expect(jsFiles().some((f) => f.startsWith('exceljs-'))).toBe(true);
    expect(jsFiles().some((f) => f.startsWith('jszip-'))).toBe(true);
  });

  it('keeps the initial JavaScript under the gzip budget', () => {
    const gzipped = gzipSync(readFileSync(path.join(DIST, entryChunk()))).length;
    expect(
      gzipped,
      `initial JS is ${(gzipped / 1024).toFixed(1)} kB gzip (budget ${
        INITIAL_JS_GZIP_BUDGET_BYTES / 1024
      } kB)`,
    ).toBeLessThanOrEqual(INITIAL_JS_GZIP_BUDGET_BYTES);
  });

  it('code-splits the heavy work into lazy chunks', () => {
    const sizes = jsFiles().map((f) => ({
      file: f.replace(/-[A-Za-z0-9_-]{8}\.js$/, '.js'),
      kb: Math.round(statSync(path.join(DIST, f)).size / 1024),
    }));
    expect(sizes.length).toBeGreaterThan(3);
  });
});
