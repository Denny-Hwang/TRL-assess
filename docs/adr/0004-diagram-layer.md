# ADR-0004: A hand-rolled SVG diagram layer, no chart library

- Status: Accepted
- Date: 2026-09-16
- Phase: post-1.0

## Context

The app explained its three recurring mental models — the 1–9 chain, what makes a criterion count,
and "the system is the minimum across critical CTEs" — in prose, on every screen and again in the
Guide. The owner's feedback was direct: too much text.

Pictures were the obvious answer, but the constraints are tight: the app is client-side only with no
external assets, the entry chunk has a 300 kB gzip budget (it sat at ~104 kB), axe must stay at zero
serious or critical findings, and the Excel/package structure (BUILD_SPEC D-3, D-4) and the scoring
rules (D-2) must not change.

## Decision

**Write the diagrams by hand as inline SVG and small HTML components under `src/components/viz/`,
with no charting dependency.**

- Recharts, Chart.js, visx and friends cost 40–150 kB gzip and are built for plotting data series.
  What this app needs is mostly _diagrams_ — a ladder, a decision flow, a decomposition tree — plus
  three simple magnitude marks (bars, meters, a heatmap). A library would add weight and buy nothing.
- The whole layer costs about **5 kB gzip** and has no runtime dependency.
- The palette follows the `dataviz` reference instance: the reserved status palette
  (good / warning / serious / critical) for state, a single blue hue for magnitude, 2px of surface
  between adjacent fills, thin marks, 4px rounded data-ends.

**Colour is never the only signal.** Every mark ships with a glyph _and_ a word: statuses have
distinct shapes (filled check, half circle, cross, slash, dashed ring), the TRL ladder prints every
level number, the heatmap prints every cell value, and the limiting CTE is named in text as well as
marked. The dataviz validator reports the light-surface status colours below 3:1 — the icon-plus-label
pairing is the prescribed mitigation, and it is applied everywhere.

**Every figure carries a sentence.** Non-interactive graphics are `role="img"` with an `aria-label`
that states the whole finding ("System summary TRL 3, the minimum across critical CTEs (CTE-02,
CTE-03)…"). Interactive ones are real `<button>` elements with full accessible names, not SVG with
click handlers. Decorative glyphs beside a visible label are `aria-hidden` and carry no role.

**Guide figures are referenced from Markdown, not embedded in it.** A line of its own,
`:::figure trl-scale:::`, is replaced at render time by a component from a registry in
`src/features/guide/figures.tsx`. Prose stays in `.md` where it is reviewable by someone who does
not read TSX; drawings stay in code where they can be corrected without touching the text. A test
asserts every token in the Guide resolves to a registered figure.

## Consequences

- Prose in the Guide dropped by roughly a third (paragraph text 4,272 → 2,713 words) because each
  figure replaced the paragraphs that had been describing it.
- Entry chunk: ~104 kB → ~110 kB gzip, well inside the budget; the Guide and its figures stay in the
  lazy chunk.
- New diagrams are ordinary React components with component tests; there is no chart configuration
  language to learn and no library upgrade path to track.
- The cost is ours: a new chart form has to be drawn by hand. That is the right trade while the app
  needs a dozen bespoke diagrams and no general plotting.

## Alternatives considered

| Option              | Why not                                                                                                                                     |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Recharts / Chart.js | 40–150 kB gzip for series plotting the app does not do; diagrams still hand-made.                                                           |
| Mermaid at runtime  | ~400 kB, and its generated SVG cannot carry the per-mark accessible names used here. (Mermaid stays in README.md, where GitHub renders it.) |
| Static images       | Not themeable, not accessible, and they go stale the moment a number changes.                                                               |
