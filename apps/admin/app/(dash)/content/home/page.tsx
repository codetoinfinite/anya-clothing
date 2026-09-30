import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { adminFetch } from "@/lib/medusa-admin";
import { notifyStorefront } from "@/lib/revalidate";
import { PageHeader } from "@/components/PageHeader";
import { Field, FormError } from "@/components/Form";
import { Badge } from "@/components/DataTable";

type Slot = {
  id: string;
  slot: string;
  position: number;
  payload: any;
  enabled: boolean;
  updated_at: string;
};

const SLOT_TYPES = ["hero", "category-grid", "featured-collection", "blog-preview", "promo"] as const;

async function createSlot(formData: FormData) {
  "use server";
  const slot = String(formData.get("slot") ?? "");
  const position = Number(formData.get("position") ?? 0);
  const enabled = formData.get("enabled") === "on";
  const payloadRaw = String(formData.get("payload") ?? "{}");
  let payload: any;
  try { payload = JSON.parse(payloadRaw); }
  catch { redirect(`/content/home?error=${encodeURIComponent("Payload must be valid JSON")}`); }
  try { await adminFetch("/admin/cms/home-slots", { method: "POST", body: JSON.stringify({ slot, position, payload, enabled }) }); }
  catch (e: any) { redirect(`/content/home?error=${encodeURIComponent(e?.payload?.message ?? "Failed")}`); }
  revalidatePath("/content/home");
  await notifyStorefront({ tags: ["home-slots"], paths: ["/"] });
  redirect("/content/home?ok=1");
}

async function updateSlot(formData: FormData) {
  "use server";
  const id = String(formData.get("id"));
  const slot = String(formData.get("slot") ?? "");
  const position = Number(formData.get("position") ?? 0);
  const enabled = formData.get("enabled") === "on";
  const payloadRaw = String(formData.get("payload") ?? "{}");
  let payload: any;
  try { payload = JSON.parse(payloadRaw); }
  catch { redirect(`/content/home?error=${encodeURIComponent("Payload must be valid JSON for " + id)}`); }
  try { await adminFetch(`/admin/cms/home-slots/${id}`, { method: "POST", body: JSON.stringify({ slot, position, payload, enabled }) }); }
  catch (e: any) { redirect(`/content/home?error=${encodeURIComponent(e?.payload?.message ?? "Failed")}`); }
  revalidatePath("/content/home");
  await notifyStorefront({ tags: ["home-slots"], paths: ["/"] });
  redirect("/content/home?ok=1");
}

async function deleteSlot(formData: FormData) {
  "use server";
  const id = String(formData.get("id"));
  await adminFetch(`/admin/cms/home-slots/${id}`, { method: "DELETE" });
  revalidatePath("/content/home");
  await notifyStorefront({ tags: ["home-slots"], paths: ["/"] });
  redirect("/content/home?ok=1");
}

const PAYLOAD_HINTS: Record<string, string> = {
  hero: '{ "headline": "...", "subhead": "...", "cta_label": "Shop", "cta_href": "/collections/all", "image": "https://..." }',
  "category-grid": '{ "categories": [{ "label": "...", "href": "...", "image": "..." }] }',
  "featured-collection": '{ "collection_handle": "...", "title": "..." }',
  "blog-preview": '{ "limit": 3, "title": "From the journal" }',
  promo: '{ "text": "...", "href": "...", "tone": "accent" }',
};

export default async function HomeSlotsPage({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string }> }) {
  const sp = await searchParams;
  const { slots } = await adminFetch<{ slots: Slot[] }>("/admin/cms/home-slots");
  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader title="Home page" subtitle="Slots render top-to-bottom on the storefront home page in `position` order." />
      <FormError message={sp.error} />
      {sp.ok ? <div className="text-sm text-[var(--color-success)]">Saved.</div> : null}

      <div className="space-y-4">
        {slots.length === 0 ? <div className="card p-6 text-sm text-[var(--color-ink-muted)]">No slots yet. Add one below.</div> : null}
        {slots.map((s) => (
          <form key={s.id} action={updateSlot} className="card p-5 space-y-3">
            <input type="hidden" name="id" value={s.id} />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge tone={s.enabled ? "success" : "default"}>{s.enabled ? "Enabled" : "Disabled"}</Badge>
                <span className="font-mono text-xs text-[var(--color-ink-muted)]">{s.id}</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Slot type" name="slot">
                <select name="slot" defaultValue={s.slot} className="input">
                  {SLOT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Position" name="position"><input name="position" type="number" defaultValue={s.position} className="input" /></Field>
              <Field label="Enabled" name="enabled">
                <label className="inline-flex items-center gap-2 mt-2"><input type="checkbox" name="enabled" defaultChecked={s.enabled} /> <span className="text-sm">Visible on storefront</span></label>
              </Field>
            </div>
            <Field label="Payload (JSON)" name="payload" hint={PAYLOAD_HINTS[s.slot]}>
              <textarea name="payload" rows={6} defaultValue={JSON.stringify(s.payload ?? {}, null, 2)} className="textarea font-mono text-xs" />
            </Field>
            <div className="flex gap-2 justify-between">
              <button className="btn btn-primary">Save</button>
              <button formAction={deleteSlot} className="btn btn-outline" style={{ color: "var(--color-danger)" }}>Delete</button>
            </div>
          </form>
        ))}
      </div>

      <form action={createSlot} className="card p-5 space-y-3">
        <h2 className="font-semibold">Add slot</h2>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Slot type" name="slot">
            <select name="slot" defaultValue="hero" className="input">
              {SLOT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Position" name="position"><input name="position" type="number" defaultValue={slots.length} className="input" /></Field>
          <Field label="Enabled" name="enabled">
            <label className="inline-flex items-center gap-2 mt-2"><input type="checkbox" name="enabled" defaultChecked /> <span className="text-sm">Visible</span></label>
          </Field>
        </div>
        <Field label="Payload (JSON)" name="payload">
          <textarea name="payload" rows={6} defaultValue="{}" className="textarea font-mono text-xs" />
        </Field>
        <button className="btn btn-primary">Add</button>
      </form>
    </div>
  );
}
