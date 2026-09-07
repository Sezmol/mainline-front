import { useState } from "react";

import { TrashIcon } from "@phosphor-icons/react";

import type { Department } from "@entities/department";

import { Button } from "@shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@shared/ui/dialog";

import { useDeleteDepartment } from "../model/use-save-department";

export const DeleteDepartmentButton = ({
  department,
}: {
  department: Department;
}) => {
  const [open, setOpen] = useState(false);
  const remove = useDeleteDepartment(department.companyId);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground hover:text-destructive font-mono text-xs"
        onClick={() => setOpen(true)}
      >
        <TrashIcon className="size-3.5" />
        Delete
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete “{department.name}”?</DialogTitle>
            <DialogDescription>
              Its chat disappears for everyone in it, along with the messages.
              Nobody leaves the company.
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
                remove.mutate(department.id);
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
