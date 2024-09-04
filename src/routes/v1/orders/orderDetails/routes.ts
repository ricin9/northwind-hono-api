import { createRoute, z } from "@hono/zod-openapi";
import { orderDetails } from "db/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { resourceListSchema } from "util/resource-list-schema";
import { ZodBadRequestOpenApi } from "util/zodhttperrorschema";
import { selectSchema as productSchema } from "../../products/routes";

const table = orderDetails;

const baseInsertSchema = createInsertSchema(table);

export const insertOrderDetailSchema = baseInsertSchema
  .extend({
    unitPrice: z.string().refine(
      (val) => {
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

export const updateSchema = insertOrderDetailSchema.partial();
export const selectSchema = createSelectSchema(table)
  .extend({
    product: productSchema.pick({ productId: true, productName: true }),
  })
  .partial();

const orderIdParamSchema = z.object({
  orderId: z.string().pipe(z.coerce.number().min(1)),
});

const orderIdDetailIdParamSchema = orderIdParamSchema.extend({
  productId: z.string().pipe(z.coerce.number().min(1)),
});

export const list = createRoute({
  method: "get",
  path: "/{orderId}/details",
  tags: ["Orders"],
  summary: "List order details",
  request: {
    params: orderIdParamSchema,
  },
  responses: {
    200: {
      description: "Successful response",
      content: {
        "application/json": {
          schema: selectSchema.array(),
        },
      },
    },
    400: ZodBadRequestOpenApi,
    404: {
      description: "Order not found",
    },
  },
});

export const get = createRoute({
  method: "get",
  path: "/{orderId}/details/{productId}",
  tags: ["Orders"],
  summary: "Get an order detail",
  request: {
    params: orderIdDetailIdParamSchema,
  },
  responses: {
    200: {
      description: "Successful response",
      content: {
        "application/json": {
          schema: selectSchema,
        },
      },
    },
    400: ZodBadRequestOpenApi,
    404: {
      description: "Order detail not found",
    },
  },
});

export const put = createRoute({
  method: "put",
  path: "/{orderId}/details/{productId}",
  tags: ["Orders"],
  summary: "Update an order detail",
  request: {
    params: orderIdDetailIdParamSchema,
    body: {
      content: {
        "application/json": {
          schema: insertOrderDetailSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Successful response",
      content: {
        "application/json": {
          schema: selectSchema,
        },
      },
    },
    400: ZodBadRequestOpenApi,
    404: {
      description: "Order detail not found",
    },
  },
});

export const del = createRoute({
  method: "delete",
  path: "/{orderId}/details/{productId}",
  tags: ["Orders"],
  summary: "Delete an order detail",
  request: {
    params: orderIdDetailIdParamSchema,
  },
  responses: {
    204: {
      description: "Successful response",
    },
    400: ZodBadRequestOpenApi,
    404: {
      description: "Order detail not found",
    },
  },
});
