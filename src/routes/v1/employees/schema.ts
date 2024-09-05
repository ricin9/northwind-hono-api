import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { employees } from "lib/db/schema";
import { generateFPSSchemaForTable } from "lib/util/filter-pagination-sorting";
import { resourceListSchema } from "lib/util/resource-list-schema";
import { insureOneProperty } from "lib/util/validation";

const baseInsertEmployeeSchema = createInsertSchema(employees).omit({
  employeeId: true,
});

export const insertEmployeeSchema = insureOneProperty(baseInsertEmployeeSchema);

export const updateEmployeeSchema = insureOneProperty(
  baseInsertEmployeeSchema.partial()
);

export const employeeSchema = createSelectSchema(employees).partial();

export const listEmployeeSchema = resourceListSchema(employees);

export const listEmployeeQuerySearchSchema =
  generateFPSSchemaForTable(employees);
