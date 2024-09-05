import { OpenAPIHono } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";

import { db } from "lib/db";
import { products } from "lib/db/schema";
import { advancedQuery } from "lib/util/filter-pagination-sorting";
import { generatePaginationMetadata } from "lib/util/paginationMetadata";
import { create, get, list, update } from "./openapi.routes";

export const productsGroup = new OpenAPIHono()
  .openapi(list, async (c) => {
    const filteringInput = c.req.valid("query");
    const { data, totalCount } = await advancedQuery(products, filteringInput);
    const metadata = generatePaginationMetadata(c, totalCount);

    return c.json({ metadata, data }, 200);
  })

  .openapi(create, async (c) => {
    const product = c.req.valid("json");
    const result = await db.insert(products).values(product);
    return c.json({ productId: Number(result.lastInsertRowid) }, 201);
  })

  .openapi(get, async (c) => {
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

    if (!product) {
      throw new HTTPException(404, { message: "product not found" });
    }

    return c.json(product);
  })

  .openapi(update, async (c) => {
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
  });
