import { createRoute, z } from "@hono/zod-openapi";
import { products } from "../../../lib/db/schema";
import { generateFPSSchemaForTable } from "../../../lib/util/filter-pagination-sorting";
import { resourceListSchema } from "../../../lib/util/resource-list-schema";
import { idParamSchema } from "../../../lib/util/validation";
import { ZodBadRequestOpenApi } from "../../../lib/util/zodhttperrorschema";
import {
  insertProductSchema,
  productSchema,
  updateProductSchema,
} from "./schema";

const tags = ["Products"];

export const list = createRoute({
  method: "get",
  path: "/",
  tags,
  summary: "List products",
  description: "Get a list of products with filtering, pagination, and sorting",
  request: {
    query: generateFPSSchemaForTable(products),
  },
  responses: {
    200: {
      description: "Successful response",
      content: {
        "application/json": {
          schema: resourceListSchema(products),
        },
      },
    },
    400: ZodBadRequestOpenApi,
  },
});

export const create = createRoute({
  method: "post",
  path: "/",
  tags,
  summary: "Create a product",
  request: {
    body: {
      content: {
        "application/json": {
          schema: insertProductSchema,
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
            productId: z.number(),
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
  tags,
  summary: "Get a product",
  request: {
    params: idParamSchema,
  },
  responses: {
    200: {
      description: "Successful response",
      content: {
        "application/json": {
          schema: productSchema,
        },
      },
    },
    400: ZodBadRequestOpenApi,
    404: {
      description: "Product not found",
    },
  },
});

export const update = createRoute({
  method: "patch",
  path: "/{id}",
  tags,
  summary: "Update a product",
  request: {
    params: idParamSchema,
    body: {
      content: {
        "application/json": {
          schema: updateProductSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Successful response",
      content: {
        "application/json": {
          schema: productSchema,
        },
      },
    },
    400: ZodBadRequestOpenApi,
    404: {
      description: "Product not found",
    },
  },
});
