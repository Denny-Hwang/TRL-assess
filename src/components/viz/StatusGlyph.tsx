import type { CriterionStatus } from '@/domain/schemas';
import { statusText } from '@/i18n/domainText';
import type { MessageKey } from '@/i18n/en';
import { useT } from '@/i18n/store';
import type { Translator } from '@/i18n/translate';
import { VIZ } from './tokens';

/**
 * A shape-first status mark. Each status has its own glyph, so the meaning survives
 * greyscale, colour-vision deficiency and forced-colours mode; the colour is a second cue and
 * the text label a third.
 */
export type GlyphKind = CriterionStatus | 'Satisfied';

const SPEC: Record<GlyphKind, { fill: string; ring: string }> = {
  Satisfied: { fill: VIZ.status.good, ring: VIZ.status.good },
  Met: { fill: VIZ.status.good, ring: VIZ.status.good },
  'Partially met': { fill: VIZ.status.warning, ring: '#b98200' },
  'Not met': { fill: VIZ.status.critical, ring: VIZ.status.critical },
  'N/A': { fill: VIZ.neutral.na, ring: VIZ.neutral.na },
  'Not assessed': { fill: VIZ.surface, ring: VIZ.neutral.emptyStroke },
};

/** The accessible name: a longer title where the status word alone would undersell it. */
const TITLE_KEY: Partial<Record<GlyphKind, MessageKey>> = {
  Satisfied: 'tier2.glyph.title.Satisfied',
  'Partially met': 'tier2.glyph.title.Partially met',
  'N/A': 'tier2.glyph.title.N/A',
  'Not assessed': 'tier2.glyph.title.Not assessed',
};

function glyphTitle(tr: Translator, kind: GlyphKind): string {
  const key = TITLE_KEY[kind];
  return key ? tr.t(key) : statusText(tr, kind);
}

function Shape({ kind, size }: { kind: GlyphKind; size: number }) {
  const s = SPEC[kind];
  const c = size / 2;
  const r = size / 2 - 1.5;
  const common = { cx: c, cy: c, r, fill: s.fill, stroke: s.ring, strokeWidth: 1.5 };

  switch (kind) {
    case 'Satisfied':
    case 'Met':
      return (
        <>
          <circle {...common} />
          <path
            d={`M${c - r * 0.45} ${c} l${r * 0.35} ${r * 0.4} l${r * 0.6} -${r * 0.75}`}
            fill="none"
            stroke="#ffffff"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      );
    case 'Partially met':
      return (
        <>
          <circle {...common} fill={VIZ.surface} />
          <path d={`M${c} ${c - r} A${r} ${r} 0 0 1 ${c} ${c + r} Z`} fill={s.fill} />
        </>
      );
    case 'Not met':
      return (
        <>
          <circle {...common} fill={VIZ.surface} />
          <path
            d={`M${c - r * 0.45} ${c - r * 0.45} l${r * 0.9} ${r * 0.9} M${c + r * 0.45} ${c - r * 0.45} l-${r * 0.9} ${r * 0.9}`}
            stroke={s.fill}
            strokeWidth={2}
            strokeLinecap="round"
          />
        </>
      );
    case 'N/A':
      return (
        <>
          <circle {...common} fill={VIZ.surface} />
          <path
            d={`M${c - r * 0.5} ${c + r * 0.5} l${r} -${r}`}
            stroke={s.fill}
            strokeWidth={2}
            strokeLinecap="round"
          />
        </>
      );
    case 'Not assessed':
    default:
      return <circle {...common} strokeDasharray="2.5 2.5" />;
  }
}

export function StatusGlyph({
  kind,
  size = 16,
  withLabel = false,
  className,
}: {
  kind: GlyphKind;
  size?: number;
  withLabel?: boolean;
  className?: string;
}) {
  const tr = useT();
  const title = glyphTitle(tr, kind);
  return (
    <span className={`inline-flex items-center gap-1.5 ${className ?? ''}`}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        {...(withLabel
          ? { 'aria-hidden': true as const }
          : { role: 'img' as const, 'aria-label': title })}
        className="shrink-0"
      >
        {withLabel ? null : <title>{title}</title>}
        <Shape kind={kind} size={size} />
      </svg>
      {withLabel ? <span className="text-xs text-slate-700">{statusText(tr, kind)}</span> : null}
    </span>
  );
}

export function StatusLegend({ kinds }: { kinds?: GlyphKind[] }) {
  const { t } = useT();
  const list =
    kinds ?? (['Satisfied', 'Partially met', 'Not met', 'N/A', 'Not assessed'] as GlyphKind[]);
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1" aria-label={t('tier2.glyph.legend')}>
      {list.map((kind) => (
        <li key={kind}>
          <StatusGlyph kind={kind} withLabel />
        </li>
      ))}
    </ul>
  );
}
