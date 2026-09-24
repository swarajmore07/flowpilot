"use client";

import { Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  /** What the reader can type. Names the searchable fields, not the action. */
  placeholder: string;
  /** The accessible name — the visible one is the magnifier, which says nothing. */
  label: string;
}

/*
 * The search box every table sits above.
 *
 * Three modules had a byte-identical copy of this differing only in the
 * placeholder and the accessible name, which meant the clear button's hit area,
 * the focus ring and the icon inset all had to be kept in step by hand across
 * three files. Now they are one file, and the two things that genuinely differ
 * per module are props.
 *
 * `type="search"` for the semantics and the Escape-to-clear browsers give it for
 * free, but the native cancel button is hidden: it appears only in WebKit, sits
 * at a different inset, and is not keyboard reachable. The X below is, and it is
 * there in every browser.
 *
 * The X clears the term and nothing else. Filters are cleared by the filter bar,
 * which owns them — one control, one job.
 */
export function SearchInput({
  value,
  onChange,
  placeholder,
  label,
}: SearchInputProps) {
  return (
    <div className="relative w-full sm:max-w-xs">
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-ink-faint"
      />

      <Input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={label}
        className="pr-9 pl-8 [&::-webkit-search-cancel-button]:hidden"
      />

      {/* Absent rather than disabled when there is nothing to clear: a dead
          control in the tab order is a promise the box cannot keep. */}
      {value && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => onChange("")}
          className="absolute top-1/2 right-1.5 flex size-6 -translate-y-1/2 items-center justify-center rounded-sm text-ink-faint transition-colors hover:bg-panel-sunken hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}
