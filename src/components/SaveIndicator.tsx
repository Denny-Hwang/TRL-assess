import { useSessionStore } from '@/state/sessionStore';

export function SaveIndicator() {
  const saveState = useSessionStore((s) => s.saveState);
  const saveError = useSessionStore((s) => s.saveError);

  const text =
    saveState === 'error'
      ? 'Not saved'
      : saveState === 'saving'
        ? 'Saving…'
        : saveState === 'saved'
          ? 'Saved locally'
          : 'No changes yet';

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
