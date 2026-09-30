"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login } from "@/lib/auth";

export default function LoginPage() {
  const r = useRouter();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <div className="container-wide py-16 md:py-24 max-w-md mx-auto">
      <div className="eyebrow mb-2">Account</div>
      <h1 className="text-4xl">Welcome back.</h1>
      <form
        className="mt-8 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          setErr(null);
          start(async () => {
            const res = await login(email, pw);
            if (res.ok) r.push("/account");
            else setErr(res.error ?? "Could not sign in.");
          });
        }}
      >
        <Field label="Email" value={email} onChange={setEmail} type="email" />
        <Field label="Password" value={pw} onChange={setPw} type="password" />
        {err && <div className="text-sm text-[var(--color-sale)]">{err}</div>}
        <button className="btn btn-primary w-full h-12" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="mt-6 text-sm text-[var(--color-ink-muted)]">
        New here? <Link href="/register" className="link-underline">Create an account</Link>
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
