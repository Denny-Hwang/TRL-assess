/**
 * The evidence package is built, unzipped in memory and verified.
 */
import { describe, it, expect, beforeAll, vi } from 'vitest';
import JSZip from 'jszip';
import ExcelJS from 'exceljs';
import { resolveFramework } from '@/domain/frameworks';
import { addEvidence, linkEvidence, parseSession } from '@/domain/session';
import { FICTIONAL_EXAMPLE } from '@/data/examples';
import { blobToArrayBuffer, sha256Hex } from '@/domain/hash';
import { MAX_PACKAGE_TOTAL_MB } from '@/config/app.config';
import type { AssessmentSession } from '@/domain/schemas';

const blobs = new Map<string, Blob>();
vi.mock('@/storage/blobStore', () => ({
  getBlob: vi.fn(async (key: string) => blobs.get(key)),
  putBlob: vi.fn(async (key: string, blob: Blob) => {
    blobs.set(key, blob);
  }),
  deleteBlob: vi.fn(),
  listBlobKeys: vi.fn(async () => [...blobs.keys()]),
  clearBlobs: vi.fn(),
  __resetBlobStore: vi.fn(),
  StorageUnavailableError: class extends Error {},
  QuotaExceededError: class extends Error {},
  isQuotaError: () => false,
}));

const { buildEvidencePackage, evidenceEntryName, preflight, sanitizeFileName } =
  await import('@/export/zip/package');

const framework = resolveFramework('dod-tra-2025');
const generatedAt = new Date('2026-02-03T04:05:06.000Z');

const FILE_CONTENT = 'fictional bench test record';
const SENSITIVE_CONTENT = 'this must never be bundled';

function sessionWithFiles(): AssessmentSession {
  let session = parseSession(FICTIONAL_EXAMPLE);
  const bench = addEvidence(session, {
    type: 'Test data',
    title: 'Bench record',
    marking: 'Internal (unrestricted)',
    verification: 'Verified',
    linkedCriteria: [],
    file: {
      name: 'bench record (final) *.txt',
      sizeBytes: FILE_CONTENT.length,
      sha256: 'x'.repeat(64),
      blobKey: 'blob:bench',
      mime: 'text/plain',
    },
  });
  session = linkEvidence(bench.session, bench.id, 'CTE-01', 'DOD-T2-L3-01');
  blobs.set('blob:bench', new Blob([FILE_CONTENT]));
  blobs.set('blob:sensitive', new Blob([SENSITIVE_CONTENT]));
  return session;
}

let zip: JSZip;
let rootName: string;
let manifest: string;
const session = sessionWithFiles();

beforeAll(async () => {
  const built = await buildEvidencePackage(framework, session, () => {}, generatedAt);
  rootName = built.rootName;
  manifest = built.manifest;
  zip = await JSZip.loadAsync(await blobToArrayBuffer(built.blob));
});

const entry = (path: string) => zip.file(`${rootName}/${path}`);

describe('evidence package — structure (D-4)', () => {
  it('has a single root folder named after the workbook', () => {
    expect(rootName).toMatch(/^TRL_Tier2_[a-z0-9-]+_\d{8}-\d{4}$/);
  });

  it('contains the workbook, session.json, the manifest and the README', () => {
    expect(entry(`${rootName}.xlsx`)).toBeTruthy();
    expect(entry('session.json')).toBeTruthy();
    expect(entry('MANIFEST.sha256.txt')).toBeTruthy();
    expect(entry('README.txt')).toBeTruthy();
  });

  it('bundles evidence files under evidence/ with sanitized <EV-ID>_<name> names', () => {
    const names = Object.keys(zip.files).filter(
      (n) => n.includes('/evidence/') && !zip.files[n]!.dir,
    );
    expect(names).toHaveLength(1);
    expect(names[0]).toMatch(/\/evidence\/EV-\d{4}_bench_record__final___\.txt$/);
  });

  it('never contains a path traversal or an absolute path', () => {
    for (const name of Object.keys(zip.files)) {
      expect(name).not.toContain('..');
      expect(name.startsWith('/')).toBe(false);
    }
  });

  it('sanitizes hostile file names', () => {
    expect(sanitizeFileName('../../etc/passwd')).toBe('passwd');
    expect(sanitizeFileName('/absolute/path.txt')).toBe('path.txt');
    expect(sanitizeFileName('..\\..\\windows\\system32\\cmd.exe')).toBe('cmd.exe');
    expect(sanitizeFileName('a'.repeat(200) + '.txt')).toHaveLength(80);
    expect(sanitizeFileName('....')).toBe('txt'.slice(0, 0) || 'file');
    expect(sanitizeFileName('résumé.pdf')).toBe('r_sum_.pdf');
  });

  it('prefixes bundled entries with the evidence id', () => {
    const item = session.tier2!.evidence.find((e) => e.file?.blobKey === 'blob:bench')!;
    expect(evidenceEntryName(item)).toBe(`${item.id}_bench_record__final___.txt`);
  });
});

