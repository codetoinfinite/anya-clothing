import { ContactForm } from "@/components/content/ContactForm";

export const metadata = { title: "Contact · Aanya", description: "Speak with our atelier — we typically reply within one business day." };

export default function ContactPage() {
  return (
    <div className="container-wide py-12 md:py-20">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
        <div>
          <div className="eyebrow mb-2">Contact</div>
          <h1 className="text-4xl md:text-5xl">We&apos;d love to hear from you</h1>
          <p className="mt-6 text-base text-[var(--color-ink-muted)] leading-relaxed">
            For order help, sizing, custom orders or wholesale enquiries, fill the form and a member of the studio will reply within one business day.
          </p>
          <dl className="mt-12 space-y-6 text-sm">
            <div>
              <dt className="eyebrow text-[var(--color-ink-muted)]">Studio</dt>
              <dd className="mt-1">14, Lane 3, Civil Lines, Jaipur 302006, India</dd>
            </div>
            <div>
              <dt className="eyebrow text-[var(--color-ink-muted)]">Email</dt>
              <dd className="mt-1">hello@aanya.studio</dd>
            </div>
            <div>
              <dt className="eyebrow text-[var(--color-ink-muted)]">Phone / WhatsApp</dt>
              <dd className="mt-1">+91 98000 00000 · Mon–Sat, 10am–7pm IST</dd>
            </div>
          </dl>
        </div>
        <ContactForm />
      </div>
    </div>
  );
}
