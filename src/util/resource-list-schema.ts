import { z } from "@hono/zod-openapi";
import { SQLiteTableWithColumns } from "drizzle-orm/sqlite-core";
import { metadataSchema } from "./paginationMetadata";
import { createSelectSchema } from "drizzle-zod";
import { shippers } from "db/schema";

export const resourceListSchema = (table: SQLiteTableWithColumns<any>) =>
  z.object({
    metadata: metadataSchema,
    data: z.array(createSelectSchema(shippers).partial()),
  });
