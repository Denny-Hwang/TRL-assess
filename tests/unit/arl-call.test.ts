/**
 * BUILD_SPEC D-2.4 — call-profile checks against the CLIMR FY26–27 lab call. Every check has a
 * named test for each outcome it can produce.
 */
import { describe, it, expect } from 'vitest';
import {
  checkApplies,
  evaluateCallProfile,
  loadArlFramework,
  loadCallProfile,
  scoreArl,
  summarizeChecks,
  trlStartFor,
  type CallInputs,
  type TrlStart,
} from '@/domain/arl';
import { resolveFramework } from '@/domain/frameworks';
import { createSession, parseSession } from '@/domain/session';
import { FICTIONAL_EXAMPLE } from '@/data/examples';
import type {
  ArlData,
  ArlDimensionAssessment,
  ArlRating,
  CallProfile,
  TrlLevel,
} from '@/domain/schemas';
import { DEFAULT_ARL_FRAMEWORK, TIER1_LABEL, TIER2_LABEL } from '@/config/app.config';

const arlFramework = loadArlFramework(DEFAULT_ARL_FRAMEWORK);
const profile = loadCallProfile('doe-tcf-climr-fy2627');
const trlFramework = resolveFramework('marine-energy-eere');
const IDS = arlFramework.dimensions.map((d) => d.id);

function arlData(
  base: ArlRating,
  overrides: Record<string, Partial<ArlDimensionAssessment>> = {},
): ArlData {
  return {
    frameworkId: arlFramework.id,
    frameworkVersion: arlFramework.version,
    context: { projectName: 'P', technologyName: 'T', assessorName: 'A' },
    dimensions: IDS.map((id) => ({
      dimensionId: id,
      current: base,
      rationale: 'r',
      ...overrides[id],
    })),
  };
}

const START_4: TrlStart = { value: 4, basis: 'tier1', label: TIER1_LABEL };

function inputs(overrides: Partial<CallInputs> = {}, data = arlData('Medium')): CallInputs {
  return {
    arl: scoreArl(arlFramework, data),
    trlStart: START_4,
    trlEnd: 6,
    trlFramework: {
      id: trlFramework.framework.id,
      name: trlFramework.framework.name,
      sources: trlFramework.framework.sources,
    },
    ...overrides,
  };
}

function outcome(id: string, i: CallInputs, p: CallProfile = profile) {
  const found = evaluateCallProfile(p, arlFramework, i).find((o) => o.check.id === id);
  if (!found) throw new Error(`${id} did not apply`);
  return found;
}

describe('R4-2 topic-specific checks', () => {
  it('applies a check without topics to every proposal', () => {
    expect(checkApplies(profile.checks[0]!, undefined)).toBe(true);
    expect(checkApplies(profile.checks[0]!, 'CMEI')).toBe(true);
  });

  it('applies the NE parameters only when NE is selected', () => {
    const ids = (topicId?: string) =>
      evaluateCallProfile(profile, arlFramework, inputs({ ...(topicId ? { topicId } : {}) })).map(
        (o) => o.check.id,
      );
    expect(ids()).not.toContain('CLIMR-C2');
    expect(ids('OE')).not.toContain('CLIMR-C7');
    expect(ids('NE')).toEqual(expect.arrayContaining(['CLIMR-C2', 'CLIMR-C7']));
  });
});

