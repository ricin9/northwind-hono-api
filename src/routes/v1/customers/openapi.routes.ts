import { createRoute, z } from "@hono/zod-openapi";
import { idStringParamSchema } from "lib/util/validation";
import { ZodBadRequestOpenApi } from "lib/util/zodhttperrorschema";
import {
  insertCustomerSchema,
  customerSchema,
  updateCustomerSchema,
  listCustomerSchema,
  listCustomerQuerySearchSchema,
} from "./schema";

const tags = ["Customers"];

export const list = createRoute({
  method: "get",
  path: "/",
  tags,
  summary: "List customers",
  description:
    "Get a list of customers with filtering, pagination, and sorting",
  request: {
    query: listCustomerQuerySearchSchema,
  },
  responses: {
    200: {
      description: "Successful response",
      content: {
        "application/json": {
          schema: listCustomerSchema,
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
  summary: "Create a customer",
  request: {
    body: {
      content: {
        "application/json": {
          schema: insertCustomerSchema,
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
  tags,
  summary: "Get a customer",
  request: {
    params: idStringParamSchema,
  },
  responses: {
    200: {
      description: "Successful response",
      content: {
        "application/json": {
          schema: customerSchema,
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
  tags,
  summary: "Update a customer",
  request: {
    params: idStringParamSchema,
    body: {
      content: {
        "application/json": {
          schema: updateCustomerSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Successful response",
      content: {
        "application/json": {
          schema: customerSchema,
        },
      },
    },
    400: ZodBadRequestOpenApi,
    404: {
      description: "Customer not found",
    },
  },
});
