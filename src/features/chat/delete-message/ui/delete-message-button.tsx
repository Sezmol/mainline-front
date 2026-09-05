import { useState } from "react";

import { TrashIcon } from "@phosphor-icons/react";

import type { Message } from "@entities/chat";

import { Button } from "@shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@shared/ui/dialog";

import { useDeleteMessage } from "../model/use-delete-message";

export const DeleteMessageButton = ({ message }: { message: Message }) => {
  const [open, setOpen] = useState(false);
  const remove = useDeleteMessage(message);
  const saved = message.postId !== null;

  return (
    <>
      <Button
        variant="ghost"
        size="icon-xs"
        aria-label={saved ? "Remove from Favourites" : "Delete message"}
        className="text-muted-foreground hover:text-destructive"
        disabled={remove.isPending}
        onClick={() => setOpen(true)}
      >
        <TrashIcon className="size-3.5" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {saved ? "Remove from Favourites?" : "Delete this message?"}
            </DialogTitle>
            <DialogDescription>
              {saved
                ? "The post stays in the feed. Only your saved copy goes away."
                : "It disappears for everyone. This cannot be undone."}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setOpen(false);
                remove.mutate();
              }}
            >
              {saved ? "Remove" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
