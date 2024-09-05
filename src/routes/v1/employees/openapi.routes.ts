import { createRoute, z } from "@hono/zod-openapi";
import { idParamSchema } from "lib/util/validation";
import { ZodBadRequestOpenApi } from "lib/util/zodhttperrorschema";
import {
  insertEmployeeSchema,
  employeeSchema,
  updateEmployeeSchema,
  listEmployeeQuerySearchSchema,
  listEmployeeSchema,
} from "./schema";

const tags = ["Employees"];

export const list = createRoute({
  method: "get",
  path: "/",
  tags,
  summary: "List employees",
  description:
    "Get a list of employees with filtering, pagination, and sorting",
  request: {
    query: listEmployeeQuerySearchSchema,
  },
  responses: {
    200: {
      description: "Successful response",
      content: {
        "application/json": {
          schema: listEmployeeSchema,
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
  summary: "Create an employee",
  request: {
    body: {
      content: {
        "application/json": {
          schema: insertEmployeeSchema,
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
            employeeId: z.number(),
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
  summary: "Get an employee",
  request: {
    params: idParamSchema,
  },
  responses: {
    200: {
      description: "Successful response",
      content: {
        "application/json": {
          schema: employeeSchema,
        },
      },
    },
    400: ZodBadRequestOpenApi,
    404: {
      description: "Employee not found",
    },
  },
});

export const update = createRoute({
  method: "patch",
  path: "/{id}",
  tags,
  summary: "Update an employee",
  request: {
    params: idParamSchema,
    body: {
      content: {
        "application/json": {
          schema: updateEmployeeSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Successful response",
      content: {
        "application/json": {
          schema: employeeSchema,
        },
      },
    },
    400: ZodBadRequestOpenApi,
    404: {
      description: "Employee not found",
    },
  },
});
