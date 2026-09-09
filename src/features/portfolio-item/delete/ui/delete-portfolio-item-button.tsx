import { useState } from "react";

import { TrashIcon } from "@phosphor-icons/react";

import type { PortfolioItem } from "@entities/portfolio-item";

import { Button } from "@shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@shared/ui/dialog";

import { useDeletePortfolioItem } from "../model/use-delete-portfolio-item";

interface DeletePortfolioItemButtonProps {
  item: PortfolioItem;
  onDeleted?: () => void;
}

export const DeletePortfolioItemButton = ({
  item,
  onDeleted,
}: DeletePortfolioItemButtonProps) => {
  const [open, setOpen] = useState(false);
  const remove = useDeletePortfolioItem(item.author.id, item.id);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        aria-label="Delete item"
        className="text-muted-foreground hover:text-destructive font-mono text-xs"
        onClick={() => setOpen(true)}
      >
        <TrashIcon className="size-3.5" />
        Delete
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete this item?</DialogTitle>
            <DialogDescription>
              “{item.title}” disappears from your portfolio. This cannot be
              undone.
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
