/**
 * Visual tokens for the diagram layer.
 *
 * Palette source: the dataviz reference instance. The status colours are the reserved
 * status palette (good / warning / serious / critical) and are never reused as series colours;
 * `warning` and `serious` sit below 3:1 on a white surface by design, so every mark that uses
 * them ships with a glyph **and** a text label — colour never carries meaning on its own.
 *
 * The sequential ramp is a single blue hue, light → dark, used only for magnitude (the TRL
 * cross-check matrix). Cells always print their number, so the ramp is a secondary cue.
 */

export const VIZ = {
  surface: '#ffffff',
  ink: {
    primary: '#0b0b0b',
    secondary: '#52514e',
    muted: '#898781',
  },
  grid: '#e1e0d9',
  baseline: '#c3c2b7',
  /** The app's brand blue — "achieved" in every diagram. */
  brand: '#1b63f0',
  brandSoft: '#dbeafe',
  status: {
    good: '#0ca30c',
    warning: '#fab219',
    serious: '#ec835a',
    critical: '#d03b3b',
  },
  neutral: {
    /** Not applicable — deliberately grey, it is an absence of a claim, not a series. */
    na: '#94a3b8',
    /** Not assessed / locked. */
    empty: '#e2e8f0',
    emptyStroke: '#cbd5e1',
  },
  /** Sequential blue, light → dark (dataviz ramp steps 100…550). */
  sequential: [
    '#cde2fb',
    '#b7d3f6',
    '#9ec5f4',
    '#86b6ef',
    '#6da7ec',
    '#5598e7',
    '#3987e5',
    '#2a78d6',
    '#1c5cab',
  ],
} as const;

/** 2px of surface between adjacent fills, per the mark spec. */
export const MARK_GAP = 2;
export const MARK_RADIUS = 4;

export function sequentialFill(value: number, max = 9): string {
  if (value <= 0) return VIZ.neutral.empty;
  const index = Math.min(
    VIZ.sequential.length - 1,
    Math.max(0, Math.round((value / max) * (VIZ.sequential.length - 1))),
  );
  return VIZ.sequential[index]!;
}

/** Dark ink on light fills, light ink on the darkest steps. */
export function inkOn(fill: string): string {
  return ['#2a78d6', '#1c5cab', '#3987e5', VIZ.brand].includes(fill) ? '#ffffff' : VIZ.ink.primary;
}
