import { Hono } from "hono";
import { db } from "../db";
import { orders as orders } from "../db/schema";
import { zValidator } from "@hono/zod-validator";
import { createInsertSchema } from "drizzle-zod";
import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import {
  idParamSchema,
  makePartialMinimumOneProperty,
} from "../util/validation";

const insertOrderSchema = createInsertSchema(orders).omit({
  orderId: true,
});
const patchOrderSchema = makePartialMinimumOneProperty(insertOrderSchema);

export const ordersGroup = new Hono()

  .get("/", async (c) => {
    const rows = await db.select().from(orders);
    return c.json(rows);
  })

  .post("/", zValidator("json", insertOrderSchema), async (c) => {
    const order = c.req.valid("json");
    const result = await db.insert(orders).values(order);
    return c.json({ orderId: result.lastInsertRowid?.toString() });
  })

  .get("/:id", zValidator("param", idParamSchema), async (c) => {
    const { id } = c.req.valid("param");
    const order = await db.query.orders.findFirst({
      where: eq(orders.orderId, id),
      with: {
        customer: {
          columns: { customerId: true, companyName: true },
        },
        employee: {
          columns: { employeeId: true, lastName: true, firstName: true },
        },
        shipper: { columns: { shipperId: true, companyName: true } },
        orderDetails: {
          with: {
            product: {
              columns: { productId: true, productName: true },
            },
          },
        },
      },
    });

    return c.json(order);
  })

  .patch(
    "/:id",
    zValidator("param", idParamSchema),
    zValidator("json", patchOrderSchema),
    async (c) => {
      const { id } = c.req.valid("param");
      const body = c.req.valid("json");

      const result = await db
        .select({ orderId: orders.orderId })
        .from(orders)
        .where(eq(orders.orderId, id))
        .limit(1);

      if (result.length === 0) {
        throw new HTTPException(404, { message: "order not found" });
      }

      const patchedOrder = await db
        .update(orders)
        .set(body)
        .where(eq(orders.orderId, id))
        .returning();

      return c.json(patchedOrder);
    }
  );
