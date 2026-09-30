"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Route error:", error);
  }, [error]);

  return (
    <div className="container-narrow py-24 text-center space-y-6">
      <div className="eyebrow text-[var(--color-accent)]">Something broke</div>
      <h1 className="text-3xl md:text-5xl">We hit a snag.</h1>
      <p className="text-[var(--color-ink-muted)]">
        The page failed to load. Our team has been notified.
        {error.digest && <span className="block mt-2 text-xs">Ref: {error.digest}</span>}
      </p>
      <div className="flex gap-4 justify-center pt-4">
        <button onClick={reset} className="btn btn-primary">Try again</button>
        <Link href="/" className="btn btn-secondary">Go home</Link>
      </div>
    </div>
  );
}
