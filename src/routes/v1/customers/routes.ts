import { createRoute, z } from "@hono/zod-openapi";
import { customers } from "db/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import {
  advancedQueryValidationMiddleware,
  generateFPSSchemaForTable,
} from "util/filter-pagination-sorting";
import { resourceListSchema } from "util/resource-list-schema";
import { idStringParamSchema, insureOneProperty } from "util/validation";
import { ZodBadRequestOpenApi } from "util/zodhttperrorschema";

const table = customers;

const baseInsertSchema = createInsertSchema(table);

export const insertSchema = insureOneProperty(baseInsertSchema);
export const updateSchema = insureOneProperty(
  baseInsertSchema.omit({ customerId: true }).partial()
);
export const selectSchema = createSelectSchema(table).partial();

export const list = createRoute({
  method: "get",
  path: "/",
  tags: ["Customers"],
  summary: "List customers",
  description:
    "Get a list of customers with filtering, pagination, and sorting",
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
  tags: ["Customers"],
  summary: "Create a customer",
  request: {
    body: {
      content: {
        "application/json": {
          schema: insertSchema,
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
            customerId: z.string(),
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
  tags: ["Customers"],
  summary: "Get a customer",
  request: {
    params: idStringParamSchema,
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
      description: "Customer not found",
    },
  },
});

export const update = createRoute({
  method: "patch",
  path: "/{id}",
  tags: ["Customers"],
  summary: "Update a customer",
  request: {
    params: idStringParamSchema,
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
      description: "Customer not found",
    },
  },
});
