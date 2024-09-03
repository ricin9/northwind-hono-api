import { Hono } from "hono";

import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { errorHandler } from "./util/global-error-handler";
import { v1 } from "./routes/v1";

const app = new Hono();

/* global middleware */
app.use(logger());
app.use(cors());
app.use(secureHeaders());

/* global error handling */
app.onError(errorHandler);

app.get("/", (c) => {
  return c.text("Hello sup!");
});

/* routes */
const routes = app.route("/v1", v1);

export type AppType = typeof routes;
export default app;
