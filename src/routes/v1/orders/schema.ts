import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { orders } from "@lib/db/schema";
import { insureOneProperty } from "@lib/util/validation";
import { customerSchema } from "../customers/schema";
import { z } from "@hono/zod-openapi";
import { employeeSchema } from "../employees/schema";
import {
  insertOrderDetailsSchema,
  orderDetailSchema,
} from "./orderDetails/schema";
import { resourceListSchema } from "@lib/util/resource-list-schema";
import { generateFPSSchemaForTable } from "@lib/util/filter-pagination-sorting";
const baseInsertSchema = createInsertSchema(orders).omit({
  orderId: true,
});

export const insertOrderSchema = insureOneProperty(baseInsertSchema);
export const updateOrderSchema = insureOneProperty(baseInsertSchema.partial());
export const orderSchema = createSelectSchema(orders).partial();

export const detailedOrderSchema = orderSchema.extend({
  customer: customerSchema.pick({ customerId: true, companyName: true }),
  employee: employeeSchema.pick({
    employeeId: true,
    lastName: true,
    firstName: true,
  }),
  orderDetails: z.array(orderDetailSchema),
});

export const insertDetailedOrderSchema = z.object({
  order: insertOrderSchema,
  details: insertOrderDetailsSchema,
});

export const listOrderSchema = resourceListSchema(orders);

export const listOrderQuerySearchSchema = generateFPSSchemaForTable(orders);
