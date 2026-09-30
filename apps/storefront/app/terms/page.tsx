import { LegalLayout, H2, RenderLegalBody } from "@/lib/legal";
import { getPage } from "@/lib/cms";

export const revalidate = 300;

export async function generateMetadata() {
  const page = await getPage("terms");
  return { title: `${page?.seo_title ?? page?.title ?? "Terms of Service"} · Aanya`, description: page?.seo_description ?? undefined };
}

export default async function TermsPage() {
  const page = await getPage("terms");
  const text = page?.body?.text;
  return (
    <LegalLayout eyebrow="Legal" title={page?.title ?? "Terms of service"} updated={page ? new Date(page.updated_at).toLocaleDateString("en-IN", { month: "long", year: "numeric" }) : "May 2026"}>
      {text ? <RenderLegalBody text={text} /> : (
        <>
          <H2>Acceptance</H2>
          <p>By accessing this site and placing an order you agree to be bound by these terms. We may revise them; continued use constitutes acceptance.</p>
          <H2>Orders and pricing</H2>
          <p>All prices are listed in INR by default and converted by region. We reserve the right to cancel an order if a pricing or inventory error is identified before dispatch — full refund issued in that case.</p>
          <H2>Intellectual property</H2>
          <p>All site content — photography, copy, product designs, code — is the property of Aanya and may not be reproduced without written permission.</p>
          <H2>Limitation of liability</H2>
          <p>Our maximum liability is limited to the value of the order in question. We are not liable for indirect, incidental or consequential damages.</p>
          <H2>Governing law</H2>
          <p>Disputes are governed by the laws of India and subject to the exclusive jurisdiction of the courts of Jaipur, Rajasthan.</p>
        </>
      )}
    </LegalLayout>
  );
}
