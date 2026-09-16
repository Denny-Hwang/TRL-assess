/**
 * The initial JavaScript chunk must not contain ExcelJS or JSZip (BUILD_SPEC Phase 4 task 4,
 * Phase 8 task 3). Runs against dist/, and skips when no build is present.
 */
import { describe, it, expect } from 'vitest';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import path from 'node:path';

const DIST = path.resolve('dist/assets');
const INITIAL_JS_GZIP_BUDGET_BYTES = 300 * 1024;

const built = existsSync(DIST);
const describeIfBuilt = built ? describe : describe.skip;

describeIfBuilt('bundle budget', () => {
  const files = readdirSync(DIST).filter((f) => f.endsWith('.js'));
  const entry = files.find((f) => f.startsWith('index-'));

  it('produces an entry chunk', () => {
    expect(entry).toBeDefined();
  });

  it('keeps ExcelJS and JSZip out of the entry chunk', () => {
    const source = readFileSync(path.join(DIST, entry!), 'utf8');
    // Marker strings that only appear inside the libraries themselves.
    expect(source).not.toContain('xl/workbook.xml');
    expect(source).not.toContain('JSZip');
    expect(files.some((f) => f.startsWith('exceljs-'))).toBe(true);
  });

  it('keeps the initial JavaScript under the gzip budget', () => {
    const gzipped = gzipSync(readFileSync(path.join(DIST, entry!))).length;
    expect(
      gzipped,
      `initial JS is ${(gzipped / 1024).toFixed(1)} kB gzip (budget ${
        INITIAL_JS_GZIP_BUDGET_BYTES / 1024
      } kB)`,
    ).toBeLessThanOrEqual(INITIAL_JS_GZIP_BUDGET_BYTES);
  });

  it('reports the lazy chunk sizes for the record', () => {
    const sizes = files.map((f) => ({
      file: f.replace(/-[A-Za-z0-9_-]{8}\.js$/, '.js'),
      kb: Math.round(statSync(path.join(DIST, f)).size / 1024),
    }));
    expect(sizes.length).toBeGreaterThan(1);
  });
});
