import { MARK_RADIUS, VIZ } from './tokens';
import type { CteResult } from '@/domain/tier2';

/**
 * One bar per CTE against the 1–9 scale, with the limiting line drawn where the system summary
 * sits. This is the whole of rule R2-7 in one picture: the summary is the shortest critical bar.
 */
export function CteBars({
  ctes,
  systemTrl,
  limitingIds = [],
  className,
}: {
  ctes: readonly CteResult[];
  systemTrl: number | null;
  limitingIds?: readonly string[];
  className?: string;
}) {
  if (ctes.length === 0) return null;

  const rowH = 26;
  const labelW = 168;
  const scaleW = 270;
  const width = labelW + scaleW + 120;
  const height = ctes.length * rowH + 26;
  const x = (level: number) => labelW + (level / 9) * scaleW;

  const summary =
    systemTrl === null
      ? `Per-CTE TRLs: ${ctes.map((c) => `${c.cte.name} ${c.trl}`).join(', ')}. No critical CTE, so no system summary.`
      : `System summary TRL ${systemTrl}, the minimum across critical CTEs (${limitingIds.join(', ')}). ` +
        `Per-CTE: ${ctes.map((c) => `${c.cte.name} ${c.trl}${c.cte.critical ? ' (critical)' : ''}`).join(', ')}.`;

  return (
    <figure className={className}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        style={{ maxWidth: width * 1.5, height: 'auto' }}
        role="img"
        aria-label={summary}
      >
        <title>{summary}</title>

        {[1, 3, 5, 7, 9].map((level) => (
          <g key={level}>
            <line
              x1={x(level)}
              y1={14}
              x2={x(level)}
              y2={height - 12}
              stroke={VIZ.grid}
              strokeWidth={1}
            />
            <text x={x(level)} y={height - 2} textAnchor="middle" fontSize={9} fill={VIZ.ink.muted}>
              {level}
            </text>
          </g>
        ))}

        {ctes.map((c, index) => {
          const y = 16 + index * rowH;
          const limiting = limitingIds.includes(c.cte.id);
          const w = Math.max(2, x(c.trl) - labelW);
          return (
            <g key={c.cte.id}>
              {/* Filled square = critical (counts towards the summary); hollow = not. */}
              <rect
                x={0}
                y={y + 4}
                width={9}
                height={9}
                rx={2}
                fill={c.cte.critical ? VIZ.ink.primary : VIZ.surface}
                stroke={VIZ.ink.primary}
                strokeWidth={1}
              />
              <text x={14} y={y + 12} fontSize={11} fill={VIZ.ink.primary}>
                {c.cte.name.length > 24 ? `${c.cte.name.slice(0, 23)}…` : c.cte.name}
              </text>
              <rect
                x={labelW}
                y={y + 2}
                width={w}
                height={13}
                rx={MARK_RADIUS}
                fill={c.cte.critical ? VIZ.brand : VIZ.neutral.emptyStroke}
              />
              <text x={labelW + w + 6} y={y + 13} fontSize={10} fill={VIZ.ink.secondary}>
                {c.trl === 0 ? '< 1' : c.trl}
              </text>
              {limiting ? (
                <text
                  x={labelW + w + (c.trl === 0 ? 24 : 18)}
                  y={y + 13}
                  fontSize={10}
                  fontWeight={600}
                  fill={VIZ.status.critical}
                >
                  ◀ limits the system
                </text>
              ) : null}
            </g>
          );
        })}

        {systemTrl !== null && systemTrl > 0 ? (
          <line
            x1={x(systemTrl)}
            y1={10}
            x2={x(systemTrl)}
            y2={height - 12}
            stroke={VIZ.status.critical}
            strokeWidth={2}
            strokeDasharray="4 3"
          />
        ) : null}
      </svg>
      <figcaption className="mt-1 text-xs text-slate-500">
        <span
          className="inline-block h-2 w-2 translate-y-[1px] rounded-[2px] bg-slate-900"
          aria-hidden="true"
        />{' '}
        critical (counts towards the summary) ·{' '}
        <span
          className="inline-block h-2 w-2 translate-y-[1px] rounded-[2px] border border-slate-900"
          aria-hidden="true"
        />{' '}
        not critical · the dashed line is the system summary, the lowest TRL among critical CTEs.
      </figcaption>
    </figure>
  );
}
