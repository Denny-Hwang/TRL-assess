# Build progress

Phase status log for the BUILD_SPEC v1.0 build. See `docs/spec/BUILD_SPEC.md`.

| Phase                                           | Status                              | PR / merge                             | Date       | Notes                                                                                                                                                                          |
| ----------------------------------------------- | ----------------------------------- | -------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 0 — Bootstrap, guardrails, CI/CD, library spike | Done                                | local merge `phase/00-bootstrap`       | 2026-09-16 | `npm run verify` green; 3 Playwright smoke tests; initial JS 56.8 kB gzip; ADR-0001 (ExcelJS spike).                                                                           |
| 1 — Framework data model & source transcription | Done                                | local merge `phase/01-frameworks`      | 2026-09-16 | 2 frameworks validate (124 Tier 2 criteria, 18 Tier 1 questions); 21 framework tests; ADR-0002.                                                                                |
| 2 — Domain engine                               | Done                                | local merge `phase/02-engine`          | 2026-09-16 | All D-2 rules implemented with named tests; `src/domain` coverage 99.3 % lines / 95.8 % branches, enforced by `npm test`.                                                      |
| 3 — Tier 1 UI                                   | Done                                | local merge `phase/03-tier1-ui`        | 2026-09-16 | 10 component tests + 3 Playwright tests; Y/N/U shortcuts and arrow navigation; 375 px viewport checked.                                                                        |
| 4 — Excel export (Tier 1)                       | Done                                | local merge `phase/04-excel-tier1`     | 2026-09-16 | 24 read-back assertions + structure snapshot; ExcelJS confirmed lazy-loaded; entry chunk 91 kB gzip at the time.                                                               |
| 5 — Tier 2 UI                                   | Done                                | local merge `phase/05-tier2-ui`        | 2026-09-16 | 17 component tests + 3 Playwright tests; reload restores the session and the stored evidence blobs.                                                                            |
| 6 — Tier 2 Excel + evidence package             | Done                                | local merge `phase/06-excel-tier2-zip` | 2026-09-16 | 27 workbook + 17 package assertions; manifest hashes recomputed from the packaged bytes.                                                                                       |
| 7 — Documentation                               | Done                                | local merge `phase/07-docs`            | 2026-09-16 | README per D-5; 11 Guide pages (~8,000 words); link check wired into `verify`; screenshots captured with Playwright.                                                           |
| 8 — Hardening                                   | Done                                | local merge `phase/08-hardening`       | 2026-09-16 | axe: 0 serious/critical on 12 routes; robustness + security suites; ADR-0003; cross-browser suite wired into CI.                                                               |
| 9 — Release v1.0.0                              | **Prepared — awaiting USER VERIFY** | local merge `phase/09-release`         | 2026-09-16 | Final audit in `docs/final-audit.md`; version 1.0.0; example exports generated; backlog filed as issues #1–#10. The tag and GitHub Release are held until U1–U3 are confirmed. |

Totals at the end of Phase 9: **311 unit and component tests**, **27 Playwright tests**, 128 tracked
files, ~6,600 lines of application code and ~4,000 lines of tests.

## Deviations from PROJECT CONFIG (approved by the user, 2026-09-16)

| Spec value                                                | Actual value                                                                | Reason                                                                                                                                               |
| --------------------------------------------------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `APP_NAME: "TRL Navigator"`                               | `TRL Assess`                                                                | User decision — align the app name with the repository.                                                                                              |
| `REPO_NAME: "trl-navigator"`                              | `TRL-assess`                                                                | The repository already exists as `Denny-Hwang/TRL-assess`.                                                                                           |
| `PAGES_BASE_PATH: "/trl-navigator/"`                      | `/TRL-assess/`                                                              | Must equal `/<REPO_NAME>/`.                                                                                                                          |
| `LICENSE: "TBD"`                                          | `MIT`                                                                       | User decision.                                                                                                                                       |
| `MAINTAINER_CONTACT`                                      | GitHub issues / profile links                                               | User decision — no e-mail address in the public repo.                                                                                                |
| Framework `doe-g413-3-4a`                                 | Framework `dod-tra-2025`                                                    | DOE G 413.3-4A could not be retrieved; see ADR-0002 and open question 1.                                                                             |
| Git workflow: per-phase branch + GitHub PR + squash-merge | Per-phase local branch merged `--no-ff` into `claude/clever-davinci-b09dto` | This session may push only to its designated branch and `gh` is unavailable. BUILD_SPEC Part A permits this fallback and requires it to be recorded. |

