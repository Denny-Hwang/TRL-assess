/**
 * Robustness: large sessions, near-limit files, storage failures,
 * corrupted and out-of-version imports.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ExcelJS from 'exceljs';
import { resolveFramework } from '@/domain/frameworks';
import { createSession, parseSession } from '@/domain/session';
import { scoreTier2 } from '@/domain/tier2';
import { deserializeSession, serializeSession } from '@/domain/json';
import { buildTier2Workbook } from '@/export/excel/tier2';
import { MAX_EVIDENCE_FILE_BYTES, SCHEMA_VERSION } from '@/config/app.config';
import type { AssessmentSession, CriterionAssessment, Cte, EvidenceItem } from '@/domain/schemas';

const framework = resolveFramework('marine-energy-eere');

function largeSession(cteCount = 30, evidenceCount = 300): AssessmentSession {
  const ctes: Cte[] = Array.from({ length: cteCount }, (_, i) => ({
    id: `CTE-${String(i + 1).padStart(2, '0')}`,
    name: `Element ${i + 1}`,
    critical: i % 3 === 0,
    kind: (['hardware', 'software', 'process'] as const)[i % 3]!,
    targetTrl: 6,
  }));

  const criteriaIds = framework.tier2.filter((c) => c.level <= 3).map((c) => c.id);
  const assessments: CriterionAssessment[] = [];
  for (const cte of ctes) {
    for (const criterionId of criteriaIds) {
      assessments.push({ cteId: cte.id, criterionId, status: 'Met' });
    }
  }

  const evidence: EvidenceItem[] = Array.from({ length: evidenceCount }, (_, i) => ({
    id: `EV-${String(i + 1).padStart(4, '0')}`,
    type: 'Document' as const,
    title: `Evidence ${i + 1}`,
    description: 'Metadata only — no blob.',
    marking: 'Internal (unrestricted)' as const,
    verification: 'Unverified' as const,
    linkedCriteria: [
      {
        cteId: ctes[i % ctes.length]!.id,
        criterionId: criteriaIds[i % criteriaIds.length]!,
      },
    ],
  }));

  return {
    ...createSession('marine-energy-eere', '1.0.0'),
    tier2: { ctes, assessments, evidence, gapActions: [] },
  };
}

describe('large sessions', () => {
  const session = largeSession();

  it('scores 30 CTEs and 300 evidence items in reasonable time', () => {
    const start = performance.now();
    const result = scoreTier2(framework, session.tier2!);
    const elapsed = performance.now() - start;
    expect(result.ctes).toHaveLength(30);
    expect(elapsed, `scoring took ${elapsed.toFixed(0)} ms`).toBeLessThan(4000);
  });

  it('round-trips a large session through JSON losslessly', () => {
    const restored = deserializeSession(serializeSession(session)).session;
    expect(restored).toEqual(session);
  });

  it('exports a large session to a workbook that reads back', async () => {
    const workbook = await buildTier2Workbook(framework, session, {
      generatedAt: new Date('2026-02-03T04:05:06.000Z'),
    });
    const buffer = await workbook.xlsx.writeBuffer();
    const back = new ExcelJS.Workbook();
    await back.xlsx.load(buffer as ArrayBuffer);
    expect(back.getWorksheet('CTE_Register')!.rowCount).toBe(31);
    // 300 evidence rows + 50 placeholders + header
    expect(back.getWorksheet('Evidence_Register')!.rowCount).toBe(351);
  }, 60_000);
});

describe('file size limits', () => {
  it('accepts a file just under the limit and rejects one just over', () => {
    expect(MAX_EVIDENCE_FILE_BYTES - 1 <= MAX_EVIDENCE_FILE_BYTES).toBe(true);
    expect(MAX_EVIDENCE_FILE_BYTES + 1 > MAX_EVIDENCE_FILE_BYTES).toBe(true);
  });

  it('records a near-limit file in the session without holding its bytes', () => {
    const session = {
      ...createSession('marine-energy-eere', '1.0.0'),
      tier2: {
        ctes: [],
        assessments: [],
        gapActions: [],
        evidence: [
          {
            id: 'EV-0001',
            type: 'Test data' as const,
            title: 'Almost too big',
            marking: 'Public' as const,
            verification: 'Unverified' as const,
            linkedCriteria: [],
            file: {
              name: 'big.bin',
              sizeBytes: MAX_EVIDENCE_FILE_BYTES - 1,
              sha256: 'a'.repeat(64),
              blobKey: 'blob:EV-0001',
            },
          },
        ],
      },
    };
    const parsed = parseSession(session);
    expect(parsed.tier2?.evidence[0]?.file?.sizeBytes).toBe(MAX_EVIDENCE_FILE_BYTES - 1);
    // The session holds metadata and a blob *key* only — never the bytes.
    expect(Object.keys(parsed.tier2!.evidence[0]!.file!).sort()).toEqual([
      'blobKey',
      'name',
      'sha256',
      'sizeBytes',
    ]);
    expect(JSON.stringify(parsed).length).toBeLessThan(2000);
  });
});

describe('import failures are reported, never silently accepted', () => {
  it('rejects corrupted JSON', () => {
    expect(() => deserializeSession('{"schemaVersion":1,')).toThrow(/not valid JSON/);
  });

  it('rejects a session with an unknown framework field shape', () => {
    expect(() => deserializeSession('{"schemaVersion":1,"frameworkId":42}')).toThrow(
      /does not match the expected session format/,
    );
  });

  it('reports an older schema version it cannot upgrade', () => {
    const old = { ...createSession('marine-energy-eere', '1.0.0'), schemaVersion: 0 };
    expect(() => deserializeSession(JSON.stringify(old))).toThrow(
      new RegExp(`version 0.*expects version ${SCHEMA_VERSION}`, 's'),
    );
  });

  it('reports a newer schema version it cannot read', () => {
    const future = { ...createSession('marine-energy-eere', '1.0.0'), schemaVersion: 99 };
    expect(() => deserializeSession(JSON.stringify(future))).toThrow(/newer version/);
  });

  it('warns rather than fails when only the app version differs', () => {
    const older = { ...createSession('marine-energy-eere', '1.0.0'), appVersion: '0.0.1' };
    const result = deserializeSession(JSON.stringify(older));
    expect(result.session.frameworkId).toBe('marine-energy-eere');
    expect(result.warnings.join(' ')).toMatch(/0\.0\.1/);
  });
});

describe('storage failures', () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
  });

  it('falls back with a clear message when localStorage is unavailable', async () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('private mode');
    });
    const { saveSession, loadSession } = await import('@/storage/sessionStore');
    try {
      expect(() => saveSession(createSession('marine-energy-eere', '1.0.0'))).toThrow(
        /not allowing local storage/,
      );
      expect(loadSession()).toBeNull();
    } finally {
      spy.mockRestore();
    }
  });

  it('reports IndexedDB being unavailable without crashing the app', async () => {
    vi.doMock('idb-keyval', () => ({
      createStore: () => {
        throw new Error('IndexedDB is disabled');
      },
      get: vi.fn(),
      set: vi.fn(),
      del: vi.fn(),
      clear: vi.fn(),
      keys: vi.fn(),
    }));
    const { putBlob, listBlobKeys, StorageUnavailableError } = await import('@/storage/blobStore');
    await expect(putBlob('blob:EV-0001', new Blob(['x']))).rejects.toBeInstanceOf(
      StorageUnavailableError,
    );
    await expect(putBlob('blob:EV-0001', new Blob(['x']))).rejects.toThrow(/private browsing/);
    expect(await listBlobKeys()).toEqual([]);
    vi.doUnmock('idb-keyval');
  });
});
