import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber } from "@/lib/format";

interface TableStatusBarProps {
  /** False until storage has been read. Figures are withheld until it is true. */
  ready: boolean;
  /** Rows the current filters leave visible. */
  shown: number;
  /** Rows held in total, filters ignored. */
  total: number;
  /** What one row is, singular — "supplier", "product", "run". */
  noun: string;
  /** The right-hand reading: what the rows in view add up to, pre-formatted. */
  summary: string;
}

/*
 * The footer under a records table: how much of the book is in view, and what
 * that view is worth.
 *
 * One component rather than three, because all three module tables want the same
 * sentence and the same two figures in the same corners — and because all three
 * used to print those figures before the records had been read, which meant the
 * seed's totals sat under a table of loading placeholders. A count is a claim
 * about the whole collection; it has to wait for the collection.
 */
export function TableStatusBar({
  ready,
  shown,
  total,
  noun,
  summary,
}: TableStatusBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-4 py-2.5">
      {ready ? (
        <>
          {/* Pluralised on the total, since that is the noun's number: a book
              holding one record reads "1 of 1 supplier". */}
          <p className="label-micro">
            Showing {formatNumber(shown)} of {formatNumber(total)}{" "}
            {total === 1 ? noun : `${noun}s`}
          </p>

          <p className="label-micro">{summary}</p>
        </>
      ) : (
        <>
          <Skeleton className="h-2.5 w-44" />
          <Skeleton className="h-2.5 w-28" />
        </>
      )}
    </div>
  );
}
