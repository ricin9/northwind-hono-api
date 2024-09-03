import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

import { db } from "db";
import { products } from "db/schema";
import {
  advancedQuery,
  advancedQueryValidationMiddleware,
} from "util/filter-pagination-sorting";
import { generatePaginationMetadata } from "util/paginationMetadata";
import { idParamSchema, makePartialMinimumOneProperty } from "util/validation";
import { AdvancedSchemaVariables } from "../../util/types";

const insertProductSchema = createInsertSchema(products).omit({
  productId: true,
});
const patchProductSchema = makePartialMinimumOneProperty(insertProductSchema);

export const productsGroup = new Hono<{ Variables: AdvancedSchemaVariables }>()
  .get(
    "/",
    advancedQueryValidationMiddleware(products),

    async (c) => {
      const filteringInput = c.get("fpsInput")!;

      const { data, totalCount } = await advancedQuery(
        products,
        filteringInput
      );

      const metadata = generatePaginationMetadata(c, totalCount);

      return c.json({ metadata, data });
    }
  )

  .post("/", zValidator("json", insertProductSchema), async (c) => {
    const product = c.req.valid("json");
    const result = await db.insert(products).values(product);
    return c.json({ productId: Number(result.lastInsertRowid) });
  })

  .get("/:id", zValidator("param", idParamSchema), async (c) => {
    const { id } = c.req.valid("param");
    const product = await db.query.products.findFirst({
      where: eq(products.productId, id),
      with: {
        category: { columns: { picture: false } },
        supplier: {
          columns: { supplierId: true, companyName: true },
        },
      },
    });

    console.log({ product });

    return c.json(product);
  })

  .patch(
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

      return c.json(patchedProduct);
    }
  );
