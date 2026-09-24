/**
 * Tier 2 scoring, rollup and gap analysis.
 * Pure functions — every rule has a named test.
 */
import { TIER2_LABEL } from '@/config/app.config';
import type { ResolvedFramework } from './frameworks';
import {
  TRL_LEVELS,
  type CriterionAssessment,
  type CriterionStatus,
  type Cte,
  type EvidenceItem,
  type Tier2Criterion,
  type Tier2Data,
  type TrlLevel,
} from './schemas';
import type { TrlScore } from './tier1';

export const SYSTEM_SUMMARY_NOTE =
  'Conservative summary (minimum of critical CTEs). This is a reporting convention, not a mandated formula.';
export const NO_CRITICAL_CTE_MESSAGE = 'Not computed — mark at least one CTE as critical';
export const NO_MANDATORY_FLAG = 'No mandatory criteria — needs assessor confirmation';

export interface CriterionOutcome {
  criterion: Tier2Criterion;
  status: CriterionStatus;
  satisfied: boolean;
  /** Mandatory criterion marked "Met" but with no usable evidence (R2-3). */
  missingEvidence: boolean;
  /** Optional criterion marked "Met" with no usable evidence — warning only (R2-3). */
  warning?: string;
  evidenceIds: string[];
  justification?: string;
  note?: string;
}

export interface LevelOutcome {
  level: TrlLevel;
  achieved: boolean;
  /** True when the level has no applicable mandatory criteria (R2-4). */
  noMandatoryCriteria: boolean;
  flag?: string;
  applicable: CriterionOutcome[];
  mandatoryUnmet: CriterionOutcome[];
  /** Locked because a lower level is not achieved. */
  locked: boolean;
  completenessPct: number;
}

export interface CteResult {
  cte: Cte;
  trl: TrlScore;
  levels: LevelOutcome[];
  /** R2-6 — completeness at CTE TRL + 1. */
  nextLevel?: TrlLevel;
  nextLevelCompletenessPct: number;
  /** R2-8 */
  evidenceCoveragePct: number;
  gaps: GapItem[];
}

export interface GapItem {
  cteId: string;
  level: TrlLevel;
  criterionId: string;
  criterionText: string;
  status: CriterionStatus;
  reason: string;
}

export interface SystemSummary {
  computed: boolean;
  trl: TrlScore | null;
  message?: string;
  limitingCteIds: string[];
  note: string;
}

export interface Tier2Result {
  ctes: CteResult[];
  system: SystemSummary;
  label: string;
}

/** R2-1 */
export function isApplicable(criterion: Tier2Criterion, cte: Cte): boolean {
  if (!criterion.appliesTo) return true;
  if (!cte.kind) return true;
  return criterion.appliesTo.includes(cte.kind);
}

export function applicableCriteria(
  framework: ResolvedFramework,
  cte: Cte,
  level?: TrlLevel,
): Tier2Criterion[] {
  return framework.tier2.filter(
    (c) => isApplicable(c, cte) && (level === undefined || c.level === level),
  );
}

function usableEvidence(
  evidence: EvidenceItem[],
  cteId: string,
  criterionId: string,
): EvidenceItem[] {
  return evidence.filter(
    (e) =>
      e.verification !== 'Rejected' &&
      e.linkedCriteria.some((l) => l.cteId === cteId && l.criterionId === criterionId),
  );
}

/** R2-2 and R2-3. */
export function evaluateCriterion(
  criterion: Tier2Criterion,
  cte: Cte,
  assessment: CriterionAssessment | undefined,
  evidence: EvidenceItem[],
): CriterionOutcome {
  const status: CriterionStatus = assessment?.status ?? 'Not assessed';
  const linked = usableEvidence(evidence, cte.id, criterion.id);
  const evidenceIds = linked.map((e) => e.id);

  let satisfied = false;
  let missingEvidence = false;
  let warning: string | undefined;

  if (status === 'Met') {
    if (linked.length > 0) satisfied = true;
    else if (criterion.mandatory) {
      missingEvidence = true;
      warning =
        'Marked "Met" but no evidence is linked (or all linked evidence is Rejected). ' +
        'A mandatory criterion is not satisfied without evidence.';
    } else {
      warning =
        'Marked "Met" but no evidence is linked (or all linked evidence is Rejected). ' +
        'It does not count towards completeness.';
    }
  } else if (status === 'N/A') {
    satisfied = Boolean(assessment?.justification?.trim());
    if (!satisfied) warning = '"N/A" needs a justification before it can count as satisfied.';
  }

  return {
    criterion,
    status,
    satisfied,
    missingEvidence,
    ...(warning ? { warning } : {}),
    evidenceIds,
    ...(assessment?.justification ? { justification: assessment.justification } : {}),
    ...(assessment?.note ? { note: assessment.note } : {}),
  };
}

function completeness(outcomes: CriterionOutcome[]): number {
  const denominator = outcomes.filter((o) => o.status !== 'N/A').length;
  if (denominator === 0) return outcomes.length > 0 ? 100 : 0;
  const numerator = outcomes.filter((o) => o.satisfied && o.status !== 'N/A').length;
  return Math.round((numerator / denominator) * 1000) / 10;
}

