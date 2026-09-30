import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const secret = req.headers.get("x-revalidate-secret") ?? "";
  const expected = process.env.REVALIDATE_SECRET ?? "";
  if (!expected || secret !== expected) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }
  let body: { tags?: string[]; paths?: string[] } = {};
  try { body = await req.json(); } catch {}
  const tags = Array.isArray(body.tags) ? body.tags : [];
  const paths = Array.isArray(body.paths) ? body.paths : [];
  for (const t of tags) {
    try { revalidateTag(t); } catch {}
  }
  for (const p of paths) {
    try { revalidatePath(p); } catch {}
  }
  return NextResponse.json({ ok: true, revalidated: { tags, paths } });
}
