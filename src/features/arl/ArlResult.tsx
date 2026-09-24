import { useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  evaluateCallProfile,
  guidance,
  loadCallProfile,
  scoreArl,
  summarizeChecks,
  trlStartFor,
  type ArlFlag,
  type CallCheckOutcome,
  type CheckResult,
} from '@/domain/arl';
import { formatTrl } from '@/domain/tier1';
import type { ArlFramework } from '@/domain/schemas';
import { serializeSession } from '@/domain/json';
import { downloadBlob, slugify, timestampForFilename } from '@/export/download';
import { useSessionStore } from '@/state/sessionStore';
import { ARL_DISCLAIMER, ARL_LABEL, ARL_TARGET_LABEL } from '@/config/app.config';
import { Callout, PageHeader, SourceNote, Stat } from '@/components/ui';
import { ArlScale } from '@/components/viz/ArlScale';
import { ArlLookupGrid } from '@/components/viz/ArlLookupGrid';
import { RiskGlyph, RiskLegend } from '@/components/viz/RiskGlyph';
import { RiskTallyBar } from '@/components/viz/RiskTallyBar';

const RESULT_STYLE: Record<CheckResult, string> = {
  Pass: 'border-emerald-300 bg-emerald-50 text-emerald-900',
  Fail: 'border-red-300 bg-red-50 text-red-900',
  Warning: 'border-amber-300 bg-amber-50 text-amber-900',
  Info: 'border-sky-300 bg-sky-50 text-sky-900',
  'Not evaluated': 'border-slate-300 bg-slate-50 text-slate-800',
};

const RESULT_MARK: Record<CheckResult, string> = {
  Pass: '✓',
  Fail: '✗',
  Warning: '!',
  Info: 'i',
  'Not evaluated': '–',
};

function FlagList({ flags }: { flags: ArlFlag[] }) {
  if (!flags.length) return <p className="text-sm text-emerald-800">No flags raised.</p>;
  return (
    <ul className="space-y-2">
      {flags.map((flag) => (
        <li key={flag.code}>
          <Callout tone={flag.affectsScore ? 'warning' : 'info'}>{flag.message}</Callout>
        </li>
      ))}
    </ul>
  );
}

