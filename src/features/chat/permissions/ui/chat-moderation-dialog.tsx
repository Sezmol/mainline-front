import { useId } from "react";

import {
  MicrophoneIcon,
  MicrophoneSlashIcon,
  UserMinusIcon,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { chatQueries, type ChatView } from "@entities/chat";

import { SPECIALITY_LABELS } from "@shared/config";
import { Avatar, AvatarFallback } from "@shared/ui/avatar";
import { Button } from "@shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@shared/ui/dialog";
import { ErrorState } from "@shared/ui/error-state";
import { Switch } from "@shared/ui/switch";

import {
  useRemoveParticipant,
  useRestrictWriting,
  useSetParticipantWrite,
} from "../model/use-chat-permissions";

interface ChatModerationDialogProps {
  view: ChatView;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ChatModerationDialog = ({
  view,
  open,
  onOpenChange,
}: ChatModerationDialogProps) => {
  const chatId = view.chat.id;
  const restrictLabelId = useId();
  const participants = useQuery({
    ...chatQueries.participants(chatId),
    enabled: open,
  });

  const restrict = useRestrictWriting(chatId);
  const setWrite = useSetParticipantWrite(chatId);
  const remove = useRemoveParticipant(chatId);

  const renderParticipants = () => {
    if (participants.isPending) {
      return (
        <p className="text-muted-foreground py-6 text-center font-mono text-xs">
          Loading…
        </p>
      );
    }

    if (participants.isError) {
      return (
        <ErrorState variant="inline" message="The list could not be loaded." />
      );
    }

    return (
      <ul className="divide-border max-h-80 divide-y overflow-y-auto">
        {participants.data.map(({ user, canWrite }) => {
          const isOwner = user.id === view.chat.owner?.id;

          return (
            <li key={user.id} className="flex items-center gap-3 py-2.5">
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

              {isOwner ? (
                <span className="text-muted-foreground shrink-0 font-mono text-[11px]">
                  author
                </span>
              ) : (
                <span className="flex shrink-0 gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={canWrite ? "Mute" : "Let them write"}
                    title={canWrite ? "Mute" : "Let them write"}
                    disabled={setWrite.isPending}
                    onClick={() =>
                      setWrite.mutate({
                        userId: user.id,
                        canWrite: !canWrite,
                      })
                    }
                  >
                    {canWrite ? <MicrophoneIcon /> : <MicrophoneSlashIcon />}
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Remove from the chat"
                    title="Remove from the chat"
                    disabled={remove.isPending}
                    onClick={() => remove.mutate(user.id)}
                  >
                    <UserMinusIcon />
                  </Button>
                </span>
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Participants</DialogTitle>
          <DialogDescription>
            Everyone in the chat of your event. Mute one person, or close the
            chat for all of them.
          </DialogDescription>
        </DialogHeader>

        <div className="border-border flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5">
          <span className="min-w-0">
            <span id={restrictLabelId} className="block text-sm font-medium">
              Announcements only
            </span>
            <span className="text-muted-foreground block text-xs">
              Only you can write while this is on.
            </span>
          </span>

          <Switch
            aria-labelledby={restrictLabelId}
            checked={view.chat.writeRestricted}
            disabled={restrict.isPending}
            onCheckedChange={(checked) => restrict.mutate(checked)}
          />
        </div>

        {renderParticipants()}
      </DialogContent>
    </Dialog>
  );
};
