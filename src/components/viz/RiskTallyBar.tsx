import type { ArlTally } from '@/domain/arl';
import { MARK_GAP, MARK_RADIUS, VIZ } from './tokens';

const ORDER: Array<{ key: keyof ArlTally; fill: string; label: string }> = [
  { key: 'Low', fill: VIZ.status.good, label: 'Low' },
  { key: 'Medium', fill: VIZ.status.warning, label: 'Medium' },
  { key: 'High', fill: VIZ.status.critical, label: 'High' },
  { key: 'N/A', fill: VIZ.neutral.na, label: 'N/A' },
];

/**
 * How one core risk area's dimensions are counted: segments for Low, Medium, High and N/A with a
 * 2px surface gap, and the counts printed beside the bar — the bar is the glance, the text the fact.
 */
export function RiskTallyBar({
  tally,
  width = 120,
  height = 10,
  className,
}: {
  tally: ArlTally;
  width?: number;
  height?: number;
  className?: string;
}) {
  const total = ORDER.reduce((sum, seg) => sum + tally[seg.key], 0);
  const text = ORDER.filter((seg) => tally[seg.key] > 0)
    .map((seg) => `${tally[seg.key]} ${seg.label}`)
    .join(', ');
  let x = 0;
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ''}`}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
        <rect x={0} y={0} width={width} height={height} rx={MARK_RADIUS} fill={VIZ.neutral.empty} />
        {total > 0
          ? ORDER.map((seg) => {
              const value = tally[seg.key];
              if (value === 0) return null;
              const w = (value / total) * width;
              const rect = (
                <rect
                  key={seg.key}
                  x={x}
                  y={0}
                  width={Math.max(0, w - MARK_GAP)}
                  height={height}
                  rx={2}
                  fill={seg.fill}
                />
              );
              x += w;
              return rect;
            })
          : null}
      </svg>
      <span className="text-xs text-slate-600">{text || 'none'}</span>
    </span>
  );
}
