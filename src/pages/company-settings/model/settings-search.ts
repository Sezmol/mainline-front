import { z } from "zod";

export const SETTINGS_TABS = [
  "profile",
  "people",
  "departments",
  "teams",
] as const;

export const settingsSearchSchema = z.object({
  tab: z.enum(SETTINGS_TABS).catch("profile"),
});

export type SettingsTab = (typeof SETTINGS_TABS)[number];
