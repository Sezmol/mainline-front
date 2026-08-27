import { useQuery } from "@tanstack/react-query";

import { DeleteProjectButton } from "@features/project/delete";
import { AddProjectButton, EditProjectButton } from "@features/project/editor";

import { ProjectCard, projectQueries } from "@entities/project";

import { Button } from "@shared/ui/button";

const SKELETON_ROWS = [0, 1];

interface PortfolioSectionProps {
  userId: string;
  owned: boolean;
}

export const PortfolioSection = ({ userId, owned }: PortfolioSectionProps) => {
  const portfolio = useQuery(projectQueries.list(userId));
  return (
    <section className="flex flex-col gap-4">
      <header className="flex items-center justify-between gap-3">
        <h2 className="text-muted-foreground font-mono text-[11px] tracking-widest uppercase">
          Portfolio
          {portfolio.data && portfolio.data.length > 0 ? (
            <span className="ml-2 tabular-nums">{portfolio.data.length}</span>
          ) : null}
        </h2>
        {owned ? <AddProjectButton userId={userId} /> : null}
      </header>

      {portfolio.isPending ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {SKELETON_ROWS.map((row) => (
            <div
              key={row}
              className="border-border bg-card flex flex-col gap-3 rounded-lg border p-4"
            >
              <div className="bg-elevated h-4 w-2/3 animate-pulse rounded" />
              <div className="bg-elevated h-10 w-full animate-pulse rounded" />
            </div>
          ))}
        </div>
      ) : portfolio.isError ? (
        <div className="border-destructive/40 bg-destructive-muted flex flex-col items-start gap-3 rounded-lg border p-5">
          <p className="text-sm">The portfolio could not be loaded.</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void portfolio.refetch()}
          >
            Try again
          </Button>
        </div>
      ) : portfolio.data.length === 0 ? (
        <p className="border-border text-muted-foreground rounded-lg border border-dashed p-10 text-center text-sm">
          {owned
            ? "Nothing here yet. Add the first project and it shows up on your profile."
            : "No projects here yet."}
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {portfolio.data.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              actions={
                owned ? (
                  <>
                    <EditProjectButton project={project} />
                    <DeleteProjectButton project={project} />
                  </>
                ) : undefined
              }
            />
          ))}
        </div>
      )}
    </section>
  );
};
