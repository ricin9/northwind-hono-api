import { Context } from "hono";
import { AdvancedSchemaVariables } from "./types";

export function generatePaginationMetadata(
  c: Context<{ Variables: AdvancedSchemaVariables }>,
  totalCount: number
) {
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
