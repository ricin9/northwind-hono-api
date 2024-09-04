import { Config, createClient } from "@libsql/client";
import { drizzle, LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "./schema";
import * as relations from "./relations";
import { Env } from "env";

const tschema = { ...schema, ...relations };

export type DB = LibSQLDatabase<typeof tschema>;
export let db: DB;

export function initDb(envars: Env) {
  const config: Config = {
    url: envars.LIBSQL_DATABASE_URL,
    authToken: envars.LIBSQL_DATABASE_AUTH_TOKEN,
  };
  const tursoClient = createClient(config);
  db = drizzle(tursoClient, { schema: tschema });
}
