import type { NotificationPageDtoOutput } from "@shared/api";

export type NotificationPage = NotificationPageDtoOutput;

export type Notification = NotificationPage["items"][number];
