import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  addCte,
  addEvidence,
  clearArl,
  createSession,
  evidenceFor,
  linkEvidence,
  migrate,
  parseSession,
  removeCte,
  removeEvidence,
  reorderCtes,
  setAnswer,
  setArl,
  setArlCall,
  setArlDimension,
  setAssessment,
  setGapActions,
  setTier1,
  SessionVersionError,
  tier2Of,
  unlinkEvidence,
  updateCte,
  updateEvidence,
  MIGRATIONS,
} from '@/domain/session';
import { deserializeSession, serializeSession, SessionImportError, toExport } from '@/domain/json';
import { blobKeyFor, nextCteId, nextEvidenceId, placeholderEvidenceId } from '@/domain/ids';
import { sha256Hex, sha256OfBlob } from '@/domain/hash';
import { SCHEMA_VERSION } from '@/config/app.config';
import type { ArlData, EvidenceItem, Tier1Answers } from '@/domain/schemas';

const tier1: Tier1Answers = {
  context: {
    projectName: 'P',
    technologyName: 'T',
    assessorName: 'A',
    environment: 'E1',
    build: 'B1',
  },
  answers: {},
};

const baseEvidence: Omit<EvidenceItem, 'id'> = {
  type: 'Document',
  title: 'A report',
  marking: 'Public',
  verification: 'Unverified',
  linkedCriteria: [],
};

describe('id generators', () => {
  it('starts at EV-0001 and never reuses an id', () => {
    expect(nextEvidenceId([])).toBe('EV-0001');
    expect(nextEvidenceId(['EV-0001', 'EV-0002'])).toBe('EV-0003');
    expect(nextEvidenceId(['EV-0003', 'EV-0001'])).toBe('EV-0004');
  });
  it('keeps counting past a deleted id', () => {
    expect(nextEvidenceId(['EV-0001', 'EV-0009'])).toBe('EV-0010');
  });
  it('generates CTE ids', () => {
    expect(nextCteId([])).toBe('CTE-01');
    expect(nextCteId(['CTE-01', 'CTE-07'])).toBe('CTE-08');
  });
  it('ignores foreign ids', () => {
    expect(nextEvidenceId(['X-1', 'CTE-04'])).toBe('EV-0001');
  });
  it('generates placeholder ids and blob keys', () => {
    expect(placeholderEvidenceId(1)).toBe('EV-P001');
    expect(placeholderEvidenceId(50)).toBe('EV-P050');
    expect(blobKeyFor('EV-0007')).toBe('blob:EV-0007');
  });
});

describe('sha256', () => {
  it('hashes a known string', async () => {
    expect(await sha256Hex('abc')).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    );
  });
  it('hashes an empty input', async () => {
    expect(await sha256Hex('')).toBe(
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    );
  });
  it('hashes a Blob', async () => {
    expect(await sha256OfBlob(new Blob(['abc']))).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    );
  });
  it('hashes bytes', async () => {
    expect(await sha256Hex(new Uint8Array([97, 98, 99]))).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    );
  });
});

