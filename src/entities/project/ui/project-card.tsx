import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { cn } from "@shared/lib/cn";

import type { Project } from "../project.types";
import { ProjectProgress } from "./project-progress";

interface ProjectCardProps {
  project: Project;
  mine?: boolean;
  actions?: ReactNode;
}

export const ProjectCard = ({ project, mine, actions }: ProjectCardProps) => (
  <li
    className={cn(
      "border-border bg-card flex min-w-0 flex-col gap-3 rounded-lg border p-4",
      mine && "border-primary/40 bg-primary/5",
    )}
  >
    <div className="flex flex-wrap items-start gap-3">
      <div className="flex min-w-0 flex-col gap-0.5">
        <h3 className="truncate text-sm font-semibold tracking-tight">
          <Link
            to="/pr/$projectId"
            params={{ projectId: project.id }}
            search={{ tab: "board" as const }}
            className="hover:text-primary transition-colors"
          >
            {project.name}
          </Link>
        </h3>

        <p className="text-muted-foreground flex flex-wrap items-center gap-x-2 font-mono text-[11px] tabular-nums">
          <span>lead @{project.manager.nickname}</span>
          <span>·</span>
          <Link
            to="/t/$teamId"
            params={{ teamId: project.team.id }}
            className="hover:text-primary truncate transition-colors"
          >
            {project.team.name}
          </Link>
          {project.team.companySlug && project.team.companyName ? (
            <>
              <span>·</span>
              <Link
                to="/c/$slug"
                params={{ slug: project.team.companySlug }}
                search={{ tab: "overview" as const }}
                className="hover:text-primary truncate transition-colors"
              >
                {project.team.companyName}
              </Link>
            </>
          ) : null}
        </p>
      </div>

      <div className="ml-auto flex flex-wrap items-center gap-2">{actions}</div>
    </div>

    <ProjectProgress counts={project.counts} />
  </li>
);
