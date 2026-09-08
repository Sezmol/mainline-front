import { ChatIcon, PaperclipIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { DeleteProjectButton } from "@features/project/delete";
import { EditProjectButton } from "@features/project/editor";

import { useDockStore } from "@entities/chat";
import {
  ProjectProgress,
  projectQueries,
  projectRange,
} from "@entities/project";
import { sessionQueries } from "@entities/session";

import { cn } from "@shared/lib/cn";
import { Button } from "@shared/ui/button";
import { ErrorState } from "@shared/ui/error-state";
import { Markdown } from "@shared/ui/markdown";

import { projectRoute } from "../model/project-route";
import { PROJECT_TABS } from "../model/project-search";
import { ProjectBoard } from "./project-board";
import { ProjectPageSkeleton } from "./project-page-skeleton";

const TAB_LABELS = { board: "Board", about: "About" } as const;

export const ProjectPage = () => {
  const { projectId } = projectRoute.useParams();
  const { tab } = projectRoute.useSearch();

  const project = useQuery(projectQueries.byId(projectId));
  const columns = useQuery(projectQueries.columns(projectId));
  const { data: session } = useQuery(sessionQueries.current());

  if (project.isPending) {
    return <ProjectPageSkeleton />;
  }

  if (project.isError) {
    return (
      <ErrorState
        message="This project could not be loaded."
        onRetry={() => void project.refetch()}
      />
    );
  }

  const isManager = project.data.manager.id === session?.id;
  const canWrite = isManager || project.data.membersCanEditTasks;
  const range = projectRange(project.data.startDate, project.data.endDate);
  const { chatId } = project.data;

  return (
    <div className="flex flex-col gap-6">
      <header className="border-border bg-card flex flex-col gap-4 rounded-lg border p-5">
        <div className="flex flex-wrap items-start gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            <h1 className="text-lg font-semibold tracking-tight wrap-anywhere">
              {project.data.name}
            </h1>

            <p className="text-muted-foreground flex flex-wrap items-center gap-x-2 font-mono text-[11px] tabular-nums">
              <span>lead @{project.data.manager.nickname}</span>
              <span>·</span>
              <Link
                to="/t/$teamId"
                params={{ teamId: project.data.team.id }}
                className="hover:text-primary transition-colors"
              >
                {project.data.team.name}
              </Link>
              {project.data.team.companySlug &&
              project.data.team.companyName ? (
                <>
                  <span>·</span>
                  <Link
                    to="/c/$slug"
                    params={{ slug: project.data.team.companySlug }}
                    search={{ tab: "overview" as const }}
                    className="hover:text-primary transition-colors"
                  >
                    {project.data.team.companyName}
                  </Link>
                </>
              ) : null}
              {range ? (
                <>
                  <span>·</span>
                  <span>{range}</span>
                </>
              ) : null}
            </p>
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            {chatId ? (
              <Button
                variant="outline"
                size="sm"
                className="font-mono text-xs"
                onClick={() => useDockStore.getState().openChat(chatId)}
              >
                <ChatIcon className="size-3.5" />
                Chat
              </Button>
            ) : null}

            {isManager ? (
              <>
                <EditProjectButton project={project.data} />
                <DeleteProjectButton project={project.data} />
              </>
            ) : null}
          </div>
        </div>

        <ProjectProgress counts={project.data.counts} />
      </header>

      <nav className="border-border flex flex-wrap gap-1 border-b pb-2">
        {PROJECT_TABS.map((id) => (
          <Link
            key={id}
            to="/pr/$projectId"
            params={{ projectId }}
            search={{ tab: id }}
            className={cn(
              "rounded-md px-2.5 py-1.5 font-mono text-xs tracking-wide transition-colors",
              tab === id
                ? "text-foreground bg-elevated"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {TAB_LABELS[id]}
          </Link>
        ))}
      </nav>

      {tab === "board" ? (
        <ProjectBoard
          project={project.data}
          columns={columns.data ?? []}
          canManage={isManager}
          canWrite={canWrite}
        />
      ) : (
        <section className="flex max-w-3xl flex-col gap-4">
          {project.data.description ? (
            <Markdown>{project.data.description}</Markdown>
          ) : (
            <p className="text-muted-foreground text-sm">No description yet.</p>
          )}

          {project.data.attachments.length > 0 ? (
            <div className="flex flex-col gap-2">
              <h2 className="text-muted-foreground font-mono text-[11px] tracking-widest uppercase">
                Attachments
              </h2>
              <ul className="flex flex-col gap-1.5">
                {project.data.attachments.map((url) => (
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
      )}
    </div>
  );
};
