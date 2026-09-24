import { TRL_LEVELS, type AnswerValue, type TrlLevel } from '@/domain/schemas';
import type { MessageKey } from '@/i18n/en';
import { useT } from '@/i18n/store';
import { trlText } from '@/i18n/domainText';
import { VIZ } from './tokens';

const MARK: Record<AnswerValue, { fill: string; letter: string; word: MessageKey }> = {
  Yes: { fill: VIZ.brand, letter: 'Y', word: 'tier1.rail.yes' },
  No: { fill: VIZ.neutral.empty, letter: 'N', word: 'tier1.rail.no' },
  Unsure: { fill: VIZ.status.warning, letter: 'U', word: 'tier1.rail.unsure' },
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
  label,
}: {
  answers: Partial<Record<TrlLevel, AnswerValue>>;
  current?: TrlLevel;
  onSelect: (level: TrlLevel) => void;
  label?: string;
}) {
  const tr = useT();
  const { t } = tr;
  let contiguous = 0;
  for (const level of TRL_LEVELS) {
    if (answers[level] === 'Yes') contiguous = level;
    else break;
  }

  return (
    <ul className="flex gap-1" aria-label={label ?? t('tier1.rail.label')}>
      {TRL_LEVELS.map((level) => {
        const answer = answers[level];
        const mark = answer ? MARK[answer] : undefined;
        const inChain = level <= contiguous;
        const isCurrent = current === level;
        const item = t('tier1.rail.item', {
          trl: trlText(tr, level),
          state: t(mark ? mark.word : 'tier1.rail.notAnswered'),
        });
        return (
          <li key={level} className="flex-1">
            <button
              type="button"
              onClick={() => onSelect(level)}
              aria-current={isCurrent ? 'step' : undefined}
              title={item}
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
                {t(inChain ? 'tier1.rail.goInChain' : 'tier1.rail.go', { item })}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
