import { z } from "zod";

export const boardSearchSchema = z.object({
  project: z.string().catch("all"),
});
