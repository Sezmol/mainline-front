import { z } from "zod";

import { SPECIALITIES } from "@shared/config";

export const DESCRIPTION_LIMIT = 500;
export const WORKPLACE_LIMIT = 100;

export const profileFormSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "Enter your first name")
    .max(50, "Your first name must be 50 characters or fewer"),
  lastName: z
    .string()
    .trim()
    .min(1, "Enter your last name")
    .max(50, "Your last name must be 50 characters or fewer"),
  nickname: z
    .string()
    .trim()
    .min(3, "Nickname must be at least 3 characters")
    .max(32, "Nickname must be 32 characters or fewer")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Nickname can contain only letters, digits, underscores and hyphens",
    ),
  speciality: z.enum(SPECIALITIES, { message: "Pick your speciality" }),
  description: z
    .string()
    .trim()
    .max(
      DESCRIPTION_LIMIT,
      `About must be ${DESCRIPTION_LIMIT} characters or fewer`,
    ),
  workplace: z
    .string()
    .trim()
    .max(
      WORKPLACE_LIMIT,
      `Workplace must be ${WORKPLACE_LIMIT} characters or fewer`,
    ),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

export const toUpdateBody = (values: ProfileFormValues) => ({
  firstName: values.firstName,
  lastName: values.lastName,
  nickname: values.nickname,
  speciality: values.speciality,
  ...(values.description ? { description: values.description } : {}),
  ...(values.workplace ? { workplace: values.workplace } : {}),
});
