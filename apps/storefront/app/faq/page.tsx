import { getPage } from "@/lib/cms";
import { FAQAccordion } from "./FAQAccordion";

export const revalidate = 300;

const DEFAULT_FAQ = [
  { q: "What sizes do you offer?", a: "XS through XL on most ready-to-wear pieces. Custom sizing is available on made-to-order silhouettes for a 10% surcharge — email care@aanya.studio after placing the order." },
  { q: "How accurate are the colours?", a: "We photograph in daylight without filters. Colours vary slightly across screens; saturated reds, indigos and ochres tend to read truest on calibrated displays." },
  { q: "Do you ship internationally?", a: "Yes — flat ₹2,500 to the US, UK, Canada, Australia, UAE, Singapore and Malaysia. 7–14 business days via FedEx with tracking." },
  { q: "Can I cancel my order?", a: "Yes, within 12 hours of placement at no charge. After dispatch, the standard return flow applies." },
  { q: "Do pieces shrink?", a: "Hand-block-printed cotton shrinks 2–3% in the first wash. We pre-shrink before cutting; expected residual shrinkage is minimal." },
  { q: "Do you accept COD?", a: "Yes, for domestic orders below ₹15,000. ₹49 COD handling fee applies." },
];

function parseFaqItems(text: string): { q: string; a: string }[] {
  // Format: "Q: question\nA: answer" blocks separated by blank line.
  const blocks = text.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  const out: { q: string; a: string }[] = [];
  for (const b of blocks) {
    const m = b.match(/^Q:\s*(.+?)\nA:\s*([\s\S]+)$/);
    if (m) out.push({ q: m[1].trim(), a: m[2].trim() });
  }
  return out;
}

export async function generateMetadata() {
  const page = await getPage("faq");
  return { title: `${page?.seo_title ?? page?.title ?? "FAQ"} · Aanya`, description: page?.seo_description ?? undefined };
}

export default async function FAQPage() {
  const page = await getPage("faq");
  const structured = page?.body?.faq?.groups?.flatMap((g) => g.items) ?? [];
  const fromText = page?.body?.text ? parseFaqItems(page.body.text) : [];
  const items = structured.length > 0 ? structured : fromText.length > 0 ? fromText : DEFAULT_FAQ;
  return (
    <div className="container-narrow py-12 md:py-20">
      <div className="eyebrow mb-2">FAQ</div>
      <h1 className="text-4xl md:text-5xl">{page?.title ?? "Frequently asked"}</h1>
      <FAQAccordion items={items} />
    </div>
  );
}
