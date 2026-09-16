/**
 * Tier 1 scoring (BUILD_SPEC D-2.1). Pure functions — every rule has a named test.
 */
import { TIER1_LABEL } from '@/config/app.config';
import type { ResolvedFramework } from './frameworks';
import {
  TRL_LEVELS,
  type AnswerValue,
  type BuildCode,
  type EnvironmentCode,
  type Tier1Answers,
  type TrlLevel,
} from './schemas';

/** 0 means "below TRL 1"; otherwise a TRL level. */
export type TrlScore = 0 | TrlLevel;

export type ConsistencyRating = 'High' | 'Medium' | 'Low';

export interface Tier1Flag {
  code: 'gap' | 'unsure' | 'no-answers';
  message: string;
  levels?: TrlLevel[];
}

export interface Tier1Result {
  /** R1-2 — the headline figure. */
  contiguousTrl: TrlScore;
  /** R1-1 — highest level answered "Yes", ignoring gaps. */
  firstYesTrl: TrlScore;
  /** R1-5 — build × environment cross-check. */
  matrixTrl: TrlScore;
  /** R1-6 */
  consistency: ConsistencyRating;
  /** R1-3, R1-4 */
  flags: Tier1Flag[];
  /** R1-7 */
  label: string;
  answeredLevels: TrlLevel[];
  missingLevels: TrlLevel[];
}

/** Answer lookup by TRL level for the framework's Tier 1 questions. */
export function answersByLevel(
  framework: ResolvedFramework,
  tier1: Tier1Answers,
): Map<TrlLevel, AnswerValue> {
  const byLevel = new Map<TrlLevel, AnswerValue>();
  for (const question of framework.tier1) {
    const answer = tier1.answers[question.id];
    if (answer) byLevel.set(question.level, answer.value);
  }
  return byLevel;
}

/** R1-1 — scan TRL 9 → 1 and take the first "Yes". */
export function firstYesTrl(answers: Map<TrlLevel, AnswerValue>): TrlScore {
  for (const level of [...TRL_LEVELS].reverse()) {
    if (answers.get(level) === 'Yes') return level;
  }
  return 0;
}

/** R1-2 — the largest L where every level up to and including L is "Yes". */
export function contiguousTrl(answers: Map<TrlLevel, AnswerValue>): TrlScore {
  let result: TrlScore = 0;
  for (const level of TRL_LEVELS) {
    if (answers.get(level) === 'Yes') result = level;
    else break;
  }
  return result;
}

/** R1-5 — heuristic matrix cross-check. */
export function matrixTrl(
  framework: ResolvedFramework,
  build: BuildCode,
  environment: EnvironmentCode,
): TrlScore {
  const row = framework.matrix.matrix[build];
  const value = row?.[environment];
  return (value ?? 0) as TrlScore;
}

function gapFlag(answers: Map<TrlLevel, AnswerValue>, first: TrlScore, contiguous: TrlScore) {
  if (first <= contiguous) return undefined;
  const missing = TRL_LEVELS.filter((l) => l <= first && answers.get(l) !== 'Yes');
  return {
    code: 'gap' as const,
    message:
      'Higher level claimed while a lower level is not confirmed. ' +
      `TRL ${first} was answered "Yes" but ${missing
        .map((l) => `TRL ${l}`)
        .join(', ')} ${missing.length === 1 ? 'is' : 'are'} not confirmed.`,
    levels: missing,
  };
}

function unsureFlag(answers: Map<TrlLevel, AnswerValue>, first: TrlScore) {
  const unsure = TRL_LEVELS.filter((l) => l <= first && answers.get(l) === 'Unsure');
  if (!unsure.length) return undefined;
  return {
    code: 'unsure' as const,
    message:
      `"Unsure" was selected at ${unsure.map((l) => `TRL ${l}`).join(', ')}. ` +
      'An "Unsure" answer never counts as a "Yes", so the estimate stays at or below that level.',
    levels: unsure,
  };
}

/** R1-6 — internal consistency only; it says nothing about accuracy. */
export function consistencyRating(
  contiguous: TrlScore,
  matrix: TrlScore,
  flags: Tier1Flag[],
): ConsistencyRating {
  const gap = flags.find((f) => f.code === 'gap');
  const hasUnsure = flags.some((f) => f.code === 'unsure');
  const delta = Math.abs(contiguous - matrix);
  if (delta >= 3 || (gap && (gap.levels?.length ?? 0) >= 2)) return 'Low';
  if (!gap && !hasUnsure && delta <= 1) return 'High';
  return 'Medium';
}

export function scoreTier1(framework: ResolvedFramework, tier1: Tier1Answers): Tier1Result {
  const answers = answersByLevel(framework, tier1);
  const first = firstYesTrl(answers);
  const contiguous = contiguousTrl(answers);
  const matrix = matrixTrl(framework, tier1.context.build, tier1.context.environment);

  const flags: Tier1Flag[] = [];
  const gap = gapFlag(answers, first, contiguous);
  if (gap) flags.push(gap);
  const unsure = unsureFlag(answers, first);
  if (unsure) flags.push(unsure);
  if (answers.size === 0) {
    flags.push({
      code: 'no-answers',
      message: 'No screening questions have been answered yet.',
    });
  }

  return {
    contiguousTrl: contiguous,
    firstYesTrl: first,
    matrixTrl: matrix,
    consistency: consistencyRating(contiguous, matrix, flags),
    flags,
    label: TIER1_LABEL,
    answeredLevels: TRL_LEVELS.filter((l) => answers.has(l)),
    missingLevels: TRL_LEVELS.filter((l) => !answers.has(l)),
  };
}

/** Display helper: 0 → "< TRL 1". */
export function formatTrl(score: TrlScore | number): string {
  return score <= 0 ? '< TRL 1' : `TRL ${score}`;
}
