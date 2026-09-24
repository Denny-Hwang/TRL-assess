# Frequently asked questions

## Is this an official Technology Readiness Assessment?

No. A TRA is run by an independent team under an agency's process. This tool records what you enter
and applies the rules conservatively. Every result and export says so.

## Does the ARL module change my TRL?

No. ARL is scored separately and never combined with a TRL. See [Adoption readiness](/guide/arl).

## Can I use the result in a proposal?

As your own statement of maturity, with the framework, version and evidence named. Do not present it
as independent. If a solicitation names its own TRL definitions, use those.

## Why is my Tier 2 result lower than my Tier 1 estimate?

Tier 2 needs evidence for every claim, every mandatory criterion at a level, and takes the _minimum_
across critical CTEs. Look at the limiting CTE first.

## Why does "Unsure" count as "No"?

A readiness level claims something was demonstrated. If you are unsure it was, you cannot claim it.

## What if a criterion does not apply?

Mark it **N/A** with a justification — that counts as satisfied. An N/A without a justification does
not.

## Why does my level say "No mandatory criteria — needs assessor confirmation"?

The framework's source does not classify criteria as mandatory, so the level is achieved once one
applicable criterion is satisfied, and you must confirm it. See [Frameworks](/guide/frameworks).

## Where is my data?

In this browser only: the assessment in `localStorage`, evidence files in IndexedDB. The app makes no
network requests. Different browsers and devices do not share storage.

## What happens if I clear my browser data?

The assessment and every stored file are gone. Export JSON or the evidence package first.

## Can I share the evidence package?

Yes. Items marked "Sensitive — reference only" are never bundled; everything else is, so treat the
`.zip` as being as sensitive as its contents. The manifest lets a recipient check nothing changed.

## Why can I not attach a file to a "Sensitive — reference only" item?

To keep controlled material out of the tool. Record the title, custodian and a reference number
instead.

## Can I edit the workbook and re-import it?

No. Workbooks are static snapshots; re-import the session JSON instead.

## Can I fix a criterion or add a framework?

Frameworks are JSON data. Open a **Criteria correction** issue with the source and page reference;
see `CONTRIBUTING.md`.
