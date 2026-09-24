import { useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { useSessionStore } from '@/state/sessionStore';
import { Callout } from '@/components/ui';
import { ArlScope } from './ArlScope';
import { ArlRate } from './ArlRate';
import { ArlResultPage } from './ArlResult';
import { useArlFramework } from './useArl';

/** Clears the ARL ratings only; the TRL assessment in the same session is kept. */
function ResetArlButton() {
  const resetArl = useSessionStore((s) => s.resetArl);
  const hasArl = useSessionStore((s) => Boolean(s.session.arl));
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);

  if (!hasArl) return null;
  if (!confirming) {
    return (
      <button type="button" className="btn-danger" onClick={() => setConfirming(true)}>
        Reset ARL
      </button>
    );
  }
  return (
    <span className="inline-flex items-center gap-2 text-sm">
      Discard the ARL ratings? The TRL assessment is kept.
      <button
        type="button"
        className="btn-danger"
        onClick={() => {
          resetArl();
          setConfirming(false);
          navigate('/arl');
        }}
      >
        Yes, reset ARL
      </button>
      <button type="button" className="btn-secondary" onClick={() => setConfirming(false)}>
        Cancel
      </button>
    </span>
  );
}

export function ArlPage() {
  const { framework, error } = useArlFramework();
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
        <Callout tone="danger" title="The ARL rubric for this session is not available">
          {error}
        </Callout>
      )}
    </div>
  );
}

export default ArlPage;