describe('R4-1 TRL Start', () => {
  it('reports no TRL result for an empty session', () => {
    const start = trlStartFor(createSession('marine-energy-eere', '1.0.0'), trlFramework);
    expect(start).toEqual({ value: null, basis: 'none', label: 'No TRL result yet' });
  });

  it('uses the Tier 2 system summary when it is computed', () => {
    const session = parseSession(FICTIONAL_EXAMPLE);
    const start = trlStartFor(session, resolveFramework(session.frameworkId));
    expect(start.basis).toBe('tier2');
    expect(start.label).toBe(TIER2_LABEL);
  });

  it('falls back to the Tier 1 estimate without a computed system summary', () => {
    const session = parseSession(FICTIONAL_EXAMPLE);
    const noCritical = {
      ...session,
      tier2: {
        ...session.tier2!,
        ctes: session.tier2!.ctes.map((c) => ({ ...c, critical: false })),
      },
    };
    const start = trlStartFor(noCritical, resolveFramework(session.frameworkId));
    expect(start.basis).toBe('tier1');
    expect(start.label).toBe(TIER1_LABEL);
  });

  it('ignores a Tier 1 context with no answers', () => {
    const session = {
      ...createSession('marine-energy-eere', '1.0.0'),
      tier1: {
        context: {
          projectName: 'P',
          technologyName: 'T',
          assessorName: 'A',
          environment: 'E1' as const,
          build: 'B1' as const,
        },
        answers: {},
      },
    };
    expect(trlStartFor(session, trlFramework).basis).toBe('none');
  });
});

describe('CLIMR-C1 TRL Start is at least 4', () => {
  it('is not evaluated without a TRL result', () => {
    const o = outcome('CLIMR-C1', inputs({ trlStart: { value: null, basis: 'none', label: '' } }));
    expect(o.result).toBe('Not evaluated');
  });

  it('fails below 4 and passes at 4', () => {
    expect(outcome('CLIMR-C1', inputs({ trlStart: { ...START_4, value: 3 } })).result).toBe('Fail');
    const pass = outcome('CLIMR-C1', inputs());
    expect(pass.result).toBe('Pass');
    expect(pass.detail).toMatch(/Quick Estimate/);
  });

  it('names the Evidence Assessment when the value comes from Tier 2', () => {
    const o = outcome(
      'CLIMR-C1',
      inputs({ trlStart: { value: 0, basis: 'tier2', label: TIER2_LABEL } }),
    );
    expect(o.result).toBe('Fail');
    expect(o.value).toBe('< TRL 1');
    expect(o.detail).toMatch(/Evidence Assessment system summary/);
  });

  it('quotes the requirements it tests, with pages', () => {
    const o = outcome('CLIMR-C1', inputs());
    expect(o.requirements.map((r) => r.id)).toEqual(['CLIMR-Q1', 'CLIMR-Q6', 'CLIMR-Q12']);
    expect(o.requirements[0]!.text).toMatch(/minimum Technology Readiness Level \(TRL\) of 4/);
  });
});

describe('CLIMR-C2 NE: TRL Start is at least 5 (recommended)', () => {
  it('warns — rather than fails — at 4, and passes at 5', () => {
    expect(outcome('CLIMR-C2', inputs({ topicId: 'NE' })).result).toBe('Warning');
    const five = inputs({ topicId: 'NE', trlStart: { ...START_4, value: 5 } });
    expect(outcome('CLIMR-C2', five).result).toBe('Pass');
  });
});

describe('CLIMR-C3 TRL End is 4–9', () => {
  it('is not evaluated until a TRL End target is entered', () => {
    const i = inputs();
    delete i.trlEnd;
    expect(outcome('CLIMR-C3', i).result).toBe('Not evaluated');
  });

  it('fails outside 4–9 and passes inside', () => {
    expect(outcome('CLIMR-C3', inputs({ trlEnd: 3 })).result).toBe('Fail');
    expect(outcome('CLIMR-C3', inputs({ trlEnd: 9 as TrlLevel })).result).toBe('Pass');
  });
});

describe('CLIMR-C4 / C5 ARL Start 1–9 and ARL End 2–9', () => {
  it('passes a computed ARL Start, which is always a whole number 1–9', () => {
    expect(outcome('CLIMR-C4', inputs()).result).toBe('Pass');
  });

  it('fails an ARL End of 1', () => {
    const o = outcome('CLIMR-C5', inputs({}, arlData('High')));
    expect(o.result).toBe('Fail');
    expect(o.value).toBe('ARL 1');
  });

  it('passes an ARL End of 2 or more', () => {
    expect(outcome('CLIMR-C5', inputs({}, arlData('Low'))).result).toBe('Pass');
  });

  it('applies the range a profile sets', () => {
    const strict: CallProfile = {
      ...profile,
      checks: profile.checks.map((c) => (c.kind === 'arl-start-range' ? { ...c, min: 2 } : c)),
    };
    expect(outcome('CLIMR-C4', inputs({}, arlData('High')), strict).result).toBe('Fail');
  });
});

