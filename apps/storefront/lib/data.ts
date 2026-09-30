import { medusa } from "./medusa";
import { env } from "./env";
import type { StoreRegion } from "./medusa-types";

export type Variant = {
  id: string;
  title: string;
  sku?: string;
  inventory_quantity?: number;
  calculated_price?: { calculated_amount: number; currency_code: string };
  options?: { option_id?: string; value: string }[];
};
export type Product = {
  id: string;
  handle: string;
  title: string;
  subtitle?: string;
  description?: string;
  thumbnail?: string | null;
  images?: { url: string }[];
  options?: { id: string; title: string; values: { value: string }[] }[];
  variants?: Variant[];
  collection?: { id: string; handle: string; title: string } | null;
  collection_id?: string | null;
  metadata?: Record<string, unknown> | null;
};
export type Collection = {
  id: string;
  handle: string;
  title: string;
  metadata?: Record<string, unknown> | null;
};

const DEFAULT_FIELDS =
  "+metadata,*variants,*variants.calculated_price,*variants.options,*options,*options.values,*images,*collection";

type ListQuery = Record<string, string | number | string[] | undefined>;

async function getRegionId(): Promise<string | undefined> {
  try {
    const { regions } = (await medusa.store.region.list({
      fields: "id,name,currency_code,*countries",
    } as ListQuery)) as { regions: StoreRegion[] };
    const match =
      regions.find((r) => r.countries?.some((c) => c.iso_2 === env.defaultRegion)) ?? regions[0];
    return match?.id;
  } catch {
    return undefined;
  }
}

let _regionPromise: Promise<string | undefined> | null = null;
export function regionId() {
  if (!_regionPromise) {
    // Don't cache a failed lookup (e.g. backend not up yet) — retry on next call.
    _regionPromise = getRegionId().then((id) => {
      if (!id) _regionPromise = null;
      return id;
    });
  }
  return _regionPromise;
}

export async function listCollections(): Promise<Collection[]> {
  try {
    const { collections } = (await medusa.store.collection.list({ limit: 50, fields: "+metadata" } as ListQuery)) as {
      collections: Collection[];
    };
    return collections;
  } catch {
    return [];
  }
}

export async function listProducts(
  opts: {
    collection_id?: string | string[];
    category_id?: string | string[];
    q?: string;
    limit?: number;
    offset?: number;
    order?: string;
  } = {}
): Promise<{ products: Product[]; count: number }> {
  try {
    const region_id = await regionId();
    const { products, count } = (await medusa.store.product.list({
      ...opts,
      region_id,
      fields: DEFAULT_FIELDS,
      limit: opts.limit ?? 12,
    } as ListQuery)) as { products: Product[]; count?: number };
    return { products, count: count ?? products.length };
  } catch (e) {
    if (process.env.NODE_ENV === "development") console.warn("[listProducts]", (e as Error).message);
    return { products: [], count: 0 };
  }
}

export async function getCollectionByHandle(handle: string): Promise<Collection | null> {
  try {
    const { collections } = (await medusa.store.collection.list({
      handle,
      limit: 1,
      fields: "+metadata",
    } as ListQuery)) as { collections: Collection[] };
    return collections[0] ?? null;
  } catch (e) {
    // Backend unreachable/misconfigured: render an empty collection instead of a 404 so nav links still work.
    if (process.env.NODE_ENV === "development") console.warn("[getCollectionByHandle]", (e as Error).message);
    const title = handle.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    return { id: "", handle, title };
  }
}

export async function getProductByHandle(handle: string): Promise<Product | null> {
  try {
    const region_id = await regionId();
    const { products } = (await medusa.store.product.list({
      handle,
      region_id,
      fields: DEFAULT_FIELDS,
      limit: 1,
    } as ListQuery)) as { products: Product[] };
    return products[0] ?? null;
  } catch (e) {
    if (process.env.NODE_ENV === "development") console.warn("[getProductByHandle]", (e as Error).message);
    return null;
  }
}

export function collectionImage(c: Collection): string | null {
  const img = c.metadata?.image;
  return typeof img === "string" && img ? img : null;
}

export function productPrice(p: Product): { amount: number; currency: string } | null {
  const v = p.variants?.find((x) => x.calculated_price);
  if (!v?.calculated_price) return null;
  return { amount: v.calculated_price.calculated_amount, currency: v.calculated_price.currency_code };
}

export function productImage(p: Product, index = 0): string | null {
  if (p.images?.[index]?.url) return p.images[index].url;
  return p.thumbnail ?? null;
}
