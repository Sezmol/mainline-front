import { ArchiveIcon, BoxArrowUpIcon } from "@phosphor-icons/react";

import { Button } from "@shared/ui/button";

import { useArchiveChat } from "../model/use-archive-chat";

interface ArchiveChatButtonProps {
  chatId: string;
  archived: boolean;
}

export const ArchiveChatButton = ({
  chatId,
  archived,
}: ArchiveChatButtonProps) => {
  const archive = useArchiveChat(chatId);

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={archived ? "Take out of the archive" : "Archive the chat"}
      title={archived ? "Take out of the archive" : "Archive the chat"}
      disabled={archive.isPending}
      onClick={() => archive.mutate(!archived)}
    >
      {archived ? <BoxArrowUpIcon /> : <ArchiveIcon />}
    </Button>
  );
};