describe('CLIMR-C6 ARL must increase', () => {
  it('fails when the targets leave the ARL where it is', () => {
    const o = outcome('CLIMR-C6', inputs());
    expect(o.result).toBe('Fail');
    expect(o.detail).toMatch(/do not raise the ARL/);
  });

  it('passes when the targets raise it', () => {
    const d = arlData('Low', {
      'ARL-A1': { current: 'High', target: 'Low', plannedAction: 'a' },
      'ARL-A2': { current: 'High', target: 'Low', plannedAction: 'b' },
      'ARL-A3': { current: 'High', target: 'Medium', plannedAction: 'c' },
    });
    const o = outcome('CLIMR-C6', inputs({}, d));
    expect(o.result).toBe('Pass');
    expect(o.value).toBe('ARL 5 → 8');
    expect(o.detail).toMatch(/raise the ARL by 3/);
  });
});

describe('CLIMR-C7 NE: no High risk in License to Operate (recommended)', () => {
  it('passes when no D dimension counts as High', () => {
    expect(outcome('CLIMR-C7', inputs({ topicId: 'NE' })).result).toBe('Pass');
  });

  it('warns and names each High dimension, including conservative counts', () => {
    const d = arlData('Low', {
      'ARL-D1': { current: 'High' },
      'ARL-D3': { current: 'Unsure' },
      'ARL-C1': { current: 'High' },
    });
    const o = outcome('CLIMR-C7', inputs({ topicId: 'NE' }, d));
    expect(o.result).toBe('Warning');
    expect(o.value).toBe('2 High');
    expect(o.detail).toMatch(/ARL-D1/);
    expect(o.detail).toMatch(/ARL-D3 \(Unsure — counted as High risk\)/);
    expect(o.detail).not.toMatch(/ARL-C1/);
  });

  it('falls back to the area letter if a profile names an area the rubric lacks', () => {
    const odd: CallProfile = {
      ...profile,
      checks: profile.checks.map((c) =>
        c.kind === 'no-high-risk-in-area' ? { ...c, areaId: 'Z' } : c,
      ),
    };
    expect(outcome('CLIMR-C7', inputs({ topicId: 'NE' }), odd).detail).toMatch(/in Z counts/);
  });
});

describe('CLIMR-C8 TRL definitions', () => {
  it('is informational and names the framework and its sources', () => {
    const o = outcome('CLIMR-C8', inputs());
    expect(o.result).toBe('Info');
    expect(o.detail).toMatch(/Marine energy/);
    expect(o.detail).toMatch(/Technology Readiness Levels \(TRLs\)/);
  });

  it('prints an unknown source id as it is', () => {
    const o = outcome(
      'CLIMR-C8',
      inputs({ trlFramework: { id: 'x', name: 'X', sources: ['not-a-source'] } }),
    );
    expect(o.detail).toMatch(/not-a-source/);
  });
});

describe('R4-3 results', () => {
  it('quotes at least one requirement, with a page, for every outcome', () => {
    for (const o of evaluateCallProfile(profile, arlFramework, inputs({ topicId: 'NE' }))) {
      expect(o.requirements.length, o.check.id).toBeGreaterThan(0);
      for (const r of o.requirements) expect(r.source.page, `${o.check.id} ${r.id}`).toBeTruthy();
    }
  });

  it('counts outcomes by result', () => {
    const counts = summarizeChecks(evaluateCallProfile(profile, arlFramework, inputs()));
    // All Medium, no targets: ARL 1 → 1, so ARL End is out of range and does not increase.
    expect(counts).toEqual({ Pass: 3, Fail: 2, Warning: 0, Info: 1, 'Not evaluated': 0 });
  });
});
