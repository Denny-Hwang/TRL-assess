/**
 * ARL scoring. Every rule has a named test.
 */
import { describe, it, expect } from 'vitest';
import {
  conservativeReason,
  countedAs,
  effectiveTarget,
  isRiskReduction,
  loadArlFramework,
  lookupArl,
  readinessBand,
  scoreArl,
  scoreArlProfile,
} from '@/domain/arl';
import {
  ARL_RATINGS,
  arlDataSchema,
  type ArlData,
  type ArlDimensionAssessment,
  type ArlRating,
} from '@/domain/schemas';
import { ARL_LABEL, ARL_TARGET_LABEL, DEFAULT_ARL_FRAMEWORK } from '@/config/app.config';

const framework = loadArlFramework(DEFAULT_ARL_FRAMEWORK);
const ALL_IDS = framework.dimensions.map((d) => d.id);

function data(dimensions: ArlDimensionAssessment[]): ArlData {
  return {
    frameworkId: framework.id,
    frameworkVersion: framework.version,
    context: { projectName: 'P', technologyName: 'T', assessorName: 'A' },
    dimensions,
  };
}

/** Rates every dimension; `overrides` replaces individual ones. */
function rated(
  base: ArlRating,
  overrides: Record<string, Partial<ArlDimensionAssessment>> = {},
): ArlData {
  return data(
    ALL_IDS.map((id) => ({
      dimensionId: id,
      current: base,
      rationale: 'reason',
      ...overrides[id],
    })),
  );
}

describe('R3-1 rating scale', () => {
  it('accepts the rubric ratings, N/A and the two non-answers', () => {
    expect(ARL_RATINGS).toEqual(['Low', 'Medium', 'High', 'N/A', 'Unsure', 'Not assessed']);
  });

  it('rejects a rating the rubric does not define', () => {
    const bad = { ...data([]), dimensions: [{ dimensionId: 'ARL-A1', current: 'Very low' }] };
    expect(arlDataSchema.safeParse(bad).success).toBe(false);
  });

  it('allows only Low, Medium or High as a target', () => {
    const bad = {
      ...data([]),
      dimensions: [{ dimensionId: 'ARL-A1', current: 'High', target: 'Unsure' }],
    };
    expect(arlDataSchema.safeParse(bad).success).toBe(false);
  });
});

describe('R3-2 conservative counting', () => {
  it('counts Low, Medium and High as rated', () => {
    expect(countedAs('Low')).toBe('Low');
    expect(countedAs('Medium')).toBe('Medium');
    expect(countedAs('High')).toBe('High');
  });

  it('counts Unsure as High', () => {
    expect(countedAs('Unsure', 'we do not know yet')).toBe('High');
  });

  it('counts Not assessed as High', () => {
    expect(countedAs('Not assessed')).toBe('High');
  });

  it('counts N/A as N/A only with a rationale', () => {
    expect(countedAs('N/A', 'No materials constraint: software only')).toBe('N/A');
    expect(countedAs('N/A')).toBe('High');
    expect(countedAs('N/A', '   ')).toBe('High');
  });

  it('explains every conservative count, and nothing else', () => {
    expect(conservativeReason('Unsure')).toMatch(/Unsure — counted as High/);
    expect(conservativeReason('Not assessed')).toMatch(/Not assessed — counted as High/);
    expect(conservativeReason('N/A')).toMatch(/without a rationale/);
    expect(conservativeReason('N/A', 'reason')).toBeUndefined();
    expect(conservativeReason('High')).toBeUndefined();
  });

  it('turns an empty assessment into 17 High and the lowest ARL', () => {
    const result = scoreArlProfile(framework, data([]), 'current');
    expect(result.tally).toEqual({ Low: 0, Medium: 0, High: 17, 'N/A': 0 });
    expect(result.arl).toBe(1);
    expect(result.flags.find((f) => f.code === 'not-assessed')?.dimensionIds).toEqual(ALL_IDS);
  });
});

