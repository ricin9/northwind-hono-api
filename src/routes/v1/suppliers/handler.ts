import { OpenAPIHono } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";

import { db } from "lib/db";
import { suppliers } from "lib/db/schema";
import { advancedQuery } from "lib/util/filter-pagination-sorting";
import { generatePaginationMetadata } from "lib/util/paginationMetadata";
import { create, get, list, update } from "./openapi.routes";

export const suppliersGroup = new OpenAPIHono()
  .openapi(list, async (c) => {
    const filteringInput = c.req.valid("query");
    const { data, totalCount } = await advancedQuery(suppliers, filteringInput);
    const metadata = generatePaginationMetadata(c, totalCount);

    return c.json({ metadata, data }, 200);
  })

  .openapi(create, async (c) => {
    const supplier = c.req.valid("json");
    const result = await db.insert(suppliers).values(supplier);
    return c.json({ supplierId: Number(result.lastInsertRowid) }, 201);
  })

  .openapi(get, async (c) => {
    const { id } = c.req.valid("param");
    const supplier = await db.query.suppliers.findFirst({
      where: eq(suppliers.supplierId, id),
    });

    if (!supplier) {
      throw new HTTPException(404, { message: "supplier not found" });
    }

    return c.json(supplier);
  })

  .openapi(update, async (c) => {
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

    return c.json(patchedSupplier);
  });
