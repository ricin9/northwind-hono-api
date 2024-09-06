import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { products } from "../../../lib/db/schema";
import { generateFPSSchemaForTable } from "../../../lib/util/filter-pagination-sorting";
import { resourceListSchema } from "../../../lib/util/resource-list-schema";
import { insureOneProperty } from "../../../lib/util/validation";

const baseInsertProductSchema = createInsertSchema(products).omit({
  productId: true,
});

export const insertProductSchema = insureOneProperty(baseInsertProductSchema);

export const updateProductSchema = insureOneProperty(
  baseInsertProductSchema.partial()
);

export const productSchema = createSelectSchema(products).partial();

export const listProductSchema = resourceListSchema(products);

export const listProductQuerySearchSchema = generateFPSSchemaForTable(products);
