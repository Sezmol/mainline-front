import { useState } from "react";

import { TrashIcon } from "@phosphor-icons/react";

import type { Post } from "@entities/post";

import { Button } from "@shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@shared/ui/dialog";

import { useDeletePost } from "../model/use-delete-post";

interface DeletePostButtonProps {
  post: Post;
  onDeleted?: () => void;
}

export const DeletePostButton = ({
  post,
  onDeleted,
}: DeletePostButtonProps) => {
  const [open, setOpen] = useState(false);
  const remove = useDeletePost(post.id);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        aria-label="Delete post"
        className="text-muted-foreground hover:text-destructive font-mono text-xs"
        onClick={() => setOpen(true)}
      >
        <TrashIcon className="size-3.5" />
        Delete
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete this post?</DialogTitle>
            <DialogDescription>
              “{post.title}” disappears from the feed for everyone. This cannot
              be undone.
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
                onDeleted?.();
                remove.mutate();
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
