import { z } from "zod";

export const authSearchSchema = z.object({
  redirect: z
    .string()
    .regex(/^\/(?!\/)/)
    .optional()
    .catch(undefined),
});
