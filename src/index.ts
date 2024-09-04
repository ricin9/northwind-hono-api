import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";

import type { Env } from "env";
import { initDbMiddleware } from "util/init-db-middleware";
import { v1 } from "./routes/v1";
import { errorHandler } from "./util/global-error-handler";
import { OpenAPIHono } from "@hono/zod-openapi";
import { apiReference } from "@scalar/hono-api-reference";

const app = new OpenAPIHono<{ Bindings: Env }>();

/* global middleware */
app.use(logger());
app.use(cors());
app.use(secureHeaders());
app.use(initDbMiddleware); // cloudflare worker hack

/* error handling */
app.onError(errorHandler);

/* openapi */
app.doc("/doc", {
  openapi: "3.0.0",
  info: {
    title: "Northwind API",
    version: "1.0.0",
  },
});

app.get(
  "/",
  apiReference({
    spec: { url: "/doc" },
  })
);

/* routes */
const routes = app.route("/v1", v1);

export type AppType = typeof routes;
export default app;
