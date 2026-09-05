import { type ReactNode, useState } from "react";

import {
  BriefcaseIcon,
  CalendarDotIcon,
  HeartIcon,
  KanbanIcon,
  LockIcon,
  MapPinIcon,
  MoneyIcon,
  UserIcon,
  UsersIcon,
} from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";

import {
  POST_TYPE_LABELS,
  SPECIALITY_LABELS,
  WORK_FORMAT_LABELS,
} from "@shared/config";
import { formatRelativeTime } from "@shared/lib/format-relative-time";
import { Avatar, AvatarFallback } from "@shared/ui/avatar";
import { Badge } from "@shared/ui/badge";
import { Button } from "@shared/ui/button";
import { Markdown } from "@shared/ui/markdown";

import { formatDeadline } from "../lib/format-deadline";
import type { Post } from "../post.types";

const PREVIEW_LIMIT = 500;

const closeDanglingFence = (text: string) => {
  const fences = text.match(/^```/gm)?.length ?? 0;
  return fences % 2 === 0 ? text : `${text}\n\`\`\``;
};

const toPreview = (body: string) => {
  const cut = body.slice(0, PREVIEW_LIMIT);
  const lastSpace = cut.lastIndexOf(" ");

  return closeDanglingFence(
    `${cut.slice(0, lastSpace > 0 ? lastSpace : PREVIEW_LIMIT).trimEnd()}…`,
  );
};

const salaryFormat = new Intl.NumberFormat("en-US");

const toSalaryRange = (min: number | null, max: number | null) => {
  if (min !== null && max !== null) {
    return `${salaryFormat.format(min)} – ${salaryFormat.format(max)}`;
  }
  if (min !== null) return `from ${salaryFormat.format(min)}`;
  if (max !== null) return `up to ${salaryFormat.format(max)}`;
  return null;
};

const Facts = ({ children }: { children: ReactNode }) => (
  <ul className="text-muted-foreground mb-3 flex flex-wrap gap-x-4 gap-y-1.5 font-mono text-xs">
    {children}
  </ul>
);

const Fact = ({ icon, children }: { icon: ReactNode; children: ReactNode }) => (
  <li className="flex items-center gap-1.5">
    {icon}
    <span className="tabular-nums">{children}</span>
  </li>
);

const PostFacts = ({ post }: { post: Post }) => {
  if (post.type === "vacancy") {
    const salary = toSalaryRange(post.salaryMin, post.salaryMax);

    return (
      <Facts>
        <Fact icon={<BriefcaseIcon className="size-3.5" />}>
          {WORK_FORMAT_LABELS[post.workFormat]}
        </Fact>
        {post.location ? (
          <Fact icon={<MapPinIcon className="size-3.5" />}>
            {post.location}
          </Fact>
        ) : null}
        {salary ? (
          <Fact icon={<MoneyIcon className="size-3.5" />}>{salary}</Fact>
        ) : null}
      </Facts>
    );
  }

  if (post.type === "event") {
    return (
      <Facts>
        {post.location ? (
          <Fact icon={<MapPinIcon className="size-3.5" />}>
            {post.location}
          </Fact>
        ) : null}
        {post.isPrivate ? (
          <Fact icon={<LockIcon className="size-3.5" />}>By invitation</Fact>
        ) : (
          <Fact icon={<UsersIcon className="size-3.5" />}>
            {post.participantLimit
              ? `${post.acceptedCount + 1} / ${post.participantLimit} seats`
              : "Open to everyone"}
          </Fact>
        )}
      </Facts>
    );
  }

  if (post.type === "task") {
    return (
      <Facts>
        <Fact icon={<KanbanIcon className="size-3.5" />}>{post.status}</Fact>
        {post.project ? (
          <Fact icon={<KanbanIcon className="size-3.5" />}>
            <Link
              to="/pr/$projectId"
              params={{ projectId: post.project.id }}
              search={{ tab: "board" as const }}
              className="hover:text-primary transition-colors"
            >
              {post.project.name}
            </Link>
          </Fact>
        ) : null}
        {post.deadline ? (
          <Fact icon={<CalendarDotIcon className="size-3.5" />}>
            {formatDeadline(post.deadline)}
          </Fact>
        ) : null}
        {post.assignees.length > 0 ? (
          <Fact icon={<UserIcon className="size-3.5" />}>
            {post.assignees.map((user) => `@${user.nickname}`).join(", ")}
          </Fact>
        ) : (
          <Fact icon={<UserIcon className="size-3.5" />}>Nobody yet</Fact>
        )}
        {post.isPrivate ? (
          <Fact icon={<LockIcon className="size-3.5" />}>Private</Fact>
        ) : null}
      </Facts>
    );
  }

  return null;
};

interface PostCardProps {
  post: Post;
  actions?: ReactNode;
  interaction?: ReactNode;
}

export const PostCard = ({ post, actions, interaction }: PostCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const expandable = post.body.length > PREVIEW_LIMIT;
  const body = expandable && !expanded ? toPreview(post.body) : post.body;

  return (
    <article className="border-border bg-card rounded-lg border">
      <header className="flex items-center gap-3 px-4 py-3 sm:px-5">
        <Link
          to="/u/$nickname"
          params={{ nickname: post.author.nickname }}
          className="group/author flex min-w-0 items-center gap-3"
        >
          <Avatar className="size-9 shrink-0">
            <AvatarFallback className="font-mono text-[11px]">
              {post.author.firstName[0]}
              {post.author.lastName[0]}
            </AvatarFallback>
          </Avatar>

          <span className="min-w-0">
            <span className="group-hover/author:text-primary-ink block truncate text-sm font-medium transition-colors">
              {post.author.firstName} {post.author.lastName}
            </span>
            <span className="text-muted-foreground block truncate font-mono text-xs">
              @{post.author.nickname}
            </span>
          </span>
        </Link>

        {post.company ? (
          <Link
            to="/c/$slug"
            params={{ slug: post.company.slug }}
            search={{ tab: "overview" as const }}
            className="border-border text-muted-foreground hover:text-primary hover:border-primary/40 min-w-0 shrink rounded-md border px-2 py-1 font-mono text-[11px] transition-colors"
          >
            <span className="block truncate">{post.company.name}</span>
          </Link>
        ) : null}

        <time
          dateTime={post.createdAt}
          className="text-muted-foreground ml-auto shrink-0 font-mono text-xs tabular-nums"
        >
          {formatRelativeTime(post.createdAt)}
        </time>
      </header>

      <div className="border-border border-t px-4 py-4 sm:px-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {post.type === "content" ? null : (
            <Badge variant="outline" className="font-mono text-[11px]">
              {POST_TYPE_LABELS[post.type]}
            </Badge>
          )}
          <Badge variant="secondary" className="font-mono text-[11px]">
            {SPECIALITY_LABELS[post.direction]}
          </Badge>
        </div>

        <h2 className="mb-3 text-lg leading-snug font-semibold tracking-tight wrap-anywhere">
          {post.title}
        </h2>

        <PostFacts post={post} />

        <Markdown>{body}</Markdown>

        {expandable ? (
          <Button
            variant="ghost"
            size="sm"
            className="mt-3 -ml-2 font-mono text-xs"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "Collapse" : "Expand"}
          </Button>
        ) : null}
      </div>

      {interaction}

      <footer className="border-border text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 border-t px-4 py-2.5 sm:px-5">
        {actions ?? (
          <span className="flex items-center gap-1.5 font-mono text-xs tabular-nums">
            <HeartIcon
              weight={post.likedByMe ? "fill" : "regular"}
              className={post.likedByMe ? "text-primary size-4" : "size-4"}
            />
            {post.likeCount}
          </span>
        )}
      </footer>
    </article>
  );
};
