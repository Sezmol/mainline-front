import { TaskBoardSkeleton } from "@entities/project";

import { Skeleton } from "@shared/ui/skeleton";

import { projectRoute } from "../model/project-route";

export const ProjectPageSkeleton = () => {
  const { tab } = projectRoute.useSearch();

  return (
    <div className="flex flex-col gap-6" role="status">
      <span className="sr-only">Loading the project</span>

      <header className="border-border bg-card flex flex-col gap-4 rounded-lg border p-5">
        <div className="flex flex-col gap-1">
          <Skeleton className="h-7 w-56 max-w-full" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>

        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-1.5 w-full rounded-full" />
          <Skeleton className="h-4 w-44 max-w-full" />
        </div>
      </header>

      <nav className="border-border flex gap-1 border-b pb-2">
        <Skeleton className="h-7 w-16" />
        <Skeleton className="h-7 w-16" />
      </nav>

      {tab === "board" ? (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-7 w-24" />
            <Skeleton className="h-7 w-20" />
          </div>

          <TaskBoardSkeleton />
        </div>
      ) : (
        <section className="flex max-w-3xl flex-col gap-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </section>
      )}
    </div>
  );
};
