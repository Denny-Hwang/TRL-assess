import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSessionStore } from '@/state/sessionStore';
import { scoreTier2, tierDelta } from '@/domain/tier2';
import { formatTrl, scoreTier1 } from '@/domain/tier1';
import { deserializeSession, serializeSession } from '@/domain/json';
import { downloadBlob, sessionSlug, timestampForFilename } from '@/export/download';
import { Callout, Disclaimer, PageHeader, Stat } from '@/components/ui';

export function AssessResult() {
  const framework = useSessionStore((s) => s.framework);
  const session = useSessionStore((s) => s.session);
  const replaceSession = useSessionStore((s) => s.replaceSession);
  const fileInput = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const result = useMemo(
    () => (session.tier2 ? scoreTier2(framework, session.tier2) : null),
    [framework, session.tier2],
  );
  const tier1 = useMemo(
    () => (session.tier1 ? scoreTier1(framework, session.tier1) : null),
    [framework, session.tier1],
  );
  const delta = result ? tierDelta(result.system, tier1?.contiguousTrl) : null;

  const downloadJson = () => {
    downloadBlob(
      new Blob([serializeSession(session)], { type: 'application/json' }),
      `TRL_Tier2_${sessionSlug(session)}_${timestampForFilename()}.json`,
    );
  };

  const importJson = async (file: File) => {
    setError(null);
    setMessage(null);
    try {
      const { session: imported, warnings } = deserializeSession(await file.text());
      replaceSession(imported);
      setMessage(
        warnings.length ? `Imported with warnings: ${warnings.join(' ')}` : 'Session imported.',
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  // The Tier 2 workbook and the evidence package land in Phase 6.
  const runExport = async (_kind: 'excel' | 'zip') => {
    setBusy(null);
  };

  if (!result || result.ctes.length === 0) {
    return (
      <div className="space-y-4">
        <PageHeader title="Evidence-Based Assessment — result" />
        <Callout tone="info">
          Add at least one Critical Technology Element on the{' '}
          <Link className="underline" to="/assess">
            assessment page
          </Link>{' '}
          before looking at results.
        </Callout>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Evidence-Based Assessment — result"
        lead={session.tier1?.context.projectName ?? 'Untitled assessment'}
      />

      <div className="grid gap-4 sm:grid-cols-3" aria-live="polite">
        <Stat
          label="System summary"
          value={result.system.computed ? formatTrl(result.system.trl ?? 0) : '—'}
          hint={result.system.computed ? result.system.note : result.system.message}
          emphasis
          testId="system-trl"
        />
        <Stat
          label="Limiting CTE(s)"
          value={result.system.limitingCteIds.join(', ') || '—'}
          hint="The critical CTE(s) holding the system summary down."
          testId="limiting-ctes"
        />
        <Stat
          label="Tier 1 comparison"
          value={
            tier1
              ? `${formatTrl(tier1.contiguousTrl)} → ${delta?.delta === null ? '—' : `Δ ${delta?.delta}`}`
              : 'No quick estimate'
          }
          hint={delta?.explanation ?? 'Difference between the quick estimate and this assessment.'}
          testId="tier-delta"
        />
      </div>

      {delta?.significant && delta.explanation ? (
        <Callout tone="warning" title="Large difference between the tiers">
          {delta.explanation}
        </Callout>
      ) : null}

      <section className="card overflow-x-auto">
        <h2 className="text-lg font-semibold">Per-CTE results</h2>
        <table className="mt-3 w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left">
              <th className="py-2 pr-3">CTE</th>
              <th className="py-2 pr-3">Critical</th>
              <th className="py-2 pr-3">Assessed TRL</th>
              <th className="py-2 pr-3">Target</th>
              <th className="py-2 pr-3">Next-level completeness</th>
              <th className="py-2 pr-3">Evidence coverage</th>
            </tr>
          </thead>
          <tbody>
            {result.ctes.map((c) => (
              <tr key={c.cte.id} className="border-b border-slate-100">
                <td className="py-2 pr-3">
                  <span className="font-mono text-xs text-slate-500">{c.cte.id}</span> {c.cte.name}
                </td>
                <td className="py-2 pr-3">{c.cte.critical ? 'Yes' : 'No'}</td>
                <td className="py-2 pr-3 font-medium">{formatTrl(c.trl)}</td>
                <td className="py-2 pr-3">{c.cte.targetTrl ?? '—'}</td>
                <td className="py-2 pr-3">{c.nextLevelCompletenessPct}%</td>
                <td className="py-2 pr-3">{c.evidenceCoveragePct}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <Disclaimer label={result.label} />

      <section className="card">
        <h2 className="text-lg font-semibold">Gaps at the next level</h2>
        {result.ctes.every((c) => c.gaps.length === 0) ? (
          <p className="mt-2 text-sm text-emerald-800">
            No outstanding criteria at the next level.
          </p>
        ) : (
          result.ctes
            .filter((c) => c.gaps.length)
            .map((c) => (
              <div key={c.cte.id} className="mt-3">
                <h3 className="text-sm font-semibold">
                  {c.cte.id} {c.cte.name} — to reach TRL {c.nextLevel}
                </h3>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-700">
                  {c.gaps.map((g) => (
                    <li key={g.criterionId}>
                      <span className="font-mono text-xs text-slate-500">{g.criterionId}</span>{' '}
                      {g.criterionText} <em className="text-slate-500">({g.reason})</em>
                    </li>
                  ))}
                </ul>
              </div>
            ))
        )}
      </section>

      <section className="card">
        <h2 className="text-lg font-semibold">Take it away</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            className="btn-primary"
            onClick={() => void runExport('excel')}
            disabled
          >
            {busy === 'excel' ? 'Building the workbook…' : 'Download Excel (coming in Phase 6)'}
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => void runExport('zip')}
            disabled
          >
            {busy && busy !== 'excel' ? busy : 'Download evidence package (coming in Phase 6)'}
          </button>
          <button type="button" className="btn-secondary" onClick={downloadJson}>
            Download JSON
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => fileInput.current?.click()}
          >
            Import JSON
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="application/json,.json"
            className="hidden"
            aria-label="Import session JSON"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void importJson(file);
              e.target.value = '';
            }}
          />
        </div>
        {message ? (
          <p className="mt-3 text-sm text-emerald-800" role="status">
            {message}
          </p>
        ) : null}
        {error ? (
          <p className="mt-3 text-sm text-red-700" role="alert">
            {error}
          </p>
        ) : null}
      </section>
    </div>
  );
}
