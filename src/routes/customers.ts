import { Hono } from "hono";
import { db } from "../db";
import { customers as customers } from "../db/schema";
import { zValidator } from "@hono/zod-validator";
import { createInsertSchema } from "drizzle-zod";
import { eq, sql } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import {
  idStringParamSchema,
  makePartialMinimumOneProperty,
} from "../util/validation";
import { z } from "zod";
import { validator } from "hono/validator";
import {
  FilterPaginationSortingSchema,
  filterSortingPaginationValidationMiddleware,
  generateQuery,
} from "../util/filter-pagination-sorting";

const insertCustomerSchema = createInsertSchema(customers);
const patchCustomerSchema = makePartialMinimumOneProperty(
  insertCustomerSchema.omit({ customerId: true })
);

type Variables = {
  fpsInput?: FilterPaginationSortingSchema<typeof customers>;
};
export const customersGroup = new Hono<{ Variables: Variables }>()

  .get(
    "/",
    filterSortingPaginationValidationMiddleware(customers),
    async (c) => {
      const filteringInput = c.get("fpsInput")!;

      // try catch error handling n stuff
      const rows = await generateQuery(customers, filteringInput);

      return c.json(rows);
    }
  )

  .get(
    "/search",
    zValidator("query", z.object({ query: z.string() }).partial()),
    async (c) => {
      const { query } = c.req.valid("query");
      const rows = query
        ? await db.all(sql`SELECT * FROM CustomerSearch
          JOIN Customers USING (CustomerId)
          WHERE CustomerSearch MATCH ${query + "*"} 
          ORDER BY rank`)
        : await db.select().from(customers);
      return c.json(rows);
    }
  )

  .post("/", zValidator("json", insertCustomerSchema), async (c) => {
    const customer = c.req.valid("json");
    const result = await db.insert(customers).values(customer);
    return c.json({ customerId: Number(result.lastInsertRowid) });
  })

  .get("/:id", zValidator("param", idStringParamSchema), async (c) => {
    const { id } = c.req.valid("param");
    const customer = await db
      .select()
      .from(customers)
      .where(eq(customers.customerId, id));

    return c.json(customer);
  })

  .patch(
    "/:id",
    zValidator("param", idStringParamSchema),
    zValidator("json", patchCustomerSchema),
    async (c) => {
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
    }
  );
