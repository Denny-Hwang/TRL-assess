# Final audit — BUILD_SPEC v1.0 against the repository

Run for Phase 9 (C-4) on 2026-09-16, at commit `HEAD` of `claude/clever-davinci-b09dto`.
Status: **Pass** — implemented and proven by a test; **Pass (manual)** — implemented, verified by
inspection; **Deviation** — implemented differently, with the reason recorded.

## Part A — non-negotiable principles

| Requirement                                                                        | Location                                                                       | Test that proves it                                                                                                                             | Status        |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| 1. Client-side only; no backend, analytics, telemetry or third-party runtime calls | whole app; `eslint.config.js` restricted globals; `index.html` CSP             | `tests/unit/security.test.ts` ("never calls fetch…"), cross-origin request guard in `tests/e2e/smoke.spec.ts`, `tier1.spec.ts`, `tier2.spec.ts` | Pass          |
| 1b. Evidence files never leave the browser                                         | `src/storage/blobStore.ts`, `src/export/download.ts`                           | `tests/unit/storage.test.ts`; no egress path exists other than a user download                                                                  | Pass          |
| 2. Every criterion has a source and an origin                                      | `src/data/frameworks/**`, `src/domain/schemas.ts`                              | `scripts/validate-criteria.ts`; `tests/unit/frameworks.test.ts` ("cites only known sources")                                                    | Pass          |
| 2b. `verbatim` only from U.S. Government public-domain documents                   | `src/data/sources.ts` (`publicDomain`, `quotable`)                             | `tests/unit/frameworks.test.ts` ("allows verbatim text only from public-domain, quotable sources")                                              | Pass          |
| 2c. ISO cited by clause only, never copied                                         | validator ISO rule                                                             | `tests/unit/frameworks.test.ts` ("never transcribes ISO 16290 text"); `grep -rn iso-16290 src/` returns only the source registry entry          | Pass          |
| 2d. `tailored` items carry a rationale                                             | framework JSON                                                                 | `tests/unit/frameworks.test.ts` ("requires a rationale on tailored and adapted items")                                                          | Pass          |
| 2e. Inaccessible source → STOP and ask                                             | —                                                                              | Raised with the user in Phase 0; resolved by ADR-0002                                                                                           | Pass (manual) |
| 3. Conservative scoring exactly per D-2, no extra weighting                        | `src/domain/tier1.ts`, `src/domain/tier2.ts`                                   | `tests/unit/tier1-scoring.test.ts` (29), `tier2-scoring.test.ts` (42)                                                                           | Pass          |
| 4. Honest labelling on results and in every export                                 | `src/config/app.config.ts` labels; results pages; workbook README/Summary      | `tests/component/tier1-flow.test.tsx`, `tier2-flow.test.tsx`, `excel-tier1.test.ts`, `excel-tier2.test.ts`                                      | Pass          |
| 5. Centralised configuration                                                       | `src/config/app.config.ts`, `src/data/frameworks/**`, `src/content/guide/*.md` | Values are imported, not duplicated; checked by inspection                                                                                      | Pass (manual) |
| 6. Sensitive-marked evidence cannot hold a file                                    | `evidenceItemSchema` refinement; `EvidenceForm`; packaging filter              | `tests/unit/session.test.ts`, `tests/component/tier2-flow.test.tsx`, `tests/unit/evidence-package.test.ts`                                      | Pass          |
| 6b. UI warns against controlled information                                        | `SensitiveDataNotice`, evidence form callout                                   | `tests/e2e/smoke.spec.ts` ("sensitive-data notice is shown and dismissible")                                                                    | Pass          |
| 7. `npm run verify` gates every change                                             | `package.json`, `.github/workflows/ci.yml`                                     | CI runs it on every pull request and push                                                                                                       | Pass          |
| 8. Conventional Commits, one change per phase, CHANGELOG + PROGRESS updated        | git history, `CHANGELOG.md`, `docs/PROGRESS.md`                                | —                                                                                                                                               | Pass (manual) |

## Part D-2 — scoring rules

