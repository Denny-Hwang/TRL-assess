/**
 * Session persistence: JSON in localStorage (debounced), blobs in IndexedDB.
 */
import { STORAGE_KEY_SESSION } from '@/config/app.config';
import { parseSession } from '@/domain/session';
import type { AssessmentSession } from '@/domain/schemas';
import { clearBlobs } from './blobStore';

export class SessionStorageError extends Error {
  constructor(
    message: string,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'SessionStorageError';
  }
}

function localStorageOrNull(): Storage | null {
  try {
    const ls = globalThis.localStorage;
    // Touch it: Safari in private mode throws on write, not on access.
    const probe = '__trl_probe__';
    ls.setItem(probe, '1');
    ls.removeItem(probe);
    return ls;
  } catch {
    return null;
  }
}

export function saveSession(session: AssessmentSession): void {
  const ls = localStorageOrNull();
  if (!ls) {
    throw new SessionStorageError(
      'This browser is not allowing local storage, so your work cannot be saved automatically. ' +
        'Use "Download JSON" to keep a copy.',
    );
  }
  try {
    ls.setItem(STORAGE_KEY_SESSION, JSON.stringify(session));
  } catch (e) {
    throw new SessionStorageError(
      'The browser refused to save the session — local storage is full. Remove evidence files or ' +
        'export the session to JSON.',
      e,
    );
  }
}

export function loadSession(): AssessmentSession | null {
  const ls = localStorageOrNull();
  if (!ls) return null;
  const raw = ls.getItem(STORAGE_KEY_SESSION);
  if (!raw) return null;
  try {
    return parseSession(JSON.parse(raw));
  } catch {
    // A corrupt or outdated autosave must never block the app from starting.
    return null;
  }
}

export function clearSessionJson(): void {
  const ls = localStorageOrNull();
  ls?.removeItem(STORAGE_KEY_SESSION);
}

/** Removes both the session JSON and every evidence blob. */
export async function clearAllLocalData(): Promise<void> {
  clearSessionJson();
  const ls = localStorageOrNull();
  if (ls) {
    for (const key of Object.keys(ls)) {
      if (key.startsWith('trl-assess:')) ls.removeItem(key);
    }
  }
  try {
    globalThis.sessionStorage?.removeItem('trl-assess:notice-dismissed');
  } catch {
    /* ignore */
  }
  await clearBlobs();
}

/** Debounce helper used by the autosave subscriber. */
export function debounce<A extends unknown[]>(
  fn: (...args: A) => void,
  ms: number,
): ((...args: A) => void) & { flush: () => void; cancel: () => void } {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let pending: A | undefined;
  const wrapped = (...args: A) => {
    pending = args;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = undefined;
      if (pending) fn(...pending);
      pending = undefined;
    }, ms);
  };
  wrapped.flush = () => {
    if (timer) clearTimeout(timer);
    timer = undefined;
    if (pending) fn(...pending);
    pending = undefined;
  };
  wrapped.cancel = () => {
    if (timer) clearTimeout(timer);
    timer = undefined;
    pending = undefined;
  };
  return wrapped;
}
