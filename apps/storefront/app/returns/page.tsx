import { LegalLayout, H2, RenderLegalBody } from "@/lib/legal";
import { getPage } from "@/lib/cms";

export const revalidate = 300;

export async function generateMetadata() {
  const page = await getPage("returns");
  return { title: `${page?.seo_title ?? page?.title ?? "Returns & Exchanges"} · Aanya`, description: page?.seo_description ?? undefined };
}

export default async function ReturnsPage() {
  const page = await getPage("returns");
  const text = page?.body?.text;
  return (
    <LegalLayout eyebrow="Customer care" title={page?.title ?? "Returns & exchanges"} updated={page ? new Date(page.updated_at).toLocaleDateString("en-IN", { month: "long", year: "numeric" }) : "May 2026"}>
      {text ? <RenderLegalBody text={text} /> : (
        <>
          <H2>Easy 14-day returns</H2>
          <p>Domestic orders can be returned within 14 days of delivery for a full refund or store credit. International orders are exchange-only due to customs costs.</p>
          <H2>How to initiate</H2>
          <p>Sign into your account, open the order, and tap &quot;Return&quot;. A pickup will be scheduled within 48 hours for most pincodes. Refund is initiated within 3 business days of pickup verification.</p>
          <H2>Non-returnable</H2>
          <p>Sale items, customised pieces, jewellery, undergarments and pieces showing visible wear or alteration are not eligible.</p>
          <H2>Defective or damaged</H2>
          <p>Email <a className="link-underline" href="mailto:care@aanya.studio">care@aanya.studio</a> within 48 hours of delivery with photographs. We replace at our cost.</p>
        </>
      )}
    </LegalLayout>
  );
}
