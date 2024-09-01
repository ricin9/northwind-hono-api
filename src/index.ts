import { Hono } from "hono";
import {
  customersGroup,
  employeesGroup,
  ordersGroup,
  productsGroup,
  shippersGroup,
  suppliersGroup,
} from "./routes";
import { hc } from "hono/client";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello sup!");
});

const routes = app
  .route("/employees", employeesGroup)
  .route("/customers", customersGroup)
  .route("/suppliers", suppliersGroup)
  .route("/shippers", shippersGroup)
  .route("/products", productsGroup)
  .route("/orders", ordersGroup);

export type AppType = typeof routes;
export default app;
