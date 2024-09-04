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
import { SQLiteTableWithColumns } from "drizzle-orm/sqlite-core";
import { createMiddleware } from "hono/factory";
import QueryString from "qs";
import { z } from "zod";
import { db } from "../db";
import { customers } from "db/schema";

type Table = SQLiteTableWithColumns<any>;

function getColumnDataType(
  table: Table,
  columnName: string
): "string" | "number" {
  return getTableColumns(table)[columnName].dataType;
}

function castStringAs(dataType: "string" | "number", value: string) {
  if (dataType !== "number") return value;
  const newValue = Number(value);
  if (isNaN(newValue)) {
    throw new Error("value cannot be cast as number");
  }
  return value;
}

export const advancedQueryValidationMiddleware = (table: Table) =>
  createMiddleware(async (c, next) => {
    const queryString = new URL(c.req.url).search.slice(1); // url.search included leadin '?'
    const parsedQueryParams = QueryString.parse(queryString, { depth: 2 });

    const schema = generateFPSSchemaForTable(table);
    // TODO do try catch and return nice error msg or implement Hono().onError
    const data = schema.parse(parsedQueryParams);

    c.set("fpsInput", data);
    await next();
  });

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

export function generateFPSSchemaForTable(table: Table) {
  const columns = getTableColumns(table);
  const columnsList = Object.keys(columns) as [string, ...string[]];
  const columnsListEnum = z.enum(columnsList);

  return z
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
    });
}

export type AdvancedQuerySchema = z.infer<
  ReturnType<typeof generateFPSSchemaForTable>
>;

type TableColumns<T extends Table> = keyof ReturnType<
  typeof getTableColumns<T>
>;

export async function advancedQuery<
  T extends Table,
  U extends T["_"]["columns"] | Omit<T["_"]["columns"], keyof T["_"]["columns"]>
>(
  table: T,
  fps: AdvancedQuerySchema,
  allowedColumns?: U // hide sensitive info based on user role?
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
