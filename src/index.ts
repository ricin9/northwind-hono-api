import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";

import type { Env } from "env";
import { initDbMiddleware } from "util/init-db-middleware";
import { v1 } from "./routes/v1";
import { errorHandler } from "./util/global-error-handler";

const app = new Hono<{ Bindings: Env }>();

/* global middleware */
app.use(logger());
app.use(cors());
app.use(secureHeaders());
app.use(initDbMiddleware); // cloudflare worker hack

/* error handling */
app.onError(errorHandler);

app.get("/", (c) => {
  const baseUrl = c.req.url;
  return c.json({
    customers: baseUrl + "v1/customers",
    employees: baseUrl + "v1/employees",
    orders: baseUrl + "v1/orders",
    products: baseUrl + "v1/products",
    suppliers: baseUrl + "v1/suppliers",
    shippers: baseUrl + "v1/shippers",
  });
});

/* routes */
const routes = app.route("/v1", v1);

export type AppType = typeof routes;
export default app;
