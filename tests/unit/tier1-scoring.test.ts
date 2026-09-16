/**
 * BUILD_SPEC D-2.1 — every rule has a named test.
 */
import { describe, it, expect } from 'vitest';
import { resolveFramework } from '@/domain/frameworks';
import {
  answersByLevel,
  consistencyRating,
  contiguousTrl,
  firstYesTrl,
  formatTrl,
  matrixTrl,
  scoreTier1,
} from '@/domain/tier1';
import { TIER1_LABEL } from '@/config/app.config';
import type {
  AnswerValue,
  BuildCode,
  EnvironmentCode,
  Tier1Answers,
  TrlLevel,
} from '@/domain/schemas';

const framework = resolveFramework('marine-energy-eere');

function answers(map: Partial<Record<TrlLevel, AnswerValue>>): Map<TrlLevel, AnswerValue> {
  return new Map(Object.entries(map).map(([k, v]) => [Number(k) as TrlLevel, v as AnswerValue]));
}

function session(
  map: Partial<Record<TrlLevel, AnswerValue>>,
  build: BuildCode = 'B2',
  environment: EnvironmentCode = 'E2',
): Tier1Answers {
  return {
    context: {
      projectName: 'P',
      technologyName: 'T',
      assessorName: 'A',
      environment,
      build,
    },
    answers: Object.fromEntries(
      Object.entries(map).map(([level, value]) => [
        `MEE-T1-L${level}`,
        { value: value as AnswerValue },
      ]),
    ),
  };
}

describe('R1-1 first-yes TRL', () => {
  it('returns the highest level answered Yes, scanning 9 → 1', () => {
    expect(firstYesTrl(answers({ 1: 'Yes', 2: 'Yes', 7: 'Yes' }))).toBe(7);
  });
  it('returns 0 when nothing is answered Yes', () => {
    expect(firstYesTrl(answers({ 1: 'No', 2: 'Unsure' }))).toBe(0);
  });
  it('returns 0 for an empty answer set', () => {
    expect(firstYesTrl(answers({}))).toBe(0);
  });
});

describe('R1-2 contiguous TRL', () => {
  it('is the largest L with Yes at every level up to L', () => {
    expect(contiguousTrl(answers({ 1: 'Yes', 2: 'Yes', 3: 'Yes', 4: 'No', 5: 'Yes' }))).toBe(3);
  });
  it('is 0 when TRL 1 is not Yes', () => {
    expect(contiguousTrl(answers({ 1: 'No', 2: 'Yes', 3: 'Yes' }))).toBe(0);
  });
  it('treats Unsure as not-Yes', () => {
    expect(contiguousTrl(answers({ 1: 'Yes', 2: 'Unsure', 3: 'Yes' }))).toBe(1);
  });
  it('reaches 9 when every level is Yes', () => {
    expect(
      contiguousTrl(
        answers({
          1: 'Yes',
          2: 'Yes',
          3: 'Yes',
          4: 'Yes',
          5: 'Yes',
          6: 'Yes',
          7: 'Yes',
          8: 'Yes',
          9: 'Yes',
        }),
      ),
    ).toBe(9);
  });
});

describe('R1-3 gap flag', () => {
  it('is raised when first-yes exceeds contiguous, and lists the missing levels', () => {
    const result = scoreTier1(framework, session({ 1: 'Yes', 2: 'No', 3: 'Yes', 4: 'Yes' }));
    const gap = result.flags.find((f) => f.code === 'gap');
    expect(gap).toBeDefined();
    expect(gap?.levels).toEqual([2]);
    expect(gap?.message).toContain('Higher level claimed while a lower level is not confirmed');
  });
  it('is not raised when the answers are contiguous', () => {
    const result = scoreTier1(framework, session({ 1: 'Yes', 2: 'Yes', 3: 'No' }));
    expect(result.flags.some((f) => f.code === 'gap')).toBe(false);
  });
});

