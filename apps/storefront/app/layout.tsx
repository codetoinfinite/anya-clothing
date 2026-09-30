import type { Metadata } from "next";
import { Instrument_Sans, Cormorant_Garamond } from "next/font/google";
import { env } from "@/lib/env";
import { Announcement } from "@/components/layout/Announcement";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Analytics } from "@/components/layout/Analytics";
import { CookieConsent } from "@/components/layout/CookieConsent";
import { OrganizationJsonLd, WebSiteJsonLd } from "@/components/seo/JsonLd";
import { getCart } from "@/lib/cart";
import "./globals.css";

const sans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-sans-loaded",
  display: "swap",
});

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display-loaded",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: {
    default: `${env.brandName} — ${env.brandTagline}`,
    template: `%s · ${env.brandName}`,
  },
  description:
    "Hand-crafted contemporary ethnic wear: kurtas, dresses, co-ords and ethnic sets. Designed in India, shipped worldwide.",
  applicationName: env.brandName,
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    siteName: env.brandName,
    url: env.siteUrl,
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
  alternates: { canonical: env.siteUrl },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cart = await getCart();
  const cartCount = (cart?.items ?? []).reduce((n, i) => n + (i.quantity ?? 0), 0);
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`}>
      <body className="min-h-screen flex flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-[var(--color-ink)] focus:text-white focus:px-4 focus:py-2">
          Skip to content
        </a>
        <OrganizationJsonLd />
        <WebSiteJsonLd />
        <Announcement />
        <Header cartCount={cartCount} />
        <main id="main" className="flex-1">{children}</main>
        <Footer />
        <Analytics />
        <CookieConsent />
      </body>
    </html>
  );
}
