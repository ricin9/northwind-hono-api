import { Hono } from "hono";
import { db } from "../db";
import { suppliers as suppliers } from "../db/schema";
import { zValidator } from "@hono/zod-validator";
import { createInsertSchema } from "drizzle-zod";
import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import {
  idParamSchema,
  makePartialMinimumOneProperty,
} from "../util/validation";

export const suppliersGroup = new Hono();

suppliersGroup.get("/", async (c) => {
  const rows = await db.select().from(suppliers);
  return c.json(rows);
});

export const insertSupplierSchema = createInsertSchema(suppliers).omit({
  supplierId: true,
});

suppliersGroup.post(
  "/",
  zValidator("json", insertSupplierSchema),
  async (c) => {
    const supplier = c.req.valid("json");
    const result = await db.insert(suppliers).values(supplier);
    return c.json({ supplierId: result.lastInsertRowid?.toString() });
  }
);

suppliersGroup.get("/:id", zValidator("param", idParamSchema), async (c) => {
  const { id } = c.req.valid("param");
  const supplier = await db
    .select()
    .from(suppliers)
    .where(eq(suppliers.supplierId, id));

  return c.json(supplier);
});

const patchSupplierSchema = makePartialMinimumOneProperty(insertSupplierSchema);

suppliersGroup.patch(
  "/:id",
  zValidator("param", idParamSchema),
  zValidator("json", patchSupplierSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");

    const result = await db
      .select({ supplierId: suppliers.supplierId })
      .from(suppliers)
      .where(eq(suppliers.supplierId, id))
      .limit(1);

    if (result.length === 0) {
      throw new HTTPException(404, { message: "supplier not found" });
    }

    const patchedSupplier = await db
      .update(suppliers)
      .set(body)
      .where(eq(suppliers.supplierId, id))
      .returning();

    // console.log({ patchedSupplier });
    return c.json(patchedSupplier);
  }
);
