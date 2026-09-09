import { ArrowLeftIcon, ArrowSquareOutIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";

import { DeletePortfolioItemButton } from "@features/portfolio-item/delete";
import { EditPortfolioItemButton } from "@features/portfolio-item/editor";

import { portfolioItemQueries } from "@entities/portfolio-item";
import { sessionQueries } from "@entities/session";

import { SPECIALITY_LABELS } from "@shared/config";
import { formatRelativeTime } from "@shared/lib/format-relative-time";
import { Avatar, AvatarFallback } from "@shared/ui/avatar";
import { ErrorState } from "@shared/ui/error-state";
import { Skeleton } from "@shared/ui/skeleton";

import { portfolioItemRoute } from "../model/portfolio-item-route";

export const PortfolioItemPage = () => {
  const { nickname, itemId } = portfolioItemRoute.useParams();
  const { userId } = portfolioItemRoute.useLoaderData();
  const navigate = useNavigate();

  const item = useQuery(portfolioItemQueries.byId(userId, itemId));
  const { data: viewer } = useQuery(sessionQueries.current());

  if (item.isPending) {
    return (
      <div className="border-border bg-card flex flex-col gap-3 rounded-lg border p-5">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (item.isError) {
    return (
      <ErrorState
        message="This item could not be loaded."
        onRetry={() => void item.refetch()}
      />
    );
  }

  const { author } = item.data;
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
        {item.data.previewUrl ? (
          <img
            src={item.data.previewUrl}
            alt=""
            className="border-border bg-elevated aspect-[16/9] w-full border-b object-cover"
          />
        ) : null}

        <div className="flex flex-col gap-4 px-4 py-5 sm:px-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h1 className="text-xl leading-tight font-semibold tracking-tight wrap-anywhere">
              {item.data.title}
            </h1>

            {owned ? (
              <div className="flex shrink-0 items-center gap-1">
                <EditPortfolioItemButton item={item.data} />
                <DeletePortfolioItemButton
                  item={item.data}
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

          {item.data.description ? (
            <p className="text-body text-sm leading-relaxed whitespace-pre-wrap">
              {item.data.description}
            </p>
          ) : null}

          {item.data.links.length > 0 ? (
            <ul className="flex flex-col gap-1.5">
              {item.data.links.map((link) => (
                <li key={link}>
                  <a
                    href={link}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-primary-ink inline-flex max-w-full items-center gap-1.5 font-mono text-xs underline underline-offset-4"
                  >
                    <ArrowSquareOutIcon className="size-3 shrink-0" />
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
            dateTime={item.data.createdAt}
            className="text-muted-foreground ml-auto shrink-0 font-mono text-xs tabular-nums"
          >
            {formatRelativeTime(item.data.createdAt)}
          </time>
        </footer>
      </article>
    </div>
  );
};
