import { z } from "zod";

const schema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_BRAND_NAME: z.string().min(1).default("Aanya"),
  NEXT_PUBLIC_BRAND_TAGLINE: z.string().default("Heritage. Reimagined."),
  NEXT_PUBLIC_MEDUSA_BACKEND_URL: z.string().url().default("http://localhost:9000"),
  // Optional so the build succeeds before the backend exists; storefront renders empty until it is set.
  NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY: z.string().default(""),
  NEXT_PUBLIC_DEFAULT_REGION: z.string().min(1).default("in"),
  NEXT_PUBLIC_BASE_CURRENCY: z.string().min(1).default("inr"),
  NEXT_PUBLIC_GA4_ID: z.string().optional().default(""),
  NEXT_PUBLIC_META_PIXEL_ID: z.string().optional().default(""),
  NEXT_PUBLIC_RAZORPAY_KEY_ID: z.string().optional().default(""),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

const parsed = schema.safeParse({
  NEXT_PUBLIC_SITE_URL:
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined),
  NEXT_PUBLIC_BRAND_NAME: process.env.NEXT_PUBLIC_BRAND_NAME,
  NEXT_PUBLIC_BRAND_TAGLINE: process.env.NEXT_PUBLIC_BRAND_TAGLINE,
  NEXT_PUBLIC_MEDUSA_BACKEND_URL: process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL,
  NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
  NEXT_PUBLIC_DEFAULT_REGION: process.env.NEXT_PUBLIC_DEFAULT_REGION,
  NEXT_PUBLIC_BASE_CURRENCY: process.env.NEXT_PUBLIC_BASE_CURRENCY,
  NEXT_PUBLIC_GA4_ID: process.env.NEXT_PUBLIC_GA4_ID,
  NEXT_PUBLIC_META_PIXEL_ID: process.env.NEXT_PUBLIC_META_PIXEL_ID,
  NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  NODE_ENV: process.env.NODE_ENV,
});

if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment variables. Check .env.local against lib/env.ts schema.");
}

const e = parsed.data;

if (!e.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY) {
  console.warn("[env] NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY is not set; catalog requests to Medusa will fail.");
}

export const env = {
  siteUrl: e.NEXT_PUBLIC_SITE_URL,
  brandName: e.NEXT_PUBLIC_BRAND_NAME,
  brandTagline: e.NEXT_PUBLIC_BRAND_TAGLINE,
  medusaUrl: e.NEXT_PUBLIC_MEDUSA_BACKEND_URL,
  publishableKey: e.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
  defaultRegion: e.NEXT_PUBLIC_DEFAULT_REGION,
  baseCurrency: e.NEXT_PUBLIC_BASE_CURRENCY.toLowerCase(),
  ga4Id: e.NEXT_PUBLIC_GA4_ID,
  metaPixelId: e.NEXT_PUBLIC_META_PIXEL_ID,
  razorpayKeyId: e.NEXT_PUBLIC_RAZORPAY_KEY_ID,
} as const;

export const isServer = typeof window === "undefined";
export const isProd = e.NODE_ENV === "production";
