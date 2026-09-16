# Changelog

All notable changes to this project are documented here.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Phase 0: project bootstrap — Vite + React + TypeScript (strict), Tailwind, ESLint, Prettier,
  Vitest, Playwright.
- Central configuration module `src/config/app.config.ts`.
- App shell with HashRouter navigation, footer build metadata and a dismissible
  sensitive-data notice.
- Content-Security-Policy meta tag restricting the app to same-origin resources.
- CI workflow (lint, typecheck, unit tests, criteria validation, build, Playwright e2e) and a
  GitHub Pages deploy workflow.
- ExcelJS library spike proving hyperlink, list validation, `HYPERLINK()` formula, freeze panes,
  conditional formatting and relative-hyperlink round-trips (ADR-0001).
- Repository governance files: CLAUDE.md, docs/PROGRESS.md, SECURITY.md, CONTRIBUTING.md,
  PR and issue templates.
- Phase 1: zod schemas and TypeScript types for the whole data model (BUILD_SPEC D-1).
- Framework `dod-tra-2025` — 58 Tier 2 criteria transcribed verbatim from the DoD Technology
  Readiness Assessment Guidebook (Feb 2025) Tables 2-1 and 2-2 and the Section 2 environment
  criteria, plus 9 adapted Tier 1 screening questions.
- Framework `marine-energy-eere` (default) — Tier 1 questions adapted from EERE R 540.112-02,
  Tier 2 referencing the DoD criteria plus 8 marine/ocean tailoring items with rationales.
- Tier 1 heuristic matrix (BUILD_SPEC D-2.1) with plain-language environment and build descriptions.
- `docs/sources/SOURCES.md` with SHA-256 hashes, quotability flags and transcription notes, mirrored
  in `src/data/sources.ts`.
- `npm run validate:criteria` — schema, unique ids, level coverage, provenance and ISO-quotation
  checks, with negative-fixture tests.
- ADR-0002 recording the framework data model and the substitution of the DoD guidebook for the
  unavailable DOE G 413.3-4A.
- Phase 2: Tier 1 scoring engine implementing BUILD_SPEC D-2.1 (first-yes, contiguous, matrix
  cross-check, gap and unsure flags, consistency rating).
- Tier 2 scoring engine implementing D-2.2 (criterion satisfaction, level achievement with
  contiguity and lock state, CTE TRL, next-level completeness, conservative system summary with
  limiting CTEs, evidence coverage, tier delta) plus gap analysis.
- Session model with immutable update helpers, schema migration hooks and typed version errors.
- Persistence: debounced session autosave to localStorage, evidence blobs in IndexedDB, typed
  quota and storage-unavailable errors, and "Clear all local data".
- Lossless JSON export/import with provenance envelope and version-mismatch warnings.
- SHA-256 helper over Web Crypto, and stable EV-/CTE- id generators.
- Fictional wave-buoy example session (3 CTEs, 10 evidence items, no real data).
