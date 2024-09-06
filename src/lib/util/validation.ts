import { z } from "@hono/zod-openapi";
import { ZodObject, type ZodRawShape } from "zod";

export const idParamSchema = z.object({
  id: z.string().pipe(z.coerce.number().min(1)),
});

export const idStringParamSchema = z.object({
  id: z.string().min(1),
});

export function insureOneProperty<T extends ZodObject<ZodRawShape>>(zodObj: T) {
  const schema = zodObj;
  schema.refine(
    (obj) => Object.keys(obj).length > 0,
    "at least one property must be defined"
  );
  return schema;
}
