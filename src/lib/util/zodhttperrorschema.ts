import { z } from "@hono/zod-openapi";

const zodIssues = Object.keys(z.ZodIssueCode) as [string, ...string[]];

export const ZodHttpErrorSchema = z
  .object({
    success: z.literal(false),
    error: z.object({
      issues: z.array(
        z.object({
          received: z.string(),
          code: z.enum(zodIssues),
          path: z.array(z.string().or(z.number())),
          message: z.string(),
        })
      ),
      name: z.string(),
    }),
  })
  .partial()
  .optional();

export const ZodBadRequestOpenApi = {
  description: "Validation error",
  content: {
    "application/json": {
      schema: ZodHttpErrorSchema,
    },
  },
};
