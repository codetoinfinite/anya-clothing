import { ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils";
import {
  createInventoryLevelsWorkflow,
  createServiceZonesWorkflow,
  createShippingOptionsWorkflow,
} from "@medusajs/medusa/core-flows";

export default async function fixData({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  const stockLocationService = container.resolve(Modules.STOCK_LOCATION);
  const fulfillmentService = container.resolve(Modules.FULFILLMENT);
  const inventoryService = container.resolve(Modules.INVENTORY);

  logger.info("Fix-data: starting non-destructive backfill (inventory levels + shipping options).");

  // --- Resolve location, shipping profile ---
  const locations = await stockLocationService.listStockLocations({});
  if (!locations.length) throw new Error("No stock location found. Run `pnpm seed` first.");
  const location = locations[0];
  logger.info(`Using stock location: ${location.name} (${location.id}).`);

  const shippingProfiles = await fulfillmentService.listShippingProfiles({});
  if (!shippingProfiles.length) throw new Error("No shipping profile. Run `pnpm seed` first.");
  const shippingProfile = shippingProfiles[0];

  // --- 1. Backfill inventory levels for every variant inventory item ---
  const { data: variants } = await query.graph({
    entity: "product_variant",
    fields: ["id", "manage_inventory", "inventory_items.inventory.id"],
  });

  const inventoryItemIds = new Set<string>();
  for (const v of variants) {
    if (!v.manage_inventory) continue;
    for (const ii of v.inventory_items ?? []) {
      if (ii?.inventory?.id) inventoryItemIds.add(ii.inventory.id);
    }
  }
  logger.info(`Found ${inventoryItemIds.size} inventory items needing levels.`);

  const existingLevels = await inventoryService.listInventoryLevels({
    location_id: location.id,
  });
  const haveLevel = new Set(existingLevels.map((l) => l.inventory_item_id));

  const toCreate = [...inventoryItemIds]
    .filter((id) => !haveLevel.has(id))
    .map((id) => ({
      inventory_item_id: id,
      location_id: location.id,
      stocked_quantity: 100,
    }));

  if (toCreate.length) {
    // Create in chunks of 200 to avoid huge workflow payloads.
    const chunk = 200;
    for (let i = 0; i < toCreate.length; i += chunk) {
      await createInventoryLevelsWorkflow(container).run({
        input: { inventory_levels: toCreate.slice(i, i + chunk) },
      });
    }
    logger.info(`Created ${toCreate.length} inventory levels.`);
  } else {
    logger.info("All inventory items already have levels at this location.");
  }

  // --- 2. Ensure fulfillment set linked to stock location ---
  const { data: locWithSets } = await query.graph({
    entity: "stock_location",
    fields: ["id", "fulfillment_sets.id", "fulfillment_sets.service_zones.id", "fulfillment_sets.service_zones.name"],
    filters: { id: location.id },
  });
  let fulfillmentSetId: string | undefined =
    locWithSets[0]?.fulfillment_sets?.[0]?.id;
  let indiaZoneId: string | undefined;
  let intlZoneId: string | undefined;

  if (!fulfillmentSetId) {
    logger.info("Creating fulfillment set + service zones (India, International).");
    const [fset] = await fulfillmentService.createFulfillmentSets([
      {
        name: "Default delivery",
        type: "shipping",
        service_zones: [
          {
            name: "India",
            geo_zones: [{ type: "country", country_code: "in" }],
          },
          {
            name: "International",
            geo_zones: [
              { type: "country", country_code: "us" },
              { type: "country", country_code: "gb" },
              { type: "country", country_code: "ca" },
              { type: "country", country_code: "au" },
              { type: "country", country_code: "ae" },
              { type: "country", country_code: "sg" },
              { type: "country", country_code: "my" },
            ],
          },
        ],
      },
    ]);
    fulfillmentSetId = fset.id;
    indiaZoneId = fset.service_zones.find((z: any) => z.name === "India")?.id;
    intlZoneId = fset.service_zones.find((z: any) => z.name === "International")?.id;

    await link.create({
      [Modules.STOCK_LOCATION]: { stock_location_id: location.id },
      [Modules.FULFILLMENT]: { fulfillment_set_id: fulfillmentSetId },
    });
    logger.info("Fulfillment set linked to stock location.");
  } else {
    const zones = locWithSets[0].fulfillment_sets[0].service_zones ?? [];
    indiaZoneId = zones.find((z: any) => z.name === "India")?.id;
    intlZoneId = zones.find((z: any) => z.name === "International")?.id;
    logger.info(`Reusing fulfillment set ${fulfillmentSetId}.`);
  }

  if (!indiaZoneId || !intlZoneId) {
    const missing: any[] = [];
    if (!indiaZoneId) {
      missing.push({
        name: "India",
        fulfillment_set_id: fulfillmentSetId!,
        geo_zones: [{ type: "country", country_code: "in" }],
      });
    }
    if (!intlZoneId) {
      missing.push({
        name: "International",
        fulfillment_set_id: fulfillmentSetId!,
        geo_zones: [
          { type: "country", country_code: "us" },
          { type: "country", country_code: "gb" },
          { type: "country", country_code: "ca" },
          { type: "country", country_code: "au" },
          { type: "country", country_code: "ae" },
          { type: "country", country_code: "sg" },
          { type: "country", country_code: "my" },
        ],
      });
    }
    const { result: createdZones } = await createServiceZonesWorkflow(container).run({
      input: { data: missing },
    });
    for (const z of createdZones) {
      if (z.name === "India") indiaZoneId = z.id;
      if (z.name === "International") intlZoneId = z.id;
    }
  }

  // --- 2b. Ensure manual fulfillment provider linked to stock location ---
  try {
    await link.create({
      [Modules.STOCK_LOCATION]: { stock_location_id: location.id },
      [Modules.FULFILLMENT]: { fulfillment_provider_id: "manual_manual" },
    });
    logger.info("Manual fulfillment provider linked to stock location.");
  } catch (e: any) {
    if (!String(e?.message ?? "").includes("already exists")) {
      logger.info(`Provider link note: ${e?.message ?? e}`);
    }
  }

  // --- 3. Shipping options ---
  const existingOpts = await fulfillmentService.listShippingOptions({
    service_zone: { id: [indiaZoneId!, intlZoneId!] },
  } as any);
  const existingNames = new Set(existingOpts.map((o) => o.name));

  const optsToCreate: any[] = [];

  const baseRules = [
    { attribute: "enabled_in_store", value: "true", operator: "eq" },
    { attribute: "is_return", value: "false", operator: "eq" },
  ];

  if (!existingNames.has("Standard (India)")) {
    optsToCreate.push({
      name: "Standard (India)",
      service_zone_id: indiaZoneId!,
      shipping_profile_id: shippingProfile.id,
      provider_id: "manual_manual",
      type: { label: "Standard", description: "5-7 business days", code: "standard" },
      price_type: "flat",
      prices: [{ amount: 9900, currency_code: "inr" }],
      rules: baseRules,
    });
  }
  if (!existingNames.has("Express (India)")) {
    optsToCreate.push({
      name: "Express (India)",
      service_zone_id: indiaZoneId!,
      shipping_profile_id: shippingProfile.id,
      provider_id: "manual_manual",
      type: { label: "Express", description: "2-3 business days", code: "express" },
      price_type: "flat",
      prices: [{ amount: 19900, currency_code: "inr" }],
      rules: baseRules,
    });
  }
  if (!existingNames.has("International Standard")) {
    optsToCreate.push({
      name: "International Standard",
      service_zone_id: intlZoneId!,
      shipping_profile_id: shippingProfile.id,
      provider_id: "manual_manual",
      type: { label: "Standard", description: "10-14 business days", code: "intl-standard" },
      price_type: "flat",
      prices: [{ amount: 3500, currency_code: "usd" }],
      rules: baseRules,
    });
  }

  if (optsToCreate.length) {
    await createShippingOptionsWorkflow(container).run({ input: optsToCreate });
    logger.info(`Created ${optsToCreate.length} shipping options.`);
  } else {
    logger.info("Shipping options already present.");
  }

  logger.info("✓ Fix-data complete.");
}
