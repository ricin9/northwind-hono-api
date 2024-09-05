import { OpenAPIHono } from "@hono/zod-openapi";
import { eq, sql } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";

import { db } from "db";
import { orderDetails, orders, products } from "db/schema";
import { advancedQuery } from "util/filter-pagination-sorting";
import { generatePaginationMetadata } from "util/paginationMetadata";
import { orderDetailsGroup } from "./orderDetails/orderDetails";
import { create, get, list, update } from "./routes";

export const ordersGroup = new OpenAPIHono()
  .openapi(list, async (c) => {
    const filteringInput = c.req.valid("query");
    const { data, totalCount } = await advancedQuery(orders, filteringInput);
    const metadata = generatePaginationMetadata(c, totalCount);

    return c.json({ metadata, data }, 200);
  })

  .openapi(create, async (c) => {
    let { order, details } = c.req.valid("json");

    const orderId = await db.transaction(async (tx) => {
      // 1. check validity of product ids and quantities
      let productCheckPromises = details.map(async (detail) => {
        const product = await tx
          .select()
          .from(products)
          .where(eq(products.productId, detail.productId))
          .get();

        if (!product) {
          throw new HTTPException(400, {
            message: `product with id ${detail.productId} not found`,
          });
        }

        if ((product?.unitsInStock || 0) < (detail.quantity || 1)) {
          throw new HTTPException(400, {
            message: `insufficient stock for product ${product.productName} with id ${product.productId}`,
          });
        }
      });

      await Promise.all(productCheckPromises);

      // 2. create the order
      const { lastInsertRowid } = await tx.insert(orders).values(order);

      // 3. Create order details and update stock
      await tx.insert(orderDetails).values(
        details.map((detail) => ({
          ...detail,
          orderId: Number(lastInsertRowid),
        }))
      );

      const updateProductsPromises = details.map(async (detail) =>
        tx
          .update(products)
          .set({
            unitsInStock: sql`${products.unitsInStock} - ${detail.quantity}`,
          })
          .where(eq(products.productId, detail.productId))
      );

      await Promise.all(updateProductsPromises);

      return Number(lastInsertRowid);
    });

    return c.json({ orderId: orderId }, 201);
  })

  .openapi(get, async (c) => {
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

    if (!order) {
      throw new HTTPException(404, { message: "order not found" });
    }

    return c.json(order);
  })

  .openapi(update, async (c) => {
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
  })

  .route("/", orderDetailsGroup);
