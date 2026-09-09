import { z } from "zod";

export const COMPANY_TABS = [
  "overview",
  "posts",
  "people",
  "structure",
] as const;

export const MEMBER_TABS = new Set<CompanyTab>(["people", "structure"]);

export const companySearchSchema = z.object({
  tab: z.enum(COMPANY_TABS).catch("overview"),
  openRoles: z.boolean().optional().catch(undefined),
});

export type CompanyTab = (typeof COMPANY_TABS)[number];
