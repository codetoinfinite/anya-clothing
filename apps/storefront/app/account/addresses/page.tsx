import { redirect } from "next/navigation";
import { getCustomer } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AddressesPage() {
  const c = await getCustomer();
  if (!c) redirect("/login");
  const addresses = c.addresses ?? [];
  return (
    <div className="container-wide py-12 md:py-16">
      <div className="eyebrow mb-2">Account · Addresses</div>
      <h1 className="text-4xl md:text-5xl mb-8">Saved addresses</h1>
      {addresses.length === 0 ? (
        <div className="border border-[var(--color-line)] p-12 text-center text-sm text-[var(--color-ink-muted)]">
          No saved addresses yet. Addresses you use at checkout will appear here.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {addresses.map((a) => (
            <div key={a.id} className="border border-[var(--color-line)] p-5 text-sm">
              <div className="font-medium">{a.first_name} {a.last_name}</div>
              <div className="mt-1 text-[var(--color-ink-muted)]">
                {a.address_1}{a.address_2 ? `, ${a.address_2}` : ""}<br />
                {a.city}, {a.province} {a.postal_code}<br />
                {a.country_code?.toUpperCase()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
