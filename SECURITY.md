# Security policy

## Threat model in one line

TRL Assess is a static, client-side web application. It has no backend, no accounts, and makes no
network requests at runtime. Everything you type or attach stays in your browser until _you_
download a file.

## Where your data lives

| Data                                                            | Location                                   | Cleared by                                                              |
| --------------------------------------------------------------- | ------------------------------------------ | ----------------------------------------------------------------------- |
| Assessment session (answers, CTEs, criteria, evidence metadata) | `localStorage` key `trl-assess:session:v1` | "Clear all local data" in the app, or clearing site data in the browser |
| Evidence file contents (blobs)                                  | IndexedDB store `trl-assess-evidence`      | Same as above                                                           |
| UI preferences, dismissed notices                               | `localStorage` / `sessionStorage`          | Same as above                                                           |

Nothing is uploaded. Exported `.xlsx` and `.zip` files are generated in the browser and saved
through the browser's normal download path.

## Controlled and sensitive information

Do **not** enter classified, export-controlled, CUI or otherwise sensitive content into this tool,
especially when it is hosted on a public site. Use evidence entries marked
**"Sensitive — reference only"** to record a pointer (title, custodian, location) without attaching
the file; the app refuses to store a file blob for those entries.

## Reporting a vulnerability

Open an issue at https://github.com/Denny-Hwang/TRL-assess/issues. For anything you believe should
not be public, open an issue asking for a private contact channel and do not include details.

Please do not include sensitive data in a report.
