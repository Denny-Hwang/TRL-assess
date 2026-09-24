import type { MessageKey } from '@/i18n/en';
import { statusText, trlText } from '@/i18n/domainText';
import { useT } from '@/i18n/store';
import { DEFAULT_FRAMEWORK } from '@/config/app.config';
import { VIZ } from './tokens';

const BOX = { rx: 6, stroke: VIZ.neutral.emptyStroke, fill: VIZ.surface } as const;

/**
 * Diagrams used by the Guide. Each one is a figure with a sentence-long accessible name and a
 * caption; none of them carries meaning in colour alone.
 */

/** A diagram label drawn on two lines: the message holds the line break. */
function lines(text: string): string[] {
  return text.split('\n');
}

export function DecompositionTree({ className }: { className?: string }) {
  const { t } = useT();
  const parts: Array<{ id: string; name: MessageKey; kind: MessageKey; critical: boolean }> = [
    { id: 'harvester', name: 'guide.fig.cte.harvester', kind: 'kind.hardware', critical: true },
    { id: 'power', name: 'guide.fig.cte.power', kind: 'kind.hardware', critical: true },
    { id: 'firmware', name: 'guide.fig.cte.firmware', kind: 'kind.software', critical: true },
    { id: 'enclosure', name: 'guide.fig.cte.enclosure', kind: 'kind.hardware', critical: true },
    { id: 'install', name: 'guide.fig.cte.install', kind: 'kind.process', critical: false },
  ];
  const w = 640;
  const colW = w / parts.length;
  const label = t('guide.fig.cte.label');

  return (
    <figure className={className}>
      <svg viewBox={`0 0 ${w} 170`} width="100%" role="img" aria-label={label}>
        <title>{label}</title>
        <rect
          x={w / 2 - 110}
          y={4}
          width={220}
          height={34}
          {...BOX}
          fill={VIZ.brandSoft}
          stroke={VIZ.brand}
        />
        <text
          x={w / 2}
          y={26}
          textAnchor="middle"
          fontSize={13}
          fontWeight={600}
          fill={VIZ.ink.primary}
        >
          {t('guide.fig.cte.system')}
        </text>

        {parts.map((part, i) => {
          const cx = i * colW + colW / 2;
          return (
            <g key={part.id}>
              <path
                d={`M${w / 2} 38 V56 H${cx} V74`}
                fill="none"
                stroke={VIZ.neutral.emptyStroke}
                strokeWidth={1.5}
              />
              <rect x={cx - colW / 2 + 6} y={74} width={colW - 12} height={62} {...BOX} />
              <rect
                x={cx - colW / 2 + 14}
                y={84}
                width={8}
                height={8}
                rx={2}
                fill={part.critical ? VIZ.ink.primary : VIZ.surface}
                stroke={VIZ.ink.primary}
              />
              <text x={cx - colW / 2 + 28} y={92} fontSize={9} fill={VIZ.ink.muted}>
                {part.critical ? t('guide.fig.cte.critical') : t('guide.fig.cte.notCritical')}
              </text>
              {lines(t(part.name)).map((line, row) => (
                <text
                  key={row}
                  x={cx}
                  y={110 + row * 12}
                  textAnchor="middle"
                  fontSize={11}
                  fill={VIZ.ink.primary}
                >
                  {line}
                </text>
              ))}
              <text x={cx} y={150} textAnchor="middle" fontSize={9} fill={VIZ.ink.muted}>
                {t(part.kind)}
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption className="mt-1 text-xs text-slate-500">{t('guide.fig.cte.caption')}</figcaption>
    </figure>
  );
}

export function EvidenceDecision({ className }: { className?: string }) {
  const tr = useT();
  const { t } = tr;
  const label = t('guide.fig.evidence.label');
  const w = 620;
  return (
    <figure className={className}>
      <svg viewBox={`0 0 ${w} 210`} width="100%" role="img" aria-label={label}>
        <title>{label}</title>

        <rect x={0} y={80} width={120} height={40} {...BOX} />
        <text x={60} y={104} textAnchor="middle" fontSize={12} fill={VIZ.ink.primary}>
          {t('guide.fig.evidence.criterion')}
        </text>

        {[
          { id: 'met', y: 8, status: statusText(tr, 'Met'), note: t('guide.fig.evidence.linked') },
          {
            id: 'na',
            y: 80,
            status: statusText(tr, 'N/A'),
            note: t('guide.fig.evidence.justified'),
          },
          {
            id: 'other',
            y: 152,
            status: t('guide.fig.evidence.other.line1'),
            note: t('guide.fig.evidence.other.line2'),
          },
        ].map((row) => (
          <g key={row.id}>
            <path
              d={`M120 100 H160 V${row.y + 20} H200`}
              fill="none"
              stroke={VIZ.neutral.emptyStroke}
              strokeWidth={1.5}
            />
            <rect x={200} y={row.y} width={190} height={40} {...BOX} />
            <text x={295} y={row.y + 18} textAnchor="middle" fontSize={11} fill={VIZ.ink.primary}>
              {row.status}
            </text>
            <text x={295} y={row.y + 32} textAnchor="middle" fontSize={10} fill={VIZ.ink.muted}>
              {row.note}
            </text>
          </g>
        ))}

        <path d="M390 28 H450" fill="none" stroke={VIZ.status.good} strokeWidth={2} />
        <path d="M390 100 H450" fill="none" stroke={VIZ.status.good} strokeWidth={2} />
        <path d="M390 172 H450" fill="none" stroke={VIZ.status.critical} strokeWidth={2} />

        <rect
          x={450}
          y={44}
          width={160}
          height={40}
          rx={6}
          fill="#e8f6e8"
          stroke={VIZ.status.good}
        />
        <text
          x={530}
          y={62}
          textAnchor="middle"
          fontSize={12}
          fontWeight={600}
          fill={VIZ.ink.primary}
        >
          {t('guide.fig.evidence.satisfied')}
        </text>
        <text x={530} y={76} textAnchor="middle" fontSize={10} fill={VIZ.ink.secondary}>
          {t('guide.fig.evidence.counts')}
        </text>

        <rect
          x={450}
          y={150}
          width={160}
          height={40}
          rx={6}
          fill="#fdecec"
          stroke={VIZ.status.critical}
        />
        <text
          x={530}
          y={168}
          textAnchor="middle"
          fontSize={12}
          fontWeight={600}
          fill={VIZ.ink.primary}
        >
          {t('guide.fig.evidence.notSatisfied')}
        </text>
        <text x={530} y={182} textAnchor="middle" fontSize={10} fill={VIZ.ink.secondary}>
          {t('guide.fig.evidence.gapList')}
        </text>
      </svg>
      <figcaption className="mt-1 text-xs text-slate-500">
        {t('guide.fig.evidence.caption')}
      </figcaption>
    </figure>
  );
}

export function EnvironmentFidelity({ className }: { className?: string }) {
  const { t } = useT();
  const steps = [
    { code: 'E0', name: t('guide.fig.env.e0.name'), note: t('guide.fig.env.e0.note') },
    { code: 'E1', name: t('guide.fig.env.e1.name'), note: t('guide.fig.env.e1.note') },
    { code: 'E2', name: t('guide.fig.env.e2.name'), note: t('guide.fig.env.e2.note') },
    { code: 'E3', name: t('guide.fig.env.e3.name'), note: t('guide.fig.env.e3.note') },
    { code: 'E4', name: t('guide.fig.env.e4.name'), note: t('guide.fig.env.e4.note') },
  ];
  const w = 660;
  const colW = w / steps.length;
  const label = t('guide.fig.env.label');
  return (
    <figure className={className}>
      <svg viewBox={`0 0 ${w} 150`} width="100%" role="img" aria-label={label}>
        <title>{label}</title>
        {steps.map((step, i) => {
          const x = i * colW;
          const h = 30 + i * 14;
          return (
            <g key={step.code}>
              <rect
                x={x + 6}
                y={110 - h}
                width={colW - 12}
                height={h}
                rx={4}
                fill={VIZ.sequential[Math.min(VIZ.sequential.length - 1, 2 + i * 2)]}
              />
              <text
                x={x + colW / 2}
                y={124}
                textAnchor="middle"
                fontSize={11}
                fontWeight={600}
                fill={VIZ.ink.primary}
              >
                {step.code}
              </text>
              <text
                x={x + colW / 2}
                y={136}
                textAnchor="middle"
                fontSize={10}
                fill={VIZ.ink.secondary}
              >
                {step.name}
              </text>
              <text x={x + colW / 2} y={147} textAnchor="middle" fontSize={9} fill={VIZ.ink.muted}>
                {step.note}
              </text>
            </g>
          );
        })}
        <text
          x={2 * colW + colW / 2}
          y={12}
          textAnchor="middle"
          fontSize={10}
          fontWeight={600}
          fill={VIZ.brand}
        >
          {t('guide.fig.env.relevantNeed')}
        </text>
        <text
          x={4 * colW - 4}
          y={12}
          textAnchor="middle"
          fontSize={10}
          fontWeight={600}
          fill={VIZ.brand}
        >
          {t('guide.fig.env.operationalNeed')}
        </text>
      </svg>
      <figcaption className="mt-1 text-xs text-slate-500">{t('guide.fig.env.caption')}</figcaption>
    </figure>
  );
}

export function SheetMap({ className }: { className?: string }) {
  const tier1 = [
    'README',
    'Summary',
    'Context',
    'Responses',
    'Next_Evidence_Placeholders',
    'References',
  ];
  const tier2 = [
    'README',
    'Summary',
    'CTE_Register',
    'Criteria_Assessment',
    'Evidence_Register',
    'Gap_Actions',
    'Review_Signoff',
    'References',
    'Metadata',
  ];
  const { t } = useT();
  const label = t('guide.fig.sheets.label', {
    tier1Count: tier1.length,
    tier1: tier1.join(', '),
    tier2Count: tier2.length,
    tier2: tier2.join(', '),
  });
  return (
    <figure className={className}>
      <div role="img" aria-label={label} className="grid gap-4 sm:grid-cols-2">
        {[
          { title: t('guide.fig.sheets.tier1'), sheets: tier1 },
          { title: t('guide.fig.sheets.tier2'), sheets: tier2 },
        ].map((book) => (
          <div key={book.title} className="rounded-md border border-slate-200 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {book.title}
            </p>
            <ol className="mt-2 space-y-1">
              {book.sheets.map((sheet, i) => (
                <li key={sheet} className="flex items-center gap-2 text-xs">
                  <span className="w-4 text-end tabular-nums text-slate-500">{i + 1}</span>
                  <span
                    className="rounded px-2 py-0.5 font-mono"
                    style={{ background: i === 0 ? VIZ.brandSoft : '#f1f5f9' }}
                  >
                    {sheet}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
      <figcaption className="mt-1 text-xs text-slate-500">
        {t('guide.fig.sheets.caption')}
      </figcaption>
    </figure>
  );
}

export function FrameworkRelation({ className }: { className?: string }) {
  const { t } = useT();
  const label = t('guide.fig.frameworks.label');
  const w = 620;
  const isDefault = (id: string) => (DEFAULT_FRAMEWORK as string) === id;
  const title = (id: string) => (isDefault(id) ? t('guide.fig.frameworks.default', { id }) : id);
  const box = (id: string) =>
    isDefault(id) ? { ...BOX, fill: VIZ.brandSoft, stroke: VIZ.brand } : BOX;
  return (
    <figure className={className}>
      <svg viewBox={`0 0 ${w} 190`} width="100%" role="img" aria-label={label}>
        <title>{label}</title>

        <rect x={0} y={20} width={230} height={70} {...box('dod-tra-2025')} />
        <text x={115} y={42} textAnchor="middle" fontSize={12} fontWeight={600}>
          {title('dod-tra-2025')}
        </text>
        <text x={115} y={58} textAnchor="middle" fontSize={10} fill={VIZ.ink.secondary}>
          {t('guide.fig.frameworks.dodCriteria')}
        </text>
        <text x={115} y={72} textAnchor="middle" fontSize={10} fill={VIZ.ink.muted}>
          {t('guide.fig.frameworks.dodTables')}
        </text>

        <path d={`M230 55 H300`} stroke={VIZ.brand} strokeWidth={2} fill="none" />
        <path d={`M296 51 L304 55 L296 59 Z`} fill={VIZ.brand} />
        <text x={265} y={46} textAnchor="middle" fontSize={10} fill={VIZ.brand}>
          {t('guide.fig.frameworks.extends')}
        </text>

        <rect x={304} y={10} width={316} height={90} {...box('marine-energy-eere')} />
        <text x={462} y={32} textAnchor="middle" fontSize={12} fontWeight={600}>
          {title('marine-energy-eere')}
        </text>
        <text x={462} y={50} textAnchor="middle" fontSize={10} fill={VIZ.ink.secondary}>
          {t('guide.fig.frameworks.marineCriteria')}
        </text>
        <text x={462} y={66} textAnchor="middle" fontSize={10} fill={VIZ.ink.secondary}>
          {t('guide.fig.frameworks.marineMandatory')}
        </text>
        <text x={462} y={84} textAnchor="middle" fontSize={10} fill={VIZ.ink.muted}>
          {t('guide.fig.frameworks.marineQuestions')}
        </text>

        <rect x={0} y={120} width={230} height={56} {...BOX} />
        <text x={115} y={140} textAnchor="middle" fontSize={11} fill={VIZ.ink.primary}>
          DoD TRA Guidebook 2025
        </text>
        <text x={115} y={156} textAnchor="middle" fontSize={9} fill={VIZ.ink.muted}>
          {t('guide.fig.frameworks.dodPages')}
        </text>
        <path d={`M115 120 V96`} stroke={VIZ.neutral.emptyStroke} strokeWidth={1.5} fill="none" />

        <rect x={304} y={120} width={316} height={56} {...BOX} />
        <text x={462} y={140} textAnchor="middle" fontSize={11} fill={VIZ.ink.primary}>
          {t('guide.fig.frameworks.eere')}
        </text>
        <text x={462} y={156} textAnchor="middle" fontSize={9} fill={VIZ.ink.muted}>
          {t('guide.fig.frameworks.eereTrl9')}
        </text>
        <path d={`M462 120 V104`} stroke={VIZ.neutral.emptyStroke} strokeWidth={1.5} fill="none" />
      </svg>
      <figcaption className="mt-1 text-xs text-slate-500">
        {t('guide.fig.frameworks.caption')}
      </figcaption>
    </figure>
  );
}

export function StageCrosswalk({ className }: { className?: string }) {
  const tr = useT();
  const { t } = tr;
  const stages = [
    { stage: 0, name: t('guide.fig.stage.s0'), from: 1, to: 2 },
    { stage: 1, name: t('guide.fig.stage.s1'), from: 2, to: 3 },
    { stage: 2, name: t('guide.fig.stage.s2'), from: 3, to: 3 },
    { stage: 3, name: t('guide.fig.stage.s3'), from: 3, to: 4 },
    { stage: 4, name: t('guide.fig.stage.s4'), from: 4, to: 4 },
    { stage: 5, name: t('guide.fig.stage.s5'), from: 5, to: 5 },
    { stage: 6, name: t('guide.fig.stage.s6'), from: 5, to: 6 },
    { stage: 7, name: t('guide.fig.stage.s7'), from: 6, to: 7 },
    { stage: 8, name: t('guide.fig.stage.s8'), from: 7, to: 8 },
    { stage: 9, name: t('guide.fig.stage.s9'), from: 8, to: 9 },
  ];
  const labelW = 170;
  const scaleW = 340;
  const w = labelW + scaleW + 20;
  const rowH = 20;
  const x = (trl: number) => labelW + ((trl - 1) / 8) * scaleW;
  const label = t('guide.fig.stage.label', {
    items: stages
      .map((s) =>
        s.to !== s.from
          ? t('guide.fig.stage.itemRange', { stage: s.stage, name: s.name, from: s.from, to: s.to })
          : t('guide.fig.stage.item', { stage: s.stage, name: s.name, from: s.from }),
      )
      .join(t('guide.fig.stage.separator')),
  });
  return (
    <figure className={className}>
      <svg
        viewBox={`0 0 ${w} ${stages.length * rowH + 28}`}
        width="100%"
        role="img"
        aria-label={label}
      >
        <title>{label}</title>
        {[1, 3, 5, 7, 9].map((trl) => (
          <g key={trl}>
            <line
              x1={x(trl)}
              y1={14}
              x2={x(trl)}
              y2={stages.length * rowH + 14}
              stroke={VIZ.grid}
            />
            <text
              x={x(trl)}
              y={stages.length * rowH + 26}
              textAnchor="middle"
              fontSize={9}
              fill={VIZ.ink.muted}
            >
              {trlText(tr, trl)}
            </text>
          </g>
        ))}
        {stages.map((s, i) => {
          const y = 16 + i * rowH;
          const x0 = x(s.from);
          const x1 = x(s.to) + 14;
          return (
            <g key={s.stage}>
              <text x={0} y={y + 10} fontSize={10} fill={VIZ.ink.primary}>
                {t('guide.fig.stage.row', { stage: s.stage, name: s.name })}
              </text>
              <rect
                x={x0}
                y={y + 2}
                width={Math.max(12, x1 - x0)}
                height={10}
                rx={5}
                fill={VIZ.sequential[3]}
              />
            </g>
          );
        })}
      </svg>
      <figcaption className="mt-1 text-xs text-slate-500">
        {t('guide.fig.stage.caption.before')}
        <em>{t('guide.fig.stage.caption.built')}</em>
        {t('guide.fig.stage.caption.middle')}
        <em>{t('guide.fig.stage.caption.demonstrated')}</em>
        {t('guide.fig.stage.caption.after')}
      </figcaption>
    </figure>
  );
}
