import { useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { QuickContext } from './QuickContext';
import { QuickQuestions } from './QuickQuestions';
import { QuickResult } from './QuickResult';
import { useSessionStore } from '@/state/sessionStore';
import { useT } from '@/i18n/store';

function ResetButton() {
  const resetSession = useSessionStore((s) => s.resetSession);
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);
  const { t } = useT();

  if (!confirming) {
    return (
      <button type="button" className="btn-danger" onClick={() => setConfirming(true)}>
        {t('tier1.reset.button')}
      </button>
    );
  }
  return (
    <span className="inline-flex items-center gap-2 text-sm">
      {t('tier1.reset.confirm')}
      <button
        type="button"
        className="btn-danger"
        onClick={() => {
          resetSession();
          setConfirming(false);
          navigate('/quick');
        }}
      >
        {t('tier1.reset.yes')}
      </button>
      <button type="button" className="btn-secondary" onClick={() => setConfirming(false)}>
        {t('tier1.reset.cancel')}
      </button>
    </span>
  );
}

export function QuickPage() {
  return (
    <div>
      <div className="mb-4 flex justify-end">
        <ResetButton />
      </div>
      <Routes>
        <Route index element={<QuickContext />} />
        <Route path="questions" element={<QuickQuestions />} />
        <Route path="result" element={<QuickResult />} />
      </Routes>
    </div>
  );
}
