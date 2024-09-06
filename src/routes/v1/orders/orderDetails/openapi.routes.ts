import { createRoute } from "@hono/zod-openapi";
import { ZodBadRequestOpenApi } from "../../../../lib/util/zodhttperrorschema";
import { tags } from "../openapi.routes";
import {
  insertOrderDetailSchema,
  orderDetailSchema,
  orderIdDetailIdParamSchema,
  orderIdParamSchema,
} from "./schema";

export const list = createRoute({
  method: "get",
  path: "/{orderId}/details",
  tags,
  summary: "List order details",
  request: {
    params: orderIdParamSchema,
  },
  responses: {
    200: {
      description: "Successful response",
      content: {
        "application/json": {
          schema: orderDetailSchema.array(),
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
  tags,
  summary: "Get an order detail",
  request: {
    params: orderIdDetailIdParamSchema,
  },
  responses: {
    200: {
      description: "Successful response",
      content: {
        "application/json": {
          schema: orderDetailSchema,
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
  tags,
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
          schema: orderDetailSchema,
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
  tags,
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
