/*
 * Moving focus after a failed submit.
 *
 * Every form in this app validates synchronously when it is submitted, so the
 * list of complaints is known inside the handler. What is *not* known there is
 * whether the DOM has caught up: React batches the state update that renders the
 * error text, and a screen reader reads a control's description at the moment
 * focus lands on it. Focus first and the description arrives a beat late, which
 * is the same as not arriving.
 *
 * So the caller flushes the error state, then calls this. Keeping the flush at
 * the call site rather than hiding it in here means the one surprising thing in
 * the sequence stays visible in the handler that needs it.
 */
export function focusField(id: string | null) {
  if (!id) return;

  const element = document.getElementById(id);
  if (!element) return;

  element.focus();

  /*
   * Long forms scroll, and a field near the bottom of a sheet can be focused
   * while sitting under the footer. Centring it puts the control and the
   * sentence explaining the problem on screen together — the error is only
   * useful if it is read.
   *
   * Smooth unless the reader has asked for less motion, in which case the jump
   * is the correct answer rather than a compromise.
   */
  const prefersReducedMotion =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  element.scrollIntoView({
    block: "center",
    behavior: prefersReducedMotion ? "auto" : "smooth",
  });
}

/**
 * The DOM id of the first field, in the order they are laid out, that has an
 * error against it.
 *
 * Ordered by the layout rather than by the shape of the errors object: object
 * key order follows whichever validation rule ran first, which is not what the
 * reader sees. Focus should land on the topmost problem.
 */
export function firstErrorId<Field extends string>(
  order: readonly { field: Field; id: string }[],
  errors: Partial<Record<Field, string>>
): string | null {
  return order.find((entry) => errors[entry.field])?.id ?? null;
}
