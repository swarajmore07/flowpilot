/*
 * Money and figures are formatted in one place so a rupee amount looks the same
 * in a KPI, a table cell and a detail sheet. Formatter instances are created
 * once at module scope — Intl construction is the expensive part.
 */

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const decimal = new Intl.NumberFormat("en-IN");

const CRORE = 10_000_000;
const LAKH = 100_000;

/** Trims a fixed-decimal string: 9.10 → "9.1", 12.00 → "12". */
function trim(value: number, digits: number) {
  return value
    .toFixed(digits)
    .replace(/\.0+$/, "")
    .replace(/(\.\d*[1-9])0+$/, "$1");
}

/** Full amount with Indian digit grouping: ₹2,45,00,000. */
export function formatInr(value: number): string {
  return inr.format(value);
}

/** Indian short scale, for KPIs and axis labels: ₹9.12 Cr, ₹4.5 L, ₹8,500. */
export function formatInrCompact(value: number): string {
  const sign = value < 0 ? "-" : "";
  const amount = Math.abs(value);

  if (amount >= CRORE) {
    return `${sign}₹${trim(amount / CRORE, 2)} Cr`;
  }

  if (amount >= LAKH) {
    return `${sign}₹${trim(amount / LAKH, 2)} L`;
  }

  return inr.format(value);
}

/** Plain integer with Indian digit grouping: 1,24,000. */
export function formatNumber(value: number): string {
  return decimal.format(value);
}

/** Share of a total as a whole percent. Returns 0 when the total is 0. */
export function formatPercent(value: number, total: number): string {
  if (total <= 0) return "0%";
  return `${Math.round((value / total) * 100)}%`;
}

/**
 * A share that has already been computed, as a whole percent: 40.4 → "40%".
 *
 * Rounded the same way `formatPercent` rounds, so a figure derived once in the
 * model and a figure derived from its parts still read identically on screen.
 */
export function formatShare(value: number): string {
  return `${Math.round(value)}%`;
}

/** Share of a total as a 0–100 number, for the metric card's tolerance rail. */
export function toShare(value: number, total: number): number {
  if (total <= 0) return 0;
  return (value / total) * 100;
}
