"use client";

import { PageHeader } from "@/components/common/page-header";
import { RulebookList } from "@/components/common/rulebook-list";
import { SectionCard } from "@/components/common/section-card";

import { AppearanceCard } from "../appearance-card";
import { DataCard } from "../data-card";

/* What this build actually is. Written down because a command centre that will
   not say where its data lives is asking to be trusted rather than checked. */
const scope = [
  {
    term: "Where data lives",
    detail:
      "In this browser's localStorage, per device. Nothing is uploaded and nothing syncs between machines — clearing site data resets the workspace to its sample records.",
  },
  {
    term: "Accounts and roles",
    detail:
      "None. There is no sign-in, no permission model and no audit trail, so every action on every page is available to whoever opens it.",
  },
  {
    term: "How the copilot answers",
    detail:
      "By matching a question to one of a fixed set of readings and computing it from your records. No language model is called and no request leaves the browser.",
  },
  {
    term: "Numbers and dates",
    detail:
      "Indian numbering throughout — lakh and crore for currency, en-IN grouping for counts. Dates are read against this device's own calendar day.",
  },
];

/*
 * Settings that settle something.
 *
 * Two of the three cards here change real state — the theme, and the stored
 * records. The third is read-only on purpose: the thresholds are constants in the
 * code, and dressing them up as editable fields would promise a preference the
 * app does not have.
 */
export function SettingsOverview() {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Appearance, stored data, and the rules every signal in the app is measured against."
      />

      <SectionCard
        title="About this workspace"
        description="What this build does, and what it does not pretend to do."
        className="mb-6"
      >
        <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
          {scope.map((entry) => (
            <div key={entry.term}>
              <dt className="text-[0.8125rem] font-semibold text-ink">
                {entry.term}
              </dt>

              <dd className="mt-1 text-xs leading-relaxed text-ink-faint">
                {entry.detail}
              </dd>
            </div>
          ))}
        </dl>
      </SectionCard>

      <div className="flex flex-col gap-6">
        <AppearanceCard />

        <DataCard />

        <SectionCard
          title="Rules in force"
          description="Read-only. These are constants in the code, listed here so the number behind every flag is visible in one place."
        >
          <RulebookList />
        </SectionCard>
      </div>
    </>
  );
}
