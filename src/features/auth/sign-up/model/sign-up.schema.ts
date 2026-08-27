import { z } from "zod";

import { SPECIALITIES } from "@shared/config";

export const signUpSchema = z
  .object({
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
    email: z.email("Enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[a-zA-Z]/, "Password must contain at least one letter")
      .regex(/\d/, "Password must contain at least one digit"),
    confirmPassword: z.string().min(1, "Repeat your password"),
    speciality: z.enum(SPECIALITIES, { message: "Pick your speciality" }),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignUpValues = z.infer<typeof signUpSchema>;
