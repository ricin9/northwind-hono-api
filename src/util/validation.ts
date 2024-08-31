import { z } from "zod";

export const idParamSchema = z.object({
  id: z.string().pipe(z.coerce.number().min(1)),
});

export function makePartialMinimumOneProperty<T extends z.ZodRawShape>(
  schema: Zod.ZodObject<T>
) {
  return schema
    .partial()
    .refine(
      (obj) => Object.keys(obj).length > 0,
      "at least one property must be defined"
    );
}
