import { Hono } from "hono";
import { db } from "../db";
import { customers as customers } from "../db/schema";
import { zValidator } from "@hono/zod-validator";
import { createInsertSchema } from "drizzle-zod";
import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import {
  idParamSchema,
  makePartialMinimumOneProperty,
} from "../util/validation";

export const customersGroup = new Hono();

customersGroup.get("/", async (c) => {
  const rows = await db.select().from(customers);
  return c.json(rows);
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  customerId: true,
});

customersGroup.post(
  "/",
  zValidator("json", insertCustomerSchema),
  async (c) => {
    const customer = c.req.valid("json");
    const result = await db.insert(customers).values(customer);
    return c.json({ customerId: result.lastInsertRowid?.toString() });
  }
);

customersGroup.get("/:id", zValidator("param", idParamSchema), async (c) => {
  const { id } = c.req.valid("param");
  const customer = await db
    .select()
    .from(customers)
    .where(eq(customers.customerId, id));

  return c.json(customer);
});

const patchCustomerSchema = makePartialMinimumOneProperty(insertCustomerSchema);

customersGroup.patch(
  "/:id",
  zValidator("param", idParamSchema),
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

    // console.log({ patchedCustomer });
    return c.json(patchedCustomer);
  }
);
