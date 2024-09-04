import { zValidator } from "@hono/zod-validator";
import { db } from "db";
import { customers } from "db/schema";
import { eq, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

import {
  advancedQuery,
  advancedQueryValidationMiddleware,
} from "util/filter-pagination-sorting";
import { generatePaginationMetadata } from "util/paginationMetadata";
import {
  idStringParamSchema,
  makePartialMinimumOneProperty,
} from "util/validation";
import { z } from "zod";
import { AdvancedSchemaVariables } from "../../util/types";

const insertCustomerSchema = createInsertSchema(customers);
const patchCustomerSchema = makePartialMinimumOneProperty(
  insertCustomerSchema.omit({ customerId: true })
);

export const customersGroup = new Hono<{ Variables: AdvancedSchemaVariables }>()

  .get(
    "/",
    advancedQueryValidationMiddleware(customers),

    async (c) => {
      const filteringInput = c.get("fpsInput")!;

      const { data, totalCount } = await advancedQuery(
        customers,
        filteringInput
      );

      const metadata = generatePaginationMetadata(c, totalCount);

      return c.json({ metadata, data });
    }
  )

  // disabled temporarily because of problem with turso and FTS5, solvable
  // .get(
  //   "/search",
  //   zValidator("query", z.object({ query: z.string() }).partial()),
  //   async (c) => {
  //     const { query } = c.req.valid("query");
  //     const rows = query
  //       ? await db.all(sql`SELECT * FROM CustomerSearch
  //         JOIN Customers USING (CustomerId)
  //         WHERE CustomerSearch MATCH ${query + "*"}
  //         ORDER BY rank`)
  //       : await db.select().from(customers);
  //     return c.json(rows);
  //   }
  // )

  .post("/", zValidator("json", insertCustomerSchema), async (c) => {
    const customer = c.req.valid("json");
    const result = await db.insert(customers).values(customer);
    return c.json({ customerId: Number(result.lastInsertRowid) });
  })

  .get("/:id", zValidator("param", idStringParamSchema), async (c) => {
    const { id } = c.req.valid("param");
    const customer = await db.query.customers.findFirst({
      where: eq(customers.customerId, id),
    });

    if (!customer) {
      throw new HTTPException(404, { message: "customer not found" });
    }
    return c.json(customer);
  })

  .patch(
    "/:id",
    zValidator("param", idStringParamSchema),
    zValidator("json", patchCustomerSchema),
    async (c) => {
      const { id } = c.req.valid("param");
      const body = c.req.valid("json");

      const customer = await db.query.customers.findFirst({
        where: eq(customers.customerId, id),
      });

      if (!customer) {
        throw new HTTPException(404, { message: "customer not found" });
      }

      const patchedCustomer = await db
        .update(customers)
        .set(body)
        .where(eq(customers.customerId, id))
        .returning();

      return c.json(patchedCustomer);
    }
  );
