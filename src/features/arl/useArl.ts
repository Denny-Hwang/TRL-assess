import { useMemo } from 'react';
import { DEFAULT_ARL_FRAMEWORK } from '@/config/app.config';
import { loadArlFramework } from '@/domain/arl';
import type { ArlFramework } from '@/domain/schemas';
import { useSessionStore } from '@/state/sessionStore';
import { useT } from '@/i18n/store';

/** The rubric the session's ARL block was rated against — the default one for a new block. */
export function useArlFramework(): { framework: ArlFramework | null; error: string | null } {
  const id = useSessionStore((s) => s.session.arl?.frameworkId) ?? DEFAULT_ARL_FRAMEWORK;
  const { t } = useT();
  return useMemo(() => {
    try {
      return { framework: loadArlFramework(id), error: null };
    } catch (e) {
      return {
        framework: null,
        error: t('arl.unavailable.body', {
          id,
          detail: e instanceof Error ? e.message : String(e),
        }),
      };
    }
  }, [id, t]);
}
