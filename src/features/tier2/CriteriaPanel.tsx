import { useMemo, useState } from 'react';
import { useSessionStore } from '@/state/sessionStore';
import { evaluateCte, type LevelOutcome } from '@/domain/tier2';
import { formatTrl } from '@/domain/tier1';
import { Callout, MandatoryBadge, OriginBadge, SourceNote } from '@/components/ui';
import { CRITERION_STATUSES, type CriterionStatus, type Cte } from '@/domain/schemas';

interface Props {
  cte: Cte;
  onOpenEvidence: (criterionId: string) => void;
}

export function CriteriaPanel({ cte, onOpenEvidence }: Props) {
  const framework = useSessionStore((s) => s.framework);
  const session = useSessionStore((s) => s.session);
  const setAssessment = useSessionStore((s) => s.setAssessment);
  const tier2 = session.tier2;

  const result = useMemo(
    () => evaluateCte(framework, cte, tier2?.assessments ?? [], tier2?.evidence ?? []),
    [framework, cte, tier2],
  );

  const [open, setOpen] = useState<number[]>(() => [Math.min(9, result.trl + 1)]);
  const toggle = (level: number) =>
    setOpen((prev) => (prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]));

  const assessmentFor = (criterionId: string) =>
    tier2?.assessments.find((a) => a.cteId === cte.id && a.criterionId === criterionId);

  return (
    <section aria-label={`Criteria for ${cte.name}`} className="space-y-3">
      <header className="card">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-lg font-semibold">
            <span className="font-mono text-xs text-slate-500">{cte.id}</span> {cte.name}
          </h2>
          <p className="text-sm">
            Assessed: <strong>{formatTrl(result.trl)}</strong>
            {cte.targetTrl ? (
              <span className="text-slate-500"> · target TRL {cte.targetTrl}</span>
            ) : null}
          </p>
        </div>
        {cte.whyCritical ? (
          <p className="mt-1 text-sm text-slate-600">Why critical: {cte.whyCritical}</p>
        ) : null}
        <p className="mt-1 text-xs text-slate-500">
          Next level ({result.nextLevel ?? '—'}) completeness: {result.nextLevelCompletenessPct}% ·
          evidence coverage {result.evidenceCoveragePct}%
        </p>
      </header>

      {result.levels.map((level) => (
        <LevelAccordion
          key={level.level}
          level={level}
          expanded={open.includes(level.level)}
          onToggle={() => toggle(level.level)}
        >
          <ul className="divide-y divide-slate-100">
            {level.applicable.map((outcome) => {
              const assessment = assessmentFor(outcome.criterion.id);
              const status: CriterionStatus = outcome.status;
              const needsJustification = status === 'N/A' && !assessment?.justification?.trim();
              return (
                <li key={outcome.criterion.id} className="py-3">
                  <div className="flex flex-wrap items-start gap-2">
                    <span className="font-mono text-xs text-slate-500">{outcome.criterion.id}</span>
                    <OriginBadge origin={outcome.criterion.origin} />
                    <MandatoryBadge
                      mandatory={outcome.criterion.mandatory}
                      basis={outcome.criterion.mandatoryBasis}
                    />
                    <span
                      className={`badge ${
                        outcome.satisfied
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                          : 'border-slate-200 bg-white text-slate-500'
                      }`}
                    >
                      {outcome.satisfied ? 'satisfied' : 'not satisfied'}
                    </span>
                  </div>
                  <p className="mt-1 text-sm">{outcome.criterion.text}</p>
                  {outcome.criterion.guidance ? (
                    <details className="mt-1 text-xs text-slate-600">
                      <summary className="cursor-pointer text-brand-700">Guidance</summary>
                      <p className="mt-1">{outcome.criterion.guidance}</p>
                      {outcome.criterion.rationale ? (
                        <p className="mt-1">
                          <strong>Rationale for this tailored item:</strong>{' '}
                          {outcome.criterion.rationale}
                        </p>
                      ) : null}
                    </details>
                  ) : null}
                  <p className="mt-1">
                    <SourceNote {...outcome.criterion.source} />
                  </p>

                  <div className="mt-2 grid gap-2 sm:grid-cols-[12rem_1fr]">
                    <label className="text-xs">
                      <span className="mb-1 block font-medium text-slate-600">Status</span>
                      <select
                        className="input"
                        aria-label={`Status for ${outcome.criterion.id}`}
                        value={status}
                        onChange={(e) =>
                          setAssessment({
                            cteId: cte.id,
                            criterionId: outcome.criterion.id,
                            status: e.target.value as CriterionStatus,
                            ...(assessment?.justification
                              ? { justification: assessment.justification }
                              : {}),
                            ...(assessment?.note ? { note: assessment.note } : {}),
                          })
                        }
                      >
                        {CRITERION_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </label>

                    <div className="space-y-2">
                      {status === 'N/A' ? (
                        <label className="block text-xs">
                          <span className="mb-1 block font-medium text-slate-600">
                            Justification (required for N/A)
                          </span>
                          <input
                            className="input"
                            aria-label={`Justification for ${outcome.criterion.id}`}
                            value={assessment?.justification ?? ''}
                            onChange={(e) =>
                              setAssessment({
                                cteId: cte.id,
                                criterionId: outcome.criterion.id,
                                status: 'N/A',
                                justification: e.target.value,
                                ...(assessment?.note ? { note: assessment.note } : {}),
                              })
                            }
                          />
                        </label>
                      ) : null}

                      <label className="block text-xs">
                        <span className="mb-1 block font-medium text-slate-600">Assessor note</span>
                        <input
                          className="input"
                          aria-label={`Note for ${outcome.criterion.id}`}
                          value={assessment?.note ?? ''}
                          onChange={(e) =>
                            setAssessment({
                              cteId: cte.id,
                              criterionId: outcome.criterion.id,
                              status,
                              ...(assessment?.justification
                                ? { justification: assessment.justification }
                                : {}),
                              note: e.target.value,
                            })
                          }
                        />
                      </label>

                      <div className="flex flex-wrap items-center gap-1 text-xs">
                        <span className="font-medium text-slate-600">Evidence:</span>
                        {outcome.evidenceIds.length ? (
                          outcome.evidenceIds.map((id) => (
                            <span
                              key={id}
                              className="badge border-slate-300 bg-slate-50 font-mono text-slate-700"
                            >
                              {id}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-500">none linked</span>
                        )}
                        <button
                          type="button"
                          className="underline"
                          onClick={() => onOpenEvidence(outcome.criterion.id)}
                        >
                          Manage
                        </button>
                      </div>
                    </div>
                  </div>

                  {needsJustification ? (
                    <p className="mt-2">
                      <Callout tone="warning">
                        “N/A” needs a justification before it counts as satisfied.
                      </Callout>
                    </p>
                  ) : null}
                  {outcome.warning && !needsJustification ? (
                    <p className="mt-2">
                      <Callout tone={outcome.missingEvidence ? 'danger' : 'warning'}>
                        {outcome.warning}
                      </Callout>
                    </p>
                  ) : null}
                </li>
              );
            })}
            {level.applicable.length === 0 ? (
              <li className="py-3 text-sm text-slate-500">
                No criteria in this framework apply to a CTE of kind “{cte.kind ?? 'unspecified'}”
                at this level.
              </li>
            ) : null}
          </ul>
        </LevelAccordion>
      ))}
    </section>
  );
}

function LevelAccordion({
  level,
  expanded,
  onToggle,
  children,
}: {
  level: LevelOutcome;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="card p-0">
      <h3>
        <button
          type="button"
          className="flex w-full flex-wrap items-center gap-2 p-3 text-left"
          aria-expanded={expanded}
          onClick={onToggle}
        >
          <span className="text-sm font-semibold">TRL {level.level}</span>
          <span
            className={`badge ${
              level.achieved
                ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                : 'border-slate-300 bg-slate-50 text-slate-600'
            }`}
          >
            {level.achieved ? 'achieved' : 'not achieved'}
          </span>
          {level.locked ? (
            <span
              className="badge border-amber-300 bg-amber-50 text-amber-800"
              title="A lower level is not achieved, so this level cannot count yet."
            >
              locked — lower level not achieved
            </span>
          ) : null}
          {level.flag ? (
            <span className="badge border-violet-300 bg-violet-50 text-violet-800">
              {level.flag}
            </span>
          ) : null}
          <span className="ml-auto text-xs text-slate-500">
            {level.completenessPct}% complete · {level.applicable.length} criteria
          </span>
          <span aria-hidden="true" className="text-slate-400">
            {expanded ? '▾' : '▸'}
          </span>
        </button>
      </h3>
      {expanded ? <div className="border-t border-slate-100 px-3 pb-3">{children}</div> : null}
    </div>
  );
}
