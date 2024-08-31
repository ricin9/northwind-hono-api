import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: ["src/db/schema.ts", "src/db/relations.ts"],
  out: "drizzle",
  dialect: "sqlite",
  dbCredentials: { url: "file:northwind.db" },
  driver: "turso",
});
