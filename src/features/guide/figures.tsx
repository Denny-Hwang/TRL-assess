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
import { ArlDimensionMap } from '@/components/viz/ArlDimensionMap';
import { ArlLookupGrid } from '@/components/viz/ArlLookupGrid';
import { resolveFramework } from '@/domain/frameworks';
import { loadArlFramework } from '@/domain/arl';
import { DEFAULT_ARL_FRAMEWORK, DEFAULT_FRAMEWORK } from '@/config/app.config';
import { trlText } from '@/i18n/domainText';
import { useT } from '@/i18n/store';
import type { Translator } from '@/i18n/translate';

/**
 * Figures a Guide page can embed with a line of its own:
 *
 *     :::figure trl-scale:::
 *
 * Keeping the prose in Markdown and the drawing in code means a diagram can be corrected without
 * touching the text, and the text stays reviewable by someone who does not read TSX.
 */
export const GUIDE_FIGURES: Record<string, (tr: Translator) => ReactNode> = {
  'trl-scale': ({ t }) => (
    <figure>
      <TrlLadder
        achieved={4}
        current={5}
        markers={[{ level: 4, label: t('guide.fig.trlScale.marker') }]}
        label={t('guide.fig.trlScale.label')}
      />
      <figcaption className="mt-1 text-xs text-slate-500">
        {t('guide.fig.trlScale.caption')}
      </figcaption>
    </figure>
  ),

  'tier1-clean': (tr) => (
    <figure>
      <TrlLadder
        achieved={4}
        current={5}
        markers={[
          { level: 4, label: tr.t('guide.fig.tier1.estimate') },
          { level: 5, label: tr.t('guide.fig.tier1.crossCheck'), tone: 'muted' },
        ]}
        label={tr.t('guide.fig.tier1Clean.label')}
      />
      <figcaption className="mt-1 text-xs text-slate-500">
        {tr.t('guide.fig.tier1Clean.caption.before')}
        <strong>{trlText(tr, 4)}</strong>
        {tr.t('guide.fig.tier1Clean.caption.middle')}
        <strong>{tr.t('consistency.High')}</strong>
        {tr.t('guide.fig.tier1Clean.caption.after')}
      </figcaption>
    </figure>
  ),

  'tier1-gap': (tr) => (
    <figure>
      <TrlLadder
        achieved={1}
        gaps={[2]}
        markers={[
          { level: 1, label: tr.t('guide.fig.tier1.estimate') },
          { level: 4, label: tr.t('guide.fig.tier1Gap.claimed'), tone: 'critical' },
        ]}
        label={tr.t('guide.fig.tier1Gap.label')}
      />
      <figcaption className="mt-1 text-xs text-slate-500">
        {tr.t('guide.fig.tier1Gap.caption.before')}
        <strong>{trlText(tr, 1)}</strong>
        {tr.t('guide.fig.tier1Gap.caption.after')}
      </figcaption>
    </figure>
  ),

  'tier2-system': (tr) => (
    <figure>
      <div className="space-y-2">
        {[
          { name: tr.t('guide.fig.tier2.harvester'), trl: 4, critical: true },
          { name: tr.t('guide.fig.tier2.converter'), trl: 3, critical: true, limiting: true },
          { name: tr.t('guide.fig.tier2.firmware'), trl: 3, critical: true, limiting: true },
        ].map((cte) => (
          <div key={cte.name} className="flex items-center gap-3 text-xs">
            <span className="w-36 text-slate-700">{cte.name}</span>
            <TrlLadder
              achieved={cte.trl}
              size="sm"
              label={tr.t('guide.fig.tier2.cteLabel', { name: cte.name, trl: trlText(tr, cte.trl) })}
              className="w-48"
            />
            <span className="text-slate-600">
              {trlText(tr, cte.trl)}
              {cte.limiting ? (
                <strong className="ms-2 text-red-700">{tr.t('guide.fig.tier2.limiting')}</strong>
              ) : null}
            </span>
          </div>
        ))}
      </div>
      <figcaption className="mt-2 text-xs text-slate-500">
        {tr.t('guide.fig.tier2.caption.before')}
        <strong>{tr.t('guide.fig.tier2.caption.formula')}</strong>
        {tr.t('guide.fig.tier2.caption.after')}
      </figcaption>
    </figure>
  ),

  'status-legend': ({ t }) => (
    <figure className="rounded-md border border-slate-200 p-3">
      <StatusLegend />
      <figcaption className="mt-2 text-xs text-slate-500">
        {t('guide.fig.statusLegend.caption')}
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

  'arl-dimensions': () => <ArlDimensionMap framework={loadArlFramework(DEFAULT_ARL_FRAMEWORK)} />,

  'arl-lookup': ({ t }) => (
    <figure>
      <ArlLookupGrid
        framework={loadArlFramework(DEFAULT_ARL_FRAMEWORK)}
        marks={[{ medium: 3, high: 1, label: t('guide.fig.arlLookup.mark'), style: 'solid' }]}
      />
      <figcaption className="mt-1 text-xs text-slate-500">
        {t('guide.fig.arlLookup.caption.before')}
        <strong>{t('guide.fig.arlLookup.caption.value')}</strong>
        {t('guide.fig.arlLookup.caption.after')}
      </figcaption>
    </figure>
  ),
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
  const tr = useT();
  const render = GUIDE_FIGURES[id];
  if (!render) {
    return (
      <p
        role="alert"
        className="my-4 rounded border border-red-200 bg-red-50 p-2 text-sm text-red-800"
      >
        {tr.t('guide.fig.unknown', { id })}
      </p>
    );
  }
  return <div className="my-5">{render(tr)}</div>;
}
