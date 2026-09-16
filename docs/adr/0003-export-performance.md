# ADR-0003: Export performance — no Web Worker, progress messages instead

- Status: Accepted
- Date: 2026-09-16
- Phase: 8

## Context

BUILD_SPEC Phase 8, task 3 requires that "Excel generation for the large session completes without
freezing the UI (use a Web Worker if needed; document it in an ADR)". The reference large session is
30 CTEs and 300 evidence items — in this framework that is 30 × ~14 applicable criteria per level
across nine levels, so roughly 1,900 rows on `Criteria_Assessment` plus 350 rows on
`Evidence_Register`.

## Measurements

Node 22, `tests/unit/robustness.test.ts`:

| Operation                                    | Large session (30 CTEs / 300 evidence items) |
| -------------------------------------------- | -------------------------------------------- |
| `scoreTier2`                                 | 13 ms                                        |
| `buildTier2Workbook` + serialise + read back | ~500 ms                                      |

In the browser, the dominant cost is the same ExcelJS serialisation, plus the dynamic import of the
ExcelJS chunk (271 kB gzip) on first use.

## Decision

**No Web Worker.** Half a second of work, once, on an explicit button press does not justify the
complexity of a worker: ExcelJS would have to be bundled for a worker context, the session and the
blobs would have to be structured-cloned across the boundary, and error reporting would get harder.

Instead:

1. The export buttons switch to a busy state (`Building the workbook…`) and are disabled while the
   work runs, so the action is never triggered twice.
2. The evidence package reports progress through a callback — loading the library, building the
   workbook, adding evidence _n_ of _m_, compressing — because that path is genuinely slower: it
   reads every blob out of IndexedDB and DEFLATEs the archive.
3. ExcelJS and JSZip are dynamically imported, so the cost is paid only by users who export, and the
   entry chunk stays small (~102 kB gzip against a 300 kB budget).

## Revisit if

- A framework grows to the point where `Criteria_Assessment` exceeds roughly 20,000 rows, or
- packaging routinely handles hundreds of megabytes of evidence, or
- a browser profiler shows more than ~2 s of main-thread blocking on a realistic session.

At that point the packaging path — not the workbook path — is the one to move to a worker first.
