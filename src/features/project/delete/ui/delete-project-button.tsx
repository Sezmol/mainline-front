import { useState } from "react";

import { Trash2Icon } from "lucide-react";

import type { Project } from "@entities/project";

import { Button } from "@shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@shared/ui/dialog";

import { useDeleteProject } from "../model/use-delete-project";

interface DeleteProjectButtonProps {
  project: Project;
  onDeleted?: () => void;
}
export const DeleteProjectButton = ({
  project,
  onDeleted,
}: DeleteProjectButtonProps) => {
  const [open, setOpen] = useState(false);
  const remove = useDeleteProject(project.author.id, project.id);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        aria-label="Delete project"
        className="text-muted-foreground hover:text-destructive font-mono text-xs"
        onClick={() => setOpen(true)}
      >
        <Trash2Icon className="size-3.5" />
        Delete
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete this project?</DialogTitle>
            <DialogDescription>
              “{project.title}” disappears from your portfolio. This cannot be
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
