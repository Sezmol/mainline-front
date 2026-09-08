import { CalendarDotIcon, LockIcon, UsersIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import type { ComponentPropsWithRef, ReactNode } from "react";

import { cn } from "@shared/lib/cn";

import { formatDeadline, isPast } from "../lib/format-deadline";
import type { Post } from "../post.types";

type Task = Extract<Post, { type: "task" }>;

interface TaskCardProps extends ComponentPropsWithRef<"li"> {
  task: Task;
  actions?: ReactNode;
  dragging?: boolean;
  grabbable?: boolean;
}

export const TaskCard = ({
  task,
  actions,
  dragging,
  grabbable,
  className,
  ...props
}: TaskCardProps) => (
  <li
    {...props}
    className={cn(
      "border-border bg-card flex flex-col gap-2 rounded-lg border p-3",
      grabbable && "cursor-grab active:cursor-grabbing",
      dragging && "opacity-40",
      className,
    )}
  >
    <h3 className="text-sm leading-snug font-medium wrap-anywhere">
      <Link
        to="/p/$postId"
        params={{ postId: task.id }}
        className="hover:text-primary transition-colors"
      >
        {task.title}
      </Link>
    </h3>

    <ul className="text-muted-foreground flex flex-wrap gap-x-3 gap-y-1 font-mono text-[11px] tabular-nums">
      {task.deadline ? (
        <li
          className={cn(
            "flex items-center gap-1",
            isPast(task.deadline) && "text-destructive",
          )}
        >
          <CalendarDotIcon className="size-3" />
          {formatDeadline(task.deadline)}
        </li>
      ) : null}

      {task.assignees.length > 0 ? (
        <li className="flex items-center gap-1">
          <UsersIcon className="size-3" />
          {task.assignees.map((user) => `@${user.nickname}`).join(", ")}
        </li>
      ) : null}

      {task.isPrivate ? null : (
        <li className="text-primary-ink flex items-center gap-1">
          <LockIcon className="size-3" />
          Open to anyone
        </li>
      )}
    </ul>

    {actions ? (
      <div className="flex flex-wrap items-center gap-2">{actions}</div>
    ) : null}
  </li>
);
