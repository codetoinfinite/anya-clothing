import type { ReactNode } from "react";

export function LegalLayout({ title, eyebrow, updated, children }: { title: string; eyebrow: string; updated: string; children: ReactNode }) {
  return (
    <div className="container-narrow py-12 md:py-20">
      <div className="eyebrow mb-2">{eyebrow}</div>
      <h1 className="text-4xl md:text-5xl">{title}</h1>
      <p className="mt-3 text-sm text-[var(--color-ink-muted)]">Last updated {updated}</p>
      <div className="mt-10 space-y-6 text-base leading-relaxed">{children}</div>
    </div>
  );
}

export function H2({ children }: { children: ReactNode }) {
  return <h2 className="text-2xl mt-10 mb-3">{children}</h2>;
}

export function RenderLegalBody({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  return (
    <>
      {blocks.map((block, i) => {
        if (block.startsWith("## ")) return <H2 key={i}>{block.slice(3).trim()}</H2>;
        if (block.startsWith("# ")) return <h1 key={i} className="text-3xl mt-10 mb-3">{block.slice(2).trim()}</h1>;
        return <p key={i}>{block}</p>;
      })}
    </>
  );
}
