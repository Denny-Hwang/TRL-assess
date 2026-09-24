import { useMemo, useState } from 'react';
import { useSessionStore } from '@/state/sessionStore';
import { evaluateCte, type LevelOutcome } from '@/domain/tier2';
import {
  Callout,
  MandatoryBadge,
  OriginBadge,
  SourceNote,
  SourceText,
  SourceTranslation,
} from '@/components/ui';
import { TrlLadder } from '@/components/viz/TrlLadder';
import { LevelBar, type LevelCounts } from '@/components/viz/LevelBar';
import { Meter } from '@/components/viz/Meter';
import { StatusGlyph } from '@/components/viz/StatusGlyph';
import { criterionWarningText, statusText, trlText } from '@/i18n/domainText';
import type { MessageKey } from '@/i18n/en';
import { useT } from '@/i18n/store';
import { CRITERION_STATUSES, type CriterionStatus, type Cte } from '@/domain/schemas';

interface Props {
  cte: Cte;
  onOpenEvidence: (criterionId: string) => void;
}

export function CriteriaPanel({ cte, onOpenEvidence }: Props) {
  const tr = useT();
  const { t, lang } = tr;
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
    <section aria-label={t('tier2.criteria.aria', { name: cte.name })} className="space-y-3">
      <header className="card">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-lg font-semibold">
            <span className="font-mono text-xs text-slate-500">{cte.id}</span> {cte.name}
          </h2>
          <p className="text-sm">
            {t('tier2.criteria.assessed')} <strong>{trlText(tr, result.trl)}</strong>
            {cte.targetTrl ? (
              <span className="text-slate-500">
                {' · '}
                {t('tier2.cte.target', { level: cte.targetTrl })}
              </span>
            ) : null}
          </p>
        </div>
        {cte.whyCritical ? (
          <p className="mt-1 text-sm text-slate-600">
            {t('tier2.criteria.why', { text: cte.whyCritical })}
          </p>
        ) : null}
        <div className="mt-3">
          <TrlLadder
            achieved={result.trl}
            current={result.nextLevel}
            onSelect={(level) =>
              setOpen((prev) => (prev.includes(level) ? prev : [...prev, level]))
            }
            label={t('tier2.criteria.ladder', { name: cte.name, trl: result.trl })}
          />
        </div>
        <dl className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <dt>{t('tier2.criteria.levelComplete', { level: result.nextLevel ?? '—' })}</dt>
            <dd>
              <Meter
                value={result.nextLevelCompletenessPct}
                label={t('tier2.criteria.levelCompleteness', { level: result.nextLevel ?? '' })}
              />
            </dd>
          </div>
          <div className="flex items-center gap-2">
            <dt>{t('tier2.evidenceCoverage')}</dt>
            <dd>
              <Meter
                value={result.evidenceCoveragePct}
                label={t('tier2.evidenceCoverage')}
                tone="good"
              />
            </dd>
          </div>
        </dl>
      </header>

      {lang !== 'en' ? <p className="text-xs text-slate-500">{t('sourceText.note')}</p> : null}

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
                    <span className="inline-flex items-center gap-1">
                      <StatusGlyph
                        kind={outcome.satisfied ? 'Satisfied' : outcome.status}
                        size={14}
                      />
                      <span className="text-xs text-slate-600">
                        {t(
                          `tier2.criteria.inline.${outcome.satisfied ? 'Satisfied' : outcome.status}` as MessageKey,
                        )}
                      </span>
                    </span>
                  </div>
                  <p className="mt-1 text-sm">
                    <SourceText text={outcome.criterion.text} />
                  </p>
                  {outcome.criterion.guidance ? (
                    <details className="mt-1 text-xs text-slate-600">
                      <summary className="cursor-pointer text-brand-700">
                        {t('tier2.criteria.guidance')}
                      </summary>
                      <p className="mt-1">
                        <SourceText text={outcome.criterion.guidance} />
                      </p>
                      {outcome.criterion.rationale ? (
                        <p className="mt-1">
                          <strong>{t('tier2.criteria.rationale')}</strong>{' '}
                          {outcome.criterion.rationale}
                          <SourceTranslation text={outcome.criterion.rationale} />
                        </p>
                      ) : null}
                    </details>
                  ) : null}
                  <p className="mt-1">
                    <SourceNote {...outcome.criterion.source} />
                  </p>

                  <div className="mt-2 grid gap-2 sm:grid-cols-[12rem_1fr]">
                    <label className="text-xs">
                      <span className="mb-1 block font-medium text-slate-600">
                        {t('tier2.criteria.status')}
                      </span>
                      <select
                        className="input"
                        aria-label={t('tier2.criteria.statusAria', { id: outcome.criterion.id })}
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
                            {statusText(tr, s)}
                          </option>
                        ))}
                      </select>
                    </label>

                    <div className="space-y-2">
                      {status === 'N/A' ? (
                        <label className="block text-xs">
                          <span className="mb-1 block font-medium text-slate-600">
                            {t('tier2.criteria.justification')}
                          </span>
                          <input
                            className="input"
                            aria-label={t('tier2.criteria.justificationAria', {
                              id: outcome.criterion.id,
                            })}
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
                        <span className="mb-1 block font-medium text-slate-600">
                          {t('tier2.criteria.note')}
                        </span>
                        <input
                          className="input"
                          aria-label={t('tier2.criteria.noteAria', { id: outcome.criterion.id })}
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
                        <span className="font-medium text-slate-600">
                          {t('tier2.criteria.evidence')}
                        </span>
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
                          <span className="text-slate-500">{t('tier2.criteria.noEvidence')}</span>
                        )}
                        <button
                          type="button"
                          className="underline"
                          onClick={() => onOpenEvidence(outcome.criterion.id)}
                        >
                          {t('tier2.criteria.manage')}
                        </button>
                      </div>
                    </div>
                  </div>

                  {needsJustification ? (
                    <p className="mt-2">
                      <Callout tone="warning">{t('tier2.criteria.naWarning')}</Callout>
                    </p>
                  ) : null}
                  {outcome.warning && !needsJustification ? (
                    <p className="mt-2">
                      <Callout tone={outcome.missingEvidence ? 'danger' : 'warning'}>
                        {criterionWarningText(tr, outcome)}
                      </Callout>
                    </p>
                  ) : null}
                </li>
              );
            })}
            {level.applicable.length === 0 ? (
              <li className="py-3 text-sm text-slate-500">
                {t('tier2.criteria.noneApply', {
                  kind: cte.kind ? t(`kind.${cte.kind}` as MessageKey) : t('tier2.cte.unspecified'),
                })}
              </li>
            ) : null}
          </ul>
        </LevelAccordion>
      ))}
    </section>
  );
}

