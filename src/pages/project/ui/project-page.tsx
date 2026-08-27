import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeftIcon, ExternalLinkIcon } from "lucide-react";

import { DeleteProjectButton } from "@features/project/delete";
import { EditProjectButton } from "@features/project/editor";

import { projectQueries } from "@entities/project";
import { sessionQueries } from "@entities/session";

import { SPECIALITY_LABELS } from "@shared/config";
import { formatRelativeTime } from "@shared/lib/format-relative-time";
import { Avatar, AvatarFallback } from "@shared/ui/avatar";
import { Button } from "@shared/ui/button";

import { projectRoute } from "../model/project-route";

export const ProjectPage = () => {
  const { nickname, projectId } = projectRoute.useParams();
  const { userId } = projectRoute.useLoaderData();
  const navigate = useNavigate();

  const project = useQuery(projectQueries.byId(userId, projectId));
  const { data: viewer } = useQuery(sessionQueries.current());

  if (project.isPending) {
    return (
      <div className="border-border bg-card flex flex-col gap-3 rounded-lg border p-5">
        <div className="bg-elevated h-6 w-2/3 animate-pulse rounded" />
        <div className="bg-elevated h-32 w-full animate-pulse rounded" />
      </div>
    );
  }

  if (project.isError) {
    return (
      <div className="border-destructive/40 bg-destructive-muted flex flex-col items-start gap-3 rounded-lg border p-5">
        <p className="text-sm">This project could not be loaded.</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void project.refetch()}
        >
          Try again
        </Button>
      </div>
    );
  }

  const { author } = project.data;
  const owned = viewer?.id === author.id;

  return (
    <div className="flex flex-col gap-6">
      <Link
        to="/u/$nickname"
        params={{ nickname }}
        className="text-muted-foreground hover:text-foreground inline-flex w-fit items-center gap-1.5 font-mono text-xs transition-colors"
      >
        <ArrowLeftIcon className="size-3.5" />@{nickname}
      </Link>

      <article className="border-border bg-card overflow-hidden rounded-lg border">
        {project.data.previewUrl ? (
          <img
            src={project.data.previewUrl}
            alt=""
            className="border-border bg-elevated aspect-[16/9] w-full border-b object-cover"
          />
        ) : null}

        <div className="flex flex-col gap-4 px-4 py-5 sm:px-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h1 className="text-xl leading-tight font-semibold tracking-tight">
              {project.data.title}
            </h1>

            {owned ? (
              <div className="flex shrink-0 items-center gap-1">
                <EditProjectButton project={project.data} />
                <DeleteProjectButton
                  project={project.data}
                  onDeleted={() =>
                    void navigate({
                      to: "/u/$nickname",
                      params: { nickname },
                      replace: true,
                    })
                  }
                />
              </div>
            ) : null}
          </div>

          {project.data.description ? (
            <p className="text-body text-sm leading-relaxed whitespace-pre-wrap">
              {project.data.description}
            </p>
          ) : null}
          {project.data.links.length > 0 ? (
            <ul className="flex flex-col gap-1.5">
              {project.data.links.map((link) => (
                <li key={link}>
                  <a
                    href={link}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-primary-ink inline-flex max-w-full items-center gap-1.5 font-mono text-xs underline underline-offset-4"
                  >
                    <ExternalLinkIcon className="size-3 shrink-0" />
                    <span className="truncate">{link}</span>
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <footer className="border-border flex flex-wrap items-center gap-3 border-t px-4 py-3 sm:px-5">
          <Link
            to="/u/$nickname"
            params={{ nickname: author.nickname }}
            className="flex min-w-0 items-center gap-3"
          >
            <Avatar className="size-8 shrink-0">
              <AvatarFallback className="font-mono text-[10px]">
                {author.firstName[0]}
                {author.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium">
                {author.firstName} {author.lastName}
              </span>
              <span className="text-muted-foreground block truncate font-mono text-xs">
                {SPECIALITY_LABELS[author.speciality]}
              </span>
            </span>
          </Link>

          <time
            dateTime={project.data.createdAt}
            className="text-muted-foreground ml-auto shrink-0 font-mono text-xs tabular-nums"
          >
            {formatRelativeTime(project.data.createdAt)}
          </time>
        </footer>
      </article>
    </div>
  );
};
