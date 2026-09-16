import { TRL_LEVELS, type TrlLevel } from '@/domain/schemas';
import { MARK_GAP, MARK_RADIUS, VIZ } from './tokens';

export interface LadderMarker {
  level: number;
  label: string;
  tone?: 'brand' | 'muted' | 'critical';
}

export interface TrlLadderProps {
  /** Highest achieved level; 0 means "below TRL 1". */
  achieved: number;
  /** Levels claimed but not confirmed — drawn as a break in the chain. */
  gaps?: readonly number[];
  /** Small captions pinned above a level. */
  markers?: readonly LadderMarker[];
  /** Renders each rung as a button. */
  onSelect?: (level: TrlLevel) => void;
  /** Level currently in focus (the next level, or the open accordion). */
  current?: number;
  size?: 'sm' | 'md';
  /** Sentence read by assistive technology instead of the shapes. */
  label: string;
  className?: string;
}

const SIZES = {
  sm: { rung: 22, height: 14, gapTop: 0, font: 9 },
  md: { rung: 34, height: 22, gapTop: 18, font: 11 },
} as const;

/** Stacks markers onto extra rows so two captions never overlap. */
function layoutMarkers(markers: readonly LadderMarker[], rung: number, font: number) {
  const rows: Array<Array<{ marker: LadderMarker; centre: number; half: number }>> = [];
  const placed: Array<{ marker: LadderMarker; centre: number; row: number }> = [];

  for (const marker of [...markers].sort((a, b) => a.level - b.level)) {
    const centre = (Math.min(9, Math.max(1, marker.level)) - 1) * rung + rung / 2;
    const half = (marker.label.length * font * 0.55) / 2 + 3;
    let row = 0;
    while (rows[row]?.some((other) => Math.abs(other.centre - centre) < other.half + half)) {
      row += 1;
    }
    (rows[row] ??= []).push({ marker, centre, half });
    placed.push({ marker, centre, row });
  }
  return { placed, rowCount: rows.length };
}

const TONE = {
  brand: VIZ.brand,
  muted: VIZ.ink.muted,
  critical: VIZ.status.critical,
} as const;

/**
 * The 1 → 9 ladder: the app's core mental model in one mark. Filled rungs are achieved,
 * a hatched rung is a level claimed without the levels below it, and the outline rung is the
 * level being worked on. The caption under each rung carries the number, so the picture never
 * depends on colour alone.
 */
export function TrlLadder({
  achieved,
  gaps = [],
  markers = [],
  onSelect,
  current,
  size = 'md',
  label,
  className,
}: TrlLadderProps) {
  const s = SIZES[size];
  const { placed, rowCount } = layoutMarkers(markers, s.rung, s.font);
  const markerBlock = rowCount === 0 ? 0 : rowCount * (s.font + 6) + 2;
  const top = markers.length ? Math.max(s.gapTop, markerBlock) : 0;
  const width = TRL_LEVELS.length * s.rung;
  const height = top + s.height + s.font + 6;
  const interactive = Boolean(onSelect);

  if (interactive) {
    return (
      <div className={className}>
        <ul className="flex gap-0.5" aria-label={label}>
          {TRL_LEVELS.map((level) => {
            const isAchieved = level <= achieved;
            const isGap = gaps.includes(level);
            const isCurrent = current === level;
            const state = isAchieved
              ? 'achieved'
              : isGap
                ? 'claimed but not confirmed'
                : 'not achieved';
            return (
              <li key={level} className="flex-1">
                <button
                  type="button"
                  onClick={() => onSelect?.(level)}
                  aria-current={isCurrent ? 'true' : undefined}
                  title={`TRL ${level} — ${state}`}
                  className={[
                    'flex w-full flex-col items-center gap-1 rounded py-1',
                    'hover:bg-slate-100 focus-visible:bg-slate-100',
                  ].join(' ')}
                >
                  <span
                    aria-hidden="true"
                    className="h-4 w-full rounded"
                    style={{
                      background: isGap ? undefined : isAchieved ? VIZ.brand : VIZ.neutral.empty,
                      backgroundImage: isGap
                        ? `repeating-linear-gradient(45deg, ${VIZ.status.critical} 0 2px, ${VIZ.surface} 2px 5px)`
                        : undefined,
                      boxShadow: isCurrent ? `inset 0 0 0 2px ${VIZ.brand}` : undefined,
                    }}
                  />
                  <span
                    aria-hidden="true"
                    className={`text-[11px] leading-none ${
                      isAchieved || isCurrent ? 'font-semibold text-slate-900' : 'text-slate-500'
                    }`}
                  >
                    {level}
                  </span>
                  <span className="sr-only">{`TRL ${level} — ${state}. Show its criteria.`}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  return (
    <div className={className}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        style={{ maxWidth: width * 1.6, height: 'auto' }}
        role={interactive ? undefined : 'img'}
        aria-label={interactive ? undefined : label}
        aria-hidden={interactive || undefined}
      >
        {!interactive ? <title>{label}</title> : null}
        <defs>
          <pattern
            id="trl-gap-hatch"
            patternUnits="userSpaceOnUse"
            width="5"
            height="5"
            patternTransform="rotate(45)"
          >
            <rect width="5" height="5" fill={VIZ.surface} />
            <line x1="0" y1="0" x2="0" y2="5" stroke={VIZ.status.critical} strokeWidth="2" />
          </pattern>
        </defs>

        {TRL_LEVELS.map((level, index) => {
          const x = index * s.rung;
          const isAchieved = level <= achieved;
          const isGap = gaps.includes(level);
          const isCurrent = current === level;
          const fill = isGap ? 'url(#trl-gap-hatch)' : isAchieved ? VIZ.brand : VIZ.neutral.empty;
          return (
            <g key={level}>
              <rect
                x={x + MARK_GAP / 2}
                y={top}
                width={s.rung - MARK_GAP}
                height={s.height}
                rx={MARK_RADIUS}
                fill={fill}
                stroke={
                  isCurrent ? VIZ.brand : isGap ? VIZ.status.critical : VIZ.neutral.emptyStroke
                }
                strokeWidth={isCurrent ? 2 : 1}
                strokeDasharray={isCurrent && !isAchieved ? '3 2' : undefined}
              />
              <text
                x={x + s.rung / 2}
                y={top + s.height + s.font + 1}
                textAnchor="middle"
                fontSize={s.font}
                fill={isAchieved ? VIZ.ink.primary : VIZ.ink.muted}
                fontWeight={isCurrent || isAchieved ? 600 : 400}
              >
                {level}
              </text>
            </g>
          );
        })}

        {placed.map(({ marker, centre, row }) => {
          const colour = TONE[marker.tone ?? 'brand'];
          const labelY = top - 6 - row * (s.font + 6);
          return (
            <g key={`${marker.label}-${marker.level}`}>
              <text
                x={centre}
                y={labelY}
                textAnchor="middle"
                fontSize={s.font}
                fill={colour}
                fontWeight={600}
              >
                {marker.label}
              </text>
              {row > 0 ? (
                <line
                  x1={centre}
                  y1={labelY + 3}
                  x2={centre}
                  y2={top - 2}
                  stroke={colour}
                  strokeWidth={1}
                  strokeDasharray="2 2"
                />
              ) : null}
              <path
                d={`M${centre - 4} ${top - 5} L${centre + 4} ${top - 5} L${centre} ${top - 1} Z`}
                fill={colour}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
