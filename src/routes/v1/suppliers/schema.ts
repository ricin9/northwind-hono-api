import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { suppliers } from "lib/db/schema";
import { generateFPSSchemaForTable } from "lib/util/filter-pagination-sorting";
import { resourceListSchema } from "lib/util/resource-list-schema";
import { insureOneProperty } from "lib/util/validation";

const baseInsertSupplierSchema = createInsertSchema(suppliers).omit({
  supplierId: true,
});

export const insertSupplierSchema = insureOneProperty(baseInsertSupplierSchema);

export const updateSupplierSchema = insureOneProperty(
  baseInsertSupplierSchema.partial()
);

export const supplierSchema = createSelectSchema(suppliers).partial();

export const listSupplierSchema = resourceListSchema(suppliers);

export const listSupplierQuerySearchSchema =
  generateFPSSchemaForTable(suppliers);
