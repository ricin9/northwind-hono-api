import { eq, sql } from "drizzle-orm";
import { db } from "./src/db";
import { employees } from "./src/db/schema";

await db
  .update(employees)
  .set({ lastName: sql`${employees.lastName} || ' ' || 'aywas'` })
  .where(eq(employees.employeeId, 1));
