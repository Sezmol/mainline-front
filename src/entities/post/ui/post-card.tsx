import { type ReactNode, useState } from "react";

import { Link } from "@tanstack/react-router";
import { HeartIcon } from "lucide-react";

import { SPECIALITY_LABELS } from "@shared/config";
import { formatRelativeTime } from "@shared/lib/format-relative-time";
import { Avatar, AvatarFallback } from "@shared/ui/avatar";
import { Badge } from "@shared/ui/badge";
import { Button } from "@shared/ui/button";
import { Markdown } from "@shared/ui/markdown";

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

interface PostCardProps {
  post: Post;
  actions?: ReactNode;
}

export const PostCard = ({ post, actions }: PostCardProps) => {
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

        <time
          dateTime={post.createdAt}
          className="text-muted-foreground ml-auto shrink-0 font-mono text-xs tabular-nums"
        >
          {formatRelativeTime(post.createdAt)}
        </time>
      </header>

      <div className="border-border border-t px-4 py-4 sm:px-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="font-mono text-[11px]">
            {SPECIALITY_LABELS[post.direction]}
          </Badge>
        </div>

        <h2 className="mb-3 text-lg leading-snug font-semibold tracking-tight">
          {post.title}
        </h2>

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

      <footer className="border-border text-muted-foreground flex items-center gap-4 border-t px-4 py-2.5 sm:px-5">
        {actions ?? (
          <span className="flex items-center gap-1.5 font-mono text-xs tabular-nums">
            <HeartIcon
              className={
                post.likedByMe
                  ? "fill-primary text-primary-ink size-4"
                  : "size-4"
              }
            />
            {post.likeCount}
          </span>
        )}
      </footer>
    </article>
  );
};
