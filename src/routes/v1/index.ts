import { OpenAPIHono } from "@hono/zod-openapi";

import { employeesGroup } from "./employees/employees";
import { suppliersGroup } from "./suppliers/suppliers";
import { shippersGroup } from "./shippers/shippers";
import { productsGroup } from "./products/products";
import { customersGroup } from "./customers/customers";
import { ordersGroup } from "./orders/orders";

export const v1 = new OpenAPIHono()
  .route("/employees", employeesGroup)
  .route("/customers", customersGroup)
  .route("/suppliers", suppliersGroup)
  .route("/shippers", shippersGroup)
  .route("/products", productsGroup)
  .route("/orders", ordersGroup);
