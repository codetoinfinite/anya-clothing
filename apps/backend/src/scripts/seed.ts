import {
  ExecArgs,
} from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  ModuleRegistrationName,
  Modules,
} from "@medusajs/framework/utils";
import {
  createApiKeysWorkflow,
  createCollectionsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows";

const BRAND = process.env.NEXT_PUBLIC_BRAND_NAME ?? "Aanya";

const COLLECTIONS = [
  { title: "Kurtas", handle: "kurtas" },
  { title: "Dresses", handle: "dresses" },
  { title: "Ethnic Sets", handle: "ethnic-sets" },
  { title: "Co-ords", handle: "co-ords" },
  { title: "Bottom Wear", handle: "bottom-wear" },
  { title: "Jewellery", handle: "jewellery" },
  { title: "Sale", handle: "sale" },
  { title: "New Arrivals", handle: "new-arrivals" },
  { title: "Best Sellers", handle: "best-sellers" },
  { title: "Festive", handle: "festive" },
];

const CATEGORIES = [
  { name: "Kurtas & Kurtis" },
  { name: "Dresses" },
  { name: "Ethnic Sets" },
  { name: "Co-ord Sets" },
  { name: "Bottom Wear" },
  { name: "Jewellery" },
];

const PLACEHOLDER_IMAGES = [
  "https://images.pexels.com/photos/28512776/pexels-photo-28512776.jpeg?auto=compress&cs=tinysrgb&w=900",
  "https://images.pexels.com/photos/14100162/pexels-photo-14100162.jpeg?auto=compress&cs=tinysrgb&w=900",
  "https://images.pexels.com/photos/16397414/pexels-photo-16397414.jpeg?auto=compress&cs=tinysrgb&w=900",
  "https://images.pexels.com/photos/30251753/pexels-photo-30251753.jpeg?auto=compress&cs=tinysrgb&w=900",
  "https://images.pexels.com/photos/34077588/pexels-photo-34077588.jpeg?auto=compress&cs=tinysrgb&w=900",
];

const ADJECTIVES = ["Aanchal", "Saanvi", "Mira", "Inaya", "Reva", "Tara", "Kaira", "Anya", "Diya", "Nyra"];
const SUFFIXES = ["Kurta", "Anarkali", "Co-ord", "Dress", "Set"];

function makeProductName(i: number) {
  return `${ADJECTIVES[i % ADJECTIVES.length]} ${SUFFIXES[i % SUFFIXES.length]}`;
}

export default async function seedDemoData({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const storeModuleService = container.resolve(Modules.STORE);

  logger.info(`Seeding ${BRAND} store…`);

  const [store] = await storeModuleService.listStores();

  // Region: India
  const { result: regions } = await createRegionsWorkflow(container).run({
    input: {
      regions: [
        {
          name: "India",
          currency_code: "inr",
          countries: ["in"],
          payment_providers: ["pp_system_default"],
        },
        {
          name: "International",
          currency_code: "usd",
          countries: ["us", "gb", "ca", "au", "ae", "sg", "my"],
          payment_providers: ["pp_system_default"],
        },
      ],
    },
  });
  const region = regions[0];

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        supported_currencies: [
          { currency_code: "inr", is_default: true },
          { currency_code: "usd" },
        ],
        default_sales_channel_id: store.default_sales_channel_id ?? undefined,
      },
    },
  });

  // Sales channel (uses existing default + creates 'storefront')
  const { result: salesChannels } = await createSalesChannelsWorkflow(container).run({
    input: { salesChannelsData: [{ name: "Storefront" }] },
  });
  const salesChannel = salesChannels[0];

  // Stock location
  const { result: stockLocations } = await createStockLocationsWorkflow(container).run({
    input: {
      locations: [
        {
          name: "Jaipur Warehouse",
          address: {
            city: "Jaipur",
            country_code: "in",
            address_1: "Sirsi Road",
          },
        },
      ],
    },
  });
  const stockLocation = stockLocations[0];

  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: { id: stockLocation.id, add: [salesChannel.id] },
  });

  // Shipping profile
  const { result: shippingProfiles } = await createShippingProfilesWorkflow(container).run({
    input: { data: [{ name: "Default", type: "default" }] },
  });
  const shippingProfile = shippingProfiles[0];

  // Tax region
  await createTaxRegionsWorkflow(container).run({
    input: [{ country_code: "in" }],
  });

  // Publishable API key
  const { result: apiKeys } = await createApiKeysWorkflow(container).run({
    input: {
      api_keys: [
        {
          title: "Storefront",
          type: "publishable",
          created_by: "seed",
        },
      ],
    },
  });
  const publishableKey = apiKeys[0];

  await linkSalesChannelsToApiKeyWorkflow(container).run({
    input: { id: publishableKey.id, add: [salesChannel.id] },
  });

  // Collections
  const { result: collections } = await createCollectionsWorkflow(container).run({
    input: { collections: COLLECTIONS },
  });

  // Categories
  const { result: categories } = await createProductCategoriesWorkflow(container).run({
    input: { product_categories: CATEGORIES.map((c) => ({ ...c, is_active: true })) },
  });

  // Products: 60 across collections
  const productsInput = Array.from({ length: 60 }).map((_, i) => {
    const handle = `${makeProductName(i).toLowerCase().replace(/\s+/g, "-")}-${i + 1}`;
    const collection = collections[i % collections.length];
    const category = categories[i % categories.length];
    const image1 = PLACEHOLDER_IMAGES[i % PLACEHOLDER_IMAGES.length];
    const image2 = PLACEHOLDER_IMAGES[(i + 1) % PLACEHOLDER_IMAGES.length];
    const basePrice = 1499 + (i % 10) * 400;
    return {
      title: makeProductName(i),
      handle,
      description:
        "Hand-finished piece from our small-batch atelier. Cut from breathable cotton-blend, lined where needed, with thread-and-bead detailing at the placket and cuffs.",
      status: "published" as const,
      collection_id: collection.id,
      category_ids: [category.id],
      sales_channels: [{ id: salesChannel.id }],
      images: [{ url: image1 }, { url: image2 }],
      options: [
        { title: "Size", values: ["XS", "S", "M", "L", "XL"] },
        { title: "Color", values: ["Ivory", "Indigo", "Ochre"] },
      ],
      variants: ["XS", "S", "M", "L", "XL"].flatMap((size) =>
        ["Ivory", "Indigo", "Ochre"].map((color) => ({
          title: `${size} / ${color}`,
          sku: `${handle.toUpperCase()}-${size}-${color.slice(0, 3).toUpperCase()}`,
          options: { Size: size, Color: color },
          manage_inventory: true,
          prices: [
            { amount: basePrice, currency_code: "inr" },
            { amount: Math.round(basePrice / 80), currency_code: "usd" },
          ],
        }))
      ),
    };
  });

  await createProductsWorkflow(container).run({ input: { products: productsInput } });

  // Shipping options: skipped here (requires fulfillment set + service zone).
  // Configure via admin UI: Settings → Locations → add fulfillment set + zone, then add option.

  logger.info(`Created ${productsInput.length} products in ${collections.length} collections.`);

  await seedCmsContent(container, logger);

  logger.info("✓ Seed complete.");
  logger.info(`Storefront publishable key: ${publishableKey.token}`);
  logger.info("Copy this into NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY in your storefront .env.local");
}

