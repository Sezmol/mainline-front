import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { cn } from "@shared/lib/cn";
import { dayjs } from "@shared/lib/dayjs";
import { Markdown } from "@shared/ui/markdown";

import type { Message } from "../chat.types";

interface ChatMessageProps {
  message: Message;
  mine: boolean;
  pending?: boolean;
  attachment?: ReactNode;
  actions?: ReactNode;
}

export const ChatMessage = ({
  message,
  mine,
  pending,
  attachment,
  actions,
}: ChatMessageProps) => (
  <article
    className={cn(
      "flex flex-col gap-1 py-1.5",
      mine ? "items-end" : "items-start",
    )}
  >
    <div
      className={cn(
        "max-w-[85%] min-w-0 rounded-lg border px-3 py-2",
        mine ? "border-primary/30 bg-primary/10" : "border-border bg-card",
        pending && "opacity-60",
      )}
    >
      {mine ? null : (
        <Link
          to="/u/$nickname"
          params={{ nickname: message.author.nickname }}
          className="hover:text-primary-ink text-muted-foreground mb-1 block font-mono text-[11px] transition-colors"
        >
          @{message.author.nickname}
        </Link>
      )}

      {message.body ? <Markdown>{message.body}</Markdown> : null}

      {attachment ? <div className="mt-2">{attachment}</div> : null}
    </div>

    <div className="flex items-center gap-1">
      <time
        dateTime={message.createdAt}
        className="text-muted-foreground px-1 font-mono text-[10px] tabular-nums"
      >
        {pending ? "sending…" : dayjs(message.createdAt).format("HH:mm")}
      </time>

      {actions}
    </div>
  </article>
);
