/**
 * Runtime schemas and types for TRL Assess (BUILD_SPEC D-1).
 * Pure TypeScript — no React, no browser APIs.
 */
import { z } from 'zod';

export const originSchema = z.enum(['verbatim', 'adapted', 'tailored']);
export type Origin = z.infer<typeof originSchema>;

export const trlLevelSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
  z.literal(6),
  z.literal(7),
  z.literal(8),
  z.literal(9),
]);
export type TrlLevel = z.infer<typeof trlLevelSchema>;
export const TRL_LEVELS: readonly TrlLevel[] = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

export const sourceRefSchema = z.object({
  sourceId: z.string().min(1),
  section: z.string().optional(),
  page: z.string().optional(),
  clause: z.string().optional(),
});
export type SourceRef = z.infer<typeof sourceRefSchema>;

export const frameworkSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  version: z.string().min(1),
  description: z.string().min(1),
  sources: z.array(z.string().min(1)).min(1),
  disclaimer: z.string().min(1),
  extends: z.string().min(1).optional(),
  shortDescription: z.string().optional(),
});
export type Framework = z.infer<typeof frameworkSchema>;

export const tier1QuestionSchema = z.object({
  id: z.string().min(1),
  level: trlLevelSchema,
  text: z.string().min(1),
  helpText: z.string().optional(),
  source: sourceRefSchema,
  origin: originSchema,
  rationale: z.string().optional(),
});
export type Tier1Question = z.infer<typeof tier1QuestionSchema>;

export const evidenceTypeSchema = z.enum([
  'Document',
  'Test data',
  'Code repository',
  'Drawing/CAD',
  'Photo/Video',
  'Publication (DOI)',
  'Web link',
  'Other',
]);
export type EvidenceType = z.infer<typeof evidenceTypeSchema>;
export const EVIDENCE_TYPES = evidenceTypeSchema.options;

export const cteKindSchema = z.enum(['hardware', 'software', 'process']);
export type CteKind = z.infer<typeof cteKindSchema>;
export const CTE_KINDS = cteKindSchema.options;

export const tier2CriterionSchema = z.object({
  id: z.string().min(1),
  level: trlLevelSchema,
  text: z.string().min(1),
  guidance: z.string().optional(),
  category: z.string().optional(),
  appliesTo: z.array(cteKindSchema).min(1).optional(),
  mandatory: z.boolean(),
  mandatoryBasis: z.string().optional(),
  evidenceHints: z.array(evidenceTypeSchema).optional(),
  source: sourceRefSchema,
  origin: originSchema,
  rationale: z.string().optional(),
  refId: z.string().optional(),
});
export type Tier2Criterion = z.infer<typeof tier2CriterionSchema>;

/** A criterion in an extending framework may reference a base criterion instead of repeating it. */
export const tier2CriterionRefSchema = z.object({
  id: z.string().min(1),
  refId: z.string().min(1),
  mandatory: z.boolean().optional(),
  mandatoryBasis: z.string().optional(),
  guidance: z.string().optional(),
  appliesTo: z.array(cteKindSchema).min(1).optional(),
});
export type Tier2CriterionRef = z.infer<typeof tier2CriterionRefSchema>;

export const tier2EntrySchema = z.union([tier2CriterionSchema, tier2CriterionRefSchema]);
export type Tier2Entry = z.infer<typeof tier2EntrySchema>;

export const markingSchema = z.enum([
  'Public',
  'Internal (unrestricted)',
  'Sensitive — reference only',
]);
export type Marking = z.infer<typeof markingSchema>;
export const MARKINGS = markingSchema.options;
export const SENSITIVE_MARKING: Marking = 'Sensitive — reference only';

export const verificationSchema = z.enum(['Unverified', 'Verified', 'Rejected']);
export type Verification = z.infer<typeof verificationSchema>;
export const VERIFICATIONS = verificationSchema.options;

