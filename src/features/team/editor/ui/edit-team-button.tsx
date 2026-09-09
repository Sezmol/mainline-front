import { useState } from "react";

import { PencilIcon } from "@phosphor-icons/react";

import type { Team } from "@entities/team";

import { Button } from "@shared/ui/button";

import { TeamFormDialog } from "./team-form-dialog";

export const EditTeamButton = ({ team }: { team: Team }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="font-mono text-xs"
        onClick={() => setOpen(true)}
      >
        <PencilIcon className="size-3.5" />
        Edit
      </Button>

      <TeamFormDialog open={open} onOpenChange={setOpen} team={team} />
    </>
  );
};
