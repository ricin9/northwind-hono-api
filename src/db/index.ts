import { Config, createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";
import * as relations from "./relations";

const config: Config =
  process.env.NODE_ENV === "production"
    ? {
        url: process.env.LIBSQL_DATABASE_URL!,
        authToken: process.env.LIBSQL_DATABASE_AUTH_TOKEN!,
      }
    : { url: "file:northwind.db" };

export const tursoClient = createClient(config);

export const db = drizzle(tursoClient, { schema: { ...schema, ...relations } });
