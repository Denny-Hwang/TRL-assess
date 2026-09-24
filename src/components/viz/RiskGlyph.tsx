import type { ArlRating } from '@/domain/schemas';
import { useT } from '@/i18n/store';
import { ratingText } from '@/i18n/domainText';
import type { MessageKey } from '@/i18n/en';
import { VIZ } from './tokens';

/**
 * A shape-first mark for an ARL risk rating. Each rating has its own shape — circle for Low,
 * triangle for Medium, diamond for High — so the meaning survives greyscale and colour-vision
 * deficiency; the reserved status colour is the second cue and the printed word the third.
 */
const SPEC: Record<ArlRating, { fill: string; ring: string; title: MessageKey }> = {
  Low: { fill: VIZ.status.good, ring: VIZ.status.good, title: 'risk.Low' },
  Medium: { fill: VIZ.status.warning, ring: '#b98200', title: 'risk.Medium' },
  High: { fill: VIZ.status.critical, ring: VIZ.status.critical, title: 'risk.High' },
  'N/A': { fill: VIZ.neutral.na, ring: VIZ.neutral.na, title: 'arl.glyph.na' },
  Unsure: { fill: VIZ.surface, ring: '#b98200', title: 'arl.reason.Unsure' },
  'Not assessed': {
    fill: VIZ.surface,
    ring: VIZ.neutral.emptyStroke,
    title: 'arl.reason.Not assessed',
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
  const tr = useT();
  const title = tr.t(SPEC[rating].title);
  const hidden = withLabel || decorative;
  return (
    <span className={`inline-flex items-center gap-1.5 ${className ?? ''}`}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        {...(hidden
          ? { 'aria-hidden': true as const }
          : { role: 'img' as const, 'aria-label': title })}
        className="shrink-0"
      >
        {hidden ? null : <title>{title}</title>}
        <Shape rating={rating} size={size} />
      </svg>
      {withLabel ? <span className="text-xs text-slate-700">{ratingText(tr, rating)}</span> : null}
    </span>
  );
}

export function RiskLegend({ ratings }: { ratings?: ArlRating[] }) {
  const { t } = useT();
  const list = ratings ?? (['Low', 'Medium', 'High', 'N/A', 'Unsure', 'Not assessed'] as const);
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1" aria-label={t('arl.glyph.legend')}>
      {list.map((rating) => (
        <li key={rating}>
          <RiskGlyph rating={rating} withLabel />
        </li>
      ))}
    </ul>
  );
}