const CMS_PAGES = [
  {
    slug: "about",
    title: "Slow-made, intentional, Indian.",
    body: { text: `Aanya was founded in 2021 in a two-room studio in Jaipur. We work directly with block-printers, weavers and embroiderers across Rajasthan, Gujarat and West Bengal — never more than two hands removed from the loom.\n\n## Why small-batch\n\nWe don't drop seasons of 400 styles. We drop 8–12, three times a year. Each piece is hand-finished, quality-controlled by a senior tailor, and packed in recyclable kraft.\n\n## Where we work\n\nOur printing partners are in Bagru and Sanganer (Rajasthan). Our weavers are in Maheshwar (Madhya Pradesh) and Phulia (West Bengal). Our embroidery atelier is in Lucknow.` },
    seo_title: "About — small-batch ethnic wear from Jaipur",
    seo_description: "Aanya is a Jaipur-based atelier crafting block-printed and hand-woven ethnic wear in small batches.",
  },
  {
    slug: "shipping",
    title: "Shipping",
    body: { text: `## India\n\nFree standard shipping on prepaid orders above ₹1,499. Cash on delivery is available below ₹15,000 with a ₹49 handling fee. Dispatch within 48 working hours; delivery in 3–6 days via Delhivery and Bluedart.\n\n## International\n\nFlat ₹2,500 to the US, UK, Canada, Australia, UAE, Singapore and Malaysia. 7–14 business days via FedEx with tracking. Duties at destination, not collected by us.` },
    seo_title: "Shipping policy",
    seo_description: "Shipping rates, timelines and carriers for domestic and international orders.",
  },
  {
    slug: "returns",
    title: "Returns & exchanges",
    body: { text: `## 7-day window\n\nWe accept returns within 7 days of delivery on unworn, untagged pieces in original packaging. Sale items and made-to-order pieces are final sale.\n\n## How to start\n\nEmail care@aanya.studio with your order number. We arrange the reverse pickup; refund issued to original payment method within 5 working days of pickup.` },
    seo_title: "Returns and exchanges",
    seo_description: "7-day no-questions-asked return window with free reverse pickup across India.",
  },
  {
    slug: "privacy",
    title: "Privacy policy",
    body: { text: `## What we collect\n\nName, email, phone, billing/shipping address, and order history. Payment data is processed by Razorpay; we never store card numbers.\n\n## How we use it\n\nTo fulfill orders, communicate about your order, and — only with consent — send marketing emails you can unsubscribe from at any time.\n\n## Your rights\n\nYou can request export or deletion of your data anytime by writing to privacy@aanya.studio.` },
    seo_title: "Privacy policy",
    seo_description: "How Aanya collects, uses and protects your personal data.",
  },
  {
    slug: "terms",
    title: "Terms of service",
    body: { text: `## Use of the site\n\nBy using aanya.studio you agree to these terms. Prices and availability are subject to change.\n\n## Pricing & taxes\n\nAll prices are in INR for India and USD for international, inclusive of applicable GST where shown.\n\n## Limitation\n\nAanya is not liable for indirect, incidental or consequential damages arising from use of the site or products beyond the order value.` },
    seo_title: "Terms of service",
    seo_description: "Terms governing the use of aanya.studio.",
  },
  {
    slug: "faq",
    title: "Frequently asked",
    body: {
      text: "",
      faq: {
        groups: [
          {
            heading: "Sizing & fit",
            items: [
              { q: "What sizes do you offer?", a: "XS through XL on most ready-to-wear pieces. Custom sizing is available on made-to-order silhouettes for a 10% surcharge — email care@aanya.studio after placing the order." },
              { q: "Do pieces shrink?", a: "Hand-block-printed cotton shrinks 2–3% in the first wash. We pre-shrink before cutting; expected residual shrinkage is minimal." },
            ],
          },
          {
            heading: "Orders & shipping",
            items: [
              { q: "Do you ship internationally?", a: "Yes — flat ₹2,500 to the US, UK, Canada, Australia, UAE, Singapore and Malaysia. 7–14 business days via FedEx with tracking." },
              { q: "Can I cancel my order?", a: "Yes, within 12 hours of placement at no charge. After dispatch, the standard return flow applies." },
              { q: "Do you accept COD?", a: "Yes, for domestic orders below ₹15,000. ₹49 COD handling fee applies." },
            ],
          },
        ],
      },
    },
    seo_title: "FAQ",
    seo_description: "Answers to common questions about sizing, shipping, returns and care.",
  },
];

