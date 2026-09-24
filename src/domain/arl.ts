/**
 * ARL side module: rubric loading and scoring. Pure functions — every rule has a named test.
 *
 * The number comes from the DOE Adoption Readiness Assessment's own look-up table, unmodified.
 * The only rule this tool adds is conservative: a dimension that is Unsure, not assessed, or N/A
 * without a rationale counts as High risk, the ARL analogue of "Unsure never counts as Yes".
 */
import { ARL_LABEL, ARL_TARGET_LABEL } from '@/config/app.config';
import { RAW_ARL_FRAMEWORKS } from '@/data/frameworks/arl';
import {
  arlFrameworkSchema,
  type ArlArea,
  type ArlData,
  type ArlDimension,
  type ArlDimensionAssessment,
  type ArlFramework,
  type ArlRating,
  type ArlRisk,
} from './schemas';

export class ArlDataError extends Error {
  constructor(
    message: string,
    readonly id: string,
  ) {
    super(message);
    this.name = 'ArlDataError';
  }
}

/* ------------------------------------------------------------------------------------------ */
/* Loading                                                                                     */
/* ------------------------------------------------------------------------------------------ */

/** Parses the rubric and checks the structure the scoring rules rely on. */
export function loadArlFramework(
  id: string,
  registry: Record<string, unknown> = RAW_ARL_FRAMEWORKS,
): ArlFramework {
  const raw = registry[id];
  if (raw === undefined) throw new ArlDataError(`Unknown ARL framework "${id}"`, id);
  const framework = arlFrameworkSchema.parse(raw);
  if (framework.id !== id) {
    throw new ArlDataError(
      `ARL framework declares id "${framework.id}" but is registered as "${id}"`,
      id,
    );
  }

  const areaIds = new Set(framework.areas.map((a) => a.id));
  if (areaIds.size !== framework.areas.length) throw new ArlDataError('Duplicate area id', id);
  const dimensionIds = new Set<string>();
  for (const d of framework.dimensions) {
    if (dimensionIds.has(d.id)) throw new ArlDataError(`Duplicate dimension id "${d.id}"`, id);
    dimensionIds.add(d.id);
    if (!areaIds.has(d.areaId)) {
      throw new ArlDataError(`${d.id} belongs to unknown area "${d.areaId}"`, id);
    }
    if (d.id !== `ARL-${d.areaId}${d.number}`) {
      throw new ArlDataError(`${d.id} should be named ARL-${d.areaId}${d.number}`, id);
    }
  }

  const { cap, table } = framework.lookup;
  if (table.length !== cap + 1 || table.some((row) => row.length !== cap + 1)) {
    throw new ArlDataError(`The look-up table must be ${cap + 1} × ${cap + 1}`, id);
  }

  const covered = new Map<number, string>();
  for (const band of framework.bands) {
    for (let level = band.min; level <= band.max; level += 1) {
      if (covered.has(level)) throw new ArlDataError(`ARL ${level} is in two bands`, id);
      covered.set(level, band.label);
    }
  }
  for (let level = 1; level <= 9; level += 1) {
    if (!covered.has(level)) throw new ArlDataError(`ARL ${level} is in no band`, id);
  }
  return framework;
}

export function dimensionsByArea(
  framework: ArlFramework,
): Array<{ area: ArlArea; dimensions: ArlDimension[] }> {
  return framework.areas.map((area) => ({
    area,
    dimensions: framework.dimensions.filter((d) => d.areaId === area.id),
  }));
}

export function guidance(framework: ArlFramework, id: string) {
  return framework.guidance.find((g) => g.id === id);
}

/* ------------------------------------------------------------------------------------------ */
/* Scoring (D-2.3)                                                                             */
/* ------------------------------------------------------------------------------------------ */

/** What a rating contributes to the tally once R3-2 has been applied. */
export type CountedAs = ArlRisk | 'N/A';

const RISK_RANK: Record<CountedAs, number> = { 'N/A': 0, Low: 1, Medium: 2, High: 3 };

/** R3-2 — Unsure, Not assessed and N/A without a rationale count as High. */
export function countedAs(rating: ArlRating, rationale?: string): CountedAs {
  switch (rating) {
    case 'Low':
    case 'Medium':
    case 'High':
      return rating;
    case 'N/A':
      return rationale?.trim() ? 'N/A' : 'High';
    default:
      return 'High';
  }
}

