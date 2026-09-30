import Link from "next/link";
import { Facebook, Instagram, Youtube, Twitter } from "lucide-react";
import { env } from "@/lib/env";
import { footerLinks } from "@/lib/nav";
import { getSiteSettings } from "@/lib/cms";

const payments = ["VISA", "Mastercard", "Amex", "Rupay", "UPI", "Razorpay", "COD"];

export async function Footer() {
  const settings = await getSiteSettings();
  const brand = settings?.brand_name ?? env.brandName;
  const social = settings?.social_links ?? {};
  const tagline = settings?.footer_copy ?? "Crafted in small batches across India. We design contemporary ethnic wear that lasts beyond a season.";
  return (
    <footer className="bg-[var(--color-bg-alt)] mt-24 border-t border-[var(--color-line)]">
      <div className="container-wide py-16">
        <div className="grid gap-12 md:grid-cols-4">
          <div>
            <div className="font-[var(--font-display)] text-3xl mb-3">{brand}</div>
            <p className="text-sm text-[var(--color-ink-muted)] max-w-xs">{tagline}</p>
            <div className="mt-6 flex gap-3">
              {social.instagram ? <SocialLink href={social.instagram} label="Instagram"><Instagram className="h-4 w-4" /></SocialLink> : null}
              {social.facebook ? <SocialLink href={social.facebook} label="Facebook"><Facebook className="h-4 w-4" /></SocialLink> : null}
              {social.twitter ? <SocialLink href={social.twitter} label="Twitter"><Twitter className="h-4 w-4" /></SocialLink> : null}
              {social.youtube ? <SocialLink href={social.youtube} label="YouTube"><Youtube className="h-4 w-4" /></SocialLink> : null}
              {Object.keys(social).length === 0 ? (
                <>
                  <SocialLink href="#" label="Instagram"><Instagram className="h-4 w-4" /></SocialLink>
                  <SocialLink href="#" label="Facebook"><Facebook className="h-4 w-4" /></SocialLink>
                  <SocialLink href="#" label="YouTube"><Youtube className="h-4 w-4" /></SocialLink>
                </>
              ) : null}
            </div>
            {settings?.contact_email || settings?.contact_phone ? (
              <div className="mt-6 text-xs text-[var(--color-ink-muted)] space-y-1">
                {settings.contact_email ? <div><a href={`mailto:${settings.contact_email}`} className="link-underline">{settings.contact_email}</a></div> : null}
                {settings.contact_phone ? <div>{settings.contact_phone}</div> : null}
              </div>
            ) : null}
          </div>

          <FooterCol heading="Shop" items={footerLinks.shop} />
          <FooterCol heading="Help" items={footerLinks.help} />
          <FooterCol heading="House" items={footerLinks.about} />
        </div>

        <div className="mt-14 pt-6 border-t border-[var(--color-line)] flex flex-col gap-4 md:flex-row md:items-center md:justify-between text-xs text-[var(--color-ink-muted)]">
          <div className="flex flex-wrap items-center gap-3">
            {payments.map((p) => (
              <span key={p} className="px-2 py-1 border border-[var(--color-line)] tracking-wider">{p}</span>
            ))}
          </div>
          <div>© {new Date().getFullYear()} {brand}. All rights reserved.</div>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a aria-label={label} href={href} className="p-2 border border-[var(--color-line)] hover:bg-[var(--color-ink)] hover:text-[var(--color-bg)] transition">{children}</a>
  );
}

function FooterCol({ heading, items }: { heading: string; items: { label: string; href: string }[] }) {
  return (
    <div>
      <div className="eyebrow mb-4">{heading}</div>
      <ul className="space-y-2 text-sm">
        {items.map((it) => (
          <li key={it.href}><Link href={it.href} className="link-underline inline-block">{it.label}</Link></li>
        ))}
      </ul>
    </div>
  );
}
