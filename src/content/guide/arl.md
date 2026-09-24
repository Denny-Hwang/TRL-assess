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

## Limitations

- **The rubric is DOE's; the ratings are yours.** Nothing is verified by the tool, and DOE does not
  review or endorse the result.
- **Dimensions overlap.** The source says so: "some risks may fall into more than one dimension"
  (p. 2). Record a risk once, where it bites hardest, and say so in the rationale.
- **Evidence is a reference, not an attachment.** Name the document, or an evidence id from the
  [Evidence Assessment](/assess), in the evidence field; ARL ratings are not linked into the
  evidence package.

The ARL workbook is described in [Excel output](/guide/excel#adoption-readiness-workbook).