describe('R3-3 look-up table and bands', () => {
  it('reads every cell of the source table', () => {
    for (let medium = 0; medium <= 8; medium += 1) {
      for (let high = 0; high <= 8; high += 1) {
        expect(lookupArl(framework, medium, high), `M${medium} H${high}`).toBe(
          framework.lookup.table[medium]![high],
        );
      }
    }
  });

  it('puts every count of 8 or more in the "8+" row and column', () => {
    expect(lookupArl(framework, 12, 0)).toBe(1);
    expect(lookupArl(framework, 0, 17)).toBe(1);
    expect(lookupArl(framework, 8, 0)).toBe(lookupArl(framework, 16, 0));
  });

  it('never reads outside the table for impossible negative counts', () => {
    expect(lookupArl(framework, -1, -3)).toBe(9);
  });

  it('matches the worked cells of the source table', () => {
    expect(lookupArl(framework, 0, 0)).toBe(9);
    expect(lookupArl(framework, 0, 1)).toBe(8);
    expect(lookupArl(framework, 3, 1)).toBe(6);
    expect(lookupArl(framework, 5, 3)).toBe(2);
    expect(lookupArl(framework, 7, 0)).toBe(3);
  });

  it('names the band of every level', () => {
    expect([1, 2, 3, 4, 5, 6, 7, 8, 9].map((l) => readinessBand(framework, l))).toEqual([
      'Low Readiness',
      'Low Readiness',
      'Low Readiness',
      'Medium Readiness',
      'Medium Readiness',
      'Medium Readiness',
      'High Readiness',
      'High Readiness',
      'High Readiness',
    ]);
    expect(readinessBand(framework, 0)).toBe('');
  });

  it('scores an all-Low assessment as ARL 9, High Readiness', () => {
    const result = scoreArlProfile(framework, rated('Low'), 'current');
    expect(result.arl).toBe(9);
    expect(result.band).toBe('High Readiness');
  });

  it('tallies Medium and High only; Low and N/A do not move the number', () => {
    const result = scoreArlProfile(
      framework,
      rated('Low', {
        'ARL-A1': { current: 'Medium' },
        'ARL-B2': { current: 'Medium' },
        'ARL-C1': { current: 'Medium' },
        'ARL-D1': { current: 'High' },
        'ARL-C5': { current: 'N/A', rationale: 'no critical materials' },
      }),
      'current',
    );
    expect(result.tally).toEqual({ Low: 12, Medium: 3, High: 1, 'N/A': 1 });
    expect(result.arl).toBe(6);
  });

  it('bins a critical mass of High ratings as Low ARL', () => {
    const fiveHigh = Object.fromEntries(
      ALL_IDS.slice(0, 5).map((id) => [id, { current: 'High' as const }]),
    );
    expect(scoreArlProfile(framework, rated('Low', fiveHigh), 'current').arl).toBe(1);
  });
});

describe('R3-4 start and target', () => {
  it('uses the current rating as the target when no target is set', () => {
    expect(effectiveTarget({ dimensionId: 'ARL-A1', current: 'Medium' })).toEqual({
      rating: 'Medium',
      inherited: true,
    });
    expect(effectiveTarget(undefined)).toEqual({ rating: 'Not assessed', inherited: true });
  });

  it('uses an explicit target over the current rating', () => {
    expect(effectiveTarget({ dimensionId: 'ARL-A1', current: 'High', target: 'Low' })).toEqual({
      rating: 'Low',
      inherited: false,
    });
  });

  it('computes ARL End from the targets with the same table', () => {
    const d = rated('Low', {
      'ARL-A1': { current: 'High', target: 'Medium', plannedAction: 'cost-down pilot' },
      'ARL-D2': { current: 'Medium' },
    });
    const result = scoreArl(framework, d);
    expect(result.start.arl).toBe(lookupArl(framework, 1, 1));
    expect(result.end.arl).toBe(lookupArl(framework, 2, 0));
    expect(result.change).toBe(result.end.arl - result.start.arl);
    expect(result.end.outcomes.find((o) => o.dimension.id === 'ARL-D2')?.inherited).toBe(true);
    expect(result.end.outcomes.find((o) => o.dimension.id === 'ARL-A1')?.reducesRisk).toBe(true);
  });

  it('carries an N/A forward into the target, with its rationale', () => {
    const d = rated('Low', { 'ARL-C5': { current: 'N/A', rationale: 'software only' } });
    const end = scoreArlProfile(framework, d, 'target');
    const materials = end.outcomes.find((o) => o.dimension.id === 'ARL-C5')!;
    expect(materials.rating).toBe('N/A');
    expect(materials.countedAs).toBe('N/A');
  });
});

