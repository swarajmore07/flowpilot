import { ReactNode } from "react";

interface SectionProps {
  title: string;
  children: ReactNode;
}

export function Section({
  title,
  children,
}: SectionProps) {
  return (
    <section className="mb-8">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">
        {title}
      </h2>

      {children}
    </section>
  );
}