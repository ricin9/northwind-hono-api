import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";
import * as relations from "./relations";

export const tursoClient = createClient({ url: "file:northwind.db" });

export const db = drizzle(tursoClient, { schema: { ...schema, ...relations } });
