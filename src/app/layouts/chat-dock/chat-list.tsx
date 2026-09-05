import { useInfiniteQuery } from "@tanstack/react-query";

import {
  type ChatFilter,
  ChatListItem,
  chatQueries,
  useDockStore,
} from "@entities/chat";

import { cn } from "@shared/lib/cn";
import { useIntersection } from "@shared/lib/use-intersection";
import { Button } from "@shared/ui/button";
import { ErrorState } from "@shared/ui/error-state";
import { Spinner } from "@shared/ui/spinner";

const FILTERS: { value: ChatFilter; label: string }[] = [
  { value: "chats", label: "Chats" },
  { value: "comments", label: "Comments" },
  { value: "archive", label: "Archive" },
];

const toQuery = (filter: ChatFilter) =>
  filter === "comments"
    ? { type: "content" as const }
    : { archived: filter === "archive" };

const EMPTY = {
  chats: "No chats yet. Respond to a post or write to somebody.",
  comments: "No comment threads yet.",
  archive: "The archive is empty.",
} as const;

export const ChatList = () => {
  const filter = useDockStore((state) => state.filter);
  const setFilter = useDockStore((state) => state.setFilter);
  const openChat = useDockStore((state) => state.openChat);
  const activeChatId = useDockStore((state) => state.activeChatId);

  const list = useInfiniteQuery(chatQueries.list(toQuery(filter)));

  const sentinelRef = useIntersection<HTMLButtonElement>(
    () => void list.fetchNextPage(),
    list.hasNextPage && !list.isFetchingNextPage,
  );

  const items = list.data?.pages.flatMap((page) => page.items) ?? [];

  const renderItems = () => {
    if (list.isPending) {
      return (
        <p className="text-muted-foreground py-6 text-center font-mono text-xs">
          Loading…
        </p>
      );
    }

    if (list.isError) {
      return (
        <ErrorState variant="inline" message="The chats could not be loaded." />
      );
    }

    if (items.length === 0) {
      return (
        <p className="text-muted-foreground px-4 py-8 text-center text-sm">
          {EMPTY[filter]}
        </p>
      );
    }

    return (
      <ul>
        {items.map((view) => (
          <ChatListItem
            key={view.chat.id}
            view={view}
            active={view.chat.id === activeChatId}
            onSelect={() => openChat(view.chat.id)}
          />
        ))}
      </ul>
    );
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-border flex gap-1 border-b px-2 py-1.5">
        {FILTERS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setFilter(option.value)}
            className={cn(
              "text-muted-foreground hover:text-foreground rounded-md px-2.5 py-1 font-mono text-[11px] tracking-wide transition-colors",
              filter === option.value && "bg-elevated text-foreground",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-1.5">
        {renderItems()}

        {list.hasNextPage ? (
          <Button
            ref={sentinelRef}
            variant="ghost"
            size="sm"
            className="w-full font-mono text-xs"
            disabled={list.isFetchingNextPage}
            onClick={() => void list.fetchNextPage()}
          >
            {list.isFetchingNextPage ? <Spinner /> : null}
            Older
          </Button>
        ) : null}
      </div>
    </div>
  );
};
