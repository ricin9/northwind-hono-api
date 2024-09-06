import type { ErrorHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import { ZodError } from "zod";

export const errorHandler: ErrorHandler = (err, c) => {
  if (err instanceof HTTPException) {
    return err.getResponse();
  }

  if (err instanceof ZodError) {
    return c.json(err, 400);
  }

  console.log(err);
  return c.json(
    {
      message: "Internal server error",
      success: false,
    },
    500
  );
};
