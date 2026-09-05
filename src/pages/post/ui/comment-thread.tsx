import { type ReactNode, useEffect, useRef } from "react";

import { ChatIcon } from "@phosphor-icons/react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import { useMarkRead } from "@features/chat/read";
import { useCommentChat } from "@features/post/comment";

import { chatQueries, isPending } from "@entities/chat";
import type { Post } from "@entities/post";
import { sessionQueries } from "@entities/session";

import { Button } from "@shared/ui/button";
import { ErrorState } from "@shared/ui/error-state";
import { Spinner } from "@shared/ui/spinner";

import { CommentComposer } from "./comment-composer";
import { CommentItem } from "./comment-item";

const EMPTY = "Nothing has been said about this post yet.";

const Note = ({ children }: { children: ReactNode }) => (
  <p className="text-muted-foreground py-6 text-center font-mono text-xs">
    {children}
  </p>
);

const CommentList = ({ chatId }: { chatId: string }) => {
  const { data: viewer } = useQuery(sessionQueries.current());
  const query = useInfiniteQuery(chatQueries.messages(chatId));
  const markRead = useMarkRead(chatId);

  const chats = useInfiniteQuery(chatQueries.list());
  const unread =
    chats.data?.pages
      .flatMap((page) => page.items)
      .find((item) => item.chat.id === chatId)?.unreadCount ?? 0;

  const marked = useRef<string | null>(null);

  const comments = (
    query.data?.pages.flatMap((page) => page.items) ?? []
  ).toReversed();

  const newest = comments.at(-1);

  useEffect(() => {
    if (!newest || isPending(newest) || unread === 0) return;
    if (marked.current === newest.id) return;

    marked.current = newest.id;
    markRead.mutate(newest.id);
  }, [markRead, newest, unread]);

  if (query.isPending) return <Note>Loading…</Note>;

  if (!query.isError && comments.length === 0) return <Note>{EMPTY}</Note>;

  if (query.isError) {
    return (
      <ErrorState
        variant="inline"
        message="The comments could not be loaded."
        onRetry={() => void query.refetch()}
      />
    );
  }

  return (
    <>
      {query.hasNextPage ? (
        <Button
          variant="ghost"
          size="sm"
          className="my-2 w-full font-mono text-xs"
          disabled={query.isFetchingNextPage}
          onClick={() => void query.fetchNextPage()}
        >
          {query.isFetchingNextPage ? <Spinner /> : null}
          Older comments
        </Button>
      ) : null}

      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          mine={comment.author.id === viewer?.id}
        />
      ))}
    </>
  );
};

export const CommentThread = ({ post }: { post: Post }) => {
  const chat = useCommentChat(post.id);

  return (
    <section id="comments" className="border-border bg-card rounded-lg border">
      <header className="border-border flex items-center gap-2 border-b px-4 py-3 sm:px-5">
        <ChatIcon className="text-muted-foreground size-4" />
        <h2 className="font-mono text-xs tracking-wide uppercase">Comments</h2>
        <span className="text-muted-foreground ml-auto font-mono text-xs tabular-nums">
          {post.commentCount}
        </span>
      </header>

      <div className="px-4 sm:px-5">
        {chat.isPending ? <Note>Loading…</Note> : null}

        {chat.isError ? (
          <ErrorState
            variant="inline"
            message="The comments could not be loaded."
          />
        ) : null}

        {chat.isSuccess && !chat.data ? <Note>{EMPTY}</Note> : null}

        {chat.data ? <CommentList chatId={chat.data.id} /> : null}
      </div>

      <div className="border-border border-t px-4 py-3 sm:px-5">
        <CommentComposer postId={post.id} chatId={chat.data?.id ?? null} />
      </div>
    </section>
  );
};
