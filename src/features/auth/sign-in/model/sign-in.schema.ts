import { z } from 'zod';

export const signInSchema = z.object({
  nickname: z.string().trim().min(1, 'Enter your nickname'),
  password: z.string().min(1, 'Enter your password'),
});

export type SignInValues = z.infer<typeof signInSchema>;
