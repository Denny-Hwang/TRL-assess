# Changelog

All notable changes to this project are documented here.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Interface languages:** English (default), 한국어, 中文, 日本語, Español, Deutsch, हिन्दी and
  العربية, chosen from the header and remembered in this browser; Arabic is laid out right-to-left.
  Screens, the Guide and Excel exports follow the selected language. Criteria, questions, rubric
  text, sheet names and dropdown values stay in English.
- **Adoption Readiness Level (ARL) module** at `/arl`: the 17 dimensions of the DOE Office of
  Technology Commercialization _Adoption Readiness Assessment_ (April 2025), transcribed verbatim,
  rated now and at the end of the project; ARL Start and ARL End come from the source's look-up
  table. Exported as `ARL_<project>_<timestamp>.xlsx`.
- **Clear all local data** on the About page removes the assessment and every stored evidence file
  from this browser, after a confirmation.
- The Guide is translated into all eight languages; quoted source text stays in English.
- Diagrams in the app and the Guide: the TRL ladder, status glyphs, per-level bars, coverage meters,
  the build × environment grid and per-CTE bars.

### Changed

- The default framework is `dod-tra-2025`; `marine-energy-eere` remains available.
- The fictional example is now a domain-neutral sensor device.
- Shorter screens and Guide; internal development records removed from the repository.
- Session schema v2 adds the optional `arl` block; v1 sessions migrate automatically.

## [1.0.0] - 2026-09-16

First release.

- Tier 1 quick estimate (nine questions, build × environment cross-check) and Tier 2 evidence-based
  assessment of Critical Technology Elements, with conservative scoring.
- Evidence library (files, links, pinned commits, DOIs, sensitive reference-only entries).
- Excel workbooks for both tiers and a `.zip` evidence package with a SHA-256 manifest.
- Frameworks `dod-tra-2025` and `marine-energy-eere`, every item traced to its source.
- In-app Guide; client-side only, no network requests at runtime.

### Known limitations

- `dod-tra-2025` marks no criterion mandatory, because its source does not classify them; every
  level in that framework is flagged for assessor confirmation.
- Exported workbooks cannot be re-imported; session JSON round-trips losslessly.

[Unreleased]: https://github.com/Denny-Hwang/TRL-assess/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/Denny-Hwang/TRL-assess/releases/tag/v1.0.0
