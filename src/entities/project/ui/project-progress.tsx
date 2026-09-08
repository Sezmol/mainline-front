import { cn } from "@shared/lib/cn";

import type { TaskCounts } from "../project.types";

interface ProjectProgressProps {
  counts: TaskCounts;
  className?: string;
  compact?: boolean;
}

const share = (part: number, total: number) =>
  total === 0 ? 0 : Math.round((part / total) * 100);

export const ProjectProgress = ({
  counts,
  className,
  compact,
}: ProjectProgressProps) => {
  const done = share(counts.done, counts.total);
  const doing = share(counts.doing, counts.total);

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div
        className="bg-elevated flex h-1.5 overflow-hidden rounded-full"
        role="img"
        aria-label={`${counts.done} of ${counts.total} tasks done`}
      >
        <span className="bg-primary h-full" style={{ width: `${done}%` }} />
        <span className="bg-primary/35 h-full" style={{ width: `${doing}%` }} />
      </div>

      {compact ? (
        <p className="text-muted-foreground font-mono text-[11px] tabular-nums">
          {counts.done}/{counts.total} done
        </p>
      ) : (
        <p className="text-muted-foreground flex flex-wrap gap-x-2 font-mono text-[11px] tabular-nums">
          <span>{counts.total} total</span>
          <span>·</span>
          <span>{counts.doing} in progress</span>
          <span>·</span>
          <span className="text-primary-ink">{counts.done} done</span>
        </p>
      )}
    </div>
  );
};