export const httpUrlSchema = z
  .string()
  .url()
  .refine((u) => /^https?:\/\//i.test(u), { message: 'Only http and https URLs are allowed' });

export const commitShaSchema = z
  .string()
  .regex(/^[0-9a-f]{7,40}$/i, 'Commit SHA must be 7–40 hexadecimal characters');

export const doiSchema = z
  .string()
  .regex(/^10\.\d{4,9}\/\S+$/, 'DOI must look like 10.1234/suffix');

export const evidenceFileSchema = z.object({
  name: z.string().min(1),
  sizeBytes: z.number().int().nonnegative(),
  sha256: z.string().regex(/^[0-9a-f]{64}$/i),
  mime: z.string().optional(),
  blobKey: z.string().min(1),
});
export type EvidenceFile = z.infer<typeof evidenceFileSchema>;

export const linkedCriterionSchema = z.object({
  cteId: z.string().min(1),
  criterionId: z.string().min(1),
});
export type LinkedCriterion = z.infer<typeof linkedCriterionSchema>;

export const evidenceItemSchema = z
  .object({
    id: z.string().regex(/^EV-\d{4,}$/),
    type: evidenceTypeSchema,
    title: z.string().min(1),
    description: z.string().optional(),
    date: z.string().optional(),
    owner: z.string().optional(),
    url: httpUrlSchema.optional(),
    repoUrl: httpUrlSchema.optional(),
    commitSha: commitShaSchema.optional(),
    repoPath: z.string().optional(),
    tag: z.string().optional(),
    doi: doiSchema.optional(),
    citation: z.string().optional(),
    file: evidenceFileSchema.optional(),
    marking: markingSchema,
    verification: verificationSchema,
    verifiedBy: z.string().optional(),
    verifiedDate: z.string().optional(),
    linkedCriteria: z.array(linkedCriterionSchema),
  })
  .refine((e) => !(e.marking === SENSITIVE_MARKING && e.file), {
    message: 'Evidence marked "Sensitive — reference only" must not carry a file',
    path: ['file'],
  });
export type EvidenceItem = z.infer<typeof evidenceItemSchema>;

export const criterionStatusSchema = z.enum([
  'Met',
  'Partially met',
  'Not met',
  'N/A',
  'Not assessed',
]);
export type CriterionStatus = z.infer<typeof criterionStatusSchema>;
export const CRITERION_STATUSES = criterionStatusSchema.options;

export const criterionAssessmentSchema = z.object({
  cteId: z.string().min(1),
  criterionId: z.string().min(1),
  status: criterionStatusSchema,
  justification: z.string().optional(),
  note: z.string().optional(),
  additionalEvidencePlaceholder: z.string().optional(),
});
export type CriterionAssessment = z.infer<typeof criterionAssessmentSchema>;

export const cteSchema = z.object({
  id: z.string().regex(/^CTE-\d{2,}$/),
  name: z.string().min(1),
  description: z.string().optional(),
  whyCritical: z.string().optional(),
  critical: z.boolean(),
  targetTrl: trlLevelSchema.optional(),
  owner: z.string().optional(),
  kind: cteKindSchema.optional(),
});
export type Cte = z.infer<typeof cteSchema>;

export const environmentSchema = z.enum(['E0', 'E1', 'E2', 'E3', 'E4']);
export type EnvironmentCode = z.infer<typeof environmentSchema>;
export const ENVIRONMENT_CODES = environmentSchema.options;

export const buildSchema = z.enum(['B0', 'B1', 'B2', 'B3', 'B4', 'B5']);
export type BuildCode = z.infer<typeof buildSchema>;
export const BUILD_CODES = buildSchema.options;

export const answerValueSchema = z.enum(['Yes', 'No', 'Unsure']);
export type AnswerValue = z.infer<typeof answerValueSchema>;

export const tier1ContextSchema = z.object({
  projectName: z.string(),
  technologyName: z.string(),
  assessorName: z.string(),
  assessorRole: z.string().optional(),
  organization: z.string().optional(),
  oneLineDescription: z.string().optional(),
  highestFidelityTest: z.string().optional(),
  testLocation: z.string().optional(),
  testDate: z.string().optional(),
  environment: environmentSchema,
  build: buildSchema,
});
export type Tier1Context = z.infer<typeof tier1ContextSchema>;

export const tier1AnswersSchema = z.object({
  context: tier1ContextSchema,
  answers: z.record(
    z.string(),
    z.object({ value: answerValueSchema, note: z.string().optional() }),
  ),
});
export type Tier1Answers = z.infer<typeof tier1AnswersSchema>;

export const gapActionSchema = z.object({
  cteId: z.string().min(1),
  nextLevel: trlLevelSchema,
  criterionId: z.string().optional(),
  action: z.string(),
  owner: z.string().optional(),
  dueDate: z.string().optional(),
});
export type GapAction = z.infer<typeof gapActionSchema>;

export const tier2DataSchema = z.object({
  ctes: z.array(cteSchema),
  assessments: z.array(criterionAssessmentSchema),
  evidence: z.array(evidenceItemSchema),
  gapActions: z.array(gapActionSchema),
});
export type Tier2Data = z.infer<typeof tier2DataSchema>;

/*
 * ARL side module (BUILD_SPEC D-1.1, ADR-0005). The rubric is data transcribed from the DOE
 * Adoption Readiness Assessment; the session only records the assessor's ratings.
 */

/** The ratings the DOE rubric defines for a dimension. */
export const arlRiskSchema = z.enum(['Low', 'Medium', 'High']);
export type ArlRisk = z.infer<typeof arlRiskSchema>;
export const ARL_RISKS = arlRiskSchema.options;

/** What an assessor can record: the rubric's three ratings and N/A, plus this tool's two non-answers. */
export const arlRatingSchema = z.enum(['Low', 'Medium', 'High', 'N/A', 'Unsure', 'Not assessed']);
export type ArlRating = z.infer<typeof arlRatingSchema>;
export const ARL_RATINGS = arlRatingSchema.options;

export const arlLevelSchema = z.number().int().min(1).max(9);

export const arlAreaSchema = z.object({
  id: z.string().regex(/^[A-Z]$/),
  name: z.string().min(1),
  description: z.string().min(1),
  source: sourceRefSchema,
  origin: originSchema,
  rationale: z.string().optional(),
});
export type ArlArea = z.infer<typeof arlAreaSchema>;

export const arlDimensionSchema = z.object({
  id: z.string().regex(/^ARL-[A-Z]\d+$/),
  areaId: z.string().regex(/^[A-Z]$/),
  number: z.number().int().positive(),
  title: z.string().min(1),
  description: z.string().min(1),
  levels: z.object({
    Low: z.string().min(1),
    Medium: z.string().min(1),
    High: z.string().min(1),
  }),
  source: sourceRefSchema,
  origin: originSchema,
  rationale: z.string().optional(),
});
export type ArlDimension = z.infer<typeof arlDimensionSchema>;

export const arlGuidanceSchema = z.object({
  id: z.string().min(1),
  label: z.string().optional(),
  text: z.string().min(1),
  source: sourceRefSchema,
  origin: originSchema,
});
export type ArlGuidance = z.infer<typeof arlGuidanceSchema>;

export const arlFrameworkSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  shortDescription: z.string().optional(),
  version: z.string().min(1),
  description: z.string().min(1),
  sources: z.array(z.string().min(1)).min(1),
  disclaimer: z.string().min(1),
  areas: z.array(arlAreaSchema).min(1),
  dimensions: z.array(arlDimensionSchema).min(1),
  lookup: z.object({
    rowAxis: z.literal('Medium'),
    columnAxis: z.literal('High'),
    /** The last row and column hold every count at or above `cap` (the source's "8+"). */
    cap: z.number().int().positive(),
    table: z.array(z.array(arlLevelSchema)),
    source: sourceRefSchema,
    origin: originSchema,
  }),
  bands: z
    .array(z.object({ min: arlLevelSchema, max: arlLevelSchema, label: z.string().min(1) }))
    .min(1),
  bandsSource: sourceRefSchema,
  guidance: z.array(arlGuidanceSchema),
});
export type ArlFramework = z.infer<typeof arlFrameworkSchema>;