export const BLOG_POSTS = [
  {
    slug: "block-printing-bagru",
    title: "Inside the block-printing studios of Bagru",
    excerpt: "A morning with the printers who supply our hand-block kurtas — and what makes the indigo so resistant to fade.",
    body: { text: `In Bagru, a town an hour west of Jaipur, the printing day starts at 4am. Tables are washed; blocks soaked overnight in pigment; cotton stretched and pinned.\n\nThe indigo we use is fermented on-site for ten days. That long ferment is the difference between a colour that fades in three washes and one that deepens for years.\n\nWe order our cottons six months in advance to give the studios time to print without rushing.` },
    hero_image: "https://images.pexels.com/photos/28389703/pexels-photo-28389703.jpeg?auto=compress&cs=tinysrgb&w=1800",
    tag: "Craft",
    author: "Aanya Studio",
    status: "published" as const,
    published_at: new Date(),
    seo_title: "Inside the block-printing studios of Bagru",
    seo_description: "How fermentation, water and patience produce indigo that ages beautifully.",
  },
  {
    slug: "how-to-care-for-mulmul",
    title: "How to care for mulmul, our favourite summer cotton",
    excerpt: "Five rules that will keep your mulmul kurta soft and white for ten summers.",
    body: { text: `Mulmul is a fine, light cotton — historically woven in Bengal and used by Mughal royalty for summer wear. It rewards gentle care.\n\n1. Hand-wash cold for the first three washes.\n2. Skip the dryer; air-dry in shade.\n3. Iron damp on the reverse side.\n4. Store folded, not hung.\n5. Avoid bleach — ever.` },
    hero_image: "https://images.pexels.com/photos/9339397/pexels-photo-9339397.jpeg?auto=compress&cs=tinysrgb&w=1800",
    tag: "Care",
    author: "Aanya Studio",
    status: "published" as const,
    published_at: new Date(),
    seo_title: "How to care for mulmul",
    seo_description: "A short, practical guide to keeping mulmul cottons soft for years.",
  },
  {
    slug: "festive-edit-26",
    title: "The festive edit, 2026",
    excerpt: "Twelve pieces — anarkalis, lehenga sets and zardozi co-ords — chosen for the season.",
    body: { text: `Our festive edit is small on purpose. Twelve silhouettes, no repeats, with the kind of finishing that's wasted on volume.\n\nHighlights this year: a champagne-gold zardozi anarkali, a black-and-magenta brocade co-ord, and a foundational ivory sharara set you'll re-wear.` },
    hero_image: "https://images.pexels.com/photos/8819319/pexels-photo-8819319.jpeg?auto=compress&cs=tinysrgb&w=1800",
    tag: "Edit",
    author: "Aanya Studio",
    status: "published" as const,
    published_at: new Date(),
    seo_title: "The festive edit, 2026",
    seo_description: "Twelve festive silhouettes from Aanya, hand-finished in Jaipur.",
  },
];

