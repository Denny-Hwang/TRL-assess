# Frameworks & sources

A TRL number means nothing without the framework it was scored against. This tool ships two, and
every export records which one was used and at which version.

:::figure framework-relation:::

## `marine-energy-eere` — the default

**Scope.** Marine energy converters, ocean-observing devices and their subsystems.

**Tier 1.** Nine plain-language questions adapted from the DOE EERE TRL definitions
(`eere-r540-112-02`); each shows the verbatim definition in its help text.

**Tier 2.** References the generic `dod-tra-2025` criteria and adds eight marine and ocean tailoring
items: a risk register and FMECA (TRL 4+); conductive-seawater testing where electrical coupling or
corrosion is plausible (5); recorded environmental extremes (5–6); a test plan separating
deck/dockside from open water (6); logged field duration and failures with root-cause status (6–7);
production-intended parts for critical functions (7); a documented calibration procedure and data
path (7–8); an established data-submission pathway to the observing programme (8). See
[Marine & ocean tailoring](/guide/marine-and-ocean).

**Three framework decisions you should know about:**

1. **TRL 9 comes from the DoD guidebook** — the retrieved EERE document defines TRL 1–8 only.
2. **The level-defining criterion at each TRL is promoted to mandatory**, so a level cannot be
   claimed without the demonstration its definition names. The sources do not classify criteria that
   way; this is the framework's decision, recorded in the data.
3. **Tailored items are mandatory**, each with a rationale. If one does not apply to your element,
   mark it _N/A_ and justify it — that satisfies it.

**Limitations.** The tailoring items are generic by design — no device, no project. The NREL
marine-energy risk framework is cited as the _basis_ of two rationales; its text is not reproduced,
and its report number is still to be confirmed.

## `dod-tra-2025` — generic

**Scope.** Any hardware, software or process element.

**Contents.** Criteria transcribed **verbatim** from the DoD Technology Readiness Assessment
Guidebook (February 2025): Table 2-1 for hardware (pp. 6–7), Table 2-2 for software (pp. 8–10) and
the relevant/operational environment criteria in Section 2 (pp. 12–13). Tier 1 questions are those
definitions restructured as questions (`adapted`).

**Two framework decisions:**

1. **Nothing is marked mandatory** — the guidebook does not classify criteria, so every criterion
   carries `mandatoryBasis: "not specified in source"`. Every level is therefore flagged "No
   mandatory criteria — needs assessor confirmation" and is achieved as soon as one applicable
   criterion is satisfied. Use this framework when you want the source text in front of you and
   intend to apply judgement yourself.
2. **`process` CTEs are offered the hardware criteria**, since the guidebook covers hardware and
   software only. That mapping is this tool's decision, not the source's.

## Provenance policy

| `origin`   | Meaning                                        | Enforced by `npm run validate:criteria`                               |
| ---------- | ---------------------------------------------- | --------------------------------------------------------------------- |
| `verbatim` | Copied exactly from the source                 | Only from public-domain, quotable documents; section or page required |
| `adapted`  | Source wording restructured, meaning preserved | A rationale is required                                               |
| `tailored` | Not in any source; added by the framework      | A rationale is required                                               |

ISO 16290:2013 is cited **by clause number only** — its text is never reproduced here, and the
validator fails the build if anything claims ISO as the source of quoted text.

## Sources

The full list — retrieval dates, SHA-256 hashes of the local copies, quotability flags — is in
`docs/sources/SOURCES.md`. Two documents named in the original specification could not be obtained:
DOE G 413.3-4A and GAO-20-48G. **No content is attributed to them** and no framework claims them.

## Requesting a correction

If a criterion misquotes its source, open a **Criteria correction** issue with the framework id, the
item id, what the source actually says and the page reference. Corrections are data changes — no
code has to move for a criterion to be fixed.
