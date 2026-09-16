# What a Technology Readiness Level is

A TRL is a number from 1 to 9 answering one narrow question: **how far has this technology been
demonstrated, and in what environment?** Not how good it is, how marketable, or how well the project
is run. A brilliant idea that has only been simulated sits low; a mediocre device that has flown a
full mission sits high.

:::figure trl-scale:::

## Where the scale came from

NASA developed it in the 1970s. GAO's 1999 report on weapon-system outcomes concluded that maturing
technology _before_ committing it to a product reduces cost and schedule risk, and DoD adopted TRLs
across acquisition from there (`dod-tra-2025`, Preface). DOE, NASA, the European Commission and ISO
all publish their own definitions today.

## The nine levels

Wording follows the DOE EERE definitions (`eere-r540-112-02`, pp. 1–2), which this tool's default
framework uses.

| TRL | EERE heading                                               | Article                                          | Environment            |
| --- | ---------------------------------------------------------- | ------------------------------------------------ | ---------------------- |
| 1   | Basic principles observed and reported                     | —                                                | peer-reviewed research |
| 2   | Technology concept and/or application formulated           | —                                                | analysis, simulation   |
| 3   | Analytical and experimental proof of concept               | immature prototype                               | laboratory             |
| 4   | Component/process validation — alpha prototype             | stand-alone component                            | laboratory             |
| 5   | Component/process validation — beta prototype              | component + realistic supporting elements        | relevant               |
| 6   | System/process prototype demonstration                     | partially integrated system                      | relevant               |
| 7   | System/process prototype — integrated pilot                | near-production prototype, at or near full scale | operational            |
| 8   | Actual system completed and qualified                      | the actual full-scale system                     | operational            |
| 9   | Actual system proven through successful mission operations | the actual system, final form                    | mission conditions     |

The two right-hand columns are the whole trick: the level is decided by _what_ was tested and
_where_ (TRL 9 wording: `dod-tra-2025`, Table 2-1, p. 7).

> **Transcription note.** The retrieved EERE document defines TRL 1–8 only — it has no TRL 9. The
> TRL 9 wording therefore comes from the DoD guidebook, another public-domain U.S. Government
> source. Recorded in `docs/sources/SOURCES.md` and shown in the question's help text.

## Why the criteria differ between agencies

The nine _definitions_ are broadly shared. The _criteria_ — what you must show to claim a level —
are not.

| Issuer               | Emphasis                                                                                                                                                         |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NASA                 | Originated the scale; flight systems and space environments.                                                                                                     |
| DoD (`dod-tra-2025`) | CTEs inside a programme; separate hardware and software tables; "relevant" and "operational" defined by the _full spectrum of intended operational employments_. |
| DOE                  | A general TRA guide plus programme-specific definitions such as EERE's.                                                                                          |
| GAO (`gao-20-48g`)   | Written for auditors: how to run a credible assessment, not a technology domain.                                                                                 |
| ISO 16290:2013       | TRLs for space systems. Copyrighted — cited here by clause number only, never reproduced.                                                                        |

The consequence: **a TRL number means nothing without its framework attached.** "TRL 6" read
loosely and "TRL 6" under the DoD full-spectrum reading are different claims — which is why every
export here carries the framework id and version.

## Where this tool fits

A self-assessment aid: a **quick estimate** in a few minutes with no documents, and an
**evidence-based assessment** where every claim is tied to a document, a test record, a pinned
commit or a DOI.

It is **not** an independent TRA. A real TRA is run by a team independent of the programme, under an
agency's process, and it can reject your evidence. This tool cannot: it records what you tell it,
applies the rules conservatively, and shows its work. Use it to prepare for a TRA, to keep an
internal picture honest, or to find the missing evidence before someone else does.