## USER VERIFY items

| #   | Item                                                                                                                                                                        | Phase | Status                                                                                                                                    |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| U1  | Open the Tier 1 `.xlsx` in Microsoft Excel **and** LibreOffice: no repair prompt, the Answer dropdowns work, and the Open column becomes a link once a path is filled in.   | 4     | **Pending — files sent to the user 2026-09-16**                                                                                           |
| U2  | Open the Tier 2 `.xlsx` in Microsoft Excel: no repair prompt; the `EV-P001…` placeholder rows have working Type / Marking / Verification dropdowns and a live Open formula. | 6     | **Pending — files sent to the user 2026-09-16**                                                                                           |
| U3  | Unzip the evidence package and click a "Local file (relative path)" link in `Evidence_Register` — it opens `evidence/EV-0011_harvester-bench-test.txt`.                     | 6     | **Pending — files sent to the user 2026-09-16**                                                                                           |
| U4  | `sha256sum -c MANIFEST.sha256.txt` inside the unzipped folder reports OK for every line.                                                                                    | 6     | **Verified 2026-09-16** — run against the generated package: workbook, `session.json`, the bundled evidence file and `README.txt` all OK. |
| U5  | The Guide wording is acceptable for institutional use and the disclaimer is approved.                                                                                       | 7     | **Pending**                                                                                                                               |
| U6  | Repository visibility and the MIT licence are confirmed against the institutional release process (PNNL software release).                                                  | 9     | **Pending**                                                                                                                               |

## Phase 8 records

### Keyboard-only walkthrough (2026-09-16, Chromium)

| Flow   | Steps taken with the keyboard alone                                                                                                                                                                                                                                                                  | Result                                                                                                        |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Tier 1 | Tab to _Project name_ → type → Tab through _Technology_, _Assessor_, the optional fields and both dropdowns → Tab to _Continue to the questions_ → Enter → answer nine cards with `Y`/`N`/`U` → arrow keys to revisit a card → Tab to _See the estimate_ → Enter                                     | Complete; asserted by `tests/e2e/a11y.spec.ts` ("the whole Tier 1 flow is reachable with the keyboard alone") |
| Tier 2 | Tab into the CTE form → type a name → Tab to _Add CTE_ → Enter → Tab to the CTE button in the list → Enter to select → Tab to a level header → Enter to expand → Tab to a _Status_ select → arrow keys to choose → Tab to _Manage_ → Enter → Tab through the evidence form → Enter on _Add evidence_ | Complete; focus order follows the visual order and every control is reachable                                 |
| Guide  | Tab through the left navigation → Enter → Tab to the "on this page" anchors and the prev/next links                                                                                                                                                                                                  | Complete                                                                                                      |

Focus is visible everywhere (`:focus-visible` ring in `src/index.css`), the skip link is the first
tab stop, and results are announced through `aria-live="polite"`.

### Cross-browser status

**Confirmed in CI on 2026-09-16** (run 8, commit `66ba139`): the e2e job installs Chromium, Firefox
and WebKit and runs with `CROSS_BROWSER=1`. Result: **42 tests, 41 passed, 1 skipped** (the skipped
one is the screenshot utility, which only runs with `CAPTURE_SCREENSHOTS=1`). Chromium runs the full
suite; Firefox and WebKit run the smoke and cross-browser specs, including an Excel download and a
large-session export.

