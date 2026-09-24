/*
 * Record IDs that are never reissued.
 *
 * Taking the highest live ID and adding one looks correct and is not: delete
 * SUP-1005 from a book that ends there and the next supplier is handed SUP-1005
 * again. Two different records then share one identifier — one in an export
 * already on disk, one in the browser — and every reference to the old number
 * silently resolves to the new record.
 *
 * So the high-water mark is persisted separately from the records and only ever
 * moves up. The live records are still consulted, because the mark can legally
 * lag them: the seed data ships with IDs above the floor, and a restored export
 * can carry any numbers at all.
 *
 * Which is why `observe` exists alongside `next`. A mark that is only written
 * when an ID is issued cannot protect a deletion that happens before the first
 * add — on a fresh workspace, deleting the last seed record leaves nothing to
 * remember it by, and the number comes back. The store calls `observe` before
 * every write, so the mark has already absorbed a record's number by the time
 * that record can be removed.
 */

interface IdSequenceConfig {
  /** ID prefix, e.g. "SUP" for SUP-1004. */
  prefix: string;
  /** Where the high-water mark is kept. Separate from the records' own key. */
  storageKey: string;
  /** The number below which no ID is ever issued. */
  floor?: number;
}

export interface IdSequence {
  /** Reserve and return the next unused ID. Call only from an event handler. */
  next: (current: { id: string }[]) => string;
  /**
   * Raise the mark to cover the IDs currently in use, without issuing one.
   *
   * Wired to the store's `beforeWrite` hook: whatever is about to be edited or
   * deleted is recorded first, so its number is spent even if the record itself
   * stops existing a moment later.
   */
  observe: (current: { id: string }[]) => void;
  /**
   * Forget the mark, so the sequence falls back behind whatever records exist.
   *
   * Called when a module is restored to its sample data: the records go back to
   * the seed, and a mark left pointing past them would leave a permanent gap in
   * the numbering of a workspace that is meant to look untouched.
   */
  clear: () => void;
}

export function createIdSequence({
  prefix,
  storageKey,
  floor = 1000,
}: IdSequenceConfig): IdSequence {
  const pattern = new RegExp(`^${prefix}-(\\d+)$`);

  function readMark(): number {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw === null) return floor;

      const value = Number(raw);

      /* A hand-edited or truncated mark is discarded rather than trusted. The
         live scan below still keeps the issued ID clear of everything visible;
         only the memory of deleted records is lost. */
      return Number.isSafeInteger(value) && value >= floor ? value : floor;
    } catch {
      /* Storage blocked. The scan below is the fallback. */
      return floor;
    }
  }

  function writeMark(value: number) {
    try {
      window.localStorage.setItem(storageKey, String(value));
    } catch {
      /* Quota or storage disabled: IDs stay unique against everything currently
         held, which is the most this session can promise. */
    }
  }

  /** The largest number in use under this prefix, or the floor if none is. */
  function highestOf(current: { id: string }[]): number {
    let highest = floor;

    current.forEach((record) => {
      const match = record.id.match(pattern);
      if (!match) return;

      const numericId = Number(match[1]);
      if (numericId > highest) highest = numericId;
    });

    return highest;
  }

  return {
    next(current) {
      const issued = Math.max(readMark(), highestOf(current)) + 1;

      writeMark(issued);

      return `${prefix}-${issued}`;
    },

    observe(current) {
      const inUse = highestOf(current);

      /* Only ever upwards, and only when it moves — a delete that touches
         nothing near the top should not cost a storage write. */
      if (inUse > readMark()) writeMark(inUse);
    },

    clear() {
      try {
        window.localStorage.removeItem(storageKey);
      } catch {
        /* Nothing was stored to remove. */
      }
    },
  };
}
