# Frameworks & sources

A TRL means little without the framework it was scored against. Choose the framework when you start
a session; every export records its id and version.

:::figure framework-relation:::

## `dod-tra-2025` — the default

**Scope.** Any hardware, software or process element.

**Contents.** Criteria transcribed **verbatim** from the DoD Technology Readiness Assessment
Guidebook (February 2025): Table 2-1 for hardware (pp. 6–7), Table 2-2 for software (pp. 8–10) and
the relevant/operational environment criteria in Section 2 (pp. 12–13). Tier 1 questions restate
those definitions as questions (`adapted`).

**Two things to know:**

1. **Nothing is mandatory.** The guidebook does not classify criteria, so every level is flagged "No
   mandatory criteria — needs assessor confirmation" and is achieved once one applicable criterion is
   satisfied. Apply your own judgement to what the level needs.
2. **`process` CTEs are offered the hardware criteria**, since the guidebook covers hardware and
   software only. That mapping is this tool's decision.

## `marine-energy-eere` — marine energy and ocean devices

**Scope.** Marine energy converters, ocean-observing devices and their subsystems.

**Tier 1.** Nine questions adapted from the DOE EERE TRL definitions (`eere-r540-112-02`). That
document defines TRL 1–8 only, so the TRL 9 question comes from `dod-tra-2025`, Table 2-1.

**Tier 2.** The `dod-tra-2025` criteria, with the level-defining criterion at each TRL made
mandatory, plus eight **tailored** items, all mandatory: a risk register and FMECA (TRL 4);
conductive-seawater testing and environmental extremes (5); a test plan separating dockside from open
water, and logged field duration and failures (6); production-intended parts, and a documented
calibration procedure and data path (7); an exercised data-submission pathway to the observing
programme (8). If one does not apply, mark it _N/A_ with a justification.

Tailored rationales cite NREL's marine-energy risk framework (`nrel-me-risk`) and the GOOS Framework
for Ocean Observing (`goos-foo`); no text from them is reproduced.

## `doe-otc-arl-2025` — adoption readiness

Not a TRL framework. The DOE _Adoption Readiness Assessment_ (Version: April 2025): 17 adoption-risk
dimensions and the look-up table that turns them into an ARL, transcribed **verbatim**. Scored
separately and never combined with a TRL; see [Adoption readiness](/guide/arl).

## Provenance

| `origin`   | Meaning                                        |
| ---------- | ---------------------------------------------- |
| `verbatim` | Copied exactly from a public-domain source     |
| `adapted`  | Source wording restructured, meaning preserved |
| `tailored` | Not in any source; added by the framework      |

`adapted` and `tailored` items carry a rationale. ISO 16290:2013 is cited by clause number only; its
text is never reproduced.

If a criterion misquotes its source, open a **Criteria correction** issue with the framework id, the
item id, what the source says and the page reference.