They still cannot be run inside the build sandbox — Playwright's browser downloads are blocked by
its egress policy — so local runs remain Chromium-only, using the prebuilt browser via
`PLAYWRIGHT_CHROMIUM_PATH`.

CI also required three fixes that only the runners exposed:

| Symptom in CI                                      | Cause                                                                                                                     | Fix                                                                          |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `ERR_INVALID_ARG_TYPE` from `crypto.subtle.digest` | jsdom's `TextEncoder` and `FileReader` return buffers from another realm, which Node's Web Crypto rejects                 | `sha256Hex` copies into a freshly allocated `Uint8Array` first               |
| `ENOENT … dist/assets` in the bundle-budget suite  | `describe.skip` still evaluates its callback, which read `dist/` before the build existed                                 | directory reads moved inside the tests; CI re-runs the suite after the build |
| `Timed out waiting 120000ms from config.webServer` | `localhost` resolves to `::1` first on the runner, so Vite's preview server listened on IPv6 while Playwright polled IPv4 | the preview server is started with `--host 127.0.0.1`                        |

### Performance

| Measure                                      | Value                                           | Budget                                                                                        |
| -------------------------------------------- | ----------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Entry JavaScript chunk                       | ~102 kB gzip                                    | ≤ 300 kB gzip, enforced by `tests/unit/bundle-budget.test.ts` and the CI "Bundle budget" step |
| ExcelJS chunk (lazy)                         | 271 kB gzip, fetched only when the user exports | —                                                                                             |
| JSZip chunk (lazy)                           | 30 kB gzip                                      | —                                                                                             |
| Guide + markdown chunks (lazy)               | 72 kB gzip                                      | —                                                                                             |
| `scoreTier2` on 30 CTEs / 300 evidence items | 13 ms                                           | —                                                                                             |
| Tier 2 workbook build for that session       | ~500 ms                                         | No Web Worker needed — see ADR-0003                                                           |

### Accessibility

axe (`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`) on 12 routes: **0 serious or critical violations**.
Two were found and fixed during the phase — colour contrast on the selected CTE card, and invalid
`<dl>` markup in the evidence library.

## Open questions / items needing user review

