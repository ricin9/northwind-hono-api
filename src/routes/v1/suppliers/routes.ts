import { createRoute, z } from "@hono/zod-openapi";
import { suppliers } from "db/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import {
  advancedQueryValidationMiddleware,
  generateFPSSchemaForTable,
} from "util/filter-pagination-sorting";
import { resourceListSchema } from "util/resource-list-schema";
import { idParamSchema, insureOneProperty } from "util/validation";
import { ZodBadRequestOpenApi } from "util/zodhttperrorschema";

const table = suppliers;

const baseInsertSchema = createInsertSchema(table).omit({
  supplierId: true,
});

export const insertSchema = insureOneProperty(baseInsertSchema);
export const updateSchema = insureOneProperty(baseInsertSchema.partial());
export const selectSchema = createSelectSchema(table).partial();

export const list = createRoute({
  method: "get",
  path: "/",
  tags: ["Suppliers"],
  summary: "List suppliers",
  description:
    "Get a list of suppliers with filtering, pagination, and sorting",
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
  tags: ["Suppliers"],
  summary: "Create a supplier",
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
    200: {
      description: "Successful response",
      content: {
        "application/json": {
          schema: z.object({
            supplierId: z.number(),
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
  tags: ["Suppliers"],
  summary: "Get a supplier",
  request: {
    params: idParamSchema,
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
      description: "Supplier not found",
    },
  },
});

export const update = createRoute({
  method: "patch",
  path: "/{id}",
  tags: ["Suppliers"],
  summary: "Update a supplier",
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
      description: "Supplier not found",
    },
  },
});
