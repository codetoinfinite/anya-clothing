import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { adminFetch } from "@/lib/medusa-admin";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { DeleteConfirm } from "@/components/Form";

type Loc = { id: string; name: string; address?: { city?: string; country_code?: string } };

async function deleteLocation(formData: FormData) {
  "use server";
  const id = String(formData.get("id"));
  await adminFetch(`/admin/stock-locations/${id}`, { method: "DELETE" });
  revalidatePath("/inventory/locations");
  redirect("/inventory/locations");
}

export default async function LocationsPage() {
  const data = await adminFetch<{ stock_locations: Loc[]; count: number }>(`/admin/stock-locations?fields=*address`);
  return (
    <div>
      <PageHeader title="Stock locations" actions={<Link href="/inventory/locations/new" className="btn btn-primary">New location</Link>} />
      <DataTable
        rows={data.stock_locations}
        columns={[
          { key: "name", header: "Name", cell: (r) => <div className="font-medium">{r.name}</div> },
          { key: "city", header: "City", cell: (r) => r.address?.city ?? "—" },
          { key: "country", header: "Country", cell: (r) => r.address?.country_code?.toUpperCase() ?? "—" },
          { key: "actions", header: "", cell: (r) => <DeleteConfirm action={deleteLocation} hidden={{ id: r.id }} label="Delete" /> },
        ]}
      />
    </div>
  );
}
