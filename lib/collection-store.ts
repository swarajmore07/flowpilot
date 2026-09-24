"use client";

import { useSyncExternalStore } from "react";

/*
 * A collection that lives in localStorage until a real backend exists.
 *
 * The obvious implementation — read storage in a mount effect, write it in a
 * second effect — works but fights React: the first render is always wrong, and
 * the correction arrives as a cascading re-render. Storage is an external
 * system, so this models it as one and subscribes with useSyncExternalStore.
 *
 * Three things fall out of that for free:
 *   - the server render and the hydration pass agree (both see `ready: false`),
 *     so the UI can show a loading state without a hydration mismatch;
 *   - every component reading the same store sees the same data, because the
 *     data lives in the store rather than in one component's state;
 *   - a write in another tab updates this one, via the `storage` event.
 */

export interface StoredCollection<T> {
  items: T[];
  /** False on the server and during hydration, true once storage was read. */
  ready: boolean;
}

export interface CollectionStore<T> {
  /** The localStorage key this store reads and writes. */
  key: string;
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => StoredCollection<T>;
  getServerSnapshot: () => StoredCollection<T>;
  /** Replaces the collection and persists it. */
  update: (updater: (current: T[]) => T[]) => void;
  /**
   * Discards the stored copy so the collection falls back to its seed.
   *
   * This is deliberately not `update(() => seed)`: writing the seed back would
   * leave a stored array that happens to match it, and the next seed change
   * would be invisible. Removing the key restores the original state exactly.
   */
  reset: () => void;
}

export interface CollectionStoreHooks<T> {
  /**
   * Runs on every write, with the collection as it stands before the update.
   *
   * The ID sequence uses it to spend a record's number while that record is
   * still there to be read. Without it, deleting the highest ID on a workspace
   * that has never issued one leaves no trace of the number, and the next add
   * hands it out again.
   *
   * It sees the collection, not the change, so it cannot tell an edit from a
   * delete — deliberately. Anything that has to hold across both is exactly the
   * kind of thing that belongs here.
   */
  beforeWrite?: (current: T[]) => void;
  /**
   * Teardown for anything else keyed to this collection — the ID high-water
   * mark, for one. Without it, "restore sample data" would restore the records
   * and leave their sequence counting from wherever the deleted ones left off.
   */
  afterReset?: () => void;
}

/**
 * Create one store per storage key, at module scope — never inside a component.
 *
 * @param seed        Data to fall back on when nothing valid is stored.
 * @param isValidItem Guard applied to every stored record. localStorage is
 *                    user-writable, so what comes back is untrusted input.
 * @param hooks       Side effects the collection's own bookkeeping depends on.
 */
export function createCollectionStore<T>(
  key: string,
  seed: T[],
  isValidItem: (value: unknown) => value is T,
  hooks: CollectionStoreHooks<T> = {}
): CollectionStore<T> {
  const serverSnapshot: StoredCollection<T> = { items: seed, ready: false };
  const listeners = new Set<() => void>();

  /* null means "not read yet". Cached because React calls getSnapshot on every
     render and expects a stable reference when nothing changed. */
  let snapshot: StoredCollection<T> | null = null;

  function read(): StoredCollection<T> {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return { items: seed, ready: true };

      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) return { items: seed, ready: true };

      const valid = parsed.filter(isValidItem);

      /* An empty stored array is legitimate — everything was deleted. Records
         that all fail the guard are not: that is corruption, so reseed. */
      if (parsed.length > 0 && valid.length === 0) {
        return { items: seed, ready: true };
      }

      return { items: valid, ready: true };
    } catch {
      /* Malformed JSON, or storage blocked entirely. */
      return { items: seed, ready: true };
    }
  }

  function emit() {
    listeners.forEach((listener) => listener());
  }

  function handleStorage(event: StorageEvent) {
    /* event.key is null when another tab called localStorage.clear(). */
    if (event.key !== null && event.key !== key) return;

    snapshot = null;
    emit();
  }

  return {
    key,

    subscribe(listener) {
      listeners.add(listener);

      if (listeners.size === 1) {
        window.addEventListener("storage", handleStorage);
      }

      return () => {
        listeners.delete(listener);

        if (listeners.size === 0) {
          window.removeEventListener("storage", handleStorage);
        }
      };
    },

    getSnapshot() {
      snapshot ??= read();
      return snapshot;
    },

    getServerSnapshot() {
      return serverSnapshot;
    },

    update(updater) {
      const current = snapshot?.items ?? read().items;

      /* Before the change, not after: the hook's job is to see what is still
         there. */
      hooks.beforeWrite?.(current);

      const items = updater(current);

      snapshot = { items, ready: true };

      try {
        window.localStorage.setItem(key, JSON.stringify(items));
      } catch {
        /* Quota exceeded or storage disabled: the session continues in memory. */
      }

      emit();
    },

    reset() {
      try {
        window.localStorage.removeItem(key);
      } catch {
        /* Storage disabled: the in-memory reset below still applies. */
      }

      hooks.afterReset?.();

      snapshot = { items: seed, ready: true };
      emit();
    },
  };
}

/** Subscribe a component to a store created by createCollectionStore. */
export function useStoredCollection<T>(store: CollectionStore<T>) {
  const { items, ready } = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot
  );

  return { items, ready, update: store.update, reset: store.reset };
}
