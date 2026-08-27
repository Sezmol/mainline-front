import { useState } from "react";

import { PlusIcon } from "lucide-react";

import { Button } from "@shared/ui/button";

import { ProjectFormDialog } from "./project-form-dialog";

export const AddProjectButton = ({ userId }: { userId: string }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        size="sm"
        className="font-mono text-xs"
        onClick={() => setOpen(true)}
      >
        <PlusIcon className="size-3.5" />
        Add project
      </Button>

      {open ? (
        <ProjectFormDialog open={open} onOpenChange={setOpen} userId={userId} />
      ) : null}
    </>
  );
};
