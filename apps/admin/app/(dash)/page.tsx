import { adminFetch, AdminFetchError } from "@/lib/medusa-admin";

async function safeCount(path: string): Promise<number | null> {
  try {
    const r = await adminFetch<{ count?: number }>(path);
    return typeof r.count === "number" ? r.count : null;
  } catch (e) {
    if (e instanceof AdminFetchError) return null;
    return null;
  }
}

export default async function DashboardPage() {
  const [orders, products, customers, pendingReviews, contactNew, newsletter] = await Promise.all([
    safeCount("/admin/orders?limit=1"),
    safeCount("/admin/products?limit=1"),
    safeCount("/admin/customers?limit=1"),
    safeCount("/admin/reviews?status=pending&limit=1"),
    safeCount("/admin/contact?status=new&limit=1"),
    safeCount("/admin/newsletter?status=confirmed&limit=1"),
  ]);

  const kpis = [
    { label: "Orders", value: orders },
    { label: "Products", value: products },
    { label: "Customers", value: customers },
    { label: "Pending reviews", value: pendingReviews },
    { label: "New contact", value: contactNew },
    { label: "Subscribers", value: newsletter },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-[var(--color-ink-muted)] mt-1">Snapshot of the store.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map((k) => (
          <div key={k.label} className="card p-4">
            <div className="text-xs text-[var(--color-ink-muted)] uppercase tracking-wide">{k.label}</div>
            <div className="text-2xl font-semibold mt-1">{k.value ?? "—"}</div>
          </div>
        ))}
      </div>
      <div className="card p-6">
        <h2 className="font-semibold">Welcome</h2>
        <p className="text-sm text-[var(--color-ink-muted)] mt-1">
          Use the nav to manage catalog, sales, customers, content, and community.
        </p>
      </div>
    </div>
  );
}
