import { initDb } from "db";
import { Env } from "env";
import { env } from "hono/adapter";
import { createMiddleware } from "hono/factory";

export const initDbMiddleware = createMiddleware(async (c, next) => {
  initDb(env<Env, any>(c));
  await next();
});
