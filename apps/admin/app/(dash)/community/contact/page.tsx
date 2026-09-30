import Link from "next/link";
import { adminFetch } from "@/lib/medusa-admin";
import { PageHeader } from "@/components/PageHeader";
import { DataTable, Pagination, Badge } from "@/components/DataTable";
import { parseInt32, parseStr } from "@/lib/search-params";
import { formatDate } from "@/lib/utils";

type Sub = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: "new" | "read" | "replied" | "archived";
  replied_at: string | null;
  created_at: string;
};

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ status?: string; limit?: string; offset?: string }> }) {
  const sp = await searchParams;
  const status = parseStr(sp.status) ?? "new";
  const limit = parseInt32(sp.limit, 25);
  const offset = parseInt32(sp.offset, 0);
  const qs = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  if (status !== "all") qs.set("status", status);
  const data = await adminFetch<{ submissions: Sub[]; count: number }>(`/admin/contact?${qs}`);

  return (
    <div>
      <PageHeader title="Contact submissions" subtitle="Customer enquiries from the storefront contact form." />
      <div className="card p-3 mb-4 flex gap-2 text-sm">
        {(["new", "read", "replied", "archived", "all"] as const).map((s) => (
          <Link key={s} href={`/community/contact?status=${s}`} className={`px-3 py-1 rounded-md ${status === s ? "bg-[var(--color-accent)] text-white" : "hover:bg-[var(--color-surface-alt)]"}`}>{s}</Link>
        ))}
      </div>
      <DataTable
        rows={data.submissions}
        rowHref={(r) => `/community/contact/${r.id}`}
        columns={[
          { key: "name", header: "From", cell: (r) => <div><div className="font-medium">{r.name}</div><div className="text-xs text-[var(--color-ink-muted)]">{r.email}</div></div> },
          { key: "subject", header: "Subject", cell: (r) => <div><div>{r.subject ?? "(no subject)"}</div><div className="text-xs text-[var(--color-ink-muted)] line-clamp-1">{r.message}</div></div> },
          { key: "status", header: "Status", width: "110px", cell: (r) => <Badge tone={r.status === "new" ? "warn" : r.status === "replied" ? "success" : r.status === "archived" ? "default" : "info"}>{r.status}</Badge> },
          { key: "created_at", header: "Received", width: "160px", cell: (r) => formatDate(r.created_at) },
        ]}
      />
      <Pagination basePath="/community/contact" query={{ status }} limit={limit} offset={offset} total={data.count} />
    </div>
  );
}
