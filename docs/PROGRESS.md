# Build progress

Phase status log for the BUILD_SPEC v1.0 build. See `docs/spec/BUILD_SPEC.md`.

| Phase                                           | Status      | PR / merge                       | Date       | Notes                                                                            |
| ----------------------------------------------- | ----------- | -------------------------------- | ---------- | -------------------------------------------------------------------------------- |
| 0 — Bootstrap, guardrails, CI/CD, library spike | Done        | local merge `phase/00-bootstrap` | 2026-09-16 | `npm run verify` green; 3 Playwright smoke tests green; initial JS 56.8 kB gzip. |
| 1 — Framework data model & source transcription | In progress | —                                | 2026-09-16 |                                                                                  |
| 2 — Domain engine                               | Not started | —                                |            |                                                                                  |
| 3 — Tier 1 UI                                   | Not started | —                                |            |                                                                                  |
| 4 — Excel export (Tier 1)                       | Not started | —                                |            |                                                                                  |
| 5 — Tier 2 UI                                   | Not started | —                                |            |                                                                                  |
| 6 — Tier 2 Excel + evidence package             | Not started | —                                |            |                                                                                  |
| 7 — Documentation                               | Not started | —                                |            |                                                                                  |
| 8 — Hardening                                   | Not started | —                                |            |                                                                                  |
| 9 — Release v1.0.0                              | Not started | —                                |            |                                                                                  |

## Deviations from PROJECT CONFIG (approved by the user, 2026-09-16)

| Spec value                                 | Actual value                                                                | Reason                                                                                                                                                 |
| ------------------------------------------ | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `APP_NAME: "TRL Navigator"`                | `TRL Assess`                                                                | User decision — align the app name with the repository.                                                                                                |
| `REPO_NAME: "trl-navigator"`               | `TRL-assess`                                                                | The repository already exists as `Denny-Hwang/TRL-assess`.                                                                                             |
| `PAGES_BASE_PATH: "/trl-navigator/"`       | `/TRL-assess/`                                                              | Must equal `/<REPO_NAME>/`.                                                                                                                            |
| `LICENSE: "TBD"`                           | `MIT`                                                                       | User decision.                                                                                                                                         |
| `MAINTAINER_CONTACT`                       | GitHub issues / profile links                                               | User decision — no e-mail address in the public repo.                                                                                                  |
| Git workflow: per-phase branch + GitHub PR | Per-phase local branch merged `--no-ff` into `claude/clever-davinci-b09dto` | This session may only push to its designated branch, and `gh` is unavailable. BUILD_SPEC Part A allows this fallback; it is recorded here as required. |

## USER VERIFY items

| #   | Item       | Phase | Status |
| --- | ---------- | ----- | ------ |
| —   | (none yet) |       |        |

## Phase 8 records

### Keyboard-only walkthrough (2026-09-16, Chromium)

| Flow   | Steps taken with the keyboard alone                                                                                                                                                                                                                                                                  | Result                                                                                                        |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Tier 1 | Tab to _Project name_ → type → Tab through _Technology_, _Assessor_, the optional fields and both dropdowns → Tab to _Continue to the questions_ → Enter → answer nine cards with `Y`/`N`/`U` → arrow keys to revisit a card → Tab to _See the estimate_ → Enter                                     | Complete; asserted by `tests/e2e/a11y.spec.ts` ("the whole Tier 1 flow is reachable with the keyboard alone") |
| Tier 2 | Tab into the CTE form → type a name → Tab to _Add CTE_ → Enter → Tab to the CTE button in the list → Enter to select → Tab to a level header → Enter to expand → Tab to a _Status_ select → arrow keys to choose → Tab to _Manage_ → Enter → Tab through the evidence form → Enter on _Add evidence_ | Complete; focus order follows the visual order and every control is reachable                                 |
| Guide  | Tab through the left navigation → Enter → Tab to the "on this page" anchors and prev/next links                                                                                                                                                                                                      | Complete                                                                                                      |

Focus is visible everywhere (`:focus-visible` ring in `src/index.css`), the skip link is the first
tab stop, and results are announced through `aria-live="polite"`.

### Cross-browser status

Chromium is exercised on every run. Firefox and WebKit are configured in `playwright.config.ts`
behind `CROSS_BROWSER=1` and run in CI, which installs all three browsers. **They could not be run
in the build sandbox** — Playwright's browser downloads are blocked by the egress policy there — so
the Firefox and WebKit results are untested locally and depend on the CI run.

### Performance

| Measure                                      | Value                              | Budget                                                         |
| -------------------------------------------- | ---------------------------------- | -------------------------------------------------------------- |
| Entry JavaScript chunk                       | ~102 kB gzip                       | ≤ 300 kB gzip (enforced by `tests/unit/bundle-budget.test.ts`) |
| ExcelJS chunk (lazy)                         | 271 kB gzip, loaded only on export | —                                                              |
| `scoreTier2` on 30 CTEs / 300 evidence items | 13 ms                              | —                                                              |
| Tier 2 workbook build for that session       | ~500 ms                            | No Web Worker needed — see ADR-0003                            |

## Open questions / items needing user review

| #   | Item                                                                                                                                                                                                                                                                                      | Raised in | Status             |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ------------------ |
| 1   | Source PDFs for `doe-g413-3-4a` (DOE G 413.3-4A) and `gao-20-48g` could not be downloaded — the session's egress proxy denies `directives.doe.gov`, `energy.gov` and `gao.gov`. The user supplied EERE R 540.112-02, the DoD TRA Guide (Feb 2025) and the DoD MRL Matrix (2018) manually. | Phase 0   | Partially resolved |
