"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { register } from "@/lib/auth";

export default function RegisterPage() {
  const r = useRouter();
  const [f, setF] = useState({ first_name: "", last_name: "", email: "", password: "" });
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <div className="container-wide py-16 md:py-24 max-w-md mx-auto">
      <div className="eyebrow mb-2">Account</div>
      <h1 className="text-4xl">Create your account.</h1>
      <form
        className="mt-8 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          setErr(null);
          start(async () => {
            const res = await register(f);
            if (res.ok) r.push("/account");
            else setErr(res.error ?? "Could not register.");
          });
        }}
      >
        <div className="grid grid-cols-2 gap-3">
          <Field label="First name" value={f.first_name} onChange={(v) => setF({ ...f, first_name: v })} />
          <Field label="Last name" value={f.last_name} onChange={(v) => setF({ ...f, last_name: v })} />
        </div>
        <Field label="Email" value={f.email} onChange={(v) => setF({ ...f, email: v })} type="email" />
        <Field label="Password" value={f.password} onChange={(v) => setF({ ...f, password: v })} type="password" />
        {err && <div className="text-sm text-[var(--color-sale)]">{err}</div>}
        <button className="btn btn-primary w-full h-12" disabled={pending}>
          {pending ? "Creating…" : "Create account"}
        </button>
      </form>
      <p className="mt-6 text-sm text-[var(--color-ink-muted)]">
        Already a customer? <Link href="/login" className="link-underline">Sign in</Link>
      </p>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="block">
      <span className="text-xs tracking-[0.14em] uppercase">{label}</span>
      <input
        type={type}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 h-11 w-full border border-[var(--color-line)] px-3 focus:border-[var(--color-ink)] outline-none"
      />
    </label>
  );
}
