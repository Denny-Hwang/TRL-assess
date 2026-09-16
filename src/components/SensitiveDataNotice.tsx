import { useEffect, useState } from 'react';
import { SENSITIVE_DATA_NOTICE } from '@/config/app.config';

const DISMISS_KEY = 'trl-assess:notice-dismissed';

export function SensitiveDataNotice() {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      setDismissed(sessionStorage.getItem(DISMISS_KEY) === '1');
    } catch {
      setDismissed(false);
    }
  }, []);

  if (dismissed) return null;

  return (
    <div
      role="note"
      className="border-b border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-900"
      data-testid="sensitive-notice"
    >
      <div className="mx-auto flex max-w-6xl items-start gap-3">
        <span aria-hidden="true">⚠️</span>
        <p className="flex-1">{SENSITIVE_DATA_NOTICE}</p>
        <button
          type="button"
          className="shrink-0 rounded border border-amber-400 px-2 py-1 text-xs font-medium hover:bg-amber-100"
          onClick={() => {
            try {
              sessionStorage.setItem(DISMISS_KEY, '1');
            } catch {
              /* storage unavailable — dismiss for this render only */
            }
            setDismissed(true);
          }}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
