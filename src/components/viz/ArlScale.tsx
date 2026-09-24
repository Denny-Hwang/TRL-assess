import type { ArlFramework } from '@/domain/schemas';
import { MARK_GAP, MARK_RADIUS, VIZ } from './tokens';

const CELL = 34;
const BAR = 18;
const FONT = 11;

/**
 * The 1 → 9 ARL scale with the source's three readiness bands underneath and two markers:
 * a filled one for ARL Start and a hollow one for the target. Numbers and band names are printed,
 * so the picture never depends on colour.
 */
export function ArlScale({
  framework,
  start,
  end,
  label,
  className,
}: {
  framework: ArlFramework;
  start: number;
  end?: number;
  label: string;
  className?: string;
}) {
  const width = 9 * CELL;
  const markerRow = 16;
  const barTop = markerRow + 4;
  const numberTop = barTop + BAR + FONT + 2;
  const bandTop = numberTop + 8;
  const height = bandTop + FONT + 6;
  const centre = (level: number) => (level - 1) * CELL + CELL / 2;

  return (
    <div className={className}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        style={{ maxWidth: width * 1.6, height: 'auto' }}
        role="img"
        aria-label={label}
      >
        <title>{label}</title>
        {Array.from({ length: 9 }, (_, i) => i + 1).map((level) => {
          const reached = level <= start;
          const planned = end !== undefined && level > start && level <= end;
          return (
            <g key={level}>
              <rect
                x={(level - 1) * CELL + MARK_GAP / 2}
                y={barTop}
                width={CELL - MARK_GAP}
                height={BAR}
                rx={MARK_RADIUS}
                fill={reached ? VIZ.brand : planned ? VIZ.brandSoft : VIZ.neutral.empty}
                stroke={planned ? VIZ.brand : 'none'}
                strokeDasharray={planned ? '3 2' : undefined}
              />
              <text
                x={centre(level)}
                y={numberTop}
                textAnchor="middle"
                fontSize={FONT}
                fontWeight={level === start || level === end ? 700 : 400}
                fill={VIZ.ink.primary}
              >
                {level}
              </text>
            </g>
          );
        })}
        {framework.bands.map((band) => {
          const x0 = (band.min - 1) * CELL + MARK_GAP;
          const x1 = band.max * CELL - MARK_GAP;
          return (
            <g key={band.label}>
              <line x1={x0} x2={x1} y1={bandTop - 4} y2={bandTop - 4} stroke={VIZ.baseline} />
              <text
                x={(x0 + x1) / 2}
                y={bandTop + FONT}
                textAnchor="middle"
                fontSize={FONT - 1}
                fill={VIZ.ink.secondary}
              >
                {band.label}
              </text>
            </g>
          );
        })}
        <path d={`M${centre(start) - 6} ${markerRow - 8} h12 l-6 8 Z`} fill={VIZ.ink.primary} />
        {end !== undefined && end !== start ? (
          <path
            d={`M${centre(end) - 6} ${markerRow - 8} h12 l-6 8 Z`}
            fill={VIZ.surface}
            stroke={VIZ.ink.primary}
            strokeWidth={1.2}
          />
        ) : null}
      </svg>
      <p className="mt-1 flex flex-wrap gap-x-4 text-xs text-slate-600" aria-hidden="true">
        <span>▼ Start: ARL {start}</span>
        {end !== undefined ? (
          <span>
            ▽ Target: ARL {end}
            {end === start ? ' (no change)' : ''}
          </span>
        ) : null}
      </p>
    </div>
  );
}
