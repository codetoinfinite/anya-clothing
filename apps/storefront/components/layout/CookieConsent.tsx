"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const KEY = "aanya_cookie_consent";

type Choice = "all" | "essential";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

export function CookieConsent() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
    if (!stored) setOpen(true);
    else if (stored === "all") grant();
  }, []);

  function grant() {
    if (typeof window === "undefined") return;
    window.gtag?.("consent", "update", {
      ad_storage: "granted",
      analytics_storage: "granted",
      ad_user_data: "granted",
      ad_personalization: "granted",
    });
    window.fbq?.("consent", "grant");
  }

  function choose(c: Choice) {
    localStorage.setItem(KEY, c);
    if (c === "all") grant();
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-4 inset-x-4 md:left-auto md:right-6 md:bottom-6 md:max-w-md bg-[var(--color-bg)] border border-[var(--color-line)] p-5 z-50 shadow-lg"
    >
      <h2 className="text-base font-medium">Cookies on Aanya</h2>
      <p className="text-sm text-[var(--color-ink-muted)] mt-2 leading-relaxed">
        We use essential cookies to run the store. With your consent we also use analytics cookies to improve the
        experience. See our <Link href="/privacy" className="link-underline">privacy policy</Link>.
      </p>
      <div className="flex gap-3 mt-4">
        <button onClick={() => choose("essential")} className="btn btn-secondary text-sm flex-1">
          Essential only
        </button>
        <button onClick={() => choose("all")} className="btn btn-primary text-sm flex-1">
          Accept all
        </button>
      </div>
    </div>
  );
}
