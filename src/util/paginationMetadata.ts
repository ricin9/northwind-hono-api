import { Context } from "hono";
import { AdvancedSchemaVariables } from "./types";
import { z } from "@hono/zod-openapi";

export const metadataSchema = z.object({
  page: z.number().int(),
  pageSize: z.number().int(),
  totalCount: z.number().int(),
  totalPages: z.number().int(),
  links: z.object({
    self: z.string().url(),
    first: z.string().url(),
    last: z.string().url(),
    next: z.string().url().nullable(),
    prev: z.string().url().nullable(),
  }),
});

type PaginationMetadata = z.infer<typeof metadataSchema>;

export function generatePaginationMetadata(
  c: Context<{ Variables: AdvancedSchemaVariables }>,
  totalCount: number
): PaginationMetadata {
  const advancedQueryInput = c.get("fpsInput");
  const page = advancedQueryInput?.page!;
  const pageSize = advancedQueryInput?.pageSize!;
  const totalPages = Math.ceil(
    totalCount / Number(advancedQueryInput?.pageSize)
  );

  const selfUrl = new URL(c.req.url).href;

  const firstPageUrl = new URL(selfUrl);
  firstPageUrl.searchParams.set("page", "1");

  const lastPageUrl = new URL(selfUrl);
  lastPageUrl.searchParams.set("page", totalPages.toString());

  const nextPageUrl = new URL(selfUrl);
  nextPageUrl.searchParams.set("page", (page + 1).toString());

  const prevPageUrl = new URL(selfUrl);
  prevPageUrl.searchParams.set("page", (page - 1).toString());

  return {
    page,
    pageSize,
    totalCount,
    totalPages,
    links: {
      self: selfUrl,
      first: firstPageUrl.href,
      last: lastPageUrl.href,
      next: page === totalPages ? null : nextPageUrl.href,
      prev: page === 1 ? null : prevPageUrl.href,
    },
  };
}
