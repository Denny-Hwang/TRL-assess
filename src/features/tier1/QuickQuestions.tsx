import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useSessionStore } from '@/state/sessionStore';
import { tier1QuestionsTopDown } from '@/domain/frameworks';
import { PageHeader, SourceNote } from '@/components/ui';
import { SaveIndicator } from '@/components/SaveIndicator';
import type { AnswerValue } from '@/domain/schemas';

const VALUES: AnswerValue[] = ['Yes', 'No', 'Unsure'];
const SHORTCUT: Record<string, AnswerValue> = { y: 'Yes', n: 'No', u: 'Unsure' };

export function QuickQuestions() {
  const framework = useSessionStore((s) => s.framework);
  const session = useSessionStore((s) => s.session);
  const setAnswer = useSessionStore((s) => s.setAnswer);
  const navigate = useNavigate();
  const questions = tier1QuestionsTopDown(framework);
  const [index, setIndex] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const answers = useMemo(() => session.tier1?.answers ?? {}, [session.tier1]);
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
      <PageHeader
        title="Quick Estimate — step 2 of 2: screening questions"
        lead="Work from TRL 9 downwards. Answer for the technology as a whole, based on what has actually been done."
      >
        <SaveIndicator />
      </PageHeader>

      <div className="flex items-center gap-3" aria-hidden="true">
        <div className="h-2 flex-1 rounded-full bg-slate-200">
          <div
            className="h-2 rounded-full bg-brand-600 transition-all"
            style={{ width: `${(answeredCount / questions.length) * 100}%` }}
          />
        </div>
        <span className="text-xs text-slate-500">
          {answeredCount} / {questions.length} answered
        </span>
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
            TRL {current.level}
          </h2>
          <span className="text-xs text-slate-500">
            Question {index + 1} of {questions.length}
          </span>
        </div>
        <p className="mt-2 text-lg">{current.text}</p>
        {current.helpText ? (
          <details className="mt-3 text-sm text-slate-600">
            <summary className="cursor-pointer text-brand-700">What this level means</summary>
            <p className="mt-2">{current.helpText}</p>
          </details>
        ) : null}
        <p className="mt-2">
          <SourceNote {...current.source} />
        </p>

        <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Answer">
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
                {value}
                <kbd className="ml-1 rounded border border-current/30 px-1 text-[10px] uppercase">
                  {value[0]}
                </kbd>
              </button>
            );
          })}
        </div>

        <div className="mt-4">
          <label className="label" htmlFor="note">
            Note (optional)
          </label>
          <input
            id="note"
            className="input"
            value={currentAnswer?.note ?? ''}
            placeholder="One line — what makes you answer that way?"
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
          ← Previous
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => move(1)}
          disabled={index === questions.length - 1}
        >
          Next →
        </button>
        <span className="text-xs text-slate-500">
          Keyboard: Y / N / U to answer, arrow keys to move.
        </span>
        <button
          type="button"
          className="btn-primary ml-auto"
          onClick={() => navigate('/quick/result')}
        >
          See the estimate
        </button>
      </div>

      <ol className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-9">
        {questions.map((q, i) => {
          const a = answers[q.id];
          return (
            <li key={q.id}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-current={i === index ? 'step' : undefined}
                className={`w-full rounded border px-2 py-1 text-xs ${
                  i === index ? 'border-brand-600 ring-1 ring-brand-600' : 'border-slate-300'
                } ${a ? 'bg-white font-medium' : 'bg-slate-50 text-slate-500'}`}
              >
                TRL {q.level}
                <span className="block text-[10px]">{a?.value ?? '—'}</span>
              </button>
            </li>
          );
        })}
      </ol>

      <p className="text-xs text-slate-500">
        Not sure what a level means? See the{' '}
        <Link className="underline" to="/guide/overview">
          Guide
        </Link>
        .
      </p>
    </div>
  );
}
