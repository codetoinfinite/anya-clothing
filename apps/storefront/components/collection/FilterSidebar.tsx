"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const SIZES = ["XS", "S", "M", "L", "XL"];
const COLORS = [
  { value: "ivory", label: "Ivory", hex: "#f4eee0" },
  { value: "indigo", label: "Indigo", hex: "#2b3a67" },
  { value: "ochre", label: "Ochre", hex: "#c08a2e" },
];

export function FilterSidebar({ basePath }: { basePath: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const selectedSizes = new Set(params.get("size")?.split(",").filter(Boolean) ?? []);
  const selectedColors = new Set(params.get("color")?.split(",").filter(Boolean) ?? []);

  const update = useCallback(
    (key: string, set: Set<string>) => {
      const next = new URLSearchParams(params.toString());
      if (set.size) next.set(key, [...set].join(","));
      else next.delete(key);
      next.delete("page");
      router.push(`${basePath}?${next.toString()}`, { scroll: false });
    },
    [params, basePath, router]
  );

  return (
    <aside className="md:w-64 md:pr-8 md:border-r md:border-[var(--color-line)] space-y-8 text-sm">
      <div>
        <div className="text-xs tracking-[0.16em] uppercase mb-3">Size</div>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((s) => {
            const on = selectedSizes.has(s);
            return (
              <button
                key={s}
                onClick={() => {
                  const next = new Set(selectedSizes);
                  if (on) next.delete(s);
                  else next.add(s);
                  update("size", next);
                }}
                className={`h-9 min-w-9 px-3 border text-xs ${on ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-white" : "border-[var(--color-line)] hover:border-[var(--color-ink)]"}`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="text-xs tracking-[0.16em] uppercase mb-3">Color</div>
        <div className="flex flex-wrap gap-3">
          {COLORS.map((c) => {
            const on = selectedColors.has(c.value);
            return (
              <button
                key={c.value}
                aria-label={c.label}
                onClick={() => {
                  const next = new Set(selectedColors);
                  if (on) next.delete(c.value);
                  else next.add(c.value);
                  update("color", next);
                }}
                className={`h-8 w-8 rounded-full border-2 ${on ? "border-[var(--color-ink)]" : "border-[var(--color-line)]"}`}
                style={{ background: c.hex }}
              />
            );
          })}
        </div>
      </div>

      <div>
        <div className="text-xs tracking-[0.16em] uppercase mb-3">Availability</div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={params.get("instock") === "1"}
            onChange={(e) => {
              const next = new URLSearchParams(params.toString());
              if (e.target.checked) next.set("instock", "1");
              else next.delete("instock");
              router.push(`${basePath}?${next.toString()}`, { scroll: false });
            }}
          />
          In stock only
        </label>
      </div>

      <button
        onClick={() => router.push(basePath, { scroll: false })}
        className="link-underline text-xs tracking-[0.16em] uppercase"
      >
        Clear all
      </button>
    </aside>
  );
}
