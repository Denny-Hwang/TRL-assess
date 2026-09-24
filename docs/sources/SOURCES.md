# Sources

Provenance for every framework source. Each Tier 1 question and Tier 2 criterion in
`src/data/frameworks/**` cites one of these ids together with a section and page.

`verbatim` text is permitted **only** from documents marked "Public domain: yes" and
"Quotable: yes". ISO standards are cited by clause number only and are never transcribed.

| id                    | Title                                                                                                                 | Issuer                                                                           | Version / date                                                                  | Public domain              | Quotable                                                         | Status                                   |
| --------------------- | --------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | -------------------------- | ---------------------------------------------------------------- | ---------------------------------------- |
| `eere-r540-112-02`    | Technology Readiness Levels (TRLs)                                                                                    | U.S. DOE, Office of Energy Efficiency and Renewable Energy (Golden Field Office) | EERE R 540.112-02, template version 11/17/15; PDF created 2022-08-26            | Yes (U.S. Government work) | Yes                                                              | Held locally                             |
| `dod-tra-2025`        | Technology Readiness Assessment Guidebook                                                                             | U.S. Department of Defense, OUSD(R&E)                                            | February 2025, v2 (cleared for public release)                                  | Yes (U.S. Government work) | Yes                                                              | Held locally                             |
| `dod-mrl-matrix-2018` | Manufacturing Readiness Level (MRL) Matrix                                                                            | U.S. Department of Defense (DoD MRL working group)                               | V2018                                                                           | Yes (U.S. Government work) | Reference only                                                   | Held locally                             |
| `doe-otc-arl-2025`    | Adoption Readiness Assessment (ARL rubric and look-up table)                                                          | U.S. DOE, Office of Technology Commercialization                                 | Version: April 2025; file ARL_Assessment_9-23-25_0.pdf, PDF modified 2025-09-23 | Yes (U.S. Government work) | Yes                                                              | Held locally                             |
| `doe-g413-3-4a`       | DOE G 413.3-4A, Technology Readiness Assessment Guide (Appendix F TRL Calculator)                                     | U.S. DOE                                                                         | 2011, chg 1 2015                                                                | Yes (U.S. Government work) | Yes                                                              | **Not obtained — see "Blocked sources"** |
| `gao-20-48g`          | GAO-20-48G, Technology Readiness Assessment Guide                                                                     | U.S. GAO                                                                         | January 2020                                                                    | Yes (U.S. Government work) | Yes                                                              | **Not obtained — see "Blocked sources"** |
| `nrel-me-risk`        | Marine Energy Technology Development Risk Management Framework                                                        | NREL (for DOE WPTO)                                                              | report number to be confirmed                                                   | Yes (U.S. Government work) | **No — not obtained; cited as the basis of tailored items only** | **Not obtained**                         |
| `nrel-tpl`            | Technology Performance Level (TPL) Assessment                                                                         | NREL                                                                             | web resource                                                                    | Yes                        | Reference only                                                   | Not obtained                             |
| `iso-16290`           | ISO 16290:2013, Space systems — Definition of the Technology Readiness Levels (TRLs) and their criteria of assessment | ISO                                                                              | 2013                                                                            | No                         | **Never quote — clause references only**                         | Not obtained (by design)                 |
| `goos-foo`            | Framework for Ocean Observing                                                                                         | GOOS / UNESCO-IOC                                                                | current web edition                                                             | No (intergovernmental)     | Reference only                                                   | Not obtained                             |

## File hashes (local copies, `references/` — git-ignored)

| File                                  | SHA-256                                                            |
| ------------------------------------- | ------------------------------------------------------------------ |
| `references/eere-r540-112-02.pdf`     | `c11cca82fef5c3b27783f9cc7d7f5859a68c59674962b5478b9323c8b7f8e0b6` |
| `references/dod-tra-2025.pdf`         | `1b3f9c4c8504fc3a8ac80b7ccb6d5606e03a121f7df1a814e073a351813b6cbb` |
| `references/dod-mrl-matrix-2018.xlsx` | `759b2287966f96db679e85f85a011d5ce11d7ea63ab86c4e602021d5a3f57768` |
| `references/doe-otc-arl-2025.pdf`     | `6c2fbc929a681ad80829e38ce88b9f0818d2d78d98ec9d4332cffbe60e58cce9` |

The first three were retrieved 2026-09-16 and the last one 2026-09-24, all supplied by the project
owner because the build environment's egress policy blocks the issuing sites (`energy.gov` included,
for the WebFetch tool as well).

## URLs

| id                    | URL                                                                                                                      |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `eere-r540-112-02`    | https://www.energy.gov/sites/default/files/2022-08/EERE_R_540.112-02_Technology_Readiness_Levels_%28TRLs%29.pdf          |
| `dod-tra-2025`        | https://www.cto.mil/wp-content/uploads/2025/03/TRA-Guide-Feb2025.v2-Cleared.pdf                                          |
| `dod-mrl-matrix-2018` | https://www.dodmrl.com/                                                                                                  |
| `doe-otc-arl-2025`    | https://www.energy.gov/technologycommercialization/adoption-readiness-levels-arl-framework (the page the lab call cites) |
| `doe-g413-3-4a`       | https://www.directives.doe.gov/directives-documents/400-series/0413.3-EGuide-04a/@@images/file                           |
| `gao-20-48g`          | https://www.gao.gov/assets/gao-20-48g.pdf                                                                                |
| `nrel-tpl`            | https://tpl.nrel.gov/                                                                                                    |
| `goos-foo`            | https://goosocean.org/what-we-do/framework/                                                                              |

