"use client";

import { useSyncExternalStore } from "react";

/* Hydration happens once and never reverses, so there is nothing to subscribe
   to — but useSyncExternalStore is still the right tool: it is the one hook that
   can legally report a different value on the server than on the client. */
function subscribe() {
  return () => {};
}

function getClientSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

/**
 * False during the server render and the hydration pass, true immediately
 * after. Use it to gate anything that can only be known in the browser —
 * the resolved theme, the platform's modifier key — without a mount effect
 * and without a hydration mismatch.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}
