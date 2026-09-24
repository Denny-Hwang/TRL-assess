import { useMemo } from 'react';
import { DEFAULT_ARL_FRAMEWORK } from '@/config/app.config';
import { listCallProfiles, loadArlFramework } from '@/domain/arl';
import type { ArlFramework } from '@/domain/schemas';
import { useSessionStore } from '@/state/sessionStore';

/** The rubric the session's ARL block was rated against — the default one for a new block. */
export function useArlFramework(): { framework: ArlFramework | null; error: string | null } {
  const id = useSessionStore((s) => s.session.arl?.frameworkId) ?? DEFAULT_ARL_FRAMEWORK;
  return useMemo(() => {
    try {
      return { framework: loadArlFramework(id), error: null };
    } catch (e) {
      return {
        framework: null,
        error: `This session was rated against the ARL rubric "${id}", which this version of the app does not include (${
          e instanceof Error ? e.message : String(e)
        }). Reset the ARL ratings to start again with the current rubric.`,
      };
    }
  }, [id]);
}

export function useCallProfiles() {
  return useMemo(() => listCallProfiles(), []);
}
