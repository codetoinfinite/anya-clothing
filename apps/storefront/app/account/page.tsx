import Link from "next/link";
import { redirect } from "next/navigation";
import { getCustomer, logout } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const c = await getCustomer();
  if (!c) redirect("/login");

  const tiles = [
    { label: "Orders", href: "/account/orders", body: "Track and reorder past pieces." },
    { label: "Addresses", href: "/account/addresses", body: "Manage shipping addresses." },
    { label: "Wishlist", href: "/account/wishlist", body: "Pieces you've saved for later." },
  ];

  return (
    <div className="container-wide py-12 md:py-16">
      <div className="flex items-end justify-between mb-10">
        <div>
          <div className="eyebrow mb-2">Account</div>
          <h1 className="text-4xl md:text-5xl">Hello, {c.first_name ?? "there"}.</h1>
          <p className="mt-2 text-sm text-[var(--color-ink-muted)]">{c.email}</p>
        </div>
        <form action={logout}>
          <button className="btn btn-outline" type="submit">Sign out</button>
        </form>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {tiles.map((t) => (
          <Link key={t.href} href={t.href} className="block border border-[var(--color-line)] p-6 hover:border-[var(--color-ink)] transition-colors">
            <div className="text-xs tracking-[0.14em] uppercase">{t.label}</div>
            <p className="mt-3 text-sm text-[var(--color-ink-muted)]">{t.body}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
