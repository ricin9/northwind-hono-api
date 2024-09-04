import { createRoute, z } from "@hono/zod-openapi";
import { orders } from "db/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import {
  advancedQueryValidationMiddleware,
  generateFPSSchemaForTable,
} from "util/filter-pagination-sorting";
import { resourceListSchema } from "util/resource-list-schema";
import { idParamSchema, insureOneProperty } from "util/validation";
import { ZodBadRequestOpenApi } from "util/zodhttperrorschema";
import { insertOrderDetailsSchema } from "../orderDetails";
import { selectSchema as customerSchema } from "../customers/routes";
import { selectSchema as employeeSchema } from "../employees/routes";
import { selectSchema as shipperSchema } from "../shippers/routes";
import { selectSchema as orderDetailSchema } from "./orderDetails/routes";

const table = orders;

const baseInsertSchema = createInsertSchema(table).omit({
  orderId: true,
});

export const insertSchema = insureOneProperty(baseInsertSchema);
export const updateSchema = insureOneProperty(baseInsertSchema.partial());
export const selectSchema = createSelectSchema(table).partial();

export const detailedSelectSchema = selectSchema.extend({
  customer: customerSchema.pick({ customerId: true, companyName: true }),
  employee: employeeSchema.pick({
    employeeId: true,
    lastName: true,
    firstName: true,
  }),
  orderDetails: z.array(orderDetailSchema),
});

export const insertOrderWithDetailsSchema = z.object({
  order: insertSchema,
  details: insertOrderDetailsSchema,
});

export const list = createRoute({
  method: "get",
  path: "/",
  tags: ["Orders"],
  summary: "List orders",
  description: "Get a list of orders with filtering, pagination, and sorting",
  middleware: [advancedQueryValidationMiddleware(table)],
  request: {
    query: generateFPSSchemaForTable(table),
  },
  responses: {
    200: {
      description: "Successful response",
      content: {
        "application/json": {
          schema: resourceListSchema(table),
        },
      },
    },
    400: ZodBadRequestOpenApi,
  },
});

export const create = createRoute({
  method: "post",
  path: "/",
  tags: ["Orders"],
  summary: "Create an order",
  request: {
    body: {
      content: {
        "application/json": {
          schema: insertOrderWithDetailsSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Successful response",
      content: {
        "application/json": {
          schema: z.object({
            orderId: z.number(),
          }),
        },
      },
    },
    400: ZodBadRequestOpenApi,
  },
});

export const get = createRoute({
  method: "get",
  path: "/{id}",
  tags: ["Orders"],
  summary: "Get an order",
  request: {
    params: idParamSchema,
  },
  responses: {
    200: {
      description: "Successful response",
      content: {
        "application/json": {
          schema: detailedSelectSchema,
        },
      },
    },
    400: ZodBadRequestOpenApi,
    404: {
      description: "Order not found",
    },
  },
});

export const update = createRoute({
  method: "patch",
  path: "/{id}",
  tags: ["Orders"],
  summary: "Update an order",
  request: {
    params: idParamSchema,
    body: {
      content: {
        "application/json": {
          schema: updateSchema,
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
      description: "Order not found",
    },
  },
});