function countOutcomes(level: LevelOutcome): LevelCounts {
  const counts: LevelCounts = { satisfied: 0, partial: 0, notMet: 0, na: 0, notAssessed: 0 };
  for (const outcome of level.applicable) {
    if (outcome.satisfied) counts.satisfied += 1;
    else if (outcome.status === 'Partially met') counts.partial += 1;
    else if (outcome.status === 'Not met' || outcome.status === 'Met') counts.notMet += 1;
    else if (outcome.status === 'N/A') counts.na += 1;
    else counts.notAssessed += 1;
  }
  return counts;
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
  const tr = useT();
  const { t } = tr;
  return (
    <div className="card p-0">
      <h3>
        <button
          type="button"
          className="flex w-full flex-wrap items-center gap-2 p-3 text-start"
          aria-expanded={expanded}
          onClick={onToggle}
        >
          <span className="text-sm font-semibold">{trlText(tr, level.level)}</span>
          <span
            className={`badge ${
              level.achieved
                ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                : 'border-slate-300 bg-slate-50 text-slate-600'
            }`}
          >
            {level.achieved
              ? t('tier2.criteria.level.achieved')
              : t('tier2.criteria.level.notAchieved')}
          </span>
          {level.locked ? (
            <span
              className="badge border-amber-300 bg-amber-50 text-amber-800"
              title={t('tier2.criteria.level.lockedTitle')}
            >
              {t('tier2.criteria.level.locked')}
            </span>
          ) : null}
          {level.flag ? (
            <span className="badge border-violet-300 bg-violet-50 text-violet-800">
              {t('tier2.noMandatory')}
            </span>
          ) : null}
          <span className="ms-auto">
            <LevelBar counts={countOutcomes(level)} />
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
