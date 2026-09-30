import Link from "next/link";
import { getToken, clearToken } from "@/lib/auth";
import { RedirectToLogin } from "@/components/RedirectToLogin";
import { getCurrentUser, canRead } from "@/lib/roles";
import { redirect } from "next/navigation";

const NAV: { group: string; items: { href: string; label: string }[] }[] = [
  { group: "Overview", items: [{ href: "/", label: "Dashboard" }] },
  {
    group: "Catalog",
    items: [
      { href: "/catalog/products", label: "Products" },
      { href: "/catalog/collections", label: "Collections" },
      { href: "/catalog/categories", label: "Categories" },
    ],
  },
  {
    group: "Sales",
    items: [
      { href: "/sales/orders", label: "Orders" },
      { href: "/sales/discounts", label: "Discounts" },
    ],
  },
  {
    group: "Customers",
    items: [
      { href: "/customers", label: "Customers" },
      { href: "/customers/groups", label: "Groups" },
    ],
  },
  {
    group: "Inventory",
    items: [
      { href: "/inventory/items", label: "Items" },
      { href: "/inventory/locations", label: "Locations" },
    ],
  },
  {
    group: "Content",
    items: [
      { href: "/content/blog", label: "Blog" },
      { href: "/content/pages", label: "Pages" },
      { href: "/content/home", label: "Home" },
    ],
  },
  {
    group: "Community",
    items: [
      { href: "/community/reviews", label: "Reviews" },
      { href: "/community/wishlists", label: "Wishlists" },
      { href: "/community/newsletter", label: "Newsletter" },
      { href: "/community/contact", label: "Contact" },
    ],
  },
  {
    group: "Settings",
    items: [
      { href: "/settings/store", label: "Store" },
      { href: "/settings/shipping", label: "Shipping" },
      { href: "/settings/regions", label: "Regions" },
      { href: "/settings/users", label: "Users" },
      { href: "/settings/activity", label: "Activity" },
    ],
  },
];

async function signOutAction() {
  "use server";
  await clearToken();
  redirect("/login");
}

export default async function DashLayout({ children }: { children: React.ReactNode }) {
  if (!(await getToken())) return <RedirectToLogin />;
  const me = await getCurrentUser();
  const role = me?.role ?? "readonly";
  const visibleGroups = NAV
    .map((g) => ({ ...g, items: g.items.filter((it) => canRead(role, it.href)) }))
    .filter((g) => g.items.length > 0);
  return (
    <div className="min-h-screen flex bg-[var(--color-bg)]">
      <aside className="w-60 shrink-0 border-r border-[var(--color-border)] bg-[var(--color-surface)] sticky top-0 h-screen overflow-y-auto">
        <div className="px-4 py-4 border-b border-[var(--color-border)]">
          <div className="text-sm font-semibold">Aanya Admin</div>
          <div className="text-xs text-[var(--color-ink-muted)]">byshree.com</div>
        </div>
        <nav className="px-2 py-3 space-y-4">
          {visibleGroups.map((g) => (
            <div key={g.group}>
              <div className="px-2 text-[10px] uppercase tracking-wide text-[var(--color-ink-muted)] mb-1">{g.group}</div>
              <ul className="space-y-0.5">
                {g.items.map((it) => (
                  <li key={it.href}>
                    <Link href={it.href} className="block px-2 py-1.5 rounded text-sm hover:bg-[var(--color-bg)]">
                      {it.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
      <div className="flex-1 min-w-0">
        <header className="h-14 border-b border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center gap-3 text-sm text-[var(--color-ink-muted)]">
            <span>{process.env.NODE_ENV === "production" ? "Production" : "Development"}</span>
            {me ? <span className="text-xs px-2 py-0.5 rounded bg-[var(--color-surface-2)]">{me.email} · {role}</span> : null}
          </div>
          <form action={signOutAction}>
            <button type="submit" className="btn btn-outline text-sm">Sign out</button>
          </form>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
