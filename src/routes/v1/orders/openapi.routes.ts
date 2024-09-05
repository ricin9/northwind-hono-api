import { createRoute, z } from "@hono/zod-openapi";
import { idParamSchema } from "lib/util/validation";
import { ZodBadRequestOpenApi } from "lib/util/zodhttperrorschema";
import {
  detailedOrderSchema,
  insertDetailedOrderSchema,
  listOrderQuerySearchSchema,
  listOrderSchema,
  orderSchema,
  updateOrderSchema,
} from "./schema";

export const tags = ["Orders"];

export const list = createRoute({
  method: "get",
  path: "/",
  tags,
  summary: "List orders",
  description: "Get a list of orders with filtering, pagination, and sorting",
  request: {
    query: listOrderQuerySearchSchema,
  },
  responses: {
    200: {
      description: "Successful response",
      content: {
        "application/json": {
          schema: listOrderSchema,
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
  summary: "Create an order",
  request: {
    body: {
      content: {
        "application/json": {
          schema: insertDetailedOrderSchema,
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
  tags,
  summary: "Get an order",
  request: {
    params: idParamSchema,
  },
  responses: {
    200: {
      description: "Successful response",
      content: {
        "application/json": {
          schema: detailedOrderSchema,
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
  tags,
  summary: "Update an order",
  request: {
    params: idParamSchema,
    body: {
      content: {
        "application/json": {
          schema: updateOrderSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Successful response",
      content: {
        "application/json": {
          schema: orderSchema,
        },
      },
    },
    400: ZodBadRequestOpenApi,
    404: {
      description: "Order not found",
    },
  },
});
