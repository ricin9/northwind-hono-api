import { Hono } from "hono";
import { db } from "../db";
import { employees } from "../db/schema";
import { zValidator } from "@hono/zod-validator";
import { createInsertSchema } from "drizzle-zod";
import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import {
  idParamSchema,
  makePartialMinimumOneProperty,
} from "../util/validation";

export const employeesGroup = new Hono();

employeesGroup.get("/", async (c) => {
  const rows = await db.select().from(employees);
  return c.json(rows);
});

export const insertEmployeeSchema = createInsertSchema(employees).omit({
  employeeId: true,
});

employeesGroup.post(
  "/",
  zValidator("json", insertEmployeeSchema),
  async (c) => {
    const employee = c.req.valid("json");
    const result = await db.insert(employees).values(employee);
    return c.json({ employeeId: result.lastInsertRowid?.toString() });
  }
);

employeesGroup.get("/:id", zValidator("param", idParamSchema), async (c) => {
  const { id } = c.req.valid("param");
  const employee = await db
    .select()
    .from(employees)
    .where(eq(employees.employeeId, id));

  return c.json(employee);
});

const patchEmployeeSchema = makePartialMinimumOneProperty(insertEmployeeSchema);

employeesGroup.patch(
  "/:id",
  zValidator("param", idParamSchema),
  zValidator("json", patchEmployeeSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");

    const result = await db
      .select({ employeeId: employees.employeeId })
      .from(employees)
      .where(eq(employees.employeeId, id))
      .limit(1);

    if (result.length === 0) {
      throw new HTTPException(404, { message: "employee not found" });
    }

    const patchedEmployee = await db
      .update(employees)
      .set(body)
      .where(eq(employees.employeeId, id))
      .returning();

    // console.log({ patchedEmployee });
    return c.json(patchedEmployee);
  }
);
