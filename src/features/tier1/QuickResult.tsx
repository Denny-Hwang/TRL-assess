import { useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useSessionStore } from '@/state/sessionStore';
import { criteriaByLevel } from '@/domain/frameworks';
import { formatTrl, scoreTier1 } from '@/domain/tier1';
import { serializeSession } from '@/domain/json';
import { downloadBlob, sessionSlug, timestampForFilename } from '@/export/download';
import { Callout, Disclaimer, PageHeader, Stat } from '@/components/ui';
import { TrlLadder } from '@/components/viz/TrlLadder';
import { MatrixHeatmap } from '@/components/viz/MatrixHeatmap';
import type { TrlLevel } from '@/domain/schemas';

const CONSISTENCY_HELP: Record<string, string> = {
  High: 'Your answers are internally consistent and agree with the build/environment cross-check. That says nothing about whether the answers are correct.',
  Medium:
    'There is some tension between your answers and the cross-check, or an "Unsure" at or below the level you claimed.',
  Low: 'Your answers disagree strongly with the build/environment cross-check, or several levels below your claim are unconfirmed. Re-check before using this figure.',
};

export function QuickResult() {
  const framework = useSessionStore((s) => s.framework);
  const session = useSessionStore((s) => s.session);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const result = useMemo(
    () => (session.tier1 ? scoreTier1(framework, session.tier1) : null),
    [framework, session.tier1],
  );

  if (!session.tier1 || !result) return <Navigate to="/quick" replace />;

  const nextLevel = Math.min(9, result.contiguousTrl + 1) as TrlLevel;
  const nextCriteria = criteriaByLevel(framework, nextLevel).slice(0, 8);

  const downloadJson = () => {
    const name = `TRL_Tier1_${sessionSlug(session)}_${timestampForFilename()}.json`;
    downloadBlob(new Blob([serializeSession(session)], { type: 'application/json' }), name);
  };

  const downloadExcel = async () => {
    setBusy(true);
    setError(null);
    try {
      // Lazy-loaded so ExcelJS never lands in the initial bundle.
      const { exportTier1Workbook } = await import('@/export/excel/tier1');
      await exportTier1Workbook(framework, session);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <PageHeader
        title="Quick Estimate — result"
        lead={`${session.tier1.context.technologyName} · ${session.tier1.context.projectName}`}
      />

      <section className="card" aria-live="polite">
        <TrlLadder
          achieved={result.contiguousTrl}
          gaps={result.flags.find((f) => f.code === 'gap')?.levels ?? []}
          current={nextLevel}
          markers={[
            { level: Math.max(1, result.contiguousTrl), label: 'estimate' },
            ...(result.firstYesTrl > result.contiguousTrl
              ? [{ level: result.firstYesTrl, label: 'claimed', tone: 'critical' as const }]
              : []),
            ...(result.matrixTrl > 0 && result.matrixTrl !== result.contiguousTrl
              ? [{ level: result.matrixTrl, label: 'cross-check', tone: 'muted' as const }]
              : []),
          ]}
          label={`Estimated TRL ${result.contiguousTrl} of 9. Highest level claimed: ${result.firstYesTrl}. Build and environment cross-check: ${result.matrixTrl}.`}
        />
        <p className="mt-2 text-xs text-slate-500">
          Filled rungs are confirmed. A hatched rung is a level you claimed while a level below it
          is unconfirmed — the chain stops there.
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat
          label="Estimated TRL"
          value={formatTrl(result.contiguousTrl)}
          hint="Highest level with every level below it also confirmed."
          emphasis
          testId="estimated-trl"
        />
        <Stat
          label="Highest level claimed"
          value={formatTrl(result.firstYesTrl)}
          hint='Highest single "Yes", ignoring gaps.'
          testId="first-yes-trl"
        />
        <Stat
          label="Build × environment cross-check"
          value={formatTrl(result.matrixTrl)}
          hint={`${session.tier1.context.build} × ${session.tier1.context.environment} — ${framework.matrix.status}.`}
          testId="matrix-trl"
        />
      </div>

      <section className="card">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Consistency: {result.consistency}
        </h2>
        <div className="mt-3">
          <MatrixHeatmap
            matrix={framework.matrix}
            build={session.tier1.context.build}
            environment={session.tier1.context.environment}
          />
        </div>
        <p className="mt-2 text-sm text-slate-700">{CONSISTENCY_HELP[result.consistency]}</p>
        {result.flags.length ? (
          <ul className="mt-3 space-y-2">
            {result.flags.map((flag) => (
              <li key={flag.code}>
                <Callout tone={flag.code === 'gap' ? 'warning' : 'info'}>{flag.message}</Callout>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-emerald-800">No flags raised.</p>
        )}
      </section>

      <Disclaimer label={result.label} />

      <section className="card">
        <h2 className="text-lg font-semibold">What typically comes next</h2>
        <p className="mt-1 text-sm text-slate-600">
          Criteria at TRL {nextLevel} in {framework.framework.name}. In a Tier 2 assessment each of
          these needs evidence.
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
          {nextCriteria.map((c) => (
            <li key={c.id}>
              <span className="font-mono text-xs text-slate-500">{c.id}</span> — {c.text}
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h2 className="text-lg font-semibold">Take it away</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" className="btn-primary" onClick={downloadExcel} disabled={busy}>
            {busy ? 'Building the workbook…' : 'Download Excel'}
          </button>
          <button type="button" className="btn-secondary" onClick={downloadJson}>
            Download JSON
          </button>
          <Link className="btn-secondary" to="/assess">
            Continue to Evidence Assessment
          </Link>
        </div>
        {error ? (
          <p role="alert" className="mt-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}
        <p className="mt-3 text-xs text-slate-500">
          The JSON file restores this session in the app. The workbook is a static snapshot —
          editing it does not recompute the TRL.
        </p>
      </section>
    </div>
  );
}
