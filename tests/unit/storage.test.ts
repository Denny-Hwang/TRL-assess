import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { STORAGE_KEY_SESSION } from '@/config/app.config';
import { createSession, addCte } from '@/domain/session';

const idb = vi.hoisted(() => {
  const map = new Map<string, unknown>();
  return {
    map,
    fail: { value: null as null | Error },
    createStore: vi.fn(() => 'store'),
    get: vi.fn(async (k: string) => map.get(k)),
    set: vi.fn(async (k: string, v: unknown) => {
      if (idb.fail.value) throw idb.fail.value;
      map.set(k, v);
    }),
    del: vi.fn(async (k: string) => {
      map.delete(k);
    }),
    clear: vi.fn(async () => {
      map.clear();
    }),
    keys: vi.fn(async () => [...map.keys()]),
  };
});

vi.mock('idb-keyval', () => ({
  createStore: idb.createStore,
  get: idb.get,
  set: idb.set,
  del: idb.del,
  clear: idb.clear,
  keys: idb.keys,
}));

const {
  clearAllLocalData,
  clearSessionJson,
  debounce,
  loadSession,
  saveSession,
  SessionStorageError,
} = await import('@/storage/sessionStore');
const { putBlob, getBlob, deleteBlob, listBlobKeys, QuotaExceededError, __resetBlobStore } =
  await import('@/storage/blobStore');

describe('session autosave', () => {
  beforeEach(() => {
    localStorage.clear();
    idb.map.clear();
    idb.fail.value = null;
    __resetBlobStore();
  });

  it('saves and restores a session', () => {
    const session = addCte(createSession('marine-energy-eere', '1.0.0'), {
      name: 'Harvester',
      critical: true,
    });
    saveSession(session);
    expect(localStorage.getItem(STORAGE_KEY_SESSION)).toBeTruthy();
    expect(loadSession()).toEqual(session);
  });

  it('returns null when nothing is stored', () => {
    expect(loadSession()).toBeNull();
  });

  it('ignores a corrupted autosave instead of blocking startup', () => {
    localStorage.setItem(STORAGE_KEY_SESSION, '{"schemaVersion": "not a number"');
    expect(loadSession()).toBeNull();
  });

  it('ignores an autosave with an unknown schema version', () => {
    localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify({ schemaVersion: 99 }));
    expect(loadSession()).toBeNull();
  });

  it('reports a quota failure as a typed error', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key: string) => {
      if (key === STORAGE_KEY_SESSION) {
        const e = new Error('quota');
        e.name = 'QuotaExceededError';
        throw e;
      }
    });
    try {
      expect(() => saveSession(createSession('marine-energy-eere', '1.0.0'))).toThrow(
        SessionStorageError,
      );
    } finally {
      spy.mockRestore();
    }
  });

  it('clears the stored session JSON', () => {
    saveSession(createSession('marine-energy-eere', '1.0.0'));
    clearSessionJson();
    expect(localStorage.getItem(STORAGE_KEY_SESSION)).toBeNull();
  });

  it('"Clear all local data" removes localStorage keys and IndexedDB blobs', async () => {
    saveSession(createSession('marine-energy-eere', '1.0.0'));
    localStorage.setItem('trl-assess:ui:v1', '{"x":1}');
    localStorage.setItem('unrelated-app-key', 'keep me');
    await putBlob('blob:EV-0001', new Blob(['abc']));
    expect(await listBlobKeys()).toEqual(['blob:EV-0001']);

    await clearAllLocalData();

    expect(localStorage.getItem(STORAGE_KEY_SESSION)).toBeNull();
    expect(localStorage.getItem('trl-assess:ui:v1')).toBeNull();
    expect(localStorage.getItem('unrelated-app-key')).toBe('keep me');
    expect(await listBlobKeys()).toEqual([]);
  });
});

describe('evidence blob store', () => {
  beforeEach(() => {
    idb.map.clear();
    idb.fail.value = null;
    __resetBlobStore();
  });

  it('stores, reads and deletes a blob', async () => {
    await putBlob('blob:EV-0001', new Blob(['hello']));
    expect(await getBlob('blob:EV-0001')).toBeInstanceOf(Blob);
    await deleteBlob('blob:EV-0001');
    expect(await getBlob('blob:EV-0001')).toBeUndefined();
  });

  it('maps a quota failure to QuotaExceededError', async () => {
    const quota = new Error('full');
    quota.name = 'QuotaExceededError';
    idb.fail.value = quota;
    await expect(putBlob('blob:EV-0002', new Blob(['x']))).rejects.toBeInstanceOf(
      QuotaExceededError,
    );
  });

  it('maps any other failure to a storage-unavailable error', async () => {
    idb.fail.value = new Error('nope');
    await expect(putBlob('blob:EV-0003', new Blob(['x']))).rejects.toThrow(/unavailable/);
  });
});

describe('debounce', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('runs once after the quiet period, with the last arguments', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);
    debounced(1);
    debounced(2);
    debounced(3);
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(3);
  });

  it('flushes immediately on demand', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);
    debounced('a');
    debounced.flush();
    expect(fn).toHaveBeenCalledWith('a');
  });

  it('can be cancelled', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);
    debounced('a');
    debounced.cancel();
    vi.advanceTimersByTime(500);
    expect(fn).not.toHaveBeenCalled();
  });
});
