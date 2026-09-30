import { adminFetch } from "@/lib/medusa-admin";
import { PageHeader } from "@/components/PageHeader";
import { DataTable, Pagination, Badge } from "@/components/DataTable";
import { parseInt32, parseStr } from "@/lib/search-params";
import { formatDate, formatMoney } from "@/lib/utils";

type Order = {
  id: string;
  display_id: number;
  email: string;
  status: string;
  payment_status: string;
  fulfillment_status: string;
  total: number;
  currency_code: string;
  created_at: string;
};

export default async function OrdersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const limit = parseInt32(sp.limit, 25);
  const offset = parseInt32(sp.offset, 0);
  const q = parseStr(sp.q);
  const status = parseStr(sp.status);
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  if (q) params.set("q", q);
  if (status) params.set("status[]", status);
  const data = await adminFetch<{ orders: Order[]; count: number }>(`/admin/orders?${params}`);
  return (
    <div>
      <PageHeader title="Orders" subtitle="All customer orders." />
      <form className="card p-3 mb-4 flex gap-2">
        <input name="q" defaultValue={q ?? ""} className="input flex-1" placeholder="Search email / order id" />
        <select name="status" defaultValue={status ?? ""} className="input w-40">
          <option value="">All status</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="canceled">Canceled</option>
          <option value="archived">Archived</option>
        </select>
        <button className="btn btn-outline">Filter</button>
      </form>
      <DataTable
        rows={data.orders}
        rowHref={(r) => `/sales/orders/${r.id}`}
        columns={[
          { key: "id", header: "Order", cell: (r) => <div className="font-medium">#{r.display_id}</div>, width: "100px" },
          { key: "email", header: "Customer", cell: (r) => r.email ?? "—" },
          { key: "status", header: "Status", cell: (r) => <Badge tone={r.status === "completed" ? "success" : r.status === "canceled" ? "danger" : "warn"}>{r.status}</Badge>, width: "120px" },
          { key: "payment", header: "Payment", cell: (r) => <Badge tone={r.payment_status === "captured" ? "success" : "default"}>{r.payment_status}</Badge>, width: "120px" },
          { key: "fulfillment", header: "Fulfillment", cell: (r) => <Badge tone={r.fulfillment_status === "fulfilled" ? "success" : "default"}>{r.fulfillment_status}</Badge>, width: "140px" },
          { key: "total", header: "Total", cell: (r) => formatMoney(r.total, r.currency_code), width: "120px" },
          { key: "created_at", header: "Date", cell: (r) => formatDate(r.created_at), width: "180px" },
        ]}
        empty="No orders yet. Test by placing an order from the storefront."
      />
      <Pagination basePath="/sales/orders" query={{ q, status }} limit={limit} offset={offset} total={data.count} />
    </div>
  );
}
