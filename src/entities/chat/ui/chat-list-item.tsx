import {
  BookmarkSimpleIcon,
  BriefcaseIcon,
  BuildingsIcon,
  CalendarIcon,
  ChatsIcon,
  CheckSquareIcon,
  KanbanIcon,
  UsersIcon,
} from "@phosphor-icons/react";

import { cn } from "@shared/lib/cn";
import { formatRelativeTime } from "@shared/lib/format-relative-time";
import { Avatar, AvatarFallback } from "@shared/ui/avatar";

import type { ChatView } from "../chat.types";
import { chatPreview, chatTitle } from "../lib/chat-title";

const ICONS = {
  vacancy: BriefcaseIcon,
  event: CalendarIcon,
  content: ChatsIcon,
  task: CheckSquareIcon,
  favorites: BookmarkSimpleIcon,
  company: BuildingsIcon,
  department: UsersIcon,
  team: UsersIcon,
  project: KanbanIcon,
} as const;

const ChatAvatar = ({ view }: { view: ChatView }) => {
  if (view.companion) {
    return (
      <Avatar className="size-9 shrink-0">
        <AvatarFallback className="font-mono text-[11px]">
          {view.companion.firstName[0]}
          {view.companion.lastName[0]}
        </AvatarFallback>
      </Avatar>
    );
  }

  const Icon = view.chat.type === "private" ? ChatsIcon : ICONS[view.chat.type];

  return (
    <span className="bg-elevated text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-full">
      <Icon className="size-4" />
    </span>
  );
};

interface ChatListItemProps {
  view: ChatView;
  active: boolean;
  onSelect: () => void;
}

export const ChatListItem = ({ view, active, onSelect }: ChatListItemProps) => (
  <li>
    <button
      type="button"
      onClick={onSelect}
      aria-current={active ? "true" : undefined}
      className={cn(
        "hover:bg-elevated flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors",
        active && "bg-elevated",
      )}
    >
      <ChatAvatar view={view} />

      <span className="min-w-0 flex-1">
        <span className="flex items-baseline gap-2">
          <span className="min-w-0 flex-1 truncate text-sm font-medium">
            {chatTitle(view)}
          </span>
          <time
            dateTime={view.chat.lastMessageAt}
            className="text-muted-foreground shrink-0 font-mono text-[11px] tabular-nums"
          >
            {formatRelativeTime(view.chat.lastMessageAt)}
          </time>
        </span>

        <span className="mt-0.5 flex items-center gap-2">
          <span className="text-muted-foreground min-w-0 flex-1 truncate text-xs">
            {chatPreview(view)}
          </span>
          {view.unreadCount > 0 ? (
            <span className="bg-primary text-primary-foreground flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full px-1 font-mono text-[10px] leading-none tabular-nums">
              {view.unreadCount > 99 ? "99+" : view.unreadCount}
            </span>
          ) : null}
        </span>
      </span>
    </button>
  </li>
);
