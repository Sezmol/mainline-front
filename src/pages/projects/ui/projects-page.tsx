import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { CreateProjectButton } from "@features/project/editor";

import { ProjectCard, projectQueries } from "@entities/project";
import { sessionQueries } from "@entities/session";

import { ErrorState } from "@shared/ui/error-state";
import { Skeleton } from "@shared/ui/skeleton";

const SKELETON_ROWS = [0, 1, 2];

const ProjectSkeleton = () => (
  <li className="border-border bg-card flex flex-col gap-3 rounded-lg border p-4">
    <Skeleton className="h-4 w-40" />
    <Skeleton className="h-3 w-24" />
    <Skeleton className="h-1.5 w-full rounded-full" />
  </li>
);

export const ProjectsPage = () => {
  const projects = useQuery(projectQueries.mine());
  const { data: session } = useQuery(sessionQueries.current());

  const renderProjects = () => {
    if (projects.isPending) {
      return (
        <ul className="grid gap-3 sm:grid-cols-2">
          {SKELETON_ROWS.map((row) => (
            <ProjectSkeleton key={row} />
          ))}
        </ul>
      );
    }

    if (projects.isError) {
      return (
        <ErrorState
          message="Projects could not be loaded."
          onRetry={() => void projects.refetch()}
        />
      );
    }

    if (projects.data.length === 0) {
      return (
        <p className="border-border text-muted-foreground rounded-lg border border-dashed p-10 text-center text-sm">
          No projects yet. A project needs a team — create one, then start a
          project in it.
        </p>
      );
    }

    return (
      <ul className="grid gap-3 sm:grid-cols-2">
        {projects.data.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            mine={project.manager.id === session?.id}
          />
        ))}
      </ul>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-muted-foreground font-mono text-[11px] tracking-widest uppercase">
            Projects
          </h1>
          <p className="text-body text-sm">
            Everything the teams you are in are working on.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/board"
            search={{ project: "all" as const }}
            className="border-border hover:border-primary/50 inline-flex h-7 items-center rounded-lg border px-2.5 font-mono text-[0.8rem] transition-colors"
          >
            Open the board
          </Link>
          <CreateProjectButton />
        </div>
      </header>

      {renderProjects()}
    </div>
  );
};
