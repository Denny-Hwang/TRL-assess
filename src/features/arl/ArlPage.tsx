import { useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { useSessionStore } from '@/state/sessionStore';
import { Callout } from '@/components/ui';
import { useT } from '@/i18n/store';
import { ArlScope } from './ArlScope';
import { ArlRate } from './ArlRate';
import { ArlResultPage } from './ArlResult';
import { useArlFramework } from './useArl';

/** Clears the ARL ratings only; the TRL assessment in the same session is kept. */
function ResetArlButton() {
  const resetArl = useSessionStore((s) => s.resetArl);
  const hasArl = useSessionStore((s) => Boolean(s.session.arl));
  const navigate = useNavigate();
  const { t } = useT();
  const [confirming, setConfirming] = useState(false);

  if (!hasArl) return null;
  if (!confirming) {
    return (
      <button type="button" className="btn-danger" onClick={() => setConfirming(true)}>
        {t('arl.reset.button')}
      </button>
    );
  }
  return (
    <span className="inline-flex items-center gap-2 text-sm">
      {t('arl.reset.confirm')}
      <button
        type="button"
        className="btn-danger"
        onClick={() => {
          resetArl();
          setConfirming(false);
          navigate('/arl');
        }}
      >
        {t('arl.reset.yes')}
      </button>
      <button type="button" className="btn-secondary" onClick={() => setConfirming(false)}>
        {t('arl.reset.cancel')}
      </button>
    </span>
  );
}

export function ArlPage() {
  const { framework, error } = useArlFramework();
  const { t } = useT();
  return (
    <div>
      <div className="mb-4 flex justify-end">
        <ResetArlButton />
      </div>
      {framework ? (
        <Routes>
          <Route index element={<ArlScope framework={framework} />} />
          <Route path="rate" element={<ArlRate framework={framework} />} />
          <Route path="result" element={<ArlResultPage framework={framework} />} />
        </Routes>
      ) : (
        <Callout tone="danger" title={t('arl.unavailable.title')}>
          {error}
        </Callout>
      )}
    </div>
  );
}

export default ArlPage;
