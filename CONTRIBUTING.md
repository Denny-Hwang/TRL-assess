# Contributing to TRL Assess

Thanks for helping. One rule sits above all the others: **criteria are never invented.** Every
question and criterion in the app must be traceable to a real source document, with a page
reference, and labelled with how faithfully it follows that source.

## Quick start

```bash
npm ci
npm run dev          # http://localhost:5173/TRL-assess/
npm run verify       # lint, typecheck, tests, criteria validation, link check, build
```

`npm run verify` is exactly what CI runs. It must pass before you open a pull request.

## Provenance rules

Each Tier 1 question and Tier 2 criterion carries a `source` and an `origin`:

| `origin`   | Meaning                                                                                                    | Required                                                                                                |
| ---------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `verbatim` | Text copied exactly from the source                                                                        | The source must be public-domain and quotable (DOE, EERE, GAO, DoD). A `section` or `page` is required. |
| `adapted`  | Source wording restructured — for example a definition turned into a question — with the meaning preserved | A `rationale` explaining the adaptation, plus section/page.                                             |
| `tailored` | Not present in any source; added by the framework                                                          | A `rationale` justifying the requirement.                                                               |

Additional rules the validator enforces:

- Every `sourceId` must exist in `src/data/sources.ts` (mirroring `docs/sources/SOURCES.md`).
- **ISO standards are cited by clause number only.** Never paste ISO text into this repository. An
  item whose source is `iso-16290` must be `tailored` and must carry a `clause`.
- Ids must be unique, and every TRL 1–9 needs at least one Tier 1 question and one Tier 2 criterion.
- A criterion that is `mandatory` should say why in `mandatoryBasis`. If the source does not classify
  criteria, set `mandatory: false` and `mandatoryBasis: "not specified in source"` — do not guess.

Run the checks with:

```bash
npm run validate:criteria
```

## Proposing a criteria change

1. Open a **Criteria correction** issue with: the framework id, the item id, what the tool currently
   says, what the source actually says, and the section/page reference.
2. Submit a pull request editing the JSON under `src/data/frameworks/<frameworkId>/`. No TypeScript
   needs to change to fix a criterion.
3. Bump the framework `version` in `framework.json` and add a `CHANGELOG.md` entry under
   `[Unreleased]`.

## Adding a framework

1. Create `src/data/frameworks/<id>/` with `framework.json`, `tier1.json`, `tier2.json` and
   `tier1-matrix.json`.
2. Register it in `src/data/frameworks/index.ts`.
3. To build on an existing framework, set `extends` and reference base criteria as
   `{ "id": "...", "refId": "...", "mandatory": true, "mandatoryBasis": "..." }`. Text, source and
   origin always come from the base criterion — an extending framework can change how a criterion is
   _used_, never what its source is claimed to say.
4. Add the sources to `docs/sources/SOURCES.md` and `src/data/sources.ts`, with the retrieval date,
   the SHA-256 of the file you worked from, and whether it may be quoted.
5. Describe the framework's decisions on `/guide/frameworks`.

## Architecture in one minute

- `src/domain/` is pure TypeScript — schemas, scoring, session handling, hashing. No React, no
  browser APIs beyond Web Crypto. Scoring changes belong here, with a named test per rule.
- `src/storage/` wraps `localStorage` and IndexedDB and turns failures into typed errors.
- `src/export/` builds the workbooks and the evidence package. ExcelJS and JSZip are dynamically
  imported so they stay out of the entry chunk.
- `src/features/` holds the UI. It reads the domain layer; it never re-implements a rule.
- `src/content/guide/*.md` is every word of the in-app Guide.

Any deviation from the stack or the structure needs an ADR in `docs/adr/`.

## What will be rejected

- A criterion without a source, or with a source that does not say what the criterion claims.
- `verbatim` text from a copyrighted document.
- A runtime network call, analytics, telemetry or a third-party asset. The app is client-side only,
  and the end-to-end tests fail the build if a cross-origin request appears.
- A skipped, deleted or weakened test — including lowering a coverage threshold or the bundle budget
  to make a change fit.
- Real project data, device names or controlled information in examples or tests. The fictional
  example uses `example.org` and `10.5555/fictional.*` only.
- A scoring change that is not in `docs/spec/BUILD_SPEC.md` D-2 without a spec change and an ADR.

## Commits and pull requests

- [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `docs:`, `test:`,
  `chore:`, `refactor:`.
- One pull request per logical change; squash-merge.
- Fill in the pull-request template: summary, acceptance checklist, commands run, and screenshots if
  the UI changed.
- Update `CHANGELOG.md` `[Unreleased]` and, during the phased build, `docs/PROGRESS.md`.

## Tests

- `tests/unit/` — domain rules, framework validation, workbook and package generation.
- `tests/component/` — React behaviour with Testing Library.
- `tests/e2e/` — Playwright flows, including the cross-origin request guard and accessibility checks.

Coverage on `src/domain` must stay at or above 95 % lines/functions/statements and 85 % branches. If
you add a rule, add a test named after it.
