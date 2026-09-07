import { useState } from "react";

import { PlusIcon } from "@phosphor-icons/react";

import { Button } from "@shared/ui/button";

import { TeamFormDialog } from "./team-form-dialog";

interface CreateTeamButtonProps {
  companyId?: string;
  label?: string;
}

export const CreateTeamButton = ({
  companyId,
  label = "New team",
}: CreateTeamButtonProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <PlusIcon className="size-3.5" />
        {label}
      </Button>

      <TeamFormDialog
        open={open}
        onOpenChange={setOpen}
        {...(companyId ? { companyId } : {})}
      />
    </>
  );
};
