import { createRoute, z } from "@hono/zod-openapi";
import { employees } from "db/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import {
  advancedQueryValidationMiddleware,
  generateFPSSchemaForTable,
} from "util/filter-pagination-sorting";
import { resourceListSchema } from "util/resource-list-schema";
import { idParamSchema, insureOneProperty } from "util/validation";
import { ZodBadRequestOpenApi } from "util/zodhttperrorschema";

const table = employees;

const baseInsertSchema = createInsertSchema(table).omit({
  employeeId: true,
});

export const insertSchema = insureOneProperty(baseInsertSchema);
export const updateSchema = insureOneProperty(baseInsertSchema.partial());
export const selectSchema = createSelectSchema(table).partial();

export const list = createRoute({
  method: "get",
  path: "/",
  tags: ["Employees"],
  summary: "List employees",
  description:
    "Get a list of employees with filtering, pagination, and sorting",
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
  tags: ["Employees"],
  summary: "Create an employee",
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
  tags: ["Employees"],
  summary: "Get an employee",
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
      description: "Employee not found",
    },
  },
});

export const update = createRoute({
  method: "patch",
  path: "/{id}",
  tags: ["Employees"],
  summary: "Update an employee",
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
      description: "Employee not found",
    },
  },
});
