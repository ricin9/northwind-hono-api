import { Hono } from "hono";
import { db } from "../db";
import { orderDetails, orders as orders, products } from "../db/schema";
import { zValidator } from "@hono/zod-validator";
import { createInsertSchema } from "drizzle-zod";
import { eq, inArray } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import {
  idParamSchema,
  makePartialMinimumOneProperty,
} from "../util/validation";
import { z } from "zod";
import { LibsqlError, ResultSet } from "@libsql/client";

const insertOrderDetailSchema = createInsertSchema(orderDetails, {
  unitPrice: z // numeric string
    .string()
    .refine(
      (val) => {
        const parsed = Number(val);
        return !isNaN(parsed) && parsed > 0;
      },
      { message: "Must be a positive number" }
    )
    .optional(),
}).omit({ orderId: true });

const insertOrderSchema = createInsertSchema(orders).omit({
  orderId: true,
});

const insertOrderWithDetailsSchema = z.object({
  order: insertOrderSchema,
  details: z.array(insertOrderDetailSchema).min(1),
});

const patchOrderSchema = makePartialMinimumOneProperty(insertOrderSchema);

export const ordersGroup = new Hono()

  .get("/", async (c) => {
    const rows = await db.select().from(orders);
    return c.json(rows);
  })

  .post("/", zValidator("json", insertOrderWithDetailsSchema), async (c) => {
    const body = c.req.valid("json");

    const productIds = body.details.map((d) => d.productId);
    const productRows = await db.query.products.findMany({
      columns: { productId: true, unitPrice: true },
      where: inArray(products.productId, productIds),
      limit: productIds.length,
    });

    if (productRows.length !== productIds.length) {
      throw new HTTPException(400, { message: "Invalid product id" });
    }

    // set unit price from product rows if not provided
    const details = body.details.map((d) => {
      const product = productRows.find((p) => p.productId === d.productId);
      return {
        ...d,
        unitPrice: d.unitPrice ?? (product?.unitPrice as string),
      };
    });

    const order = body.order;
    const result = await db.transaction(async (trx) => {
      // TODO : subtract stock from product
      let orderResult: ResultSet;
      try {
        orderResult = await trx.insert(orders).values(order);
      } catch (err) {
        if (err instanceof LibsqlError) {
          throw new HTTPException(400, { message: "Invalid data" });
        }
        throw new HTTPException(500, { message: "Internal server error" });
      }

      const orderId = Number(orderResult.lastInsertRowid);

      await trx
        .insert(orderDetails)
        .values(details.map((d) => ({ ...d, orderId })));

      return orderResult;
    });

    return c.json({ orderId: Number(result.lastInsertRowid) });
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