export const arlDimensionAssessmentSchema = z.object({
  dimensionId: z.string().min(1),
  current: arlRatingSchema,
  /** End-of-project target. Absent means "same as the current rating". */
  target: arlRiskSchema.optional(),
  rationale: z.string().optional(),
  evidence: z.string().optional(),
  plannedAction: z.string().optional(),
});
export type ArlDimensionAssessment = z.infer<typeof arlDimensionAssessmentSchema>;

export const arlContextSchema = z.object({
  projectName: z.string(),
  technologyName: z.string(),
  assessorName: z.string(),
  organization: z.string().optional(),
  technologyScope: z.string().optional(),
  valueChainScope: z.string().optional(),
  evaluationTimeline: z.string().optional(),
  policyEnvironment: z.string().optional(),
});
export type ArlContext = z.infer<typeof arlContextSchema>;

export const arlDataSchema = z.object({
  frameworkId: z.string().min(1),
  frameworkVersion: z.string().min(1),
  context: arlContextSchema,
  dimensions: z.array(arlDimensionAssessmentSchema),
});
export type ArlData = z.infer<typeof arlDataSchema>;

export const assessmentSessionSchema = z.object({
  schemaVersion: z.number().int().positive(),
  appVersion: z.string(),
  gitSha: z.string(),
  frameworkId: z.string().min(1),
  frameworkVersion: z.string().min(1),
  createdAt: z.string(),
  updatedAt: z.string(),
  tier1: tier1AnswersSchema.optional(),
  tier2: tier2DataSchema.optional(),
  arl: arlDataSchema.optional(),
});
export type AssessmentSession = z.infer<typeof assessmentSessionSchema>;

/** Tier 1 heuristic matrix (BUILD_SPEC D-2.1) — a tailored aid, not a standard. */
export const tier1MatrixSchema = z.object({
  id: z.string().min(1),
  status: z.string().min(1),
  note: z.string().min(1),
  environments: z.array(z.object({ code: environmentSchema, label: z.string(), help: z.string() })),
  builds: z.array(z.object({ code: buildSchema, label: z.string(), help: z.string() })),
  matrix: z.record(z.string(), z.record(z.string(), z.number().int().min(0).max(9))),
});
export type Tier1Matrix = z.infer<typeof tier1MatrixSchema>;

/** A source document listed in docs/sources/SOURCES.md. */
export const sourceDocSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  issuer: z.string().min(1),
  version: z.string().optional(),
  url: z.string().optional(),
  retrieved: z.string().optional(),
  publicDomain: z.boolean(),
  note: z.string().optional(),
  quotable: z.boolean(),
});
export type SourceDoc = z.infer<typeof sourceDocSchema>;

export const frameworkBundleSchema = z.object({
  framework: frameworkSchema,
  tier1: z.array(tier1QuestionSchema),
  tier2: z.array(tier2EntrySchema),
  matrix: tier1MatrixSchema,
});
export type FrameworkBundle = z.infer<typeof frameworkBundleSchema>;

export function isCriterionRef(entry: Tier2Entry): entry is Tier2CriterionRef {
  return !('text' in entry) && typeof (entry as Tier2CriterionRef).refId === 'string';
}
