/* this file is a helper to generate a schema for filtering, pagination and sorting */
/* it can be used with any drizzle sqlite table */
/* this is specifically made to accomodate clients using url search params to get a filtered sorted paginated list */
/* search params support object and array nesting using the qs library */
/* you can copy and paste this file in your proejct, if you don't use search params you can remove qs bit */

import {
  and,
  asc,
  desc,
  eq,
  getTableColumns,
  gt,
  gte,
  inArray,
  isNotNull,
  isNull,
  like,
  lt,
  lte,
  ne,
  notInArray,
  sql,
  SQL,
} from "drizzle-orm";
import type { SQLiteTableWithColumns } from "drizzle-orm/sqlite-core";
import { z } from "@hono/zod-openapi";
import { db } from "../db";
import qs from "qs";

type Table = SQLiteTableWithColumns<any>;

/**
 * @description returns sqlite column's data affinity (numeric or string)
 */
function getColumnDataType(
  table: Table,
  columnName: string
): "string" | "number" {
  return getTableColumns(table)[columnName].dataType;
}

/**
 * @description this is used to convert value to be compared to a sqlite column after getting
 * sqlite column's type affinity which is either string or number
 */
function castStringAs(dataType: "string" | "number", value: string) {
  if (dataType !== "number") return value;
  const newValue = Number(value);
  if (isNaN(newValue)) {
    throw new Error("value cannot be cast as number");
  }
  return value;
}

const filterOperatorsSchema = z.object({
  // should be refined to only allow valid combinations of operators for same column
  eq: z.string().optional(),
  ne: z.string().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  like: z.string().optional(),
  in: z.array(z.string()).default([]),
  nin: z.array(z.string()).default([]),
  is: z.enum(["null", "notnull"]).optional(),
});

/**
 * @description the zod schema that this function produces expects a query string parsed with (URL)SearchParams
 * as it is done with hono and then reparses with qs instead since hono doesn't parse nested query strings
 * if you don't need reparsing or just expect the original schema remove the z.preprocess bit
 * @param table the drizzle sqlite table
 * @returns a zod schema that receives
 */
export function generateFPSSchemaForTable(table: Table) {
  const columns = getTableColumns(table);
  const columnsList = Object.keys(columns) as [string, ...string[]];
  const columnsListEnum = z.enum(columnsList);

  return z.preprocess(
    (val) =>
      qs.parse(new URLSearchParams(val as Record<string, string>).toString()), // qs to support nested search params
    z
      .object({
        page: z.coerce.number().int().positive().default(1),
        pageSize: z.coerce.number().int().positive().max(250).default(10),
        sort: z
          .object({
            field: columnsListEnum,
            order: z.enum(["asc", "desc"]).default("asc"),
          })
          .array()
          .default([]),
        filter: z.record(columnsListEnum, filterOperatorsSchema).optional(),
      })
      .superRefine((data, ctx) => {
        for (const key in data.filter) {
          // @ts-ignore this is fine because key is already validated to be valid column name
          const columnIsNumber = getColumnDataType(table, key) === "number";
          if (columnIsNumber) {
            for (const operator in data.filter[key]) {
              if (operator === "like") {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message: `Column ${key} is a number column and does not support ${operator} operator`,
                  fatal: true,
                });
                return z.NEVER;
              }
            }
          }
        }
      })
  );
}

export type AdvancedQuerySchema = z.infer<
  ReturnType<typeof generateFPSSchemaForTable>
>;
/**
 *
 * @param table the drizzle sqlite table that we want to apply filtering pagination and sorting on.
 * @param fps the filtering pagination and sorting input
 * @param allowedColumns only these columns will be be fetched if provided, otherwise all columns if not provided
 * @returns data rows and total count(*) of this query
 */
export async function advancedQuery<
  T extends Table,
  U extends T["_"]["columns"] | Omit<T["_"]["columns"], keyof T["_"]["columns"]>
>(
  table: T,
  fps: AdvancedQuerySchema,
  allowedColumns?: U // hide sensitive info based on user role or save bandiwdth?
) {
  let dataQuery = (
    allowedColumns
      ? db.select({ ...allowedColumns }).from(table)
      : db.select().from(table)
  )
    .$dynamic()
    .limit(fps.pageSize)
    .offset((fps.page - 1) * fps.pageSize);

  let countQuery = db
    .select({ totalCount: sql`count(1)` })
    .from(table)
    .$dynamic();

  let sortsSQL: SQL[] = [];
  const filtersSQL: SQL[] = [];

  for (const sort of fps.sort) {
    sortsSQL.push(
      sort.order === "asc" ? asc(table[sort.field]) : desc(table[sort.field])
    );
  }

  for (const filterField in fps.filter) {
    const dataType = getColumnDataType(table, filterField);
    if (fps.filter[filterField].in && fps.filter[filterField].in.length > 0) {
      let data = fps.filter[filterField].in;
      if (dataType === "number") {
        data = data.map((elem) => castStringAs("number", elem));
      }
      filtersSQL.push(inArray(table[filterField], fps.filter[filterField].in));
    }
    if (fps.filter[filterField].nin && fps.filter[filterField].nin.length > 0) {
      let data = fps.filter[filterField].nin;
      if (dataType === "number") {
        data = data.map((elem) => castStringAs("number", elem));
      }
      filtersSQL.push(
        notInArray(table[filterField], fps.filter[filterField].nin)
      );
    }
    if (fps.filter[filterField].eq) {
      filtersSQL.push(
        eq(
          table[filterField],
          castStringAs(dataType, fps.filter[filterField].eq)
        )
      );
    }

    if (fps.filter[filterField].ne) {
      filtersSQL.push(
        ne(
          table[filterField],
          castStringAs(dataType, fps.filter[filterField].ne)
        )
      );
    }

    if (fps.filter[filterField].lt) {
      filtersSQL.push(
        lt(
          table[filterField],
          castStringAs(dataType, fps.filter[filterField].lt)
        )
      );
    }

    if (fps.filter[filterField].lte) {
      filtersSQL.push(
        lte(
          table[filterField],
          castStringAs(dataType, fps.filter[filterField].lte)
        )
      );
    }

    if (fps.filter[filterField].gt) {
      filtersSQL.push(
        gt(
          table[filterField],
          castStringAs(dataType, fps.filter[filterField].gt)
        )
      );
    }

    if (fps.filter[filterField].gte) {
      filtersSQL.push(
        gte(
          table[filterField],
          castStringAs(dataType, fps.filter[filterField].gte)
        )
      );
    }

    if (fps.filter[filterField].like) {
      filtersSQL.push(
        like(
          table[filterField],
          castStringAs(dataType, fps.filter[filterField].like)
        )
      );
    }

    if (fps.filter[filterField].is) {
      filtersSQL.push(
        fps.filter[filterField].is === "null"
          ? isNull(table[filterField])
          : isNotNull(table[filterField])
      );
    }
  }
  dataQuery = dataQuery.orderBy(...sortsSQL);
  dataQuery = dataQuery.where(and(...filtersSQL));

  countQuery = countQuery.where(and(...filtersSQL));

  const [data, count] = await Promise.all([dataQuery.all(), countQuery.all()]);

  return { data, totalCount: (count[0]?.totalCount as number) || 0 };
}
