import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { adminFetch } from "@/lib/medusa-admin";
import { PageHeader } from "@/components/PageHeader";
import { ALL_ROLES, isRole, type Role } from "@/lib/roles";
import { formatDate } from "@/lib/utils";

type User = {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  created_at: string;
  metadata?: Record<string, any> | null;
};

async function setUserRole(formData: FormData) {
  "use server";
  const id = String(formData.get("id"));
  const roleRaw = String(formData.get("role"));
  if (!id || !isRole(roleRaw)) redirect("/settings/users?error=Bad+input");
  try {
    await adminFetch(`/admin/users/${id}`, {
      method: "POST",
      body: JSON.stringify({ metadata: { role: roleRaw } }),
    });
  } catch (e: any) {
    redirect(`/settings/users?error=${encodeURIComponent(e?.payload?.message ?? "Failed")}`);
  }
  revalidatePath("/settings/users");
  redirect("/settings/users?ok=1");
}

export default async function UsersPage({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string }> }) {
  const sp = await searchParams;
  const data = await adminFetch<{ users: User[]; count: number }>(`/admin/users`);
  return (
    <div className="space-y-4">
      <PageHeader title="Admin users" subtitle="Manage backend access and roles. Add new users via `medusa user --email --password` on the server." />
      {sp.error ? <div className="card p-3 text-sm text-[var(--color-danger)]">{sp.error}</div> : null}
      {sp.ok ? <div className="card p-3 text-sm text-[var(--color-success)]">Saved.</div> : null}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-surface-2)] text-left">
            <tr>
              <th className="p-2">Email</th>
              <th className="p-2">Name</th>
              <th className="p-2">Joined</th>
              <th className="p-2">Role</th>
            </tr>
          </thead>
          <tbody>
            {data.users.map((u) => {
              const role: Role = isRole(u.metadata?.role) ? (u.metadata!.role as Role) : "owner";
              return (
                <tr key={u.id} className="border-t border-[var(--color-border)]">
                  <td className="p-2 font-medium">{u.email}</td>
                  <td className="p-2">{[u.first_name, u.last_name].filter(Boolean).join(" ") || "—"}</td>
                  <td className="p-2">{formatDate(u.created_at)}</td>
                  <td className="p-2">
                    <form action={setUserRole} className="flex gap-2 items-center">
                      <input type="hidden" name="id" value={u.id} />
                      <select name="role" defaultValue={role} className="input">
                        {ALL_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                      <button className="btn btn-outline">Save</button>
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
