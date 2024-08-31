import { Hono } from "hono";
import { db } from "../db";
import { products as products } from "../db/schema";
import { zValidator } from "@hono/zod-validator";
import { createInsertSchema } from "drizzle-zod";
import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import {
  idParamSchema,
  makePartialMinimumOneProperty,
} from "../util/validation";

export const productsGroup = new Hono();

productsGroup.get("/", async (c) => {
  const rows = await db.select().from(products);
  return c.json(rows);
});

export const insertProductSchema = createInsertSchema(products).omit({
  productId: true,
});

productsGroup.post("/", zValidator("json", insertProductSchema), async (c) => {
  const product = c.req.valid("json");
  const result = await db.insert(products).values(product);
  return c.json({ productId: result.lastInsertRowid?.toString() });
});

productsGroup.get("/:id", zValidator("param", idParamSchema), async (c) => {
  const { id } = c.req.valid("param");
  const product = await db.query.products.findFirst({
    where: eq(products.productId, id),
    with: {
      category: true,
      supplier: {
        columns: { supplierId: true, supplierName: true, country: true },
      },
    },
  });

  return c.json(product);
});

const patchProductSchema = makePartialMinimumOneProperty(insertProductSchema);

productsGroup.patch(
  "/:id",
  zValidator("param", idParamSchema),
  zValidator("json", patchProductSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");

    const result = await db
      .select({ productId: products.productId })
      .from(products)
      .where(eq(products.productId, id))
      .limit(1);

    if (result.length === 0) {
      throw new HTTPException(404, { message: "product not found" });
    }

    const patchedProduct = await db
      .update(products)
      .set(body)
      .where(eq(products.productId, id))
      .returning();

    // console.log({ patchedProduct });
    return c.json(patchedProduct);
  }
);
