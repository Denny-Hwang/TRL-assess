# What a Technology Readiness Level is

A Technology Readiness Level (TRL) is a number from 1 to 9 that answers one narrow question: **how
far has this technology been demonstrated, and in what environment?** It is not a measure of how
good the technology is, how commercially attractive it is, or how well the project is managed. A
brilliant idea that has only been simulated sits at a low TRL; a mediocre device that has flown a
full mission sits at a high one.

## Where the 1–9 scale came from

The scale was developed at NASA in the 1970s and refined through the 1980s and 1990s. The U.S.
Government Accountability Office's 1999 report on weapon-system outcomes concluded that maturing
technology before committing it to a product reduces cost and schedule risk, and the Department of
Defense adopted TRLs across acquisition programmes from there (`dod-tra-2025`, Preface). The
Department of Energy, NASA, the European Commission and ISO all now publish their own TRL
definitions.

## The nine levels

The wording below follows the DOE EERE definitions (`eere-r540-112-02`, pp. 1–2), which this tool's
default framework uses for its screening questions.

| TRL | EERE heading                                                                            | What it means in practice                                                                                                                   |
| --- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Basic principles observed and reported                                                  | The scientific problem or phenomenon is identified and validated through peer-reviewed research.                                            |
| 2   | Technology concept and/or application formulated                                        | Applied research: theory focused on a specific application, with analytical tools developed for it.                                         |
| 3   | Analytical and experimental critical function and/or characteristic proof of concept    | Proof of concept achieved; an immature prototype is exercised with representative inputs to validate predictions.                           |
| 4   | Component and/or process validation in laboratory environment — alpha prototype         | A stand-alone prototype is tested in the laboratory; component elements are integrated enough to show feasibility.                          |
| 5   | Component and/or process validation in relevant environment — beta prototype            | Thorough prototype testing in an environment relevant to the end user, with reasonably realistic supporting elements and target interfaces. |
| 6   | System/process model or prototype demonstration in a relevant environment               | A partially integrated system prototype demonstrates engineering feasibility in an environment relevant to the end user.                    |
| 7   | System/process prototype demonstration in an operational environment — integrated pilot | At or near full scale, most functions available, integrated with collateral systems, in a near-production-quality prototype.                |
| 8   | Actual system/process completed and qualified through test and demonstration            | End of system development: full-scale, fully integrated in the operational environment, end-user specifications demonstrated.               |
| 9   | Actual system proven through successful mission operations                              | The technology is applied in its final form under mission conditions (`dod-tra-2025`, Table 2-1, p. 7).                                     |

> **Transcription note.** The retrieved EERE R 540.112-02 document defines TRL 1 through TRL 8 only;
> it contains no TRL 9 definition. This tool therefore takes the TRL 9 wording from the DoD
> Technology Readiness Assessment Guidebook, another U.S. Government public-domain source. The
> substitution is recorded in `docs/sources/SOURCES.md` and shown in the question's help text.

## Why the criteria differ between agencies

The _definitions_ of the nine levels are broadly shared. The _criteria_ — what you must show to
claim a level — are not.

- **NASA** originated the scale and ties it to flight systems and space environments.
- **DoD** (`dod-tra-2025`) assesses Critical Technology Elements inside a programme, distinguishes
  hardware from software with separate tables, and defines "relevant" and "operational" environment
  precisely in terms of the _full spectrum of intended operational employments_.
- **DOE** publishes both a general TRA guide and programme-specific definitions such as the EERE
  ones used here.
- **GAO** (`gao-20-48g`) writes for auditors: its guide is about how to run a credible assessment,
  not about a particular technology domain.
- **ISO 16290:2013** defines TRLs and their criteria of assessment for space systems. It is a
  copyrighted standard, so this repository cites it by clause number only and never reproduces its
  text.

The practical consequence: **a TRL number is only meaningful with its framework attached.** "TRL 6"
under a laboratory-oriented reading and "TRL 6" under the DoD full-spectrum reading are not the same
claim. Every export from this tool carries the framework id and version for exactly that reason.

## Where this tool fits

This is a self-assessment aid. It gives you:

- a **quick estimate** you can produce in a few minutes with no documents, and
- an **evidence-based assessment** in which every claim is tied to a document, a test record, a
  pinned commit or a DOI.

It is **not** an independent Technology Readiness Assessment. A real TRA is performed by a team
that is independent of the programme, under an agency's own process, and it can reject your
evidence. This tool cannot: it records what you tell it, applies the scoring rules conservatively,
and shows its work.

Use it to prepare for a TRA, to keep an internal readiness picture honest, or to find out what
evidence you are missing before someone else does.
