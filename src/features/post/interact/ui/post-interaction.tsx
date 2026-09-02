import {
  CheckIcon,
  ClockIcon,
  EnvelopeSimpleIcon,
  XIcon,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";

import type { Post } from "@entities/post";
import { sessionQueries } from "@entities/session";

import { Button } from "@shared/ui/button";
import { Spinner } from "@shared/ui/spinner";

import { isFull } from "../model/seats";
import { useInteract } from "../model/use-interact";
import { InteractionStatus, InteractionStrip } from "./interaction-strip";
import { InteractionsButton } from "./interactions-button";

const ACCEPTED_LABEL: Partial<Record<Post["type"], string>> = {
  event: "You are going",
  task: "The task is yours",
};

const RESPOND_LABEL: Partial<Record<Post["type"], string>> = {
  event: "Join",
  task: "Take it on",
};

const InviteAnswer = ({ post }: { post: Post }) => {
  const interact = useInteract(post);

  return (
    <InteractionStrip>
      <InteractionStatus icon={<EnvelopeSimpleIcon className="size-3.5" />}>
        You are invited
      </InteractionStatus>

      <div className="ml-auto flex gap-2">
        <Button
          size="sm"
          disabled={interact.isPending}
          onClick={() => interact.mutate({ action: "accept" })}
        >
          Accept
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={interact.isPending}
          onClick={() => interact.mutate({ action: "decline" })}
        >
          Decline
        </Button>
      </div>
    </InteractionStrip>
  );
};

const SettledStatus = ({ post }: { post: Post }) => {
  const { myInteraction } = post;
  if (!myInteraction) return null;

  if (myInteraction.status === "accepted") {
    return (
      <InteractionStrip>
        <InteractionStatus
          tone="positive"
          icon={<CheckIcon className="size-3.5" />}
        >
          {ACCEPTED_LABEL[post.type] ?? "Your response was accepted"}
        </InteractionStatus>
      </InteractionStrip>
    );
  }

  if (myInteraction.status === "declined") {
    return (
      <InteractionStrip>
        <InteractionStatus icon={<XIcon className="size-3.5" />}>
          {myInteraction.kind === "invite"
            ? "You declined the invitation"
            : "Your response was declined"}
        </InteractionStatus>
      </InteractionStrip>
    );
  }

  return (
    <InteractionStrip>
      <InteractionStatus icon={<ClockIcon className="size-3.5" />}>
        Response sent, waiting for the author
      </InteractionStatus>
    </InteractionStrip>
  );
};

const RespondButton = ({ post }: { post: Post }) => {
  const interact = useInteract(post);
  const full = isFull(post);

  return (
    <InteractionStrip>
      <Button
        size="sm"
        disabled={interact.isPending || full}
        onClick={() => interact.mutate({ action: "respond" })}
      >
        {interact.isPending ? <Spinner /> : null}
        {RESPOND_LABEL[post.type] ?? "Respond"}
      </Button>

      {full ? (
        <InteractionStatus icon={<XIcon className="size-3.5" />}>
          No seats left
        </InteractionStatus>
      ) : null}
    </InteractionStrip>
  );
};

export const PostInteraction = ({ post }: { post: Post }) => {
  const { data: user } = useQuery(sessionQueries.current());

  if (post.type === "content") return null;
  if (post.author.id === user?.id) return <InteractionsButton post={post} />;

  const { myInteraction } = post;

  if (myInteraction?.kind === "invite" && myInteraction.status === "pending") {
    return <InviteAnswer post={post} />;
  }

  if (myInteraction) return <SettledStatus post={post} />;

  if (post.type === "event" && post.isPrivate) return null;
  if (post.type === "task" && (post.isPrivate || post.assignees.length > 0)) {
    return null;
  }

  return <RespondButton post={post} />;
};
