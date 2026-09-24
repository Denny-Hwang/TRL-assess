/**
 * JSON import/export for a session.
 */
import { APP_NAME, APP_VERSION, GIT_SHA, SCHEMA_VERSION } from '@/config/app.config';
import { parseSession, SessionVersionError } from './session';
import type { AssessmentSession } from './schemas';

export interface SessionExport {
  /** Provenance of the export itself — the session keeps its own recorded versions. */
  exportedBy: string;
  exportedAt: string;
  appVersion: string;
  gitSha: string;
  schemaVersion: number;
  session: AssessmentSession;
}

export function toExport(session: AssessmentSession, at: Date = new Date()): SessionExport {
  return {
    exportedBy: APP_NAME,
    exportedAt: at.toISOString(),
    appVersion: APP_VERSION,
    gitSha: GIT_SHA,
    schemaVersion: SCHEMA_VERSION,
    session,
  };
}

export function serializeSession(session: AssessmentSession, at?: Date): string {
  return JSON.stringify(toExport(session, at), null, 2);
}

export class SessionImportError extends Error {
  constructor(
    message: string,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'SessionImportError';
  }
}

export interface ImportResult {
  session: AssessmentSession;
  warnings: string[];
}

/** Accepts either a bare session or a wrapped export; validates and reports version mismatches. */
export function deserializeSession(text: string): ImportResult {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch (e) {
    throw new SessionImportError('The file is not valid JSON.', e);
  }
  const warnings: string[] = [];
  const wrapper = raw as Partial<SessionExport>;
  const candidate =
    wrapper && typeof wrapper === 'object' && 'session' in wrapper ? wrapper.session : raw;

  if (wrapper?.appVersion && wrapper.appVersion !== APP_VERSION) {
    warnings.push(
      `The file was exported by ${APP_NAME} ${wrapper.appVersion}; this build is ${APP_VERSION}.`,
    );
  }

  try {
    const session = parseSession(candidate);
    if (session.appVersion && session.appVersion !== APP_VERSION) {
      warnings.push(
        `The session was created with app version ${session.appVersion}; this build is ${APP_VERSION}.`,
      );
    }
    return { session, warnings };
  } catch (e) {
    if (e instanceof SessionVersionError) throw new SessionImportError(e.message, e);
    throw new SessionImportError(
      'The file does not match the expected session format. It may have been edited, or produced ' +
        'by a different tool.',
      e,
    );
  }
}
