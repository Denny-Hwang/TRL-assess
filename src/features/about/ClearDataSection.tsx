import { useState } from 'react';
import { useSessionStore } from '@/state/sessionStore';
import { useT } from '@/i18n/store';

/** Removes the session and every stored evidence file from this browser, after a confirmation. */
export function ClearDataSection() {
  const { t } = useT();
  const clearEverything = useSessionStore((s) => s.clearEverything);
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(false);

  return (
    <section className="card">
      <h2 className="text-lg font-semibold">{t('about.data.heading')}</h2>
      <p className="mt-2 text-sm text-slate-600">{t('about.data.body')}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
        {confirming ? (
          <>
            <span>{t('about.data.confirm')}</span>
            <button
              type="button"
              className="btn-danger"
              onClick={async () => {
                await clearEverything();
                setConfirming(false);
                setDone(true);
              }}
            >
              {t('about.data.yes')}
            </button>
            <button type="button" className="btn-secondary" onClick={() => setConfirming(false)}>
              {t('about.data.cancel')}
            </button>
          </>
        ) : (
          <button
            type="button"
            className="btn-danger"
            onClick={() => {
              setDone(false);
              setConfirming(true);
            }}
          >
            {t('about.data.clear')}
          </button>
        )}
      </div>
      <p className="mt-2 text-sm text-slate-600" role="status">
        {done ? t('about.data.done') : ''}
      </p>
    </section>
  );
}
