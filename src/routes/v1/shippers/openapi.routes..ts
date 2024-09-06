import { createRoute, z } from "@hono/zod-openapi";
import { idParamSchema } from "@lib/util/validation";
import { ZodBadRequestOpenApi } from "@lib/util/zodhttperrorschema";
import {
  insertShipperSchema,
  listShipperSchema,
  listShipperQuerySearchSchema,
  shipperSchema,
  updateShipperSchema,
} from "./schema";

const tags = ["Shippers"];

export const list = createRoute({
  method: "get",
  path: "/",
  tags,
  summary: "List shippers",
  description: "Get a list of shippers with filtering, pagination, and sorting",
  request: {
    query: listShipperQuerySearchSchema,
  },
  responses: {
    200: {
      description: "Successful response",
      content: {
        "application/json": {
          schema: listShipperSchema,
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
  tags,
  summary: "Get a shipper",
  request: {
    params: idParamSchema,
  },
  responses: {
    200: {
      description: "Successful response",
      content: {
        "application/json": {
          schema: shipperSchema,
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
  tags,
  summary: "Update a shipper",

  request: {
    params: idParamSchema,
    body: {
      content: {
        "application/json": {
          schema: updateShipperSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Successful response",
      content: {
        "application/json": {
          schema: shipperSchema,
        },
      },
    },
    400: ZodBadRequestOpenApi,
    404: {
      description: "Shipper not found",
    },
  },
});