/** Why a dimension is counted as High although it was not rated High; undefined otherwise. */
export function conservativeReason(rating: ArlRating, rationale?: string): string | undefined {
  if (rating === 'Unsure') return 'Unsure — counted as High risk';
  if (rating === 'Not assessed') return 'Not assessed — counted as High risk';
  if (rating === 'N/A' && !rationale?.trim()) {
    return 'N/A without a rationale — counted as High risk until one is recorded';
  }
  return undefined;
}

/** R3-3 — the source's look-up table: rows are Medium counts, columns High counts; "8+" caps both. */
export function lookupArl(framework: ArlFramework, medium: number, high: number): number {
  const { cap, table } = framework.lookup;
  const row = Math.min(Math.max(0, medium), cap);
  const column = Math.min(Math.max(0, high), cap);
  return table[row]![column]!;
}

/** R3-3 — the readiness band the source names for an ARL. */
export function readinessBand(framework: ArlFramework, arl: number): string {
  return framework.bands.find((b) => arl >= b.min && arl <= b.max)?.label ?? '';
}

/** R3-4 — the target is the current rating unless a different end-of-project rating is set. */
export function effectiveTarget(assessment: ArlDimensionAssessment | undefined): {
  rating: ArlRating;
  inherited: boolean;
} {
  if (!assessment) return { rating: 'Not assessed', inherited: true };
  if (assessment.target) return { rating: assessment.target, inherited: false };
  return { rating: assessment.current, inherited: true };
}

export interface DimensionOutcome {
  dimension: ArlDimension;
  /** The rating as recorded — for the target profile, the effective target. */
  rating: ArlRating;
  countedAs: CountedAs;
  /** Set when R3-2 turned the rating into High. */
  conservativeReason?: string;
  /** Target profile only: no target was set, so the current rating was carried forward. */
  inherited?: boolean;
  /** Target profile only: the target counts as less risk than the current rating does. */
  reducesRisk?: boolean;
  rationale?: string;
  evidence?: string;
  plannedAction?: string;
}

export type ArlTally = Record<CountedAs, number>;

export interface ArlFlag {
  code: 'unsure' | 'not-assessed' | 'na-without-rationale' | 'no-rationale' | 'no-plan';
  /** Flags that change the number (R3-2); the others are warnings only (R3-6). */
  affectsScore: boolean;
  message: string;
  dimensionIds: string[];
}

export interface ArlProfileResult {
  which: 'current' | 'target';
  outcomes: DimensionOutcome[];
  tally: ArlTally;
  byArea: Array<{ area: ArlArea; tally: ArlTally; outcomes: DimensionOutcome[] }>;
  arl: number;
  band: string;
  flags: ArlFlag[];
}

export interface ArlResult {
  start: ArlProfileResult;
  end: ArlProfileResult;
  /** R3-7 */
  label: string;
  targetLabel: string;
  /** ARL End minus ARL Start. */
  change: number;
  frameworkId: string;
  frameworkVersion: string;
}

function emptyTally(): ArlTally {
  return { Low: 0, Medium: 0, High: 0, 'N/A': 0 };
}

function tallyOf(outcomes: DimensionOutcome[]): ArlTally {
  const tally = emptyTally();
  for (const o of outcomes) tally[o.countedAs] += 1;
  return tally;
}

function listIds(ids: string[]): string {
  return ids.join(', ');
}

