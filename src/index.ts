import { Hono } from "hono";
import {
  customersGroup,
  employeesGroup,
  productsGroup,
  shippersGroup,
  suppliersGroup,
} from "./routes";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello sup!");
});

app.route("/employees", employeesGroup);
app.route("/customers", customersGroup);
app.route("/suppliers", suppliersGroup);
app.route("/shippers", shippersGroup);
app.route("/products", productsGroup);

export default app;
