import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import {
  createProductOptionsWorkflow,
  createProductVariantsWorkflow,
  deleteProductOptionsWorkflow,
  deleteProductVariantsWorkflow,
} from "@medusajs/medusa/core-flows";
import { BLOG_POSTS } from "./seed";

/**
 * Non-destructive, re-runnable catalog refresh.
 * Photos: Pexels (free licence, no key; https://www.pexels.com/license/).
 *
 * - Aligns every seeded product's type/category/title with its photos.
 * - Clothing: gallery + metadata.variant_images per Color (Ivory/Indigo/Ochre).
 * - Jewellery: swaps Size×Color variants for a Finish option (Gold / Oxidised Silver).
 * - Collections, home hero + category grid, blog heroes.
 * Run `fix-data.ts` afterwards to stock any newly created inventory items.
 */

export const px = (id: number, w = 1200) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;

type Looks = Record<string, number[][]>; // option value -> looks -> shots of one garment

const COLOR_LOOKS: Record<string, Looks> = {
  kurta: {
    Ivory: [[28512776, 28512781, 28512773], [28512787, 28512779], [34265189, 34265174], [20788490]],
    Indigo: [
      [39287862, 39287854, 39287863, 39287864], [39287853, 39287928, 39287930, 39287856],
      [13178920, 13178841, 13178918, 13178919], [13998716], [34138791], [20604437], [22064212], [19589909],
    ],
    Ochre: [[30809730, 30809729], [8770996, 8771006, 8771008], [8770947, 8771009], [28213774], [24868607], [22064197]],
  },
  dress: {
    Ivory: [
      [28438962, 28438963], [35887016], [25489117], [25328641], [29665808], [10321592],
      [37911331], [18380705], [20407233], [12151673],
    ],
    Indigo: [[34673582, 34673508], [12796269], [36634909, 36634892, 36634923], [14950244]],
    Ochre: [
      [34077588, 34077589], [34091706, 34658495], [34076976, 34091727],
      [13562538, 13562539, 13562542, 13562548], [5922737, 5922734, 5922729], [33557615],
    ],
  },
  set: {
    Ivory: [[14100162], [35637857], [20788501], [36090363], [20841146], [34182932], [36391529]],
    Indigo: [[28390542], [34688061], [35902071], [28213811], [29413606]],
    Ochre: [[18717209, 18717219, 18717217], [30196701], [33824984], [34933671], [33824985]],
  },
  coord: {
    Ivory: [[16397414, 16397413], [14369167], [6580495], [25632766]],
    Indigo: [[32809975, 32809976], [32809974, 32809972], [12958683], [20690516], [12131621]],
    Ochre: [[27223658], [11588268, 11588275], [24868607]],
  },
  bottom: {
    Ivory: [[33356917, 33335175], [33335176, 33335180], [33507971], [1149964, 1149963], [2659787], [28133636]],
    Indigo: [[30251753], [33335077, 33335079], [20083873], [38039403]],
    Ochre: [[12186971], [29873545, 29873547], [20736189], [8819337], [39605932]],
  },
};

const JEWEL_LOOKS: Record<string, Looks> = {
  Jhumkas: {
    Gold: [[37601639, 37601638], [13786772], [13595577]],
    "Oxidised Silver": [[38780933], [35137273], [36841599]],
  },
  "Necklace Set": {
    Gold: [
      [33154729], [13595451], [13595691], [13595689], [13595802], [13645592], [30572524],
      [5043048], [31772511], [17125505], [17298623], [15622999], [9808463], [36489481],
    ],
    "Oxidised Silver": [[30357845], [20850030]],
  },
  Earrings: {
    Gold: [[13595789], [32989030], [9808447], [2733490], [12631107]],
    "Oxidised Silver": [[20850030], [11203816], [33154633], [22821354], [5409533], [5409535], [19664451]],
  },
  Bangles: {
    Gold: [[37485307, 37485309], [39335345], [32988531]],
    "Oxidised Silver": [[35441807], [5409533]],
  },
};

// Same order as seeded categories.
const TYPES = ["kurta", "dress", "set", "coord", "bottom", "jewellery"] as const;
const CATEGORY_HANDLES = ["kurtas-&-kurtis", "dresses", "ethnic-sets", "co-ord-sets", "bottom-wear", "jewellery"];
const NOUNS: Record<string, string[]> = {
  kurta: ["Kurta", "Straight Kurta", "A-line Kurti", "Mulmul Kurta"],
  dress: ["Anarkali", "Maxi Dress", "Tiered Dress", "Anarkali Gown"],
  set: ["Kurta Set", "Sharara Set", "Palazzo Set", "Lehenga Set"],
  coord: ["Co-ord Set", "Shirt Co-ord", "Kaftan Co-ord"],
  bottom: ["Palazzo", "Straight Pants", "Salwar", "Flared Skirt"],
};
const JEWEL_TYPES = ["Jhumkas", "Necklace Set", "Earrings", "Bangles"];
const COLORS = ["Ivory", "Indigo", "Ochre"];
const FINISHES = ["Gold", "Oxidised Silver"];
const ADJECTIVES = ["Aanchal", "Saanvi", "Mira", "Inaya", "Reva", "Tara", "Kaira", "Anya", "Diya", "Nyra"];
const MAX_IMAGES = 8;

