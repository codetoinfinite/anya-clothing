import Link from "next/link";
import { adminFetch } from "@/lib/medusa-admin";
import { PageHeader } from "@/components/PageHeader";
import { DataTable, Pagination } from "@/components/DataTable";
import { parseInt32, parseStr } from "@/lib/search-params";
import { formatDate } from "@/lib/utils";

type Customer = { id: string; email: string; first_name?: string | null; last_name?: string | null; has_account?: boolean; created_at: string };

export default async function CustomersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const limit = parseInt32(sp.limit, 25);
  const offset = parseInt32(sp.offset, 0);
  const q = parseStr(sp.q);
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  if (q) params.set("q", q);
  const data = await adminFetch<{ customers: Customer[]; count: number }>(`/admin/customers?${params}`);
  return (
    <div>
      <PageHeader title="Customers" actions={<Link href="/customers/new" className="btn btn-primary">New customer</Link>} />
      <form className="card p-3 mb-4 flex gap-2"><input name="q" defaultValue={q ?? ""} className="input flex-1" placeholder="Search email / name" /><button className="btn btn-outline">Filter</button></form>
      <DataTable
        rows={data.customers}
        rowHref={(r) => `/customers/${r.id}`}
        columns={[
          { key: "email", header: "Email", cell: (r) => <div className="font-medium">{r.email}</div> },
          { key: "name", header: "Name", cell: (r) => [r.first_name, r.last_name].filter(Boolean).join(" ") || "—" },
          { key: "account", header: "Account", cell: (r) => r.has_account ? "yes" : "guest", width: "100px" },
          { key: "created_at", header: "Created", cell: (r) => formatDate(r.created_at), width: "180px" },
        ]}
      />
      <Pagination basePath="/customers" query={{ q }} limit={limit} offset={offset} total={data.count} />
    </div>
  );
}
