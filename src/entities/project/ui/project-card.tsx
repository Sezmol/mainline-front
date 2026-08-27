import { Link } from "@tanstack/react-router";
import { LinkIcon } from "lucide-react";
import type { ReactNode } from "react";

import type { Project } from "../project.types";

interface ProjectCardProps {
  project: Project;
  actions?: ReactNode;
}

export const ProjectCard = ({ project, actions }: ProjectCardProps) => (
  <article className="border-border bg-card flex flex-col overflow-hidden rounded-lg border">
    {project.previewUrl ? (
      <img
        src={project.previewUrl}
        alt=""
        loading="lazy"
        className="border-border bg-elevated aspect-[16/9] w-full border-b object-cover"
      />
    ) : null}
    <div className="flex flex-1 flex-col gap-2 px-4 py-3.5">
      <h3 className="text-sm leading-snug font-semibold tracking-tight">
        <Link
          to="/u/$nickname/projects/$projectId"
          params={{
            nickname: project.author.nickname,
            projectId: project.id,
          }}
          className="hover:text-primary-ink transition-colors"
        >
          {project.title}
        </Link>
      </h3>

      {project.description ? (
        <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
          {project.description}
        </p>
      ) : null}

      {project.links.length > 0 ? (
        <p className="text-muted-foreground mt-auto inline-flex items-center gap-1.5 pt-1 font-mono text-[11px] tabular-nums">
          <LinkIcon className="size-3" />
          {project.links.length}
        </p>
      ) : null}
    </div>

    {actions ? (
      <footer className="border-border flex items-center gap-1 border-t px-3 py-2">
        {actions}
      </footer>
    ) : null}
  </article>
);
