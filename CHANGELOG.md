# Changelog

All notable changes to this project are documented here.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- A diagram layer (`src/components/viz/`) so the app shows its reasoning instead of describing it:
  the TRL ladder (filled where confirmed, hatched where a level was claimed over an unconfirmed
  one), the answer rail while answering Tier 1, shape-first status glyphs with a legend, per-level
  segmented bars, completeness and coverage meters, the build × environment cross-check as a grid,
  and per-CTE bars with the system-summary line.
- Twelve figures in the Guide, referenced from Markdown with a `:::figure id:::` line and resolved
  through a registry, including a CTE decomposition tree, the "what makes a criterion count"
  decision flow, an environment-fidelity ladder, a workbook sheet map, the framework relationship
  and the stage ↔ TRL crosswalk.
- A three-step flow and the ladder on the home page.
- ADR-0004 recording why the layer is hand-rolled SVG with no chart library.

### Changed

- Guide prose cut by about a third (paragraph text 4,272 → 2,713 words): figures replaced the
  paragraphs that described them, several prose passages became tables, and duplicated explanations
  across pages now point at one another.
- Source references under each criterion are shortened to `doc · section · page`, with the full
  reference in the tooltip.
- The Tier 2 results page leads with the per-CTE chart; the table no longer repeats it.

## [1.0.0] - 2026-09-16

First release. Phases 0–9 of `docs/spec/BUILD_SPEC.md` are complete: 311 unit and component tests,
27 end-to-end tests, zero serious or critical accessibility violations, and a documented final audit
in `docs/final-audit.md`.

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
- Phase 3: Tier 1 "Quick Estimate" UI at `/quick` — framework selector, context step, screening
  questions presented TRL 9 → 1 with Yes / No / Unsure, per-question notes, source tooltips,
  Y/N/U keyboard shortcuts and arrow-key navigation, progress and autosave indicators, and a
  confirmed reset.
- Tier 1 result page with the contiguous TRL headline, first-yes and matrix cross-check figures,
  consistency rating, plain-language flags, the honest label and disclaimer, a "what typically
  comes next" list and JSON download.
- zustand session store with debounced localStorage autosave, flushed on page hide.
- Phase 4: shared Excel infrastructure — style tokens, header styling, freeze panes, autofilter,
  column widths, list and whole-number validation, conditional formatting, hyperlink and formula
  helpers, a metadata block writer, the README-sheet writer and D-3.0 file naming.
- Formula-injection guard: any user text written to a cell that starts with `=`, `+`, `-` or `@`
  is prefixed with an apostrophe.
- Tier 1 workbook export (README, Summary, Context, Responses, Next_Evidence_Placeholders,
  References) wired to the "Download Excel" button, with ExcelJS loaded on demand.
- Bundle-budget test asserting ExcelJS and JSZip stay out of the entry chunk.
- Phase 5: Tier 2 "Evidence-Based Assessment" UI at `/assess` — three-pane responsive workbench
  (CTE register | criteria | evidence drawer).
- CTE register: add, edit, reorder, delete (with confirmation and cascade), critical flag, kind,
  target TRL, owner, and "import from the quick estimate".
- Criteria view: collapsible TRL accordions showing achieved / not achieved, completeness, lock
  state and the "no mandatory criteria" flag; per-criterion status, justification (required for
  N/A), assessor note, linked evidence chips, origin and mandatory badges, source references and
  tailoring rationales.
- Evidence library: type-specific fields (file, repo + commit SHA, DOI, URL), SHA-256 on add,
  IndexedDB blob storage with the size limit, marking selector that refuses files for
  "Sensitive — reference only", verification status, link/unlink to criteria and a reverse
  "used by" view.
- Tier 2 results page: per-CTE table, conservative system summary with limiting CTEs, tier delta
  with explanation, gap list, honest label and JSON export/import.
- "Open fictional example" loads the bundled example session after confirmation.
- Phase 6: Tier 2 workbook export (README, Summary, CTE_Register, Criteria_Assessment,
  Evidence_Register, Gap_Actions, Review_Signoff, References, Metadata) with 50 pre-formatted
  blank evidence placeholder rows, 20 blank gap-action rows and an "Additional evidence
  (placeholder)" column on every criterion row.
- Evidence package (.zip): workbook, session JSON, `evidence/` files named
  `<EV-ID>_<sanitized-name>`, `MANIFEST.sha256.txt` covering every packaged file, and a README
  with hash-verification commands for Linux/macOS and Windows.
- Inside the package the workbook's "Local file (relative path)" cells hyperlink to `evidence/…`,
  so links work once the folder is unzipped; standalone exports mark those files "not bundled".
- Pre-flight size check against the 250 MB package limit with per-file sizes, and progress
  messages while the package is built.
- Evidence marked "Sensitive — reference only" is listed but never bundled.
- Structural changes (adding a CTE or evidence, linking, importing) now persist immediately
  instead of waiting for the autosave debounce.
- Favicon.
- Phase 7: full README following the specified outline, with a Mermaid flow diagram and three
  screenshots captured by Playwright.
- Eleven in-app Guide pages at `/guide/*` (overview, how to use, methodology with three worked
  examples, CTEs, evidence, Excel, frameworks, marine & ocean tailoring, stage crosswalk, FAQ with
  13 questions, glossary), with left navigation, "on this page" anchors and prev/next links.
- The Guide route is lazy-loaded, keeping react-markdown and the prose out of the entry chunk.
- About page listing build metadata, the frameworks in the build with their sources, the full
  source table and the complete disclaimer.
- CITATION.cff, a completed CONTRIBUTING.md and docs/security-review.md.
- `npm run check:links` — documentation link and anchor checker, wired into `npm run verify`.
- `npm run screenshots` — regenerates docs/img/*.png.
- Phase 8: axe accessibility checks on all 12 routes (0 serious or critical violations), a
  keyboard-only walkthrough test and an `aria-live` result announcement test.
- Robustness tests: 30-CTE / 300-evidence sessions, near-limit files, corrupted JSON, older and
  newer schema versions, localStorage unavailable and IndexedDB unavailable.
- Security tests: formula-injection escaping, zip-slip-safe file names, the http/https URL
  allow-list, no `dangerouslySetInnerHTML`, no `fetch`/`XHR`/`WebSocket`/`sendBeacon`/`eval` in
  `src/`, markdown rendered without raw HTML, and the example containing nothing real.
- Cross-browser smoke suite (Chromium always; Firefox and WebKit behind `CROSS_BROWSER=1`, run in
  CI) including an Excel-download check and a large-session export that keeps the UI responsive.
- ADR-0003 recording the export performance measurements and the decision not to use a Web Worker.

### Fixed

- Colour contrast on the selected CTE card and its badges (WCAG AA).
- Invalid `<dl>` markup in the evidence library that axe flagged as a definition-list violation.

### Known limitations in 1.0.0

- `doe-g413-3-4a` (DOE G 413.3-4A Appendix F) and `gao-20-48g` are **not implemented**: neither
  document could be retrieved in the build environment, and no content is attributed to them.
- The generic `dod-tra-2025` framework marks no criterion mandatory, because its source does not
  classify them; every level in that framework is flagged for assessor confirmation.
- Exported workbooks cannot be re-imported; session JSON round-trips losslessly.
- Firefox and WebKit smoke tests are configured and run in CI but could not be executed in the
  build sandbox.

[Unreleased]: https://github.com/Denny-Hwang/TRL-assess/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/Denny-Hwang/TRL-assess/releases/tag/v1.0.0
