import type { ReactNode } from 'react';
import { TrlLadder } from '@/components/viz/TrlLadder';
import { MatrixHeatmap } from '@/components/viz/MatrixHeatmap';
import { StatusLegend } from '@/components/viz/StatusGlyph';
import {
  DecompositionTree,
  EnvironmentFidelity,
  EvidenceDecision,
  FrameworkRelation,
  SheetMap,
  StageCrosswalk,
} from '@/components/viz/Diagrams';
import { resolveFramework } from '@/domain/frameworks';
import { DEFAULT_FRAMEWORK } from '@/config/app.config';

/**
 * Figures a Guide page can embed with a line of its own:
 *
 *     :::figure trl-scale:::
 *
 * Keeping the prose in Markdown and the drawing in code means a diagram can be corrected without
 * touching the text, and the text stays reviewable by someone who does not read TSX.
 */
export const GUIDE_FIGURES: Record<string, () => ReactNode> = {
  'trl-scale': () => (
    <figure>
      <TrlLadder
        achieved={4}
        current={5}
        markers={[{ level: 4, label: 'highest confirmed' }]}
        label="The nine levels. A level counts only when every level below it is confirmed."
      />
      <figcaption className="mt-1 text-xs text-slate-500">
        The chain, not the highest claim: TRL 4 here even if TRL 6 was answered “yes”.
      </figcaption>
    </figure>
  ),

  'tier1-clean': () => (
    <figure>
      <TrlLadder
        achieved={4}
        current={5}
        markers={[
          { level: 4, label: 'estimate' },
          { level: 5, label: 'cross-check', tone: 'muted' },
        ]}
        label="Worked example 1: yes at TRL 1 to 4, unsure at 5. Estimate TRL 4; cross-check TRL 5; consistency high."
      />
      <figcaption className="mt-1 text-xs text-slate-500">
        Example 1 — yes up to 4, unsure at 5. Estimate <strong>TRL 4</strong>, cross-check 5,
        consistency <strong>High</strong>.
      </figcaption>
    </figure>
  ),

  'tier1-gap': () => (
    <figure>
      <TrlLadder
        achieved={1}
        gaps={[2]}
        markers={[
          { level: 1, label: 'estimate' },
          { level: 4, label: 'claimed', tone: 'critical' },
        ]}
        label="Worked example 2: yes at TRL 1, no at 2, yes at 3 and 4. The chain breaks at TRL 2, so the estimate is TRL 1 while TRL 4 was claimed."
      />
      <figcaption className="mt-1 text-xs text-slate-500">
        Example 2 — the hatched rung is TRL 2, answered “no”. Estimate <strong>TRL 1</strong>,
        highest claim 4, gap flag raised.
      </figcaption>
    </figure>
  ),

  'tier2-system': () => (
    <figure>
      <div className="space-y-2">
        {[
          { name: 'Harvester', trl: 4, critical: true },
          { name: 'Power converter', trl: 3, critical: true, limiting: true },
          { name: 'Telemetry firmware', trl: 3, critical: true, limiting: true },
        ].map((cte) => (
          <div key={cte.name} className="flex items-center gap-3 text-xs">
            <span className="w-36 text-slate-700">{cte.name}</span>
            <TrlLadder
              achieved={cte.trl}
              size="sm"
              label={`${cte.name}: TRL ${cte.trl}`}
              className="w-48"
            />
            <span className="text-slate-600">
              TRL {cte.trl}
              {cte.limiting ? (
                <strong className="ml-2 text-red-700">◀ limits the system</strong>
              ) : null}
            </span>
          </div>
        ))}
      </div>
      <figcaption className="mt-2 text-xs text-slate-500">
        Example 3 — the system summary is <strong>min(4, 3, 3) = TRL 3</strong>. The harvester’s 4
        does not pull it up, and nothing is averaged.
      </figcaption>
    </figure>
  ),

  'status-legend': () => (
    <figure className="rounded-md border border-slate-200 p-3">
      <StatusLegend />
      <figcaption className="mt-2 text-xs text-slate-500">
        Only the first two count towards a level: “Met” with usable evidence, and “N/A” with a
        justification.
      </figcaption>
    </figure>
  ),

  'cross-check-matrix': () => <MatrixHeatmap matrix={resolveFramework(DEFAULT_FRAMEWORK).matrix} />,

  'cte-tree': () => <DecompositionTree />,
  'evidence-decision': () => <EvidenceDecision />,
  'environment-fidelity': () => <EnvironmentFidelity />,
  'sheet-map': () => <SheetMap />,
  'framework-relation': () => <FrameworkRelation />,
  'stage-crosswalk': () => <StageCrosswalk />,
};

export const FIGURE_TOKEN = /^:::figure\s+([a-z0-9-]+):::$/;

export interface GuideChunk {
  kind: 'markdown' | 'figure';
  value: string;
}

/** Splits a page into markdown chunks and figure ids, preserving order. */
export function splitFigures(markdown: string): GuideChunk[] {
  const chunks: GuideChunk[] = [];
  let buffer: string[] = [];

  const flush = () => {
    const text = buffer.join('\n').trim();
    if (text) chunks.push({ kind: 'markdown', value: text });
    buffer = [];
  };

  for (const line of markdown.split('\n')) {
    const match = FIGURE_TOKEN.exec(line.trim());
    if (match) {
      flush();
      chunks.push({ kind: 'figure', value: match[1]! });
    } else {
      buffer.push(line);
    }
  }
  flush();
  return chunks;
}

export function GuideFigure({ id }: { id: string }) {
  const render = GUIDE_FIGURES[id];
  if (!render) {
    return (
      <p
        role="alert"
        className="my-4 rounded border border-red-200 bg-red-50 p-2 text-sm text-red-800"
      >
        Unknown figure “{id}”.
      </p>
    );
  }
  return <div className="my-5">{render()}</div>;
}
