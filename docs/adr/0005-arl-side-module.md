# ADR-0005: An Adoption Readiness Level (ARL) side module, with a CLIMR lab-call profile

- Status: Accepted — decisions confirmed by the project owner, 2026-09-24; decision 4 (the CLIMR
  call profile) withdrawn the same day at the owner's request — the tool stays generic
- Date: 2026-09-24
- Phase: post-1.0

## Context

The owner asked for readiness to be assessed from the **Adoption Readiness Level (ARL)**
perspective as well, with reference to the DOE Technology Commercialization Fund lab call
_Core Laboratory Infrastructure for Market Readiness (CLIMR): Technology Specific Topics_,
DE-LC-000L130, FY2026 & FY2027 (`doe-tcf-climr-fy2627`). The call makes ARL a requirement:

| Requirement (quoted)                                                                                                                                                                                                                 | Page  |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----- |
| "Proposals must use the Adoption Readiness Level (ARL) framework to evaluate technology risks, ecosystem economics, and private sector uptake potential, and must show an increase in ARL during the project period of performance." | 12–13 |
| "…technologies must be at a minimum Technology Readiness Level (TRL) of 4 at the time of writing a concept paper, using TRLs defined by the DOE."                                                                                    | 12    |
| NE topic, recommended parameters: "Minimum Technology Readiness Level (TRL) of 5" and "the 'License to Operate' core risk area (section D) should not contain any 'high risks'…"                                                     | 37    |
| "Note: TRL and ARL values should be provided quantitatively as a number, not qualitatively nor as a range."                                                                                                                          | 49    |
| Title page: "ARL Start (enter number between 1–9)", "ARL End (enter number between 2–9)", "TRL Start (enter number between 4–9)", "TRL End (enter number between 4–9)"                                                               | 65    |

The call does not contain the ARL framework itself. Its source — the DOE Office of Technology
Commercialization's _Adoption Readiness Assessment_ — lives on `energy.gov`, which this build
environment's egress policy blocks (HTTP 403 on CONNECT, and the WebFetch tool is blocked for the same
host). That was a BUILD_SPEC STOP condition until the owner supplied the PDF by hand
(`ARL_Assessment_9-23-25_0.pdf`, cover "Version: April 2025", SHA-256 in `docs/sources/SOURCES.md`).

The source defines everything a scoring rule needs, so nothing has to be invented:

- 17 dimensions in four lettered core risk areas — A. Value Proposition (3), B. Market Acceptance (3),
  C. Resource Maturity (6), D. License to Operate (5) — each with a Low, Medium and High description
  and an N/A option (pp. 3–12);
- the instruction to rate each dimension "(Low, Medium, or High Risk, or N/A) and record rationale
  and details" (p. 2);
- an optional number: tally the Medium- and High-risk dimensions and read the ARL from a 9 × 9
  look-up table whose last row and column are "8+", with bands 1–3 Low, 4–6 Medium, 7–9 High
  Readiness (p. 13).

Adding ARL is a scope change of class (b) under BUILD_SPEC C-3: it adds to D-1, D-2, D-3 and D-6.
Backlog issue #5 had already set the pattern for neighbouring scales — separate, clearly labelled
modules that reuse the machinery without touching TRL scoring, never combined into a composite
number, each naming its source and version.

## Decisions

The owner chose the recommended option on each of the four questions put to them on 2026-09-24.

### 1. A side module with its own workbook — TRL is untouched

A new route `/arl` (scope → rate → result), a navigation item and a Home card. D-2.1/D-2.2 scoring,
the Tier 1 and Tier 2 workbooks (D-3.1, D-3.2) and the evidence package (D-4) do not change; the ARL
exports its own workbook (D-3.3). No composite TRL × ARL figure exists anywhere.

### 2. The source's table, used as printed; this tool's only addition is conservative

- Ratings are the rubric's Low / Medium / High / N/A, plus _Unsure_ and _Not assessed_.
- **Unsure, Not assessed, and N/A without a rationale count as High risk** in every computation and
  are listed in a flag — the ARL analogue of "Unsure never counts as Yes" (principle 3). An N/A with
  a rationale is not counted, as the source allows.
- The ARL is read from the p. 13 table **unmodified**. The source says users "can modify the look-up
  table according to their own needs"; this tool does not, so results stay comparable.
- A rating without a rationale raises a warning but does not change the number (the source asks for
  the rationale; it does not make the score depend on it).

### 3. Start and target are both rated

Each dimension carries a current rating and an optional end-of-project target (Low / Medium / High).
**ARL Start** comes from the current ratings; **ARL End** from the targets, with the current rating
carried forward where no target is set, labelled "Target — planned, not achieved". A target that
lowers a risk without a planned action raises a warning.

### 4. An optional, data-driven call profile for CLIMR FY26–27

`src/data/frameworks/arl/call-profiles/doe-tcf-climr-fy2627.json` quotes 13 requirement sentences
with their pages and defines eight checks (D-2.4): TRL Start ≥ 4 (fail); NE: TRL Start ≥ 5
(warning — a recommended parameter); TRL End 4–9; ARL Start 1–9; ARL End 2–9; ARL End > ARL Start
(all fail); NE: no High risk in area D (warning — recommended parameter); and an informational note
naming the TRL definitions the TRL Start used, because the call asks for "TRLs defined by the DOE".
TRL Start is the Tier 2 system summary when computed, otherwise the Tier 1 estimate, each with its
own label. The requirement sentences appear in the public app with their page numbers — approved by
the owner.

### 5. Data model and storage

`AssessmentSession` gains an optional `arl` block (D-1.1) and the session schema goes to **v2**, with
a no-op v1 → v2 migration, so an older build refuses a v2 file instead of silently dropping its ARL
ratings. The ARL block survives a TRL framework switch and a Quick Estimate reset; _Reset ARL_ and
"clear all local data" remove it.

### 6. Content is data, validated like criteria

The rubric (`src/data/frameworks/arl/doe-otc-arl-2025.json`) and the call profile are JSON; every
item carries a source, a page and an origin, and `npm run validate:criteria` applies the same
provenance rules as for criteria. The ARL page and its data are lazy-loaded, outside the entry chunk.

## Consequences

- A proposal team gets ARL Start and ARL End — the numbers the CLIMR title page asks for — with the
  reasoning per dimension and the lab-call checks, in the app and in `ARL_<project>_<ts>.xlsx`.
- TRL results, workbooks and packages are unchanged; existing sessions load (migrated to v2) and
  score identically.
- Evidence is a free-text reference per dimension in this first version; linking ARL dimensions into
  the evidence library would change D-4 and is left for a later decision.
- The CLIMR profile ages with the call. A later call is a new profile file quoting its own text.

## Alternatives considered

| Option                                                | Why not                                                                                            |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| ARL sheets inside the Tier 1 / Tier 2 workbooks       | Changes D-3.1/D-3.2 and every read-back test; mixes two scales in one file. Declined by the owner. |
| No number until all 17 dimensions are rated           | Also conservative, but hides the effect of a gap; the owner preferred High + a flag.               |
| Rate the current state only and type ARL End by hand  | A bare target number carries no reasoning, and the call weighs the ARL increase.                   |
| Transcribe the rubric from memory or search summaries | Violates principle 2. The module waited for the source PDF.                                        |
| A composite "TRL + ARL" readiness number              | Ruled out by issue #5; neither source defines one.                                                 |
