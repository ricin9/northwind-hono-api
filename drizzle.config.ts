import type { Config } from "@libsql/client";
import { defineConfig } from "drizzle-kit";

const databaseUrlConfig: Config =
  process.env.NODE_ENV === "production"
    ? {
        url: process.env.LIBSQL_DATABASE_URL!,
        authToken: process.env.LIBSQL_DATABASE_AUTH_TOKEN!,
      }
    : { url: "file:northwind.db" };

export default defineConfig({
  schema: ["src/db/schema.ts", "src/db/relations.ts"],
  out: "drizzle",
  dialect: "sqlite",
  dbCredentials: databaseUrlConfig,
  driver: "turso",
});