describe('R3-7 labels', () => {
  it('labels the result and the target honestly, and names the rubric and its version', () => {
    const result = scoreArl(framework, rated('Low'));
    expect(result.label).toBe(ARL_LABEL);
    expect(result.targetLabel).toBe(ARL_TARGET_LABEL);
    expect(result.frameworkId).toBe('doe-otc-arl-2025');
    expect(result.frameworkVersion).toBe('April 2025');
  });
});

describe('R3-5 profile by core risk area', () => {
  it('tallies each area separately, in source order', () => {
    const result = scoreArlProfile(
      framework,
      rated('Low', { 'ARL-D1': { current: 'High' }, 'ARL-D3': { current: 'Medium' } }),
      'current',
    );
    expect(result.byArea.map((a) => a.area.id)).toEqual(['A', 'B', 'C', 'D']);
    expect(result.byArea[3]!.tally).toEqual({ Low: 3, Medium: 1, High: 1, 'N/A': 0 });
    expect(result.byArea[0]!.outcomes).toHaveLength(3);
  });
});

describe('R3-2 / R3-6 flags and warnings', () => {
  it('lists Unsure, Not assessed and N/A-without-rationale as score-affecting', () => {
    const d = data([
      { dimensionId: 'ARL-A1', current: 'Unsure', rationale: 'r' },
      { dimensionId: 'ARL-A2', current: 'N/A' },
      { dimensionId: 'ARL-A3', current: 'Low', rationale: 'r' },
    ]);
    const flags = scoreArlProfile(framework, d, 'current').flags;
    const byCode = Object.fromEntries(flags.map((f) => [f.code, f]));
    expect(byCode['unsure']?.dimensionIds).toEqual(['ARL-A1']);
    expect(byCode['unsure']?.affectsScore).toBe(true);
    expect(byCode['na-without-rationale']?.dimensionIds).toEqual(['ARL-A2']);
    expect(byCode['not-assessed']?.dimensionIds).toHaveLength(14);
    expect(byCode['not-assessed']?.message).toMatch(/14 of 17/);
  });

  it('warns — without changing the number — when a rating has no rationale', () => {
    const d = rated('Low', { 'ARL-B1': { rationale: '' } });
    const result = scoreArlProfile(framework, d, 'current');
    const flag = result.flags.find((f) => f.code === 'no-rationale');
    expect(flag?.dimensionIds).toEqual(['ARL-B1']);
    expect(flag?.affectsScore).toBe(false);
    expect(result.arl).toBe(9);
  });

  it('asks for a planned action when a target reduces the risk', () => {
    const d = rated('Medium', {
      'ARL-A1': { target: 'Low' },
      'ARL-A2': { target: 'Low', plannedAction: 'field trial with two utilities' },
      'ARL-A3': { target: 'High' },
      'ARL-B1': { target: 'Medium' },
    });
    const end = scoreArlProfile(framework, d, 'target');
    expect(end.flags.find((f) => f.code === 'no-plan')?.dimensionIds).toEqual(['ARL-A1']);
    expect(end.flags.some((f) => f.code === 'no-rationale')).toBe(false);
  });

  it('raises nothing for a complete, reasoned assessment', () => {
    expect(scoreArlProfile(framework, rated('Low'), 'current').flags).toEqual([]);
    expect(scoreArlProfile(framework, rated('Low'), 'target').flags).toEqual([]);
  });
});

describe('risk reduction', () => {
  it('orders N/A < Low < Medium < High', () => {
    expect(isRiskReduction('High', 'Medium')).toBe(true);
    expect(isRiskReduction('Medium', 'Low')).toBe(true);
    expect(isRiskReduction('Low', 'Low')).toBe(false);
    expect(isRiskReduction('Low', 'High')).toBe(false);
  });

  it('treats a lower target after an Unsure as a reduction from High', () => {
    const d = rated('Low', { 'ARL-C1': { current: 'Unsure', target: 'Medium' } });
    const end = scoreArlProfile(framework, d, 'target');
    expect(end.outcomes.find((o) => o.dimension.id === 'ARL-C1')?.reducesRisk).toBe(true);
  });
});
