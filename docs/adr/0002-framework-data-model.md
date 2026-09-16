# ADR-0002: Framework data model, provenance and the DoD base framework

- Status: Accepted
- Date: 2026-09-16
- Phase: 1

## Context

BUILD_SPEC D-1 defines the data model; Part A principle 2 forbids fabricated criteria. Phase 1 was
specified to build two frameworks: `doe-g413-3-4a` (generic, transcribed from DOE G 413.3-4A
Appendix F) and `marine-energy-eere` (default, extending it).

The build environment's egress proxy denies `directives.doe.gov`, `energy.gov` and `gao.gov`
(HTTP 403 on CONNECT), so DOE G 413.3-4A and GAO-20-48G could not be downloaded. The project owner
supplied three documents manually: EERE R 540.112-02, the DoD TRA Guidebook (Feb 2025) and the DoD
MRL Matrix (2018).

## Decisions

### 1. The generic base framework is `dod-tra-2025`, not `doe-g413-3-4a`

The DoD TRA Guidebook is a U.S. Government public-domain document that carries complete TRL 1–9
definitions for hardware (Table 2-1) and software (Table 2-2) plus explicit relevant/operational
environment criteria (Section 2). It is therefore usable for `verbatim` transcription today,
whereas DOE G 413.3-4A is not available at all.

`doe-g413-3-4a` remains listed in `docs/sources/SOURCES.md` as **not obtained**. No content is
attributed to it, and adding an Appendix F framework later is tracked as follow-up work.

### 2. Frameworks are data, not code

Each framework lives in `src/data/frameworks/<id>/` as four JSON files (`framework.json`,
`tier1.json`, `tier2.json`, `tier1-matrix.json`), registered in `src/data/frameworks/index.ts` and
validated with zod at load time by `src/domain/frameworks.ts`. A contributor can correct a
criterion without touching TypeScript.

### 3. `extends` resolves by reference, and cannot rewrite provenance

An extending framework lists `{ id, refId, mandatory?, mandatoryBasis?, guidance?, appliesTo? }`
instead of repeating text. `resolveFramework` copies the base criterion and applies only those
overrides: `text`, `source` and `origin` always come from the base. An extending framework can
therefore change how a criterion is _used_, never what the source is claimed to say.

### 4. `mandatory` is only asserted where a source or a rationale supports it

The DoD guidebook does not classify criteria as mandatory or optional, so every criterion in
`dod-tra-2025` is `mandatory: false` with `mandatoryBasis: "not specified in source"`, exactly as
BUILD_SPEC Phase 1 task 3 requires. The validator prints a warning that D-2.2 R2-4 will flag all of
its levels as "No mandatory criteria — needs assessor confirmation".

`marine-energy-eere` is explicitly a tailored framework, so it promotes the level-defining
criterion at each TRL (`DOD-T2-L{n}-01` and `DOD-T2-SW-L{n}-01`) to mandatory with a
`mandatoryBasis` that states the promotion is this framework's decision, and marks its eight
tailored items mandatory with rationales. This is listed in `docs/PROGRESS.md` for the owner's
review.

### 5. `process` CTEs use the hardware table

The DoD tables cover hardware and software. Criteria from Table 2-1 are offered to CTEs of kind
`hardware` and `process`; Table 2-2 criteria to `software`. The mapping of `process` onto the
hardware table is a decision of this tool, stated in the framework description, not a claim about
the source. (The EERE definitions, which the default framework's Tier 1 follows, do speak of
"component and/or process" at TRL 4–6.)

### 6. TRL 9 in the marine framework comes from the DoD table

EERE R 540.112-02 as retrieved defines TRL 1–8 only. The TRL 9 screening question is adapted from
DoD Table 2-1 p. 7; the substitution is visible in the question's help text in the app and recorded
in SOURCES.md.

## Consequences

- Every framework item is traceable to a document the project actually holds, with a page number.
- Adding the DOE Appendix F framework later is additive: a new folder plus a registry entry.
- `npm run validate:criteria` enforces the provenance rules in CI, including the ISO rule (clause
  references only, never text).