function profileFlags(which: 'current' | 'target', outcomes: DimensionOutcome[]): ArlFlag[] {
  const flags: ArlFlag[] = [];
  const idsWhere = (test: (o: DimensionOutcome) => boolean) =>
    outcomes.filter(test).map((o) => o.dimension.id);

  const unsure = idsWhere((o) => o.rating === 'Unsure');
  if (unsure.length) {
    flags.push({
      code: 'unsure',
      affectsScore: true,
      message: `"Unsure" at ${listIds(unsure)} — counted as High risk. An unsure rating never counts as a lower risk.`,
      dimensionIds: unsure,
    });
  }
  const notAssessed = idsWhere((o) => o.rating === 'Not assessed');
  if (notAssessed.length) {
    flags.push({
      code: 'not-assessed',
      affectsScore: true,
      message: `${notAssessed.length} of ${outcomes.length} dimensions not assessed (${listIds(notAssessed)}) — counted as High risk.`,
      dimensionIds: notAssessed,
    });
  }
  const naNoRationale = idsWhere((o) => o.rating === 'N/A' && o.countedAs === 'High');
  if (naNoRationale.length) {
    flags.push({
      code: 'na-without-rationale',
      affectsScore: true,
      message: `N/A without a rationale at ${listIds(naNoRationale)} — counted as High risk until the rationale says why the dimension does not apply.`,
      dimensionIds: naNoRationale,
    });
  }
  if (which === 'current') {
    const noRationale = idsWhere(
      (o) =>
        (o.rating === 'Low' || o.rating === 'Medium' || o.rating === 'High') &&
        !o.rationale?.trim(),
    );
    if (noRationale.length) {
      flags.push({
        code: 'no-rationale',
        affectsScore: false,
        message: `Rated without a rationale: ${listIds(noRationale)}. The source asks for the rationale and details behind every rating.`,
        dimensionIds: noRationale,
      });
    }
  } else {
    const noPlan = idsWhere((o) => o.reducesRisk === true && !o.plannedAction?.trim());
    if (noPlan.length) {
      flags.push({
        code: 'no-plan',
        affectsScore: false,
        message: `Risk reduction targeted without a planned action: ${listIds(noPlan)}. Say what the project will do to get there.`,
        dimensionIds: noPlan,
      });
    }
  }
  return flags;
}

/** R3-1 … R3-4 for one profile. */
export function scoreArlProfile(
  framework: ArlFramework,
  data: ArlData,
  which: 'current' | 'target',
): ArlProfileResult {
  const byId = new Map(data.dimensions.map((d) => [d.dimensionId, d]));
  const outcomes: DimensionOutcome[] = framework.dimensions.map((dimension) => {
    const assessment = byId.get(dimension.id);
    const rationale = assessment?.rationale;
    const current: ArlRating = assessment?.current ?? 'Not assessed';
    let rating = current;
    let inherited: boolean | undefined;
    let reducesRisk: boolean | undefined;
    const counted = (r: ArlRating) => countedAs(r, rationale);
    if (which === 'target') {
      const target = effectiveTarget(assessment);
      rating = target.rating;
      inherited = target.inherited;
      reducesRisk = !target.inherited && isRiskReduction(counted(current), counted(rating));
    }
    const reason = conservativeReason(rating, rationale);
    return {
      dimension,
      rating,
      countedAs: counted(rating),
      ...(reason ? { conservativeReason: reason } : {}),
      ...(inherited !== undefined ? { inherited } : {}),
      ...(reducesRisk !== undefined ? { reducesRisk } : {}),
      ...(rationale !== undefined ? { rationale } : {}),
      ...(assessment?.evidence !== undefined ? { evidence: assessment.evidence } : {}),
      ...(assessment?.plannedAction !== undefined
        ? { plannedAction: assessment.plannedAction }
        : {}),
    };
  });

  const tally = tallyOf(outcomes);
  const arl = lookupArl(framework, tally.Medium, tally.High);
  return {
    which,
    outcomes,
    tally,
    byArea: framework.areas.map((area) => {
      const inArea = outcomes.filter((o) => o.dimension.areaId === area.id);
      return { area, tally: tallyOf(inArea), outcomes: inArea };
    }),
    arl,
    band: readinessBand(framework, arl),
    flags: profileFlags(which, outcomes),
  };
}

/** D-2.3 in full: ARL Start from the current ratings, ARL End from the targets. */
export function scoreArl(framework: ArlFramework, data: ArlData): ArlResult {
  const start = scoreArlProfile(framework, data, 'current');
  const end = scoreArlProfile(framework, data, 'target');
  return {
    start,
    end,
    label: ARL_LABEL,
    targetLabel: ARL_TARGET_LABEL,
    change: end.arl - start.arl,
    frameworkId: framework.id,
    frameworkVersion: framework.version,
  };
}

/** True when the target asks for less risk than the current rating counts as. */
export function isRiskReduction(current: CountedAs, target: CountedAs): boolean {
  return RISK_RANK[target] < RISK_RANK[current];
}
