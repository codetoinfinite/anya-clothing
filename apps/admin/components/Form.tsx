import { ReactNode } from "react";

export function Field({
  label,
  name,
  hint,
  error,
  children,
}: {
  label: string;
  name?: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={name} className="label block mb-1">
        {label}
      </label>
      {children}
      {hint ? <div className="text-xs text-[var(--color-ink-muted)] mt-1">{hint}</div> : null}
      {error ? <div className="text-xs text-[var(--color-danger)] mt-1">{error}</div> : null}
    </div>
  );
}

export function FormError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <div className="text-sm text-[var(--color-danger)] bg-[#fee2e2] border border-[#fecaca] rounded px-3 py-2">
      {message}
    </div>
  );
}

export function DeleteConfirm({
  action,
  label = "Delete",
  hidden,
}: {
  action: (formData: FormData) => void | Promise<void>;
  label?: string;
  hidden?: Record<string, string>;
}) {
  return (
    <form action={action}>
      {hidden
        ? Object.entries(hidden).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)
        : null}
      <button
        type="submit"
        className="btn btn-danger text-sm"
      >
        {label}
      </button>
    </form>
  );
}
