import { OpenAPIHono } from "@hono/zod-openapi";

import { employeesGroup } from "./employees/handler";
import { suppliersGroup } from "./suppliers/handler";
import { shippersGroup } from "./shippers/handler";
import { productsGroup } from "./products/handler";
import { customersGroup } from "./customers/handler";
import { ordersGroup } from "./orders/handler";

export const v1 = new OpenAPIHono()
  .route("/employees", employeesGroup)
  .route("/customers", customersGroup)
  .route("/suppliers", suppliersGroup)
  .route("/shippers", shippersGroup)
  .route("/products", productsGroup)
  .route("/orders", ordersGroup);
