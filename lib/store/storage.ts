import type { PersistStorage, StorageValue } from "zustand/middleware";

/**
 * Browser-only persistence helpers.
 *
 * Nothing here touches `window` at module scope, so importing a store during
 * SSR/prerender is safe. Every access is wrapped in a try/catch because
 * localStorage can throw (private mode, disabled storage, quota errors).
 */

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function getStorage(): StorageLike | undefined {
  try {
    const storage = (globalThis as { localStorage?: StorageLike }).localStorage;
    if (!storage) return undefined;

    // Probe once per call: Safari private mode exposes localStorage but throws
    // on write, and we want to fail closed rather than mid-action.
    const probeKey = "__pathpilot_storage_probe__";
    storage.setItem(probeKey, "1");
    storage.removeItem(probeKey);
    return storage;
  } catch {
    return undefined;
  }
}

/** True when localStorage is present and writable in this environment. */
export function isPersistenceAvailable(): boolean {
  return getStorage() !== undefined;
}

export function removePersistedKey(key: string): void {
  try {
    getStorage()?.removeItem(key);
  } catch {
    // Ignore storage failures: resetting in-memory state still succeeds.
  }
}

/** Reads and JSON-parses a persisted key without throwing. */
export function readPersistedJson(key: string): unknown {
  try {
    const raw = getStorage()?.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * A persist storage adapter that resolves localStorage lazily (so tests can
 * inject a mock after import), never throws, and silently no-ops on the server.
 */
export function createSafePersistStorage<S>(): PersistStorage<S> {
  return {
    getItem: (name) => {
      try {
        const raw = getStorage()?.getItem(name);
        if (!raw) return null;
        return JSON.parse(raw) as StorageValue<S>;
      } catch {
        // Corrupt or unreadable data is treated as "nothing saved".
        removePersistedKey(name);
        return null;
      }
    },
    setItem: (name, value) => {
      try {
        getStorage()?.setItem(name, JSON.stringify(value));
      } catch {
        // Quota/private-mode failures must not break app actions.
      }
    },
    removeItem: (name) => {
      removePersistedKey(name);
    },
  };
}
