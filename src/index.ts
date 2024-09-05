import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";

import type { Env } from "env";
import { initDbMiddleware } from "db";
import { v1 } from "./routes/v1";
import { errorHandler } from "./util/global-error-handler";
import { OpenAPIHono } from "@hono/zod-openapi";
import { apiReference } from "@scalar/hono-api-reference";
import { openApiInfo } from "openapi-info";

const app = new OpenAPIHono<{ Bindings: Env }>();

/* global middleware */
app.use(logger());
app.use(cors());
app.use(secureHeaders());
app.use(initDbMiddleware); // cloudflare worker hack

/* error handling */
app.onError(errorHandler);

/* openapi */
app.doc("/doc", openApiInfo);

app.get(
  "/",
  apiReference({
    spec: { url: "/doc" },
  })
);

/* routes */
app.get("/dev", (c) => {
  return c.text(new URLSearchParams(c.req.query()).toString());
});

const routes = app.route("/v1", v1);

/* for hono RPC */
export type AppType = typeof routes;

/* for cloudflare workers */
export default app;
