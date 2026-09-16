import { VIZ } from './tokens';

const BOX = { rx: 6, stroke: VIZ.neutral.emptyStroke, fill: VIZ.surface } as const;

/**
 * Diagrams used by the Guide. Each one is a figure with a sentence-long accessible name and a
 * caption; none of them carries meaning in colour alone.
 */

export function DecompositionTree({ className }: { className?: string }) {
  const parts = [
    { lines: ['Energy', 'harvester'], kind: 'hardware', critical: true },
    { lines: ['Power', 'conversion'], kind: 'hardware', critical: true },
    { lines: ['Telemetry', 'firmware'], kind: 'software', critical: true },
    { lines: ['Enclosure', '& sealing'], kind: 'hardware', critical: true },
    { lines: ['Mooring &', 'recovery'], kind: 'process', critical: false },
  ];
  const w = 640;
  const colW = w / parts.length;
  const label =
    'A wave buoy split into five elements: energy harvester, power conversion, telemetry firmware, ' +
    'enclosure and sealing — all critical — and the mooring and recovery procedure, which is a process and not critical here.';

  return (
    <figure className={className}>
      <svg viewBox={`0 0 ${w} 170`} width="100%" role="img" aria-label={label}>
        <title>{label}</title>
        <rect
          x={w / 2 - 90}
          y={4}
          width={180}
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
          Wave buoy (system)
        </text>

        {parts.map((part, i) => {
          const cx = i * colW + colW / 2;
          return (
            <g key={part.lines.join(' ')}>
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
                {part.critical ? 'critical' : 'not critical'}
              </text>
              {part.lines.map((line, row) => (
                <text
                  key={line}
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
                {part.kind}
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption className="mt-1 text-xs text-slate-500">
        Each element is assessed on its own. A process can be a CTE; “critical” decides what counts
        towards the system summary.
      </figcaption>
    </figure>
  );
}

export function EvidenceDecision({ className }: { className?: string }) {
  const label =
    'How a criterion becomes satisfied: status Met plus at least one non-rejected evidence item, ' +
    'or status N/A with a justification. Partially met, Not met and Not assessed are never satisfied.';
  const w = 620;
  return (
    <figure className={className}>
      <svg viewBox={`0 0 ${w} 210`} width="100%" role="img" aria-label={label}>
        <title>{label}</title>

        <rect x={0} y={80} width={120} height={40} {...BOX} />
        <text x={60} y={104} textAnchor="middle" fontSize={12} fill={VIZ.ink.primary}>
          Criterion
        </text>

        {[
          { y: 8, status: 'Met', note: 'evidence linked?', out: null },
          { y: 80, status: 'N/A', note: 'justification?', out: null },
          { y: 152, status: 'Partially / Not met / Not assessed', note: '', out: 'not satisfied' },
        ].map((row) => (
          <g key={row.status}>
            <path
              d={`M120 100 H160 V${row.y + 20} H200`}
              fill="none"
              stroke={VIZ.neutral.emptyStroke}
              strokeWidth={1.5}
            />
            <rect x={200} y={row.y} width={190} height={40} {...BOX} />
            <text x={295} y={row.y + 18} textAnchor="middle" fontSize={11} fill={VIZ.ink.primary}>
              {row.status.length > 26 ? 'Partially / Not met /' : row.status}
            </text>
            <text x={295} y={row.y + 32} textAnchor="middle" fontSize={10} fill={VIZ.ink.muted}>
              {row.status.length > 26 ? 'Not assessed' : row.note}
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
          ✓ Satisfied
        </text>
        <text x={530} y={76} textAnchor="middle" fontSize={10} fill={VIZ.ink.secondary}>
          counts towards the level
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
          ✕ Not satisfied
        </text>
        <text x={530} y={182} textAnchor="middle" fontSize={10} fill={VIZ.ink.secondary}>
          appears in the gap list
        </text>
      </svg>
      <figcaption className="mt-1 text-xs text-slate-500">
        “Met” with no usable evidence, and “N/A” with no justification, both fall to the lower path.
      </figcaption>
    </figure>
  );
}

export function EnvironmentFidelity({ className }: { className?: string }) {
  const steps = [
    { code: 'E0', name: 'Analysis only', note: 'models, no hardware' },
    { code: 'E1', name: 'Laboratory', note: 'bench, air, room temperature' },
    { code: 'E2', name: 'Relevant', note: 'seawater tank, motion, cold' },
    { code: 'E3', name: 'Operational (limited)', note: 'short deployment, calm season' },
    { code: 'E4', name: 'Operational (full)', note: 'full mission range' },
  ];
  const w = 660;
  const colW = w / steps.length;
  const label =
    'Environment fidelity rises from analysis only, through laboratory, a relevant environment such as a ' +
    'seawater tank, to a limited operational deployment and finally the full mission range. TRL 5 and 6 need ' +
    'a relevant environment; TRL 7 and 8 need the operational one.';
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
          TRL 5–6 need this
        </text>
        <text
          x={4 * colW - 4}
          y={12}
          textAnchor="middle"
          fontSize={10}
          fontWeight={600}
          fill={VIZ.brand}
        >
          TRL 7–8 need this
        </text>
      </svg>
      <figcaption className="mt-1 text-xs text-slate-500">
        A fresh-water tank test is not a relevant environment for a failure mode that needs
        conductive seawater.
      </figcaption>
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
  const label = `The Tier 1 workbook has ${tier1.length} sheets: ${tier1.join(', ')}. The Tier 2 workbook has ${tier2.length}: ${tier2.join(', ')}.`;
  return (
    <figure className={className}>
      <div role="img" aria-label={label} className="grid gap-4 sm:grid-cols-2">
        {[
          { title: 'Tier 1 workbook', sheets: tier1 },
          { title: 'Tier 2 workbook', sheets: tier2 },
        ].map((book) => (
          <div key={book.title} className="rounded-md border border-slate-200 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {book.title}
            </p>
            <ol className="mt-2 space-y-1">
              {book.sheets.map((sheet, i) => (
                <li key={sheet} className="flex items-center gap-2 text-xs">
                  <span className="w-4 text-right tabular-nums text-slate-500">{i + 1}</span>
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
        Sheet order is fixed, and every workbook opens on its README.
      </figcaption>
    </figure>
  );
}

export function FrameworkRelation({ className }: { className?: string }) {
  const label =
    'marine-energy-eere extends dod-tra-2025: it reuses the DoD criteria, adds eight marine tailoring items, ' +
    'and takes its Tier 1 questions from the EERE definitions, with TRL 9 from the DoD table.';
  const w = 620;
  return (
    <figure className={className}>
      <svg viewBox={`0 0 ${w} 190`} width="100%" role="img" aria-label={label}>
        <title>{label}</title>

        <rect x={0} y={20} width={230} height={70} {...BOX} />
        <text x={115} y={42} textAnchor="middle" fontSize={12} fontWeight={600}>
          dod-tra-2025
        </text>
        <text x={115} y={58} textAnchor="middle" fontSize={10} fill={VIZ.ink.secondary}>
          58 criteria, verbatim
        </text>
        <text x={115} y={72} textAnchor="middle" fontSize={10} fill={VIZ.ink.muted}>
          hardware + software tables
        </text>

        <path d={`M230 55 H300`} stroke={VIZ.brand} strokeWidth={2} fill="none" />
        <path d={`M296 51 L304 55 L296 59 Z`} fill={VIZ.brand} />
        <text x={265} y={46} textAnchor="middle" fontSize={10} fill={VIZ.brand}>
          extends
        </text>

        <rect
          x={304}
          y={10}
          width={316}
          height={90}
          {...BOX}
          fill={VIZ.brandSoft}
          stroke={VIZ.brand}
        />
        <text x={462} y={32} textAnchor="middle" fontSize={12} fontWeight={600}>
          marine-energy-eere (default)
        </text>
        <text x={462} y={50} textAnchor="middle" fontSize={10} fill={VIZ.ink.secondary}>
          references the DoD criteria + 8 tailored items
        </text>
        <text x={462} y={66} textAnchor="middle" fontSize={10} fill={VIZ.ink.secondary}>
          promotes the level-defining criterion to mandatory
        </text>
        <text x={462} y={84} textAnchor="middle" fontSize={10} fill={VIZ.ink.muted}>
          Tier 1 questions adapted from EERE R 540.112-02
        </text>

        <rect x={0} y={120} width={230} height={56} {...BOX} />
        <text x={115} y={140} textAnchor="middle" fontSize={11} fill={VIZ.ink.primary}>
          DoD TRA Guidebook 2025
        </text>
        <text x={115} y={156} textAnchor="middle" fontSize={9} fill={VIZ.ink.muted}>
          Tables 2-1 / 2-2, pp. 6–10
        </text>
        <path d={`M115 120 V96`} stroke={VIZ.neutral.emptyStroke} strokeWidth={1.5} fill="none" />

        <rect x={304} y={120} width={316} height={56} {...BOX} />
        <text x={462} y={140} textAnchor="middle" fontSize={11} fill={VIZ.ink.primary}>
          EERE R 540.112-02 (TRL 1–8) + NREL / GOOS rationales
        </text>
        <text x={462} y={156} textAnchor="middle" fontSize={9} fill={VIZ.ink.muted}>
          TRL 9 comes from the DoD table — EERE defines no TRL 9
        </text>
        <path d={`M462 120 V104`} stroke={VIZ.neutral.emptyStroke} strokeWidth={1.5} fill="none" />
      </svg>
      <figcaption className="mt-1 text-xs text-slate-500">
        An extending framework can change how a criterion is used, never what its source says.
      </figcaption>
    </figure>
  );
}

export function StageCrosswalk({ className }: { className?: string }) {
  const stages = [
    { stage: 0, name: 'Concept', from: 1, to: 2 },
    { stage: 1, name: 'Component evaluation', from: 2, to: 3 },
    { stage: 2, name: 'Proof of concept', from: 3, to: 3 },
    { stage: 3, name: 'Breadboard', from: 3, to: 4 },
    { stage: 4, name: 'Board-level (PCB)', from: 4, to: 4 },
    { stage: 5, name: 'Integrated prototype', from: 5, to: 5 },
    { stage: 6, name: 'Miniaturized', from: 5, to: 6 },
    { stage: 7, name: 'Production-intent', from: 6, to: 7 },
    { stage: 8, name: 'Pilot production', from: 7, to: 8 },
    { stage: 9, name: 'Transfer / licensing', from: 8, to: 9 },
  ];
  const labelW = 170;
  const scaleW = 340;
  const w = labelW + scaleW + 20;
  const rowH = 20;
  const x = (trl: number) => labelW + ((trl - 1) / 8) * scaleW;
  const label = `Development stages mapped to TRL ranges: ${stages
    .map(
      (s) =>
        `stage ${s.stage} ${s.name} covers TRL ${s.from}${s.to !== s.from ? ` to ${s.to}` : ''}`,
    )
    .join('; ')}.`;
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
              TRL {trl}
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
                {s.stage}. {s.name}
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
        Ranges are wide because a stage says what you <em>built</em>; a TRL says what you
        <em> demonstrated, and where</em>. Stage models are organization-specific — not a basis for
        scoring.
      </figcaption>
    </figure>
  );
}
