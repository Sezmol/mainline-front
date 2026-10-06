import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { CreatePostButton } from "@features/post/editor";
import { useMoveTask } from "@features/task/move";

import { type FeedFilters, TaskCard, useBoardTasks } from "@entities/post";
import {
  projectQueries,
  TaskBoard,
  TaskBoardSkeleton,
} from "@entities/project";

import { DEFAULT_COLUMNS } from "@shared/config";
import { cn } from "@shared/lib/cn";
import { ErrorState } from "@shared/ui/error-state";

import { boardRoute } from "../model/board-route";

const ALL = "all";
const NONE = "none";

const VIRTUAL_COLUMNS = DEFAULT_COLUMNS.map((column) => ({
  id: column.name,
  name: column.name,
  kind: column.kind,
  position: 0,
}));

const columnsFor = (tasks: { status: string }[]) => {
  const named = new Set<string>(VIRTUAL_COLUMNS.map((column) => column.name));
  const rest = [...new Set(tasks.map((task) => task.status))].filter(
    (status) => !named.has(status),
  );

  return [
    ...VIRTUAL_COLUMNS,
    ...rest.map((name) => ({
      id: name,
      name,
      kind: "doing" as const,
      position: 0,
    })),
  ];
};

const filtersFor = (project: string): FeedFilters => {
  if (project === ALL) return { scope: "mine" };
  if (project === NONE) return { scope: "none" };
  return { projectId: project };
};

export const BoardPage = () => {
  const { project } = boardRoute.useSearch();

  const projects = useQuery(projectQueries.mine());
  const oneProject = project !== ALL && project !== NONE;
  const columns = useQuery({
    ...projectQueries.columns(project),
    enabled: oneProject,
  });

  const board = useBoardTasks(filtersFor(project));
  const move = useMoveTask();

  const named = projects.data?.find((item) => item.id === project);

  const boardColumns = oneProject
    ? (columns.data ?? [])
    : columnsFor(board.tasks);

  const subtitle = () => {
    if (project === ALL) return "Every task you author or work on.";
    if (project === NONE) return "Tasks that belong to no project yet.";
    return named?.name ?? "This project";
  };

  const renderBoard = () => {
    if (board.isPending || (oneProject && columns.isPending)) {
      return <TaskBoardSkeleton />;
    }

    if (board.isError) {
      return (
        <ErrorState
          message="The board could not be loaded."
          onRetry={() => void board.refetch()}
        />
      );
    }

    return (
      <TaskBoard
        columns={boardColumns}
        tasks={board.tasks}
        onMove={(taskId, status) =>
          move.mutateAsync({
            taskId,
            status,
            projectId: oneProject ? project : null,
          })
        }
        renderCard={(task, drag) => (
          <TaskCard key={task.id} task={task} {...drag} />
        )}
        empty={
          <p className="border-border text-muted-foreground mt-4 rounded-lg border border-dashed p-10 text-center text-sm">
            Nothing here yet.
          </p>
        }
      />
    );
  };

  const tabs = [
    { id: ALL, label: "Everything" },
    { id: NONE, label: "No project" },
    ...(projects.data ?? []).map((item) => ({
      id: item.id,
      label: item.name,
    })),
  ];

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-muted-foreground font-mono text-[11px] tracking-widest uppercase">
            Board
          </h1>
          <p className="text-body text-sm">{subtitle()}</p>
        </div>

        <CreatePostButton
          label="New task"
          defaults={{
            type: "task",
            ...(project !== ALL && project !== NONE
              ? { projectId: project }
              : {}),
          }}
        />
      </header>

      <nav className="border-border flex flex-wrap gap-1 border-b pb-2">
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            to="/board"
            search={{ project: tab.id }}
            className={cn(
              "rounded-md px-2.5 py-1.5 font-mono text-xs tracking-wide transition-colors",
              project === tab.id
                ? "text-foreground bg-elevated"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      {renderBoard()}
    </div>
  );
};
