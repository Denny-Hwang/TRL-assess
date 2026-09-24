/**
 * Tier 2 scoring — every rule has a named test.
 */
import { describe, it, expect } from 'vitest';
import type { ResolvedFramework } from '@/domain/frameworks';
import { resolveFramework } from '@/domain/frameworks';
import {
  NO_CRITICAL_CTE_MESSAGE,
  NO_MANDATORY_FLAG,
  allGaps,
  evaluateCriterion,
  evaluateCte,
  isApplicable,
  scoreTier2,
  systemSummary,
  tierDelta,
} from '@/domain/tier2';
import { TIER2_LABEL } from '@/config/app.config';
import type {
  CriterionAssessment,
  Cte,
  EvidenceItem,
  Tier2Criterion,
  TrlLevel,
} from '@/domain/schemas';

const SRC = { sourceId: 'dod-tra-2025', page: '6' };

function criterion(
  id: string,
  level: TrlLevel,
  opts: Partial<Tier2Criterion> = {},
): Tier2Criterion {
  return {
    id,
    level,
    text: `criterion ${id}`,
    mandatory: true,
    source: SRC,
    origin: 'verbatim',
    ...opts,
  };
}

function cte(id = 'CTE-01', opts: Partial<Cte> = {}): Cte {
  return { id, name: `CTE ${id}`, critical: true, ...opts };
}

function evidence(
  id: string,
  links: Array<[string, string]>,
  opts: Partial<EvidenceItem> = {},
): EvidenceItem {
  return {
    id,
    type: 'Document',
    title: `evidence ${id}`,
    marking: 'Public',
    verification: 'Unverified',
    linkedCriteria: links.map(([cteId, criterionId]) => ({ cteId, criterionId })),
    ...opts,
  };
}

function fw(criteria: Tier2Criterion[]): ResolvedFramework {
  const base = resolveFramework('dod-tra-2025');
  return { ...base, tier2: criteria };
}

const assess = (
  cteId: string,
  criterionId: string,
  status: CriterionAssessment['status'],
  extra: Partial<CriterionAssessment> = {},
): CriterionAssessment => ({ cteId, criterionId, status, ...extra });

describe('R2-1 applicability', () => {
  it('applies when appliesTo is absent', () => {
    expect(isApplicable(criterion('C1', 1), cte('CTE-01', { kind: 'software' }))).toBe(true);
  });
  it('applies when appliesTo includes the CTE kind', () => {
    const c = criterion('C1', 1, { appliesTo: ['software'] });
    expect(isApplicable(c, cte('CTE-01', { kind: 'software' }))).toBe(true);
    expect(isApplicable(c, cte('CTE-01', { kind: 'hardware' }))).toBe(false);
  });
  it('applies when the CTE has no kind set', () => {
    const c = criterion('C1', 1, { appliesTo: ['software'] });
    expect(isApplicable(c, cte('CTE-01'))).toBe(true);
  });
});

describe('R2-2 satisfaction', () => {
  const c = criterion('C1', 1);
  it('Met with non-rejected evidence is satisfied', () => {
    const out = evaluateCriterion(c, cte(), assess('CTE-01', 'C1', 'Met'), [
      evidence('EV-0001', [['CTE-01', 'C1']]),
    ]);
    expect(out.satisfied).toBe(true);
  });
  it('Met with only rejected evidence is not satisfied', () => {
    const out = evaluateCriterion(c, cte(), assess('CTE-01', 'C1', 'Met'), [
      evidence('EV-0001', [['CTE-01', 'C1']], { verification: 'Rejected' }),
    ]);
    expect(out.satisfied).toBe(false);
    expect(out.missingEvidence).toBe(true);
  });
  it('Met with evidence linked to another CTE is not satisfied', () => {
    const out = evaluateCriterion(c, cte(), assess('CTE-01', 'C1', 'Met'), [
      evidence('EV-0001', [['CTE-02', 'C1']]),
    ]);
    expect(out.satisfied).toBe(false);
  });
  it('N/A with a justification is satisfied', () => {
    const out = evaluateCriterion(
      c,
      cte(),
      assess('CTE-01', 'C1', 'N/A', { justification: 'not applicable because …' }),
      [],
    );
    expect(out.satisfied).toBe(true);
  });
  it('N/A without a justification is not satisfied', () => {
    const out = evaluateCriterion(c, cte(), assess('CTE-01', 'C1', 'N/A'), []);
    expect(out.satisfied).toBe(false);
    expect(out.warning).toContain('justification');
  });
  it('N/A with a blank justification is not satisfied', () => {
    const out = evaluateCriterion(
      c,
      cte(),
      assess('CTE-01', 'C1', 'N/A', { justification: '   ' }),
      [],
    );
    expect(out.satisfied).toBe(false);
  });
  it.each(['Partially met', 'Not met', 'Not assessed'] as const)(
    '%s is never satisfied',
    (status) => {
      const out = evaluateCriterion(c, cte(), assess('CTE-01', 'C1', status), [
        evidence('EV-0001', [['CTE-01', 'C1']]),
      ]);
      expect(out.satisfied).toBe(false);
    },
  );
  it('treats a missing assessment as Not assessed', () => {
    const out = evaluateCriterion(c, cte(), undefined, []);
    expect(out.status).toBe('Not assessed');
    expect(out.satisfied).toBe(false);
  });
});

