import type { MedusaRequest, MedusaResponse, MedusaNextFunction } from "@medusajs/framework/http";

const RESOURCE_FROM_PATH: Array<{ re: RegExp; type: string }> = [
  { re: /^\/admin\/blog/, type: "blog_post" },
  { re: /^\/admin\/cms\/pages/, type: "cms_page" },
  { re: /^\/admin\/cms\/home-slots/, type: "home_slot" },
  { re: /^\/admin\/cms\/site-settings/, type: "site_settings" },
  { re: /^\/admin\/reviews/, type: "review" },
  { re: /^\/admin\/contact/, type: "contact_submission" },
  { re: /^\/admin\/newsletter/, type: "newsletter_subscriber" },
  { re: /^\/admin\/wishlist/, type: "wishlist" },
  { re: /^\/admin\/products/, type: "product" },
  { re: /^\/admin\/orders/, type: "order" },
  { re: /^\/admin\/customers/, type: "customer" },
  { re: /^\/admin\/collections/, type: "collection" },
  { re: /^\/admin\/promotions/, type: "promotion" },
  { re: /^\/admin\/inventory-items/, type: "inventory_item" },
];

function detectResource(path: string): { type: string; id: string | null } {
  const clean = path.split("?")[0] ?? path;
  for (const { re, type } of RESOURCE_FROM_PATH) {
    if (re.test(clean)) {
      const segs = clean.split("/").filter(Boolean);
      const id = segs.slice(2).find((s) => /^[a-zA-Z0-9_-]{6,}$/.test(s) && !/^[a-z-]+$/.test(s)) ?? null;
      return { type, id };
    }
  }
  return { type: "unknown", id: null };
}

function clientIp(req: MedusaRequest): string | null {
  const xf = (req.headers["x-forwarded-for"] as string | undefined) ?? "";
  if (xf) return xf.split(",")[0]!.trim();
  return req.socket?.remoteAddress ?? null;
}

export async function logActivityMiddleware(
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
): Promise<void> {
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(req.method ?? "")) return next();

  const start = Date.now();
  const path = (req as any).originalUrl ?? req.url ?? "";

  res.on("finish", () => {
    void (async () => {
      try {
        const status = res.statusCode;
        if (status >= 400) return;

        const auth = (req as any).auth_context ?? (req as any).auth ?? {};
        const userId = auth.actor_id ?? auth.user_id ?? auth.userId ?? null;
        const userEmail = auth.app_metadata?.user_email ?? auth.email ?? null;

        const { type, id } = detectResource(path);
        const action = `${req.method?.toLowerCase()}_${type}`;

        const scope: any = (req as any).scope;
        if (!scope?.resolve) return;
        const svc: any = scope.resolve("activity");
        if (!svc?.createActivityEntries) return;

        const bodyKeys = req.body && typeof req.body === "object" ? Object.keys(req.body as any).slice(0, 20) : [];
        await svc.createActivityEntries({
          user_id: userId,
          user_email: userEmail,
          action,
          resource_type: type,
          resource_id: id,
          method: req.method!,
          path,
          status,
          diff: bodyKeys.length ? { body_keys: bodyKeys } : null,
          ip: clientIp(req),
          ua: (req.headers["user-agent"] as string | undefined) ?? null,
        });
      } catch (e) {
        if (process.env.NODE_ENV === "development") {
          // eslint-disable-next-line no-console
          console.warn("[activity-log]", (e as Error).message);
        }
      }
      void start;
    })();
  });

  return next();
}
