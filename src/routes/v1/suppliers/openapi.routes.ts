import { createRoute, z } from "@hono/zod-openapi";
import { idParamSchema } from "@lib/util/validation";
import { ZodBadRequestOpenApi } from "@lib/util/zodhttperrorschema";
import {
  insertSupplierSchema,
  listSupplierQuerySearchSchema,
  listSupplierSchema,
  supplierSchema,
  updateSupplierSchema,
} from "./schema";

const tags = ["Suppliers"];

export const list = createRoute({
  method: "get",
  path: "/",
  tags,
  summary: "List suppliers",
  description:
    "Get a list of suppliers with filtering, pagination, and sorting",
  request: {
    query: listSupplierQuerySearchSchema,
  },
  responses: {
    200: {
      description: "Successful response",
      content: {
        "application/json": {
          schema: listSupplierSchema,
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
  summary: "Create a supplier",
  request: {
    body: {
      content: {
        "application/json": {
          schema: insertSupplierSchema,
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
  tags,
  summary: "Get a supplier",
  request: {
    params: idParamSchema,
  },
  responses: {
    200: {
      description: "Successful response",
      content: {
        "application/json": {
          schema: supplierSchema,
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
  tags,
  summary: "Update a supplier",
  request: {
    params: idParamSchema,
    body: {
      content: {
        "application/json": {
          schema: updateSupplierSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Successful response",
      content: {
        "application/json": {
          schema: supplierSchema,
        },
      },
    },
    400: ZodBadRequestOpenApi,
    404: {
      description: "Supplier not found",
    },
  },
});
