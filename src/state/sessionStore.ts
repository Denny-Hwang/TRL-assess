/**
 * Application state (zustand). Session JSON is persisted to localStorage with a debounce;
 * evidence blobs live in IndexedDB and are never put in this store.
 */
import { create } from 'zustand';
import { AUTOSAVE_DEBOUNCE_MS, DEFAULT_FRAMEWORK } from '@/config/app.config';
import { resolveFramework, type ResolvedFramework } from '@/domain/frameworks';
import {
  addCte as addCteTo,
  addEvidence as addEvidenceTo,
  createSession,
  linkEvidence as linkEvidenceIn,
  removeCte as removeCteFrom,
  removeEvidence as removeEvidenceFrom,
  reorderCtes as reorderCtesIn,
  setAnswer as setAnswerIn,
  setAssessment as setAssessmentIn,
  setGapActions as setGapActionsIn,
  setTier1 as setTier1On,
  unlinkEvidence as unlinkEvidenceIn,
  updateCte as updateCteIn,
  updateEvidence as updateEvidenceIn,
} from '@/domain/session';
import { clearAllLocalData, debounce, loadSession, saveSession } from '@/storage/sessionStore';
import { deleteBlob } from '@/storage/blobStore';
import type {
  AssessmentSession,
  CriterionAssessment,
  Cte,
  EvidenceItem,
  GapAction,
  Tier1Answers,
} from '@/domain/schemas';

export type SaveState = 'idle' | 'saving' | 'saved' | 'error';

interface SessionState {
  session: AssessmentSession;
  framework: ResolvedFramework;
  saveState: SaveState;
  saveError?: string;
  setFramework: (id: string) => void;
  replaceSession: (session: AssessmentSession) => void;
  resetSession: () => void;
  clearEverything: () => Promise<void>;
  setTier1: (tier1: Tier1Answers) => void;
  setAnswer: (questionId: string, value: Tier1Answers['answers'][string]) => void;
  addCte: (cte: Omit<Cte, 'id'>) => void;
  updateCte: (id: string, patch: Partial<Omit<Cte, 'id'>>) => void;
  removeCte: (id: string) => void;
  reorderCtes: (ids: string[]) => void;
  setAssessment: (assessment: CriterionAssessment) => void;
  addEvidence: (evidence: Omit<EvidenceItem, 'id'>) => string;
  updateEvidence: (id: string, patch: Partial<Omit<EvidenceItem, 'id'>>) => void;
  removeEvidence: (id: string) => void;
  linkEvidence: (evidenceId: string, cteId: string, criterionId: string) => void;
  unlinkEvidence: (evidenceId: string, cteId: string, criterionId: string) => void;
  setGapActions: (actions: GapAction[]) => void;
  /** Write any pending autosave immediately (used on page hide). */
  flushSave: () => void;
}

function initialSession(): AssessmentSession {
  const restored = loadSession();
  if (restored) {
    try {
      resolveFramework(restored.frameworkId);
      return restored;
    } catch {
      // The stored framework no longer exists — start fresh rather than crash.
    }
  }
  const framework = resolveFramework(DEFAULT_FRAMEWORK);
  return createSession(DEFAULT_FRAMEWORK, framework.framework.version);
}

export const useSessionStore = create<SessionState>((set, get) => {
  const persist = debounce((session: AssessmentSession) => {
    try {
      saveSession(session);
      set({ saveState: 'saved', saveError: undefined });
    } catch (e) {
      set({ saveState: 'error', saveError: e instanceof Error ? e.message : String(e) });
    }
  }, AUTOSAVE_DEBOUNCE_MS);

  const writeNow = (session: AssessmentSession) => {
    persist.cancel();
    try {
      saveSession(session);
      set({ saveState: 'saved', saveError: undefined });
    } catch (e) {
      set({ saveState: 'error', saveError: e instanceof Error ? e.message : String(e) });
    }
  };

  /**
   * Text edits are debounced; structural changes (adding a CTE, adding or linking evidence,
   * importing a session) are written straight away so a reload immediately afterwards cannot
   * lose them.
   */
  const apply = (
    updater: (s: AssessmentSession) => AssessmentSession,
    options: { immediate?: boolean } = {},
  ) => {
    const next = updater(get().session);
    set({ session: next, saveState: 'saving' });
    if (options.immediate) writeNow(next);
    else persist(next);
  };

  // A reload or tab switch must not lose the last few hundred milliseconds of work.
  if (typeof window !== 'undefined') {
    window.addEventListener('pagehide', () => persist.flush());
    window.addEventListener('beforeunload', () => persist.flush());
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') persist.flush();
    });
  }

  const session = initialSession();
  return {
    flushSave: () => persist.flush(),
    session,
    framework: resolveFramework(session.frameworkId),
    saveState: 'idle',

    setFramework: (id) => {
      const framework = resolveFramework(id);
      set({ framework });
      apply(() => createSession(id, framework.framework.version), { immediate: true });
    },

    replaceSession: (next) => {
      set({ framework: resolveFramework(next.frameworkId) });
      apply(() => next, { immediate: true });
    },

    resetSession: () => {
      const { framework } = get();
      apply(() => createSession(framework.framework.id, framework.framework.version), {
        immediate: true,
      });
    },

    clearEverything: async () => {
      await clearAllLocalData();
      const framework = resolveFramework(DEFAULT_FRAMEWORK);
      set({
        framework,
        session: createSession(DEFAULT_FRAMEWORK, framework.framework.version),
        saveState: 'idle',
        saveError: undefined,
      });
    },

    setTier1: (tier1) => apply((s) => setTier1On(s, tier1), { immediate: true }),
    setAnswer: (questionId, value) => apply((s) => setAnswerIn(s, questionId, value)),
    addCte: (cte) => apply((s) => addCteTo(s, cte), { immediate: true }),
    updateCte: (id, patch) => apply((s) => updateCteIn(s, id, patch)),
    removeCte: (id) => apply((s) => removeCteFrom(s, id), { immediate: true }),
    reorderCtes: (ids) => apply((s) => reorderCtesIn(s, ids), { immediate: true }),
    setAssessment: (assessment) => apply((s) => setAssessmentIn(s, assessment)),

    addEvidence: (evidence) => {
      const result = addEvidenceTo(get().session, evidence);
      set({ session: result.session, saveState: 'saving' });
      writeNow(result.session);
      return result.id;
    },
    updateEvidence: (id, patch) => apply((s) => updateEvidenceIn(s, id, patch)),
    removeEvidence: (id) => {
      const item = get().session.tier2?.evidence.find((e) => e.id === id);
      if (item?.file?.blobKey) void deleteBlob(item.file.blobKey).catch(() => undefined);
      apply((s) => removeEvidenceFrom(s, id), { immediate: true });
    },
    linkEvidence: (evidenceId, cteId, criterionId) =>
      apply((s) => linkEvidenceIn(s, evidenceId, cteId, criterionId), { immediate: true }),
    unlinkEvidence: (evidenceId, cteId, criterionId) =>
      apply((s) => unlinkEvidenceIn(s, evidenceId, cteId, criterionId), { immediate: true }),
    setGapActions: (actions) => apply((s) => setGapActionsIn(s, actions)),
  };
});
