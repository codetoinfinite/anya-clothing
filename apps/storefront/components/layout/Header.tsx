"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Search, User, Heart, ShoppingBag, Menu, X } from "lucide-react";
import { env } from "@/lib/env";
import { primaryNav } from "@/lib/nav";
import { cn } from "@/lib/cn";
import { MegaMenu } from "./MegaMenu";

export function Header({ cartCount = 0 }: { cartCount?: number }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 bg-[var(--color-bg)]/95 backdrop-blur transition-shadow",
        scrolled && "shadow-[0_1px_0_var(--color-line)]"
      )}
      onMouseLeave={() => setHoveredIndex(null)}
    >
      <div className="container-wide flex items-center justify-between gap-6 h-16 md:h-20">
        <button
          aria-label="Open menu"
          className="md:hidden p-2 -ml-2"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="font-[var(--font-display)] text-2xl md:text-3xl tracking-tight">
            {env.brandName}
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-sm">
          {primaryNav.map((group, i) => (
            <Link
              key={group.label}
              href={group.href}
              onMouseEnter={() => setHoveredIndex(group.columns ? i : null)}
              className={cn(
                "relative py-6 tracking-wide uppercase text-[0.78rem]",
                "hover:text-[var(--color-ink)]",
                group.highlight && "text-[var(--color-sale)] font-medium"
              )}
            >
              {group.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 md:gap-2 text-sm">
          <button aria-label="Search" className="p-2 hover:opacity-70">
            <Search className="h-5 w-5" />
          </button>
          <Link href="/account" aria-label="Account" className="p-2 hover:opacity-70 hidden md:inline-flex">
            <User className="h-5 w-5" />
          </Link>
          <Link href="/account/wishlist" aria-label="Wishlist" className="p-2 hover:opacity-70 hidden md:inline-flex">
            <Heart className="h-5 w-5" />
          </Link>
          <Link href="/cart" aria-label="Cart" className="p-2 hover:opacity-70 relative">
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 h-4 w-4 rounded-full bg-[var(--color-accent)] text-[10px] font-semibold text-[var(--color-accent-ink)] flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      <MegaMenu group={hoveredIndex !== null ? primaryNav[hoveredIndex] : null} />

      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-[var(--color-bg)] md:hidden">
          <div className="flex items-center justify-between h-16 px-4 border-b border-[var(--color-line)]">
            <span className="font-[var(--font-display)] text-2xl">{env.brandName}</span>
            <button aria-label="Close menu" onClick={() => setMobileOpen(false)} className="p-2">
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="px-6 py-4 divide-y divide-[var(--color-line)]">
            {primaryNav.map((g) => (
              <Link
                key={g.label}
                href={g.href}
                className="block py-4 text-base tracking-wide uppercase"
                onClick={() => setMobileOpen(false)}
              >
                {g.label}
              </Link>
            ))}
            <Link href="/account" className="block py-4 text-base" onClick={() => setMobileOpen(false)}>
              Account
            </Link>
            <Link href="/account/wishlist" className="block py-4 text-base" onClick={() => setMobileOpen(false)}>
              Wishlist
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
