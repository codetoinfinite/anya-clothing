import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

const HOME_SLOTS = [
  {
    slot: "hero",
    position: 0,
    enabled: true,
    payload: {
      headline: "A new season of hand-loomed kurtas.",
      subhead: "Made in limited runs across Jaipur, Lucknow, and Kolkata.",
      cta_label: "Shop new arrivals",
      cta_href: "/collections/new-arrivals",
      image: "https://images.pexels.com/photos/8192360/pexels-photo-8192360.jpeg?auto=compress&cs=tinysrgb&w=1800",
      eyebrow: "Spring · Summer · 26",
    },
  },
  {
    slot: "category-grid",
    position: 1,
    enabled: true,
    payload: {
      categories: [
        { label: "Kurtas", href: "/collections/kurtas", image: "https://images.pexels.com/photos/28512776/pexels-photo-28512776.jpeg?auto=compress&cs=tinysrgb&w=900" },
        { label: "Dresses", href: "/collections/dresses", image: "https://images.pexels.com/photos/34077588/pexels-photo-34077588.jpeg?auto=compress&cs=tinysrgb&w=900" },
        { label: "Ethnic sets", href: "/collections/ethnic-sets", image: "https://images.pexels.com/photos/14100162/pexels-photo-14100162.jpeg?auto=compress&cs=tinysrgb&w=900" },
        { label: "Co-ords", href: "/collections/co-ords", image: "https://images.pexels.com/photos/16397414/pexels-photo-16397414.jpeg?auto=compress&cs=tinysrgb&w=900" },
      ],
    },
  },
  { slot: "featured-collection", position: 2, enabled: true, payload: { collection_handle: "new-arrivals", eyebrow: "Just in", title: "New arrivals", limit: 12 } },
  { slot: "featured-collection", position: 3, enabled: true, payload: { collection_handle: "best-sellers", eyebrow: "Most-loved", title: "Best sellers", limit: 12 } },
  { slot: "blog-preview", position: 4, enabled: true, payload: { limit: 3, title: "Notes from the studio" } },
];

export default async function seedCms({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const cms: any = container.resolve("cms");

  const existing = await cms.listHomeSlots({});
  const have = new Set((existing ?? []).map((s: any) => s.slot));
  const missing = HOME_SLOTS.filter((s) => !have.has(s.slot));

  if (missing.length > 0) {
    await cms.createHomeSlots(missing);
    logger.info(`Inserted ${missing.length} missing slot(s): ${missing.map((m) => m.slot).join(", ")}`);
  } else {
    logger.info(`Home slots present: ${[...have].join(", ")}.`);
  }

  const heroSeed = HOME_SLOTS.find((s) => s.slot === "hero")!;
  const heroRows = (existing ?? []).filter((s: any) => s.slot === "hero" && !s.payload?.image);
  if (heroRows.length > 0) {
    for (const row of heroRows) {
      await cms.updateHomeSlots({ id: row.id, payload: heroSeed.payload });
    }
    logger.info(`Refilled ${heroRows.length} hero slot payload(s).`);
  }

  const catSeed = HOME_SLOTS.find((s) => s.slot === "category-grid")!;
  const catRows = (existing ?? []).filter((s: any) => s.slot === "category-grid");
  if (catRows.length > 0) {
    for (const row of catRows) {
      await cms.updateHomeSlots({ id: row.id, payload: catSeed.payload });
    }
    logger.info(`Refreshed ${catRows.length} category-grid payload(s).`);
  }
}
