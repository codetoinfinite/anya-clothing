import { adminFetch } from "@/lib/medusa-admin";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";

type Profile = { id: string; name: string; type: string };
type Option = { id: string; name: string; price_type: string; shipping_profile_id: string; service_zone_id: string };

export default async function ShippingPage() {
  const [profiles, options] = await Promise.all([
    adminFetch<{ shipping_profiles: Profile[] }>(`/admin/shipping-profiles`),
    adminFetch<{ shipping_options: Option[] }>(`/admin/shipping-options`),
  ]);
  return (
    <div className="space-y-8">
      <PageHeader title="Shipping" subtitle="Profiles and shipping options." />
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Shipping profiles</h2>
        </div>
        <DataTable
          rows={profiles.shipping_profiles}
          columns={[
            { key: "name", header: "Name", cell: (r) => <div className="font-medium">{r.name}</div> },
            { key: "type", header: "Type", cell: (r) => r.type },
          ]}
        />
      </div>
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Shipping options</h2>
        </div>
        <DataTable
          rows={options.shipping_options}
          columns={[
            { key: "name", header: "Name", cell: (r) => <div className="font-medium">{r.name}</div> },
            { key: "price_type", header: "Pricing", cell: (r) => r.price_type },
            { key: "profile", header: "Profile", cell: (r) => r.shipping_profile_id },
            { key: "zone", header: "Zone", cell: (r) => r.service_zone_id },
          ]}
        />
      </div>
    </div>
  );
}
