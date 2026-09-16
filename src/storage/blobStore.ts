/**
 * Evidence blob storage in IndexedDB. Blobs never go to localStorage, and never leave the browser.
 */
import { createStore, get, set, del, clear, keys, type UseStore } from 'idb-keyval';
import { IDB_STORE_NAME } from '@/config/app.config';

export class StorageUnavailableError extends Error {
  constructor(
    message: string,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'StorageUnavailableError';
  }
}

export class QuotaExceededError extends Error {
  constructor(
    message: string,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'QuotaExceededError';
  }
}

let store: UseStore | null = null;
let unavailableReason: string | null = null;

function getStore(): UseStore {
  if (unavailableReason) throw new StorageUnavailableError(unavailableReason);
  if (!store) {
    try {
      store = createStore(IDB_STORE_NAME, 'blobs');
    } catch (e) {
      unavailableReason =
        'This browser is not allowing IndexedDB (private browsing can do this). Evidence files ' +
        'cannot be stored; you can still record evidence as links or references.';
      throw new StorageUnavailableError(unavailableReason, e);
    }
  }
  return store;
}

export function isQuotaError(e: unknown): boolean {
  const name = (e as { name?: string } | undefined)?.name;
  return name === 'QuotaExceededError' || name === 'NS_ERROR_DOM_QUOTA_REACHED';
}

function wrap(e: unknown): never {
  if (isQuotaError(e)) {
    throw new QuotaExceededError(
      'The browser ran out of storage space for evidence files. Remove a large file, or record it ' +
        'as a reference instead of attaching it.',
      e,
    );
  }
  throw new StorageUnavailableError('Evidence storage is unavailable in this browser session.', e);
}

export async function putBlob(key: string, blob: Blob): Promise<void> {
  try {
    await set(key, blob, getStore());
  } catch (e) {
    if (e instanceof StorageUnavailableError) throw e;
    wrap(e);
  }
}

export async function getBlob(key: string): Promise<Blob | undefined> {
  try {
    return await get<Blob>(key, getStore());
  } catch (e) {
    if (e instanceof StorageUnavailableError) throw e;
    wrap(e);
  }
}

export async function deleteBlob(key: string): Promise<void> {
  try {
    await del(key, getStore());
  } catch (e) {
    if (e instanceof StorageUnavailableError) throw e;
    wrap(e);
  }
}

export async function listBlobKeys(): Promise<string[]> {
  try {
    return (await keys(getStore())).map(String);
  } catch {
    return [];
  }
}

export async function clearBlobs(): Promise<void> {
  try {
    await clear(getStore());
  } catch {
    /* nothing to clear if the store was never usable */
  }
}

/** Test seam: forget the cached handle (and any recorded failure). */
export function __resetBlobStore(): void {
  store = null;
  unavailableReason = null;
}
