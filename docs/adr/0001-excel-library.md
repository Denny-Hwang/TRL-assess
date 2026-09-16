# ADR-0001: Use ExcelJS for .xlsx generation

- Status: Accepted
- Date: 2026-09-16
- Phase: 0

## Context

BUILD_SPEC D-3 requires workbooks with: bold header rows, freeze panes, autofilter, list data
validation, conditional formatting, hyperlink cells (absolute **and** relative), `HYPERLINK()`
formulas, column widths and wrapped text. Generation must happen entirely in the browser
(principle 1: client-side only) and must not bloat the initial JavaScript bundle.

## Decision

Use **ExcelJS** (`exceljs`), loaded through a dynamic `import()` so it lands in its own chunk.

## Evidence

`tests/unit/spike-excel.test.ts` writes a workbook, reads it back with ExcelJS, and asserts that
each of the following survived the round-trip:

| Feature                | Assertion                                                           |
| ---------------------- | ------------------------------------------------------------------- |
| Hyperlink cell         | `cell.value.hyperlink === 'https://example.org/report.pdf'`         |
| Relative hyperlink     | `cell.value.hyperlink === 'evidence/EV-0001_report.pdf'`            |
| List data validation   | `cell.dataValidation.type === 'list'`, formula contains the options |
| `HYPERLINK()` formula  | `cell.value.formula` contains `HYPERLINK`                           |
| Freeze panes           | `sheet.views[0].state === 'frozen'`, `ySplit === 1`                 |
| Conditional formatting | `sheet.conditionalFormattings.length > 0`                           |
| Autofilter             | `sheet.autoFilter` is set                                           |
| Lazy loading           | `await import('exceljs')` resolves to a module exposing `Workbook`  |

All assertions pass on Node 22 with `exceljs@4.4.x`.

## Consequences

- ExcelJS is large (~1 MB raw). It is code-split into its own chunk (`manualChunks` in
  `vite.config.ts`) and only fetched when the user clicks an export button, keeping the initial
  bundle within the Phase 8 budget.
- ExcelJS relies on Node-style APIs in some code paths; the browser build works because Vite
  provides the needed shims. A build-time check that `exceljs` is not in the entry chunk is added
  in Phase 4.
- Alternatives considered: `xlsx` (SheetJS) community edition — no data validation or conditional
  formatting support in the free build; `write-excel-file` — no conditional formatting. Neither
  meets D-3.

## Fallback if ExcelJS regresses

Generate the workbook as Office Open XML directly with JSZip (the dependency is already present
for the evidence package). This is a significant amount of work and would be raised with the user
before being attempted.