const HOME_SLOTS_SEED = [
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
        { label: "Co-ords", href: "/collections/co-ords", image: "https://images.pexels.com/photos/30251753/pexels-photo-30251753.jpeg?auto=compress&cs=tinysrgb&w=900" },
      ],
    },
  },
  { slot: "featured-collection", position: 2, enabled: true, payload: { collection_handle: "new-arrivals", eyebrow: "Just in", title: "New arrivals", limit: 12 } },
  { slot: "featured-collection", position: 3, enabled: true, payload: { collection_handle: "best-sellers", eyebrow: "Most-loved", title: "Best sellers", limit: 12 } },
  { slot: "blog-preview", position: 4, enabled: true, payload: { limit: 3, title: "Notes from the studio" } },
];

const SITE_SETTINGS_SEED = {
  brand_name: BRAND,
  logo_url: null,
  announcement_text: "Free shipping on prepaid orders above ₹1499 · Easy 7-day returns across India · Now shipping to 28 countries",
  announcement_link: null,
  social_links: {
    instagram: "https://instagram.com/aanya.studio",
    facebook: "https://facebook.com/aanya.studio",
    youtube: "https://youtube.com/@aanyastudio",
  },
  contact_email: "care@aanya.studio",
  contact_phone: "+91 91234 56789",
  footer_copy: "Crafted in small batches across India. We design contemporary ethnic wear that lasts beyond a season.",
};

async function seedCmsContent(container: any, logger: any) {
  logger.info("Seeding CMS pages, blog posts, home slots and site settings…");

  const cms = container.resolve("cms");
  const blog = container.resolve("blog");

  const existingPages = await cms.listCmsPages({});
  const existingSlugs = new Set((existingPages ?? []).map((p: any) => p.slug));
  const pagesToCreate = CMS_PAGES.filter((p) => !existingSlugs.has(p.slug));
  if (pagesToCreate.length > 0) {
    await cms.createCmsPages(pagesToCreate);
    logger.info(`Inserted ${pagesToCreate.length} CMS pages.`);
  } else {
    logger.info("CMS pages already seeded; skipping.");
  }

  const existingSlots = await cms.listHomeSlots({});
  const slotsList = existingSlots ?? [];
  const haveSlotTypes = new Set(slotsList.map((s: any) => s.slot));
  const missingSlots = HOME_SLOTS_SEED.filter((s) => !haveSlotTypes.has(s.slot));
  if (missingSlots.length > 0) {
    await cms.createHomeSlots(missingSlots);
    logger.info(`Inserted ${missingSlots.length} home slots (filled missing types).`);
  } else {
    logger.info("Home slots already seeded; skipping.");
  }

  const existingSettings = await cms.listSiteSettings({});
  if ((existingSettings ?? []).length === 0) {
    await cms.createSiteSettings([SITE_SETTINGS_SEED]);
    logger.info("Inserted site settings row.");
  } else {
    logger.info("Site settings already present; skipping.");
  }

  const existingPosts = await blog.listBlogPosts({});
  const existingBlogSlugs = new Set((existingPosts ?? []).map((p: any) => p.slug));
  const postsToCreate = BLOG_POSTS.filter((p) => !existingBlogSlugs.has(p.slug));
  if (postsToCreate.length > 0) {
    await blog.createBlogPosts(postsToCreate);
    logger.info(`Inserted ${postsToCreate.length} blog posts.`);
  } else {
    logger.info("Blog posts already seeded; skipping.");
  }
}
