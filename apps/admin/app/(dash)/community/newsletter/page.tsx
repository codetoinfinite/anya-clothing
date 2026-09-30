import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { adminFetch } from "@/lib/medusa-admin";
import { PageHeader } from "@/components/PageHeader";
import { DataTable, Pagination, Badge } from "@/components/DataTable";
import { parseInt32, parseStr } from "@/lib/search-params";
import { formatDate } from "@/lib/utils";

type Sub = {
  id: string;
  email: string;
  status: "pending" | "confirmed" | "unsubscribed";
  source: string | null;
  confirmed_at: string | null;
  unsubscribed_at: string | null;
  created_at: string;
};

async function unsubscribe(formData: FormData) {
  "use server";
  const id = String(formData.get("id"));
  await adminFetch(`/admin/newsletter/${id}`, { method: "POST", body: JSON.stringify({ status: "unsubscribed", unsubscribed_at: new Date().toISOString() }) });
  revalidatePath("/community/newsletter");
}

async function confirmSub(formData: FormData) {
  "use server";
  const id = String(formData.get("id"));
  await adminFetch(`/admin/newsletter/${id}`, { method: "POST", body: JSON.stringify({ status: "confirmed", confirmed_at: new Date().toISOString() }) });
  revalidatePath("/community/newsletter");
}

async function deleteSub(formData: FormData) {
  "use server";
  const id = String(formData.get("id"));
  await adminFetch(`/admin/newsletter/${id}`, { method: "DELETE" });
  revalidatePath("/community/newsletter");
}

async function exportCsv(formData: FormData) {
  "use server";
  const status = String(formData.get("status") ?? "confirmed");
  const data = await adminFetch<{ subscribers: Sub[] }>(`/admin/newsletter?limit=10000${status !== "all" ? `&status=${status}` : ""}`);
  const csv = ["email,status,source,created_at,confirmed_at", ...data.subscribers.map((s) => `${s.email},${s.status},${s.source ?? ""},${s.created_at},${s.confirmed_at ?? ""}`)].join("\n");
  // Stash result in query param so caller can render a link — but server actions can't return files easily;
  // instead redirect to a data-uri page rendered client-side.
  redirect(`/community/newsletter?ok=1&csv=${encodeURIComponent(csv)}`);
}

export default async function NewsletterPage({ searchParams }: { searchParams: Promise<{ status?: string; limit?: string; offset?: string; csv?: string }> }) {
  const sp = await searchParams;
  const status = parseStr(sp.status) ?? "all";
  const limit = parseInt32(sp.limit, 50);
  const offset = parseInt32(sp.offset, 0);
  const qs = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  if (status !== "all") qs.set("status", status);
  const data = await adminFetch<{ subscribers: Sub[]; count: number }>(`/admin/newsletter?${qs}`);

  return (
    <div>
      <PageHeader title="Newsletter" subtitle="Subscribers and their consent state." actions={
        <form action={exportCsv}>
          <input type="hidden" name="status" value={status} />
          <button className="btn btn-outline">Export CSV ({status})</button>
        </form>
      } />
      <div className="card p-3 mb-4 flex gap-2 text-sm">
        {(["all", "pending", "confirmed", "unsubscribed"] as const).map((s) => (
          <Link key={s} href={`/community/newsletter?status=${s}`} className={`px-3 py-1 rounded-md ${status === s ? "bg-[var(--color-accent)] text-white" : "hover:bg-[var(--color-surface-alt)]"}`}>{s}</Link>
        ))}
      </div>
      {sp.csv ? (
        <div className="card p-4 mb-4 text-xs">
          <div className="mb-2 font-semibold">CSV (copy):</div>
          <textarea readOnly className="textarea font-mono" rows={6} defaultValue={decodeURIComponent(sp.csv)} />
        </div>
      ) : null}
      <DataTable
        rows={data.subscribers}
        columns={[
          { key: "email", header: "Email", cell: (r) => <span className="font-mono text-sm">{r.email}</span> },
          { key: "status", header: "Status", width: "120px", cell: (r) => <Badge tone={r.status === "confirmed" ? "success" : r.status === "unsubscribed" ? "danger" : "warn"}>{r.status}</Badge> },
          { key: "source", header: "Source", width: "120px", cell: (r) => r.source ?? "—" },
          { key: "created_at", header: "Joined", width: "160px", cell: (r) => formatDate(r.created_at) },
          { key: "actions", header: "", width: "240px", cell: (r) => (
            <div className="flex gap-1">
              {r.status === "pending" ? <form action={confirmSub}><input type="hidden" name="id" value={r.id} /><button className="btn btn-outline text-xs">Confirm</button></form> : null}
              {r.status !== "unsubscribed" ? <form action={unsubscribe}><input type="hidden" name="id" value={r.id} /><button className="btn btn-outline text-xs">Unsubscribe</button></form> : null}
              <form action={deleteSub}><input type="hidden" name="id" value={r.id} /><button className="btn btn-outline text-xs" style={{ color: "var(--color-danger)" }}>Delete</button></form>
            </div>
          )},
        ]}
      />
      <Pagination basePath="/community/newsletter" query={{ status }} limit={limit} offset={offset} total={data.count} />
    </div>
  );
}
