import Link from "next/link";
import { adminFetch } from "@/lib/medusa-admin";
import { PageHeader } from "@/components/PageHeader";
import { DataTable, Pagination, Badge } from "@/components/DataTable";
import { parseInt32, parseStr } from "@/lib/search-params";

type Promo = {
  id: string;
  code: string;
  type: string;
  is_automatic: boolean;
  status: string;
  application_method?: { type: string; value: number; currency_code?: string };
};

export default async function DiscountsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const limit = parseInt32(sp.limit, 25);
  const offset = parseInt32(sp.offset, 0);
  const q = parseStr(sp.q);
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset), fields: "*application_method" });
  if (q) params.set("q", q);
  const data = await adminFetch<{ promotions: Promo[]; count: number }>(`/admin/promotions?${params}`);
  return (
    <div>
      <PageHeader title="Discounts" subtitle="Promotion codes and automatic discounts." actions={<Link href="/sales/discounts/new" className="btn btn-primary">New discount</Link>} />
      <form className="card p-3 mb-4 flex gap-2"><input name="q" defaultValue={q ?? ""} className="input flex-1" placeholder="Search code" /><button className="btn btn-outline">Filter</button></form>
      <DataTable
        rows={data.promotions}
        rowHref={(r) => `/sales/discounts/${r.id}`}
        columns={[
          { key: "code", header: "Code", cell: (r) => <div className="font-medium">{r.code}</div> },
          { key: "type", header: "Type", cell: (r) => r.type },
          { key: "value", header: "Value", cell: (r) => r.application_method ? (r.application_method.type === "percentage" ? `${r.application_method.value}%` : `${r.application_method.value} ${r.application_method.currency_code ?? ""}`) : "—" },
          { key: "auto", header: "Automatic", cell: (r) => r.is_automatic ? "yes" : "no" },
          { key: "status", header: "Status", cell: (r) => <Badge tone={r.status === "active" ? "success" : "default"}>{r.status}</Badge> },
        ]}
      />
      <Pagination basePath="/sales/discounts" query={{ q }} limit={limit} offset={offset} total={data.count} />
    </div>
  );
}
