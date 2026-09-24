import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useSessionStore } from '@/state/sessionStore';
import { tier1QuestionsTopDown } from '@/domain/frameworks';
import { PageHeader, SourceNote } from '@/components/ui';
import { AnswerRail } from '@/components/viz/AnswerRail';
import { SaveIndicator } from '@/components/SaveIndicator';
import type { AnswerValue, TrlLevel } from '@/domain/schemas';
import { useT } from '@/i18n/store';
import { trlText } from '@/i18n/domainText';

const VALUES: AnswerValue[] = ['Yes', 'No', 'Unsure'];
const SHORTCUT: Record<string, AnswerValue> = { y: 'Yes', n: 'No', u: 'Unsure' };

export function QuickQuestions() {
  const framework = useSessionStore((s) => s.framework);
  const session = useSessionStore((s) => s.session);
  const setAnswer = useSessionStore((s) => s.setAnswer);
  const navigate = useNavigate();
  const tr = useT();
  const { t, lang } = tr;
  const questions = tier1QuestionsTopDown(framework);
  const [index, setIndex] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const answers = useMemo(() => session.tier1?.answers ?? {}, [session.tier1]);
  const byLevel = useMemo(() => {
    const map: Partial<Record<TrlLevel, AnswerValue>> = {};
    for (const q of questions) {
      const answer = answers[q.id];
      if (answer) map[q.level] = answer.value;
    }
    return map;
  }, [answers, questions]);
  const answeredCount = questions.filter((q) => answers[q.id]).length;
  const current = questions[index];

  const move = useCallback(
    (delta: number) => setIndex((i) => Math.min(questions.length - 1, Math.max(0, i + delta))),
    [questions.length],
  );

  const answer = useCallback(
    (value: AnswerValue) => {
      if (!current) return;
      setAnswer(current.id, { value, note: answers[current.id]?.note ?? '' });
      if (index < questions.length - 1) setIndex(index + 1);
    },
    [answers, current, index, questions.length, setAnswer],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
      const shortcut = SHORTCUT[e.key.toLowerCase()];
      if (shortcut) {
        e.preventDefault();
        answer(shortcut);
        return;
      }
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        move(1);
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        move(-1);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [answer, move]);

  useEffect(() => {
    cardRef.current?.focus();
  }, [index]);

  if (!session.tier1) return <Navigate to="/quick" replace />;
  if (!current) return null;

  const currentAnswer = answers[current.id];

  return (
    <div className="max-w-3xl space-y-5">
      <PageHeader title={t('tier1.q.title')} lead={t('tier1.q.lead')}>
        <SaveIndicator />
      </PageHeader>

      <div className="card py-2">
        <AnswerRail
          answers={byLevel}
          current={current.level}
          onSelect={(level) => setIndex(questions.findIndex((q) => q.level === level))}
        />
        <p className="mt-1 text-center text-xs text-slate-500">
          {t('tier1.q.progress.before', { answered: answeredCount, total: questions.length })}
          <strong>Y</strong>
          {t('tier1.q.progress.after')}
        </p>
      </div>

      <div
        className="card focus:outline-none"
        tabIndex={-1}
        ref={cardRef}
        aria-labelledby="question-heading"
      >
        <div className="flex items-baseline justify-between gap-3">
          <h2
            id="question-heading"
            className="text-sm font-semibold uppercase tracking-wide text-brand-700"
          >
            {trlText(tr, current.level)}
          </h2>
          <span className="text-xs text-slate-500">
            {t('tier1.q.counter', { n: index + 1, total: questions.length })}
          </span>
        </div>
        <p className="mt-2 text-lg">{current.text}</p>
        {lang !== 'en' ? (
          <p className="mt-1 text-xs italic text-slate-500">{t('sourceText.note')}</p>
        ) : null}
        {current.helpText ? (
          <details className="mt-3 text-sm text-slate-600">
            <summary className="cursor-pointer text-brand-700">{t('tier1.q.helpSummary')}</summary>
            <p className="mt-2">{current.helpText}</p>
          </details>
        ) : null}
        <p className="mt-2">
          <SourceNote {...current.source} />
        </p>

        <div
          className="mt-4 flex flex-wrap gap-2"
          role="group"
          aria-label={t('tier1.q.answerGroup')}
        >
          {VALUES.map((value) => {
            const selected = currentAnswer?.value === value;
            return (
              <button
                key={value}
                type="button"
                aria-pressed={selected}
                onClick={() => answer(value)}
                className={
                  selected ? 'btn border-brand-600 bg-brand-600 text-white' : 'btn-secondary'
                }
              >
                {t(`answer.${value}`)}
                <kbd className="ms-1 rounded border border-current/30 px-1 text-[10px] uppercase">
                  {value[0]}
                </kbd>
              </button>
            );
          })}
        </div>

        <div className="mt-4">
          <label className="label" htmlFor="note">
            {t('tier1.q.note')}
          </label>
          <input
            id="note"
            className="input"
            value={currentAnswer?.note ?? ''}
            placeholder={t('tier1.q.notePlaceholder')}
            onChange={(e) =>
              setAnswer(current.id, {
                value: currentAnswer?.value ?? 'Unsure',
                note: e.target.value,
              })
            }
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="btn-secondary"
          onClick={() => move(-1)}
          disabled={index === 0}
        >
          {t('tier1.q.previous')}
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => move(1)}
          disabled={index === questions.length - 1}
        >
          {t('tier1.q.next')}
        </button>
        <span className="text-xs text-slate-500">{t('tier1.q.keyboard')}</span>
        <button
          type="button"
          className="btn-primary ms-auto"
          onClick={() => navigate('/quick/result')}
        >
          {t('tier1.q.seeEstimate')}
        </button>
      </div>

      <p className="text-xs text-slate-500">
        {t('tier1.q.guide.before')}
        <Link className="underline" to="/guide/overview">
          {t('tier1.q.guide.link')}
        </Link>
        {t('tier1.q.guide.after')}
      </p>
    </div>
  );
}
