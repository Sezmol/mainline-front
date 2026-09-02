import { Link } from "@tanstack/react-router";

import { formatRelativeTime } from "@shared/lib/format-relative-time";

import type { Notification } from "../notification.types";

const PHRASES: Record<Notification["type"], string> = {
  response_received: "responded to",
  response_accepted: "accepted your response to",
  response_declined: "declined your response to",
  invite_received: "invited you to",
  invite_accepted: "accepted your invitation to",
  invite_declined: "declined your invitation to",
  company_invite_received: "invited you to",
  company_invite_accepted: "accepted your invitation to",
  company_invite_declined: "declined your invitation to",
  membership_removed: "removed you from",
  task_assigned: "put you on",
};

interface NotificationItemProps {
  notification: Notification;
  onNavigate?: () => void;
}

const Body = ({ notification }: { notification: Notification }) => {
  const { actor, post, subject } = notification;

  return (
    <>
      <span className="font-medium">
        {actor ? `@${actor.nickname}` : "Someone"}
      </span>{" "}
      <span className="text-muted-foreground">
        {PHRASES[notification.type]}
      </span>{" "}
      {post ? <span className="font-medium">{post.title}</span> : null}
      {!post && subject ? <span className="font-medium">{subject}</span> : null}
      {!post && !subject ? (
        <span className="text-muted-foreground italic">something deleted</span>
      ) : null}
    </>
  );
};

const Timestamp = ({ at }: { at: string }) => (
  <time
    dateTime={at}
    className="text-muted-foreground mt-0.5 block font-mono text-[11px] tabular-nums"
  >
    {formatRelativeTime(at)}
  </time>
);

const ROW =
  "hover:bg-accent block rounded-md px-3 py-2 text-sm transition-colors";

export const NotificationItem = ({
  notification,
  onNavigate,
}: NotificationItemProps) => {
  const { post, invite, company } = notification;

  const content = (
    <>
      <Body notification={notification} />
      <Timestamp at={notification.createdAt} />
    </>
  );

  const renderRow = () => {
    if (post) {
      return (
        <Link
          to="/p/$postId"
          params={{ postId: post.id }}
          onClick={onNavigate}
          className={ROW}
        >
          {content}
        </Link>
      );
    }

    if (invite?.status === "pending") {
      return (
        <Link to="/invites" onClick={onNavigate} className={ROW}>
          {content}
        </Link>
      );
    }

    if (invite?.teamId) {
      return (
        <Link
          to="/t/$teamId"
          params={{ teamId: invite.teamId }}
          onClick={onNavigate}
          className={ROW}
        >
          {content}
        </Link>
      );
    }

    if (company) {
      return (
        <Link
          to="/c/$slug"
          params={{ slug: company.slug }}
          search={{ tab: "overview" as const }}
          onClick={onNavigate}
          className={ROW}
        >
          {content}
        </Link>
      );
    }

    return <p className="px-3 py-2 text-sm">{content}</p>;
  };

  return (
    <li className="relative">
      {notification.readAt === null ? (
        <span
          aria-label="Unread"
          className="bg-primary absolute top-3.5 left-1 size-1.5 rounded-full"
        />
      ) : null}

      {renderRow()}
    </li>
  );
};
