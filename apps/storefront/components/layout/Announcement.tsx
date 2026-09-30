import Link from "next/link";
import { getSiteSettings } from "@/lib/cms";

const DEFAULT_MESSAGES = [
  "Free shipping on prepaid orders above ₹1499",
  "Easy 7-day returns across India",
  "End of season sale — up to 60% off",
  "Now shipping to 28 countries",
];

export async function Announcement() {
  const settings = await getSiteSettings();
  const text = settings?.announcement_text?.trim();
  const messages = text ? text.split(/\s*·\s*|\n+/).map((m) => m.trim()).filter(Boolean) : DEFAULT_MESSAGES;
  const Inner = (
    <div className="bg-[var(--color-ink)] text-[var(--color-bg)] text-xs">
      <div className="overflow-hidden">
        <div className="flex w-max animate-marquee whitespace-nowrap py-2.5">
          {[...messages, ...messages, ...messages].map((m, i) => (
            <span key={i} className="px-8 tracking-[0.18em] uppercase">{m}</span>
          ))}
        </div>
      </div>
    </div>
  );
  if (settings?.announcement_link) return <Link href={settings.announcement_link}>{Inner}</Link>;
  return Inner;
}
