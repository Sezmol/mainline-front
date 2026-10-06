import {
  AddColumnButton,
  ColumnMenu,
  useReorderColumns,
} from "@features/board/columns";
import { CreatePostButton } from "@features/post/editor";
import { AssigneesDialog } from "@features/task/assign";
import { useMoveTask } from "@features/task/move";

import { TaskCard, useBoardTasks } from "@entities/post";
import { type BoardColumn, type Project, TaskBoard } from "@entities/project";

import { ErrorState } from "@shared/ui/error-state";

interface ProjectBoardProps {
  project: Project;
  columns: BoardColumn[];
  canManage: boolean;
  canWrite: boolean;
}

export const ProjectBoard = ({
  project,
  columns,
  canManage,
  canWrite,
}: ProjectBoardProps) => {
  const board = useBoardTasks({ projectId: project.id });
  const move = useMoveTask();
  const reorder = useReorderColumns(project.id);

  if (board.isError) {
    return (
      <ErrorState
        message="The board could not be loaded."
        onRetry={() => void board.refetch()}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        {canWrite ? (
          <CreatePostButton
            label="New task"
            defaults={{ type: "task", projectId: project.id }}
          />
        ) : null}
        {canManage ? <AddColumnButton projectId={project.id} /> : null}
      </div>

      <TaskBoard
        columns={columns}
        tasks={board.tasks}
        onMove={(taskId, status) =>
          move.mutateAsync({ taskId, status, projectId: project.id })
        }
        onReorder={canManage ? (ids) => reorder.mutate(ids) : undefined}
        renderColumnActions={
          canManage
            ? (column) => (
                <ColumnMenu
                  projectId={project.id}
                  column={column}
                  columns={columns}
                />
              )
            : undefined
        }
        renderCard={(task, drag) => (
          <TaskCard
            key={task.id}
            task={task}
            {...drag}
            actions={
              canManage ? (
                <AssigneesDialog task={task} teamId={project.team.id} />
              ) : null
            }
          />
        )}
        empty={
          <p className="border-border text-muted-foreground mt-4 rounded-lg border border-dashed p-10 text-center text-sm">
            No tasks yet.
          </p>
        }
      />
    </div>
  );
};
