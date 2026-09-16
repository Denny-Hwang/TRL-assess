/**
 * Framework loading and `extends` resolution (BUILD_SPEC D-1).
 * Pure functions over the JSON registry — no React, no browser APIs.
 */
import {
  frameworkSchema,
  tier1QuestionSchema,
  tier2CriterionSchema,
  tier2CriterionRefSchema,
  tier1MatrixSchema,
  TRL_LEVELS,
  type Framework,
  type Tier1Question,
  type Tier1Matrix,
  type Tier2Criterion,
  type TrlLevel,
} from './schemas';
import { RAW_FRAMEWORKS, type RawFrameworkBundle } from '@/data/frameworks';
import { z } from 'zod';

export interface ResolvedFramework {
  framework: Framework;
  tier1: Tier1Question[];
  tier2: Tier2Criterion[];
  matrix: Tier1Matrix;
}

export class FrameworkError extends Error {
  constructor(
    message: string,
    readonly frameworkId: string,
  ) {
    super(message);
    this.name = 'FrameworkError';
  }
}

const tier1ArraySchema = z.array(tier1QuestionSchema);
const tier2ArraySchema = z.array(z.union([tier2CriterionSchema, tier2CriterionRefSchema]));

function parseBundle(id: string, raw: RawFrameworkBundle) {
  const framework = frameworkSchema.parse(raw.framework);
  if (framework.id !== id) {
    throw new FrameworkError(
      `framework.json declares id "${framework.id}" but lives in "${id}"`,
      id,
    );
  }
  return {
    framework,
    tier1: tier1ArraySchema.parse(raw.tier1),
    tier2: tier2ArraySchema.parse(raw.tier2),
    matrix: tier1MatrixSchema.parse(raw.matrix),
  };
}

/**
 * Resolve a framework, replacing `refId` entries with the referenced criterion from the
 * framework it extends. Overrides (`mandatory`, `mandatoryBasis`, `guidance`, `appliesTo`)
 * are applied on top; the criterion text, source and origin always come from the base so that
 * provenance cannot be rewritten by an extending framework.
 */
export function resolveFramework(
  id: string,
  registry: Record<string, RawFrameworkBundle> = RAW_FRAMEWORKS,
  seen: string[] = [],
): ResolvedFramework {
  const raw = registry[id];
  if (!raw) throw new FrameworkError(`Unknown framework "${id}"`, id);
  if (seen.includes(id)) {
    throw new FrameworkError(`Circular extends chain: ${[...seen, id].join(' → ')}`, id);
  }
  const bundle = parseBundle(id, raw);

  let baseCriteria: Map<string, Tier2Criterion> = new Map();
  if (bundle.framework.extends) {
    const base = resolveFramework(bundle.framework.extends, registry, [...seen, id]);
    baseCriteria = new Map(base.tier2.map((c) => [c.id, c]));
    // A base criterion may also be addressed by the id it had before being re-exported.
    for (const c of base.tier2) if (c.refId) baseCriteria.set(c.refId, c);
  }

  const tier2: Tier2Criterion[] = bundle.tier2.map((entry) => {
    if ('text' in entry) return entry;
    const base = baseCriteria.get(entry.refId);
    if (!base) {
      throw new FrameworkError(
        `Criterion "${entry.id}" references "${entry.refId}", which does not exist in ${
          bundle.framework.extends ?? '(no extended framework)'
        }`,
        id,
      );
    }
    return {
      ...base,
      id: entry.id,
      refId: entry.refId,
      mandatory: entry.mandatory ?? base.mandatory,
      ...(entry.mandatoryBasis !== undefined ? { mandatoryBasis: entry.mandatoryBasis } : {}),
      ...(entry.guidance !== undefined ? { guidance: entry.guidance } : {}),
      ...(entry.appliesTo !== undefined ? { appliesTo: entry.appliesTo } : {}),
    };
  });

  const ids = new Set<string>();
  for (const c of tier2) {
    if (ids.has(c.id)) throw new FrameworkError(`Duplicate criterion id "${c.id}"`, id);
    ids.add(c.id);
  }

  return {
    framework: bundle.framework,
    tier1: [...bundle.tier1].sort((a, b) => b.level - a.level),
    tier2: [...tier2].sort((a, b) => a.level - b.level || a.id.localeCompare(b.id)),
    matrix: bundle.matrix,
  };
}

export function listFrameworks(
  registry: Record<string, RawFrameworkBundle> = RAW_FRAMEWORKS,
): Framework[] {
  return Object.keys(registry)
    .map((id) => resolveFramework(id, registry).framework)
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Tier 1 questions ordered TRL 9 → 1, the order the DoD/DOE screening method uses. */
export function tier1QuestionsTopDown(f: ResolvedFramework): Tier1Question[] {
  return [...f.tier1].sort((a, b) => b.level - a.level);
}

export function criteriaByLevel(f: ResolvedFramework, level: TrlLevel): Tier2Criterion[] {
  return f.tier2.filter((c) => c.level === level);
}

export function levelsWithCriteria(f: ResolvedFramework): TrlLevel[] {
  return TRL_LEVELS.filter((l) => f.tier2.some((c) => c.level === l));
}
