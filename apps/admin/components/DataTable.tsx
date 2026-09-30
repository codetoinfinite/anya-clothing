import Link from "next/link";
import { ReactNode } from "react";

export type Column<T> = {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  width?: string;
};

export function DataTable<T extends { id: string }>({
  rows,
  columns,
  rowHref,
  empty,
}: {
  rows: T[];
  columns: Column<T>[];
  rowHref?: (row: T) => string;
  empty?: ReactNode;
}) {
  if (!rows.length) {
    return (
      <div className="card p-10 text-center text-sm text-[var(--color-ink-muted)]">
        {empty ?? "No records found."}
      </div>
    );
  }
  return (
    <div className="card overflow-hidden">
      <table className="table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} style={c.width ? { width: c.width } : undefined}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              {columns.map((c, i) => {
                const content = c.cell(row);
                if (rowHref && i === 0) {
                  return (
                    <td key={c.key}>
                      <Link href={rowHref(row)} className="hover:underline">
                        {content}
                      </Link>
                    </td>
                  );
                }
                return <td key={c.key}>{content}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Pagination({
  basePath,
  query,
  limit,
  offset,
  total,
}: {
  basePath: string;
  query: Record<string, string | undefined>;
  limit: number;
  offset: number;
  total: number;
}) {
  const page = Math.floor(offset / limit) + 1;
  const pages = Math.max(1, Math.ceil(total / limit));
  const mkHref = (off: number) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) if (v) sp.set(k, v);
    sp.set("limit", String(limit));
    sp.set("offset", String(off));
    return `${basePath}?${sp.toString()}`;
  };
  const prev = Math.max(0, offset - limit);
  const next = Math.min((pages - 1) * limit, offset + limit);
  return (
    <div className="flex items-center justify-between mt-3 text-sm text-[var(--color-ink-muted)]">
      <div>
        Page {page} of {pages} · {total} total
      </div>
      <div className="flex items-center gap-2">
        <Link
          href={mkHref(prev)}
          className={`btn btn-outline ${offset === 0 ? "pointer-events-none opacity-40" : ""}`}
        >
          Prev
        </Link>
        <Link
          href={mkHref(next)}
          className={`btn btn-outline ${page >= pages ? "pointer-events-none opacity-40" : ""}`}
        >
          Next
        </Link>
      </div>
    </div>
  );
}

export function Badge({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "success" | "warn" | "danger" | "info" }) {
  const cls = tone === "default" ? "badge" : `badge badge-${tone}`;
  return <span className={cls}>{children}</span>;
}
