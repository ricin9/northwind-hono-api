import { Hono } from "hono";
import { db } from "../db";
import { orderDetails, orders as orders, products } from "../db/schema";
import { zValidator } from "@hono/zod-validator";
import { createInsertSchema } from "drizzle-zod";
import { and, eq, inArray, sql } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";

export const insertOrderDetailSchema = createInsertSchema(orderDetails, {
  unitPrice: z // numeric string
    .string()
    .refine(
      (val) => {
        const parsed = Number(val);
        return !isNaN(parsed) && parsed > 0;
      },
      { message: "must be a positive number" }
    ),
  quantity: z.number().min(1).default(1),
  discount: z.number().min(0).max(1).default(0),
}).omit({ orderId: true });

export const insertOrderDetailsSchema = insertOrderDetailSchema
  .array()
  .min(1)
  .refine(
    (arr) =>
      new Set(arr.map((element) => element.productId)).size === arr.length,
    "duplicate product ids"
  );

const orderIdParamSchema = z.object({
  orderId: z.string().pipe(z.coerce.number().min(1)),
});

const orderIdDetailIdParamSchema = orderIdParamSchema.extend({
  productId: z.string().pipe(z.coerce.number().min(1)),
});

export const ordersDetailsGroup = new Hono()

  .get(
    ":orderId/details",
    zValidator("param", orderIdParamSchema),
    async (c) => {
      const { orderId } = c.req.valid("param");

      const order = await db.query.orders.findFirst({
        columns: { orderId: true },
        where: eq(orders.orderId, orderId),
      });

      if (!order) {
        throw new HTTPException(404, { message: "order does not exist" });
      }

      const rows = await db.query.orderDetails.findMany({
        where: eq(orderDetails.orderId, orderId),
        with: {
          product: {
            columns: { productId: true, productName: true },
          },
        },
      });
      return c.json(rows);
    }
  )

  .get(
    ":orderId/details/:productId",
    zValidator("param", orderIdDetailIdParamSchema),
    async (c) => {
      const { orderId, productId } = c.req.valid("param");

      const order = await db.query.orders.findFirst({
        columns: { orderId: true },
        where: eq(orders.orderId, orderId),
      });

      if (!order) {
        throw new HTTPException(404, { message: "order does not exist" });
      }

      const row = await db.query.orderDetails.findFirst({
        where: and(
          eq(orderDetails.orderId, orderId),
          eq(orderDetails.productId, productId)
        ),
        with: {
          product: {
            columns: { productId: true, productName: true },
          },
        },
      });

      if (!row) {
        throw new HTTPException(404, {
          message: "order detail does not exist",
        });
      }
      return c.json(row);
    }
  )

  .put(
    ":orderId/details",
    zValidator("param", orderIdParamSchema),
    zValidator("json", insertOrderDetailSchema),
    async (c) => {
      const { orderId } = c.req.valid("param");
      let detail = { ...c.req.valid("json"), orderId };

      const order = await db.query.orders.findFirst({
        columns: { orderId: true },
        where: eq(orders.orderId, orderId),
      });

      if (!order) {
        throw new HTTPException(404, { message: "order does not exist" });
      }

      const result = await db.transaction(async (tx) => {
        // 1. check validity of product id and quantity
        let product = await tx.query.products.findFirst({
          columns: { unitsInStock: true },
          where: eq(products.productId, detail.productId),
        });

        if (!product) {
          throw new HTTPException(400, {
            message: `product with id ${detail.productId} not found`,
          });
        }

        // 2. query existing orderDetail if exists as we need to find difference of quantity
        const existingOrderDetail = await tx.query.orderDetails.findFirst({
          columns: { quantity: true },
          where: and(
            eq(orderDetails.productId, detail.productId),
            eq(orderDetails.orderId, orderId)
          ),
        });

        const quantityDiff = existingOrderDetail
          ? (detail.quantity || 1) - existingOrderDetail.quantity
          : detail.quantity || 1;

        if ((product.unitsInStock || 0) < quantityDiff) {
          throw new HTTPException(400, {
            message: `insufficient stock for product id ${detail.productId}`,
          });
        }
        // 3. upsert the order detail

        const { lastInsertRowid } = await tx
          .insert(orderDetails)
          .values(detail)
          .onConflictDoUpdate({
            target: [orderDetails.productId, orderDetails.orderId],
            set: {
              discount: sql`excluded.Discount`,
              quantity: sql`excluded.Quantity`,
              unitPrice: sql`excluded.UnitPrice`,
            },
          });

        // update product quantity with the pre calculated quantity difference

        await tx
          .update(products)
          .set({
            unitsInStock: sql`${products.unitsInStock} - ${quantityDiff}`,
          })
          .where(eq(products.productId, detail.productId));

        return Number(lastInsertRowid);
      });

      return c.json({ orderId, productId: detail.productId });
    }
  )

  .delete(
    ":orderId/details/:productId",
    zValidator("param", orderIdDetailIdParamSchema),
    async (c) => {
      const { orderId, productId } = c.req.valid("param");
      await db.transaction(async (tx) => {
        const orderDetail = await tx.query.orderDetails.findFirst({
          columns: { quantity: true },
          where: and(
            eq(orderDetails.orderId, orderId),
            eq(orderDetails.productId, productId)
          ),
        });

        if (!orderDetail) {
          throw new HTTPException(404, {
            message: "order detail does not exist",
          });
        }

        await tx
          .delete(orderDetails)
          .where(
            and(
              eq(orderDetails.orderId, orderId),
              eq(orderDetails.productId, productId)
            )
          );

        await tx
          .update(products)
          .set({
            unitsInStock: sql`${products.unitsInStock} + ${orderDetail.quantity}`,
          })
          .where(eq(products.productId, productId));
      });
      return c.status(204);
    }
  );