const COLLECTION_IMAGES: Record<string, number> = {
  kurtas: 39287862,
  dresses: 28438962,
  "ethnic-sets": 18717209,
  "co-ords": 32809975,
  "bottom-wear": 33356917,
  jewellery: 37601639,
  sale: 34222609,
  "new-arrivals": 8192360,
  "best-sellers": 13178920,
  festive: 20736212,
};

const HERO_SLIDES = [
  {
    image: px(8192360, 1800),
    eyebrow: "Spring · Summer · 26",
    title: "A new season of hand-loomed kurtas.",
    copy: "Made in limited runs across Jaipur, Lucknow, and Kolkata.",
    ctaLabel: "Shop new arrivals",
    ctaHref: "/collections/new-arrivals",
  },
  {
    image: px(20736212, 1800),
    eyebrow: "Festive edit",
    title: "Quiet luxury, woven slowly.",
    copy: "Banarasi silks, mulmul, hand-block prints — pieces meant for re-wear.",
    ctaLabel: "Explore festive",
    ctaHref: "/collections/festive",
  },
  {
    image: px(34222609, 1800),
    eyebrow: "End of season",
    title: "Up to 60% off select silhouettes.",
    copy: "Quietly priced, never compromised.",
    ctaLabel: "Shop sale",
    ctaHref: "/collections/sale",
  },
];

const GRID_CATEGORIES = [
  { label: "Kurtas", href: "/collections/kurtas", image: px(28512776, 900) },
  { label: "Dresses", href: "/collections/dresses", image: px(34077588, 900) },
  { label: "Ethnic sets", href: "/collections/ethnic-sets", image: px(14100162, 900) },
  { label: "Co-ords", href: "/collections/co-ords", image: px(16397414, 900) },
  { label: "Bottom wear", href: "/collections/bottom-wear", image: px(30251753, 900) },
  { label: "Jewellery", href: "/collections/jewellery", image: px(33154729, 900) },
];

const BLOG_HEROES: Record<string, number> = {
  "hello-world": 23749436,
  "block-printing-bagru": 28389703,
  "how-to-care-for-mulmul": 9339397,
  "festive-edit-26": 8819319,
};

const slug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

/** Pick one look per option value; the default value's look leads the gallery. */
function buildGallery(looks: Looks, values: string[], defaultValue: string, k: number) {
  const variantImages: Record<string, string[]> = {};
  values.forEach((v, vi) => {
    const list = looks[v];
    const idx = v === defaultValue ? Math.floor(k / values.length) : k + vi * 2;
    variantImages[v] = list[idx % list.length].map((id) => px(id));
  });
  const ordered = [defaultValue, ...values.filter((v) => v !== defaultValue)];
  const urls: string[] = [];
  // Interleave: every shot of the default look, then the other colours' shots.
  for (const v of ordered) for (const u of variantImages[v]) if (!urls.includes(u)) urls.push(u);
  return { images: urls.slice(0, MAX_IMAGES), variantImages };
}

