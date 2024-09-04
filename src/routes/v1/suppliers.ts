import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

import { db } from "db";
import { suppliers } from "db/schema";
import {
  advancedQuery,
  advancedQueryValidationMiddleware,
} from "util/filter-pagination-sorting";
import { generatePaginationMetadata } from "util/paginationMetadata";
import { idParamSchema, makePartialMinimumOneProperty } from "util/validation";
import { AdvancedSchemaVariables } from "../../util/types";

const insertSupplierSchema = createInsertSchema(suppliers).omit({
  supplierId: true,
});
const patchSupplierSchema = makePartialMinimumOneProperty(insertSupplierSchema);

export const suppliersGroup = new Hono<{ Variables: AdvancedSchemaVariables }>()
  .get(
    "/",
    advancedQueryValidationMiddleware(suppliers),

    async (c) => {
      const filteringInput = c.get("fpsInput")!;

      const { data, totalCount } = await advancedQuery(
        suppliers,
        filteringInput
      );

      const metadata = generatePaginationMetadata(c, totalCount);

      return c.json({ metadata, data });
    }
  )

  .post("/", zValidator("json", insertSupplierSchema), async (c) => {
    const supplier = c.req.valid("json");
    const result = await db.insert(suppliers).values(supplier);
    return c.json({ supplierId: Number(result.lastInsertRowid) });
  })

  .get("/:id", zValidator("param", idParamSchema), async (c) => {
    const { id } = c.req.valid("param");
    const supplier = await db.query.suppliers.findFirst({
      where: eq(suppliers.supplierId, id),
    });

    if (!supplier) {
      throw new HTTPException(404, { message: "supplier not found" });
    }

    return c.json(supplier);
  })

  .patch(
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

      return c.json(patchedSupplier);
    }
  );
