import { useEffect, useRef } from "react";

import {
  ArrowLeftIcon,
  ArrowSquareOutIcon,
  ChatsIcon,
  CornersInIcon,
  CornersOutIcon,
  XIcon,
} from "@phosphor-icons/react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { Link, useRouterState } from "@tanstack/react-router";

import { ArchiveChatButton } from "@features/chat/archive";
import { ChatModerationButton } from "@features/chat/permissions";

import {
  chatKindLabel,
  chatQueries,
  chatTitle,
  useDockStore,
} from "@entities/chat";
import { sessionQueries } from "@entities/session";

import { cn } from "@shared/lib/cn";
import { useMediaQuery } from "@shared/lib/use-media-query";
import { Button } from "@shared/ui/button";

import { ChatList } from "./chat-list";
import { ChatWindow } from "./chat-window";

const DockLauncher = ({ unread }: { unread: number }) => {
  const open = useDockStore((state) => state.open);

  return (
    <Button
      size="icon"
      aria-label={unread > 0 ? `Chats, ${unread} unread` : "Chats"}
      className="fixed right-4 bottom-4 z-40 size-11 rounded-full shadow-lg"
      onClick={open}
    >
      <ChatsIcon />
      {unread > 0 ? (
        <span className="bg-destructive text-primary-foreground absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 font-mono text-[10px] leading-none tabular-nums">
          {unread > 99 ? "99+" : unread}
        </span>
      ) : null}
    </Button>
  );
};

const useStepAsideOnNavigation = (coversScreen: boolean) => {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const close = useDockStore((state) => state.close);
  const seen = useRef(pathname);

  useEffect(() => {
    if (seen.current === pathname) return;

    seen.current = pathname;
    if (coversScreen) close();
  }, [close, coversScreen, pathname]);
};

const DockHeader = ({
  userId,
  coversScreen,
}: {
  userId: string;
  coversScreen: boolean;
}) => {
  const activeChatId = useDockStore((state) => state.activeChatId);
  const isFullscreen = useDockStore((state) => state.isFullscreen);
  const backToList = useDockStore((state) => state.backToList);
  const toggleFullscreen = useDockStore((state) => state.toggleFullscreen);
  const close = useDockStore((state) => state.close);

  const view = useQuery({
    ...chatQueries.byId(activeChatId ?? ""),
    enabled: Boolean(activeChatId),
  });

  return (
    <header className="border-border flex items-center gap-1 border-b px-2 py-1.5">
      {activeChatId ? (
        <Button
          variant="ghost"
          size="icon"
          aria-label="Back to the chats"
          onClick={backToList}
        >
          <ArrowLeftIcon />
        </Button>
      ) : null}

      <span className="min-w-0 flex-1 px-1">
        <span className="block truncate text-sm font-medium">
          {view.data ? chatTitle(view.data) : "Chats"}
        </span>
        {view.data ? (
          <span className="text-muted-foreground block truncate font-mono text-[11px]">
            {chatKindLabel(view.data)}
            {view.data.chat.writeRestricted ? " · announcements only" : ""}
          </span>
        ) : null}
      </span>

      {view.data?.chat.post ? (
        <Button
          variant="ghost"
          size="icon"
          aria-label="Open the post"
          title="Open the post"
          nativeButton={false}
          onClick={() => coversScreen && close()}
          render={
            <Link to="/p/$postId" params={{ postId: view.data.chat.post.id }} />
          }
        >
          <ArrowSquareOutIcon />
        </Button>
      ) : null}

      {view.data ? (
        <>
          <ChatModerationButton view={view.data} ownerId={userId} />
          <ArchiveChatButton
            chatId={view.data.chat.id}
            archived={view.data.archived}
          />
        </>
      ) : null}

      <Button
        variant="ghost"
        size="icon"
        aria-label={isFullscreen ? "Shrink the dock" : "Fill the screen"}
        className="hidden sm:inline-flex"
        onClick={toggleFullscreen}
      >
        {isFullscreen ? <CornersInIcon /> : <CornersOutIcon />}
      </Button>

      <Button variant="ghost" size="icon" aria-label="Close" onClick={close}>
        <XIcon />
      </Button>
    </header>
  );
};

export const ChatDock = () => {
  const { data: user } = useQuery(sessionQueries.current());
  const isOpen = useDockStore((state) => state.isOpen);
  const isFullscreen = useDockStore((state) => state.isFullscreen);
  const activeChatId = useDockStore((state) => state.activeChatId);

  const isPanel = useMediaQuery("(min-width: 40rem)");
  const coversScreen = isFullscreen || !isPanel;

  useStepAsideOnNavigation(isOpen && coversScreen);

  const list = useInfiniteQuery({
    ...chatQueries.list(),
    enabled: Boolean(user),
  });

  if (!user) return null;

  const unread =
    list.data?.pages
      .flatMap((page) => page.items)
      .reduce((total, item) => total + item.unreadCount, 0) ?? 0;

  if (!isOpen) return <DockLauncher unread={unread} />;

  return (
    <section
      aria-label="Chats"
      className={cn(
        "bg-background border-border fixed z-40 flex flex-col border shadow-lg",
        "inset-0",
        isFullscreen
          ? "sm:inset-0"
          : "sm:inset-auto sm:right-4 sm:bottom-4 sm:h-[560px] sm:max-h-[calc(100dvh-2rem)] sm:w-96 sm:rounded-lg",
      )}
    >
      <DockHeader userId={user.id} coversScreen={coversScreen} />

      {activeChatId ? (
        <ChatWindow key={activeChatId} chatId={activeChatId} />
      ) : (
        <ChatList />
      )}
    </section>
  );
};