describe('session updates are immutable', () => {
  let session = createSession('marine-energy-eere', '1.0.0');
  beforeEach(() => {
    session = createSession('marine-energy-eere', '1.0.0');
  });

  it('creates a session with the current schema version', () => {
    expect(session.schemaVersion).toBe(SCHEMA_VERSION);
    expect(session.tier1).toBeUndefined();
    expect(tier2Of(session).ctes).toEqual([]);
  });

  it('does not mutate the input when setting Tier 1', () => {
    const next = setTier1(session, tier1);
    expect(session.tier1).toBeUndefined();
    expect(next.tier1?.context.projectName).toBe('P');
  });

  it('records an answer', () => {
    const next = setAnswer(setTier1(session, tier1), 'MEE-T1-L1', { value: 'Yes' });
    expect(next.tier1?.answers['MEE-T1-L1']?.value).toBe('Yes');
  });

  it('refuses to record an answer before the context exists', () => {
    expect(() => setAnswer(session, 'MEE-T1-L1', { value: 'Yes' })).toThrow(/context/);
  });

  it('adds, updates, reorders and removes CTEs', () => {
    let s = addCte(session, { name: 'First', critical: true });
    s = addCte(s, { name: 'Second', critical: false });
    expect(tier2Of(s).ctes.map((c) => c.id)).toEqual(['CTE-01', 'CTE-02']);

    s = updateCte(s, 'CTE-02', { critical: true, kind: 'software' });
    expect(tier2Of(s).ctes[1]?.critical).toBe(true);

    s = reorderCtes(s, ['CTE-02', 'CTE-01']);
    expect(tier2Of(s).ctes.map((c) => c.id)).toEqual(['CTE-02', 'CTE-01']);

    s = removeCte(s, 'CTE-01');
    expect(tier2Of(s).ctes.map((c) => c.id)).toEqual(['CTE-02']);
  });

  it('removes a CTE together with its assessments, gap actions and evidence links', () => {
    let s = addCte(session, { name: 'First', critical: true });
    s = setAssessment(s, { cteId: 'CTE-01', criterionId: 'X', status: 'Met' });
    s = setGapActions(s, [{ cteId: 'CTE-01', nextLevel: 2, action: 'do a thing' }]);
    const added = addEvidence(s, baseEvidence);
    s = linkEvidence(added.session, added.id, 'CTE-01', 'X');
    expect(evidenceFor(s, 'CTE-01', 'X')).toHaveLength(1);

    s = removeCte(s, 'CTE-01');
    expect(tier2Of(s).assessments).toHaveLength(0);
    expect(tier2Of(s).gapActions).toHaveLength(0);
    expect(tier2Of(s).evidence[0]?.linkedCriteria).toHaveLength(0);
  });

  it('replaces an existing assessment instead of duplicating it', () => {
    let s = setAssessment(session, { cteId: 'CTE-01', criterionId: 'X', status: 'Met' });
    s = setAssessment(s, { cteId: 'CTE-01', criterionId: 'X', status: 'Not met' });
    expect(tier2Of(s).assessments).toHaveLength(1);
    expect(tier2Of(s).assessments[0]?.status).toBe('Not met');
  });

  it('adds, updates and removes evidence', () => {
    const first = addEvidence(session, baseEvidence);
    expect(first.id).toBe('EV-0001');
    const second = addEvidence(first.session, { ...baseEvidence, title: 'Another' });
    expect(second.id).toBe('EV-0002');

    let s = updateEvidence(second.session, 'EV-0001', { verification: 'Verified' });
    expect(tier2Of(s).evidence[0]?.verification).toBe('Verified');

    s = removeEvidence(s, 'EV-0001');
    expect(tier2Of(s).evidence.map((e) => e.id)).toEqual(['EV-0002']);
  });

  it('links and unlinks evidence without duplicating links', () => {
    const added = addEvidence(session, baseEvidence);
    let s = linkEvidence(added.session, added.id, 'CTE-01', 'X');
    s = linkEvidence(s, added.id, 'CTE-01', 'X');
    expect(tier2Of(s).evidence[0]?.linkedCriteria).toHaveLength(1);
    s = unlinkEvidence(s, added.id, 'CTE-01', 'X');
    expect(tier2Of(s).evidence[0]?.linkedCriteria).toHaveLength(0);
  });

  it('bumps updatedAt on every change', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
    const start = createSession('marine-energy-eere', '1.0.0');
    vi.setSystemTime(new Date('2026-01-01T00:05:00Z'));
    const next = addCte(start, { name: 'x', critical: true });
    expect(next.updatedAt).not.toBe(start.updatedAt);
    expect(next.createdAt).toBe(start.createdAt);
    vi.useRealTimers();
  });
});

describe('JSON round-trip', () => {
  it('is lossless', () => {
    let s = setTier1(createSession('marine-energy-eere', '1.0.0'), tier1);
    s = setAnswer(s, 'MEE-T1-L1', { value: 'Yes', note: 'a note' });
    s = addCte(s, { name: 'Harvester', critical: true, kind: 'hardware', targetTrl: 6 });
    s = setAssessment(s, { cteId: 'CTE-01', criterionId: 'MEE-T2-L1-01', status: 'Met' });
    const added = addEvidence(s, { ...baseEvidence, url: 'https://example.org/a' });
    s = linkEvidence(added.session, added.id, 'CTE-01', 'MEE-T2-L1-01');

    const restored = deserializeSession(serializeSession(s)).session;
    expect(restored).toEqual(s);
  });

  it('accepts a bare session as well as a wrapped export', () => {
    const s = createSession('marine-energy-eere', '1.0.0');
    expect(deserializeSession(JSON.stringify(s)).session).toEqual(s);
  });

  it('records app version, git SHA and framework in the export envelope', () => {
    const envelope = toExport(createSession('marine-energy-eere', '1.0.0'));
    expect(envelope.appVersion).toBeTruthy();
    expect(envelope.gitSha).toBeTruthy();
    expect(envelope.schemaVersion).toBe(SCHEMA_VERSION);
    expect(envelope.session.frameworkId).toBe('marine-energy-eere');
  });

  it('warns about an app-version mismatch', () => {
    const s = { ...createSession('marine-energy-eere', '1.0.0'), appVersion: '0.0.1-old' };
    const result = deserializeSession(JSON.stringify(s));
    expect(result.warnings.join(' ')).toContain('0.0.1-old');
  });

  it('rejects malformed JSON', () => {
    expect(() => deserializeSession('{not json')).toThrow(SessionImportError);
  });

  it('rejects a file that is not a session', () => {
    expect(() => deserializeSession('{"hello":"world"}')).toThrow(SessionImportError);
  });

  it('reports a newer schema version clearly', () => {
    const s = { ...createSession('marine-energy-eere', '1.0.0'), schemaVersion: 99 };
    expect(() => deserializeSession(JSON.stringify(s))).toThrow(/newer version/);
  });

  it('reports an older, unmigratable schema version clearly', () => {
    const s = { ...createSession('marine-energy-eere', '1.0.0'), schemaVersion: 0 };
    expect(() => deserializeSession(JSON.stringify(s))).toThrow(/cannot\s+upgrade/);
  });
});

