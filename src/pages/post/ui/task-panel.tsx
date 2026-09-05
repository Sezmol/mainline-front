import { PaperclipIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { AssigneesDialog } from "@features/task/assign";

import type { Post } from "@entities/post";
import { projectQueries } from "@entities/project";
import { sessionQueries } from "@entities/session";

type Task = Extract<Post, { type: "task" }>;

export const TaskPanel = ({ task }: { task: Task }) => {
  const { data: viewer } = useQuery(sessionQueries.current());
  const project = useQuery({
    ...projectQueries.byId(task.projectId ?? ""),
    enabled: task.projectId !== null,
  });

  const isManager = project.data?.manager.id === viewer?.id;

  if (task.attachments.length === 0 && !isManager) return null;

  return (
    <section className="border-border bg-card flex flex-col gap-4 rounded-lg border p-5">
      {isManager && project.data ? (
        <div className="flex flex-wrap items-center gap-2">
          <AssigneesDialog task={task} teamId={project.data.team.id} />
          <Link
            to="/pr/$projectId"
            params={{ projectId: project.data.id }}
            search={{ tab: "board" as const }}
            className="text-muted-foreground hover:text-primary font-mono text-xs transition-colors"
          >
            Open the board
          </Link>
        </div>
      ) : null}

      {task.attachments.length > 0 ? (
        <div className="flex flex-col gap-2">
          <h2 className="text-muted-foreground font-mono text-[11px] tracking-widest uppercase">
            Attachments
          </h2>
          <ul className="flex flex-col gap-1.5">
            {task.attachments.map((url) => (
              <li key={url}>
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-primary-ink hover:text-primary flex items-center gap-2 font-mono text-xs break-all transition-colors"
                >
                  <PaperclipIcon className="size-3.5 shrink-0" />
                  {url}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
};
