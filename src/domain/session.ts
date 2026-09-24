/**
 * Session model, immutable update helpers and schema migration (BUILD_SPEC D-1, Phase 2 task 4).
 */
import { APP_VERSION, GIT_SHA, SCHEMA_VERSION } from '@/config/app.config';
import { nextCteId, nextEvidenceId } from './ids';
import {
  assessmentSessionSchema,
  type ArlCall,
  type ArlData,
  type ArlDimensionAssessment,
  type AssessmentSession,
  type CriterionAssessment,
  type Cte,
  type EvidenceItem,
  type GapAction,
  type Tier1Answers,
  type Tier2Data,
} from './schemas';

export const EMPTY_TIER2: Tier2Data = { ctes: [], assessments: [], evidence: [], gapActions: [] };

export function nowIso(): string {
  return new Date().toISOString();
}

export function createSession(
  frameworkId: string,
  frameworkVersion: string,
  at: string = nowIso(),
): AssessmentSession {
  return {
    schemaVersion: SCHEMA_VERSION,
    appVersion: APP_VERSION,
    gitSha: GIT_SHA,
    frameworkId,
    frameworkVersion,
    createdAt: at,
    updatedAt: at,
  };
}

function touch(session: AssessmentSession): AssessmentSession {
  return { ...session, updatedAt: nowIso(), appVersion: APP_VERSION, gitSha: GIT_SHA };
}

export function setTier1(session: AssessmentSession, tier1: Tier1Answers): AssessmentSession {
  return touch({ ...session, tier1 });
}

export function setAnswer(
  session: AssessmentSession,
  questionId: string,
  value: Tier1Answers['answers'][string],
): AssessmentSession {
  if (!session.tier1) throw new Error('Tier 1 context must be set before answering questions');
  return touch({
    ...session,
    tier1: { ...session.tier1, answers: { ...session.tier1.answers, [questionId]: value } },
  });
}

function withTier2(session: AssessmentSession, tier2: Tier2Data): AssessmentSession {
  return touch({ ...session, tier2 });
}

export function tier2Of(session: AssessmentSession): Tier2Data {
  return session.tier2 ?? EMPTY_TIER2;
}

export function addCte(session: AssessmentSession, cte: Omit<Cte, 'id'>): AssessmentSession {
  const tier2 = tier2Of(session);
  const id = nextCteId(tier2.ctes.map((c) => c.id));
  return withTier2(session, { ...tier2, ctes: [...tier2.ctes, { ...cte, id }] });
}

export function updateCte(
  session: AssessmentSession,
  id: string,
  patch: Partial<Omit<Cte, 'id'>>,
): AssessmentSession {
  const tier2 = tier2Of(session);
  return withTier2(session, {
    ...tier2,
    ctes: tier2.ctes.map((c) => (c.id === id ? { ...c, ...patch } : c)),
  });
}

/** Removing a CTE also removes its assessments, its gap actions and any evidence links to it. */
export function removeCte(session: AssessmentSession, id: string): AssessmentSession {
  const tier2 = tier2Of(session);
  return withTier2(session, {
    ctes: tier2.ctes.filter((c) => c.id !== id),
    assessments: tier2.assessments.filter((a) => a.cteId !== id),
    gapActions: tier2.gapActions.filter((g) => g.cteId !== id),
    evidence: tier2.evidence.map((e) => ({
      ...e,
      linkedCriteria: e.linkedCriteria.filter((l) => l.cteId !== id),
    })),
  });
}

export function reorderCtes(session: AssessmentSession, orderedIds: string[]): AssessmentSession {
  const tier2 = tier2Of(session);
  const byId = new Map(tier2.ctes.map((c) => [c.id, c]));
  const ordered = orderedIds.map((id) => byId.get(id)).filter((c): c is Cte => Boolean(c));
  const rest = tier2.ctes.filter((c) => !orderedIds.includes(c.id));
  return withTier2(session, { ...tier2, ctes: [...ordered, ...rest] });
}

export function setAssessment(
  session: AssessmentSession,
  assessment: CriterionAssessment,
): AssessmentSession {
  const tier2 = tier2Of(session);
  const exists = tier2.assessments.some(
    (a) => a.cteId === assessment.cteId && a.criterionId === assessment.criterionId,
  );
  return withTier2(session, {
    ...tier2,
    assessments: exists
      ? tier2.assessments.map((a) =>
          a.cteId === assessment.cteId && a.criterionId === assessment.criterionId
            ? { ...a, ...assessment }
            : a,
        )
      : [...tier2.assessments, assessment],
  });
}

export function addEvidence(
  session: AssessmentSession,
  evidence: Omit<EvidenceItem, 'id'>,
): { session: AssessmentSession; id: string } {
  const tier2 = tier2Of(session);
  const id = nextEvidenceId(tier2.evidence.map((e) => e.id));
  return {
    session: withTier2(session, { ...tier2, evidence: [...tier2.evidence, { ...evidence, id }] }),
    id,
  };
}

export function updateEvidence(
  session: AssessmentSession,
  id: string,
  patch: Partial<Omit<EvidenceItem, 'id'>>,
): AssessmentSession {
  const tier2 = tier2Of(session);
  return withTier2(session, {
    ...tier2,
    evidence: tier2.evidence.map((e) => (e.id === id ? { ...e, ...patch } : e)),
  });
}

