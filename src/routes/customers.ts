import { Hono } from "hono";
import { db } from "../db";
import { customers as customers } from "../db/schema";
import { zValidator } from "@hono/zod-validator";
import { createInsertSchema } from "drizzle-zod";
import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import {
  idStringParamSchema,
  makePartialMinimumOneProperty,
} from "../util/validation";

const insertCustomerSchema = createInsertSchema(customers);
const patchCustomerSchema = makePartialMinimumOneProperty(
  insertCustomerSchema.omit({ customerId: true })
);

export const customersGroup = new Hono()

  .get("/", async (c) => {
    const rows = await db.select().from(customers);
    return c.json(rows);
  })

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
