import { z } from "zod";

import { SPECIALITIES } from "@shared/config";

export const TITLE_LIMIT = 100;
export const BODY_LIMIT = 20_000;

export const postFormSchema = z.object({
  direction: z.enum(SPECIALITIES, { message: "Pick a direction" }),
  title: z
    .string()
    .trim()
    .min(1, "Enter a title")
    .max(TITLE_LIMIT, `Title must be ${TITLE_LIMIT} characters or fewer`),
  body: z
    .string()
    .trim()
    .min(1, "Write something")
    .max(BODY_LIMIT, `A post must be ${BODY_LIMIT} characters or fewer`),
});

export type PostFormValues = z.infer<typeof postFormSchema>;