/** R2-4, R2-5, R2-6, R2-8 for one CTE. */
export function evaluateCte(
  framework: ResolvedFramework,
  cte: Cte,
  assessments: CriterionAssessment[],
  evidence: EvidenceItem[],
): CteResult {
  const byId = new Map(
    assessments.filter((a) => a.cteId === cte.id).map((a) => [a.criterionId, a]),
  );

  const levels: LevelOutcome[] = [];
  let previousAchieved = true; // level 0 counts as achieved
  let trl: TrlScore = 0;

  for (const level of TRL_LEVELS) {
    const criteria = applicableCriteria(framework, cte, level);
    const outcomes = criteria.map((c) => evaluateCriterion(c, cte, byId.get(c.id), evidence));
    const mandatory = outcomes.filter((o) => o.criterion.mandatory);
    const noMandatoryCriteria = mandatory.length === 0;

    let achievedHere = false;
    let flag: string | undefined;
    if (noMandatoryCriteria) {
      achievedHere = outcomes.some((o) => o.satisfied);
      flag = NO_MANDATORY_FLAG;
    } else {
      achievedHere = mandatory.every((o) => o.satisfied);
    }

    const achieved: boolean = achievedHere && previousAchieved;
    const locked = !previousAchieved;

    levels.push({
      level,
      achieved,
      noMandatoryCriteria,
      ...(flag ? { flag } : {}),
      applicable: outcomes,
      mandatoryUnmet: mandatory.filter((o) => !o.satisfied),
      locked,
      completenessPct: completeness(outcomes),
    });

    if (achieved) trl = level;
    previousAchieved = achieved;
  }

  const nextLevel = (trl + 1 <= 9 ? ((trl + 1) as TrlLevel) : undefined) as TrlLevel | undefined;
  const nextLevelOutcome = nextLevel ? levels.find((l) => l.level === nextLevel) : undefined;

  // R2-8 — evidence coverage over "Met" criteria.
  const allOutcomes = levels.flatMap((l) => l.applicable);
  const met = allOutcomes.filter((o) => o.status === 'Met');
  const metWithEvidence = met.filter((o) => o.evidenceIds.length > 0);
  const evidenceCoveragePct =
    met.length === 0 ? 0 : Math.round((metWithEvidence.length / met.length) * 1000) / 10;

  return {
    cte,
    trl,
    levels,
    ...(nextLevel ? { nextLevel } : {}),
    nextLevelCompletenessPct: nextLevelOutcome?.completenessPct ?? 0,
    evidenceCoveragePct,
    gaps: nextLevelOutcome ? gapsForLevel(cte, nextLevelOutcome) : [],
  };
}

/** Gap analysis: the unmet mandatory criteria at the CTE's next level. */
export function gapsForLevel(cte: Cte, level: LevelOutcome): GapItem[] {
  const unmet = level.noMandatoryCriteria
    ? level.applicable.filter((o) => !o.satisfied)
    : level.mandatoryUnmet;
  return unmet.map((o) => ({
    cteId: cte.id,
    level: level.level,
    criterionId: o.criterion.id,
    criterionText: o.criterion.text,
    status: o.status,
    reason: reasonFor(o),
  }));
}

function reasonFor(o: CriterionOutcome): string {
  switch (o.status) {
    case 'Met':
      return o.missingEvidence
        ? 'Marked "Met" but no usable evidence is linked.'
        : 'Marked "Met" but no usable evidence is linked; it does not count.';
    case 'Partially met':
      return 'Partially met — a partial result never satisfies a criterion.';
    case 'Not met':
      return 'Not met.';
    case 'N/A':
      return 'Marked "N/A" without a justification.';
    case 'Not assessed':
    default:
      return 'Not assessed yet.';
  }
}

/** R2-7 */
export function systemSummary(results: CteResult[]): SystemSummary {
  const critical = results.filter((r) => r.cte.critical);
  if (critical.length === 0) {
    return {
      computed: false,
      trl: null,
      message: NO_CRITICAL_CTE_MESSAGE,
      limitingCteIds: [],
      note: SYSTEM_SUMMARY_NOTE,
    };
  }
  const min = critical.reduce<TrlScore>((acc, r) => (r.trl < acc ? r.trl : acc), critical[0]!.trl);
  return {
    computed: true,
    trl: min,
    limitingCteIds: critical.filter((r) => r.trl === min).map((r) => r.cte.id),
    note: SYSTEM_SUMMARY_NOTE,
  };
}

export function scoreTier2(framework: ResolvedFramework, tier2: Tier2Data): Tier2Result {
  const ctes = tier2.ctes.map((cte) =>
    evaluateCte(framework, cte, tier2.assessments, tier2.evidence),
  );
  return { ctes, system: systemSummary(ctes), label: TIER2_LABEL };
}

/** R2-9 */
export interface TierDelta {
  delta: number | null;
  significant: boolean;
  explanation?: string;
}

export function tierDelta(
  tier2System: SystemSummary,
  tier1Contiguous: TrlScore | undefined,
): TierDelta {
  if (!tier2System.computed || tier2System.trl === null || tier1Contiguous === undefined) {
    return { delta: null, significant: false };
  }
  const delta = tier2System.trl - tier1Contiguous;
  const significant = Math.abs(delta) >= 2;
  if (!significant) return { delta, significant };
  return {
    delta,
    significant,
    explanation:
      delta < 0
        ? 'The evidence-based assessment is markedly lower than the quick estimate. That is the usual direction: ' +
          'Tier 2 requires evidence for every claim, counts a level only when all lower levels are achieved, and ' +
          'takes the minimum across critical CTEs. Check which CTE is limiting and which criteria still lack evidence.'
        : 'The evidence-based assessment is markedly higher than the quick estimate. Check whether the quick estimate ' +
          'answered "Unsure" or "No" at a low level, and whether every CTE marked critical really is critical.',
  };
}

export function allGaps(result: Tier2Result): GapItem[] {
  return result.ctes.flatMap((c) => c.gaps);
}
