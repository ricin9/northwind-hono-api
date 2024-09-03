import { Hono } from "hono";
import { employeesGroup } from "./employees";
import { customersGroup } from "./customers";
import { suppliersGroup } from "./suppliers";
import { shippersGroup } from "./shippers";
import { productsGroup } from "./products";
import { ordersGroup } from "./orders";

export const v1 = new Hono()
  .route("/employees", employeesGroup)
  .route("/customers", customersGroup)
  .route("/suppliers", suppliersGroup)
  .route("/shippers", shippersGroup)
  .route("/products", productsGroup)
  .route("/orders", ordersGroup);
