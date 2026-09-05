import { dayjs } from "@shared/lib/dayjs";
import { Separator } from "@shared/ui/separator";

const label = (value: string) => {
  const date = dayjs(value);

  if (date.isToday()) return "Today";
  if (date.isYesterday()) return "Yesterday";

  return date.format("D MMM YYYY");
};

export const DaySeparator = ({ date }: { date: string }) => (
  <div className="flex items-center gap-3 py-3">
    <Separator className="flex-1" />
    <span className="text-muted-foreground font-mono text-[10px] tracking-wide uppercase">
      {label(date)}
    </span>
    <Separator className="flex-1" />
  </div>
);
