import { Hono } from "hono";
import { db } from "../db";
import { shippers as shippers } from "../db/schema";
import { zValidator } from "@hono/zod-validator";
import { createInsertSchema } from "drizzle-zod";
import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import {
  idParamSchema,
  makePartialMinimumOneProperty,
} from "../util/validation";

const insertShipperSchema = createInsertSchema(shippers).omit({
  shipperId: true,
});
const patchShipperSchema = makePartialMinimumOneProperty(insertShipperSchema);

export const shippersGroup = new Hono()

  .get("/", async (c) => {
    const rows = await db.select().from(shippers);
    return c.json(rows);
  })

  .post("/", zValidator("json", insertShipperSchema), async (c) => {
    const shipper = c.req.valid("json");
    const result = await db.insert(shippers).values(shipper);
    return c.json({ shipperId: result.lastInsertRowid?.toString() });
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
