import { OpenAPIHono } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";

import { db } from "db";
import { customers } from "db/schema";
import { advancedQuery } from "util/filter-pagination-sorting";
import { generatePaginationMetadata } from "util/paginationMetadata";
import { AdvancedSchemaVariables } from "../../../util/types";
import { create, get, list, update } from "./routes";

export const customersGroup = new OpenAPIHono<{
  Variables: AdvancedSchemaVariables;
}>()
  .openapi(list, async (c) => {
    const filteringInput = c.get("fpsInput")!;

    const { data, totalCount } = await advancedQuery(customers, filteringInput);
    const metadata = generatePaginationMetadata(c, totalCount);

    return c.json({ metadata, data });
  })

  .openapi(create, async (c) => {
    const customer = c.req.valid("json");
    const result = await db.insert(customers).values(customer);
    return c.json(
      { customerId: result.lastInsertRowid?.toString() as string },
      201
    );
  })

  .openapi(get, async (c) => {
    const { id } = c.req.valid("param");
    const customer = await db.query.customers.findFirst({
      where: eq(customers.customerId, id),
    });

    if (!customer) {
      throw new HTTPException(404, { message: "customer not found" });
    }

    return c.json(customer);
  })

  .openapi(update, async (c) => {
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");

    const result = await db
      .select({ customerId: customers.customerId })
      .from(customers)
      .where(eq(customers.customerId, id))
      .limit(1);

    if (result.length === 0) {
      throw new HTTPException(404, { message: "customer not found" });
    }

    const patchedCustomer = await db
      .update(customers)
      .set(body)
      .where(eq(customers.customerId, id))
      .returning();

    return c.json(patchedCustomer);
  });

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
