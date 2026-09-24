/**
 * Hand a JSON file to the browser's download machinery.
 *
 * There is no server to generate an export, so the file is built in memory and
 * offered through a synthetic anchor click. The object URL is revoked straight
 * after: the click is dispatched synchronously, so by the time this returns the
 * browser already holds the blob.
 *
 * Must be called from a user gesture — browsers block programmatic downloads
 * that are not traceable to a click.
 */
export function downloadJson(filename: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = filename;
  anchor.click();

  URL.revokeObjectURL(url);
}

/** `flowpilot-inventory-2026-08-23.json` — sortable, and says what it holds. */
export function stampedFilename(slug: string): string {
  const now = new Date();

  const stamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");

  return `flowpilot-${slug}-${stamp}.json`;
}
