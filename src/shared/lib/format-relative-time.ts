const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
const absolute = new Intl.DateTimeFormat("en", {
  day: "numeric",
  month: "short",
});

export const formatRelativeTime = (iso: string) => {
  const elapsed = Date.now() - new Date(iso).getTime();
  if (elapsed >= WEEK) return absolute.format(new Date(iso));
  if (elapsed >= DAY)
    return formatter.format(-Math.floor(elapsed / DAY), "day");
  if (elapsed >= HOUR)
    return formatter.format(-Math.floor(elapsed / HOUR), "hour");
  if (elapsed >= MINUTE)
    return formatter.format(-Math.floor(elapsed / MINUTE), "minute");

  return "just now";
};
