import { useEffect, useState } from "react";

import { BellIcon } from "@phosphor-icons/react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import {
  NotificationItem,
  notificationQueries,
  useMarkNotificationsRead,
} from "@entities/notification";

import { Button } from "@shared/ui/button";
import { ErrorState } from "@shared/ui/error-state";
import { Popover, PopoverContent, PopoverTrigger } from "@shared/ui/popover";
import { Spinner } from "@shared/ui/spinner";

const NotificationList = ({ onNavigate }: { onNavigate: () => void }) => {
  const list = useInfiniteQuery(notificationQueries.list());
  const markRead = useMarkNotificationsRead();

  const unread = list.data?.pages[0]?.unreadCount ?? 0;

  useEffect(() => {
    if (unread > 0 && markRead.isIdle) markRead.mutate();
  }, [unread, markRead]);

  if (list.isPending) {
    return (
      <p className="text-muted-foreground py-6 text-center font-mono text-xs">
        Loading…
      </p>
    );
  }

  if (list.isError) {
    return (
      <ErrorState
        variant="inline"
        message="Notifications could not be loaded."
      />
    );
  }

  const items = list.data.pages.flatMap((page) => page.items);

  if (items.length === 0) {
    return (
      <p className="text-muted-foreground py-6 text-center text-sm">
        Nothing yet. Responses and invitations land here.
      </p>
    );
  }

  return (
    <>
      <ul className="max-h-96 overflow-y-auto">
        {items.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onNavigate={onNavigate}
          />
        ))}
      </ul>

      {list.hasNextPage ? (
        <Button
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
    </>
  );
};

export const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const { data: badge } = useQuery(notificationQueries.badge());

  const unread = badge?.unreadCount ?? 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label={
              unread > 0 ? `Notifications, ${unread} unread` : "Notifications"
            }
            className="relative"
          />
        }
      >
        <BellIcon />
        {unread > 0 ? (
          <span className="bg-primary text-primary-foreground absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 font-mono text-[10px] leading-none tabular-nums">
            {unread > 99 ? "99+" : unread}
          </span>
        ) : null}
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 gap-1 p-1.5 sm:w-96">
        <p className="text-muted-foreground px-3 pt-1.5 pb-1 font-mono text-[11px] tracking-wide uppercase">
          Notifications
        </p>
        <NotificationList onNavigate={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  );
};
