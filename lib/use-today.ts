"use client";

import { useSyncExternalStore } from "react";

import { toIsoDate } from "./date";

/*
 * Today's calendar day, as `YYYY-MM-DD`.
 *
 * The current date is a browser fact: a server render has no idea what day it
 * is where the reader sits, and guessing produces a hydration mismatch on every
 * page that counts days. So this is modelled the same way the collection store
 * models localStorage — an external value, read through useSyncExternalStore,
 * reported as `null` until the client can answer.
 *
 * It also re-reads itself at the next local midnight, because a command centre
 * left open overnight should not spend the morning calling yesterday "today".
 */

let current: string | null = null;
let timer: number | undefined;

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function scheduleRollover() {
  const now = new Date();

  /* A few seconds past midnight, so a fast clock cannot fire this while the
     local date is still yesterday. */
  const next = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0,
    0,
    5
  );

  timer = window.setTimeout(() => {
    current = toIsoDate(new Date());
    emit();
    scheduleRollover();
  }, next.getTime() - now.getTime());
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  if (listeners.size === 1) {
    /* Re-read before scheduling. While nothing was subscribed there was no timer
       running, so a workspace left closed across midnight — or a route with no
       date-aware component in it — would otherwise resume serving the cached
       yesterday until the following midnight. React compares the snapshot again
       after subscribing, so correcting the value here is picked up immediately. */
    current = toIsoDate(new Date());
    scheduleRollover();
  }

  return () => {
    listeners.delete(listener);

    if (listeners.size === 0 && timer !== undefined) {
      window.clearTimeout(timer);
      timer = undefined;
    }
  };
}

function getSnapshot(): string {
  current ??= toIsoDate(new Date());
  return current;
}

function getServerSnapshot(): null {
  return null;
}

/** Null during the server render and the hydration pass, then `YYYY-MM-DD`. */
export function useToday(): string | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
