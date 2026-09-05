import { Link } from "@tanstack/react-router";

import { DeleteMessageButton } from "@features/chat/delete-message";

import { isPending, type Message } from "@entities/chat";

import { cn } from "@shared/lib/cn";
import { formatRelativeTime } from "@shared/lib/format-relative-time";
import { Avatar, AvatarFallback } from "@shared/ui/avatar";
import { Markdown } from "@shared/ui/markdown";

interface CommentItemProps {
  comment: Message;
  mine: boolean;
}

export const CommentItem = ({ comment, mine }: CommentItemProps) => {
  const pending = isPending(comment);

  return (
    <article
      className={cn(
        "border-border flex gap-3 border-t py-4 first:border-t-0",
        pending && "opacity-60",
      )}
    >
      <Avatar className="mt-0.5 size-7 shrink-0">
        <AvatarFallback className="font-mono text-[10px]">
          {comment.author.firstName[0]}
          {comment.author.lastName[0]}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <Link
            to="/u/$nickname"
            params={{ nickname: comment.author.nickname }}
            className="hover:text-primary-ink truncate font-mono text-xs transition-colors"
          >
            @{comment.author.nickname}
          </Link>

          <time
            dateTime={comment.createdAt}
            className="text-muted-foreground shrink-0 font-mono text-[11px] tabular-nums"
          >
            {pending ? "sending…" : formatRelativeTime(comment.createdAt)}
          </time>

          {mine && !pending ? (
            <span className="-my-1 ml-auto">
              <DeleteMessageButton message={comment} />
            </span>
          ) : null}
        </div>

        <Markdown>{comment.body}</Markdown>
      </div>
    </article>
  );
};
