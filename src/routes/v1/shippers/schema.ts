import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { shippers } from "lib/db/schema";
import { generateFPSSchemaForTable } from "lib/util/filter-pagination-sorting";
import { resourceListSchema } from "lib/util/resource-list-schema";
import { insureOneProperty } from "lib/util/validation";

const baseInsertShipperSchema = createInsertSchema(shippers).omit({
  shipperId: true,
});

export const insertShipperSchema = insureOneProperty(baseInsertShipperSchema);

export const updateShipperSchema = insureOneProperty(
  baseInsertShipperSchema.partial()
);

export const shipperSchema = createSelectSchema(shippers).partial();

export const listShipperSchema = resourceListSchema(shippers);

export const listShipperQuerySearchSchema = generateFPSSchemaForTable(shippers);
