import { env } from "@/lib/env";

type JsonValue = string | number | boolean | null | undefined | JsonObject | JsonValue[];
type JsonObject = { [key: string]: JsonValue };

export function JsonLd({ data }: { data: JsonObject }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function OrganizationJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name: env.brandName,
        url: env.siteUrl,
        logo: `${env.siteUrl}/logo.svg`,
        sameAs: [],
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer support",
          email: "hello@aanya.studio",
          areaServed: "IN",
          availableLanguage: ["English", "Hindi"],
        },
      }}
    />
  );
}

export function WebSiteJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: env.brandName,
        url: env.siteUrl,
        potentialAction: {
          "@type": "SearchAction",
          target: `${env.siteUrl}/search?q={query}`,
          "query-input": "required name=query",
        },
      }}
    />
  );
}

export function BreadcrumbJsonLd({ items }: { items: { name: string; url: string }[] }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((it, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: it.name,
          item: it.url,
        })),
      }}
    />
  );
}

type ProductLdInput = {
  name: string;
  description?: string;
  image?: string[];
  sku?: string;
  brand?: string;
  url: string;
  price?: number;
  currency?: string;
  availability?: "InStock" | "OutOfStock";
};

export function ProductJsonLd(p: ProductLdInput) {
  const offers = p.price != null && p.currency
    ? {
        "@type": "Offer",
        url: p.url,
        priceCurrency: p.currency.toUpperCase(),
        price: p.price.toFixed(2),
        availability: `https://schema.org/${p.availability ?? "InStock"}`,
      }
    : undefined;
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Product",
        name: p.name,
        description: p.description,
        image: p.image,
        sku: p.sku,
        brand: { "@type": "Brand", name: p.brand ?? env.brandName },
        ...(offers ? { offers } : {}),
      }}
    />
  );
}

export function ArticleJsonLd(a: {
  title: string;
  description: string;
  image: string;
  datePublished: string;
  author: string;
  url: string;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: a.title,
        description: a.description,
        image: [a.image],
        datePublished: a.datePublished,
        author: { "@type": "Person", name: a.author },
        publisher: { "@type": "Organization", name: env.brandName, logo: { "@type": "ImageObject", url: `${env.siteUrl}/logo.svg` } },
        mainEntityOfPage: a.url,
      }}
    />
  );
}
