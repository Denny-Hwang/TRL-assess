import { useSessionStore } from '@/state/sessionStore';
import { useT } from '@/i18n/store';

export function SaveIndicator() {
  const saveState = useSessionStore((s) => s.saveState);
  const saveError = useSessionStore((s) => s.saveError);
  const { t } = useT();

  const text =
    saveState === 'error'
      ? t('save.error')
      : saveState === 'saving'
        ? t('save.saving')
        : saveState === 'saved'
          ? t('save.saved')
          : t('save.idle');

  return (
    <p
      className={`text-xs ${saveState === 'error' ? 'text-red-700' : 'text-slate-500'}`}
      aria-live="polite"
      data-testid="save-indicator"
    >
      {text}
      {saveState === 'error' && saveError ? ` — ${saveError}` : ''}
    </p>
  );
}
