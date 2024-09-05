import { createRoute, z } from "@hono/zod-openapi";
import { shippers } from "db/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { generateFPSSchemaForTable } from "util/filter-pagination-sorting";
import { resourceListSchema } from "util/resource-list-schema";
import { idParamSchema, insureOneProperty } from "util/validation";
import { ZodBadRequestOpenApi } from "util/zodhttperrorschema";

const table = shippers;

const baseInsertSchema = createInsertSchema(table).omit({
  shipperId: true,
});

export const insertSchema = insureOneProperty(baseInsertSchema);
export const updateSchema = insureOneProperty(baseInsertSchema.partial());
export const selectSchema = createSelectSchema(table).partial();

export const list = createRoute({
  method: "get",
  path: "/",
  tags: ["Shippers"],
  summary: "List shippers",
  description: "Get a list of shippers with filtering, pagination, and sorting",
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
  tags: ["Shippers"],
  summary: "Create a shipper",
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
            shipperId: z.number(),
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
  tags: ["Shippers"],
  summary: "Get a shipper",
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
      description: "Shipper not found",
    },
  },
});

export const update = createRoute({
  method: "patch",
  path: "/{id}",
  tags: ["Shippers"],
  summary: "Update a shipper",

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
      description: "Shipper not found",
    },
  },
});
