import { dayjs } from "@shared/lib/dayjs";

export const formatRelativeTime = (iso: string) => {
  const date = dayjs(iso);

  return dayjs().diff(date, "week") >= 1
    ? date.format("D MMM")
    : date.fromNow();
};
