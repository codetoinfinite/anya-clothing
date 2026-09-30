import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

const REPLACEMENTS: Record<string, string> = {
  "1583391733956-6c78276477e2": "1609220136736-443140cffec6",
  "1617059062506-4eaef3a09e9b": "1591348278863-a8fb3887e2aa",
  "1610030469668-8e4a47fed1ff": "1591197172062-c718f82aba20",
};

function fix(url: string | null | undefined): string | null {
  if (!url) return url ?? null;
  let out = url;
  for (const [bad, good] of Object.entries(REPLACEMENTS)) {
    out = out.split(bad).join(good);
  }
  return out;
}

export default async function run({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const productSvc: any = container.resolve("product");

  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "thumbnail", "images.id", "images.url"],
  });

  let pCount = 0;
  let iCount = 0;
  for (const p of products) {
    const newThumb = fix(p.thumbnail);
    const fixedImages = (p.images ?? []).map((img: any) => ({ url: fix(img.url) ?? img.url }));
    const imagesChanged = (p.images ?? []).some((img: any, i: number) => fixedImages[i].url !== img.url);
    if (newThumb === p.thumbnail && !imagesChanged) continue;
    await productSvc.updateProducts(p.id, {
      thumbnail: newThumb,
      images: fixedImages,
    });
    if (newThumb !== p.thumbnail) pCount++;
    if (imagesChanged) iCount += fixedImages.filter((f: any, i: number) => f.url !== (p.images ?? [])[i].url).length;
  }
  logger.info(`Fixed ${pCount} product thumbnails, ${iCount} product images.`);
}
