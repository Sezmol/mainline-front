import { z } from "zod";

export const PROJECT_TABS = ["board", "about"] as const;

export const projectSearchSchema = z.object({
  tab: z.enum(PROJECT_TABS).catch("board"),
});

export type ProjectTab = (typeof PROJECT_TABS)[number];
