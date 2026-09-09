import { z } from "zod";

export const companiesSearchSchema = z.object({
  q: z.string().trim().min(1).max(100).optional().catch(undefined),
});

export type CompaniesSearch = z.infer<typeof companiesSearchSchema>;
