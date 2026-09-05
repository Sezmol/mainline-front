import { useState } from "react";

import { UsersIcon } from "@phosphor-icons/react";

import type { ChatView } from "@entities/chat";

import { Button } from "@shared/ui/button";

import { ChatModerationDialog } from "./chat-moderation-dialog";

export const ChatModerationButton = ({
  view,
  ownerId,
}: {
  view: ChatView;
  ownerId: string | undefined;
}) => {
  const [open, setOpen] = useState(false);

  if (view.chat.type !== "event" || view.chat.owner?.id !== ownerId)
    return null;

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Participants"
        title="Participants"
        onClick={() => setOpen(true)}
      >
        <UsersIcon />
      </Button>

      <ChatModerationDialog view={view} open={open} onOpenChange={setOpen} />
    </>
  );
};
