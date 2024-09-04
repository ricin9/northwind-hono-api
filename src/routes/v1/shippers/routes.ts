import { createRoute, z } from "@hono/zod-openapi";
import { shippers } from "db/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import {
  advancedQueryValidationMiddleware,
  generateFPSSchemaForTable,
} from "util/filter-pagination-sorting";
import { resourceListSchema } from "util/resource-list-schema";
import { idParamSchema, makePartialMinimumOneProperty } from "util/validation";

const insertShipperSchema = createInsertSchema(shippers).omit({
  shipperId: true,
});

const selectShipperSchema = createSelectSchema(shippers).partial();

const patchShipperSchema = makePartialMinimumOneProperty(insertShipperSchema);

export const list = createRoute({
  method: "get",
  path: "/",
  tags: ["shippers"],
  summary: "List shippers",
  description: "Get a list of shippers with filtering, pagination, and sorting",
  middleware: [advancedQueryValidationMiddleware(shippers)],
  request: {
    query: generateFPSSchemaForTable(shippers),
  },
  responses: {
    200: {
      description: "Successful response",
      content: {
        "application/json": {
          schema: resourceListSchema(shippers),
        },
      },
    },
  },
});

export const create = createRoute({
  method: "post",
  path: "/",
  tags: ["shippers"],
  summary: "Create a shipper",
  request: {
    body: {
      content: {
        "application/json": {
          schema: insertShipperSchema,
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
            shipperId: z.number(),
          }),
        },
      },
    },
  },
});

export const get = createRoute({
  method: "get",
  path: "/{id}",
  tags: ["shippers"],
  summary: "Get a shipper",
  request: {
    params: idParamSchema,
  },
  responses: {
    200: {
      description: "Successful response",
      content: {
        "application/json": {
          schema: selectShipperSchema,
        },
      },
    },
    404: {
      description: "Shipper not found",
    },
  },
});

export const update = createRoute({
  method: "patch",
  path: "/{id}",
  tags: ["shippers"],
  summary: "Update a shipper",

  request: {
    params: idParamSchema,
    body: {
      content: {
        "application/json": {
          schema: patchShipperSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Successful response",
      content: {
        "application/json": {
          schema: selectShipperSchema,
        },
      },
    },
    404: {
      description: "Shipper not found",
    },
  },
});
