import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

import { db } from "db";
import { shippers } from "db/schema";
import {
  advancedQuery,
  advancedQueryValidationMiddleware,
} from "util/filter-pagination-sorting";
import { generatePaginationMetadata } from "util/paginationMetadata";
import { idParamSchema, makePartialMinimumOneProperty } from "util/validation";
import { AdvancedSchemaVariables } from "../../util/types";

const insertShipperSchema = createInsertSchema(shippers).omit({
  shipperId: true,
});
const patchShipperSchema = makePartialMinimumOneProperty(insertShipperSchema);

export const shippersGroup = new Hono<{ Variables: AdvancedSchemaVariables }>()
  .get(
    "/",
    advancedQueryValidationMiddleware(shippers),

    async (c) => {
      const filteringInput = c.get("fpsInput")!;

      const { data, totalCount } = await advancedQuery(
        shippers,
        filteringInput
      );

      const metadata = generatePaginationMetadata(c, totalCount);

      return c.json({ metadata, data });
    }
  )

  .post("/", zValidator("json", insertShipperSchema), async (c) => {
    const shipper = c.req.valid("json");
    const result = await db.insert(shippers).values(shipper);
    return c.json({ shipperId: Number(result.lastInsertRowid) });
  })

  .get("/:id", zValidator("param", idParamSchema), async (c) => {
    const { id } = c.req.valid("param");
    const shipper = await db
      .select()
      .from(shippers)
      .where(eq(shippers.shipperId, id));

    return c.json(shipper);
  })

  .patch(
    "/:id",
    zValidator("param", idParamSchema),
    zValidator("json", patchShipperSchema),
    async (c) => {
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
    }
  );
