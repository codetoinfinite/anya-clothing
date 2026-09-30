"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import type { NavGroup } from "@/lib/nav";

export function MegaMenu({ group }: { group: NavGroup | null }) {
  return (
    <AnimatePresence>
      {group?.columns && (
        <motion.div
          key={group.label}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="absolute left-0 right-0 top-full bg-[var(--color-bg)] border-t border-[var(--color-line)] shadow-[var(--shadow-elevated)]"
        >
          <div className="container-wide grid grid-cols-[repeat(4,minmax(0,1fr))] gap-10 py-10">
            {group.columns.map((col) => (
              <div key={col.heading}>
                <div className="eyebrow mb-4">{col.heading}</div>
                <ul className="space-y-2 text-sm">
                  {col.items.map((it) => (
                    <li key={it.href}>
                      <Link href={it.href} className="link-underline inline-block">
                        {it.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="col-span-2 flex items-end justify-end">
              <Link
                href={group.href}
                className="btn btn-outline"
              >
                Shop all {group.label.toLowerCase()}
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
