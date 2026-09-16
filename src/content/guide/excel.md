# Excel output

Both workbooks are static snapshots. They open in Microsoft Excel and LibreOffice, carry data
validation and conditional formatting, and never phone home.

## The two workbooks

:::figure sheet-map:::

Sheet order is fixed. Three of them are not self-explanatory:

- **`Criteria_Assessment`** — one row per CTE × criterion, with the computed _Satisfied_ column and
  an "Additional evidence (placeholder)" column for anything you add by hand.
- **`Evidence_Register`** — every evidence item, then 50 pre-formatted blank rows (`EV-P001`…) that
  already carry the validation lists and the Open formula.
- **`Gap_Actions`** — pre-filled with the unmet mandatory criteria at each CTE's next level, plus 20
  blank rows to plan against.

## How to attach evidence in Excel

Three routes, in `Evidence_Register`:

1. **A URL** in _Location / URL_ — the _Open_ column becomes "Open link".
2. **A local file**: a path **relative to the workbook** in _Local file (relative path)_, with the
   file in an `evidence/` folder beside it — _Open_ becomes "Open file".
3. **A pointer only**: set _Marking_ to "Sensitive — reference only" and record the custodian and a
   reference number.

The _Open_ column holds
`=IF(G{r}<>"",HYPERLINK(G{r},"Open file"),IF(F{r}<>"",HYPERLINK(F{r},"Open link"),""))`, so it works
on the blank placeholder rows too — they already carry the validation lists and the formula, so a
colleague can add evidence in Excel without the app.

## Keeping relative links working

- **Unzip the whole folder before opening the workbook.** Opening it from inside a zip viewer gives
  it a temporary location and the links break.
- **Move the folder, not the workbook.** Keep the workbook beside `evidence/`.

Exported on its own rather than as a package, the relative paths are still shown and the _Bundled in
package_ column says "No (not bundled)".

## Why values do not recompute

Every computed figure — Satisfied, the CTE TRLs, the summary, completeness, coverage — is a
**static value** written at export time. Changing a status in Excel changes nothing else.

This is deliberate: a spreadsheet re-implementing the scoring rules would drift from the app, and
there would be no way to tell which was right. The workbook is the record; the app is the
calculator. Change the assessment in the app — or re-import the session JSON — and export again.

## Formula-injection guard

Text you typed that begins with `=`, `+`, `-` or `@` is written with a leading apostrophe, so a
spreadsheet cannot execute content that came from a form field. The apostrophe shows in the formula
bar; the cell displays your text normally.
