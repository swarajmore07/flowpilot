/*
 * Dates are stored as plain `YYYY-MM-DD` strings and treated as calendar days,
 * never as instants. Two reasons: a due date has no time of day, and
 * `new Date("2026-08-28")` parses as UTC midnight, which lands on the 27th for
 * every reader west of Greenwich. Everything here goes through the local
 * constructor instead, and day arithmetic runs on UTC-normalised midnights so
 * a daylight-saving shift cannot swallow or invent a day.
 */

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const MS_PER_DAY = 86_400_000;

const dayFormat = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

/** Parses a `YYYY-MM-DD` string into a local calendar day. */
export function parseIsoDate(value: string): Date | null {
  if (!ISO_DATE.test(value)) return null;

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return Number.isNaN(date.getTime()) ? null : date;
}

/** Serialises a Date back to `YYYY-MM-DD` in local time. */
export function toIsoDate(date: Date): string {
  const year = String(date.getFullYear()).padStart(4, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * True only for a real calendar day. The round trip is what rejects
 * `2026-02-31`, which the Date constructor would silently roll into March.
 */
export function isIsoDate(value: string): boolean {
  const date = parseIsoDate(value);
  return date !== null && toIsoDate(date) === value;
}

/**
 * Whole calendar days from `from` to `to`. Negative when `to` is already past:
 * `differenceInCalendarDays("2026-08-20", "2026-08-22")` is `-2`.
 */
export function differenceInCalendarDays(
  to: string,
  from: string
): number | null {
  const target = parseIsoDate(to);
  const origin = parseIsoDate(from);

  if (!target || !origin) return null;

  const targetUtc = Date.UTC(
    target.getFullYear(),
    target.getMonth(),
    target.getDate()
  );

  const originUtc = Date.UTC(
    origin.getFullYear(),
    origin.getMonth(),
    origin.getDate()
  );

  return Math.round((targetUtc - originUtc) / MS_PER_DAY);
}

/** Reader-facing calendar day: `2026-08-28` → "28 Aug 2026". */
export function formatDay(value: string): string {
  const date = parseIsoDate(value);
  return date ? dayFormat.format(date) : value;
}

/**
 * How a due date reads relative to a reference day, in words rather than a
 * signed integer: "Due today", "3 days overdue", "Due in 12 days".
 */
export function describeDueDay(dueDate: string, today: string): string {
  const days = differenceInCalendarDays(dueDate, today);

  if (days === null) return `Due ${dueDate}`;

  if (days < 0) {
    const late = Math.abs(days);
    return late === 1 ? "1 day overdue" : `${late} days overdue`;
  }

  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";

  return `Due in ${days} days`;
}

/**
 * A short label for the clock this browser is on — "IST", "GMT+5:30", "PDT".
 *
 * Browser-only, so call it behind a hydration gate: the machine rendering on the
 * server is not the one reading the page, and a guess printed here would be a
 * guess about which day counts as "today".
 *
 * Worth printing at all because every overdue and due-today reading in the app
 * is computed against this zone's calendar day. The label is a fact about the
 * numbers on screen, not decoration.
 */
export function localTimeZoneLabel(): string {
  try {
    const parts = new Intl.DateTimeFormat("en-IN", {
      hour: "numeric",
      timeZoneName: "short",
    }).formatToParts(new Date());

    return parts.find((part) => part.type === "timeZoneName")?.value ?? "";
  } catch {
    /* Intl is present everywhere this app runs, but a resolved zone is not
       guaranteed — better no label than a wrong one. */
    return "";
  }
}
