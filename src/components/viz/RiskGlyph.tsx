import type { ArlRating } from '@/domain/schemas';
import { VIZ } from './tokens';

/**
 * A shape-first mark for an ARL risk rating. Each rating has its own shape — circle for Low,
 * triangle for Medium, diamond for High — so the meaning survives greyscale and colour-vision
 * deficiency; the reserved status colour is the second cue and the printed word the third.
 */
const SPEC: Record<ArlRating, { fill: string; ring: string; title: string }> = {
  Low: { fill: VIZ.status.good, ring: VIZ.status.good, title: 'Low risk' },
  Medium: { fill: VIZ.status.warning, ring: '#b98200', title: 'Medium risk' },
  High: { fill: VIZ.status.critical, ring: VIZ.status.critical, title: 'High risk' },
  'N/A': { fill: VIZ.neutral.na, ring: VIZ.neutral.na, title: 'Not applicable' },
  Unsure: { fill: VIZ.surface, ring: '#b98200', title: 'Unsure — counted as High risk' },
  'Not assessed': {
    fill: VIZ.surface,
    ring: VIZ.neutral.emptyStroke,
    title: 'Not assessed — counted as High risk',
  },
};

function Shape({ rating, size }: { rating: ArlRating; size: number }) {
  const s = SPEC[rating];
  const c = size / 2;
  const r = size / 2 - 1.5;
  switch (rating) {
    case 'Low':
      return <circle cx={c} cy={c} r={r} fill={s.fill} stroke={s.ring} strokeWidth={1.5} />;
    case 'Medium':
      return (
        <path
          d={`M${c} ${c - r} L${c + r} ${c + r * 0.8} L${c - r} ${c + r * 0.8} Z`}
          fill={s.fill}
          stroke={s.ring}
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
      );
    case 'High':
      return (
        <path
          d={`M${c} ${c - r} L${c + r} ${c} L${c} ${c + r} L${c - r} ${c} Z`}
          fill={s.fill}
          stroke={s.ring}
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
      );
    case 'N/A':
      return (
        <>
          <circle cx={c} cy={c} r={r} fill={VIZ.surface} stroke={s.ring} strokeWidth={1.5} />
          <path
            d={`M${c - r * 0.5} ${c + r * 0.5} l${r} -${r}`}
            stroke={s.fill}
            strokeWidth={2}
            strokeLinecap="round"
          />
        </>
      );
    case 'Unsure':
      return (
        <>
          <circle
            cx={c}
            cy={c}
            r={r}
            fill={VIZ.surface}
            stroke={s.ring}
            strokeWidth={1.5}
            strokeDasharray="2.5 2"
          />
          <text
            x={c}
            y={c + size * 0.18}
            textAnchor="middle"
            fontSize={size * 0.55}
            fontWeight={700}
            fill={VIZ.ink.primary}
          >
            ?
          </text>
        </>
      );
    case 'Not assessed':
    default:
      return (
        <circle
          cx={c}
          cy={c}
          r={r}
          fill={s.fill}
          stroke={s.ring}
          strokeWidth={1.5}
          strokeDasharray="2.5 2.5"
        />
      );
  }
}

export function RiskGlyph({
  rating,
  size = 14,
  withLabel = false,
  decorative = false,
  className,
}: {
  rating: ArlRating;
  size?: number;
  withLabel?: boolean;
  /** Hide the mark from assistive technology when the rating is already spelled out beside it. */
  decorative?: boolean;
  className?: string;
}) {
  const spec = SPEC[rating];
  const hidden = withLabel || decorative;
  return (
    <span className={`inline-flex items-center gap-1.5 ${className ?? ''}`}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        {...(hidden
          ? { 'aria-hidden': true as const }
          : { role: 'img' as const, 'aria-label': spec.title })}
        className="shrink-0"
      >
        {hidden ? null : <title>{spec.title}</title>}
        <Shape rating={rating} size={size} />
      </svg>
      {withLabel ? <span className="text-xs text-slate-700">{rating}</span> : null}
    </span>
  );
}

export function RiskLegend({ ratings }: { ratings?: ArlRating[] }) {
  const list = ratings ?? (['Low', 'Medium', 'High', 'N/A', 'Unsure', 'Not assessed'] as const);
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1" aria-label="Risk rating legend">
      {list.map((rating) => (
        <li key={rating}>
          <RiskGlyph rating={rating} withLabel />
        </li>
      ))}
    </ul>
  );
}
