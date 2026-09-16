# CLAUDE.md — agent rules for TRL Assess

The binding specification is `docs/spec/BUILD_SPEC.md`. Read it before changing anything.
Progress and phase status live in `docs/PROGRESS.md`.

## Current phase

> **Phase 5 — Tier 2 UI: Evidence-Based Assessment — IN PROGRESS**
>
> Phases 0–4 complete (merged 2026-09-16).

Update this pointer at the end of every phase.

## Project identity (single source of truth: `src/config/app.config.ts`)

| Key               | Value                    |
| ----------------- | ------------------------ |
| APP_NAME          | TRL Assess               |
| Repository        | `Denny-Hwang/TRL-assess` |
| PAGES_BASE_PATH   | `/TRL-assess/`           |
| License           | MIT                      |
| Default framework | `marine-energy-eere`     |
| UI language       | English (i18n-ready)     |

## Commands

```bash
npm run dev               # local dev server
npm run verify            # lint + typecheck + unit tests + criteria validation + build
npm run test              # vitest (unit + component)
npm run test:e2e          # playwright (needs a build first)
npm run validate:criteria # framework schema + provenance checks
npm run build && npm run preview
```

## Non-negotiable principles (condensed from BUILD_SPEC Part A)

1. **Client-side only.** No backend, no analytics, no telemetry, no third-party runtime requests.
   Evidence files never leave the browser except inside files the user downloads.
2. **No fabricated criteria.** Every criterion carries a `source` and an `origin`
   (`verbatim` | `adapted` | `tailored`). `verbatim` only from U.S. Government public-domain
   documents. Never copy ISO text — cite ISO by clause number only. `tailored` needs a `rationale`.
3. **Conservative scoring.** Implement BUILD_SPEC D-2 exactly. "Unsure" never counts as "Yes".
   A TRL level requires every lower level to be achieved.
4. **Honest labelling.** Tier 1 = "Estimate — self-reported, no evidence". Tier 2 =
   "Evidence-backed self-assessment — not an independent TRA". Disclaimer on results and exports.
5. **Centralised configuration.** Tunables in `src/config/app.config.ts`; framework content in
   `src/data/frameworks/**`; guide text in `src/content/guide/*.md`.
6. **Sensitive-data safety.** Evidence marked "Sensitive — reference only" must never accept a
   file blob.
7. **Quality gate.** `npm run verify` must pass before every PR.
8. **Small, traceable changes.** Conventional Commits; one PR per phase; update CHANGELOG and
   PROGRESS every phase.

## Do NOT

- Do not fabricate, paraphrase-as-verbatim, or guess criteria text.
- Do not add `fetch`/`XMLHttpRequest`/`WebSocket`/`sendBeacon` or any external asset at runtime.
- Do not weaken, skip or delete tests or coverage thresholds to make CI pass.
- Do not choose or change the license on your own.
- Do not change scoring rules (D-2) or Excel sheet structure (D-3) beyond the spec without an ADR
  and the user's approval.
- Do not put real project data, device names or controlled information into examples.

## STOP conditions (ask the user and wait)

- A framework source document cannot be obtained or read.
- PROJECT CONFIG placeholders block the step.
- A license decision is required.
- CI still fails after 3 fix attempts.
- A requirement would need a backend, network call, analytics, or a third-party service.
- Any change to D-2 scoring or D-3 workbook structure.
