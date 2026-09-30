"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setAddresses, setShippingMethod, completeOrder } from "@/lib/cart";
import type { CompleteResponse } from "@/lib/medusa-types";

type ShippingOpt = { id: string; name: string; amount: number };

export function CheckoutForm({
  shippingOptions,
  currency,
}: {
  shippingOptions: ShippingOpt[];
  currency: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [addr, setAddr] = useState({
    email: "",
    first_name: "",
    last_name: "",
    address_1: "",
    address_2: "",
    city: "",
    province: "",
    postal_code: "",
    country_code: "in",
    phone: "",
  });
  const [shippingId, setShippingId] = useState<string>(shippingOptions[0]?.id ?? "");
  const [payment, setPayment] = useState<"cod" | "razorpay" | "stripe">("cod");

  const submitAddress = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    start(async () => {
      try {
        await setAddresses(addr);
        setStep(2);
      } catch (err) {
        setError((err as Error).message);
      }
    });
  };

  const submitShipping = () => {
    if (!shippingId) {
      setStep(3);
      return;
    }
    start(async () => {
      try {
        await setShippingMethod(shippingId);
        setStep(3);
      } catch (err) {
        setError((err as Error).message);
      }
    });
  };

  const placeOrder = () => {
    setError(null);
    start(async () => {
      const res: CompleteResponse = await completeOrder();
      if (res.type === "order") {
        router.push(`/checkout/success?order=${res.order.id}`);
      } else if (res.type === "error") {
        setError(res.error || "Could not place order. Try again.");
      } else {
        setError("Could not place order. Try again.");
      }
    });
  };

  return (
    <div className="space-y-8">
      <Stepper step={step} />

      {step === 1 && (
        <form onSubmit={submitAddress} className="space-y-4">
          <Section title="Contact">
            <Input label="Email" value={addr.email} onChange={(v) => setAddr({ ...addr, email: v })} type="email" required />
            <Input label="Phone" value={addr.phone ?? ""} onChange={(v) => setAddr({ ...addr, phone: v })} type="tel" />
          </Section>
          <Section title="Shipping address">
            <div className="grid sm:grid-cols-2 gap-3">
              <Input label="First name" value={addr.first_name} onChange={(v) => setAddr({ ...addr, first_name: v })} required />
              <Input label="Last name" value={addr.last_name} onChange={(v) => setAddr({ ...addr, last_name: v })} required />
            </div>
            <Input label="Address line 1" value={addr.address_1} onChange={(v) => setAddr({ ...addr, address_1: v })} required />
            <Input label="Address line 2" value={addr.address_2} onChange={(v) => setAddr({ ...addr, address_2: v })} />
            <div className="grid sm:grid-cols-3 gap-3">
              <Input label="City" value={addr.city} onChange={(v) => setAddr({ ...addr, city: v })} required />
              <Input label="State" value={addr.province ?? ""} onChange={(v) => setAddr({ ...addr, province: v })} />
              <Input label="PIN code" value={addr.postal_code} onChange={(v) => setAddr({ ...addr, postal_code: v })} required />
            </div>
            <label className="block">
              <span className="text-xs tracking-[0.14em] uppercase">Country</span>
              <select
                value={addr.country_code}
                onChange={(e) => setAddr({ ...addr, country_code: e.target.value })}
                className="mt-1 h-11 w-full border border-[var(--color-line)] px-3"
              >
                <option value="in">India</option>
                <option value="us">United States</option>
                <option value="gb">United Kingdom</option>
                <option value="ca">Canada</option>
                <option value="au">Australia</option>
                <option value="ae">UAE</option>
                <option value="sg">Singapore</option>
                <option value="my">Malaysia</option>
              </select>
            </label>
          </Section>
          {error && <div className="text-sm text-[var(--color-sale)]">{error}</div>}
          <button className="btn btn-primary h-12 px-8" disabled={pending}>
            {pending ? "Saving…" : "Continue to shipping"}
          </button>
        </form>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <Section title="Shipping method">
            {shippingOptions.length === 0 ? (
              <div className="text-sm text-[var(--color-ink-muted)]">
                No shipping methods configured yet. Add one in admin → Settings → Locations.
              </div>
            ) : (
              <div className="space-y-2">
                {shippingOptions.map((o) => (
                  <label key={o.id} className="flex items-center justify-between border border-[var(--color-line)] p-4 cursor-pointer hover:border-[var(--color-ink)]">
                    <span className="flex items-center gap-3">
                      <input type="radio" name="ship" checked={shippingId === o.id} onChange={() => setShippingId(o.id)} />
                      {o.name}
                    </span>
                    <span className="text-sm">{(o.amount / 100).toFixed(2)} {currency.toUpperCase()}</span>
                  </label>
                ))}
              </div>
            )}
          </Section>
          {error && <div className="text-sm text-[var(--color-sale)]">{error}</div>}
          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="btn btn-outline h-12 px-6">Back</button>
            <button onClick={submitShipping} className="btn btn-primary h-12 px-8" disabled={pending}>
              {pending ? "Saving…" : "Continue to payment"}
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <Section title="Payment">
            <div className="space-y-2">
              <label className="flex items-center gap-3 border border-[var(--color-line)] p-4 cursor-pointer hover:border-[var(--color-ink)]">
                <input type="radio" name="pay" checked={payment === "cod"} onChange={() => setPayment("cod")} />
                <span className="flex-1">
                  <div className="text-sm font-medium">Cash on delivery</div>
                  <div className="text-xs text-[var(--color-ink-muted)]">Pay when you receive the order. India only.</div>
                </span>
              </label>
              <label className="flex items-center gap-3 border border-[var(--color-line)] p-4 cursor-pointer hover:border-[var(--color-ink)]">
                <input type="radio" name="pay" checked={payment === "razorpay"} onChange={() => setPayment("razorpay")} />
                <span className="flex-1">
                  <div className="text-sm font-medium">Razorpay</div>
                  <div className="text-xs text-[var(--color-ink-muted)]">UPI, cards, netbanking, wallets. Test mode until keys configured.</div>
                </span>
              </label>
              <label className="flex items-center gap-3 border border-[var(--color-line)] p-4 cursor-pointer hover:border-[var(--color-ink)]">
                <input type="radio" name="pay" checked={payment === "stripe"} onChange={() => setPayment("stripe")} />
                <span className="flex-1">
                  <div className="text-sm font-medium">Card (Stripe)</div>
                  <div className="text-xs text-[var(--color-ink-muted)]">International cards. Test mode until keys configured.</div>
                </span>
              </label>
            </div>
          </Section>
          {error && <div className="text-sm text-[var(--color-sale)]">{error}</div>}
          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="btn btn-outline h-12 px-6">Back</button>
            <button onClick={placeOrder} className="btn btn-primary h-12 px-8" disabled={pending}>
              {pending ? "Placing order…" : "Place order"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Stepper({ step }: { step: 1 | 2 | 3 }) {
  const steps = ["Address", "Shipping", "Payment"];
  return (
    <ol className="flex items-center gap-3 text-xs tracking-[0.14em] uppercase">
      {steps.map((s, i) => {
        const n = i + 1;
        const active = step === n;
        const done = step > n;
        return (
          <li key={s} className="flex items-center gap-2">
            <span className={`h-6 w-6 grid place-items-center border ${active ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-white" : done ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-accent-ink)]" : "border-[var(--color-line)] text-[var(--color-ink-muted)]"}`}>
              {n}
            </span>
            <span className={active ? "" : "text-[var(--color-ink-muted)]"}>{s}</span>
            {n < 3 && <span className="text-[var(--color-line-strong)]">·</span>}
          </li>
        );
      })}
    </ol>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-xs tracking-[0.14em] uppercase mb-2">{title}</legend>
      {children}
    </fieldset>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs tracking-[0.14em] uppercase">{label}{required && " *"}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={type}
        required={required}
        className="mt-1 h-11 w-full border border-[var(--color-line)] px-3 focus:border-[var(--color-ink)] outline-none"
      />
    </label>
  );
}
