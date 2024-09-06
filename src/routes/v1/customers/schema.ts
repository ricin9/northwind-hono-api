import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { customers } from "@lib/db/schema";
import { generateFPSSchemaForTable } from "@lib/util/filter-pagination-sorting";
import { resourceListSchema } from "@lib/util/resource-list-schema";
import { insureOneProperty } from "@lib/util/validation";

const baseInsertCustomerSchema = createInsertSchema(customers);

export const insertCustomerSchema = insureOneProperty(baseInsertCustomerSchema);

export const updateCustomerSchema = insureOneProperty(
  baseInsertCustomerSchema.omit({ customerId: true }).partial()
);

export const customerSchema = createSelectSchema(customers).partial();

export const listCustomerSchema = resourceListSchema(customers);

export const listCustomerQuerySearchSchema =
  generateFPSSchemaForTable(customers);
