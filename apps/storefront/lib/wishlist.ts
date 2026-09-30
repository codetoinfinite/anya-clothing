"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const COOKIE = "byshree_wishlist";

async function read(): Promise<string[]> {
  const c = await cookies();
  const v = c.get(COOKIE)?.value;
  if (!v) return [];
  try {
    const parsed = JSON.parse(v);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

async function write(ids: string[]) {
  const c = await cookies();
  c.set(COOKIE, JSON.stringify(ids), {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}

export async function getWishlistIds(): Promise<string[]> {
  return read();
}

export async function toggleWishlist(productId: string): Promise<boolean> {
  const ids = await read();
  const next = ids.includes(productId) ? ids.filter((x) => x !== productId) : [...ids, productId];
  await write(next);
  revalidatePath("/account/wishlist");
  return next.includes(productId);
}