## What was transcribed, and how

### `dod-tra-2025` → framework `dod-tra-2025`

| Content                                                         | Source location                                                                              | Origin                                            |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| Hardware criteria `DOD-T2-L{1..9}-{01..03}`                     | Table 2-1, DoD Hardware TRL Definitions, Descriptions, and Supporting Information — pp. 6–7  | `verbatim`                                        |
| Software criteria `DOD-T2-SW-L{1..9}-{01..03}`                  | Table 2-2, DoD Software TRL Definitions, Descriptions, and Supporting Information — pp. 8–10 | `verbatim`                                        |
| Relevant / operational environment criteria `DOD-T2-L{5..8}-90` | Section 2, pp. 12–13                                                                         | `verbatim`                                        |
| Tier 1 questions `DOD-T1-L{1..9}`                               | Table 2-1, pp. 6–7                                                                           | `adapted` (definition restructured as a question) |
| Glossary terms in the Guide                                     | Table 2-3, Additional Definitions of TRL Descriptive Terms — p. 11                           | `verbatim`, quoted with attribution               |

Page numbers are the printed page numbers of the guidebook, not PDF page indices.

### `eere-r540-112-02` → framework `marine-energy-eere`

| Content                           | Source location                       | Origin                                                                                        |
| --------------------------------- | ------------------------------------- | --------------------------------------------------------------------------------------------- |
| Tier 1 questions `MEE-T1-L{1..8}` | TRL definitions, pp. 1–2              | `adapted`; the verbatim definition is reproduced in the question's help text with attribution |
| Tier 1 question `MEE-T1-L9`       | **DoD TRA Guidebook Table 2-1, p. 7** | `adapted` — see the transcription note below                                                  |

**Transcription note — EERE defines TRL 1–8 only.** The retrieved EERE R 540.112-02 PDF (2 pages,
template version 11/17/15) ends with TRL-8 ("Technology is ready to move from development to
commercialization"). It contains no TRL 9 definition. The TRL 9 screening question is therefore
adapted from the DoD TRA Guidebook, another U.S. Government public-domain source, and the
substitution is stated in the question's help text inside the app.

Wording check against BUILD_SPEC D-6.1: the eight questions supplied in the spec match the EERE
definitions on every substantive element (scale, environment, integration, end-user
specifications). No adjustment was needed, apart from the TRL 9 substitution above.

### `doe-otc-arl-2025` → ARL side module (`src/data/frameworks/arl/doe-otc-arl-2025.json`)

| Content                                                                                                                              | Source location                                          | Origin     |
| ------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------- | ---------- |
| Core risk areas A–D, names and descriptions                                                                                          | Introduction to Adoption Readiness Levels (ARLs), p. 1   | `verbatim` |
| Dimensions `ARL-A1`…`ARL-D5`: title, description, Low / Medium / High text                                                           | Sections A–D, pp. 3–12, one dimension per page reference | `verbatim` |
| Look-up table (rows: Medium count, columns: High count, "8+") and readiness bands                                                    | Combining the risk dimensions into an ARL score, p. 13   | `verbatim` |
| Instructions quoted in the app (scope, policy environment, rating, optional score, power law, false precision, look-up modification) | Instructions for using this assessment, p. 2; p. 13      | `verbatim` |

**Transcription method.** Each rubric table has three columns; the text was extracted column by
column from the PDF's word positions, so that lines from neighbouring columns cannot interleave, then
checked against a rendering of every page. Line-end hyphens are all compound words in the source
(`cost-parity`, `off-take`, `large-scale`, `well-understood`, `time-consuming`) and are kept; the
Delivered Cost "Low" text keeps its `a.` / `b.` list structure as line breaks. The cover reads
"Version: April 2025"; the file name and PDF metadata date the file 2025-09-23.

**What the tool adds.** Counting Unsure, Not assessed and N/A-without-rationale as High is this
tool's conservative convention (ADR-0005), not a rule of the source, and is labelled as such in the
app, the Guide and the workbook.

### Tailored items (`origin: "tailored"`)

The eight marine and ocean tailoring items (`MEE-T2-*-T0*`) come from BUILD_SPEC D-6.2. Each
carries a rationale in the data file. Their `source` ids point at `nrel-me-risk`,
`eere-r540-112-02` or `goos-foo` as the basis of the rationale — **not** as the source of the
wording, which is this tool's own. No text is quoted from those documents.

## Blocked sources

`doe-g413-3-4a` (DOE G 413.3-4A Appendix F TRL Calculator) and `gao-20-48g` (GAO-20-48G) could not
be downloaded: the build environment's egress proxy denies `directives.doe.gov`, `energy.gov` and
`gao.gov` (HTTP 403 on CONNECT). No content from either document appears anywhere in this
repository, and no framework claims them as a source. Transcribing DOE G 413.3-4A Appendix F is
tracked as follow-up work in `docs/PROGRESS.md`.

`nrel-me-risk` was not obtained either. It is cited only as the _basis_ of tailored rationales, in
the wording BUILD_SPEC D-6.2 supplied; no text from it is reproduced, and the report number is
still to be confirmed by the project owner.
