"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { medusa } from "./medusa";
import type { Customer, Order, AuthResponse } from "./medusa-types";

const EmailSchema = z.string().trim().email().max(160);
const PasswordSchema = z.string().min(8, "Password must be at least 8 characters.").max(200);
const NameSchema = z.string().trim().min(1).max(80);

const RegisterSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
  first_name: NameSchema,
  last_name: NameSchema,
});

const LoginSchema = z.object({ email: EmailSchema, password: z.string().min(1).max(200) });

const COOKIE = "byshree_customer";

function tokenOf(res: AuthResponse | unknown): string | null {
  if (typeof res === "string") return res;
  if (res && typeof res === "object" && "token" in res && typeof (res as { token: unknown }).token === "string") {
    return (res as { token: string }).token;
  }
  return null;
}

async function setToken(token: string) {
  const c = await cookies();
  c.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function getToken(): Promise<string | null> {
  const c = await cookies();
  return c.get(COOKIE)?.value ?? null;
}

export async function register(input: {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}) {
  const parsed = RegisterSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.errors[0]?.message ?? "Invalid input." };
  const data = parsed.data;
  try {
    const reg = await medusa.auth.register("customer", "emailpass", {
      email: data.email,
      password: data.password,
    });
    const registrationToken = tokenOf(reg);
    if (!registrationToken) return { ok: false, error: "registration failed" };
    await medusa.store.customer.create(
      { email: data.email, first_name: data.first_name, last_name: data.last_name },
      {},
      { Authorization: `Bearer ${registrationToken}` }
    );
    const login = await medusa.auth.login("customer", "emailpass", {
      email: data.email,
      password: data.password,
    });
    const sessionToken = tokenOf(login) ?? registrationToken;
    await setToken(sessionToken);
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function login(email: string, password: string) {
  const parsed = LoginSchema.safeParse({ email, password });
  if (!parsed.success) return { ok: false, error: "Enter a valid email and password." };
  try {
    const res = await medusa.auth.login("customer", "emailpass", parsed.data);
    const token = tokenOf(res);
    if (!token) return { ok: false, error: "invalid credentials" };
    await setToken(token);
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function logout() {
  const c = await cookies();
  c.delete(COOKIE);
  revalidatePath("/", "layout");
  redirect("/");
}

export async function getCustomer(): Promise<Customer | null> {
  const token = await getToken();
  if (!token) return null;
  try {
    const { customer } = (await medusa.store.customer.retrieve(
      {},
      { Authorization: `Bearer ${token}` }
    )) as { customer: Customer };
    return customer;
  } catch {
    return null;
  }
}

export async function listOrders(): Promise<Order[]> {
  const token = await getToken();
  if (!token) return [];
  try {
    const { orders } = (await medusa.store.order.list(
      { fields: "id,display_id,created_at,total,currency_code,*items,*shipping_address" },
      { Authorization: `Bearer ${token}` }
    )) as { orders: Order[] };
    return orders ?? [];
  } catch {
    return [];
  }
}