export function removeEvidence(session: AssessmentSession, id: string): AssessmentSession {
  const tier2 = tier2Of(session);
  return withTier2(session, {
    ...tier2,
    evidence: tier2.evidence.filter((e) => e.id !== id),
  });
}

export function linkEvidence(
  session: AssessmentSession,
  evidenceId: string,
  cteId: string,
  criterionId: string,
): AssessmentSession {
  const tier2 = tier2Of(session);
  return withTier2(session, {
    ...tier2,
    evidence: tier2.evidence.map((e) => {
      if (e.id !== evidenceId) return e;
      if (e.linkedCriteria.some((l) => l.cteId === cteId && l.criterionId === criterionId))
        return e;
      return { ...e, linkedCriteria: [...e.linkedCriteria, { cteId, criterionId }] };
    }),
  });
}

export function unlinkEvidence(
  session: AssessmentSession,
  evidenceId: string,
  cteId: string,
  criterionId: string,
): AssessmentSession {
  const tier2 = tier2Of(session);
  return withTier2(session, {
    ...tier2,
    evidence: tier2.evidence.map((e) =>
      e.id === evidenceId
        ? {
            ...e,
            linkedCriteria: e.linkedCriteria.filter(
              (l) => !(l.cteId === cteId && l.criterionId === criterionId),
            ),
          }
        : e,
    ),
  });
}

export function setGapActions(
  session: AssessmentSession,
  gapActions: GapAction[],
): AssessmentSession {
  return withTier2(session, { ...tier2Of(session), gapActions });
}

/** Evidence that is linked to a criterion of a CTE. */
export function evidenceFor(
  session: AssessmentSession,
  cteId: string,
  criterionId: string,
): EvidenceItem[] {
  return tier2Of(session).evidence.filter((e) =>
    e.linkedCriteria.some((l) => l.cteId === cteId && l.criterionId === criterionId),
  );
}

/* ARL side module (ADR-0005) — kept apart from the TRL tiers so neither can change the other. */

export function setArl(session: AssessmentSession, arl: ArlData): AssessmentSession {
  return touch({ ...session, arl });
}

/** Records one dimension's rating; fields left out of the patch keep their current value. */
export function setArlDimension(
  session: AssessmentSession,
  patch: Pick<ArlDimensionAssessment, 'dimensionId'> & Partial<ArlDimensionAssessment>,
): AssessmentSession {
  if (!session.arl) throw new Error('The ARL scope must be set before rating dimensions');
  const existing = session.arl.dimensions.find((d) => d.dimensionId === patch.dimensionId);
  const merged: ArlDimensionAssessment = {
    ...(existing ?? { dimensionId: patch.dimensionId, current: 'Not assessed' as const }),
    ...patch,
  };
  // An explicit `target: undefined` means "same as current" and is dropped, not stored.
  if (merged.target === undefined) delete merged.target;
  return touch({
    ...session,
    arl: {
      ...session.arl,
      dimensions: existing
        ? session.arl.dimensions.map((d) => (d.dimensionId === patch.dimensionId ? merged : d))
        : [...session.arl.dimensions, merged],
    },
  });
}

export function setArlCall(
  session: AssessmentSession,
  call: ArlCall | undefined,
): AssessmentSession {
  if (!session.arl) throw new Error('The ARL scope must be set before choosing a call profile');
  const { call: _previous, ...rest } = session.arl;
  return touch({ ...session, arl: call ? { ...rest, call } : rest });
}

export function clearArl(session: AssessmentSession): AssessmentSession {
  const { arl: _removed, ...rest } = session;
  return touch(rest);
}

export class SessionVersionError extends Error {
  constructor(
    message: string,
    readonly found: number,
    readonly expected: number,
  ) {
    super(message);
    this.name = 'SessionVersionError';
  }
}

/**
 * Migration hooks. Each entry upgrades a session from version N to N+1.
 * v1 → v2: v2 adds the optional `arl` block (ADR-0005); a v1 session is valid v2 as it stands.
 */
export const MIGRATIONS: Record<number, (input: unknown) => unknown> = {
  1: (input) => ({ ...(input as object), schemaVersion: 2 }),
};

export function migrate(input: unknown): unknown {
  let current = input as { schemaVersion?: number };
  let version = typeof current?.schemaVersion === 'number' ? current.schemaVersion : 0;
  while (version < SCHEMA_VERSION) {
    const step = MIGRATIONS[version];
    if (!step) {
      throw new SessionVersionError(
        `This file uses session schema version ${version}, which this version of the app cannot ` +
          `upgrade (it expects version ${SCHEMA_VERSION}).`,
        version,
        SCHEMA_VERSION,
      );
    }
    current = step(current) as { schemaVersion?: number };
    version = current.schemaVersion ?? version + 1;
  }
  if (version > SCHEMA_VERSION) {
    throw new SessionVersionError(
      `This file was written by a newer version of ${'TRL Assess'} (session schema ${version}; ` +
        `this build understands ${SCHEMA_VERSION}). Update the app, or export again from the older build.`,
      version,
      SCHEMA_VERSION,
    );
  }
  return current;
}

export function parseSession(input: unknown): AssessmentSession {
  return assessmentSessionSchema.parse(migrate(input));
}
