import { z } from "@hono/zod-openapi";
import type { SQLiteTableWithColumns } from "drizzle-orm/sqlite-core";
import { metadataSchema } from "./paginationMetadata";
import { createSelectSchema } from "drizzle-zod";

export const resourceListSchema = (table: SQLiteTableWithColumns<any>) =>
  z.object({
    metadata: metadataSchema,
    data: z.array(createSelectSchema(table).partial()),
  });
