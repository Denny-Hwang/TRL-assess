# Excel output

Both workbooks are static snapshots. They open in Microsoft Excel and LibreOffice, carry data
validation and conditional formatting, and never phone home.

## Tier 1 workbook

| Sheet                        | What it is for                                                                                                           |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `README`                     | The label, the disclaimer, what each sheet means, how to fill placeholders, and the tool / framework / build provenance. |
| `Summary`                    | Estimated TRL, highest level claimed, build × environment cross-check, consistency rating, flags.                        |
| `Context`                    | Every context field, with the environment and build codes spelled out in full.                                           |
| `Responses`                  | One row per screening question: answer (validated Yes/No/Unsure), note, origin, source.                                  |
| `Next_Evidence_Placeholders` | The criteria at the next two levels, plus 10 blank rows for planning evidence.                                           |
| `References`                 | The source documents, with clickable URLs.                                                                               |

## Tier 2 workbook

| Sheet                 | What it is for                                                                                                                                                                             |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `README`              | As above, plus **how to attach evidence in Excel**.                                                                                                                                        |
| `Summary`             | System summary, limiting CTE(s), Tier 1 comparison and delta, and a per-CTE table with completeness and evidence coverage.                                                                 |
| `CTE_Register`        | Every CTE: kind, critical flag, description, why critical, owner, target and assessed TRL.                                                                                                 |
| `Criteria_Assessment` | One row per CTE × applicable criterion: status, justification, computed Satisfied, evidence ids, an "Additional evidence (placeholder)" column and your notes.                             |
| `Evidence_Register`   | Every evidence item with location, local path, repo and commit, DOI, size, SHA-256, marking, verification and whether it is bundled — followed by 50 pre-formatted blank placeholder rows. |
| `Gap_Actions`         | The unmet mandatory criteria at each CTE's next level, pre-filled and ready to plan against, plus 20 blank rows.                                                                           |
| `Review_Signoff`      | Assessor and independent-reviewer blocks, with a validated conclusion list.                                                                                                                |
| `References`          | Every source cited by the framework.                                                                                                                                                       |
| `Metadata`            | Schema, app and framework versions, git SHA, timestamps, package type and counts.                                                                                                          |

## How to attach evidence in Excel

Three routes, in `Evidence_Register`:

1. **A URL.** Put it in _Location / URL_. The _Open_ column turns it into "Open link".
2. **A local file.** Put a path **relative to the workbook** in _Local file (relative path)_ and keep
   the file in an `evidence/` folder next to the workbook. The _Open_ column becomes "Open file".
3. **A pointer only.** For material you must not attach, set _Marking_ to
   "Sensitive — reference only" and record the custodian and a reference number.

The _Open_ column holds
`=IF(G{r}<>"",HYPERLINK(G{r},"Open file"),IF(F{r}<>"",HYPERLINK(F{r},"Open link"),""))`, so it works
on the placeholder rows too.

## Keeping relative links working

The evidence package is built so that the links resolve: the workbook sits next to `evidence/`, and
the paths in the workbook point at that folder. Two rules keep it that way:

- **Unzip the whole folder before opening the workbook.** Opening the workbook from inside a zip
  viewer gives it a temporary location and the relative links break.
- **Move the folder, not the workbook.** Keep the workbook and `evidence/` together.

If you export the workbook on its own rather than as a package, the relative paths are still shown
for reference, and the _Bundled in package_ column says "No (not bundled)".

## The placeholder rows

`Evidence_Register` ends with 50 blank rows (`EV-P001`…) that already carry the validation lists, the
light fill and the Open formula. They exist so a colleague can add evidence in Excel without the app.
`Gap_Actions` has 20 blank rows for the same reason. Nothing you type there comes back into the app —
see below.

## Why values do not recompute

Every computed figure — Satisfied, the CTE TRLs, the system summary, completeness, coverage — is
written as a **static value** at export time. Changing a status in Excel does not change the TRL.

This is deliberate: a spreadsheet full of formulas implementing the scoring rules would drift from
the app's implementation, and there would be no way to tell which one was right. The workbook is a
record; the app is the calculator. To recompute, change the assessment in the app, or re-import the
session JSON, and export again.

## Formula-injection guard

Any text you typed that begins with `=`, `+`, `-` or `@` is written with a leading apostrophe, so a
spreadsheet cannot execute content that came from a form field. You will see the apostrophe in the
formula bar; the cell displays your text normally.