| Rule                         | Implementation      | Named test                                                               |
| ---------------------------- | ------------------- | ------------------------------------------------------------------------ |
| R1-1 first-yes TRL           | `firstYesTrl`       | "R1-1 first-yes TRL" (3 cases)                                           |
| R1-2 contiguous TRL          | `contiguousTrl`     | "R1-2 contiguous TRL" (4 cases)                                          |
| R1-3 gap flag                | `gapFlag`           | "R1-3 gap flag" (2 cases)                                                |
| R1-4 unsure flag             | `unsureFlag`        | "R1-4 unsure flag" (3 cases)                                             |
| R1-5 matrix TRL              | `matrixTrl`         | "R1-5 matrix TRL" (7 cases)                                              |
| R1-6 consistency rating      | `consistencyRating` | "R1-6 consistency rating" (5 cases)                                      |
| R1-7 label                   | `scoreTier1`        | "R1-7 label"                                                             |
| R2-1 applicability           | `isApplicable`      | "R2-1 applicability" (3 cases)                                           |
| R2-2 satisfied               | `evaluateCriterion` | "R2-2 satisfaction" (8 cases)                                            |
| R2-3 evidence requirement    | `evaluateCriterion` | "R2-3 evidence requirement" (2 cases)                                    |
| R2-4 level achieved          | `evaluateCte`       | "R2-4 level achievement" (6 cases incl. zero-mandatory flag and all-N/A) |
| R2-5 CTE TRL                 | `evaluateCte`       | "R2-5 CTE TRL" (2 cases)                                                 |
| R2-6 next-level completeness | `evaluateCte`       | "R2-6 next-level completeness" (2 cases)                                 |
| R2-7 system summary          | `systemSummary`     | "R2-7 system summary" (5 cases incl. zero CTEs and no critical CTE)      |
| R2-8 evidence coverage       | `evaluateCte`       | "R2-8 evidence coverage" (3 cases)                                       |
| R2-9 tier delta              | `tierDelta`         | "R2-9 tier delta" (5 cases)                                              |
| R2-10 label                  | `scoreTier2`        | "R2-10 label"                                                            |
| Gap analysis                 | `gapsForLevel`      | "gap analysis" (3 cases)                                                 |
| Tier 1 matrix values         | `tier1-matrix.json` | "tier 1 heuristic matrix — matches BUILD_SPEC D-2.1 exactly"             |

Coverage on `src/domain`: **99.3 % lines, 95.8 % branches**, thresholds enforced by `npm test`.

## Part D-3 — workbooks

| Requirement                                                                                      | Test                                                                                                                              |
| ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| D-3.0 file naming `TRL_<tier>_<slug>_<YYYYMMDD-HHmm>.xlsx`                                       | `excel-tier1.test.ts` ("names the file…", "formats the timestamp…")                                                               |
| D-3.0 bold frozen header, autofilter, widths, wrap                                               | `excel-tier1.test.ts`, `excel-tier2.test.ts` ("freezes and bolds…", "sets an autofilter…", "gives every column a sensible width") |
| D-3.0 README sheet with purpose, sheet guide, placeholders, disclaimer, versions, SHA, timestamp | `excel-tier1.test.ts` (3 README tests), `excel-tier2.test.ts` (2 README tests)                                                    |
| D-3.0 validation + conditional formatting, text always present                                   | `excel-tier1.test.ts`, `excel-tier2.test.ts`                                                                                      |
| D-3.0 formula-injection guard                                                                    | `security.test.ts` (6 cases + an end-to-end hostile name)                                                                         |
| D-3.0 "edits do not recompute" note                                                              | `excel-tier1.test.ts`, `excel-tier2.test.ts`                                                                                      |
| D-3.1 six sheets in order, with the specified columns                                            | `excel-tier1.test.ts` ("has exactly the specified sheets, in order" + inline structure snapshot)                                  |
| D-3.1 Next_Evidence_Placeholders: next two levels, 10 blank rows, HYPERLINK formula              | `excel-tier1.test.ts` (3 tests)                                                                                                   |
| D-3.2 nine sheets in order, with the specified columns                                           | `excel-tier2.test.ts` (5 column tests)                                                                                            |
| D-3.2 Criteria_Assessment one row per CTE × criterion, Satisfied computed                        | `excel-tier2.test.ts` (4 tests)                                                                                                   |
| D-3.2 Evidence_Register + 50 placeholder rows with live validations and formula                  | `excel-tier2.test.ts` (6 tests)                                                                                                   |
| D-3.2 Gap_Actions pre-filled + 20 blank rows                                                     | `excel-tier2.test.ts` (2 tests)                                                                                                   |
| D-3.2 Review_Signoff, References, Metadata                                                       | `excel-tier2.test.ts` (3 tests)                                                                                                   |

## Part D-4 — evidence package

| Requirement                                                            | Test                                                                                               |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Folder structure (workbook, session.json, evidence/, manifest, README) | `evidence-package.test.ts` ("contains the workbook…")                                              |
| Evidence named `<EV-ID>_<sanitized-name>`                              | "bundles evidence files under evidence/…", "prefixes bundled entries with the evidence id"         |
| Sanitisation: `[A-Za-z0-9._-]`, 80 chars, no `..`, no absolute paths   | "sanitizes hostile file names", `security.test.ts` zip-slip cases                                  |
| Relative hyperlinks into `evidence/` inside the package                | "uses relative hyperlinks into evidence/ for bundled files"                                        |
| Standalone workbook marks files "not bundled"                          | `excel-tier2.test.ts` Evidence_Register tests                                                      |
| Manifest covers every file, hashes recomputed from packaged bytes      | "hashes match a recomputation of the packaged bytes"                                               |
| `sha256sum -c` format                                                  | "is written in `sha256␣␣path` form" — and verified for real against the generated release artifact |
| Sensitive items never bundled                                          | "never bundles a sensitive item, even when a blob exists"                                          |
| Size pre-check with per-file sizes                                     | "refuses to build a package over the size limit, naming the largest files"                         |
| Progress reported in the UI                                            | "reports progress while building"                                                                  |