describe('migrations', () => {
  it('passes a current-version session through untouched', () => {
    const s = createSession('marine-energy-eere', '1.0.0');
    expect(migrate(s)).toEqual(s);
  });

  it('runs a registered migration step', () => {
    const original = { ...MIGRATIONS };
    try {
      (MIGRATIONS as Record<number, (i: unknown) => unknown>)[0] = (input) => ({
        ...(input as object),
        schemaVersion: SCHEMA_VERSION,
        migrated: true,
      });
      const result = migrate({ schemaVersion: 0 }) as { migrated?: boolean };
      expect(result.migrated).toBe(true);
    } finally {
      for (const key of Object.keys(MIGRATIONS)) delete MIGRATIONS[Number(key)];
      Object.assign(MIGRATIONS, original);
    }
  });

  it('throws SessionVersionError with the versions attached', () => {
    try {
      migrate({ schemaVersion: 99 });
      expect.unreachable();
    } catch (e) {
      expect(e).toBeInstanceOf(SessionVersionError);
      expect((e as SessionVersionError).found).toBe(99);
      expect((e as SessionVersionError).expected).toBe(SCHEMA_VERSION);
    }
  });
});

describe('ARL side module in the session', () => {
  const arl: ArlData = {
    frameworkId: 'doe-otc-arl-2025',
    frameworkVersion: 'April 2025',
    context: { projectName: 'P', technologyName: 'T', assessorName: 'A' },
    dimensions: [],
  };

  it('stores the ARL block without touching the TRL tiers', () => {
    const base = setTier1(createSession('marine-energy-eere', '1.0.0'), tier1);
    const s = setArl(base, arl);
    expect(s.arl).toEqual(arl);
    expect(s.tier1).toBe(base.tier1);
    expect(base.arl).toBeUndefined();
  });

  it('refuses a rating before the ARL scope exists', () => {
    const s = createSession('marine-energy-eere', '1.0.0');
    expect(() => setArlDimension(s, { dimensionId: 'ARL-A1', current: 'Low' })).toThrow(/scope/);
    expect(() => setArlCall(s, { profileId: 'doe-tcf-climr-fy2627' })).toThrow(/scope/);
  });

  it('adds a rating, then merges later edits into it', () => {
    let s = setArl(createSession('marine-energy-eere', '1.0.0'), arl);
    s = setArlDimension(s, { dimensionId: 'ARL-A1', rationale: 'no data yet' });
    expect(s.arl!.dimensions).toEqual([
      { dimensionId: 'ARL-A1', current: 'Not assessed', rationale: 'no data yet' },
    ]);
    s = setArlDimension(s, { dimensionId: 'ARL-A1', current: 'Medium', target: 'Low' });
    expect(s.arl!.dimensions[0]).toEqual({
      dimensionId: 'ARL-A1',
      current: 'Medium',
      target: 'Low',
      rationale: 'no data yet',
    });
    s = setArlDimension(s, { dimensionId: 'ARL-A2', current: 'High' });
    expect(s.arl!.dimensions.map((d) => d.dimensionId)).toEqual(['ARL-A1', 'ARL-A2']);
  });

  it('drops the target when it is set back to "same as current"', () => {
    let s = setArl(createSession('marine-energy-eere', '1.0.0'), arl);
    s = setArlDimension(s, { dimensionId: 'ARL-A1', current: 'High', target: 'Low' });
    s = setArlDimension(s, { dimensionId: 'ARL-A1', target: undefined });
    expect(s.arl!.dimensions[0]).toEqual({ dimensionId: 'ARL-A1', current: 'High' });
    expect('target' in s.arl!.dimensions[0]!).toBe(false);
  });

  it('sets and clears the call profile', () => {
    let s = setArl(createSession('marine-energy-eere', '1.0.0'), arl);
    s = setArlCall(s, { profileId: 'doe-tcf-climr-fy2627', topicId: 'NE', trlEnd: 6 });
    expect(s.arl!.call).toEqual({ profileId: 'doe-tcf-climr-fy2627', topicId: 'NE', trlEnd: 6 });
    s = setArlCall(s, undefined);
    expect(s.arl!.call).toBeUndefined();
    expect('call' in s.arl!).toBe(false);
  });

  it('clears the ARL block only', () => {
    const withTier1 = setTier1(createSession('marine-energy-eere', '1.0.0'), tier1);
    const s = clearArl(setArl(withTier1, arl));
    expect(s.arl).toBeUndefined();
    expect(s.tier1).toEqual(withTier1.tier1);
  });

  it('round-trips through JSON', () => {
    let s = setArl(createSession('marine-energy-eere', '1.0.0'), arl);
    s = setArlDimension(s, {
      dimensionId: 'ARL-D5',
      current: 'N/A',
      rationale: 'not public-facing',
    });
    const back = deserializeSession(serializeSession(s)).session;
    expect(back.arl).toEqual(s.arl);
  });

  it('upgrades a v1 session to v2 unchanged apart from the version', () => {
    const v1 = { ...createSession('marine-energy-eere', '1.0.0'), schemaVersion: 1 };
    const upgraded = parseSession(v1);
    expect(upgraded.schemaVersion).toBe(2);
    expect(upgraded.arl).toBeUndefined();
    expect(MIGRATIONS[1]!({ schemaVersion: 1, x: 1 })).toEqual({ schemaVersion: 2, x: 1 });
  });
});