export default async function refreshCatalogImages({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const productSvc: any = container.resolve("product");
  const cms: any = container.resolve("cms");
  const blog: any = container.resolve("blog");

  // --- Categories ---
  const categories = await productSvc.listProductCategories(
    { handle: CATEGORY_HANDLES },
    { select: ["id", "handle"] }
  );
  const catId = (h: string) => categories.find((c: any) => c.handle === h)?.id;

  // --- Products ---
  const { data: products } = await query.graph({
    entity: "product",
    fields: [
      "id", "handle", "title", "metadata",
      "options.id", "options.title",
      "variants.id", "variants.prices.amount", "variants.prices.currency_code",
    ],
  });

  const byIndex = new Map<number, any>();
  for (const p of products) {
    const m = String(p.handle).match(/-(\d+)$/);
    if (m) byIndex.set(Number(m[1]) - 1, p);
  }

  const ordinal: Record<string, number> = {};
  let updated = 0;
  let restructured = 0;

  for (let i = 0; i < 60; i++) {
    const p = byIndex.get(i);
    if (!p) continue;
    const t = i % 10 < 6 ? i % 10 : i % 6;
    const type = TYPES[t];
    const k = (ordinal[type] = (ordinal[type] ?? -1) + 1);
    const adj = ADJECTIVES[(k + t * 3) % ADJECTIVES.length]; // unique within a type

    let noun: string;
    let gallery: ReturnType<typeof buildGallery>;
    let defaultValue: string;

    if (type === "jewellery") {
      noun = JEWEL_TYPES[k % JEWEL_TYPES.length];
      defaultValue = FINISHES[Math.floor(k / JEWEL_TYPES.length) % FINISHES.length];
      gallery = buildGallery(JEWEL_LOOKS[noun], FINISHES, defaultValue, Math.floor(k / JEWEL_TYPES.length));
    } else {
      const nouns = NOUNS[type];
      noun = nouns[k % nouns.length];
      defaultValue = COLORS[k % COLORS.length];
      gallery = buildGallery(COLOR_LOOKS[type], COLORS, defaultValue, k);
    }

    const title = `${adj} ${noun}`;
    const handle = `${slug(title)}-${i + 1}`;

    await productSvc.updateProducts(p.id, {
      title,
      handle,
      thumbnail: gallery.images[0],
      images: gallery.images.map((url) => ({ url })),
      category_ids: [catId(CATEGORY_HANDLES[t])].filter(Boolean),
      metadata: {
        ...(p.metadata ?? {}),
        variant_images: gallery.variantImages,
        default_color: defaultValue,
        image_credit: "Pexels",
      },
    });
    updated++;

    if (type === "jewellery" && !(p.options ?? []).some((o: any) => o.title === "Finish")) {
      const sample = (p.variants ?? [])[0];
      const priceOf = (cur: string, fallback: number) =>
        sample?.prices?.find((x: any) => x.currency_code === cur)?.amount ?? fallback;
      const prices = [
        { currency_code: "inr", amount: priceOf("inr", 1499) },
        { currency_code: "usd", amount: priceOf("usd", 19) },
      ];

      const variantIds = (p.variants ?? []).map((v: any) => v.id);
      if (variantIds.length) {
        await deleteProductVariantsWorkflow(container).run({ input: { ids: variantIds } });
      }
      const optionIds = (p.options ?? []).map((o: any) => o.id);
      if (optionIds.length) {
        await deleteProductOptionsWorkflow(container).run({ input: { ids: optionIds } });
      }
      await createProductOptionsWorkflow(container).run({
        input: { product_options: [{ product_id: p.id, title: "Finish", values: FINISHES }] },
      });
      await createProductVariantsWorkflow(container).run({
        input: {
          product_variants: FINISHES.map((f) => ({
            product_id: p.id,
            title: f,
            sku: `${handle.toUpperCase()}-${f === "Gold" ? "GLD" : "SLV"}`,
            options: { Finish: f },
            manage_inventory: true,
            prices,
          })),
        },
      });
      restructured++;
    }
  }
  logger.info(`Updated ${updated} products; restructured ${restructured} jewellery products to Finish variants.`);

  // --- Collections ---
  const collections = await productSvc.listProductCollections(
    { handle: Object.keys(COLLECTION_IMAGES) },
    { select: ["id", "handle", "metadata"] }
  );
  for (const c of collections) {
    await productSvc.updateProductCollections(c.id, {
      metadata: { ...(c.metadata ?? {}), image: px(COLLECTION_IMAGES[c.handle], 1800) },
    });
  }
  logger.info(`Set banner images on ${collections.length} collections.`);

  // --- Home slots ---
  const slots = await cms.listHomeSlots({});
  for (const s of slots) {
    if (s.slot === "hero") {
      await cms.updateHomeSlots({ id: s.id, payload: { ...(s.payload ?? {}), image: HERO_SLIDES[0].image, slides: HERO_SLIDES } });
    } else if (s.slot === "category-grid") {
      await cms.updateHomeSlots({ id: s.id, payload: { ...(s.payload ?? {}), categories: GRID_CATEGORIES } });
    }
  }
  logger.info("Updated hero + category-grid home slots.");

  // --- Blog heroes (create any missing seed posts first) ---
  const existing = await blog.listBlogPosts({ slug: BLOG_POSTS.map((b) => b.slug) });
  const missing = BLOG_POSTS.filter((b) => !existing.some((e: any) => e.slug === b.slug));
  if (missing.length) await blog.createBlogPosts(missing);
  const posts = await blog.listBlogPosts({ slug: Object.keys(BLOG_HEROES) });
  for (const post of posts) {
    await blog.updateBlogPosts({ id: post.id, hero_image: px(BLOG_HEROES[post.slug], 1800) });
  }
  logger.info(`Set hero images on ${posts.length} blog posts.`);
}