describe('evidence package — manifest', () => {
  it('lists every file with its SHA-256', async () => {
    const lines = manifest.trim().split('\n');
    const files = Object.keys(zip.files).filter((n) => !zip.files[n]!.dir);
    // Every packaged file is hashed except the manifest itself.
    expect(lines.length).toBe(files.length - 1);
    for (const line of lines) {
      const [hash, path] = line.split('  ');
      expect(hash).toMatch(/^[0-9a-f]{64}$/);
      expect(entry(path!)).toBeTruthy();
    }
  });

  it('hashes match a recomputation of the packaged bytes', async () => {
    for (const line of manifest.trim().split('\n')) {
      const [hash, path] = line.split('  ');
      const bytes = await entry(path!)!.async('uint8array');
      expect(await sha256Hex(bytes), path).toBe(hash);
    }
  });

  it('is written in `sha256␣␣path` form for sha256sum -c', () => {
    for (const line of manifest.trim().split('\n')) {
      expect(line).toMatch(/^[0-9a-f]{64} {2}\S/);
    }
  });
});

describe('evidence package — workbook inside the package', () => {
  it('uses relative hyperlinks into evidence/ for bundled files', async () => {
    const buffer = await entry(`${rootName}.xlsx`)!.async('arraybuffer');
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    const ws = workbook.getWorksheet('Evidence_Register')!;

    let found = false;
    for (let r = 2; r <= ws.rowCount; r += 1) {
      const cell = ws.getCell(`G${r}`).value as { hyperlink?: string; text?: string } | null;
      if (cell?.hyperlink?.startsWith('evidence/')) {
        found = true;
        expect(entry(cell.hyperlink)).toBeTruthy();
      }
    }
    expect(found).toBe(true);
  });

  it('records packageType = zip in the metadata', async () => {
    const buffer = await entry(`${rootName}.xlsx`)!.async('arraybuffer');
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    const ws = workbook.getWorksheet('Metadata')!;
    const keys: string[] = [];
    const values: string[] = [];
    for (let r = 2; r <= ws.rowCount; r += 1) {
      keys.push(String(ws.getCell(`A${r}`).value ?? ''));
      values.push(String(ws.getCell(`B${r}`).value ?? ''));
    }
    expect(values[keys.indexOf('Package type')]).toBe('zip');
  });
});

describe('evidence package — sensitive evidence', () => {
  it('never bundles a sensitive item, even when a blob exists', async () => {
    const contents = await Promise.all(
      Object.keys(zip.files)
        .filter((n) => !zip.files[n]!.dir && n.endsWith('.txt'))
        .map((n) => zip.files[n]!.async('string')),
    );
    expect(contents.join('\n')).not.toContain(SENSITIVE_CONTENT);
  });

  it('still lists the sensitive item in the workbook as reference-only', async () => {
    const buffer = await entry(`${rootName}.xlsx`)!.async('arraybuffer');
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    const ws = workbook.getWorksheet('Evidence_Register')!;
    let seen = false;
    for (let r = 2; r <= ws.rowCount; r += 1) {
      if (String(ws.getCell(`Q${r}`).value ?? '') === 'Sensitive — reference only') {
        seen = true;
        expect(String(ws.getCell(`U${r}`).value ?? '')).toBe('No (reference only)');
        expect(String(ws.getCell(`G${r}`).value ?? '')).toBe('');
      }
    }
    expect(seen).toBe(true);
  });
});

describe('evidence package — README and preflight', () => {
  it('explains hash verification for Linux/macOS and Windows', async () => {
    const text = await entry('README.txt')!.async('string');
    expect(text).toContain('sha256sum -c MANIFEST.sha256.txt');
    expect(text).toContain('Get-FileHash');
    expect(text).toContain('Unzip the whole folder first');
  });

  it('reports the per-file sizes and the total', () => {
    const check = preflight(session);
    expect(check.items).toHaveLength(1);
    expect(check.totalBytes).toBe(FILE_CONTENT.length);
    expect(check.withinLimit).toBe(true);
  });

  it('refuses to build a package over the size limit, naming the largest files', async () => {
    const oversized = parseSession(FICTIONAL_EXAMPLE);
    const big = addEvidence(oversized, {
      type: 'Test data',
      title: 'Huge',
      marking: 'Public',
      verification: 'Unverified',
      linkedCriteria: [],
      file: {
        name: 'huge.bin',
        sizeBytes: (MAX_PACKAGE_TOTAL_MB + 1) * 1024 * 1024,
        sha256: 'y'.repeat(64),
        blobKey: 'blob:huge',
      },
    });
    const check = preflight(big.session);
    expect(check.withinLimit).toBe(false);
    expect(check.message).toContain('huge.bin');
    await expect(
      buildEvidencePackage(framework, big.session, () => {}, generatedAt),
    ).rejects.toThrow(/package limit/);
  });

  it('reports progress while building', async () => {
    const messages: string[] = [];
    await buildEvidencePackage(framework, session, (m) => messages.push(m), generatedAt);
    expect(messages.some((m) => m.includes('workbook'))).toBe(true);
    expect(messages.some((m) => m.includes('evidence'))).toBe(true);
    expect(messages.some((m) => m.includes('Compressing'))).toBe(true);
  });
});
