import { redirect } from "next/navigation";
import { signIn, getToken } from "@/lib/auth";

// Same-origin paths only: "//host" and "/\\host" are protocol-relative and would redirect off-site.
function safeFrom(v: unknown): string {
  const s = typeof v === "string" ? v : "";
  return s.startsWith("/") && !s.startsWith("//") && !s.startsWith("/\\") ? s : "/";
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ from?: string; error?: string }> }) {
  const sp = await searchParams;
  if (await getToken()) redirect(safeFrom(sp.from));

  async function action(formData: FormData) {
    "use server";
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const from = safeFrom(formData.get("from"));
    const r = await signIn(email, password);
    if (!r.ok) redirect(`/login?error=${encodeURIComponent(r.error)}${from ? `&from=${encodeURIComponent(from)}` : ""}`);
    redirect(from);
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <form action={action} className="card w-full max-w-sm p-6 space-y-4">
        <div>
          <h1 className="text-xl font-semibold">Aanya Admin</h1>
          <p className="text-sm text-[var(--color-ink-muted)] mt-1">Sign in to continue.</p>
        </div>
        {sp.error ? (
          <div className="text-sm text-[var(--color-danger)] bg-[#fee2e2] border border-[#fecaca] rounded px-3 py-2">{sp.error}</div>
        ) : null}
        <div>
          <label className="label block mb-1">Email</label>
          <input name="email" type="email" required autoComplete="username" className="input" defaultValue="admin@byshree.local" />
        </div>
        <div>
          <label className="label block mb-1">Password</label>
          <input name="password" type="password" required autoComplete="current-password" className="input" />
        </div>
        <input type="hidden" name="from" value={safeFrom(sp.from)} />
        <button type="submit" className="btn btn-primary w-full">Sign in</button>
      </form>
    </main>
  );
}