describe('R2-3 evidence requirement', () => {
  it('mandatory Met without evidence is not satisfied and is flagged', () => {
    const out = evaluateCriterion(criterion('C1', 1), cte(), assess('CTE-01', 'C1', 'Met'), []);
    expect(out.satisfied).toBe(false);
    expect(out.missingEvidence).toBe(true);
    expect(out.warning).toContain('not satisfied without evidence');
  });
  it('optional Met without evidence warns but does not count', () => {
    const out = evaluateCriterion(
      criterion('C1', 1, { mandatory: false }),
      cte(),
      assess('CTE-01', 'C1', 'Met'),
      [],
    );
    expect(out.satisfied).toBe(false);
    expect(out.missingEvidence).toBe(false);
    expect(out.warning).toContain('does not count towards completeness');
  });
});

describe('R2-4 level achievement', () => {
  it('requires every applicable mandatory criterion at the level', () => {
    const framework = fw([criterion('C1', 1), criterion('C2', 1)]);
    const result = evaluateCte(
      framework,
      cte(),
      [assess('CTE-01', 'C1', 'Met')],
      [evidence('EV-0001', [['CTE-01', 'C1']])],
    );
    expect(result.levels.find((l) => l.level === 1)?.achieved).toBe(false);
  });

  it('requires the level below to be achieved (contiguity)', () => {
    const framework = fw([criterion('C1', 1), criterion('C2', 2)]);
    const result = evaluateCte(
      framework,
      cte(),
      [assess('CTE-01', 'C2', 'Met')],
      [evidence('EV-0001', [['CTE-01', 'C2']])],
    );
    const l2 = result.levels.find((l) => l.level === 2)!;
    expect(l2.achieved).toBe(false);
    expect(l2.locked).toBe(true);
    expect(result.trl).toBe(0);
  });

  it('ignores criteria that do not apply to the CTE kind', () => {
    const framework = fw([
      criterion('C1', 1, { appliesTo: ['hardware'] }),
      criterion('C2', 1, { appliesTo: ['software'] }),
    ]);
    const result = evaluateCte(
      framework,
      cte('CTE-01', { kind: 'software' }),
      [assess('CTE-01', 'C2', 'Met')],
      [evidence('EV-0001', [['CTE-01', 'C2']])],
    );
    expect(result.levels.find((l) => l.level === 1)?.achieved).toBe(true);
  });

  it('with zero mandatory criteria: achieved only if one applicable criterion is satisfied, and flagged', () => {
    const framework = fw([criterion('C1', 1, { mandatory: false })]);
    const unsatisfied = evaluateCte(framework, cte(), [], []);
    const l1u = unsatisfied.levels.find((l) => l.level === 1)!;
    expect(l1u.noMandatoryCriteria).toBe(true);
    expect(l1u.flag).toBe(NO_MANDATORY_FLAG);
    expect(l1u.achieved).toBe(false);

    const satisfied = evaluateCte(
      framework,
      cte(),
      [assess('CTE-01', 'C1', 'Met')],
      [evidence('EV-0001', [['CTE-01', 'C1']])],
    );
    const l1s = satisfied.levels.find((l) => l.level === 1)!;
    expect(l1s.achieved).toBe(true);
    expect(l1s.flag).toBe(NO_MANDATORY_FLAG);
  });

  it('treats a level with no applicable criteria at all as not achieved', () => {
    const framework = fw([criterion('C1', 1, { appliesTo: ['hardware'] })]);
    const result = evaluateCte(framework, cte('CTE-01', { kind: 'software' }), [], []);
    expect(result.levels.find((l) => l.level === 1)?.achieved).toBe(false);
  });

  it('treats an all-N/A level as achieved when every N/A is justified', () => {
    const framework = fw([criterion('C1', 1), criterion('C2', 1)]);
    const result = evaluateCte(
      framework,
      cte(),
      [
        assess('CTE-01', 'C1', 'N/A', { justification: 'n/a 1' }),
        assess('CTE-01', 'C2', 'N/A', { justification: 'n/a 2' }),
      ],
      [],
    );
    expect(result.levels.find((l) => l.level === 1)?.achieved).toBe(true);
  });
});

