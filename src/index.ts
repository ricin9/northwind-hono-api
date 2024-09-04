import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { env } from "hono/adapter";

import { v1 } from "./routes/v1";
import { errorHandler } from "./util/global-error-handler";
import type { Env } from "env";
import { initDb } from "db";

const app = new Hono<{ Bindings: Env }>();

/* global middleware */
app.use(logger());
app.use(cors());
app.use(secureHeaders());
app.use(async (c, next) => {
  initDb(env<Env, any>(c));
  await next();
});

/* error handling */
app.onError(errorHandler);

app.get("/", (c) => {
  return c.text("hello");
});

/* routes */
const routes = app.route("/v1", v1);

export type AppType = typeof routes;
export default app;
