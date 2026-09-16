# Contributing to TRL Assess

Thanks for helping. This project has one hard rule above all others: **criteria are never
invented**. Every question and criterion in the app must be traceable to a real source document.

## Quick start

```bash
npm ci
npm run dev
npm run verify   # must pass before any pull request
```

## Provenance rules

Each Tier 1 question and Tier 2 criterion carries `source` and `origin`:

| `origin`   | Meaning                                                        | Rules                                                                                           |
| ---------- | -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `verbatim` | Text copied exactly from the source                            | Only from U.S. Government public-domain documents (DOE, EERE, GAO, DoD). Requires section/page. |
| `adapted`  | Source wording restructured into a question, meaning preserved | Requires section/page.                                                                          |
| `tailored` | Domain-specific item not in any source                         | Requires a `rationale`.                                                                         |

ISO standards may be cited **by clause number only**. Never copy ISO text into this repository.

Run `npm run validate:criteria` — it enforces these rules.

## Proposing a criteria change

1. Open a **Criteria correction** issue with the framework id, item id, what the source says, and
   the page reference.
2. Submit a PR editing the JSON under `src/data/frameworks/<frameworkId>/`.
3. Bump the framework `version` and add a CHANGELOG entry.

## Commit and PR conventions

- [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `docs:`, `test:`,
  `chore:`, `refactor:`.
- One PR per BUILD_SPEC phase or per logical change. Squash-merge.
- Update `CHANGELOG.md` `[Unreleased]` and `docs/PROGRESS.md`.
- Never skip, delete or weaken a test to make CI pass.
