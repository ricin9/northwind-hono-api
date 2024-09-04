import { zValidator } from "@hono/zod-validator";
import { eq, getTableColumns } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { idParamSchema, makePartialMinimumOneProperty } from "util/validation";

import { db } from "db";
import { employees } from "db/schema";
import {
  advancedQuery,
  advancedQueryValidationMiddleware,
} from "util/filter-pagination-sorting";
import { generatePaginationMetadata } from "util/paginationMetadata";
import { AdvancedSchemaVariables } from "../../util/types";

const insertEmployeeSchema = createInsertSchema(employees).omit({
  employeeId: true,
});
const patchEmployeeSchema = makePartialMinimumOneProperty(insertEmployeeSchema);

export const employeesGroup = new Hono<{ Variables: AdvancedSchemaVariables }>()
  .get(
    "/",
    advancedQueryValidationMiddleware(employees),

    async (c) => {
      const filteringInput = c.get("fpsInput")!;
      // const { photo, ...allowedColumns } = getTableColumns(employees);

      const { data, totalCount } = await advancedQuery(
        employees,
        filteringInput
      );

      const metadata = generatePaginationMetadata(c, totalCount);

      return c.json({ metadata, data });
    }
  )

  .post("/", zValidator("json", insertEmployeeSchema), async (c) => {
    const employee = c.req.valid("json");
    const result = await db.insert(employees).values(employee);
    return c.json({ employeeId: Number(result.lastInsertRowid) });
  })

  .get("/:id", zValidator("param", idParamSchema), async (c) => {
    const { id } = c.req.valid("param");
    const employee = await db.query.employees.findFirst({
      where: eq(employees.employeeId, id),
    });

    if (!employee) {
      throw new HTTPException(404, { message: "employee not found" });
    }
    return c.json(employee);
  })

  .patch(
    "/:id",
    zValidator("param", idParamSchema),
    zValidator("json", patchEmployeeSchema),
    async (c) => {
      const { id } = c.req.valid("param");
      const body = c.req.valid("json");

      const employee = await db.query.employees.findFirst({
        where: eq(employees.employeeId, id),
      });

      if (!employee) {
        throw new HTTPException(404, { message: "employee not found" });
      }
      const patchedEmployee = await db
        .update(employees)
        .set(body)
        .where(eq(employees.employeeId, id))
        .returning();

      return c.json(patchedEmployee);
    }
  );
