# Adoption readiness (ARL)

TRL asks how far a technology has been demonstrated. The Adoption Readiness Level asks what stands
between a working technology and its use — market, money, supply chain, permission. In the words of
the source, ARL "represents important factors for private sector uptake beyond technology readiness"
(`doe-otc-arl-2025`, p. 1).

This tool implements the DOE Office of Technology Commercialization's _Adoption Readiness
Assessment_ (Version: April 2025) as a **side module** at [Adoption Readiness](/arl). It never
changes a TRL result, and the two are never combined into one number.

## The 17 dimensions

:::figure arl-dimensions:::

Each dimension is rated against the rubric's own Low / Medium / High description — shown in full on
every card — or marked N/A. The source asks for the reasoning every time: "Assess the technology
solution based on each dimension of the rubric (Low, Medium, or High Risk, or N/A) and record
rationale and details" (p. 2).

## Scope comes first

The same technology can rate differently at a different scope, so the first step records it, as the
source instructs (p. 2): the **technology scope**, the **value chain scope**, the **timeline** ("Best
practice is to consider a 3-5 year commercialization window") and the **policy environment** ("Best
practice is to assume the current policy environment and no further changes").

## From ratings to a number

:::figure arl-lookup:::

Tally the Medium- and High-risk dimensions and read the ARL from the look-up table on p. 13; the
bands are 1–3 **Low Readiness**, 4–6 **Medium Readiness**, 7–9 **High Readiness**. The table is
deliberately steep:

> "Because even a few high-risk dimensions that remain unsolved can derail a technology solution
> from progressing towards commercialization, as a best practice, we recommend an approach that
> mimics a power law." — `doe-otc-arl-2025`, p. 13

The source calls the number optional and warns about "the lack of nuance that comes with false
precision" (p. 13), so the result page leads with the risk profile. The source also allows users to
modify the table; this tool does not, so that every result stays comparable.

## What this tool adds

Only conservative conventions, the same spirit as "Unsure never counts as Yes" for TRL:

| Rating                    | Counted as               | Why                                                   |
| ------------------------- | ------------------------ | ----------------------------------------------------- |
| Low, Medium, High         | as rated                 | The rubric.                                           |
| N/A with a rationale      | not counted              | The rubric allows N/A; the rationale says why.        |
| N/A without a rationale   | **High**                 | Without the reason, N/A is just a blank.              |
| Unsure                    | **High**                 | An unknown risk is not a low one.                     |
| Not assessed              | **High**                 | A blank is not a low risk.                            |
| Rated without a rationale | as rated, with a warning | The source asks for the rationale behind every score. |
| No end-of-project target  | the current rating       | No planned change.                                    |

**ARL Start** comes from the current ratings. **ARL End** comes from the end-of-project targets and
is labelled _Target — planned, not achieved_. A target that lowers a risk without a planned action
raises a warning.

## DOE TCF lab call — CLIMR, FY2026 & FY2027

The _Core Laboratory Infrastructure for Market Readiness (CLIMR): Technology Specific Topics_ call
(DE-LC-000L130) makes ARL a requirement:

> "Proposals must use the Adoption Readiness Level (ARL) framework to evaluate technology risks,
> ecosystem economics, and private sector uptake potential, and must show an increase in ARL during
> the project period of performance." — `doe-tcf-climr-fy2627`, pp. 12–13

Selecting the CLIMR call profile in the scope step adds a title-page block — ARL Start, ARL End,
TRL Start, TRL End, the four numbers Appendix C asks for (p. 65) — and these checks, each quoting its
requirement with the page:

| Check    | Rule                                                      | Result if not met | Pages      |
| -------- | --------------------------------------------------------- | ----------------- | ---------- |
| CLIMR-C1 | TRL Start is at least 4                                   | Fail              | 12, 46, 65 |
| CLIMR-C2 | NE topic: TRL Start is at least 5 (recommended parameter) | Warning           | 37         |
| CLIMR-C3 | TRL End is a whole number from 4 to 9                     | Fail              | 49, 65     |
| CLIMR-C4 | ARL Start is a whole number from 1 to 9                   | Fail              | 49, 65     |
| CLIMR-C5 | ARL End is a whole number from 2 to 9                     | Fail              | 49, 65     |
| CLIMR-C6 | ARL End is higher than ARL Start                          | Fail              | 12–13      |
| CLIMR-C7 | NE topic: no High risk in D. License to Operate           | Warning           | 37         |
| CLIMR-C8 | Which TRL definitions the TRL Start used                  | Info              | 12         |

**TRL Start** is the Evidence Assessment's system summary when one is computed, otherwise the Quick
Estimate — each shown with its own label. **TRL End** is the target you state. The call asks for
"TRLs defined by the DOE" (p. 12); CLIMR-C8 names the framework and sources your TRL came from so
you can confirm they match.

These checks read the call's words; they do not decide eligibility or merit — DOE does.

## Limitations

- **The rubric is DOE's; the ratings are yours.** Nothing is verified by the tool, and DOE does not
  review or endorse the result.
- **Dimensions overlap.** The source says so: "some risks may fall into more than one dimension"
  (p. 2). Record a risk once, where it bites hardest, and say so in the rationale.
- **One call profile.** CLIMR FY26–27 is the only one shipped; another call needs its own profile,
  quoting its own text.
- **Evidence is a reference, not an attachment.** Name the document, or an evidence id from the
  [Evidence Assessment](/assess), in the evidence field; ARL ratings are not linked into the
  evidence package.

The ARL workbook is described in [Excel output](/guide/excel#adoption-readiness-workbook).
