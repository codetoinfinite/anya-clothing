import { LegalLayout, H2, RenderLegalBody } from "@/lib/legal";
import { getPage } from "@/lib/cms";

export const revalidate = 300;

export async function generateMetadata() {
  const page = await getPage("privacy");
  return { title: `${page?.seo_title ?? page?.title ?? "Privacy Policy"} · Aanya`, description: page?.seo_description ?? undefined };
}

export default async function PrivacyPage() {
  const page = await getPage("privacy");
  const text = page?.body?.text;
  return (
    <LegalLayout eyebrow="Legal" title={page?.title ?? "Privacy policy"} updated={page ? new Date(page.updated_at).toLocaleDateString("en-IN", { month: "long", year: "numeric" }) : "May 2026"}>
      {text ? <RenderLegalBody text={text} /> : (
        <>
          <p>This policy describes how Aanya (&quot;we&quot;) collects, uses and protects personal data. By using this site you consent to the practices described here.</p>
          <H2>What we collect</H2>
          <p>Name, email, postal address, phone number, order history and IP-derived analytics. Payment data is processed by Razorpay/Stripe and is never stored on our servers.</p>
          <H2>Why we collect it</H2>
          <p>To fulfil orders, communicate about deliveries, provide customer service, and — with consent — to send marketing emails you can unsubscribe from at any time.</p>
          <H2>Third parties</H2>
          <p>We share data with shipping partners (Bluedart, DTDC, FedEx), payment gateways (Razorpay, Stripe), email service (Resend), and analytics (Google Analytics, Meta Pixel). No data is sold.</p>
          <H2>Your rights (DPDP Act)</H2>
          <p>You may request access, correction or deletion of your data at any time by emailing <a className="link-underline" href="mailto:privacy@aanya.studio">privacy@aanya.studio</a>.</p>
          <H2>Cookies</H2>
          <p>We use essential cookies for cart and session, plus optional analytics cookies. Consent is collected via the banner shown on first visit.</p>
        </>
      )}
    </LegalLayout>
  );
}
