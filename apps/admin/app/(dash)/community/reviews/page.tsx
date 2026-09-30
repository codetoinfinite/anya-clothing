import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { adminFetch } from "@/lib/medusa-admin";
import { PageHeader } from "@/components/PageHeader";
import { DataTable, Pagination, Badge } from "@/components/DataTable";
import { parseInt32, parseStr } from "@/lib/search-params";
import { formatDate } from "@/lib/utils";

type Review = {
  id: string;
  product_id: string;
  customer_name: string | null;
  customer_email: string | null;
  rating: number;
  title: string | null;
  body: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

async function approveReview(formData: FormData) {
  "use server";
  const id = String(formData.get("id"));
  await adminFetch(`/admin/reviews/${id}/approve`, { method: "POST", body: JSON.stringify({}) });
  revalidatePath("/community/reviews");
}

async function rejectReview(formData: FormData) {
  "use server";
  const id = String(formData.get("id"));
  await adminFetch(`/admin/reviews/${id}/reject`, { method: "POST", body: JSON.stringify({}) });
  revalidatePath("/community/reviews");
}

async function deleteReview(formData: FormData) {
  "use server";
  const id = String(formData.get("id"));
  await adminFetch(`/admin/reviews/${id}`, { method: "DELETE" });
  revalidatePath("/community/reviews");
}

const STATUSES = ["pending", "approved", "rejected"] as const;

export default async function ReviewsPage({ searchParams }: { searchParams: Promise<{ status?: string; limit?: string; offset?: string }> }) {
  const sp = await searchParams;
  const status = parseStr(sp.status) ?? "pending";
  const limit = parseInt32(sp.limit, 25);
  const offset = parseInt32(sp.offset, 0);
  const qs = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  if (status !== "all") qs.set("status", status);
  const data = await adminFetch<{ reviews: Review[]; count: number }>(`/admin/reviews?${qs}`);

  return (
    <div>
      <PageHeader title="Reviews" subtitle="Moderate customer reviews. Approved reviews appear on the storefront." />
      <div className="card p-3 mb-4 flex gap-2 text-sm">
        {(["pending", "approved", "rejected", "all"] as const).map((s) => (
          <Link key={s} href={`/community/reviews?status=${s}`} className={`px-3 py-1 rounded-md ${status === s ? "bg-[var(--color-accent)] text-white" : "hover:bg-[var(--color-surface-alt)]"}`}>
            {s}
          </Link>
        ))}
      </div>
      <DataTable
        rows={data.reviews}
        columns={[
          { key: "rating", header: "★", width: "60px", cell: (r) => <span className="font-mono">{r.rating}/5</span> },
          { key: "review", header: "Review", cell: (r) => (
            <div className="space-y-1">
              <div className="font-medium">{r.title ?? "(no title)"}</div>
              <div className="text-xs text-[var(--color-ink-muted)] line-clamp-2">{r.body}</div>
              <div className="text-xs text-[var(--color-ink-muted)]">— {r.customer_name ?? r.customer_email ?? "anonymous"} · product {r.product_id}</div>
            </div>
          )},
          { key: "status", header: "Status", width: "110px", cell: (r) => <Badge tone={r.status === "approved" ? "success" : r.status === "rejected" ? "danger" : "warn"}>{r.status}</Badge> },
          { key: "created_at", header: "Created", width: "150px", cell: (r) => formatDate(r.created_at) },
          { key: "actions", header: "", width: "260px", cell: (r) => (
            <div className="flex gap-1">
              {r.status !== "approved" ? (
                <form action={approveReview}><input type="hidden" name="id" value={r.id} /><button className="btn btn-outline text-xs">Approve</button></form>
              ) : null}
              {r.status !== "rejected" ? (
                <form action={rejectReview}><input type="hidden" name="id" value={r.id} /><button className="btn btn-outline text-xs">Reject</button></form>
              ) : null}
              <form action={deleteReview}><input type="hidden" name="id" value={r.id} /><button className="btn btn-outline text-xs" style={{ color: "var(--color-danger)" }}>Delete</button></form>
            </div>
          )},
        ]}
      />
      <Pagination basePath="/community/reviews" query={{ status }} limit={limit} offset={offset} total={data.count} />
    </div>
  );
}
