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
    expect(session.frameworkId).toBe('marine-energy-eere');
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

  it('demonstrates the "Met without evidence does not count" rule', () => {
    const t2 = scoreTier2(framework, session.tier2!);
    const cte02 = t2.ctes.find((c) => c.cte.id === 'CTE-02')!;
    const l4 = cte02.levels.find((l) => l.level === 4)!;
    expect(l4.achieved).toBe(false);
    // "Met" with a Web link counts; the blocker at L4 is the tailored FMECA criterion.
    expect(l4.mandatoryUnmet.map((o) => o.criterion.id)).toContain('MEE-T2-L4-T01');
  });

  it('demonstrates an N/A with justification counting as satisfied', () => {
    const t2 = scoreTier2(framework, session.tier2!);
    const cte03 = t2.ctes.find((c) => c.cte.id === 'CTE-03')!;
    const l4 = cte03.levels.find((l) => l.level === 4)!;
    const na = l4.applicable.find((o) => o.criterion.id === 'MEE-T2-L4-T01')!;
    expect(na.status).toBe('N/A');
    expect(na.satisfied).toBe(true);
  });

  it('includes a sensitive, reference-only evidence item with no file', () => {
    const sensitive = session.tier2?.evidence.find(
      (e) => e.marking === 'Sensitive — reference only',
    );
    expect(sensitive).toBeDefined();
    expect(sensitive?.file).toBeUndefined();
  });
});
