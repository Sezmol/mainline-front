import { dayjs } from "@shared/lib/dayjs";

export const projectDates = (value: string | null) =>
  value ? dayjs.utc(value).format("DD MMM YYYY") : null;

export const projectRange = (start: string | null, end: string | null) => {
  const from = projectDates(start);
  const to = projectDates(end);

  if (from && to) return `${from} — ${to}`;
  if (from) return `from ${from}`;
  if (to) return `until ${to}`;
  return null;
};
