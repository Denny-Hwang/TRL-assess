/**
 * Scoring messages in the reader's language. The domain returns codes and values; these helpers
 * turn them into sentences, so the engine stays language-free and every page and workbook says the
 * same thing.
 */
import { APP_NAME } from '@/config/app.config';
import type { ArlFlag } from '@/domain/arl';
import type { ArlRating, CriterionStatus } from '@/domain/schemas';
import type { Tier1Flag, TrlScore } from '@/domain/tier1';
import type { CriterionOutcome, GapItem, TierDelta } from '@/domain/tier2';
import type { MessageKey } from './en';
import type { Translator } from './translate';

export function trlText(tr: Translator, score: TrlScore | number): string {
  return score <= 0 ? tr.t('trl.belowOne') : tr.t('trl.level', { level: score });
}

export function levelsText(tr: Translator, levels: readonly number[] = []): string {
  return levels.map((l) => trlText(tr, l)).join(', ');
}

export function tier1FlagText(tr: Translator, flag: Tier1Flag): string {
  if (flag.code === 'gap') return tr.t('tier1.flag.gap', { levels: levelsText(tr, flag.levels) });
  if (flag.code === 'unsure') {
    return tr.t('tier1.flag.unsure', { levels: levelsText(tr, flag.levels) });
  }
  return tr.t('tier1.flag.noAnswers');
}

export function criterionWarningText(tr: Translator, o: CriterionOutcome): string | undefined {
  if (!o.warning) return undefined;
  if (o.status === 'N/A') return tr.t('tier2.warn.naNoJustification');
  return tr.t(
    o.criterion.mandatory
      ? 'tier2.warn.metNoEvidenceMandatory'
      : 'tier2.warn.metNoEvidenceOptional',
  );
}

export function gapReasonText(tr: Translator, gap: Pick<GapItem, 'status'>): string {
  return tr.t(`tier2.reason.${gap.status}` as MessageKey);
}

export function deltaText(tr: Translator, delta: TierDelta): string | undefined {
  if (!delta.significant || delta.delta === null) return undefined;
  return tr.t(delta.delta < 0 ? 'tier2.delta.lower' : 'tier2.delta.higher');
}

export function statusText(tr: Translator, status: CriterionStatus | 'Satisfied'): string {
  return tr.t(`status.${status}` as MessageKey);
}

export function ratingText(tr: Translator, rating: ArlRating): string {
  return tr.t(`rating.${rating}` as MessageKey);
}

export function arlReasonText(
  tr: Translator,
  rating: ArlRating,
  reason?: string,
): string | undefined {
  if (!reason) return undefined;
  return tr.t(`arl.reason.${rating}` as MessageKey);
}

const ARL_FLAG_KEY: Record<ArlFlag['code'], MessageKey> = {
  unsure: 'arl.flag.unsure',
  'not-assessed': 'arl.flag.notAssessed',
  'na-without-rationale': 'arl.flag.naWithoutRationale',
  'no-rationale': 'arl.flag.noRationale',
  'no-plan': 'arl.flag.noPlan',
};

export function arlFlagText(tr: Translator, flag: ArlFlag, total: number): string {
  return tr.t(ARL_FLAG_KEY[flag.code], {
    ids: flag.dimensionIds.join(', '),
    count: flag.dimensionIds.length,
    total,
  });
}

export function disclaimerText(tr: Translator, which: 'trl' | 'arl' = 'trl'): string {
  return tr.t(which === 'arl' ? 'disclaimer.arl' : 'disclaimer.trl', { app: APP_NAME });
}
