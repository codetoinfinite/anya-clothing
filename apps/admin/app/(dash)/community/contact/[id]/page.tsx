import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { adminFetch } from "@/lib/medusa-admin";
import { PageHeader } from "@/components/PageHeader";
import { Field, FormError, DeleteConfirm } from "@/components/Form";
import { Badge } from "@/components/DataTable";
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
  replied_by_user_id: string | null;
  created_at: string;
};

async function markRead(formData: FormData) {
  "use server";
  const id = String(formData.get("id"));
  await adminFetch(`/admin/contact/${id}`, { method: "POST", body: JSON.stringify({ status: "read" }) });
  revalidatePath("/community/contact");
  revalidatePath(`/community/contact/${id}`);
}

async function reply(formData: FormData) {
  "use server";
  const id = String(formData.get("id"));
  const note = String(formData.get("note") ?? "").trim();
  if (!note) redirect(`/community/contact/${id}?error=Reply+cannot+be+empty`);
  // Backend has no reply route yet — record reply by setting status + replied_at.
  // The mail send happens out-of-band; the admin only marks the workflow state for now.
  await adminFetch(`/admin/contact/${id}`, { method: "POST", body: JSON.stringify({ status: "replied", replied_at: new Date().toISOString() }) });
  revalidatePath("/community/contact");
  revalidatePath(`/community/contact/${id}`);
  redirect(`/community/contact/${id}?ok=1`);
}

async function archive(formData: FormData) {
  "use server";
  const id = String(formData.get("id"));
  await adminFetch(`/admin/contact/${id}`, { method: "POST", body: JSON.stringify({ status: "archived" }) });
  revalidatePath("/community/contact");
  redirect("/community/contact");
}

async function deleteSub(formData: FormData) {
  "use server";
  const id = String(formData.get("id"));
  await adminFetch(`/admin/contact/${id}`, { method: "DELETE" });
  revalidatePath("/community/contact");
  redirect("/community/contact");
}

export default async function ContactDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; ok?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const { submission: s } = await adminFetch<{ submission: Sub }>(`/admin/contact/${id}`);
  if (s.status === "new") {
    // best-effort mark-as-read on view
    try { await adminFetch(`/admin/contact/${id}`, { method: "POST", body: JSON.stringify({ status: "read" }) }); } catch {}
  }
  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader title={s.subject ?? `Message from ${s.name}`} back={{ href: "/community/contact", label: "Contact" }} subtitle={`From ${s.name} <${s.email}>`} />
      <FormError message={sp.error} />
      {sp.ok ? <div className="text-sm text-[var(--color-success)]">Saved.</div> : null}

      <div className="card p-5 space-y-3">
        <div className="flex items-center gap-3 text-sm">
          <Badge tone={s.status === "new" ? "warn" : s.status === "replied" ? "success" : s.status === "archived" ? "default" : "info"}>{s.status}</Badge>
          <span className="text-[var(--color-ink-muted)]">Received {formatDate(s.created_at)}</span>
          {s.replied_at ? <span className="text-[var(--color-ink-muted)]">· Replied {formatDate(s.replied_at)}</span> : null}
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><div className="text-[var(--color-ink-muted)] text-xs">Email</div><div>{s.email}</div></div>
          <div><div className="text-[var(--color-ink-muted)] text-xs">Phone</div><div>{s.phone ?? "—"}</div></div>
        </div>
        <div>
          <div className="text-[var(--color-ink-muted)] text-xs mb-1">Message</div>
          <div className="whitespace-pre-wrap text-sm">{s.message}</div>
        </div>
      </div>

      <form action={reply} className="card p-5 space-y-3">
        <input type="hidden" name="id" value={s.id} />
        <h2 className="font-semibold">Reply</h2>
        <p className="text-xs text-[var(--color-ink-muted)]">Sending email integration arrives with Resend setup. For now this records that you replied so the inbox stays clean.</p>
        <Field label="Reply note" name="note"><textarea name="note" rows={6} className="textarea" placeholder={`Hi ${s.name},\n\n...`} /></Field>
        <div className="flex gap-2">
          <button className="btn btn-primary">Mark replied</button>
          <button formAction={markRead} className="btn btn-outline">Mark read</button>
          <button formAction={archive} className="btn btn-outline">Archive</button>
          <Link href={`mailto:${s.email}?subject=Re: ${encodeURIComponent(s.subject ?? "your message")}`} className="btn btn-outline">Open in mail app</Link>
        </div>
      </form>

      <div className="card p-5">
        <h2 className="font-semibold mb-2">Danger zone</h2>
        <DeleteConfirm action={deleteSub} hidden={{ id }} label="Delete submission" />
      </div>
    </div>
  );
}
