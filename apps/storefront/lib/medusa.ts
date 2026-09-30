import Medusa from "@medusajs/js-sdk";
import { env } from "./env";

export const medusa = new Medusa({
  baseUrl: env.medusaUrl,
  publishableKey: env.publishableKey || undefined,
  debug: process.env.NODE_ENV === "development",
});

export async function safeFetch<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[medusa] fetch failed, using fallback:", (err as Error).message);
    }
    return fallback;
  }
}

export function formatMoney(amount: number, currency: string = env.baseCurrency) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(amount);
}
