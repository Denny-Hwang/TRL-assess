# CLAUDE.md — agent rules for TRL Assess

TRL Assess is a general-purpose, client-side TRL / ARL self-assessment tool. See `README.md` for
the feature overview and `CONTRIBUTING.md` for the provenance rules.

## Project identity (single source of truth: `src/config/app.config.ts`)

| Key               | Value                                    |
| ----------------- | ---------------------------------------- |
| APP_NAME          | TRL Assess                               |
| Repository        | `Denny-Hwang/TRL-assess`                 |
| PAGES_BASE_PATH   | `/TRL-assess/`                           |
| License           | MIT                                      |
| Default framework | `dod-tra-2025`                           |
| Default branch    | `main`                                   |
| UI languages      | en (default), ko, zh, ja, es, de, hi, ar |

## Commands

```bash
npm run dev               # local dev server
npm run verify            # lint + typecheck + unit tests + criteria validation + link check + build
npm run test              # vitest (unit + component)
npm run test:e2e          # playwright (needs a build first)
npm run validate:criteria # framework schema + provenance checks
npm run build && npm run preview
```

## Where things live

- Scoring rules: `src/domain/{tier1,tier2,arl}.ts`, one named test per rule in `tests/unit/`;
  explained to users in `src/content/guide/methodology.md` and `arl.md`.
- Workbook structure: `src/export/excel/*.ts`; described in `src/content/guide/excel.md`.
- Framework content: `src/data/frameworks/**`; sources in `docs/sources/SOURCES.md` and
  `src/data/sources.ts`.
- Interface text: `src/i18n/en/*.ts` (English) and `src/i18n/<lang>.ts`; every catalog must carry
  every English key. Guide bodies: `src/content/guide/*.md`, translations in
  `src/content/guide/<lang>/<slug>.md`.
- Criteria, questions, rubric text, sheet names and dropdown values stay in English. On screen, source
  text in another language also shows an unofficial reference translation in parentheses, from
  `src/i18n/source/<lang>.json` (keyed by the exact English text; must cover every string
  `src/i18n/sourceStrings.ts` collects).

## Non-negotiable principles

1. **Client-side only.** No backend, no analytics, no telemetry, no third-party runtime requests.
   Evidence files never leave the browser except inside files the user downloads.
2. **No fabricated criteria.** Every criterion carries a `source` and an `origin`
   (`verbatim` | `adapted` | `tailored`). `verbatim` only from U.S. Government public-domain
   documents. Never copy ISO text — cite ISO by clause number only. `tailored` needs a `rationale`.
3. **Conservative scoring.** "Unsure" never counts as "Yes". A TRL level requires every lower level
   to be achieved.
4. **Honest labelling.** Tier 1 = "Estimate — self-reported, no evidence". Tier 2 =
   "Evidence-backed self-assessment — not an independent TRA". Disclaimer on results and exports.
5. **Centralised configuration.** Tunables in `src/config/app.config.ts`.
6. **Sensitive-data safety.** Evidence marked "Sensitive — reference only" must never accept a
   file blob.
7. **Quality gate.** `npm run verify` must pass before every PR.

## Do NOT

- Do not fabricate, paraphrase-as-verbatim, or guess criteria text.
- Do not add `fetch`/`XMLHttpRequest`/`WebSocket`/`sendBeacon` or any external asset at runtime.
- Do not weaken, skip or delete tests or coverage thresholds to make CI pass.
- Do not choose or change the license on your own.
- Do not change scoring rules or the Excel sheet structure without the user's approval.
- Do not put real project data, device names or controlled information into examples.

## STOP conditions (ask the user and wait)

- A framework source document cannot be obtained or read.
- A license decision is required.
- CI still fails after 3 fix attempts.
- A requirement would need a backend, network call, analytics, or a third-party service.
- Any change to scoring rules or workbook structure.
