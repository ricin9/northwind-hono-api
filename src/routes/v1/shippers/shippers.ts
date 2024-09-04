import { OpenAPIHono } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { HTTPException } from "hono/http-exception";

import { db } from "db";
import { shippers } from "db/schema";
import { advancedQuery } from "util/filter-pagination-sorting";
import { generatePaginationMetadata } from "util/paginationMetadata";
import { AdvancedSchemaVariables } from "../../../util/types";
import { create, get, list, update } from "./routes";

export const shippersGroup = new OpenAPIHono<{
  Variables: AdvancedSchemaVariables;
}>()
  .openapi(list, async (c) => {
    const filteringInput = c.get("fpsInput")!;

    const { data, totalCount } = await advancedQuery(shippers, filteringInput);
    const metadata = generatePaginationMetadata(c, totalCount);

    return c.json({ metadata, data });
  })

  .openapi(create, async (c) => {
    const shipper = c.req.valid("json");
    const result = await db.insert(shippers).values(shipper);
    return c.json({ shipperId: Number(result.lastInsertRowid) });
  })

  .openapi(get, async (c) => {
    const { id } = c.req.valid("param");
    const shipper = await db.query.shippers.findFirst({
      where: eq(shippers.shipperId, id),
    });

    if (!shipper) {
      throw new HTTPException(404, { message: "shipper not found" });
    }

    return c.json(shipper);
  })

  .openapi(update, async (c) => {
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");

    const result = await db
      .select({ shipperId: shippers.shipperId })
      .from(shippers)
      .where(eq(shippers.shipperId, id))
      .limit(1);

    if (result.length === 0) {
      throw new HTTPException(404, { message: "shipper not found" });
    }

    const patchedShipper = await db
      .update(shippers)
      .set(body)
      .where(eq(shippers.shipperId, id))
      .returning();

    return c.json(patchedShipper);
  });