function CheckRow({ outcome }: { outcome: CallCheckOutcome }) {
  return (
    <li
      className="rounded-md border border-slate-200 p-3"
      data-testid={`check-${outcome.check.id}`}
    >
      <div className="flex flex-wrap items-start gap-3">
        <span
          className={`badge shrink-0 ${RESULT_STYLE[outcome.result]}`}
          title={`Result: ${outcome.result}`}
        >
          <span aria-hidden="true">{RESULT_MARK[outcome.result]}</span> {outcome.result}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">
            {outcome.check.title}{' '}
            <span className="font-mono text-xs font-normal text-slate-600">{outcome.check.id}</span>
          </p>
          <p className="mt-1 text-sm text-slate-700">{outcome.detail}</p>
          <ul className="mt-2 space-y-1">
            {outcome.requirements.map((r) => (
              <li key={r.id} className="text-xs text-slate-600">
                <q>{r.text}</q> <SourceNote {...r.source} compact />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </li>
  );
}

export function ArlResultPage({ framework }: { framework: ArlFramework }) {
  const session = useSessionStore((s) => s.session);
  const trlFramework = useSessionStore((s) => s.framework);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const arl = session.arl;

  const result = useMemo(() => (arl ? scoreArl(framework, arl) : null), [framework, arl]);
  const call = useMemo(() => {
    if (!arl?.call || !result) return null;
    let profile;
    try {
      profile = loadCallProfile(arl.call.profileId);
    } catch {
      return { missing: arl.call.profileId } as const;
    }
    const trlStart = trlStartFor(session, trlFramework);
    const outcomes = evaluateCallProfile(profile, framework, {
      arl: result,
      trlStart,
      ...(arl.call.trlEnd !== undefined ? { trlEnd: arl.call.trlEnd } : {}),
      ...(arl.call.topicId ? { topicId: arl.call.topicId } : {}),
      trlFramework: {
        id: trlFramework.framework.id,
        name: trlFramework.framework.name,
        sources: trlFramework.framework.sources,
      },
    });
    return { profile, trlStart, outcomes, counts: summarizeChecks(outcomes) } as const;
  }, [arl, result, session, trlFramework, framework]);

  if (!arl || !result) return <Navigate to="/arl" replace />;

  const { start, end } = result;
  const scopeMissing =
    !arl.context.technologyScope?.trim() || !arl.context.evaluationTimeline?.trim();
  const falsePrecision = guidance(framework, 'false-precision');
  const powerLaw = guidance(framework, 'power-law');
  const modify = guidance(framework, 'modify-lookup');
  const targetById = new Map(end.outcomes.map((o) => [o.dimension.id, o]));

  const downloadJson = () => {
    const name = `ARL_${slugify(arl.context.projectName || 'assessment')}_${timestampForFilename()}.json`;
    downloadBlob(new Blob([serializeSession(session)], { type: 'application/json' }), name);
  };

  const downloadExcel = async () => {
    setBusy(true);
    setError(null);
    try {
      // Lazy-loaded so ExcelJS never lands in the initial bundle.
      const { exportArlWorkbook } = await import('@/export/excel/arl');
      await exportArlWorkbook(framework, session, trlFramework);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-5xl space-y-6">
      <PageHeader
        title="Adoption readiness — result"
        lead={`${arl.context.technologyName} · ${arl.context.projectName}`}
      />

      <section className="card" aria-live="polite">
        <ArlScale
          framework={framework}
          start={start.arl}
          end={end.arl}
          label={`ARL Start ${start.arl} (${start.band}). ARL End, target: ${end.arl} (${end.band}).`}
        />
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat
          label="ARL Start"
          value={`ARL ${start.arl}`}
          hint={`${start.band} — ${start.tally.Medium} Medium, ${start.tally.High} High counted.`}
          emphasis
          testId="arl-start"
        />
        <Stat
          label="ARL End (target)"
          value={`ARL ${end.arl}`}
          hint={`${end.band} — ${ARL_TARGET_LABEL}.`}
          testId="arl-end"
        />
        <Stat
          label="Change over the project"
          value={result.change > 0 ? `+${result.change}` : String(result.change)}
          hint="ARL End minus ARL Start."
          testId="arl-change"
        />
      </div>

      {scopeMissing ? (
        <Callout tone="info">
          The technology scope or the timeline for evaluation is blank. The source asks you to
          define both before rating — the same technology can rate differently at another scope.{' '}
          <Link to="/arl" className="underline">
            Complete the scope
          </Link>
          .
        </Callout>
      ) : null}

      <section className="card space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Risk profile</h2>
          {falsePrecision ? (
            <p className="mt-1 text-xs text-slate-600">
              “{falsePrecision.text}” <SourceNote {...falsePrecision.source} compact />
            </p>
          ) : null}
        </div>
        <RiskLegend />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">
              Current and target risk rating of each dimension, grouped by core risk area.
            </caption>
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <th scope="col" className="py-2 pr-3">
                  Dimension
                </th>
                <th scope="col" className="py-2 pr-3">
                  Current
                </th>
                <th scope="col" className="py-2 pr-3">
                  Target
                </th>
                <th scope="col" className="py-2">
                  Planned action
                </th>
              </tr>
            </thead>
            {start.byArea.map(({ area, tally, outcomes }) => (
              <tbody key={area.id}>
                <tr className="bg-slate-50">
                  <th scope="rowgroup" colSpan={4} className="px-2 py-2 text-left">
                    <span className="font-semibold">
                      {area.id}. {area.name}
                    </span>{' '}
                    <RiskTallyBar tally={tally} className="ml-2 align-middle" />
                  </th>
                </tr>
                {outcomes.map((o) => {
                  const target = targetById.get(o.dimension.id)!;
                  return (
                    <tr key={o.dimension.id} className="border-b border-slate-100 align-top">
                      <th scope="row" className="py-2 pr-3 font-normal">
                        <span className="mr-2 font-mono text-xs text-slate-600">
                          {o.dimension.id}
                        </span>
                        {o.dimension.title}
                      </th>
                      <td className="py-2 pr-3">
                        <RiskGlyph rating={o.rating} withLabel />
                        {o.conservativeReason ? (
                          <span className="block text-xs text-amber-800">counted as High</span>
                        ) : null}
                      </td>
                      <td className="py-2 pr-3">
                        <RiskGlyph rating={target.rating} withLabel />
                        {target.inherited ? (
                          <span className="block text-xs text-slate-500">same as current</span>
                        ) : target.reducesRisk ? (
                          <span className="block text-xs text-emerald-800">planned reduction</span>
                        ) : null}
                        {target.conservativeReason ? (
                          <span className="block text-xs text-amber-800">counted as High</span>
                        ) : null}
                      </td>
                      <td className="py-2 text-xs text-slate-700">{o.plannedAction ?? ''}</td>
                    </tr>
                  );
                })}
              </tbody>
            ))}
          </table>
        </div>
      </section>

      <section className="card space-y-3">
        <h2 className="text-lg font-semibold">Flags</h2>
        <h3 className="text-sm font-semibold text-slate-600">Current ratings</h3>
        <FlagList flags={start.flags} />
        <h3 className="text-sm font-semibold text-slate-600">Targets</h3>
        <FlagList flags={end.flags} />
      </section>

      <section className="card space-y-3">
        <h2 className="text-lg font-semibold">How the number is read</h2>
        <p className="text-sm text-slate-700">
          The source tallies the Medium- and High-risk dimensions and reads the ARL from its look-up
          table. This tool uses the table exactly as printed.
        </p>
        <ArlLookupGrid
          framework={framework}
          marks={[
            {
              medium: start.tally.Medium,
              high: start.tally.High,
              label: 'Start',
              style: 'solid',
            },
            { medium: end.tally.Medium, high: end.tally.High, label: 'Target', style: 'dashed' },
          ]}
        />
        {powerLaw ? (
          <p className="text-xs text-slate-600">
            “{powerLaw.text}” <SourceNote {...powerLaw.source} compact />
          </p>
        ) : null}
        {modify ? (
          <p className="text-xs text-slate-600">
            “{modify.text}” This tool does not: every result uses the printed table, so results stay
            comparable.
          </p>
        ) : null}
      </section>

      {call && 'missing' in call ? (
        <Callout tone="warning">
          This session names the call profile “{call.missing}”, which this version of the app does
          not include.
        </Callout>
      ) : null}

      {call && !('missing' in call) ? (
        <section className="card space-y-4" aria-labelledby="call-heading">
          <div>
            <h2 id="call-heading" className="text-lg font-semibold">
              {call.profile.name}
            </h2>
            <p className="mt-1 text-sm text-slate-600">{call.profile.description}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="text-left text-sm" data-testid="title-page-block">
              <caption className="mb-2 text-left text-xs text-slate-600">
                The four numbers the title page asks for (Appendix C).
              </caption>
              <tbody>
                <tr>
                  <th scope="row" className="py-1 pr-4 font-medium">
                    ARL Start
                  </th>
                  <td className="py-1 pr-4 text-lg font-semibold">{start.arl}</td>
                  <td className="py-1 text-xs text-slate-600">From the current ratings.</td>
                </tr>
                <tr>
                  <th scope="row" className="py-1 pr-4 font-medium">
                    ARL End
                  </th>
                  <td className="py-1 pr-4 text-lg font-semibold">{end.arl}</td>
                  <td className="py-1 text-xs text-slate-600">{ARL_TARGET_LABEL}.</td>
                </tr>
                <tr>
                  <th scope="row" className="py-1 pr-4 font-medium">
                    TRL Start
                  </th>
                  <td className="py-1 pr-4 text-lg font-semibold">
                    {call.trlStart.value === null ? '—' : formatTrl(call.trlStart.value)}
                  </td>
                  <td className="py-1 text-xs text-slate-600">{call.trlStart.label}.</td>
                </tr>
                <tr>
                  <th scope="row" className="py-1 pr-4 font-medium">
                    TRL End
                  </th>
                  <td className="py-1 pr-4 text-lg font-semibold">
                    {arl.call?.trlEnd ? `TRL ${arl.call.trlEnd}` : '—'}
                  </td>
                  <td className="py-1 text-xs text-slate-600">
                    {arl.call?.trlEnd
                      ? 'Your stated target.'
                      : 'Not set — add it in the scope step.'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-slate-700" data-testid="check-summary">
            {call.counts.Pass} pass · {call.counts.Fail} fail · {call.counts.Warning} warning ·{' '}
            {call.counts['Not evaluated']} not evaluated
          </p>
          <ul className="space-y-2">
            {call.outcomes.map((o) => (
              <CheckRow key={o.check.id} outcome={o} />
            ))}
          </ul>
          <p className="text-xs text-slate-500">{call.profile.note}</p>
        </section>
      ) : null}

      <section
        className="card border-amber-200 bg-amber-50"
        aria-label="Result label and disclaimer"
      >
        <p className="text-sm font-semibold text-amber-900">{ARL_LABEL}</p>
        <p className="mt-2 text-xs text-amber-900/90">{ARL_DISCLAIMER}</p>
        <p className="mt-2 text-xs text-amber-900/90">{framework.disclaimer}</p>
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
          <Link className="btn-secondary" to="/arl/rate">
            Back to the ratings
          </Link>
          <Link className="btn-secondary" to="/guide/arl">
            How ARL is scored
          </Link>
        </div>
        {error ? (
          <p role="alert" className="mt-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}
        <p className="mt-3 text-xs text-slate-500">
          The JSON file restores the whole session, TRL and ARL. The workbook is a static snapshot —
          editing it does not recompute the ARL.
        </p>
      </section>
    </div>
  );
}
