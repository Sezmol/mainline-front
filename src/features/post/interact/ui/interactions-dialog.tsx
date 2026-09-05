import { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { type Post, type PostInteraction, postQueries } from "@entities/post";

import { SPECIALITY_LABELS } from "@shared/config";
import { Avatar, AvatarFallback } from "@shared/ui/avatar";
import { Badge } from "@shared/ui/badge";
import { Button } from "@shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@shared/ui/dialog";
import { ErrorState } from "@shared/ui/error-state";
import { Input } from "@shared/ui/input";
import { Spinner } from "@shared/ui/spinner";

import { isFull, seatsTaken } from "../model/seats";
import { useInteract } from "../model/use-interact";
import { useInvite } from "../model/use-invite";

const STATUS_LABELS: Record<PostInteraction["status"], string> = {
  pending: "Waiting",
  accepted: "Accepted",
  declined: "Declined",
};

const InviteForm = ({ post }: { post: Post }) => {
  const [nickname, setNickname] = useState("");
  const invite = useInvite(post);

  return (
    <form
      className="flex items-center gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        invite.mutate(nickname, { onSuccess: () => setNickname("") });
      }}
    >
      <Input
        value={nickname}
        onChange={(event) => setNickname(event.target.value)}
        placeholder="nickname"
        aria-label="Invite by nickname"
        className="font-mono text-xs"
      />
      <Button
        type="submit"
        variant="outline"
        disabled={invite.isPending || nickname.trim().length === 0}
      >
        {invite.isPending ? <Spinner /> : null}
        Invite
      </Button>
    </form>
  );
};

const InteractionRow = ({
  post,
  interaction,
}: {
  post: Post;
  interaction: PostInteraction;
}) => {
  const interact = useInteract(post);
  const { user } = interaction;

  const answerable =
    interaction.kind === "response" && interaction.status === "pending";

  return (
    <li className="flex items-center gap-3 py-2.5">
      <Avatar className="size-8 shrink-0">
        <AvatarFallback className="font-mono text-[10px]">
          {user.firstName[0]}
          {user.lastName[0]}
        </AvatarFallback>
      </Avatar>

      <Link
        to="/u/$nickname"
        params={{ nickname: user.nickname }}
        className="group/person min-w-0 flex-1"
      >
        <span className="group-hover/person:text-primary-ink block truncate text-sm font-medium transition-colors">
          {user.firstName} {user.lastName}
        </span>
        <span className="text-muted-foreground block truncate font-mono text-xs">
          @{user.nickname} · {SPECIALITY_LABELS[user.speciality]}
        </span>
      </Link>

      {answerable ? (
        <span className="flex shrink-0 gap-1.5">
          <Button
            size="xs"
            disabled={interact.isPending || isFull(post)}
            onClick={() =>
              interact.mutate({ action: "accept", userId: user.id })
            }
          >
            Accept
          </Button>
          <Button
            variant="ghost"
            size="xs"
            disabled={interact.isPending}
            onClick={() =>
              interact.mutate({ action: "decline", userId: user.id })
            }
          >
            Decline
          </Button>
        </span>
      ) : (
        <Badge
          variant={interaction.status === "accepted" ? "secondary" : "outline"}
          className="shrink-0 font-mono text-[11px]"
        >
          {interaction.kind === "invite" && interaction.status === "pending"
            ? "Invited"
            : STATUS_LABELS[interaction.status]}
        </Badge>
      )}
    </li>
  );
};

interface InteractionsDialogProps {
  post: Post;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const InteractionsDialog = ({
  post,
  open,
  onOpenChange,
}: InteractionsDialogProps) => {
  const list = useQuery({
    ...postQueries.interactions(post.id),
    enabled: open,
  });
  const isEvent = post.type === "event";

  const description = () => {
    if (!isEvent) return "Everyone who reached out about this post.";
    if (!post.participantLimit) return "Everyone invited or taking part.";
    return `${seatsTaken(post)} of ${post.participantLimit} seats taken, you included.`;
  };

  const renderList = () => {
    if (list.isPending) {
      return (
        <p className="text-muted-foreground py-6 text-center font-mono text-xs">
          Loading…
        </p>
      );
    }

    if (list.isError) {
      return (
        <ErrorState variant="inline" message="The list could not be loaded." />
      );
    }

    if (list.data.length === 0) {
      return (
        <p className="text-muted-foreground py-6 text-center text-sm">
          Nobody yet.
        </p>
      );
    }

    return (
      <ul className="divide-border max-h-80 divide-y overflow-y-auto">
        {list.data.map((interaction) => (
          <InteractionRow
            key={interaction.id}
            post={post}
            interaction={interaction}
          />
        ))}
      </ul>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEvent ? "Participants" : "Responses"}</DialogTitle>
          <DialogDescription>{description()}</DialogDescription>
        </DialogHeader>

        {isEvent ? <InviteForm post={post} /> : null}

        {renderList()}
      </DialogContent>
    </Dialog>
  );
};