describe('schema guards', () => {
  it('refuses evidence marked sensitive that carries a file', () => {
    const s = {
      ...createSession('marine-energy-eere', '1.0.0'),
      tier2: {
        ctes: [],
        assessments: [],
        gapActions: [],
        evidence: [
          {
            id: 'EV-0001',
            type: 'Document',
            title: 'x',
            marking: 'Sensitive — reference only',
            verification: 'Unverified',
            linkedCriteria: [],
            file: {
              name: 'a.pdf',
              sizeBytes: 1,
              sha256: 'a'.repeat(64),
              blobKey: 'blob:EV-0001',
            },
          },
        ],
      },
    };
    expect(() => parseSession(s)).toThrow();
  });

  it('refuses a non-http evidence URL', () => {
    const s = {
      ...createSession('marine-energy-eere', '1.0.0'),
      tier2: {
        ctes: [],
        assessments: [],
        gapActions: [],
        evidence: [
          {
            id: 'EV-0001',
            type: 'Web link',
            title: 'x',
            url: 'javascript:alert(1)',
            marking: 'Public',
            verification: 'Unverified',
            linkedCriteria: [],
          },
        ],
      },
    };
    expect(() => parseSession(s)).toThrow();
  });
});

describe('sha256 works with values from other realms', () => {
  it('hashes a jsdom FileReader ArrayBuffer (the evidence-file path)', async () => {
    const { blobToArrayBuffer } = await import('@/domain/hash');
    const blob = new Blob(['abc']);
    // Force the FileReader branch, which is what browsers without Blob.arrayBuffer use.
    const original = Object.getOwnPropertyDescriptor(Blob.prototype, 'arrayBuffer');
    Object.defineProperty(Blob.prototype, 'arrayBuffer', { value: undefined, configurable: true });
    try {
      const buffer = await blobToArrayBuffer(blob);
      expect(await sha256Hex(buffer)).toBe(
        'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
      );
    } finally {
      if (original) Object.defineProperty(Blob.prototype, 'arrayBuffer', original);
      else delete (Blob.prototype as { arrayBuffer?: unknown }).arrayBuffer;
    }
  });

  it('hashes a DataView and a subarray view without copying the wrong bytes', async () => {
    const full = new Uint8Array([0, 0, 97, 98, 99, 0]);
    const view = full.subarray(2, 5); // "abc"
    expect(await sha256Hex(view)).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    );
  });
});