describe('R2-5 CTE TRL', () => {
  it('is the highest achieved level', () => {
    const framework = fw([criterion('C1', 1), criterion('C2', 2), criterion('C3', 3)]);
    const result = evaluateCte(
      framework,
      cte(),
      [assess('CTE-01', 'C1', 'Met'), assess('CTE-01', 'C2', 'Met')],
      [
        evidence('EV-0001', [
          ['CTE-01', 'C1'],
          ['CTE-01', 'C2'],
        ]),
      ],
    );
    expect(result.trl).toBe(2);
  });
  it('is 0 ("< TRL 1") when nothing is achieved', () => {
    const framework = fw([criterion('C1', 1)]);
    expect(evaluateCte(framework, cte(), [], []).trl).toBe(0);
  });
});

describe('R2-6 next-level completeness', () => {
  it('is satisfied ÷ applicable, excluding N/A criteria', () => {
    const framework = fw([
      criterion('C1', 1),
      criterion('A', 2),
      criterion('B', 2),
      criterion('C', 2),
      criterion('D', 2),
    ]);
    const result = evaluateCte(
      framework,
      cte(),
      [
        assess('CTE-01', 'C1', 'Met'),
        assess('CTE-01', 'A', 'Met'),
        assess('CTE-01', 'B', 'Not met'),
        assess('CTE-01', 'C', 'N/A', { justification: 'x' }),
        assess('CTE-01', 'D', 'Not assessed'),
      ],
      [
        evidence('EV-0001', [
          ['CTE-01', 'C1'],
          ['CTE-01', 'A'],
        ]),
      ],
    );
    expect(result.trl).toBe(1);
    expect(result.nextLevel).toBe(2);
    // applicable excluding N/A = A, B, D → 1 of 3 satisfied
    expect(result.nextLevelCompletenessPct).toBeCloseTo(33.3, 1);
  });
  it('has no next level above TRL 9', () => {
    const framework = fw([...Array(9)].map((_, i) => criterion(`C${i + 1}`, (i + 1) as TrlLevel)));
    const result = evaluateCte(
      framework,
      cte(),
      [...Array(9)].map((_, i) => assess('CTE-01', `C${i + 1}`, 'Met')),
      [
        evidence(
          'EV-0001',
          [...Array(9)].map((_, i) => ['CTE-01', `C${i + 1}`] as [string, string]),
        ),
      ],
    );
    expect(result.trl).toBe(9);
    expect(result.nextLevel).toBeUndefined();
    expect(result.gaps).toHaveLength(0);
  });
});

describe('R2-7 system summary', () => {
  const framework = fw([criterion('C1', 1), criterion('C2', 2)]);
  const ev = evidence('EV-0001', [
    ['CTE-01', 'C1'],
    ['CTE-01', 'C2'],
    ['CTE-02', 'C1'],
  ]);
  const assessments = [
    assess('CTE-01', 'C1', 'Met'),
    assess('CTE-01', 'C2', 'Met'),
    assess('CTE-02', 'C1', 'Met'),
  ];

  it('is the minimum over critical CTEs and names the limiting CTE', () => {
    const result = scoreTier2(framework, {
      ctes: [cte('CTE-01'), cte('CTE-02')],
      assessments,
      evidence: [ev],
      gapActions: [],
    });
    expect(result.system.trl).toBe(1);
    expect(result.system.limitingCteIds).toEqual(['CTE-02']);
    expect(result.system.note).toContain('reporting convention');
  });

  it('ignores non-critical CTEs', () => {
    const result = scoreTier2(framework, {
      ctes: [cte('CTE-01'), cte('CTE-02', { critical: false })],
      assessments,
      evidence: [ev],
      gapActions: [],
    });
    expect(result.system.trl).toBe(2);
    expect(result.system.limitingCteIds).toEqual(['CTE-01']);
  });

  it('is not computed when no CTE is critical', () => {
    const summary = systemSummary([]);
    expect(summary.computed).toBe(false);
    expect(summary.message).toBe(NO_CRITICAL_CTE_MESSAGE);
  });

  it('is not computed when there are zero CTEs', () => {
    const result = scoreTier2(framework, {
      ctes: [],
      assessments: [],
      evidence: [],
      gapActions: [],
    });
    expect(result.system.computed).toBe(false);
    expect(result.ctes).toHaveLength(0);
  });

  it('lists every CTE tied at the minimum', () => {
    const result = scoreTier2(framework, {
      ctes: [cte('CTE-01'), cte('CTE-02'), cte('CTE-03')],
      assessments: [],
      evidence: [],
      gapActions: [],
    });
    expect(result.system.trl).toBe(0);
    expect(result.system.limitingCteIds).toEqual(['CTE-01', 'CTE-02', 'CTE-03']);
  });
});

