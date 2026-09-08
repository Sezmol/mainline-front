import { useState } from "react";

import { PlusIcon } from "@phosphor-icons/react";

import { Button } from "@shared/ui/button";

import { ProjectFormDialog } from "./project-form-dialog";

interface CreateProjectButtonProps {
  teamId?: string;
  label?: string;
}

export const CreateProjectButton = ({
  teamId,
  label = "New project",
}: CreateProjectButtonProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <PlusIcon className="size-3.5" />
        {label}
      </Button>

      <ProjectFormDialog
        open={open}
        onOpenChange={setOpen}
        {...(teamId ? { teamId } : {})}
      />
    </>
  );
};