| #   | Item                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Raised in | Status                    |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ------------------------- |
| 1   | **DOE G 413.3-4A and GAO-20-48G could not be downloaded** — the build environment's egress proxy denies `directives.doe.gov`, `energy.gov` and `gao.gov` (HTTP 403). The user supplied EERE R 540.112-02, the DoD TRA Guidebook (Feb 2025) and the DoD MRL Matrix (2018) by hand. **Resolution:** the generic base framework is `dod-tra-2025` (ADR-0002); no content is attributed to either missing document. Transcribing Appendix F is tracked as issue [#1](https://github.com/Denny-Hwang/TRL-assess/issues/1). | Phase 0   | Resolved, follow-up filed |
| 2   | **EERE R 540.112-02 defines TRL 1–8 only.** The retrieved PDF (2 pages, template version 11/17/15) has no TRL 9 definition, so the TRL 9 screening question in `marine-energy-eere` is adapted from the DoD TRA Guidebook Table 2-1 (p. 7). The substitution is stated in the question's help text, in `docs/sources/SOURCES.md` and on `/guide/frameworks`. **Please confirm this is acceptable.**                                                                                                                   | Phase 1   | **Needs user review**     |
| 3   | **Mandatory flags.** The DoD guidebook does not designate criteria as mandatory or optional, so every `dod-tra-2025` criterion is `mandatory: false` with `mandatoryBasis: "not specified in source"`, exactly as BUILD_SPEC requires. `marine-energy-eere` promotes the level-defining criterion at each TRL (`MEE-T2-L{n}-01` and `MEE-T2-SW-L{n}-01`) and its eight tailored items to mandatory, with the basis recorded in the data. **Please confirm the promotion list.**                                       | Phase 1   | **Needs user review**     |
| 4   | **`nrel-me-risk` report number unknown.** The NREL marine-energy risk framework PDF was not supplied; it is cited only as the basis of two tailored rationales and no text is reproduced. Tracked as issue [#2](https://github.com/Denny-Hwang/TRL-assess/issues/2).                                                                                                                                                                                                                                                  | Phase 1   | **Needs user input**      |
| 5   | **`process` CTEs use the DoD hardware criteria.** The guidebook covers hardware and software only; offering Table 2-1 criteria to `process` elements is this tool's decision (ADR-0002 §5), stated in the framework description. **Please confirm.**                                                                                                                                                                                                                                                                  | Phase 1   | **Needs user review**     |
| 6   | **GitHub Pages is not enabled**, so the deploy workflow cannot publish. `actions/configure-pages` reports `Get Pages site failed … Not Found`, and with `enablement: true` the workflow token is refused (`Create Pages site failed. Resource not accessible by integration`). **Action:** repository **Settings → Pages → Build and deployment → Source: GitHub Actions**, then re-run "Deploy to GitHub Pages". The site is then served at https://denny-hwang.github.io/TRL-assess/.                               | Phase 9   | **Needs user action**     |
| 7   | **The default branch is `claude/clever-davinci-b09dto`, not `main`.** Both workflows trigger on it as well as on `main`. Rename the default branch to `main` if you prefer; the branch lists in the workflows can then be trimmed.                                                                                                                                                                                                                                                                                    | Phase 9   | **Needs user decision**   |
| 8   | **Tag and GitHub Release for v1.0.0 are not created.** BUILD_SPEC Phase 9 requires the USER VERIFY items to be confirmed first. U1–U3 and U5–U6 are open.                                                                                                                                                                                                                                                                                                                                                             | Phase 9   | **Blocked on U1–U3**      |

## Post-v1 backlog (filed as GitHub issues, 2026-09-16)

| #   | Item                                                                                     | Issue                                                      |
| --- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| B1  | Korean UI (`ko.json`) and a language toggle.                                             | [#3](https://github.com/Denny-Hwang/TRL-assess/issues/3)   |
| B2  | Import an edited Tier 2 workbook back into the app (round-trip from Excel).              | [#4](https://github.com/Denny-Hwang/TRL-assess/issues/4)   |
| B3  | TPL and MRL side modules.                                                                | [#5](https://github.com/Denny-Hwang/TRL-assess/issues/5)   |
| B4  | IRL between CTE pairs, and an SRL view.                                                  | [#6](https://github.com/Denny-Hwang/TRL-assess/issues/6)   |
| B5  | PDF summary report.                                                                      | [#7](https://github.com/Denny-Hwang/TRL-assess/issues/7)   |
| B6  | Multi-assessor comparison: merge two JSON sessions and show disagreements.               | [#8](https://github.com/Denny-Hwang/TRL-assess/issues/8)   |
| B7  | Criteria-correction workflow page linked to GitHub issues.                               | [#9](https://github.com/Denny-Hwang/TRL-assess/issues/9)   |
| B8  | Optional PWA offline install.                                                            | [#10](https://github.com/Denny-Hwang/TRL-assess/issues/10) |
| B9  | Transcribe DOE G 413.3-4A Appendix F once the PDF can be supplied, as a third framework. | [#1](https://github.com/Denny-Hwang/TRL-assess/issues/1)   |
| B10 | Confirm the NREL marine-energy risk framework report number for SOURCES.md.              | [#2](https://github.com/Denny-Hwang/TRL-assess/issues/2)   |

## Note on this log

Several per-phase updates to the tables above were written by a script that matched on exact row
text, and silently did nothing after Prettier re-aligned the columns. The tables were rewritten from
the actual git history and test output on 2026-09-16; the phase reports given to the user at the
time were correct.
