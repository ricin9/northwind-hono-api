import { z } from "@hono/zod-openapi";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { orderDetails } from "../../../../lib/db/schema";
import { productSchema } from "../../products/schema";

const baseInsertOrderDetailSchema = createInsertSchema(orderDetails);

export const insertOrderDetailSchema = baseInsertOrderDetailSchema
  .extend({
    unitPrice: z.string().refine(
      (val) => {
        // this is because the numeric sqlite type is string in js because there is no fixed decimal in js
        const parsed = Number(val);
        return !isNaN(parsed) && parsed > 0;
      },
      { message: "must be a positive number" }
    ),
    quantity: z.number().min(1).default(1),
    discount: z.number().min(0).max(1).default(0),
  })
  .omit({ orderId: true });

export const insertOrderDetailsSchema = insertOrderDetailSchema
  .array()
  .min(1)
  .refine(
    (arr) =>
      new Set(arr.map((element) => element.productId)).size === arr.length,
    "duplicate product ids"
  );

export const updateOrderDetailSchema = insertOrderDetailSchema.partial();
export const orderDetailSchema = createSelectSchema(orderDetails)
  .extend({
    product: productSchema.pick({ productId: true, productName: true }),
  })
  .partial();

export const orderIdParamSchema = z.object({
  orderId: z.string().pipe(z.coerce.number().min(1)),
});

export const orderIdDetailIdParamSchema = orderIdParamSchema.extend({
  productId: z.string().pipe(z.coerce.number().min(1)),
});
