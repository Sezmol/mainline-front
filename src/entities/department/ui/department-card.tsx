import type { ReactNode } from "react";

import { cn } from "@shared/lib/cn";
import { countLabel } from "@shared/lib/count-label";

import type { Department } from "../department.types";

interface DepartmentCardProps {
  department: Department;
  mine?: boolean;
  actions?: ReactNode;
}

export const DepartmentCard = ({
  department,
  mine,
  actions,
}: DepartmentCardProps) => (
  <li
    className={cn(
      "border-border bg-card flex min-w-0 flex-wrap items-center gap-3 rounded-lg border p-4",
      mine && "border-primary/40 bg-primary/5",
    )}
  >
    <div className="flex min-w-0 flex-col gap-0.5">
      <h3 className="truncate text-sm font-semibold tracking-tight">
        {department.name}
      </h3>
      <p className="text-muted-foreground font-mono text-[11px] tabular-nums">
        {department.manager
          ? `head @${department.manager.nickname}`
          : "no head"}{" "}
        · {countLabel(department.memberCount, "person", "people")}
      </p>
    </div>

    <div className="ml-auto flex flex-wrap items-center gap-2">{actions}</div>
  </li>
);
