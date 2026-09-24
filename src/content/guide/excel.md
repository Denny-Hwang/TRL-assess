# Excel output

Workbooks are static snapshots. They open in Microsoft Excel and LibreOffice and carry data
validation and conditional formatting.

## The two workbooks

:::figure sheet-map:::

- **`Criteria_Assessment`** — one row per CTE × criterion, with the computed _Satisfied_ column.
- **`Evidence_Register`** — every evidence item, then 50 blank rows (`EV-P001`…) that already carry
  the validation lists and the _Open_ formula.
- **`Gap_Actions`** — the unmet mandatory criteria at each CTE's next level, plus 20 blank rows.

## Adoption readiness workbook

The [ARL module](/guide/arl) exports `ARL_<project>_<timestamp>.xlsx`, with the sheets `README`,
`Summary`, `Scope`, `Risk_Assessment` (one row per dimension, with the rubric text), `ARL_Lookup`
(Start and Target cells marked), `References` and `Metadata`.

## Adding evidence in Excel

In `Evidence_Register`, either:

1. put **a URL** in _Location / URL_ — _Open_ becomes "Open link";
2. put **a path relative to the workbook** in _Local file (relative path)_, with the file in an
   `evidence/` folder beside it — _Open_ becomes "Open file"; or
3. set _Marking_ to "Sensitive — reference only" and record the custodian and a reference number.

To keep relative links working, **unzip the whole package before opening the workbook**, and move
the folder, not the workbook alone.

## Values do not recompute

Every computed figure — Satisfied, CTE TRLs, the summary, completeness, coverage, the ARL — is a
**static value** written at export. Editing a status in Excel changes nothing else. Change the
assessment in the app (or re-import the session JSON) and export again.

Text beginning with `=`, `+`, `-` or `@` is written with a leading apostrophe so it cannot run as a
formula.