describe('R1-4 unsure flag', () => {
  it('is raised for an Unsure at or below the first-yes level', () => {
    const result = scoreTier1(framework, session({ 1: 'Yes', 2: 'Unsure', 3: 'Yes' }));
    const unsure = result.flags.find((f) => f.code === 'unsure');
    expect(unsure?.levels).toEqual([2]);
  });
  it('is not raised for an Unsure above the first-yes level', () => {
    const result = scoreTier1(framework, session({ 1: 'Yes', 2: 'Yes', 3: 'Unsure' }));
    expect(result.flags.some((f) => f.code === 'unsure')).toBe(false);
  });
  it('never lets Unsure count as Yes', () => {
    const result = scoreTier1(framework, session({ 1: 'Yes', 2: 'Unsure' }));
    expect(result.contiguousTrl).toBe(1);
    expect(result.firstYesTrl).toBe(1);
  });
});

describe('R1-5 matrix TRL', () => {
  it.each([
    ['B0', 'E0', 2],
    ['B1', 'E1', 3],
    ['B2', 'E2', 5],
    ['B3', 'E2', 6],
    ['B4', 'E3', 7],
    ['B5', 'E4', 9],
    ['B5', 'E0', 3],
  ])('maps %s × %s to TRL %i', (build, env, expected) => {
    expect(matrixTrl(framework, build as BuildCode, env as EnvironmentCode)).toBe(expected);
  });
});

describe('R1-6 consistency rating', () => {
  it('is High with no flags and |contiguous − matrix| ≤ 1', () => {
    expect(consistencyRating(5, 5, [])).toBe('High');
    expect(consistencyRating(5, 4, [])).toBe('High');
  });
  it('is Low when |contiguous − matrix| ≥ 3', () => {
    expect(consistencyRating(8, 5, [])).toBe('Low');
    expect(consistencyRating(2, 5, [])).toBe('Low');
  });
  it('is Low for a gap flag with two or more missing levels', () => {
    const rating = consistencyRating(1, 2, [{ code: 'gap', message: 'x', levels: [2, 3] }]);
    expect(rating).toBe('Low');
  });
  it('is Medium for a single-level gap', () => {
    expect(consistencyRating(3, 4, [{ code: 'gap', message: 'x', levels: [4] }])).toBe('Medium');
  });
  it('is Medium when an Unsure flag is present but the delta is small', () => {
    expect(consistencyRating(5, 5, [{ code: 'unsure', message: 'x', levels: [3] }])).toBe('Medium');
  });
});

describe('R1-7 label', () => {
  it('always reports the estimate label', () => {
    expect(scoreTier1(framework, session({ 1: 'Yes' })).label).toBe(TIER1_LABEL);
    expect(scoreTier1(framework, session({})).label).toBe(TIER1_LABEL);
  });
});

describe('edge cases', () => {
  it('flags an unanswered questionnaire', () => {
    const result = scoreTier1(framework, session({}));
    expect(result.contiguousTrl).toBe(0);
    expect(result.flags.some((f) => f.code === 'no-answers')).toBe(true);
    expect(result.missingLevels).toHaveLength(9);
  });
  it('formats 0 as "< TRL 1"', () => {
    expect(formatTrl(0)).toBe('< TRL 1');
    expect(formatTrl(6)).toBe('TRL 6');
  });
  it('maps answers back to levels through the framework question ids', () => {
    const map = answersByLevel(framework, session({ 3: 'Yes', 9: 'No' }));
    expect(map.get(3)).toBe('Yes');
    expect(map.get(9)).toBe('No');
    expect(map.has(5)).toBe(false);
  });
  it('ignores answers whose question id is not in the framework', () => {
    const t1 = session({ 1: 'Yes' });
    t1.answers['NOT-A-QUESTION'] = { value: 'Yes' };
    expect(scoreTier1(framework, t1).contiguousTrl).toBe(1);
  });
});
