import Link from "next/link";
import { adminFetch } from "@/lib/medusa-admin";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { formatDate } from "@/lib/utils";

type Page = { id: string; slug: string; title: string; updated_at: string };

export default async function PagesIndex() {
  const data = await adminFetch<{ pages: Page[]; count: number }>(`/admin/cms/pages?limit=100`);
  return (
    <div>
      <PageHeader title="Pages" subtitle="Static pages (About, Shipping, FAQ, …)." actions={<Link href="/content/pages/new" className="btn btn-primary">New page</Link>} />
      <DataTable
        rows={data.pages}
        rowHref={(r) => `/content/pages/${r.id}`}
        columns={[
          { key: "title", header: "Title", cell: (r) => <div><div className="font-medium">{r.title}</div><div className="text-xs text-[var(--color-ink-muted)]">/{r.slug}</div></div> },
          { key: "updated_at", header: "Updated", cell: (r) => formatDate(r.updated_at), width: "200px" },
        ]}
      />
    </div>
  );
}
