import { TRL_LEVELS, type AnswerValue, type TrlLevel } from '@/domain/schemas';
import { VIZ } from './tokens';

const MARK: Record<AnswerValue, { fill: string; letter: string; word: string }> = {
  Yes: { fill: VIZ.brand, letter: 'Y', word: 'yes' },
  No: { fill: VIZ.neutral.empty, letter: 'N', word: 'no' },
  Unsure: { fill: VIZ.status.warning, letter: 'U', word: 'unsure' },
};

/**
 * The nine screening answers as one rail, TRL 1 → 9. The chain of "Yes" answers from the left is
 * the estimate, so the moment it breaks is visible while answering rather than only on the result
 * page. Each rung carries its letter, so the answer never depends on colour.
 */
export function AnswerRail({
  answers,
  current,
  onSelect,
  label = 'Answers so far, TRL 1 to 9',
}: {
  answers: Partial<Record<TrlLevel, AnswerValue>>;
  current?: TrlLevel;
  onSelect: (level: TrlLevel) => void;
  label?: string;
}) {
  let contiguous = 0;
  for (const level of TRL_LEVELS) {
    if (answers[level] === 'Yes') contiguous = level;
    else break;
  }

  return (
    <ul className="flex gap-1" aria-label={label}>
      {TRL_LEVELS.map((level) => {
        const answer = answers[level];
        const mark = answer ? MARK[answer] : undefined;
        const inChain = level <= contiguous;
        const isCurrent = current === level;
        return (
          <li key={level} className="flex-1">
            <button
              type="button"
              onClick={() => onSelect(level)}
              aria-current={isCurrent ? 'step' : undefined}
              title={`TRL ${level} — ${answer ? mark!.word : 'not answered'}`}
              className="flex w-full flex-col items-center gap-1 rounded py-1 hover:bg-slate-100 focus-visible:bg-slate-100"
            >
              <span
                aria-hidden="true"
                className="flex h-5 w-full items-center justify-center rounded text-[10px] font-semibold"
                style={{
                  background: mark ? mark.fill : VIZ.surface,
                  color: answer === 'Yes' ? '#ffffff' : VIZ.ink.secondary,
                  border: `1px ${answer ? 'solid' : 'dashed'} ${
                    answer === 'Unsure'
                      ? '#b98200'
                      : answer
                        ? 'transparent'
                        : VIZ.neutral.emptyStroke
                  }`,
                  boxShadow: isCurrent ? `inset 0 0 0 2px ${VIZ.ink.primary}` : undefined,
                }}
              >
                {mark?.letter ?? ''}
              </span>
              <span
                aria-hidden="true"
                className={`text-[11px] leading-none ${
                  inChain ? 'font-semibold text-slate-900' : 'text-slate-500'
                }`}
              >
                {level}
              </span>
              <span className="sr-only">
                {`TRL ${level} — ${answer ? mark!.word : 'not answered'}`}
                {inChain ? ', part of the confirmed chain' : ''}. Go to this question.
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
