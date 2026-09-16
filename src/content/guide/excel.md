# Excel output

_(Full sheet-by-sheet guidance lands with the documentation phase. This page already describes the
Tier 1 workbook, which the app can export today.)_

## Tier 1 workbook

A Tier 1 export is a snapshot of a quick estimate. It has six sheets:

| Sheet                        | What it is for                                                                                                       |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `README`                     | The label, the disclaimer, what each sheet means, how to fill placeholders, and the tool/framework/build provenance. |
| `Summary`                    | Estimated TRL, highest level claimed, the build × environment cross-check, the consistency rating and any flags.     |
| `Context`                    | Every context field you entered, with the environment and build codes spelled out.                                   |
| `Responses`                  | One row per screening question: your answer, your note, the origin of the question and its source.                   |
| `Next_Evidence_Placeholders` | The criteria at the next two levels, with blank rows for planning the evidence you will need.                        |
| `References`                 | The source documents behind the questions, with links.                                                               |

## Filling the placeholders

1. Describe what you intend to produce in **Planned evidence (placeholder)**.
2. Put a URL, or a path relative to the workbook, in **Evidence link / path (placeholder)**.
3. The **Open** column holds `=IF(E2="","",HYPERLINK(E2,"Open"))`, so it becomes a clickable link
   as soon as you fill the cell next to it.

## Values do not recompute

Every computed figure is written as a static value at export time. Editing the workbook does not
change the TRL. To recompute, change your answers in the app and export again — or re-import the
session JSON into the app.

## Do not paste sensitive content

The workbook is a plain file that travels by e-mail and shared drives. Record a pointer — title,
custodian, reference number — rather than the controlled content itself.
