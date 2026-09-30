import { LegalLayout, H2, RenderLegalBody } from "@/lib/legal";
import { getPage, bodyToParagraphs } from "@/lib/cms";

export const revalidate = 300;

export async function generateMetadata() {
  const page = await getPage("shipping");
  return {
    title: `${page?.seo_title ?? page?.title ?? "Shipping policy"} · Aanya`,
    description: page?.seo_description ?? "Shipping rates, timelines, and policies for orders within India and worldwide.",
  };
}

export default async function ShippingPage() {
  const page = await getPage("shipping");
  const text = page?.body?.text;
  return (
    <LegalLayout eyebrow="Customer care" title={page?.title ?? "Shipping policy"} updated={page ? new Date(page.updated_at).toLocaleDateString("en-IN", { month: "long", year: "numeric" }) : "May 2026"}>
      {text ? <RenderLegalBody text={text} /> : (
        <>
          <H2>Within India</H2>
          <p>Free standard shipping on orders above ₹2,499. Below that, ₹99 flat. Delivered in 4–7 business days by Bluedart or DTDC. Metro cities typically receive within 3 business days.</p>
          <H2>International</H2>
          <p>Flat ₹2,500 to the US, UK, Canada, Australia, UAE, Singapore and Malaysia. Delivered in 7–14 business days by FedEx International. Tracking number emailed on dispatch.</p>
          <H2>Duties and taxes</H2>
          <p>International orders may incur import duties at the destination port. These are not pre-paid by us and are the responsibility of the buyer.</p>
          <H2>Processing time</H2>
          <p>Ready-to-ship pieces dispatch within 2 business days. Made-to-order pieces (marked on the product page) ship in 10–14 business days.</p>
        </>
      )}
    </LegalLayout>
  );
}
