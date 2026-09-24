import { describe, it, expect } from 'vitest';
import { FICTIONAL_EXAMPLE } from '@/data/examples';
import { parseSession } from '@/domain/session';
import { resolveFramework } from '@/domain/frameworks';
import { scoreTier1 } from '@/domain/tier1';
import { scoreTier2, tierDelta } from '@/domain/tier2';

describe('fictional example session', () => {
  const session = parseSession(FICTIONAL_EXAMPLE);
  const framework = resolveFramework(session.frameworkId);

  it('validates against the session schema', () => {
    expect(session.frameworkId).toBe('dod-tra-2025');
    expect(session.tier1).toBeDefined();
    expect(session.tier2?.ctes).toHaveLength(3);
  });

  it('references only criterion ids that exist in the framework', () => {
    const ids = new Set(framework.tier2.map((c) => c.id));
    for (const a of session.tier2?.assessments ?? []) expect(ids.has(a.criterionId)).toBe(true);
    for (const e of session.tier2?.evidence ?? []) {
      for (const link of e.linkedCriteria) expect(ids.has(link.criterionId)).toBe(true);
    }
  });

  it('references only CTE ids that exist', () => {
    const cteIds = new Set(session.tier2?.ctes.map((c) => c.id));
    for (const a of session.tier2?.assessments ?? []) expect(cteIds.has(a.cteId)).toBe(true);
    for (const e of session.tier2?.evidence ?? []) {
      for (const link of e.linkedCriteria) expect(cteIds.has(link.cteId)).toBe(true);
    }
  });

  it('contains no attached files (blobs are never committed)', () => {
    for (const e of session.tier2?.evidence ?? []) expect(e.file).toBeUndefined();
  });

  it('uses only example.org / fictional DOIs', () => {
    for (const e of session.tier2?.evidence ?? []) {
      if (e.url) expect(e.url).toMatch(/^https:\/\/example\.org\//);
      if (e.repoUrl) expect(e.repoUrl).toMatch(/^https:\/\/example\.org\//);
      if (e.doi) expect(e.doi).toMatch(/^10\.5555\/fictional\./);
    }
  });

  it('scores as documented: Tier 1 contiguous TRL 4, Tier 2 system TRL 3', () => {
    const t1 = scoreTier1(framework, session.tier1!);
    expect(t1.contiguousTrl).toBe(4);
    expect(t1.firstYesTrl).toBe(4);
    expect(t1.matrixTrl).toBe(5);
    expect(t1.consistency).toBe('High');

    const t2 = scoreTier2(framework, session.tier2!);
    expect(t2.system.computed).toBe(true);
    expect(t2.system.trl).toBe(3);
    expect(t2.system.limitingCteIds.sort()).toEqual(['CTE-02', 'CTE-03']);
    expect(t2.ctes.find((c) => c.cte.id === 'CTE-01')?.trl).toBe(4);

    const delta = tierDelta(t2.system, t1.contiguousTrl);
    expect(delta.delta).toBe(-1);
    expect(delta.significant).toBe(false);
  });

  it('demonstrates the "Met without usable evidence does not count" rule', () => {
    const t2 = scoreTier2(framework, session.tier2!);
    const cte02 = t2.ctes.find((c) => c.cte.id === 'CTE-02')!;
    const l4 = cte02.levels.find((l) => l.level === 4)!;
    expect(l4.achieved).toBe(false);
    // The source designates no mandatory criteria, so a level needs one satisfied criterion.
    expect(l4.noMandatoryCriteria).toBe(true);
    expect(l4.applicable.some((o) => o.satisfied)).toBe(false);
    // "Met", but the only linked evidence is Rejected, so it does not count.
    const met = l4.applicable.find((o) => o.criterion.id === 'DOD-T2-L4-01')!;
    expect(met.status).toBe('Met');
    expect(met.satisfied).toBe(false);
    expect(met.evidenceIds).toEqual([]);
    expect(met.warning).toMatch(/no evidence is linked/);
    const linked = session.tier2!.evidence.filter((e) =>
      e.linkedCriteria.some((l) => l.cteId === 'CTE-02' && l.criterionId === 'DOD-T2-L4-01'),
    );
    expect(linked.map((e) => e.verification)).toEqual(['Rejected']);
  });

  it('demonstrates an N/A with justification counting as satisfied', () => {
    const t2 = scoreTier2(framework, session.tier2!);
    const cte03 = t2.ctes.find((c) => c.cte.id === 'CTE-03')!;
    const l2 = cte03.levels.find((l) => l.level === 2)!;
    const na = l2.applicable.find((o) => o.criterion.id === 'DOD-T2-SW-L2-03')!;
    expect(na.status).toBe('N/A');
    expect(na.satisfied).toBe(true);
    expect(na.justification).toBeTruthy();
  });

  it('includes a sensitive, reference-only evidence item with no file', () => {
    const sensitive = session.tier2?.evidence.find(
      (e) => e.marking === 'Sensitive — reference only',
    );
    expect(sensitive).toBeDefined();
    expect(sensitive?.file).toBeUndefined();
  });
});
