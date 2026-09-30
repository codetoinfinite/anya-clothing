"use client";

import { useState, useTransition } from "react";
import { subscribeNewsletter } from "@/lib/contact";

export function NewsletterCTA() {
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <section className="bg-[var(--color-bg-deep)]">
      <div className="container-wide py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <div className="eyebrow mb-2">The List</div>
          <h2 className="text-3xl md:text-4xl">10% off your first order.</h2>
          <p className="mt-3 text-[var(--color-ink-muted)] max-w-md">
            Early access to drops, restocks, and quiet sales. Unsubscribe in one click.
          </p>
        </div>
        <form
          action={(fd) =>
            start(async () => {
              setErr(null);
              const r = await subscribeNewsletter(fd);
              if (!r.ok) setErr(r.error ?? "Try again."); else setDone(true);
            })
          }
          className="flex flex-col sm:flex-row gap-2"
        >
          {done ? (
            <div className="flex items-center text-sm">
              <span className="mr-2 text-[var(--color-success)]">✓</span>
              Thanks — check your inbox for a confirmation.
            </div>
          ) : (
            <>
              <input
                type="email"
                name="email"
                required
                placeholder="your@email.com"
                className="flex-1 h-11 px-4 bg-white border border-[var(--color-line)] outline-none focus:border-[var(--color-ink)]"
              />
              <button disabled={pending} className="btn btn-primary">{pending ? "…" : "Subscribe"}</button>
            </>
          )}
          {err && <p className="text-xs text-[var(--color-sale)] mt-2 sm:mt-0">{err}</p>}
        </form>
      </div>
    </section>
  );
}
