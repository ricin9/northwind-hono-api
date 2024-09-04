import { z } from "@hono/zod-openapi";

export const ZodHttpErrorSchema = z.object({});

export const ZodBadRequestOpenApi = {
  description: "Validation error",
  content: {
    "application/json": {
      schema: ZodHttpErrorSchema,
    },
  },
};
