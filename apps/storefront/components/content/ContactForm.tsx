"use client";

import { useState, useTransition } from "react";
import { submitContact } from "@/lib/contact";

export function ContactForm() {
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <form
      action={(fd) =>
        start(async () => {
          setErr(null);
          const r = await submitContact(fd);
          if (!r.ok) setErr(r.error ?? "Could not send. Try again."); else setDone(true);
        })
      }
      className="border border-[var(--color-line)] p-6 md:p-8 space-y-4"
    >
      {done ? (
        <div className="py-16 text-center">
          <div className="eyebrow mb-2 text-[var(--color-accent)]">Thank you</div>
          <h3 className="text-2xl">We&apos;ll be in touch shortly.</h3>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 gap-4">
            <Input name="name" label="Name" required />
            <Input name="email" type="email" label="Email" required />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Input name="phone" label="Phone" />
            <Input name="subject" label="Subject" />
          </div>
          <label className="block">
            <span className="eyebrow text-[var(--color-ink-muted)]">Message</span>
            <textarea name="message" rows={6} required className="mt-2 w-full border border-[var(--color-line)] bg-transparent p-3 focus:border-[var(--color-ink)] outline-none" />
          </label>
          {err && <p className="text-sm text-[var(--color-sale)]">{err}</p>}
          <button disabled={pending} className="btn btn-primary w-full md:w-auto">{pending ? "Sending…" : "Send message"}</button>
        </>
      )}
    </form>
  );
}

function Input({ name, label, type = "text", required }: { name: string; label: string; type?: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="eyebrow text-[var(--color-ink-muted)]">{label}{required && " *"}</span>
      <input name={name} type={type} required={required} className="mt-2 w-full border border-[var(--color-line)] bg-transparent p-3 focus:border-[var(--color-ink)] outline-none" />
    </label>
  );
}
