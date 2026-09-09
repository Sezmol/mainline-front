import { dayjs } from "@shared/lib/dayjs";

export const formatDeadline = (value: string) =>
  dayjs.utc(value).format("DD MMM YYYY");

export const isPast = (value: string) => dayjs(value).isBefore(dayjs());
