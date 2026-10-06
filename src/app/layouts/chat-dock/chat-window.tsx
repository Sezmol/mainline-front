import { useEffect, useRef, useState } from "react";

import { ArrowDownIcon } from "@phosphor-icons/react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import { DeleteMessageButton } from "@features/chat/delete-message";
import { useMarkRead } from "@features/chat/read";
import { MessageInput } from "@features/chat/send-message";

import {
  ChatMessage,
  chatQueries,
  isPending,
  useDockStore,
} from "@entities/chat";
import { sessionQueries } from "@entities/session";

import { dayjs } from "@shared/lib/dayjs";
import { Button } from "@shared/ui/button";
import { ErrorState } from "@shared/ui/error-state";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
  useMessageScroller,
  useMessageScrollerScrollable,
  useMessageScrollerVisibility,
} from "@shared/ui/message-scroller";
import { Spinner } from "@shared/ui/spinner";

import { AttachedPost } from "./attached-post";
import { DaySeparator } from "./day-separator";

const useMessages = (chatId: string) => {
  const query = useInfiniteQuery(chatQueries.messages(chatId));

  return {
    query,
    items: (query.data?.pages.flatMap((page) => page.items) ?? []).toReversed(),
  };
};

const ScrollMemory = ({
  chatId,
  restoreTo,
}: {
  chatId: string;
  restoreTo: string | null;
}) => {
  const { scrollToMessage } = useMessageScroller();
  const { end } = useMessageScrollerScrollable();
  const { visibleMessageIds } = useMessageScrollerVisibility();

  const topmost = visibleMessageIds[0] ?? null;
  const restored = useRef(false);

  useEffect(() => {
    if (restored.current || !restoreTo) return;
    restored.current = true;
    scrollToMessage(restoreTo, { align: "start" });
  }, [restoreTo, scrollToMessage]);

  useEffect(() => {
    useDockStore.getState().rememberAnchor(chatId, end ? topmost : null);
  }, [chatId, end, topmost]);

  return null;
};

export const ChatWindow = ({ chatId }: { chatId: string }) => {
  const { data: user } = useQuery(sessionQueries.current());
  const view = useQuery(chatQueries.byId(chatId));
  const { query, items } = useMessages(chatId);
  const markRead = useMarkRead(chatId);

  const marked = useRef<string | null>(null);

  const [restoreTo] = useState(
    () => useDockStore.getState().anchorByChat[chatId] ?? null,
  );

  const newest = items.at(-1);
  const unread = view.data?.unreadCount ?? 0;

  useEffect(() => {
    if (!newest || unread === 0 || isPending(newest)) return;
    if (marked.current === newest.id) return;

    marked.current = newest.id;
    markRead.mutate(newest.id);
  }, [markRead, newest, unread]);

  if (view.isPending) {
    return (
      <p className="text-muted-foreground flex-1 py-10 text-center font-mono text-xs">
        Loading…
      </p>
    );
  }

  if (view.isError) {
    return (
      <ErrorState
        variant="inline"
        message="This chat is not available."
        className="flex-1 py-10"
      />
    );
  }

  const favorites = view.data.chat.type === "favorites";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <MessageScrollerProvider autoScroll scrollEdgeThreshold={60}>
        <MessageScroller className="min-h-0 flex-1">
          <MessageScrollerViewport className="px-3">
            {query.hasNextPage ? (
              <Button
                variant="ghost"
                size="sm"
                className="my-2 w-full font-mono text-xs"
                disabled={query.isFetchingNextPage}
                onClick={() => void query.fetchNextPage()}
              >
                {query.isFetchingNextPage ? <Spinner /> : null}
                Older messages
              </Button>
            ) : null}

            {items.length === 0 ? (
              <p className="text-muted-foreground py-10 text-center text-sm">
                No messages yet. Write the first one.
              </p>
            ) : null}

            <MessageScrollerContent className="min-h-0 gap-0">
              {items.map((message, index) => {
                const previous = items[index - 1];
                const startsDay =
                  !previous ||
                  !dayjs(previous.createdAt).isSame(message.createdAt, "day");

                return (
                  <MessageScrollerItem key={message.id} messageId={message.id}>
                    {startsDay ? (
                      <DaySeparator date={message.createdAt} />
                    ) : null}

                    <ChatMessage
                      message={message}
                      mine={message.author.id === user?.id}
                      pending={isPending(message)}
                      attachment={
                        message.postId ? (
                          <AttachedPost postId={message.postId} />
                        ) : null
                      }
                      actions={
                        favorites && !isPending(message) ? (
                          <DeleteMessageButton message={message} />
                        ) : null
                      }
                    />
                  </MessageScrollerItem>
                );
              })}
            </MessageScrollerContent>
          </MessageScrollerViewport>

          <MessageScrollerButton
            variant="outline"
            size="sm"
            className="right-4 left-auto translate-x-0 rounded-full font-mono text-xs shadow-sm"
          >
            <ArrowDownIcon className="size-3.5" />
            {unread > 0 ? unread : "Latest"}
          </MessageScrollerButton>

          <ScrollMemory chatId={chatId} restoreTo={restoreTo} />
        </MessageScroller>
      </MessageScrollerProvider>

      <MessageInput
        chatId={chatId}
        canWrite={view.data.canWrite}
        restricted={view.data.chat.writeRestricted}
      />
    </div>
  );
};