describe('R2-8 evidence coverage', () => {
  it('is Met-with-evidence ÷ Met', () => {
    const framework = fw([criterion('C1', 1), criterion('C2', 1)]);
    const result = evaluateCte(
      framework,
      cte(),
      [assess('CTE-01', 'C1', 'Met'), assess('CTE-01', 'C2', 'Met')],
      [evidence('EV-0001', [['CTE-01', 'C1']])],
    );
    expect(result.evidenceCoveragePct).toBe(50);
  });
  it('is 0 when nothing is marked Met', () => {
    const framework = fw([criterion('C1', 1)]);
    expect(evaluateCte(framework, cte(), [], []).evidenceCoveragePct).toBe(0);
  });
  it('excludes rejected evidence from coverage', () => {
    const framework = fw([criterion('C1', 1)]);
    const result = evaluateCte(
      framework,
      cte(),
      [assess('CTE-01', 'C1', 'Met')],
      [evidence('EV-0001', [['CTE-01', 'C1']], { verification: 'Rejected' })],
    );
    expect(result.evidenceCoveragePct).toBe(0);
  });
});

describe('R2-9 tier delta', () => {
  it('is Tier 2 minus Tier 1 contiguous', () => {
    const summary = { computed: true, trl: 3 as const, limitingCteIds: [], note: '' };
    expect(tierDelta(summary, 4).delta).toBe(-1);
  });
  it('explains a delta of 2 or more', () => {
    const summary = { computed: true, trl: 2 as const, limitingCteIds: [], note: '' };
    const d = tierDelta(summary, 6);
    expect(d.significant).toBe(true);
    expect(d.explanation).toContain('lower than the quick estimate');
  });
  it('explains a positive delta of 2 or more', () => {
    const summary = { computed: true, trl: 6 as const, limitingCteIds: [], note: '' };
    expect(tierDelta(summary, 2).explanation).toContain('higher than the quick estimate');
  });
  it('is null when the system summary is not computed', () => {
    expect(
      tierDelta({ computed: false, trl: null, limitingCteIds: [], note: '' }, 4).delta,
    ).toBeNull();
  });
  it('is null when there is no Tier 1 result', () => {
    const summary = { computed: true, trl: 3 as const, limitingCteIds: [], note: '' };
    expect(tierDelta(summary, undefined).delta).toBeNull();
  });
});

describe('R2-10 label', () => {
  it('always reports the evidence-backed self-assessment label', () => {
    const framework = fw([criterion('C1', 1)]);
    const result = scoreTier2(framework, {
      ctes: [],
      assessments: [],
      evidence: [],
      gapActions: [],
    });
    expect(result.label).toBe(TIER2_LABEL);
  });
});

describe('gap analysis', () => {
  it('lists the unmet mandatory criteria at the next level with a reason each', () => {
    const framework = fw([
      criterion('C1', 1),
      criterion('A', 2),
      criterion('B', 2),
      criterion('C', 2),
      criterion('D', 2),
    ]);
    const result = evaluateCte(
      framework,
      cte(),
      [
        assess('CTE-01', 'C1', 'Met'),
        assess('CTE-01', 'A', 'Partially met'),
        assess('CTE-01', 'B', 'Not met'),
        assess('CTE-01', 'C', 'Met'),
        assess('CTE-01', 'D', 'N/A'),
      ],
      [evidence('EV-0001', [['CTE-01', 'C1']])],
    );
    const reasons = Object.fromEntries(result.gaps.map((g) => [g.criterionId, g.reason]));
    expect(reasons['A']).toContain('Partially met');
    expect(reasons['B']).toBe('Not met.');
    expect(reasons['C']).toContain('no usable evidence');
    expect(reasons['D']).toContain('without a justification');
    expect(result.gaps.every((g) => g.level === 2)).toBe(true);
  });

  it('collects gaps across every CTE', () => {
    const framework = fw([criterion('C1', 1)]);
    const result = scoreTier2(framework, {
      ctes: [cte('CTE-01'), cte('CTE-02')],
      assessments: [],
      evidence: [],
      gapActions: [],
    });
    expect(allGaps(result)).toHaveLength(2);
  });

  it('reports gaps for an optional-only level through its applicable criteria', () => {
    const framework = fw([criterion('C1', 1, { mandatory: false })]);
    const result = evaluateCte(framework, cte(), [], []);
    expect(result.gaps.map((g) => g.criterionId)).toEqual(['C1']);
  });
});