## Part D-5, D-6 — documentation

| Requirement                                      | Location                                          | Status                                                                                     |
| ------------------------------------------------ | ------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| README sections 1–20                             | `README.md`                                       | Pass (manual) — every command in it was executed in this build                             |
| Mermaid architecture/flow diagram                | `README.md` § How it works                        | Pass (manual)                                                                              |
| Screenshots                                      | `docs/img/*.png` via `npm run screenshots`        | Pass                                                                                       |
| 11 Guide pages with full prose                   | `src/content/guide/*.md`                          | Pass — `tests/component/guide.test.tsx` checks the page list, minimum length and rendering |
| Guide left nav, on-this-page anchors, prev/next  | `src/features/guide/GuidePage.tsx`                | Pass                                                                                       |
| Factual TRL statements cite a source id          | Guide pages                                       | Pass — "cites a known source id wherever it states a TRL definition"                       |
| CONTRIBUTING, SECURITY, CITATION.cff, About page | repository root, `src/features/about`             | Pass                                                                                       |
| Docs link check                                  | `scripts/check-docs-links.ts` in `npm run verify` | Pass                                                                                       |

## Part D-8, D-9, D-10

| Requirement                                                            | Status                                                                |
| ---------------------------------------------------------------------- | --------------------------------------------------------------------- |
| D-8 backlog captured                                                   | Listed in `docs/PROGRESS.md` § Post-v1 backlog, to be filed as issues |
| D-9 stage crosswalk published with the "not an official standard" note | `/guide/stage-crosswalk`                                              |
| D-10 user acceptance checklist                                         | `docs/PROGRESS.md` § USER VERIFY — U1–U4 open                         |

## Greps required by C-4

| Check                                                                      | Result                                                                                                                                                                         |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `fetch(`, `XMLHttpRequest`, `WebSocket`, `sendBeacon`, analytics in `src/` | None                                                                                                                                                                           |
| External URLs loaded by `index.html`                                       | None                                                                                                                                                                           |
| `TODO` / `FIXME` / `XXX` / `HACK` in `src/`, `scripts/`, `tests/`          | None                                                                                                                                                                           |
| ISO body text                                                              | None — only the source registry entry and clause-only references                                                                                                               |
| Real project identifiers in the example                                    | None — `example.org` hosts and `10.5555/fictional.*` DOIs only, asserted by `security.test.ts`                                                                                 |
| Skipped tests                                                              | Two conditional guards only: the bundle-budget suite skips without a build, and the screenshot utility runs on `CAPTURE_SCREENSHOTS=1`. No test is skipped to avoid a failure. |

## Deviations from the specification

| Spec                                              | Built                                                                        | Reason                                                                                                                                                                             |
| ------------------------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frameworks `doe-g413-3-4a` + `marine-energy-eere` | `dod-tra-2025` + `marine-energy-eere`                                        | DOE G 413.3-4A and GAO-20-48G are unreachable from the build environment (egress policy). ADR-0002; no content is attributed to either document.                                   |
| App name "TRL Navigator", repo `trl-navigator`    | "TRL Assess", repo `TRL-assess`, base `/TRL-assess/`                         | User decision, 2026-09-16.                                                                                                                                                         |
| `LICENSE: TBD`                                    | MIT                                                                          | User decision, 2026-09-16.                                                                                                                                                         |
| Per-phase branch + GitHub PR + squash-merge       | Per-phase local branch merged `--no-ff` into the session's designated branch | The session may push only to its designated branch and `gh` is unavailable; BUILD_SPEC Part A permits this fallback and requires it to be recorded — it is, in `docs/PROGRESS.md`. |
| Tier 1 TRL 9 question from EERE                   | Adapted from DoD Table 2-1                                                   | EERE R 540.112-02 defines TRL 1–8 only. Recorded in SOURCES.md and shown in the app.                                                                                               |

## Outstanding before a release can be called complete

1. **USER VERIFY U1–U4** (open both workbooks in Microsoft Excel, click a relative link in an
   unzipped package, run `sha256sum -c`). U4 has been verified programmatically against a generated
   package; U1–U3 need a human with Excel.
2. **Firefox and WebKit smoke runs** — configured and wired into CI, not runnable in the build
   sandbox.
3. **GitHub Pages** must be enabled (Settings → Pages → Source: GitHub Actions) for the deploy
   workflow to publish.
