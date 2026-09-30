"use server";

import { z } from "zod";
import { env } from "./env";

const ContactSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(120),
  email: z.string().trim().email("Enter a valid email.").max(160),
  phone: z.string().trim().max(40).optional().default(""),
  subject: z.string().trim().max(160).optional().default(""),
  message: z.string().trim().min(10, "Message is too short.").max(4000),
});

const EmailSchema = z.string().trim().email("Enter a valid email.").max(160);

async function storePost(path: string, body: unknown): Promise<{ ok: boolean; status: number; data: { message?: string } | null }> {
  try {
    const res = await fetch(`${env.medusaUrl}${path}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-publishable-api-key": env.publishableKey,
        accept: "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data };
  } catch (e) {
    return { ok: false, status: 0, data: { message: (e as Error).message } };
  }
}

export async function submitContact(formData: FormData) {
  const parsed = ContactSchema.safeParse({
    name: formData.get("name") ?? "",
    email: formData.get("email") ?? "",
    phone: formData.get("phone") ?? "",
    subject: formData.get("subject") ?? "",
    message: formData.get("message") ?? "",
  });
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.errors[0]?.message ?? "Invalid form data." };
  }
  const res = await storePost("/store/contact", parsed.data);
  if (!res.ok) {
    return { ok: false as const, error: res.data?.message ?? "Unable to send right now. Please try again shortly." };
  }
  return { ok: true as const };
}

export async function subscribeNewsletter(formData: FormData) {
  const parsed = EmailSchema.safeParse(formData.get("email") ?? "");
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.errors[0]?.message ?? "Invalid email." };
  }
  const source = String(formData.get("source") ?? "footer");
  const res = await storePost("/store/newsletter", { email: parsed.data, source });
  if (!res.ok) {
    return { ok: false as const, error: res.data?.message ?? "Could not subscribe. Try again." };
  }
  return { ok: true as const };
}
