import Image from "next/image";
import { getPage } from "@/lib/cms";
import { RenderLegalBody } from "@/lib/legal";

export const revalidate = 300;

export async function generateMetadata() {
  const page = await getPage("about");
  return {
    title: `${page?.seo_title ?? page?.title ?? "About"} · Aanya`,
    description: page?.seo_description ?? "A small-batch ethnic wear atelier rooted in Indian craft.",
  };
}

export default async function AboutPage() {
  const page = await getPage("about");
  const text = page?.body?.text;
  return (
    <div className="py-12 md:py-20">
      <div className="container-narrow text-center">
        <div className="eyebrow mb-2">Our story</div>
        <h1 className="text-4xl md:text-6xl">{page?.title ?? "Slow-made, intentional, Indian."}</h1>
        {!text ? (
          <p className="mt-6 text-lg text-[var(--color-ink-muted)]">
            Aanya was founded in 2021 in a two-room studio in Jaipur. We work directly with block-printers, weavers and embroiderers across Rajasthan, Gujarat and West Bengal — never more than two hands removed from the loom.
          </p>
        ) : null}
      </div>
      <div className="container-wide mt-16">
        <div className="aspect-[21/9] relative overflow-hidden bg-[var(--color-bg-alt)]">
          <Image src="/images/pexels-8886965.jpg" alt="Atelier" fill className="object-cover" sizes="100vw" priority />
        </div>
      </div>
      {text ? (
        <div className="container-narrow mt-16 space-y-6 text-base md:text-lg leading-relaxed">
          <RenderLegalBody text={text} />
        </div>
      ) : (
        <>
          <div className="container-narrow mt-20 grid md:grid-cols-3 gap-8 text-center">
            {[
              { n: "120+", l: "Artisan families" },
              { n: "60+", l: "Cities served" },
              { n: "2.5M+", l: "Pieces delivered" },
            ].map((s) => (
              <div key={s.l}>
                <div className="text-4xl md:text-5xl">{s.n}</div>
                <div className="eyebrow mt-2 text-[var(--color-ink-muted)]">{s.l}</div>
              </div>
            ))}
          </div>
          <div className="container-narrow mt-20 space-y-6 text-base md:text-lg leading-relaxed">
            <h2 className="text-2xl md:text-3xl">Why small-batch</h2>
            <p>We don&apos;t drop seasons of 400 styles. We drop 8–12, three times a year. Each piece is hand-finished, quality-controlled by a senior tailor, and packed in recyclable kraft. Shopping with us means owning one piece longer, not five for a season.</p>
            <h2 className="text-2xl md:text-3xl mt-12">Where we work</h2>
            <p>Our printing partners are in Bagru and Sanganer (Rajasthan). Our weavers are in Maheshwar (Madhya Pradesh) and Phulia (West Bengal). Our embroidery atelier is in Lucknow. Every artisan is paid above-fair-trade wages on a per-piece basis, not piece-rate.</p>
          </div>
        </>
      )}
    </div>
  );
}
