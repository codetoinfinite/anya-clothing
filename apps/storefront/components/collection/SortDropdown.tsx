"use client";

import { useRouter, useSearchParams } from "next/navigation";

const OPTIONS = [
  { value: "", label: "Featured" },
  { value: "-created_at", label: "Newest" },
  { value: "created_at", label: "Oldest" },
  { value: "title", label: "A–Z" },
  { value: "-title", label: "Z–A" },
  { value: "price", label: "Price · low to high" },
  { value: "-price", label: "Price · high to low" },
];

export function SortDropdown() {
  const router = useRouter();
  const params = useSearchParams();
  const current = params.get("sort") ?? "";

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-[var(--color-ink-muted)]">Sort</span>
      <select
        value={current}
        onChange={(e) => {
          const next = new URLSearchParams(params.toString());
          if (e.target.value) next.set("sort", e.target.value);
          else next.delete("sort");
          router.push(`?${next.toString()}`, { scroll: false });
        }}
        className="h-9 border border-[var(--color-line)] px-3 bg-white"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
