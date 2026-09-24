import type { Metadata } from "next";

import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page not found",
};

/*
 * Rendered inside the app shell, so the sidebar is still there — which is the
 * fastest way out of a wrong address and the reason this page does not need to
 * list the routes itself.
 *
 * The status code is set in mono, like every other machine-generated token in
 * the app. It is the one piece of information here a reader might want to quote.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="max-w-md text-center">
        <span className="identifier inline-flex h-6 items-center rounded-sm border border-line bg-panel-sunken px-2 text-xs text-ink-faint">
          404
        </span>

        <h1 className="animate-rise mt-5 font-display text-2xl leading-tight font-semibold tracking-[-0.015em] text-balance text-ink">
          No route by that name
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          This address does not match any page in the workspace. Every route that
          exists is in the sidebar.
        </p>

        <div className="mt-6 flex justify-center">
          <ButtonLink href="/">Open dashboard</ButtonLink>
        </div>
      </div>
    </div>
  );
}
